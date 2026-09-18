# ISOMETRIC branch

**Branch:** `solver/isometric`  
**Solver family:** Isometric  
**Research direction / structural architecture:** Josh Oshiro

Isometric is a first-class Connect4 solver/research lineage. It is a sibling of the BSFP, Research, and Negamax lineages; it is not a Negamax sub-experiment.

The branch was cut without semantic rewriting from the complete live `research/terminal-frontier-horizon-exact` experiment at commit `6b7f19ce4d15423f6f2537dd7b18bcba2a7348ea`. That commit is the historical split point, not an ongoing ownership dependency.

## Identity boundary

Isometric is defined by the structural-calculus / frontier-exact program: maintain exact structural frontier facts in transition state, consume exact structural consequences before heuristic evaluation, preserve explicit proof/certificate guards, and use recursive max/min search only for the unresolved residue that still requires it.

The current implementation may retain alpha-beta/minimax mechanics inherited from the experiment. Those mechanics are an implementation backend, not the solver-family identity. The implementation does not satisfy canonical Negamax sign-flip recurrence and must not be described or governed as Negamax merely because of its ancestry.

## Shared authority

Isometric shares Connect4-owned domain and structural mathematics with the other solver families, especially C4-0001, C4-0006, and C4-0007.

C4-0010 (`quotient-native-negamax`) remains useful lineage and conformance evidence where its clauses are independently applicable, but it does not own Isometric semantics. Isometric-specific solver semantics are routed through C4-0011.

## Migration rule

- New Isometric work lands on `solver/isometric`.
- `research/terminal-frontier-horizon-exact` and draft PR #45 are historical provenance only after this split.
- Do not merge the Isometric experiment back into the Negamax lane merely to preserve its historical branch ancestry.
- Preserve the experiment's valid code, research notes, qualification evidence, negative results, and exact checkpoints unless later assessment supersedes them.
