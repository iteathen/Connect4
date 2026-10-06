param([Parameter(Mandatory=$true)][ValidateRange(1,2)][int]$Run)
$ErrorActionPreference='Stop'
$source='C:/r/isomax-best-427f691b-20261006'
$sha='427f691b00248ac15b795e187508bf5144f69706'
$authority="$PSScriptRoot/best-original-invocation.json"
$runDir="C:/r/connect4-isomax-best-retest-20261006/run-$Run"
if(Test-Path -LiteralPath $runDir){throw 'Retest output already exists'}
$existing=Get-CimInstance Win32_Process | Where-Object {$_.Name -eq 'node.exe' -and ($_.CommandLine -like '*bench-minimal-i5.mjs*' -or $_.CommandLine -like '*isomax*cli.mjs*')}
if($existing){throw 'Another solver benchmark is running'}
$config=Get-Content -LiteralPath $authority -Raw | ConvertFrom-Json
if($config.upstream_commit -ne $sha){throw 'Historical source identity differs'}
if((Get-FileHash -LiteralPath $config.executable -Algorithm SHA256).Hash.ToLower() -ne $config.executable_hash){throw 'Runtime identity changed'}
if(-not(Test-Path -LiteralPath "$source/tools/bench-minimal-i5.mjs")){throw 'Pinned source snapshot missing'}
New-Item -ItemType Directory -Path $runDir,"$runDir/temp" | Out-Null
$originalSource=$config.cwd
$config.arguments=@($config.arguments | ForEach-Object { $_.Replace($originalSource,$source) })
$config.cwd=$source
$config.environment.TEMP="$runDir/temp"
$config.environment.TMP="$runDir/temp"
$config.environment.JMS_WORKER_AFFINITY_REPORT="$runDir/affinity"
$config.stdout="$runDir/stdout.json"
$config.stderr="$runDir/stderr.txt"
$config.measurement="$runDir/measurement.json"
$config | ConvertTo-Json -Depth 10 | Set-Content "$runDir/invocation.json"
Copy-Item -LiteralPath $config.environment.JMS_WORKER_AFFINITY_FILE -Destination "$runDir/targets.json"
Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory,TotalVirtualMemorySize,FreeVirtualMemory | ConvertTo-Json | Set-Content "$runDir/preflight-memory.json"
Get-CimInstance Win32_Process | Where-Object {$_.Name -eq 'node.exe'} | Select-Object ProcessId,CommandLine | ConvertTo-Json | Set-Content "$runDir/preflight-processes.json"
powercfg /getactivescheme | Set-Content "$runDir/power-scheme.txt"
& "$PSScriptRoot/measure.ps1" -Config "$runDir/invocation.json"
$remaining=Get-CimInstance Win32_Process | Where-Object {$_.Name -eq 'node.exe' -and ($_.CommandLine -like '*bench-minimal-i5.mjs*' -or $_.CommandLine -like '*isomax*cli.mjs*')}
[pscustomobject]@{checkedAt=(Get-Date).ToString('o');remainingSolverProcesses=@($remaining | Select-Object ProcessId,CommandLine);clean=(@($remaining).Count -eq 0)} | ConvertTo-Json -Depth 4 | Set-Content "$runDir/cleanup-verification.json"
$destination="$PSScriptRoot/best-retest-$Run"
New-Item -ItemType Directory -Path $destination | Out-Null
Copy-Item -Path "$runDir/*.json","$runDir/*.txt" -Destination $destination
$r=Get-Content -LiteralPath $config.stdout -Raw | ConvertFrom-Json
$m=Get-Content -LiteralPath $config.measurement -Raw | ConvertFrom-Json
if($r.status -ne 'EXACT' -or $r.rootWdl -ne 1 -or $r.move -ne 3 -or $r.preparedTiming.readyWorkers -ne 4 -or $r.workersExited -ne 4 -or -not $r.cleanup){throw 'Retest failed post-return validation'}
[pscustomobject]@{source=$sha;run=$Run;solveMs=$r.wallMs;initMs=$r.preparedTiming.initializationMs;cycles=$r.processCycles;cpuMs=$m.cpu_ms;peakRssBytes=$m.peak_rss_bytes;status=$r.status;move=$r.move;cleanup=$r.cleanup} | ConvertTo-Json
