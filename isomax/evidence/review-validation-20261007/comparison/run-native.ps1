param(
 [Parameter(Mandatory=$true)][string]$PreparedRoot,
 [Parameter(Mandatory=$true)][ValidateSet('christophe','pons')][string]$Solver,
 [Parameter(Mandatory=$true)][string]$ResultFile,
 [string]$History='',
 [switch]$PrepareOnly,
 [int]$DeadlineMs=750000
)
$ErrorActionPreference='Stop'
if($History -and ($Solver -ne 'pons' -or $History -notmatch '^[1-7]{1,42}$')){throw 'Position history is supported by Pons only, with digits 1..7'}
if($PrepareOnly -and $History){throw 'Prepare-only checks the empty root'}
$nativePrepared=(Resolve-Path -LiteralPath $PreparedRoot).Path
$nativeBuild=Get-Content -LiteralPath (Join-Path $nativePrepared 'build.json') -Raw | ConvertFrom-Json
$nativePreparation=Get-Content -LiteralPath (Join-Path $nativePrepared 'preparation.json') -Raw | ConvertFrom-Json
$nativeMachine=[ordered]@{cpu=(Get-CimInstance Win32_Processor | Select-Object -First 1 -ExpandProperty Name);
 architecture=[Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString();os=[Runtime.InteropServices.RuntimeInformation]::OSDescription}
$nativeSolverDir=Join-Path $nativePrepared $Solver
$nativeExe=Join-Path $nativeSolverDir 'solver.exe'
if((Get-FileHash -LiteralPath $nativeExe -Algorithm SHA256).Hash.ToLowerInvariant() -ne $nativeBuild.solvers.$Solver.executableSha256){throw 'Executable hash mismatch'}
$mask=if($Solver -eq 'christophe'){0x555}else{0x1}
$psi=[Diagnostics.ProcessStartInfo]::new();$psi.FileName=$nativeExe;$psi.WorkingDirectory=$nativeSolverDir
$psi.UseShellExecute=$false;$psi.CreateNoWindow=$true;$psi.RedirectStandardOutput=$true;$psi.RedirectStandardError=$true
if($PrepareOnly){$psi.ArgumentList.Add('--prepare-only')}
if($History){$psi.ArgumentList.Add('--position');$psi.ArgumentList.Add($History)}
$psi.Environment.Clear()
foreach($key in @('SystemRoot','WINDIR','TEMP','TMP')){if([Environment]::GetEnvironmentVariable($key)){$psi.Environment[$key]=[Environment]::GetEnvironmentVariable($key)}}
$hostProcess=[Diagnostics.Process]::GetCurrentProcess();$previousMask=$hostProcess.ProcessorAffinity
$p=[Diagnostics.Process]::new();$p.StartInfo=$psi
$wall=[Diagnostics.Stopwatch]::StartNew()
try{
 # Windows child inherits restricted process affinity before its first instruction.
 $hostProcess.ProcessorAffinity=[IntPtr]$mask
 if(!$p.Start()){throw 'Solver launch failed'}
}finally{$hostProcess.ProcessorAffinity=$previousMask}
$verifiedMask=$p.ProcessorAffinity.ToInt64()
if($verifiedMask -ne $mask){$p.Kill($true);$p.WaitForExit();throw 'Process affinity verification failed'}
$stdoutTask=$p.StandardOutput.ReadToEndAsync();$stderrTask=$p.StandardError.ReadToEndAsync()
[long]$sampledPeakBytes=0;$timedOut=$false
try{
 while(!$p.WaitForExit(100)){
  $p.Refresh();$sampledPeakBytes=[Math]::Max([long]$sampledPeakBytes,[long]$p.PeakWorkingSet64)
  if($wall.ElapsedMilliseconds -ge $DeadlineMs){$timedOut=$true;break}
 }
 if($timedOut){$p.Kill($true);$p.WaitForExit()}
}catch{if(!$p.HasExited){$p.Kill($true);$p.WaitForExit()};throw}
$wall.Stop();$p.Refresh()
function Sanitize-NativeText([string]$Text){
 $Text=[regex]::Replace($Text,'(?i)([A-Z]:[\\/](?:Users|Documents and Settings)[\\/])[^\\/\s"]+','${1}<redacted>')
 return [regex]::Replace($Text,'(?i)("(?:pid|processId)"\s*:\s*)\d+','${1}null')
}
$rawStdout=Sanitize-NativeText $stdoutTask.Result;$rawStderr=Sanitize-NativeText $stderrTask.Result
$rawEncoding=[Text.UTF8Encoding]::new($false)
[IO.File]::WriteAllText([IO.Path]::GetFullPath($ResultFile+'.stdout.txt'),$rawStdout,$rawEncoding)
[IO.File]::WriteAllText([IO.Path]::GetFullPath($ResultFile+'.stderr.txt'),$rawStderr,$rawEncoding)
$records=@()
foreach($text in @($rawStdout,$rawStderr)){
 foreach($line in ($text -split "`r?`n")){if($line.Trim().StartsWith('{')){$records+=($line | ConvertFrom-Json)}}
}
$ready=@($records | Where-Object event -eq 'ready') | Select-Object -First 1
$result=@($records | Where-Object event -eq 'result') | Select-Object -First 1
$summary=[ordered]@{schema=1;solver=$Solver;machine=$nativeMachine;toolchainVersions=$nativeBuild.toolchainVersions;
 sourceCommit=$nativePreparation.solvers.$Solver.commit;executableSha256=$nativeBuild.solvers.$Solver.executableSha256;
 prepareOnly=[bool]$PrepareOnly;history=$History;processAffinityMask=$verifiedMask;affinityType='inherited-and-verified-process-mask';
 threadPinning=$false;wallMs=$wall.Elapsed.TotalMilliseconds;processCpuMs=$p.TotalProcessorTime.TotalMilliseconds;
 peakWorkingSetBytes=if($sampledPeakBytes -gt 0){$sampledPeakBytes}else{$null};memorySampleIntervalMs=100;
 timedOut=$timedOut;exitCode=$p.ExitCode;ready=$ready;result=$result}
$summary | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $ResultFile -Encoding utf8
$summary | ConvertTo-Json -Depth 12
if($timedOut -or $p.ExitCode -ne 0 -or !$ready -or (!$PrepareOnly -and !$result)){throw 'Native run incomplete; inspect result record'}
