# Tips

## API

`zon`, by default

- Uses `.` as the input folder
- Uses `./zon` as the output folder
- Serves the output
- Opens the browser

## Workings

- Parse CLI options ([`structopt`](https://crates.io/crates/structopt))
- Run [`tokei`](https://crates.io/crates/tokei)
- Output JSON
- Run Parcel and output files, along with JSON, in output folder
- Serve output folder ([`warp`](https://crates.io/crates/warp))
- Open browser ([`webbrowser`](https://crates.io/crates/webbrowser))

## Rust stuffs

- `cargo new`
- [killercup/cargo-edit: A utility for managing cargo dependencies from the command line.](https://github.com/killercup/cargo-edit)
  - `cargo add <package-name>`
- Tokei derives `Serialize` for `Languages`, so it should be very easy to get JSON output

## Webview

- [rust webview at DuckDuckGo](https://duckduckgo.com/?t=ffab&q=rust+webview&atb=v171-1&ia=web)
- [web-view/examples at master · Boscop/web-view](https://github.com/Boscop/web-view/tree/master/examples)
- [web-view/todo-vue.rs at master · Boscop/web-view](https://github.com/Boscop/web-view/blob/a4cfc7f93006a6b4b039866f7e6d1e80cf298fdc/examples/todo-vue.rs)
- [web-view/todo.rs at master · Boscop/web-view](https://github.com/Boscop/web-view/blob/master/examples/todo.rs)
- [web-view/app.js at master · Boscop/web-view](https://github.com/Boscop/web-view/blob/master/examples/todo/app.js)
- [zserge/webview: Tiny cross-platform webview library for C/C++/Golang. Uses WebKit (Gtk/Cocoa) and Edge (Windows)](https://github.com/zserge/webview)

## Notivlaai

- [tdejager/notivlaai: A small web-app, that manages an order-room for 'vlaaien' delivery](https://github.com/tdejager/notivlaai/)
- [notivlaai/notivlaai-client at master · tdejager/notivlaai](https://github.com/tdejager/notivlaai/tree/master/notivlaai-client)
- [notivlaai/package.json at master · tdejager/notivlaai](https://github.com/tdejager/notivlaai/blob/master/notivlaai-client/package.json)
- [notivlaai/notivlaai-server at master · tdejager/notivlaai](https://github.com/tdejager/notivlaai/tree/master/notivlaai-server)
- [notivlaai/main.rs at master · tdejager/notivlaai](https://github.com/tdejager/notivlaai/blob/master/notivlaai-server/src/main.rs)
- [notivlaai/notivlaai-client at master · tdejager/notivlaai](https://github.com/tdejager/notivlaai/tree/master/notivlaai-client)
- [std::include_str - Rust](https://doc.rust-lang.org/std/macro.include_str.html)
