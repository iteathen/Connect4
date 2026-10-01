# CPC same-player separated-column commutation theorem

**Date:** 2026-09-30  
**Status:** exact local transition-isomorph theorem  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Record an exact transition identity exposed at the consumed v4 boundary and state the general geometry law behind it.

The result is a local normalization rule for CPC/RBA temporal contracts:

> two placements by the same player in distinct columns commute around one intervening opponent placement in a third distinct column, provided the three-ply fragments are legal and first-win stopping does not terminate either ordering early.

This is a transition identity, not a W/D/L claim.

## 1. Setup

Let \(q\) be a legal nonterminal Connect Four state with player \(D\) to move.

Choose three pairwise distinct columns:

\[
u,\ a,\ v.
\]

Consider the two alternating fragments

\[
F_1=(D:u,\ A:a,\ D:v)
\]

and

\[
F_2=(D:v,\ A:a,\ D:u),
\]

where \(A\) is the other player.

Require:

1. every placement in both fragments is legal at the point it is made;
2. neither ordering terminates before all three placements have been transported.

Because \(u,a,v\) are distinct columns, each placement lands at the same cell in both orderings:

- the \(D:u\) landing height is unaffected by moves in \(a,v\);
- the \(A:a\) landing height is unaffected by moves in \(u,v\);
- the \(D:v\) landing height is unaffected by moves in \(u,a\).

Therefore the two fragments produce exactly the same final support vector and exactly the same owner on every occupied cell.

## 2. Exact semantic consequence

The CPC/RBA residual automaton is an exact projection of physical occupancy under the prepared geometry.

Hence identical final colored occupancy implies identical:

- support;
- side to move;
- induced residual basis;
- P0 residual coordinate;
- P1 residual coordinate;
- terminal metadata.

Therefore

\[
\boxed{
C_v^D C_a^A C_u^D(q)
=
C_u^D C_a^A C_v^D(q)
}
\]

for the qualified nonterminal fragments.

This is an exact commuting diamond in the CPC semantic automaton.

## 3. Consumed v4 witnesses

Let the consumed parent be:

\`444441566\`

with the tenth move belonging to the defender relative to the winning side of the three candidate children.

Two exact diamonds were found.

### Candidate 6 / candidate 3 diamond

\[
(6,2,3)\equiv(3,2,6).
\]

Durable exact identity:

\[
\boxed{
q(444441566623)
=
q(444441566326).
}
\]

The two states have:

- common support \([1,1,1,5,1,3,0]\);
- identical induced basis;
- zero P0 coordinate symmetric difference;
- zero P1 coordinate symmetric difference.

### Candidate 6 / candidate 2 diamond

\[
(6,3,2)\equiv(2,3,6).
\]

Durable exact identity:

\[
\boxed{
q(444441566632)
=
q(444441566236).
}
\]

Again support, basis, and both typed residual coordinates are bit-identical.

Evidence:

\`CPC_TWO_CELL_STUTTER_ISOMORPHISM_PROBE_0_1.json\`

No oracle result is used.

## 4. Temporal-contract interpretation

The identity permits a same-player response to be viewed in either of two equivalent temporal positions.

For example,

\[
6\;2\;3
\]

can be normalized as

\[
3\;2\;6.
\]

Thus a defender placement may be interpreted as:

- a response made after the attacker trigger; or
- a response resource that had already been spent before the trigger, with the other defender placement transported to the later turn.

The final CPC state is unchanged.

This is precisely the kind of **response-debt transport** needed by a finite temporal-contract automaton: the physical history ordering can change while the exact semantic endpoint remains fixed.

## 5. What this does not prove

The commuting diamond alone does not prove that:

- candidate 6 has larger exact loss remoteness than candidates 2/3;
- either ordering is forced in both roots;
- the intervening attacker move is optimal;
- every continuation admits the same commutation;
- a two-ply stutter can be inserted or deleted without checking first-win timing and the other active CPC observations.

In particular, the same semantic endpoint may be reached through a branch that is forced in one root and optional in another.

## 6. Next theorem target

Use the commuting law as a normalization primitive inside a **response-debt automaton**.

The desired state should retain only:

- exact CPC/RBA semantic state;
- which same-player placement obligations are prepaid versus pending;
- legality/support guards;
- first-win guards;
- the remaining response-resource relation.

Then test whether the c6 intact \(2\leftrightarrow3\) response channel is exactly one additional renewable debt/stutter resource relative to c2/c3.

Success would support a relative remoteness theorem without proving the full absolute 29/29/31 distances independently.

Stop if the construction degenerates into one state per physical continuation.

## Claim discipline

This theorem is:

- rank-local;
- geometry-derived;
- oracle-free;
- exact under its legality and first-win guards;
- a transition normalization rule only.

It does not license v5 by itself.
