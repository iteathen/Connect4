# Owner's extended three-level move information: opponent model, player, outcome accessibility and timing

**Owner-directed revision, 2026-10-17 Pacific.** Canonical research owner `research/semantic-quotient`. **Status:** latest explicitly stated semantic OUTPUT/POLICY interpretation; supersedes the single-player/known-perfect assumptions and terminology only in `docs/research/2026-10-17-owner-level2-any-p0-winning-continuation-and-level3-perfect-fastest-win.md`. Frozen prior source/value experiments retain their historical mathematical meaning; qualified IsoGraph 1.2 board rules and q_o gameplay semantics are not altered or promoted by this note. Current discovery board **W=7,H=6,K=4**, symbols W,H,K preserved.

## 1. This is ONE hierarchy with TWO independent axes, not separate player categories

The owner distinguishes:
- **Level 1 — outcome information:** who wins, loses, draws, or what can be established about those outcomes under a declared assumption.
- **Level 2 — "best":** select ALL legal continuations in the strongest attainable OUTCOME class for the evaluated player; **do not rank their lengths**.
- **Level 3 — "perfect":** refine the Level 2 outcome preference by quickest winning completion, quickest draw where that is the fallback, or longest survival in unavoidable-loss cases. Rank by time only AFTER distinguishing attainable outcomes; preserve all tied actions rather than returning an arbitrary singleton.

The definition of *attainable* is different in the following opponent-model contexts and must be stored explicitly:
- **PERFECT:** future opponent decisions are adversarial / WDL-optimal as specified. "Win continuation" means that the evaluated player can **force** victory against all permitted adversarial counterplay. Terminal remoteness should use worst-case opponent delays and best available current-player acceleration under the stated policy.
- **QUALITY_UNKNOWN:** future opponent play may be perfect or may contain mistakes. "Winning continuation" **cannot be promised** merely because it is possible. It means that at least one legal first-win-stopped future sequence (including an opponent choice/error) ends with the evaluated player's victory; the **opportunity** exists. Similarly "possible draw" requires at least one legal drawn sequence. Without an empirical behavior model/distribution one cannot rank winning *probabilities*, nor promise quickest REALIZED win. The optimistic shortest-time convention below describes an *achievable* path conditional on favorable opponent responses, not a forced time bound.

A P0-to-move state guaranteed P0 win against perfect P1 stays guaranteed when P1 has unknown (possibly weaker) quality. But if P0 lacks a guaranteed win, P1 fallibility can create opportunities that DO change the potential-win set. Thus the owner's tentative statement that "P0 definitions do not change under unknown opponent quality" is valid **conditional on a proved guaranteed P0 win**; it is not a theorem for every q.

## 2. Exact physical normal-form for outcome accessibility

Let q=(h,R0,R1) be a legal first-win-stopped actual standard7x6 source, p(q)=sum h mod2 and A(q) all original legal move labels. For each legal literal a, define its complete FIRST-terminal outcome possibility set

    Ω(q,a) := { o∈{-1,0,+1} : EXISTS a legitimate first-win-stopped
                   future word/history starting with a and ending with
                   P0-relative terminal outcome o }.

Immediate first-win or nonwinning full-draw actions have their singleton terminal outcome; all other cases use all legal subsequent moves. Ω is a game-path REACHABILITY set, not the ordinary perfect-play minimax J_a(q). Importantly, `Ω` can include outcomes never obtainable against a perfect opponent; `J_a` may NOT be substituted for `Ω` in the unknown-quality mode.

For evaluated player i∈{0,1}, let o_i=+1 for P0 and −1 for P1, and opposite loss value −o_i. Define outcome tier

    tier_i^possible(q,a) :=
       WIN   if o_i∈Ω(q,a)
       DRAW  else if 0∈Ω(q,a)
       LOSS  otherwise.

On quality-unknown mode, Level-2 candidate classes ordered WIN>DRAW>LOSS are

    A_i^win  = {a:o_i∈Ω(q,a)}
    A_i^draw = {a:0∈Ω(q,a)}
    A_i^loss = A(q)\(A_i^win∪A_i^draw)

