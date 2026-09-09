# Exact-solver research prototypes — 2026-09-08

These files are **dirty research prototypes**, not maintained Connect4 source and not specification authority.

They preserve the current executable line used for the dependency-chunk cleanup + lazy YBWC experiments:

- `twoword_solver_depclean.mjs` — fixed-width two-word exact negamax core with dependency-family TT chunks and task-boundary proof-only reclamation;
- `ybwc_depclean_worker.mjs` — worker wrapper;
- `ybwc_depclean_start.mjs` — runtime worker-capacity selection, lazy eldest-first parallel shell, dynamic coarse resource selector, and start-position runner;
- `depclean_check.mjs` — small exact-result/correctness probe for the cleanup solver.

Representative earlier benchmark sources are also checked in individually, including the task-local TT, capacity sweep, raw multicore throughput, lazy YBWC, and dynamic YBWC experiments.

For complete recovery, `sandbox-all-2026-09-08.tar.gz.b64` is an exact compressed snapshot of **all `.mjs` prototypes present in the sandbox at checkpoint time**. Decode it and verify the resulting archive before extraction:

```sh
base64 -d sandbox-all-2026-09-08.tar.gz.b64 > sandbox-all-2026-09-08.tar.gz
sha256sum sandbox-all-2026-09-08.tar.gz
# expected: 0feb70443f7c532f759608e2638ef31f11dfecbfc002331dcf3412eb1cabc3e1
tar -xzf sandbox-all-2026-09-08.tar.gz
```

`SANDBOX_MANIFEST.sha256` records the SHA-256 of each prototype source in that archive.

The clean 15-minute empty-board configuration recorded in `docs/research/evidence/2026-09-08-empty-board-cleanup-15min.log` corresponds to the equivalent of:

```sh
timeout 900s node ybwc_depclean_start.mjs "" 64 4 1
```

On another machine, do not hard-code `4`; omit that argument or replace it with the runtime capacity under test. `ybwc_depclean_start.mjs` caps the requested worker count by `os.availableParallelism()`.

The prototype currently gives each worker a separate physical TT slice inside the shared backing buffers. That was deliberate experimental isolation. The next planned experiment is a **global shared dependency TT** so transpositions and compact cutoff/best-move hints can be reused across workers.

Do not promote these files into maintained source by copying them blindly. Reassess against the maintained oracle and accepted Connect4 contracts, qualify exact results, then implement through normal ownership boundaries.
