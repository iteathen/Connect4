# Canonical claim ledger

This is the human-readable companion to the machine registry rooted at `CLAIM_INDEX.json`. It is intentionally conservative. The source archive contains substantially more material than has been normalized here; unreviewed material remains `untriaged` rather than being silently promoted.

## Structural foundation and frontier semantics

### C4-R0001 — winning structures are first-class research objects
**Status:** `research_model`. Connect4 can be represented and reasoned about through possible winning structures and their relations in addition to ordinary board-state/game-tree representation.

### C4-R0002 — Connect-k line geometry has exact derivative structure
**Status:** `deductive_exact`. Directional winning-line counts and finite differences have exactly derivable interior/boundary structure. Exact geometry must not be conflated with semantic sufficiency.

### C4-R0003 — playable own singleton gives an immediate terminal win
**Status:** `guarded_exact`. A legal playable cell completing an unblocked current-player singleton residual produces a terminal win one physical ply later.

### C4-R0004 — multiple distinct opponent immediate completions force loss
**Status:** `guarded_exact`. At least two **distinct legal playable completion cells** for the opponent force loss when the current player has no earlier terminal win. Multiple line references to one completion cell do not satisfy the guard.

### C4-R0005 — a unique opponent immediate completion forces the reply, not the result
**Status:** `guarded_exact`. One immediate opponent completion forces the blocking move but does not by itself determine final game value.

### C4-R0006 — exact structural certificates precede heuristic horizon evaluation
**Status:** `accepted_contract`. Exact consequences are consumed before heuristic horizon evaluation.

### C4-R0007 — unresolved residue remains solver work
**Status:** `accepted_contract`. States not decided by accepted certificates/reductions remain unresolved; they are delegated rather than mislabeled solved.

### C4-R0008 — quotient reductions require behavior preservation
**Status:** `accepted_contract`. A quotient may erase distinctions only under an explicit equivalence preserving the target behavior.

### C4-R0009 — dead residual win-space implies exact draw
**Status:** `guarded_exact`. In a legal nonterminal state, if neither player retains an unblocked residual winning line, neither can later win and the game value is draw.

### C4-R0010 — measured hot-state maintenance for dead residuals is not currently justified
**Status:** `empirically_supported`, disposition `deferred`. The tested live-counter detector paid transition/runtime cost with effectively no useful pruning incidence in the measured campaign. This does not weaken C4-R0009.

### C4-R0011 — a complete predicate calculus still lacks composition/closure laws
**Status:** `missing_law`. Exact local predicates are not yet a complete derivation system. Composition across intersections, reachability, timing, ownership, response capacity and local certificates remains the central gap.

### C4-R0012 — higher derivative / periodic-annihilator structure may yield semantic predicates
**Status:** `candidate_rule`. Exact geometric derivatives motivate higher-order semantic classifications, but game-theoretic closure remains unproved.

### C4-R0013 — perfect-play win-set support/DAG is an active structural experiment family
**Status:** `hypothesis`. The support/DAG program investigates whether initial-board structure can determine reachable winning-space quantities without ordinary recursive search; numerical generalizations remain individually scoped.

## Timing, residual win-space, dependency closure and BSFP

### C4-R0014 — CPC event-rank parity arithmetic
**Status:** `guarded_exact`. Under the documented support/event model, `N(t)=(W-1)H-ply+r+1`; target-column height cancels. Standard 7x6 gives the documented row/parity simplification.

### C4-R0015 — WSL-625 residual-requirement universe
**Status:** `deductive_exact`. The 69 standard 7x6 winning lines induce 625 unique nonempty residual requirement masks under the documented construction.

### C4-R0016 — generic blocker upward closure reproduces tested Allis solved-group semantics
**Status:** `empirically_supported`. 331,955 generated A1-A9 instances showed zero solved-group mismatches against the cited named Solutions predicates. Scope is the generated corpus; this is neither a universal compatibility proof nor a priority claim.

### C4-R0017 — race-free nested ownership inference is unsound
**Status:** `disproven`. Eventual ownership/blocker satisfaction alone is insufficient: the opponent may win first. Temporal precedence is mandatory.

### C4-R0018 — Nested Dependency Closure with temporal precedence may replace explicit move-tree proof
**Status:** `hypothesis`. A recursive proof grammar over ownership, support, response obligations, blockers and timing may derive long-horizon consequences without enumerating every intervening state.

### C4-R0019 — tested WDL proofs are dramatically smaller than their physical state graphs
**Status:** `empirically_supported`. The cited controls produced proof DAGs of 9, 17, 16, 21 and 38 nodes despite much larger physical graphs. This demonstrates tested proof compression, not a universal size bound.

