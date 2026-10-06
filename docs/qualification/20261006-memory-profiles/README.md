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
