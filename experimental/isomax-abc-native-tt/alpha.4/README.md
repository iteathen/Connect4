# IsoMax 0.3.0-alpha.4 — source/physical mathematics comparison (JS-only)

Experimental successor suite. **No modifications to shipped IsoMax 0.2.0-rc.6** or to `research/semantic-quotient`. All maintained code and all executed tests use JavaScript (ESM) / Node V8, without C++/Python, native addons, solved-game inputs, or opening books.

## Comparison candidates and native TT

- A — physical gravity-column unary/sentinel exact state, owner-bitboard other-three-site K4 checks, TT with physical keys.
- B — original-K4 owner viability bitplanes, XOR deficit planes, TT with packed column heights and exact source keys.
- C — same exact semantic source identity as B, independently implemented interleaved owner-word TT with proof-failure hint, plus guarded two-distinct-playable-win fork certificate.

A/B/C have distinct optimized-for-carrier hashing, equality, and table layouts. All share legal first-win-stopped Connect Four rules, ordinary WDL alpha-beta windows, center-first move ordering, same memory budget, no prior result or book. Record widths are generated from `columns`, `rows` (1..10) and number of original K4s: on 7x6, 12/32/32 bytes per entry A/B/C. 10x10 supports 238 original K4 lines with geometry-generated widths.

## Alpha.4 change relative to alpha.3

Proved conditional FIRSTWIN absence: every recursively admitted successor was generated after excluding mover immediate wins, blocking an existing opponent immediate threat, and rejecting moves that expose a new opponent immediate FIRSTWIN above the landing. Therefore the next mover's immediate-winning-column mask is guaranteed empty. The root still tests both owners because input histories are arbitrary, but recursive nodes enumerate only the *opponent* immediate-win mask. This deletes recurring hot-loop work without additional state or TT metadata. Independent physical-board and source-state tests validate the exact admitted-child guard for configurable dimensions; full-root net wall gain is not yet established.

## Alpha.3 changes retained from alpha.2

Each candidate's independent native TT has a zero-bound conjunction/merger: same-state >= DRAW and <= DRAW yield exact DRAW. Exact proven values cannot be overwritten by weaker same-state bounds. The admission requires full native key equality; cross-key slot collisions never merge. C preserves negative-certificate hints on same-state merges. This adds same-state comparisons to stores, so it may increase CPU time; **full-root solve time, not nodes saved, decides whether to retain it**.

## Alpha.2 changes retained from alpha.1

- No changes to TT key identity or record layouts in alpha.2; alpha.3 also retains each native key and layout.
- Exact one-ply FIRSTWIN poisoning: a move that leaves an already-ready opponent line newly playable at the next site above is recognized as a losing move without recursing. For A it uses its native other-three-site physical masks; B/C query source grade-one line mask intersection with the above-site incidence.
- TT's stored legal move reused for bound re-search ordering; exact WDL and one-sided bounds still require exact full-key match.
- Both null-window WDL questions at root are searched under ordinary exact alpha-beta, with a second pass only if the first cannot certify WIN; no historical solved-board premise.
- B/C use native source-viability one-sided zero-bounds: if player P has no surviving original K4, it cannot force a WIN. These bounds apply only when the current alpha-beta window admits a proven zero bound. A is not forced to maintain extra source masks just to get these bounds.

The added math has *not* demonstrated net full-root speed benefits. No optimization is qualified until full empty 7x6 complete solves are repeated on comparable Node26/V8 hardware with the same TT allocation and no timeout/censoring.

## Running

```sh
node --test test/*.test.mjs
node run.mjs --variant A --columns 7 --rows 6 --tt-mib 512 --node-limit 50000000000 --deadline-ms 900000
node run.mjs --variant B --columns 7 --rows 6 --tt-mib 512 --node-limit 50000000000 --deadline-ms 900000
node run.mjs --variant C --columns 7 --rows 6 --tt-mib 512 --node-limit 50000000000 --deadline-ms 900000
```

The full-root harness is at `../full-empty-benchmark.mjs`. Only a complete oracle-blind empty 7x6 solve returning exact WDL and a legal WDL-preserving move can qualify a timed comparison; partial positions and node cutoffs are diagnostics, not winner selection. Harness runs all candidates serially in independent fresh processes and refuses to rank incomplete runs:

```sh
node ../full-empty-benchmark.mjs --tt-mib 512 --repeats 2 --deadline-ms 900000 --node-limit 50000000000 --reset-output yes
```

Node 22.16.0 is available in the current local environment (V8 12.4), **not target Node26+**. Local cgroup memory is 4 GiB; benchmarks on this machine cannot reproduce the shipped six-worker 12GiB configuration. Solver is single-worker with local-only TT; no claim of Node26/JIT performance or multiworker scaling.

## Validation

`node --test test/*.test.mjs` checks FIRSTWIN/legal-state equivalence against separately written physical JavaScript oracle, fresh WDL solves against physical minimax, geometry and TT key exactness through 10x10, and exactly-one-ply poisoned move correctness. The poisoned move oracle test exercised 68,267 legal move checks across multiple geometries; it verifies source and physical implementations against independent physical wins, not just mutual agreement. These are bounded controls, not exhaustive 7x6 proofs.

## Status

`EXPERIMENTAL / FULL-ROOT QUALIFICATION OPEN`. No production branch, old package, or GitHub commits were changed. Retain alpha.1 as immutable performance history; alpha.2 is a new version for attempted complete-solve testing. All numbers must identify their alpha series, memory, Node/V8 and CPU environment.
