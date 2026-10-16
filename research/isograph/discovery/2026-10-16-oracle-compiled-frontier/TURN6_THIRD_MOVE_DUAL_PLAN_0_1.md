# Third-P0-move dual proof: a bounded local attempt

**Date:** 2026-10-16. **Owner:** research/semantic-quotient. Source research head: `4480272223ab222aeae1a4abd39723003b2cd1b2`.

## Reason for this new direction

The oracle-blind snapshot of `44444` has exactly four rank-6 reply classes (mirrors `1/7`, `2/6`, `3/5`, center `4`), with seven exact physical-vs-q cofactor matches. Every reply leaves every P0 residual winning requirement of size **at least three**. Therefore no one-/two-P0-turn win is possible, whatever the opponent's responses. A candidate for a P0 victory needs at least three P0 turns, and standard root expansion would obscure which guard is missing.

## Concrete objective

For each of the **four symmetry-representative rank-6 children** of `44444`, attempt to produce a short **dual delay witness** for the claim "P0 cannot force a win on or before its third subsequent move":

```text
FOR EVERY P0 first action a:
    EXHIBIT P1 first response b:
        EITHER P1 immediately terminalizes
        OR FOR EVERY P0 second action c:
            EXHIBIT P1 second response d:
                EITHER P1 immediately terminalizes
                OR P0 has NO legal immediate terminal action after d
```

No state value beyond this fixed horizon is alleged. A valid complete witness is an exact *bounded P1 avoidance/delay certificate*, not a P1 draw/win certificate.

The candidate generator may search for b/d. The checker **must not search for b/d or solve the game**: it checks the supplied finite witness directly using physical first-win legality and independently computed minimal P0 residual requirements, including the landing-cell accessibility guard. It must cover every first P0 action and every second P0 action under the supplied b. The checker must reject missing map entries, illegal actions, and a seeded corrupt witness.

## Budget and stopping

- Use only four rank-6 support representatives, not the full game graph.
- At most **400 materialized probe states** total for candidate construction; at most **2,000 direct local predicate/cofactor checks**; maximum 30 seconds. If any cap is hit, report PARTIAL and checkpoint a failing action/guard.
- No depth beyond P0's third subsequent move and no cached minimax/WDL labels.
- Candidate comes only from geometry, gravity, alternating turns, current owners and exact residuals. No solved oracle access until a positive winning certificate is complete.
- Execution and checker times, discovered witness size, sampled/exhausted action coverage, independent falsifiers, and any counterexample must be preserved.
- Do not infer that failure to find a short P1 delay witness proves P0 win. No expansion to general n-ply game solving.

## Claim boundary

A complete dual witness would prove: under standard 7x6 first-win rules, for each tested P1 response, P1 has a reactive policy preventing P0 victory **by P0's third move**. It would NOT prove a P1 draw/loss for P0, turn-6 P1 W/D/L outcome, or the target eventual P0 win. Do not promote it to semantic authority.
