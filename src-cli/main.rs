use std::env;
use std::error::Error;
// use std::fs;
// use std::path::Path;

use tokei::{Config, Languages};
use warp::Filter;

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

    // println!("html: {}", html());
    // println!("js: {}", js());
    // println!("{:?}", std::env::var("OUT_DIR"));

    // Get UI
    // let out_dir = env::var_os("OUT_DIR").unwrap();
    // let html_path = Path::new(&out_dir).join("index.html");
    // let html_u8 = fs::read(html_path)?;
    // let html = String::from_utf8(html_u8)?;

    // let js_path = Path::new(&out_dir).join("index.js");
    // let js_u8 = fs::read(js_path)?;
    // let js = String::from_utf8(js_u8)?;
    // let zon_ui_index_html = include_str!(std::env::var("OUT_DIR").join("index.html"));
    // let zon_ui_index_js = js();

    // // Get UI folder path
    // let executable_path = std::env::current_exe()?;
    // let relative_ui_folder_path = executable_path.join("../../../dist");
    // let ui_folder_path = std::fs::canonicalize(relative_ui_folder_path)?;

    // Serve UI and analysis
    let served_zon_ui_index_html = warp::path!("ui")
        .map(|| html())
        .with(warp::reply::with::header("content-type", "text/html"))
        .with(warp::reply::with::header("content-length", html().len()))
        .with(warp::reply::with::header("accept-ranges", "bytes"));
    let served_zon_ui_index_js = warp::path!("ui" / "index.js")
        .map(|| js())
        .with(warp::reply::with::header(
            "content-type",
            "application/javascript",
        ))
        .with(warp::reply::with::header("content-length", js().len()))
        .with(warp::reply::with::header("accept-ranges", "bytes"));

    // let served_zon_ui_index_html = warp::path!("ui").map(move || format!("{}", html));
    // let served_zon_ui_index_js = warp::path!("ui" / "index.js").map(move || format!("{}", js));
    let served_zon_ui = served_zon_ui_index_html.or(served_zon_ui_index_js);

    // let served_zon_ui = warp::path("ui").and(warp::fs::dir(ui_folder_path));

    let served_tokei_json = warp::path("input").map(move || format!("{}", tokei_json));
    let served = served_zon_ui.or(served_tokei_json);
    warp::serve(served).run(([127, 0, 0, 1], 3030)).await;

    // Close
    Ok(())
}
