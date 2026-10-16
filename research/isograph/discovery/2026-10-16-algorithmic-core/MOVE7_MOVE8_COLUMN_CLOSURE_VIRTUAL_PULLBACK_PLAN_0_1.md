# Standard Connect4 move-7/move-8 filled-column transition — algebraic virtual-cofactor test 0.1

Date: 2026-10-16. Canonical owner: research/semantic-quotient. Branch: research/semantic-quotient. Starting verified HEAD 5fa5a7b73e42cd0cfc182acd657101466be45f35.

## Research question and exact terminology

Owner hypothesis: the key difficulty is the transition when center column 4 reaches height 6 and legal play shifts into the wings; if local algebra continues through move 7 into move 8, this may expose a reusable state-transition mechanism for the rest.

Do not conflate:
- after prefix 44444 (rank 5), **P1** plays turn 6, all seven columns are legal;
- after prefix 444444 (rank 6), center column 4 is **full** and **P0** plays turn 7, with six legal wings;
- after any P0 move on rank 7, P1 plays turn 8. WDL-equivalence among distinct legal seventh moves is *not* a premise and is not proved by phase parity or structural cofactor alone.

Earlier doc 2026-09-13-column-phase-defect-and-zero-phase-core.md establishes the exact support phase phi_c=(6-h_c) mod 2, one action toggling the played coordinate, and two-ply XOR e_a+e_b (including capacity and legality guards), but expressly does NOT show phase equals value.
2026-10-16-turn6-bidirectional-certificate-campaign.md still leaves eventual early rank P0 winning-region proof OPEN.

## Exact new virtual-cofactor algebra: theorem candidate frozen before testing

For fixed support h, normalized residual antichain R_i, and a future-cell query set S, write

 U_i^q(S) = [ exists r in R_i such that r subseteq S ].

This is the source antichain's upward DNF membership. For a **nonterminal** owner p move on legal landing x at column a with new support h'=h+e_a:

 U_p^{q'}(S) = U_p^q(S union {x});
 U_(1-p)^{q'}(S) = U_(1-p)^q(S), whenever S only uses cells unoccupied in the child (so x notin S).

This is a direct mathematical identity of owner-true residual contraction and opponent false/blocker cofactor; empty owner requirement is a FIRST-WIN terminal and must not enter ordinary nonterminal q'. It is valid across a column becoming full: the new legal action set is computed from h', and x cannot reappear as a future cell. The column-phase update is separately phi'=phi xor e_a, with zero remaining-capacity flag if h'[a]=H.

**Candidate stronger property:** substitute this VIRTUAL upward-membership oracle, without materializing q', as the child-state input for the existing source-only P1/P0/P1/P0 response-cover formula. This produces the exact bounded P0 winning-action predicate for an earlier P0 move:

  EXISTS P0 a / FORALL P1 b / EXISTS P0 c / FORALL P1 d / EXISTS P0 immediate terminal,

i.e., P0 wins on its first, second or third own placement, with first-win/draw stopping. The child h' is computed arithmetically; no child R0/R1 antichains or q objects are constructed by the producer.

Source q membership is a DNF upset, not exact membership in a normalized child antichain. This distinction is **load-bearing**: singleton-or-pair membership in a minimal antichain is NOT generally equal to upset membership. The previously derived response-cover polynomial must be proved/checked invariant under replacing exact atom tests by upset tests with early terminal guards, or a counterexample must be recorded. Reject the candidate on the first such mismatch.

## Predeclared tests

1. Reproduce the exact q_cofactor identity for ALL legal moves from prefix 44444, through center-full 444444, all six legal turn-7 moves and all 36 legal turn-8 reply edges, including reflected siblings. Independently regenerate physical ownership and normalized child q from 69 win lines; compare all future-cell query coordinates of sizes 1, 2 and 3, not just scalar WDL. There must be ZERO disagreements.
2. Test virtual positive/negative residual upset pullback on every legal 7x6 local edge across ranks 5..8 under prefix 44444, including at least one center-filling edge; validate against materialized independent q in test code only.
3. If the upset-substitution response-cover bridge is sound, extend to the P0/ P1 / P0 / P1 / P0 short horizon from each rank-6 center-full state. Compare candidate action masks with an independent q cofactor+source-cover baseline for every legal P0 action, and with direct physical first-win replay for selected bounded cases. No oracle WDL used in candidate construction. DO NOT assert a candidate that still enumerates deeper continuation games is branch-free merely because it returns one result.
4. Try the full iterative same-kind operator on **complete 4x3 Connect-3** only as a bounded controlled extrapolation, respecting explicit mixed-reply cover width; do not reuse a searched policy to build it. Record whether it reaches the 4x3 empty root, if not record first obstruction.
5. Preserve results and negative controls after each stage. If the virtual upset shortcut is invalid, do not patch by querying searched values or broadening search.

Hard caps: 120 seconds total local isolated V8 experiment (each stage separate bounded tool call); 75,000 virtual formula evaluations, 500,000 source upset membership queries, 400,000 independent verification q cofactor checks; at most 12 seeded standard 7x6 late control states; 4x3 whole-domain sample/control max 200,000 states / 800,000 validation edges. No production solver updates, no game-theory authority promotion, no merge. Node26 maintained test qualification separate.

## Success interpretation

Passing the column-full turn7-turn8 cofactor and mask controls qualifies *structural transition continuity*, not that all rank7 actions are value-equivalent or that a full root game outcome is known. Any general claim of no future fundamentally different method remains conjectural until arbitrary-depth composition is demonstrated.
