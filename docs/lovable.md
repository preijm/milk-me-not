# Lovable

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Lovable edits go to the `lovable` branch, never to `main`
Lovable is no longer the host, but its GitHub sync is still connected — kept for
its security scan. That sync commits straight to whichever branch the project
points at, with no pull request, appearing in the history as
`gpt-engineer-app[bot]` ("Visual edit in Lovable", "Lovable update").

While it pointed at `main`, that was a direct write path to production. The
project is now pinned to a long-lived `lovable` branch instead
(Lovable → Project settings → Git → GitHub → branch picker), so edits collect
there and reach `main` only through a reviewed pull request.

**Do not delete the `lovable` branch, and do not point Lovable back at `main`.**

After a Lovable pull request merges, the branch is behind and Lovable would keep
editing a stale base. Fast-forward it:

```bash
git fetch origin; git push origin origin/main:refs/heads/lovable
```

If that push is refused, the branch has commits that never made it into `main` —
usually an edit someone forgot to raise a pull request for. Look before forcing
it.

Two things to know about the picker: Lovable syncs exactly one branch at a time,
and a branch created from within Lovable forks from whatever branch is currently
active rather than from `main`.


