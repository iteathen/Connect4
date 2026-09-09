# Candidate update — Backward Symbolic Fixed-Point

**Date:** 2026-09-09  
**Status:** research classification update; maintained source and `main` unchanged.  
**Canonical name:** `BSFP` — Backward Symbolic Fixed-Point.  
**Conceptual origin:** Josh Oshiro.

> Naming note: the earlier temporary research label `BSF` refers to this same solver lineage. `BSFP` is the canonical name going forward.

## Candidate: `BSFP` — Backward Symbolic Fixed-Point

`BSFP` starts from geometric winning-line predicates and derives the game backward over the support/height lattice. It represents each support skeleton by a symbolic W/D/L function over ownership variables and composes predecessor values algebraically:

```text
P0 turn: max over legal symbolic move functions
P1 turn: min over legal symbolic move functions
```

No physical colored-board state graph and no recursive minimax are required in the direct solver.

The architecture arose from Josh Oshiro's earlier evaluator mathematics and subsequent owner insights:

```text
CPC      — Control Parity Calculus
WSL-625  — Winspace Lattice 625
NDC      — Nested Dependency Closure
BSFP     — Backward Symbolic Fixed-Point
```

CPC preserves the mathematical shape of Oshiro's original evaluator: infer future strategic control from event-rank parity, support, response, and timing rather than explicitly playing every intervening move. WSL-625 is the fixed residual requirement/blocker lattice. NDC is the algorithm that recursively nests terminal and adversarial dependencies. BSFP is the symbolic backward fixed-point execution architecture.

The canonical terminology and attribution are recorded in:

`docs/research/2026-09-09-bsfp-terminology-and-attribution.md`

## Classification

- **projected effectiveness:** potentially transformative for W/D/L if empty 7x6 symbolic width can be controlled;
- **measured effectiveness:** exact direct solves on 4x3 c3, 4x4 c4, 5x3 c4 and 4x5 c4; exact W/D/L signs on all eight frozen 7x6 roots;
- **assessment confidence — semantic correctness of recurrence:** 0.99;
- **assessment confidence — exactness of current implementation on tested complete games:** 1.00 relative to exhaustive differential qualification (1,681,808 states, zero mismatches);
- **assessment confidence — viability on empty 7x6 in current raw-ownership MTBDD form:** 0.35;
- **assessment confidence — viability after residual/event/CPC/WSL-625 compression:** 0.72 projected;
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
SUP-event -> BSFP = +4
RWS       -> BSFP = +4
WSL-625   -> BSFP = +4
CPC       -> BSFP = +4
INC       -> BSFP = +3
AUTO      -> BSFP = +2/+3 if symbolic canonicalization is cheap
```

because they can replace raw ownership-function width with the already-discovered strategic algebra.

If BSFP scales to the empty 7x6 W/D/L problem:

```text
BSFP -> recursive minimax/alpha-beta driver = -4 substitution
BSFP -> YBWC search shell                  = -3/-4 for WDL proof
BSFP -> recursive TT/search placement      = -3 for WDL proof
BSFP -> move ordering                      = -3 for WDL proof
```

These negative edges are **architectural substitution**, not incompatibility. Exact-distance refinement may still require a smaller second-stage proof/search mechanism.

## Universalization relation

`BSFP` is the strongest candidate for the top-level universal proof engine:

```text
geometric win axioms
 + support/event precedence
 + CPC control-parity / response / race facts
 + WSL-625 blocker / residual requirement lattice
 + dominance antichains
    -> NDC
    -> BSFP fixed point
    -> W / D / L
```

CPC, WSL-625, and NDC do not compete with BSFP. They are, respectively, a structural control calculus, a finite requirement/blocker domain, and the dependency-closure algorithm used by the solver architecture.

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

Do not return to optimizing forward search before testing compact BSFP representations.

Next representation candidates, in order:

1. WSL-625 residual requirement/blocker variables instead of raw cell ownership;
2. support-event state instead of raw heights where exact;
3. dominance-antichain W/L frontiers;
4. CPC parity/response constraints for temporal ownership/race facts;
5. WSL-625 upward-closure terminal queries;
6. symbolic symmetry/canonicalization;
7. GPU-batched/out-of-core BSFP execution through CUDA-JS;
8. only then revisit empty-7x6 scaling at full size.
