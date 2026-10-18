# Source-root win exclusion + one action nonloss yields a valid DRAW-tier Level2 continuation

**Date:** 2026-10-17 Pacific. **Canonical owner:** research/semantic-quotient. Status: exact restricted-domain source structural theorem FROZEN before physical reference, not a general arbitrary7x6 no-search solver. W,H,K symbolic; test actual standard 7×6 Connect Four W=7 H=6 K=4.

The owner distinguishes the COMPLETE Level2 best action SET from one VALID best move continuation. For a mover p at genuine first-win-stopped q=(h,R0,R1), ordinary P0-relative minimax outcome is V and each first action has J_a. Treat outcome preference relative to the mover.

**Root no-forced-win certificate `NO_FORCE_WIN_p(q)`:** a mathematically sound original source criterion proving p CANNOT FORCE a first win against perfect o, for the entire q game regardless of the current p first move. Existing such source theorems include (i) empty R_p, which means p can never win even against poor play, and (ii) a gravity-safe ORIGINAL all-remaining-cells pairing that lets o always respond second to thwart every p original residual win generator. The latter proves p lacks a guaranteed winning strategy, NOT that p wins are impossible under other opponent strategies.

**Single action forced-nonloss certificate `AVOID_LOSS_p(q,a)`:** another sound original source criterion proving that after literal a, p CAN GUARANTEE at least a DRAW against perfect o. First-win stopped event ordering must be respected. The existing co-release after-first-action opponent-attacker FIRST / owner-defender SECOND pairing has this property, as does source proof that the move removes every opponent residual winning requirement (including full-board non-winning draw).

**Exact composition theorem:**

    NO_FORCE_WIN_p(q) AND AVOID_LOSS_p(q,a)
      ==> J_a(q) = DRAW and V(q) = DRAW
      ==> a is a mathematically BEST LEVEL2 move in PERFECT-opponent mode.

Proof: by sound root upper bound, p cannot guarantee WIN on any legal original first action; by sound action lower bound, this particular a guarantees at least DRAW. Therefore the best outcome class at q is exactly DRAW, and a belongs to it. No outcome value of any OTHER legal first action is required; there is no timing ranking or special condition on other optimal drawing labels.

In P0-relative intervals `[L_a,U_a]`, for p=P0 the root no-win certificate provides `U_root<=0`; selected action nonloss `L_a>=0`. For p=P1, root no-win gives `L_root>=0`; action nonloss gives `U_a<=0`. Root interval is a global ALL-current-actions statement; it must NEVER be deduced from examining a single losing alternative. Both forms yield current mover draw and valid a.

**One-witness general interval theorem:** For any SOUND action intervals `[L_a,U_a]`, a first action a is provably WDL-best without knowing all WDL values if:
- P0 mover and `L_a >= max_{b in A(q)}U_b`.
- P1 mover and `U_a <= min_{b in A(q)}L_b`.
Equality IS ALLOWED and may hide unknown equal-best actions. This is a direct BEST ACTION certificate, strictly weaker than complete Level2 set classification and weaker than the previous `source-optimal-set-separation.mjs` full-membership test. A root-global upper/lower certificate can replace `max_b U_b` / `min_b L_b` altogether without scanning other action-specific future-game values.

**Frozen true7x6 source experiment:**
1. Produce one source-only composition operator depending ONLY on existing independently proven `global-no-win-bound.mjs` and `co-release-global-no-win-bound.mjs` root global bounds, plus `co-release-after-first-move-nonloss-bounds.mjs` per-original-action nonloss, and old exact direct source action values. Restrict proof claims to sound COMPLETE interval outputs and original first-win guard. All pair-search choices are STRUCTURAL release proofs, not explored future game values.
2. Sample genuine original 7×6 nonterminal q, test direct gravity response-cover winning action first as higher WIN tier; otherwise attempt the root no-force-win + a nonloss proof. Claim valid DRAW move only when both guards pass. If no candidate, INCOMPLETE. This is a valid operational Level2 win/draw witness without full action vector.
3. Independent physical WDL minimax reference verifies q root=draw and selected a child=draw on late true7x6 positions. The candidate source operator must NOT call `solve()` or construct multiple future q games. Record all static pair enumeration costs, success/failure, and whether new DRAW witnesses are beyond prior full-set direct source rules.
4. Counterfactual falsifier: intentionally OMIT the NO_FORCE_WIN root condition and find a true7x6 source where a guarantees DRAW but another a can FORCE WIN. This proves a draw action without root exclusion is NOT automatically Level2 best; do not reuse a merely existential draw line as adversarial proof.
5. If pair tools cannot certify enough actual7x6 cases, report SAMPLE NEGATIVE, keep theorem sound, and do not enlarge domain by unproven matching assumptions.

