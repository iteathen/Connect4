param(
    [string]$BuildRoot = 'C:/r/c4-external-build-20261004',
    [string]$Upstream = '',
    [string]$Wrapper = '',
    [string]$VisualStudio = 'C:/Program Files/Microsoft Visual Studio/18/Community',
    [string]$Toolset = '14.50.35717'
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-BuildProcess {
    param([string]$File, [string[]]$NativeArguments = @(), [string]$RawArguments = '', [string]$Directory = '')
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $File
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    if ($Directory) { $startInfo.WorkingDirectory = $Directory }
    if ($RawArguments) { $startInfo.Arguments = $RawArguments }
    else { foreach ($argument in $NativeArguments) { $startInfo.ArgumentList.Add($argument) } }
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        [void]$process.Start()
        # Drain both streams concurrently; compilation can exceed pipe capacity.
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        return [pscustomobject]@{
            ExitCode = $process.ExitCode
            StandardOutput = $stdout.GetAwaiter().GetResult()
            StandardError = $stderr.GetAwaiter().GetResult()
        }
    } finally { $process.Dispose() }
}

$BuildRoot = [IO.Path]::GetFullPath($BuildRoot)
if (-not $Upstream) { $Upstream = Join-Path $BuildRoot 'build/christophe/upstream' }
if (-not $Wrapper) { $Wrapper = Join-Path $BuildRoot 'build/christophe/benchmark.cpp' }
$Upstream = (Resolve-Path -LiteralPath $Upstream).Path
$Wrapper = (Resolve-Path -LiteralPath $Wrapper).Path
$compiler = Join-Path $VisualStudio "VC/Tools/MSVC/$Toolset/bin/Hostx64/x64/cl.exe"
$linker = Join-Path $VisualStudio "VC/Tools/MSVC/$Toolset/bin/Hostx64/x64/link.exe"
$vcvars = Join-Path $VisualStudio 'VC/Auxiliary/Build/vcvars64.bat'
$commandProcessor = Join-Path $env:SystemRoot 'System32/cmd.exe'
foreach ($required in @($compiler, $linker, $vcvars, $commandProcessor)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) { throw "Missing build dependency: $required" }
}

# Import the official compiler/SDK environment into this script process only.
# No source mutation, upstream scripts, solver execution, or permissive flags.
# The common runner deliberately omits PATHEXT. Fix cmd's child-tool lookup,
# and bypass PowerShell native dispatch (which otherwise may not set an exit code).
$env:PATHEXT = '.COM;.EXE;.BAT;.CMD'
$env:VSCMD_SKIP_SENDTELEMETRY = '1'
$env:SystemDrive = [IO.Path]::GetPathRoot($env:SystemRoot).TrimEnd([char[]]'\/')
$windowsFolders = @{
    ProgramFiles = [Environment]::GetFolderPath('ProgramFiles')
    'ProgramFiles(x86)' = [Environment]::GetFolderPath('ProgramFilesX86')
    ProgramW6432 = [Environment]::GetFolderPath('ProgramFiles')
    ProgramData = [Environment]::GetFolderPath('CommonApplicationData')
    CommonProgramFiles = [Environment]::GetFolderPath('CommonProgramFiles')
    'CommonProgramFiles(x86)' = [Environment]::GetFolderPath('CommonProgramFilesX86')
}
foreach ($name in $windowsFolders.Keys) {
    if ($windowsFolders[$name]) { [Environment]::SetEnvironmentVariable($name, $windowsFolders[$name], 'Process') }
}
$setup = Invoke-BuildProcess -File $commandProcessor -RawArguments "/d /s /c `"`"$vcvars`" -vcvars_ver=$Toolset >nul && set`""
if ($setup.ExitCode -ne 0) { throw "vcvars64 failed: $($setup.StandardOutput) $($setup.StandardError)" }
foreach ($line in ($setup.StandardOutput -split '\r?\n')) {
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
$compilation = Invoke-BuildProcess -File $compiler -NativeArguments $arguments -Directory (Join-Path $BuildRoot 'build/christophe')
$compilerExitCode = $compilation.ExitCode
# Streams are captured in full; the log groups stdout then stderr, not temporal order.
$diagnostics = $compilation.StandardOutput + $compilation.StandardError
$diagnostics | Set-Content -LiteralPath $log -Encoding utf8
Write-Output $diagnostics
$record = [ordered]@{
    schema = 'c4-0011-christophe-msvc-build-v1'
    startedUtc = $started
    finishedUtc = [DateTime]::UtcNow.ToString('o')
    compiler = $compiler
    compilerFileVersion = (Get-Item -LiteralPath $compiler).VersionInfo.FileVersion
    compilerSha256 = (Get-FileHash -LiteralPath $compiler -Algorithm SHA256).Hash.ToLowerInvariant()
    linker = $linker
    linkerFileVersion = (Get-Item -LiteralPath $linker).VersionInfo.FileVersion
    linkerSha256 = (Get-FileHash -LiteralPath $linker -Algorithm SHA256).Hash.ToLowerInvariant()
    toolset = $Toolset
    windowsSdkVersion = $env:WindowsSDKVersion
    commandProcessor = $commandProcessor
    pathExtensions = $env:PATHEXT
    telemetryDisabled = $env:VSCMD_SKIP_SENDTELEMETRY -eq '1'
    systemDrive = $env:SystemDrive
    windowsFolders = $windowsFolders
    nativeLaunch = 'ProcessStartInfo; UseShellExecute=false; CreateNoWindow=true; explicit ExitCode'
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
