use std::env;
use std::error::Error;

use tokei::{Config, Languages};
use warp::Filter;

// Include html and js file content loader
include!(concat!(env!("OUT_DIR"), "/loader.rs"));

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Get path of the project to analyse
    let project_path = env::current_dir()?;

    // Get analysis as json
    let mut languages = Languages::new();
    let config = Config::default();
    languages.get_statistics(&[project_path], &[], &config);
    let tokei_json = serde_json::to_string(&languages)?;

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
    let served_tokei_json = warp::path("input").map(move || format!("{}", tokei_json));
    let served = served_zon_ui.or(served_tokei_json);
    warp::serve(served).run(([127, 0, 0, 1], 3030)).await;

    // Close
    Ok(())
}
