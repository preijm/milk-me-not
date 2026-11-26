<#
.SYNOPSIS
  Registers (or re-registers) the weekly Supabase backup and its weekly health check.

.DESCRIPTION
  Two tasks. The backup runs backup-supabase.ps1 every Monday at midday. The
  health check runs check-backup-health.ps1 half an hour later and says
  nothing unless the backups have gone stale or the last run failed.

  Weekly since 25 Nov 2026; it was monthly before. A month of other people's
  ratings was the most that could be lost, and the dumps are small (a few
  hundred KB for the community half), so a week costs nothing worth weighing.
  Re-running this removes the old monthly task, so the two never both fire.

  Deliberately set to run only while you are signed in. The alternative is
  storing your Windows password with the task, and a backup is not worth
  keeping a password on disk for. The trade is that the machine has to be on
  and signed in at some point around the 1st - which StartWhenAvailable covers
  by running late rather than skipping. backup-heartbeat.yml on GitHub notices
  when it has not run for ten days, wherever the laptop is.

  Re-run this any time; it replaces the existing task rather than duplicating.

.NOTES
  No administrator rights needed: the task belongs to the current user.
#>

[CmdletBinding()]
param(
  [string]$TaskName      = "Milk Me Not - weekly Supabase backup",
  [string]$CheckTaskName = "Milk Me Not - weekly backup health check",
  # Any day works. Monday, so the health check below can follow on the same day.
  [string]$Day           = "MON",
  [string]$AtTime        = "12:00",
  # Half an hour after the backup, so a normal week is checked minutes after it ran.
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

# The task this replaced. Left registered, it would keep firing on the 1st
# beside the weekly one, so it is removed rather than merely superseded.
$oldMonthly = "Milk Me Not - monthly Supabase backup"
if ($oldMonthly -ne $TaskName -and (Get-ScheduledTask -TaskName $oldMonthly -ErrorAction SilentlyContinue)) {
  Unregister-ScheduledTask -TaskName $oldMonthly -Confirm:$false
  "Removed the old task: $oldMonthly"
}

# schtasks is used for the triggers, as it was when the backup was monthly and
# New-ScheduledTaskTrigger had no monthly option; the settings above are then
# applied through the ScheduledTasks module.
$action = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$script`""
schtasks /Create /TN $TaskName /TR $action /SC WEEKLY /D $Day /ST $AtTime /F | Out-Null
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
"  on battery: $(-not $task.Settings.DisallowStartIfOnBatteries)"
