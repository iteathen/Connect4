# Checkpoint — residual-shape cofactor adjoints remove explicit antichain enumeration

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Base live head:** `11db1e6d0a2c976be006cdf9c7321afa0bb7ca05`
**Status:** deductive operator candidate independently validated against persisted rank-33/rank-32 boundary results; larger rank-32 pressure case still open
**Authority effect:** none
**Research direction:** Josh Oshiro
**Implementation / qualification:** OpenAI ChatGPT

## Recovery context

The persisted boundary recurrence had already closed:

- rank 35 pathological proof-product cases;
- the full immediate rank-34 predecessor envelope;
- rank-33 support `[5,5,1,4,6,6,6]`;
- rank-33 support `[5,5,2,3,6,6,6]` with 49,682 antichains/player;
- rank-32 calibration support `[5,5,1,3,6,6,6]` with 99,364 antichains/player.

The next persisted target is the rank-32 maximum-coordinate predecessor:

```text
[4,5,2,3,6,6,6]
residual shapes        27
antichains/player 226,537
```

The explicit player-pair domain must not be built.

## New observation

The explicit single-player antichain census is not required for the coordinate-preimage operator.

For fixed support `S`, let `P(S)` be the support-local residual-shape poset ordered by cell-set inclusion.

A normalized residual antichain represents exactly one upset:

```text
U = Up(A) subseteq P(S)
```

and ordinary residual-formula implication is upset inclusion.

Therefore the single-player coordinate domain is the finite distributive lattice:

```text
L(S) = Upsets(P(S)).
```

The prior meet/join law is then literal set intersection/union on upset signatures.

## Cofactor as a join-homomorphism

Fix one legal support edge with landing cell `x`.

For one residual shape `r`, the principal formula `Up(r)` maps under owner-labelled cofactor to one child principal upset, false/empty, or terminal:

Owner-true:

```text
x notin r -> Up(r)
x in r and r != {x} -> Up(r \ {x})
r = {x} -> immediate terminal
```

Owner-false:

```text
x notin r -> Up(r)
x in r -> empty / killed
```

Because Boolean cofactor distributes over OR, the nonterminal coordinate map

```text
F : L(S) -> L(S')
```

preserves joins.

Every parent upset is a join of principal upsets, so the map is fully determined by the images of the residual shapes themselves.

## Exact greatest preimage for `F(U) <= V`

For any child upset `V`, the greatest parent upset satisfying

```text
F(U) subseteq V
```

is

```text
R(V)
  = union of Up(r)
    over parent residual shapes r
    whose principal cofactor image is a subset of V.
```

This is the finite right adjoint of the join-homomorphism.

Consequences:

- `max_own_le` has one exact greatest coordinate preimage;
- `max_opp_le` has one exact greatest coordinate preimage;
- no scan over every normalized parent antichain is required.

Owner-true terminal principals are excluded from the nonterminal right-adjoint calculation and handled by the existing terminal branch.

## Exact minimal frontier for `F(U) >= V`

The set

```text
{ U | F(U) superset_eq V }
```

is upward-closed in the parent upset lattice.

Since every parent upset is a join of principal upsets and `F` preserves join, its minimal generators are exactly the inclusion-minimal unions of parent principal upsets whose child principal images cover `V`.

Thus `min_own_ge` and `min_opp_ge` are finite minimal-cover problems over the residual-shape incidence table:

```text
child target upset V
    ->
choose principal parent cofactor images covering V
    ->
union their parent principal upsets
    ->
retain inclusion-minimal unions only.
```

Again, the full antichain lattice is not enumerated.

This is a coordinate-frontier construction, not arbitrary Boolean DNF set cover over board cells.

## Terminal coordinate

For owner-true cofactor, immediate terminal occurs exactly when the parent formula contains the singleton residual shape `{x}`.

The least terminal mover coordinate is therefore the single principal upset:

```text
Up({x}).
```

It remains a separate exact branch in the fixed-action predecessor.

## Independent reproduction

A separate prototype using only residual-shape upset signatures and the operators above reproduced the persisted boundary results exactly.

### Rank-33 validation

Support:

```text
[5,5,1,4,6,6,6]
residual shapes 21
persisted antichains/player 12,929
```

Exact reproduced root widths:

```text
Upper: 1,8,17,71,146,145,82,23,5,4
Lower: 8,13,36,114,250,101,39,6,1,1
```

