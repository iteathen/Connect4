# Late action-parity audit — 4x4 Connect-4

**Status:** bounded exact structural evidence; XOR placement hypothesis remains open  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Tested head:** `9e5c73debd741b0aeee5ec24c3081e4410a6d92c`  
**Workflow:** `36596563362` — success  
**Scope:** direct residual-orbit 4x4 Connect-4 control only  
**Solved/outcome labels used by producer:** no

## Question

Earlier control-algebra work applied GF(2) to raw response-pair incidence.
Subsequent work derived a much later structural sequence:

```text
support
-> normalized residual/cofactor state
-> recursive continuation semantics
-> action-labelled continuation class
-> action-unlabelled continuation class
```

This audit tests the owner's proposed ordering question: whether XOR/parity becomes
simpler only **after** continuation semantics have already been derived.

No W/D/L label is used to form either quotient. Exact W/D/L remains validation
only.

## Construction

On the direct 4x4 residual-orbit graph, freeze the recursive action-unlabelled
child classes first.

For every action-labelled recursive class, record the ordered four-slot profile

```text
I | C<phase-free-child-class>
```

where `I` is an unavailable/full action slot.

Then group action-labelled classes by their action-unlabelled recursive class.
For every split fiber:

1. compare the multisets of phase-free child slots;
2. if equal, enumerate exact column permutations carrying each profile to a
   chosen base profile;
3. classify the parity of every such transporter;
4. call parity well-defined only when every transporter for one subclass has
   the same even/odd parity;
5. call a fiber exact-binary-parity only when it contains exactly two labelled
   subclasses and their well-defined transporter parity bits are opposite.

This tests only action-slot phase after continuation quotienting. It does not
assume that permutation parity is the final Connect Four control value.

## Result

Baseline direct residual-orbit graph:

```text
residual-orbit states                 10,507
recursive action-labelled classes      8,653
recursive action-unlabelled classes    8,242
labelled-minus-unlabelled excess          411
```

The 8,242 action-unlabelled classes split into:

```text
fiber size 1       7,942 classes
fiber size 2         236
fiber size 3          40
fiber size 4          13
fiber size 5           5
fiber size 6           1
fiber size 7           4
fiber size 8           1
```

Thus 300 action-unlabelled classes contain more than one action-labelled
subclass.

Among those 300 split fibers:

```text
binary fibers                         236
power-of-two fibers                   250

pure action-transporter fibers         80
multiplicity/inactive-erasure fibers  220

transporter parity well-defined        38
exact binary parity fibers             26
parity-ambiguous transporter fibers    42
```

The 26 exact binary parity fibers occur only in the middle/late ranks tested:

```text
rank 9       5
rank 10      1
rank 11     16
rank 12      4
```

Representative exact binary fibers are literal swaps of two already-derived
phase-free child continuation classes, for example:

```text
C20,C18,C12,I
C20,C12,C18,I

transporter parity:
    first subclass   even
    second subclass  odd
```

and:

```text
C57,C49,C62,I
C49,C57,C62,I
```

again with opposite exact parity bits.

## Interpretation

The result rejects a simple global claim that the remaining action-labelled
structure is merely one XOR bit.

Most split fibers (220/300) are not even pure action transporters: the
action-unlabelled quotient also erases duplicate/multiplicity and inactive-slot
structure. Among the 80 pure transporter fibers, 42 have both even and odd
transporters because their stabilizer makes permutation parity ambiguous.

However, 26 fibers exhibit an exact `Z2` phase **only after** the phase-free
child continuation classes are frozen:

```text
same continuation-set truth
+ two action-labelled realizations
+ transporter parity is well-defined
    ->
one exact binary action-phase bit
```

This is qualitatively different from the earlier raw response-incidence XOR.
It is evidence that a genuine GF(2) layer can emerge late in the reduction
sequence, but it is not evidence that one parity bit covers the full quotient.

The current evidence therefore favors:

```text
derive structural/continuation object first
-> remove multiplicity / inactive-action semantics where valid
-> identify guarded transporter fibers
-> apply XOR/parity only where the residual phase is actually binary
```

rather than applying XOR globally to raw move coordinates.

## Relation to BSFP

No BSFP state or W/D/L result is consumed here. The result is compatible with
using BSFP later as an independent backward proof/closure mechanism, while
keeping the present forward structural derivation as the producer.

## Non-claims

This does not establish:

- an XOR formula for W/D/L;
- a scalar nimber;
- a generalized-width theorem;
- that every continuation fiber is a group torsor;
- that permutation parity is the final latent control quantity;
- a polynomial construction;
- a production solver optimization.

The next useful question is whether the 26 exact binary fibers share a
rule-derived geometric/obligation guard, and whether that guard generalizes
across dimensions without solved labels.
