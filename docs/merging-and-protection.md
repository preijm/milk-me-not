# Merging, owned paths and branch protection

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Three paths do not auto-merge
Everything else does. Tests, components, copy and styling land the moment the
checks go green, because the checks are a better reviewer for those than a
tired person at eleven at night, and anything they miss is a redeploy away.

`/supabase/`, `/.github/` and `/public/_headers` are not that. A migration runs
once against real data, `.github/` can quietly switch off everything that would
have caught a change to `.github/`, and a loosened CSP fails nothing and tells
nobody. Those wait for the **`reviewed`** label.

**GitHub's own "require review from code owners" does not do this**, and it
fails silently rather than loudly. It is inert unless
`required_approving_review_count` is at least 1 — a probe pull request touching
`.github/` merged itself with the rule active and the count at zero — and
setting the count to 1 demands an approval on *every* pull request, which is
auto-merge off for the whole repository. There is also no approving your own
pull request, and this repository has one maintainer, so peer review was never
the achievable thing.

`owned-paths.yml` is what actually gates. It reads the patterns out of
CODEOWNERS, so that file stays the single list and GitHub's own interface
agrees with the check by construction. What it buys is not review: it is that a
change to those three paths stops and waits to be merged on purpose, rather
than landing at three in the morning because the tests happened to pass.

## `main` is protected
Two rulesets apply to it, both with a repository-admin bypass:

- **checks must pass** — `Lint & Type Check`, `Test`, `Build`, `CodeQL` and
  `Browser tests` must be green before a pull request merges.
- **delforcepush** — no deletion, no force-push.

Auto-merge is enabled, so `gh pr merge --auto` genuinely queues until the checks
pass rather than merging immediately. Before it was enabled, `--auto` silently
fell through to an instant merge, which is how a pull request once landed with
its checks still running.


## Never write the CI skip marker into a commit message
GitHub scans the whole commit message, not just the subject. A commit that
merely *discusses* the marker skips its own workflows — which happened here to
the very commit that fixed the job it was describing. Write "skip-ci marker"
in prose, and remember a squash-merge turns a PR body into a commit message
too.


