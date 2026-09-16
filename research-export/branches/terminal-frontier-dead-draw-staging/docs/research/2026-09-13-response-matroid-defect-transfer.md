# Response-matroid defect transfer

**Date:** 2026-09-13  
**Status:** theoretical research + finite controls; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Sharpen the missing policy-compatibility calculus exposed by the perfect-play win-line program.

Earlier work established three facts:

1. WSL-625 exactly represents blocker coverage once a blocker is certified;
2. the center-opening safety template has one bottom-row boundary defect after static blockers plus support-shadow preemption;
3. static blocker coverage can be repaired on paper without proving that the resulting blocker family is one realizable contingent policy.

This note identifies a useful exact algebra for the temporal part of joint policy realizability: response obligations matched to defender turns form a **transversal matroid**. Its circuits give a canonical defect-transfer operation.

The final perfect-play terminal-line subset and its suspected cardinality remain outputs only.

---

## 1. Response obligations as a bipartite system

Let `O` be a finite set of currently mandatory defender response obligations.

Let `S` be the finite set of defender response turns before the relevant proof horizon.

For each obligation `o`, define its legal response-turn set:

```text
A(o) subset_of S
```

The set `A(o)` is derived only after support, playability, deadline, and CPC guards have been established.

Construct the bipartite graph:

```text
O  <->  S
```

with edge:

```text
o -- s  iff  s in A(o)
```

A set of obligations `I subset_of O` is **temporally realizable** iff there exists an injective matching of every obligation in `I` to a legal defender turn.

Define:

```text
Independent(I)
  := I has a complete response-slot matching
```

---

## 2. Transversal-matroid theorem

For a fixed bipartite obligation-to-response graph, the family:

```text
M = { I subset_of O | Independent(I) }
```

is the family of independent sets of a transversal matroid on ground set `O`.

Therefore the response-capacity layer has, automatically:

1. **heredity** — removing obligations from a realizable policy leaves it realizable;
2. **exchange** — if two realizable obligation sets have different sizes, an obligation from the larger can augment the smaller while preserving realizability;
3. a **rank function** — `rank(A)` is the maximum number of obligations in `A` that can be simultaneously scheduled;
4. **circuits** — minimal obligation families that cannot all be scheduled;
5. **closure** — obligations whose addition does not increase response rank.

This is stronger structure than an arbitrary compatibility graph.

Finite formulation control:

```text
docs/research/evidence/2026-09-13-response-matroid-control.json
```

The control checked hereditary and exchange laws on two small response graphs, including parallel obligations with identical legal turn sets.

---

## 3. Rank and overload

For obligation set `A`, define:

```text
ResponseRank(A)
  = maximum matching size of A into response turns
```

Then:

```text
A is temporally feasible
iff ResponseRank(A) = |A|
```

and:

```text
ResponseDeficiency(A)
  = |A| - ResponseRank(A)
```

A positive deficiency is an exact temporal incompatibility certificate.

The interval-Hall calculus from the previous note computes this feasibility compactly when legal response turns are contiguous deadline intervals.

---

## 4. Circuits generalize double threats

A matroid circuit `C` is a minimal dependent response-obligation set:

```text
ResponseRank(C) = |C| - 1
```

while every strict subset is schedulable.

The ordinary double threat is the smallest example:

```text
C = { answer threat x, answer threat y }
```

with both obligations constrained to the same one defender turn.

Thus double threat is not a separate tactical primitive. It is a size-two response circuit.

Larger strategic overloads are larger circuits.

---

## 5. Repair circuit theorem

Let `I` be an independent set of already-required defender obligations.

Suppose an uncovered P0 requirement creates an additional repair obligation `r`.

If:

```text
ResponseRank(I union {r}) = ResponseRank(I)
```

then `r` lies in the matroid closure of `I` and:

```text
I union {r}
```

is dependent.

Because `I` is independent, there is a unique fundamental circuit:

```text
C(r,I) subset_of I union {r}
```

containing `r`.

Any temporally feasible policy that retains the repair must remove at least one existing obligation:

```text
exists e in C(r,I) \ {r}
```

such that the repaired policy uses:

```text
(I - {e}) union {r}
```

or removes still more obligations.

This is an exact alternative to generic policy backtracking: the only obligations that need to be considered as displaced by the repair are members of the fundamental circuit.

---

## 6. Connect response circuits to WSL coverage

For each obligation/certificate element `e`, let:

```text
Solved(e) subset_of ActiveRequirements
```

be the WSL requirements whose safety proof currently depends on `e`.

For policy set `I`, define the private coverage of `e`:

```text
Private(e,I)
  = Solved(e) \ union_{f in I, f != e} Solved(f)
```

If:

```text
Private(e,I) != empty
```

then removing `e` re-opens at least one requirement.

Combine this with the repair circuit theorem:

```text
Repair(r,L)
AND r in closure_M(I)
AND for every e in C(r,I)\{r}: Private(e,I) != empty
```

implies:

```text
covering L necessarily re-opens another requirement
```

