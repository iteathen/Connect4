# Compact structural certificate for the `1.C1 ...d1` draw policy

**Date:** 2026-09-13  
**Status:** theoretical derivation + exhaustive policy qualification; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Turn one independently proved non-center-opening value premise into a compact CPC/WSL/NDC-style certificate and use the result to expose exactly where static blocker calculus ends and temporal first-win calculus begins.

This note does **not** import any perfect-play terminal-line subset or witness classification. It studies the known at-least-draw response policy after the 1-based opening:

```text
1. C1  ... d1
```

and proves why that policy prevents P0 from completing any of the mechanically derived 69 geometric winning lines.

## 1. Deterministic response policy

After `1.C1 ...d1`, P1 uses the following contingent policy:

1. after a P0 move below the top row, play directly above that stone;
2. if P0 fills `C6`, play the lowest empty cell in column `D`;
3. if P0 fills `D6`, play the lowest empty cell in column `C`.

The policy is the compact response form of the independently known draw strategy for the third-column opening.

The attached Node control exhaustively follows **every** legal P0 choice while P1 follows this deterministic policy. It is qualification evidence only; the structural argument below is the intended proof object.

## 2. Policy qualification

The rule-only control generated:

```text
69 geometric winning lines
19,936 nonterminal P0-turn policy states
98,896 legal P0 move edges
0 P0 immediate terminal wins
2,304 P1 terminal wins
3 full-board draw terminal states
0 undefined policy responses
```

Therefore the contingent policy is total on every reached nonterminal policy state and never permits a P0 terminal win.

Reproduction:

```text
node reference/research-prototypes/2026-09-13-perfect-play-winline/c1_draw_policy_certificate.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-c1-draw-policy-certificate.json
```

## 3. Outer-column ownership invariant

Let the **outer columns** be:

```text
A, B, E, F, G
```

At every P0 turn reached by the policy, each outer column has even height.

Reason: an outer-column P0 move is always followed immediately by P1 in the cell above. Thus outer-column occupancy advances in two-event macro-steps.

Consequently, whenever such a column is filled to a row at all:

```text
P0 may own rows 1,3,5;
P1 owns rows 2,4,6.
```

This immediately gives 15 permanent P1 singleton blockers:

```text
A2 B2 E2 F2 G2
A4 B4 E4 F4 G4
A6 B6 E6 F6 G6
```

Together with the initial P1 stone at `D1`, the compact certificate has 16 singleton blocker cells.

These 16 singletons occur in and therefore permanently kill **56 of the 69** geometric P0 lines.

## 4. Four pair blockers discharge 11 more lines

After removing every line hit by a singleton blocker, only 13 line obligations remain.

Four response-pair invariants discharge 11 of them:

```text
{C3,C4}
{D3,D4}
{C3,D3}
{C5,D5}
```

### 4.1 Vertical pairs `{C3,C4}` and `{D3,D4}`

For either column, P0 cannot own both cells of the pair.

If P0 plays the lower member while the upper member is empty, the policy immediately gives the upper member to P1. Conversely, if P0 later owns the upper member, the lower member could not previously have been a P0 move whose immediate response was that upper member.

Thus each pair is a certified two-cell blocker.

### 4.2 Cross pair `{C3,D3}`

P0 cannot own both `C3` and `D3`.

For P0 to own `C3`, `C2` must already belong to P1; otherwise a P0 move at `C2` would have been answered immediately at `C3`. Under this policy the only way P1 acquires `C2` before P0 owns `C3` is the C/D top-row transfer caused by P0 filling `D6`. But normal filling of `D` to `D6` gives `D3` to P1. The argument is symmetric for P0 ownership of `D3`.

Therefore `{C3,D3}` is a certified blocker.

### 4.3 Cross pair `{C5,D5}`

P0 cannot own both `C5` and `D5`.

If P0 owns `C5`, its move at `C5` is answered at `C6`, so P0 can no longer create a later `C6` top-row transfer into `D`. A P0 `D5` would require `D4` already to belong to P1; normal P0 occupation of `D4` instead gives `D5` immediately to P1. The only alternative source of a P1 `D4` would be a C-to-D top transfer at the appropriate D height, which cannot occur after P0 has acquired `C5` because `C6` is then immediately occupied by P1. Symmetry handles the reverse order.