Envelope reproduced:

```text
max fixed-action Upper candidates      536
max fixed-action Lower candidates      513
max Lower-intersection candidates   41,307
max stored Upper                       359
max stored Lower                       372
```

### Large rank-33 validation

Support:

```text
[5,5,2,3,6,6,6]
residual shapes 24
persisted antichains/player 49,682
explicit pair domain if built 2,468,301,124
```

No antichain census or pair domain was used by the shape-lattice construction.

Exact reproduced root widths:

```text
Upper: 1,8,35,226,1116,1251,447,69,9,4
Lower: 8,30,228,660,2534,714,119,15,1,1
```

Envelope reproduced:

```text
max fixed-action Upper candidates        1,600
max fixed-action Lower candidates          787
max Lower-intersection candidates       530,700
max stored Upper                         1,251
max stored Lower                         2,534
```

### Rank-32 calibration validation

Support:

```text
[5,5,1,3,6,6,6]
residual shapes 25
persisted antichains/player 99,364
```

Exact reproduced root widths:

```text
Upper: 1,8,35,109,373,1368,323,141,31,6,4
Lower: 8,21,74,297,663,508,165,61,18,1,1
```

Envelope reproduced exactly:

```text
max fixed-action Upper candidates       2,550
max fixed-action Lower candidates       1,746
max Lower-intersection candidates     587,492
max stored Upper                        1,368
max stored Lower                        2,534
```

## Lower-boundary normalization refinement

The first large rank-33 shape-lattice run still timed out when maximal-normalizing a 530,700-candidate Lower lattice product using a naive streaming partial-order pass.

That was an implementation wall, not a semantic one.

Exact grouped normalization:

1. deduplicate state pairs;
2. group by mover upset;
3. within each mover group retain only inclusion-minimal opponent upsets;
4. process mover groups from larger to smaller mover upsets;
5. retain a candidate only if no already-retained state has mover superset and opponent subset.

On the rank-33 draw-threshold intermediate:

```text
raw lattice meet candidates       530,700
distinct pairs                    306,665
after exact maximal normalization   1,992
normalization prototype             ~1.37 s
```

The full rank-33 cone then closed with the exact persisted boundaries.

## Current interpretation

The previous scaling suspicion:

```text
single-player antichain enumeration may become the next wall
```

is weakened substantially.

The coordinate predecessor can instead be expressed over:

```text
support-local residual-shape poset
+ principal cofactor images
+ finite right adjoint
+ minimal principal-cover frontier
+ two-sided value-boundary lattice recurrence.
```

This may remove the need to materialize the complete single-player antichain dictionary during construction.

It does **not** remove residual antichains as semantic objects, and it does not imply that arbitrary proof/certificate realizability can be discarded.

## Open pressure case

The persisted next target remains:

```text
[4,5,2,3,6,6,6]
rank 32
residual shapes 27
persisted antichains/player 226,537
```

Its complete future-cone children close.

A bounded root attempt remains unclosed. Do not yet classify the new wall: the implementation is being separated into:

- minimal-cover frontier growth;
- Upper normalization;
- Lower meet-product width;
- Lower maximal normalization.

## Next executable step

```text
rank32_shape_lattice_max_coordinate_probe
```

Use only the residual-shape lattice operator above.

Measure separately at the root:

1. minimal-cover frontier widths for every coordinate target;
2. fixed-action Upper/Lower raw and normalized widths;
3. global Upper normalization width/cost;
4. Lower meet-product raw/distinct/normalized widths;
5. time/memory per phase.

Do not enumerate 226,537 parent antichains merely to construct coordinate preimages.

Stop at the first exact structural/algorithmic wall and preserve it.

## Epistemic disposition

```text
residual formulas as support-local upset lattice      DEDUCTIVE
cofactor preserves join                              DEDUCTIVE
greatest <= preimage/right adjoint                    DEDUCTIVE CANDIDATE
minimal >= preimage as principal-cover frontier       DEDUCTIVE CANDIDATE
rank33 persisted-result reproduction                  PASS
large rank33 persisted-result reproduction            PASS
rank32 calibration reproduction                       PASS
explicit antichain enumeration required               NO on reproduced cases
rank32 max-coordinate root                            OPEN
empty root solved                                     NO
new IsoGraph relation promoted                        NO
authority 1.1 mutated                                 NO
```
