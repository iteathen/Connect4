# Bounded BSFP RBA implementation qualification

Implementation owner: solver/cuda-bsfp. Ordinary-value candidate, not NDC or a
replacement for P2. Research authority remains research/semantic-quotient, pinned
at 104abfbe4444fcd315ac807b46ce2be8da13df39.

## Implemented contract

components/bsfp/rba-wdl-reference.mjs builds support-local residual-shape upset
lattices. Principal cofactor images, terminal WIN_NOW, exact right adjoints and
minimal covers pull child threshold boundaries back without a colored-board or
q-interior census. The four stored fronts are current-player V>=0, V>=1, V<=-1,
V<=0. Upper action union and Lower action intersection implement Bellman. Lower
intersection uses the qualified local-skyline law; factor orientation is fixed,
not guessed from a prefix sample. BigInt masks impose no 32/42/64-bit shape cap.

The future cone is enumerated by support only, children before parents. Complete
frontiers are published after every action. Explicit support/candidate/frontier
bounds throw incomplete errors; none yields a WDL result. Nonempty cone roots
have rootWdl=null because no root residual state has been specified.

Each invocation scopes geometry/profile. Each support scopes a fiber; thresholds
and polarity have separate fields. Cofactor caches are local to one exact
parent/child/action/owner edge and compare full BigInt coordinates. No cache or
certificate crosses a proof identity domain.

Default CPU reference bounds: 4096 supports, 2,000,000 generated candidates,
50,000 records per frontier. This is a bounded Node qualification profile, not
the CUDA execution profile; no GPU-promotion claim.

## Qualification

Command: node --test components/bsfp/test/rba-wdl-reference.test.mjs

- Complete reachable 4x3 c3: 4,659 nonterminal/exhausted states, 11,818 edges;
  all four threshold predicates agree with independent ray-scanning physical
  oracle and explicit reachable-q table. Root WDL=1.
- Complete abstract 2x2 c2 fibers: exact canonical Upper/Lower generator sets
  agree with an independent coordinate-enumerating recurrence.
- Every small-fiber cofactor adjunction and nonterminal minimal-cover predicate
  agrees on every coordinate.
- Local skylines agree with exhaustive pair products in both orientations;
  outer-restriction width monotonicity checked.
- Invalid support/closure and resource-bound failures cannot masquerade as draw.

Prior baseline: all 39 existing components/bsfp/test tests passed.

Initial diagnostic: 4x3 generates 1,230,737 candidates, 958,778 pair projections,
30,994 stored boundary records. This is not an economics win over P2.
The selected larger rank-33 cone [5,5,2,3,6,6,6] reaches the candidate bound;
the limit was not increased. Smaller rank-33 [5,5,1,4,6,6,6] completes with WDL
widths [146,145,114,250], matching the pinned strong-threshold width projection.
Width agreement alone is not complete generator equality.

## Next qualification seams

Exact persisted-stream reproduction, same-input P2/q/RBA economics and issue
61 identity audit/negative controls precede any shared-cache or GPU promotion.
Issue 63 NDC guarded obligations remain separate and require additional proof
premises; these ordinary-value results do not discharge them.

