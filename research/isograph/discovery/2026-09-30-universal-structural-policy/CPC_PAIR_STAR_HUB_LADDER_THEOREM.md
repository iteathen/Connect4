# CPC pair-star hub-ladder progress theorem

**Date:** 2026-09-30  
**Version:** 0.1  
**Status:** qualified exact local theorem / CPC progress primitive  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Derive a generic rank-local progress rule from the four-pair residual star discovered while analyzing the consumed v4 boundary.

The rule is not a move score and does not depend on the coordinates of the training example.

It consumes only:

- current support;
- mover-relative live residual requirements;
- gravity/legal frontier;
- alternating turns;
- immediate terminal precedence.

No oracle value, solved W/D/L label, minimax, negamax, or alpha-beta recursion is used.

## 1. Pair-star geometry

Fix an attacker-to-move legal nonterminal position \(P\).

Let \(h\) and \(h^+\) be vertically adjacent cells in the same column, with \(h^+\) immediately above \(h\).

Suppose the attacker has four live **minimal pair residuals**:

\[
\{x,h\},\qquad
\{h,y\},\qquad
\{u,h^+\},\qquad
\{h^+,v\},
\]

with

\[
x\ne y,\qquad u\ne v.
\]

Call \(h\) the lower hub and \(h^+\) the upper hub.

The pair residuals retain their ordinary winning-line provenance. “Live” means no defender stone already kills the originating line.

## 2. Direct-hub case

Suppose \(h\) is currently playable.

The attacker plays \(h\).

If that move is terminal, progress is complete.

Otherwise the two live lower pair residuals become:

\[
\{x\},\qquad\{y\}.
\]

Therefore:

\[
\boxed{
Playable(h)
\Longrightarrow
\text{attacker terminal now or creates two live singleton residuals in one ply}.
}
\]

No defender move intervenes.

## 3. One-support-away case

Suppose \(h\) is not playable, but its immediate support \(s\) is the current legal frontier cell in the same column:

\[
s<h<h^+.
\]

Require:

1. attacker can legally play \(s\);
2. the support move \(s\) is not already an illegal/prior-terminal continuation;
3. after attacker plays \(s\), the defender has **no immediate terminal counterwin**.

The third premise is the explicit first-win guard.

After \(A:s\), \(h\) is playable.

Consider every legal defender reply \(d\).

### Case A — defender occupies \(h\)

Then \(h^+\) becomes immediately playable to the attacker.

The lower pair residuals are killed by defender ownership of \(h\), but the upper pair residuals remain live because their hub is \(h^+\).

The attacker plays \(h^+\).

If terminal, progress is complete.

Otherwise the upper pair residuals become:

\[
\{u\},\qquad\{v\}.
\]

Hence the attacker creates two live singleton residuals.

### Case B — defender does not occupy \(h\)

Then \(h\) remains playable.

The defender's one placement can kill at most one of the two distinct lower pair residuals because their only residual cells outside the common hub are \(x\ne y\).

The attacker plays \(h\).

If terminal, progress is complete.

Otherwise at least one surviving lower pair residual becomes a live singleton:

\[
\{x\}\quad\text{or}\quad\{y\}.
\]

Therefore every nonterminal defender reply yields at least one live singleton residual.

## 4. Progress theorem

Under the stated premises:

\[
\boxed{
Depth(h)=1
\Longrightarrow
\text{attacker forces terminal or a live singleton residual within 3 plies}.
}
\]

More precisely:

- ply 1: attacker plays the support \(s\);
- ply 2: defender replies;
- ply 3: attacker takes \(h\) or \(h^+\);
- first-win precedence is protected by the no-immediate-defender-win guard after ply 1.

This is a **strict residual-cardinality progress theorem**:

\[
2\text{-cell star}
\longrightarrow
1\text{-cell residual or terminal}.
\]

It does not say the resulting singleton is immediately playable.

## 5. Why this belongs inside CPC

CPC already owns:

- the current minimal residual basis;
- current support;
- immediate terminal checks;
- singleton obligations;
- forced/preemption consequences.

The pair-star theorem should therefore compile as an internal CPC progress route:

\[
\text{four-pair star}
+\text{hub support guard}
+\text{first-win guard}
\to
\text{terminal or singleton progress}.
\]

It should not become a separate move-ranking operator.

## 6. Training-origin observation

The pattern was first isolated at descendants of the consumed v4 falsifier after marked attacker setup column 6.

The training coordinates were:

Lower star:
\[
\{C3,E3\},\{E3,G3\}.
\]

Upper star:
\[
\{G2,E4\},\{E4,C6\}.
\]

with vertically adjacent hubs \(E3,E4\).

Those coordinates are not premises of the theorem.

## 7. First-win falsifier retained

The initial control exposed an important guard failure:

\`candidate3_setup6_reply6\`

After the proposed support move toward \(E3\), the defender has an immediate terminal move in column 5.

Therefore the unguarded theorem is false.

This falsifier is retained permanently and the no-immediate-defender-win premise is load-bearing.

## 8. What the theorem does not prove

A live singleton residual may still be latent behind support.

Therefore this theorem alone does not provide:

- a finite forced-completion upper rank;
- a W/D/L result;
- a loss-delay ordering;
- v5.

The next CPC composition question is whether the produced singleton necessarily enters one of the already-qualified CPC routes:

- immediate terminal;
- forced singleton response;
- stacked singleton release;
- all-lift release;
- fork precursor;
- another well-founded pair-star progress step.

Only such a composition can turn residual progress into a finite upper bound.

## 9. Qualification discipline

Version 0.1 was frozen before fresh controls.

Fresh qualification then passed on 24 independently generated legal standard-7x6 controls outside the consumed training prefix. The corpus included both players and ranks 12–20. One additional fresh state violated the explicit first-win premise and was retained as a guard-failure control rather than counted as theorem evidence.

Durable evidence:

`CPC_PAIR_STAR_FRESH_QUALIFICATION_0_1.json`

Fresh qualification must:

1. use legal positions not descended from the consumed \`444441566\` training prefix;
2. discover qualifying pair stars mechanically from residual geometry;
3. check all theorem premises independently;
4. enumerate only the theorem's one defender-reply layer;
5. verify the terminal/singleton conclusion for every legal defender reply;
6. use no solved outcome or oracle label.

Failure produces a scope correction, not a fitted exception.

## Claim discipline

This is a qualified local structural theorem under the stated guards. It remains a CPC internal progress primitive, not a standalone move-selection rule.