Therefore `{C5,D5}` is also a certified blocker.

The four pair blockers cover **11 additional** geometric lines.

At this point static singleton/pair blocker closure has discharged:

```text
56 + 11 = 67
```

of the 69 line obligations.

## 5. The exact two-line race gap

The only uncovered P0 candidate lines are:

```text
D3-E3-F3-G3
D5-E5-F5-G5
```

Neither has a proper static subset that the policy forbids P0 from owning across all policy histories. They therefore expose a genuine temporal/first-win obligation.

### 5.1 `D3-E3-F3-G3`

Assume P0 could complete `D3-E3-F3-G3`.

To own `E3,F3,G3` under the above-response policy, P0 must already have caused P1 to occupy:

```text
E2,F2,G2.
```

For P0 to own `D3`, `D2` must already be P1-owned. If P0 had played `D2`, the immediate response would have been `D3`, making `D3` P1-owned instead. The policy qualification and the C/D transfer invariant agree on the same implication:

```text
P0 owns D3 => P1 owns D2.
```

Therefore before P0 can complete `D3-E3-F3-G3`, P1 already owns:

```text
D2-E2-F2-G2.
```

That is a complete P1 winning line at the lower row, so the game has already terminated.

Hence:

```text
D2-E2-F2-G2  preempts  D3-E3-F3-G3.
```

### 5.2 `D5-E5-F5-G5`

The same argument one layer higher gives:

```text
P0 owns E5,F5,G5 => P1 already owns E4,F4,G4.
P0 owns D5       => P1 already owns D4.
```

Therefore a purported P0 `D5-E5-F5-G5` completion necessarily occurs only after P1 has already completed:

```text
D4-E4-F4-G4.
```

Thus:

```text
D4-E4-F4-G4  preempts  D5-E5-F5-G5.
```

These are exact **first-win preemption** certificates, not static blockers.

## 6. Complete compact certificate

The policy proof therefore factorizes the entire 69-line P0 universe as:

```text
56 lines: singleton blocker
11 lines: pair blocker
 2 lines: earlier P1 completion / race preemption
-----------------------------------------------
69 lines: no P0 terminal winning line survives
```

This is a much smaller proof object than either a move tree or 69 independent line arguments.

It uses only:

```text
response policy
+ support/accessibility
+ singleton blocker closure
+ pair blocker closure
+ first-win temporal precedence
```

## 7. New calculus consequence

This example establishes that **static WSL blocker coverage is almost, but not completely, sufficient** for a real early-game value proof:

```text
static blockers -> 67/69
race preemption -> remaining 2/69
```

The missing operation is therefore sharply characterized:

```text
Required own completion L
AND lower/support ownership forced to opponent
AND opponent lower line M completes first
=> L is impossible as a terminal line
```

or abstractly:

```text
ForcedCompletion(M) < RequiredCompletion(L)
=> RefuteTerminal(L).
```

This is the temporal dual of the generic successor-set blocker theorem in the compatible-cover/progress note.

## 8. Implication for the center-root winning calculus

The non-center draw certificate is fundamentally a **safety** proof: every P0 line is statically blocked or temporally preempted.

The standard center-root P0 win requires the dual construction:

1. prove safety against every P1 completion; and
2. prove a P0 requirement whose completion cannot be indefinitely postponed because a well-founded event/race rank decreases.

The present certificate therefore gives a concrete, fully discharged test case for the negative half of the desired predecessor calculus.

A correct universal calculus should derive this `56 + 11 + 2` proof from generic CPC/WSL/NDC relations without knowing the historical policy-rule names.

## 9. Claim boundary

Established:

- the selected response policy is total on every reached policy state in exhaustive qualification;
- no P0 terminal win occurs under that policy;
- 56 geometric lines are discharged by 16 singleton blockers;
- 11 more are discharged by four reusable pair blockers;
- exactly two remaining lines require temporal preemption;
- those two have short lower-row first-win proofs.

Not established:

- that this one policy is the unique drawing policy after `1.C1`;
- that generic compatible-cover propagation will synthesize the policy without guidance;
- that the positive center-opening win can yet be discharged by the same calculus;
- any membership or cardinality of the final perfect-play terminal-line output subset.