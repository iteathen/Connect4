# EMPTY original7x6: exactly twelve unblocked first-wave WSL modes, four-step Fibonacci reduction, and a universally forced first cross-response dipole

**Date:** 2026-10-22 Pacific. **Canonical owner:** iteathen/Connect4@research/semantic-quotient. **Research direction:** Josh Oshiro. **Pre-write HEAD:** f6a93fa89c19e6314998a041a0ff70790706e42b. **Status:** exact source field projection and bounded adversarial prefix implication. **DOES NOT PROVE EMPTY-ROOT PERFECT-PLAY WIN/LOSS/DRAW.** A fixed illustrative P0 sequence is NOT claimed optimal; no solved oracle labels, retrospective 28 winning line choices or sub-five Connect4 controls were used.

## 1. Why the preceding tropical winning policy cannot be simply applied at EMPTY

The prior exact guarded theorem \`docs/research/2026-10-22-causal-Shannon-matroid-tropical-WSL-field-certificate.md\` uses a **physically enforceable** responding player matroid M_Q with an already-present terminal trap C≠∅ and positive opponent obligation nullity
\(\Gamma_Q=\min_{G\in A_D}(|G|-\rho_Q(G))\ge1\).
Both are load-bearing: Γ>0 excludes opponent FIRSTWIN under the prescribed mate policy; a nonempty latent terminal trap ensures the respondent actually FIRSTWINS after a bounded number of nontrap paired responses. Together they form a true source-to-WDL certificate, with all opponent replies handled by one matroid minor identity and a decreasing progress counter; no strategic future state values needed.

At EMPTY, neither player's winning-line potential is small or already trapped: each has the SAME **69 original four-site K4 requirements** (H24,V21,R12,F12), all columns have even6 residual capacity, and no existing A single-cell winning trap C. Consequently **the October20 responder theorem cannot be applied at the root**. We now quantify exactly which hypothetical original P0 completion modes escape the simplest legal response policy.

## 2. Root field projection under a fixed same-column upper mate

Imagine A=P1 replies to each P0 new entry in column c by taking the just exposed **same-column upper cell**, until A itself firstwins or the response fails. With all source capacities6 even, this fixed policy would constrain P0 future ownership to even/odd vertical pairs' **lower** original physical rows r1,r3,r5. Let \(E=\{(c,r):c=1,\dots,7,\ r\in\{1,3,5\}\}\) be those 21 physically actual lower sites; even rows r2,r4,r6 are matroid LOOPS for prospective P0.

At original EMPTY every K4 L is a source antichain generator. Its rank under the upper-mate free/loop matroid is \(\rho_E(L)=|L\cap E|\). The exact original69 deficit histogram is:

| Deficit \(\nu(L)=4-\rho_E(L)\) | Original four-in-row windows |
|---:|---:|
| 0 | **12** |
| 2 | 45 |
| 4 | 12 |
| **Total** | **69** |

Precisely the **12** \(\nu=0\) windows are the original horizontal K4 sliding starts c1..c4 on physical rows **r1, r3, r5** (4 starts ×3 rows). All 21 original vertical windows, all24 original two diagonal types and all12 even-row horizontal windows contain inaccessible upper sites and are annihilated by this particular matroid. The **source field survives** because Γ=0:

\[
\boxed{
\pi_E\Phi_{P0}(\mathrm{empty};z)=
\bigvee_{r\in\{1,3,5\}}\;\bigvee_{c=1}^{4}
z_{c,r}z_{c+1,r}z_{c+2,r}z_{c+3,r}.
}\tag{1}
\]

Here \(\pi_E\) is the STATIC Boolean projector setting every upper-row hypothetical P0 owner bit to zero. This is an **exact original69 physical K4 source** equation. It is not a P1 static drawing certificate; the P0 surviving horizontal modes make this upper-mate strategy vulnerable.

These 12 source modes are not the historically **solved-game-conditional** 28 winning lines or the 27 correlation/syzygy modes. The shared number12 by itself supplies no identity with the earlier 12-dimensional rank or cohomology groups.

## 3. Four-step Fibonacci language of the projected field

For ONE seven-cell physical lower row, the complement of the projected H4 OR event is a binary string of length7 containing NO contiguous run of four 1s. Let \(f(n)\) be the number of such strings of length n. A finite automaton tracking the last three bits proves:

\[
f(0),\dots,f(7)=1,2,4,8,15,29,56,108,
\]
\[
f(n)=f(n-1)+f(n-2)+f(n-3)+f(n-4)
\quad (n\ge4).
\]

The three selected physical rows r1,r3,r5 have independent site variables under this STATIC projection. Their whole no-K4 generating partition is the product of three copies of the one-row four-run-avoidance automaton, so

\[
\boxed{Z_E(\mathrm{no\ K4})=108^3=1,259,712.}\tag{2}
\]

Out of \(2^{21}=2,097,152\) possible hypothetical P0 occupancy subsets of E, exactly 837,440 contain at least one projected H4. These are **static Boolean physical-site subsets**, NOT enumerated valid game positions or percentages of P0 winning strategies. It is an exact 4-step Fibonacci/finite-language connection at the whole root **source geometry** level, separate from previous CPC turn-budget Fibonacci heuristics.

The source code reconstructs 69 ORIGINAL physical K4 windows and their rank deficits, computes 108 both by a three-bit linear automaton and a direct 128-word local single-row truth table, and has an independent Python reproduction.

## 4. A genuinely ROOT-STARTING (but short-horizon) causal formation lemma

The static defect in (1) suggests an original physical four-in-row P0 **challenge**. Fix the illustrative P0 script on its first four own turns:

\[
\boxed{P0:\quad c4,\ c3,\ c5,\ c2\quad
\text{on plies }1,3,5,7.}
\]

These column labels are distinct and their bottom cells form the original H4 window c2r1,c3r1,c4r1,c5r1. The first action c4 is central. This complete script is **not** declared strategically optimal or compatible with the previously certified structural best-center prefix after P1 deviations; its purpose is to derive a universal source-response formation implication, not a full opening.

Let P1's first three actual replies be arbitrary legal \(b_1,b_2,b_3\), and let \(a=(4,3,5)\) denote the respective latest P0 columns. Define \(d_j=[b_j\ne a_j]\).

- If all \(d_1=d_2=d_3=0\), the first six moves are \(4,4,3,3,5,5\), with P0 owning row1 c4,c3,c5 and P1 owning row2 directly above each. The P0 move c2 at ply7 lands row1 and FIRSTWINS the TRUE original H4 c2..c5. Neither player could have won before (each owner has only at most three stones).
- Otherwise let j be the **first** P1 off-column response. Before j, every completed P0/P1 pair occupied a fresh column twice, hence all **residual column-height parity** bits u were zero. At j, P0 newly plays column \(a_j\); P1 plays a DIFFERENT column \(b_j\). Exactly TWO height parity bits toggle, namely those of a_j and b_j:

\[
\boxed{u_{\mathrm{first\ deviation}}=e_{a_j}+e_{b_j}\in\mathrm{GF}(2)^7,
\qquad \delta=\partial u.}\tag{3}
\]

This is exactly the original rank-causal paired GF2 seam dipole operator studied on October19/20, now proven to occur on **every** P1 response policy that avoids the fixed-script firstwinning branch, no assumption of P1 perfect play.

The universal bounded-prefix implication is:

\[
\boxed{\operatorname{Win}_{P0}\text{ by ply7}
\quad\lor\quad \exists j\in\{1,2,3\}: b_j\ne a_j.}\tag{4}
\]

This is proved by case analysis on the **FIRST DEVIATION BOOLEAN**, not by evaluating 7^3 branching game futures. Any fixed P0 prescribed target column remains legal through ply7: it is played by P0 at most once and P1 has placed at most three stones total, so no six-high full column is possible at its first P0 entry. P1 can never have four owned sites by ply6 and thus has no earlier P1 firstwinner. All-FOLLOW path \`4433552\` was checked by original69 masks and independent directional rays. For the FIRST deviation local control, the checker inspected only 3 possible earliest stages ×6 distinct alternate reply column labels=18 local parity/ray cases, not an exhaustive opponent reply tree.

**What actually forms:** a physically original, legally caused, nonzero **two-site height parity dipole** at the first P1 defense that differs from immediately following P0's column. It creates two ODD remaining-capacity columns at that time. It does NOT immediately certify that both are admissible unmatched nontrap odd-base Q sites for the October20 respondent theorem, nor provide a guaranteed responder A=P0 terminal trap. The first deviation happens on a P1 turn and leaves P0 to move, whereas an A=P0 respondent certificate requires source D=P1 to move. No player-value inference from this parity defect alone is valid.

This is a **first formation step** at the root, not the long-range formation law the user ultimately requires.

## 5. Unified algebraic map and remaining exact step

The strongest exact currently available causal field-to-value bridge has a clear layout:

\`\`\`text
FULL source WSL Shannon q_o attack field Phi_D
  ↓ impose an ACTUALLY LEGAL online respondent contract (C,Q,E,X)
  ↓ restrict future D-owner variables to independent sets of source matroid M_Q
  ↓ Gamma_Q = MIN_{G in A_D} (|G| - rank_Q(G))
  ↓ Γ>0 annihilates every D winning obligation at once
  ↓ every actual D/A mate = Shannon conditioning + matroid contraction/deletion
  ↓ Γ' >= Γ (uniform causal field invariant)
  ↓ nontrap capacity m decreases; finite terminal trap C forces A FIRSTWIN
  ⇒ guarded exact responder WIN with NO strategic successor WDL evaluations
\`\`\`

The empty-root row of that map currently **fails** at two specific mathematically testable places: the simple upper-mate \(\Gamma=0\) due to 12 horizontal source modes, and the terminal trap C is initially absent. Our new root-specific fixed P0 challenge (4) can force an initial GF2 odd-base dipole if P1 avoids the immediate win, but does **not** prove a later Γ>0 region or trap formation against every adaptive response.

A real empty-board WDL theorem still requires a **nonforking, source-derived formation/transport identity**, with exact P0/P1 roles and chronological winner/draw guards, that transforms the unavoidable first dipole (or a more general source symmetry invariant) into an A=P0 winning response certificate, or a different sufficient win mechanism, without evaluating inequivalent future q continuations. Failure of the CURRENT matroid frame at EMPTY does not rule out such a theorem.

## 6. Evidence and epistemic limits

Frozen protocols (before independent original-source verifiers):
- \`docs/research/2026-10-22-frozen-empty-root-vertical-mate-matroid-first-unblocked-modes.md\`
- \`docs/research/2026-10-22-frozen-root-first-response-dipole-formation-certificate.md\`

Checked-in JS source, read back from GitHub and rerun:
- \`research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-original7x6-empty-root-vertical-matroid-12-unblocked-four-run-modes.js\`
- \`.../verify-original7x6-root-first-cross-reply-GF2-dipole-or-firstwin.js\`

Independent Python original69/first-source source reconstructor:
- \`.../verify-independent-original7x6-root-modes-and-22ply-tropical.py\` (same original geometry outcomes and rank22 matroid source histogram, separately implemented).

Exact machine packets:
- \`.../ORIGINAL7X6_EMPTY_ROOT_VERTICAL_MATE_12_HORIZONTAL_FIBONACCI_MODES_0_1.json\`;
- \`.../ORIGINAL7X6_ROOT_FIRST_GF2_DIPOLE_OR_P0_FIRSTWIN_CERTIFICATE_0_1.json\`;
- \`.../ORIGINAL7X6_SHANNON_PARTITION_MATROID_TROPICAL_CAUSAL_POLICY_0_1.json\`.

**No exhaustive original game positions, no minimax successor-value enumeration, no solved input; maintained CI/external independent proof assistant NOT run.** All quantified results are exact only under their explicit guards; neither October20 paired-responder WIN theorem nor today's root formation lemma establishes root7x6 perfect-play WIN as an independent no-search theorem.
