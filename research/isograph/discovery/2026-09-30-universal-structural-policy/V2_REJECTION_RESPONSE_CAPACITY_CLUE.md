# v2 disposition — rejected by regression

Date: 2026-09-30

v2 promoted opponent deadline multiplicity ahead of local structural impact whenever the mover's best scalar deadline margin was negative.

Fresh-run behavior showed this was too broad. It changed the already-established second move after prefix `4` from center `4` to `{3,5}`.

Pons full vector at prefix `4`:
`[-4,-2,-2,-1,-2,-2,-4]`

Under the project convention, only column 4 maximally delays the forced loss.

Therefore v2 is rejected as a universal ordering. Its fresh ply-9 result is not interpreted because the policy had already regressed at ply 2.

## Replacement clue

The move-2 and `4444415` cases are both temporally defensive (opponent residual deadline precedes mover residual deadline), but differ in response capacity.

For each opponent deadline t:
- collect opponent residual winning requirements schedulable by t;
- compute the minimum blocker/transversal size tau(t);
- available defender moves before opponent slot t are floor(t/2);
- overload exists when tau(t) > floor(t/2).

Observed structural distinction:
- prefix `4`, candidate 4: no overload at t=5 (tau=2, capacity=2);
  candidate 3: overload at t=5 (tau=3, capacity=2).
- prefix `4444415`, candidate 4: overload already at t=3 (tau=2, capacity=1);
  candidates 3 and 6 avoid t=3 overload, but at t=5:
  candidate 3 deficit=2, candidate 6 deficit=1.

This motivates v3: in temporally defensive ties, rank deadline-response overload before local Pareto impact.
