# Allis / incumbent evaluator / residual-win-space synthesis

**Date:** 2026-09-09  
**Status:** research synthesis only; maintained source and `main` unchanged.  
**Research lineage:** continues the exact residual-win-space work after forced macro-edge and support-compatible implication experiments.

## Sources considered

This note considers Victor Allis, *A Knowledge-based Approach of Connect-Four: The Game is Solved: White Wins* (M.Sc. thesis, Vrije Universiteit Amsterdam, 1988), including its nine strategic rules, rule-combination evaluator, conspiracy-number search, search tables, generalized/indifferent positions, symmetry, and search results.

It also re-reads the accepted Connect4 incumbent evaluator/search semantics in `components/incumbent/evaluator.mjs`, `components/incumbent/search.mjs`, and `docs/specs/C4-0002-incumbent-evaluator-v1.md`.

## Main conclusion

Allis should not be imported as a second expert-system architecture. A large fraction of the thesis describes structural facts that are already native, or nearly native, to the residual-win-space direction:

- potential winning groups -> residual minimal winning requirements;
- indifferent men -> historical token color can be discarded once it no longer participates in any surviving winning requirement, while occupancy/support provenance remains;
- search-table generalization -> semantic state identity rather than raw colored-board identity;
- symmetry -> residual automorphisms rather than only board reflection;
- forced tactical replies -> exact singleton/double-threat closure and forced macro-edges;
- search-table reuse -> exact/bound TT reuse over semantic identity;
- strategic rule application -> proof certificates that eliminate/refute sets of opponent residual requirements;
- conspiracy numbers -> proof-cost / disproof-cost guidance rather than ordinary static evaluation.

The highest-value path is therefore to compile useful Allis rules into the existing 625-ID residual substrate, not to recreate VICTOR's original adjacency-matrix evaluator.

## The nine Allis rules

The thesis formalizes:

1. Claimeven
2. Baseinverse
3. Vertical
4. Aftereven
5. Lowinverse
6. Highinverse
7. Baseclaim
8. Before
9. Specialbefore

They are not ordinary move preferences. Under their preconditions and compatible combination, they are proof rules showing that selected opponent potential winning groups cannot all be completed.

VICTOR's evaluator:

1. enumerates every applicable rule instance;
2. records which still-live opponent groups each instance solves;
3. builds incompatibility relations between rule instances;
4. searches for a mutually compatible subset whose solved-group union covers every opponent problem.

This is essentially a constrained set-cover / independent-set proof search. The thesis itself identifies this combination search as the evaluator bottleneck.

## Direct mapping to the 625-ID substrate

The residual representation already owns the object VICTOR calls a problem: an opponent winning group that can still be completed. Instead of 69 full four-cell groups, the current solver has a fixed 625-ID universe of minimal residual requirements of sizes 1..4.

For each exact strategic-rule instance we can precompute or cheaply derive:

- a 625-bit `solves` mask of opponent residual requirements certified impossible by the rule;
- a compact compatibility/conflict mask against other rule-instance classes or local resources;
- support/parity preconditions;
- optional transition consequences, such as unreachable cells above an Aftereven/Before event.

Then a VICTOR-style proof becomes a bitset-cover question over the current opponent antichain rather than a dynamic graph over board groups.

This should be tested incrementally, starting with the cheap local rules rather than all nine at once.

## Allis 'indifferent men' and current state identity

Allis observes that a played token whose color can no longer contribute to any possible winning group is semantically indifferent: its occupancy still matters because it supports higher pieces, but its color does not.

That is almost exactly the current residual-state hypothesis:

- `heights` retain physical occupancy/support history needed for legal future placement;
- residual requirement antichains retain the remaining win semantics;
- historical ownership outside those requirements disappears from the search identity.

This is independent historical support for the decision to stop treating the colored board as the ontology of search.

The residual representation is actually more aggressive than VICTOR's generalized-position table because it removes irrelevant color continuously and also canonicalizes the surviving winning obligations themselves.

## Search tables and residual TT policy

Allis stores positions whose game-theoretical value has been proved and generalizes them through indifferent men and board reflection. He deliberately distinguishes proved values from unclear evaluations.

This lines up with several current research results and candidates:

- exact/bound knowledge should be distinguished from mere hints;
- decision-state admission and forced macro-edges can keep deterministic transit states out of the TT;
- residual automorphisms generalize the thesis's ordinary mirror symmetry;
- support-compatible implication is a more general proof-reuse relation than exact table identity, although its current lookup cost is too high.

A useful design lesson is to preserve proof authority separately from ordering hints rather than treating every evaluated state as equally cache-worthy.

## Conspiracy numbers and proof-cost search

Allis's conspiracy-number search estimates how many unresolved leaves must change to prove one result or the other. He found it valuable when one proof path is narrow/forced, but too breadth-heavy when many branches look equally plausible. He then used conspiracy numbers as an oracle for depth-first search rather than relying on pure best-first growth.

This is highly relevant to the still-underqualified proof-cost ordering candidate.

Our residual representation has stronger, cheaper structural inputs than VICTOR had:

