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
    let css_dest_path = Path::new(&out_dir).join("index.css");
    let fira_code_regular_dest_path = Path::new(&out_dir).join("FiraCode-Regular.ttf");
    let fira_code_variable_wght_dest_path =
        Path::new(&out_dir).join("FiraCode-VariableFont_wght.ttf");

    // Get html file contents
    let html_dist_filename = "dist/index.html";
    let html_u8 = fs::read(html_dist_filename)?;
    let html = String::from_utf8_lossy(&html_u8);

    // Get js file contents
    let js_filename = html.split("<script src=\"/").collect::<Vec<&str>>()[1]
        .split("\"></script>")
        .collect::<Vec<&str>>()[0];
    let js_dist_filename = format!("{}{}", "dist/", &js_filename);
    let js_u8 = fs::read(&js_dist_filename)?;
    let js = String::from_utf8_lossy(&js_u8);

    // Get css file contents
    let css_filename = html
        .split("<link rel=\"stylesheet\" href=\"/")
        .collect::<Vec<&str>>()[1]
        .split("\"><body")
        .collect::<Vec<&str>>()[0];
    let css_dist_filename = format!("{}{}", "dist/", css_filename);
    let css_u8 = fs::read(&css_dist_filename)?;
    let css = String::from_utf8_lossy(&css_u8);

    // Get regular font file contents
    let fira_code_regular_filename = css
        .split("@font-face{font-family:Fira Code;src:url(")
        .collect::<Vec<&str>>()[1]
        .split(");font-weight")
        .collect::<Vec<&str>>()[0];
    let fira_code_regular_dist_filename = format!("{}{}", "dist/", &fira_code_regular_filename);
    let fira_code_regular_u8 = fs::read(&fira_code_regular_dist_filename)?;

    // Get variable weight font file contents
    let fira_code_variable_wght_filename = css
        .split(
            "@supports (font-variation-settings:normal){@font-face{font-family:Fira Code;src:url(",
        )
        .collect::<Vec<&str>>()[1]
        .split(") format(\"woff2 supports variations\")")
        .collect::<Vec<&str>>()[0];
    let fira_code_variable_wght_dist_filename =
        format!("{}{}", "dist/", &fira_code_variable_wght_filename);
    let fira_code_variable_wght_u8 = fs::read(&fira_code_variable_wght_dist_filename)?;

    // Replace hashed filenames with fixed ones (so we can serve them)
    let html_with_fixes = html
        .replace(&js_filename, "index.js")
        .replace(&css_filename, "index.css");
    let css_with_fixes = css
        .replace(&fira_code_regular_filename, "FiraCode-Regular.ttf")
        .replace(
            &fira_code_variable_wght_filename,
            "FiraCode-VariableFont_wght.ttf",
        );

    // Write asset files
    fs::write(&html_dest_path, format!("{}", html_with_fixes))?;
    fs::write(&js_dest_path, format!("{}", js))?;
    fs::write(&css_dest_path, format!("{}", css_with_fixes))?;
    fs::write(&fira_code_regular_dest_path, fira_code_regular_u8)?;
    fs::write(
        &fira_code_variable_wght_dest_path,
        fira_code_variable_wght_u8,
    )?;

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

            pub fn css() -> &'static str {{
                include_str!({css_dest_path:?})
            }}

            pub fn fira_code_regular() -> &'static [u8] {{
                include_bytes!({fira_code_regular_dest_path:?})
            }}

            pub fn fira_code_variable_wght() -> &'static [u8] {{
                include_bytes!({fira_code_variable_wght_dest_path:?})
            }}
        ",
            html_dest_path = html_dest_path,
            js_dest_path = js_dest_path,
            css_dest_path = css_dest_path,
            fira_code_regular_dest_path = fira_code_regular_dest_path,
            fira_code_variable_wght_dest_path = fira_code_variable_wght_dest_path,
        ),
    )?;

    // Done!
    Ok(())
}
