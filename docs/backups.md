# Backups

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Backups, because the Free plan has none
`scripts/backup-supabase.ps1` runs monthly through Task Scheduler, registered
by `scripts/register-backup-task.ps1`. Two dumps, deliberately kept apart:

- **community** — public schema only, no auth, no password hashes, no
  addresses. Goes to OneDrive, so it survives the laptop.
- **full** — everything including `auth`: bcrypt hashes and live refresh
  tokens. Stays on the machine. Treat it as a credential store; never commit
  it, never sync it, never paste it anywhere.

The irreplaceable half is the community data. Accounts can be recreated; other
people's ratings cannot.

The task runs only while signed in — storing a Windows password with it is not
a trade worth making — so `backup.log` beside the full dump is what tells you
it is still firing.

Retention is asymmetric, and deliberately so: `-KeepCommunity` holds twelve
months, `-KeepFull` holds three. A year of ratings is the thing worth having a
year of, while an old full dump is a year-old credential store carrying bcrypt
hashes and refresh tokens that recover nothing the newest one cannot. Pruning
runs only after a dump succeeds, so a failed month never deletes the copy it
failed to replace.

`check-backup-health.ps1` reads that log weekly and interrupts you when
something is wrong. It asks Task Scheduler what the task actually did rather
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

