# Response-capacity calculus and the center repair boundary

**Date:** 2026-09-13  
**Status:** theoretical research + exhaustive small abstract control; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Continue the perfect-play win-line predicate program from the center-opening cover-boundary defect.

The previous result showed that the non-center safety template closes all 69 geometric P0 win lines, while the corresponding center template leaves one bottom-row requirement after static coverage plus support-shadow preemption. The missing question is not another coverage identity. It is whether the defender can realize a complete response policy while also repairing that remaining defect.

This note introduces a response-capacity calculus that turns one large class of compatibility questions into exact finite matching/scheduling conditions.

The suspected cardinality of the final perfect-play winning-line subset remains an output only and is not used here.

Columns/rows below are 1-based.

---

## 1. Why WSL coverage is not enough

WSL upward closure answers:

> If blocker `B` is certified, which opponent requirements does it solve?

That part is already exact and heavily qualified.

The unresolved question is different:

> Can all blocker certificates in a proposed complete cover be realized by one contingent defender policy, with one defender move per turn and all response deadlines respected?

A static set of blockers can cover every geometric winning line while still being unrealizable as one strategy.

The center repair control demonstrates this directly.

The center K-shift field initially statically covers 66 of 69 lines and leaves:

```text
A1-D1
A3-D3
A5-D5
```

Rows 3 and 5 are then eliminated by support-shadow preemption, leaving the bottom defect `A1-D1`.

Now perform a deliberately optimistic **static-only** repair experiment. Replace the even-row singleton blockers in one left wing column by odd-row singleton blockers, as if the defender could locally flip control in that column without affecting any other response obligation.

Mechanical results:

```text
swap column 1: 69 / 69 statically covered
swap column 2: 64 / 69 statically covered
swap column 3: 63 / 69 statically covered
```

Thus a set-theoretic 69-line blocker cover exists under the column-1 local swap abstraction.

This does **not** prove that the defender can draw. The local swap was not certified as jointly realizable.

It proves the opposite methodological point:

```text
complete WSL coverage != complete strategic policy
```

Therefore any center proof that reasons only about blocker set inclusion is incomplete.

Evidence:

```text
docs/research/evidence/2026-09-13-center-repair-static-cover.json
```

---

## 2. Defender response turns as capacity slots

Index future defender turns before a relevant horizon by:

```text
S = {0, 1, ..., n-1}
```

Each slot has unit capacity: the defender can make exactly one legal move on that turn.

A **unit response obligation** `o` is an exact requirement that one defender action be executed during an admissible set of response turns before its deadline.

For the first calculus profile, assume its admissible turns form a contiguous interval:

```text
I(o) = [release(o), deadline(o)] subset_of S
```

Examples include:

- answer a playable singleton threat before the attacker's next turn;
- execute a paired response after its trigger and before the corresponding winning requirement can complete;
- occupy one blocker cell before a certified race horizon;
- spend one otherwise-free response turn repairing an uncovered requirement before its completion deadline.

Cell identity, playability, and CPC ownership remain separate guards. This section solves only **turn-slot capacity**.

---

## 3. Response schedule

A response schedule is an injective assignment:

```text
sigma : obligations -> S
```

such that:

```text
sigma(o) in I(o)
```

for every obligation `o`.

Injectivity encodes unit move capacity:

```text
one defender turn cannot discharge two independent move obligations
```

unless a lower theorem has already proved that one physical move semantically discharges both, in which case they should be represented as one shared response action rather than two obligations.

---

## 4. General Hall form

Construct the bipartite graph:

```text
left  = obligations
right = defender response slots
edge(o,s) iff s is legal for o
```

A complete temporal response schedule exists iff this graph has a matching covering every obligation.

By Hall's theorem, this is equivalent to:

```text
for every obligation subset A:
|N(A)| >= |A|
```

where `N(A)` is the union of slots available to obligations in `A`.

This already replaces arbitrary recursive policy selection by an exact finite combinatorial criterion once the obligation graph has been derived.

---

## 5. Interval-Hall reduction

Connect Four response obligations frequently have ordered release/deadline windows rather than arbitrary slot sets.

For interval neighborhoods, Hall feasibility reduces to interval-capacity inequalities:

