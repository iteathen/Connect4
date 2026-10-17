# Occupied-owner incidence as a realizability-aware symbolic Bellman carrier — predeclared qualification 0.1

**Date:** 2026-10-16. **Owner:** `research/semantic-quotient`.
**Starting live research head:** `17813441533aa6b00486851cdc6911a52d0139c9`.
**Governing semantics:** qualified q_o, residual line/owner blocker cofactors, first-win-stop and support legality. No new authority ID/status.

## Precise new hypothesis

Previous support-local residual-shape-variable WIN/NONLOSS circuits assign independent Booleans to abstract residual upset coordinates, then rely on poset constraints. They represent many input combinations that **cannot arise from any fixed occupied ownership assignment**. The empty 4x3 Connect-3 root still exceeded 60,000 intermediate AND/OR nodes even after last-use support-formula garbage collection (198/256 supports) and horizontal reflection orbit folding (118/136 orbits).

Try a **realizability-parametrized** alternative without constructing a concrete physical or q game-state graph: for support h, let each of its occupied cells x have a Boolean owner variable \(z_x=[x\in P0]\), with every other occupied cell necessarily P1-owned. Original residual antichains are functions of these owner variables, not independent arbitrary upset coordinates.

For legal action c at support h with landing x and mover p:
- Terminal P0 win guard = OR over geometric lines through x **whose other cells are already below support**, of AND of owner literals \(z_y\) on the remaining line cells.
- Terminal P1 win guard uses \(\neg z_y\) instead. If the rest of a line is unoccupied, that line cannot terminate now.
- The child WDL threshold formula \(W(h+e_c),N(h+e_c)\) is pulled back by **Boolean cofactor/restriction \(z_x=p\)**, literally the residual owner-true/false cofactor under the occupancy-incidence coordinates.
- On P0 turn, action W/N is (immediateP0Win OR restrictedChildW/N); on P1 turn it is (NOT immediateP1Win AND restrictedChildW/N). Full-board nonwinning placement is draw; first-win completion is always tested first. P0 combines action thresholds with OR, P1 with AND.
- Carry each **literal action-specific** WIN and NONLOSS expression to recover **complete WDL-equivalent optimal-move sets**, never collapsing adaptive reply covers to a scalar union.

This is a Boolean ordered decision diagram (ROBDD) over occupied-owner incidence variables, with hash-consed AND/OR, Shannon restriction and canonical reduction. It is **the same qualified q cofactor/value algebra under a different, realizability-coupled coordinate basis**, not a searched optimal policy, an opening-book shortcut, or a claim that arbitrary strategic branching has vanished.

## Work/complexity accounting

Build one threshold pair per **support vector** in descending rank. No concrete q or colored board states are generated during compilation. Process all legal action labels as algebraic support-graph edges (different from enumerating all alternating physical game continuations), and count their number. Hash-consed ROBDD naturally shares common subformulas and throws away unreachable branches. Release a child support's compiled W/N/action roots as soon as all predecessor supports consume it. GC and node remapping occur only between support builds.

**Exactly the same frozen core budgets:** at most **60,000 simultaneously held ROBDD nodes** (not merely terminal output), **300,000 nontrivial BDD apply/restrict visits**, <=10,000 supports and **15 seconds** per compilation. Do not increase ceilings if the root fails. Track peak retained nodes, total created nodes, apply visits, support edges, GC, intermediate action fronts, elapsed time, and resulting root action vector.

## Verification

1. **First run:** empty 4x3 Connect-3 root. Read no known root WDL or searched policy during compilation. AFTER compilation, compare WDL and every literal action value against the exact independent recursive q solver, and physical rule evaluation; targeted physical prefixes 223 and reflected siblings are validation-only.
2. **Second run if supported:** 4x4 Connect-4 empty root under the SAME node/visit/time limits. On budget exhaustion preserve exact first problem rank and stop; do not spend time or expand budgets.
3. Test selected nonroot supports `[2,2,1,2]` 4x3 and `[1,1,1,1]` 4x3: compile threshold functions and compare against all legal physical positions with those exact supports plus 128 deterministic independent realizable owner assignments if meaningful. Query assignment must use only physical owner bitmasks, not q-solve labels during compilation.
4. Negative controls: remove P1 first-win guard and remove owner-variable restriction before combining child value; at least one legal physical position must distinguish each, otherwise explicitly qualify their absence. Preserve exact first witness.
5. Early q equivalence check: for every sampled legal physical state, BDD assignment and ordinary q residual antichain must give identical value/action vector. Reflection transports literal action names.

## Interpretation

A successful 4x3 empty-root calculation is meaningful **complete WDL symbolic evaluation without concrete game-state search**, but is not a polynomial 7x6 method and does not eliminate **support-DAG alternation fanout**. A failed root budget would be negative representation-width evidence, not a theorem that branching is mathematically unavoidable. Formal minimality remains deferred.
