mod commands;
mod workspace;

use commands::credential::{delete_credential, get_credential, save_credential};
use commands::git::{
    git_add_commit, git_clone, git_init, git_log, git_pull, git_push, git_set_remote, git_status,
    verify_repo,
};
use commands::system::{open_file_explorer, open_terminal};
use workspace::{
    init_project_structure, open_workspace, read_file, read_project_config, scan_workspace,
    write_file, write_project_config,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // workspace
            open_workspace,
            scan_workspace,
            read_file,
            write_file,
            init_project_structure,
            read_project_config,
            write_project_config,
            // system
            open_terminal,
            open_file_explorer,
            // git
            verify_repo,
            git_init,
            git_clone,
            git_add_commit,
            git_push,
            git_pull,
            git_status,
            git_set_remote,
            git_log,
            // credential
            save_credential,
            get_credential,
            delete_credential,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
