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


## Quick-Start

Start back-end:
```bash
cd server
cargo run
```

Start front-end:
```bash
cd client
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


## Building Front-End for Production

```bash
npm run build
```

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified, and the filenames include the hashes.<br>
Your app is ready to be deployed!

