param([Parameter(Mandatory=$true)][string]$Config)
$ErrorActionPreference = 'Stop'
$configData = Get-Content -LiteralPath $Config -Raw | ConvertFrom-Json
$p = [System.Diagnostics.Process]::new()
$p.StartInfo.FileName = $configData.executable
$p.StartInfo.WorkingDirectory = $configData.cwd
$p.StartInfo.UseShellExecute = $false
$p.StartInfo.CreateNoWindow = $true
$p.StartInfo.RedirectStandardOutput = $true
$p.StartInfo.RedirectStandardError = $true
$p.StartInfo.RedirectStandardInput = $true
foreach ($argument in $configData.arguments) { $p.StartInfo.ArgumentList.Add([string]$argument) }
$p.StartInfo.Environment.Clear()
foreach ($property in $configData.environment.PSObject.Properties) { $p.StartInfo.Environment[$property.Name] = [string]$property.Value }
$clock = [System.Diagnostics.Stopwatch]::StartNew()
if (-not $p.Start()) { throw 'Process start failed' }
$null = $p.Handle # Retain the process handle for exit accounting.
$p.StandardInput.Close()
$stdoutTask = $p.StandardOutput.ReadToEndAsync()
$stderrTask = $p.StandardError.ReadToEndAsync()
$affinityError = $null
$actualAffinity = $null
try { $p.ProcessorAffinity = [IntPtr][long]$configData.affinityMask; $actualAffinity = $p.ProcessorAffinity.ToInt64() } catch { $affinityError = $_.Exception.Message }
$timedOut = -not $p.WaitForExit([int]$configData.timeoutMs)
if ($timedOut) { $p.Kill($true); if (-not $p.WaitForExit(5000)) { throw 'Child failed to exit within cleanup deadline' } }
$clock.Stop()
$cpu = $null; $peak = $null; $metricError = $null
try { $cpu = $p.TotalProcessorTime.TotalMilliseconds; $peak = $p.PeakWorkingSet64 } catch { $metricError = $_.Exception.Message }
if (-not $stdoutTask.Wait(5000) -or -not $stderrTask.Wait(5000)) { throw 'Output drain exceeded cleanup deadline' }
$stdout = $stdoutTask.GetAwaiter().GetResult()
$stderr = $stderrTask.GetAwaiter().GetResult()
[IO.File]::WriteAllText($configData.stdout, $stdout, [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText($configData.stderr, $stderr, [Text.UTF8Encoding]::new($false))
$result = [ordered]@{wall_ms=$clock.Elapsed.TotalMilliseconds;cpu_ms=$cpu;peak_rss_bytes=$peak;metric_error=$metricError;exit_status=$p.ExitCode;timed_out=$timedOut;process_id=$p.Id;requested_affinity_mask=$configData.affinityMask;actual_process_affinity_mask=$actualAffinity;affinity_error=$affinityError;affinity_boundary='set immediately after process start; IsoMax additionally binds individual workers before solver initialization';timing_boundary='immediately before Process.Start through child process exit; includes initialization, cold checks, RLC, solve and cleanup';process_tree='single solver process; threads counted in process CPU/RSS';performance_conclusion_allowed=$false}
[IO.File]::WriteAllText($configData.measurement, ($result | ConvertTo-Json -Depth 10), [Text.UTF8Encoding]::new($false))
$p.Dispose()
