# Perfect-play win-line self-proving closure

**Date:** 2026-09-13  
**Status:** blind structural research / first saturation pass; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction, hypothesis, and conceptual framing:** **Josh Oshiro**  
**Formalization, finite checks, and synthesis:** OpenAI ChatGPT

## Purpose

Connect the previously formalized predicates tightly enough that the theory is a finite deductive machine rather than a collection of correct but isolated facts.

The desired perfect-play winning-line subset remains an output. Its suspected cardinality is not available to any premise or inference rule. External solved-game terminal-line classifications remain quarantined.

Mathematical discussion in this note uses **1-based columns `1..7`**. Repository code remains 0-based where applicable.

## 1. Admitted value premises

This profile currently admits only the explicitly selected perfect-play value facts:

```text
Perfect(P0)
Perfect(P1)
Value(root) = P0-Win
Value(after first move column 3) = Draw
```

Horizontal reflection derives, rather than separately assumes:

```text
Value(after first move column 5) = Draw
```

No other opening value and no perfect-play terminal-line classification is admitted.

`Perfect` means W/D/L optimality only. Equal-valued actions remain equally perfect.

## 2. Winning-region predicate

Use absolute P0 values and define:

```text
W(s) := Value(s) = P0-Win
```

For nonterminal positions the exact game semantics imply:

```text
P0 to move:
W(s) <=> exists legal successor s' with W(s')

P1 to move:
W(s) <=> for every legal successor s', W(s')
```

The second equivalence follows because a perfect P1 would choose any draw or P1-winning successor if one existed.

This is the semantic fixed-point boundary that CPC/WSL/NDC must reproduce structurally without importing a solved-state table.

## 3. Perfect-play line reachability inside W

For each geometric winning line `L`, define:

```text
R_L(s)
```

as:

> there exists a perfect W/D/L trajectory from state `s` whose terminal move completes line `L`.

On terminal states:

```text
R_L(s) = true  iff  s is a P0 terminal win containing L
```

For a nonterminal state already known to satisfy `W(s)`:

```text
P0 to move:
R_L(s)
  <=> exists legal successor s'
      with W(s') and R_L(s')

P1 to move:
R_L(s)
  <=> exists legal successor s'
      with R_L(s')
```

The P1 recurrence is existential for *possible* terminal-line identity because at a P1-turn state inside `W`, every legal successor is itself in `W`; all are equally losing under W/D/L-only perfection.

Therefore:

```text
PPWinLine(L) <=> R_L(root)
```

This separates two problems cleanly:

1. prove/characterize the winning region `W`;
2. project existential terminal-line reachability through that region.

The adversarial universal quantifier is needed to establish `W`, but once `W` is known, possible perfect-play terminal lines are ordinary reachability inside the W-preserving graph.

## 4. Opening decomposition

Let `s_c` be the position after P0's first move in 1-based column `c`.

Because the root is a P0-turn winning state:

```text
W(root)
=> W(s_1) OR W(s_2) OR W(s_3) OR W(s_4)
   OR W(s_5) OR W(s_6) OR W(s_7)
```

The admitted draw premise gives:

```text
not W(s_3)
not W(s_5)
```

Reflection gives:

```text
W(s_1) <=> W(s_7)
W(s_2) <=> W(s_6)
W(s_3) <=> W(s_5)
```

Hence the first saturation pass reduces the root opening obligation to only three symmetry orbits:

```text
W(s_1) OR W(s_2) OR W(s_4)
```

where `s_1` represents the `{1,7}` orbit and `s_2` the `{2,6}` orbit.

For each geometric line:

```text
PPWinLine(L)
<=> OR over c in {1,2,4,6,7}
    [ W(s_c) AND R_L(s_c) ]
```

Columns 3 and 5 disappear from perfect-root trajectories automatically; no line count is used.

## 5. Why the opening premise alone does not classify winning lines

A separate rule-only constructive control was run with no solved-state or perfect-play information. For every one of the mechanically generated 69 geometric lines, at least one legal P0-terminal witness was constructed whose first move was in the non-draw candidate set:

```text
{1,2,4,6,7}
```

All 69 witnesses were independently replayed against gravity, alternation, first-win termination, and target-line completion; all 69 passed.

This evidence proves an important negative result about the bridge system:

```text
forbidding perfect openings 3 and 5
```

is not, by itself, a geometric/reachability elimination rule for any one of the 69 lines.

Therefore line reduction must come from deeper value-preserving structure: CPC/control, responses, blockers, deadlines, first-win preemption, or an equivalent characterization of `W`.

The constructive control is qualification evidence only; it is not perfect-play authority and is not used to populate `PPWinLine`.

## 6. Self-driving bridge predicates

The closure requires predicates that connect line obligations to value facts.

### 6.1 Requires

```text
Requires(L, phi)
```

means every perfect-play realization terminating on `L` must satisfy proposition `phi`.

Examples may include:

```text
required event ownership
required parity relation
required response compatibility
required opening/value region
required absence of an earlier win
```

### 6.2 ForbiddenPP

```text
ForbiddenPP(phi)
```

means `phi` cannot hold on a perfect root trajectory.

Universal refutation rule:

```text
Requires(L, phi)
AND ForbiddenPP(phi)
=> PPRefuted(L)
```

The opening value premise already derives:

```text
ForbiddenPP(FirstMove=3)
ForbiddenPP(FirstMove=5)
```

but no line currently has a proved `Requires(L, FirstMove=3|5)` premise.

### 6.3 Implies and incompatibility

```text
Implies(phi, psi)
Incompatible(phi, psi)
```

support generic closure:

```text
Fact(phi) AND Implies(phi,psi) => Fact(psi)

Requires(L,phi) AND Requires(L,psi)
AND Incompatible(phi,psi)
=> PPRefuted(L)
```

Parity contradiction, impossible response-resource sharing, cyclic strict event order, and forced earlier terminal completion are all instances of this schema.

### 6.4 Positive sufficiency

Negative filtering is not enough. Define:

```text
Sufficient(Gamma, L)
```

for an exact set of premises `Gamma` whose simultaneous certification constructs a perfect W/D/L trajectory terminating on `L`.

Then:

```text
all facts in Gamma certified
AND Sufficient(Gamma,L)
=> PPWitness(L)
```

`not refuted` must never be promoted to `PPWitness`.

## 7. Three-valued output closure

Maintain:

```text
YES = { L | PPWitness(L) }
NO  = { L | PPRefuted(L) }
UNK = Lambda \ (YES union NO)
```

Rules only add facts:

```text
UNK -> YES
UNK -> NO
```

Closure is complete for the terminal-line question only when:

```text
UNK = empty
```

Only then is:

```text
Lambda_PP = YES
```

and only then may its cardinality be inspected.

## 8. Unresolved outputs must generate obligations

For every `L in UNK`, generate:

```text
NeedProof(L)
```

which decomposes into explicit unresolved premises such as:

```text
NeedSupportCompatibility(L)
NeedParityCompatibility(L)
NeedFirstWinCompatibility(L)
NeedValuePreservingRealization(L)
NeedBlockerSafety(L)
```

Each unresolved predicate recursively decomposes until it reaches:

- a foundational fact;
- an existing exact certificate;
- a contradiction;
- or a genuinely missing theorem schema.

The closure therefore does not merely stall. It identifies the precise missing mathematics.

## 9. First saturation result

With the current admitted value premises plus the already established geometry/support/parity facts, the top-level closure reaches:

```text
RootValue = P0-Win
Open3 = Draw
Open5 = Draw
WinningOpeningOrbit in { {1,7}, {2,6}, {4} }
with at least one of those three orbits P0-winning
```

but it does **not** yet decide which of those three opening orbits belong to `W`.

Consequently it does not yet classify any geometric line as a perfect-play output merely from opening filtering.

This is a useful honest stall: the next load-bearing bridge is not another line-count identity. It is a structural derivation of the winning-region boundary, beginning with the three unresolved opening-value orbits or with stronger local `W` certificates that imply them.

## 10. Decisive next theorem target

Before expecting the closure to derive the perfect-play line subset, require the structural calculus to solve this smaller bootstrap problem without importing the external opening table:

```text
classify W(s_1), W(s_2), W(s_4)
```

using only the allowed rule-derived CPC/WSL/NDC machinery plus the admitted root-win and column-3 draw premises.

If CPC/WSL/NDC cannot derive this first-ply winning-region boundary, it is not yet complete enough to derive the full terminal-line subset.

If it can, the resulting winning opening(s) become exact seed states for the 69 simultaneous `R_L` reachability obligations.

## 11. Static finite checks retained

The rule-derived finite universes were independently regenerated during this pass:

```text
69 geometric winning lines
625 unique nonempty winning-line fragments
```

For the 2,346 unordered pairs of geometric winning lines, target-target intersection sizes are:

```text
0 cells: 1,525 pairs
1 cell :   754 pairs
2 cells:    23 pairs
3 cells:    44 pairs
```

Including gravity support makes interactions substantially denser:

```text
1,725 line pairs have overlapping downward closures
1,559 have at least one target/support interaction
1,266 share at least one support cell
```

These counts are structural evidence only. They do not classify perfect-play outputs.

## Conclusion

The exact self-proving structure is now:

```text
primitive rules + admitted value boundary facts
    -> W fixed-point obligations
    -> CPC / support / response / blocker / deadline certificates
    -> winning-region facts
    -> R_L reachability inside W
    -> PPWitness / PPRefuted
    -> three-valued saturation over the 69 lines
```

The current closure does not derive the suspected output count and therefore has not accidentally used it. It has instead isolated the first missing proof boundary: a structural derivation of the unresolved winning-opening orbits, followed by line reachability inside the derived winning region.
