# Three distinct levels of Connect4 strategic information: exact WDL, all optimal labels, and remoteness

**Date:** 2026-10-17 Pacific. **Owner direction:** explicitly distinguish (1) who wins/loses/draws, (2) who wins/loses/draws **and best move**, (3) those results **and fastest win or longest loss**. **Canonical owner:** research/semantic-quotient. **Status:** exact conceptual/game-theoretic output contract candidate and differential physical-control plan; not yet game-theory authority 1.2 promotion. Current discovery and testing **standard W=7,H=6,K=4** only, while retaining W,H,K as symbols for later generalization.

## The hierarchy and why it matters

For any genuine legal nonterminal original source state q=(h,R0,R1), with current original mover p=Σh mod2, let A(q) be all legal literal one-based columns and outcome V(q)∈{-1,0,+1} relative to P0 (−1=P1 first win, 0=draw, +1=P0 first win). For a legal first action a let v_a denote its exact unrestricted ordinary terminal-aware first-action WDL; an immediate first win is a terminal value without further play. P0 chooses maximum, P1 chooses minimum.

**Level L1 — Outcome only:**

    O_1(q)=V(q).

Sufficient proof of a winner or draw does NOT in general expose even ONE optimal literal column, and certainly not the entire tie set. A direct universal first-win certificate (as in prior source temporal packing) can output WDL from one source, though some certificate shapes imply more.

**Level L2 — Outcome AND action optimality:**

    M_WDL(q)={a∈A(q):v_a=V(q)}
    O_2(q)=(V(q),M_WDL(q)).

The owner explicitly wants the **COMPLETE set of ALL equally WDL-optimal literal columns**, not just one winning witness. Knowing a single certified best move is an intermediate certificate \`L2-one-witness\`, not complete L2 qualification. For P0, exactly max v_a action ties belong; for P1, min v_a action ties. An L1 proof may suffice to decide the scalar root while M_WDL remains unknown. The frozen two-channel XOR/NAND zero-locus theorem supplies an exact BINARY readout for L2 once BOTH complete child-zero masks are known; it is not yet a source-zero-fanout way of obtaining those masks.

**Level L3 — WDL plus WDL-preserving game length / remoteness:**

    O_3(q)=(V(q),M_WDL(q),D(q),M_time(q)),

where D is an EXACT distance to FIRST terminal move under lexicographic play:
1. both players FIRST select actions optimizing ordinary WDL from their own perspective;
2. subject to preserving WDL, the player who is forcing a win chooses FASTEST guaranteed victory;
3. subject to preserving WDL, the player unable to avoid loss chooses LONGEST survival;
4. for a draw, \`D\`/tie break is UNDEFINED until the owner specifies a draw-duration preference; a drawn game has no "fastest win" or "longest loss."

Define current-mover-relative u(q)=(+1 if p=0, −1 if p=1)*V(q). Thus u=+1 iff the mover can force a win; u=-1 iff the mover necessarily loses under best WDL play. Let the distance of an immediate terminal first win or full-board draw be zero after the terminal action. For any WDL-preserving first action a, let d_a=1+D(q after a) with terminal child distance 0. Then:

    u(q)=+1 : D(q)=MIN_{a∈M_WDL(q)} d_a
    u(q)=−1 : D(q)=MAX_{a∈M_WDL(q)} d_a

and M_time consists of actions achieving the respective MIN or MAX. The defeated player's maximization and victor's minimization alternate down the play sequence. These equations compute worst-case guaranteed victory length or best possible prolonged loss **under both players' WDL-first policy**. Merely measuring a shortest cooperative winning line is NOT "fastest forced win."

An L3 result does NOT remove or overwrite L2 ties: it refines M_WDL to M_time, and the information contract keeps BOTH sets. A move that is WDL-optimal but slower is still L2-optimal. If owner later needs a single remoteness-preferred move, a deterministic selector inside M_time is a further POLICY choice and must not be substituted for the mathematical complete sets.

The **draw duration** remains optional and separately specified. Different conventions (shortest draw, longest draw, no time preference) lead to different D/M_time and no automatic "correct" unique draw move; draw state WDL and M_WDL remain well-defined.

## Proof/discovery and objective alignment

The owner's continuing task is FULL **L2** arbitrary-legal standard7x6 with semantic fanout ≤ONE. L1 is a useful intermediate result, and L3 is a later output upgrade. Do NOT secretly require exact numeric depths to certify L2. Conversely, a scalar winner certificate is NOT full L2, and one WDL-optimal first-move witness does not certify any other tied labels.

As outcomes are totally ordered P0-relatively −1<0<+1 and draw lies strictly between outcomes, the two Boolean threshold bits \`f_+=[V=+1]\`, \`f_0=[V>=0]\` already suffice for L1, while BOTH COMPLETE legal-action zero loci \`Z_+\`,\`Z_0\` supply L2. L3 needs a numeric remoteness carrier on the WDL-preserving part of the game, a separate time/temporal rank layer. Its values are not functions of root \`V(q)\` alone and are not generally functions of root \`(V(q),M_WDL(q))\` alone.

Exactness must preserve terminal-FIRST stopping, gravity, P0/P1 perspective, all literal labels, and distinction between action value and full future-behavior isomorphism. The source original q identity remains the qualified game-behavior basis.

## Frozen independent true7×6 differential control

1. Produce diverse reproducible actual standard W=7,H=6,K=4 legal first-win-stopped physical q (source code, seed, histories). Select near-terminal positions permitting a bounded **independent branching reference only**. Compute full unrestricted V and all literal action values; build complete M_WDL. Then recursively compute D for WDL-nondraw states by the lexicographic min-win/max-loss law above, not by a cooperative line scan.
2. Find if possible **same WDL but different complete M_WDL** legal real standard7x6 source positions; this independently demonstrates why L1 is insufficient for L2.
3. Find if possible two genuine legal standard7x6 positions with **same scalar WDL AND same complete optimal literal-label set** but **different remoteness D**, demonstrating L3 is additional information even when L2 agrees. Compare literal labels in same physical orientation; record actual first-win-stopped histories, root q structural fingerprints or exact masks, candidate action distances, and independent outcome/reference statistics.
4. Find a true standard7x6 **single source state with multiple WDL-equal winning legal moves of different remoteness** if available, so a move remains fully L2-optimal but is not fastest L3 win. Likewise search for a true losing state with multiple equally WDL-optimal losses of different longevity. Preserve absent cases as sample-negative, not universal inability.
5. Physically validate first-win terminal and remoteness depth ≤ WH−Σh, never rely on already-terminal histories. All branching oracle/reference work is outside any source-only ZERO strategic future-evaluation producer and MUST NOT be misreported as owner-objective success.
6. Preserve q=44444 WDL UNKNOWN and full M_WDL UNKNOWN, hence D unknown. Do not use off-standard geometry as primary evidence or promote to IsoGraph semantic authority without independent qualification.

**Source qualification labels:** L1 root outcome certificate; L2-one-witness if one winning action but other labels unresolved; L2-complete only if ALL legal labels' optimal/nonoptimal membership proved; L3-remoteness only if WDL-complete and shortest victory/longest defeat under WDL-first responses is exact. Treat draw-duration preference as OPEN separately, not an arbitrary invented tie rule.
