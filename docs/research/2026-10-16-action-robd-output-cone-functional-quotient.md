# Source-action canonical Boolean quotient: exact output-cone reduction and nine-ply lower threshold

**Date:** 2026-10-16 Pacific. **Research owner:** `research/semantic-quotient`.  
**Research direction:** Josh Oshiro. **Status:** Deductively exact output-cone and ROBDD-function-identity laws; independent small-game optimal-set/physical k8 controls; `44444` nine-ply LOWER only. Full unrestricted WDL and arbitrary-depth strategic branch elimination **OPEN**. No game-theory authority promotion or merge.

## 1. Clarify which transition this addresses

The **original chronological move-seven/move-eight column-completion transition** was already algebraically solved in `2026-10-16-column-completion-through-full-game.md`. Original source `44444` contains **five** pieces. Its next three historical moves are P1 move6, P0 move7 and P1 move8; exact short-horizon defensive eighth-move sets were already computed directly from source residuals, with all 324 histories independently checked. We are not rediscovering that local transition.

The present `k8` or `k9` means **eight or nine ADDITIONAL symbolic plies after `44444`**, ending on absolute move13 or 14. The open question is repeated *adaptive strategic choice composition*, not the support/cofactor state-transition mechanism.

The owner-directed primary objective remains exact WDL and the **complete set of all legal equally WDL-optimal actions**, without separately expanding every strategic continuation or hiding its expansion inside one symbolic object. The exact recursive residual-q core is already constructively complete and remains unchanged.

## 2. Exact deterministic source-output cone lemma

Fix a legal nonterminal source `q=(h,R0,R1)`, bounded future horizon k and one P0-relative threshold `z` in `Wlo,Nlo,Whi,Nhi`. The existing proven guarded source-action construction yields a Boolean straight-line DAG:

    g_i = A_i(g_<i, X) AND B_i(g_<i, X),

with negated edges, ordered binary action decision variables `X=(a0,...,ak-1)`, and an output literal `o_z`. Tseitin CNF represents every AND gate by a three-clause *bi-implication*, so each derived gate has **exactly one satisfying value** for a fixed assignment of its input choices. All P0 existential and P1 universal action quantifier blocks stay in the original chronological prefix.

Define `Anc(o_z)` as the set of source gates reachable **backward** through defining operands from the selected output literal. Delete EVERY gate definition and deterministic auxiliary variable outside that set. Also remove their references from source gate last-use/liveness calculations; retain all quantified ACTION variables and all action labels.

**Lemma OUT-CONE (general exact projection).** For every assignment to action decision variables X, the reduced output cone computes exactly the same `o_z(X)`. The original and reduced quantified threshold formulas therefore have identical truth for every legal fixed-first-action label, under the same alternating game quantifiers.

**Proof:** Induct on gate source IDs in `Anc(o_z)`. Its primary action literals are unchanged. Each required derived AND gate receives exactly the same predecessor Boolean functions, and thus its output is identical. No omitted gate reaches `o_z`; its definitional Tseitin clauses only constrain its own deterministic value, so each omitted gate admits one existential extension for every fixed input X and imposes no additional condition on `o_z`. This remains true when deterministic auxiliaries were safely quantified after their transitive last input stage, as established by the existing source-QBF theorem. Hence removing those definitions preserves the output matrix pointwise, and applying the original ∀/∃ action prefix preserves quantified truth. In particular, `forall b exists a` is never replaced with `exists a forall b`. First-win, draw, full-column legality and invalid-code guards affecting `o_z` are all INSIDE its ancestor cone and remain unchanged.

The cone is discoverable from the defining DAG by at most `O(G+E)` gate/operand visits, given the already constructed source formula. **This polynomial cone slicing is NOT a polynomial arbitrary-depth QBF decision theorem:** computing the remaining Boolean functions may require exponentially large diagrams.

## 3. Canonical Boolean-function quotient and quantified first-action vector

