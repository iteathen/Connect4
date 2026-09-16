# Current causal-certificate differential reconstruction

**Date:** 2026-09-13  
**Status:** active theorem/control result; bounded complete-game qualification  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program / structural framing / target:** **Josh Oshiro**  
**Formalization, synthesis, implementation, and qualification:** **OpenAI ChatGPT**

## Purpose

Reconstruct the lost certificate-differential experiment from the **current** Connect Four semantics rather than attempting to recreate the obsolete `/tmp/c4diff.mjs` abstraction or its remembered counts.

The question is not whether another W/D/L recurrence can solve a bounded game. The fixed-point shell is already known. The question is which distinctions are genuine semantic identity, which are proof refinements, which are merely similar descriptions, and which proposed compressions erase support, timing, resource, or provenance information that is actually load-bearing.

This reconstruction obeys C4-0010. It does not replace the accepted ordinary forward quotient.

## Authority boundary

The semantic base is the accepted C4-0010 ordinary forward quotient

```text
q = exact support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

with side to move derived from support rank parity.

C4-0010 already states the exact residual transition law. This experiment independently rechecks it; it does not claim to rediscover or supersede that specification.

When a CPC/NDC/path-dependent certificate premise is **not derivable from `q`**, it may not be cached under `q` merely because a bounded control happens to agree. Such a premise must extend certificate identity or remain separately/contextually owned.

Terminal-line output uses the richer provenance layer already derived in `2026-09-13-output-provenance-quotient.md`.

---

## 1. Canonical current certificate signature

Two related signatures are used.

### Value certificate

```text
C_V(q) =
  q
  + current W/D/L interval facts
  + CPC zero-reservation event count/control facts on residual targets
  + WSL residual requirements
  + NDC support guards/dependencies on residual targets
  + temporal singleton obligations / response resources / slot collision facts
  + paired-response one-sided-bound premise when applicable
```

Only facts mechanically derivable from the current `q` are folded into this canonical key in this experiment.

That is deliberate. The signature is a **semantic certificate key**, not a place to smuggle physical history back into the quotient.

### Output certificate

For terminal-line identity, add exact P0 origin provenance:

```text
C_G = C_V + Pi0

Pi0:
  exact current residual requirement
    -> original live P0 geometric-line labels
```

Under a geometry automorphism, provenance is transported through the induced original-line permutation. It is never erased into the value key.

---

## 2. Exact causal isomorphism means extension coherence

A same-state snapshot resemblance is not enough.

The accepted causal-isomorphism relation in this reconstruction is restricted to automorphisms of the directed support structure and winning-line hypergraph. On 4x3 connect-3 the mechanically discovered automorphism group is:

```text
identity
horizontal reflection: 1 <-> 4, 2 <-> 3
```

For such an automorphism `phi`:

1. legal landing events map to legal landing events;
2. support advancement commutes with `phi`;
3. own residual shrink and opponent residual kill commute with `phi`;
4. terminal winning-line incidence is preserved;
5. the renaming extends to every successor.

Therefore the ordinary value transition system is isomorphic under `phi`, so exact W/D/L value is invariant.

For output semantics the stronger statement is equivariance:

```text
G(phi(s)) = phi(G(s))
```

Hence geometry-isomorphic states may share one canonical output state **only if the line-label transport is retained**.

This is the semantic proof obligation missing from local “looks the same” descriptors.

---

## 3. Complete 4x3 connect-3 reconstruction

The reproducer independently builds the complete reachable game and compares forward max/min W/D/L against the alternating fixed-point attractor.

```text
reachable states                     7,157
terminal states                      2,526
nonterminal states                   4,631
forward vs alternating FP mismatches     0
root absolute P0 value                  +1
root perfect-play P0 terminal lines     14
```

### Exact quotient / certificate results

| Relation | Nonterminal classes | W/D/L mismatch classes | output mismatch classes |
|---|---:|---:|---:|
| C4-0010 value `q`, raw | 3,734 | 0 | 172 |
| C4-0010 value `q` + geometry isomorphism | 1,879 | 0 | 89 |
| current value certificate `C_V` + geometry isomorphism | 1,879 | 0 | 89 |
| provenance output quotient, raw | 4,359 | 0 | 0 |
| provenance output quotient + geometry isomorphism | 2,188 | 0 | 0 |
| current output certificate `C_G` + geometry isomorphism | 2,188 | 0 | 0 |

The current q-derivable CPC/NDC/temporal annotations therefore add proof meaning but do **not** create a new semantic partition in this bounded control:

```text
partition(C_V) = partition(q / geometry automorphism)
partition(C_G) = partition((q + Pi0) / geometry automorphism)
```

That equality is not permission to attach arbitrary future strategic certificates to `q`. It holds here because the included premises were intentionally restricted to facts derivable from `q`.

### Transition congruence

Direct successor comparison gives:

```text
C4-0010 raw value-q classes       3,734   successor mismatches 0
raw provenance-output classes     4,359   successor mismatches 0
```

Thus the accepted raw value quotient and the provenance output quotient are not merely value-coincident partitions in the control; each is closed under its declared transition semantics.

---

## 4. Provenance remains load-bearing

Using the exact C4-0010 value quotient as an output quotient fails even though W/D/L remains exact.

The current control finds:

```text
raw value-q classes with mixed G(s):        172
geometry-canonical value classes mixed G:    89
```

Smallest preserved raw witness occurs at ply 6. Both states are P0-to-move exact wins and share the same value quotient:

```text
A top-down
..1.
1.1.
0.00

