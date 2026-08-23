<#
.SYNOPSIS
  Registers (or re-registers) the monthly Supabase backup as a Windows task.

.DESCRIPTION
  Runs backup-supabase.ps1 on the 1st of each month at midday.

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
  [string]$TaskName = "Milk Me Not - monthly Supabase backup",
  # 1st of the month. Any day works, but early means a fresh dump each month.
  [int]$DayOfMonth  = 1,
  [string]$AtTime   = "12:00"
)

$ErrorActionPreference = "Stop"
$script = Join-Path $PSScriptRoot "backup-supabase.ps1"
if (-not (Test-Path $script)) { throw "Cannot find $script" }

# schtasks is used for the trigger because New-ScheduledTaskTrigger has no
# monthly option; the settings below are then tightened through the
# ScheduledTasks module.
$action = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$script`""

schtasks /Create /TN $TaskName /TR $action /SC MONTHLY /D $DayOfMonth /ST $AtTime /F | Out-Null
if ($LASTEXITCODE -ne 0) { throw "schtasks failed with exit code $LASTEXITCODE." }

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -DontStopIfGoingOnBatteries `
  -AllowStartIfOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
  -MultipleInstances IgnoreNew

Set-ScheduledTask -TaskName $TaskName -Settings $settings | Out-Null

$task = Get-ScheduledTask -TaskName $TaskName
$info = Get-ScheduledTaskInfo -TaskName $TaskName

"Registered: $($task.TaskName)"
"  state:      $($task.State)"
"  next run:   $($info.NextRunTime)"
"  runs as:    $($task.Principal.UserId) (only while signed in)"
"  catches up: $($task.Settings.StartWhenAvailable)"
"  on battery: $($task.Settings.AllowStartIfOnBatteries)"
