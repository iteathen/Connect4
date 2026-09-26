# Restored baseline verification

Active worktree and preserved control both match clean JSMinSys
49f88b2b0cd45ae427f43ceece568a4895953e5f; live remote fetched and matched.
No source diff. No solver changes made during verification.

Four-worker position 45461667, four ABBA blocks, sixteen uninstrumented
fresh-process samples. All EXACT rootWdl=1 / move=3, clean shutdown and
validated cycle partitions. Restored arm mean cycles 16915929062;
mean wall 1033.7725625 ms. Relative total cycles -0.82%, descriptive
95% interval [-3.82%, +2.18%]: consistent with the identical control.
This is a restoration check, not an optimization or full benchmark claim.

Repository test command: 141/142 pass. Existing baseline failure remains:
CPC pooled-frontier response extends all-even pairing without counting omitted
frontiers, test/cpc-alphabeta.test.mjs:119, actual 0 versus expected 2.
The restoration is exact; the repository suite is not entirely green.
