# Core structural model

## Purpose

The common research program treats Connect4 as more than a tree of legal positions. The board induces a finite system of possible winning structures whose relations can support exact deductions, reductions, move constraints, ordering information, and residual evaluation.

The central research question is:

> How much of the game-theoretic result can be derived from the relational structure of possible wins, reachability, timing, ownership, and their composition before recursive game-tree search is required?

This model is solver-neutral. Isometric is the most direct consumer of the calculus, but exact structural facts may also be used by Negamax/Minimax, BSFP, or future solvers.

## 1. Structural objects

The primary objects are winning lines and their residual completion requirements, not merely raw occupied cells. Useful representations may include line sets, support cells, completion cells, residual unblocked lines, structural candidates, quotient classes, and derived predicates.

Board occupancy remains necessary because it determines which structural objects are alive, blocked, owned, reachable, or terminal.

## 2. Relations

The calculus studies relations including:

- line intersection and shared support;
- blocking, ownership, and exclusion;
- gravity reachability;
- timing and physical ply distance;
- parity/turn ownership where relevant;
- compatibility or conflict among candidate wins;
- dependency between a move and the structural consequences it enables or destroys.

A relation is not automatically a theorem-producing rule. Composition laws must state when local facts imply a global consequence.

## 3. Geometry and derivatives

Connect-k board geometry admits exact directional line counts and discrete derivative structure. Stable interior behavior and boundary/truncation terms can be separated. These geometric invariants provide solver-independent structure and candidate features for higher-order predicates.

Geometry is exact where derived; a proposed semantic use of that geometry is a separate claim and must be classified separately.

## 4. Exact predicates and terminal calculus

Some local structural states already carry exact game consequences under explicit guards. Current established examples include playable singleton completion, multiple distinct opponent singleton completions, and unique forced blocks. These are normalized as claims `C4-R0003` through `C4-R0005`.

Exact predicates take precedence over heuristic evaluation. A heuristic may estimate only the unresolved residue; it must not overwrite an exact structural certificate.

## 5. Composition

The major incomplete part of the program is composition: rules that combine local predicates, intersections, timing, support, and reachability into stronger exact conclusions.

This is not a documentation gap. It is a research gap. The missing-axiom register exists because local exact certificates do not yet constitute a complete global calculus.

## 6. Semantic quotient

If two states have identical behavior for the semantics relevant to a solver, they may be candidates for a quotient/equivalence class. The reduction is valid only under an explicit behavior-preservation law. Similarity, compact representation, or empirical agreement alone does not establish semantic equivalence.

The quotient program therefore sits downstream of the structural model and upstream of solver execution: it can collapse distinctions only after proving or sufficiently certifying that those distinctions do not matter for the target semantics.

## 7. Residual boundary

After exact structural deductions and valid reductions, unresolved state remains. That residue may be delegated to recursive search, backward symbolic methods, evaluation, or another solver-specific mechanism.

This boundary is intentional. The research program should progressively shrink the unresolved residue as new exact laws are established rather than pretending unresolved states are already solved structurally.

## 8. Evidence loop

Experiments test candidate rules, measure implementation strategies, find counterexamples, and qualify solver consequences. Evidence updates empirical confidence but does not silently convert a hypothesis into a deductive theorem.

Negative experiments remain useful because they constrain implementation and theory. For example, the dead-residual draw theorem remains exact while one incremental hot-state maintenance strategy for detecting it was not justified by measured workload benefit.

## 9. Solver consumption

The shared flow is:

`geometry/win-space -> relations/reachability -> predicates -> composition -> quotient/reduction -> exact terminal consequence -> unresolved residue -> solver-specific mechanism`

Evidence and confidence attach to claims at every stage. Solver families consume those claims through explicit mappings rather than maintaining private copies of shared semantic truth.
