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
- Docker
- Taskfile.dev (optional)


## Quick-Start

If using [Task](https://taskfile.dev), you can start the database with:
```bash
task db_up
```

Then run the client and server with:
```bash
task
```

> [!Note]
> The server does not automatically recompile when you make a change. If you want this to happen, install [cargo-watch](https://crates.io/crates/cargo-watch), and then you can use `task run_watch`.


## Database

This uses Postgres running in a docker container.

To start the database with Task:
```bash
task db_up
```

To stop it, run:
```bash
task db_down
```

To run without Task:
```bash
cd db
docker compose up
```


## Back-End

### Running

To run with Task:
```bash
task server
```

> [!Note]
> The server does not automatically recompile when you make a change. If you want this to happen, install [cargo-watch](https://crates.io/crates/cargo-watch), and then you can use `task server_watch`.

To run without Task:
```bash
cd server
cargo run
```


## Front-End

### Running

To run with Task:
```bash
task client
```

To run without Task:
```bash
cd client
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


## Building for Production

```bash
pnpm run build
```

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified, and the filenames include the hashes.<br>
Your app is ready to be deployed!