For a FIXED order `π` of source action decision bits, use a reduced ordered BDD with complemented edges and normalized `(π-variable,low-cofactor,high-cofactor)` entries. Identical reachable node IDs (with the same complement sign) denote identical **Boolean functions** of the still-free input variables. Conversely, ordinary reduced ordered BDD canonicity identifies any identical Boolean function, for that fixed π. This is a true *future-function* quotient, stronger than syntactic AND/NOT hash-consing, not merely equality of move histories or equal near-term scalar values.

Construct the selected `o_z(X)` BDD from original source-guarded gate identities, retaining only source gate BDD handles whose future definitional use count is nonzero. An exact stable-handle mark/sweep makes BDD slots reusable and rebuilds the unique table from live roots; no copy of a second BDD is required. This preserves every live root by graph reachability and the unchanged Shannon triples, clears caches before slot reuse, and tracks freed slots, marking, sweep work and source gate liveness separately.

To calculate all first actions simultaneously, leave the first action bits `a0` FREE and quantify inner future blocks in the exact reverse-of-prefix evaluation order:

    G_z(a0) = Q1 a1 ... Q_(k-1) a_(k-1) o_z(a0,...,a_(k-1)).

Each quantified variable is abstracted by its Shannon OR/AND over cofactors without commuting opposite-player blocks. Evaluate `G_z(c)` for every literal legal column c; the four `z` outputs give each action interval. When all four threshold bits close for every action, recover exact WDL and **every** tied best move as proved in the earlier one-pass first-action projection theorem.

**Critical distinction:** This eliminates redundant independent root-action evaluations and merges exact identical Boolean subfunctions. A ROBDD still has Shannon branches and could expand exponentially with source horizon or chosen ordering. It does NOT by construction satisfy the strongest general branch-elimination objective.

## 4. Correctness falsifiers actually executed

**Frozen experiment plans** (before algorithm switch) under `research/isograph/discovery/2026-10-16-algorithmic-core/`:

- `ACTION_ROBDD_FUSED_ABSTRACTION_PLAN_0_1.md`
- `ACTION_ROBDD_LIVE_COMPACTION_PLAN_0_1.md`
- `ACTION_ROBDD_STREAMED_COMPILATION_PLAN_0_1.md`
- `ACTION_ROBDD_ORDER_WIDTH_PLAN_0_1.md`
- `ACTION_ROBDD_INPLACE_SWEEP_PLAN_0_1.md`
- `ACTION_QBF_OUTPUT_CONE_PLAN_0_1.md`.

**Current candidate:** `action-robd-output-cone.mjs`. Physical control: `action-robd-output-cone-physical-control.mjs`. Separate independent physical first-win/alternating bounded interval validator: `action-robd-independent-physical-interval-control.mjs`. Generic relation / quantified dependency control: `action-robd-quantifier-order-control.mjs`. Git blob SHA identities and exact numerical records are frozen in `ACTION_ROBDD_OUTPUT_CONE_RESULTS_0_1.json`.

Executed by the local tools' isolated JavaScript V8 environment directly from freshly fetched committed sources (NOT maintained Node26 or an independent external solver).

| Test | Passed |
|---|---:|
| Source+horizon controls from 4x3-c3, 4x4-c4, 7x6-c4 | 47 / 47 |
| Shared projected WIN/NONLOSS threshold calls | 188 / 188 |
| Physically independent per-literal action thresholds | 672 / 672 |
| Complete-game small-board WDL + entire optimal move sets | **24 / 24** |
| Those with singleton optimal moves | 13 |
| Those with multiple tied best moves | 11 |
| Independent physical bounded 7x6 `44444` future k7 | **601,092** physical transitions, all seven [-1,+1] |
| Independent physical bounded 7x6 `44444` future k8 | **3,567,031** physical transitions, all seven [-1,+1] |
| Legal 4x3-c3 `223` action/reply masks | `[0xe,0x4,0xe,0x7]` |
| `forall reply exists adaptive action` vs `exists one action forall replies` | TRUE vs FALSE, both BDD variable orders |
| All reported physical value/action and quantified-order mismatches | **0** |

The physically searched move transitions are ONLY the **validator**, never an input to the BDD or its formula compiler. Tied best-move correctness is not inferred from short-horizon bounds: the complete 24 small-board suffixes run to full game termination.

