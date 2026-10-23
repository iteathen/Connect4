# C4XR — An exact signed cross-ribbon source field and a gravity-reflected counterthreat on the original 7×6 board

**Date:** 2026-10-23 Pacific. **Canonical research owner:** iteathen/Connect4@research/semantic-quotient. **Research direction:** Josh Oshiro. **Pre-write HEAD:** 3fd5d1b8274643b54536bc6ca086ff360bc230c8. **Evidence status:** exact Boolean finite-source identities and true original7x6 physical firstwinner controls, independently GitHub-readback and V8 executed. Not qualified IsoGraph1.2 game-value authority and **not an EMPTY-board perfect-play WLD solution**. Historical RBA/q_o, CPC and Oct20 legal online matroid response theorems remain prior work, not retrospectively new.

## 1. One concrete cross-line multiplication missed by a purely vertical-defense model

Start from actual center-first, firstwinner-free original7x6 rank8 source history \`42142544\`, Player0 to move, heights \([1,2,0,4,1,0,0]\). P1 has claimed physical c4r4 and blocked P0's earlier grade2 diagonal. P0's normalized WSL minimum has exactly 13 grade3 and26 grade4 residual source masks; the previous support-envelope theorem established two grade3 short **vertical** direct-firstwin generators (columns c1,c2) and one grade4 diagonal READY-trap generator requiring P1 c3r1/c3r2, but deliberately did **not** enumerate grade3 READY traps after P0 uses a third site for support.

Two different TRUE original horizontal K4s at physical row3 share a P0 already-owned c4r3 and TWO missing P0 owner sites:

\[
\begin{array}{c|c|c}
\text{original H4} & \text{initial P0 missing source mask}&\text{physical P0 preowned}\\
c1r3,c2r3,c3r3,c4r3&G_L=\{y_L=c1r3,f_1=c2r3,f_2=c3r3\}&c4r3\\
c2r3,c3r3,c4r3,c5r3&G_R=\{f_1=c2r3,f_2=c3r3,y_R=c5r3\}&c4r3
\end{array}
\]

Both are actual **minimal grade3** P0 requirements on q8. Holding all other physically distinct source future-owner variables z=0, the entire original normalized P0 WSL Boolean field restricted to these FOUR actual sites is EXACTLY

\[
\boxed{
\Phi_{0,q8}(f_1,f_2,y_L,y_R)
=f_1f_2(y_L\lor y_R)
=f_1f_2y_L+f_1f_2y_R-f_1f_2y_Ly_R .
}\tag{1}
\]

The source restriction was checked on all16 possible hypothetical Boolean settings of the FOUR real physical owner-site variables, and via the actual original69 K4 + antichain model, NOT by generating full boards. The signed mixed-endpoint source circulation after both shared cells are fulfilled is

\[
\boxed{
\Delta_{y_L}\Delta_{y_R}\Phi_0(f_1=f_2=1)
=\Phi(F+y_L+y_R)-\Phi(F+y_L)-\Phi(F+y_R)+\Phi(F)
=1-1-1+0=-1 .
}\tag{2}
\]

This is a clean exact **negative cross-wing overlap** term in the BOOLEAN/source owner-site Fourier/Möbius expansion. It is NOT a historical OOO signed descriptor triangle, six-BOARD C6 signed circuit, winner probability, or game-value score. Under the source support guard \(h_{c1}=h_{c5}=1\), both y endpoints can be READY traps if D permits A to fulfill f1,f2.

## 2. A real defender vertical-block reaction produces TWO actual P0 horizontal READY traps

The bounded physically legal A=P0/D=P1 alternating five-move continuation from q8 is

\`\`\`text
A c2r3, D c2r4, A c3r1, D c3r2, A c3r3
\`\`\`

The resulting ORIGINAL firstwinnerfree rank13 history is \`4214254422333\), h=[1,4,3,4,1,0,0], P1 to move. D c2r4 indeed BLOCKS the prospective P0 vertical c2r2..r5, but D c3r2 SUPPLIES the gravity support allowing A to claim c3r3. A owns f1=c2r3 and f2=c3r3, so both initial source minimal H masks collapse to singleton y_L=c1r3 and y_R=c5r3. Both endpoints lie exactly one row above their true playable frontiers c1r2/c5r2 (source h1=h5=1).

\[
\boxed{\operatorname{ReadyTrap}_{P0}(q_{13})=\{c1,c5\}.}\tag{3}
\]

This is the sought EXPLICIT real geometric **vertical-defense → horizontal-trap coupling**. It is a witness to one source event history, not an adversarially forced P0 policy from q8. Literal all69 K4 windows, original gravity and independent physical directional ray firstwinning check pass through every source prefix.

**Important online responder obstruction:** at P1-to-move rank13, the two P0 ready traps C={c1,c5} have ODD remaining capacities5 each. The ONLY unmatched odd remaining-capacity nontrap column is B={c3}, remaining3. The existing Oct20 respondent odd-Q **perfect matching** policy requires B even, so its certificate is **INELIGIBLE** at this source; it is incorrect to declare P0 WIN merely because two READY traps exist.

## 3. A universal local *gravity threat-reflection* operator on adjacent H4s

There is an exact local two-row source theorem, not just a numeric resemblance. Take any original horizontal interval \(I=(s,s+1,s+2,s+3)\) (4 starts on original width7) and adjacent rows r and r+1 (four possible row-pairs r=2..5). Let A be the mover, D the other owner, and suppose q is genuine LIVE with:
- A already physically owning \((s+1,r),(s+2,r),(s+3,r)\);
- D already physically owning \((s+1,r+1),(s+2,r+1),(s+3,r+1)\);
- height at left column s exactly r−2, so its next empty physical cells are \(a=(s,r-1),d=(s,r),u=(s,r+1)\) in gravity order.

This is the rank-local guard

\[
\Theta_{A\to D}(q;s,r)
=[h_s=r-2]\prod_{j=1}^3x_{A,(s+j,r)}x_{D,(s+j,r+1)}.
\tag{4}
\]

Assume no other immediate terminal FIRSTWIN preempts the local exchange. Then:

\[
\begin{aligned}
A:a=(s,r-1)&\Rightarrow\text{A WIN at the now-playable }d=(s,r)\text{ if D fails to block};\\
D:d=(s,r)&\Rightarrow\text{D WIN at the now-playable }u=(s,r+1)\text{ if A fails to block};\\
A:u=(s,r+1)&\Rightarrow\text{D upper H4 blocked, NO A winning conclusion}.
\end{aligned}\tag{5}
\]

**Proof:** the three owner-specific right sites of each original H4 are irrevocably occupied. Filling the lower support advances the left frontier to d; D occupying d prevents A's completion but advances the same frontier to u, where D's pre-existing upper 1-cell residual H4 now becomes immediately playable. A can deny it at u, but that is not itself a WIN. The older WSL source singletons **already existed** in the abstract residual antichains; what changes is GRAVITY PLAYABILITY. Do not falsely claim D's original upper singleton was created by a source cofactor.

This proof holds as one conditional original7x6 field rule. A separate committed checker verified every original width7 H4 start × every valid adjacent row pair (4×4=16 source physical geometry instances) plus a genuine legal source witness and original69/directional rays. The general theorem is about LEGAL q satisfying its guards, not artificially claiming those sixteen static configurations are all reachable game boards.

## 4. At the double trap, P1's forced blocking action activates the *opposing* upper H4

At q13, if D=P1 immediately enters c1r2 or c5r2, A=P0 next FIRSTWINS the corresponding original H4 row3 (both were physically checked). But q13's odd nontrap c3 can be entered instead. The true source chain is:

| Rank | Mover/action | Original source field after action |
|---|---|---|
| 13 | current P1 turn | P0 READY traps c1,c5; no immediately playable firstwinner |
| 14 | P1 c3r4 | P1 row4 right triple c2,c3,c4 forms beside P0 row3 right triple c2,c3,c4 |
| 15 | P0 c1r2 | P0 next-playable WIN c1r3; P1 has NO immediate counterwin |
| 16 | P1 c1r3 | P1 blocks P0 row3, but P1 now has next-playable WIN c1r4 on original row4 H4 |
| 17 | P0 c1r4 | P0 blocks P1 row4; no actual firstwinner yet |

The rank14 source is genuine firstwinner-free word \`42142544223333\`. Equation (4) applies with s=1,r=3,A=P0,D=P1. The exact current FIRSTWIN frontier sets at ranks14,15,16,17 are (\(\varnothing,\varnothing\)), (\(\{c1\},\varnothing\)), (\(\varnothing,\{c1\}\)), (\(\varnothing,\varnothing\)) in (P0,P1) order. This is a real owner-labelled **threat reflection one row upward**, not search of terminal game continuations.

## 5. Restoring odd-base parity is still NOT an online P0 WIN certificate

After the forced P0 c1r4 block, the actual live P1-turn rank17 word is \`42142544223333111\`, heights [4,4,4,4,1,0,0]. P0 still has current ready trap C={c5} (odd remaining capacity5), and now odd nontrap B={} is EVEN. So the old Q matching **exists**. Nonetheless the complete original P1 normalized WSL minimum has22 requirements and the old partition matroid nullity distribution

\[
\begin{array}{c|rrrrr}
\nu_M(G)&0&1&2&3&4\\
\#G&1&6&10&1&4
\end{array}
\quad\Longrightarrow\quad\boxed{\Gamma_M(q17)=0.}
\tag{6}
\]

The one independent, NOT FIRSTWIN-SHADOWED P1 residual is **original H row5 c1..c4**, missing all four physical cells. P0 cannot guarantee an earlier aligned H row4: P0 owns c1r4, but P1 owns c2r4,c3r4,c4r4. A different policy may still WIN, but this particular matroid/source firstwin certificate does NOT establish it.

The signed firstwinner orientation is essential. With the samecolumn **UPPER** mate P0 response rule, the actual original legal source counter-policy from q17 is D=P1 c1r5, A=P0 c1r6, D c2r5, A c2r6, D c3r5, A c3r6, D c4r5. P1 FIRSTWINS on **ply24** by physical H row5 c1..4, BEFORE P0 could make a fourth upper r6 response. The winning lower D line does NOT have the safe **A-LOWER / D-UPPER** ordering of the earlier successful rank9 strict P0-FIRSTWIN shadow. In the reversed orientation D reaches the lower row5 H4 completion first and A's upper reply is too late.

This is an exact **counterexample to the proposed fixed upper-mate response policy**, NOT a proof q17 or q13 has P1-winning value. The actual game might permit a different P0 response. Parity restoration + one READY trap are necessary policy-frame details but not sufficient source WLD.

## 6. Mathematical consequence for the owner-requested non-search empty-root WLD

We have genuine field-level coupling across all of:
- source two-wing H3 Boolean inclusion/exclusion \(\Phi=f_1f_2(y_L+y_R-y_Ly_R)\) with signed highest term −1;
- vertical mate blocking that physically supports a distinct horizontal owner obligation;
- two simultaneous READY traps generating a **matching parity obstruction**;
- a legal local gravity ladder that reflects a directly playable FIRSTWIN from A row3 to D row4;
- a later **wrong-orientation FIRSTWIN race**, proving not every geometrically aligned lower/upper original K4 is a safe online-shadow certificate.

This establishes a **typed multi-row causal operator** and multiple independently checked exact guards, not a compact closed all-state winning-value algebra. It does not prove P0 can FORCE the q13 history from q8 or the original EMPTY board, or that the q17 position is a true WLD LOSS for P0.

**The next missing theorem is an A=P0 causal response-selection / capacity-contraction law** that preserves BOTH owner source WSL fields, gravity support, odd-base matching and the direction of firstwinner precedence when P1 avoids trap columns or creates its own higher-row WIN. It must demonstrate a P0-favorable controlled invariant from EMPTY against EVERY adaptive P1 move without computing branching child game values. The q17 original independent P1 H row5 and correct strict firstwin order are mandatory negative controls for any such candidate.

## 7. Source integrity and negative evidence

Frozen before physical source rechecks:
- \`docs/research/2026-10-23-frozen-C4Q8-vertical-mate-to-row3-horizontal-trap-transfer.md\`;
- \`docs/research/2026-10-23-frozen-C4Q13-to-Q17-odd-repair-row4-deadline-and-row5-P1-lower-shadow-counterexample.md\`;
- \`docs/research/2026-10-23-frozen-original7x6-adjacent-H3-row-threat-reflection-operator.md\`.

Full actual original69 source/ray/WSL verifiers, committed then GitHub-readback executed:
- \`research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-original7x6-q8-vertical-to-horizontal-grade3-trap-transfer.js\`;
- \`.../verify-original7x6-q13-double-trap-q17-lower-row-precedence-counter.js\`;
- \`.../verify-original7x6-H3-adjacent-row-gravity-threat-reflection.js\`.

Source-blob linked JSON results:
- \`.../C4Q8_VERTICAL_BLOCK_H3_DOUBLE_TRAP_0_1.json\`;
- \`.../C4Q13_Q17_SIGNED_FIRSTWIN_ORDER_LOWER_P1_0_1.json\`;
- (new) \`.../C4XR_ADJACENT_H3_THREAT_REFLECTION_0_1.json\`.

**Qualification:** exact symbolic/source physical deductions under stated guards; all true original7x6 K4 geometry, no full game-space or solved prior labels. Maintained Node26 CI and external theorem prover NOT run. Qualified IsoGraph game-theory 1.2 and separate solver implementations unchanged.
