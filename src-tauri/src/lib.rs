use tokei::{Config, Languages};

#[tauri::command]
async fn count_lines(path: String) -> Languages {
    let config = Config::default();
    let mut languages = Languages::new();
    // TODO: Support multiple paths? Support excludes?
    languages.get_statistics(&[path], &[], &config);

    languages
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![count_lines])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
