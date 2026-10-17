# Bounded Galois response-factor experiment 0.1

**Date:** 2026-10-16. **Owner:** `research/semantic-quotient`. **Before-run branch HEAD:** `a0e717cf816d5232f58153ea44629073d3a9d508`.
**Status:** FROZEN PLAN, not completed evidence or game-value qualification.

## Abstract proof target

For a finite, action-labelled Boolean relation P(a,b), define
B(A) = intersection of the successful-reply sets of all actions in A, and
A(B) = all actions successful against every reply in B.
A nonempty closed pair (A,B), with A=A(B), B=B(A), is a maximal all-1 rectangle.
Prove directly that the union of *all* such pairs equals P, and that the
`forall b in L exists a P(a,b)` predicate equals inclusion of legal reply labels
L in the union of closed-pair reply extents. Do not switch quantifier order.
Also preserve `exists a forall b in L P(a,b)` as a different predicate.

**Construction scope:** A and b are finite action *labels*, not future move
histories. Derive candidate closed pairs from subsets of the action alphabet;
bound the construction by 2^W subset inspections (W<=7), count actual set
intersections and incidence tests, and never enumerate 2^(W^2) matrices inside
the *producer*. The separate adversarial control may enumerate them.

## Frozen falsifiers and limits

1. Independent qualified 4x3 Connect-3 prefix `223` action-row reply masks
   `[0xe,0x4,0xe,0x7]`: the derived closed-pair cover must reproduce every
   bit and return `forall b exists a = true`, `exists a forall b = false`.
   This source relation and its oracle-blind independent physical qualifier
   are in `UNIVERSAL_RESPONSE_COVER_RESULTS_0_1.json`.
2. Exhaust all 65,536 possible 4x4 Boolean response relations as an
   **independent generic finite-relation algebra falsifier**, including
   empty relations, all-one relations, repeated rows, zero rows and
   illegal-labelled columns via explicit legal masks. Each output must
   reconstruct the original relation and respect both quantifier orders.
3. Independent 7-action adversarial algebra controls to test growth and
   refusal of any inferred strategy quotient from equal short-horizon rows.
4. Charge all subset visits, bit tests, intersections, closure calls, and
   generated rectangles. Limit one factorization to 300,000 counted operations,
   10,000 returned rectangles, 15 seconds, and 60,000 retained objects.
   A budget failure is incomplete, never a semantic negative.

No oracle/WDL policy may influence factor construction. The 4-ply legal
response-mask input is already a bounded source-residual algebraic result,
not a proof of any deeper strategic value. A successful fixed-block
factorization cannot itself cross the canonical `44444` k12 support
boundary; that remains an explicit follow-on compositional question.

## Broader mathematical decision

Compare:
A. dependency-localized d-DNNF / FAQ (existing primary candidate);
B. Galois-closed action/reply rectangles (this bounded exact test);
C. quantified-prefix-aware bilateral treewidth (new 2026 theorem);
D. unguarded ordinary residual graph decomposition (negative baseline).

Select B for this cheap falsifiable local operator; investigate C as a
possible multi-block hybrid ONLY after full, guard-complete quantified
dependencies are encoded. Preserve `44444` UNKNOWN and prior negative
results. Do not promote authority or merge.
