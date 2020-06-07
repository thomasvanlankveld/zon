use std::env;
use std::error::Error;

use colored::*;
use serde_json::json;
use tokei::{Config, Languages};
use warp::Filter;

// Include html and js file content loader
include!(concat!(env!("OUT_DIR"), "/loader.rs"));

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Get project name
    let project_path = env::current_dir()?;
    let project_name = project_path
        .file_name()
        .and_then(|p| p.to_str())
        .unwrap_or("Project");

    // Get analysis
    let mut languages = Languages::new();
    let config = Config::default();
    languages.get_statistics(&["./"], &[], &config);

    // Construct project analysis JSON string
    let zon_json = json!({
        "projectName": project_name,
        "languages": languages,
    })
    .to_string();

    // Get html contents and headers
    let served_zon_ui_index_html = warp::path!("ui")
        .map(|| html())
        .with(warp::reply::with::header("content-type", "text/html"))
        .with(warp::reply::with::header("content-length", html().len()))
        .with(warp::reply::with::header("accept-ranges", "bytes"));

    // Get js contents and headers
    let served_zon_ui_index_js = warp::path!("ui" / "index.js")
        .map(|| js())
        .with(warp::reply::with::header(
            "content-type",
            "application/javascript",
        ))
        .with(warp::reply::with::header("content-length", js().len()))
        .with(warp::reply::with::header("accept-ranges", "bytes"));

    // Serve UI and analysis json
    let served_zon_ui = served_zon_ui_index_html.or(served_zon_ui_index_js);
    let served_zon_json = warp::path("input").map(move || format!("{}", zon_json));
    let served = served_zon_ui.or(served_zon_json);
    println!(
        "{}{}",
        "Shining light on your project at ",
        "http://localhost:3030/ui".cyan()
    );
    warp::serve(served).run(([127, 0, 0, 1], 3030)).await;

    // Close
    Ok(())
}