**General result still OPEN:** a total no-search arbitrary-q Level2 best continuation including P0/P1 winner/draw/loser, and canonical `44444` unresolved. Independent branching physical reference for VALIDATION only; no new IsoGraph 1.2 authority.


## Independently executed true 7×6 controls (2026-10-17)

Source implementation: `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-one-action-root-noforce-win-draw-certificate.mjs`. Pre-run frozen physical control: `standard7x6-one-draw-best-source-independent-physical-control.mjs`. Complete machine evidence: `STANDARD7X6_ROOT_NO_WIN_SINGLE_DRAW_BEST_SOURCE_RESULTS_0_1.json`.

From **1,250** independent non-winning physical trajectories, **8,899** genuine first-win-stopped actual7×6 late q (rank≥31) were examined by the source. **327** source roots had a certified inability of the current player to FORCE a win; **213** of these had a valid DRAW-preserving original literal action and returned `VALID_CONTINUATION`. Exactly **198** used trivial owner-original-winline extinction as root no-win proof; **15** used the nontrivial source original **GLOBAL gravity-safe defensive pairing** even while owner winning requirements survived. The selected action avoided loss via source opponent-all-winline blocker, gravity co-release pairing or other sound original source first-action bounds. The remaining **114** root no-forced-win certified cases did not yield a selected DRAW action and stayed INCOMPLETE.

The independent original PHYSICAL ordinary full recursive WDL reference examined root AND selected first-action outcome for **180** source-positive late original7×6 states. Every checked root had scalar DRAW and every selected action outcome was DRAW. **ZERO** root/action WDL mismatches. This is truly an outcome-tier optimal move: all potential WIN actions are excluded by the original root SOURCE no-force-win theorem; there is no need to evaluate any competing original action value.

**Non-extinction witness:** genuine original first-win-stopped history `14134251643437345353422222717671666517` at rank38, P0 moves: source global defensive pairing proves P0 cannot FORCE a win, although P0 residual R0 is nonempty. The source first action **literal column 5** blocks all remaining original P1 win requirements and guarantees a draw. Independently confirmed against physical full recursive reference. Earlier all-empty-R direct theorem cannot explain the root; other historical pairing+root value methods may overlap, so no claim of global marginal coverage against every archived theorem.

**Scope and risk:** The source's proof combining two independent unilateral outcomes remains sound for any ordinary original7x6 q meeting guards, not merely the tested sample. The source-only candidate visits no game successor q or strategic alternative WDL query; it scans static root matching candidates and all original literal action masks. The selected move is Level2 best under PERFECT opponent assumption; UNKNOWN opponent optimistic opportunity mode is a different evaluation. Node26 CI and external formal qualification not run, IsoGraph 1.2 unchanged.

## Relation to complete Level2 information

The previous exact interval closure `source-optimal-set-separation.mjs` requires inferiority/membership certification across ALL original labels to output COMPLETE Level2; this result does NOT. The root global no-winning bound plus ONE per-action guaranteed DRAW lower bound suffices. Its generic one-witness interval condition is `L_a ≥ max_b U_b` on a P0 turn, or `U_a ≤ min_b L_b` on a P1 turn; equal-best ties may remain UNKNOWN. This distinction now becomes a concrete source-only DRAW continuation implementation, not merely a definition.
