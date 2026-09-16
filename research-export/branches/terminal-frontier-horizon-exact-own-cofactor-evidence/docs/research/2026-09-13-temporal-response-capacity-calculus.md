# Temporal response-capacity calculus — current missing predecessor seam

**Date:** 2026-09-13  
**Status:** theoretical research / exact theorem schemas + center-root continuation target; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and synthesis:** OpenAI ChatGPT

## Purpose

Continue the self-proving Connect Four line-output program from the current winning-region/output factorization without discarding newer valid work.

The current theory has already isolated the Boolean winning region as

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

and perfect-play terminal-line output as a second existential provenance fixed point inside `W`.

The remaining Connect-Four-specific problem is not the fixed-point shell. It is to discharge `PreE` and `PreA` symbolically from CPC / WSL / support / response / deadline facts without enumerating all structural successors.

The center-opening boundary-defect theorem supplies a concrete standard-board test case:

```text
non-center K-shift safety template:
  67 static blocker eliminations
+  2 support-shadow preemptions
= 69-line safety closure

center K-shift template:
  66 static blocker eliminations
+  2 support-shadow preemptions
+  1 unresolved bottom requirement A1-D1
= 69
```

This note sharpens that single unresolved requirement into a temporal response-capacity problem.

The suspected final perfect-play terminal-line count remains an output only and is not available to any rule below.

---

## 1. Preserve the two-stage exact semantics

### Stage 1 — value

Let:

```text
I      = immediate P0 terminal wins
PreE(X)= P0-to-move states with some legal successor in X
PreA(X)= P1-to-move states with every legal successor in X
```

Then:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

### Stage 2 — terminal-line provenance

Once `W` is known, perfect W/D/L trajectories are exactly legal paths contained in `W`.

For original geometric line label `L`:

```text
P_L = mu Y . [ T_L OR (W AND <move>Y) ]
```

and:

```text
PPWinLine(L) <=> P_L(root)
```

Therefore response-capacity reasoning belongs in **Stage 1** as a symbolic predecessor transformer. It must not use downstream terminal-line membership as authority.

---

## 2. Safety and progress are distinct proof obligations

The center/non-center comparison shows that blocker coverage alone is a safety calculus.

Define conceptually:

```text
Safety(P1,s)
```

as the existence of a legal P1 contingent response policy that prevents every surviving P0 completion before its deadline.

A complete safety certificate proves:

```text
Safety(P1,s) => s notin W
```

for a P0-to-move or otherwise appropriately rooted non-win obligation.

The center boundary result shows one structural policy family failing safety by exactly one bottom requirement.

Failure of one safety policy is not yet a P0 winning proof. The positive side additionally needs:

```text
Progress(P0,s)
```

meaning every admissible defender attempt either:

1. permits an earlier P0 completion; or
2. transforms the proof state to another unresolved obligation state under a well-founded progress rank.

A positive predecessor certificate therefore has the generic shape:

```text
NoCompleteDefenderSafetyCover
AND WellFoundedProgress
=> state in W
```

This is the missing positive calculus seam.

---

## 3. Response obligations and response actions

For a structural proof context `X`, define a finite obligation family:

```text
O(X) = { o_1, ..., o_m }
```

Each obligation carries at least:

```text
Requirement(o)   // WSL residual or higher proof obligation
Deadline(o)      // latest event/rank by which it must be discharged
Guards(o)        // support/CPC/NDC premises under which it is live
```

Define a finite family of candidate defender response actions:

```text
R(X) = { r_1, ..., r_n }
```

with predicates:

```text
LegalResponse(r)
AvailableBefore(r, Deadline(o))
Discharges(r,o)
ResourceConflict(r1,r2)
OrderConflict(r1,r2)
ParityCompatible(r1,r2)
```

One physical response may discharge several obligations simultaneously. Therefore ordinary one-to-one matching is not the general model.

The exact policy object is a temporally feasible hitting/cover set:

```text
Policy(P) := P subset_of R(X)
```

such that:

```text
for every o in O(X):
  exists r in P:
    Discharges(r,o)
    AND AvailableBefore(r,Deadline(o))
```

and all members of `P` are jointly legal under resource/order/parity constraints.

---

## 4. Exact safety-discharge theorem

Define:

```text
CoversAll(P,O)
Compatible(P)
TimingSafe(P,O)
```

Then the following theorem schema is sound:

```text
CoversAll(P,O)
AND Compatible(P)
AND TimingSafe(P,O)
AND every opponent winning requirement appears in O
=> defender has a complete safety policy over the represented horizon
```

Combined with WSL upward closure:

```text
CertifiedBlocker(B,h)
AND B subset_of Requirement(o)
=> Discharges(blocker-certificate,o)
```

CPC supplies ownership/response control premises; NDC supplies nested guards and feedback; support order supplies accessibility and deadline constraints.

The historical Allis `Solutions + Combination` procedure is an instance of this theorem schema. The repository's earlier 331,955-instance control already established that named-rule solved-group semantics collapse exactly to generic 625-ID blocker upward closure. The unresolved part is certificate compatibility/timing and policy synthesis, not coverage representation.

---

## 5. Response-capacity lower bounds

A full compatible-cover search is not the desired production calculus. We need structural conditions that prove no complete policy exists.

### 5.1 Distinct-response Hall deficiency

For an obligation subset `A subset_of O`, let:

```text
N(A) = { r in R | r can timely discharge at least one o in A }
```

If it is independently proved that each response in `N(A)` can discharge **at most one** obligation of `A`, then Hall's necessary condition applies:

```text
|N(A)| < |A|
=> no complete response policy exists for A
```

This is an exact theorem only under the distinct-response premise. A single Connect Four move may kill several winning requirements at once, so the premise must be derived rather than assumed.

