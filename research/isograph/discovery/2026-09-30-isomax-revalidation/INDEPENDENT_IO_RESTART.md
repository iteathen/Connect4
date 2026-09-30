# Independent oracle checkpoint I/O interruption

The initial 4x5-k4 run completed independent enumeration and WDL for 1,706,255
states, then encountered Windows EPERM replacing `independent-progress.json`.
The failure handler immediately succeeded replacing that same path. Identical
source/config restart reused verified rank, WDL and row shards; a second
transient rename failure recurred later. No structural mismatch was observed.

Raw failure/checkpoints are preserved locally in
`independent-4x5-k4-interrupted-io/`; the first failure is separately saved as
`independent-restart-01-failure.json`. The final progress artifact contains the
second failure. This is an I/O qualification observation, not discovery evidence.

The I/O repair retries atomic rename on EPERM/EACCES/EBUSY at 10,20,40,80,160,320ms,
then surfaces the error. It never deletes the prior checkpoint. This is bounded
Windows sharing-error handling, not an assumption that disk writes succeeded.
Two injected-error regressions pass, alongside all six semantic toy tests.

The oracle's mathematical implementation is unchanged. Since runner source
identity changed, no old config was rewritten or migrated: the interrupted
directory was preserved, and a fresh 4x5-k4 run will use new pinned identities.
The completed 6x3-k3 evidence remains valid under its original committed source
649596b4 and config f475dc8cfafcdc3cedbce63bf4c7db32fb82129e106ddc03a4dd858f28115cdd.
