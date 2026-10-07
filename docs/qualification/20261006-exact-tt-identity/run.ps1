param([Parameter(Mandatory=$true)][string]$Id,[ValidateSet('native32','partial24','partialMixed')][string]$Identity='native32',[long]$SharedEntries=134217728,[long]$LocalEntries=8388608,[long]$SharedBankEntries=0,[switch]$JitDiagnostic,[string]$ProducerPath='C:/r/jsminsys-cpc-rebuild-20261004')
$ErrorActionPreference='Stop'
$taskRepo=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
Set-Location -LiteralPath $taskRepo
$taskProducer=(Resolve-Path -LiteralPath $ProducerPath).Path
git -C $taskProducer diff --exit-code HEAD -- addons src
if($LASTEXITCODE){throw 'Uncommitted producer runtime cannot be measured'}
$taskDir=Join-Path $PSScriptRoot $Id
if(Test-Path -LiteralPath $taskDir){throw 'Output exists'}
$taskActive=Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object {$_.CommandLine -like '*isomax*cli.mjs*' -or $_.CommandLine -like '*bench-minimal-i5.mjs*' -or $_.CommandLine -like '*exact-tt-identity*bench.mjs*' -or $_.CommandLine -like '*large-shared-tt*bench.mjs*'}
if($taskActive){throw 'Another solver is running'}
$taskConfig=Get-Content docs/qualification/20261006-memory-profiles/final-default-run/invocation.json -Raw | ConvertFrom-Json
if((Get-FileHash -LiteralPath $taskConfig.executable -Algorithm SHA256).Hash.ToLower() -ne $taskConfig.executable_hash){throw 'Runtime hash changed'}
New-Item -ItemType Directory -Path $taskDir | Out-Null
$taskMemory=Get-CimInstance Win32_OperatingSystem
$taskMemory | Select-Object TotalVisibleMemorySize,FreePhysicalMemory,TotalVirtualMemorySize,FreeVirtualMemory | ConvertTo-Json | Set-Content (Join-Path $taskDir 'preflight-memory.json')
$taskEntryBytes=if($Identity -eq 'partial24'){24}elseif($Identity -eq 'partialMixed'){28}else{32}
$taskRequired=[long]$SharedEntries*$taskEntryBytes+6*[long]$LocalEntries*$taskEntryBytes+2147483648
if([long]$taskMemory.FreePhysicalMemory*1024 -lt $taskRequired -or [long]$taskMemory.FreeVirtualMemory*1024 -lt $taskRequired){
 [pscustomobject]@{status='RESOURCE_CENSORED';requiredBytes=$taskRequired;sharedEntries=$SharedEntries;localEntries=$LocalEntries;entryBytes=$taskEntryBytes;solveStarted=$false} | ConvertTo-Json | Set-Content (Join-Path $taskDir 'resource-status.json')
 git add -- "docs/qualification/20261006-exact-tt-identity/$Id"; git commit -m "Record resource-censored TT identity $Id"; git push origin HEAD
 throw 'Insufficient physical/commit headroom; no solver started'
}
$taskConfig.repositoryCommit=(git rev-parse HEAD)
$taskConfig.sourceCommit=(git -C $taskProducer rev-parse HEAD)
$taskConfig.arguments=@('--experimental-ffi','--max-inlined-bytecode-size=2400','--max-inlined-bytecode-size-cumulative=9600','--import','file:///C:/r/c4-external-20261004/isomax/runtime/tools/benchmark-v8-startup-preload.mjs')
if($JitDiagnostic){$taskConfig.arguments+='--trace-turbo-inlining'}
$taskConfig.producerPath=$taskProducer
$taskConfig.arguments+=@((Join-Path $PSScriptRoot 'bench.mjs'),'--producer',$taskProducer,'--identity',$Identity,'--shared-entries',[string]$SharedEntries,'--local-entries',[string]$LocalEntries,'--shared-bank-entries',[string]$SharedBankEntries,'--timeout',$(if($JitDiagnostic){'10000'}else{'120000'}))
$taskConfig.canonicalCommand="Frozen raw-host TT identity comparison; producer=$taskProducer identity=$Identity sharedEntries=$SharedEntries localEntries=$LocalEntries sharedBankEntries=$SharedBankEntries"
$taskConfig.execution="Six auto-discovered verified P-core workers; exact empty root; sharedEntries=$SharedEntries localEntries=$LocalEntries sharedBankEntries=$SharedBankEntries entryBytes=$taskEntryBytes; retained topology flags and support plans"
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
