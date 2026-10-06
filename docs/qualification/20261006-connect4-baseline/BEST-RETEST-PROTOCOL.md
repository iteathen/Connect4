# Historical best-version retest

Owner request: locate the best-performing version and test it again. No solver changes.

The retained localhost prepared-empty-solve records were scanned by recorded primary solve time, requiring an EXACT result. The minimum is `fusion-c66-01`: 53,450.9425 ms, JSMinSys commit `427f691b00248ac15b795e187508bf5144f69706` (tree `27bd2d8b21a037ea2d7f17d98b08d1ddb2fa7e40`). Its second C66 run was 54,205.9604 ms. These are empty 7x6, four-worker exact solves, with no RLC or supplied prefix. Earlier prefix/RLC timings are a different workload.

Retest exactly that source using an isolated `git archive` snapshot. Two sequential fresh processes, both reported, without best-run selection. Preserve the original `fusion-c66-01/invocation.json`; change only source-location paths and output/TEMP paths. Use the original measured environment, executable SHA, JIT flags, affinity mask/targets, shared/private capacities, topology and prepared timing boundary. `retest-best.ps1` performs this transformation. No concurrent benchmark processes. Search safety timeout remains 600 s (external 650 s).

The original benchmark entry point reports process cycles for the whole operation including initialization/cleanup. These are not search-only cycles. Exit status 3 denotes the unmet 10-second objective even when the solve is EXACT; it is not a solve failure. Validation occurs after return.

Current Connect4 package baseline: 58,346.4381 / 55,594.5886 / 59,013.8389 ms, all EXACT WIN, c4, four workers ready/exited and clean. A historical retest distinguishes reproducibility from the apparent slowdown; it does not by itself identify a cause. Comparing source shows only a cold supplied-plan reuse/accounting fix between the historical C66 source and the final package source; the hot worker source is unchanged.

Reproduction: `git archive --format=zip --output=<archive> 427f691b00248ac15b795e187508bf5144f69706` in JSMinSys; extract to `C:/r/isomax-best-427f691b-20261006`, then run `./docs/qualification/20261006-connect4-baseline/retest-best.ps1 -Run 1` and `-Run 2` from this Connect4 checkout. `measure.ps1` is the unchanged measurement script used for the Connect4 confirmation. The original invocation and source tree identity must be available before execution.
