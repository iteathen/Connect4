# Candidate unification map — which mechanisms collapse into U1/U2

**Date:** 2026-09-09  
**Status:** theoretical classification / unification assessment.  
**Companion:** `2026-09-09-universal-strategic-algebra.md`

This document evaluates whether current candidates are genuinely separate mechanisms or can be expressed through the two proposed universal strategic layers:

- **U1 — parity/response algebra:** GF(2) event-rank parity + response/resource/event-order constraints;
- **U2 — blocker-lattice closure:** certified strategic blockers represented in the same 625-ID subset lattice as residual winning requirements.

Confidence is confidence in the mapping, not candidate quality.

| Candidate | U1 | U2 | Mapping kind | Confidence | Key observation |
|---|---|---|---|---:|---|
| E2 parity metadata | direct | no | substrate/fact | 0.99 | Future target parity is event-rank parity. |
| ZPAR | direct | direct/terminal query | likely direct unification | 0.84 | Exact Zugzwang ownership should be a U1 consequence; U2 checks whether guaranteed ownership blocks all opponent obligations. Exact final predicate still needs qualification. |
| A1 Claimeven | direct fixed-owner constraint | direct singleton blocker | direct unification | 0.98 | Guaranteed even square becomes blocker ID of size 1. |
| A2 Baseinverse | direct split/response pair | direct size-2 blocker | direct unification | 0.99 | Opponent cannot own both playable squares. |
| A3 Vertical | direct response pair | direct size-2 blocker | direct unification | 0.99 | Opponent cannot own both consecutive squares. |
| A5 Lowinverse | direct parity-preserving response composition | direct pair blockers | direct unification | 0.96 | Rule explicitly guarantees at least one cell from each of three pairs. |
| A6 Highinverse | direct parity/response composition | direct pair blockers | direct unification | 0.94 | Solutions are multiple guaranteed split pairs, some playability-conditional. |
| A7 Baseclaim | direct composite response constraints | direct pair blockers | direct unification | 0.97 | Allis explicitly constructs it from Baseinverse/Claimeven behavior; solutions reduce to two blocker pairs. |
| A4 Aftereven | U1 supplies Claimeven ownership + parity | U2 can express resulting tail/race blockers | likely generic race closure | 0.82 | Difference from simpler rules is own-win completion deadline, not a new coverage algebra. |
| A8 Before | U1 supplies q/successor split responses | U2 expresses successor blocker and own-win contradiction | likely generic race closure | 0.88 | For each empty own-group cell, controller gets that cell or its successor; if all original cells are obtained controller wins, otherwise a successor blocks opponent. |
| A9 Specialbefore | U1 supplies Before responses + extra playable response | U2 expresses augmented blocker sets | likely generic race closure | 0.78 | Looks like Before plus one alternative response resource; no distinct coverage algebra. |
| A10 compatible Allis cover | compatibility owner | coverage owner | architecture replaced by U1+U2 if complete | 0.82 | A10 is exactly “choose simultaneously valid response fragments whose blocker closures cover all opponent requirements.” |
| EXH | no | degenerate requirement check | direct trivialization | 1.00 | Empty opponent requirement set is one-sided no-win. |
| BEXH | no | degenerate requirement check | direct trivialization | 1.00 | Both requirement sets empty is exact draw. |
| SUP/event | enabling state | enabling state | substrate, not subsumed | 0.98 | U1 needs event accessibility/order; U2 needs addressed blocker cells. |
| RWS | enabling state | direct requirement representation | substrate, not subsumed | 0.99 | Supplies active winning hypergraph. |
| RID | fixed IDs/tables | exact lattice owner | substrate, not subsumed | 1.00 | U2 reuses RID rather than creating a new strategic universe. |
| INC | cost implementation | cost implementation | universal implementation enabler | 0.99 | Makes U1/U2 incremental/fixed-width. |
| IMPL | shared subset-order algebra | shared upward-closure tables | shared algebra, not same optimization | 0.94 | Strategic coverage and implication both consume subset closures over RID. |
| CARD | parity/rank metadata overlap only | requirement-size metadata | shared substrate only | 0.99 | Admissible score bound remains distinct. |
| SEWB | event-order overlap | requirement/event metadata | shared substrate only | 0.98 | Support-aware bound remains distinct. |
| DEAD | event relevance helps U1 | blockers/requirements expose irrelevance | partial derivation | 0.86 | Some dead-tail facts may fall out automatically, but action-equivalence remains a separate exact relation. |
| AUTO | no direct unification | acts on same lattice | shared substrate only | 1.00 | Symmetry quotienting remains distinct. |
| E1 maturity ordering | no | summary over requirement lattice | shared substrate only | 1.00 | Ordering remains separate even if almost free to compute from U2 state. |
| P1 proof-cost ordering | may consume U1 certificate deficit | may consume U2 uncovered requirement count | shared features only | 0.94 | Search-order heuristic remains separate. |
| IWIN | no meaningful need | terminal requirement singleton fact can expose it | semantically adjacent, keep specialized | 0.99 | One-ply exact terminal should remain cheaper than invoking universal strategic machinery. |
| DTH | response/ownership adjacent | singleton threat structure | semantically adjacent, keep specialized | 0.99 | Bounded tactical terminal should remain specialized and earlier in pipeline. |
| FBLK/FMAC | no | no | not unified | 1.00 | Deterministic transition compression, not strategic terminal certification. |
| CTT/RANK/STT/CAP | no | no | not unified | 1.00 | Cache/memory mechanisms. |
| YBWC/AFF/JOIN | no | no | not unified | 1.00 | Parallel/scheduling mechanisms. |

