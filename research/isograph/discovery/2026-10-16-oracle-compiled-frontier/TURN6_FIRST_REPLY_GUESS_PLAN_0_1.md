# Turn-six lateral reply: candidate-first short-delay witness

**Date:** 2026-10-16. Source: center-only delay certificate `TURN6_CENTER_ONLY_DELAY_CERTIFICATE_0_1.json`.

The center-only `444444` dual certificate closes after 209 discovery states and 85 direct verification successor moves. The original all-four-representative greedy discovery exhausted 400 states before closure. Do not increase that budget or run a general continuation graph.

## Candidate-first change

Focus first on P1 action **1** after `44444`, then actions 2 and 3 (actions 5–7 are their mirror images). The all-branch target is **not an eventual game value**: it asks only whether P1 can prevent a P0 terminal win through P0's third move.

Propose P1's first defensive response to every P0 first action using a *direct residual-incidence score*, rather than enumerate P1 choices in numerical order. A candidate b should block as many P0 two-event requirements as possible, with immediate P1 wins prioritized; if one candidate fails its universal P0 second-action obligation, try at most one alternate high-scoring b before returning an explicit incomplete obligation.

Propose P1's second defense by blocking currently legal one-event P0 residual requirements (or playing an immediate own terminal). Then verify the entire supplied witness with the already-written direct physical checker; do not use the candidate scores to make correctness claims.

- Maximum 400 newly materialized candidate states and 2,000 direct local predicates **per isolated P1 reply class**; cap 30 seconds per class.
- Reproducible deterministic column and residual tie breaks; no random seeds.
- Preserve each of the three class outcomes separately (PASS, PARTIAL or FAIL); a failed guessed reply is not proof that no P1 delay strategy exists.
- Any discovered candidate must pass independent direct checker including every P0 first action, every P0 second action, first-win guards, and corrupt/missing-response negative controls.
- Do not expand the proof horizon beyond P0's third turn or make a turn-six W/D/L claim.

If these reverse checks reveal a common short response rule, record it; if not, return to the original positive target with the exact missing guarded obligation, not another generic graph.
