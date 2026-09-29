# Recursive binary phase and cocycle synthesis

**Research direction:** Joshua Oshiro  
**Canonical research owner:** `research/semantic-quotient`  
**Source campaign:** `research/nim-control-parity-algebra-20260929`  
**Solved/outcome labels used by structural producer:** no  
**Logic-authority effect:** none; Connect4 logic authority 1.2 remains frozen

## Purpose

This document selectively integrates the late-phase findings from the experimental structural-control campaign without merging the experimental branch wholesale.

The central sequencing lesson is:

```text
geometry/support
-> residual/cofactor normalization
-> realizability / first-terminal consequences
-> continuation semantics
-> erase generic current-action gauge
-> inspect remaining recursive phase
-> only then test GF(2) composition
```

XOR/parity at the raw action-permutation layer was explicitly falsified as a Connect-Four-specific signal. The positive bounded result occurs deeper.

## 1. Generic action-permutation parity was rejected

The direct 4x4 Connect-4 carrier has:

```text
residual-orbit states                 10,507
recursive action-labelled classes      8,653
recursive action-unlabelled classes    8,242
```

Among 300 action-unlabelled classes that split into multiple labelled subclasses, ordinary transporter parity is well-defined exactly when all action-slot tokens are distinct.

Measured equality:

```text
pure transporter fibers with all slots distinct   38
parity-well-defined fibers                         38
```

This is generic symmetric-group bookkeeping: repeated tokens admit odd stabilizers and distinct tokens give a unique transporter. The 26 opposite-sign binary fibers at that layer are therefore retained as a falsified XOR placement, not positive evidence.

## 2. Deeper continuation residue

After additionally requiring:

```text
same recursive action-unlabelled class
+ same ordered immediate phase-free action profile
+ different recursive action-labelled class
```

the 4x4 carrier contains:

```text
deeper groups                    65
labelled-class excess            71
binary groups                    61
power-of-two groups              63

size 2                           61
size 3                            2
size 4                            2
```

These groups occur at ranks 9-12.

For the 61 binary groups, changed recursive child slots total 79 and classify exactly as:

```text
binary continuation              31
nonbinary continuation            3
child action transporter         23
branch/multiplicity erasure      22
terminal/unknown                  0
```

So part of the binary distinction recursively inherits itself after current-node action gauge has already been removed, but the binary region is not globally closed.

## 3. Relative GF(2) edge maps

Treat each binary group as a local two-sheet fiber. The absolute names `0/1` are gauge choices.

For each binary-continuation edge, the two parent sheets map bijectively to the two target sheets. Encode only the relative edge map:

```text
delta(e) in GF(2)
```

A componentwise scalar potential exists exactly when every reconvergent route has the same accumulated XOR, equivalently when every cycle syndrome is zero.

The 4x4 Connect-4 binary carrier has:

```text
binary phase nodes                         61
active binary phase nodes                  37
binary inheritance edges                   31
parallel directed pairs                     0

branching points                            3
joining points                              5
shortest inherited source-sink chain        1 edge
longest inherited source-sink chain         3 edges

reconvergent pairs                          1
topological reconvergences                  1
contradictory reconvergences                0

cycle rank                                  1
zero cycle syndromes                        1
nonzero cycle syndromes                     0
```

Thus the present bounded carrier is non-vacuously integrable.

The unique reconvergence is:

```text
24 -> 25 -> 7  -> 2    columns 3,0,1
24 -> 13 -> 14 -> 2    columns 0,3,1
```

Both routes have the same relative XOR.

Across all 31 edges the deterministic local gauge yields:

```text
delta=0   25
delta=1    6
```

so the result is not an all-zero encoding artifact. Explicit local gauge flips preserve the obstruction/path-consistency verdict.

## 4. Small-dimension perturbation

The same audit was applied to the already-emitted small rule-only controls.

| board | k | binary groups | binary edges | delta=1 | genuine reconvergence | cycle rank | nonzero syndrome |
|---|---:|---:|---:|---:|---:|---:|---:|
| 3x3 | 3 | 2 | 0 | 0 | 0 | 0 | 0 |
| 4x3 | 3 | 34 | 10 | 2 | 0 | 0 | 0 |
| 3x4 | 3 | 4 | 0 | 0 | 0 | 0 | 0 |
| 4x4 | 3 | 232 | 27 | 7 | 0 | 0 | 0 |
| 4x4 | 4 | 61 | 31 | 6 | 1 | 1 | 0 |

The 4x4 Connect-3 control is especially useful negative evidence: it has almost four times as many binary deeper groups and seven sheet-flipping edges, yet its inheritance carrier is a forest.

Therefore the Connect-4 reconvergence is not forced merely by constructing many binary recursive fibers.

The other controls are cycle-free after semantic duplicate-edge collapse, so they provide no corroborating syndrome constraints; their zero obstruction is vacuous.

## 5. Representation robustness

The one nontrivial 4x4 Connect-4 cycle survives the already-qualified residual closure stack.

| representation | states | binary groups | binary edges | cycle rank | nonzero syndrome |
|---|---:|---:|---:|---:|---:|
| raw direct carrier | 10,507 | 61 | 31 | 1 | 0 |
| universal blocker | 10,075 | 61 | 31 | 1 | 0 |
| nonterminal blocker | 9,951 | 56 | 28 | 1 | 0 |
| + final-cap parity | 9,441 | 56 | 28 | 1 | 0 |
| + remaining-move capacity | 9,321 | 56 | 28 | 1 | 0 |
| + support-release capacity | 9,319 | 56 | 28 | 1 | 0 |
| + open-cap dominance | 9,090 | 56 | 28 | 1 | 0 |

