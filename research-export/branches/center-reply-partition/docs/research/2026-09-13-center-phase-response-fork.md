# Center phase-cover uniqueness and response fork

**Date:** 2026-09-13  
**Status:** structural theorem inside the phase/pairing safety family; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Continue the center-opening cover-boundary analysis by asking whether the bottom defect can be repaired by changing the odd/even control phase of one or more wing columns.

The result produces a small universal response-capacity fork and a concrete example of branch convergence without move-tree expansion.

The final perfect-play terminal-line subset remains an output and is not used here.

Rows and columns are 1-based.

## 1. Center safety topology

Fix the center opening:

```text
P0 owns D1.
```

Use the previously derived center pairing topology on columns D/E:

```text
odd-row cross-pair blockers:
{D1,E1}, {D3,E3}, {D5,E5}

central vertical pair blockers:
{D3,D4}, {E3,E4}.
```

The remaining wing columns are:

```text
A, B, C, F, G.
```

For this finite control, each wing is assigned one of two row-control phases:

```text
even phase -> singleton blockers on rows 2,4,6
odd phase  -> singleton blockers on rows 1,3,5.
```

This is a deliberately structured family, not a claim that every possible Connect Four defense has this form.

## 2. Exhaust all phase assignments

There are:

```text
2^5 = 32
```

wing phase assignments.

For each assignment, mechanically generate its singleton and D/E pair blockers and ask which of the 69 P0 geometric winning lines are not hit by any blocker.

Prototype:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/center_phase_cover_uniqueness.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-center-phase-cover-uniqueness.json
```

The uncovered-line count distribution over the 32 assignments is:

```text
uncovered  assignments
0          1
2          1
3          2
5          2
6          5
8          3
9         10
11         2
12         6
```

Exactly one assignment statically covers all 69 lines.

## 3. Unique complete phase cover

The unique complete assignment is:

```text
A : odd phase
B : even phase
C : even phase
F : even phase
G : even phase.
```

Thus its wing singleton facts include:

```text
P1 owns A1
```

as part of A's odd phase.

Meanwhile the D/E pair blocker on the bottom row says:

```text
P1 owns at least one of {D1,E1}.
```

But D1 is already occupied by P0 from the center opening.

Therefore this blocker reduces to the forced singleton consequence:

```text
P1 owns E1.
```

Hence the unique complete static phase cover requires both:

```text
P1 owns A1
P1 owns E1.
```

before P0 can claim either.

## 4. First-response capacity contradiction

After P0 plays D1, P1 has exactly one move before P0 moves again.

The two required bottom cells are distinct and initially playable:

```text
A1 != E1.
```

Therefore P1 can establish at most one of them before P0's second move.

This is a size-two response-capacity circuit:

```text
required obligations = {own A1, own E1}
response slots       = {P1's first turn}
load                 = 2
capacity             = 1
```

so:

```text
2 > 1
=> unique complete phase cover is temporally unrealizable.
```

## 5. Branch convergence

The defender has two relevant first-response alternatives inside this certificate family:

```text
P1 takes A1
or
P1 takes E1.
```

If P1 takes A1, P0 can take E1 on the next move.

If P1 takes E1, P0 can take A1 on the next move.

Thus the exact cell that becomes P0-owned depends on the defender branch, but the higher consequence does not:

```text
for every P1 first response satisfying one required bottom obligation,
P0 can falsify the other required bottom obligation immediately.
```

This is an instance of a generic **alternative-convergence rule**:

```text
A1 OR A2                         // exhaustive defender alternatives
A1 -> C
A2 -> C
--------------------------------
C
```

where here `C` is:

```text
NoCompletePhaseSafetyCertificate.
```

The logical rule is elementary; the research value is that the phase-cover enumeration generates a compact exhaustive alternative set to which it applies.

## 6. Independent shallow-value control

The already admitted third-ply W/D/L control contains exactly the corresponding positive edges:

```text
4,5,1 -> P0-Win
4,1,5 -> P0-Win.
```

The phase-cover theorem did not use those labels. They serve only as independent confirmation that the two capacity-fork responses land on known P0-winning prefixes.

This is useful evidence that the generated safety defect is aligned with actual game value rather than merely being an artifact of line counting.

## 7. Column-phase change is not free

Changing a wing from even to odd control is not simply a different static blocker mask.

It changes which future row-parity events must be obtained by P1. CPC even/odd release conditions, response obligations, and the frontier parity-balance invariant must all remain satisfied.

Therefore the unique static complete assignment has two independent qualification burdens:

1. its first-response A1/E1 capacity contradiction;
2. its higher-column parity/control obligations after the bottom phase is selected.

The first burden already falsifies this specific complete phase certificate before the latter become relevant.

## 8. What is established

Established inside this safety family:

- there are exactly 32 wing phase assignments;
- exactly one statically covers all 69 P0 geometric lines;
- that assignment requires both A1 and E1 as P1 bottom ownership facts;
- only one P1 move exists before P0's second move;
- the unique complete phase cover is therefore temporally unrealizable;
- the two defender alternatives converge to the same certificate failure without recursive branch analysis.

## 9. What is not established

Not established:

- that every possible P1 drawing policy is representable by this phase/pairing family;
- that failure of this family alone proves the center opening win independently of the admitted root-value premise;
- any membership/cardinality of the perfect-play terminal-line subset;
- a global alternative-convergence calculus for arbitrary NDC proof alternatives.

## 10. Next abstraction

The useful reusable pattern is:

```text
candidate safety policies
-> compress to structural equivalence/phase classes
-> prove only one class can cover all requirements
-> extract its mandatory response obligations
-> response-capacity circuit
-> defender alternatives
-> common consequence under every alternative
```

The next question is whether this compression can be generalized from column phases to arbitrary minimal CPC/WSL/NDC safety covers. If every complete safety cover has a small set of mandatory response facts whose matroid closure is deficient, then `NonWin0` can be refuted algebraically without enumerating policies.
