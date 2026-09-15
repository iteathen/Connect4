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

## Dead-residual exact-draw experiment

### Exact theorem

Define a P0 live residual line as a four-line containing no P1 stone, and a P1 live residual line as a four-line containing no P0 stone. If both live-line counts are zero, every possible Connect Four line contains stones from both players. Since stones are never removed during forward play, no future move sequence can complete a four-line for either player. The position is therefore an exact draw independently of the remaining legal move count.

The theorem does not depend on a solved database, minimax result, heuristic score, or search depth.

### Instrumentation qualification

Commit `4df1a8da51c79cea5e0c14dacd63e18c51a8c096` instrumented the predicate without giving it pruning authority. It maintained both live-line counts incrementally, independently reconstructed them from raw board state in the randomized apply/undo frontier test, and counted only transitions that **first entered** the exact dead-draw region before the board was full. Descendants already inside the dead-draw region were not counted.

The full Node 26 verification suite passed. Search results and work remained unchanged: checksum `2804412475`, node counts, evaluator calls, tactical counts, TT behavior, cutoffs, moves, and normalized scores were identical.

### Incidence result

On the benchmark search region the exact predicate had **zero observed pruning incidence**:

- persistent fixed workload: `501,027` nodes, `0` early dead-draw root requests, `0` first-entry dead-draw transitions;
- reset-each-root fixed workload: `624,351` nodes, `0` early dead-draw root requests, `0` first-entry dead-draw transitions;
- wall-clock sweep: every measured depth from 1 through 14 had `0` early dead-draw root requests and `0` first-entry dead-draw transitions.

This is an empirical statement about the exercised branch region, not a negation of the theorem and not evidence that such positions cannot occur elsewhere.

### Maintenance cost

The same-runner A-B-B-A job compared the instrumented candidate directly with accepted checkpoint `6da8d00e607e860cce7a32628c07d4e98de91e0c` on Node 26.7.0 / AMD EPYC 7763.

Means of the two control and two candidate observations:

- persistent workload: `319.146 ms control -> 317.947 ms instrumented`, about **0.38% faster** for the instrumented candidate, treated as noise;
- reset-each-root workload: `337.596 ms -> 353.580 ms`, **4.73% slower**;
- depth-12 median: `118.004 ms -> 124.062 ms`, **5.13% slower**;
- depth-13 median: `214.725 ms -> 228.123 ms`, **6.24% slower**;
- depth-14 median: `379.851 ms -> 400.955 ms`, **5.56% slower**.

The deeper-search measurements show a real transition-maintenance tax while the measured opportunity count is zero.

### Disposition

**Exact theorem; runtime mechanism deferred.**

Do not promote live-residual-line counters into the incumbent hot position state at this checkpoint. The predicate remains valid and available for future use, but maintaining it on every apply/undo is not justified by the current workload. The production/research runtime should return to the accepted `6da8d00...` first-order frontier shape while retaining this result as evidence.

A future revisit should be triggered by one of the following rather than by theorem validity alone:

- a deeper or different workload exposes meaningful dead-draw incidence;
- another consumer already needs live-residual-line counts, reducing marginal maintenance cost;
- the counts become available essentially for free from a different representation;
- a broader certified terminal frontier uses the same state for multiple exact consequences.

The next separate experiment is the horizon seam: exact tactical classification currently occurs after the heuristic horizon cutoff. Moving certified immediate-win / forced-response consequences ahead of heuristic evaluation may intentionally change horizon semantics, so it must be qualified as a semantic improvement experiment rather than folded into this behavior-preserving benchmark result.
