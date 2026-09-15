# Terminalization audit across the candidate universe

**Date:** 2026-09-09  
**Status:** research classification correction; maintained source and `main` unchanged.  
**Branch:** `research/low-confidence-survival-2026-09-09`

## Purpose

The previous graph added terminalization awareness but did not classify every relevant candidate precisely. This audit distinguishes methods that **semantically settle future game outcomes or outcome propositions** from methods that merely reduce, bound, order, cache, or parallelize search.

The governing distinction is:

> A future-terminal method can certify an eventual terminal proposition from the current state without enumerating the intervening game tree.

A method may have long semantic reach without being a terminalizer. A support-event representation, a forced macro-edge, or an earliest-win bound can all reason about the future while still leaving an unresolved search obligation.

## Terminal proposition strength

Terminalization is not one binary property. The graph now records the proposition actually proved:

- `exact-distance-value` — exact current solver value including distance semantics where applicable;
- `exact-outcome` — exact W/D/L or winner class, but distance may still require refinement;
- `exact-draw` — exact value zero;
- `one-sided-no-win` — proves one player cannot obtain a win; exact for a binary win/no-win proof but not necessarily the complete exact score;
- `strategic-resource-certificate` — exact future ownership/control fact used inside a larger terminal proof;
- `none` — no terminal proposition is proved.

This prevents a strategic no-win proof from being mislabeled as an exact distance-sensitive solve.

## Terminalization completeness

Also record whether the candidate is:

- `standalone` — can itself close its stated proposition;
- `conditional-standalone` — can close the proposition only when its coverage/preconditions span the entire remaining obligation;
- `component` — supplies an exact fact to a larger certificate;
- `not-applicable` — not a terminalizer.

## Strategic/current candidate audit

