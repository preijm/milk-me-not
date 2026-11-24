# CI workflows

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Workflows (`.github/workflows/`)
Eight, not one:

- **`ci.yml`** — three sequential stages, **Lint + Type Check → Test → Build**, on
  every PR and push to main. Uses Bun. Cancels in-progress runs on new push.
  A fourth job, **Refresh lockfiles**, regenerates `package-lock.json` for
  Dependabot — but only on a push to main, never on a pull request. That guard
  is load-bearing and is explained in the job's own comment: it used to live
  inside the first job and push to the branch under test, which meant the
  checks reported on a commit that was no longer the head, and a bot commit on
  a Dependabot branch made Dependabot disown the PR and stop rebasing it.
- **`deploy.yml`** — see `deployment.md`.
- **`codeql.yml`** — static analysis on PRs, pushes to main, and weekly.
- **`release.yml`** — cuts a version tag and a GitHub Release, **on request
  only**: run it from the Actions tab. It fired on every push to main once, and
  since every GitHub Release emails everyone watching, that was 34 releases and
  34 emails in three days — with a version number that meant nothing, because
  adding a test file got the same bump as a feature. Nothing is lost by waiting:
  main deploys on every push regardless, so releasing marks a point rather than
  shipping one.
  It reads the *highest* `v*` tag rather than the newest one `git describe` can
  reach, because `v0.1.0` sits on a `chore(release)` commit that never landed
  on main: describe found nothing, fell back to package.json, recomputed
  `0.1.0`, saw that tag already existed and skipped — every push for months,
  green every time. It tags the commit already on main and pushes only the tag;
  it does not commit, because `main` is protected against the bot, because a
  push to main would retrigger this job, and because the notes quote commit
  subjects that contain the skip marker. `CHANGELOG.md` is hand-written.
- **`auto-merge.yml`** — turns auto-merge on for every non-draft pull request
  into main. It merges nothing itself; it asks GitHub to merge once the four
  required checks pass, so a red pull request still cannot land. Stop it with a
  draft, or with the `hold` label. It uses the app token rather than
  `GITHUB_TOKEN` on purpose: whoever enables auto-merge is recorded as merging
  it later, and a push to main from `GITHUB_TOKEN` starts no workflows — so the
  built-in token could land a merge that never deploys.
- **`alert-on-failure.yml`** — opens an issue when CI, Deploy, CodeQL,
  Release or Health check fails **on main**. GitHub sends run notifications
  to whoever triggered the run, and auto-merge lands pull requests through
  the app, so a
  failed deploy emails `milkmenot-lockfile[bot]` and nobody else. An issue
  notifies regardless and persists until closed. One issue per workflow,
  commented rather than duplicated; main only, since a failing pull request is
  already visible on the pull request.

  **`Health check` needed care to add, because it goes red on purpose.** It
  exits 1 when it finds something, having already filed its own `health` issue
  on the way out, so watching it naively meant two issues for one problem —
  the exact noise both workflows exist to remove. What nobody was hearing
  about was the check *breaking*: since the browser test arrived it runs
  `bun install` and downloads Chromium, and a failure there left it red with
  nothing watching.

  The two are told apart by **which step failed**. The deliberate exit lives
  in `Say something if it is not`, so a run whose only failed step is that one
  is already reported; anything else is the check falling over. There is no
  cleaner signal — a workflow has no way to say "I failed on purpose" that
  survives into `workflow_run`. A run with no named failed step at all, a
  timeout or a dead runner, deliberately falls through and gets reported.

  That read needs **`actions: read`** in the permissions block. The block is
  explicit, so the token gets only what is listed, and without it the API
  call for the run's steps fails.
- **`health-check.yml`** — every six hours, asks the live site whether it is
  alright: does it still serve the app, and is the build it serves the one main
  is on. A deploy that fails leaves the site working and stale, which is the
  failure that looks like success — and is how the update banner stayed broken
  from January to August with every check green. It skips the build comparison
  while a deploy is in flight, and also reports runs parked on "waiting for
  approval", which report nothing anywhere on their own.

  **It closes its own issue once a run finds nothing.** It used only to open
  and comment, so a fixed problem sat there looking exactly like a live one —
  #287 stayed open for six weeks after the deploy it described had landed, and
  #256 before it. An alert that cannot tell those apart gets read as noise, and
  then the next real one does too.

  Two things that keep that honest. The close is gated on no deploy being in
  flight as well as on no problems, because an empty problem list is not the
  same as a full check: the build comparison is the part that gets skipped.
  And **a new check belongs in the `Did anything turn up` step and nowhere
  else** — filing and closing read that one answer rather than each carrying a
  copy of the list, so a check wired into the filing side alone would file an
  issue that the closing side retired six hours later, for ever.

  That is not hypothetical. The browser check arrived from another branch
  within the hour, wired into the filing step's own condition, and the two
  landed as a merge conflict on exactly that line. Resolved the obvious way —
  keeping the incoming condition — a passing `curl` would have closed every
  issue the smoke test opened.

  **Finding the issue is a list by label, not a search.** `--search` goes
  through GitHub's search API, which is indexed a moment behind the issue
  itself, so a dispatch straight after one is filed closes nothing. Six hours
  between scheduled runs hides it; the throwaway issue it was tested with did
  not. The same lag made a `gh issue list` immediately after a close report the
  issue as still open, so do not trust either to be fresh.
- **`sync-labels.yml`** — applies `.github/labels.yml`. Only fires on a push to
  main that touches that file, so editing it is what deploys it. It runs
  `delete-other-labels: true`: a label removed from the file is removed from
  the repository.


