# Candidate classification of all fixed universal immediate-mate pairings on 7×6 gravity columns

**Date:** 2026-10-17 Pacific. **Status:** CANDIDATE DEDUCTIVE NORMAL-FORM COMPLETENESS PROOF, frozen before new 7×6 exhaustive certificate enumeration. **Research owner:** research/semantic-quotient. **Owner objective:** exact unrestricted (V,M*) with ZERO strategic branching. Parameters W,H,K remain symbolic, but physical control is ONLY standard W=7,H=6,K=4.

## Question

The currently qualified *co-release pairing* normal form covers a useful sufficient family of fixed defender response certificates. Is its "disjoint two-column cross-prefix then even vertical tails" structure also NECESSARY for the narrow class of **perfect FIXED-MATE strategies**, where:

1. Every remaining future gravity cell is in exactly one static pair M;
2. the attacker can play any gravity-legal first-touch of an unfinished pair;
3. the defender always immediately responds with the other member of THAT same fixed pair, whose gravity legality must be guaranteed after every reachable prefix consisting of completely consumed pairs;
4. no exceptional passes, delayed mate responses, alternate conditional strategy, own counter-winning shortcut or first-win earlier stopping is required to keep the certificate valid;
5. the defender moves second; after every complete pair, the attacker moves next.

This is a *restricted strategy class*, not ALL defender strategies. No future game WDL or opponent strategic alternatives enter its source proof construction.

## Candidate completeness theorem and exact guards

Under the above universal fixed-mate semantics, every pair is either:

- **vertical:** two consecutive remaining cells in one column, lower/upper; or
- **cross:** two cells in DIFFERENT columns at the same remaining relative ordinal j, belonging to a shared cross-prefix of these SAME two source columns.

Each two-column block starts with a cross pair at relative ordinal 0; successive cross pairs must pair the immediate successors at relative ordinals 1,2,... in the SAME two columns. At an optional ordinal t, cross-pairing may terminate simultaneously and each column's remaining upper tail must be paired vertically in consecutive pairs, requiring (H-h_c-t), (H-h_d-t) even. Other columns can be vertical-only (requiring even remaining length). Thus every such source-perfect matching is within the formerly only SUFFICIENT block family with t>=1, t<=min(m_c,m_d), t≡m_c≡m_d (mod2).

**Necessity sketch to verify/strengthen:**
- Same-column mate cells cannot be nonconsecutive: after first touching the lower, any intervening unfilled cell still blocks the higher.
- For two cross-column cells x,y to be safe as immediate mates, either both are SOURCE playable or their distinct same-column predecessor events x-,y- must belong to the SAME already-completed pair. Otherwise whichever predecessor-pair can finish first makes exactly one of x,y playable; the attacker can immediately first-touch it, and the other remains gravity-illegal. A putative pair-level dependence forcing both distinct predecessors always complete together would require a cycle or same-pair identity, as fixed pairs complete one at a time. Explicitly require the strategy to be live/reachable under arbitrary attacker first touches, so cycles/deadlocks cannot vacuously qualify.
- Inducting backwards along cross predecessor-pairs forces the first pair to be the two source-playable cells and every later pair to use the SAME two source columns and same relative ordinal. Crossing after a vertical pair cannot arise.
- A column cannot belong to two different cross-paired column groups; after a cross-prefix the unused vertical tails must pair internally, each with even length. This yields the block partition precisely.

**Sufficiency** was already proved by co-release immediate response and first-win pair blocker semantics, assuming a perfect matching and every attacking original residual G contains BOTH cells of at least one pair.

**Claim-strength limit:** if a defended player cannot find such a pairing, it does NOT mean they cannot prevent the opponent winning, even by nonfixed/adaptive response strategies. The perfect-mate strategy may be needlessly restrictive. Nor does this prove full game root WDL, all optimal labels or equivalence of first moves.

## Frozen true-board falsification and independent source experiment

Before any claim of normal-form necessity, seek a counterexample in a SOURCE-matched perfect pairing with universal immediate-playability that cannot be written in the block normal form; a discovered counterexample disproves completeness.