| Candidate | Terminalization role | Semantic reach | Proposition strength | Completeness | Assessment confidence | Notes |
|---|---|---|---|---|---:|---|
| RWS | none; terminalization substrate | whole remaining game semantics | none | not-applicable | 0.98 | Makes exhaustion and strategic certificates expressible but does not by itself decide an unresolved state. |
| RID | none; certificate substrate | static/fixed universe | none | not-applicable | 0.99 | Precomputed identities/masks; no game outcome proposition by itself. |
| SUP/event frontier | none; terminalization-enabling substrate | future accessibility/event state | none | not-applicable | 0.96 | Carries exact reachability facts that may make ZPAR/Allis/exhaustion cheap. |
| FW | none | execution only | none | not-applicable | 1.00 | Pure execution discipline. |
| INC | none | transition-local | none | not-applicable | 1.00 | Makes certificates cheap but is not a certificate. |
| IWIN | immediate terminalizer | one ply | exact-distance-value | standalone | 0.99 | Direct winning move proves exact immediate result. |
| DTH | bounded forced terminalizer | bounded forced horizon | exact-outcome | standalone | 0.99 | Two distinct immediate opponent threats prove inevitable loss; exact distance semantics remain whatever the qualified solver contract specifies. |
| FBLK | none | one-ply forced transition | none | not-applicable | 0.99 | Restricts legal non-losing continuation but does not settle the game. |
| FMAC | none | arbitrary forced chain until next decision | none | not-applicable | 0.99 | Collapses deterministic transit structure; still returns to search unless another terminalizer fires. |
| CARD | none | future admissible bound | none | not-applicable | 0.99 | Tightens exact score window; does not settle outcome by itself. |
| SEWB | none | future admissible/support bound | none | not-applicable | 0.96 | Future-looking bound, not terminalization. |
| EXH | partial future-terminal certificate | strategic/unbounded | one-sided-no-win | standalone for that proposition | 0.98 | If a player has no surviving winning requirement, that player cannot win. Exact for a binary win/no-win obligation, not automatically the complete exact score. |
| BEXH | exact draw terminalizer | strategic/unbounded | exact-draw | standalone | 0.99 | If both players have no surviving winning requirement, no future move can restore one; exact draw immediately. Separated from EXH because the proof strength is stronger. |
| AUTO | none | semantic equivalence | none | not-applicable | 1.00 | Quotients equivalent search states. |
| DEAD/neutral equivalence | none | future action equivalence | none | not-applicable | 0.96 | Collapses equivalent filler choices; exact draw belongs to BEXH, not DEAD. |
| IMPL | none | cross-state proof transfer | none | not-applicable | 0.98 | Can produce a cutoff/exact interval through reused proof, but does not infer the future terminal proposition directly from the current state's game semantics. |
| RANK | none | cache placement | none | not-applicable | 1.00 | Search-memory organization. |
| CTT | none | cache identity | none | not-applicable | 1.00 | Search-memory representation. |
| PH | none | proof-authority architecture | none | not-applicable | 1.00 | Separates proof from hints. |
| STT | none | parallel proof memory | none | not-applicable | 1.00 | Reuses prior search results. |
| CAP | none | coarse resource selection | none | not-applicable | 1.00 | Resource policy. |
| YBWC | none | parallel search structure | none | not-applicable | 1.00 | Parallelizes unresolved proof work. |
| AFF | none | scheduling/affinity | none | not-applicable | 1.00 | Reorders already-valid proof work. |
| CPR | none | completed-proof retrieval | none | not-applicable | 0.99 | May end a query by retrieving a prior proof, but is proof reuse rather than semantic future-terminal detection. |
| JOIN | none | in-flight proof coalescing | none | not-applicable | 1.00 | Coordination only. |
| MHINT | none | ordering hint | none | not-applicable | 1.00 | Ordering only. |
| E1 residual maturity/live-line ordering | none | ordering signal | none | not-applicable | 1.00 | Measured proof-order effect; no proof authority. |
| E2 residual parity/future-threat metadata | none; terminalization-enabling metadata | future ownership signal | none | not-applicable | 0.99 | Important correction: the maintained/residual parity heuristic is not itself an exact certificate. Exact parity facts become authority only inside ZPAR or formally proved Allis-rule preconditions. |
| E3 legacy 0.65 asymmetry | none | ordering signal | none | not-applicable | 1.00 | Heuristic ranking only. |
| E4 evaluator immediate-threat promotion | none in exact search | heuristic horizon signal | none | not-applicable | 1.00 | Exact-search terminal authority is owned by IWIN/DTH/FBLK, not evaluator promotion bits. |
| P1 proof-cost/conspiracy ordering | none | proof-order forecast | none | not-applicable | 1.00 | Chooses proof order; does not prove game result. |
| P2 proof-number search | none | search algorithm | none | not-applicable | 1.00 | An exact search method can eventually prove outcomes but is not a future-terminal detector merely because its output is exact. |
| ZPAR exact parity/Zugzwang detector | strategic future terminalizer | strategic/unbounded | projected exact-outcome; distance authority unproved | standalone if formal predicate closes | 0.58 | Distinct from E2. High-upside low-confidence candidate. Exact proposition must be formalized and independently qualified. |

## Allis rule audit

The nine Allis rule families are **exact strategic certificate components**, not ordinary search heuristics. Their future ownership claims can reach arbitrarily far into the remaining game. But a local rule instance does not normally settle the full position unless its solved-group coverage happens to close the whole relevant opponent obligation.

