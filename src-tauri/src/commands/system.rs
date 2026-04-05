use std::path::PathBuf;
use std::process::Command as StdCommand;

/// Open a terminal application with an optional working directory.
///
/// On Windows:
///   - "powershell" → launches PowerShell
///   - "cmd"        → launches Command Prompt
///
/// If `working_dir` is provided and the directory exists, the terminal
/// will start in that directory. Otherwise it falls back to the user's
/// home directory.
#[tauri::command]
pub fn open_terminal(terminal: String, working_dir: Option<String>) -> Result<(), String> {
    let dir = resolve_working_dir(working_dir)?;

    match terminal.as_str() {
        "powershell" => open_powershell(&dir),
        "cmd" => open_cmd(&dir),
        _ => Err(format!("Unsupported terminal: {terminal}")),
    }
}

/// Open the system file explorer at the given path.
///
/// Falls back to the user's home directory if no path is provided
/// or the path does not exist.
#[tauri::command]
pub fn open_file_explorer(path: Option<String>) -> Result<(), String> {
    let dir = resolve_working_dir(path)?;

    StdCommand::new("explorer")
        .arg(&dir)
        .spawn()
        .map_err(|e| format!("Failed to open file explorer: {e}"))?;

    Ok(())
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/// Resolve a working directory from the optional path string.
/// Returns the user's home directory as fallback.
fn resolve_working_dir(path: Option<String>) -> Result<String, String> {
    if let Some(p) = path {
        let pb = PathBuf::from(&p);
        if pb.is_dir() {
            return Ok(p);
        }
    }
    dirs::home_dir()
        .map(|h| h.to_string_lossy().to_string())
        .ok_or_else(|| "Cannot determine home directory".to_string())
}

fn open_powershell(dir: &str) -> Result<(), String> {
    StdCommand::new("cmd.exe")
        .args(["/C", "start", "powershell.exe", "-NoExit", "-Command"])
        .arg(format!("cd \"{dir}\""))
        .spawn()
        .map_err(|e| format!("Failed to open PowerShell: {e}"))?;
    Ok(())
}

fn open_cmd(dir: &str) -> Result<(), String> {
    StdCommand::new("cmd.exe")
        .args(["/C", "start", "cmd.exe", "/K"])
        .arg(format!("cd /d \"{dir}\""))
        .spawn()
        .map_err(|e| format!("Failed to open Command Prompt: {e}"))?;
    Ok(())
}
