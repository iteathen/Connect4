# All connection lengths: total perfect-play WDL classification for H=1, any positive width

**Date:** 2026-10-18 Pacific. **Owner research direction:** Josh Oshiro, dimension-to-WDL / nested width parity. **Status:** exact guarded source theorem, frozen before independent adversarial control; NOT qualified authority 1.2. Canonical research branch: research/semantic-quotient. No game-tree evaluation in the source algorithm.

## Complete formula

For ANY W>=1 and K>=1 in empty original gravity Connect-K with H=1,

    V_empty(W,1,K) =
       +1 if K=1;
       +1 if K=2 AND W>=3;
        0 otherwise.

No one-row board is a P1 perfect-play win. This closes the full H=1 board-family across ALL connection lengths.

Cases K<=2 are already directly proved in docs/research/2026-10-18-total-dimension-wdl-classification-connect1-connect2.md. The new proposition here is exact DRAW for every W>=1, K>=3.

## Exact K>=3 draw theorem

Pair adjacent physical columns by parity:

    (0,1), (2,3), (4,5), ...,

with the sole far-right unmatched column when W odd.

Every horizontal run of K>=3 consecutive cells contains at least one complete pair: every 3 consecutive integers includes an even-odd adjacent pair. Vertical/diagonal original K-windows do not exist at H=1 for K>=3.

For EITHER designated defender D (P0 first or P1 second), use this legal online reply policy against attacker A=1-D:

- If D is P0, D's first original move may occupy leftmost free column. It is harmless to the invariant that A never occupies both members of any fixed pair.
- After each A move, if A just occupied a paired cell whose mate is still empty, D claims that mate immediately.
- Otherwise D takes ANY remaining empty original column (or game ends when no cells remain).
- A pre-existing D-owned mate is already a valid blocker. D's discretionary moves can never create an A-owned pair. An A-owned pair cannot appear on A's move without prior A-owned mate, which was excluded after the previous D response.

Induction establishes that A never owns BOTH members of a fixed pair. Hence no A-owned horizontal K>=3 win can ever occur while D follows this policy. The policy is legal under H=1 gravity because every unused cell is immediately playable; no cross-column release guards or deadlines are required.

This establishes an A-NO-WIN response strategy for D=P0 and D=P1 separately. Under perfect play neither player can force a WIN against the other's policy, so exact empty-root scalar value is DRAW. The policy for a designated defender might itself win earlier; that is irrelevant to its guarantee that its opponent cannot win. No enumeration or valuation of strategically inequivalent future games is part of the source theorem.

**Precise boundary:** K=2 does NOT satisfy the paired defense target: a length-two horizontal run can fail to contain a fixed paired block (e.g. consecutive columns 1 and 2). For W>=3 K2, P0 instead has the explicit ply3 WIN rule. This is why K-dependence cannot be discarded in the width-parity analysis.

## Independence and validation

Freeze a pure original H=1 source dimension outcome classifier and a pair response policy (using current occupied columns only, not future-game WDL); separately freeze original-grid opponent-adversarial physical falsifier for both D=0 and D=1, K=3..8, W<=16 including odd/unmatched and even widths. Source no-WIN must hold for ALL attacker choices in bounded controls; if an attacker forces first win under either fixed policy, the theorem is disproved. Use full-board draw and early defender win as legitimate successful stops. Original K1/K2 source classification is validated separately.

**Search-engine applicability:** exact empty-root DRAW node cutoff for H=1,K>=3, using integer comparisons O(1); no dynamic lookup/database. Existing K4 thin-board DRAW theorem overlaps this scope. Do not extend the H=1 policy to H>1 without new gravity support proof. No production solver integration/merge authorized.
