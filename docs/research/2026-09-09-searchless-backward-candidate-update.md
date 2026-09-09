# Candidate update — backward symbolic fixed-point solver

**Date:** 2026-09-09  
**Status:** research classification update; maintained source and `main` unchanged.

## New candidate: `BSF` — backward symbolic fixed-point solver

`BSF` starts from geometric winning-line predicates and derives the game backward over the support/height lattice. It represents each support skeleton by a symbolic W/D/L function over ownership variables and composes predecessor values algebraically:

```text
P0 turn: max over legal symbolic move functions
P1 turn: min over legal symbolic move functions
```

No physical colored-board state graph and no recursive minimax are required in the direct solver.

## Classification

- **projected effectiveness:** potentially transformative for W/D/L if empty 7x6 symbolic width can be controlled;
- **measured effectiveness:** exact direct solves on 4x3 c3, 4x4 c4, 5x3 c4 and 4x5 c4; exact W/D/L signs on all eight frozen 7x6 roots;
- **assessment confidence — semantic correctness of recurrence:** 0.99;
- **assessment confidence — exactness of current implementation on tested complete games:** 1.00 relative to exhaustive differential qualification (1,681,808 states, zero mismatches);
- **assessment confidence — viability on empty 7x6 in current raw-ownership MTBDD form:** 0.35;
- **assessment confidence — viability after residual/event/U1/U2 compression:** 0.72 projected;
- **proof authority:** exact W/D/L solver;
- **terminalization role:** none; this is a proof engine, not a semantic terminal detector;
- **semantic reach:** whole remaining game;
- **stage locality:** global symbolic closure / compile-proof stage;
- **implementation-form risk:** high — generic raw-ownership MTBDD is clearly not final;
- **architectural lock-in:** medium; recurrence is representation-independent, current MTBDD is replaceable;
- **GPU suitability:** potentially high for fixed-width symbolic/frontier operations, unqualified.

## Signed interactions

Projected relationships:

```text
SUP-event -> BSF = +4
RWS       -> BSF = +4
RID/U2    -> BSF = +4
U1        -> BSF = +4
INC       -> BSF = +3
AUTO      -> BSF = +2/+3 if symbolic canonicalization is cheap
```

because they can replace raw ownership-function width with the already-discovered strategic algebra.

If BSF scales to the empty 7x6 W/D/L problem:

```text
BSF -> recursive minimax/alpha-beta driver = -4 substitution
BSF -> YBWC search shell                = -3/-4 for WDL proof
BSF -> recursive TT/search placement    = -3 for WDL proof
BSF -> move ordering                    = -3 for WDL proof
```

These negative edges are **architectural substitution**, not incompatibility. Exact-distance refinement may still require a smaller second-stage proof/search mechanism.

## Universalization relation

`BSF` is the strongest candidate for the top-level universal proof engine:

```text
geometric win axioms
 + support/event precedence
 + U1 parity/response algebra
 + U2 blocker/requirement lattice
 + dominance antichains
    -> BSF fixed point
    -> W / D / L
```

U1 and U2 do not compete with BSF. They are projected compact representations/operators inside it.

## Scaling evidence

The raw support lattice itself is modest:

```text
7^7 = 823,543 support skeletons
```

but naive raw-ownership MTBDD width grows rapidly near full boards. A partial empty-7x6 run with top-down variable order and per-ply garbage collection reached:

- ply 42: 0 live nodes;
- ply 41: 110;
- ply 40: 4,535;
- ply 39: 76,866;
- ply 38: 574,202 live nodes after GC, 1,463,880 before GC.

The run was intentionally stopped after 20 seconds rather than treated as a failed mathematical method. This identifies **symbolic representation width** as the current seam.

On 4x5, gravity-aligned variable ordering reduced accumulated DD nodes from 302,745 to 151,722, and per-ply GC reduced maximum live state to only 10,174. Thus substantial representational slack remains.

## Research priority

Do not return to optimizing forward search before testing compact BSF representations.

Next representation candidates, in order:

1. residual requirement / blocker variables instead of raw cell ownership;
2. support-event state instead of raw heights where exact;
3. dominance-antichain W/L frontiers;
4. U1 parity-response constraints for temporal ownership/race facts;
5. U2/RID upward-closure terminal queries;
6. symbolic symmetry/canonicalization;
7. only then revisit empty-7x6 scaling.
