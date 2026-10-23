# The Last Scholar of Golb

Vite + TypeScript web game. See [`README.md`](README.md) for commands and
[`docs/design.md`](docs/design.md) for the premise.

- Run `npm run build` before committing; it typechecks.
- Feature work happens in worktrees, not on `main`.
- Assets: never commit ripped, copyrighted or unlicensed audio or art. Keep it in the gitignored
  `raw-assets/`. Shipped files go under `public/assets/` with a credits row in
  [`docs/assets.md`](docs/assets.md) in the same commit. Set up Git LFS before committing a file
  over about 5 MB.
