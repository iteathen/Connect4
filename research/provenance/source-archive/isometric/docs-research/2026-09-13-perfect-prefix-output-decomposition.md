# Perfect-prefix decomposition of the terminal-line output

**Date:** 2026-09-13  
**Status:** exact consequence of admitted early W/D/L premises + reflection; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / perfect-play line-subset program:** **Josh Oshiro**  
**Formalization and finite projection:** OpenAI ChatGPT

## Purpose

Use the independently admitted/qualified shallow W/D/L premises to decompose the desired perfect-play terminal-line output into a small number of exact prefix subproblems without importing any terminal-line classification.

Columns/rows are 1-based.

## 1. Forced first move

Previous choice-elimination work proves that P0's unique W/D/L-preserving first move is:

```text
D1  (column 4)
```

At the resulting P1-to-move winning state, every legal P1 reply remains P0-winning.

Therefore all seven P1 replies are compatible with perfect W/D/L play.

## 2. Exact value-preserving P0 third moves

For reply column `j`, the admitted/qualified third-ply values give the P0 winning-preserving moves:

```text
j=1 -> {3,4,5,6,7}
j=2 -> {2,6}
j=3 -> {6,7}
j=4 -> {4}
j=5 -> {1,2}
j=6 -> {2,6}
j=7 -> {1,2,3,4,5}
```

Thus there are exactly:

```text
19
```

perfect-play-compatible three-ply prefixes of the form:

```text
4, j, k.
```

This number is an early-prefix consequence only. It is unrelated to the suspected final terminal-line count unless a later theorem connects them.

## 3. Exact set-valued output decomposition

Let:

```text
G(s) subset_of Lambda_69
```

be the already-defined set of P0 terminal winning lines possible on at least one W/D/L-perfect trajectory from winning state `s`.

Then:

```text
Lambda_PP = G(root).
```

Because the root has only one value-preserving first move, all P1 replies remain winning, and P0's next move must be one of the 19 value-preserving edges:

```text
Lambda_PP
  = union_{(j,k) in W3} G(prefix(4,j,k)).
```

where `W3` is the 19-edge relation listed above.

No terminal-line membership is assumed by this equation.

## 4. Reflection quotient

Horizontal reflection acts by:

```text
j -> 8-j
k -> 8-k.
```

The 19 winning prefixes quotient to ten reflection orbits:

```text
{(1,3),(7,5)}
{(1,4),(7,4)}
{(1,5),(7,3)}
{(1,6),(7,2)}
{(1,7),(7,1)}
{(2,2),(6,6)}
{(2,6),(6,2)}
{(3,6),(5,2)}
{(3,7),(5,1)}
{(4,4)}
```

Therefore the perfect-play terminal-line output can be reconstructed from ten structural prefix classes plus reflection.

This is an exact quotient of the shallow perfect-play problem.

## 5. Exact residual-state check

Using:

```text
support heights
+ exact normalized P0 residual requirements
+ exact normalized P1 residual requirements
```

no two of the ten reflection classes above collapse further at ply 3.

Thus ordinary horizontal reflection accounts for all exact structural equivalence visible in this prefix cohort under the current residual/support identity.

This does not rule out a stronger future quotient based on proved strategic equivalence rather than state equality.

## 6. Geometric compatibility projection

For each of the 69 geometric P0 lines, count how many of the 19 perfect-compatible prefixes leave the line unblocked by the already played P1 stone.

Every line is compatible with at least one prefix; hence the shallow prefixes alone do not eliminate any terminal-line schema.

The compatibility-count distribution is already preserved in the opening-premise evidence. The minimum count is:

```text
10 of 19 prefixes.
```

Exactly two lines attain that minimum:

```text
A1-B1-C1-D1
D1-E1-F1-G1.
```

These are the two extreme bottom horizontals through the forced opening stone D1.

They form one reflection orbit.

## 7. Connection to the center cover boundary

The left member:

```text
A1-D1
```

is exactly the unpreempted bottom requirement exposed by the center K-shift safety-cover boundary theorem.

Its reflection:

```text
D1-G1
```

is the corresponding right-side defect.

Thus two independent projections identify the same geometric orbit as exceptional:

1. safety-cover boundary analysis — the bottom line has no lower support shadow;
2. perfect-prefix compatibility — the extreme bottom horizontals are compatible with fewer early perfect prefixes than any other geometric line.

The second fact does **not** establish strategic importance by itself, but the agreement is a useful structural lead.

## 8. Resulting research decomposition

The terminal-line problem can now be written:

```text
10 prefix orbit classes
-> derive structural predecessor / progress closure in each class
-> obtain G(prefix) for each
-> reflect where required
-> union
-> Lambda_PP
```

This is materially smaller than treating all perfect trajectories from the root independently.

## Claim boundary

Established:

- unique perfect first opening D1;
- 19 perfect-compatible third-ply prefixes from admitted exact value premises;
- ten reflection orbits among those prefixes;
- exact union decomposition of `Lambda_PP` through those prefix `G` sets;
- no geometric line is eliminated by direct shallow P1 occupancy alone;
- the two extreme bottom horizontals have the minimum early-prefix compatibility count of 10.

Not established:

- the `G` set of any of the ten prefix classes;
- that low prefix compatibility implies perfect-play impossibility or possibility;
- membership/cardinality of the final perfect-play terminal-line subset.
