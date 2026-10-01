# Rank-local bounded synchronized-response horizon theorem

**Date:** 2026-09-30  
**Status:** exact structural theorem / candidate move-finder primitive  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Replace the unsound use of "earliest schedulable residual completion" as if the opponent were allowed to reserve cells across intervening defender turns.

The theorem below is derived only from:
- current rank-local occupancy and support heights;
- gravity;
- alternating turns;
- generated Connect-Four lines;
- the already-qualified synchronized column-channel response construction.

It consumes no solved W/D/L or strong-distance value.

## 1. Unopposed completion rank

Fix a nonterminal position \(P\), attacker \(A\) to move, and one live attacker residual requirement \(R\).

Define \(e_P(R)\) as the earliest attacker-relative ply at which \(A\) could occupy every cell of \(R\) **if the defender never occupied a cell of \(R\)**, respecting:
- gravity/support release;
- attacker turn parity;
- one attacker move per attacker turn.

This is a necessary lower bound for actual completion:

\[
A\text{ completes }R\text{ by }D
\Longrightarrow e_P(R)\le D.
\]

It is not a sufficient winning certificate.

## 2. Complete synchronized response template

Use the accepted synchronized-channel response theorem.

A complete response template partitions all future response resources into:
- vertical trigger/upper-response pairs; and
- synchronized cross-column pairs inside same-parity column channels.

The template is constructive. Whenever the attacker consumes a trigger/endpoint, the defender's paired response is immediately legal; disjoint templates preserve response-resource identity.

A residual \(R\) is **covered** when either:
- \(R\) contains a vertical upper-response cell; or
- \(R\) contains both endpoints of one synchronized cross pair.

Under the template, the attacker can never own all cells of a covered residual.

## 3. Bounded horizon theorem

For odd attacker-relative horizon \(D\), suppose every live residual \(R\) satisfying

\[
e_P(R)\le D
\]

is covered by one complete synchronized response template \(\Pi\).

Then

\[
\boxed{\Pi\text{ prevents an attacker terminal win through horizon }D.}
\]

### Proof

Assume an attacker terminal occurs by \(D\). It completes some geometric winning line whose current residual is \(R\).

Because the line completed by \(D\), necessarily \(e_P(R)\le D\).

By the hypothesis, \(R\) is covered by \(\Pi\). The synchronized-response theorem guarantees that the defender owns at least one required response cell/pair endpoint before the attacker can own the whole covered residual.

Therefore \(R\) cannot be completed by the attacker, contradiction.

QED.

## 4. Certified survival horizon

For one template define

\[
H_\Pi(P)=\max\{D:\forall R,\ e_P(R)\le D\Rightarrow Covered_\Pi(R)\}.
\]

Then define the rank-local geometric certificate

\[
\boxed{H(P)=\max_\Pi H_\Pi(P)}
\]

over complete synchronized response templates derivable from the current support vector.

\(H(P)\) is a sound **lower bound on survival against the attacker**.

It is not an exact remoteness value.

## 5. v4 falsifier structural control

At prefix

\`444441566\`

the side to move is P2. For the three candidate P2 moves relevant to the v4 comparison, the resulting state has P1 to move as attacker.

The bounded synchronized-response calculation gives:

- candidate 2: \(H=3\);
- candidate 3: \(H=3\);
- candidate 6: \(H=5\).

For candidate 6 one witnessing complete response template uses one-based column channels:

- columns 1 and 4, channel length 1;
- columns 5 and 6, channel length 1;
- columns 2 and 3, channel length 2;
- remaining tails paired vertically.

The previously reported "opponent deadline 3" after candidate 6 was the residual bottom pair \`{B1,C1}\`. The length-2 synchronized channel between columns 2 and 3 blocks that residual constructively: if the attacker takes either currently playable endpoint, the defender takes the other, and channel synchrony continues one more level.

Therefore the old scalar scheduler was unsound as a forced-deadline interpretation.

## 6. Critical proof boundary

The strict inequality

\[
H(P_6)>H(P_2),H(P_3)
\]

does **not** prove that candidate 6 has larger true loss remoteness.

A larger certified lower bound for one child does not upper-bound the others.

Therefore this theorem may:
- invalidate false early-deadline eliminations;
- prove survival-through-rank facts;
- contribute to a strong-distance interval proof.

It may **not**, by itself, be used as a move-ranking heuristic or as proof that move 6 is optimal.

To soundly eliminate another losing sibling requires a complementary upper-bound certificate showing that sibling must terminate before the surviving child's certified lower bound, or an exact rank-local value/remoteness decoder.

## 7. Consequence for v5

Do not create a v5 selector from the horizon numbers alone.

The next admissible target is a two-sided strong-distance interval:

\[
[\underline T(P),\overline T(P)]
\]

where:
- synchronized response policies provide sound lower bounds \(\underline T\);
- forced completion / Hall-deficiency certificates provide sound upper bounds \(\overline T\).

Only strict interval separation can soundly eliminate a sibling for loss-delay purposes.
