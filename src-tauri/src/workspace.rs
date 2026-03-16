use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

/// File entry for directory scanning
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    #[serde(rename = "isDir")]
    pub is_dir: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<FileEntry>>,
}

/// Validate that the target path is strictly inside the workspace root.
fn validate_path_in_workspace(workspace_path: &str, relative_path: &str) -> Result<PathBuf, String> {
    let workspace = PathBuf::from(workspace_path)
        .canonicalize()
        .map_err(|e| format!("Invalid workspace path: {e}"))?;

    // Resolve the target without requiring it to exist yet (join + normalize)
    let target = workspace.join(relative_path);
    // Normalize without canonicalize (file might not exist yet)
    let normalized = normalize_path(&target);

    if !normalized.starts_with(&workspace) {
        return Err(format!(
            "Security violation: path '{}' is outside workspace '{}'",
            normalized.display(),
            workspace.display()
        ));
    }

    Ok(normalized)
}

/// Normalize a path without requiring it to exist (removes `.` and `..`)
fn normalize_path(path: &Path) -> PathBuf {
    let mut components = vec![];
    for component in path.components() {
        match component {
            std::path::Component::ParentDir => {
                components.pop();
            }
            std::path::Component::CurDir => {}
            c => components.push(c),
        }
    }
    components.iter().collect()
}

/// Recursively scan a directory, returning a file tree.
fn scan_dir(path: &Path, workspace: &Path) -> Vec<FileEntry> {
    let mut entries = vec![];
    let Ok(read_dir) = std::fs::read_dir(path) else {
        return entries;
    };

    let mut items: Vec<_> = read_dir.flatten().collect();
    items.sort_by_key(|e| {
        let is_file = e.file_type().map(|t| t.is_file()).unwrap_or(false);
        (is_file as u8, e.file_name())
    });

    for entry in items {
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files (except .ai-workflow)
        if name.starts_with('.') && name != ".ai-workflow" {
            continue;
        }

        let relative = entry_path
            .strip_prefix(workspace)
            .map(|p| p.to_string_lossy().replace('\\', "/"))
            .unwrap_or_default();

        let is_dir = entry_path.is_dir();
        let children = if is_dir {
            Some(scan_dir(&entry_path, workspace))
        } else {
            None
        };

        entries.push(FileEntry {
            name,
            path: relative,
            is_dir,
            children,
        });
    }

    entries
}

// ─── Tauri Commands ──────────────────────────────────────────────────────────

/// Open a native folder-picker dialog and return the selected path.
#[tauri::command]
pub async fn open_workspace(app: AppHandle) -> Result<Option<String>, String> {
    let folder = app
        .dialog()
        .file()
        .blocking_pick_folder();

    Ok(folder.map(|f| f.to_string()))
}

/// Scan a workspace directory and return its file tree.
#[tauri::command]
pub fn scan_workspace(path: String) -> Result<Vec<FileEntry>, String> {
    let workspace = PathBuf::from(&path)
        .canonicalize()
        .map_err(|e| format!("Invalid workspace path: {e}"))?;

    if !workspace.is_dir() {
        return Err(format!("'{}' is not a directory", workspace.display()));
    }

    Ok(scan_dir(&workspace, &workspace))
}

/// Read a file within the workspace.
#[tauri::command]
pub fn read_file(workspace_path: String, relative_path: String) -> Result<String, String> {
    let target = validate_path_in_workspace(&workspace_path, &relative_path)?;

    std::fs::read_to_string(&target)
        .map_err(|e| format!("Failed to read '{}': {e}", target.display()))
}

/// Write content to a file within the workspace (creates parent dirs as needed).
#[tauri::command]
pub fn write_file(workspace_path: String, relative_path: String, content: String) -> Result<(), String> {
    let target = validate_path_in_workspace(&workspace_path, &relative_path)?;

    if let Some(parent) = target.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directories: {e}"))?;
    }

    std::fs::write(&target, content)
        .map_err(|e| format!("Failed to write '{}': {e}", target.display()))
}

