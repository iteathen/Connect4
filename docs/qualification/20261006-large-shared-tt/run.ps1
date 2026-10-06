param([Parameter(Mandatory=$true)][string]$Id,[ValidateSet('baseline','candidate')][string]$Mode='candidate',
 [ValidateSet(4,8,16)][int]$SharedGiB=4,[ValidateSet(0,2,4)][int]$BankGiB=0)
$ErrorActionPreference='Stop'
$repo=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
Set-Location -LiteralPath $repo
$caseDir=Join-Path $PSScriptRoot $Id
if(Test-Path -LiteralPath $caseDir){throw 'Output already exists'}
$existing=@(Get-CimInstance Win32_Process | Where-Object {$_.Name -eq 'node.exe' -and ($_.CommandLine -like '*large-shared-tt*bench.mjs*' -or $_.CommandLine -like '*isomax*cli.mjs*')})
if($existing.Count){throw 'Another solver is running'}
New-Item -ItemType Directory -Path $caseDir | Out-Null
$memory=Get-CimInstance Win32_OperatingSystem
$memory | Select-Object TotalVisibleMemorySize,FreePhysicalMemory,TotalVirtualMemorySize,FreeVirtualMemory | ConvertTo-Json | Set-Content (Join-Path $caseDir 'preflight-memory.json')
$needed=[long]$SharedGiB*1073741824+1610612736+2147483648
if([long]$memory.FreePhysicalMemory*1024 -lt $needed -or [long]$memory.FreeVirtualMemory*1024 -lt $needed){
 [pscustomobject]@{status='RESOURCE_CENSORED';sharedGiB=$SharedGiB;estimatedRequiredHeadroomBytes=$needed;freePhysicalBytes=([long]$memory.FreePhysicalMemory*1024);freeCommitBytes=([long]$memory.FreeVirtualMemory*1024);solveStarted=$false} | ConvertTo-Json | Set-Content (Join-Path $caseDir 'resource-status.json')
 Write-Output 'RESOURCE_CENSORED: no solve/allocation attempted'
 exit 3
}
$config=Get-Content (Join-Path $repo 'docs/qualification/20261006-auto-workers-default/invocation.json') -Raw | ConvertFrom-Json
$config.repositoryCommit=(git rev-parse HEAD)
$config.sourceCommit=if($Mode -eq 'baseline'){(Get-Content (Join-Path $repo 'isomax/provenance.json') -Raw | ConvertFrom-Json).sourceCommit}else{git -C C:/r/jsminsys-cpc-rebuild-20261004 rev-parse HEAD}
if((Get-FileHash -LiteralPath $config.executable -Algorithm SHA256).Hash.ToLower() -ne $config.executable_hash){throw 'Runtime identity changed'}
$config.arguments=@('--experimental-ffi','--max-inlined-bytecode-size=2400','--max-inlined-bytecode-size-cumulative=9600','--import',
 'file:///C:/r/c4-external-20261004/isomax/runtime/tools/benchmark-v8-startup-preload.mjs',
 (Join-Path $PSScriptRoot 'bench.mjs'),'--mode',$Mode,'--shared-gib',[string]$SharedGiB,'--bank-gib',[string]$BankGiB)
$config.environment.TEMP=$env:TEMP;$config.environment.TMP=$env:TMP
$config.canonicalCommand='External larger native32 capacity probe; exact invocation arguments below'
$config.execution='Six discovered verified pinned workers; default private caches and solver policy; only TT banking/capacity varies'
$config.stdout=Join-Path $caseDir 'stdout.json';$config.stderr=Join-Path $caseDir 'stderr.txt';$config.measurement=Join-Path $caseDir 'measurement.json'
$configPath=Join-Path $caseDir 'invocation.json'
$config | ConvertTo-Json -Depth 10 | Set-Content $configPath
Write-Output "START $Id mode=$Mode sharedGiB=$SharedGiB bankGiB=$BankGiB"
& pwsh -NoProfile -File (Join-Path $repo 'docs/qualification/20261006-auto-workers-default/measure.ps1') -Config $configPath
if($LASTEXITCODE -ne 0){throw 'Measurement driver failed'}
$r=Get-Content $config.stdout -Raw | ConvertFrom-Json
$m=Get-Content $config.measurement -Raw | ConvertFrom-Json
$remaining=@(Get-CimInstance Win32_Process | Where-Object {$_.Name -eq 'node.exe' -and ($_.CommandLine -like '*large-shared-tt*bench.mjs*' -or $_.CommandLine -like '*isomax*cli.mjs*')})
[pscustomobject]@{checkedAt=(Get-Date).ToString('o');clean=($remaining.Count -eq 0);remainingSolverProcesses=@($remaining | Select-Object ProcessId,CommandLine)} | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $caseDir 'cleanup-verification.json')
$valid=$r.result.status -eq 'EXACT' -and $r.result.rootWdl -eq 1 -and $r.result.move -eq 3 -and $r.result.cleanup -and
 $r.result.readyWorkers -eq 6 -and $r.result.workersExited -eq 6 -and $r.result.sharedTtEntryBytes -eq 32 -and
 @($r.result.workerAffinity | Where-Object {-not $_.verified}).Count -eq 0 -and @($r.result.workerAffinity | Select-Object -ExpandProperty cpu -Unique).Count -eq 6 -and $m.exit_status -eq 0 -and $remaining.Count -eq 0
$summary=[ordered]@{id=$Id;mode=$Mode;sharedGiB=$SharedGiB;bankGiB=$BankGiB;banks=$r.result.sharedTtBanks;status=$r.result.status;validated=$valid;
 solveMs=$r.primaryWallMs;initializationMs=$r.result.preparedTiming.initializationMs;cleanupMs=$r.result.preparedTiming.cleanupMs;
 rootWdl=$r.result.rootWdl;moveZeroBased=$r.result.move;peakRssBytes=$m.peak_rss_bytes;processCpuMs=$m.cpu_ms;
 externalWallMs=$m.wall_ms;consumerCommit=$config.repositoryCommit;producerCommit=$config.sourceCommit}
$summary | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $caseDir 'summary.json')
git add -- "docs/qualification/20261006-large-shared-tt/$Id"
git commit -m "Record large TT ${Id}: $($r.result.status)"
if($LASTEXITCODE -ne 0){throw 'Result checkpoint failed'}
git push origin HEAD:work/isomax-auto-workers-20261006
Write-Output ($summary | ConvertTo-Json -Depth 5)
if(-not $valid){throw 'Completed run failed exactness, affinity or lifecycle validation'}