| Candidate | Role | Reach | Proposition strength | Completeness | Assessment confidence |
|---|---|---|---|---|---:|
| A1 Claimeven | certificate component | strategic/unbounded | strategic-resource-certificate | conditional-standalone for one-sided no-win if total coverage closes | 0.93 |
| A2 Baseinverse | certificate component | strategic/unbounded | strategic-resource-certificate | conditional-standalone for one-sided no-win if total coverage closes | 0.93 |
| A3 Vertical | certificate component | strategic/unbounded | strategic-resource-certificate | conditional-standalone for one-sided no-win if total coverage closes | 0.93 |
| A4 Aftereven | certificate component | strategic/unbounded/event-ordered | strategic-resource-certificate | conditional-standalone for one-sided no-win if total coverage closes | 0.82 |
| A5 Lowinverse | certificate component | strategic/unbounded | strategic-resource-certificate | conditional-standalone for one-sided no-win if total coverage closes | 0.82 |
| A6 Highinverse | certificate component | strategic/unbounded | strategic-resource-certificate | conditional-standalone for one-sided no-win if total coverage closes | 0.76 |
| A7 Baseclaim | certificate component | strategic/unbounded | strategic-resource-certificate | conditional-standalone for one-sided no-win if total coverage closes | 0.80 |
| A8 Before | certificate component | strategic/unbounded/event-ordered | strategic-resource-certificate | conditional-standalone for one-sided no-win if total coverage closes | 0.80 |
| A9 Specialbefore | certificate component | strategic/unbounded/event-ordered | strategic-resource-certificate | conditional-standalone for one-sided no-win if total coverage closes | 0.72 |
| A10 compatible rule cover | partial future-terminal certificate | strategic/unbounded | one-sided-no-win | standalone for that proposition when coverage + compatibility close | 0.78 |

### Important correction to A10

A compatible rule cover usually establishes that the opponent's surviving winning groups are all strategically refuted under the controller strategy. That is an exact **one-sided no-win proposition**. It can terminate a binary `can opponent force a win?` proof immediately, but it is not automatically an exact distance-sensitive W/D/L score. Additional facts may be needed to distinguish controller win from draw.

The A1-A3 survival experiment strengthens their status as certificate components: on 29 nontrivial mid/late roots they covered 84.55% of opponent residual requirements on average, produced three conservative complete covers, and produced zero false hold claims.

## Historical 107-item audit

The complete historical inventory was checked for this distinction.

- IDs **1-95**: no future-terminal detector. They are representations, TT/cache variants, parallel/scheduling mechanisms, resource selectors, dependency/placement mechanisms, cleanup/lifecycle mechanisms, or ordering hints.
- ID **96 Immediate wins**: `immediate-terminal`, one-ply, exact terminal result.
- ID **97 Forced defense**: not terminalization; exact one-ply transition restriction. The separate double-threat case is represented by DTH and is terminalizing.
- IDs **98-107**: no future-terminal detector. They are replay/order/reference/objective/sharing/partitioning policies.

Thus the old 107-item ledger contained only the immediate-win terminalizer explicitly; the strategically important future-terminal candidates emerged from the later residual/Allis/Zugzwang work.

## Why proof reuse is not terminalization

TT exact hits, implication-derived exact intervals, completed coarse-proof reuse, and proof-number completion can all end a computation early. That is not the category being modeled here.

The terminalization category is reserved for **semantic inference about the remaining game**, not retrieval or reuse of proof work performed elsewhere.

This distinction matters for interaction economics:

- a terminal detector's hit rate depends on game structure;
- its value is avoided future subtree size per semantic certificate;
- proof-reuse hit rate depends on prior search/cache history instead.

## Correct search pipeline after the audit

A more precise conceptual pipeline is:

```text
compile/update exact semantic state
    -> immediate/bounded terminalization (IWIN, DTH)
    -> strategic future-terminal checks whose cheap preconditions are present
       (BEXH, EXH for relevant binary obligations, ZPAR, selective Allis cover)
    -> forced transition normalization (FBLK/FMAC)
    -> exact admissible bounds (CARD/SEWB)
    -> equivalence/canonicalization (AUTO/DEAD)
    -> proof reuse/cache
    -> ordering/proof-cost
    -> unresolved search
```

The exact ordering among cheap terminalization, forced normalization and bounds remains an empirical integration question. The classification only establishes that they solve different kinds of problem.

## Experimental consequence

Future-terminal candidates need metrics ordinary search optimizations do not:

```text
checks
hits
hit rate
terminal proposition strength
semantic horizon skipped
avoided nodes/proof obligations per hit
avoided wall time per hit
check cost
false positives
false negatives where an independent oracle can identify missed certificates
```

For partial terminal certificates such as EXH/A10, measure the proof obligation they actually close. Do not credit them with erasing the entire exact-distance subtree unless the remaining outcome/distance question is also settled.
