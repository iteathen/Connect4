# Standard 7x6 support-algebra scaling probe — fixed legal prefixes (0.1)

Date: 2026-10-16. Canonical owner research/semantic-quotient.
Starting head: cf128b7e39295ec345f65d560b69b061d4f9445e.
Exact full small-board qualification already saved:
OWNER_INCIDENCE_BDD_EXHAUSTIVE_RESULTS_0_1.json — 138,920 legal nonterminal
boards, 316,392 literal action values, no errors, using support-owner ROBDD
compiled without game-state search.

## Frozen standard-board fixtures

Independently physically replay the already qualified legal rank-35
validation-only move sequence
`43214636342357317661423762461717147` from earlier
`STANDARD7X6_LOCAL_FUSION_RESULTS_0_1.json`. No WDL outcomes or
searched policies from that file are available to the candidate compiler.

Take *exact literal prefixes at ranks 28, 30, 35* (and rank 32 if budgets
and independent controls permit). Each candidate receives **only the
resulting support vector** and standard 7x6 geometry during formula
construction. After construction, owner-bit assignment is used to evaluate
the symbolic value and action fronts. Independent physical q and the exact
recursive cofactor game-value evaluator check those outputs separately.

## Hard caps unchanged

Per attempted symbolic compilation: 60,000 retained ROBDD nodes,
300,000 nontrivial Boolean apply/restrict/not visits,
10,000 support vectors, 15 seconds. The builder must return PARTIAL
rather than guess when a cap fails. For exact q-only value reference,
cap 200,000 q states, 800,000 transitions and 30 seconds per position.
No full 7x6 empty root attempt; support rectangle has 7^7=823,543
vectors and violates the predeclared 10,000 support bound.

## What qualifies

Record per support: number of reachable support vectors (product
`(H-h_c+1)`), BDD peak and total allocated nodes, support action
arcs, symbolic action W/D/L, evaluator visits, physical/q comparison,
first mismatch if any, and whether position is before/after full-column
capacity changes. If any source suffix does not fit independent q solve,
preserve exact UNKNOWN reference status, **not a false PASS**.

The aim is to measure **scaling**, not assert uniform polynomial
Connect4 solving or that the strategic AND/OR alternatives vanished.
Retain the distinction between state-transition algebra completeness
and output-sensitive adaptive value composition.