### C4-R0020 — direct BSFP matches exhaustive small-game WDL controls
**Status:** `empirically_supported`. BSFP matched 1,681,808 physical states and 3,869,237 legal edges in four complete controls with zero WDL disagreements and returned the correct sign on eight cited frozen 7x6 roots.

### C4-R0021 — terminal winning-line boundary independently qualified on complete controls
**Status:** `empirically_supported`. Independent checks covered 1,634,924 nonterminal states, 3,869,237 edges, 414,691 winning terminal edges and 96,960 full-board draws with zero reported boundary mismatches.

### C4-R0022 — generic raw-ownership BSFP representation does not yet scale to empty standard 7x6
**Status:** `empirically_supported`. Empty standard 7x6 has not completed in the raw-ownership symbolic representation; current evidence points to representation width rather than falsifying the qualified recurrence.

## Semantic quotient and recursive qualification

### C4-R0023 — identified-line quotient is exact on tested complete controls
**Status:** `empirically_supported`. `Q=(support,H0,H1)` matched tested physical terminal, transition, action and WDL behavior on the bounded complete controls.

### C4-R0024 — behavioral minimization removes support/rank distinctions on the tested quotient
**Status:** `empirically_supported`. MQ2 reduced 420,704 identified-line classes to 269,347 behavioral classes, including classes crossing support/rank boundaries.

### C4-R0025 — residual antichains require support/accessibility in the tested exact quotient
**Status:** `empirically_supported`. Residual antichains plus support passed bounded controls; support-free residuals failed.

### C4-R0026 — direct semantic residual automaton replay is exact on bounded controls
**Status:** `empirically_supported`. The strengthened materialize/serialize/decode/replay qualifier traversed actual encoded transitions and reported zero state/action/rank/orphan mismatches on the bounded controls.

### C4-R0027 — MQ5 semantic residual state reduces exact proof volume on frozen anchors
**Status:** `empirically_supported`. Exact scores were preserved while proof nodes fell about 22.48% on the loss anchor and 21.34% on the win anchor versus the cited strong board-state control.

### C4-R0028 — typed exact MQ5 interning preserves semantic identity and improves measured runtime
**Status:** `empirically_supported`. `MQ5-TYPED-OPENADDR-V1` preserved exact score/proof/state/cache metrics with full-record equality as authority; repeated medians were about 1.493x and 1.571x faster than the cited Map/BigInt form.

## Strategic certificates and compatibility

### C4-R0029 — role-general A1-A3/U1 certificates qualify on tested exact controls
**Status:** `empirically_supported`. Event-rank checks reported zero owner/rank/delta mismatches across 2,750 states, 61,416 targets and 798,408 deltas; role-general A1/A3 + Baseinverse then produced zero false claims on 96 cited exact roots.

### C4-R0030 — geometry-native A123 substantially reduces MQ5 proof volume on frozen anchors
**Status:** `empirically_supported`. A123 reduced 786,581 → 557,605 nodes on the loss anchor and 4,138,812 → 3,161,623 on the win anchor while preserving exact results; runtime effect was workload-dependent.

### C4-R0031 — blanket resource-overlap exclusion is too strict for Allis compatibility
**Status:** `disproven`. U1 Test B V2 produced 10,938 false negatives among 695,232 comparisons against the cited compatibility authority.

### C4-R0032 — generic interval compatibility matches the Allis allowed set but extra pairs remain unproved
**Status:** `candidate_rule`. V3 accepted all 359,512 table-allowed pairs with zero false negatives and also 82,367 additional pairs that are diagnostic only, not proof authority.

### C4-R0033 — ZPAR singleton-pair rule is only narrowly qualified
**Status:** `empirically_supported`. The strict singleton-pair form matched 112 cited exact states; it is not a general Zugzwang terminalizer and `WO_BO_diff` remains unresolved.

### C4-R0034 — support-compatible implication transfer is proof-positive but runtime-negative in tested forms
**Status:** `empirically_supported`, disposition `deferred`. Exact RID closure reproduced proof reduction; SIG4/INDEX8 reduced comparison work but remained slower than no-IMPL. The mechanism is not falsified.

### C4-R0035 — research evidence must separate mechanism, form, workload, order, synergy and adoption
**Status:** `accepted_contract`. Negative evidence is scoped to what was actually tested; missing interaction edges are unassessed, not neutral; invalid harnesses are not parent-mechanism evidence; adoption metadata must not bias epistemic assessment.