## 5. Main measured work and true width limits

**Per-run strict envelope:** 60,000 retained BDD slots, 300,000 nontrivial Boolean APPLY/quantifier operations, 10,000 support representatives, 15 seconds. Source-QBF work, ancestor-gate scans, marker/sweep scans, reference move checks and JS allocations are separately accounted, not called free.

| `44444` horizon | Threshold | Source ancestor gates / total | BDD Boolean ops | Peak BDD slots | Result |
|---|---|---:|---:|---:|---|
| k7 | Wlo/Nlo, reverse order | 1,054 / 1,405 | **10,196** | 5,176 | FALSE, all 7 |
| k7 | Whi/Nhi, reverse order | 1,235 / 1,405 | **21,874** | 10,819 | TRUE, all 7 |
| k8 | Wlo/Nlo, chronological | 1,592 / 1,778 | **75,392** | 19,354 | FALSE, all 7 |
| k8 | Whi/Nhi, chronological | 1,387 / 1,778 | **40,220** | 15,988 | TRUE, all 7 |
| **k9** | **Wlo/Nlo, chronological** | **1,744 / 2,133** | **121,999** | **39,142** | **FALSE, all 7** |
| k9 | Whi/Nhi, chronological | 1,931 / 2,133 | 134,232 at stop | 60,000 | **INCOMPLETE during compilation** |

Original source QBF construction at k7, k8, k9 used 7,490, 9,090, 10,612 counted source Boolean operations respectively, in addition to the BDD numbers above. k9 lower output-ancestor discovery examined 3,489 gate IDs/operand visits and excluded **389 deterministic source definitions**. Its in-place GC also made 189,114 mark visits, 869,718 slot-sweep checks, and reclaimed 97,093 dead slots across cycles (the same slots can be reclaimed repeatedly). **These GC scans are real work beyond the 121,999 BDD Boolean operations.**

The bounded k9 lower value FALSE for every legal P1 first action agrees with the previously qualified, independently constructed **source-owner reflected ROBDD at k9**, whose action intervals are all [-1,+1]. It does not require an additional search-generated winning policy. The upper action QBF output-cone compiler still hits 60,000 nodes BEFORE quantifier elimination, under all eight predeclared static action-bit orders. The k10 tested action-bit variants are likewise incomplete.

Therefore the new candidate is stronger than the earlier action-bit AND/NOT QBF projector at k8 (which had exhausted its lower node cap), and k9 lower now completes; **it does NOT surpass the established source-owner reflected BDD k11 bounded-horizon frontier**. It also does not decide unrestricted `44444` WDL, nor prove all move6 or later move8 actions globally equivalent.

## 6. New conclusion and next mathematical requirement

**Established:** Exact output-cone dependency deletion, canonical shared Boolean future-cofactor functions, safe live/last-use ROBDD memory semantics, original adaptive action-prefix quantification, exact complete tied-optimal masks on small full-game suffix controls, and a k9 **lower-bound** source action-vector calculation under unchanged limits.

**Negative/remaining:** The k9 UPPER-threshold Boolean interface still expands beyond 60k BDD slots *during deterministic source output-cone compilation*, even though the output cone excludes 202 irrelevant gates out of 2,133. Eight static variable orderings fail this stage; no exact lower-bound witness establishes a minimum width of 60k. All available bounded results after `44444` still leave unrestricted root and literal best-move set UNKNOWN.

**Next meaningful research:** Avoid compiling the entire guard-complete output Boolean function before applying the original alternating quantifier dependencies. Seek a *quantifier-aware structured/factorized interface* that can perform exact local aggregation while constructing the source formula, rather than materializing the entire source-BDD intermediate. Quantifier localization and sound conditional-separator rules must retain first win, legal gravity capacity, alternate P0/P1 response scopes, action transport and all equally best moves. Test source only, then falsify on the existing 223 counterexample and complete small-game suffix controls. An explicit semantic cofactor-width lower bound would also be valuable, but allocator exhaustion is not one.

**No new game-theory semantic authority, production solver, merge, or unqualified perfect-play best move was published.**