```text
for every response-slot interval J=[a,b]:
count{o | I(o) subset_of J} <= |J|
```

If any interval violates this inequality, no complete response schedule exists.

Define:

```text
ResponseLoad(J)
  = count{o | I(o) subset_of J}

ResponseCapacity(J)
  = |J|
```

Then:

```text
Overloaded(J)
  := ResponseLoad(J) > ResponseCapacity(J)
```

and

```text
exists J: Overloaded(J)
=> PolicyTimingInfeasible
```

Conversely, for the unit interval-window profile, absence of every such overload is sufficient for a complete slot matching.

---

## 6. Exhaustive finite control

Prototype:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/response_capacity_calculus.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-response-capacity-calculus.json
```

The control exhaustively generated every ordered family of interval obligations through:

```text
1..4 response slots
0..n+1 obligations
```

for a total of:

```text
112,709 obligation families
```

For every family it compared:

1. explicit injective response-slot matching;
2. the interval-Hall inequalities above.

Result:

```text
112,709 tested
0 mismatches
```

The control is not the proof of Hall's theorem; it qualifies the intended finite implementation/formulation and catches direction/counting mistakes.

---

## 7. Double threat is the smallest overload

An ordinary double threat produces two mandatory answers before the same next attacker opportunity:

```text
I(o1) = {s}
I(o2) = {s}
```

but:

```text
ResponseCapacity({s}) = 1
ResponseLoad({s}) = 2
```

Therefore:

```text
2 > 1
=> PolicyTimingInfeasible
```

The usual tactical double-threat theorem is thus the smallest instance of response-capacity deficiency rather than a separate tactical primitive.

---

## 8. Tight intervals

Define:

```text
Tight(J)
  := ResponseLoad(J) = ResponseCapacity(J)
```

A tight interval has no spare defender move.

If a new independent repair obligation `r` must also be executed wholly inside the same interval:

```text
I(r) subset_of J
```

then:

```text
ResponseLoad'(J)
  = ResponseCapacity(J) + 1
```

and therefore:

```text
PolicyTimingInfeasible
```

This gives the exact **tight-interval repair theorem**:

```text
Tight(J)
AND RepairObligation(r)
AND I(r) subset_of J
=> no policy can discharge the old obligations plus r
```

The prototype includes saturated-prefix controls for this theorem.

---

## 9. Connect the theorem to the center boundary defect

The center safety template leaves one unpreempted bottom requirement after all currently certified static blockers and support-shadow preemptions:

```text
A1-D1
```

Any defender strategy that intends to restore a complete safety proof must do at least one of:

1. certify a new blocker intersecting that requirement;
2. certify an earlier defender terminal completion;
3. derive another first-win preemption relation;
4. alter the response policy so that one of the existing cells in the requirement is no longer available to P0.

When such a repair consumes one defender move before a deadline, represent it as a response obligation.

The positive center proof would follow from the following structural statement:

```text
P0 can force a response interval J before the repair deadline
such that J is already tight under every P1 safety policy compatible
with the currently required blockers.
```

Then the extra repair obligation creates Hall deficiency and the defender cannot close the safety cover.

This is much narrower than 'search the game tree'.

It is a **forced response-load theorem**.

---

## 10. Defect transfer

Suppose the defender abandons an existing mandatory response in order to spend the turn on the repair.

Then the original obligation is not discharged.

If that obligation's certificate was necessary for blocker `B`, the blocker becomes uncertified in that proof context:

```text
MissedResponse(o)
AND DependsOn(CertifiedBlocker(B), o)
=> not CertifiedBlocker(B)
```

Any requirement whose only current safety proof used `B` becomes unresolved again.

Thus a repair can move the proof defect rather than eliminate it:

```text
old uncovered requirement
  -> repair consumes response capacity
  -> previous blocker certificate loses support
  -> new uncovered requirement
