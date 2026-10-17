# Frozen root-action scalar branch elimination from full-future WDL simulations

**Date:** 2026-10-17 Pacific. **Current HEAD at freeze:** `c21d8fa795c3ca6f9c4534f7093ad260d44f5e68`.
**Owner:** research/semantic-quotient. **Status:** FROZEN PLAN, NOT A WDL RESULT.

## Distinguish full-game proof from mere expression sharing

The source-only fixed-column transporter now verifies whole-game weak WDL order for two P1 first choices b,c from their ORIGINAL residual parent q, without evaluating any subsequent game state. Full legal 4x3/4x4 small-board censuses independently confirmed 86/2280 nonreflection full-future *program* isomorphisms and 320/3760 nonreflection one-way WDL order certificates, zero false orders or transported future-action values. Canonical 44444 has only three established reflection pairs; full game values still unknown.

## Exact scalar P1-min quotient

Let L be P1's original legal first-action labels and put edge b→c in an action dependency digraph ONLY when the certified full-future relation proves V(b)≤V(c) for P0-relative unrestricted WDL. One source-defined action-permutation certificate (not future gameplay) must accompany every edge. For P1, root value is min_{a∈L} V(a).

- Directed paths preserve weak value order by transitivity; directed cycles imply exact WDL equality of their vertices.
- Collapse strongly connected components (SCCs) into value-equal groups, retaining ALL literal original labels. Different mappings may imply equality in value without implying a single exact future-program action transporter.
- The SCC condensation is a DAG. Keep EXACTLY ONE original label representative per SCC with NO incoming certified edges from any other SCC. Every other SCC has a directed path FROM some kept source SCC, hence its value cannot improve P1's minimum. Therefore

    min_{a∈L} V(a) = min_{r∈nondominated SCC representatives} V(r).

This is a **source-only exact elimination of independent P1 FIRST-ACTION VALUE OBLIGATIONS**. It does not mean all remaining future game values are known without computing surviving roots. Weakly dominated actions may TIE with the optimal value: preserve ALL original labels, exact WDL-equality SCCs, and a proof path for every omitted scalar evaluation. Do not report an exact complete optimal set unless exact values or strict/equality structural certificates determine every omitted label.

**Cost discipline:** compute graph closure, SCCs, witness paths with O(W^3) finite labelled action operations; charge all graph bitset/loop work and source transporter work. There is no game-tree search in producer; compiler budget remains 60k/300k/10k/15s per source.

## Falsifiers and measurements

- Generic all <=4-action directed weak-order graphs (including cycles, redundant transitive edges, ties, disconnected components): compare algebraic P1 minimum of all exhaustive triplet WDL assignments satisfying every edge against the minimum on nondominated SCC reps.
- Real full legal 4x3-c3 and 4x4-c4 unique P1-q sources, source-derived transporter only. Independent qualified recursive exact q full WDL reference AFTER proof ensures scalar min across retained root actions equals true min across every legal action for ALL sources and SCC equality groups have identical WDL. Count real distinct source-q candidate root-action value evaluations omitted; distinguish them from actual runtime saved and total proof-search work.
- Compare full transport+SCC quotient with **reflection-only SCC quotient** on the SAME q corpus: quantify extra source-only cross-support scalar action eliminations from newly discovered nongeometric full-future mappings.
- Standard7x6 44444: seven legal first actions, retain four reflection representatives; do NOT pretend more classes have been eliminated or any WDL is classified. The legal 111 and 1111222234334 bounded-signature counterexamples and 223 quantifier-scope test remain mandatory.
- Negative controls: reversed dominance arrow, failure to retain SCC labels, false equality of two one-way unrelated nodes. Reject all mutations.

No authority promotion, merge, full-game 7x6 WDL claim, or hidden continuation enumeration.
