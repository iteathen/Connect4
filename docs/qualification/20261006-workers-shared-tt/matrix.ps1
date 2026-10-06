param([ValidateSet('screen','confirm')][string]$Phase='screen',[switch]$ValidateOnly)
$ErrorActionPreference='Stop'
$repo=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
Set-Location -LiteralPath $repo
$plan=Get-Content (Join-Path $PSScriptRoot 'plan.json') -Raw | ConvertFrom-Json
$cases=if($Phase -eq 'screen'){@($plan.cases)}else{
 $chosen=@()
 foreach($workers in 2..6){
  $samples=@($plan.cases | Where-Object {$_.workers -eq $workers} | ForEach-Object {
   $summary=Join-Path $PSScriptRoot ($_.id+'/summary.json')
   if(-not (Test-Path -LiteralPath $summary)){throw 'Screening incomplete'}
   Get-Content -LiteralPath $summary -Raw | ConvertFrom-Json
  } | Where-Object {$_.status -eq 'EXACT'} | Sort-Object solveMs,sharedGiB)
  if($samples.Count -eq 0){throw "No exact screening sample for $workers workers"}
  foreach($repeat in 2..3){$chosen += [pscustomobject]@{id="confirm-w$workers-g$($samples[0].sharedGiB)-r$repeat";workers=$workers;sharedGiB=$samples[0].sharedGiB;repetition=$repeat}}
 }
 if(@($chosen | Where-Object {$_.workers -eq 6 -and $_.sharedGiB -eq 4}).Count -eq 0){
  foreach($repeat in 2..3){$chosen += [pscustomobject]@{id="control-w6-g4-r$repeat";workers=6;sharedGiB=4;repetition=$repeat}}
 }
 # Reverse the second repeat's worker order to reduce phase-order bias.
 @($chosen | Where-Object {$_.repetition -eq 2} | Sort-Object workers -Descending)+@($chosen | Where-Object {$_.repetition -eq 3} | Sort-Object workers)
}
if($ValidateOnly){$cases | ConvertTo-Json -Depth 4; exit 0}
if((git branch --show-current) -ne 'work/isomax-auto-workers-20261006'){throw 'Unexpected branch'}
if((Get-FileHash -LiteralPath $plan.runtime -Algorithm SHA256).Hash.ToLower() -ne $plan.runtimeHash){throw 'Runtime hash changed'}
& $plan.runtime 'isomax/verify.mjs'
if($LASTEXITCODE -ne 0){throw 'Package verification failed'}
if($Phase -eq 'confirm'){
 $cases | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $PSScriptRoot 'confirmation-plan.json')
 git add -- 'docs/qualification/20261006-workers-shared-tt/confirmation-plan.json'
 git commit -m 'Freeze TT matrix confirmation candidates from complete screening'
 if($LASTEXITCODE -ne 0){throw 'Confirmation plan checkpoint failed'}
}
$completed=0
foreach($case in $cases){
 $caseDir=Join-Path $PSScriptRoot $case.id
 if(Test-Path -LiteralPath (Join-Path $caseDir 'summary.json')){Write-Output "SKIP saved $($case.id)"; continue}
 if(Test-Path -LiteralPath $caseDir){throw "Partial case requires inspection: $($case.id)"}
 $existing=@(Get-CimInstance Win32_Process | Where-Object {$_.Name -eq 'node.exe' -and ($_.CommandLine -like '*isomax*cli.mjs*' -or $_.CommandLine -like '*bench-minimal-i5.mjs*')})
 if($existing.Count){throw 'Another solver process is running'}
 $memory=Get-CimInstance Win32_OperatingSystem
 $sharedBytes=[long]$case.sharedGiB*1073741824
 $needed=$sharedBytes+[long]$case.workers*268435456+2147483648
 if([long]$memory.FreePhysicalMemory*1024 -lt $needed){throw "Insufficient free RAM for $($case.id) without paging"}
 New-Item -ItemType Directory -Path $caseDir | Out-Null
 $memory | Select-Object TotalVisibleMemorySize,FreePhysicalMemory | ConvertTo-Json | Set-Content (Join-Path $caseDir 'preflight-memory.json')
 Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object {$_.Name -ne '_Total' -and $_.Name -ne 'Idle'} | Sort-Object PercentProcessorTime -Descending | Select-Object -First 8 Name,IDProcess,PercentProcessorTime,WorkingSet | ConvertTo-Json | Set-Content (Join-Path $caseDir 'preflight-cpu.json')
 $config=Get-Content (Join-Path $repo 'docs/qualification/20261006-auto-workers-default/invocation.json') -Raw | ConvertFrom-Json
 $config.repositoryCommit=(git rev-parse HEAD)
 $config.arguments=@($plan.launchArguments)+@('--workers',[string]$case.workers,'--shared-entries',[string]([long]$case.sharedGiB*33554432))
 $config.canonicalCommand="node isomax/run.mjs --workers $($case.workers) --shared-entries $([long]$case.sharedGiB*33554432)"
 $config.execution='Frozen launcher child flags; only worker count and shared TT capacity vary'
 $config.environment.TEMP=$env:TEMP
 $config.environment.TMP=$env:TMP
 $config.stdout=Join-Path $caseDir 'stdout.json'
 $config.stderr=Join-Path $caseDir 'stderr.txt'
 $config.measurement=Join-Path $caseDir 'measurement.json'
 $configPath=Join-Path $caseDir 'invocation.json'
 $config | ConvertTo-Json -Depth 10 | Set-Content $configPath
 Write-Output "START $($case.id) workers=$($case.workers) sharedGiB=$($case.sharedGiB) at $((Get-Date).ToString('o'))"
 & pwsh -NoProfile -File (Join-Path $PSScriptRoot 'measure.ps1') -Config $configPath
 if($LASTEXITCODE -ne 0){throw "Measurement driver failed: $($case.id)"}
 $remaining=@(Get-CimInstance Win32_Process | Where-Object {$_.Name -eq 'node.exe' -and ($_.CommandLine -like '*isomax*cli.mjs*' -or $_.CommandLine -like '*bench-minimal-i5.mjs*')})
 $m=Get-Content $config.measurement -Raw | ConvertFrom-Json
 $r=if((Get-Item -LiteralPath $config.stdout).Length){Get-Content $config.stdout -Raw | ConvertFrom-Json}else{$null}
 [pscustomobject]@{checkedAt=(Get-Date).ToString('o');clean=($remaining.Count -eq 0);remainingSolverProcesses=@($remaining | Select-Object ProcessId,CommandLine)} | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $caseDir 'cleanup-verification.json')
 $validated=$null -ne $r -and $r.result.cleanup -and $r.workerPlan.workers -eq $case.workers -and $r.result.readyWorkers -eq $case.workers -and $r.result.workersExited -eq $case.workers -and $r.result.sharedCacheLayout -eq 'native' -and $r.result.sharedTtEntryBytes -eq 32 -and $r.configuration.localCacheCapacity -eq 8388608 -and @($r.result.workerAffinity | Where-Object {-not $_.verified}).Count -eq 0 -and @($r.result.workerAffinity | Select-Object -ExpandProperty cpu -Unique).Count -eq $case.workers -and $remaining.Count -eq 0
 $status=if($null -ne $r){$r.result.status}else{'PROCESS_FAILURE'}
 $summary=[ordered]@{id=$case.id;phase=$Phase;workers=$case.workers;sharedGiB=$case.sharedGiB;sharedEntries=([long]$case.sharedGiB*33554432);privateBytesPerWorker=268435456;aggregatePrivateBytes=([long]$case.workers*268435456);status=$status;validated=$validated;solveMs=$r.primaryWallMs;initializationMs=$r.result.preparedTiming.initializationMs;cleanupMs=$r.result.preparedTiming.cleanupMs;rootWdl=$r.result.rootWdl;moveZeroBased=$r.result.move;winner=$r.result.winner;affinity=$r.result.workerAffinity;peakRssBytes=$m.peak_rss_bytes;processCpuMs=$m.cpu_ms;processCycles=$null;externalWallMs=$m.wall_ms;exitStatus=$m.exit_status;timedOut=$m.timed_out;runtime=$r.runtime;repositoryCommit=$config.repositoryCommit;producerCommit=$config.sourceCommit}
 $summary | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $caseDir 'summary.json')
 git add -- "docs/qualification/20261006-workers-shared-tt/$($case.id)"
 git commit -m "Record localhost TT matrix $($case.id): $status"
 if($LASTEXITCODE -ne 0){throw 'Result checkpoint failed'}
 Write-Output ('RESULT '+($summary | ConvertTo-Json -Compress -Depth 8))
 if(-not $validated){throw "Affinity/layout/lifecycle qualification failed: $($case.id)"}
 if($status -eq 'EXACT' -and ($r.result.rootWdl -ne 1 -or $r.result.move -ne 3 -or $m.exit_status -ne 0)){throw 'Post-run expected-result validation failed'}
 $completed++
 if(($completed%3) -eq 0){git push origin HEAD:work/isomax-auto-workers-20261006;if($LASTEXITCODE -ne 0){throw 'Checkpoint push failed'}}
}
git push origin HEAD:work/isomax-auto-workers-20261006
if($LASTEXITCODE -ne 0){throw 'Final phase push failed'}
Write-Output "COMPLETE $Phase"
