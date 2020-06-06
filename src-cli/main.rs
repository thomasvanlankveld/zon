#[tokio::main]
async fn main() {
    let zon_ui = warp::fs::dir("./dist/");
    warp::serve(zon_ui).run(([127, 0, 0, 1], 3030)).await;
}
