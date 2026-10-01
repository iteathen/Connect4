# v4 first-nine timing baseline

**Status:** computational-cost baseline only; this does not promote v4 to a sound universal proof.

Trajectory: `444441566`

Measured repetitions: 1000; warmup repetitions: 200.

## Primary hot total

- minimum: 23.198103 ms
- median: 23.725867 ms
- p95: 24.396581 ms

The primary interval begins with the empty rank-local state ready and includes structural selection, deterministic minimum representative selection, and application through ply 9. It excludes process startup, checkout, source I/O, module initialization, oracle/book work, JSON/logging, Actions setup, and build time.

## Per-ply calculation time

| ply | representative | selected set | min ms | median ms | p95 ms |
|---:|---:|:---|---:|---:|---:|
| 1 | 4 | 4 | 1.687827 | 1.732003 | 1.943088 |
| 2 | 4 | 4 | 6.141235 | 6.381123 | 6.554503 |
| 3 | 4 | 4 | 1.626936 | 1.687316 | 1.890570 |
| 4 | 4 | 4 | 5.298182 | 5.576199 | 5.793934 |
| 5 | 4 | 4 | 1.500616 | 1.556640 | 1.808818 |
| 6 | 1 | 1,7 | 1.412455 | 1.473636 | 1.714246 |
| 7 | 5 | 5 | 1.412494 | 1.460515 | 1.716910 |
| 8 | 6 | 6 | 2.057200 | 2.131772 | 2.354946 |
| 9 | 6 | 6 | 1.413636 | 1.455569 | 1.661176 |

## Environment

- Node: v26.7.0
- V8: 14.6.202.34-node.28
- CPU: AMD EPYC 9V74 80-Core Processor
- OS: Linux 6.17.0-1022-azure
- runner: Linux / X64
- benchmark commit: 49de2d74aae55cc41951e5533b579f73ede6d036

Raw distributions and excluded initialization measurements are preserved in the sibling JSON file.
