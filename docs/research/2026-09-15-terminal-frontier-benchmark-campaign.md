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