and the returned **BEST tier** is ALL winning-opportunity actions if A_i^win nonempty, else ALL drawing-opportunity actions if A_i^draw nonempty, otherwise ALL legal losing actions. Note that a drawing-opportunity action MAY ALSO HAVE A WIN opportunity; the tier precedence makes it a WIN-tier action. The categories are nested/overlapping at the raw Ω layer but exclusive when assigning highest available tier.

This formalization adopts a deliberately OPTIMISTIC "opportunity present" interpretation of "unknown opponent quality", appropriate for representing the owner's language *can win if P0 errs*. It is a **policy choice**, not a mathematical guarantee of likely victory or a probability estimate. P1 may be doomed by PERFECT P0 yet still have many WIN-tier `Ω` actions against a potentially imperfect P0.

## 3. Known-perfect conditional P0-wins: roles of P0 and P1

If `V(q)=+1` is rigorously established as the unrestricted perfect-play P0-relative value:

- **P0 to move:** Level-2 best `B_0^{force}(q)={a:J_a(q)=+1}`, ALL P0-forced-win continuations. Level 3 chooses the subset with **minimum guaranteed forced-P0-win first-terminal remoteness** among these, with P1 delaying; no need to rank remoteness for Level 2.
- **P1 to move:** All P1 legal first moves have `J_a(q)=+1`; hence Level 2 best contains **ALL** those moves, which all still lead to forced P1 loss against perfect P0. Level 3 chooses all actions maximizing P1's **longest unavoidable-loss** remoteness under the chosen lexicographic min-win/max-loss play convention. This is the owner's extension: longest-loss timing is REQUIRED for P1 in this conditional PERFECT mode, not merely optional.
- This says nothing about the unknown full unrestricted value of source `44444`: do NOT assume V(44444)=+1 without new proof. Qualified q semantics, original literal actions, gravity and first-win stop stay intact.

If a known-perfect game state instead has V=0 or V=-1, the result must be specified from the general outcome order for the evaluated side; the owner's explicit examples primarily cover **P0 guaranteed winner, P1 guaranteed loser**. Do not automatically call losing or drawing moves "P0 best" under the earlier owner-defined win-only P0 contract.

## 4. Quality-unknown conditional opponent P0: Player 1 priority

Against possibly flawed P0, the owner explicitly ranks P1 moves:

| Outcome-priority tier | Level 2 BEST = ALL such opportunity moves | Level 3 PERFECT refinement |
| --- | --- | --- |
| WIN (first) | any move after which P1 victory is POSSIBLE | among WIN-tier actions, P1 winning first-terminal event happens as early as achievable, conditional on suitable P0 play |
| DRAW (if no win-tier moves) | any move after which a DRAW is POSSIBLE | among DRAW-tier actions, draw terminal event happens as early as achievable |
| LOSS (if no win/draw opportunities) | any remaining legal continuation (all lead to P1 loss) | longest survival before first P0 winning terminal event |

For the Level-3 WIN and DRAW timing under **QUALITY_UNKNOWN**, the direct optimistic interpretation is

    T_i^{possible-win}(q,a) =
       MIN_{legal first-win-stopped histories beginning with a and winning for i} total added plies;
    T_i^{possible-draw}(q,a) =
       MIN_{legal first-win-stopped histories beginning with a and drawing} total added plies.

And for LOSS fallback the corresponding optimistic longest legal path is `T_i^{possible-survival}=MAX` total plies over losing first-terminal histories. Those are all **path-existential** extrema, **not opponent-robust timing guarantees**. A user desiring survival against a good-but-unknown opponent instead needs a separately guarded adversarial maximin survival time; do not conflate them. The latest owner text did NOT select a stochastic model or such a robust/optimistic mixed tie-break explicitly. Therefore record these as a precise natural **candidate** formalization of "as soon as possible"/"as long as possible", and retain the semantic distinction until a choice is justified. No probabilities or future human behavior are invented.

