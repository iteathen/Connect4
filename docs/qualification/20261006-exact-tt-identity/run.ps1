param([Parameter(Mandatory=$true)][string]$Id,[ValidateSet('native32','partial24','partial16')][string]$Identity='native32',[switch]$JitDiagnostic)
$ErrorActionPreference='Stop'
$taskRepo=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
Set-Location -LiteralPath $taskRepo
$taskDir=Join-Path $PSScriptRoot $Id
if(Test-Path -LiteralPath $taskDir){throw 'Output exists'}
$taskActive=Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object {$_.CommandLine -like '*isomax*cli.mjs*' -or $_.CommandLine -like '*bench-minimal-i5.mjs*' -or $_.CommandLine -like '*exact-tt-identity*bench.mjs*' -or $_.CommandLine -like '*large-shared-tt*bench.mjs*'}
if($taskActive){throw 'Another solver is running'}
$taskConfig=Get-Content docs/qualification/20261006-memory-profiles/final-default-run/invocation.json -Raw | ConvertFrom-Json
if((Get-FileHash -LiteralPath $taskConfig.executable -Algorithm SHA256).Hash.ToLower() -ne $taskConfig.executable_hash){throw 'Runtime hash changed'}
New-Item -ItemType Directory -Path $taskDir | Out-Null
$taskConfig.repositoryCommit=(git rev-parse HEAD)
$taskConfig.sourceCommit=(git -C C:/r/jsminsys-cpc-rebuild-20261004 rev-parse HEAD)
$taskConfig.arguments=@('--experimental-ffi','--max-inlined-bytecode-size=2400','--max-inlined-bytecode-size-cumulative=9600','--import','file:///C:/r/c4-external-20261004/isomax/runtime/tools/benchmark-v8-startup-preload.mjs')
if($JitDiagnostic){$taskConfig.arguments+='--trace-turbo-inlining'}
$taskConfig.arguments+=@((Join-Path $PSScriptRoot 'bench.mjs'),'--identity',$Identity,'--timeout',$(if($JitDiagnostic){'10000'}else{'120000'}))
$taskConfig.canonicalCommand='Frozen raw-host TT identity comparison; actual entry capacities unchanged'
$taskConfig.execution='Six auto-discovered verified P-core workers; exact empty root; retained cache entry counts, topology, flags and support plans; candidate entry width only'
$taskConfig.stdout=Join-Path $taskDir 'stdout.json';$taskConfig.stderr=Join-Path $taskDir 'stderr.txt';$taskConfig.measurement=Join-Path $taskDir 'measurement.json'
$taskConfig | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $taskDir 'invocation.json')
Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory,TotalVirtualMemorySize,FreeVirtualMemory | ConvertTo-Json | Set-Content (Join-Path $taskDir 'preflight-memory.json')
Write-Output "START $Id identity=$Identity diagnostic=$JitDiagnostic"
& pwsh -NoProfile -File docs/qualification/20261006-auto-workers-default/measure.ps1 -Config (Join-Path $taskDir 'invocation.json')
if($LASTEXITCODE){throw 'Measurement driver failed'}
$taskActive=Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object {$_.CommandLine -like '*exact-tt-identity*bench.mjs*'}
[pscustomobject]@{checkedAt=(Get-Date).ToString('o');clean=(@($taskActive).Count -eq 0);remainingSolverProcesses=@($taskActive | Select-Object ProcessId,CommandLine)} | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $taskDir 'cleanup-verification.json')
if(-not $JitDiagnostic){
 $taskRun=Get-Content $taskConfig.stdout -Raw | ConvertFrom-Json
 $taskMeasurement=Get-Content $taskConfig.measurement -Raw | ConvertFrom-Json
 $taskValid=$taskRun.result.status -eq 'EXACT' -and $taskRun.result.rootWdl -eq 1 -and $taskRun.result.move -eq 3 -and $taskRun.result.cleanup -and $taskRun.result.workersExited -eq 6 -and
   @($taskRun.result.workerAffinity | Where-Object {-not $_.verified}).Count -eq 0 -and @($taskRun.result.workerAffinity | Select-Object -ExpandProperty cpu -Unique).Count -eq 6 -and $taskMeasurement.exit_status -eq 0 -and @($taskActive).Count -eq 0
 [pscustomobject]@{id=$Id;identity=$Identity;validated=$taskValid;status=$taskRun.result.status;solveMs=$taskRun.primaryWallMs;initializationMs=$taskRun.result.preparedTiming.initializationMs;sharedEntryBytes=$taskRun.result.sharedTtEntryBytes;privateEntryBytes=$taskRun.result.privateTtEntryBytes;rootWdl=$taskRun.result.rootWdl;move=$taskRun.result.move;cpuMs=$taskMeasurement.cpu_ms;peakRssBytes=$taskMeasurement.peak_rss_bytes;wallMs=$taskMeasurement.wall_ms;sourceCommit=$taskConfig.sourceCommit;consumerCommit=$taskConfig.repositoryCommit} | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $taskDir 'summary.json')
 Get-Content (Join-Path $taskDir 'summary.json')
}
git add -- "docs/qualification/20261006-exact-tt-identity/$Id"
git commit -m "Record TT identity $Id raw measurement and lifecycle"
if($LASTEXITCODE){throw 'Checkpoint failed'}
git push origin HEAD
if(-not $JitDiagnostic -and -not $taskValid){throw 'Run incomplete or validation failed; no performance promotion'}
