# Frozen standard-7×6 temporal transversal / first-win race extension

**Date:** 2026-10-17 Pacific. **Status:** CANDIDATE mathematical extension, frozen BEFORE independent validation. **Research owner:** research/semantic-quotient. **Goal:** source-only exact unrestricted WDL + ALL optimal literal labels, ZERO strategic branching. **Board:** actual W=7,H=6,K=4, retain symbolic W,H,K for future generalization.

## Motivation

The source-only cross-line fractional hitting-set overload theorem has yielded exact unrestricted winner/optimal-label certificates on genuine 7×6 sampled positions, but its guard that the other player can **never** win is strong. A more faithful guarded NDC/CPC race formulation can prove p wins FIRST even when opponent o retains eventual winning lines, provided their earliest physically possible win is strictly LATER than a source-proved mandatory p completion horizon.

## Source geometric deadlines / turn ranks

Let q=(h,R0,R1), n=sum_c h_c, T=WH-n; s=n mod2. Each surviving G∈R_p is a nonempty future subset of one original geometric K-line. Define

    U_q(c,r) = (W-1)H - n + r + 1.

This is a latest possible source-relative placement rank for cell (c,r), **under the contradiction hypothesis that play has not already terminated earlier**. For an integer L in 1..T, let

    F_p(L,q) = { G∈R_p : max_(c,r)∈G U_q(c,r) <= L }.

Thus if no first win stopped the game before L, every future cell of every G∈F_p(L,q) has been placed by L.

Let A_z(L,q)=floor(L/2)+([L odd] if z=s else 0) be player z's number of placements in the first L future turns.

For opponent G∈R_o, its earliest possible completion cannot precede either:
- the number of gravity-chain prerequisites P(G) = sum_{c touched by G} (1 + max_{(c,r)∈G} r - h_c), counting every needed lower future event in each touched column; or
- the earliest future turn when o has had |G| placements, 2|G| - [o=s].

Define E_o(G,q)=max(P(G), 2|G|-[o=s]). Let

    L_o(q) = min_(G∈R_o) E_o(G,q),  with min(empty)=+infinity.

This is an OPTIMISTIC lower bound on the earliest possible opponent original win, not a claim o WILL or CAN complete any G then. It accounts for geometry/gravity and owner-turn resource. If L < L_o, o provably cannot win at or before future move L.

## Source time-indexed fractional packing theorem

For a fixed p and L, take ONLY the source hyperedges G∈F_p(L,q). Find a nonnegative rational λ_G satisfying

    forall source future cells x: Σ_{G∋x} λ_G <=1
    Σ_G λ_G > A_o(L,q).

**GUARDED TERMINAL THEOREM:** If L<L_o(q), and such a λ exists, then player p has already WON by its absolute future move rank <= L under ANY legal strategic play. Thus exact unrestricted root value is p WIN. Proof: If p does not first-win before/on L, o cannot win by L by the independent lower-bound guard, so all L moves occur. Every generator in F_p(L,q) has all its future cells placed by L. With no p win, each such G must contain an o placement among the first L events. The same fractional hitting-set dual inequality forces Σλ<=A_o(L,q), contradiction. Therefore p wins first by L. This preserves first-win stopping, opponent potential counter-win, gravity and actual W/H/K line geometry.

Unlike full-board theorem, this permits R_o nonempty (opponent might win eventually but cannot win before L). It is a source-only finite scan over one current q and one finite incidence matrix per **STATIC** deadline threshold, not independent game-future evaluations. Multiple algebraic L candidate thresholds are permitted static source witness trials, charged explicitly; no time/horizon value lookup, no enumerated action histories or strategy policies.

At L=T with L_o>T, this reduces to the previous unconditional full-board packing result. A failure to find λ, or L>=L_o, is only INCOMPLETE. It is NOT proof that the opponent can draw or win.

## Frozen 7×6 controls / falsifiers

1. Generator of original 69 standard 7×6 Connect4 lines; all real physically legal nonterminal prefixes in deterministic seed-fixed sample plus canonical 44444/44444c. Keep W,H,K symbolic in computation.
2. SOURCE-only build U and E_o from every residual G at q, and search L=1..min(T,L_o-1) with static feasible λ exactly verified as integer-scaled numerator/denominator. Account for every static proof-witness attempt separately. No independently valued strategic continuation.
3. For all claimed source p wins, independently obtain true unrestricted 7×6 ordinary physical WDL. Then apply each source proof after all seven literal first-action cofactors, reconstruct exact complete M* only if every label strictly classified by sound intervals.
4. Preserve negative outcome if all useful L collapse to the full-board no-opponent-win case; do not inflate success via historical small boards. No claim that 44444 solved absent exact unrestricted source certificate + ALL tied moves.
5. Independent release and parity checks must reject an intentionally mutated opponent earliest-rank guard (replace strict L<L_o with nonstrict L<=L_o) when it produces a false winner; if no false witness exists in tested corpus, record lack of falsifier, NOT a proof the weaker guard is sound.
6. New candidate and source producer frozen before values; full first-win stopping is non-negotiable.

No IsoGraph authority promotion, solver merge, or smaller-board primary qualification.
