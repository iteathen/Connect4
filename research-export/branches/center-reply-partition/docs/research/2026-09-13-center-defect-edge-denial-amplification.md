# Center-defect edge denial and diagonal amplification

**Date:** 2026-09-13  
**Status:** exact finite-geometry theorem over the column-parity safety family; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Continue the temporal response-capacity investigation from the center-opening boundary defect.

The previous result established that the generic center `K=4` safety template leaves one unresolved bottom-row P0 requirement after static blockers and support-shadow preemption:

```text
A1-B1-C1-D1
```

This note asks a narrower question before attempting a full Hall/progress proof:

> inside the complete per-column odd/even control family underlying the parity safety construction, can P1 repair that defect, and if so can P0 deny the repair by move order?

The answer is structurally informative:

1. there is exactly one complete static parity repair;
2. it requires P1 odd-control of the edge column `A`, specifically `A1,A3,A5`;
3. after `D1 E1`, P0 has the move and can play `A1`, denying that unique complete repair;
4. any temporally feasible parity repair through `B1` or `C1` then leaves a nonempty family of diagonal P0 requirements.

This is not yet a proof that no more general P1 certificate exists. It is an exact theorem about the entire column-parity control family plus the fixed `D/E` pair blockers.

Mathematical columns/rows are 1-based.

---

## 1. Starting center safety field

Use the center-opening prefix:

```text
P0: D1
P1: E1
P0 to move
```

The inherited center safety template contains:

```text
paired columns: D,E
P1 even-controlled columns: A,B,C,F,G
```

with singleton P1 blockers at every even row of the even-controlled columns, plus the established `D/E` pair blockers.

Mechanical coverage over all 69 geometric lines yields three static survivors:

```text
A1-B1-C1-D1
A3-B3-C3-D3
A5-B5-C5-D5
```

The row-3 and row-5 survivors are discharged by support-shadow preemption, leaving the bottom defect as the only unresolved requirement in the prior theorem.

---

## 2. Column-parity repair family

For each outer column

```text
A,B,C,F,G
```

allow one of two P1 control certificates:

```text
Even(c) -> P1 owns c2,c4,c6
Odd(c)  -> P1 owns c1,c3,c5
```

Retain the fixed `D/E` pair blocker family.

This deliberately defines a complete finite family:

```text
2^5 = 32
```

outer-column parity assignments before occupancy constraints are applied.

Coverage is evaluated only by exact set inclusion against the mechanically generated 69 lines. No solved-game line classification is used.

---

## 3. Static repair before turn order is applied

Suppose counterfactually that P1 may choose a bottom repair anchor among:

```text
A1, B1, C1
```

and the repair column is therefore odd-controlled.

Exhausting every outer-column parity assignment gives:

### Repair through A1

Best assignment:

```text
A: odd
B: even
C: even
F: even
G: even
```

with:

```text
P1 singleton blockers in A = A1,A3,A5
```

Result:

```text
0 uncovered geometric lines
```

Hence this is a complete static parity repair.

### Repair through B1

The best parity assignment still leaves exactly two diagonal lines:

```text
B2-C3-D4-E5
B6-C5-D4-E3
```

### Repair through C1

The best parity assignment leaves six diagonal lines.

Therefore:

> **Within the entire outer-column odd/even parity-control family plus the fixed D/E pair blockers, odd-control of A is the unique complete static repair of the center defect.**

The uniqueness is geometric: the edge column has sufficiently few diagonal incidences that changing it from even to odd control does not expose an uncovered diagonal family. Interior repair columns do.

---

## 4. Turn-order denial

The complete repair above is only useful to P1 if P1 can obtain `A1`.

But after:

```text
D1 E1
```

it is P0's turn.

P0 may legally play:

```text
A1
```

before P1 can occupy it.

This has an exact certificate-level consequence:

```text
Odd(A)
```

is now impossible, because its required ownership predicate includes:

```text
Owner(A1)=P1
```

while the played event establishes:

```text
Owner(A1)=P0.
```

Thus P0 can deny the **only complete static repair available in the parity-control family** with one legal move.

This does not yet prove that `A1` is a complete winning witness. It proves that `A1` is a structurally distinguished `PreE` candidate because it destroys the defender's unique complete parity cover.

---

## 5. What P1 must do after A1

After:

```text
D1 E1 A1
```

the bottom requirement has residual cells:

```text
{B1,C1}
```

If P1 never occupies either cell, P0 can eventually occupy both and complete the bottom four.

Therefore any safety repair must eventually give P1 at least one of:

```text
B1
C1
```

within the bottom-race deadline.

If P1 occupies `B1`, then `B2` is immediately playable with P0 to move.

Therefore P1 cannot certify:

```text
Even(B)
```

against all P0 continuations: P0 may simply play `B2` next.

The same argument gives:

```text
P1 owns C1 -> Even(C) is not a valid universal safety certificate.
```

Hence within the column-parity family a base repair forces the repaired column to use odd control, not even control.

This is the first explicit temporal bridge:

```text
repair ownership
+ support accessibility
+ next-player identity
=> parity-certificate elimination
```

---

## 6. Defect amplification after A1

