# C4R9 — Exact source-derived P0 WIN at center-first rank9 via row4/row5 firstwin shadow

**Date:** 2026-10-23 Pacific. **Canonical:** research/semantic-quotient. **Research direction:** Josh Oshiro. **Pre-write HEAD:** cc12f0cc1d3b05fc34cc331ec550343b397085bd. **Proof status:** GUARDED_DEDUCTIVE_EXACT for this one legal original7x6 P1-to-move source, not a known-solution/oracle result and **NOT** an empty-board strategy. Underlying online P0 respondent policy originates in Oct20; the strict multi-row firstwin-shadow extension was proved in the Oct23 general theorem.

## Exact original7x6 position

The 9-move alternating gravity history from EMPTY is:

\`\`\`text
421425434
\`\`\`

P0 opens with column4 (center). Physical board (X=P0, O=P1, . empty, upper rows printed first):

\`\`\`text
r6  .......
r5  .......
r4  ...X...
r3  ...X...
r2  .X.O...
r1  XOOXO..
     1234567
\`\`\`

No side has won at any history prefix; 69 original K4 literal windows and an independent directional ray method verify physical firstwinner-free legality. Support occupied-heights h=[1,2,1,4,1,0,0]; **P1 to move at rank9**. All seven columns are legal.

The existing Oct20 source A=P0 responder policy has a current actual terminal trap in c3: if P1 enters its playable c3r2, P0 plays c3r3 and FIRSTWINS diagonal (c1r1,c2r2,c3r3,c4r4). Odd remaining-capacity nontrap base frontiers c1 and c5 are matched; all other nontrap columns follow the immediate D lower/A upper column-pair response.

P1 has **35** currently opponent-unblocked original K4 missing-mask sources, normalized into **31** WSL minimum residual obligations. The old static matroid capacity \(\rho_M\) makes 30 of those 31 **dependent** (\(|G|-\rho_M(G)\ge1\)), but leaves ONE independent P1 residual:

\[
G=\{(c4,r5),(c5,r5),(c6,r5),(c7,r5)\}.
\]

Thus the old correct static \(\Gamma_M=0\), which is INCOMPLETE rather than P0 LOSS. The new exact row-shift source-policy certificate proves this sole independent winning requirement is **firstwin-shadowed**:

\[
\begin{array}{c}
\mathrm{P1\ target:}\ (c4,c5,c6,c7)r5\\
\quad\Downarrow\quad \text{online P0 upper-mate obligations}\\
\mathrm{P0\ FIRSTWIN:\ }\ (c4,c5,c6,c7)r4\text{ strictly earlier}.
\end{array}
\]

P0 already owns c4r4 at source. For c5,c6,c7, under the OLD genuinely legal online source response policy P1 cannot reach each row5 site before P0 has immediately upper-mated its earlier entry on row3 to acquire row4. The strict event-order max-plus theorem \(\max_i t(P0,c_i,r4)<\max_i t(P1,c_i,r5)\) prevents P1's row5 firstwinner. Player1's 30 other residual modes are matroid-impossible. P0's terminal trap and finite legal response progress now guarantee an eventual P0 FIRSTWIN on **every adaptive P1 continuation**. No P1 strategic futures or outcome values were separately evaluated.

Consequently the FIRSTWIN-aware tropical source certificate has

\[
\boxed{\Gamma_M=0,\qquad \Gamma^\prec_M=1,\qquad
\mathrm{WLD}_{P0}(q)=\mathrm{WIN}.}
\]

## Exact WLD-only action-set corollary

At THIS P1-to-move source, all literal columns {1,2,3,4,5,6,7} are legal, and the respondent's single source-derived P0 winning strategy defeats **every** initial P1 action. Therefore each of the seven P1 moves has **P0 WIN** outcome; equivalently each is a **P1 LOSS** in ordinary WLD order. Every P1 action is tied in the **WLD-only** ordering. This does NOT assert seven identical future games, mirror/NEI behavior equivalence, equal proof objects, exact mate distances, or equal strong-value speed-preferred action scores. In particular P1 c3 allows P0's immediate terminal diagonal, while other P1 actions may produce later P0 wins.

The mathematical proof is the uniform causal source/firstwin field above; as narrow controls only, each of the seven initial literal P1 actions and its actual prescribed P0 response were checked against original69 physical K4s and WSL/Shannon matroid minors. The strict-firstwinner augmented threshold remained ≥1 on every live successor.

## Owner-depth counterexample at the SAME support

Another genuine center-first 9-ply source \`421424534\` shares h=[1,2,1,4,1,0,0], the same P0 c3 terminal trap and matched odd-base pair c1/c5. Yet P1 owns c4r3 in this other source, whereas P0 owns it in the WIN source. P1 then retains TWO independent WSL obligations: the upper H4 row5 c4..7 (shadowed) AND a row3 H4 c4..7 missing c5r3,c6r3,c7r3 (UNshadowed because c4r2 is P1-owned). Thus \(\Gamma^\prec=0\) under the same old P0 response policy.

Actual P1 replies \`5,5,6,6,7,7\` against that policy complete a genuine P1 FIRSTWIN at ply20 on row3 c4..7, with original69/ray agreement. This proves **failure of that particular P0 policy** in the counterexample, NOT P1's perfect-play winning value or any root result. Source owner-depth and firstwinner chronology cannot be replaced by column-height parity or unconditional positive numerical scores.

## General result and status

Full proof and exact noncommuting/typed safeguards:
- \`docs/research/2026-10-23-original7x6-firstwin-precedence-shadow-augmented-tropical-matroid-policy-theorem.md\`;
- \`docs/research/2026-10-23-frozen-center-first-rank9-twin-owner-depth-P0-shadow-formation.md\`;
- \`docs/research/2026-10-23-frozen-bi-tropical-matroid-nullity-and-firstwin-maxplus-event-order.md\`.

Verified source:
\`research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-original7x6-center-first-rank9-firstwin-shadow-policy-WLD.js\`, frozen report \`ORIGINAL7X6_CENTER_FIRST_RANK9_SHADOW_ALL_P1_WLD_0_1.json\`. The original independently built source program reconstructs all 69 K4/rays and both 9-ply legal histories, calculates all min WSL and rank/shadow guards, replays two NONBRANCHING counter-control trajectories, then checks all seven local first P1-response source cofactors/augmented rank. No previous solved-game WIN label, no game-tree state enumeration, maintained CI or external proof assistant.

**Missing original-root implication:** q was REACHED by one hand-constructed legal center-first sequence; nothing here proves P0 can FORCE its arrival versus every P1 response, that c4 is the unique best original empty opening by this particular proof, or that \(\Gamma^\prec\) closes into a small all-state WLD field. The remaining research is to derive a SOURCE-ONLY zero-strategic-fanout **formation theorem** forcing a P0-favorable \(\Gamma>0\) OR strict firstwin-shadow plus terminal progress region from the empty board, with no alternative game-valued futures.
