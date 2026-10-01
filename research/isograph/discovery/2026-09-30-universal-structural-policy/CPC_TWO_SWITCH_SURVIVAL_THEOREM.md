# CPC two-switch synchronized-response survival theorem

**Date:** 2026-09-30  
**Status:** exact bounded constructive survival theorem / renewal clue  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Extend the accepted one-switch CPC survival theorem by one additional certified synchronized-response template switch, without changing the obligation carrier or using oracle values.

This is a bounded structural theorem. It is not proposed as the final runtime operator.

## Definition

Let \(L_0(P)\) be the accepted fixed-template CPC survival horizon.

For \(k\ge 0\), define \(L_{k+1}(P)\) as follows.

Choose one complete synchronized-response template \(\Pi\) valid at \(P\). For every legal attacker move \(a\):

1. \(a\) must be nonterminal;
2. \(\Pi\) supplies its exact legal paired response \(r_\Pi(a)\);
3. first-win stopping is checked before applying the response;
4. if the defender response terminates, the branch is permanently safe against a later attacker terminal;
5. otherwise let \(Q_a=P+a+r_\Pi(a)\), with the attacker to move again, and require the already-certified horizon \(L_k(Q_a)\).

The template certifies

\[
L_{k+1,\Pi}(P)=\min_a \left(2+L_k(Q_a)\right),
\]

with defender-terminal branches bounded by the remaining physical board horizon.

Then

\[
\boxed{L_{k+1}(P)=\max_\Pi L_{k+1,\Pi}(P).}
\]

## Soundness

Each branch follows one constructive defender response supplied by the current complete template. The exact successor is regenerated from the full CPC/RBA residual state before the next certificate is applied.

Therefore, by induction on \(k\), \(L_k(P)\) is a sound lower bound on attacker terminal time.

This theorem composes certified response policies; it does not infer attacker progress and does not supply a forced-completion upper bound.

## Consumed v4 boundary

At the children of consumed prefix \`444441566\`:

| child | \(L_0\) fixed | \(L_1\) one switch | \(L_2\) two switches |
|---|---:|---:|---:|
| candidate 2 | 3 | 5 | 5 |
| candidate 3 | 3 | 5 | 5 |
| candidate 6 | 5 | 5 | 7 |

Thus the second switch restores a strict constructive lower-bound separation:

\[
\boxed{L_2(P_6)=7>L_2(P_2)=L_2(P_3)=5.}
\]

This still does **not** license v5 because the forced-completion upper bounds of candidates 2 and 3 remain unknown.

## Renewal structure

The best candidate-6 initial template is the same structural template already identified:

- columns 1/4, length 1;
- columns 5/6, length 1;
- columns 2/3, length 2;
- remaining tail paired vertically.

For every legal attacker first move, its prescribed response reaches a successor with one-switch horizon at least 5.

Hence candidate 6 has a universal **response-template renewal** property at this boundary:

\[
\forall a,\quad L_1(P_6+a+r(a))\ge5.
\]

Candidate 2 does not: every branch of its best initial template reaches a successor with one-switch horizon 3.

Candidate 3 does not: six of seven branches of its best initial template reach horizon 3.

This universal renewal distinction is the important theorem-discovery clue.

## Compression boundary

The executable two-switch control inspected physical branches to qualify this bounded theorem. That enumeration is not the desired final move-finder mechanism.

The next target is to replace the bounded recurrence by a rank-local **renewal predicate** or quotient state that proves:

\[
\text{complete template}
+\text{exact transport}
\Longrightarrow
\text{every successor remains in certified survival class }S_D
\]

without replaying arbitrary future move trees.

If such a predicate is closed under its own response transport, it can become a CPC consequence rather than a search.

## Current proof boundary

Established:

- two-switch lower bounds \([5,5,7]\);
- universal renewal to the \(L_1\ge5\) class for candidate 6's best template;
- failure of that same renewal property for candidates 2 and 3.

Not established:

- exact strong distance;
- any finite upper bound for candidates 2 or 3 at the consumed boundary;
- indefinite renewal;
- a closed renewal quotient;
- v5.

No Pons value is used as a theorem premise.
