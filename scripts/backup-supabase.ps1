<#
.SYNOPSIS
  Dumps the production database to two files and prunes old ones.

.DESCRIPTION
  Two dumps, because they belong in different places:

    community-data-<date>.sql  public schema only, minus $CommunityExclude.
                               No auth, no credentials, no secrets, no email
                               addresses. It does hold some per-user data the
                               site never shows: notification inboxes, the
                               newsletter opt-in, a default country. Goes to
                               OneDrive, so it survives this laptop.

    full-data-<date>.sql       everything, auth included: bcrypt hashes, live
                               refresh tokens, addresses, MFA recovery code
                               hashes. Stays on this machine only. Treat it
                               like a password store.

  A new public table lands in the community dump automatically. If it holds
  anything secret, add it to $CommunityExclude in the same pull request.

  The irreplaceable half is the community data: accounts can be recreated,
  a year of people's ratings cannot.

  Needs Docker running - the Supabase CLI shells pg_dump into a container - and
  needs this checkout to have been linked once with `supabase link`. Both are
  checked before anything is dumped, so a failure says why rather than leaving
  a zero-byte file behind.

  Once the community dump is written, it records a heartbeat: the repository
  variable LAST_BACKUP_AT, set with the gh CLI that is already signed in on
  this laptop. backup-heartbeat.yml reads it daily and opens an issue when it
  goes stale, which is what makes a backup that silently stopped running
  visible from outside this machine. Failing to record it is logged as a
  warning and never fails the backup.

  Then it mirrors the photos, which no database dump contains: every file the
  community dump points at, downloaded from the public Storage URLs into
  <CommunityDir>\photos\<bucket>\<path>. No credential, because all three
  buckets are public. A file already in the mirror is not fetched again (the
  one exception is avatars, see Sync-Photos), and nothing is ever pruned from
  it. Like the heartbeat, a failure here is a WARN and never fails the backup.
  scripts/restore-photos.ts uploads the mirror back.

.NOTES
  Register it with scripts/register-backup-task.ps1. Run it by hand any time.
#>

[CmdletBinding()]
param(
  # Where the safe-to-sync dump goes.
  [string]$CommunityDir = "$env:OneDrive\Projects\Milk Me Not\Backups",
  # Where the sensitive dump goes. Deliberately not a synced folder.
  [string]$FullDir      = "$env:USERPROFILE\Backups\milk-me-not",
  # Weekly, so fifty-two is a year of the half worth keeping a year of.
  [int]$KeepCommunity   = 52,
  # The full dump is a credential store: bcrypt hashes and live refresh tokens.
  # An old one carries no recovery value the newest does not, so it keeps a
  # short tail rather than a year: thirteen weeks is three months. Shrinking
  # this deletes nothing you can miss.
  [int]$KeepFull        = 13,
  # Skip the sensitive dump if you only want the community data.
  [switch]$CommunityOnly,
  # Only mirror the photos, from the newest community dump already on disk: no
  # dump, no Docker, no heartbeat. For catching up by hand.
  [switch]$PhotosOnly
)

$ErrorActionPreference = "Stop"
$repo    = Split-Path -Parent $PSScriptRoot
$logFile = Join-Path $FullDir "backup.log"
$stamp   = Get-Date -Format "yyyyMMdd"
# Pinned so a CLI release cannot change the backup under a scheduled task that
# nobody watches. v3 was checked against v2 on 26 Nov 2026: both dumps came
# out the same size and line count to the byte. Bump it the same way.
$cli     = "supabase@3.4.0"
# Where the heartbeat goes. Named rather than inferred from the git remote, so
# a checkout with an odd remote cannot quietly write it somewhere else.
$heartbeatRepo = "preijm/milk-me-not"
# public tables kept out of the synced dump. They stay in the full dump.
#   mfa_recovery_codes  was unsalted sha256 of 48-bit codes, crackable in
#                       hours; in OneDrive from 6 Oct 2026 until 26 Nov 2026.
#                       Now HMAC'd with a Vault pepper the dump does not hold,
#                       and the old rows were deleted. Kept out regardless.
#   security_log        admin-only audit trail with ip_address and user_agent
#                       columns. Empty when this was written; kept out before
#                       it fills.
# One -x per table: the CLI takes the flag repeatedly.
$CommunityExclude = @("public.mfa_recovery_codes", "public.security_log")

