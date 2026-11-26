# Worktrees and tidying branches

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Work in a worktree

**Start every session by calling `EnterWorktree`.** Not optional, and not only
for big changes.

More than one agent works in this repository at once, and they were sharing a
single checkout. In one afternoon that went wrong three times: a branch was
switched out from under a session mid-task, a `git add -A` swept another
session's half-finished Google sign-in into an unrelated commit, and a third
commit landed on somebody else's branch entirely. Each was recoverable, and each
was only caught because someone read the diff before pushing. That is not a
safeguard, that is luck.

A worktree is its own directory and its own branch against the same repository,
so none of that can happen. It costs a few seconds.

```
EnterWorktree             # branches from origin/main, switches the session in
ExitWorktree keep         # leave it on disk to come back to
ExitWorktree remove       # done with it
```

They live in `.claude/worktrees/`, which is gitignored, so they never show up in
`git status` or in a commit. Two things to know: a fresh worktree has no
`node_modules`, so run `bun install` before tests; and the branch is created
from `origin/main` rather than from whatever the main checkout happens to have
checked out, which is usually what you want and occasionally is not.

The one exception is a task that is genuinely about the working copy itself —
inspecting what another session has left uncommitted, say. Then stay put, and
touch nothing you did not put there.

## A broken worktree fails silently, not loudly
`.claude/worktrees/` sits *inside* the repository, so a worktree that loses its
`.git` file does not stop working. Git walks up, finds the main checkout's
`.git`, and every command quietly operates on **that** instead. `git status`
reports the main checkout's cleanliness, `git rev-parse --abbrev-ref HEAD`
answers `main`, and nothing anywhere says the worktree is gone. On 25 Sep 2026
a session read "working tree clean" off a worktree whose link had been deleted —
the answer happened to be correct, and was measuring the wrong directory.

Two checks tell them apart:

```bash
git rev-parse --git-dir   # .git/worktrees/<name> when live, the main .git when not
git worktree list         # a dead one is marked `prunable`
```

`git worktree prune` clears the stale registration, and only ever removes
entries whose gitdir is already missing, so it cannot touch a live worktree.

Deleting a worktree directory that a session is still sitting in half-succeeds
on Windows: the contents go, the folder does not, because it is a process's
working directory. What is left is an empty folder and a session that can no
longer read a single project file. Move out first, or delete it once the
session has ended.

## Tidying up branches

Cleaning up merged branches here needs more care than it looks like, for two
reasons that both bite silently.

**`git branch --merged` is useless in this repository.** Pull requests are
squash-merged, so the commit that lands on `main` is not the one on the branch
and git reports almost every finished branch as unmerged. A sweep on 20 Sep
2026 found 4 branches "merged" and 25 "not", when in truth 24 of the 25 were
finished. Ask GitHub instead: compare the branch tip against the `headRefOid`
of its merged PR (`gh pr list --state merged --json number,headRefName,headRefOid`).
Where the tip has moved on since the merge, check whether the files it touches
are already identical on `main` before assuming there is work to save — in the
one case where they had, all but a README were byte-for-byte the same, and the
README differed only because later PRs had edited it.

**Three branches must survive any cleanup**, and none of them look special:

| Branch | Why |
|--------|-----|
| `chore/lockfile-refresh` | CI pushes to it **by name** — see `BRANCH=chore/lockfile-refresh` in `.github/workflows/ci.yml`. It is often a commit ahead of `main` with a refresh that has not been opened as a PR yet. |
| `lovable` | The Lovable integration's branch. It reads as pure clutter — fully contained in `main`, a hundred commits behind — but it is not ours to delete, and removing it may break that sync. |
| `dependabot/*` | Anything with an open PR. |

**GitHub now does the routine half of this for you**, and one bite is still
left. "Automatically delete head branches" was turned on on 26 November 2026:
the sweep on 25 November took the remote from 18 branches to 6, and six merges
the next morning put it back to 17, which is not a job worth doing by hand. A
merged pull request's head branch now goes on its own, so a manual sweep is
only for branches that were abandoned without ever merging — exactly the ones
`headRefOid` cannot vouch for, so read the table above before removing any of
them. The setting fires only on merge and never while a pull request is open,
which leaves `chore/lockfile-refresh` and `dependabot/*` alone. It does not
leave `lovable` alone: merge a pull request from that branch and GitHub deletes
it. Recreate it immediately — `docs/lovable.md` has the command and the
recovery if the push is refused.

**A worktree branch may be holding the only copy of something.** The worktrees
in `.claude/worktrees/` are gitignored, so uncommitted work in one is invisible
from the main checkout and invisible to `git status`. On that same sweep, one
held an untracked `scripts/prune-orphan-photos.ts` that existed nowhere else,
and another held seven modified files plus a new test. `git worktree remove
--force` would have taken all of it. Run `git -C .claude/worktrees/<name>
status --porcelain` on each one first, and only remove the ones that come back
empty.


