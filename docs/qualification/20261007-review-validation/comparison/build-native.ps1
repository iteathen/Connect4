param(
 [Parameter(Mandatory=$true)][string]$PreparedRoot,
 [Parameter(Mandatory=$true)][string]$Vcvars64,
 [Parameter(Mandatory=$true)][string]$Gxx
)
$ErrorActionPreference='Stop'
$preparedNativeRoot=(Resolve-Path -LiteralPath $PreparedRoot).Path
$nativeLocks=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'source-lock.json') -Raw | ConvertFrom-Json
$nativeManifest=Get-Content -LiteralPath (Join-Path $preparedNativeRoot 'preparation.json') -Raw | ConvertFrom-Json
# Import developer environment without printing arbitrary environment variables.
$devEnvironment=& $env:ComSpec /d /s /c "`"$Vcvars64`" >nul && set"
if($LASTEXITCODE -ne 0){throw 'MSVC environment setup failed'}
$nativeEnvironment=@{}
foreach($entry in $devEnvironment){if($entry -match '^([^=]+)=(.*)$'){$nativeEnvironment[$Matches[1]]=$Matches[2]}}
$compilerFolder=Join-Path $nativeEnvironment['VCToolsInstallDir'] 'bin/Hostx64/x64'
$nativeCl=Join-Path $compilerFolder 'cl.exe'
$nativeLink=Join-Path $compilerFolder 'link.exe'
function Verify-Hash([string]$File,[string]$Expected){if((Get-FileHash -LiteralPath $File -Algorithm SHA256).Hash.ToLowerInvariant() -ne $Expected){throw 'Pinned build input changed'}}
Verify-Hash $nativeCl $nativeLocks.toolchains.msvcCompilerSha256
Verify-Hash $nativeLink $nativeLocks.toolchains.msvcLinkerSha256
Verify-Hash $Gxx $nativeLocks.toolchains.gccCompilerSha256
function Invoke-NativeBuild([string]$Executable,[string[]]$Arguments,[string]$Directory,[hashtable]$Environment){
 $start=[Diagnostics.ProcessStartInfo]::new();$start.FileName=$Executable;$start.WorkingDirectory=$Directory
 $start.UseShellExecute=$false;$start.CreateNoWindow=$true;$start.RedirectStandardOutput=$true;$start.RedirectStandardError=$true
 foreach($arg in $Arguments){$start.ArgumentList.Add($arg)}
 # No owner tokens, connector credentials or inherited application environment.
 $start.Environment.Clear()
 foreach($key in @('PATH','INCLUDE','LIB','LIBPATH','SystemRoot','WINDIR','TEMP','TMP','COMSPEC','PATHEXT')){
  if($Environment.ContainsKey($key)){$start.Environment[$key]=$Environment[$key]}
 }
 $p=[Diagnostics.Process]::new();$p.StartInfo=$start
 if(!$p.Start()){throw 'Compiler launch failed'}
 $stdout=$p.StandardOutput.ReadToEndAsync();$stderr=$p.StandardError.ReadToEndAsync();$p.WaitForExit()
 [IO.File]::WriteAllText((Join-Path $Directory 'build.stdout.private.txt'),$stdout.Result)
 [IO.File]::WriteAllText((Join-Path $Directory 'build.stderr.private.txt'),$stderr.Result)
 if($p.ExitCode -ne 0){throw 'Native build failed; inspect local private build logs'}
}
$buildResults=[ordered]@{schema=1;solverExecuted=$false;toolchainHashes=$nativeLocks.toolchains;
 toolchainVersions=[ordered]@{msvcCompiler=(Get-Item -LiteralPath $nativeCl).VersionInfo.FileVersion;msvcLinker=(Get-Item -LiteralPath $nativeLink).VersionInfo.FileVersion;gcc=(& $Gxx -dumpfullversion)};solvers=[ordered]@{}}
foreach($solver in @('christophe','pons')){
 $solverDir=Join-Path $preparedNativeRoot $solver
 $solverMeta=$nativeManifest.solvers.$solver
 foreach($file in $solverMeta.sourceFiles.PSObject.Properties){Verify-Hash (Join-Path (Join-Path $solverDir 'upstream') $file.Name) $file.Value}
 Verify-Hash (Join-Path $solverDir "$solver-benchmark.cpp") $solverMeta.wrapperSha256
 if($solver -eq 'christophe'){
  Verify-Hash (Join-Path $solverDir 'benchmark-settings.h') $solverMeta.configurationHeaderSha256
  $flags=@('/Bv','/O2','/GL','/DNDEBUG','/std:c++20','/EHsc','/MT','/W4','/Iupstream/src','/Foobjects/','/Fesolver.exe','christophe-benchmark.cpp')
  $sources=Get-ChildItem -LiteralPath (Join-Path $solverDir 'upstream/src/solver') -Filter '*.cpp' -Recurse | Sort-Object FullName
  $relativeSources=@($sources | ForEach-Object {[IO.Path]::GetRelativePath($solverDir,$_.FullName)})
  New-Item -ItemType Directory -Force -Path (Join-Path $solverDir 'objects') | Out-Null
  $buildArgs=$flags+$relativeSources+@('/link','/LTCG','Advapi32.lib')
  Invoke-NativeBuild $nativeCl $buildArgs $solverDir $nativeEnvironment
 }else{
  $buildArgs=@('-O3','-DNDEBUG','-march=native','-static','-std=gnu++17','-I','upstream','pons-benchmark.cpp','-o','solver.exe')
  $gccEnvironment=@{PATH=(Split-Path -Parent $Gxx);SystemRoot=$env:SystemRoot;WINDIR=$env:WINDIR;TEMP=$env:TEMP;TMP=$env:TMP}
  Invoke-NativeBuild $Gxx $buildArgs $solverDir $gccEnvironment
 }
 $solverExecutable=Join-Path $solverDir 'solver.exe'
 $buildResults.solvers[$solver]=[ordered]@{arguments=$buildArgs;executableSha256=(Get-FileHash -LiteralPath $solverExecutable -Algorithm SHA256).Hash.ToLowerInvariant();sourceCommit=$solverMeta.commit}
}
$buildResults | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $preparedNativeRoot 'build.json') -Encoding utf8
$buildResults | ConvertTo-Json -Depth 10
