param([string]$Id='partial24-banked-code-gc-01',[switch]$RedirectCode)
$ErrorActionPreference='Stop'
$taskRepo=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
Set-Location -LiteralPath $taskRepo
$taskDir=Join-Path $PSScriptRoot $Id
if(Test-Path -LiteralPath $taskDir){throw 'Output exists'}
$taskActive=Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object {$_.CommandLine -like '*exact-tt-identity*bench.mjs*' -or $_.CommandLine -like '*nees-audit*diagnostic.mjs*'}
if($taskActive){throw 'Another solver/diagnostic is active'}
git -C C:/r/jsminsys-cpc-rebuild-20261004 diff --exit-code 6bc1dd047209664f9924c4cb49597a2154555107 -- addons src
if($LASTEXITCODE){throw 'Runtime changed since qualification'}
$taskConfig=Get-Content docs/qualification/20261006-exact-tt-identity/partial24-shared-12gib-01/invocation.json -Raw | ConvertFrom-Json
if((Get-FileHash -LiteralPath $taskConfig.executable -Algorithm SHA256).Hash.ToLower() -ne $taskConfig.executable_hash){throw 'Runtime hash changed'}
New-Item -ItemType Directory -Path $taskDir | Out-Null
$taskMemory=Get-CimInstance Win32_OperatingSystem
$taskMemory | Select-Object TotalVisibleMemorySize,FreePhysicalMemory,TotalVirtualMemorySize,FreeVirtualMemory | ConvertTo-Json | Set-Content (Join-Path $taskDir 'preflight-memory.json')
$taskNeeded=15.125*1073741824
if([long]$taskMemory.FreePhysicalMemory*1024 -lt $taskNeeded -or [long]$taskMemory.FreeVirtualMemory*1024 -lt $taskNeeded){
 [pscustomobject]@{status='RESOURCE_CENSORED';requiredBytes=$taskNeeded;solverStarted=$false} | ConvertTo-Json | Set-Content (Join-Path $taskDir 'resource-status.json')
 throw 'Insufficient headroom; no diagnostic started'
}
$taskConfig.repositoryCommit=git rev-parse HEAD
$taskConfig.sourceCommit=git -C C:/r/jsminsys-cpc-rebuild-20261004 rev-parse HEAD
$taskConfig.cwd=$taskDir
$taskConfig.arguments=@('--experimental-ffi','--max-inlined-bytecode-size=2400','--max-inlined-bytecode-size-cumulative=9600',
 '--trace-opt','--trace-deopt','--trace-file-names','--trace-gc','--print-opt-code','--print-opt-code-filter=negamax',
 '--import',('file:///'+((Join-Path $PSScriptRoot 'diagnostic-preload.mjs') -replace '\\','/')),
 (Join-Path $PSScriptRoot 'diagnostic.mjs'),(Join-Path $taskDir 'summary.json'))
if($RedirectCode){$taskConfig.arguments=@('--redirect-code-traces')+$taskConfig.arguments}
$taskConfig.canonicalCommand='NEES code/GC diagnostic, 10s observation; no performance conclusion'
$taskConfig.stdout=Join-Path $taskDir 'stdout.txt';$taskConfig.stderr=Join-Path $taskDir 'stderr.txt';$taskConfig.measurement=Join-Path $taskDir 'measurement.json'
$taskConfig | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $taskDir 'invocation.json')
& pwsh -NoProfile -File docs/qualification/20261006-auto-workers-default/measure.ps1 -Config (Join-Path $taskDir 'invocation.json')
if($LASTEXITCODE){throw 'Diagnostic driver failed'}
$taskSummary=Get-Content (Join-Path $taskDir 'summary.json') -Raw | ConvertFrom-Json
$taskMeasurement=Get-Content (Join-Path $taskDir 'measurement.json') -Raw | ConvertFrom-Json
if(-not $taskSummary.result.cleanup -or $taskSummary.result.workersExited -ne 6 -or $taskMeasurement.exit_status -ne 0){throw 'Diagnostic cleanup/status failure'}
[pscustomobject]@{status=$taskSummary.result.status;readyWorkers=$taskSummary.result.readyWorkers;workersExited=$taskSummary.result.workersExited;sharedBytes=$taskSummary.result.sharedTtPayloadBytes;performanceConclusionAllowed=$false} | ConvertTo-Json
