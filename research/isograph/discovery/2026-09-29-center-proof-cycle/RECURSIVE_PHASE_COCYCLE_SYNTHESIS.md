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

## 6. Exact bounded conclusion

The strongest justified statement is:

> Under the declared outcome-blind 4x4 structural guards, the recursively reduced binary continuation residue carries an exact integrable relative GF(2) phase on its inheritance graph; its single independent cycle has zero syndrome, and this cycle survives the current residual-closure representations.

This is a finite structural theorem about the declared carrier.

It is **not**:

```text
GF(2) phase = W/D/L
Connect Four = Nim
a generalized Connect Four theorem
a polynomial construction
a globally closed binary dynamics theorem
```

## 7. Remaining falsifiers and next step

Only one independent cycle exists, so falsification power is still thin.

The unique cycle is an action-order diamond, leaving generic transition/cofactor confluence and generic trivial two-sheet covering as serious alternative explanations.

The next useful experiment should increase independent cycle rank rather than merely state count. A larger same-rule carrier such as 4x5 Connect-4 is appropriate because prior rule-only growth work already showed that control is feasible.

For each larger carrier report:

```text
binary inheritance cycle rank
zero/nonzero cycle syndrome histogram
genuine reconvergent route count
parallel/multiplicity-edge census
exit types
shortest/longest inherited chains
```

Any nonzero syndrome is a direct falsifier of the present scalar phase carrier or evidence that another structural variable is missing.

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