For P1 PERFECT-mode forced loss, the Level-3 MAX survival definition comes from the previous WDL-first remoteness reference and is under assumed perfect opposition; QUALITY_UNKNOWN mode's attainable endpoint hierarchy is a DISTINCT evaluation policy over the SAME underlying legal game.

## 5. P0 with unknown P1 quality

The owner's assessment "conditions don't change for P0" holds **if the P0 forced-win premise holds**: every move guaranteeing P0 win remains a guaranteed winner against any opponent weaker than perfect. Then P0's Level 2 set stays `B_0^{force}`; Level 3 fastest *guaranteed* win remains meaningful as a worst-case guarantee, even though an imperfect opponent could lose sooner in practice.

If P0 cannot force a win at a given arbitrary q, QUALITY_UNKNOWN can add merely POSSIBLE P0-winning moves that had no robust perfect-play winning guarantee. To avoid silent contradiction, the new outputs must display the assumption and whether each "win" is **forced** or **possible**. If the policy insists on a win-only P0 definition even when none is forced, a result can be empty; never silently switch to potential win without owner choice.

## 6. Information hierarchy versus source algorithmic complexity

For full ordinary Level 1 WDL under perfect-play, keep the exact P0/P1 quantified winner/draw/loss `V(q)`. For Level 2:

- PERFECT P0-winning outcome uses only `J_a=+1` and the previously qualified single GF2 P0-win threshold/phase channel; an exact `B0^{force}` win mask is still **UNKNOWN** for arbitrary 7×6 source q under ZERO strategic future branching.
- PERFECT P1 in certified loss against P0 needs no separate child value evaluations for the Level-2 mask: **ALL legal labels**, by universal minimax quantification; Level 3 longest forced-loss remoteness requires a further timing certificate.
- QUALITY_UNKNOWN P1 uses two existential terminal ACCESSIBILITY predicates `WinPossible_{P1}(q,a)`, `DrawPossible(q,a)`, then loss fallback. This is **NOT** the same as the one Boolean `J_a=+1` threshold. It may admit useful source-only geometric SAT-like certificates but simply enumerating legal words / strategies would violate the owner's strict zero-branch target.
- QUALITY_UNKNOWN Level-3 requires completion rank, not merely outcome existence; the conjecture that numeric fastest-win/longest-loss information generically requires some strategic branching remains **unproven**. No false complexity impossibility claim.

## 7. Frozen genuine true7×6 validation plan

1. From real first-win-stopped q, use the independent physical reference to compute ordinary perfect-play V and complete literal `J_a`. Separately compute `Ω(q,a)` as a set of actually reachable FIRST-terminal outcomes along all legal future plays, **REFERENCE ONLY, never a supposed source-zero-branch producer**.
2. Seek true P1-to-move q with V=+1 (guaranteed P0 victory) yet `Win_{P1}∈Ω(q,a)` for one or more P1 literal actions. This witnesses why "P1 best under PERFECT loss = ALL" differs from "P1 best under UNKNOWN quality = best win-opportunity labels".
3. Check P1 win-opportunity, draw-opportunity, loss-only classes, and if feasible corresponding shortest achievable win/draw and longest possible loss lengths on small remaining suffixes of genuine standard7×6 positions. Classify which quantity is purely optimistic path possibility vs an adversarial guarantee, don't accidentally promote game-value correctness.
4. For P0-to-move certified winning roots, confirm forced `B0^{force}={a:J_a=+1}` remains correct irrespective of unknown opponent quality; outside these premises preserve the conditional uncertainty, don't claim universal P0 invariance.
5. Retain previous owner three-level remoteness references as historical correctness checks but don't re-label original WDL-optimal move sets into quality-unknown opportunity sets.
6. Any owner Level-2 total zero-branch result must produce complete relevant literal masks for the declared opponent model from ONE source q without independently valuing inequivalent strategic futures. No solver merge / new IsoGraph authority promotion.

**Epistemic summary:** definitions by owner now more general and conditional, exact ordinary game semantics unchanged; robust guaranteed win and optimistic possible win are different logical predicates; no unrestricted standard7×6 `44444` L1/Level2/Level3 solution claimed.
