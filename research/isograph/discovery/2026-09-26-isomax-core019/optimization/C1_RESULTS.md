# C1 fast optimization screen — 2026-09-26

C1 passes the bounded correctness and performance screen. Completed child-upset
membership now suppresses redundant closure expansion independently per player.
The production change is in JSMinSys; there is no new representation or solver.
C2 endpoint publication and C3 reflection fusion remain queued, not implemented.

Baseline JSMinSys `04d37498607ace16dae33c79462ddfe1503c8a0d`.
Measured candidate `393b8a1ac98d13ece5109246620b072ee92878dd`, following implementation
`f6080f7d08fee6f561142b533a67ee570c8bd7a5`. Subsequent documentation does not change
the measured source. This result does not extend the frozen Core 0.19 rendering's
source scope automatically. Discovery outcome and source qualification stay separate.

## Whole-operation results

`summary.json` is reproduced by `node summarize.mjs`. It validates all 36 samples,
the two revision/source hashes, outcomes/moves, four-worker cleanup and limits.
Numbers are arithmetic means of six fresh processes per variant per input.

| Input | Baseline ms | C1 ms | Time change | Baseline cycles | C1 cycles | Cycle change |
|---|---:|---:|---:|---:|---:|---:|
| 45461667 | 1116.62 | 1053.27 | -5.67% | 18,460,174,998 | 17,541,083,126 | -4.98% |
| 13333111271421 | 928.85 | 883.47 | -4.89% | 15,206,157,609 | 14,563,022,063 | -4.23% |
| 13333111444444 | 2045.45 | 1980.04 | -3.20% | 31,502,592,588 | 30,490,548,316 | -3.21% |

Every one of nine ABBA blocks favors C1 on both measures. All results are exact
P0 win (+1), expected physical moves 3/2/2, with all four workers exited. This is
a quick four-worker screen, not a full Fhourstones score or universal speed claim.
Only winner nodes are available; never divide all-thread cycles by that count.
Winner choice varies on the first input, so equal total work is not established.
No confidence interval, core affinity or fixed CPU frequency is asserted.

The measured unit is the entire prepared `runLazySmpConnect4Rba32` invocation,
including ingress, worker startup, solving and join. Geometry/import/counter
preparation is excluded. Native QueryProcessCycleTime sums user/kernel execution
across process threads. Runtime: Node26.7.0, V8 14.6.202.34-node.28, Windows x64,
i5-12600K. Limits/settings: four workers, five seconds, local/shared cache65536,
samplemask7, CPC-only. No timeout increased; no failed samples retried.

## Evidence groups and provenance

- `clean-*`: sole performance batch used above. Three predeclared ABBA blocks
  per input, six samples per variant. No concurrent campaign tests/diagnostics.
- `a1..a4` / `b1..b4`: exploratory samples, excluded from confirmation statistics.
- `confirm-*`: first full batch, excluded because independent review tests
  overlapped its beginning. The entire batch is retained, not selectively filtered.
  The clean batch began after the reviewer finished; no failure was retried.
- `trace-*`: separate perturbed diagnostics, excluded from performance statistics.
- `census-*`: separately instrumented operation census, never timing evidence.

Candidate samples honestly retain a nonempty Git status: raw LF bytes restored
from committed blobs triggered stale CRLF index-stat reports. `git diff` showed
no content change; `git add -u -- addons` refreshed the index without a staged
diff or commit. `source-byte-verification.json` subsequently verifies all 16
ledger-bound modules byte-for-byte against candidate HEAD. Each clean sample's
cofactor SHA-256 matches that committed source. This post-run check is not a
retroactive runtime attestation of every file; raw status was not rewritten.
The ledger's original mixed-ending hash failure and its correction are preserved
in the two candidate commits. No semantic source changed during the clean batch.

## Mechanism, correctness and NEES

`C1_REVIEW.md` records independent proof/implementation review. Each previous
insertion completes an upset in the same child basis, so an existing image
absorbs its expansion. The new guard is before the image write, per surviving
player. Terminal handling, geometry, identity, cache policy and ordering stay fixed.
No hot allocation/string/state is added.

Baseline fails the principal-upset regression (3 expansions instead of 1), C1
passes. Initial test construction used the wrong convention for shapeContains;
that fixture was corrected to test its index-or-minus-one result before the
meaningful red/green check. Physical-oracle differential tests exercise over
1,000 transitions, terminals and both players across 4x4/7x6/10x10 and dense/sparse
profiles. Expected basis generation is shared with unchanged code, so the oracle
is independent for residual membership, not for all geometry. Full suite159/159;
catalog297 sealed +192 addon units and geometry audit pass. Repository benchmark
tools complete as smoke checks, not comparative speed evidence.

The independent prefix/action census has271 transitions, identical output SHA256
`fc2e520efc44b8b2c1d1992aaeb81e2260485ee0c6e077d244cac6721ca07a6b`:
preparations16058 ->15749; subset tests188885 ->179160 (-5.15%). This is not a
full-tree count and has no terminal cases; terminal tests are separate.

The JSMinSys affected-scope note `research/2026-09-26-rba-cofactor-absorption.md`
records NEES Draft0.5 authority, E0/E1 scope, coupled semantic/derivation mechanism,
guards, falsifiers, symbolic cost ledger and regression surface. Full system
conformance, all-workload performance and exact instruction cycles remain unclaimed.
The added membership tests have real cost: fewer operations alone was not admission.

`trace-summary.json` plus compressed raw traces preserve TurboFan observations.
Both versions show eager deopt reason "Insufficient type feedback for binary
operation" at bytecode offset461: baseline2, candidate3 in one traced run each.
The signature predates C1; equal deopt rates are not established. Traces include
optimized code and source-position data, not proof of minimum-cycle assembly.

## Reproduction and next gate

Use the exact library revisions above and Node26.7.0. From this directory:

```text
node --experimental-ffi run-abba.mjs <baseline-library> <candidate-library> <Connect4-tools/cycle-counter.mjs> fresh
node probe-cofactor.mjs <baseline-library> census-fresh-a.json
node probe-cofactor.mjs <candidate-library> census-fresh-b.json
node summarize.mjs
```

`summarize.mjs` reduces the frozen clean batch; change its input prefix in a new
experiment to analyze fresh measurements. Counter source is Connect4 solver
revision `2ed88683ba46fc4d99790414ad99a2e409acf400`, `tools/cycle-counter.mjs`.
Traces add `--trace-opt --trace-deopt --print-opt-code
--print-opt-code-filter=connect4RbaCofactorKnownHeight` to a separate run-sample
invocation. Reusing evidence filenames is forbidden by the timing harness.

Proceed with JSMinSys review/CI. Do not silently repin Connect4 or merge this
experiment into its historical rendering. Reopen on changed runtime/contracts or
whole-operation regression. Keep C2/C3 isolated for causal attribution.
