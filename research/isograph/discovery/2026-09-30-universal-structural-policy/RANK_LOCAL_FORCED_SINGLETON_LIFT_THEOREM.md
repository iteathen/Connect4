# Rank-local forced-singleton lift theorem

**Date:** 2026-09-30  
**Status:** exact structural theorem / compositional strong-distance upper-bound primitive  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Extend the finite forced-completion upper bounds without introducing a heuristic score or an ordinary minimax tree.

The already-qualified upper-bound primitive proves:
- immediate completion: \(\overline T(P)\le 1\);
- one-setup Hall fork: \(\overline T(P)\le 3\).

This theorem adds a deterministic composition rule. A single legal attacker setup can create one currently playable terminal target which the defender is forced to occupy. If that forced successor already has a sound upper-bound certificate, the predecessor inherits that certificate two plies later.

The construction uses only states mechanically derived from the current position, gravity, legal frontier, ownership, generated winning lines, and an already-proved child certificate.

## 1. Forced singleton response

Fix a legal nonterminal position \(P\) with attacker \(A\) to move and defender \(D\).

Let \(a\) be a legal nonterminal attacker move and let

\[
Q=P+a.
\]

Require:

1. \(D\) has no immediate terminal move in \(Q\):
   \[
   F_D(Q)=\varnothing;
   \]
2. \(A\) has exactly one currently playable winning frontier cell in \(Q\):
   \[
   F_A(Q)=\{t\}.
   \]

Then every nonterminal defender reply must occupy \(t\).

### Proof

The target \(t\) is already legal in \(Q\). If the defender plays anywhere else and does not terminate, \(t\) remains available on \(A\)'s next turn and \(A\) wins immediately there.

By condition 1 the defender has no terminal reply that can supersede the threat.

Therefore any reply that avoids terminal loss on the next attacker turn must be the legal placement at \(t\).

QED.

## 2. Upper-bound lift

Let

\[
R=Q+t
\]

be the forced successor, with \(A\) again to move.

Suppose an independently sound rank-local certificate proves

\[
\overline T(R)\le U.
\]

Then

\[
\boxed{\overline T(P)\le U+2.}
\]

### Proof

Attacker plays \(a\) on attacker-relative ply 1.

The forced-singleton theorem requires the defender to occupy \(t\) on ply 2; otherwise attacker terminates on ply 3.

After that forced response the position is exactly \(R\), with attacker to move. The child certificate guarantees terminal completion within at most \(U\) further attacker-relative plies measured from \(R\).

Thus the original position terminates within at most \(U+2\) plies.

QED.

## 3. Finite chain corollary

Repeated forced-singleton lifts preserve soundness.

If a certificate contains \(k\) verified forced-singleton setup/block pairs followed by a base upper certificate \(U_0\), then

\[
\boxed{\overline T(P)\le U_0+2k.}
\]

This is a linear certificate chain, not an opponent-choice tree:
- every defender edge is forced by one already-playable terminal target;
- every setup and forced response is explicitly checked for legality;
- first-win precedence is checked at each forced-response state;
- the terminal base is an already-proved structural certificate.

The proof object may be verified without consulting solved values or an oracle.

## 4. Exact geometric control

Use prefix

\`32612636\`.

The side to move has a sound five-ply certificate:

1. attacker setup in column 4;
2. this creates exactly one currently playable attacker winning target, column 5;
3. defender has no immediate winning reply and therefore must occupy column 5;
4. in the forced successor, attacker setup in column 4 creates two distinct currently playable winning targets, columns 1 and 5;
5. the one-setup Hall-fork theorem therefore gives the child bound \(U=3\).

Applying one forced-singleton lift:

\[
\boxed{\overline T(32612636)\le 5.}
\]

No oracle outcome is used in this derivation or control.

## 5. v4 consumed falsifier boundary

The executable control also applies one forced-singleton lift above the currently qualified base certificates to the three consumed v4 children at prefix

\`444441566\`

for candidate moves 2, 3, and 6.

This extension still produces no finite upper bound for those three children.

Therefore the strongest currently certified intervals there remain

\[
P_2:[3,+\infty],\qquad
P_3:[3,+\infty],\qquad
P_6:[5,+\infty].
\]

There is still no strict interval separation and therefore still no sound basis for v5.

## 6. Why this is not the rejected scheduler

The rejected v4 scheduler treated a multi-cell residual as though the attacker could reserve its required cells across intervening defender turns.

This theorem does not.

At every lift:
- the attacker threat is already a legal one-move terminal target;
- the target is a single physical frontier cell;
- the defender response is forced immediately on the intervening turn;
- the exact successor is mechanically determined.

No future residual cell is reserved.

## 7. Scope boundary

The lift does not prove that an arbitrary singleton-like residual is forced. It applies only when the terminal target is already legal after the setup.

It does not cover:
- delayed targets requiring support release;
- two or more legal defensive alternatives;
- response obligations with shared multi-discharge actions;
- defender counter-wins;
- conditional future threats whose legality depends on unresolved choices.

Those require a richer guarded response-resource certificate.

## Next target

The next missing upper-bound primitive at the v4 falsifier is a **guarded support-release / multi-slot Hall certificate**.

The target object should retain, for each terminal obligation:
- exact release event;
- exact response-slot deadline;
- physical blocker identity;
- first-win precedence;
- multi-obligation discharge equivalence.

Only after those guards reduce the future interaction to unit-capacity response jobs may Hall deficiency be used to force completion.

## Claim discipline

This theorem:
- is rank-local and geometry-derived;
- composes already-sound upper certificates;
- consumes no solved W/D/L values;
- creates no v5 ordering rule;
- does not claim exact remoteness;
- does not solve the standard 7x6 game.
