# CPC long-horizon renewal boundary

**Date:** 2026-09-30  
**Status:** qualified lower-bound spectrum / proof-class saturation checkpoint  
**Branch:** \`research/universal-structural-policy-20260930\`

## Result

The semantic CPC renewal grammar was evaluated through odd horizons

\[
D=3,5,7,9,11,13,15
\]

using exact RBA cofactors, typed CPC residual state, complete synchronized-response templates, and memoized proof classes.

No oracle value or solved outcome was used.

Durable evidence:

\`CPC_LONG_HORIZON_RENEWAL_LADDER_0_1.json\`

Workflow:

\`Research CPC long-horizon renewal ladder\`

Result: success.

## Consumed v4 children

For the three children of prefix \`444441566\`:

| child | S3 | S5 | S7 | S9 | S11 | S13 | S15 | maximum certified |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| candidate 2 | yes | yes | no | no | no | no | no | 5 |
| candidate 3 | yes | yes | no | no | no | no | no | 5 |
| candidate 6 | yes | yes | yes | yes | no | no | no | 9 |

Therefore the current sound lower envelope is

\[
\boxed{
\underline T(P_2)\ge5,\qquad
\underline T(P_3)\ge5,\qquad
\underline T(P_6)\ge9.
}
\]

This strengthens the earlier S7 result for candidate 6.

## Candidate-6 S9 witness

At S9 the root template is:

- columns 1/5, length 1;
- columns 4/6, length 1;
- columns 2/3, length 2.

Every legal attacker trigger is answered by the exact template mate and transports into S7.

The seven root response mappings are:

- 1 -> 5;
- 2 -> 3;
- 3 -> 2;
- 4 -> 6;
- 5 -> 1;
- 6 -> 4;
- 7 -> 7.

Every transported child is a renewal proof state.

Thus the S9 certificate is not the same fixed pairing used at S7; the proof class rematches structurally.

## Saturation under this grammar

Candidate 6 is not certified in S11.

Candidates 2 and 3 are not certified in S7.

Because the proof-class recurrence is horizon-monotone in its premises:

\[
S_D
=
B_D\cup \mathcal R(S_{D-2}),
\]

failure at the next required class identifies the first current grammar boundary.

It does **not** prove an attacker completion upper bound.

In particular:

\[
P\notin S_D
\not\Rightarrow
T(P)<D.
\]

## Work bound

The horizon-15 qualification completed without reaching its explicit resource guard:

- exact cofactors: 86,329;
- response branch tests: 47,639;
- template tests: 39,150;
- base tests: 3,305;
- semantic states: 2,064;
- budget exceeded: false.

These are theorem-qualification costs, not proposed runtime costs.

## Current strong-distance intervals

The newly qualified attacker completion proof classes still provide no finite upper certificate at any of the three consumed children.

Therefore the sound interval state is:

\[
\boxed{
P_2:[5,+\infty],\qquad
P_3:[5,+\infty],\qquad
P_6:[9,+\infty].
}
\]

No sibling elimination follows yet.

## Architectural consequence

The lower-side CPC automaton now has a concrete finite spectrum at the consumed boundary.

The next useful work is upper-side:

- qualify the frozen attacker completion proof-class automaton on fresh positions;
- search for a new polarity-preserving CPC hyperedge that crosses the \`CPC_NONE\` boundary;
- do not extend pair-star as a value rank;
- do not infer an upper bound from failure of S_D;
- do not create v5 until ordinary value class and loss-delay interval separation are both proved.

## Claim discipline

This checkpoint:

- is rank-local and oracle-free;
- proves survival lower bounds only;
- does not prove exact remoteness;
- does not assert candidate 6 is perfect;
- does not license v5.
