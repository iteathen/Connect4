# Recursive proof-frontier antichain isomorphism

**Date:** 2026-09-13  
**Status:** theorem-backed value-proof normalization; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / isomorphic-structure inquiry:** **Josh Oshiro**  
**Formalization and synthesis:** OpenAI ChatGPT

## Purpose

The current research contains several apparently different antichain constructions:

- WSL residual winning requirements are normalized to a minimal subset antichain;
- typed response-contract feasibility is represented by maximal preservation antichains;
- hard-frontier positive certificates normalize exact-`q` duplicates but have not yet used subset absorption between alternative proof plans.

This note identifies an exact isomorphism at the pure value-proof layer: **a family of alternative P0 witness plans is a monotone DNF over recursive exact-`q` win obligations, and therefore has the same subset-antichain normalization law as WSL residual winning lines.**

The result does not introduce a coarser state equality and does not erase CPC/NDC/resource context when that context remains load-bearing.

---

## 1. WSL as monotone DNF

At fixed compatible support/accessibility context, let `A` be one player's residual winning-requirement family.

Associate one Boolean atom `x_c` with eventual ownership of future cell `c` under the residual objective. Then the completion condition is the monotone Boolean formula

```text
F_A(x) = OR over R in A of (AND over c in R of x_c).
```

If

```text
R1 subset_of R2
```

then

```text
AND(R2) => AND(R1)
```

and therefore

```text
AND(R1) OR AND(R2) = AND(R1).
```

This is the ordinary absorption law already embodied by C4-0006 minimal-antichain normalization.

---

## 2. One P0 witness move produces one recursive conjunction

Use the theorem-backed hard-frontier calculus.

For a P0-to-move exact-`q` state `s` and a concrete legal P0 action `a`, let

```text
H_B(s,a)
```

be the exact-`q`-normalized set of undisclosed P0 child obligations remaining after:

1. executing `a`;
2. checking every legal P1 reply;
3. rejecting `a` if a reply is an immediate P1 terminal win;
4. discharging every reply covered by an already-proved positive base certificate `B`;
5. retaining every other P0 child as an exact-`q` value obligation;
6. deduplicating equal exact-`q` obligations.

If every state in `H_B(s,a)` is P0-winning, then `a` is a valid positive witness for `s` by `PreA` followed by `PreE`.

Thus the proof term induced by `a` is

```text
Term(a) = AND over q in H_B(s,a) of Win(q).
```

The empty set is the empty conjunction `True`: all defender replies were discharged and the parent closes immediately.

---

## 3. P0 witness family is monotone DNF

Let `A_s` be the legal P0 witness actions that survive immediate terminal-refutation checks.

The positive proof-plan formula is

```text
ProofPlan_B(s)
  = OR over a in A_s of
      (AND over q in H_B(s,a) of Win(q)).
```

This has exactly the same Boolean shape as the WSL completion formula:

```text
WSL:          OR of ANDs of future-cell atoms
proof plans:  OR of ANDs of recursive exact-q Win atoms
```

The atom type changes; the algebra does not.

---

## 4. Local hard-frontier absorption theorem

### Theorem

For two admissible witness actions `a1` and `a2` at the same parent value context, if

```text
H_B(s,a1) subseteq H_B(s,a2)
```

then the proof term for `a2` is redundant for proving `Win(s)`.

### Proof

If every obligation in `H_B(s,a2)` is winning, then every obligation in its subset `H_B(s,a1)` is winning.

Therefore

```text
Term(a2) => Term(a1).
```

By Boolean absorption,

```text
Term(a1) OR Term(a2) = Term(a1).
```

Deleting `a2` from the positive proof-plan family cannot remove any pure value proof supplied by these terms. QED.

### Canonical local representation

The witness family may therefore be represented exactly, for this proof meaning, by

```text
MinSubsetAntichain({ H_B(s,a) : admissible a }).
```

This is the direct strategic analogue of C4-0006 WSL normalization.

---

## 5. Recursive frontier distribution theorem

Let a current hard frontier be

```text
F = {q1, q2, ..., qn}.
```

Each `qi` has a family of P0 witness terms:

```text
ProofPlan(qi)
  = OR over a in A(qi) of AND(H(qi,a)).
```

To prove the entire frontier, every `qi` must be proved:

```text
AND over qi in F of ProofPlan(qi).
```

Distributing AND over OR gives

```text
OR over witness maps alpha of
  AND over r in Union_{qi in F} H(qi, alpha(qi)) of Win(r).
```

Each witness map therefore induces one **next-frontier proof plan**:

```text
Next(alpha)
  = qNormalize(Union_{qi in F} H(qi, alpha(qi))).
```

Again, if

```text
Next(alpha1) subseteq Next(alpha2)
```

then `alpha2` is absorbed.

Hence the entire recursive proof-plan family can, in principle, be propagated as a **minimal antichain of exact-`q` frontiers** rather than as a raw Cartesian product of witness maps.

This is exact Boolean normalization. It does not assume frontier width decreases.

---

## 6. Self-similarity across two semantic levels

The resulting correspondence is:

| WSL level | Recursive proof level |
|---|---|
| cell ownership atom `x_c` | recursive value atom `Win(q)` |
| residual winning requirement `R` | hard recursive obligation set `H` |
| one live geometric completion alternative | one P0 witness proof alternative |
| OR over residual requirements | OR over P0 witness alternatives |
| AND over cells in a requirement | AND over hard child obligations |
| subset absorption | subset absorption |
| minimal residual antichain | minimal proof-frontier antichain |
| move cofactor + renormalization | proof-plan expansion + renormalization |