```

This is **defect transfer**.

A complete positive calculus would prove that P0 can force defect transfer along a well-founded rank until a playable terminal requirement is reached.

Candidate ranks include:

- earliest completion event;
- support height;
- remaining response slack;
- requirement cardinality plus deadline rank;
- lexicographic combinations of the above.

No such global well-founded transfer theorem is claimed yet.

---

## 11. Integration with CPC / WSL / NDC

The layers now separate cleanly.

### CPC

Derives whether a proposed response event is actually controlled/obtainable under the current event reservoir and its reservations/releases.

Produces facts such as:

```text
ResponseActionAvailable(o,a)
ResponseParityPreserved(fragment)
```

### WSL

Maps certified response/blocker actions to solved residual requirements:

```text
CertifiedBlocker(B)
AND B subset_of R
=> SolvedRequirement(R)
```

### NDC

Carries nested prerequisites, deadlines, and feedback:

```text
response fact
-> blocker
-> requirement elimination
-> changed relevance/reservoir
-> stronger/weaker response fact
```

### Response-capacity calculus

Given currently derived mandatory response obligations and legal windows, decides whether those obligations can fit into defender turns at all.

```text
obligations + windows
-> feasible response schedule
or
-> Hall deficiency
```

This is a distinct missing operation from blocker coverage.

---

## 12. Revised predecessor calculus

The strategic predecessor calculus can now be decomposed into smaller exact owners.

### Negative / safety predecessor

To prove `NonWin0(s)`:

1. derive a blocker/preemption cover of all P0 residual requirements;
2. derive legal response actions for every certificate;
3. prove response-resource compatibility;
4. prove temporal response capacity by matching/Hall conditions;
5. prove no earlier P0 completion races ahead of the safety policy.

### Positive / progress predecessor

To prove `Win0(s)` structurally, it is enough to derive that every candidate defender safety policy fails through one of:

```text
coverage defect
resource conflict
response-capacity overload
deadline/race preemption
```

plus a constructive P0 policy that preserves the defect/progress relation after every defender alternative.

The center boundary result supplies the initial coverage defect. The response-capacity calculus supplies one exact way a repair can fail.

The remaining missing theorem is the constructive **forced obligation / defect-propagation rule** that keeps this failure alive against every P1 choice.

---

## 13. New predicates

Promote the following candidate proof predicates:

```text
ResponseObligation(o)
ReleaseSlot(o,r)
DeadlineSlot(o,d)
AllowedResponseInterval(o,[r,d])
ResponseLoad(J,n)
ResponseCapacity(J,n)
TightResponseInterval(J)
ResponseOverload(J)
RepairObligation(o)
TemporalPolicyFeasible(P)
TemporalPolicyInfeasible(P)
DefectTransferred(R1,R2)
```

These are proof/calculus predicates, not primitive game rules.

`TemporalPolicyFeasible` must still be conjoined with CPC event ownership/playability and non-temporal resource compatibility before a strategic certificate is accepted.

---

## 14. Strong conclusions

Established:

1. static 69-line blocker coverage is not sufficient to prove policy realizability at the center;
2. temporal unit-response compatibility is exactly a matching problem once obligations and legal slots are known;
3. interval response windows admit a compact Hall-capacity test;
4. double threat is a special case of response-capacity overload;
5. a new repair inside a tight response interval is impossible without abandoning another obligation;
6. the center positive proof can therefore be sharpened from 'find a winning strategy' to 'derive a forced sequence of obligations whose safety repairs eventually overload or transfer the blocker defect'.

Not established:

1. that every Connect Four response obligation has an interval response window;
2. that cell/resource conflicts always reduce to response-slot matching;
3. that the center attacker can force a tight interval before every possible repair deadline;
4. a well-founded defect-transfer rank proving eventual P0 completion;
5. any final perfect-play terminal-line membership or cardinality.

---

## 15. Next decisive experiment

Use the already admitted / independently proved early center-opening value labels only as a control set.

For each of the 19 value-preserving third-ply P0 edges:

1. derive residual requirements and support/event deadlines;
2. generate mandatory P1 response obligations without consulting the edge's value label;
3. compute response-load intervals;
4. test whether winning edges exhibit a common tight/overloaded obligation signature absent from draw/loss edges;
5. anti-unify any successful signature into a rule;
6. then re-run the rule without value labels.

If this succeeds, it supplies the missing positive progress producer. If it fails, the mismatch identifies which additional resource/race predicate the response-capacity abstraction still lacks.
