# BSFP support-local residual basis and neutral-event reservoir

**Status:** live exact-structure / reduction hypothesis. No production solver change.

**Research direction:** Josh Oshiro.

## Purpose

The global WSL-625 basis is useful when one representation must cover every standard-7x6 residual requirement independent of support. BSFP, however, already processes a fixed support skeleton at each symbolic bucket. Conditioning on that support makes the residual vocabulary much smaller by exact geometry alone.

This note separates the exact support-local theorem from the implementation hypotheses it suggests.

No solved W/D/L label, opening book, optimal terminal-line set, or precomputed search result is a premise.

## 1. Exact support-local residual-basis theorem

Let `Lambda` be the geometric Connect-4 winning lines and let `S` be the occupied support ideal.

For a line `lambda`, define its future part

```text
R_lambda(S) = lambda \ S.
```

For player `p`, a geometric line remains a live positive winning requirement exactly when none of the occupied cells of `lambda` belongs to the opponent. Whenever it is live, every occupied cell of `lambda` already belongs to `p`, so its remaining positive requirement is exactly

```text
R_lambda(S).
```

Therefore every nonempty residual term that can occur at fixed support `S` belongs to

```text
B(S) = unique { lambda \ S | lambda in Lambda, lambda \ S != empty }.
```

Consequently

```text
|B(S)| <= |Lambda|.
```

For standard 7x6 Connect-4 this means at most 69 support-local residual masks even though the support-independent WSL construction contains 625 nonempty masks.

This is an exact vocabulary bound, not a claim that every member of `B(S)` is live for either player in a particular ownership state.

## 2. Deterministic basis transition under one support event

Let legal landing cell `x` extend support from `S` to `S' = S union {x}`.

For every geometric line:

```text
R_lambda(S') = R_lambda(S) \ {x}.
```

Thus the child support-local basis is obtained entirely from the parent geometric-origin map by:

```text
remove x where present
-> drop empty terms from the nonterminal residual vocabulary
-> deduplicate equal masks.
```

The actual player residual transition then applies the ordinary exact owner-labelled cofactor:

```text
mover:
  live terms containing x shrink by x;

opponent:
  live terms containing x die;

normalize positive antichain.
```

No global 625-ID lookup is mathematically necessary for this fixed-support transition. A global ID remains useful for cross-support persistence, provenance, or shared indexing if it earns its cost.

## 3. Local antichain bitset form

At fixed support, assign dense IDs to the unique masks in `B(S)`.

A player's normalized positive residual antichain can then be represented as membership over those local IDs plus precomputed local subset/dominance relations.

For local terms `a,b`, the usual positive-antichain normalization is exactly:

```text
if a subseteq b, b is redundant.
```

Because `B(S)` is support-fixed, the local subset relation can be precomputed once per support/orbit and reused for:

- residual normalization;
- implication/subsumption;
- blocker coverage;
- singleton/degree classification;
- exact cofactor mapping to child-local IDs.

This is a representation proposal, not yet a runtime claim.

## 4. Pure support census

The following counts were derived only from Connect-4 geometry and support-height enumeration. For each support, the count is the number of unique nonempty masks in `B(S)`.

### 6x5 Connect-4

| Rank | Supports | Mean local basis | Max | Min |
| ---: | ---: | ---: | ---: | ---: |
| 20 | 2,247 | 21.23 | 27 | 14 |
| 21 | 1,666 | 18.98 | 25 | 13 |
| 22 | 1,161 | 16.66 | 21 | 12 |
| 23 | 756 | **14.30** | **18** | 10 |
| 24 | 456 | 11.91 | 15 | 8 |
| 25 | 252 | 9.56 | 12 | 7 |
| 26 | 126 | 7.25 | 9 | 6 |
| 27 | 56 | 5.00 | 6 | 4 |
| 28 | 21 | 2.86 | 3 | 2 |
| 29 | 6 | 1.00 | 1 | 1 |
| 30 | 1 | 0.00 | 0 | 0 |