### 5.2 Deadline-prefix overload

Let `A_h` be obligations whose deadlines are no later than horizon `h`.

If every obligation in `A_h` requires a distinct defender move and only `k` defender move slots are legally available before `h`, then:

```text
|A_h| > k
=> at least one obligation survives beyond its deadline
```

This is the temporal form of response overload.

### 5.3 General cover lower bound

Let:

```text
coverLB(A)
```

be any independently proved lower bound on the number of jointly compatible response actions needed to discharge `A`, and:

```text
capacity(A)
```

an independently proved upper bound on compatible response actions available before the relevant deadlines.

Then:

```text
coverLB(A) > capacity(A)
=> no complete safety policy exists for A
```

This theorem allows stronger Connect-specific lower bounds than ordinary matching without requiring a generic NP-hard set-cover solve.

---

## 6. Repair transitions and defect transfer

For the center safety template, after static blocker closure and support-shadow preemption, define the unresolved defect:

```text
D0 = { A1-D1 }
```

A defender repair action `r` is any legal response intended to eliminate `D0` while preserving the rest of the safety policy.

Define the exact NDC consequence closure of applying `r`:

```text
RepairClosure(X,r) = X'
```

which must account for:

- the new occupied/support event;
- blocker creation;
- response-resource consumption;
- events reserved or released;
- CPC parity changes;
- changed requirement relevance;
- newly live deadlines/race relations;
- any support-shadow or first-win preemption consequences.

Let:

```text
Defects(X')
```

be the remaining obligations for which no currently certified timely safety discharge exists.

The candidate **defect-transfer invariant** is:

```text
for every legal center-defect repair r:
  either P0 completes first
  or Defects(RepairClosure(X,r)) is nonempty
```

This is a hypothesis, not yet a theorem.

A stronger positive proof would additionally provide a well-founded rank `rho` such that every nonterminal repair satisfies:

```text
rho(X') < rho(X)
```

under a convention where reaching rank zero is a forced P0 terminal seed.

Then finite descent would prove progress.

---

## 7. Candidate progress ranks

No progress rank is accepted yet. Useful candidates to test include lexicographic combinations of:

```text
earliest unresolved deadline
minimum response-capacity deficit
number of unresolved requirement equivalence classes
support-event distance to a playable singleton
number of defender response slots remaining before the critical horizon
NDC dependency rank
```

A valid rank must be:

1. finite over standard 7x6;
2. strictly monotone under every nonterminal defender repair covered by the theorem;
3. insensitive to irrelevant scheduling/order representation;
4. strong enough that rank-zero implies an exact terminal/proven predecessor fact.

Failure of all plausible ranks is evidence that the repair relation contains a genuine strategic cycle or requires richer state.

---

## 8. Integration with the fixed-point predecessor calculus

Response-capacity lemmas are not new game semantics. They are macros for membership in the existing predecessor fixed point.

Examples:

```text
playable P0 singleton
=> I

P1 to move + all legal responses preserve X
=> PreA(X)

P0 to move + one certified action reaches X
=> PreE(X)

response-capacity deficiency + well-founded progress to I
=> membership in some finite E/A unfolding of W
```

Thus the research target is not to replace `PreE/PreA`, but to prove their membership over **regions of CPC/WSL/NDC states** at once.

---

## 9. Why residual histograms are insufficient

The opening-prefix control already produced exact states with identical raw/minimal residual-size histograms but different W/D/L values.

Therefore any response-capacity calculus that uses only:

```text
number of residual requirements by cardinality
```

is incomplete.

The missing distinction is restored in that bounded control when exact support/location information is included.

This aligns with the temporal-capacity formulation:

```text
which obligations exist
```

is weaker than:

```text
which obligations become playable when,
which responses are accessible before which deadlines,
and which response resources conflict.
```

---

## 10. Current theorem boundary

### Established

- the winning-region / terminal-line-output problem factors exactly into `W` then provenance reachability;
- the center K-shift safety template leaves one bottom-row defect after 68 exact eliminations/preemptions;
- WSL blocker coverage representation is already generic and independently qualified at large scale;
- support-shadow preemption is an exact temporal elimination theorem;
- residual-size summaries alone cannot determine W/D/L even at the bounded third-ply control;
- any complete symbolic predecessor calculus must preserve support/accessibility/timing information.

### Not established

- that every repair of the center bottom-row defect necessarily transfers rather than removes the safety deficit;
- a Hall/cover-capacity deficiency for every such repair;
- a well-founded progress rank proving eventual P0 completion;
- a complete standard-7x6 symbolic `PreE/PreA` calculus;
- any final perfect-play terminal-line membership or cardinality.

---

## 11. Next decisive experiment

Starting from the center-opening K-shift safety context:

1. enumerate only the **local legal repair actions** for the single unresolved bottom requirement, not the full game tree;
2. for each repair, compute exact CPC/WSL/support/NDC consequence closure;
3. derive the new obligation family and temporal response graph;
4. test, in order:
   - direct terminal completion;
   - support-shadow preemption;
   - distinct-response Hall deficiency;
   - deadline-prefix overload;
   - stronger cover lower bounds;
   - defect-transfer invariance;
5. search for a finite progress rank over the resulting repair-closure graph;
6. use complete small games as falsification controls before making a standard-root claim.

Success would provide a positive symbolic predecessor macro for the exact fixed-point `W` calculus. Failure should identify the smallest repair context whose value cannot be decided from the current CPC/WSL/NDC predicate language.

## Claim discipline

The external solved terminal-line subset remains quarantined. The suspected output cardinality is not used as a target count during response-capacity derivation. A result is promoted only when its premises are independently rule-derived or explicitly admitted value premises and its conclusion follows without importing solved terminal-line reachability.
