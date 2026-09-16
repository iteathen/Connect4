# Center response serialization: correction and exact capacity theorem

**Date:** 2026-09-13  
**Status:** corrective structural theorem / exact event-order control; supersedes the strategic interpretation of several earlier static repair experiments  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Correct an important scheduling error exposed while attempting to extend the center-defect calculus.

Several immediately preceding experiments treated a static certificate field after the hypothetical prefix

```text
D1 E1 A1 B1
```

while still retaining the `A-even` guarantee, including ownership of `A2` by P1.

That static coverage calculation is mathematically meaningful as a **counterfactual certificate exchange**, but it is not a realizable strategy state: after P0 plays `A1`, preserving the A-even Claimeven certificate requires P1 to spend that very response turn on `A2`. P1 cannot simultaneously play `B1` and reserve `A2`.

This is not merely an erratum. The scheduling conflict yields the first exact temporal response-capacity theorem in the center proof.

---

## 1. Scope of the correction

The following earlier notes remain valid for the static geometry/coverage facts they explicitly enumerate, but their post-`A1` strategic interpretation must be read as **counterfactual** rather than as a proved legal policy state:

```text
docs/research/2026-09-13-center-defect-edge-denial-amplification.md
docs/research/2026-09-13-five-diagonal-singleton-capacity.md
docs/research/2026-09-13-center-defect-lift.md
```

In particular, it is unsound to combine:

```text
P1 move B1 immediately after A1
```

with the simultaneous unconditional certificate:

```text
Owner(A2)=P1
```

when that ownership fact was supposed to be produced by the triggered A-column Claimeven response.

Their static cover transformations remain useful for studying certificate exchange and defect shapes, but they do not establish `PreE`/`PreA` membership.

---

## 2. Exact event order after the center opening

Start with:

```text
1. P0 D1
1... P1 E1
2. P0 A1
```

Suppose P1 attempts to preserve the center template's A-even control.

The active Claimeven response is:

```text
Trigger:  P0 owns A1
Response: P1 immediately owns A2
```

Since `A2` is now playable and turns alternate, the unique next event preserving this certificate is:

```text
2... A2
```

Thus the legal certificate-preserving prefix is:

```text
D1 E1 A1 A2
```

not `D1 E1 A1 B1` with A-even retained.

---

## 3. P0 creates a response collision

After:

```text
D1 E1 A1 A2
```

it is P0's turn.

P0 may play either interior bottom cell:

```text
B1
```

or, symmetrically for the local obligation structure,

```text
C1.
```

Consider `B1`.

The bottom-row P0 line is now:

```text
A1  B1  C1  D1
P0  P0  --  P0
```

So `C1` is an immediate singleton terminal requirement. P1 has no four-stone counterwin at this early rank; to avoid P0 winning on the next move, P1 must occupy:

```text
C1.
```

But the move `B1` simultaneously triggered the B-even response obligation:

```text
Respond(B1,B2).
```

P1 has only one move.

Therefore the two response obligations are incompatible at the same deadline:

```text
BlockBottom(C1)
Respond(B1,B2)
```

and terminal safety forces P1 to choose `C1`.

Hence:

```text
B-even is lost.
```

Now P1 itself has occupied `C1`. On P0's next turn:

```text
C2
```

is directly playable. Therefore P1 cannot retain an unconditional C-even ownership certificate either:

```text
C-even is lost.
```

The `C1` first branch is symmetric in the obligation logic:

```text
P0 C1
P1 must B1
```

which misses the `C2` response and self-exposes `B2`.

Thus again:

```text
B-even and C-even are both lost.
```

---

## 4. Dual-control sacrifice theorem

The result can be stated without named strategic-rule taxonomy.

Let:

```text
EvenControl(c)
```

mean a response certificate whose first relevant base trigger is:

```text
Opponent(c,1) -> Controller(c,2) before opponent's next move in c.
```

Let the attacker already own three cells of a bottom winning interval and let the remaining bottom cell be `y1`.

If the attacker now plays base cell `x1` in another controlled column and this creates:

```text
1. response obligation x2 to preserve EvenControl(x),
2. terminal-block obligation y1 before the attacker's next turn,
```

then a one-move defender cannot satisfy both when `x2 != y1`.

If terminal safety forces `y1`, then:

```text
EvenControl(x) fails
```

and because the defender itself owns `y1`, the successor `y2` becomes playable to the attacker, so an unconditional:

```text
EvenControl(y)
```

also fails.

Therefore one attacking base move plus one forced terminal block destroys two even-control certificates:

```text
EvenControl(x) AND EvenControl(y)
 -> attacker x1
 -> defender forced y1
 -> NOT EvenControl(x)
    AND NOT EvenControl(y).
```

This is an exact **response-capacity / serialization theorem**.

---

## 5. Why this is stronger than the static defect analysis

