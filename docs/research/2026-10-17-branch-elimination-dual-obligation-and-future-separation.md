# Refocusing Connect4: eliminate strategic obligations, not merely compile deeper diagrams

**Date:** 2026-10-17 Pacific. **Canonical research owner:** `research/semantic-quotient`.  
**Research direction:** Josh Oshiro. **Formalization/experiment:** OpenAI ChatGPT.  
**Status:** An exact finite response-obligation quotient with exhaustive generic and full legal small-board controls; two decisive counterexamples against extending its bounded equivalences to perfect-play WDL. An exact *conditional* future-dominance theorem is the next research target. **No unrestricted standard7x6 WDL result, universal branchless solver, game-theory authority promotion, or merge.**

## 1. Explicit research correction

The owner's primary OPEN objective is **elimination of independently expanded adaptive strategic branches**, returning *exact* P0-relative WIN/DRAW/LOSS **and the entire WDL-optimal legal move set, including all ties**. The ordinary owner-residual/cofactor/alternating-Bellman core is already mathematically complete and may branch recursively; its correctness should not be relitigated.

The historic chronological move7/move8 column-completion transition and its short-horizon defensive masks were already proved and physically checked. The recent action-QBF/BDD work produced meaningful bounded algebraic values but repeatedly optimized **construction of a representation of an unevaluated strategic problem**. That is a supporting line, not the central objective. Do not pursue another BDD order, CNF-gate GC, or bigger horizon as the default next action.

**Direct theorem target:** find source-state mathematical relations that discharge a *family of opponent responses* or *prove winning-region closure* without evaluating each successor game value. A subset of reply branches may be rejected only under a proof that preserves every adaptive `forall/exists` dependency, future terminal and legality guard, and the ability to reconstruct ALL tied best-move labels.

## 2. One-layer dual universal-obligation antichain

Let P(b,a) be an exact **fixed, guarded, finite-horizon** binary success relation: opponent P1 chooses legal labelled reply b, then claimant P0 may choose labelled response a. All P1 early wins, P0 early wins, draws, full-column legality, and continuation resources have ALREADY been incorporated by the existing qualified original-source residual response-cover law. Define both equivalent orientations:

    K_a = { b legal: P(b,a) },                 source-derived P0 action covers
    S_b = { a legal for b: P(b,a) }.         P1 universal obligation signatures

The first orientation `K_a` is already established in `2026-10-16-response-cover-next-quantifier-law.md`; producing it did **not** generate child q states or search future game histories. The second is its exact labelled incidence transpose.

Order universal reply obligations by **reverse difficulty**: b_h is at least as hard as b_e when `S_bh ⊆ S_be` (every successful P0 answer to the hard reply also answers the easier one for this ONE predicate). Deduplicate equal signatures but store ALL literal reply labels for transport; remove strictly easier signatures from the **universal proof obligation basis**. Call the resulting unique inclusion-minimal antichain `Min(S)`.

**Lemma DUAL-OBLIGATION, exact for any finite Boolean response matrix with legal pairs guarded:**

    forall b exists a P(b,a)
      iff forall S in Min(S) : S != empty.

    exists a forall b P(b,a)
      iff Intersection_(S in Min(S)) S != empty.

**Proof.** Every finite signature S contains an inclusion-minimal signature M⊆S; if the family is empty, take vacuous universal truth and the initial full candidate-action alphabet for its intersection (nonempty action alphabet). Thus S=empty occurs in the full family iff some minimal signature is empty. For the second formula, intersecting the full family is contained in the intersection of its subfamily of minimal signatures. Conversely, any action in all minimal signatures lies in any S because S contains a minimal M, so the intersections are equal. No existential/universal order was exchanged. Each original S_b remains stored in a label-transport array, allowing the exact binary bounded outcome of EVERY original P1 reply to be reconstructed; one representative cannot be reported as a uniquely best WDL move.

**Computation:** transposing source K uses at most W² bounded bit-incidence tests, inclusion-minimality checks use O(W²) subset comparisons with W-bit masks, and output uses at most W signatures; precise counts are recorded. The universal branch proof basis is compressed, but constructing source K is still required and remains charged. **This is measured proof-OBLIGATION reduction, not proven net source computation speedup or arbitrary-depth minimax elimination.**

## 3. Exhaustive generic and legal-position results

Frozen experiment: `research/isograph/discovery/2026-10-17-dual-obligation-quotient/DUAL_RESPONSE_OBLIGATION_PLAN_0_1.md`.
Producer: `dual-response-obligation.mjs`.
Independent relation falsifier: `dual-response-generic-control.mjs`.
Independent physical-source validator: `dual-response-legal-control.mjs`.
Machine data: `DUAL_RESPONSE_OBLIGATION_RESULTS_0_1.json`, all under that research directory.

