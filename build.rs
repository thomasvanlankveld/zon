use std::env;
use std::fs;
use std::path::Path;

use anyhow::Result;

// Generate a loader program to include the UI into the binary as static strings
fn main() -> Result<()> {
    // Get destination paths
    let out_dir = env::var_os("OUT_DIR").unwrap();
    let loader_dest_path = Path::new(&out_dir).join("loader.rs");
    let html_dest_path = Path::new(&out_dir).join("index.html");
    let js_dest_path = Path::new(&out_dir).join("index.js");

    // Get html file contents
    let html_dist_filename = "dist/index.html";
    let html_u8 = fs::read(html_dist_filename)?;
    let html = String::from_utf8_lossy(&html_u8);

    // Get js file contents
    let js_filename = html.split("<script src=\"/ui/").collect::<Vec<&str>>()[1]
        .split("\"></script>")
        .collect::<Vec<&str>>()[0];
    let js_dist_filename = format!("{}{}", "dist/", &js_filename);
    let js_u8 = fs::read(&js_dist_filename)?;
    let js = String::from_utf8_lossy(&js_u8);

    // Replace hashed js filename with "index.js"
    let html_with_index_js = html.replace(&js_filename, "index.js");

    // Write html and js files
    fs::write(&html_dest_path, format!("{}", html_with_index_js))?;
    fs::write(&js_dest_path, format!("{}", js))?;

    // Write "loader" file
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
    )?;

    // Done!
    Ok(())
}