The measured CUDA-BSFP wall appears in the high-rank 6x5 region. At rank 23 the support-local residual vocabulary is only 10-18 masks per support, mean 14.30.

### Standard 7x6 Connect-4

| Rank | Supports | Mean local basis | Max | Min |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 1 | 69.00 | 69 | 69 |
| 15 | 33,390 | 60.76 | 66 | 52 |
| 17 | 46,655 | 57.98 | **64** | 50 |
| 21 | 60,691 | 50.76 | 59 | 40 |
| 23 | 56,854 | 46.38 | 56 | 35 |
| 30 | 15,330 | 28.36 | 37 | 18 |
| 35 | 1,709 | 14.83 | 20 | 10 |
| 40 | 28 | 2.79 | 3 | 2 |
| 41 | 7 | 1.00 | 1 | 1 |
| 42 | 1 | 0.00 | 0 | 0 |

From rank 17 onward, every standard-7x6 support has at most 64 unique nonempty support-local residual masks.

A two-u32 membership word per player is therefore sufficient for the local residual vocabulary through that entire late half of the solve if local IDs are used. Earlier ranks need only a small extension because the absolute maximum is 69.

This does not imply the whole semantic state is 64 bits; support/accessibility, proof guards, identity mapping and other exact state remain separate.

## 5. Relation to WSL-625

WSL-625 and the local basis answer different questions.

```text
WSL-625:
  one support-independent universe for all nonempty standard-board residual masks.

B(S):
  the exact residual masks that can possibly occur at this already-known support.
```

Every member of `B(S)` is a WSL residual mask. The local basis is therefore a support-conditioned restriction of the global universe, not a competing semantics.

This makes a hybrid attractive:

```text
global/canonical WSL identity where persistence is needed
-> support-local dense IDs for hot closure
-> exact map back to canonical identity at boundaries.
```

## 6. Cheap local Isometric closure

The Isometric blocker rule says a certified blocker set `B` kills residual requirement `R` exactly when

```text
B subseteq R.
```

At fixed support with local residual IDs, compile each qualified blocker/certificate to a local coverage mask:

```text
cover_S(B) = { i | B subseteq localResidual[i] }.
```

Then residual elimination becomes fixed-width bitset algebra over the support-local basis rather than a scan over the global 625 universe.

The same local basis can carry:

- residual membership;
- blocker coverage;
- singleton/degree metadata;
- local implication masks;
- exact child cofactor map;
- claim-relative dependency incidence.

This is the strongest immediate connection to Isometric: it may make proof-side inference cheap enough to run before BSFP Cartesian materialization instead of remaining an expensive auxiliary representation.

## 7. Local basis plus feasible-slice filtering

The support-local basis composes naturally with `BSFP_FEASIBLE_SLICE_REDUCTION.md`.

At one support:

```text
support-local residual IDs
+ legal ownership cardinality
+ fully-occupied-line nonterminal clauses
+ runtime-earned fixed/affine/blocker facts
```

define a compact local constraint system.

Candidate ordering:

```text
1. canonicalize support/reflection orbit;
2. load local residual basis and subset tables;
3. saturate cheap Isometric closure;
4. reject infeasible BSFP cones/pairs;
5. materialize only surviving antichain candidates;
6. group/deduplicate on device.
```

The semantic reduction should occur before expensive generic grouping whenever its proof cost is lower than the work removed.

## 8. Exact permanently-neutral-column theorem

Let the actual current normalized residual antichains for both players be `R0,R1` at support `S`.

Define the future-active cell set

```text
A = union of every cell in every term of R0 and R1.
```

Suppose every remaining unoccupied cell in column `c` lies outside `A`.

Then column `c` is permanently residual-neutral for this state:

