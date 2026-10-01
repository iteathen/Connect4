# Oracle-informed repair v2 — deadline pressure profile

Date: 2026-09-30

## Fresh v1 falsifier consumed

v1 fresh-validation path:
- prefix before ply 8: `4444415`
- v1 selected: `{4}`
- Pons full vector: `[-16,-16,-3,-16,-16,-1,-16]`
- project-acceptable set: `{6}`
- all legal moves lose; only column 6 achieves maximal loss delay.

This position is now training evidence for v2 and is not an independent v2 qualification target.

## Structural diagnosis

v1 compressed each player's schedulable residual family to one scalar: earliest completion slot.

At `4444415`, all retained moves had:
- mover earliest completion: slot 4;
- opponent earliest completion: slot 3.

The scalar race was therefore tied and v1 fell through to local landing-cell Pareto impact, selecting column 4.

The uncompressed deadline families distinguish the moves:

- after 4, opponent has 3 residual requirements schedulable by slot 3;
- after 3, opponent has 1 by slot 3 but 9 by slot 5;
- after 6, opponent has 1 by slot 3 and only 5 by slot 5.

Thus the missing information is temporal pressure multiplicity: when the mover is behind the earliest deadline, survival depends on the opponent's whole early deadline profile, not just the first deadline or broad line incidence.

## v2 candidate

Runtime ordering:

1. immediate terminal win;
2. structural phase closure;
3. maximize earliest deadline margin `T_opp - T_self`;
4. minimize `T_self`;
5. if the best margin is negative, compare opponent cumulative deadline pressure lexicographically over increasing deadlines and prefer fewer due residual requirements;
6. apply local `(A,B)` Pareto impact only after the temporal profile is exhausted.

No oracle score is used at runtime.

Fresh v2 qualification begins only after the v2 path diverges from `4444415`.
