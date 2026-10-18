# Connect Four — unified three-level information definition

**Owner-approved conceptual correction, 2026-10-17 Pacific.** Canonical research owner `research/semantic-quotient`. **Status:** latest owner-directed information-level/output-policy contract. Supersedes earlier inconsistent L2/L3 NAMING and P0/P1 category separation, not previously qualified original game rules, source-q structural semantics, or previously frozen reference evidence. Governing qualified IsoGraph 1.2 game theory remains unchanged. Current primary game `W=7,H=6,K=4`; mathematics retains W,H,K for later extension. No zero-strategic-branching universal value algorithm is claimed.

## 1. What the information LEVELS mean

Three levels are about increasing information, **not about which player is moving, not about the opponent's quality, and not about changing game semantics**.

| Level | Owner term | Exact question |
| --- | --- | --- |
| **L1 — Outcome** | Outcome | What win/draw/loss results are guaranteed or possible under the declared opponent model? |
| **L2 — Best moves** | Best | What is the COMPLETE set of ORIGINAL LITERAL legal moves achieving the best outcome class available to the evaluated player, without considering how long the game lasts? |
| **L3 — Perfect moves** | Perfect | Among the entire L2 best-move set, what is the COMPLETE subset with the preferred terminal timing: shortest win, automatic draw-duration tie, or longest unavoidable loss? |

The outcome ordering is universal from the evaluated player's perspective:

    WIN > DRAW > LOSS.

Every result must state the evaluated player and opponent model. A **COMPLETE Level 2 information result** must preserve ALL equally qualifying original literal labels; a **VALID Level 2 continuation** needs only ONE source-certified action belonging to that complete set. It need not enumerate or exclude other equally best moves. Mark single-witness outputs as `VALID_CONTINUATION`, NOT `COMPLETE_LEVEL2_SET`. Never silently assert full information from one witness.

The label `perfect move` here is an **owner information-level term** meaning time-refined best, not an assertion that any possible-winning move guarantees victory.


### Operational requirement is weaker than the information set

The Level 2 mathematical set is `B_M(q)=arg max_{a∈A(q)} U_M(q,a)`. To continue playing optimally, a solver requires only one legal action `a*` with a proof `a*∈B_M(q)`, not the entire set `B_M(q)`. Returning one action is a correct Level 2 **continuation certificate** without claiming it is a complete Level 2 **information result**. This distinction is owner-governing and supersedes prior blanket requirements to prove every move's membership before selecting any valid next move.

A guaranteed/possible WIN-tier certificate immediately proves highest-tier membership, because no outcome ranks above WIN. A DRAW-tier certificate needs an additional root guarantee that no winning move is attainable under the declared opponent model. Under PERFECT opposition, when root value is an unavoidable LOSS for the mover, EVERY legal action is tied in the LOSS tier, so any legal move is already a valid continuation. No time preference applies at Level 2. Full mathematical proof and output contract: [`2026-10-17-owner-level2-set-vs-valid-continuation-correction.md`](2026-10-17-owner-level2-set-vs-valid-continuation-correction.md).

## 2. What the OPPONENT MODELS mean

This is a separate axis from the information level:

**PERFECT opposition:** Evaluate an action using the ordinary perfect-play game value against its strongest available replies, with the evaluated player also choosing subsequent actions optimally. A guarantee that player p can WIN has strategy quantifier `exists own policy; forall opposing allowed policies`. The exact original q game `V(q)` and its action values `J_a(q)` already implement the appropriate max/min outcome preference. Such a claim is ROBUST.

**UNKNOWN opposition:** We do not know if the opponent is perfect or flawed. Without a probability model, it is not possible to predict actual play-quality or outcome frequency. For an optimistic **opportunity** comparison, evaluate whether an outcome is reachable along AT LEAST ONE legal, gravity- and first-win-stopped future continuation, which may require an opponent mistake. `Win is possible` has existential continuation quantifiers for both sides. It is NOT a guarantee or estimate of success probability.

