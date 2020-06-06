use std::env;
use std::error::Error;
use tokei::{Config, Languages};
use warp::Filter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let project_path = env::current_dir()?;

    let mut languages = Languages::new();
    let config = Config::default();
    languages.get_statistics(&[project_path], &[], &config);

    // println!("{}", serde_json::to_string(&languages)?);
    let tokei_json = serde_json::to_string(&languages)?;

    let served_zon_ui = warp::path("ui").and(warp::fs::dir("./dist/"));
    let served_tokei_json = warp::path("input").map(move || format!("{}", tokei_json));

    let served = served_zon_ui.or(served_tokei_json);
    // let zon_ui = warp::fs::dir("./dist/");
    warp::serve(served).run(([127, 0, 0, 1], 3030)).await;
    // let input_file = warp::fs::file();
    // warp::serve(input_file).run(([127, 0, 0, 1], 3031)).await;
    Ok(())
}
