# Default automatic-worker result

One fresh empty 7x6 root solve: **42.2349666 s**, EXACT first-player WIN, column 4. All six discovered P-core workers were verified on logical CPUs 0/2/4/6/8/10. All six were ready before root construction and exited cleanly. No remaining solver process.

Initialization 4.8125174 s; cleanup 0.0382723 s; application operation 47.1005411 s; external process wall 47.5329403 s. Process CPU 243.218750 s includes initialization and cleanup. Peak resident memory 7,397,687,296 bytes (6.890 GiB). Process cycles and node counters unavailable.

Default caches: 134,217,728 shared entries (4 GiB), 8,388,608 private entries (256 MiB) per worker; six private caches total 1.5 GiB, plus geometry/plans and runtime. No default setting override. Retained Node v27.0.0-nightly20260928b59840b593 / V8 14.6.202.34-node.36 on i5-12600K. No old affinity preload or four-core process mask. Exact launcher child invocation recorded for external measurement.

This is faster than the earlier 53.828 s historical four-worker mean and 57.652 s recent four-worker mean. One sample does not establish a repeatable speedup or isolate worker count from the additional aggregate private memory and run-to-run variation. The 10-second objective remains unmet. This is an empty-root exact solve, not a complete self-play game.

Raw output, stderr, external measurement and cleanup verification accompany this record. Experimental FFI warnings are retained. Solver/runtime files were not modified by the test.