These two modes are not two different levels. They are two semantics for the word *attainable*. A possible win can be less safe than a guaranteed draw; preferring the possible win is a deliberate optimistic preference rule, not a universally optimal recommendation under unknown human play.

If future empirical player skill becomes available, a third probabilistic opponent-model policy may later be defined, but no probability distribution is implied by this document.

## 3. Exact common L2 output equation

Let q be a valid nonterminal first-win-stopped state, with current player p∈{0,1}, and `A(q)` the exact legal literal column labels. Define outcome utility from p's perspective:

    u_p(WIN)=2, u_p(DRAW)=1, u_p(LOSS)=0.

**PERFECT:** let `J_p(q,a)` be the result of taking legal first action a and then ordinary perfect play by both sides, expressed as WIN/DRAW/LOSS for the evaluated current mover p. Define

    score_PERFECT(q,a) = u_p(J_p(q,a)).

**UNKNOWN / optimistic opportunity:** let `Omega_p(q,a)` be the SET of terminal WIN/DRAW/LOSS outcomes obtainable along legal first-win-stopped continuations after original first action a, from p's perspective. Define

    score_UNKNOWN(q,a) = max_{o in Omega_p(q,a)} u_p(o).

In either mode M∈{PERFECT,UNKNOWN}, the unified L2 output is

    B_M(q) = { a∈A(q) :
               score_M(q,a) = max_{b∈A(q)} score_M(q,b) }.

This chooses the complete WIN class if attainable under the model; otherwise the complete DRAW class if attainable; otherwise ALL actions in the LOSS class. There is **NO preference among faster/slower results at L2**.

For UNKNOWN, an action may offer both WIN and LOSS terminal paths; its top reachable outcome is WIN. Such a move is optimistic **winning opportunity**, and must not be called an assured winning strategy.

For arbitrary q, score_PERFECT is the mathematically conventional **WDL-optimal move** criterion for the CURRENT MOVER. Therefore the original `exact-q-core.mjs` `bestMoves` output ALREADY matches the unified L2 choice in the PERFECT model (it does NOT evaluate UNKNOWN-opponent possibility). The separate historical `P0 forced-win-only mask B0={a:J_a=+1}` is an exact WIN-TIER subset, but IS NOT the complete unified L2 outcome fallback in a P0 nonwinning state. Keep its theorem/evidence as a scoped special-case instead of relabeling it.

## 4. L3 temporal refinement and draw theorem

For the BEST outcome tier already selected at L2:

- **WIN:** prefer earliest terminal victory.
- **DRAW:** all legal full-board drawn futures take exactly `WH−occupied(q)` more moves. Consequently ALL L2 drawing moves TIE at L3; no separate fastest-draw ranking exists on standard Connect4. For 7×6 the absolute game ends at placement 42.
- **LOSS:** prefer latest terminal defeat.

Return **all** moves tied at the chosen duration, not an arbitrary singleton.

PERFECT timing uses adversarial guaranteed first-terminal remoteness: victor minimizes the forced victory length, loser maximizes unavoidable defeat duration while preserving the prior WDL tier. No cooperative opponent shortcuts. This recovers the earlier exact WDL-first remoteness reference logic, without changing original game values.

UNKNOWN timing needs an explicit secondary assumption. Under the simplest optimistic opportunity convention, WIN chooses shortest **possible** first-win history, DRAW is fixed at `WH−n`, and LOSS chooses longest **possible** loss history. These are reachability extrema, not robust time-to-outcome promises and not statistically expected times. A robust alternative (minimax delay) is different and must be selected explicitly if desired. No probabilistic opponent behavior is inferred.

The owner research conjecture that general L3 timing may require some strategic branching remains a **hypothesis without proven lower bound**. A low-rank guarded structural proof can sometimes certify exact timing without evaluating multiple futures; do not claim general impossibility.

## 5. The formerly confusing P0/P1 examples fit ONE equation

