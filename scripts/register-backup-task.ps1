<#
.SYNOPSIS
  Registers (or re-registers) the monthly Supabase backup and its weekly health check.

.DESCRIPTION
  Two tasks. The backup runs backup-supabase.ps1 on the 1st of each month at
  midday. The health check runs check-backup-health.ps1 every Monday and says
  nothing unless the backups have gone stale or the last run failed - a weekly
  check catches a missed month within days, where a monthly reminder would only
  tell you to go and look.

  Deliberately set to run only while you are signed in. The alternative is
  storing your Windows password with the task, and a backup is not worth
  keeping a password on disk for. The trade is that the machine has to be on
  and signed in at some point around the 1st - which StartWhenAvailable covers
  by running late rather than skipping.

  Re-run this any time; it replaces the existing task rather than duplicating.

.NOTES
  No administrator rights needed: the task belongs to the current user.
#>

[CmdletBinding()]
param(
  [string]$TaskName      = "Milk Me Not - monthly Supabase backup",
  [string]$CheckTaskName = "Milk Me Not - weekly backup health check",
  # 1st of the month. Any day works, but early means a fresh dump each month.
  [int]$DayOfMonth       = 1,
  [string]$AtTime        = "12:00",
  # Monday lunchtime, half an hour after the backup would have run on a 1st
  # that happens to be a Monday.
  [string]$CheckDay      = "MON",
  [string]$CheckTime     = "12:30"
)

$ErrorActionPreference = "Stop"
$script = Join-Path $PSScriptRoot "backup-supabase.ps1"
$check  = Join-Path $PSScriptRoot "check-backup-health.ps1"
foreach ($p in @($script, $check)) { if (-not (Test-Path $p)) { throw "Cannot find $p" } }

# Shared by both: catch up if the machine was off, and do not refuse to run
# just because the laptop is unplugged.
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -DontStopIfGoingOnBatteries `
  -AllowStartIfOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
  -MultipleInstances IgnoreNew

# schtasks is used for the triggers because New-ScheduledTaskTrigger has no
# monthly option; the settings above are then applied through the
# ScheduledTasks module.
$action = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$script`""
schtasks /Create /TN $TaskName /TR $action /SC MONTHLY /D $DayOfMonth /ST $AtTime /F | Out-Null
if ($LASTEXITCODE -ne 0) { throw "schtasks failed for the backup task (exit $LASTEXITCODE)." }
Set-ScheduledTask -TaskName $TaskName -Settings $settings | Out-Null

$checkAction = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$check`""
schtasks /Create /TN $CheckTaskName /TR $checkAction /SC WEEKLY /D $CheckDay /ST $CheckTime /F | Out-Null
if ($LASTEXITCODE -ne 0) { throw "schtasks failed for the health check task (exit $LASTEXITCODE)." }
Set-ScheduledTask -TaskName $CheckTaskName -Settings $settings | Out-Null

foreach ($n in @($TaskName, $CheckTaskName)) {
  $t = Get-ScheduledTask -TaskName $n
  $i = Get-ScheduledTaskInfo -TaskName $n
  ""
  "Registered: $($t.TaskName)"
  "  state:      $($t.State)"
  "  next run:   $($i.NextRunTime)"
}

$task = Get-ScheduledTask -TaskName $TaskName
$info = Get-ScheduledTaskInfo -TaskName $TaskName
""
"Backup task detail:"
"  next run:   $($info.NextRunTime)"
"  runs as:    $($task.Principal.UserId) (only while signed in)"
"  catches up: $($task.Settings.StartWhenAvailable)"
"  on battery: $($task.Settings.AllowStartIfOnBatteries)"
