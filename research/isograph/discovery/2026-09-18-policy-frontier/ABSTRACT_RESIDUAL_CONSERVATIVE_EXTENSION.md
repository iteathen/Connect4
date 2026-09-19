# Abstract residual superdomain as a conservative exact value extension

**Date:** 2026-09-18
**Status:** deductive research candidate with complete bounded controls and exhaustive pathological-support isotony checks
**Canonical branch:** `research/semantic-quotient`
**Authority effect:** none
**Research direction:** Josh Oshiro
**Implementation / qualification:** OpenAI ChatGPT

## Question

C4-R0076 was formulated as requiring a compact **realizability-preserving** clause/proof -> residual/q-value predecessor before distributed universal proof alternatives are expanded.

The rank-35 experiments suggest that realizability preservation is load-bearing on the proof/recombination side but may be unnecessary on the pointwise value side.

The candidate here is stronger:

> Embed legal q states in a larger residual-antichain superdomain, solve the ordinary exact finite game recurrence on that larger domain, and restrict the result back to legal q. No explicit recognizer for legal/history-realizable q is needed for value correctness.

This is a conservative-extension statement, not a claim that every abstract residual pair is legal q.

## Abstract support-local domain

Fix support `S`.

Let:

```text
R(S) = unique nonempty future residual shapes lambda \ S
       over all geometric winning lines lambda.
```

Let `A(S)` be the finite set of all normalized antichains over `R(S)`, including the empty antichain.

Define:

```text
Q~(S) = A(S) x A(S)
```

with coordinates for P0 and P1 residual completion functions.

`Q~(S)` deliberately includes residual-function pairs that may violate:

- exact owner cardinality;
- static ownership-partition realizability;
- alternating-history realizability;
- pre-state first-win history.

Therefore:

```text
Q_legal(S) subset_of Q~(S)
```

and equality is not asserted.

## Abstract transition

Side to move is derived from support rank parity.

For legal column action `a` landing at cell `x`:

```text
mover residual:
    R not containing x -> R
    R containing x     -> R \ {x}
    empty result       -> immediate mover win

opponent residual:
    R containing x     -> killed
    otherwise          -> R

then normalize minimal antichains.
```

Support advances by the same one-cell gravity transition.

Call this transition `T~(q,a)`.

It is defined on the whole abstract superdomain and does not ask whether `q` has a physical history witness.

## Lemma 1 — legal q embeds in the superdomain

For a legal nonterminal physical state `s` at support `S`, its normalized player residual antichains are antichains over the geometric future residual shapes `R(S)`.

Therefore:

```text
q(s) in Q~(S).
```

## Lemma 2 — legal q is forward-invariant under the abstract transition

Take a legal nonterminal state `s` and legal action `a`.

The ordinary q-transition laws give exactly the same landing cell, mover cofactor, opponent kill, first-win terminal token and normalized successor residuals as `T~`.

Therefore:

```text
if s --a--> terminal:
    T~(q(s),a) has the same terminal token

if s --a--> s' nonterminal:
    T~(q(s),a) = q(s')
    and q(s') is again legal q.
```

Thus no transition from a legal q state enters an unrealizable abstract q state.

This is the load-bearing property.

## Theorem candidate — conservative exact value extension

Define `V~` on every abstract q in `Q~` using the ordinary finite strong-value recurrence:

```text
terminal move            -> exact terminal score
nonterminal action       -> negate / one-ply lift of child V~
current state            -> max over legal actions
```

with win > draw > loss, faster win preferred, and slower loss preferred.

Let `V` be the ordinary exact legal Connect4 value.

Then for every legal nonterminal state `s`:

```text
V~(q(s)) = V(s).
```

### Proof candidate

Induct on remaining cells.

Base: full nonterminal support has no legal action and is draw under both recurrences.

Step: for legal `s`, support fixes exactly the legal action alphabet. By Lemma 2 each action has the same terminal token or the same legal successor q under both recurrences. The induction hypothesis gives equal child value for every nonterminal successor. The same max/negate/ply-lift recurrence therefore gives the same parent value.

Values assigned to abstract states outside `Q_legal` never enter this induction because legal q is forward-invariant.

Therefore explicit recognition of realizability is unnecessary for exact value evaluation on legal q.

## Corollary candidate — action values

For every legal state `s` and legal action `a`:

```text
Q~_a(q(s)) = Q_a(s).
```

The same proof applies to the single action before parent maximization.

## Abstract support-local favorable order

Fix support and current mover `p`.

Use the existing favorable residual order:

```text
qA >=_p qB

iff

mover completion function in A >= mover completion function in B
and
opponent completion function in A <= opponent completion function in B.
```

The cofactor/terminal/finite-rank isotony argument does not require either endpoint to be physically realizable. It uses only:

