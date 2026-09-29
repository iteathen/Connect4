# Binary phase cocycle dimension perturbation

**Research direction:** Joshua Oshiro  
**Evidence source:** frozen successful rule-only workflow `36598111645`, job `109508173798`  
**Producer uses solved W/D/L labels:** no  
**Authority effect:** none

## Question

Is the non-vacuous zero-syndrome result on the 4x4 Connect-4 binary deeper-continuation carrier merely a generic consequence of constructing binary recursive fibers?

The existing workflow already emitted direct residual carriers for five small dimension/rule controls. Reusing those frozen records permits a zero-cost perturbation: build the same binary inheritance graph and relative GF(2) edge maps for each case, collapse duplicate same-map parallel edges, and inspect reconvergence/cycle syndrome.

## Exact control matrix

| board | k | residual states | recursive classes | deeper groups | binary groups | binary edges | delta=1 | reconvergences | cycle rank | nonzero syndrome | disposition |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 3x3 | 3 | 197 | 130 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | vacuous |
| 4x3 | 3 | 1,656 | 1,002 | 38 | 34 | 10 | 2 | 0 | 0 | 0 | vacuous after duplicate-edge collapse |
| 3x4 | 3 | 690 | 406 | 4 | 4 | 0 | 0 | 0 | 0 | 0 | vacuous |
| 4x4 | 3 | 8,898 | 4,384 | 284 | 232 | 27 | 7 | 0 | 0 | 0 | vacuous forest |
| 4x4 | 4 | 10,507 | 8,242 | 65 | 61 | 31 | 6 | 1 | 1 | 0 | non-vacuous integrable |

The 4x3 Connect-3 carrier has one parallel directed pair, but both edges induce the same relative sheet map. Collapsing duplicate same-map edges removes the apparent multiedge cycle; there is no topologically distinct reconvergent route.

## Strong negative control

The most useful control is 4x4 Connect-3:

```text
binary deeper groups       232
binary inheritance edges    27
delta-1 edges                7
reconvergent pairs           0
cycle rank                   0
```

This case has almost four times as many binary deeper groups as 4x4 Connect-4, and it contains nonzero relative edge deltas, yet its binary inheritance carrier is a forest.

Therefore the 4x4 Connect-4 reconvergence is **not** forced merely by:

- existence of binary recursive fibers;
- a large binary-fiber population;
- presence of sheet-flipping edges;
- the generic construction of the deeper continuation audit.

That is useful falsification pressure against a purely bookkeeping explanation.

## What the perturbation does not establish

The controls do not yet supply a second independent cycle on which the phase law could fail.

All four non-Connect-4 controls are cycle-free after semantic duplicate-edge collapse. Their zero obstruction is therefore vacuous, not corroborating evidence for integrability.

The present evidence is thus asymmetric:

```text
4x4 Connect-4:
  one genuine cycle, zero syndrome

small perturbation controls:
  no genuine cycles to test
```

This makes the 4x4 Connect-4 zero syndrome more structurally specific than a generic binary-fiber artifact, but still too thin for a generalized XOR claim.

## Exit behavior also changes materially

Changed-child exits by control:

```text
3x3 k3: binary 0, nonbinary 0, transporter 2,  erasure 0
4x3 k3: binary10, nonbinary 1, transporter19, erasure11
3x4 k3: binary 0, nonbinary 0, transporter 1,  erasure 3
4x4 k3: binary27, nonbinary34, transporter78, erasure57
4x4 k4: binary31, nonbinary 3, transporter23, erasure22
```

The binary/nonbinary/exit balance is therefore sensitive to board/rule geometry.

## Current interpretation

The strongest exact statement remains bounded:

> The 4x4 Connect-4 binary deeper-continuation carrier contains one genuine reconvergent cycle and its relative GF(2) syndrome is zero.

The perturbation adds:

> This non-vacuous cycle is not a generic consequence of the deeper binary-fiber construction, because a denser 4x4 Connect-3 binary carrier remains cycle-free.

No strategic-value meaning follows from this result.

## Next discriminator

A larger same-rule control is now more informative than more small k=3 controls.

A suitable next target is 4x5 Connect-4, whose direct structural carrier has already been shown feasible in earlier growth work. The objective should be narrowly limited to the deeper binary carrier and its cycle syndromes; do not repeat unrelated growth experiments.

A result with multiple independent reconvergences would sharply increase falsification power:

- any nonzero syndrome would reject the present global phase carrier or expose a missing variable;
- multiple zero syndromes would support a broader guarded integrability law;
- no cycles would show that the 4x4 diamond may be a small-control accident.
