# YAS (Yet Another Scoreboard)

WIP - redo of https://github.com/jacob-horton/mk-scoreboard

Planned improvements/changes:
- Code quality improvements
- Better UI/UX (caching, loading states, animations, responsiveness, etc.)
- Less buggy - manage state properly
- More general - not just for Mario Kart
- Support accounts (so people can have their own scoreboards)
- Use SolidJS instead of React (mainly to learn SolidJS better)


# Development

## Requirements

- PNPM
- Rust
- Taskfile.dev (optional)


## Quick-Start

If using [Task](https://taskfile.dev), you can just run `task` to run the client and server

> [!Note]
> The server does not automatically recompile when you make a change. If you want this to happen, install [cargo-watch](https://crates.io/crates/cargo-watch) and then you can use `task run_watch`



## Back-End

### Running

Start back-end:
```bash
cd server
cargo run
```

## Front-End

### Running

Start front-end:
```bash
cd client
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


## Building for Production

```bash
npm run build
```

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified, and the filenames include the hashes.<br>
Your app is ready to be deployed!

