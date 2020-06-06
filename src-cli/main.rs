use std::env;
use std::error::Error;

use tokei::{Config, Languages};
use warp::Filter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Get path of the project to analyse
    let project_path = env::current_dir()?;

    // Get analysis as json
    let mut languages = Languages::new();
    let config = Config::default();
    languages.get_statistics(&[project_path], &[], &config);
    let tokei_json = serde_json::to_string(&languages)?;

    // Get UI folder path
    let executable_path = std::env::current_exe()?;
    let relative_ui_folder_path = executable_path.join("../../../dist");
    let ui_folder_path = std::fs::canonicalize(relative_ui_folder_path)?;

    // Serve UI and analysis
    let served_zon_ui = warp::path("ui").and(warp::fs::dir(ui_folder_path));
    let served_tokei_json = warp::path("input").map(move || format!("{}", tokei_json));
    let served = served_zon_ui.or(served_tokei_json);
    warp::serve(served).run(([127, 0, 0, 1], 3030)).await;

    // Close
    Ok(())
}
