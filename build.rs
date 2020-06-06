use std::env;
use std::error::Error;
use std::fs;
use std::path::Path;

fn main() -> Result<(), Box<dyn Error>> {
    let out_dir = env::var_os("OUT_DIR").unwrap();
    // let dest_path = Path::new(&out_dir).join("hello.rs");
    let loader_dest_path = Path::new(&out_dir).join("loader.rs");
    let html_dest_path = Path::new(&out_dir).join("index.html");
    let js_dest_path = Path::new(&out_dir).join("index.js");

    let html_dist_filename = "dist/index.html";
    let html_u8 = fs::read(html_dist_filename)?;
    let html = String::from_utf8_lossy(&html_u8);
    let js_filename = html.split("<script src=\"/ui/").collect::<Vec<&str>>()[1]
        .split("\"></script>")
        .collect::<Vec<&str>>()[0];
    let js_dist_filename = format!("{}{}", "dist/", &js_filename);
    let js_u8 = fs::read(&js_dist_filename)?;
    let js = String::from_utf8_lossy(&js_u8);
    let html_with_index_js = html.replace(&js_filename, "index.js");

    fs::write(&html_dest_path, format!("{}", html_with_index_js)).unwrap();
    fs::write(&js_dest_path, format!("{}", js)).unwrap();

    // let html_with_escaped_double_quotes = html.replace("\"", "\\\"");
    // let js_with_escaped_double_quotes = js.replace("\"", "\\\"").replace("\\", "\\\\");

    fs::write(
        &loader_dest_path,
        format!(
            "pub fn html() -> &'static str {{
                include_str!({html_dest_path:?})
            }}

            pub fn js() -> &'static str {{
                include_str!({js_dest_path:?})
            }}
        ",
            html_dest_path = html_dest_path,
            js_dest_path = js_dest_path,
        ),
    )
    .unwrap();
    // fs::write(
    //     &loader_dest_path,
    //     format!(
    //         "pub fn html() -> &'static str {{
    //             include_str!({html_dest_path:?})
    //         }}

    //         pub fn js() -> &'static str {{
    //             include_str!({js_dest_path:?})
    //         }}

    //         pub fn js_filename() -> &'static str {{
    //             \"{js_filename}\"
    //         }}
    //     ",
    //         html_dest_path = html_dest_path,
    //         js_dest_path = js_dest_path,
    //         js_filename = js_filename,
    //     ),
    // )
    // .unwrap();

    // println!("{:?}", env::var_os("OUT_DIR"));

    Ok(())
}
