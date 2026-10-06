# Automatic memory profile qualification

The default empty7x6 run in `default-run/` used frozen runtime
`89b1b147b8811bfd343724150ed304a081d61498`, package rc.4, and consumer
`081b601633acfed2adb281a53859acd63e2e299a`. No settings were overridden.
The command, runtime hash, memory snapshot, raw output and external measurement
are retained together. Node27 nightly/V8 and the i5-12600K match the local campaign.

Automatic discovery selected six P-core workers, verified on logical CPUs
0/2/4/6/8/10, and the tested8GiB shared profile with256MiB private per worker.
The empty board returned EXACT/WIN, column4, in39,662.3713ms after all workers
were ready. Initialization4919.246ms and cleanup36.8725ms are separate.
External wall45131.0462ms, process CPU234750ms and peak RSS11699208192bytes
include preparation and cleanup. All six workers exited and cleanup was true.
Cycles and production node/TT counters are unavailable, not zero.

This is one default-path confirmation, not a new repeated performance campaign
or evidence of a universal optimum. The generic measurement wrapper's
`performance_conclusion_allowed:false` prevents automatic promotion; the raw
successful result is interpreted here only as a configuration/solve confirmation.
16–128GiB remain experimental with no full-capacity performance qualification.

## Final package confirmation

`final-default-run/` uses runtime40b19431f00174c5d52c442677d67ec698e8c50a
and consumer1952b38c3ea892de921674afaed9127d2addcc32. The retained Node/V8,
JIT flags, automatic six-core discovery and default empty7x6 command are unchanged.
Available physical memory was15529377792bytes, but available Windows commit
limited admission to12305539072bytes. The8GiB profile requires12348030976bytes
with six private tables and the2GiB reserve, so auto correctly selected4GiB.

EXACT/WIN, column4,42,226.11ms primary solve; initialization3993.1438ms,
cleanup27.5771ms, external wall46519.3737ms, CPU243375ms and peak RSS
7410049024bytes. Six workers were verified on0/2/4/6/8/10 and all exited.
The cleanup check found no retained solver process. These two default-path
confirmations use different actual TT capacities and are not a same-configuration
regression comparison.

The final package's native startup workflow passed Windows, Linux and macOS:
https://github.com/iteathen/JSMinSys/actions/runs/37524761262 . Its exact head
and individual jobs are retained in `native-startup-ci.json`. CI is correctness
and startup evidence, not performance authority. Local packaged tests81/81,
consumer exact tests9/9, focused cache/memory checks22/22 and catalog563units pass.
The extracted archive starts and solves a tiny1x4 control with six workers;
this installation check is separate from the standard7x6 performance workload.
