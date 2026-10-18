# Owner's corrected three-tier information target: Level 2 is ANY P0-winning continuation, Level 3 is FASTEST forced P0 win

**Date:** 2026-10-17 Pacific. **Canonical owner:** `research/semantic-quotient`. **Status:** latest explicit project-owner OUTPUT DEFINITION supersedes **only the labels / output contract** in `docs/research/2026-10-17-three-level-wdl-optimal-set-remoteness-information-hierarchy.md`. The previous file and its exact physical reference evidence are retained unchanged as historical WDL-optimal/remoteness mathematical results; do not rewrite older data as if it was measured under this new naming. This research note is NOT an IsoGraph 1.2 gameplay authority promotion. Primary domain actual `W=7,H=6,K=4`; preserve `W,H,K` symbolically for later generalization.

## A. The owner's exact wording / corrected definitions

The owner now defines:

1. **Level 1 — who wins/loses/draws under perfect play.** P0-relative ordinary value `V(q)∈{-1,0,+1}`.
2. **Level 2 — "best moves" means ANY continuation that GUARANTEES a P0 win.** No ranking of winning moves by speed, length, distance or preference. A winning continuation is not a line that could win if P1 makes a mistake; the P0 win must still be FORCEABLE under unrestricted perfect opposing play. The mathematically COMPLETE set of all such literal first moves is desired, preserving all equally "best" winning labels. Moves that result in draw or P0 loss are NEVER Level-2 best, even when they are WDL-optimal because no win exists.
3. **Level 3 — "perfect moves" means a winning continuation that delivers the FASTEST FORCED P0 victory**, with the opposing player's best available delaying defenses accounted for; it refines the Level-2 P0-winning set and needs a remoteness measure. The prior research also measured *longest unavoidable loss*, but under this latest owner refinement that metric is OPTIONAL/SEPARATE and is not silently included in the required "perfect move" output. If no P0 forced win is available, `B0(q)=∅` and the primary fastest-win Level-3 set is empty/undefined, not replaced by the best drawing or longest losing action.
4. **Research hypothesis, NOT established theorem:** Level-2 exact P0 winning continuations may admit ZERO independent strategic future-game branching on standard 7×6; selecting the fastest forced winning continuation at Level 3 may require some strategic branching. A general computational lower bound forbidding nonbranching Level 3 has NOT been proven. Some narrow positions admit exact shortest-win certificates with no branching, so do not proclaim universal impossibility.

"Best move" and "optimal move" were conflated in earlier assistant outputs; this latest owner correction resolves that terminology. Do not invent tie-breakers or reinterpret an "all WDL-optimal" loss/draw mask as a Level-2 P0 winning move.

## B. Exact game-theoretic mathematics

Let q=(h,R0,R1) be any valid FIRST-WIN-STOPPED source, `p(q)=Σ_c h_c mod 2`, and `A(q)` the literal legal columns. Let `J_a(q)∈{-1,0,+1}` denote the exact unrestricted P0-relative outcome after ORIGINAL first action a, with first-win immediate terminal tokens. For an action that leaves a nonterminal state, `J_a(q)=V(T_a(q))`.

**Level 1:**

    L1(q) = V(q)
    V(q)= max_{a∈A(q)} J_a(q) if p=0, otherwise min_{a∈A(q)}J_a(q).

**Owner-corrected Level 2:**

    B_0(q) = { a∈A(q) : J_a(q)=+1 },
    L2(q) = (V(q), B_0(q)).

At a P0 turn, each action in B0 is a P0 move and is, by definition, a "best move" under the owner's win-only rule. At a P1 turn, a in B0 is a **P1 reply which happens to preserve P0's forced-win status**, NOT a recommendation / "best move" for P1. If the application only asks for what P0 should play, report the Level-2 B0 move mask only on P0-to-move states; at P1 turns retain the mathematical B0 reply mask as opponent-response information and label it accurately.

**Elementary but load-bearing root inequalities:**

    (p=0 AND V(q)<+1)  => B0(q)=∅.
    (p=0 AND V(q)=+1)  => B0(q)=M_WDL(q).  [all +1 children]
    (p=1 AND V(q)=+1)  => B0(q)=A(q).      [all P1 replies leave P0 win]
    (p=1 AND V(q)<+1)  => B0(q) can be empty OR nonempty,
                           and may include P1 blunders favorable to P0.

Here `M_WDL(q)={a:J_a(q)=V(q)}` is the mathematical **conventional WDL-optimal move set**. It is still a legitimate exact object and existing solver API output. However it is **NOT the owner's Level 2** unless P0 is moving and V(q)=+1. Preserve it with explicit `wdlOptimalMoves` name in all new output schemas. Do not alter the frozen pre-correction experimental data.

