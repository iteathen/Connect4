# Frozen zero-branch theorem candidate: exact best-move set WITHOUT computing inferior moves' exact WDL

**Date:** 2026-10-17 Pacific. **Pre-experiment HEAD:** `3b0c097342474dc56f76e2778fd9cb2a6968c7cc`. **Owner:** `research/semantic-quotient`. **Status:** mathematical hypothesis/plan, no new measured result yet.

## Owner's precise output
The required output is **(unrestricted ordinary WDL value of q, complete set of ALL WDL-optimal legal literal moves)**. It is NOT necessary to determine the exact numeric WDL value of an already provably inferior move, so long as its inferiority is mathematically established. Earlier one-lane programs imposed the stronger condition that EVERY individual action WDL be exactly known. This may reject legitimate zero-branch optimal-set certificates.

## Exact interval-separation lemma
Given legal action labels c and certified unrestricted P0-relative values `V_c in [lo_c,hi_c]` with lo/hi in {−1,0,+1}, define:

For P0 to move: `R_lo=max_c lo_c, R_hi=max_c hi_c`.
For P1 to move: `R_lo=min_c lo_c, R_hi=min_c hi_c`.

If `R_lo != R_hi`, unrestricted root WDL is NOT yet certified.

If `R_lo=R_hi=V`, ROOT WDL is certified. To certify the COMPLETE optimum label set WITHOUT exact values of inferior moves:
- P0 MAX: a label c is exactly optimal iff `lo_c=V` (its true WDL must then equal V because every hi_c<=V); a label c is certified inferior iff `hi_c<V`. If some label has `lo_c<V<=hi_c`, exact membership remains UNDECIDED.
- P1 MIN: a label c is exactly optimal iff `hi_c=V` (every lo_c>=V); c is certified inferior iff `lo_c>V`. If some label has `lo_c<=V<hi_c`, exact membership is UNDECIDED.

Thus if EVERY legal c is either certified optimal or certified inferior, output exact `(V, full best set)` with no future game evaluation, even when inferior action values remain as honest non-singleton intervals. Proof is immediate finite min/max interval monotonicity plus strict interval separation. This is a true zero-strategic-fanout theorem.

## One-lane extension
Use the existing direct source-2turn and source-only full-future WDL weak-order lattice to construct intervals, including full-future behavioral equivalences. At a node, if exact *root WDL and best-set* separation closes, return immediately with zero child q, regardless of remaining inferior move scalar uncertainty. Otherwise, if exactly one unresolved future PROGRAM-equivalent class is present, evaluate ONE class representative and propagate its WDL through source inequalities; if all best-set membership intervals become separated, return `(V,M*)`. If there are multiple remaining unknown classes, optionally select ONE source-proved mover-favorable extremal class; if its value and source inequalities complete the root value + best-set membership, return; otherwise INCOMPLETE. NEVER evaluate another inequivalent future.

This is algebra on original source h/R0/R1, not q child branching, QBF/BDD game-history expansion, solved-value precompute or pruning count optimization. Keep any partially known inferior-action scalar values as bounds, not fabricated exact numbers.

## Frozen independent falsifiers
- Exhaustive **all** 4×3 Connect3 3,734 and 4×4 Connect4 34,094 q reference states, validating root exact WDL and EVERY optimal literal move for ALL certified zero-fanout returns, including positions where SOME inferior actions have non-singleton WDL intervals. Compare those certified action intervals to qualified exact q actions for soundness, but don't demand exact inferior numeric outputs.
- Generic all four-action weak-order graphs, 3^4 P0 WDL valuations and source exact anchor subsets; validate both root value equality and optimal-membership separation. Wrong certification of any tie is a falsifier. Contrast with prior 540,672 source lattice controls.
- Preserve real `223` adaptive-order counterexample, `111` bounded-equal/full-WDL different, first-win and gravity, full original move7/8 transition and canonical `44444` no unqualified winning claims. Max strategic fanout 1 in EVERY candidate trace; no second future q.
- Original 60k/300k/10k/15s research limits remain safety envelopes, not success criterion. Commit negative if no additional values, do not claim complete Connect4 nonbranching solution without proving EVERY legal source q.

**Research importance:** This targets the user's actual `(V,M*)` output instead of imposing an unnecessary stronger exact vector per inferior move. It could close positions that previous exact-all-action-vector implementations declared INCOMPLETE even when the optimum/ties are algebraically decided.
