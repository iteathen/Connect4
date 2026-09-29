# 5x4 cocycle obstruction — transporter audit

**Research direction:** Joshua Oshiro  
**Status:** exact rule-only falsifier refinement  
**Workflow:** `36609651753` — SUCCESS  
**Job:** `109547499138` — SUCCESS  
**Tested head:** `754af94f8ca33d37451a3fca5be6534646b665f9`  
**Solved/outcome labels used:** no

## Question

Is the shortest 5x4 scalar-phase contradiction merely recursive action
relabeling one level deeper?

The audit replays actual concrete states through the contradictory routes and
retains **all** raw-child -> canonical-child column permutations at every step.
No arbitrary permutation sign or single transporter is imposed when a
stabilizer ambiguity exists.

## Shortest contradictory pair

```text
source 3260
target  574

route A:
3260 -> 1857 -> 574
class-level XOR 0

route B:
3260 -> 3255 -> 574
class-level XOR 1
```

The audit was run from both source sheets.

## Exact transporter result

For source sheet 0 / labelled class 92634:

### Route A — phase 0

```text
canonical action slots     1,0
source-frame actions       1,2

step 1 transporter         [1,3,0,2,4]   odd
step 2 transporter         [3,0,2,1,4]   even

total transporter          [0,1,3,2,4]   odd
final labelled class       7381
final sheet                0
```

Exact final state:

```text
Q:2,3,3,3,3|131072.263168|491520.753664
```

### Route B — phase 1

```text
canonical action slots     0,0
source-frame actions       0,2

step 1 transporter         [3,1,0,2,4]   even
step 2 transporter         [2,0,3,1,4]   odd

total transporter          [1,0,2,3,4]   odd
final labelled class       17251
final sheet                1
```

Exact final state:

```text
Q:2,3,3,3,3|131072.263168.884736|491520.884736
```

The same structure reverses consistently from source sheet 1.

## Stabilizer ambiguity

There is none on this witness.

Every audited transition has:

```text
canonicalizer count = 1
```

and each complete route has exactly one accumulated transporter.

Therefore the contradiction cannot be dismissed as an arbitrary choice among
multiple canonicalizing permutations.

## Ordinary permutation parity remains falsified

Both complete routes have an **odd** accumulated transporter:

```text
route A total sign = 1
route B total sign = 1
```

yet their class-level accumulated phase differs:

```text
route A phase = 0
route B phase = 1
```

So ordinary permutation sign cannot supply the missing scalar coordinate. This
is consistent with the earlier generic-permutation-parity falsifier.

## Full transporter/orientation observation

The full transporters differ:

```text
route A total transporter   [0,1,3,2,4]
route B total transporter   [1,0,2,3,4]
intersection                empty
```

and the source-frame action sequences differ:

```text
route A   1,2
route B   0,2
intersection empty
```

Thus the apparent phase reconvergence in the action-unlabelled carrier is not a
reconvergence of one identical oriented action history.

However, simply retaining the full accumulated transporter would be a
history-dependent lift. It does not yet provide the desired intrinsic
rule-derived state phase.

The exact final residual states are also different, not merely two arbitrary
names for the same exact canonical residual state.

## Disposition

The narrow hypothesis

```text
missing permutation sign explains the 5x4 obstruction
```

is **falsified**.

The broader hypothesis

```text
the action-unlabelled quotient discarded load-bearing transporter/orientation
structure
```

remains plausible, because the contradictory paths have different unique full
transporters and different oriented action histories.

The next preferred test should not carry arbitrary history merely to force
flatness. It should search for an **intrinsic residual/incidence coordinate**
that distinguishes the obstructed endpoint sheets and predicts the 25
syndromes directly from the current rule-derived state.

A promising immediate family is built from player residual incidence itself:
residual counts, shared P0/P1 residuals, and GF(2) incidence/XOR signatures.
These can be tested exhaustively on the existing carrier without solved
outcomes.
