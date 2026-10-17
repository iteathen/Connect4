# Exact one-center-marker phase defect in the canonical 7×6 history 44444

**2026-10-17 Pacific. Owner's research direction:** unfold true Connect Four geometry into a one-dimensional process without changing its equations, discover binary XOR row/column/center completion interaction. **Canonical owner:** research/semantic-quotient. **Status:** SOURCE MATHEMATICAL IDENTITY / CANDIDATE frozen BEFORE genuine 7×6 physical controls. Original global WDL and ALL optimal first-action labels remain UNKNOWN; zero strategic branching not solved. Preserve W,H,K symbolically in general formulas; experiment ONLY actual W=7,H=6,K=4 and K original winning-line windows.

## 1. Center capacity one => EXACT decomposition of any future legal word

At legal standard history \`44444\`, P1 is to move on absolute move six; h4=5, all six noncenter columns are empty. Thus remaining event capacities are

    (6,6,6,1,6,6,6),  total remaining T=WH-5=37.

Any complete hypothetical future bounded column-symbol word w is EXACTLY:
- a complete 36-letter **left/right word** \`u\` over symbols {1,2,3,5,6,7}, each occurring six times, respecting future gravity by ordinal;
- ONE distinguished center symbol \`4\`, inserted at a unique word rank \`m∈{1,..,37}\`.

The insertion decomposes w uniquely as \`u[:m-1] ++ [4] ++ u[m-1:]\`. This is a canonical source-level bijection between full hypothetical gravity interleavings and (left/right bounded word, center insertion rank). Actual gameplay stops at FIRST completed K-line; hypothetical words may extend beyond that terminal for validation only.

Let e be a future event in one of the left/right regions, and let \`j_reg(e)\` be its 1-based rank within that side's projected word, \`b_other(e)\` the number of opposite-side placements strictly before e in u, and \`I_m(e)=1\` iff the center symbol was inserted BEFORE e. Then its exact relative future placement rank is

    t_w(e) = j_reg(e) + b_other(e) + I_m(e).

Therefore the actual event-owner bit of e is EXACT

    χ_w(e) = [(n + j_reg(e) -1) mod2]
             XOR [b_other(e) mod2]
             XOR I_m(e) .

The unique center event x=(4,h_4=5) is placed at rank m and has exact owner

    χ_w(x) = (n + m - 1) mod2.

For the canonical n=5 this simplifies to center owner \`m mod2\` and noncenter owners \`(j_reg mod2) XOR (b_other mod2) XOR I_m\`. These are the owner's hypothesized **one-time column-fill phase-shift identities**. The marker does NOT "mysteriously" change row parity: it contributes exactly ONE earlier event to subsequent global-turn parity and consumes the last center-column gravity token.

## 2. Geometry and first-win still matter

Each surviving original source residual generator G∈R_p(q) is an exact set of future cell events contained in one original K=4 line, owner-tagged to p; at q=44444 the counts are R0=48,R1=42. The center marker may appear in G for some generator, and the owner of that center cell depends on marker rank parity. For a fixed supplied complete u,m, evaluate

    C_{p,G}(u,m) = PRODUCT_{e∈G} (1 XOR χ_w(e) XOR p).

The original line's source completion relative rank is max of t_w(e) over e∈G if C=1, else +infinity. First winning rank is the earliest such completion over BOTH players; no source completion => DRAW. This preserves all original four orientations, ROW height/gravity, center ownership, and first win.

Moving m while keeping u unchanged therefore affects:
- center cell owner bit itself;
- XOR phase of ALL subsequent noncenter events;
- winning source residual satisfaction and FIRST completion timing.
It does NOT change the literal left/right projected column order. The word representation and the ordinary source q cofactor process remain exact; this is fixed-word payoff algebra, NOT a perfect-play action-value proof.

## 3. Source interface / operator question

At 44444, compare move-six center (m=1, immediately fully consumes center) with delaying center until m>1. The player may deliberately control when the marker is consumed only through alternating choices with the opponent. A static enumeration of all m and all regional u is NOT the desired zero-branch algorithm. But this form isolates a potentially small *event-phase defect interface*:

    one center marker bit + 36 region word positions + 69 linked interval win factors + first-win rank.

A candidate zero-strategic-branching theorem would certify both complete nested action zero loci (Z+,Z0) directly from that source interface **without separately evaluating inequivalent regional words, marker insertion choices, or strategy trees**. No such theorem has been proved.

## 4. Frozen actual7×6 physical falsifiers

1. Reconstruct canonical q=44444 and all 69 original K-lines on W=7,H=6,K=4; no already first-win history.
2. Deterministically generate actual gravity-valid left/right 36-letter u with six occurrences per noncenter column; select several different valid center insertion ranks m, all yielding valid full 37-event schedules.
3. Independently compute every future cell's actual owner/rank from its true full word and compare \`t_w(e)\`, \`χ_w(e)\`, including center. Check all G∈R0/R1 per-owner source payoff against an independent 7×6 array-grid first-win physical observer, preserving terminal-first.
4. Hold u EXACTLY the same and change ONLY m. Find an actual witness in which first winner differs or first-win timing changes. This proves the marker interface causally matters at the canonical standard 7×6 source, NOT who wins under perfect play.
5. Count source generator incidences of the lone center future cell, and note that AFTER m=1 the original source q contracts owner lines and blocks opponent lines, yielding the previously qualified q=444444 residual (R0,R1)=(42,42). Other m are hypothetical later orders, not necessarily realizable perfect-play outcomes.
6. Do not infer unrestricted WDL or all-optimal labels at q44444. Do not treat exact u,m payoff evaluation as a strategic zero-branch producer. All full words here are explicitly validation inputs, no search tree, no solved table, no UI estimates or generalization to other board shapes.

**Scope conclusion:** turn sequence XOR, center completion and 4-cell original geometry have now been separated algebraically. Their product is still nonlinear in source win guards and in the adversarial choice of m/u; finding an exact closed source zero-locus operator is OPEN.

## Post-test exact interval-XOR transport law — a strictly linearized geometric phase operation

This is a DEDUCTION from the frozen single-marker identity, added AFTER the independent true7×6 marker controls, not part of the original pre-test frozen claim. Fix ANY one legal 36-symbol noncenter word u, and let u_j be its j-th event for j=1..36. For insertion rank m, this event is placed at relative global rank

    t_m(u_j) = j + 1_[j>=m].

Let m<m' be two different insertions of the SAME single center event into the SAME u. Then

    t_m(u_j)-t_m'(u_j)=1_[m<=j<m']  (ordinary integer equation);
    χ_m(u_j) XOR χ_m'(u_j)=1_[m<=j<m']  (GF(2) equation).

The center cell itself changes its owner by

    χ_m(center) XOR χ_m'(center) = (m'-m) mod 2.

**Thus MOVING the center event through the linear word is EXACTLY an XOR bit flip of ONE CONTIGUOUS INTERVAL of noncenter event owner phases, plus one potential toggle of the center owner's own bit.** No other noncenter owner bit changes. It can also be proved by factoring the move of the distinguished center marker into |m'-m| adjacent swaps with successive noncenter letters: each crossed noncenter event toggles exactly once, and the center bit toggles once per swap.

For any current source residual G, define its STATIC marker-sensitivity set as its required future event positions j in [m,m') together with whether the unique center event lies in G and (m'-m) is odd. A G whose source requirements intersect neither changed phase set has the SAME ultimate owner-conjunction result under the two complete hypothetical schedules, although its completion RANK must still be interpreted under original t_m/t_m' and cannot be discarded if first-win timing changes. The actual first-winning player of the entire game may flip because a pivotal other-player G changes its satisfaction.

This gives a literal **interval update operator on ONE linear word** and an exact source-local influence mask over all 69 K-line interval constraints. It is NOT a proof of affine perfect-play WDL: applying these interval XOR flips to distinct hypothetical schedules and then comparing their game outcomes does not implement the owner's zero-branch algorithm. An exact source operator for BOTH complete optimal-action zero loci remains the next unsolved problem. The actual 7×6 marker experiment (12,000 fixed schedules, 9,840 different-first-winner pairs even with same center owner, zero physical source mismatches) is consistent with this law and exposes its nontrivial first-win consequences.