The result therefore is not tied to retention of all redundant residual syntax.

## 6. 4x5 same-rule falsifier

The next same-rule control was run on the already-feasible 4x5 Connect-4 direct
carrier, with the same outcome-blind structural producer and the established
nonterminal-blocker + final-cap-parity closures.

Workflow `36606903079`, job `109538134321`, succeeded at experimental head
`db39e9c75b3807bbe156bd4919d8642fb194b9f8`.

The larger carrier has:

```text
residual-orbit states                 102,815
recursive action-unlabelled classes   86,791
recursive action-labelled classes     89,642

deeper groups                            768
binary deeper groups                     696
binary continuation edges                469
delta-1 edges                             95
```

After collapsing 21 duplicate same-map parallel edges:

```text
reduced inheritance edges               448
active binary phase nodes               498
active weak components                   90
branching points                         75
joining points                           95

reconvergent source/target pairs          42
topological reconvergences                42
contradictory reconvergences               0
maximum path multiplicity                  5

cycle rank                                40
zero cycle syndromes                      40
nonzero cycle syndromes                    0
```

All forty independent cycle constraints therefore agree.

The carrier still exits the binary region substantially:

```text
nonbinary continuation                    92
action transporter                       260
branch/multiplicity erasure              107
terminal/unknown                           0
```

The 4x5 result is substantially stronger than the single-cycle 4x4 result:
the phase-potential hypothesis survived forty independent cycle constraints,
with 95 sheet-flipping edges present.

Measured GitHub-hosted Node 26 cost:

```text
elapsed        11.255 s
RSS            ~341 MiB
heap used      ~205 MiB
```

This remains a bounded structural result. Generic two-sheet transition-cover
integrability and generic transition/cofactor confluence remain active
alternative explanations.

## 7. 5x4 width-perturbation falsifier

The width-perturbed 5x4 Connect-4 carrier was tested with the same
outcome-blind structural rules and the same closure settings.

Workflow `36607300107`, job `109539467036`, succeeded.

The carrier contains:

```text
residual-orbit states                 289,852
recursive action-unlabelled classes   251,222
recursive action-labelled classes     262,713

binary deeper groups                    4,464
binary continuation edges               4,221
delta-1 edges                            1,117
```

After collapsing duplicate same-map parallel edges:

```text
reduced inheritance edges             4,026
active binary phase nodes             3,665
active weak components                  283
branching points                         932
joining points                           899

reconvergent source/target pairs         568
path-independent reconvergences          556
contradictory reconvergences              12

cycle rank                               644
zero cycle syndromes                     619
nonzero cycle syndromes                   25
```

Therefore the scalar GF(2) phase potential is **not globally integrable** on
the 5x4 carrier.

A direct contradictory witness is:

```text
3260 -> 1857 -> 574    delta 0 xor 0 = 0
3260 -> 3255 -> 574    delta 0 xor 1 = 1
```

Both paths begin and end at the same binary phase objects but demand opposite
relative phase. The obstruction is gauge-invariant.

This sharply narrows the positive result:

```text
4x4 Connect-4   cycle rank   1   nonzero syndromes  0
4x5 Connect-4   cycle rank  40   nonzero syndromes  0
5x4 Connect-4   cycle rank 644   nonzero syndromes 25
```

Thus width-4 integrability is an exact bounded phenomenon, but the current
scalar phase carrier is not a generalized Connect-4 law.

## 8. Exact bounded conclusion

The strongest justified statement is:

> Under the declared outcome-blind width-4 structural guards tested at 4x4 and 4x5, the recursively reduced binary continuation residue is integrable over GF(2). The same scalar carrier is obstructed on 5x4 by explicit nonzero cycle syndromes.

This is a finite structural theorem about the declared carrier.

It is **not**:

```text
GF(2) phase = W/D/L
Connect Four = Nim
a generalized Connect Four theorem
a polynomial construction
a globally closed binary dynamics theorem
```

## 9. Remaining falsifiers and next step

The 5x4 control supplies the decisive negative case: the present scalar
phase carrier is not globally flat.

The next question is what extra rule-derived structure, if any, resolves the
25 obstructions. Candidate explanations include:

- a missing realizability/support/deadline coordinate;
- lost orientation/transport information;
- a higher-dimensional GF(2) phase;
- a non-abelian continuation phase;
- or a genuinely width-4-specific law.

The immediate next step is to inspect the explicit contradictory 5x4
reconvergences and determine the smallest additional structural variable that
separates their opposite accumulated phases. No outcome labels may be used to
choose that variable.

## Provenance

Experimental evidence was frozen from successful workflow `36598111645`, job `109508173798`, with the recursive inheritance producer at `7b141dbe7fefb7fa602ad4a2d03756b068c9903d`.

The explicit cocycle audit implementation and invariant tests were developed on the experimental branch at:

- `8a2c9586f5c79957184982f6078cdfc2fb14b2cb` — audit implementation;
- `b71780352f02d4069455e1179e28f78909debce4` — expose audit;
- `5ce43a98105e9534dcd76e29caab394c6e57aeae` — invariant test.

Experimental reports:

- `PHASE_COCYCLE_RESULT.md` at `eaf7772966583ec1b4a4d9f0c132be30172446ba`;
- `PHASE_COCYCLE_DIMENSION_PERTURBATION.md` at `60f18194bc32516243694bd99a55469d46114776`;
- `PHASE_COCYCLE_REPRESENTATION_ROBUSTNESS.md` at `9ec1512f66a69b0ecb880031527bc4f0ffb6a063`.