function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $line = "{0}  {1,-5}  {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level, $Message
  Write-Host $line
  try { Add-Content -Path $logFile -Value $line -Encoding utf8 } catch { }
}

function Test-DockerReady {
  # Is the daemon up? Answered as a boolean rather than inline, because asking
  # is the part that used to break the script.
  #
  # `docker info` writes to stderr when the daemon is down, and Windows
  # PowerShell wraps a *redirected* native stderr in a NativeCommandError
  # record. Under this script's ErrorActionPreference of "Stop" that record is
  # a terminating error, so `docker info *> $null` threw instead of setting
  # $LASTEXITCODE - on the one code path whose whole job is to handle a stopped
  # daemon. The backups of 1 Oct and 1 Nov 2026 both died here two seconds in,
  # reporting docker's own connection error, and the auto-start below was never
  # reached. Sep 1 passed only because Docker happened to already be running.
  #
  # Same trap Invoke-Dump documents below; it was fixed there and missed here.
  # The local assignment shadows the script-level preference for this call only.
  $ErrorActionPreference = "Continue"
  docker info *> $null
  return ($LASTEXITCODE -eq 0)
}

function Assert-Docker {
  # Docker Desktop puts its CLI here but does not always put it on PATH for
  # non-interactive sessions, which is exactly how a scheduled task runs.
  $bin = "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin"
  if ((Test-Path $bin) -and ($env:Path -notlike "*$bin*")) { $env:Path += ";$bin" }

  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker CLI not found. Docker Desktop must be installed."
  }

  if (Test-DockerReady) { return }

  Write-Log "Docker is not running; starting Docker Desktop." "WARN"
  $exe = "$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe"
  if (-not (Test-Path $exe)) { throw "Docker is not running and Docker Desktop was not found at $exe." }
  Start-Process $exe | Out-Null

  # Cold start is slow, and a scheduled run has nobody watching it.
  foreach ($i in 1..60) {
    Start-Sleep -Seconds 5
    if (Test-DockerReady) { Write-Log "Docker ready after $($i * 5)s."; return }
  }
  throw "Docker did not become ready within five minutes."
}

function Invoke-Dump {
  param([string]$Path, [string[]]$ExtraArgs, [string]$What)

  # Not $args: that is an automatic variable inside a function.
  # --remote is the linked project. Since CLI v3 every db command targets the
  # LOCAL database unless told otherwise; --linked still works as an alias
  # until v4, but this must never silently dump the local stack instead.
  $dumpArgs = @("--yes", $cli, "db", "dump", "--remote") + $ExtraArgs + @("-f", $Path)

  # No 2>&1 here. Windows PowerShell turns a native command's stderr into
  # error records when you redirect it, and with ErrorActionPreference = Stop
  # the CLI's own progress chatter ("Initialising login role...") becomes a
  # thrown exception. Let stderr go to the console and judge the run by its
  # exit code and the file it produced.
  & npx @dumpArgs | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "$What dump failed: npx exited $LASTEXITCODE." }

  if (-not (Test-Path $Path)) { throw "$What dump produced no file." }
  $size = (Get-Item $Path).Length
  # A dump that fails after creating the file leaves it empty; that has
  # happened here before, so size is checked rather than assumed.
  if ($size -lt 10KB) {
    Remove-Item $Path -Force
    throw "$What dump was only $size bytes; removed it rather than keep a broken backup."
  }
  Write-Log ("{0}: {1} ({2:N0} KB)" -f $What, (Split-Path $Path -Leaf), ($size / 1KB))
}