**Every possible 4×4 Boolean action/reply matrix (65,536)** was tested under all **16 legal P1 reply masks**: **1,048,576 scoped quantifier controls**, zero value, label, antichain or dominance-witness mismatches. At full legal reply scope, original 262,144 reply obligations reduced to 120,558 minimal signatures (**54.01% fewer**). The generic matrix population is a mathematical falsifier, not a distribution of legal games.

**FULL physically legal first-win-stopped position censuses**, including independently reconstructed original q and previous source-only bounded response covers:

| Board | P1 source states (all) | Original reply obligations | Inclusion-minimal | Overall reduction |
|---|---:|---:|---:|---:|
| 4×3 Connect-3 | 2,208 | 5,592 | 2,546 | **54.47%** |
| 4×4 Connect-4 | 67,992 | 150,246 | 70,706 | **52.94%** |

Most of these states have a failing P0 bounded win certificate. The more relevant **positive** P0 fixed-horizon universal-coverage cases were:

| Board | Positive sources | Original necessary universal replies | Minimal replies | Reduction |
|---|---:|---:|---:|---:|
| 4×3 Connect-3 | 620 | 1,586 | 958 | **39.60%** |
| 4×4 Connect-4 | 3,694 | 8,088 | 6,408 | **20.77%** |

The maximum inclusion-minimal universal frontier was three on both legal small boards. The 4x3 producer performed 105,610 source residual membership queries plus 46,626 extra dual operations; the 4x4 producer performed 3,333,388 source membership queries plus 1,068,690 extra dual operations. **The dual quotient ADDED computation to each already-built source matrix**; its potential saving applies only if future expensive proof obligations can be discharged once per certified minimal representative. Claiming an end-to-end runtime improvement now would be false.

### Concrete original-source labelled results

Legal 4×3-c3 prefix `223` retains action covers `K=[0xe,0x4,0xe,0x7]` (zero-based action masks), and transposes to successful-P0-answer masks by one-based P1 reply:

    b=1: 0x8
    b=2: 0xd
    b=3: 0xf
    b=4: 0x5

Only the **hardest** universal obligations b=1 and b=4 remain as two incomparable minimal signatures. The original 4-way `forall b exists a` remains TRUE; `exists one a forall b` remains FALSE. Both outcomes preserve their original quantified meaning and all P1 reply labels.

For standard7x6 `44444`, all seven one-layer successful-P0-answer masks `S_b` are empty: the bounded predicate "P0 forces win by its second subsequent placement after P1 b" fails for each b. **The ONE minimal signature** groups labels {1,2,3,4,5,6,7}. This is exactly ONE **bounded Boolean obligation class**, **not** a WDL equivalence class, not proof seven P1 turn6 actions tie, and not proof of an unrestricted optimal move set.

## 4. A decisive natural cross-horizon falsifier

A mistake would be to lift these bounded reply-signature equivalences through the entire remaining game without proving future-context stability. We intentionally searched for a counterexample *after* constructing the source-only bounded signatures, then called the separately qualified **recursive exact-q full-game core as VALIDATOR ONLY**.

Frozen plan: `FUTURE_DOMINANCE_LIFT_FALSIFIER_PLAN_0_1.md`. Reproducer: `dual-response-future-value-falsifier.mjs`. Data: `DUAL_RESPONSE_HORIZON_LIFT_RESULTS_0_1.json`.

**4×3-c3 legal prefix `111`**, P1 to move at rank3:

    reply b=2 : bounded P0 successful-answer signature 0x0
    reply b=3 : bounded P0 successful-answer signature 0x0

But unrestricted exact P0-relative WDL after these two P1 moves is:

    V(b=2)=+1 (P0 eventually wins)
    V(b=3)= 0 (draw)

Neither reply wins immediately. Thus **equal bounded source-response signatures do NOT imply full strategic outcome equivalence**; P1 prefers b=3 (draw) to b=2 (P0 win). On the COMPLETE 4x3 P1-state census, **220 of 1,316 equal-signature reply pairs have DIFFERENT full WDL values**.

**4×4-c4** also has a legal witness `1111222234334` (P1 rank13): P1 choices 3 and 4 both have bounded signature 0x0, but exact P0-relative full WDL values are **−1 and 0**. Across all 67,992 P1 source states, **22,380 of 82,986 equal-signature reply pairs differ in unrestricted WDL**. These are full exhaustive small-board verifier checks, not probabilistic evidence. Exact-q validator evaluated 3,729 memo states/10,212 edges on 4x3 and 34,089 states/100,744 edges on 4x4. No full-game oracle labels entered the SOURCE dual quotient.

