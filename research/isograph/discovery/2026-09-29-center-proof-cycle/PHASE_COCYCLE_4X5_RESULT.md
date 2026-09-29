# 4x5 Connect-4 binary phase cocycle result

**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Workflow:** `36606903079` — SUCCESS  
**Job:** `109538134321` — SUCCESS  
**Tested head:** `db39e9c75b3807bbe156bd4919d8642fb194b9f8`  
**Producer uses solved W/D/L labels:** no  
**Physical-board enumeration:** no  
**Authority effect:** none

## Purpose

The 4x4 Connect-4 binary deeper-continuation carrier had exactly one genuine
independent cycle with zero GF(2) syndrome. Small k=3 controls supplied binary
residue but no genuine cycles, so they could not strongly falsify the phase
potential.

This run applies the same outcome-blind construction to the already-feasible
4x5 Connect-4 structural carrier.

The run uses:

```text
width=4
height=5
k=4
nonterminalFrontierBlocker=true
moverFinalCapParity=true
measureLocalBranchClosure=false
```

No solved W/D/L labels, opening books, best-move tables, or solved databases are
inputs to the structural producer.

## Result

The 4x5 carrier contains a much larger recursive binary residue:

```text
residual-orbit states                 102,815
recursive action-unlabelled classes   86,791
recursive action-labelled classes     89,642
labelled class excess                  2,851

deeper groups                            768
binary deeper groups                     696
deeper labelled-class excess             894
maximum deeper group size                 13
```

Group-size distribution:

```text
size 2    696
size 3     48
size 4     13
size 5      3
size 6      5
size 8      2
size 13     1
```

Across the 696 binary groups:

```text
changed child pairs                    928

binary continuation                    469
nonbinary continuation                  92
action transporter                     260
branch/multiplicity erasure            107
terminal/unknown                         0
```

## GF(2) inheritance carrier

The 469 binary-continuation edges induce exact bijections of the two local
sheets.

Local sheet naming is gauge-only. Under the deterministic audit gauge:

```text
delta = 0    374 edges
delta = 1     95 edges
```

so the phase carrier is not an all-zero encoding.

There are 21 parallel directed edge pairs. Every one carries the same relative
map on both copies:

```text
parallel directed pairs              21
conflicting parallel pairs            0
duplicate same-map edges             21
```

Collapsing those semantic duplicates leaves:

```text
reduced inheritance edges           448
distinct directed pairs             448
```

## Non-vacuous path-independence

The reduced binary graph has:

```text
binary phase nodes                   696
active binary phase nodes            498
isolated binary phase nodes          198

active weak components                90
branching points                      75
joining points                        95
active source nodes                  217
active sink nodes                    130

shortest inherited chain               1 edge
longest inherited chain                5 edges
```

It contains many genuinely distinct reconvergent routes:

```text
reconvergent source/target pairs       42
topological reconvergences              42
path-independent reconvergences         42
contradictory reconvergences             0
maximum path multiplicity                5
```

This is no longer a one-diamond result.

## Cycle syndromes

The reduced inheritance graph has:

```text
cycle rank                              40
zero cycle syndromes                    40
nonzero cycle syndromes                  0
```

Therefore every independent GF(2) cycle constraint is consistent.

Equivalently, the relative edge equations

```text
F(u) xor F(v) = delta(u -> v)
```

admit a componentwise phase potential throughout the complete 4x5 binary
inheritance carrier.

The explicit nontrivial local gauge-flip audit also preserves the
path-consistency and syndrome verdict.

## Comparison with 4x4

The decisive increase in falsification power is:

```text
                         4x4 C4      4x5 C4

binary groups               61          696
binary edges                31          469
delta-1 edges                6           95
reconvergent pairs           1           42
cycle rank                   1           40
nonzero syndromes            0            0
longest chain                3            5
```

Thus the 4x4 zero syndrome was not merely a single small-control coincidence.
The same relative phase remains integrable under a substantially larger
same-rule carrier with forty independent cycle constraints.

## Performance / feasibility

GitHub-hosted Node 26:

```text
structural run elapsed      11.255 s
RSS                         358,023,168 bytes   (~341 MiB)
heap used                   215,189,896 bytes   (~205 MiB)
array buffers                   137,615 bytes
```

The experiment fits comfortably inside the unchanged 10-minute workflow bound.

## Strong bounded conclusion

The evidence now supports the following finite statement:

> On both the exact 4x4 and 4x5 outcome-blind Connect-4 recursive binary
> continuation carriers, the relative two-sheet edge maps are integrable over
> GF(2). On 4x5, all forty independent cycle syndromes vanish.

This is substantially stronger than the earlier one-cycle result.

It still does **not** establish:

- GF(2) phase = W/D/L;
- a scalar nimber for Connect Four;
- a generalized-board theorem;
- polynomial construction of the carrier;
- globally closed binary dynamics;
- strategic value of the phase.

## Remaining strongest falsifier

The major remaining explanation is now generic transition/cofactor confluence.

Many reconvergences may arise because different legal action orders reach the
same recursively reduced continuation object. A generic two-sheet lift of a
confluent transition system can be integrable without encoding Connect-Four
strategic value.

The next experiment should therefore classify the 40 independent cycles by
their underlying action/cofactor commutation structure.

The useful split is:

```text
generic commuting-action/cofactor diamonds
vs
reconvergences not reducible to local action-order commutation
```

If all zero-syndrome cycles are forced by generic commuting transition squares,
the present phase result should be narrowed accordingly.

If zero syndrome survives genuinely nonlocal/noncommuting reconvergences, the
case for an intrinsic Connect-Four continuation phase becomes much stronger.
