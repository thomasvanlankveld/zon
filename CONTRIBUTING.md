# Contributing

## How to install for development

### Prerequisites

- Tauri's [System Dependencies](https://tauri.app/start/prerequisites/#system-dependencies)
- [git lfs](https://git-lfs.com/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Deno](https://deno.com/manual/getting_started/installation)

### Install steps

1. Clone the repo and `cd` into it.
2. `deno install --allow-scripts=npm:core-js@3.41.0`

## How to run for development

```
deno task tauri dev
```

## How to build releases

These are the commands to build for Apple silicon and for Intel:

```
deno task bundle-mac-silicon
deno task bundle-mac-intel
```

For a [debug](https://v2.tauri.app/develop/debug/) version, add the argument `--debug`.