1. its current landing cell belongs to no mover residual, so playing it cannot complete or shrink a mover requirement;
2. it belongs to no opponent residual, so playing it cannot kill an opponent requirement;
3. because no residual contains the landing cell, the move cannot be an immediate geometric win represented by the current residual semantics;
4. residual transitions only shrink or delete existing positive terms, so a cell absent from all current terms can never be introduced into a future term;
5. after consuming one cell, the same statement holds for the remaining suffix of the column.

Therefore a move in such a column changes only:

```text
support/rank
side to move
remaining neutral capacity.
```

It does not change either residual antichain.

## 9. Neutral-event reservoir quotient

If several columns are permanently neutral in the sense above, their individual identities are irrelevant to W/D/L as long as the requested observation does not require physical action provenance.

Let

```text
N = total number of remaining cells across permanently-neutral columns.
```

Every neutral move has the same semantic effect:

```text
(R0,R1,side,N)
  ->
(R0,R1,1-side,N-1).
```

Multiplicity of equivalent legal neutral actions does not affect existential/universal max/min semantics. Thus the neutral columns can be replaced, for W/D/L transition meaning, by one integer neutral-event reservoir `N`.

This is a stronger support reduction than saying raw support is unnecessary. C4-R0025 already shows support-free residual identity is too coarse. The candidate refined identity is:

```text
active accessibility/timing state
+ residual antichains
+ neutral-event reservoir
+ side/proof state.
```

Columns containing a future-active residual cell are not neutral. Neutral filler cells below a future-active cell may still need a per-column distance/accessibility counter; they cannot be merged merely by total capacity without a scheduling theorem.

## 10. Why the neutral theorem matters to cross-support identity

Behavioral minimization previously found exact future-equivalent classes crossing support/rank boundaries while support-free residual identity failed in general.

The neutral-reservoir theorem supplies one exact mechanism that can create such cross-support equivalence:

```text
different physical neutral-column height distributions
-> same active residual/accessibility state
-> same total neutral event reservoir
-> same W/D/L transition behavior.
```

This should be tested as an explicit explanation before inventing a broader opaque cross-support quotient.

## 11. Experiment sequence

### Local residual basis

1. On every complete small-game support, enumerate `B(S)` directly from geometry.
2. Encode authoritative residual antichains using local IDs and require exact round-trip equality.
3. Apply every legal owner-labelled cofactor through precomputed parent->child local maps and compare with the existing residual implementation.
4. Compile local blocker coverage and compare with canonical WSL subset semantics.
5. Measure local basis width, normalization work and certificate cost.
6. Probe 6x5 ranks 20-30 before any full 7x6 run.

### Neutral reservoir

1. Detect permanently-neutral columns from exact residual antichains on complete controls.
2. Group states by active residual/accessibility state plus total neutral capacity.
3. Require identical terminal/action/WDL behavior after lifting physical neutral actions.
4. Compare against known behavioral-minimization cross-support classes.
5. Record the first counterexample if individual neutral-column identity is ever load-bearing for the requested W/D/L observation.

## 12. Falsifiers

- a residual term at support `S` does not equal `lambda \ S` for any geometric line;
- local-ID cofactor/normalization changes the exact residual formula;
- local blocker coverage disagrees with canonical subset semantics;
- a cell classified permanently neutral later appears in a residual term;
- two states collapsed by the neutral reservoir have different W/D/L transition meaning after action lifting;
- neutral compression is used when physical action/terminal-line provenance is part of the requested observation;
- support is discarded for an active column whose accessibility/deadline remains load-bearing;
- measured local-table construction costs more than the global representation without compensating candidate/proof reduction.

## Disposition

Promote the **support-local residual basis** to the first proof-side representation experiment after legal-slice filtering/reflection. It is exact by construction and directly targets the main concern that global WSL/NDC records may be too wide for BSFP.

Treat the **neutral-event reservoir** as a higher-value semantic-identity experiment after the local basis is qualified, because it can explain and extend exact cross-support behavioral collapse rather than merely reduce per-support proof cost.