**Example interpretation:** When P0 cannot force a win but can force a draw, conventional WDL-optimal moves may be drawing moves, while the newly defined `B0(q)=∅` on P0's turn. That difference is intentional, not an error. When P1 moves and is already unable to avert P0 win, EVERY legal P1 response belongs to B0, even if the replies yield different eventual win times.

## C. Key XOR consequence: ONE source bit suffices for the Level-2 move mask

Use the previously derived exact P0-win threshold `f_+(s)=[V(s)=+1]` and turn-phase bit `g_+(s)=f_+(s) XOR p(s)`. A nonterminal source action switches turn parity, `p(T_a(q))=1 XOR p(q)`; immediate-terminal tokens are assigned the same threshold and phase convention. Hence for EVERY literal action a:

    [a∈B0(q)] = J_a(q)==+1 = g_+(T_a(q)) XOR (1 XOR p(q))

and equivalently:

    **B0(q) = {a∈A(q) : g_+(T_a(q)) = p(q)}.**

Check:
- P0 to move (p=0): B0 is precisely the previously defined `Z_+(q)={a:g_+(child_a)=0}`.
- P1 to move (p=1): B0 is precisely `A(q)\Z_+(q)` where `Z_+= {a:g_+(child_a)=0}`.

Thus the new owner **winning ACTION MASK** requires the COMPLETE truth values of **one Boolean P0-winning channel**, not BOTH nested threshold masks previously necessary for all conventional WDL-optimal labels. In contrast FULL 3-valued Level-1 V(q) still needs to separate draw from P0 loss: two Boolean thresholds (or an equivalent trivalent structural certificate) remain necessary if V≠+1.

**Important:** This single-channel reduction is an EXACT OUTPUT IDENTITY, not a source-q algorithm computing the unknown threshold bits without evaluating multiple inequivalent child futures. It eliminates a Boolean information requirement, not proven game strategic branching. The owner's zero-fanout objective remains open for arbitrary legal actual 7×6 q and canonical `44444`.

## D. Owner-corrected Level 3 and opponent-defense guard

On q with P0-to-move and B0 nonempty, let D0(q_a) be the exact **maximum** remaining moves an adversarial P1 can force before a P0 victory while P0 chooses subsequent winning moves for the fastest guaranteed win. Then the remoteness of taking action a is `d_a=1+D0(q_a)` (terminal immediate win child D0=0). The Level-3 perfect-move set is:

    P_0(q) = {a∈B_0(q): d_a = min_{b∈B_0(q)} d_b }.

For a state where P1 moves while P0 is guaranteed to win, P1 will choose a P0-winning continuation that DELAYS victory as long as possible, not an artificially cooperative fastest P0 outcome. The exact min/max timing alternates through future positions, always conditioned on retaining the P0 win; the independent 7×6 physical reference already exercises this general WDL-first game-distance construction. Draw-time convention and longest-inevitable-loss moves are separate optional requests, not the new Level-3 P0-perfect-move definition.

**Existing branching reference:** `exact-q-core.mjs` returns `value`, `bestMoves` (old **WDL-optimal**, NOT newly defined owner "best"), and `actionValues=[(column,J)]`. Without any strategic recalculation, its Level-2 projection is simply:

    p0WinningMoves = answer.actionValues
                       .filter(([column,value]) => value === +1)
                       .map(([column]) => column).

That reference is algorithmically complete but recursively BRANCHING, so merely projecting its output does NOT meet the new zero-fanout target.

## E. Evidence, frozen constraints and next source research gate

Previously completed actual7×6 independent physical experiments on 2,500 late roots and 6,575 legal root labels measured `V`, conventional `M_WDL`, and remoteness. Independent WDL cross-check 850/850, and a separate physical checker confirmed all 6 preserved timing witnesses and 16 action lengths. These remain sound HISTORICAL controls but should not be counted as new tests of the owner-specific win-only output until an exact projected source/independent physical test is frozen and executed.

Next genuinely relevant source-only theorem should derive **all and only P0-winning literal first actions `B0(q)` from ONE source q** with ZERO separately valued INEQUIVALENT future games, preserving adversarial response, gravity, first-win, all K-line requirements and unknown `44444` value. A Level-1 P0-win proof plus proof that all P0 action labels in some set preserve it may provide all Level 2 win labels WITHOUT ever selecting the fastest winner. Root `V=+1` alone does not produce the complete P0-turn B0 set; the full source move-membership proof is still necessary.

**Do not downgrade by stealth:** retaining a single arbitrary winning move is useful as a `L2-one-witness` certificate, but a claim of **complete Level-2 B0** requires ALL literal move memberships or a source proof of why those not listed cannot force P0 win. At P0-turn a proved root `V≤0` immediately certifies `B0=∅`; at P1-turn proved `V=+1` certifies B0=ALL legal moves.
