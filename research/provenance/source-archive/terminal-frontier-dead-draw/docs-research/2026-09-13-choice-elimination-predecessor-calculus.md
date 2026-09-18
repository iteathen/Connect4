# Choice-elimination predecessor calculus

**Date:** 2026-09-13  
**Status:** theoretical research / derived bridge calculus; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction and conceptual framing:** **Josh Oshiro**  
**Formalization and synthesis:** OpenAI ChatGPT

## Purpose

Extract a concrete piece of the missing strategic predecessor calculus by combining:

- the admitted standard-board root value `P0-Win`;
- independently established defender strategy certificates for non-center openings;
- horizontal reflection;
- ordinary W/D/L predecessor semantics.

The result derives the unique winning first move **without** admitting the full first-move value table and without importing any perfect-play terminal-line classification.

Mathematical columns are 1-based.

## 1. Minimal semantic predicates

Define:

```text
Win0(s)     := P0 can force a win from state s
NonWin0(s)  := P0 cannot force a win from state s
```

`NonWin0` includes both draw and P1-win states because either is sufficient to refute a value-preserving P0 move from a P0-winning parent.

For a P1 strategy/policy certificate `pi`, define:

```text
GuaranteesAtLeastDraw1(s, pi)
```

meaning P1 has a legal contingent policy from `s` such that every P0 continuation consistent with the rules yields either draw or P1 win.

Then the semantic bridge is immediate:

```text
GuaranteesAtLeastDraw1(s, pi)
=> NonWin0(s)
```

This is weaker than requiring the exact W/D/L value and is therefore useful as a low-leakage premise.

## 2. Independently established non-winning opening premises

Published manual strategy arguments establish sufficient P1 policies for the first three physical opening columns:

```text
opening 1: P1 has an explicit policy that eventually wins;
opening 2: P1 has an explicit policy guaranteeing at least draw;
opening 3: P1 has an explicit above-response policy guaranteeing at least draw.
```

For this research profile we admit only their weakest needed consequences:

```text
NonWin0(after opening 1)
NonWin0(after opening 2)
NonWin0(after opening 3)
```

The source is James D. Allen, *Expert Play in Connect-Four*, especially the manual analyses `Knott wins after 1 A1` and `Knott draws after 1 C1`, including the analogous B1 draw strategy, hosted at:

```text
https://tromp.github.io/c4.html
```

No terminal-line identity or count is imported.

## 3. Reflection closure

Horizontal reflection maps 1-based column `c` to:

```text
rho(c) = 8 - c
```

and preserves all Connect Four rules and W/D/L value.

Therefore:

```text
NonWin0(after 1) -> NonWin0(after 7)
NonWin0(after 2) -> NonWin0(after 6)
NonWin0(after 3) -> NonWin0(after 5)
```

After symmetry closure the six non-center first moves are certified non-winning for P0:

```text
{1,2,3,5,6,7}
```

## 4. Existential predecessor theorem

At a nonterminal P0-to-move state:

```text
Win0(s)
<=>
exists legal action a: Win0(T(s,a))
```

This is ordinary finite W/D/L semantics, not a Connect Four-specific heuristic.

The standard empty root is admitted to satisfy:

```text
Win0(root)
```

There are seven legal first moves. Six are now certified `NonWin0`. Therefore the existential witness cannot be any of those six.

Hence:

```text
Win0(after opening 4)
```

and moreover:

```text
WinningFirstMoves(root) = {4}
```

This derives the unique center opening from the root value plus six non-win certificates. It does not require the full first-move solved table.

## 5. Perfect-player consequence

For W/D/L-only perfection, a perfect P0 in a winning state selects only actions whose child remains P0-winning.

Therefore:

```text
Perfect(P0)
AND Win0(root)
=> FirstMove(P0) = 4
```

For the line-output algebra:

```text
G(root) = G(after opening 4)
```

All perfect-play P0 terminal winning lines must therefore occur inside the center-opening winning region.

