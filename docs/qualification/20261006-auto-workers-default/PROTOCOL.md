# Automatic-worker default full-solve test

One fresh empty 7x6 root solve on IsoMax rc.3, source snapshot 5fad1396c61b965da2a547e1c61603f9b242777f. No worker, geometry, cache, topology or timeout CLI overrides. Exact launcher child flags are retained; the child is launched directly solely for external single-process accounting. Node is the previously measured v27 nightly, not a new runtime variable.

Default 4 GiB shared TT plus 256 MiB private TT per discovered worker. No old fixed affinity preload, target file, process-mask restriction or benchmark environment configuration. Expected unrestricted i5-12600K discovery: six distinct physical P-core workers. Actual discovery, bindings and readiness are authoritative in stdout. No RLC, book, persisted TT or expected answer in timed runtime.

Primary: all-ready through actual empty-root construction and exact result. Init and cleanup separate. Process CPU/peak RSS include startup and cleanup. OS cycle count is unavailable. Outer safety timeout 750 seconds leaves default 600-second search and 120-second initialization ceilings intact. One trial provides a sample, not a repeatable speedup claim.

Run: pwsh -NoProfile -File docs/qualification/20261006-auto-workers-default/measure.ps1 -Config docs/qualification/20261006-auto-workers-default/invocation.json