Now exhaust every temporally feasible outer-column parity assignment after P0 has seized `A1`.

### P1 repairs with B1

Constraints:

```text
A cannot be odd-controlled because A1 belongs to P0
B cannot be even-controlled because B2 is immediately available to P0
```

The best remaining assignment is:

```text
A even
B odd
C even
F even
G even
```

and it leaves exactly five uncovered P0 diagonals:

```text
A1-B2-C3-D4
B2-C3-D4-E5
A3-B4-C5-D6
A5-B4-C3-D2
B6-C5-D4-E3
```

### P1 repairs with C1

The best remaining assignment is:

```text
A even
B even
C odd
F even
G even
```

and it leaves exactly six uncovered P0 diagonals:

```text
B1-C2-D3-E4
C2-D3-E4-F5
B3-C4-D5-E6
C4-D3-E2-F1
B5-C4-D3-E2
C6-D5-E4-F3
```

Every survivor is diagonal.

Therefore the original one-line bottom defect does not disappear under any temporally feasible parity repair after `A1`.

Instead it **amplifies**:

```text
1 bottom horizontal defect
 -> 5 diagonal defects via B1 repair
 -> 6 diagonal defects via C1 repair
```

within this certificate family.

---

## 7. Interpretation: the missing calculus is compatibility, not coverage

This result corrects an overly strong earlier intuition.

Static coverage by itself is capable of repairing the center defect: the counterfactual `A1,A3,A5` odd-control certificate covers all 69 lines.

So the center win cannot be explained merely by saying:

```text
no blocker cover exists
```

at the set-theoretic level.

The real obstruction is temporal/strategic:

1. the unique complete cover requires an edge ownership fact;
2. P0 moves first and can deny that ownership fact;
3. P1 must move the repair inward;
4. support/turn order invalidates even control in that repaired interior column;
5. changing the column to odd control releases several diagonal requirements.

Thus the missing predecessor calculus must reason about **which blocker covers remain realizable under event order and adversarial ownership**, not merely whether a static set cover exists.

This is exactly the role assigned to the temporal response-capacity layer.

---

## 8. New candidate progress relation

The result suggests a more concrete repair-transition object:

```text
bottom defect
  -- P0 edge denial A1 -->
interior repair obligation
  -- P1 B1/C1 repair -->
diagonal defect family
```

The next question is no longer the original single-defect question.

It is:

> Can the released diagonal family be reduced back to zero by any compatible CPC/WSL/NDC response policy, or does every attempted diagonal repair create another response-capacity deficiency?

The five-line `B1` branch is the smaller and therefore preferred next target.

A particularly promising structural observation is that its five defects are generated by losing even control in column `B` and are anchored on:

```text
B2, B4, B6
```

with two defects using `B2`, two using `B4`, and one using `B6`.

This gives a finite, explicit obligation family for a Hall/deadline analysis rather than an abstract whole-board cover problem.

---

## 9. Relation to the winning-region fixed point

No new game semantics are introduced.

The desired root proof remains:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

The structural role of this result is to strengthen a candidate `PreE` derivation:

```text
center structural region
+ P0 action A1
=> unique complete parity safety repair eliminated
=> every parity-feasible P1 repair enters a nonempty diagonal-defect region
```

To promote `A1` to a proved `PreE(W)` witness, the diagonal-defect regions must themselves be proved members of `W` or be shown to descend through further symbolic predecessor rules to `I`.

---

## 10. Evidence and reproduction

Prototype:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/center_defect_repair_exposure.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-center-defect-repair-exposure.json
```

The prototype:

- mechanically generates all 69 lines;
- reproduces the center 66-static / 3-survivor field;
- exhausts every outer-column odd/even parity assignment;
- proves A-odd is the unique complete static repair;
- imposes the exact `A1` ownership and repaired-column accessibility constraints;
- derives the minimum 5- and 6-diagonal exposure sets.

---

## 11. Claim boundary

### Established

- the center parity safety family has exactly one complete static repair: odd control of A with P1 ownership of `A1,A3,A5`;
- P0 can legally occupy `A1` before P1 and thereby make that repair certificate impossible;
- after `A1`, any B1/C1 base repair makes an even-control certificate in the repaired column invalid because row 2 is immediately playable by P0;
- exhaustive parity-family closure then leaves at least five diagonal defects after B1 repair and six after C1 repair;
- all these conclusions use only geometry, ownership, support accessibility and the declared blocker semantics.

### Not established

- that no more general non-parity P1 safety certificate can repair the post-A1 position;
- that the five/six diagonal defect families themselves force P0 wins;
- a Hall/deadline overload certificate for those diagonal families;
- a full symbolic `PreE/PreA` proof of the standard center opening;
- any final perfect-play terminal-line membership or cardinality.

## Next seam

Analyze the five-defect `B1` branch first.

Construct the exact timely-response neighborhoods for the five diagonals and test whether:

```text
coverLB(defects) > compatibleResponseCapacity(defects)
```

under CPC/support/deadline closure.

If yes, this will be the first nontrivial response-capacity predecessor macro generated directly from the center boundary defect rather than imported from a named tactical rule.