Across both full censuses, no *strict-inclusion* bounded signature pair was observed with the reversed full WDL ordering (0 of 3,226 strict comparable pairs on 4x3; 0 of 33,656 on 4x4). This is a limited observation, **NOT a theorem that strict bounded signature dominance universally orders full-game WDL**; differences could appear on other geometries or supports, and ties/three-valued WDL require separate guards.

This is especially important for the user's original `44444` question: reducing seven move6 alternatives to ONE short-horizon signature class is **not** the same as showing their future perfect-play WDL values equal.

## 5. Conditional full-horizon branch-elimination lemma — NEXT mathematical gate

Let the full future guarded Boolean source-payoff matrix be `P(b,a,z)`, where:
- b is the current opponent reply, a is a subsequent P0 action;
- z includes ALL later quantified action labels/choices in their original chronological alternating order;
- all action-code legality, first-win stopping, draws, mover, capacity and resource guards are **totalized on a shared z-domain**, even when their outcomes differ by b;
- the literal action alphabet is retained, including invalid actions neutralized by the correct quantifier-dependent Boolean constants.

**Lemma FUTURE-POINTWISE-DOMINANCE (sufficient, not necessary).** If for every a and every z,

    P(b_h,a,z) => P(b_e,a,z),

then for ANY fixed remaining quantifier prefix `Q_z`, with the same dependence/legality semantics in the two guarded branches,

    exists a Q_z P(b_h,a,z)
       => exists a Q_z P(b_e,a,z).

**Proof:** Each Boolean ∀ or ∃ is monotone under pointwise implication. Induct from the inner to outer quantifiers, then apply the monotone outer ∃ over a. Therefore b_h can replace b_e as the **harder** row for the current universal W/N threshold without independently solving b_e. No ∀/∃ order is swapped, no future policy is searched, and literal b_e remains available as a labelled potential tie.

For full P0-relative **WDL** rather than one binary threshold, require the implication separately for P0-WIN and P0-NONLOSS (or correctly guarded equivalent threshold pair), so `V(b_h) <= V(b_e)` pointwise after the full alternating prefix. That proves **weak action dominance**. To output EVERY WDL-optimal move for P1, weak domination is not enough to discard b_e from the *labelled best-move set*—it may tie b_h. A separate strict value or complete equality certificate is necessary. **Equality of the full future payoff functions** implies exact tie-equivalence and permits certified quotient transport; bounded `S_b` equality alone does not.

**Required constructive step, still OPEN:** find a source residual/capacity/terminal algebra that produces a SHORT, independently checkable certificate of the pointwise implication for entire future-context families, without expanding each z, building the full game QBF, or calling solved game-value oracles. Plausible relations include source-owner monotone-upset simulation under guarded future-chain transport and action-labelled response capacity. Ordinary raw support phase, finite bounded response masks, and symmetry-only G2 classes cannot be silently upgraded to full strategic equivalence.

The lemma defines a precise success criterion for a *branch-eliminating theorem*, not evidence that the required certificates exist cheaply for canonical `44444` or every legal Connect Four position.

## 6. Research selection and next experiment (priority hierarchy)

**Primary target, selected:** build an exact **future-stable source-response simulation** or fully guard-qualified pointwise cofactor implication certificate that can remove a universal reply BEFORE performing expensive downstream adaptive-choice quantification. Preserve all original literal reply labels and possible ties. Measure actual number of downstream quantified obligations NEVER constructed, not merely the size of the retained antichain.

**Supporting proven primitive:** the dual inclusion-minimal reply-signature antichain plus previously established P0 maximal response-mask antichain supplies correct bounded proof bases, and real legal small-game states show significant reply-cardinality reductions. This is a testbed for discovering future-stable dominance rules, not final exact WDL.

**Deprioritize:** additional generic BDD/QBF node ordering, dead-gate GC, building longer uncomputed formulas, or claiming one-layer equality is full-game equivalence. The source-owner ROBDD already reaches k11 and stays UNKNOWN; the present owner goal is NOT another horizon record.

**Mandatory next falsifiers:** `111` and `1111222234334` differing-full-WDL pairs, `223` noncommutation, `44444` early-transition safeguards, exact full-game 4x3/4x4 tied-optimal masks and original resources (60k nodes / 300k nontrivial Boolean operations / 10k supports / 15s per compile). Derive and freeze source-only implication law BEFORE any oracle-relative validation. A failed pointwise certificate is **incomplete**, not evidence that full branching is mathematically unavoidable.

**Current full-game standard7x6 `44444` outcome:** UNKNOWN `[-1,+1]`. All equally WDL-optimal move6/move7/move8 labels remain unproved. The recursive structural core and governing game-theory authority 1.2 remain unchanged; no merge.
