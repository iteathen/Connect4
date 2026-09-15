# Terminal-frontier benchmark campaign

**Research direction:** Josh Oshiro

## Purpose

Measure whether exact incremental terminal / tactical consequence state can replace repeated hot-path rediscovery in the incumbent Negamax implementation without weakening the incumbent conformance contract.

This campaign starts from `research/frontier-negamax-conformance` commit `9bf620adaf5586b5f44cdaf4f6565d57928c8592` and uses the repository's existing `benchmark-evidence` GitHub Actions workflow (Node 26.7.0, Ubuntu 24.04) as the authoritative performance environment.

## Governing rule

A performance regression is not sufficient evidence to reject a structurally sound candidate. Before rejection, re-run and diagnose at least: timing noise, node-count change versus per-node throughput, duplicated computation, allocation/GC pressure, representation/cache overhead, and whether the candidate only becomes advantageous after adjacent work is also eliminated. Where the mechanism remains sound, perform a corrective implementation pass and remeasure.

## Baseline

The first commit on this branch changes documentation only. It exists to trigger a behavior-identical Node-26 benchmark run against the exact starting solver state.

Freeze for every comparison:

- incumbent decision checksum;
- root fixture and requested depths;
- node and evaluator-call counts;
- tactical immediate-win / forced-block / double-threat counters;
- alpha-beta cutoffs;
- TT probes, hits, returns, stores and replacements;
- persistent-TT and reset-each-root elapsed distributions;
- wall-clock depth sweep;
- runtime / runner identity.

## Candidate sequence

1. Establish behavior-identical baseline.
2. Introduce the smallest exact incremental consequence cache / terminal frontier that can eliminate repeated tactical rediscovery while preserving incumbent results.
3. Qualify output equivalence before treating timing as meaningful.
4. Diagnose any regression before rejection.
5. Separately test horizon exact tactical classification before heuristic evaluation, because that experiment may intentionally alter horizon semantics and therefore must not be conflated with the behavior-preserving cache experiment.

## Proof boundary

Only exact consequences may terminate or prune search. Structural proximity (degree-2 residuals, control potential, cofactor proximity, or future obligation candidates) may influence ordering only until independently certified. Exact residual identity must be preserved: counts alone are insufficient because multiple winning lines can share one completion cell.

For a player-labelled live four-line residual `R`:

- `|R| = 0` is a physical win;
- `|R| = 1` with its remaining cell currently playable is an immediate winning successor;
- two distinct playable singleton residual cells give an exact double threat, subject to current-player earlier-win precedence;
- one opponent singleton gives a unique forced nonlosing block;
- no surviving residual line for either player is an exact dead draw.

Future guarded NDC/obligation certificates remain outside the benchmark's pruning authority until their temporal/support proof obligations are discharged.

## Qualified behavior-preserving checkpoint

Accepted research checkpoint: `6da8d00e607e860cce7a32628c07d4e98de91e0c` (`research: fuse exact singleton tactical classification`).

The accepted representation keeps first-order exact structural state at the position transition boundary:

- packed owner counts per four-line;
- XOR identity of the remaining empty cells per line;
- exact singleton residual reference counts per board cell;
- incremental physical terminal status.

The evaluator consumes the maintained line state rather than reconstructing every line from board cells. Search classifies both players' playable singleton residuals in one center-ordered pass, preserving incumbent immediate-win precedence, distinct completion-cell identity, and first-block behavior.

All frozen search work remains identical to the starting solver on the benchmark workload: decision checksum `2804412475`, nodes, evaluator calls, tactical counters, alpha-beta cutoffs, TT probes/hits/returns/stores/replacements, moves, and normalized scores.

### Same-runner original-base comparison

On one Node 26.7.0 Intel Xeon Platinum 8573C runner using BASE -> CANDIDATE -> CANDIDATE -> BASE:

- persistent workload mean: `453.847 ms -> 270.073 ms`, **40.49% lower elapsed time**, about **1.680x throughput-equivalent speedup** at identical node count;
- reset-each-root mean: `516.414 ms -> 297.438 ms`, **42.40% lower elapsed time**, about **1.736x**;
- depth-12 wall-clock median mean: approximately `202.440 ms -> 105.962 ms`;
- depth-13 wall-clock median mean: approximately `357.493 ms -> 186.531 ms`;
- the 250 ms wall-clock frontier advanced from depth 12 to depth 13.

### Same-runner comparison against the pre-fused optimized frontier

Against `2623f64f3b292420454b44747f4dbd073c8e98a1` on one Node 26.7.0 AMD EPYC 7763 runner:

- persistent workload mean: `317.283 ms -> 293.323 ms`, **7.55% faster**;
- reset-each-root mean: `345.149 ms -> 323.084 ms`, **6.39% faster**;
- depth-12 median mean: `121.822 ms -> 112.781 ms`, **7.42% faster**;
- depth-14 median mean: `374.184 ms -> 359.261 ms`, **3.99% faster**.

This isolates the benefit of deriving playable tactical consequences cheaply at read time rather than maintaining a second-order playable aggregate on every apply/undo.

## Regression diagnosis findings

The first incremental frontier maintenance-only experiment was slower before any consumers were switched over: diagnostic hosted-runner measurements were roughly 13.8% slower persistent and 16.2% slower reset. That result was not treated as rejection. Once tactical queries and then the evaluator consumed the maintained structural state, the transition tax was more than amortized.

A later second-order cache maintained distinct currently playable singleton counts and identities on every transition. Same-runner comparison against the pre-aggregate optimized control showed it was effectively neutral: persistent mean was about **0.60% faster**, while reset mean was about **0.56% slower**. Because the extra transition complexity did not earn a stable benefit, it was removed rather than promoted.

The successful correction was to retain the first-order exact residual frontier and derive the small playable consequence set in one fused read-side pass. This produced another material speedup over the already-optimized control.

### Structural conclusion

Maintain stable first-order structural facts once when they have multiple consumers. Do not automatically materialize every exact derived consequence as transition state. A derived relation belongs in the hot state only when its read savings exceed its apply/undo maintenance cost under the actual search workload.

## Dead-residual exact-draw instrumentation

The next behavior-preserving experiment measures the exact draw condition before granting it pruning authority.

Define a P0 live residual line as a four-line containing no P1 stone, and a P1 live residual line as a four-line containing no P0 stone. If both live-line counts are zero, every possible Connect Four line contains stones from both players. Since stones are never removed during forward play, no future move sequence can complete a four-line for either player. The position is therefore an exact draw independently of the remaining legal move count.

Instrumentation rules:

- maintain `liveResidualLineCount0` and `liveResidualLineCount1` incrementally from the existing per-line owner counts;
- validate both counts independently against raw board reconstruction across multiple board sizes and repeated apply/undo;
- count only transitions that reach the exact dead-draw predicate **before the board is full**;
- exclude ordinary full-board draws, which the incumbent already terminates exactly;
- do not change search return values, TT semantics, node counts, tactical classification, or evaluator semantics in the instrumentation phase;
- pair the instrumented candidate directly against accepted checkpoint `6da8d00e607e860cce7a32628c07d4e98de91e0c` on the same Node 26.7.0 runner.

Only if the predicate occurs with useful incidence and its maintenance cost is acceptable should a separate commit enable exact early-draw termination. Horizon tactical reordering remains a separate semantic experiment.
