# Rank-local forced-completion upper-bound theorem: immediate and one-setup Hall fork

**Date:** 2026-09-30  
**Status:** exact structural theorem / narrow strong-distance upper-bound primitive  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Add a sound complementary upper-bound primitive to the existing constructive survival lower bound.

The prior bounded synchronized-response theorem gives a rank-local lower bound

\[
\underline T(P)
\]

on how long an attacker can be prevented from terminally completing.

This note defines a deliberately narrow rank-local forced-completion certificate giving a finite

\[
\overline T(P)
\]

without minimax, negamax, alpha-beta, solved W/D/L, oracle scores, or outcome-fitted constants.

The result is intentionally small. It is a first exact upper-bound building block, not a complete remoteness decoder.

## 1. Rank-local winning frontier

Fix a legal nonterminal position \(P\) with attacker \(A\) to move and defender \(D\).

Let

\[
F_A(P)
\]

be the set of currently legal frontier cells such that placing an \(A\) stone in that cell immediately completes a mechanically generated Connect-Four winning line.

This set is computed only from:
- current occupancy;
- current support heights;
- gravity/legal frontier;
- mover-relative ownership;
- generated winning lines.

Likewise define \(F_D(P)\) for the defender.

## 2. Immediate upper bound

If

\[
F_A(P)\neq\varnothing,
\]

then \(A\) has a legal terminal move now, so

\[
\boxed{\overline T(P)\le 1.}
\]

No response move exists because first-win stopping ends the game.

## 3. One-setup Hall-fork certificate

Suppose there exists a legal nonterminal attacker setup move \(a\) producing \(Q=P+a\) such that:

1. \(a\) itself is not already terminal;
2. the defender has no immediate terminal reply:
   \[
   F_D(Q)=\varnothing;
   \]
3. the attacker has at least two distinct currently playable winning frontier cells in \(Q\):
   \[
   |F_A(Q)|\ge 2.
   \]

Then

\[
\boxed{\overline T(P)\le 3.}
\]

### Proof

After \(A\) plays \(a\), the defender has exactly one intervening placement before \(A\)'s next turn.

Every cell in \(F_A(Q)\) is already on the legal frontier. Distinct legal frontier cells lie in distinct columns.

A single defender placement can occupy at most one such target cell.

- If the defender plays one target, every other target column is unchanged, so at least one other target remains legal.
- If the defender plays outside the target set, every target remains legal.
- By hypothesis \(F_D(Q)=\varnothing\), so the defender cannot terminate the game on that intervening move.

Therefore at least one attacker winning frontier cell remains legal on attacker-relative ply 3, and \(A\) takes it for a terminal win.

QED.

## 4. Hall interpretation

After the setup, choose any two distinct targets \(t_1,t_2\in F_A(Q)\).

Preventing the next-turn terminal requires the defender to discharge both blocker obligations:
- occupy \(t_1\);
- occupy \(t_2\).

Both compete for the defender's single unit-capacity response turn.

For the obligation subset \(X=\{t_1,t_2\}\),

\[
|X|=2,\qquad |N(X)|=1.
\]

This is the size-two Hall deficiency.

The reduction is exact here because:
- each obligation is one physical frontier cell;
- one placement can occupy only one distinct cell;
- both deadlines are the same next attacker turn;
- no hidden support release is needed;
- the defender-immediate-win guard handles first-win precedence.

This is not the unsound raw-transversal construction rejected in v4. No multi-cell attacker residual is treated as if its cells could be reserved across defender turns.

## 5. Strong-distance interval consequence

Let the synchronized-response theorem provide a lower bound \(\underline T(P)\).

When this upper-bound primitive certifies \(U(P)\in\{1,3\}\),

\[
\boxed{T(P)\in[\underline T(P),U(P)]}
\]

provided both bounds use the same attacker-relative terminal convention.

Sibling elimination for loss delay is licensed only by strict interval separation, for example

\[
\underline T(P_a)>\overline T(P_b).
\]

A missing upper certificate is represented as \(+\infty\), not as a guessed large value.

## 6. Exact controls

The executable control checks three classes.

### Immediate terminal control

Prefix:

\`112233\`

The side to move has the mechanically generated bottom-row winning frontier at column 4, so the primitive certifies \(\overline T\le1\).

### One-setup Hall-fork control

Prefix:

\`2232\`

The side to move can play setup column 4. The defender then has no immediate terminal reply, while the attacker has two distinct legal winning frontier cells at columns 1 and 5.

Therefore the primitive certifies

\[
\overline T\le3.
\]

This control is derived from board geometry only; no oracle value is used.

### v4 consumed falsifier boundary

At prefix

\`444441566\`

after candidate moves 2, 3, and 6, this narrow primitive produces no finite upper bound.

Therefore the current sound intervals remain, at best,

\[
P_2:[3,+\infty],\qquad
P_3:[3,+\infty],\qquad
P_6:[5,+\infty]
\]

using the already-proved bounded synchronized-response lower bounds.

There is still no interval separation, so this theorem does **not** license v5 and does **not** prove candidate 6 has greater true loss remoteness.

## 7. Scope boundary and next extension

The one-setup theorem does not cover:
- targets that are not already playable after the setup;
- support-release chains requiring later moves;
- multiple defender response slots;
- obligations whose discharge semantics overlap nontrivially;
- defender counter-wins that appear after more than one response;
- certificate switching or phase transfer.

The next admissible upper-bound extension is a guarded multi-slot response graph in which release, deadline, support, first-win precedence, and multi-discharge canonicalization are explicit before Hall deficiency is invoked.

In particular, the v4 falsifier now isolates the remaining need to certify forced support-release / response-resource exhaustion beyond the one-response Hall-fork case.

## Claim discipline

This theorem is an exact rank-local upper-bound primitive for the stated guards only.

It does not:
- solve the standard 7x6 game;
- make v4 universal;
- infer exact remoteness from a lower bound;
- use Pons as a proof premise;
- authorize any new move-ordering formula by itself.
