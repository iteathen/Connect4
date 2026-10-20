# Beyond Fibonacci: full original K4-free terminal language, causal scheduling, and the missing strategic quantifier

**Date:** 2026-10-20. **Canonical research owner:** \`research/semantic-quotient\`. **Owner primary objective:** a reusable exact, source-only win/loss/draw algorithm from W,H,K,q without recursively valuing strategically non-equivalent futures. **Status:** a NEW general original-board terminal-language transfer theorem and qualified safety-plus-no-draw ⇒ signed forced-WIN sufficient deduction; independently checked source/physical examples show the THREE distinct kinds of viability that Fibonacci cannot replace. **NOT** the unrestricted 7x6 empty-root WDL rule; accepted IsoGraph gameplay1.2 and production solvers unchanged. Do NOT use the historical 28 distance-sensitive terminal K4 IDs in source formulas.

## 1. The stationary Fibonacci 52 is NOT close to all K4-free terminal configurations

Previous fixed column-alternation model: \`owner(c,r)=(epsilon_c+r) mod2\`. Its valid full-board words at K4 W7H6 number 4*F_7=52; only when a player maintains strict alternating OWNER polarity within each physical column. This is a legitimate but extremely narrow family. A player can claim two physically adjacent sites in one column and STILL legally reach a DRAW. **Therefore a stationary \`epsilon_c\` is not a complete dynamic defense state**, and a Fibonacci phase mismatch is NOT a certificate of eventual K4 firstwinning.

To include ALL such possibilities, define a full original COLUMN WORD \(v_c=(v_{c,0},...,v_{c,H-1})∈\{0,1\}^H\), one true physical owner for every actual cell. No hypothetical periodization/wrap. Set

\[
\mathcal A_H=\{v∈\{0,1\}^H : \text{neither 0000 nor1111 occurs in four consecutive rows}\}.
\]

This is the complete vertical-safe original K4 column alphabet (size48 when H6, size26 when H5). For four consecutive physical columns with binary words a,b,c,d, define \(\chi_H(a,b,c,d)=1\) exactly when:
- for every row r, a_r,b_r,c_r,d_r are NOT all equal;
- for every r=0,...,H-4, a_r,b_(r+1),c_(r+2),d_(r+3) are NOT all equal;
- for every r=0,...,H-4, a_(r+3),b_(r+2),c_(r+1),d_r are NOT all equal.

That is the FULL original horizontal, rising, and falling K4 incidence, exactly once per real four-column window. All vertical K4 are excluded by \(\mathcal A_H\) per column.

For current firstwin-free original physical source q, let \(\mathcal A_{H,c}(q)\subseteq\mathcal A_H\) contain the complete column words whose first h_c bits agree with the actual ORIGINAL OWNERS on q. Let \(m_0(v)\) count P0 sites in v. The exact SOURCE transfer polynomial is:

\[
\boxed{
Z_{W,H}(q;z)=
\sum_{\substack{v_c∈\mathcal A_{H,c}(q)\\c=1,\ldots,W}}
 z^{\sum_c m_0(v_c)}
 \prod_{s=1}^{W-3}\chi_H(v_s,v_{s+1},v_{s+2},v_{s+3}).
}
\]

The sum can be computed by a WIDTH transfer over **last THREE complete column words** \((a,b,c)→(b,c,d)\) with weight z^{m_0(d)}. No future P0/P1 move histories or numeric future WDL values are inspected. The formula is an EXACT physical K4-free FULL colored BOARD count for any positive W,H with appropriate treatment of no K4 directions; present executable is K4 W,H>=4.

Any original fully played DRAW must contain exactly ceil(WH/2) P0 and floor(WH/2) P1 sites, because play alternates from P0, stops on firstwin, and a DRAW occurs only at full capacity. Define

\[
\boxed{D_{\mathrm{static}}(q)=
    [z^{\lceil WH/2\rceil}]\,Z_{W,H}(q;z)}.
\]

This is necessary, NOT sufficient, for ANY future legal DRAW from q. It includes all player-identical-color arrangements beyond Fibonacci, but does not automatically respect future source gravity SUPPORT and actual global turn-order. It is a source-checkable monotone constraint: along legal added stones the set of accepted complete owner strings can only SHRINK, so once D_static(q)=0 it can never recover.

### New independently verified exact counts (no WDL teacher)

Original 4-direction full physical K4-free terminal word counts, and among those exactly balanced final P0/P1 owners:

| W×H | ALL static no-K4 full colored boards | balanced P0/P1 static terminals |
|---|---:|---:|
| 4×4 (boundary brute control) | 16,688 | 5,356 |
| 5×5 | 1,289,076 | 339,543 |
| 5×6 | 13,745,948 | 3,595,514 |
| 6×6 | 206,014,204 | 49,986,108 |
| 7×5 | 145,974,182 | 34,075,872 |
| **7×6** | **3,152,419,330** | **713,305,820** |
| 8×6 | 47,546,802,940 | 10,520,898,876 |

These were computed by an independently written compiled C++ automaton implementing the literal original four-cell tests and P0-owner polynomial count, distinct from the frozen Node runner. All values fit in exact double integer range for the listed dimensions. A SECOND independent direct brute evaluation of all 2^16 original 4×4 owner boards, with all genuine original K4 lines, reproduced 16,688 and balanced5,356 EXACTLY. Node reproduction committed but maintained Node26 CI NOT run. At W7H6, 52 stationary Fibonacci phases are just 52 out of 713,305,820 balanced static no-K4 full colorings.

### Crucial true draw falsifier of the old restricted phase model

Literal one-based 42 move word under original W7H6 gravity:
\`\`\`
414121111222223333334444655555566666777777
\`\`\`
This is an INDEPENDENTLY checked legal full42 game: strictly alternating turns, P0 starts one-based center column4, every original gravity drop legal, zero K4 firstwin at ALL42 moves, full DRAW. By move3, P0 has already claimed **BOTH column4 rows1 and2**, violating EVERY possible stationarily alternating-column epsilon4. Thus Fibonacci-restricted future completion count is ZERO from rank3, but the full original static terminal-color transfer still gives 80,498,171 balanced no-K4 colored completions of that same rank3 q. This is a source-correct HARD counterexample to treating stationary phase loss as game-theory zugzwang.

Packet:
\`research/isograph/discovery/2026-10-20-universal-phase-language/FULL_ORIGINAL_K4_ALL_OWNER_TERMINAL_LANGUAGE_COUNTS_AND_NONSTATIONARY_REAL_DRAW_0_1.json\`.
Source:
\`research/isograph/discovery/2026-10-20-universal-phase-language/full-original-k4-draw-language-column-transfer.mjs\`.
Frozen before measurement:
\`docs/research/2026-10-20-frozen-full-physical-draw-language-automaton-and-safety-to-win-composition.md\`.

## 2. Exact causal-chronology layer: STATIC compatible does not imply a legal DRAW schedule

Even a full monochrome-free assignment with perfect globally balanced P0/P1 totals may be IMPOSSIBLE to execute by actual gravity + alternating turns from q. The missing owner-timing guard is real.

Concrete original historical rank39 q from distinct archived witness game#4 (not a global rank39 claim):
- literal one-based source 39-move prefix \`444444326555553233322676235266611177777\`;
- current physical heights \`[3,6,6,6,6,6,6]\`, P1 to move, only c1 remaining three cells rows4,5,6;
- exactly ONE static color-safe P0/P1-count-balanced terminal completion exists: P1 claims c1r4 and c1r5, P0 claims c1r6. The static K4-free polynomial coefficient is D_static(q)=1.
- Under ACTUAL play, P1 first must claim c1r4, then P0 must take c1r5, which the unique static safe coloring requires to be P1. Thus NO legal firstwin-free DRAW schedule from q exists, despite D_static(q)=1.

This is a precise **causal owner-order obstruction** not expressible by the spatial Fibonacci count or by just knowing future pair QUOTA. It also falsifies converting static D_static(q)>0 into a game-draw possibility claim.

We independently evaluated LEGAL COOPERATIVE DRAW suffix existence using an original 42-cell physical gravity/alternation/firstwin checker, exact remaining P0/P1 owner masks and original69 true K4 lines, not game-WDL minimax, on ALL27 distinct 41-ply historical optimal witness words for ranks29..40. The original strong scores remained historical external evidence; literal histories supply only real legal q. At rank41 original P0 firstwins, so all histories TERMINATE rather than continue to a draw.

| occupied rank | selected real q (out of27) admitting SOME legal cooperative DRAW suffix |
|---:|---:|
|29 |27|
|31 |27|
|33 |27|
|35 |26|
|37 |25|
|39 |**18**|
|40 |11|

Rank39 static balanced K4-free terminal completions exist in **24/27**, yet only **18/27** are actually schedulable under true turns/gravity. SIX rank39 q have positive static source D but no actual legal cooperative draw.

### Three failure thresholds are genuinely different on archived source paths

For each of 27 genuine selected full game words, record first occupied rank losing any stationary Fibonacci completion, first losing all correctly balanced full STATIC K4-free colorings, and first losing every legal COOPERATIVE drawn continuation:

| threshold object | first-incompatible rank histogram across27 histories |
|---|---|
| Stationary Fibonacci phase | 9:1,11:1,12:4,13:6,14:1,15:5,16:1,21:1,22:2,23:2,24:2,25:1 |
| ALL original STATIC balanced no-K4 completions | 35:1,37:1,39:1,40:10,41:14 |
| ALL genuine legal COOPERATIVE DRAW continuations | 35:1,37:1,39:7,40:7,41:11 |

These thresholds are descriptive properties of 27 intentionally selected historical near-optimal paths, NOT universally fixed change points in real perfect play and not the root WDL value. The original \`41\` records indicate that a legal draw possibility survived through q at rank40 but was lost when the historical player P0 CHOSE its winning actual move41.

Complete machine packet with per-history indexed observations:
\`research/isograph/discovery/2026-10-20-universal-phase-language/THREE_DRAW_FEASIBILITY_LAYERS_27_HISTORICAL_GAMES_RANK3_TO41_0_1.json\`.
Independent executable physical checker:
\`research/isograph/discovery/2026-10-20-universal-phase-language/independent-original-7x6-cooperative-draw-suffix-controls.py\`.

## 3. The most revealing layer: legal DRAW can coexist with **SOURCE-PROVED forced P0 WIN**

User asks WHY a defender can fail strategically even if its options appear geometrically feasible. We have now checked this exact distinction on the SAME ORIGINAL TRUE q, not by comparing outcomes from different histories.

At genuine rank31 from previous INDEPENDENTLY SOURCE-CERTIFIED P0 WIN (see \`docs/research/2026-10-20-multireservoir-signed-WDL-and-rank31-verified-source-results.md\`), the 31-stone historical prefix is:
\`\`\`
3333332154444421222115651241000    (zero-based)
\`\`\`
or one-based:
\`\`\`
4444443265555532333226762352111
\`\`\`
The prior sound direct source theorem proves exact P0 WIN from this q against EVERY legal P1 current action via one-round current-action cofactor and no-search signed P0 terminal source guards (direct original P0 firstwinning or original multi-reservoir live pair exhaustion).

Yet the following ORIGINAL alternate suffix is also a perfectly legal FULL DRAW if BOTH players cooperate:
\`\`\`
16116677777   (one-based, next11 moves)
\`\`\`
yielding:
\`\`\`
444444326555553233322676235211116116677777
\`\`\`
Independently original-rayed: all42 placements legal, P0/P1 alternating, no P0 or P1 firstwin at any step, final DRAW. The source static polynomial has **32** balanced K4-free terminal completions at rank31 and at least ONE is actually playable. But P0 can FORCE its WIN by choosing its previously proved winning replies instead. THIS IS THE MISSING ADVERSARIAL STRATEGY QUANTIFIER IN ACTION: **\`exists legal DRAW path\` and \`P0 FORCES WIN\` can both be TRUE from exactly the same physical q.**

Likewise game#1 archived historical rank39 q admits a full legal DRAW suffix \`121\` but satisfies the separately source-proved \`Z39=1\` (every legal P1 move permits P0 IMMEDIATE winning reply). P0 must voluntarily decline its winning reply for that DRAW to happen.

These facts prevent us from claiming we can derive strategic WDL solely by counting safe Fibonacci phase words, all complete no-K4 colorings, or even all legal cooperative DRAW paths. The true missing component is source-computable **online ownership/deadline/response closure against ALL opponent actions**, not finding more possible end colorings.

## 4. NEW dimension-general exact signed-WDL composition from source safety plus zero terminal DRAW capacity

Despite the incompleteness, the full terminal-language transfer supplies a reusable, mathematically sound source WIN cutoff that the restricted Fibonacci formula could not support.

Let \(\mathsf{Safe}_p(q)\) be a separately PROVED actual game-semantic strategy certificate allowing player p to prevent the OTHER player from FIRSTWINNING from current nonterminal q against all opponent move choices. This must include legal actual responses, firstwin ordering and gravity; a hypothetical static coloring or fixed phase-pair MATCHING without an executable game strategy does NOT qualify.

Then original finite firstwinner-absorbing game logic proves:

\[
\boxed{\big(\mathsf{Safe}_p(q)=1\big)
 \ \wedge\ \big(D_{\mathrm{static}}(q)=0\big)
 \quad\Longrightarrow\quad
 V(q)=\begin{cases}+1,&p=0,\\-1,&p=1.\end{cases}}
\]

Proof: an actually played finite original game must end by one player's firstwinning placement or a completely filled DRAW; safety excludes the other owner's firstwin, while D_static=0 excludes EVERY possible genuine drawn terminal coloring even under cooperative play. The ONLY remaining actual outcome under the source-safety policy is p's FIRSTWIN. This is source-only and does not assign any numeric game-tree future values.

A second standard source combination: when BOTH players possess separate certified nonloss strategies from q, exact V(q)=0 (DRAW under perfect play). These are guarded **WDL inference rules**, NOT a new method to produce the underlying \(\mathsf{Safe}_p\) strategy certificates for arbitrary source q. They compose with the existing accepted Allis K4 even-H, W<=6, P1 nonloss policy and other already qualified source strategies whenever their explicit guards and actual prefix invariants hold. At EMPTY 6×6 or7×6 the source D_static is positive, so this cutoff DOES NOT prove the published root WDL; the missing global source defense-compatibility theorem remains OPEN.

This is a genuine general-dimensional reduction:
\`\`\`
original q, physical owner-color terminal transfer D_static(q)
+ qualified online nonloss strategy for p
+ physical firstwin chronology
⇒ sound WIN or two-sided DRAW certificate
\`\`\`
It is NOT a total arbitrary-q WDL formula, and it is not an independently new position-game theorem apart from elementary forced-terminal logic. It does supply a clean separation between geometry terminal feasibility and the still-unsolved adversarial safety guard.

## 5. Specific next mathematical work — DO NOT relapse into local best-move search

The three linked structures must be preserved:

1. **Spatial feasibility** of some terminal coloring: computable by \(Z_{W,H}(q;z)\) over the FULL original K4 column-word alphabet. The earlier \(4F_W\) sequence is merely a 2-symbol restricted sublanguage.
2. **Temporal feasibility** of interleaving each column's owner-labeled gravity stack under strict alternating turns and firstwinner stopping. A single static coloring may be unrealizable (actual q39 example). The 27 history controls give true rank-dependent failures of this scheduler.
3. **Strategic enforceability** of a defender's online replies against all opponent actions with counter-firstwinning deadlines. A genuinely legal draw path does NOT imply the defender can guarantee DRAW (the certified original rank31 P0 WIN yet actual drawn suffix).

For a source-only broad WDL theorem, derive a **closed, structurally justified defender response-capacity invariant** over original W/H/K K4 overlapping lines, actual owner-specific support/deadline events, and the FULL physical safe-terminal language, not just stationary Fibonacci/period-four pairing. It should be under \(\forall\) actual opponent actions and \(\exists\) observed own legal source-certified replies, without recursively assigning game values to distinct future states. A proof may use known guarded safety responders (e.g. Allis W<=6 evenH P1 no-P0-win) plus new monotone terminal exclusion, but must cover W6H6 P1 WIN, W7H5 DRAW, W7H6 P0 WIN, W8H6 P1 WIN, W10H6 P0 WIN from one source-justified dimensional theory.

**Nonclaims:** no external solver scores rechecked this turn; 28 original strong optimal line IDs never source formula inputs; original q-prefix histories are selected 27 witness words, not all states; stationary phase gone does NOT prove any forced winner; source static count positive does NOT imply legal draw and legal draw does NOT imply forceable draw. Accepted qualified IsoGraph gameplay1.2 remains unchanged, no solver changes or maintained Node26 CI run.

