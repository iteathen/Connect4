param([string]$Id='public-default-01')
$ErrorActionPreference='Stop'
$taskRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
Set-Location -LiteralPath $taskRoot
$taskDir=Join-Path $PSScriptRoot $Id
if(Test-Path -LiteralPath $taskDir){throw 'Output already exists'}
$taskProcesses=@(Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object {
 $_.CommandLine -like '*isomax*cli.mjs*' -or $_.CommandLine -like '*exact-tt-identity*bench.mjs*'})
if($taskProcesses.Count){throw 'A solve is already running'}
$taskNode='C:/r/isomax-nightly-runtime/node-v27.0.0-nightly20260928b59840b593-win-x64/node.exe'
$taskHash=(Get-FileHash -LiteralPath $taskNode -Algorithm SHA256).Hash.ToLower()
if($taskHash -ne '2f2843c1802f6a17ba7fabe5550c90bb055c9bef8738a08338d94f71dbe91f29'){throw 'Runtime identity changed'}
& $taskNode isomax/verify.mjs
if($LASTEXITCODE){throw 'Package verification failed'}
New-Item -ItemType Directory -Path $taskDir | Out-Null
$taskMemory=Get-CimInstance Win32_OperatingSystem
$taskMemory | Select-Object FreePhysicalMemory,FreeVirtualMemory,TotalVisibleMemorySize | ConvertTo-Json | Set-Content (Join-Path $taskDir 'memory-before.json')
if([long]$taskMemory.FreePhysicalMemory*1024 -lt 15.125*1073741824 -or [long]$taskMemory.FreeVirtualMemory*1024 -lt 15.125*1073741824){throw 'Measured12GiB allocation needs more headroom; do not substitute a smaller benchmark'}
$taskLock=Get-Content isomax/provenance.json -Raw | ConvertFrom-Json
[pscustomobject]@{repositorySha=(git rev-parse HEAD);producerSha=$taskLock.sourceCommit;
 executable=$taskNode;executableSha256=$taskHash;command='node isomax/run.mjs';
 node=(& $taskNode --version);oneDriveStopped=(@(Get-Process OneDrive -ErrorAction SilentlyContinue).Count -eq 0);
 archiveSha256=(Get-FileHash isomax/dist/iteathen-isomax-0.2.0-rc.5.tgz -Algorithm SHA256).Hash.ToLower();
 boundary='Public default launcher; solver reports READY->actual empty root->exact. CPU/RSS from actual hosting child process, not launcher parent.'} |
 ConvertTo-Json -Depth 5 | Set-Content (Join-Path $taskDir 'invocation.json')
$taskWatch=[Diagnostics.Stopwatch]::StartNew()
& $taskNode isomax/run.mjs > (Join-Path $taskDir 'stdout.json') 2> (Join-Path $taskDir 'stderr.txt')
$taskExit=$LASTEXITCODE;$taskWatch.Stop()
if($taskExit){throw 'Public solve failed; retain raw output'}
$taskRun=Get-Content (Join-Path $taskDir 'stdout.json') -Raw | ConvertFrom-Json
$taskLeft=@(Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object {$_.CommandLine -like '*isomax*cli.mjs*'})
# Validation happens after solving; no expected outcome enters the process.
$taskValid=$taskRun.result.status -eq 'EXACT' -and $taskRun.result.rootWdl -eq 1 -and $taskRun.result.move -eq 3 -and
 $taskRun.memoryPlan.profile.id -eq '12' -and $taskRun.result.sharedTtPayloadBytes -eq 12*1073741824 -and
 $taskRun.result.cacheIdentity -eq 'partial24' -and $taskRun.result.workersUsed -eq 6 -and $taskRun.result.workersExited -eq 6 -and
 $taskRun.result.cleanup -and @($taskRun.result.workerAffinity | Where-Object {-not $_.verified}).Count -eq 0 -and
 @($taskRun.result.workerAffinity | Select-Object -ExpandProperty cpu -Unique).Count -eq 6 -and $taskLeft.Count -eq 0
[pscustomobject]@{validated=$taskValid;status=$taskRun.result.status;primaryMs=$taskRun.primaryWallMs;
 operationMs=$taskRun.operationWallMs;externalWallMs=$taskWatch.Elapsed.TotalMilliseconds;cpuMs=$taskRun.cpuMs;
 peakRssBytes=$taskRun.peakRssBytes;cycles=$null;rootWdl=$taskRun.result.rootWdl;move=$taskRun.result.move;
 memoryProfile=$taskRun.memoryPlan.profile.id;workers=$taskRun.result.workersUsed;workersExited=$taskRun.result.workersExited;
 sharedBytes=$taskRun.result.sharedTtPayloadBytes;privateBytesPerWorker=$taskRun.memoryPlan.privateBytesPerWorker;
 sourceSha=$taskLock.sourceCommit;solverProcessesRemaining=$taskLeft.Count} | ConvertTo-Json |
 Set-Content (Join-Path $taskDir 'summary.json')
Get-Content (Join-Path $taskDir 'summary.json')
if(-not $taskValid){throw 'Public configuration/outcome/cleanup mismatch'}
