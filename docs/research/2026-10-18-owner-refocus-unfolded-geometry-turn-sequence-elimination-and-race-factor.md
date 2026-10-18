# Owner refocus: unfolded geometric interval algebra first, eliminate the turn sequence second

**Date:** 2026-10-18. **Durable owner:** `research/semantic-quotient`. **Status:** exact fixed-schedule factorization theorem, new SOURCE-ONLY sufficient temporal-elimination guard, and FROZEN falsification protocol; the perfect-play Level 2 zero-strategic-branching operator is **OPEN**. Qualified Connect4 game-theory authority remains IsoGraph 1.2. Do not merge solver branches or promote this research note as qualified game authority.

## 1. New owner priority over the first-touch campaign

The first-touch/shared-blocker program proves restricted sufficient winner-exclusion conditions and may continue as a *secondary* source of guarded certificates. It is not the primary candidate for the ultimate arbitrary-original-7x6 Level 2 formula. The owner redirects mathematical effort to **unfolding original geometry, then FACTORING OUT the order/interleaving of turns** without losing exact two-player alternating control, original first-win stopping, or the ability to select ONE provably best original literal action. Never replace the target with a smaller negamax tree, an oracle label, strategy expansion hidden in QBF/BDD, or full-word enumeration.

Already exact and independently controlled:
- four geometry ribbons: 37 strands, 168 occurrences linked to 42 physical cells by four-way equality, 69 original winning K-intervals, 204 slots with separators;
- remaining gravity events: a union of W disjoint ascending column chains; legal complete hypothetical futures are their linear extensions (column shuffles);
- for event e=(c,r) placed at relative rank t(e), owner parity `χ(e)=(n+t(e)-1) mod 2` (equivalently source row parity XOR column phase κ XOR cross-column shuffle parity β);
- `44444`: 36 noncenter events plus one center marker; shifting marker rank through a fixed noncenter word flips exactly a contiguous interval of event-owner phases, with the center bit flipping according to shift parity;
- left/right shuffles AFTER center fills still share one clock and 12 original residual bridges per player (24 total);
- actual fixed-schedule first-win is nonlinear in χ because original winning requirements are conjunctive and two players can race; independent GF(2) second derivatives are nonzero, and same final χ can yield distinct first winners.
Thus any new sequence elimination must retain ORIGINAL owner-tagged source `q=(h,R0,R1)`, gravity feasibility and necessary race information. A pure XOR / height / end-color quotient has already been physically refuted.

## 2. An exact reduction of full-schedule chronology to ownership plus a conditional race

Fix **ANY** genuine standard first-win-stopped source `q=(h,R0,R1)`; preserve symbolic W,H,K in definitions. Let `n=Σh_c`; `E` is the finite set of T=WH-n remaining physical cells; and `w` is a provided COMPLETE gravity-respecting hypothetical word containing all events, permitted as algebraic bookkeeping past the earliest real terminal move. Let `t_w:E→{1,...,T}` be its physical event placement rank, respecting every column chain and bijective across E.

`χ_w(e)=(n+t_w(e)-1) mod 2` is the event's future owner under the hypothetical alternating clock.

For p∈{0,1} and each original minimal surviving residual G∈R_p let:

    M_{p,G}(χ) = Π_{e∈G} [χ(e)=p]   ∈{0,1}
    F_p(χ) = OR_{G∈R_p} M_{p,G}(χ) ∈{0,1}.

**F_p depends ONLY on the eventual event-owner bits χ, not on their chronological ranks**. F_p=1 means at least one surviving ORIGINAL p winning requirement would eventually be completed in the counterfactual full schedule.

The first such p-completion rank is

    τ_p(w) = MIN_{G∈R_p : M_{p,G}(χ_w)=1} MAX_{e∈G} t_w(e)

and `τ_p=+∞` if no matching source residual is ever completed. The original minimal antichain is sound here: a removed superset could not complete before its surviving subset. A genuine first-win-stopped prefix ensures every initial G is nonempty.

If F_0 F_1=1, define the **conditional chronology race bit**:

    ρ(w) = +1 if τ_0(w) < τ_1(w);
           -1 if τ_1(w) < τ_0(w).

Finite p-completion ranks have parity p and therefore cannot be equal. When `F_0F_1=0`, choose ρ arbitrarily; it is multiplied by zero.

**Exact original first-winner payoff factorization:**

    PAYOFF(q,w) =
        F_0(χ_w) - F_1(χ_w) + F_0(χ_w) F_1(χ_w) ρ(w).

This is P0-relative: +1=P0 first wins, -1=P1 first wins, 0=draw. Four cases prove it directly:
- (F0,F1)=(0,0): DRAW; (1,0): P0 FIRST WIN; (0,1): P1 FIRST WIN;
- (1,1): both sides *would* eventually complete a line in the counterfactual full word, and only the sign of the two earliest completion ranks determines which wins FIRST.

This isolates exactly WHERE first-win chronology remains necessary in a fixed hypothetical word: in the **dual-completion** condition `F0 F1`. It does NOT establish that an optimal-player strategy is determined by a final phase coloring or by one race bit. The mapping from adaptively selected prefixes to attainable (χ,ρ) remains the unsolved adversarial problem. Evaluating an individual supplied w is mathematical testing, not game-value search.

