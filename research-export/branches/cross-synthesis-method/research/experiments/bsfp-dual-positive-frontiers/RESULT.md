# Dual-positive BSFP frontier qualification

**Status:** completed exact representation qualification on complete small controls. Performance not yet qualified.

**Research direction:** Josh Oshiro.

**Target:** `BSFP_DUAL_POSITIVE_CERTIFICATE_FRONTIERS.md`.

## Question

Can the P0-oriented BSFP boundary

```text
P0 Win  -> minimal P0-owned generators
P0 Loss -> maximal P0-owned caps
```

be represented exactly as two beneficiary-relative positive frontiers

```text
W0 -> minimal P0-owned winning certificates
W1 -> minimal P1-owned winning certificates
```

with one positive cofactor/union/intersection algebra?

For support universe `U`, the exact mapping is:

```text
W1 = normalize-min { U \ c | c in P0LossCaps }.
```

## Authority

A complete small-board ownership-antichain BSFP recurrence in the current P0 Win/minimal + P0 Loss/maximal form is compared support-by-support with an independently evaluated dual-positive recurrence.

No solved database, minimax/Negamax result, opening knowledge, or external game oracle is used.

## Controls

| Geometry | Supports compared | Frontier mismatches |
|---|---:|---:|
| 4x3 connect-3 | 256 | 0 |
| 4x4 connect-4 | 625 | 0 |
| 5x3 connect-4 | 1,024 | 0 |
| **Total** | **1,905** | **0** |

At every support:

```text
dual.W0 == baseline.P0Win

dual.W1 == support-complement(baseline.P0Loss)
```

after exact minimal normalization.

## Exact recurrence used by the dual form

For beneficiary player `p`, mover `m`, and landing cell `x`:

```text
if m == p:
    remove x from every positive certificate
else:
    delete every certificate containing x
```

For legal actions:

```text
beneficiary == mover:
    predecessor = union of action families

beneficiary != mover:
    predecessor = intersection of action families
```

Positive-family intersection is pairwise set union followed by minimal normalization.

If mover `p` has immediate terminal prerequisite `q`:

```text
W_p := W_p union Up_p(q)
```

and the opponent frontier is restricted by the exact complement of that terminal region:

```text
"opponent owns at least one cell of q"
```

whose minimal positive generators are the singleton cells of `q`.

Multiple simultaneously completing lines are handled by union on the mover side and intersection of each terminal complement on the opponent side.

## Variable-size status

The qualification controls use u32 masks only as a small exhaustive test representation.

The theorem itself depends only on:

```text
finite occupied support universe U
set complement inside U
positive ownership certificates
```

and therefore is independent of:

```text
42 cells
69 standard-board lines
packed42 storage
WSL-625
```

A variable-size implementation may use any exact bitset/ID representation appropriate to the selected `W x H, connect-K` geometry.

## What this establishes

The semantic BSFP boundary need not expose P0-oriented maximal Loss caps.

It may expose:

```text
beneficiary player
claim kind
minimal positive prerequisite family
```

This is a cleaner future integration surface with Isometric because completed Isometric proof consequences are also naturally claim/beneficiary relative.

The result does **not** imply that primitive blocker OR-clauses are themselves positive conjunction generators. Blocker/parity/resource/timing logic remains in a typed guard/proof sidecar until it proves a complete positive Win/Safe region.

## Performance status

No speedup is claimed.

The dual form changes the operational shape of terminal exclusion and moves maximal/AND operations into minimal/OR operations. The next performance question is whether this:

- reduces kernel diversity;
- composes better with rank-slice pruning;
- composes better with support-local residual IDs;
- improves or worsens pair-product/frontier widths;
- provides a cheaper path for sparse Isometric safety/winner certificates.

Those must be measured independently.

## Reproduction

Run:

```text
node research/experiments/bsfp-dual-positive-frontiers/dual-positive-equivalence.mjs
```

Any support-level frontier mismatch sets a failing exit code.

## Disposition

**Supports** the dual-positive representation as an exact, geometry-generic BSFP semantic boundary. Advance it as an integration representation candidate, not yet as a performance optimization.