## Emerging cluster

The candidates most plausibly collapsing into one strategic engine are:

```text
E2 / ZPAR
A1-A10
EXH / BEXH
parts of DEAD
```

with RWS + RID + SUP/event + INC as the shared substrate.

This is a substantially smaller architecture than treating parity, Zugzwang, nine Allis rules, compatibility, strategic cover and exhaustion as independent systems.

## The stronger algebraic interpretation

### Future owner parity

The owner's target-reservoir equation:

```text
N(t) = (W-1)H - ply + row(t) + 1
```

is the zero-reservation form of U1.

A strategic policy which reserves/releases events changes this by `Delta`:

```text
N_policy(t) = N(t) + Delta(t)
```

Only `Delta mod 2` matters for future owner parity.

Allis's rule compatibility statement that newly available squares must be even is exactly:

```text
Delta(t) = 0 (mod 2)
```

for later parity-dependent obligations.

### Pairing constraints

Baseinverse/Vertical/inverse rules frequently yield:

```text
x_u XOR x_v = 1
```

where `x=1` denotes controller ownership. Claimeven yields a unit constraint. These are pairwise parity constraints rather than arbitrary Boolean formulas.

This makes a parity-union-find / XOR-DSU or generated fixed response representation a plausible U1 machine form.

### Blocker closure

Every exact strategic guarantee has the terminally relevant form:

```text
opponent cannot own all cells of blocker b
```

and solves every active requirement containing `b`.

This is an upward-closure lookup in RID.

## Potential further collapse: Before as ordinary implication

Before can be rewritten without its name.

For each empty cell `q_i` of the controller's own Before group, let `s_i` be its successor. The response policy guarantees roughly:

```text
controller(q_i) OR controller(s_i)
```

If the opponent owns every `s_i`, each response clause forces the controller to own every `q_i`; then the controller completes the own winning group. Therefore the opponent cannot complete a requirement containing all `s_i` first.

That is simply a consequence of response constraints + own winning hyperedge + terminal precedence.

This is evidence that A8 is not a fundamentally new strategic rule class. It is a derived theorem in U1/U2.

Aftereven has the same lower-level shape with fixed Claimeven ownership and an own-win completion deadline. Specialbefore adds an alternate response resource.

## Main unresolved obstacle

**Selecting one globally coherent response policy.**

It is easy to represent blocker coverage once policy fragments are valid. It is also easy to test local parity/resource conflicts. The potentially hard part is choosing enough compatible response fragments to cover all opponent requirements without performing a combinatorial search comparable to Allis's original compatibility-cover step.

This is the decisive question for whether U1/U2 are merely a universal representation or a genuinely universal **cheap solver**.

## Next proof/experiment target

Attempt to construct a canonical or closure-derived global U1 response policy directly from the support-event state, rather than selecting named rule instances.

Success criterion:

- produces the A1-A9 guarantees as consequences rather than special cases;
- compatibility follows from mask/order/parity invariants;
- terminal coverage is one U2 bitset check;
- no general set-cover or dynamic compatibility graph is needed.

Failure criterion:

- recovering Allis-strength coverage still requires exponential/large branch selection among response fragments.

If the latter occurs, U1/U2 remain valuable universal substrates but do not replace selective certificate search.