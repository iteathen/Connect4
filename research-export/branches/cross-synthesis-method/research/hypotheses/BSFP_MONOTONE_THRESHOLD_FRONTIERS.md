# BSFP monotone-threshold frontiers

**Status:** exact representation theorem / performance hypothesis. No production solver change.

**Research direction:** Josh Oshiro.

## Purpose

A three-valued monotone W/D/L function does not require one upward Win frontier plus one downward Loss frontier. It can be represented exactly by two nested **upward threshold families**.

For absolute P0-oriented value

```text
-1 < 0 < +1,
```

define

```text
T1(P) = [ value(P) >= +1 ] = [ value(P) = +1 ]
T0(P) = [ value(P) >=  0 ].
```

Then

```text
T1 subseteq T0
```

and both are monotone upward in P0 ownership under the same ownership order used by the current C1 Win frontier.

This gives an exact two-frontier encoding using only minimal positive antichains.

## 1. Exact value reconstruction

For any ownership assignment `P`:

```text
P in T1                -> +1
P in T0 but not T1     ->  0
P not in T0            -> -1.
```

Therefore `(T0,T1)` is information-equivalent to exact W/D/L.

The current P0 Loss family is simply

```text
L = complement(T0).
```

No approximation is introduced.

## 2. Exact predecessor law

For a legal action `a` with child value `v_a`, the parent value is:

```text
P0 turn: max_a v_a
P1 turn: min_a v_a.
```

For either threshold `t in {0,1}`:

### P0 turn

```text
max_a v_a >= t
iff
exists a: v_a >= t.
```

Hence

```text
Tt_parent = union_a Tt_a.
```

### P1 turn

```text
min_a v_a >= t
iff
for every a: v_a >= t.
```

Hence

```text
Tt_parent = intersection_a Tt_a.
```

Thus `T0` and `T1` obey **the same recurrence**.

For minimal upward antichains:

```text
P0 turn -> concatenate + minimal normalize
P1 turn -> OR-product + minimal normalize.
```

The only semantic difference between the two frontiers is their terminal seed.

## 3. Exact cofactor law

Both thresholds are positive P0-ownership families, so both use the existing P0-upward cofactor:

```text
P0 lands at x:
  remove x from required P0 ownership in each generator;

P1 lands at x:
  delete generators that require P0 ownership of x;

minimal-normalize.
```

No downward/maximal cofactor is required in this representation.

## 4. Terminal seeds

Terminal values determine threshold membership immediately.

### P0 terminal win `+1`

The terminal requirement belongs to both:

```text
T0
T1.
```

### P1 terminal win `-1`

The terminal region belongs to neither threshold and must be subtracted from both pulled-back child families under first-win semantics.

### Terminal draw `0`

The terminal region belongs to:

```text
T0
```

but not:

```text
T1.
```

So a terminal value is represented by its ordinary ordered threshold bits:

```text
-1 -> 00
 0 -> 10   // T0 true, T1 false
+1 -> 11.
```

## 5. Relation to current Win/Loss antichains

Current C1 stores:

```text
W = T1                 as minimal upward generators
L = complement(T0)     as maximal downward caps.
```

The threshold form stores:

```text
T1
T0
```

as two minimal upward boundaries.

This is an exact representation change, not a new game theorem.

Converting an arbitrary completed Loss-cap family to `T0` after the fact may require monotone dualization; the proposed qualification should instead **compute `T0` directly by the threshold recurrence**.

## 6. Product-work redistribution

This representation does not automatically reduce work.

Current two-frontier recurrence has one expensive intersection family at each nonterminal support:

```text
P0 turn:
  Win union cheap
  Loss intersection expensive

P1 turn:
  Win intersection expensive
  Loss union cheap.
```

Threshold recurrence has:

```text
P0 turn:
  T0 union cheap
  T1 union cheap

P1 turn:
  T0 intersection expensive
  T1 intersection expensive.
```

