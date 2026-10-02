# CPCX — CPC Extended prototype

**Status:** experimental research prototype  
**Branch:** `experiment/cpcx-20261002`  
**Durable research owner:** `research/semantic-quotient`  
**Production CPC:** unchanged

## Purpose

CPCX explores a bounded extension of Control Parity Calculus from immediate/singleton
obligations to residual obligations containing up to four missing cells.

The prototype deliberately lives outside production CPC. It is intended to answer:

> Given the current position, what future one-, two-, three-, and four-piece
> winning obligations already exist, how are they supported, and how would an
> owner-labelled future event algebraically contract or kill those obligations?

This is a structural projection problem, not a game-tree problem.

## v0.1 objects

For every live Connect-K line and player, CPCX records an obligation when the
line contains 1–4 empty cells and no opponent cell.

Each obligation carries:

- exact line provenance and orientation;
- missing cells and cardinality;
- current support distance for each missing cell;
- zero-reservation CPC event rank and projected owner;
- support prerequisites below each target;
- same-column-chain versus multi-column shape;
- current column capacities;
- neutral response-pair depth;
- unmatched top-defect bit.

CPCX also builds an owner-labelled event-effect index.

For an empty cell `x`:

```text
owner p acquires x:
    every p residual containing x contracts by one missing cell

owner 1-p acquires x:
    every p residual containing x is killed
```

That is positive residual cofactor algebra. It does **not** assert that the
future event occurs.

## Bounded contraction DAG

For a single k-piece obligation, CPCX can emit its entire owner-labelled
residual contraction DAG.

v0.1 hard-bounds:

```text
1 <= k <= 4
```

Therefore one live line has at most:

```text
2^4 - 1 = 15
```

nonempty residual states.

For fixed `k <= 4`, this is constant expansion per winning line, so the
prototype remains linear in the number of geometric lines for this closure
surface. It is **not** a claim that arbitrary unbounded obligation cardinality
admits the same complexity.

## Column depletion

CPCX does not label a column boundary as a phase transition by fiat.

For each column it computes:

```text
remaining = H - height
neutralPairCount = floor(remaining / 2)
unmatchedTopDefect = remaining mod 2
```

At `44444`:

```text
columns 1,2,3,5,6,7:
    remaining = 6
    neutralPairCount = 3
    unmatchedTopDefect = 0

column 4:
    remaining = 1
    neutralPairCount = 0
    unmatchedTopDefect = 1
```

That gives a runtime-observable boundary condition which later CPCX rules may
consume.

## 44444 structural seed

Without using solved values, CPCX locates the following P0 obligations on the
right wing:

```text
D1-E1-F1-G1    3 missing
D3-E3-F3-G3    3 missing
D5-E4-F3-G2    3 missing
D6-E5-F4-G3    4 missing
```

Their reflected counterparts are discovered by the same geometry scan.

This is useful for the ply-6 equivalence investigation because the multi-piece
objects exist directly in the current rank-local state. No child position needs
to be solved merely to discover them.

## What v0.1 does not claim

CPCX v0.1 does **not** claim:

- W/D/L;
- optimal moves;
- that zero-reservation projected ownership survives arbitrary interventions;
- that a k-piece obligation is forced merely because it exists;
- that contracting an obligation proves the owner will acquire the contracting
  event;
- completeness of the eventual CPCX theorem vocabulary.

The next proof layer must attach exact guards for response resources, deadlines,
first-win precedence and column-boundary/debt transport.

## Intended next layer

The next useful operator is a bounded consequence closure:

```text
certified forced event
    -> apply owner-labelled event effects
    -> lower-cardinality obligations
    -> response-capacity/deadline analysis
    -> new certified forced events
```

The important restriction is that the implication step must be algebraic
(XOR/precedence/matching/flow/fixed-point closure), not recursive guessing over
legal replies.

That is the point at which CPCX can begin testing whether a two-, three-, or
four-piece obligation calculus can prove the sixth-move equivalence at
`44444`.

## Run

```bash
node --test research/isograph/discovery/2026-10-02-cpcx/cpcx.test.mjs
node research/isograph/discovery/2026-10-02-cpcx/run-cpcx.mjs

SEQUENCE=444444 node research/isograph/discovery/2026-10-02-cpcx/run-cpcx.mjs
```


## v0.2 closure layer

CPCX v0.2 adds an exact/guarded closure layer in `cpcx-closure.mjs`.

### Exact current-ply rules

The current side to move is classified before any future projection:

```text
current-player playable singleton
    -> immediate terminal has precedence

one distinct playable opponent singleton
    -> exact forced response

two or more distinct playable opponent singletons
    -> exact response-capacity overload
```

The overload proof is represented as a bipartite capacity problem.  Current
Connect Four supplies one placement slot.  If two distinct obligations both
require that slot, maximum matching has size one and CPCX emits the corresponding
Hall-deficiency witness.

The implementation is an augmenting-path matching algorithm and is polynomial
in the supplied demand/resource graph.

### Deterministic forced transit

A unique exact forced response may be applied and CPCX may repeat the same exact
classification at the resulting state.

This is not legal-move branching:

```text
there is exactly one admissible nonterminal response
    -> take that exact transition
    -> recompute current rank-local obligations
```

The closure stops as soon as a choice exists, an immediate terminal exists, or
an exact overload is certified.

### Guarded multi-piece certification

CPCX now owns a parity/XOR fact system.  Exact owner facts and exact pairwise XOR
relations may be inserted and closed by union-find with parity.

A 2-, 3-, or 4-piece obligation is promoted to
`CERTIFIED_COMPLETION` only when every missing event has:

1. an exact owner fact equal to the obligation owner;
2. an admissibility/support fact;
3. a before-deadline fact.

Owner projection by itself is deliberately insufficient.

### Explicit boundary operator

For each column CPCX emits:

```text
remaining
neutralPairCount
unmatchedTopDefect
unmatchedEventOffset
```

under the stated paired-response schedule premise.

Thus depletion is represented as an arithmetic boundary operator rather than a
named phase supplied by the caller.

## New structural result at 44444

At `44444`, CPCX mechanically discovers twelve synchronized P0 three-piece
horizontal projection ladders:

```text
row 1: four horizontal lines through D1
row 3: four horizontal lines through D3
row 5: four horizontal lines through D5
```

The three rows have support depths:

```text
0, 2, 4
```

and zero-reservation event ranks:

```text
32, 34, 36
```

respectively.

More importantly, those ladders contain two disjoint three-column families:

```text
left wing:  A,B,C
right wing: E,F,G
```

Each wing carries one synchronized three-piece ladder at all three support
levels.

Because the column sets are disjoint, one current placement can intersect at
most one wing. Therefore CPCX v0.2 certifies:

```text
after any single legal sixth placement,
at least one complete three-level wing family remains structurally untouched.
```

That statement is exact set-theoretic structure. It does **not** yet prove the
surviving wing's projected owners or eventual completion.

This materially narrows the move-6 theorem target.  CPCX no longer needs seven
independent continuations.  It needs one generic theorem of the form:

```text
surviving synchronized three-level wing
+ certified parity/response ownership
+ support/deadline guards
-> forced completion
```

If that theorem is established from rank-local facts, the same certificate
applies after every legal sixth move.

## v0.2 exact controls

The prototype retains two small independent exact controls:

```text
111111223
    -> one exact forced response at D1

111131415
    -> two distinct immediate opponent singleton obligations
    -> one response slot
    -> matching size 1
    -> Hall deficiency 1
    -> exact forced loss boundary
```

These controls test the forcing/capacity machinery without using `44444` as a
training label.
