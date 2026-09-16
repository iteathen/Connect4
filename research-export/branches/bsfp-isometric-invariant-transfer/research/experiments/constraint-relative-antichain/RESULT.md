# Constraint-relative antichain qualification — first exhaustive control

**Status:** completed semantic control; performance implication not yet established.

**Research direction:** Josh Oshiro.

**Target:** unregistered hypotheses `BSFP_CONSTRAINT_RELATIVE_ANTICHAIN.md` and `BSFP_FEASIBLE_SLICE_REDUCTION.md`. No canonical claim ID is assigned yet, so this packet remains under `research/experiments/` rather than normalized `research/evidence/`.

## Hypothesis

For a fixed support, positive BSFP ownership generators may be normalized relative to an exact feasible-family theory `C` rather than only by raw subset on the full Boolean cube.

The first two deliberately weak tiers are:

- **Tier A:** exact P0 ownership cardinality at the support rank;
- **Tier B:** Tier A plus exact nonterminal NAE constraints on every fully occupied geometric winning line.

The immediate engineering question is whether these constraints primarily provide:

1. pre-materialization infeasibility rejection;
2. new positive logical implication / canonical closure;
3. both.

## Falsifier

For every support vector on each complete small-board control:

1. enumerate every ownership assignment satisfying `C`;
2. for every positive generator `g`, compute the intersection of all feasible assignments containing `g`;
3. mark `g` infeasible if no witness exists;
4. otherwise use that intersection as the exact positive closure `closure_C(g)`;
5. compare raw subset implication with implication relative to the closure.

A proposed reduction is falsified if it rejects a generator with a feasible witness or accepts a positive implication with a feasible counterexample.

## Oracle / reference semantics

The oracle is direct exhaustive enumeration of the finite ownership family defined by the selected constraint tier. It does **not** use minimax, Negamax, a solved database, opening knowledge, a game-value oracle, or precomputed perfect-play information.

This is a local ownership-feasibility oracle, not a complete legal-history reachability oracle.

## Workload

Complete support lattices for:

- 4x3 connect-3: 256 support vectors;
- 4x4 connect-4: 625 support vectors;
- 5x3 connect-4: 1,024 support vectors.

Every positive ownership generator over every support is evaluated.

## Results

| Board | All syntactic generators | Tier-A cardinality-infeasible | Tier-B extra NAE-infeasible | Tier-B feasible generators | Tier-B generators with stronger positive closure | Tier-B unique closures |
|---|---:|---:|---:|---:|---:|---:|
| 4x3 c3 | 50,625 | 15,730 (31.07%) | 13,184 (26.04% of all; 37.78% of Tier-A survivors) | 21,711 | 3,884 (17.89%) | 17,827 |
| 4x4 c4 | 923,521 | 312,109 (33.80%) | 74,944 (8.12% of all; 12.26% of Tier-A survivors) | 536,468 | 2,256 (0.42%) | 534,212 |
| 5x3 c4 | 759,375 | 249,466 (32.85%) | 27,215 (3.58% of all; 5.34% of Tier-A survivors) | 482,694 | 5 (~0.00%) | 482,689 |

Tier A alone produced only the trivial positive strengthening associated with rank-1 supports where the sole occupied cell is forced to P0: 4 strengthened generators on the 4-column controls and 5 on the 5-column control. Outside that degenerate case, exact cardinality did not create additional positive-positive dominance beyond ordinary subset in these controls.

Tier B was very different by geometry:

- 4x3 c3: relative implication count rose from 248,996 raw-subset implications to 329,056 exact constraint-relative implications, +32.15%;
- 4x4 c4: 29,253,753 -> 29,476,413, +0.76%;
- 5x3 c4: 18,989,788 -> 18,989,793, effectively no gain.

## Reassessment

The hypothesis must be narrowed.

### Established by this control

1. **Exact legal cardinality is primarily an infeasibility filter, not a stronger positive dominance order.**

   Its first BSFP use should be rejection of impossible OR-products before candidate storage:

   ```text
   popcount(candidate) > legalPlayerStoneCount
   => discard exactly
   ```

2. **Nonterminal full-line constraints can eliminate substantially more generators after cardinality**, but the magnitude depends strongly on board geometry.

3. **Constraint-relative positive closure exists and can be materially stronger than subset**, but these controls do not justify paying for a general implication engine on the hot path. The large 4x3 effect does not generalize uniformly to 4x4 or 5x3.

4. The main near-term opportunity is therefore:

   ```text
   cheap exact infeasibility before materialization
       first
   richer implication/canonical closure
       only after measured justification
   ```

### Not established

This experiment does not show:

- a production BSFP wall-time speedup;
- the candidate distribution seen by the actual BSFP recurrence;
- legal-history reachability beyond the stated local constraint theory;
- that NAE feasibility can be checked cheaply enough on the CUDA hot path;
- that affine or clause-derived closure will have the same economics;
- that the standard 7x6 workload has the same rates as these controls.

## Qualification of the original hypothesis

The earlier statement that legal-cardinality slicing could broadly strengthen positive-positive antichain dominance was too broad.

Corrected statement:

> Legal cardinality gives a very cheap exact infeasibility boundary and may imply fixed ownership only in degenerate slices. Stronger positive implication requires additional exact constraints such as affine ownership relations, fixed facts, or nonlinear compatibility constraints.

This distinction matters because infeasibility can be pushed directly inside a Cartesian producer without introducing a more expensive canonical implication theory.

## Next experiment

The next controlled step should be on the maintained CUDA-BSFP lineage, not this isolated research branch:

1. inspect whether the packed pair producer already rejects candidates whose ownership popcount exceeds the exact rank/player count;
2. if absent, add an experiment-only pre-storage cardinality rejection at the narrowest producer boundary;
3. require exact output equality on complete small-board controls;
4. measure raw pair attempts, candidates rejected before storage, post-filter candidate count, normalization/dominance work, and wall time;
5. only if the cheap cardinality filter is materially exercised should NAE/affine feasibility be considered for the next tier.

Do not implement a generic SAT/implication engine at this stage.

## Reproduction

Run:

```text
node research/experiments/constraint-relative-antichain/exhaustive-feasible-closure.mjs
```

The script emits complete JSON summaries by board, constraint tier, and support rank.

## Disposition

**Qualifies** the broad constraint-relative-antichain hypothesis and **supports** a narrower first action: exact pre-materialization feasible-slice rejection.
