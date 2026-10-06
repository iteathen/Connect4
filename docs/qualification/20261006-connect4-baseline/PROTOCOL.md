# Fresh Connect4-location IsoMax baseline

Owner requested a small fresh series before any optimization. Freeze three
sequential complete empty7×6 solves; retain every run, with no excluded warm-up
or outcome/timing-based selection. Temporary experiment owner is the existing
`work/isomax-jsminsys-rebuild` implementation at
`cb3c877e8f1534491b41304876b1e0928ed3c966`. Solver/package files remain unchanged.

Reuse the actual Connect4 transfer invocation and measurement script at
`C:/r/connect4-isomax-rc2-full-20261006/`. Four deep center/live workers, P-cores
0/2/4/6, processmask85, Node27nightly20260928b59840b593, V814.6.202.34-node.36,
2400/9600 inlining flags and identical startup/affinity preloads. Shared4GiB,
private256MiB per worker, base plans1GiB, compiled auxiliary512MiB, native32,
shared proof bounds, sampling0, no root-frontier/RLC/opening/book/prior cache.

Only fresh temporary/output locations and the recorded repository evidence SHA
change between invocations. Each child is a fresh process with cold TTs. Search
safety600s, external ceiling650s. No unrelated process is terminated or power,
memory, placement or runtime setting adjusted to improve the result.

Primary boundary is all-ready -> actual empty root construction -> exact result
observed. Record initialization, primary solve, cleanup, whole operation and
external process wall separately. The existing measurement tool records process
CPU time and peak RSS; hardware process cycles are not exposed by this tool and
remain unavailable. No hot metrics or tracing are introduced.

Save exact invocation, source identity, package/runtime hashes, raw stdout/stderr,
measurement and actual per-worker affinity. Capture pre/post memory and CPU
background snapshots for context. Confirm worker exit/cleanup and no remaining
solver process before another run. Validate expected outcomes only after return;
they are never provided to the solving process.

Report all three primary times, mean, median and range. Compare with the recorded
53.828s candidate mean and57.461s transfer point descriptively. Three samples alone
do not identify an environmental cause or establish an optimization regression.
Retain evidence on the owning implementation head before retiring this experiment.