function Set-Heartbeat {
  # Tells GitHub a community dump just landed, so backup-heartbeat.yml can
  # notice when they stop. A repository variable rather than a file or a
  # commit: Actions reads it as ${{ vars.LAST_BACKUP_AT }} with no token and no
  # new secret, and gh is already signed in here.
  #
  # Nothing in here may fail the backup. The dump is on disk whether or not
  # GitHub heard about it, so every failure is a WARN in the log and the
  # watcher's issue tells you to look for that line.
  #
  # ErrorActionPreference is shadowed for the same reason as Test-DockerReady:
  # under "Stop", gh's stderr becomes a terminating error the moment anything
  # redirects it. Nothing is redirected here, but the catch is the backstop.
  $ErrorActionPreference = "Continue"
  try {
    $gh = (Get-Command gh -ErrorAction SilentlyContinue).Source
    # A scheduled task does not always get the PATH an interactive shell has.
    if (-not $gh -and (Test-Path "$env:ProgramFiles\GitHub CLI\gh.exe")) {
      $gh = "$env:ProgramFiles\GitHub CLI\gh.exe"
    }
    if (-not $gh) {
      Write-Log "Heartbeat not recorded: gh CLI not found. The backup itself succeeded." "WARN"
      return
    }

    $now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    & $gh variable set LAST_BACKUP_AT --repo $heartbeatRepo --body $now | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Log "Heartbeat not recorded: gh exited $LASTEXITCODE (run 'gh auth status'). The backup itself succeeded." "WARN"
      return
    }
    Write-Log "Heartbeat recorded: LAST_BACKUP_AT = $now."
  }
  catch {
    Write-Log "Heartbeat not recorded: $($_.Exception.Message) The backup itself succeeded." "WARN"
  }
}

function Get-ProjectRef {
  # The project the dumps come from: `supabase link` writes it here, so after a
  # relink to a new project the photos follow the dumps without an edit. The
  # fallback is production's ref, for a checkout that was never linked.
  $file = Join-Path $repo "supabase\.temp\project-ref"
  if (Test-Path $file) {
    $ref = (Get-Content $file -Raw).Trim()
    if ($ref -match '^[a-z0-9]{20}$') { return $ref }
  }
  return "jtabjndnietpewvknjrm"
}

function Get-PhotoPaths {
  # Every Storage object the community dump points at, as "<bucket>/<path>".
  #
  # Read from the dump rather than listed from the bucket: listing needs the
  # service role key, and reading the ratings also skips orphan uploads, which
  # nobody needs back. The dump is multi-row INSERTs, and `notes` is free text,
  # so tuples are never split on commas; a picture path is the only value in a
  # milk_tests row shaped like "<uuid>/<file>" (user_id has no slash).
  param([string]$DumpPath)

  $sql   = [System.IO.File]::ReadAllText($DumpPath)
  $paths = New-Object System.Collections.Generic.List[string]

  # One block per INSERT, up to the next statement or pg_dump comment header.
  $block = '(?ms)^INSERT INTO "public"\."{0}" .*?(?=^INSERT INTO |^--|\z)'

  foreach ($m in [regex]::Matches($sql, ($block -f 'milk_tests'))) {
    foreach ($p in [regex]::Matches($m.Value, "'([0-9a-f]{8}-[0-9a-f-]{27}/[^'/]+)'")) {
      $path = $p.Groups[1].Value
      $paths.Add("milk-pictures/$path")
      # thumbnailPath() in src/lib/imageCompression.ts: `thumb_` in front of the
      # file name, inside the same folder (the bucket policy allows one level).
      $slash = $path.LastIndexOf('/')
      $paths.Add("milk-pictures/" + $path.Substring(0, $slash + 1) + "thumb_" + $path.Substring($slash + 1))
    }
  }

  # profiles.avatar_url is a full public URL, not a path.
  foreach ($m in [regex]::Matches($sql, ($block -f 'profiles'))) {
    foreach ($u in [regex]::Matches($m.Value, "/storage/v1/object/public/([^'?#/]+/[^'?#]+)")) {
      $paths.Add($u.Groups[1].Value)
    }
  }

  # The site logo is referenced by no table, so no dump can name it.
  $paths.Add("logos/milk-me-not-logo.png")

  return $paths | Sort-Object -Unique
}

