# Late action-parity audit — 4x4 Connect-4

**Status:** bounded exact structural evidence; XOR placement hypothesis remains open  
**Research direction:** Joshua Oshiro  
**Branch:** `research/nim-control-parity-algebra-20260929`  
**Initial tested head:** `9e5c73debd741b0aeee5ec24c3081e4410a6d92c`  
**Initial workflow:** `36596563362` — success  
**Generic-sign falsifier head:** `27ddaa0dfe3c57fad3e010cf5ac5ee7acc245cec`  
**Falsifier workflow:** `36597022900` — success  
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
pure-transporter fibers with
  all four slot tokens distinct         38
exact binary opposite-sign fibers       26
binary distinct-slot same-sign fibers   12
parity-ambiguous transporter fibers     42
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

## Generic permutation-sign falsifier

The apparent late binary phase has a decisive generic confound.

For an ordered action profile under the full column permutation group, the
transporters between two copies form a coset of the profile stabilizer. The
parity of that coset is well-defined exactly when the stabilizer contains no
odd permutation.

For these token profiles:

- if any slot token repeats, swapping two equal tokens is an odd stabilizer;
  therefore both transporter parities occur;
- if all slot tokens are distinct, the transporter is unique; therefore its
  parity is automatically well-defined.

So, independently of Connect Four:

```text
full-permutation transporter sign is well-defined
    iff
all slot tokens are distinct
```

The falsifier encoded this equivalence as an assertion over every pure
transporter fiber. It passed exactly:

```text
pure-transporter distinct-slot fibers   38
parity-well-defined fibers              38
exact equality                           true
```

Therefore the 38 well-defined sign fibers, including the 26 binary
opposite-sign examples, are completely explained by generic permutation
bookkeeping. They are **not positive evidence for a Connect-Four-specific XOR
control law**.

The 26/12 split among binary distinct-slot fibers merely says that, relative to
a chosen base profile, 26 second realizations are reached by an odd permutation
and 12 by an even one. No game-specific invariant has yet been isolated from
that fact.

## Interpretation

The useful result is now primarily negative and locational.

The experiment rejects both:

```text
remaining action-labelled structure = one global XOR bit
```

and:

```text
well-defined action-permutation sign = Connect Four control parity
```

Most split fibers (220/300) are not pure transporters at all; action-unlabelled
semantics also erases duplicate/multiplicity and inactive-action structure.
Among the remaining pure transporter fibers, ordinary permutation sign is
either ambiguous because of repeated tokens or trivially determined because
all tokens are distinct.

This does **not** reject the owner's sequencing hypothesis. It sharpens it.
If a Nim-like XOR exists, it must survive quotienting of generic action-label
gauge as well as residual/cofactor and continuation semantics.

The next target is therefore not raw transporter sign. It is the recursive
residue that remains when the **immediate phase-free action profile is already
identical** but multiple action-labelled continuation classes still exist:

```text
same action-unlabelled class
+ same immediate phase-free action profile
+ different recursive action-labelled class
    ->
deeper continuation phase candidate
```

Any XOR test should be applied there, or to a derived path/cocycle invariant,
because ordinary current-node permutation parity has already been factored out.

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

The next useful question is whether identical immediate phase-free profiles can
still contain multiple recursive action-labelled classes. Those deeper splits
remove the generic current-node permutation-sign explanation and are the next
candidate location for a guarded phase/XOR law.
