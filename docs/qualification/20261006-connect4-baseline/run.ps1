param([Parameter(Mandatory=$true)][ValidateRange(1,3)][int]$Run)
$ErrorActionPreference='Stop'
$repo=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
Set-Location -LiteralPath $repo
$authority='C:/r/connect4-isomax-rc2-full-20261006'
$runDir="C:/r/connect4-isomax-baseline-20261006/run-$Run"
if(Test-Path -LiteralPath $runDir){throw 'Baseline output already exists'}
$existing=Get-CimInstance Win32_Process | Where-Object {$_.Name -eq 'node.exe' -and ($_.CommandLine -like '*bench-minimal-i5.mjs*' -or $_.CommandLine -like '*isomax*cli.mjs*')}
if($existing){throw 'Another solver benchmark is running'}
$config=Get-Content (Join-Path $authority 'invocation.json') -Raw | ConvertFrom-Json
if((Get-FileHash -LiteralPath $config.executable -Algorithm SHA256).Hash.ToLower() -ne $config.executable_hash){throw 'Runtime identity changed'}
New-Item -ItemType Directory -Path $runDir,(Join-Path $runDir 'temp') | Out-Null
$config.upstream_commit=(git rev-parse HEAD)
$config.environment.TEMP=Join-Path $runDir 'temp'
$config.environment.TMP=Join-Path $runDir 'temp'
$config.environment.JMS_WORKER_AFFINITY_REPORT=Join-Path $runDir 'affinity'
$config.stdout=Join-Path $runDir 'stdout.json'
$config.stderr=Join-Path $runDir 'stderr.txt'
$config.measurement=Join-Path $runDir 'measurement.json'
$config | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $runDir 'invocation.json')
Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory,TotalVirtualMemorySize,FreeVirtualMemory | ConvertTo-Json | Set-Content (Join-Path $runDir 'preflight-memory.json')
Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object {$_.Name -ne '_Total' -and $_.Name -ne 'Idle'} | Sort-Object PercentProcessorTime -Descending | Select-Object -First 10 Name,IDProcess,PercentProcessorTime,WorkingSet | ConvertTo-Json | Set-Content (Join-Path $runDir 'preflight-cpu.json')
powercfg /getactivescheme | Set-Content (Join-Path $runDir 'power-scheme.txt')
& (Join-Path $authority 'measure.ps1') -Config (Join-Path $runDir 'invocation.json')
$remaining=Get-CimInstance Win32_Process | Where-Object {$_.Name -eq 'node.exe' -and ($_.CommandLine -like '*bench-minimal-i5.mjs*' -or $_.CommandLine -like '*isomax*cli.mjs*')}
[pscustomobject]@{checkedAt=(Get-Date).ToString('o');remainingSolverProcesses=@($remaining | Select-Object ProcessId,CommandLine);clean=(@($remaining).Count -eq 0)} | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $runDir 'cleanup-verification.json')
Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory | ConvertTo-Json | Set-Content (Join-Path $runDir 'post-memory.json')
Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object {$_.Name -ne '_Total' -and $_.Name -ne 'Idle'} | Sort-Object PercentProcessorTime -Descending | Select-Object -First 10 Name,IDProcess,PercentProcessorTime,WorkingSet | ConvertTo-Json | Set-Content (Join-Path $runDir 'post-cpu.json')
$destination=Join-Path $PSScriptRoot "run-$Run"
New-Item -ItemType Directory -Path $destination | Out-Null
Copy-Item -Path "$runDir/*.json","$runDir/*.txt" -Destination $destination
$result=Get-Content $config.stdout -Raw | ConvertFrom-Json
$measurement=Get-Content $config.measurement -Raw | ConvertFrom-Json
[pscustomobject]@{run=$Run;primaryMs=$result.primaryWallMs;initMs=$result.result.preparedTiming.initializationMs;cleanupMs=$result.result.preparedTiming.cleanupMs;operationMs=$result.operationWallMs;status=$result.result.status;ready=$result.result.readyWorkers;exited=$result.result.workersExited;clean=$result.result.cleanup;cpuMs=$measurement.cpu_ms;peakRssBytes=$measurement.peak_rss_bytes} | ConvertTo-Json
