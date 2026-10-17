# Static source-residual ROBDD variable orders at 44444 depth11 — frozen test

Date 2026-10-16. Owner research/semantic-quotient.

Earlier exact mirror-support interval control PASSED small-board full
WDL roots and symmetric legal prefix `1243`; it exactly matched
unquotiented 7x6 `44444` depth9. At depth10 it closed 6,216
canonical supports (12,341 raw supports), but root interval
remained [-1,+1]. Depth11 would have 9,366 canonical supports
(18,620 physical support vectors), within the unchanged 10k
representative limit, but the **300,000 nontrivial BDD operations cap**
was reached after 8,809 supports. Peak BDD memory 16,819 nodes
was well below the unchanged 60k limit. The challenge is operation
complexity, not a new game transition.

## Source-only, never WDL-informed variable orderings

ROBDD results depend strongly on variable ordering, even for the same
Boolean function. Keep exact source q, terminal guards, support orbit,
quantifier AND/OR and Shannon mirror transport unchanged. Try precisely
two alternative STATIC owner-variable orders, derived from geometry
and original source residual requirements *before* value calculation:

1. `column-major`: owner variable of cell (column c,row r)
   ordered by c*H+r.
2. `source-residual-frequency`: all future cell variables ordered by
   descending number of original R0+R1 residual requirements containing
   that cell, then row-major cell index as stable tiebreaker.
   Previously occupied source cells are ordered after remaining cells
   (they never appear as owner BDD variables in anchored formulas).

For every owner variable, map physical cell id to its rank in the
permutation. When restricting a next placed cell x, restrict the
**rank-mapped** variable. To mirror a canonical child BDD, convert
node.var rank to actual cell, reflect its column, then map reflected
cell to rank before rebuilding ordered ROBDD with Shannon ITE.
Naive node.var renaming alone remains forbidden.

## Frozen controls and resource envelope

Same hard limits: **60,000 BDD nodes, 300,000 nontrivial Boolean
operations, 10,000 canonical supports, 15 seconds** per compile,
GC batch every64/high-water40k.

1. Both orders on empty 4x3 Connect3 full horizon and symmetric
   legal prefix `1243` k8; independently compare full WDL and every
   action to the qualified exact q core after compilation.
2. Both orders on symmetric standard7x6 `44444` k9 (must match
   unquotiented old action intervals), k10 (must equal prior exact
   mirror interval), and k11 (attempt to finish under SAME caps).
3. Keep all attempted trials, including failures. If k11 finishes
   but WDL still UNKNOWN, report it; do not increase depth k12 since
   its canonical support count exceeds original 10k limit.
4. Explicitly count every new apply/restrict/not operation including
   mirror ITEs, support orbits, true peak nodes, and wall time.
   No game-tree policy search or solved labels enter candidate.

This is one instrumental representation optimization, not formal
minimality and not a proof of polynomial arbitrary-depth solver.
