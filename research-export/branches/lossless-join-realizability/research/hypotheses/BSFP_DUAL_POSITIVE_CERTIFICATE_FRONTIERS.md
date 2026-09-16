# BSFP dual positive-certificate frontiers

**Status:** exact representation duality plus solver-integration hypothesis. No production solver change.

**Research direction:** Josh Oshiro.

## Purpose

The current C1/packed42 ownership-antichain BSFP is P0-oriented:

```text
P0 Win  -> upward family represented by minimal P0-ownership generators
P0 Loss -> downward family represented by maximal P0-ownership caps.
```

The interval extension additionally wants one-sided safety/no-win regions. Complementing the downward families inside their fixed support reveals a more symmetric representation:

> every exact Win/Safe fact can be represented as a **minimal positive ownership certificate for the player who benefits from the fact**.

This aligns the BSFP boundary with Isometric's player-relative positive proof vocabulary and may allow one generic GPU antichain kernel to serve both players and both claim kinds.

## 1. Exact complement duality

Fix occupied support universe `U` and let `P` be the P0-owned subset. P1 ownership is

```text
Q = U \ P.
```

A P0-oriented downward cap `c` represents

```text
Down(c) = { P | P subseteq c }.
```

Define

```text
b = U \ c.
```

Then

```text
P subseteq c
iff
U \ c subseteq U \ P
iff
b subseteq Q.
```

Therefore

```text
Down_P0(c)
```

is exactly

```text
Up_P1(b).
```

Maximal P0 caps correspond one-to-one with minimal P1-owned positive generators under support complement.

This is a representation isomorphism, not a heuristic.

## 2. Four interval facts in one orientation

Define for player `p`:

```text
Win_p  = exact p-win region
Safe_p = region where the opponent cannot force a win.
```

Both are upward-closed in **p's own ownership** under the existing P0/P1-favourable symbolic order.

Thus store four minimal positive antichains:

```text
W0 = minimal P0-owned certificates guaranteeing P0 win
S0 = minimal P0-owned certificates guaranteeing P1 cannot win
W1 = minimal P1-owned certificates guaranteeing P1 win
S1 = minimal P1-owned certificates guaranteeing P0 cannot win.
```

Their relationship to the six intervals is:

```text
W0 -> [+1,+1]
W1 -> [-1,-1]
S0 only -> [0,+1]
S1 only -> [-1,0]
S0 and S1 -> [0,0].
```

Semantically:

```text
W0 subseteq S0
W1 subseteq S1.
```

The implementation may avoid storing the implied duplicate membership explicitly.

## 3. Current C1 Loss frontier already has this dual form

For every current maximal P0-Loss cap `c`, define

```text
P1WinGenerator = U \ c.
```

The set of normalized complements is exactly the minimal P1-owned winning boundary `W1`.

Consequences:

- record count is unchanged;
- classification is unchanged;
- current AND/maximal operations can be re-expressed as OR/minimal operations after support complement;
- player complement becomes a literal swap of the two positive winner frontiers plus ownership orientation.

The first experiment should therefore be a pure representation rewrite of complete controls before adding `S0/S1`.

## 4. One generic positive cofactor

Let `A_p` be a minimal positive certificate antichain for beneficiary player `p` and let mover `m` claim landing cell `x`.

The exact cofactor is:

```text
if m == p:
    remove x from every certificate that contains it;
    certificates not containing x remain unchanged;
    minimal-normalize.

if m != p:
    delete every certificate containing x;
    certificates not containing x remain unchanged;
    minimal-normalize.
```

This is the same positive monotone cofactor for:

```text
W0, S0, W1, S1.
```

No maximal-antichain-specific cofactor is mathematically necessary in the dual form.

## 5. One generic alternating aggregation rule

Let current mover be `m` and opponent `o=1-m`.

For either claim kind

```text
K in {Win, Safe},
```

the beneficiary-relative predecessor is:

```text
K_m(parent) = union over legal actions of K_m(action)
K_o(parent) = intersection over legal actions of K_o(action).
```

Reason:

- the mover can choose one action establishing a beneficial fact for itself;
- a beneficial fact for the opponent must survive every action available to the mover.

For minimal upward antichains:

```text
union        -> concatenate + minimal normalization
intersection -> pairwise OR product + minimal normalization.
```

Thus all four proof frontiers can share one algebraic kernel parameterized only by beneficiary/mover relation.

This is the dual-positive form of the current P0 Win-union/Loss-intersection and P1 Win-intersection/Loss-union recurrence.

## 6. Terminal override in positive form

Suppose mover `p` has an immediate terminal requirement `q` in the parent ownership variables (the already-filled cells that must belong to `p` before the landing).

The terminal region is positive for `p`:

```text
Up_p(q).
```

It is injected into:

```text
W_p
S_p.
```

