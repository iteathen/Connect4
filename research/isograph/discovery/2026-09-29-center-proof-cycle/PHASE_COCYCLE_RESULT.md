# Binary continuation phase cocycle result

**Research direction:** Joshua Oshiro  
**Scope:** exact finite 4x4 Connect-4 direct residual carrier  
**Producer uses solved W/D/L labels:** no  
**Frozen structural evidence source:** workflow `36598111645`, job `109508173798`, commit `7b141dbe7fefb7fa602ad4a2d03756b068c9903d`  
**Cocycle audit implementation:** `5ce43a98105e9534dcd76e29caab394c6e57aeae`  
**Authority effect:** none; Connect4 logic authority 1.2 remains frozen

## Result

The bounded binary deeper-continuation inheritance graph is **non-vacuously integrable over GF(2)** under its present structural guards.

The graph is not a tree-only success. It contains one genuine topological reconvergence, hence one independent undirected cycle, and the accumulated relative phase agrees on both routes.

Exact census:

```text
binary phase nodes                         61
active binary phase nodes                  37
isolated binary phase nodes                24

binary inheritance edges                   31
reduced inheritance edges                  31
distinct directed pairs                    31
duplicate same-map edges                    0
parallel directed pairs                     0
conflicting parallel pairs                  0

weak components                            31
active weak components                      7
largest component sizes              17,8,3,3,2,2,2
branching points                            3
joining points                              5
active sources                             18
active sinks                                9
shortest inherited source-sink chain        1 edge
longest inherited source-sink chain         3 edges

reconvergent source/target pairs            1
topological reconvergences                  1
path-independent reconvergences             1
contradictory reconvergences                0
maximum path multiplicity                   2

cycle rank                                  1
zero cycle syndromes                        1
nonzero cycle syndromes                     0
```

Therefore the edge constraints

```text
F(u) xor F(v) = delta(u -> v)
```

admit a phase potential on every component of this bounded carrier. Component-wide additive constants remain gauge choices.

## The one nontrivial reconvergence

The unique reconvergent pair is:

```text
group 24 (rank 9) -> group 2 (rank 12)
```

with two distinct routes:

```text
A: 24 -> 25 -> 7  -> 2
   columns 3, 0, 1

B: 24 -> 13 -> 14 -> 2
   columns 0, 3, 1
```

Under the deterministic local sheet ordering used by the audit:

```text
xor(A) = 0
xor(B) = 0
```

so the cycle syndrome is zero.

This is a genuine vertex-route reconvergence, not two copies of one edge. There are no parallel inheritance edges anywhere in the carrier.

The source group has phase-free immediate profile

```text
C978,C991,C1009,C1010
```

with all four immediate tokens distinct. The reconvergence therefore is not explained by repeated current-node action tokens or inactive-slot multiplicity.

## Gauge check

Local sheet IDs `0/1` are not semantic names. The audit derives each edge delta from a deterministic local ordering only so that the relative maps can be represented.

It then applies an explicit nontrivial local gauge flip and rechecks:

- reconvergence count;
- path-consistency verdict;
- cycle rank;
- nonzero syndrome count;
- existence of a componentwise phase potential.

Those quantities are invariant.

The deterministic gauge is also not making every edge trivially zero. Across all 31 inheritance edges:

```text
delta = 0    25 edges
delta = 1     6 edges
```

The zero syndrome is therefore a relative-cycle result, not merely an all-zero encoding.

## Exit structure remains substantial

The binary carrier is not closed. The already-established changed-child census remains:

```text
binary continuation          31
nonbinary continuation        3
action transporter           23
branch/multiplicity erasure  22
terminal/unknown              0
```

Thus:

```text
bounded integrable binary phase
!=
globally closed Z2 dynamics
```

## Strong-falsification interpretation

This result survives the two most immediate falsifiers requested for the next test:

1. **unique-path/tree vacuity:** falsified, because the graph has one genuine reconvergence and cycle rank one;
2. **parallel/multiplicity artifact:** falsified for the inheritance graph, because all 31 directed pairs are distinct and there are no parallel edges.

The result also occurs only after current-node action gauge was removed by the deeper-group construction.

However, stronger alternative explanations remain open.

The only independent cycle is an action-order diamond: columns 0 and 3 are traversed in opposite order before both routes take column 1. That makes generic transition/cofactor confluence a serious remaining explanation. A consistent two-sheet covering can also have zero holonomy without representing Connect-Four strategic value.

Therefore the strongest justified statement is:

> On the exact outcome-blind 4x4 binary deeper-continuation carrier, the relative GF(2) edge maps are integrable, and the single nontrivial reconvergence has zero syndrome.

This does **not** establish:

- GF(2) phase = W/D/L;
- a Connect Four nimber;
- a generalized Connect Four theorem;
- a polynomial construction;
- a globally closed binary phase;
- a Connect-Four-specific explanation of the integrability.

## Next discriminator

The most useful next test is dimension/control perturbation using the same outcome-blind construction, followed by an attempt to derive the phase directly from geometry/residual/cofactor data rather than from recursive class identities.

If zero-syndrome reconvergences persist under changed dimensions and guards, while nonzero deltas remain present, the generic-labeling explanation weakens.

If the phase disappears, becomes contradictory, or remains integrable only on commuting diamonds forced by generic transition structure, the larger XOR interpretation should be narrowed accordingly.
