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
