# Oracle-informed repair after the first genuine mismatch

Date: 2026-09-30

## Training observation consumed

Frozen v0 structural policy:
- branch: research/universal-structural-policy-20260930
- file: universal-structural-policy-v0.mjs
- first genuine mismatch on its generated line:
  - prefix: `4444433333`
  - ply: 11
  - v0 selected: `{3}`
  - Pons full vector: `[1,0,0,0,0,1,0]`
  - project-acceptable set: `{1,6}`

This position is now training evidence and cannot be reused as an independent qualification target for v1.

## Diagnosis

v0 already computed support/turn-schedulable completion races, but consulted them only after local landing-cell Pareto impact.

At the mismatch:

- move 3 had stronger local `(A,B)` incidence;
- moves 1 and 6 had superior temporal race structure;
- v0 therefore eliminated the winning moves before consulting the timing information that distinguished them.

The missing rule was not a new coordinate. It was an ordering error.

## v1 repair

The candidate hierarchy is now:

1. immediate terminal win;
2. structural phase closure/admissibility;
3. maximize deadline margin
   [
   T_{opp}-T_{self};
   ]
4. minimize `T_self`;
5. only then apply Pareto comparison to local mover-progress/opponent-denial incidence `(A,B)`.

No oracle values are consumed at runtime.

## Validation discipline

Because the repair was derived after observing the ply-11 oracle vector, v1 must be evaluated on fresh positions not used in the repair.

The deterministic representative convention is numerical minimum among structurally certified moves. This tie-break is not part of the structural value claim.

The new path produced by v1 after the already-observed opening becomes the fresh validation carrier.