Thus the expensive products are concentrated on P1 ranks rather than split across both parities.

Over two adjacent ranks the number of frontier intersections is the same in the simplest count, but frontier widths and terminal/subtraction economics may differ substantially.

This makes parity-local measurement mandatory.

## 7. Why the threshold form may still matter

Potential advantages independent of raw pair count:

1. **one antichain orientation** — minimal/upward only;
2. **one cofactor implementation** for both exact thresholds;
3. **one intersection operator** — OR product only;
4. direct representation of Isometric lower-bound facts (`value >= 0`);
5. natural nesting invariant `T1 subseteq T0` for validation and compression;
6. simpler player/value threshold generalization if the score lattice is later refined;
7. easier theory-relative normalization under `BSFP_CONSTRAINT_RELATIVE_ANTICHAIN.md`.

Potential disadvantage:

- high-cost P1 ranks may now carry two expensive upward intersections instead of one.

## 8. Nested-frontier compression opportunity

Because

```text
T1 subseteq T0,
```

the two boundaries are not independent.

Candidate shared representation:

```text
T0 boundary
+ refinement marking the stricter T1 subregion.
```

Do not assume this is smaller. First measure overlap between minimal generators and implication relations on complete controls.

Constraint-relative normalization may strengthen the nesting further under exact feasible-state theory `C`.

## 9. Relation to interval BSFP

The two threshold families encode the **exact lower value** side:

```text
T0 = [value >= 0]
T1 = [value >= +1].
```

To represent incomplete upper bounds such as

```text
value <= 0
```

from an Isometric P0-no-win certificate, a dual threshold family is still required.

Therefore:

```text
exact W/D/L only:
  two upward thresholds are sufficient.

partial interval proof:
  lower-threshold frontiers + sparse upper-bound/no-win proof frontiers.
```

This is compatible with `BSFP_INTERVAL_ANTICHAIN_FRONTIERS.md`; it is a more economical exact-core representation, not a replacement for sparse upper-bound certificates.

## 10. General finite-value extension

For any finite totally ordered exact score set

```text
v0 < v1 < ... < vk,
```

a monotone value function can be represented by nested threshold families

```text
Ti = [value >= vi].
```

Max predecessor uses unions for every threshold; min predecessor uses intersections.

The W/D/L case is the smallest nontrivial instance.

This is potentially relevant if BSFP later carries exact distance/score strata, but no such extension is proposed here.

## 11. Qualification experiment

On complete small-game controls:

1. implement a reference two-threshold solver independent of the current Loss-cap path;
2. use the same terminal boundary and support schedule;
3. require exact classification equality for every symbolic assignment on every support;
4. verify `T1 subseteq T0` everywhere;
5. compare threshold frontiers against `W` and `complement(L)` semantically;
6. measure frontier widths and pair candidates by rank/parity;
7. test packed42/CUDA suitability only after CPU exactness.

Required performance breakdown:

```text
T0/T1 frontier widths
P0-rank union normalization cost
P1-rank OR-product candidates
terminal subtraction cost
normalization/dedup work
wall time
peak records.
```

The 6x5 high-rank wall should be analyzed by parity rather than by aggregate time.

## 12. Falsifiers

- threshold classification differs from exact W/D/L;
- `T1` is not contained in `T0` on any exact symbolic support;
- first-win subtraction is not preserved;
- threshold-frontier widths/products materially worsen the target workload without offsetting proof integration or kernel simplification;
- a sparse upper-bound Isometric certificate is silently treated as a lower threshold;
- direct post-hoc Loss-complement conversion is mistaken for a cheap operation without measurement.

## Disposition

Retain **two monotone threshold frontiers** as an exact representation candidate.

Its main value is conceptual and integration-oriented: it proves the exact W/D/L recurrence can be expressed entirely with one positive antichain orientation. Performance must be decided by parity-resolved measurements, especially around the 6x5 high-rank wall.
