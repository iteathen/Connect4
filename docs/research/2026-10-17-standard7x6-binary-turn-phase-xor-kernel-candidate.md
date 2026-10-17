# Connect Four as an event-parity line hypergraph plus a two-channel Boolean kernel

**Date:** 2026-10-17 Pacific. **Owner research insight:** 7×6 geometry and alternating turns combine to make unrestricted W/D/L; seek an underlying binary core with alternating turn sequence factorable by XOR. **Canonical owner:** research/semantic-quotient. **Status:** DERIVED EXACT IDENTITIES / FROZEN RESEARCH CANDIDATE BEFORE PHYSICAL 7×6 TESTS. NOT a zero-branch total solver, NOT a new IsoGraph qualified authority. Keep **W,H,K** symbolic, but test ONLY actual standard (7,6,4).

## A. Three fundamentally separate layers

1. Geometry: future gravity placement events are W vertical chains, each of length H-h_c. Winning requirements are K-cell line hyperedges in the fixed W×H grid. For standard (7,6,4): 42 events, 69 original K-lines, line incidence/connectivity and first-win stopping are crucial.
2. Clock: every global placement alternates a single player bit, and that bit can be computed by GF(2)/XOR from the event's absolute rank. No separate colored-board ownership chronology is required once the event permutation/order is specified.
3. Strategy: each mover selects ONE legal next column, conditioned on all earlier observed moves. XOR of clock bits does NOT by itself remove alternating quantified strategic choices or deliver (V,M*) without separately valuing inequivalent futures.

These layers must never be conflated. CPC N_q(t) is an upper bound on eventual legal event rank, not necessarily the actual rank or fixed future owner. Static colored terminal incidence does not replace first-win timing.

## B. Exact source-to-event XOR factorization (for an arbitrary legal hypothetical order)

Let q have heights h and n=sum h; future gravity event e=(c,r), h_c<=r<H. In any hypothetical continuation interleaving the remaining chains, let b_d(e) be the number of future events in OTHER column d placed strictly before e. The zero-based absolute placement index of e is

    index(e) = n + (r-h_c) + SUM_{d != c} b_d(e).

Thus the absolute owner bit (0=P0,1=P1) of that future event is EXACTLY

    owner(e) = (n mod2) XOR ((r-h_c) mod2) XOR
               XOR_{d != c}(b_d(e) mod2).

No winner or strategic evaluation is required to assert this legal-order identity. The source direct term n XOR (r-h_c) is the local gravity clock; ALL order-dependence lies in inter-column predecessor-count parity. The original CPC bound

    N_q(e)=(W-1)H-n+r+1

is the most delayed RELATIVE move number possible for e, NOT a guaranteed observed rank. Turn ownership cannot be deduced from the parity of N_q(e) absent certified CPC release and response guards.

**Adjacent-swap law:** take two consecutive future legal event placements e,f from distinct columns in a hypothetical continuation. If swapping their order retains gravity legality (it does for adjacent incomparable column events), then ONLY their owner bits toggle:
    owner_new(e)=owner_old(e) XOR 1;
    owner_new(f)=owner_old(f) XOR 1;
    all other assigned future event owner bits unchanged.
The subsequent column-support state after the two placements is the same, but player ownership of the two cells is swapped. FIRST-WIN might terminate after the first original order and not after the second; do not promote event-swap algebra to ordinary game-future behavioral isomorphism.

## C. Strip player-color identity from the original K-line predicate

For any complete hypothetical placement schedule π respecting gravity, assign each cell e its actual placement parity bit o_π(e) (for cells occupied before q, known source player; for future, §B). Select an anchor e0 in original geometric K-line L. Over GF(2) the line is monochromatic if and only if

    MONO_L(π) = PRODUCT_{e in L \ {e0}} (1 XOR o_π(e) XOR o_π(e0)) = 1.

There is no P0-vs-P1 branch in MONO_L: it asks whether every one of the K event ownership bits is the same. Every original winning line can be processed in the same GF2 shape. For a hypothetical full legal column-order schedule, let τ_L be the placement time (relative to q) of the LAST cell of L, or 0 if the line was already present (excluded at a valid nonterminal q). If MONO_L is false, set τ_L=+infinity. Then

    τ_*(π) = min_{L: MONO_L(π)=1} τ_L.

If the set is empty even at the last full-board event, that schedule is a DRAW. Otherwise the actual first-win winner is exactly the owner of the last-placed event of the earliest monochromatic completed original line:

    winner_bit(π) = (n+τ_*(π)-1) mod2.

Multiple lines completing on the same last placement must be of the same player, since all completed lines through that event contain its owner stone; no contradictory simultaneous winners from a legal first-win state.

**THIS IS A REFORMULATION OF PLAY UNDER A FIXED ORDER, NOT PERFECT-PLAY OPTIMIZATION.** Replacing adversarial choices by arbitrary or random full schedules would NOT prove unrestricted W/D/L or ALL best labels.

## D. Exact two-channel Boolean threshold phase cancellation