The opponent's positive `W_o/S_o` proof families must exclude that terminal region.

In opponent ownership coordinates, the complement of `Up_p(q)` is:

```text
"opponent owns at least one cell of q"
```

which is itself an upward family with singleton minima:

```text
{ {x} | x in q }.
```

Therefore first-win subtraction becomes ordinary positive-family intersection:

```text
A_o
intersection
Up_o(singletons(q)).
```

implemented by the same OR-product/minimal-normalization machinery.

This is exactly the complement transform of the existing downward terminal-subtraction algebra.

## 7. Full-board draw

A non-winning full-board terminal is a safety fact for both players:

```text
S0
S1
```

and no winner fact:

```text
not W0
not W1.
```

Hence draw arises from bilateral safety rather than a separate positive winner family.

## 8. Relation to Isometric blocker logic

The terminology must remain precise.

An Isometric primitive blocker clause

```text
OR_(v in B) x_v = 1
```

says that the blocked player cannot own every cell of `B`. It is a disjunction and is **not automatically a positive conjunction generator** for the other player.

Therefore primitive blocker clauses should remain in the affine/clause sidecar until guarded closure proves a complete one-sided no-win consequence.

What maps directly into `S_p` is a **completed sound no-loss/no-opponent-win certificate region** whose current-state prerequisites can themselves be represented by a positive p-ownership generator or another explicitly guarded region.

Examples may include, once qualified:

```text
complete compatible blocker cover
paired-response safety policy
response-resource cut plus deadline closure
bilateral/exhaustion consequence
runtime-earned exact no-win proof.
```

Do not collapse the internal OR-clause proof into an all-cells-owned conjunction.

## 9. Why the dual form matters for Isometric integration

The combined proof stack can separate:

```text
sidecar proof algebra:
  affine ownership relations
  blocker OR clauses
  resource/deadline automata
  NDC dependencies

boundary proof result:
  minimal positive certificate antichain for W_p or S_p.
```

Once the sidecar discharges a complete Win/Safe proposition, BSFP consumes the result using the same minimal-antichain/cofactor/intersection machinery regardless of which player or claim kind produced it.

This is a cleaner integration boundary than teaching the generic proof layer P0-oriented maximal Loss caps.

## 10. Potential CUDA simplification

If qualification succeeds, the hot symbolic primitives reduce toward:

```text
minimal antichain normalization
positive cofactor owner=beneficiary
positive cofactor owner=opponent
upward union
upward OR-product intersection
positive terminal injection/subtraction
exact equality/grouping.
```

The separate maximal-antichain/AND-oriented path becomes a representational implementation choice rather than semantic necessity.

Possible benefits:

- fewer kernel variants;
- one record orientation for both players;
- simpler player-complement symmetry;
- easier reflection/claim-relative canonicalization;
- direct compatibility with support-local positive residual/proof IDs.

No speedup follows merely from reducing code-path variety; measure it.

## 11. Interaction with sparse interval frontiers

A practical candidate is:

```text
W0/W1 complete exact frontiers where ordinary BSFP requires them
+
S0/S1 sparse proof frontiers only where Isometric or runtime certificates exist.
```

If a sparse safety frontier plus predecessor propagation fixes the requested root interval, exact winner boundary construction can stop for that region.

Do not eagerly materialize complete `S0/S1 = complement(W1/W0)`; that would duplicate already-known exact information.

## 12. Qualification sequence

1. Convert existing complete small-control P0 Loss caps to support-complement P1 Win generators.
2. Reimplement the existing two-frontier recurrence using only minimal positive antichains `W0/W1` and require exact frontier/classification equality after round-trip conversion.
3. Verify player-complement/reflection equivariance.
4. Add exact `S0/S1` derived from complete W/L only as a correctness control.
5. Add sparse Isometric no-win seeds and verify every claim against exhaustive exact value.
6. Measure kernel count, pair candidates, normalization work, frontier width and wall time.
7. Only then consider a CUDA positive-frontier profile.

## 13. Falsifiers

- support complement of a maximal P0 Loss cap does not reproduce the exact P1 Win family;
- positive recurrence differs from current C1 classification on any complete control;
- terminal subtraction loses first-win semantics;
- a primitive Isometric OR blocker is mistaken for a positive conjunction generator;
- player complement/reflection changes the claimed boundary after proper relabeling;
- sparse safety frontiers claim a state whose exact value violates the one-sided bound;
- unifying kernels worsens target workload enough to outweigh integration benefits.

## Disposition

Promote the **dual positive-certificate representation** as a high-priority representation experiment adjacent to interval-antichain BSFP.

It is mathematically exact for the current Win/Loss frontier under support complement and gives the cleanest known semantic handoff from Isometric's completed proof consequences into BSFP. The integration hypothesis remains that sparse `Safe` certificates can reduce exact work; that must be measured separately.