- equal support;
- common landing event;
- monotone Boolean residual functions;
- exact cofactors;
- first-win stopping;
- max/min finite recurrence.

Therefore the action-value threshold set on the **whole abstract domain** is a theorem candidate for an upward-closed set.

## Corollary candidate — unrealizable frontier generators are harmless

For fixed support `S`, action `a`, threshold `theta` define:

```text
U~(S,a,theta)
    = { q in Q~(S) | Q~_a(q) >= theta }.
```

If abstract isotony holds, `U~` has a finite exact minimal boundary `B~`.

For any legal q:

```text
Q_a(q) >= theta

iff

exists b in B~ such that q >=_p b.
```

A boundary generator `b` need not itself be realizable.

It cannot create a false positive: if legal `q >= b`, abstract isotony gives `Q~_a(q) >= Q~_a(b) >= theta`, and conservative exactness gives `Q_a(q)=Q~_a(q)`.

It cannot create a false negative: every `q` in the finite upward-closed set lies above some minimal generator.

Thus realizability filtering is not required merely to publish/query an exact action-value threshold boundary for legal states.

## Complete bounded controls

The new control re-ran exact physical value/action/best-move comparison against the q-local recurrence:

```text
4x3 c3
    physical states         4,631
    q states                3,734
    state mismatches            0
    action mismatches           0
    best-move mismatches        0

4x4 c4
    physical states       134,289
    q states               34,094
    state mismatches            0
    action mismatches           0
    best-move mismatches        0

5x3 c4
    physical states       147,563
    q states               11,316
    state mismatches            0
    action mismatches           0
    best-move mismatches        0
```

These controls support the implementation/semantic correspondence; they are not the proof.

## Pathological standard-7x6 controls

### Support 1

```text
S = [5,5,5,2,6,6,6]

published distributed universal product
    573,270,600

abstract residual shapes
    16

normalized antichains/player
    701

parent abstract residual pairs
    491,401

all residual pairs in complete seven-ply future support cone
    804,133

distributed product / parent abstract domain
    1,166.60x

distributed product / complete future cone
    712.91x

max exact strong-threshold boundary
    33 generators
```

### Support 2

```text
S = [5,5,2,5,6,6,6]

published distributed universal product
    58,748,277

abstract residual shapes
    16

normalized antichains/player
    704

parent abstract residual pairs
    495,616

all residual pairs in complete future support cone
    897,291

distributed product / parent abstract domain
    118.54x

distributed product / complete future cone
    65.47x

max exact strong-threshold boundary
    39 generators
```

An independent exhaustive coordinate-wise isotony replay over every parent abstract residual pair and every legal action found:

```text
support 1:
    mover-coordinate violations      0
    opponent-coordinate violations   0

support 2:
    mover-coordinate violations      0
    opponent-coordinate violations   0
```

## Structural consequence

The observed wall can now be bypassed on the two pathological supports without trying to repair distributed universal proof conjunction:

```text
proof-side distributed alternatives
        X  do not materialize their Cartesian conjunction
        |
        v
support-local residual-function superdomain
        |
        v
q-local exact strong-value recurrence
        |
        v
small action/threshold boundary
```

The key move is **conservative extension**, not an exact legal-q census.

## What this does not establish

This result does not yet establish:

- economical propagation to the empty 7x6 root;
- that abstract residual domains remain small at low ranks;
- a direct closed-form predecessor on threshold generators without interior enumeration;
- a successor authority revision;
- that C4-R0043, C4-R0069 and C4-R0076 are formally the same relation;
- that proof/certificate identity can discard realizability;
- that arbitrary proof-side Cartesian recombination is sound.

Realizability remains load-bearing for proof/certificate recombination where independent projected witnesses can be spuriously joined.

The claim here is narrower: pointwise q-value recurrence can use a conservative abstract superdomain because the legal subset is transition-closed.

## Current next test

Do not spend the next unit building a legal-q recognizer.

Instead test whether the exact threshold boundary itself can be propagated one rank earlier **without enumerating the complete parent residual-pair domain**.

Target:

```text
child threshold boundaries
+ exact q cofactor
+ controller/opponent quantifier
    ->
parent threshold boundary
```

on the rank-35 pathologies first, with exact agreement against the now-available 491k/496k abstract-domain oracle.

If successful, repeat toward rank 34 and measure generator growth.

## Epistemic disposition

```text
abstract residual superdomain definition       DEDUCTIVE
legal-subset forward invariance                 DEDUCTIVE CANDIDATE
conservative exact value restriction            DEDUCTIVE CANDIDATE
unrealizable boundary generators harmless       DEDUCTIVE CANDIDATE
complete physical controls                      PASS
pathological abstract-domain closure             PASS
pathological abstract isotony                     PASS
direct generator-only predecessor                OPEN
empty 7x6 root solved                            NO
authority 1.1 mutated                            NO
```
