# Level 1 signed residual two-clause draw exclusion — frozen theorem and controls

**Date:** 2026-10-18; research owner research/semantic-quotient. **Status:** new restricted mathematical deduction, not a qualified IsoGraph 1.2 authority or a total Level 1 solution. Frozen before source producer / independent physical oracle controls. Primary goal: exact original 7×6 WDL with ZERO strategically alternative future game valuations.

## 1. Source and complete static terminal-avoidance formula

Consider genuine gravity-legal original first-win-stopped nonterminal source q=(h,R0,R1), where h is original height support and R0,R1 are the oriented normalized antichains of surviving original winning requirements. Let E be all currently unoccupied original physical cells.

A hypothetical nonwinning full-board coloring assigns to each e in E a Boolean z_e (true=P0, false=P1). Such a color assignment need NOT be attainable by gravity/alternating play. A true full-board DRAW would satisfy the two-owner signed clause family:

    F(q,z) =
        AND_{G in R0} OR_{e in G} (NOT z_e)
        AND_{H in R1} OR_{e in H} z_e.

Proof: each viable original P0 requirement must receive some P1 stone and each viable original P1 requirement some P0 stone; otherwise the original winning K-line would already have ended the game. Antichain superset elimination preserves this necessary condition.

**L1-SIGNED-DRAW-EXCLUSION:** If F(q,z) is UNSAT, no original physically legal continuation from q is a nonwinning full-board DRAW. This DOES NOT select a winner or prove a forced win for either side. Conversely, F SAT is only a necessary static condition for a DRAW, not evidence that a DRAW is possible under alternating, gravity and first-win stopping.

## 2. Polynomial-time direct source restriction (no strategic branching)

Retain only R0 and R1 generators with one or two remaining cells to form subformula F2(q,z). Each retained P0 G yields a clause of one/two negative literals; each retained P1 H yields a clause of one/two positive literals. Ignoring larger clauses is conservative for proving UNSAT.

For each signed clause (u OR v), insert implication arcs (NOT u => v) and (NOT v => u). Unit u gives (NOT u => u). Standard 2-SAT theorem: F2 is UNSAT iff there is some e with z_e and NOT z_e in the same directed strongly connected component. The positive certificate comprises a path z_e => NOT z_e and the reverse path; every arc carries its original signed requirement and source physical cell masks.

An SCC computation uses at most 2WH vertices, <=2 times the number of binary clauses arcs, and O(WH + |R0| + |R1|) operations. It reads ONE root source and evaluates ZERO future game states, opponent histories, adaptive policies, recursive minimax branches, BDD values, QBF or compiled game trees.

If F2 is UNSAT, then F is UNSAT and source may emit DRAW_EXCLUDED. If F2 SAT, emit INCOMPLETE even if a stronger theorem could exclude draws. Do not promote a satisfying Boolean final coloring to a gravity-realizable strategy or actual DRAW.

## 3. Guarded Level 1 LOSS composition

Let p be the actual mover at q, opponent o=1-p. Suppose an *independently established original guarded source certificate* exhibits one physically legal, first-win-safe o strategy preventing p FIRST WIN against EVERY p strategy from q. Call this source fact NO_FORCE_WIN_p(q). The existing first-touch, sound gravity co-release/pair, or support-mirror+exposed-potential certificates may provide this exact premise if and only if ALL their guards hold.

**L1-NO-WIN-PLUS-NO-DRAW:**

    NO_FORCE_WIN_p(q) AND F2(q) UNSAT
        => the opponent o has a forced FIRST WIN
        => V(q) = -1 when p=P0, +1 when p=P1.

Proof: play the independently certified o policy. It prevents p first win. Every first-win-stopped Connect Four game ends either at the first winner or at full-board DRAW; F2 UNSAT rules out the latter for ANY legal play, regardless of who moves first. Thus this ONE o policy always first-wins; root p is LOSS under perfect play. Without both guards, exact WDL remains INCOMPLETE.

F2 UNSAT alone proves no DRAW, but does not tighten P0-oriented numeric interval into a single contiguous interval that excludes zero; it yields the two-point outcome set {-1,+1}. Do not call this an exact WIN/LOSS cutoff absent the independent sign certificate.

## 4. Relation to preexisting claims; research-plan decision

Previously source-exact cross-line fractional transversal packing can establish inevitable first win using one owner's residual hypergraph and a blocker-placement capacity bound. The present F2 test instead detects signed BILATERAL incompatibility among small original winning requirements. It is not a general replacement for fractional packing or CPC/NDC. Neither test proves the adaptive winning policy by itself. General F unsatisfiability by unrestricted SAT remains a structural mathematical implication but is NOT proposed as a source algorithm here because a large search of future colorings could hide undesirable exponential combinatorics; F2 SCC has fixed polynomial graph cost.

Alternative directions compared: gravity-phase/XOR alone is known incomplete for first-winner; another horizon BDD/QBF compilation conceals strategic quantifiers; fixed-profile gravity linear-extension chronology does not preserve adaptive policies; conditional obligation debt and strategy-congruent response simulation remain strongest OPEN routes for general arbitrary-rank WDL. F2 unsatisfiability is selected FIRST as a direct, exact, inexpensive, source-only low-hanging WDL component. It may find no useful actual positions; no coverage claim is made.

## 5. Predeclared, independent falsification protocol

1. Freeze this note and a pure original-source SCC script in research/isograph/discovery/2026-10-18-level1-structural-outcome/ before physical/oracle testing, committing each. The script accepts h,R0,R1, validates original physical future-cell scope, and returns certificate conflict paths with signed original residual-mask provenance. It must never compute a future q or numeric game value.
2. Independently implement a 7×6 grid with all 69 original four-cell K-lines, alternating turns, gravity and first-win stopping. Freeze seed 20261018 and an independently generated nonterminal genuine-source corpus, plus canonical histories 44444 and 2532541156412471331416356736376672 and a late R-mover-extinct negative control.
3. Reconstruct residuals from independent physical grid and verify every positive implication-graph arc; when positive late roots occur, independent physical FULL minimax may be used AFTER source claims are fixed to falsify DRAW_EXCLUDED and guarded LOSS implications. Source may not read oracle values.
4. Test a synthetic signed unit-clause contradiction separately ONLY as an implication-graph unit test, never as evidence of a reachable Connect Four q. Preserve positive/negative tests, true provenance, resource budgets, and zero physical shortcut claims.
5. Compare same-q positive draw exclusion versus previous fractional overload and same-q exact WDL proof families; distinguish NEW DRAW_EXCLUDED constraints from NEW exact root WDL outcomes. The declared null result when no actual positives appear is still useful and should not be padded with sampled success rates.
6. Engine applicability: positive DRAW_EXCLUDED alone is NOT an exact node-value cutoff; combined original no-win + no-draw is exact LOSS cutoff and potentially worthwhile if source SCC + policy guard cost beats saved game branching. Do not edit a solver; test net runtime and independent 69-line correctness before any proposal to integrate.

**Epistemic ledger before controls:** mathematical proof (conditional) = derived; source implementation = NOT_YET_FROZEN; independent real-board verification = NOT_RUN; independent formal qualification = NOT_RUN; total source Level 1 = OPEN; canonical 44444 = UNKNOWN. No new official C4-R identity is minted or authority promoted here.