**P0-to-move, P0 can force win against perfect P1:** L2 = every P0 action retaining the guaranteed victory; L3 = the fastest guaranteed victory. Unknown weaker opposition does not remove any such forced-winning action. (It may add *possible* but risky winning actions under an explicitly optimistic policy, so the full L2 sets need not literally be identical unless P0 continues to use the guaranteed-win predicate.)

**P1-to-move, P0 can force win against perfect P1:** All legal P1 replies are WDL-losses for P1. With PERFECT P0 model, L2=ALL legal replies, L3=those maximizing time until P1's inevitable defeat.

**Same P1-to-move source, quality of P0 UNKNOWN:** P1 may have a move permitting a win if P0 errs. The UNKNOWN-mode L2 picks every P1 action with a possible win; if none, every action with a possible DRAW; if neither, ALL actions. L3 picks fastest POSSIBLE win, all possible draws tied by full-board duration, or longest possible survival if only loss is reachable.

**P0-to-move but P0 cannot force win against perfect P1:** The PERFECT-mode L2 may prefer guaranteed DRAW over LOSS. The optimistic UNKNOWN model may find POSSIBLE P0 win lines after P1 mistakes, changing the legal label set. Thus "P0 does not change with opponent uncertainty" is only safe as a statement about PRESERVING already certified forced-winning moves, not an unconditional equality of policies.

## 6. Research/solver boundary

Information-level and opponent-model classification MUST NOT be mixed with the programming/complexity question:

- The existing ordinary exact-q reference is mathematically COMPLETE for L1 and PERFECT-mode L2 but uses recursive strategic branching.
- An independent late-standard7×6 physical reference already demonstrated P0-win-only WIN-tier masks and separate L3 remoteness, but these are not source zero-fanout total algorithms.
- An independent nonuniform TRUE 7×6 validation checked 1,600 first-win-stopped positions and 4,611 actions for PERFECT `V` versus UNKNOWN `Omega`: 37 of 55 P1-to-move P0-forced-win roots allowed POSSIBLE P1 wins with opponent mistakes; 23 had a different UNKNOWN-mode move mask from known-PERFECT all-losing replies. 100 of 129 P0-to-move roots without forced P0 win could nevertheless POSSIBLY win if P1 erred. Verified evidence: `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/STANDARD7X6_UNKNOWN_OPPONENT_OUTCOME_POSSIBILITY_RESULTS_0_1.json`.
- The owner continuing ZERO strategic branching research may separately target the exact COMPLETE L2 action set for a DECLARED opponent mode, preserving P0/P1 and W/H/K symbolic geometry, 69 true7×6 original lines, first win, gravity and all literal ties. Its general solution remains OPEN, including `44444`. The PERFECT-mode WIN-tier is one Boolean outcome channel; FULL L2 when only drawing moves are best may also require a draw threshold. The UNKNOWN opportunity mode requires separate existential outcome reachability predicates. Do NOT claim the same win-only bit is a universal solver for all modes and outcome fallbacks.

**Research priority:** prove source-only full L2 outcome classes under known-perfect opposition FIRST; handle uncertainty/possible-win predicates as separate opponent-model information, and L3 duration after Level2 outcome classification. No hidden BDD/QBF/strategy-graph enumeration or independent future-game value forks in the claimed zero-branch producer. No change to qualified IsoGraph 1.2 authority and no solver implementation-branch API rename without authorization.

## 7. Supersession and provenance

This document REPLACES the information-level nomenclature/selection-policy assertions of:
- `docs/research/2026-10-17-three-level-wdl-optimal-set-remoteness-information-hierarchy.md` (earlier terms attached to WDL-optimal, historically still mathematically valid);
- `docs/research/2026-10-17-owner-level2-any-p0-winning-continuation-and-level3-perfect-fastest-win.md` (special P0-forced-win tier only);
- `docs/research/2026-10-17-owner-two-opponent-models-three-level-move-taxonomy.md` (earlier contextual special cases and conservative timing guards).

Frozen studies and raw evidence remain preserved; only future communication about L1/L2/L3 adopts these unified terms. No previous game-value or q-cofactor theorem is silently changed.