For a first-win-stopped ordinary game state q, P0-relative V(q) in {-1,0,+1}, let p(q)=n mod 2 even at terminal states (the player who would move next if play did not stop). Set

    f_+(q) = [V(q)=+1],                 // P0 win threshold
    f_0(q) = [V(q)>=0],                 // P0 nonloss threshold
    g_t(q) = f_t(q) XOR p(q) for t in {+,0}.

For every NONTERMINAL q and exact successor value f_t(q_a), P0 moves use OR of f_t(q_a); P1 moves use AND of them. Since p(q_a)=p(q) XOR1 for every action, both cases reduce IDENTICALLY to

    g_t(q) = 1 XOR PRODUCT_{a in Legal(q)} g_t(q_a)       [Boolean NAND kernel].

Proof:
- p=0: child f_t=1 XOR child g_t; f_t(parent)=OR_a (1 XOR g_t(child)) =1 XOR PRODUCT child g_t, and parent g_t=f_t;
- p=1: child f_t=child g_t; f_t(parent)=PRODUCT child g_t, and parent g_t=1 XOR f_t.

On a terminal FIRST WIN (whether P0 or P1), both transformed bits are (g_+,g_0)=(0,0), because the winning player's next-opponent bit cancels both P0 threshold bits. On a terminal full-board DRAW the transformed pair is

    (g_+,g_0)=(p_terminal, 1 XOR p_terminal).

For present standard W*H=42 even, full draw is (0,1). Thus game outcomes reduce to two binary NOR-of-product/NAND kernels with the same nonterminal operator and two possible terminal tags. One channel alone cannot distinguish WIN/DRAW/LOSS. Recover f_t=g_t XOR p and V as:
    (f_+,f_0)=(1,1)=>+1; (0,1)=>0; (0,0)=>-1.
The forbidden pair (1,0) should never arise in the untransformed threshold basis.

This is a turn-phase factorization, **NOT** zero strategic branching: the product across inequivalent g_t(q_a) remains the open source-structural challenge. The existence of generic linear XOR closure or a Sprague–Grundy Nim-sum formula DOES NOT follow. NAND is not GF(2)-affine: in two free bits x,y, the polynomial 1 XOR xy has algebraic degree two. To eliminate the product, prove source geometry imposes exact factors/relations, an annihilating factor, a relevant rank/response invariant or full outcome set certificate, without separately evaluating the factors via game futures.

## E. Canonical 44444 test surface and falsifiers

At actual 7×6 Connect4 history 44444, n=5, h=[0,0,0,5,0,0,0], P1 to move on absolute move6, 37 future cells, source residual generator counts R0=48 R1=42. Reflection transports root move labels {1,7}, {2,6}, {3,5}, {4}, but FOUR independent full-future classes remain. The two transformed threshold kernels must NOT be promoted to exact root WDL unless source algebra closes the four-factor conjunction for both thresholds and the full best-label equality/non-equality obligations.

Frozen physical 7×6 tests:
1. Reconstruct all 69 exact original geometric K-lines and for each legal *hypothetical full event interleaving* sample, verify §B's owner XOR identity at every cell, and §C's first winning line/rank/winner/draw against an independent first-win-stopped physical board observer.
2. Independently run two versions of exact physical late-suffix game WDL evaluation on genuine legal 7×6 first-win-stopped prefixes: ordinary P0-relative minimax WDL and ONLY the terminal-tagged g_+/g_0 NAND recursion, with no WDL oracle/policy input to the NAND solver. Check each root V and COMPLETE optimal literal columns exactly. This is branching in an *independent validator only*, NOT a zero-branch producer.
3. Preserve a counterexample, if found, to an overly strong claim that final colored ownership alone determines the earliest WINNER without placement timing; also report whether two different legal schedules with the same final owner assignment can terminate with different outcomes. Do not fabricate this if none found.
4. Explicit standard source prefixes 44444, 444444, 4444442: verify geometry/parity equations without claiming their unrestricted WDL from bounded horizons or a reference oracle.
5. A claimed source-only closure must certify EXACT unrestricted (V,M*) for all literal legal actions and count maximum strategic continuation fanout ONE. XOR simplification of recursion alone FAILS this strict owner criterion. If proposed further reduction needs two inequivalent successor Boolean values, return INCOMPLETE.

Source-only theorem/validation producers must remain disjoint; no small-board Connect3/Connect4 effect-size evidence. Keep W,H,K explicit; independent generic-board generalization is deferred until standard 7×6 is substantially solved.

## F. Mathematical prior-art boundary / provenance

The 2-valued N/P winning-position recurrence on an acyclic impartial-game graph is an established general mathematical normal-play tool, not an original solution of Connect Four, and the Sprague–Grundy XOR decomposition requires a valid impartial disjunctive-sum structure which cross-column original winlines generally invalidate. This project-specific two-threshold terminal-tagged XOR/NAND rewrite and legal-gravity event-parity incidence factorization are useful candidate *representations*, not newly promoted game theory or proof of zero-branch complexity. Independently source-first research avoids claiming novelty or semantic authority from mathematical analogy alone.
