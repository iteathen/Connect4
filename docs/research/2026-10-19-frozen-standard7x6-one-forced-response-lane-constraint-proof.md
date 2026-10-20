# Frozen source theorem: one forced P1 defense lane with one fixed P0 gravity mate

2026-10-19. Canonical owner: research/semantic-quotient. Board ORIGINAL W7 H6 K4, first win stops, alternating P0 first. This proof attempt addresses the owner's question: identify the earliest rank at which P1's only immediately viable defensive choice leads, under one source-selected P0 policy, to an INDUCTIVE compulsory exposure. Frozen mathematical algorithm BEFORE running it over archival strong-perfect move histories. The archival 28 terminal winning-line identities and exact strong Oracle scores are HELD-BACK validation, not any input to the source producer.

## One-step source response formula

At genuine first-win-free P1-to-move rank n<=39 define original source current P0 P1 surviving one-missing K4 windows from ALL original69 four-cell lines. For each actual legal P1 column a let x=(a,h_a), y=(a,h_a+1) if inside H6, P0 currently playable winning singleton flags sigma_b (one per legal column), latent above P0 singleton flag lambda_a, P1 immediately winning move omega_a. Then

E_a = (1-omega_a) * (1-(1-lambda_a)*PRODUCT_(b currently legal,b!=a)(1-sigma_b)).

Exact current-board meaning: E_a=1 iff this P1 placement does NOT itself first-win but P0 can first-win on the immediate next move. Hence safe set S(q)={a original legal: E_a=0} can include a real P1 immediately winning reply; preserve firstwin terminal guard. E is only immediate-tactical source information, not ordinary full WDL for E=0.

## The sound inductive forced-singleton ladder

From one genuine P1-to-move source state q, apply the following exactly specified source producer with NO strategically inequivalent future-game value queries:

1. Inspect current legal action labels, source sigma/lambda/omega and calculate E. If S(q) is EMPTY, P0 FIRSTWINS next move against every legal P1 action; return SOURCE_PROVED_P0_WIN. Optional observer policy after P1 is the leftmost physical immediate P0 winning landing. This base theorem follows directly from original one-step four-body/firstwin cofactor, no full futures.
2. If S(q) has TWO OR MORE different literal P1 actions, return INCOMPLETE (do not simulate or value alternative future states). Distinct S actions are NOT inferred game-equivalent.
3. If S(q)={a*}, original P1 must choose a* to avoid losing immediately. Check physically that this original P1 action is legal and does not immediately P1-FIRSTWIN, otherwise INCOMPLETE. Since all OTHER P1 actions have E=1, the proof need follow only a*.
4. After this one licensed P1 action, if P0 has an immediately playable original winning site, choose deterministically the LEFTMOST legal immediate winner and return SOURCE_PROVED_P0_WIN.
5. Otherwise, P0's SINGLE deterministic policy is respond immediately ABOVE P1 in the SAME column a*, if this original physical cell is now gravity-playable. If unavailable, return INCOMPLETE. Do NOT try different P0 strategic reply actions. If that response firstwins, SOURCE_PROVED_P0_WIN. If nonterminal, increment rank by TWO and repeat at next genuine P1-to-move source.
6. A successful chain of forced singleton labels ending at empty safe set or earlier immediate win is a sound inductive P0 WIN proof on q under original gravity, alternating turns, and firstwin stopping. Each P1 branch either terminalizes P0 next (source E=1), or is the UNIQUE safe P1 branch continued, paired with exactly one fixed P0 response chosen from current source. A finite rank bound guarantees termination. This does NOT require a precomputed WDL oracle or best-move annotations, and it is not branching future game evaluations: only immediate current action labels are inspected and exactly ONE nonterminal pair lane materialized per proof step.

Set `maxPairs` to remaining original legal P1 turns; no success may be claimed if the producer returns INCOMPLETE, reaches full DRAW, encounters a P1 terminal, or encounters unsupported geometry.

**Qualification:** the source policy is a restricted sufficient WIN certificate, not a total Level1 WDL algorithm, NOT a proof that every perfect game follows the policy, NOT a proof the known root P0 win from EMPTY. It can be tested on genuine legal archived prefixes without using their terminal line IDs as source premises. A claimed NEW strategic domain must also be compared against older unrestricted valid SOURCE certificates on SAME source q.

## Frozen first controls

- Replay the 27 UNIQUE historical issue41 root-to-ply41 true W7H6K4 archived histories under independent original geometry, sampling EVERY odd occupied rank n1..39 as P1-to-move source root, without ever passing next history moves or line IDs to the source algorithm. Record SOURCE_CERTIFIED, INCOMPLETE, source-only forced-safe lane, forced opponent labels, selected P0 same-column mates, certificate depth, earliest rank on each distinct path and categories. A strong path is a validator population only; archive scoring not rerun.
- For the archived historical firstwinning line ID13 as representative, test ranks 33,35,37,39 individually with the SAME source logic. Prior one-step source tabulation finds: at n33 TWO immediately safe P1 columns (2 and7), n35 only P1 col7 safe, n37 only P1 col7 safe, n39 NONE. Candidate: rank35 can now be certified by exactly ONE forced lane P1 c7/P0 mate c7, repeated twice until n39. All other P1 actions at n35 and n37 permit P0 immediate original firstwin. Do not trust this expectation until independently checking.
- Compare fixed source proof to a separate ORIGINAL true colored physical-grid adjudicator including all P1 deviations at each certified proof step, verifying all nonchosen P1 alternatives firstwin for P0 on the immediately subsequent P0 play and forced branch mate chosen legally; no general future-game recursive minimax.
- NEGATIVE: a physical rank39 prefix of the known legal full DRAW must return INCOMPLETE, not P0_WIN. Also include original q where P1 can immediately first-win as guard.
- Detect center-full timing independently (at move6, ... move41) and compare with earliest ladder rank: center completion alone cannot be a universal rank-based diagnosis.
- Preserve source/falsifier and evidence, any failed controls or contradictions. No production solver edits, no IsoGraph1.2 gameplay authority promotion.

## Why the proof could matter

This may identify a genuine earlier **response obligation transition**: P1 does not merely have zero safe actions at n39; at n35 or n37 it may have precisely one safe column, and the deterministic P0 upper mate CONSUMES this reply resource until no safe reply exists. This is only one family of causal-step obligational certificates; a global source-WDL law needs earlier symbolic rank invariant and ability to handle several source-equivalent safe P1 choices, not a hidden strategy tree.
