# Backups

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Backups, because the Free plan has none
`scripts/backup-supabase.ps1` runs weekly (Mondays 12:00) through Task
Scheduler, registered by `scripts/register-backup-task.ps1`. It was monthly
until 25 Nov 2026; a week is now the most rating data that can be lost. Two dumps, deliberately kept apart:

- **community** — public schema only, no auth, no password hashes, no
  addresses. Goes to OneDrive, so it survives the laptop.
- **full** — everything including `auth`: bcrypt hashes and live refresh
  tokens. Stays on the machine. Treat it as a credential store; never commit
  it, never sync it, never paste it anywhere.

The irreplaceable half is the community data. Accounts can be recreated; other
people's ratings cannot.

The task runs only while signed in — storing a Windows password with it is not
a trade worth making — so `backup.log` beside the full dump records each run.

**Changing the schedule or the scripts' location needs a re-register.** Task
Scheduler stores the command line, not the script, so after pulling a change to
the schedule run `scripts/register-backup-task.ps1` once from the **main
checkout** (never a worktree: the path it registers must outlive the session).
It removes the old monthly task if it is still there.

### The heartbeat, so a silent stop is noticed
Everything above lives on the laptop, so a laptop that is off, signed out or
gone stops the backup *and* the thing watching it, and nobody hears. So after
the community dump succeeds the script sets the repository variable
`LAST_BACKUP_AT` (UTC, ISO 8601) with `gh variable set` — `gh` is already
signed in here, and the variable holds a timestamp and nothing else, so no
database credential goes anywhere near CI.

`.github/workflows/backup-heartbeat.yml` reads it daily and opens an issue
labelled `backup` when it is missing or older than ten days, and closes it once
a fresh one appears. See `ci-workflows.md`.

Recording the heartbeat never fails the backup. If `gh` is missing or signed
out, the log gets a `WARN  Heartbeat not recorded: ...` line and the run still
finishes; the GitHub issue then fires even though the dump is fine, and that
line is what tells the two apart. `gh auth status` fixes it.

Check it by hand with `gh variable get LAST_BACKUP_AT`.

Retention is asymmetric, and deliberately so: `-KeepCommunity` holds twelve
months (52 weekly dumps), `-KeepFull` holds three (13). A year of ratings is the thing worth having a
year of, while an old full dump is a year-old credential store carrying bcrypt
hashes and refresh tokens that recover nothing the newest one cannot. Pruning
runs only after a dump succeeds, so a failed week never deletes the copy it
failed to replace. The counts were 12 and 3 while the backup was monthly; a
schedule change has to change them with it.

`check-backup-health.ps1` reads that log weekly, half an hour after the
backup, and interrupts you when something is wrong; past ten days without a
dump counts as stale, the same threshold as the GitHub watcher. It asks Task Scheduler what the task actually did rather
than inferring it from the age of a dump: "may not be running" used to be
appended to every stale-backup warning, and on 23 Nov 2026 it was wrong —
the task had fired on 1 Oct and 1 Nov exactly on time and failed both times.

### When the backup cannot start Docker
The dumps shell `pg_dump` into a container, so the script needs Docker and
starts Docker Desktop itself when it is down. Two separate things have broken
that, and they look alike in `backup.log` until you read the timestamps.

**A failure two seconds in, quoting docker's own connection error, is the
script.** That was a `docker info *> $null` whose redirected stderr became a
terminating error under `ErrorActionPreference = "Stop"`, so the check threw
instead of returning false and the auto-start below it was unreachable. Fixed
by `Test-DockerReady`; the trap is written out beside it, and in `Invoke-Dump`,
which met the same thing first. A real Docker problem reads `Docker did not
become ready within five minutes` instead, five minutes in.

**Docker Desktop refusing to start at all is the socket trap.** It binds
AF_UNIX sockets and removes the previous one first, and on this machine Windows
cannot remove them: every API answers error 1920, "The file cannot be accessed
by the system." So one unclean shutdown leaves a file no later start can clear,
and Docker crashes on boot from then on. On 23 Nov 2026 the leftovers were
dated 23 Aug and the backups had been failing since 1 Oct.

Three things that cost an afternoon:

- **There are two locations, and both must be clean at once.** Clearing
  `%LOCALAPPDATA%\Docker\run` only moved the crash from the Ingest server to
  the Secrets Engine in `%LOCALAPPDATA%\docker-secrets-engine`.
- **Renaming the directory aside is the only removal that works**, because it
  never opens the files inside. `Remove-Item`, `[System.IO.File]::Delete`,
  `fsutil`, `cmd rd`, `rm -rf` from WSL and `robocopy /MIR` all fail with the
  same 1920 — the last of those is worth knowing because a mirror from an empty
  directory is the usual answer to a file Windows will not delete, and here it
  reports the socket and leaves it. The renamed folders cannot be deleted
  afterwards either, and **a reboot does not free them**: retried on 24 Nov 2026
  on a machine fifteen minutes up, with the same error from every method. They
  are inert and hold nothing — one 0-byte socket each — and Docker ignores them,
  so leave them rather than spending the afternoon again.
- **A clean `docker desktop stop` is not reliable cleanup.** It removed the
  sockets once and left all five behind on the next stop an hour later.

So the recipe, when the crash dialog appears or the log says Docker never
became ready:

```powershell
# quit Docker first - Stop-Process on com.docker.* and "Docker Desktop" will do
wsl --shutdown
Rename-Item "$env:LOCALAPPDATA\Docker\run" "run.stale"
Rename-Item "$env:LOCALAPPDATA\docker-secrets-engine" "docker-secrets-engine.stale"
```

Then start Docker Desktop. It recreates both directories and comes up in about
thirty seconds from cold.

**Do not click "Reset to factory defaults" on that dialog.** It sits right
beside Quit, and it discards the local Supabase stack along with every other
image and volume. Nothing above needs it.

