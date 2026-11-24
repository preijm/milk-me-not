# package-lock.json and the lockfile pull request

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Do not hand-regenerate `package-lock.json`
CI writes it, currently with Node 24 — `ci.yml` holds that number, and it moves
when the dependencies stop supporting the old one. A different npm produces a
*different* file from the same command, so committing your version starts a
tug-of-war where each run reverts the other. The lockfile exists only for
Dependabot; let the workflow own it.

It was Node 20 until vitest 5 and jsdom 30 dropped that version from their
engines, at which point npm's tree builder crashed on every push to main and
the lockfile quietly stopped being refreshed. Nothing else in CI runs on Node,
so every check that matters stayed green and it went unnoticed for four days.

What a stale lockfile costs is more than drift, and it is worth knowing before
deciding this job can wait. Dependabot keeps opening pull requests against the
frozen file, so its proposals are measured from a base that no longer reflects
what an install would resolve. When the refresh finally ran, `vitest` went
5.0.0 → **5.0.2** in one step — past the 5.0.1 that an open Dependabot pull
request was offering, which Dependabot then closed itself as "no longer
updatable". So the first refresh after an outage is a real dependency change
wearing a `chore:` subject, not a reformat. Read what moved in it.

## The lockfile pull request needs its own identity
GitHub will not start a workflow for an event created with `GITHUB_TOKEN` — a
deliberate guard against a workflow triggering itself. So the pull request the
lockfile job opens never triggered CI or CodeQL, and `main` requires four
checks: #166 sat with **zero** reported, and the job's own `--auto` merge
waited on results that could not arrive. Every push to main that moved the
lockfile refreshed a pull request that could never merge.

Nothing fixes this from inside the job. One of the four required contexts is
CodeQL, and reporting a synthetic pass for a security analysis that never ran
is not a trade worth making.

So it wants a GitHub App installation token. Create an app with **Contents:
read & write** and **Pull requests: read & write**, install it on this
repository, then set:

- `LOCKFILE_APP_ID` — a repository **variable**, not a secret, because a step
  `if:` cannot read secrets.
- `LOCKFILE_APP_PRIVATE_KEY` — a repository secret holding the app's PEM.

Both the force-push and the `gh pr create` go through that token; doing only
the second leaves a later `synchronize` unchecked, which is the same dead end
one step along.

**Rewriting the remote URL is not enough to make the push the app's**, and it
fails in the way that is hardest to notice: it looks like it worked. `actions/
checkout` persists its own `GITHUB_TOKEN` for github.com — an `http.extraheader`
plus an `includeIf` credentials file — and that outranks credentials embedded in
a remote URL, so `git remote set-url origin https://x-access-token:$APP@...`
pushes as `github-actions[bot]` anyway. The checkout in that job therefore sets
`persist-credentials: false`, which leaves the URL as the only credential in
play.

That was invisible for weeks because the pull request is merged and its branch
deleted every round, so the event was always `opened` — attributed to whoever
called `gh pr create`, which genuinely is the app. It surfaced on 2026-08-30
(#256) when two pushes to main landed 90 seconds apart, the second run
force-pushed onto a pull request that was still open, and that `synchronize`
parked all four required checks on "waiting for approval" — which report nothing
anywhere on their own, and are exactly what `health-check.yml` looks for.

**Set both or neither.** The job checks for the variable *and* the key before
minting anything, because the id is the easy half to add and an id with no key
sends `create-github-app-token` after a PEM that is not there — turning this
job red on every push to main. Red main is a signal people stop reading.
Configured neither way, it opens nothing and logs a warning rather than
failing: a stale lockfile is a smaller problem than a broken build.