G(A) = {1,4,8,12}

B top-down
..1.
0.1.
1.00

G(B) = {4,8,12}
```

Line IDs above are 1-based in this note/evidence.

Adding exact residual-to-origin-line provenance removes every observed output collision in this control. This independently requalifies the value/output factorization already established by the output-provenance work.

---

## 5. Candidate-relation audit

The differential deliberately tests relations that erase one or more causal dimensions.

### Accepted exact semantic relations

#### C4-0010 `q`

Status: **accepted authority, independently requalified**.

Proof obligation: exact support plus both exact residual antichains must generate the same legal successor quotient and terminal result.

Result: zero W/D/L and zero successor-congruence mismatches in the primary control. Seven additional complete controls are summarized below.

#### Global support / winning-hypergraph automorphism

Status: **accepted causal-isomorphism merge**.

Proof obligation: the renaming must extend through every legal transition and preserve terminal incidence.

Result: satisfied by the mechanically discovered geometry automorphisms. W/D/L is invariant. Output is exact only with provenance transport.

#### Provenance-annotated output quotient

Status: **accepted output-sensitive relation in the bounded controls**.

Proof obligation: exact `Pi0` transitions must preserve emitted original-line labels as well as the value substrate.

Result: zero W/D/L, output, and raw successor-congruence mismatches in the primary control.

### Theorem-backed refinement, not a merge

#### Paired-response interval witness

The paired-response theorem remains useful after exact causal isomorphism:

```text
physical witnesses                         122
C4-0010 raw classes                         90
geometry-causal classes                     46

genuine decision physical states            77
genuine decision raw classes                 57
genuine decision geometry-causal classes     29

exact-value mismatches                        0
exact decision values:
  draw                                        23
  P0 loss                                     54
  P0 win                                       0
```

The theorem still proves exactly the one-sided interval:

```text
[-1,0]
```

It does not merge those 46 causal states and does not falsely distinguish the 23 draws from the 54 losses.

This is the desired pattern for the remaining predecessor calculus: **preserve exact semantic identity, then reuse a context-preserving theorem across many distinct causal classes to narrow proof intervals.**

### Rejected or downgraded relations

#### Residual antichains without support

```text
classes                  1,804
W/D/L mismatch classes       9
```

Smallest W/D/L counterexample occurs at ply 7: one matched description is an exact P0 win and the other an exact P1 win. Support/playability cannot be erased.

#### Residual cardinality only

```text
classes                    812
W/D/L mismatch classes      94
```

Smallest counterexample occurs at ply 3: exact draw versus exact P0 loss. Requirement identity is load-bearing.

#### Support only

```text
classes                    135
W/D/L mismatch classes     112
```

Smallest counterexample occurs at ply 3: exact P0 win versus exact P1 win. Support without residual ownership/requirements is insufficient.

#### Static capacity summary without response identity/order

```text
classes                  1,474
W/D/L mismatch classes      40
```

Smallest counterexample occurs at ply 3: exact P0 loss versus exact P0 win. Counts of obligations/resources are not a contingent policy; resource identity and temporal compatibility remain load-bearing.

#### Local causal-descriptor multiset without an extension map

This candidate is instructive because it has:

```text
4x3 W/D/L mismatch classes        0
successor-congruence failures     4
```

So it is **not** accepted merely because every grouped state happens to have the same final value in this bounded game. Its smallest transition failure occurs at ply 5 and is preserved in machine-readable evidence.

This is the direct reason to require extension coherence rather than treating local graph resemblance as causal isomorphism.

---

## 6. Cross-game qualification of the accepted value quotient

As a qualification input, not new specification authority, the exact support + both residual-antichain quotient was rerun on seven complete small games:

| Domain | Reachable states | Nonterminal states | value mismatch classes | successor mismatch classes |
|---|---:|---:|---:|---:|
| 3x3 connect-3 | 694 | 505 | 0 | 0 |
| 3x4 connect-3 | 2,715 | 1,801 | 0 | 0 |
| 4x3 connect-3 | 7,157 | 4,631 | 0 | 0 |
| 4x4 connect-3 | 41,750 | 23,930 | 0 | 0 |
| 4x4 connect-4 | 161,029 | 134,289 | 0 | 0 |
| 5x3 connect-3 | 70,914 | 40,659 | 0 | 0 |
| 5x3 connect-4 | 158,911 | 147,563 | 0 | 0 |

Totals:

```text
reachable states       443,170
nonterminal states     353,378
value mismatches             0
successor mismatches          0
```

Again, C4-0010 already owns this quotient. These numbers are independent qualification evidence, not a replacement theorem.

---

## 7. Historical scratch count disposition

The remembered scratch result

```text
2023 -> 419 + 1604
```

is **retired as unverified historical evidence** for the current calculus.

Reason:

- `/tmp/c4diff.mjs` is not preserved;
- its abstraction is obsolete relative to the current interval/capacity/provenance semantics;
- the current experiment was constructed from explicit present-day proof obligations;
- no current key, quotient size, candidate relation, or acceptance decision was tuned toward `2023`, `419`, or `1604`.

A numerically similar future result would require an independent semantic derivation before it could be connected to the historical note.

---

## 8. What the reconstruction changes

The main remaining differential is **not ordinary state identity**.

That part is now bounded cleanly:

```text
value semantics:
  C4-0010 q
  -> exact geometry causal-isomorphism where available