The earlier search for Hall-style set-cover deficiency was working one abstraction too late.

The decisive conflict appears before blocker coverage:

```text
one defender turn
<
two simultaneously deadline-bound response obligations.
```

The correct resource is therefore not merely a set of candidate blocker cells. It is a set of **time-indexed response slots**.

A response certificate consumes a slot:

```text
(trigger, deadline, response action).
```

Two certificates conflict whenever their required actions are distinct and their admissible response windows contain only the same single defender turn.

This is the temporal analogue of Hall deficiency at capacity one.

---

## 6. Conservative structural aftermath

A mechanical control retains only safety certificates not contradicted by the forced local sequence:

```text
A future even claims already rooted in A2
F/G even control
fixed D/E pair blocker field
physical P1 stones
```

and deliberately assumes no replacement B/C control.

The surviving static P0 line field is large:

```text
P0 B1, P1 C1 branch: 21 uncovered lines
P0 C1, P1 B1 branch: 20 uncovered lines
```

These counts are not claimed to be minimal strategic defects; richer pair/Before/NDC certificates can eliminate many of them.

Their significance is only that the forced response collision destroys enough of the original center safety field that the previous one-defect static picture cannot be propagated unchanged through legal time.

---

## 7. Relation to Before and the next calculus layer

The elementary local rules Claimeven/Baseinverse/Vertical do not solve the odd-row horizontal family generated by this loss of control. This aligns with the historical reason for the `Before` rule: it converts a lower controller group into a race certificate against the successors above it.

For example, in the legal branch where P1 has `A2`, the lower group:

```text
A2-B2-C2-D2
```

is the natural candidate `Before` group for refuting:

```text
A3-B3-C3-D3.
```

The generic Before theorem is exactly a contingent response object:

```text
if opponent plays a missing lower event -> controller responds at its successor;
otherwise controller eventually completes the lower group first.
```

So `Before` is not an exception to the response-capacity calculus. It is one of its first nontrivial composite certificates.

The next task is therefore to determine whether the required Before/Lowinverse/Claimeven components can be combined **without another response-slot collision**. That compatibility question, not raw blocker coverage, is the current proof seam.

---

## 8. Fixed-point interpretation

The value target remains:

```text
W = mu X . [ I union PreE(X) union PreA(X) ].
```

The new theorem supplies a symbolic predecessor transformation of the form:

```text
region with two even-control response obligations
+ attacker bottom-race trigger
=> every terminal-safe defender response loses both controls
=> successor lies in a weaker safety region.
```

This is precisely the kind of region-level transformer needed to replace explicit child enumeration.

---

## 9. Evidence

Prototype:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/center_response_serialization.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-center-response-serialization.json
```

The control verifies legal event order, the forced bottom block, the missed even response, the newly playable successor cell, and the conservative surviving static line counts.

Literature alignment: Allis's compatibility analysis identifies the same underlying invariant in broader form: strategic rules can be combined only when filling one rule does not change the parity/zugzwang assumptions required by another; he explicitly describes a Claimeven/Lowinverse incompatibility caused by an odd number of newly available events. The present result derives a simpler capacity-one version directly from event order and terminal deadlines rather than adopting the historical rule taxonomy as a primitive.

---

## 10. Claim boundary

### Established

- retaining A-even after `D1 E1 A1` requires the response `A2` on that P1 turn;
- after `D1 E1 A1 A2`, P0 can play B1 or C1 and create a terminal singleton on the other bottom cell;
- P1 must occupy that remaining bottom cell rather than execute the triggered row-2 even response;
- this loses the triggered column's even-control certificate;
- the forced P1 base move makes row 2 immediately playable in the blocking column, so that column's unconditional even-control certificate is also lost;
- the two losses arise from a single response-slot collision and are exact consequences of turn order, gravity and first-win semantics.

### Corrected / downgraded

- the previously studied `D1 E1 A1 B1` + A-even certificate field is **not** a realizable joint policy state;
- its five-diagonal and row-lift transformations remain static counterfactual certificate algebra only;
- they must not be used as evidence that the actual game has reached those exact defect sets.

### Not established

- a complete replacement safety policy after the dual-control sacrifice;
- whether a compatible Before-based repair closes the resulting odd-row horizontals;
- a universal progress rank for all P1 replies after `A1`;
- the standard root `PreE/PreA` proof;
- any final perfect-play terminal-line membership or cardinality.

## Next seam

Analyze composite response certificates after the **legal** forced sequence, beginning with the candidate Before group `A2-D2`.

For each candidate repair, track not only its solved requirements but the complete schedule:

```text
trigger
required response
latest legal response turn
events released by the response
CPC parity delta
conflicts with other active response windows
```

The first goal is to determine whether `A2-D2 Before` can coexist with the remaining D/E inverse field and A/F/G control without a response-window collision. If it cannot, the conflict itself is the next symbolic predecessor rule.
