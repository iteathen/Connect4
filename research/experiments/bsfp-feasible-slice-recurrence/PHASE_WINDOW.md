# Exact rank-bounded ownership-antichain phase window

**Status:** deductive exact specialization derived from the qualified feasible-slice recurrence.

**Research direction:** Josh Oshiro.

## Result

At support rank `r`, every ownership mask stored by ownership-antichain BSFP is a subset of the current `r`-cell support universe.

P0 owns exactly

```text
k = ceil(r / 2)
```

cells on every legal state at that rank.

Therefore the exact cardinality phases relevant to the two P0-oriented antichain channels are:

```text
minimal Win generators:
    0 .. k

maximal Loss caps:
    r .. k      // descending
```

No other cardinality can change the represented predicate on the legal rank slice.

The number of required cardinality phases in either direction is exactly

```text
floor(r / 2) + 1.
```

The current packed normalizer scans all 43 cardinalities `0..42` regardless of rank. The exact specialization therefore reduces cardinality-phase scans before any further frontier shrinkage or candidate rejection is counted.

## Proof

Let `S` be a support with `|S|=r` and let legal P0 ownership assignments be

```text
L_r = { P subseteq S | |P| = k }.
```

### Minimal / upward Win frontier

A minimal Win generator `g` denotes

```text
g subseteq P.
```

for P0 ownership `P`.

Because every legal `P` has exactly `k` cells, any generator with

```text
|g| > k
```

has empty intersection with `L_r` and is semantically irrelevant on the legal slice.

Every generator is already a subset of `S`, so its cardinality lies in `0..r`. Hence the only potentially relevant cardinalities are

```text
0 .. k.
```

### Maximal / downward Loss frontier

A maximal Loss cap `c` denotes

```text
P subseteq c.
```

for P0 ownership `P`.

If

```text
|c| < k,
```

no legal P0 assignment can be a subset of `c`, so the cap is semantically irrelevant on `L_r`.

Every cap is also a subset of `S`, therefore

```text
|c| <= r.
```

The only potentially relevant cardinalities are consequently

```text
k .. r,
```

which the maximal normalizer should visit in descending order

```text
r, r-1, ..., k.
```

### Equal phase count

For minimal:

```text
k + 1 = ceil(r/2) + 1.
```

For maximal:

```text
r - k + 1 = floor(r/2) + 1.
```

When `r` is even these are equal. When `r` is odd, the minimal interval has one additional cardinality if written as `0..ceil(r/2)`. However, on an odd rank P0 owns the larger share, so the exact implementation should retain the stated channel-specific interval rather than assume identical phase counts.

More explicitly:

```text
minimal phase count = ceil(r/2) + 1
maximal phase count = floor(r/2) + 1
```

The common upper bound is

```text
ceil(r/2) + 1.
```

This correction matters for odd ranks: at rank 23, minimal uses `0..12` = 13 phases, while maximal uses `23..12` = 12 phases.

## Selected phase counts versus the current 43-phase scan

| Rank `r` | `k=ceil(r/2)` | Win phases | Loss phases | Current phases |
|---:|---:|---:|---:|---:|
| 0 | 0 | 1 | 1 | 43 |
| 1 | 1 | 2 | 1 | 43 |
| 10 | 5 | 6 | 6 | 43 |
| 17 | 9 | 10 | 9 | 43 |
| 23 | 12 | 13 | 12 | 43 |
| 30 | 15 | 16 | 16 | 43 |
| 42 | 21 | 22 | 22 | 43 |

This is phase-scan elimination only. It is **not** a whole-solver speedup prediction.

## Why this is stronger than candidate invalidation

A weaker implementation may mark impossible-cardinality candidates with an out-of-range popcount and still run all 43 normalization phases.

That preserves correctness but retains most repeated whole-interval scanning.

The rank-bounded form changes the normalization loop itself:

```text
if minimal:
    target = 0 .. k

if maximal:
    target = r .. k descending
```

Thus it eliminates impossible phases even when the candidate buffer layout is unchanged.

This is the preferred first CUDA specialization because it requires only information the compact rank kernel already owns:

```text
rank
channel direction
candidate popcount
```

No solved-game knowledge, runtime search premise, extra semantic state, or new generic pair-reducer API is required.

## Placement boundary

The specialization belongs naturally in the Connect4 compact ownership-BSFP layer, not in a universal CUDA primitive contract.

The generic segmented pair reducer does not intrinsically know:

```text
support rank
which player the set bits represent
what legal cardinality means for the consumer
```

The compact BSFP kernel already has these semantics locally.

A lower CUDA-Algorithms primitive may eventually expose bounded cardinality-range normalization as a generic parameterized mechanism, but Connect4 should not force its rank semantics into the lower API merely to share a kernel.

## Diagnostics requirement

Current compact diagnostics derive a synthetic metric equivalent to

```text
43 * normalizationInputRecords
```

for cardinality-phase candidate visits.

Once the phase window is integrated, that formula becomes false.

Any production candidate must therefore either:

1. count actual phase-candidate visits on device; or
2. derive the exact per-call phase count from rank/direction and the normalization input size.

Do not claim performance improvement while leaving the old 43-phase diagnostic formula unchanged.

## Relation to the completed feasible-slice qualification

The completed recurrence experiment already established that removing generators with `|g|>k` and caps with `|c|<k` preserves all 389,371 checked legal W/D/L classifications across complete controls.

This note adds the support-universe observation

```text
all stored masks subseteq S
```

to restrict the maximal channel's upper endpoint from the global packed limit `42` to the current support rank `r`.

No additional game assumption is introduced.

## Disposition

Use the rank-bounded phase window as the preferred compact CUDA qualification target.

Keep pre-materialization cardinality rejection as a later/orthogonal optimization: it can reduce candidate memory traffic and later frontier widths, while the phase window removes repeated normalization scans immediately without changing candidate layout.
