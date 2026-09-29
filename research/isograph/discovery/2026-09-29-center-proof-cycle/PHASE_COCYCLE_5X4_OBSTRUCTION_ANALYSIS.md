# 5x4 cocycle obstruction — structural witness analysis

**Research direction:** Joshua Oshiro  
**Status:** exact rule-only obstruction analysis; correction mechanism open  
**Source workflow:** `36608451573`, job `109543422143` — SUCCESS  
**Source head:** `81de7806e92dd3ed5fc415804fdda954e1122b9a`  
**Solved/outcome labels used:** no

## Minimal contradiction

The smallest emitted contradictory reconvergence is:

```text
source binary group: 3260
target binary group: 574

route A:
3260 --column 1, delta 0--> 1857
1857 --column 0, delta 0--> 574

accumulated XOR = 0

route B:
3260 --column 0, delta 0--> 3255
3255 --column 0, delta 1--> 574

accumulated XOR = 1
```

Both paths have length two. This is a direct obstruction to a scalar
componentwise GF(2) potential on the present quotient.

## Source group 3260

```text
rank                         12
action-unlabelled class      82902
phase-free profile           C39252,C27815,C39268,C39266,C39273
labelled sheets              92634, 92670
```

Both representative sheets have identical support:

```text
[2,2,2,3,3]
```

Sheet 92634:

```text
P0 residuals  132096,264192,491520,884736
P1 residuals    7168,491520,884736
```

Sheet 92670:

```text
P0 residuals  132096,264192,491520,753664
P1 residuals    7168,491520,753664
```

So the binary distinction here is not support height. It is carried by the
residual incidence structure.

In the canonical coordinate frame, the differing masks decode as:

```text
884736 -> top-row columns {0,1,3,4}
753664 -> top-row columns {0,1,2,4}
```

These displayed column sets must **not** be read as literal physical winning
windows. The direct carrier permits arbitrary column relabeling and transports
the residual masks with the relabeling; canonical slot numbers are names in the
chosen representative, not persistent physical coordinates.

That fact is precisely why transition transport is now load-bearing.

## Intermediate groups

Route A passes through group 1857:

```text
rank                 13
support              [2,2,3,3,3]
labelled sheets      33800,46247
phase-free profile   C5138,C5085,C7972,C5609,C5155
```

Route B passes through group 3255:

```text
rank                 13
support              [2,2,3,3,3]
labelled sheets      46160,46246
phase-free profile   C5138,C7967,C7971,C12037,C13598
```

Both then enter group 574:

```text
rank                 14
support              [2,3,3,3,3]
action-unlabelled     5138
phase-free profile    C622,C754,C397,C623,C754
labelled sheets       7381,17251
```

The two routes therefore agree at the declared binary phase object but arrive
on opposite recursive labelled sheets.

## Why transporter/orientation is the next falsifier

Each structural move is presently realized as:

```text
canonical parent
-> place in a canonical action slot
-> compute raw child residuals/support
-> canonicalize child under the full column permutation group
-> forget which parent-to-child column permutation performed that transport
```

The cocycle edge retains only the resulting binary sheet map.

On width four this forgotten transporter happened to admit a flat scalar phase
on the tested carriers. Width five introduces richer column-incidence structure
and exposes 25 nonzero cycle syndromes.

The immediate hypothesis to attack is therefore:

> The 5x4 obstruction is caused by quotienting away the exact
> parent-to-child column transporter; restoring that transition groupoid data
> may separate the apparently contradictory routes.

This is not yet a positive claim. It is a direct test of the previously listed
falsifier that the binary residue might be recursive action relabeling one level
deeper.

## Next exact test

For the two concrete paths above:

1. replay a representative state from source sheet 92634;
2. for every edge, retain the raw pre-canonical child;
3. enumerate **all** column permutations that realize the canonical child, not
   an arbitrary single choice;
4. compose the transporter sets along each path;
5. map each path's action slots back into the source frame;
6. compare the final exact canonical residual states and transporter cosets;
7. repeat from source sheet 92670.

Interpretation:

- if opposite cocycle phase is completely predicted by distinct transporter
  classes, the present binary carrier is missing transition-orientation data;
- if both routes remain equivalent after exact transporter accounting but still
  demand opposite phase, transporter loss is falsified and a larger phase
  algebra is required;
- if transporter sets are stabilizer-ambiguous, preserve the ambiguity as the
  mathematical object rather than forcing permutation parity.

No W/D/L labels are relevant to this test.