function Sync-Photos {
  # Mirrors the photos the community dump points at into $CommunityDir\photos,
  # straight from the public Storage URLs. All three buckets are public, so it
  # needs no credential.
  #
  # Incremental: milk-pictures paths carry a timestamp and are never written
  # twice (docs/feed-photos.md), so a file already in the mirror is skipped.
  # Avatars are the exception - ProfileEditDialog upserts `<uid>/avatar.<ext>`
  # in place, so the same path can hold a newer picture - and are fetched every
  # run; there are a handful of them. Nothing is ever deleted from the mirror:
  # a deleted rating is exactly when its photo is wanted back.
  #
  # Nothing in here may fail the backup, for the same reasons as Set-Heartbeat,
  # and nothing may log the word the health check looks for: every problem is a
  # WARN and the run carries on.
  param([string]$DumpPath)

  $ErrorActionPreference = "Continue"
  # Windows PowerShell's progress bar slows Invoke-WebRequest by an order of
  # magnitude.
  $ProgressPreference = "SilentlyContinue"
  try {
    $root = Join-Path $CommunityDir "photos"
    $base = "https://$(Get-ProjectRef).supabase.co/storage/v1/object/public"
    $paths = @(Get-PhotoPaths -DumpPath $DumpPath)
    if ($paths.Count -le 1) {
      Write-Log "Photos not mirrored: no photo paths found in $(Split-Path $DumpPath -Leaf). The database backup itself succeeded." "WARN"
      return
    }

    $fetched = 0; $skipped = 0; $bytes = 0L
    $missingThumbs = 0
    $missing = New-Object System.Collections.Generic.List[string]
    $failed  = New-Object System.Collections.Generic.List[string]

    foreach ($p in $paths) {
      $segments = $p.Split('/')
      # These names come from user uploads. Refuse anything that could step
      # outside the mirror or that Windows cannot hold as a file name.
      $bad = $segments | Where-Object { $_ -eq '' -or $_ -eq '.' -or $_ -eq '..' -or $_ -match '[<>:"\\|?*\x00-\x1f]' }
      if ($bad) { $failed.Add("$p (unsafe name)"); continue }

      $local = Join-Path $root ($segments -join '\')
      $isAvatar = $segments[0] -eq 'avatars'
      if ((Test-Path -LiteralPath $local) -and -not $isAvatar) { $skipped++; continue }

      $url  = $base + '/' + (($segments | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/')
      $part = "$local.part"
      New-Item -ItemType Directory -Force -Path (Split-Path $local -Parent) | Out-Null
      try {
        Invoke-WebRequest -Uri $url -OutFile $part -UseBasicParsing -TimeoutSec 60 -ErrorAction Stop
        # Written aside and renamed, so an interrupted download is never
        # mistaken for a finished file on the next run.
        Move-Item -LiteralPath $part -Destination $local -Force
        $fetched++
        $bytes += (Get-Item -LiteralPath $local).Length
      }
      catch {
        Remove-Item -LiteralPath $part -Force -ErrorAction SilentlyContinue
        $status = 0
        if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
        # Storage answers a missing object with 400, not 404.
        if ($status -eq 400 -or $status -eq 404) {
          if ((Split-Path $p -Leaf) -like 'thumb_*') { $missingThumbs++ } else { $missing.Add($p) }
        }
        elseif ($status) { $failed.Add("$p (HTTP $status)") }
        # check-backup-health.ps1 matches that word case-insensitively, and
        # .NET puts it in most network messages ("returned an error").
        else { $failed.Add("$p ($($_.Exception.Message -replace '(?i)error', 'failure'))") }
      }
    }

    $total = @(Get-ChildItem -LiteralPath $root -Recurse -File -ErrorAction SilentlyContinue |
               Where-Object { $_.Extension -ne '.part' })
    $totalMB = ($total | Measure-Object Length -Sum).Sum / 1MB
    Write-Log ("Photos: {0} fetched ({1:N1} MB), {2} already mirrored; mirror holds {3} files, {4:N1} MB." -f `
               $fetched, ($bytes / 1MB), $skipped, $total.Count, $totalMB)

    # A thumbnail can be missing by design (FeedImage falls back to the photo),
    # so that is one INFO line, not a warning.
    if ($missingThumbs) { Write-Log "Photos: $missingThumbs thumbnail(s) not in Storage; the feed falls back to the full photo for those." }
    if ($missing.Count) {
      Write-Log ("Photos: {0} referenced file(s) not in Storage: {1}" -f $missing.Count, (($missing | Select-Object -First 5) -join ', ')) "WARN"
    }
    if ($failed.Count) {
      Write-Log ("Photos: {0} download(s) failed and will be retried next run: {1}" -f $failed.Count, (($failed | Select-Object -First 5) -join '; ')) "WARN"
    }
  }
  catch {
    Write-Log "Photos not mirrored: $($_.Exception.Message -replace '(?i)error', 'failure') The database backup itself succeeded." "WARN"
  }
}

function Remove-OldBackups {
  param([string]$Dir, [string]$Pattern, [int]$Keep)
  # Ordered by write time, not by the date in the name: a run that happens late
  # still sorts as the newest, which is the one that must survive.
  $old = Get-ChildItem -Path $Dir -Filter $Pattern -ErrorAction SilentlyContinue |
         Sort-Object LastWriteTime -Descending | Select-Object -Skip $Keep
  foreach ($f in $old) {
    Remove-Item $f.FullName -Force
    Write-Log "Pruned $($f.Name)."
  }
}

try {
  New-Item -ItemType Directory -Force -Path $CommunityDir, $FullDir | Out-Null

  if ($PhotosOnly) {
    $latest = Get-ChildItem -Path $CommunityDir -Filter "community-data-*.sql" -ErrorAction SilentlyContinue |
              Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $latest) { throw "No community dump in $CommunityDir to read photo paths from." }
    Write-Log "Photo mirror only, from $($latest.Name)."
    Sync-Photos -DumpPath $latest.FullName
    exit 0
  }

  Write-Log "=== backup starting ==="

  if (-not (Test-Path (Join-Path $repo "supabase\config.toml"))) {
    throw "No supabase/config.toml at $repo - run this from the project checkout."
  }
  Assert-Docker
  Push-Location $repo

  $communityPath = Join-Path $CommunityDir "community-data-$stamp.sql"
  Invoke-Dump -Path $communityPath `
              -ExtraArgs (@("--data-only", "--schema", "public") +
                          ($CommunityExclude | ForEach-Object { "-x", $_ })) `
              -What "Community data"

  # Straight after the community dump, not at the end: that is the half worth
  # watching from outside. A full dump failing after this still exits 1 and is
  # caught by check-backup-health.ps1 reading this log.
  Set-Heartbeat

  # Before the full dump, so -CommunityOnly mirrors too, and so a full dump
  # that fails cannot cost the week's photos. It never throws.
  Sync-Photos -DumpPath $communityPath

  if (-not $CommunityOnly) {
    Invoke-Dump -Path (Join-Path $FullDir "full-data-$stamp.sql") `
                -ExtraArgs @("--data-only") `
                -What "Full data (sensitive)"
  }

  Remove-OldBackups -Dir $CommunityDir -Pattern "community-data-*.sql" -Keep $KeepCommunity
  Remove-OldBackups -Dir $FullDir      -Pattern "full-data-*.sql"      -Keep $KeepFull

  Write-Log "=== backup finished ==="
  exit 0
}
catch {
  Write-Log $_.Exception.Message "ERROR"
  Write-Log "=== backup FAILED ===" "ERROR"
  exit 1
}
finally {
  if ((Get-Location).Path -eq $repo) { Pop-Location }
}