### C4-R0036 — typed MQ5 and geometry-native A123 compose without losing qualified proof-volume reduction
**Status:** `empirically_supported`. On the two frozen exact-distance anchors, the joint typed-MQ5+A123 solver preserved exact scores and reproduced the full A123 node counts: 557,605 and 3,161,623. Full A123 was ~6.1% faster than typed base on the loss anchor and ~6.2% slower on the win anchor, so runtime benefit is not universal.

### C4-R0037 — tested legacy/even-ply A9 responder orientation is unsound
**Status:** `disproven`. The sampled conservative A1-A9/A10 composition produced three false no-win claims and every false claim depended on the tested A9 generator/orientation. Disabling A9 removed all observed false claims. This does **not** falsify Allis's published A9 rule family generally.

### C4-R0038 — A4 and A8 add sampled exact cover beyond A123 while A6 is saturated in the A9-disabled regime
**Status:** `empirically_supported`. With the falsified A9 orientation disabled, the same corpus produced 84 oracle-confirmed claims versus 49 A123 claims, or 35 additional claims with zero false positives. Removing A8 reduced the additional count to 22, removing A4 to 28, removing A6 changed nothing, and removing both A4+A8 reduced it to 10. The interaction is non-additive and the A6 result is regime-specific.

## BSFP representation, boundary algebra, and scaling

### C4-R0039 — ownership-antichain BSFP is smaller and faster than raw-ownership MTBDD on measured complete controls
**Status:** `empirically_supported`. Across the cited 4x3, 4x4, 5x3 and 4x5 complete controls, the ownership-antichain representation reduced symbolic record count by 40.0–86.6% and measured median wall time by 1.220–3.041x versus the maintained MTBDD reference. This is geometry-dependent performance evidence, not a universal theorem.

### C4-R0040 — root-only WDL BSFP admits exact rolling two-rank execution
**Status:** `guarded_exact`. Under the one-move WDL recurrence, rank r depends only on completed rank r+1. If only the root is required, older ranks can be discarded after the current rank closes, provided no auxiliary semantic rule depends on discarded state.

### C4-R0041 — streaming no-sort BigInt dominance reducer is rejected in its tested form
**Status:** `rejected`. It preserved exact semantics but regressed 5x5 to 73.806 s versus 62.486 s for the first rolling ordered form and 58.326 s for the retained reference. This rejects the implementation form, not antichain/dominance reasoning.

### C4-R0042 — line-hit product antichains exactly represent tested BSFP symbolic Win/Loss boundaries
**Status:** `empirically_supported`. With `Q=(support,H0,H1)` and the P0-favorable product order, minimal Win and maximal Loss line-hit pairs reproduced every tested symbolic classification with zero quotient conflicts, false coverage or missing coverage. Complete-control boundary reductions ranged from 4.73% to 43.73%; bounded hot-support reductions reached 51.14% and 63.94% on the cited 4x5 and 5x4 samples.

### C4-R0043 — direct line-product recurrence requires a realizability-preserving closure law
**Status:** `missing_law`. The line-hit product cannot simply admit arbitrary `(H0,H1)` pairs because both masks are correlated by support-local ownership realizability. A compact recurrence must preserve that image while supporting move preimages, terminal subtraction and existential/universal move composition.

### C4-R0044 — residual-pair cofactor work can be exactly reused across crossing occurrences on tested OQS fixtures
**Status:** `empirically_supported`. The qualified OQS slice reused each residual-pair/input cofactor across crossing occurrences with zero mismatches and complete target coverage on all ten 4x4 cuts and the selected 7x6 cut-five fixture. On that 7x6 fixture, factored arrays were 54.384x smaller and median submit/wait 7.904x lower, while tiny 4x4 did not show a speed benefit.

### C4-R0045 — measured BSFP scaling wall is compute/frontier manipulation before retained-memory exhaustion
**Status:** `empirically_supported`. The cited larger CPU controls timed out far below heap/memory capacity, and the packed CUDA 6x5 wall appeared in high-rank work before the support-count peak. This scopes the measured implementation bottleneck to candidate/frontier/normalization work rather than proving a mathematical complexity result.

### C4-R0046 — terminal subtraction has an exact antichain frontier form
**Status:** `deductive_exact`. In a finite subset universe, the complement of the upward family generated by requirement `q` is a downward family with maximal caps `U\\{x}` for `x∈q`; the dual complement of a downward cap is generated by singleton elements outside that cap. Exact antichain intersection therefore implements terminal subtraction without enumerating represented states.

## How to extend this ledger

Do not add a new number for prose duplication. Reuse an existing claim when meaning and guards are equivalent. Create a new claim when the proposition, guard, semantic target, or evidence model is materially different. Add the machine entry to a shard listed by `CLAIM_INDEX.json`, then update this ledger and the relevant logic/solver maps in the same change.
