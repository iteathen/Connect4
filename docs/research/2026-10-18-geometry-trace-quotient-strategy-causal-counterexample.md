# Exact 7×6 falsifier: owner-preserving round-trace equivalence does NOT preserve first-action Level 2 value

**2026-10-18; research-only; proven narrow negative counterexample after source hypothesis + physical checker frozen.** Sole owner `research/semantic-quotient`; qualified IsoGraph 1.2 unaffected. This paper is a structural limit on the owner's geometry-unfolding / turn-sequence factoring research, NOT a rollback of any exact nonterminal batch cofactor, four-ribbon lift, gravity-poset chronology theorem, or two-round trace endpoint proof.

## 1. Frozen source hypothesis and independent oracle

Before numerical perfect-play results, the original `docs/research/2026-10-18-trace-diamond-not-strategy-congruence-late-original-falsifier-plan.md` asked:

> Does a source-certified round permutation `(a,b,c,d)↔(c,d,a,b)` with identical original `q_o` endpoint imply P0-relative first-action value `J_a(q)=J_c(q)`?

The frozen original source theorem `docs/research/2026-10-18-unfolded-two-round-static-interactive-trace-diamond.md` certifies fixed two-round endpoint equality when all four root columns are distinct/current playable and no surviving original generator of p is included in p's two allocated cells, nor a generator of o in o's two allocated cells. This certificate computes no future game value.

Frozen BEFORE physical oracle:
- deterministic original7×6 source-only candidate generator: `research/isograph/discovery/2026-10-18-unfolded-phase-race/standard7x6-source-diamond-strategy-candidates.mjs`, git blob `[discover in frozen source packet]`;
- 450 source q roots and 1,172 SOURCE original root action pairs selected from 1,252 nonwinning sampled histories (seed 20261018, source min rank 34), preserved in `STANDARD7X6_SOURCE_DIAMOND_STRATEGIC_EQUALITY_FROZEN_PREORACLE_ROOTS_0_1.json`. **Zero source WDL queries**;
- independent first-win-stopped 69-original-window, height-gravity, P0-relative fully recursive physical minimax: `standard7x6-diamond-independent-exact-wdl-falsifier.mjs`;
- even more independent original colored-array-grid / 69-window physical minimax + source-q endpoint reproducer: `standard7x6-diamond-counterexample-independent-reproducer.mjs`.

The physical oracle explicitly evaluates competing future games as a **falsifier only**; this code is prohibited from the no-strategic-branching source selector.

## 2. Decisive original physical witness, FIRST checked candidate

Legal original one-based history:

    2532541156412471331416356736376672

This is a genuine nonwinning 34-stone first-win-stopped original 7×6 history. P0 is the current mover. Original heights:

    h=[6,4,6,4,4,6,4]

Original surviving source antichain counts are R0=4, R1=3; only literal columns {2,4,5,7} are currently legal, each with 2 cells left.

The ORIGINAL SOURCE diamond certifies both complete two-round words:

    w = 2(P0),4(P1),5(P0),7(P1)
    w'= 5(P0),7(P1),2(P0),4(P1)

No first WIN occurs inside either complete four-ply block; independent physical checker confirms identical resulting colored board, heights, and oriented normalized original q with (R0,R1)=(1,1). The exact source diamond guard performs only seven root original generator subset checks.

Nevertheless, independent original-physical perfect-play minimax gives:

| Original first column a | P0-relative exact J_a |
|---|---:|
| 2 | −1 |
| 4 | −1 |
| **5** | **0 (unique best DRAW)** |
| 7 | −1 |

Hence `J_2(q)≠J_5(q)`, falsifying the claim that static owner-preserving round trace equivalence implies first-move strategic equivalence. Root `V(q)=0` and one unique Level2 BEST move is original column 5. This result is from an independently branching PHYSICAL VALIDATOR, not a SOURCE-ONLY Level2 certificate.

The independent physical P1 response values show exactly where opponent contingent play matters. After P0 chooses col2, P1 choices {2,4,5,7} yield P0-relative optimal continuation scores `{2:+1,4:−1,5:−1,7:+1}`, so P1 can FORCE a P0 loss by choosing 4 or 5. After P0 chooses col5, P1 choices yield `{2:+1,4:0,5:+1,7:+1}`; P1's only best outcome is a draw via column4. The two fixed source diamond words use **different P1 responses**, which are not interchangeable as P1 strategies. The q equality at the end cannot retroactively equalize the earlier adversarial choice.

