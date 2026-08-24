<#
.SYNOPSIS
  Says nothing while the backups are healthy, and interrupts you when they are not.

.DESCRIPTION
  A calendar reminder to "go and check the log" fires whether or not anything
  is wrong, which teaches you to dismiss it, and still depends on you actually
  looking. This looks instead, and only speaks when there is something to say.

  Two ways the monthly backup can fail quietly:

    it never ran      the task only runs while signed in, so a laptop that was
                      off or logged out around the 1st simply skips. Nothing
                      errors; the newest dump just gets older.

    it ran and failed Docker was not up, the dump came back empty, the link
                      expired. backup-supabase.ps1 logs that, but a log nobody
                      reads is not a signal.

  Checked weekly rather than monthly so a miss surfaces within days, and with a
  generous age threshold so a backup that ran late does not cry wolf.

.NOTES
  Registered by register-backup-task.ps1 alongside the backup itself.
#>

[CmdletBinding()]
param(
  [string]$CommunityDir = "$env:OneDrive\Projects\Milk Me Not\Backups",
  [string]$FullDir      = "$env:USERPROFILE\Backups\milk-me-not",
  # Monthly backups, StartWhenAvailable, a laptop that travels. Past forty days
  # something is actually wrong rather than merely late.
  [int]$MaxAgeDays      = 40,
  # Print the verdict instead of only complaining. For running it by hand.
  [switch]$Report,
  # Skip the dialog and report through the exit code alone. For a headless run,
  # and for checking that the unhappy path works without blocking on a modal.
  [switch]$NoDialog
)

$ErrorActionPreference = "Stop"
$problems = @()

function Get-Newest {
  param([string]$Dir, [string]$Pattern)
  if (-not (Test-Path $Dir)) { return $null }
  Get-ChildItem -Path $Dir -Filter $Pattern -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
}

$community = Get-Newest -Dir $CommunityDir -Pattern "community-data-*.sql"
$full      = Get-Newest -Dir $FullDir      -Pattern "full-data-*.sql"

if (-not $community) {
  $problems += "No community backup found in $CommunityDir."
} else {
  $age = [int]((Get-Date) - $community.LastWriteTime).TotalDays
  if ($age -gt $MaxAgeDays) {
    $problems += "Community backup is $age days old ($($community.Name)). The monthly task may not be running."
  }
  # A dump that failed after creating the file leaves it tiny.
  if ($community.Length -lt 10KB) {
    $problems += "Community backup is only $([int]($community.Length/1KB)) KB - too small to be real."
  }
}

if (-not $full) {
  $problems += "No full backup found in $FullDir."
}

# The log is the only record that the task fired at all, since it runs
# unattended and Task Scheduler forgets older results.
$logFile = Join-Path $FullDir "backup.log"
if (Test-Path $logFile) {
  $tail = Get-Content $logFile -Tail 12 -ErrorAction SilentlyContinue
  $lastStart = ($tail | Select-String "backup starting" | Select-Object -Last 1)
  $lastEnd   = ($tail | Select-String "backup finished" | Select-Object -Last 1)
  if ($tail -match "ERROR" -and (-not $lastEnd -or ($lastStart -and $lastEnd -and $tail.IndexOf($lastEnd.Line) -lt $tail.IndexOf($lastStart.Line)))) {
    $problems += "The last backup run logged an error. See $logFile."
  }
} else {
  $problems += "No backup.log at $logFile - the task may never have run."
}

if ($Report) {
  "Community: " + $(if ($community) { "$($community.Name), $([int]((Get-Date) - $community.LastWriteTime).TotalDays) days old, $([int]($community.Length/1KB)) KB" } else { "MISSING" })
  "Full:      " + $(if ($full) { "$($full.Name), $([int]((Get-Date) - $full.LastWriteTime).TotalDays) days old, $([int]($full.Length/1KB)) KB" } else { "MISSING" })
  "Verdict:   " + $(if ($problems.Count -eq 0) { "healthy" } else { "$($problems.Count) problem(s)" })
}

if ($problems.Count -eq 0) { exit 0 }

$message = "MilkMeNot backups need attention:" + [Environment]::NewLine + [Environment]::NewLine +
           (($problems | ForEach-Object { "- $_" }) -join [Environment]::NewLine) + [Environment]::NewLine + [Environment]::NewLine +
           "Run it now:  npx supabase start is not needed - just run" + [Environment]::NewLine +
           "scripts\backup-supabase.ps1 from the project folder."

Write-Warning $message

# A message box rather than a toast: toasts are missed, and the whole point is
# that this only appears when it matters.
if (-not $NoDialog) {
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show(
      $message, "MilkMeNot backups",
      [System.Windows.Forms.MessageBoxButtons]::OK,
      [System.Windows.Forms.MessageBoxIcon]::Warning) | Out-Null
  } catch {
    # No desktop session; the warning above still reaches the task log.
  }
}

exit 1