This is **defect transfer**.

The proof defect has moved; it has not disappeared.

---

## 7. Minimal covers make transfer sharper

If `I` is inclusion-minimal with respect to the set of requirements it currently covers, then every element has nonempty private coverage:

```text
for every e in I:
Private(e,I) != empty
```

Therefore, for an independent minimal near-cover `I`, any repair `r` that is matroid-dependent with `I` must transfer the defect somewhere in the fundamental circuit.

The only remaining ambiguity is **which** circuit element/requirement becomes the new defect.

That ambiguity is much smaller than choosing an arbitrary alternative policy from scratch.

---

## 8. Early-prefix falsifier: coverage alone has zero value discrimination

A new bounded control strengthens the need for this compatibility calculus.

Use the exact 49 third-ply positions after:

```text
P0: column 4
P1: any reply 1..7
P0: any third move 1..7
```

with their independently admitted / reflection-derived W/D/L labels:

```text
19 P0-win
10 draw
20 P0-loss
```

For every state, generate the A1-A9 strategic-rule **solution-shape blockers** and take their raw WSL upward-coverage union, deliberately ignoring simultaneous compatibility.

Result:

```text
20 / 20 P0-loss states: full P0 requirement coverage
10 / 10 draws:          full P0 requirement coverage
19 / 19 P0-win states:  full P0 requirement coverage
```

So:

```text
raw blocker union = complete
```

for all 49 states, regardless of value.

Evidence:

```text
docs/research/evidence/2026-09-13-early-blocker-union-non-discrimination.json
```

This is a strong falsifier for any calculus that treats independently generated blockers as if their union were automatically one valid policy.

At this prefix depth, **coverage alone carries zero W/D/L discrimination** in the control set.

The value-bearing information must therefore reside in:

- compatibility;
- response resources;
- event order;
- deadlines/races;
- and positive progress obligations.

---

## 9. Relation to the center repair falsifier

The center static-repair control found that one hypothetical local parity swap can produce a 69-of-69 blocker hitting set even though the standard center opening is P0-winning.

That result and the 49-prefix blocker-union result say the same thing at two scales:

```text
set cover is necessary but radically insufficient
```

The blocker lattice owns `what would be solved if these certificates were jointly valid`.

The response matroid begins to own `which temporal obligations can actually coexist`.

CPC/NDC still own whether each proposed response action is legally controlled, playable, resource-compatible, and fast enough.

---

## 10. Revised safety certificate

A complete P1 safety certificate should therefore have the shape:

```text
Policy P

Coverage:
  every active P0 requirement is solved by at least one certificate in P

CPC validity:
  every response action used by P has its ownership/reservation guards proved

Resource validity:
  response cells/fragments are mutually compatible

Temporal validity:
  ResponseRank(Obligations(P)) = |Obligations(P)|

Race validity:
  no P0 completion preempts the policy's required response horizon
```

Only the conjunction proves `NonWin0`.

---

## 11. Revised positive predecessor calculus

For P0, a structural win proof can now target the negation of the safety certificate more systematically.

Given every candidate P1 safety cover, prove one of:

```text
uncovered P0 requirement
CPC-invalid response
resource conflict
response-matroid circuit / positive deficiency
P0 completion preempts defender deadline
```

When the failure is a response circuit, use fundamental-circuit exchange plus private WSL coverage to derive a smaller family of transferred defects rather than restarting policy search.

This gives a candidate closure loop:

```text
P0 requirement defect
-> proposed P1 repair
-> response circuit
-> eject one circuit obligation
-> WSL private coverage re-opens requirement(s)
-> new defect
-> ...
```

If a well-founded rank on these defects can be proved to increase/decrease monotonically until a playable P0 completion is reached, the positive center proof closes without ordinary move-tree enumeration.

---

## 12. What remains missing

The gap is now narrower.

We do **not** need another blocker representation.

We still need to derive:

1. a canonical obligation set from each CPC/WSL/NDC certificate family;
2. the exact response-turn/action neighborhoods for those obligations;
3. higher resource constraints not captured by turn-slot matching alone;
4. which blocker certificates are private/essential in a minimal safety cover;
5. a well-founded defect-transfer rank;
6. an attacker rule that forces the next repair/circuit event rather than merely observing it after a move-tree branch.

The fifth and sixth items are the remaining **progress calculus**.

---

## 13. Next decisive test

Use the 19 early P0-winning prefixes as positive controls and the 30 non-winning prefixes as negative controls.

For each state, construct candidate minimal safety covers with full rule-instance identity retained, then map every selected certificate to:

```text
coverage mask
response obligations
allowed response turns/actions
CPC/resource guards
race horizon
```

Compute:

```text
coverage completeness
response-matroid rank
fundamental circuits
private coverage on circuit elements
```

The decisive question is whether the 19 winning labels are characterized by unavoidable cover defects/circuits while the non-winning labels admit at least one independent, race-safe complete cover.

If yes, the missing predecessor calculus has been located in exact algebraic form. If not, the first mismatching state identifies the next omitted guard.