- number and cardinality of surviving requirements;
- earliest possible win bound;
- playable singleton threats;
- forced macro-chain length;
- residual automorphism/orbit count;
- support-event distance;
- one-sided exhaustion;
- potentially Allis-rule coverage count;
- incumbent evaluator tactical/parity signals.

Rather than recreate literal conspiracy numbers, test a proof-cost ordering / threshold policy driven by these quantities. Keep alpha-beta/TT as exact authority; use the proof-cost estimate only to choose which proof to attempt first.

## Incumbent evaluator crosswalk

The accepted incumbent evaluator already captures three pieces of knowledge strongly related to Allis.

### 1. Live winning-line field

For each player, every still-live geometric four-cell line contributes according to the number of owned tokens. This is already a weighted field over surviving winning groups rather than a piece-square score.

In residual terms this can be projected from requirement IDs and line provenance. It is a natural low-cost ordering signal.

### 2. Immediate tactical promotion

Immediately playable three-own/one-empty lines receive a lexicographically high tactical promotion. The incumbent search separately owns exact immediate win, opponent double-threat loss, and forced single-block handling.

The residual experiments independently rediscovered and then strengthened this into exact tactical closure + forced macro-edges. These mechanisms should therefore remain exact search structure, not merely evaluator features.

### 3. Future parity ownership

For unplayable three-own/one-empty targets, the evaluator computes gravity distance/parity and records single-parity or both-parity tactical classes. These are future ownership obligations, not ordinary fork counts.

This overlaps directly with Allis's odd/even threat and Zugzwang analysis.

Important limitation: the incumbent parity bits are accepted heuristic/horizon-coupled evaluator semantics. They are not by themselves exact proof certificates. They can be used safely for ordering immediately. Exact pruning requires lifting the same information into proven Allis-style rule preconditions and compatibility.

### 4. Root-relative asymmetry

The incumbent utility is `rootPlayerScore - 0.65 * opponentScore`; it is intentionally not antisymmetric. This should not be imported into exact proof bounds. It is still a potentially useful move-ordering score because search correctness remains owned by the exact solver.

## Candidate experiments created by this synthesis

### A. Incumbent-evaluator-guided exact move ordering

Highest-priority cheap experiment.

At decision states remaining after tactical closure / forced macro compression, compare:

- established fixed center-first order;
- incumbent packed player-score ordering;
- incumbent root-relative raw utility ordering;
- residualized equivalent using requirement IDs instead of reconstructing the board;
- hybrid ordering with earliest-win cardinality/support-event information.

Correctness is unchanged because ordering does not prune. Measure exact node count, TT behavior and wall time on the frozen and fresh non-tactical cohorts.

This is materially different from the already-negative 'opponent win structures destroyed' ordering test: the incumbent evaluator contains parity ownership, immediate tactical promotion and live-line density, not just one structural count.

### B. Local VICTOR proof certificates on residual requirements

Start with **Claimeven + Baseinverse + Vertical**. They are local, exact and comparatively cheap to instantiate.

Compile each instance into a 625-bit opponent-requirement coverage mask. Test:

1. single-rule exact exhaustion: can one rule instance eliminate all opponent residual requirements?
2. pairwise-compatible local cover using precomputed conflict masks;
3. bounded branch-and-bound cover for the remaining small set of uncovered requirements.

Only after these qualify should Aftereven/Lowinverse/Highinverse/Baseclaim/Before/Specialbefore be added.

Measure how often the rule system proves a one-sided bound or terminal result before normal search and what its net cost is.

### C. Proof-cost / conspiracy-inspired ordering

Do not reproduce VICTOR's breadth-first conspiracy tree. Use a bounded structural proof-cost estimate to select the next move/window/threshold inside the existing exact search.

Candidate features should include residual requirement cardinality histogram, earliest-win distance, forced-chain depth, rule-coverage deficit and incumbent evaluator parity class.

### D. Event-frontier versions of Aftereven and Before

Aftereven and Before are especially interesting for the proposed support-event representation. Their conclusion is essentially that completing one strategic event makes some later cells unreachable before game termination. That is naturally an event-frontier transition, not a board scan.

These rules may become much cheaper after the support-event representation exists, so they should remain candidates even if a board-oriented prototype is costly.

## What should not be done

- Do not replace the exact residual solver with VICTOR's original evaluator/search architecture.
- Do not treat the incumbent parity bits as exact pruning facts without proof preconditions.
- Do not recreate the original large adjacency matrix or hundreds-of-solutions graph if fixed requirement-ID masks can express the same relation.
- Do not assume all nine rules compose cheaply; the thesis itself found compatibility search to be the bottleneck.
- Do not promote conspiracy-number search wholesale; Allis documents its breadth failure mode.

## Recommended next tests

1. **Incumbent-evaluator-guided move ordering**, because it is cheap, safe, and directly tests the owner's existing evaluation knowledge inside the exact residual search.
2. **Claimeven + Baseinverse + Vertical residual proof certificates**, because they can produce exact proof reductions and fit naturally into the 625-ID representation.

Keep the remaining Allis rules, proof-cost ordering, and event-frontier synthesis in the active candidate queue.
