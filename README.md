# Zon

Shed light on your codebase.

This project is in a pre-release state. Feedback and ideas are appreciated!

## How to install

For now, using Zon requires building it from source.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (recommended via [nvm](https://github.com/nvm-sh/nvm) if you're not using [Docker](https://www.docker.com/))
- [Yarn](https://yarnpkg.com/)
- [Cargo](https://github.com/rust-lang/cargo/) (recommended via [rustup](https://www.rust-lang.org/learn/get-started))

### Installation steps

1. Clone the repo and `cd` into it.
2. `yarn`
3. `yarn build`
4. `cargo build`
5. Copy the binary from `target/debug/zon` to some place in your `PATH`. Usage will require opening a new terminal window.

## How to use

Navigate to a codebase you wish to inspect, and run `zon`. Open a browser and go to `http://localhost/ui` to see the result!