/// Initialize the .ai-workflow/ directory structure in a workspace.
#[tauri::command]
pub fn init_project_structure(workspace_path: String, project_name: String) -> Result<(), String> {
    let workspace = PathBuf::from(&workspace_path);

    let dirs = [
        ".ai-workflow/requirements",
        ".ai-workflow/prototypes",
        ".ai-workflow/tech-design",
        ".ai-workflow/tasks",
        ".ai-workflow/memory",
        ".ai-workflow/retrospective",
    ];

    for dir in &dirs {
        std::fs::create_dir_all(workspace.join(dir))
            .map_err(|e| format!("Failed to create '{dir}': {e}"))?;
    }

    // Create default project.json if it doesn't exist
    let config_path = workspace.join(".ai-workflow/project.json");
    if !config_path.exists() {
        let config = serde_json::json!({
            "id": uuid_v4(),
            "name": project_name,
            "description": "",
            "workspacePath": workspace_path,
            "createdAt": now_iso(),
            "updatedAt": now_iso(),
            "defaultModel": "claude-sonnet-4-6",
            "phases": {
                "requirements": { "status": "not_started" },
                "prototype": { "status": "not_started" },
                "tech": { "status": "not_started" },
                "tasks": { "status": "not_started" },
                "retrospective": { "status": "not_started" }
            },
            "sync": { "type": "none" }
        });

        std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
            .map_err(|e| format!("Failed to write project.json: {e}"))?;
    }

    // Create empty memory files
    let memory_files = [
        (".ai-workflow/memory/prompts.json", "[]"),
        (".ai-workflow/memory/test-cases.json", "[]"),
        (".ai-workflow/memory/task-templates.json", "[]"),
        (".ai-workflow/memory/experiences.json", "[]"),
        (".ai-workflow/tasks/milestones.json", "[]"),
    ];

    for (rel, default) in &memory_files {
        let p = workspace.join(rel);
        if !p.exists() {
            std::fs::write(&p, default)
                .map_err(|e| format!("Failed to write {rel}: {e}"))?;
        }
    }

    Ok(())
}

/// Read project.json and return it as a JSON value.
#[tauri::command]
pub fn read_project_config(workspace_path: String) -> Result<Option<serde_json::Value>, String> {
    let config_path = PathBuf::from(&workspace_path).join(".ai-workflow/project.json");

    if !config_path.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read project.json: {e}"))?;

    let value: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Invalid project.json: {e}"))?;

    Ok(Some(value))
}

/// Write project.json.
#[tauri::command]
pub fn write_project_config(
    workspace_path: String,
    config: serde_json::Value,
) -> Result<(), String> {
    let config_path = PathBuf::from(&workspace_path).join(".ai-workflow/project.json");

    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create .ai-workflow dir: {e}"))?;
    }

    let content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {e}"))?;

    std::fs::write(&config_path, content)
        .map_err(|e| format!("Failed to write project.json: {e}"))
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

fn uuid_v4() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let t = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    format!("{:x}-{:x}-4{:x}-{:x}-{:x}", t & 0xFFFF_FFFF, (t >> 32) & 0xFFFF, (t >> 48) & 0x0FFF, ((t >> 60) & 0x3) | 0x8, (t >> 62) & 0xFFFF_FFFF_FFFF)
}

fn now_iso() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    // Simple ISO-ish timestamp (good enough without chrono dep)
    let (y, mo, d, h, mi, s) = epoch_to_datetime(secs);
    format!("{y:04}-{mo:02}-{d:02}T{h:02}:{mi:02}:{s:02}Z")
}

fn epoch_to_datetime(secs: u64) -> (u64, u64, u64, u64, u64, u64) {
    let s = secs % 60;
    let m = (secs / 60) % 60;
    let h = (secs / 3600) % 24;
    let days = secs / 86400;
    // Days since 1970-01-01
    let (year, month, day) = days_to_ymd(days);
    (year, month, day, h, m, s)
}

fn days_to_ymd(days: u64) -> (u64, u64, u64) {
    let mut y = 1970u64;
    let mut d = days;
    loop {
        let dy = if is_leap(y) { 366 } else { 365 };
        if d < dy { break; }
        d -= dy;
        y += 1;
    }
    let months = [31, if is_leap(y) { 29 } else { 28 }, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let mut mo = 1u64;
    for dm in months {
        if d < dm { break; }
        d -= dm;
        mo += 1;
    }
    (y, mo, d + 1)
}

fn is_leap(y: u64) -> bool {
    (y % 4 == 0 && y % 100 != 0) || y % 400 == 0
}
