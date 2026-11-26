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

**Auto-delete takes this branch too.** "Automatically delete head branches" was
turned on for this repository on 26 November 2026, because merged branches were
piling up faster than anyone swept them — six in one morning — and GitHub's
setting has no exceptions list. It fires only on merge, never while a pull
request is open, so `chore/lockfile-refresh` (force-pushed fresh each round by
the lockfile job) and `dependabot/*` are unaffected. `lovable` is the one branch
it removes that has to come back: the fast-forward above recreates it, so run
that immediately after the merge instead of waiting for Lovable to fail against
a branch that is no longer there. If the fast-forward is refused, use "Restore
branch" on the merged pull request instead — it brings back the commits that
made the push refuse.

Two things to know about the picker: Lovable syncs exactly one branch at a time,
and a branch created from within Lovable forks from whatever branch is currently
active rather than from `main`.