Two separate internal physical solvers agree:
- frozen bitmask minimax record `STANDARD7X6_DIAMOND_DOES_NOT_IMPLY_SAME_BEST_MOVE_PHYSICAL_RESULTS_0_1.json`, exact values discovered on the first candidate root with 129 memoized future physical states / 159 recursion calls across full-root checks (the source-selected decisive pair alone used 90 memo states /112 calls);
- independently authored colored-grid recursive reference `standard7x6-diamond-counterexample-independent-reproducer.mjs` rechecked all action values, opponent response values, both fixed four-move endpoints, 69-line first-win and source counts with 132 memo states and 176 physical calls, zero mismatch.

These are project-controlled *internal reference / independent implementation* checks, NOT a third-party external reproduction or formal proof-assistant discharge.

## 3. Formal reason the quotient cannot promote to Level2

The full four-ribbon representation, per-column event-owner words and exact batch cofactor yield a congruence of **fixed histories**: once A0 and A1 (the physical cells allocated to each player) are known, every nonterminal permutation with those masks has the same oriented q. This is a valid factorization of history order and winning-line geometry.

Perfect play has a different type: on four complete turns it involves nested conditional choices

    current P0: ∃ a
      P1 observes a: ∀ b
        P0 observes b: ∃ c
          P1 observes c: ∀ d
            [continuation outcome at q_abcd, including first-win stop]

The exact fixed-block endpoint statement

    q_abcd = q_cdab

for SOME particular `(a,b,c,d)` does not allow `∀b∃c∀d` to be exchanged with `∀d∃a∀b` or establish a transportation of P1's **ALL** legal response fibers. Crucially, if P0 moves 2, P1 can choose 4 or 5; if P0 moves 5, P1 can choose 4. A fixed two-round endpoint witness describes one completed path of these adversarial policies, not the policies themselves.

**New rigorous NEGATIVE restriction:** A proposed best-move equivalence operator of the form

    SAME_OWNER_COLORED_TRACE_EXISTS(a,c)
         ⇒  J_a(q)=J_c(q)

is UNSOUND on the original standard7×6, even when the exact trace is four-ply, both orders are first-win-free, and their full oriented q endpoint agrees. This does NOT show universal nonbranching Level2 impossible, nor prevent a richer causal strategy-preserving quotient. It forbids silently lifting history trace equivalence to first-action game equivalence.

## 4. Next mathematical target: source causal/interactive confluence

The research must preserve the information **which player gets to observe an opponent move before selecting their own next action**. A complete future owner mask (A0,A1), first-win race bit ρ, and q endpoint do NOT contain this conditional strategy information by themselves. Seek a SOURCE-only `interactive transport` predicate or algebraic closure over gravity-column frontier obligations and owner-tagged original R0/R1 that proves source mover-relative WDL order for one initial column across **all** opponent response choices without valuing alternative strategic future games.

Candidate **research descriptor, NOT proven theorem:** Retain a causal frontier dependency relation `D_p` recording which next p event is conditionally enabled by an observed o reply, including gravity release and first-win deadlines. Seek a deterministic algebraic transformation into a finite owner-column/ribbon phase kernel with a source-proven *universal response-fiber transport*; the relation must preserve original future-action affordances under adversarial observation, not merely the eventual allocation.

Do not implement a QBF/BDD strategy tree disguised as `D_p`. Find a genuine static generator/poset identity, a guarded source theorem, or document the exact remaining mathematical obstruction. In particular, canonical `44444` perfect-play WDL and first-action Level2 best remain **UNKNOWN/INCOMPLETE**.

## 5. Durability / confidence

Original source theorists and producer were frozen BEFORE independent physical oracle, not trained on oracle labels. Exact same-history original 69-window independent reference, first-win stop, strict gravity, orientation-sensitive q check, and both player response tables were verified. Maintain Node26 CI and an independent external formal proof checker were not run; qualified IsoGraph1.2 and other solver branches were not modified. The frozen source positive is **still true**; only the strategically stronger implication is false. Preserve all positive and negative artifacts without editing away historical context.