## 3. New direct SOURCE-only sufficient temporal-elimination guard

Define the static original cross-owner *potential race support* set:

    D(q) = {(G0,G1)∈R0×R1 : G0 ∩ G1 = ∅}.

If D(q)=∅, every original P0 residual generator intersects EVERY P1 residual generator in at least one **future** physical cell. Such a cell cannot be finally owned by both players. Therefore F0(χ)F1(χ)=0 for EVERY phase assignment χ, including every gravity-legal schedule.

This proves the guarded source identity

    D(q)=∅  ==>  FOR ALL gravity-legal hypothetical w:
                     PAYOFF(q,w)=F0(χ_w)-F1(χ_w).

The right side requires NO first-win chronological ordering once the eventual coloring χ is known. The guard involves ONLY one static pairwise pass over current owner-tagged R0/R1 masks. It constructs zero future strategic q states, zero alternative game WDL values and zero opponent policy paths.

**IMPORTANT:** D(q)≠∅ means only that this inexpensive sufficient guard fails. Disjoint residual pairs may be incompatible with any alternating gravity-feasible χ. Even if race-free, Fp(χ) still depends on phase χ, which depends on interleaving; and adversarial move choice may still matter. This is a strict **payoff chronology factor**, NOT a complete Level2 move certificate and NOT a universal strategy-sequence elimination.

A more powerful candidate is a static algebraic feasibility obstruction eliminating all *simultaneously owner-satisfiable* disjoint pairs using (a) gravity-chain predecessor order, (b) global alternating parity, (c) center-marker interval phase transport and (d) source original ribbon incidence, WITHOUT enumerating hypothetical full words or hiding a quantified game tree.

## 4. The genuinely missing quotient and test of success

An exact full-schedule map `w ↦ (χ_w,ρ_w)` is not a strategic quotient by itself: two prefixes with the same terminal payoff may offer strategically different future actions; the order of P0/P1 quantifiers cannot be commuted or replaced by a set of attainable terminal phase patterns. At every live prefix, the controller of the next column still matters. A purported no-branch formula must prove one best original current action by a SOURCE winner/draw/loss certificate or a SOURCE qualitative comparison against all other current labels.

The sought factorization must eliminate future word **choices as strategic branching**, not merely rename each word as a phase assignment or sum over all shuffles. Possible proof direction (NOT a theorem): find a source-defined **phase-and-race invariant kernel** `K(h,R0,R1)` whose update under all legal column moves admits direct algebraic simultaneous absorption/closure preserving adversarial alternation; changes of move ordering should be represented by exact interval-phase transports plus a local original-generator nonlinear defect, not separately valued successor games. A trace/partial-commutation quotient may be used only for swaps PROVED to preserve source future strategy behavior (swapping consecutive opposite-player moves generally changes stone ownership and is NOT freely commutative).

The target remains ONE certified Level2 BEST original literal column on every valid 7×6 q, without evaluating two strategically inequivalent future game values. Complete all-best set is optional stronger output. `44444` ordinary perfect WDL and best move remain UNKNOWN unless a new rigorous proof resolves them.

## 5. Freeze-and-falsify original-board protocol

**Frozen BEFORE executable source/control testing**:
1. Build an original-q ONLY producer computing the 69 exact K windows, normalized R0/R1, and `D(q)` (number of DISJOINT cross-owner generator pairs and the race-free guard). Do not use solver values, future-word enumeration or first-win physical labels inside the source.
2. Build a separate 7×6 PHYSICAL board game with explicit gravity and four-in-row detection, plus an independent hypothetical full-word first-win observer. On genuine legal first-win-stopped histories, independently calculate χ from supplied full suffixes, F0/F1 from source, τ0/τ1, and both sides of the exact formula against physical first-win. In source-guard-positive q, verify NEVER both F0 and F1 and never any eliminated race exception.
3. Locate at least one genuine original 7×6 full hypothetical word with F0=F1=1 (ideally two different words with the SAME χ but DIFFERENT first winner, the historical obstruction) to demonstrate that the race bit is necessary without misclassifying it as a real post-terminal game.
4. Reproduce canonical `44444` original R0=48, R1=42, classify `|D(q)|` and rate of source race-free guards on a declared SAME real 7×6 q corpus. Do not interpret corpus frequencies as exhaustive WDL coverage.
5. Source evidence must disclose static cross-generator intersection work, hypothetical supplied-word payoff checks and strategic game-value queries separately. Source guard positives do **not** provide Level2 best moves. Any false guard or formula mismatch is preserved as negative evidence. Node26 CI, independent formal proof checker and solver integrations are separate gates, not assumed complete.
6. Only after identifying a true source-only nonbranching phase/race **strategic** closure may source outcome/best actions be physically recursively falsified and compared to V4/first-touch on the SAME q.

**External conceptual cross-check, not gameplay authority:** Trace monoids/event structures study when interleavings can be identified by valid commutation laws (e.g. https://www.sciencedirect.com/science/article/pii/030439759190087I; https://doi.org/10.1007/978-0-387-09766-4_491). In Connect4, alternating ownership and earliest K-line stopping sharply restrict any such commutations; citing generic trace algebra cannot justify dropping them.