This constrains the output subset but does not directly classify any geometric terminal line.

## 6. General choice-elimination rule

The opening proof is an instance of a reusable calculus.

For a P0-to-move state `s`, maintain:

```text
CandidateWinActions(s)
  = LegalActions(s) - RefutedWinActions(s)
```

where:

```text
RefutedWinAction(s,a)
:= NonWin0(T(s,a)) has been certified
```

Then:

```text
Win0(s)
=> CandidateWinActions(s) is nonempty
```

and, if closure leaves exactly one action:

```text
Win0(s)
AND CandidateWinActions(s) = {a}
=> Win0(T(s,a))
```

This is **existential choice elimination**.

No child search is implied by the rule. The difficult task is obtaining the `NonWin0` certificates structurally.

## 7. Universal opponent rule

At a P1-to-move state already certified `Win0`:

```text
Win0(s)
=>
for every legal action a: Win0(T(s,a))
```

Otherwise P1 would choose a draw/win child and `s` would not be a P0-winning state.

This is **universal predecessor discharge**.

The two rules form the minimal alternating predecessor calculus:

```text
P0 winning predecessor: exists winning child
P1 winning predecessor: all children winning
```

Choice elimination turns the existential rule into a deductive operation when non-winning alternatives have independent certificates.

## 8. Response-policy certificate as the structural source of `NonWin0`

The opening-3 proof also identifies the missing bridge from CPC/WSL/NDC into choice elimination.

Abstract a defender response policy `Pi` as a finite collection of guarded rules:

```text
trigger event -> response event / response fragment
```

with proof obligations:

```text
PolicyLegal(Pi)
PolicyTotalBeforeHorizon(Pi)
PolicyResourceCompatible(Pi)
PolicyTimingSafe(Pi)
PolicyCoversAttackerRequirements(Pi)
```

where coverage means every attacker residual winning requirement is hit by at least one certified blocker induced by the policy before the relevant completion deadline.

Then the desired generic theorem is:

```text
PolicyLegal(Pi)
AND PolicyTotalBeforeHorizon(Pi)
AND PolicyResourceCompatible(Pi)
AND PolicyTimingSafe(Pi)
AND PolicyCoversAttackerRequirements(Pi)
=> GuaranteesAtLeastDraw1(s, Pi)
=> NonWin0(s)
```

This theorem is exactly the universal strategic discharge that flat blocker coverage lacks.

CPC supplies ownership/parity facts for response events.
WSL supplies requirement/blocker subset coverage.
NDC supplies nested prerequisite/guard propagation.
The still-needed calculus must certify **total contingent policy validity across all opponent triggers without reconstructing the physical move tree**.

## 9. Why this exposes the missing calculus

The opening proof now has the shape:

```text
explicit response-policy certificates
    -> NonWin0(openings 1,2,3)
reflection
    -> NonWin0(openings 5,6,7)
root Win0
    + existential choice elimination
    -> Win0(opening 4)
perfect-player value preservation
    -> forced first move 4
```

Nothing in this chain knows the suspected perfect-play terminal-line count.

The only nontrivial missing generalization is the production of `NonWin0`/`Win0` child certificates directly from structural policy facts.

This narrows the missing strategic predecessor calculus to two interacting mechanisms:

1. **policy discharge** — prove a contingent response family universally prevents the opponent's win requirements before their deadlines;
2. **choice elimination** — use those child-value certificates to eliminate strategic alternatives and force existential witnesses.

## 10. Consequence for the 69-line problem

The exact perfect-play terminal-line subset remains:

```text
Lambda_PP = G(root)
```

The present derivation proves:

```text
G(root) = G(after first move 4)
```

but makes no claim about `|G(root)|`.

The next structural task is to apply policy-discharge and choice-elimination recursively inside the center-opening region, with CPC/WSL/NDC producing the policy premises instead of an external opening table.

If that closure classifies all 69 line labels, the output count is then read from the independently derived set.
