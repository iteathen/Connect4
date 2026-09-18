# Research-to-core-logic map

This file maps normalized research concepts into the logical roles an implementation may consume. It is intentionally solver-neutral.

| Logical role | Canonical claims | Meaning |
|---|---|---|
| geometry | C4-R0002, C4-R0057, C4-R0058, C4-R0059 | exact winning-line incidence, derivative hierarchy, mixed-diagonal reduction and periodic annihilator structure |
| derivative semantic lift | C4-R0012, C4-R0011, C4-R0018, C4-R0043, C4-R0052 | exact geometry is available, but legality/realizability/composition/selection remain separate semantic obligations |
| residual basis | C4-R0001, C4-R0015 | surviving winning structures as first-class objects |
| accessibility | C4-R0025 | support/gravity information required for exact residual semantics |
| timing/ownership | C4-R0014 | event-rank parity/control relation |
| race guard | C4-R0017 | temporal precedence cannot be omitted |
| blockers | C4-R0016 | upward-closure representation of tested solved-group semantics |
| immediate terminal calculus | C4-R0003, C4-R0004, C4-R0009 | exact guarded terminal consequences |
| forced move | C4-R0005 | exact reply constraint without terminal-value overclaim |
| strategic certificate | C4-R0029, C4-R0030, C4-R0033 | qualified longer-horizon certificate families |
| composition | C4-R0011, C4-R0018, C4-R0032, C4-R0034 | current missing law plus candidate closures/transfer |
| semantic quotient | C4-R0008, C4-R0023..C4-R0028 | behavior-preserving state reduction and representations |
| support-local clause recurrence | C4-R0073 | bounded evidence that support-local coverage signatures plus precomputed cofactors close the tested exact monotone-CNF predecessor algebra; not a universal width or performance claim |
| evaluation boundary | C4-R0006, C4-R0007 | exact-before-heuristic; unresolved residue stays unresolved |
| research discipline | C4-R0035 | evidence scope and anti-bias contract |

## Derivative consumption rule

C4-R0057..R0059 may be consumed as exact geometry/representation facts. They do **not** by themselves authorize terminalization, W/D/L, perfect-play move choice, player ownership, legal response, or deadline claims. Such uses require a separate exact guarded claim carrying the missing semantics. C4-R0012 remains the hypothesis that some of this structure may admit a useful semantic lift.

## Implementation rule

A solver that consumes a research claim must preserve its guards. If code implements only an approximation, different scope, or stronger assertion, give that implementation its own qualification record rather than silently widening the canonical claim.

The same claim may be consumed in several ways: correctness-critical terminalization, proof certificate, move constraint, move ordering, evaluation, quotient identity, symbolic predecessor simplification, or performance-only optimization. Those uses are different implementation claims even when they point to the same research proposition.
