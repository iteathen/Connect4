# Frozen mathematical test: W/D/L lattice order saturation and ONE selected strategic continuation

**Date:** 2026-10-17 Pacific. **Pre-experiment live HEAD:** `d9ae59f15d2a073d9d8c17f6c3ee8ad836aa916b`. **Owner:** research/semantic-quotient. **Status:** exact source implication hypothesis; NO general result claimed.

## Aim
The user's success condition is exactly ONE strategic evaluation lane yielding unrestricted WDL and EVERY tied-optimal literal action label. Do not reduce ordinary game trees or run alternative future game values.

The source has a three-point value lattice `−1 < 0 < +1`. Previous source-only two-turn/first-win/paired-draw laws certify some exact per-action WDL. Separate source-only full-future column-transport proves weak **unrestricted** P0-relative value inequalities `V(q after a) <= V(q after b)`, even for inequivalent future games. Full-future program isomorphism and neutral-token pooling also certify value equivalence and future action transport. These values and edge proofs are extracted from ONE source q, with no continuation game evaluation.

## Exact interval propagation theorem

Initialize [lower_c,upper_c]=[-1,+1] for each legal source first-action label. For source-certificated exact scalar v set [v,v]. For every certified WDL edge a<=b apply until closure:

    lower_b <- max(lower_b,lower_a)
    upper_a <- min(upper_a,upper_b).

These operations are monotone, sound (from V(a)<=V(b)), and stabilize after finite integer lattice steps, WITHOUT evaluating any future strategic game. Any action with coincident [lo,hi] is exactly classified. For a full-future program equivalence group, include BOTH order edges and a proof transporter; its labels may share one future continuation if unresolved.

**One-lane extension:** If exactly one future program-equivalent unknown action class remains, follow ONE representative. More generally, if several classes remain but a unique source-certified weakest-for-P0 / strongest-for-P0 class direction dominates EVERY remaining unknown class in the mover's min/max order, follow ONE representative of that class and propagate its *exact* WDL into source inequalities. If that gives an exact scalar interval for EVERY literal action, compute the exact root WDL and **complete** tied-best set. If any action remains unresolved, return INCOMPLETE—never recursively evaluate any second class. A second unknown class is NOT deemed equivalent merely because its value currently lies in the same interval. If no class value-order covers all unresolved classes, return INCOMPLETE BEFORE constructing any game successor.

For P1 MIN, choose a source-certificate class whose value <= every other unknown class; for P0 MAX choose a class whose value >= every other unknown class. Selection uses only source-known WDL preorder. If multiple choices in the same value-equivalence SCC, choose one *full future program class* and require all SCC classes' values be propagated by the inequality lattice; do not continue a scalar-SCC representative as the same game unless its full-future program isomorphism was separately proved. No other hidden game value queries.

**Rank proof:** the only recursively valued action is ONE chosen candidate at any q. All other actions' exact WDL values follow from direct source terminal/draw/threat certificates, full-future behavioral equivalence, and mathematically valid WDL order inequalities. Fixed-point closure preserves exact numerical bounds by induction on finite value lattice. If all intervals close then result contains every and only optimal literal move.

## Predeclared controls
- Existing source-only full-future P0/P1 action transporter independently checked on every q from 4x3 and 4x4 and exact action transport (P0 source 75/2411, P1 source 86/2280 isomorphisms, zero false WDL).
- Exhaust all independent 3,734 4x3 and 34,094 4x4 exact q reference states, compare entire complete action vectors, WDL scalar and ALL optimal moves with post-derivation recursive reference. Measure new exact positions vs previous full-future-equivalence single lane (2,908 / 6,521), max 1 q successor per node, counts of source-edge bound propagations, WDL extremal saturation, and actual source work. No second speculation even if chosen class fails.
- Generic independent 4-action weak-order graphs, 3^4 WDL assignments and source-known exact action values: test that interval propagation NEVER claims a value not forced by the given inequalities and anchors. Specifically reversed inequality mutation should fail independent reference. Contradictory source exact anchors must raise a proof consistency error.
- Legal `223` ∀∃ noncommutation and `111` bounded-equality WDL inequivalence; historical absolute moves7/8 and standard `44444`: if WDL remains unknown, keep all unclassified action labels and return INCOMPLETE.
- Old numeric 60k nodes / 300k source operations / 10k support / 15s are reproducibility safety limits, not the mathematical target. No solved policy, no value oracle in producer and no authority promotion or merge.

**Success boundary:** A sound increase of restricted zero-fanout classifications is positive but NOT a complete 7x6 theorem. Total zero-branch solution is not discovered until every legal game state can be classified with exactly one lane.
