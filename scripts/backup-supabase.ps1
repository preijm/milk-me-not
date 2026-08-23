<#
.SYNOPSIS
  Dumps the production database to two files and prunes old ones.

.DESCRIPTION
  Two dumps, because they belong in different places:

    community-data-<date>.sql  public schema only. No auth, no password
                               hashes, no email addresses - the same facts the
                               website already shows. Goes to OneDrive, so it
                               survives this laptop.

    full-data-<date>.sql       everything, auth included: bcrypt hashes, live
                               refresh tokens, addresses. Stays on this machine
                               only. Treat it like a password store.

  The irreplaceable half is the community data: accounts can be recreated,
  a year of people's ratings cannot.

  Needs Docker running - the Supabase CLI shells pg_dump into a container - and
  needs this checkout to have been linked once with `supabase link`. Both are
  checked before anything is dumped, so a failure says why rather than leaving
  a zero-byte file behind.

.NOTES
  Register it with scripts/register-backup-task.ps1. Run it by hand any time.
#>

[CmdletBinding()]
param(
  # Where the safe-to-sync dump goes.
  [string]$CommunityDir = "$env:OneDrive\Projects\Milk Me Not\Backups",
  # Where the sensitive dump goes. Deliberately not a synced folder.
  [string]$FullDir      = "$env:USERPROFILE\Backups\milk-me-not",
  # Monthly, so twelve is a year.
  [int]$Keep            = 12,
  # Skip the sensitive dump if you only want the community data.
  [switch]$CommunityOnly
)

$ErrorActionPreference = "Stop"
$repo    = Split-Path -Parent $PSScriptRoot
$logFile = Join-Path $FullDir "backup.log"
$stamp   = Get-Date -Format "yyyyMMdd"
$cli     = "supabase@2.115.0"

function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $line = "{0}  {1,-5}  {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level, $Message
  Write-Host $line
  try { Add-Content -Path $logFile -Value $line -Encoding utf8 } catch { }
}

function Assert-Docker {
  # Docker Desktop puts its CLI here but does not always put it on PATH for
  # non-interactive sessions, which is exactly how a scheduled task runs.
  $bin = "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin"
  if ((Test-Path $bin) -and ($env:Path -notlike "*$bin*")) { $env:Path += ";$bin" }

  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker CLI not found. Docker Desktop must be installed."
  }

  docker info *> $null
  if ($LASTEXITCODE -eq 0) { return }

  Write-Log "Docker is not running; starting Docker Desktop." "WARN"
  $exe = "$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe"
  if (-not (Test-Path $exe)) { throw "Docker is not running and Docker Desktop was not found at $exe." }
  Start-Process $exe | Out-Null

  # Cold start is slow, and a scheduled run has nobody watching it.
  foreach ($i in 1..60) {
    Start-Sleep -Seconds 5
    docker info *> $null
    if ($LASTEXITCODE -eq 0) { Write-Log "Docker ready after $($i * 5)s."; return }
  }
  throw "Docker did not become ready within five minutes."
}

function Invoke-Dump {
  param([string]$Path, [string[]]$ExtraArgs, [string]$What)

  # Not $args: that is an automatic variable inside a function.
  $dumpArgs = @("--yes", $cli, "db", "dump", "--linked") + $ExtraArgs + @("-f", $Path)

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

function Remove-OldBackups {
  param([string]$Dir, [string]$Pattern)
  $old = Get-ChildItem -Path $Dir -Filter $Pattern -ErrorAction SilentlyContinue |
         Sort-Object LastWriteTime -Descending | Select-Object -Skip $Keep
  foreach ($f in $old) {
    Remove-Item $f.FullName -Force
    Write-Log "Pruned $($f.Name)."
  }
}

try {
  New-Item -ItemType Directory -Force -Path $CommunityDir, $FullDir | Out-Null
  Write-Log "=== backup starting ==="

  if (-not (Test-Path (Join-Path $repo "supabase\config.toml"))) {
    throw "No supabase/config.toml at $repo - run this from the project checkout."
  }
  Assert-Docker
  Push-Location $repo

  Invoke-Dump -Path (Join-Path $CommunityDir "community-data-$stamp.sql") `
              -ExtraArgs @("--data-only", "--schema", "public") `
              -What "Community data"

  if (-not $CommunityOnly) {
    Invoke-Dump -Path (Join-Path $FullDir "full-data-$stamp.sql") `
                -ExtraArgs @("--data-only") `
                -What "Full data (sensitive)"
  }

  Remove-OldBackups -Dir $CommunityDir -Pattern "community-data-*.sql"
  Remove-OldBackups -Dir $FullDir      -Pattern "full-data-*.sql"

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
