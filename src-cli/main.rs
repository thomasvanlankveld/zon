use std::env;
use std::str;

use anyhow::Result;
use colored::*;
use serde_json::json;
use tokei::{Config, Languages};
use warp::{http::Response, Filter};

// Include html and js file content loader
include!(concat!(env!("OUT_DIR"), "/loader.rs"));

#[tokio::main]
async fn main() -> Result<()> {
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
    let served_zon_ui_index_html = warp::path::end()
        .map(|| html())
        .with(warp::reply::with::header("content-type", "text/html"))
        .with(warp::reply::with::header("content-length", html().len()))
        .with(warp::reply::with::header("accept-ranges", "bytes"));

    // Get js contents and headers
    let served_zon_ui_index_js = warp::path!("index.js")
        .map(|| js())
        .with(warp::reply::with::header(
            "content-type",
            "application/javascript",
        ))
        .with(warp::reply::with::header("content-length", js().len()))
        .with(warp::reply::with::header("accept-ranges", "bytes"));

    // Get css contents and headers
    let served_zon_ui_index_css = warp::path!("index.css")
        .map(|| css())
        .with(warp::reply::with::header("content-type", "text/css"))
        .with(warp::reply::with::header("content-length", css().len()))
        .with(warp::reply::with::header("accept-ranges", "bytes"));

    // Get regular font contents and headers
    let served_zon_ui_fira_code_regular = warp::path!("FiraCode-Regular.ttf").map(|| {
        Response::builder()
            .header("content-type", "font/ttf")
            .header("accept-ranges", "bytes")
            .header("content-length", fira_code_regular().len())
            .body(fira_code_regular())
    });

    // Get variable weight font contents and headers
    let served_zon_ui_fira_code_variable_wght =
        warp::path!("FiraCode-VariableFont_wght.ttf").map(|| {
            Response::builder()
                .header("content-type", "font/ttf")
                .header("accept-ranges", "bytes")
                .header("content-length", fira_code_variable_wght().len())
                .body(fira_code_variable_wght())
        });

    // Serve UI and analysis json
    let served_zon_ui = served_zon_ui_index_html
        .or(served_zon_ui_index_js)
        .or(served_zon_ui_index_css)
        .or(served_zon_ui_fira_code_regular)
        .or(served_zon_ui_fira_code_variable_wght);
    let served_zon_json = warp::path("input").map(move || format!("{}", zon_json));
    let served = served_zon_ui.or(served_zon_json);
    println!(
        "{}{}",
        "Shining light on your project at ",
        "http://localhost:3030".cyan()
    );
    warp::serve(served).run(([127, 0, 0, 1], 3030)).await;

    // Close
    Ok(())
}
