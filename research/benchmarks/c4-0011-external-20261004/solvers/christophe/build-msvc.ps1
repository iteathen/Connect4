param(
    [string]$BuildRoot = 'C:/r/c4-external-build-20261004',
    [string]$Upstream = '',
    [string]$Wrapper = '',
    [string]$VisualStudio = 'C:/Program Files/Microsoft Visual Studio/18/Community',
    [string]$Toolset = '14.50.35717'
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$BuildRoot = [IO.Path]::GetFullPath($BuildRoot)
if (-not $Upstream) { $Upstream = Join-Path $BuildRoot 'build/christophe/upstream' }
if (-not $Wrapper) { $Wrapper = Join-Path $BuildRoot 'build/christophe/benchmark.cpp' }
$Upstream = (Resolve-Path -LiteralPath $Upstream).Path
$Wrapper = (Resolve-Path -LiteralPath $Wrapper).Path
$compiler = Join-Path $VisualStudio "VC/Tools/MSVC/$Toolset/bin/Hostx64/x64/cl.exe"
$vcvars = Join-Path $VisualStudio 'VC/Auxiliary/Build/vcvars64.bat'
foreach ($required in @($compiler, $vcvars)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) { throw "Missing build dependency: $required" }
}

# Import the official compiler/SDK environment into this script process only.
# No source mutation, upstream scripts, solver execution, or permissive flags.
$environment = & $env:ComSpec /d /c "call `"$vcvars`" -vcvars_ver=$Toolset >nul && set" 2>&1
if ($LASTEXITCODE -ne 0) { throw "vcvars64 failed: $environment" }
foreach ($line in $environment) {
    if ("$line" -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}

$outputDirectory = Join-Path $BuildRoot 'runtime/christophe'
$objectDirectory = Join-Path $BuildRoot 'build/christophe/msvc-objects'
$diagnosticDirectory = Join-Path $BuildRoot 'build/christophe/diagnostics'
foreach ($directory in @($outputDirectory, $objectDirectory, $diagnosticDirectory)) {
    [void](New-Item -ItemType Directory -Force -Path $directory)
}
$executable = Join-Path $outputDirectory 'solver.exe'
$log = Join-Path $diagnosticDirectory 'msvc-build.log'
$sources = @(Get-ChildItem -LiteralPath (Join-Path $Upstream 'src/solver') -Recurse -File -Filter '*.cpp' |
    Sort-Object FullName | ForEach-Object { $_.FullName })
if ($sources.Count -ne 12) { throw "Expected twelve pinned solver translation units, found $($sources.Count)" }
$arguments = @('/Bv', '/O2', '/GL', '/DNDEBUG', '/std:c++20', '/EHsc', '/MT', '/W4',
    ('/I' + (Join-Path $Upstream 'src')),
    ('/Fo' + $objectDirectory + [IO.Path]::DirectorySeparatorChar),
    ('/Fe' + $executable), $Wrapper) + $sources + @('/link', '/LTCG', 'Advapi32.lib')
$started = [DateTime]::UtcNow.ToString('o')
Push-Location -LiteralPath (Join-Path $BuildRoot 'build/christophe')
try {
    # Capture the native banner, per-file warnings and linker diagnostics verbatim.
    & $compiler @arguments 2>&1 | Tee-Object -FilePath $log
    $compilerExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}
$record = [ordered]@{
    schema = 'c4-0011-christophe-msvc-build-v1'
    startedUtc = $started
    finishedUtc = [DateTime]::UtcNow.ToString('o')
    compiler = $compiler
    compilerFileVersion = (Get-Item -LiteralPath $compiler).VersionInfo.FileVersion
    toolset = $Toolset
    windowsSdkVersion = $env:WindowsSDKVersion
    arguments = $arguments
    workingDirectory = (Join-Path $BuildRoot 'build/christophe')
    sources = @($Wrapper) + $sources
    exitCode = $compilerExitCode
    executable = $executable
    executableSha256 = $null
    diagnostics = $log
    solverExecuted = $false
    sourceChangesByThisScript = $false
}
if ($compilerExitCode -eq 0 -and (Test-Path -LiteralPath $executable)) {
    $record.executableSha256 = (Get-FileHash -LiteralPath $executable -Algorithm SHA256).Hash.ToLowerInvariant()
}
$record | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $diagnosticDirectory 'msvc-build.json') -Encoding utf8
if ($compilerExitCode -ne 0) { throw "MSVC compilation failed with exit $compilerExitCode; see $log" }
Write-Output "Compiled without execution: $executable"
