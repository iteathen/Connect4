# Paired-response interval witness

**Date:** 2026-09-13  
**Status:** complete bounded control / exact one-sided bound evidence; no production solver change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Question

Does the W/D/L interval formulation produce a real searchless reduction on states that remain genuine decisions after local tactical closure, or is it only a restatement of exact minimax?

Use the already-maintained guarded adjacent-pair response theorem as the first witness.

The forward implementation proves `moverNoWin` when:

```text
all column remainders satisfy the even-pair guard
and
every surviving mover residual requirement intersects the compiled response-cell mask.
```

In side-to-move orientation this narrows the exact proof interval to:

```text
upper <= 0.
```

The same predicate was applied independently to every state in the complete 4x3 connect-3 Negamax/BSFP intersection control.

## Result

The certificate applies to:

```text
122 physical states
90 structural quotient classes
```

with:

```text
exact-value mismatches = 0.
```

Most importantly, it applies to states that local tactical closure still classifies as genuine decisions:

```text
77 physical decision states
57 decision quotient classes
```

Those 77 exact values are:

```text
23 draws
54 P0 losses
0 P0 wins
```

All qualifying states in this control have P0 to move because an even number of remaining cells in every column implies even occupied rank on the 12-cell board.

Therefore the structural theorem proves exactly the interval

```text
[-1,0]
```

and does not overclaim whether the state is draw or loss.

## Why this matters

The 57 quotient classes are part of the 710 classes that remain after:

```text
immediate terminal closure
multiple-playable-threat closure
bilateral exhaustion
forced-single-response normalization.
```

Their legal successor actions are genuinely distinct structural successors. Exact successor equality does not merge them.

So the paired-response certificate is a concrete example of the missing calculus doing useful work:

```text
multiple distinct successor alternatives
  -> one structural response-policy theorem
  -> exact one-sided value bound
```

without determining every child's exact W/D/L value.

This is stronger evidence than merely observing that blocker coverage exists.

## Negamax / BSFP interpretation

### Negamax

The certificate intersects the current proof interval with:

```text
[-1,0]
```

before recursive resolution of the remaining alternatives.

### BSFP

The same certificate states that the state is outside the P0-winning attractor, even though it need not yet distinguish P1 win from draw.

Thus it is a backward safety fact compatible with later fixed-point closure:

```text
not P0Win
```

rather than a separate evaluation heuristic.

### Shared calculus

The common semantic form is:

```text
SupportGuard(s)
AND CompatibleResponsePolicy(s, Pi)
AND Covers(Pi, R_P0(s))
  => U(s) <= 0.
```

This is a genuine `BoundCertificate` in the six-element W/D/L interval lattice.

## Consequence for the missing calculus

We no longer need to ask whether structural proof can operate between exact terminal values and full exact state values. It demonstrably can.

The research target becomes:

```text
find additional sound bound-certificate families
+ close their dependencies with NDC
+ intersect their intervals
+ propagate them through max/min predecessors
```

until exact intervals collapse where possible.

The next important generalization is to remove the very strong `all column remainders even` guard and replace it with the richer CPC reservoir / response-capacity / deadline predicates already under investigation.

That would turn the one fixed paired-response profile into a generated family of no-win certificates.

## Reproducer / evidence

The result is integrated into:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/negamax_bsfp_proof_intersection_control.mjs
```

and preserved in:

```text
docs/research/evidence/2026-09-13-negamax-bsfp-proof-intersection-control.json
```

under `pairedResponseIntervalControl`.

## Non-claims

This control does not establish that paired-response coverage alone solves the standard 7x6 root, nor that every genuine decision can be reduced by an interval certificate. It establishes one exact, independently checked example where a structural response policy narrows otherwise unresolved distinct-successor decisions without child-value enumeration.
