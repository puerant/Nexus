use serde::{Deserialize, Serialize};
use std::path::Path;
use tokio::process::Command as TokioCommand;

// ─── Error Types ────────────────────────────────────────────────────────────

#[derive(Debug, thiserror::Error)]
pub enum GitError {
    #[error("Git 未安装或不在 PATH 中")]
    GitNotFound,
    #[error("Git 命令失败: {0}")]
    CommandFailed(String),
    #[error("无效的 URL: {0}")]
    InvalidUrl(String),
    #[error("{0}")]
    Io(#[from] std::io::Error),
}

impl From<GitError> for String {
    fn from(e: GitError) -> String {
        e.to_string()
    }
}

// ─── Return Types ───────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyResult {
    pub accessible: bool,
    pub is_empty: bool,
    pub default_branch: Option<String>,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitStatus {
    pub branch: String,
    pub ahead: u32,
    pub behind: u32,
    pub staged: u32,
    pub unstaged: u32,
    pub untracked: u32,
    pub clean: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitInitResult {
    pub path: String,
    pub already_existed: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitLogEntry {
    pub hash: String,
    #[serde(rename = "shortHash")]
    pub short_hash: String,
    pub author: String,
    pub date: String,
    pub message: String,
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/// Check that git is available on the system.
async fn ensure_git() -> Result<(), GitError> {
    let output = TokioCommand::new("git")
        .arg("--version")
        .output()
        .await
        .map_err(|_| GitError::GitNotFound)?;

    if !output.status.success() {
        return Err(GitError::GitNotFound);
    }
    Ok(())
}

/// Embed a GitHub PAT into an HTTPS URL for authentication.
fn build_auth_url(url: &str, token: &str) -> Result<String, GitError> {
    if url.starts_with("git@") || url.starts_with("ssh://") {
        return Err(GitError::InvalidUrl(
            "Cannot embed token in SSH URL".to_string(),
        ));
    }

    let url = url.strip_suffix(".git").unwrap_or(url);

    if let Some(rest) = url.strip_prefix("https://") {
        Ok(format!("https://x-access-token:{token}@{rest}"))
    } else if let Some(rest) = url.strip_prefix("http://") {
        Ok(format!("http://x-access-token:{token}@{rest}"))
    } else {
        Err(GitError::InvalidUrl(url.to_string()))
    }
}

/// Run a git command in the given directory and return stdout.
async fn run_git(
    working_dir: &Path,
    args: &[&str],
) -> Result<String, GitError> {
    ensure_git().await?;

    let output = TokioCommand::new("git")
        .current_dir(working_dir)
        .args(args)
        .env("GIT_TERMINAL_PROMPT", "0")
        .env("GIT_EDITOR", "true")
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .await?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(GitError::CommandFailed(stderr.trim().to_string()));
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

/// Resolve the effective URL (with token embedded if HTTPS).
fn resolve_auth_url(url: &str, token: Option<&str>) -> Result<String, GitError> {
    match token {
        Some(t) if !t.is_empty() && !url.starts_with("git@") => build_auth_url(url, t),
        _ => Ok(url.to_string()),
    }
}

// ─── Tauri Commands ─────────────────────────────────────────────────────────

/// Verify that a remote repository URL is accessible.
#[tauri::command]
pub async fn verify_repo(
    url: String,
    token: Option<String>,
) -> Result<VerifyResult, String> {
    ensure_git().await.map_err(String::from)?;

    let effective_url = match &token {
        Some(t) if !t.is_empty() && !url.starts_with("git@") => {
            build_auth_url(&url, t).map_err(String::from)?
        }
        _ => url.clone(),
    };

    let output = TokioCommand::new("git")
        .args(["ls-remote", "--symref", &effective_url])
        .env("GIT_TERMINAL_PROMPT", "0")
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .await
        .map_err(|e| format!("Git error: {e}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if !output.status.success() {
        return Ok(VerifyResult {
            accessible: false,
            is_empty: false,
            default_branch: None,
            message: stderr.trim().to_string(),
        });
    }

    // Parse default branch from symref output: "ref: refs/heads/main\tHEAD"
    let default_branch = stdout
        .lines()
        .find(|l| l.starts_with("ref: refs/heads/"))
        .and_then(|l| l.strip_prefix("ref: refs/heads/"))
        .and_then(|l| l.split('\t').next())
        .map(|s| s.to_string());

    let is_empty = stdout.lines().all(|l| l.starts_with("ref:"));

    Ok(VerifyResult {
        accessible: true,
        is_empty,
        default_branch,
        message: if is_empty {
            "仓库为空".to_string()
        } else {
            "仓库可访问".to_string()
        },
    })
}

/// Initialize a git repository at the given path.
#[tauri::command]
pub async fn git_init(path: String) -> Result<GitInitResult, String> {
    let repo_path = Path::new(&path);

    if repo_path.join(".git").exists() {
        return Ok(GitInitResult {
            path,
            already_existed: true,
        });
    }

    run_git(repo_path, &["init"])
        .await
        .map_err(String::from)?;

    Ok(GitInitResult {
        path,
        already_existed: false,
    })
}

/// Clone a remote repository.
#[tauri::command]
pub async fn git_clone(
    url: String,
    path: String,
    token: Option<String>,
) -> Result<(), String> {
    let effective_url = resolve_auth_url(&url, token.as_deref()).map_err(String::from)?;

    let target = Path::new(&path);

    // Ensure parent directory exists
    if let Some(parent) = target.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directory: {e}"))?;
    }

    // If target dir exists and is not empty, clone into it with separate git dir
    let args = if target.exists() && target.read_dir().map_or(false, |mut d| d.next().is_some()) {
        vec![
            "clone".to_string(),
            effective_url,
            path.clone(),
            "--separate-git-dir".to_string(),
            target.join(".git").to_string_lossy().to_string(),
        ]
    } else {
        vec!["clone".to_string(), effective_url, path.clone()]
    };

    let output = TokioCommand::new("git")
        .args(&args)
        .env("GIT_TERMINAL_PROMPT", "0")
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .await
        .map_err(|e| format!("Clone error: {e}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Clone failed: {}", stderr.trim()));
    }

    Ok(())
}

/// Stage all changes and commit.
#[tauri::command]
pub async fn git_add_commit(path: String, message: String) -> Result<(), String> {
    let dir = Path::new(&path);
    run_git(dir, &["add", "-A"]).await.map_err(String::from)?;
    run_git(dir, &["commit", "-m", &message])
        .await
        .map_err(String::from)?;
    Ok(())
}

/// Push to a remote. Temporarily embeds token in remote URL for HTTPS auth.
#[tauri::command]
pub async fn git_push(
    path: String,
    remote: String,
    branch: String,
    token: Option<String>,
) -> Result<(), String> {
    let dir = Path::new(&path);

    // If token provided, temporarily set auth URL on remote
    let original_url = if let Some(ref t) = token {
        if !t.is_empty() {
            let current = run_git(dir, &["remote", "get-url", &remote]).await.ok();
            if let Some(ref orig) = current {
                if !orig.starts_with("git@") {
                    match build_auth_url(orig, t) {
                        Ok(auth_url) => {
                            let _ = run_git(dir, &["remote", "set-url", &remote, &auth_url]).await;
                        }
                        Err(_) => {}
                    }
                }
            }
            current
        } else {
            None
        }
    } else {
        None
    };

    let result = run_git(dir, &["push", &remote, &branch]).await;

    // Restore original URL regardless of push result
    if let Some(ref orig) = original_url {
        let _ = run_git(dir, &["remote", "set-url", &remote, orig]).await;
    }

    result.map_err(String::from)?;
    Ok(())
}

/// Pull from a remote. Uses same temporary auth URL strategy as push.
#[tauri::command]
pub async fn git_pull(
    path: String,
    remote: String,
    branch: String,
    token: Option<String>,
) -> Result<(), String> {
    let dir = Path::new(&path);

    let original_url = if let Some(ref t) = token {
        if !t.is_empty() {
            let current = run_git(dir, &["remote", "get-url", &remote]).await.ok();
            if let Some(ref orig) = current {
                if !orig.starts_with("git@") {
                    match build_auth_url(orig, t) {
                        Ok(auth_url) => {
                            let _ = run_git(dir, &["remote", "set-url", &remote, &auth_url]).await;
                        }
                        Err(_) => {}
                    }
                }
            }
            current
        } else {
            None
        }
    } else {
        None
    };

    let result = run_git(dir, &["pull", &remote, &branch]).await;

    if let Some(ref orig) = original_url {
        let _ = run_git(dir, &["remote", "set-url", &remote, orig]).await;
    }

    result.map_err(String::from)?;
    Ok(())
}

/// Get the working tree status using porcelain v2 format.
#[tauri::command]
pub async fn git_status(path: String) -> Result<GitStatus, String> {
    let dir = Path::new(&path);

    // Get branch name
    let branch = run_git(dir, &["rev-parse", "--abbrev-ref", "HEAD"])
        .await
        .unwrap_or_else(|_| "HEAD".to_string());

    // Get porcelain status
    let status_output = run_git(dir, &["status", "--porcelain=v2", "--branch"])
        .await
        .map_err(String::from)?;

    let mut staged = 0u32;
    let mut unstaged = 0u32;
    let mut untracked = 0u32;
    let mut ahead = 0u32;
    let mut behind = 0u32;

    for line in status_output.lines() {
        let chars: Vec<char> = line.chars().collect();
        match chars.first() {
            Some('1') | Some('2') => {
                // Changed entries: check index vs worktree status
                // XY where X = index status, Y = worktree status
                if chars.len() > 2 {
                    let x = chars[1];
                    let y = chars[2];
                    if x != '.' && x != '?' {
                        staged += 1;
                    }
                    if y != '.' && y != '?' {
                        unstaged += 1;
                    }
                } else {
                    staged += 1;
                }
            }
            Some('u') => {
                unstaged += 1;
            }
            Some('?') => {
                untracked += 1;
            }
            Some('#') => {
                // Branch info: # branch.ab +3 -0
                if let Some(ab_part) = line.split("branch.ab").nth(1) {
                    for token in ab_part.split_whitespace() {
                        if let Some(num_str) = token.strip_prefix('+') {
                            ahead = num_str.parse().unwrap_or(0);
                        } else if let Some(num_str) = token.strip_prefix('-') {
                            behind = num_str.parse().unwrap_or(0);
                        }
                    }
                }
            }
            _ => {}
        }
    }

    let clean = staged == 0 && unstaged == 0 && untracked == 0;

    Ok(GitStatus {
        branch,
        ahead,
        behind,
        staged,
        unstaged,
        untracked,
        clean,
    })
}

/// Set or update a remote URL.
#[tauri::command]
pub async fn git_set_remote(path: String, name: String, url: String) -> Result<(), String> {
    let dir = Path::new(&path);

    let existing = run_git(dir, &["remote"]).await;

    match existing {
        Ok(remotes) if remotes.lines().any(|r| r == name) => {
            run_git(dir, &["remote", "set-url", &name, &url])
                .await
                .map_err(String::from)?;
        }
        _ => {
            run_git(dir, &["remote", "add", &name, &url])
                .await
                .map_err(String::from)?;
        }
    }

    Ok(())
}

/// Get commit log entries.
#[tauri::command]
pub async fn git_log(path: String, count: Option<u32>) -> Result<Vec<GitLogEntry>, String> {
    let dir = Path::new(&path);
    let n = count.unwrap_or(20);
    let format_spec = "%H%n%h%n%an%n%aI%n%s";
    let n_arg = format!("-{n}");

    let output = run_git(
        dir,
        &[
            "log",
            &n_arg,
            &format!("--pretty=format:{format_spec}"),
            "--",
        ],
    )
    .await
    .map_err(String::from)?;

    let mut entries = Vec::new();
    let lines: Vec<&str> = output.lines().collect();

    for chunk in lines.chunks(5) {
        if chunk.len() >= 5 {
            entries.push(GitLogEntry {
                hash: chunk[0].to_string(),
                short_hash: chunk[1].to_string(),
                author: chunk[2].to_string(),
                date: chunk[3].to_string(),
                message: chunk[4].to_string(),
            });
        }
    }

    Ok(entries)
}