The important claim is not that cells and game states are the same object. They are not. The claim is that the **same free idempotent distributive algebra, quotiented by absorption, appears at both levels**.

---

## 7. Duality with typed preservation antichains

The response-channel antichain calculus already established that, for fixed residual obligations and typed resource universe, feasible preservation sets form a downward-closed family represented by its **maximal** inclusion antichain.

The proof-plan construction above keeps **minimal** obligation sets because fewer required `Win(q)` atoms make a proof term stronger/easier.

Thus the two active antichain calculi are order-dual:

```text
proof obligations:
  smaller set = stronger proof alternative
  keep inclusion-minimal frontier

typed preserved resources:
  larger set = stronger feasible preservation capability
  keep inclusion-maximal frontier
```

Both are boundary representations of an inclusion ideal/filter after choosing the appropriate information order.

This is a genuine isomorphic pattern with order reversal, not merely shared terminology.

---

## 8. Typed-context boundary

Subset absorption is exact only for the semantic content represented by the atoms in the term.

For the pure hard-frontier theorem, the atoms are exact C4-0010 value obligations after all action-local premises needed to construct `H_B(s,a)` have been discharged or retained outside the term.

If two alternatives retain different load-bearing context such as:

```text
CPC reservoir commitments
response-resource reservations
sharing policy
event-order constraints
deadlines / race horizons
NDC guards
progress consequences
```

then comparing only their exact-`q` obligation sets may be unsound.

The correct lifted term is conceptually

```text
TypedTerm = {
  obligations,
  prerequisites,
  resourceContracts,
  parityCommitments,
  orderAndDeadlines,
  guards,
  progressConsequence
}
```

and typed dominance must prove implication of the complete term, not merely subset inclusion of `obligations`.

This aligns exactly with the corrected typed response-contract calculus.

---

## 9. Output-provenance boundary

The theorem is a **value-proof** normalization.

Exact C4-0010 `q` is sufficient for ordinary future W/D/L transition identity, but it is not sufficient for terminal-line provenance.

Therefore:

```text
minimal exact-q proof-frontier antichain
```

must not be reused as an output quotient unless the corresponding `Pi0` provenance transport is retained and an output-safe implication theorem is proved.

A proof alternative absorbed for W/D/L can still carry unique terminal-line provenance.

---

## 10. Relation to collapse, transport and re-expansion

The previously observed standard-7x6 behavior becomes ordinary formula reduction.

At a defender universal node:

```text
A(True, True, ..., True)       = True       // collapse
A(True, ..., C, ..., True)     = C          // unique-hard transport
A(True, C1, C2, ..., Cn)       = A(C1,...,Cn) // re-expansion
```

At the next attacker choice layer, subset absorption then removes strategically redundant conjunctions.

Therefore vertical same-column transport is a geometric generator of a logical reduction, not the definition of the logical operator itself.

---

## 11. Immediate bounded implementation test

Do not run deeper recursion to test this theorem.

Use the retained tight control family:

```text
46656551
46656552
46656555
46656557
```

For each relevant P0 exact-`q` obligation, perform only one hard-frontier macro step for every legal P0 witness and record:

```text
raw admissible witness count
distinct exact H sets
minimal-antichain H sets
absorbed strict supersets
duplicate H sets
empty / unary / multi-hard terms
```

Then, only if the local reduction is material, test incremental antichain union for the already-retained small hard frontiers. Apply absorption after each union rather than materializing the full witness-map Cartesian product.

Hard limits for this research profile:

```text
wall clock: 5 minutes maximum per experiment
no increase in recursive depth
no increase in q-state caps
no oracle score/value as a proof premise
stop if antichain generation starts reconstructing broad physical search
```

Absence of subset compression is a valid negative result; it does not falsify the theorem.

---

## 12. Falsifiers and correction conditions

Rework a proposed implementation or extension if:

1. deleting a subset-dominated pure exact-`q` proof term changes the verified W/D/L proof result;
2. the supposedly dominated alternative carries a load-bearing CPC/NDC/resource/deadline premise not represented in the comparison;
3. an output layer loses unique `Pi0` provenance because value-only absorption was reused incorrectly;
4. incremental antichain combination silently drops a required frontier atom when taking unions;
5. a claimed typed dominance relation compares records with incompatible support, horizon or resource semantics.

The pure Boolean absorption theorem itself would fail only if `H_B(s,a)` were not actually a conjunction of sufficient recursive value obligations under the hard-frontier theorem's premises.

---

## 13. Consequence for the missing calculus

The research landscape now contains the same antichain/distributive structure at three places:

```text
WSL residual completion alternatives
  -> minimal subset antichain

recursive positive proof alternatives
  -> minimal exact-q obligation antichain

typed response preservation capabilities
  -> maximal subset antichain (order dual)
```

This suggests that the missing calculus is not likely to be another unrelated branching mechanism. A more coherent target is a **typed recursive distributive antichain algebra**:

```text
local CPC / WSL / support / NDC facts
  -> typed proof terms
  -> implication / compatibility order
  -> antichain normalization
  -> existential/universal composition
  -> well-founded progress
```

The pure exact-`q` result supplies the theorem-backed value skeleton. The current typed-compatible-cover work supplies the additional context required to lift absorption safely beyond that skeleton.

No complete standard-7x6 root proof or terminal-line-output classification follows from this note alone.