output semantics:
  q + exact Pi0 provenance
  -> exact geometry causal-isomorphism + provenance transport
```

The unresolved mathematics is the relation among **distinct exact quotient alternatives** inside `PreE` and `PreA`.

The next useful object is therefore not a more aggressive state merge. It is a guarded **alternative implication / choice-elimination theorem**:

```text
semantic class identity remains distinct
    +
certificate A proves enough about alternative a
certificate B proves enough about alternative b
    ->
max/min predecessor can discard or collapse one proof obligation
```

The existing paired-response theorem is the first qualified example of such proof reuse: one theorem narrows many distinct causal states without declaring them equivalent.

For positive P0 winning predecessors, the missing side remains progress: a well-founded structural reason that at least one alternative enters the winning region. For negative/no-win predecessors, temporal response capacity, deadlines, resource identity, CPC control, WSL coverage, and NDC guards remain the safety side.

---

## 9. Next execution seam

Work on exact quotient classes, not physical boards:

1. use C4-0010 `q` as the value-state substrate and `q + Pi0` when output identity is observable;
2. construct sibling-alternative certificate records for `PreE` / `PreA` with explicit causal guards;
3. define theorem-backed implication/elimination rules rather than generic residual dominance;
4. require every rule to preserve interval endpoints under max/min predecessor propagation;
5. require progress rank/well-foundedness for positive-win elimination;
6. mechanically falsify each rule on complete controls and retain the earliest counterexample;
7. carry `Pi0` through every accepted output-sensitive rule;
8. do not turn certificate refinements into quotient equality unless extension coherence is separately proved.

This is the narrower continuation of the structural predecessor calculus.

## Evidence / reproducers

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/causal_certificate_differential.mjs
docs/research/evidence/2026-09-13-current-causal-certificate-differential.json

reference/research-prototypes/2026-09-13-perfect-play-winline/c4_0010_cross_game_transition_controls.mjs
docs/research/evidence/2026-09-13-c4-0010-cross-game-transition-controls.json
```

## Claim boundary

Established here:

- a canonical current certificate signature can be based on C4-0010 `q` without reintroducing physical history when its included proof premises are q-derivable;
- exact causal isomorphism requires successor-extension coherence;
- global support/winning-line automorphisms satisfy that obligation;
- W/D/L is invariant under those automorphisms;
- terminal-line output is equivariant, not literally invariant, and therefore requires provenance transport;
- exact P0 residual provenance removes all observed output collisions in the primary control;
- the paired-response one-sided theorem remains a useful refinement after exact causal quotienting;
- several tempting coarse relations are falsified with preserved smallest counterexamples;
- a local descriptor can preserve W/D/L accidentally while still failing successor congruence;
- the obsolete remembered scratch counts have no current authority.

Not established here:

- the final 7x6 perfect-play terminal-line subset or cardinality;
- a complete direct symbolic discharge of `PreE` / `PreA` on standard 7x6;
- a globally minimal output provenance overlay;
- that every future CPC/NDC/temporal certificate is derivable from C4-0010 `q`;
- any generic dominance relation between distinct exact quotient classes.
