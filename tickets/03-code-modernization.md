# 03 - Code run-through and modernization

Status: open
Source: 2026-11-12 GIP consolidation.
Repo: `projects/global-info-portal`.

## Evidence

The app is 95 commits of vanilla JS with webpack 5, a large `css-styles/` tree,
and a `debugging/` folder. It builds cleanly today, but the dependency and
module layout has not had a full review since the last overhaul.

## Action

1. Read the entry points and map the module graph. Record dead files and
   duplicate styles.
2. Audit dependencies: remove unused packages, pin the rest, and record the
   upgrade path for webpack and any UI libraries.
3. Check the build output for size regressions and split the largest chunks.
4. Run the existing Jest suite and record what it actually covers.
5. List accessibility and performance fixes in priority order, not as a rewrite.
6. Decide whether a Vite migration is worth it. Do not migrate in this ticket.

## Acceptance

A written audit with a prioritized fix list, a dependency inventory, and a
passing build and test run. No behavior change in this ticket.