On the ACTUAL 7×6 canonical legal history 44444 with P1 at move6, for each of all seven legal P1 first moves:

- build exact original 69-line residual requirement antichain for P0, preserving gravity and first-win stopping;
- construct every non-overlapping block matching of the normal form over the remaining 36 future cells after P1 moves;
- for each matching, independently check 36 future cells are covered by exactly 18 disjoint pairs; vertical/cross-release shape exact;
- check all source P0 residual generators for containment of at least one FULL mate pair;
- record matching count, maximum number of P0 residual requirements covered, uncovered witness generator(s), and whether any complete no-win proof succeeds;
- source enumeration of static certifying **matchings only** is allowed; no separate game-future values, histories, solved policies, alternate strategic games or oracle calls.

Known previous co-release restricted-family negative was "no certificate" for any of the seven literal moves. The new mathematical value, if established, is to EXCLUDE the **ENTIRE universal perfect fixed-mate strategy class**, not merely the previously treated example normal form. This is a class impossibility, NOT a game-theory loss or a 7×6 optimal-move decision.

Target subsequent math: nonperfect, guarded, first-win-aware **adaptive response resources across overlapping original winning lines**, not more enumeration of fixed perfect mates. Preserve ZERO strategic fanout or return INCOMPLETE.

## Subsequent frozen-source 7×6 controls (executed after this candidate was committed)

**Full six-ply canonical reply controls:** An independently written geometry-source enumerator generated actual W=7,H=6,K=4 original residual P0 requirements after each legal history 44444c, c=1..7, and enumerated every matching in the block normal form over the exact remaining 36 gravity events. Exact committed source:

    research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-perfect-fixed-mate-exhaustive.mjs

All **1,852** full-board static matchings (166 for each noncenter P1 response; 856 for center) were checked. **Zero** cover every remaining P0 residual requirement. Best residual coverage counts by c=1..7 are [20/46,19/44,18/44,22/42,18/44,19/44,20/46], leaving respectively [26,25,26,20,26,25,26] uncovered in the best matching. Source includes no game continuation evaluations. Machine evidence:

    research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/STANDARD7X6_PERFECT_FIXED_MATE_CANONICAL_RESULTS_0_1.json

**Separate release-order falsifier:** To challenge the completeness argument without changing board geometry, a different executable enumerated **ALL** perfect 2-cell matchings and all attacker first-touch orders on **4,116 actual 7×6 gravity height profiles with 2,4,6,8 remaining events**, i.e. suffixes of the same standard board. It examined **324,688** perfect matchings and **1,240,093** attacker-order validation calls. Exactly **10,675** matchings were legal under every tested first-touch order; the derived fixed-mate normal form generated exactly the same 10,675, with **zero** counterexample in either direction. Sources:

    research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-fixed-mate-release-order-falsifier.mjs
    research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/STANDARD7X6_FIXED_MATE_RELEASE_ORDER_RESULTS_0_1.json

**Research conclusion under narrowly explicit guards:** The analytic source normal-form necessity argument, together with this distinct negative canonical and positive suffix-order falsification, supports the scoped result that the universally playable *fixed perfect immediate-mate* strategy class is exactly the existing co-release column-block class and **offers no complete P0 no-win certificate after ANY of P1's seven 44444 replies**. It does not rule out adaptive/nonperfect strategies, defender counter-winning strategies, conditional certificates, or any WDL/complete M* result. Explicit original-line/first-win guards remain.

**Qualification limit:** Standalone Node22 physical/static research controls (not maintained Node26 CI or externally formal proof-assistant qualified); no promotion of IsoGraph 1.2. Only validation/proof checking enumerates attacker order alternatives. The source certificate producer never values more than zero strategic future games. No full unrestricted standard Connect4 solution was found.

**New mathematical research direction:** Stop revisiting perfect static mate pairings; investigate source-time-adaptive *cross-line blocker/resource obligation closure*, including shared simultaneous blockers, forced reply timing, defender counter-win precedence, and genuine universal quantification, without hidden enumeration of entire strategy variants or inequivalent game successors.
