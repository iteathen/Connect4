# Exact Boolean event-rank payoff factorization DIRECTLY from source q=(h,R0,R1)

**Date 2026-10-17 Pacific. Status: DERIVED MATHEMATICAL SOURCE IDENTITY, frozen BEFORE independent actual 7×6 physical first-win falsifier.** Owner direction: geometry plus alternating sequence encode a binary outcome core, turn phase factored by XOR. Canonical research: research/semantic-quotient. Keep W,H,K explicit, standard W=7,H=6,K=4 only as current test geometry. No claim of arbitrary-legal zero-strategic-fanout (V,M*) or IsoGraph 1.2 promotion.

## 1. Avoid assuming q stores lost physical color history

Qualified q orientation-sensitive future behavior is determined by column heights h and both normalized minimal residual winning families R0,R1. Equal q need not retain historical individual colored-cell identity. The previous full physical original-line monochromatic parity identity is sound when colors are known, but a candidate source-only solver MUST not reconstruct purported old colors from q.

Instead, evaluate each **source surviving residual winning requirement** G in R_p directly. Such a G is the remaining future-cell subset of at least one original K-line whose already occupied cells all belong to p and none to 1-p. Superset requirements may be absorbed: any realized larger requirement implies the smaller realized no later, so the FIRST terminal consequence is preserved.

## 2. Future event clock as XOR

For any gravity-legal hypothetical full future column-order schedule σ of T=WH-n remaining placements from q (regardless of first-win early stopping), let tσ(e)∈{1,...,T} be the relative placement number of future cell e=(c,r). Define its owner phase

    χσ(e) = (n+tσ(e)-1) mod 2.

Equivalently, if b_d(e) is the number of earlier future placements in OTHER column d,

    χσ(e)=(n mod2) XOR ((r-h_c) mod2) XOR XOR_{d≠c}(b_d(e) mod2).

This is a fact about any fixed legal sequence, not a claim that the future owner can be determined from the latest CPC reservoir count N(e) alone. Winning-line geometry constrains the future requirements; gravity constrains legal interleavings; the binary player clock is now explicit.

## 3. Payoff source polynomial and earliest-termination operator

For each player p and each nonempty normalized source residual G∈R_p define the Boolean GF2 AND predicate

    C_{p,G}(σ) = PRODUCT_{e∈G} (1 XOR χσ(e) XOR p).

It equals 1 precisely if EVERY remaining required event in G is placed by p. This is a bounded-degree GF2 polynomial of degree ≤ |G| ≤ K in the clock phases. Define

    T_{p,G}(σ) =
       max_{e∈G} tσ(e)  if C_{p,G}(σ)=1,
       +infinity         otherwise.

For a valid nonterminal source q, all generators G are nonempty, so no prior winner exists. Then

    T*(q,σ)=min_{p∈{0,1}, G∈R_p} T_{p,G}(σ).

If T* is infinite, the entire hypothetical schedule is a DRAW (no geometric K-line is ever fully owned by either side). Otherwise, the first completed original line is exactly at T*, and the winner bit is the absolute turn parity

    winner(q,σ) = (n+T*(q,σ)-1) mod2.

Thus the scalar payoff of the hypothetical first-win-stopped game induced by σ is

    payoff(q,σ) =
       0                            if T*=+infinity;
       +1                           if T* finite and winner=0;
       -1                           if T* finite and winner=1.

No past colored stone reconstruction is needed; q, its exact residual generator antichains, h, and the hypothetical future event phase suffice. The min over G is STATIC terminal-pattern inspection over a supplied schedule, NOT minimax/strategy optimization. The source proof exactly includes first-win precedence, gravity and correct next-turn parity.

**Minimal-antichain correctness:** If an original viable line residual A is removed because a different viable residual B⊂A survives, then any σ satisfying A also satisfies B, whose completion time is no later than A's. Conversely B itself comes from an original viable K-line, so completing B is a true terminal event. Therefore the min first-win time over normalized antichain R_p equals the min over all original viable line residuals, for both p. This is stronger than an abstract truth-table observation: it identifies the necessary sufficient data of the source q for an exact first-terminal parity score along any one legal schedule.

## 4. What remains unsolved

To obtain perfect-play WDL, the game alternates P0 selection and P1 selection of the NEXT legal column, conditioning each choice on earlier moves. This is NOT the same as taking one min/max over all complete schedules, nor the same as computing a parity of all possible schedules. The exact two-threshold NAND transform from the companion candidate removes the alternating OR/AND **operator type**, but still contains a product of successor kernel bits. Neither payoff(q,σ) nor that recurrence is a zero-branch total strategy algorithm.

A possible future object is a **source-only geometric parity certificate normal form** that outputs the exact two NAND kernel bits G+,G0 and the full literal best-column membership directly from R0,R1 and height-chain incidence, without evaluating two inequivalent future σ/q. Any suggested determinant/linear-algebra factorization must prove that its operation encompasses the disjunction over winning requirements and FIRST completion rank, not silently treat AND/OR as XOR-linear or enumerate strategies in a purported closed form.

An original monochromatic K-line has K-1 affine equality constraints between event-phase bits. Conjunction of them is degree at most K-1 over GF2, but disjunction of 69 line claims + first-win ordering + optimal adversarial policy is not generally affine. The presence of an XOR normal form for the clock does not prove an XOR-only formula for perfect play.

## 5. Falsification contract (actual 7×6 only)

1. Generate the 69 original four-in-row geometric lines on W=7,H=6,K=4. From legal first-win-stopped PHYSICAL standard-board prefixes construct q (h, normalized R0,R1), then drop all historical colored-cell data from the new payoff evaluator.
2. Generate deterministic gravity-legal hypothetical full suffix event schedules from those q, explicitly allowed to pass beyond first-win ONLY inside the independent validation control. Compute C_{p,G} and earliest T* strictly from the source q and future event-parity clock, compare against a separate physical array-grid first-win checker that stops at first terminal event.
3. Include both canonical 44444 and 4444442; test arbitrary sourced legal early/mid/late positions, all seven literal first-action checks when meaningful. Compare exact winning player/rank/draw (path payoff) only, not pretend a sampled σ is perfect play.
4. Falsify any first-win mismatch, gravity index mismatch, line generator absorption error, source q incorrectly claiming a previously won history, or different first-win outcome due only to normalization. Preserve raw discrepancies.
5. Observe independent already-frozen 7×6 witness where two hypothetical complete schedules with IDENTICAL final per-cell owners have DIFFERENT first winners (P1 turn30 vs P0 turn29). That forces event rank/earliest deadline into any valid binary normalization; an end-board GF2 coloring quotient is UNSOUND as a future-game/payoff identity.
6. Do not run 4×3/4×4 as primary evidence. This mathematical payoff theorem has **zero** strategic future-game VALUE evaluations for a given provided σ; hypothetical scheduling for validation is NOT a source algorithm for (V,M*).

**Qualification note:** direct mathematical identity over legal source q, not experimental oracle proof of unrestricted perfect play; any validation is separately classed. No general 7×6 nonbranching algorithm or 44444 root (V,M*) certified.
