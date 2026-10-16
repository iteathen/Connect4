# Poset-guarded Boolean absorption: narrow follow-up

**2026-10-16 — pre-test checkpoint**. Canonical owner: `research/semantic-quotient`.
Baseline source/results: `symbolic-residual-circuit.mjs` and
`SYMBOLIC_CIRCUIT_BASELINE_RESULTS_0_1.json`. Core correctness authority unchanged.

## Hypothesis

The initial support-fiber Boolean circuits are exact but allocate 963/28,264/
2,113 gates to compile three selected supports, retaining respectively
301/6,163/482 live gates. Empty 4x3 root hit the 60k-allocation limit.
More than 70% of allocations on two controls were intermediate/discarded.

Each support-relative residual-variable family has a **known implication poset**.
For P0-favorable upset coordinates `X_i`, if residual shape `i subset j`,
then `X_i => X_j`. For complemented P1 coordinates
`Y_i = NOT OpponentUpset_i`, `i subset j` implies
`Y_j => Y_i`. This is a direct order fact, not a sampled heuristic.

Use those implications to eliminate redundant literals in same-polarity AND/OR
gates, including the immediate absorption patterns
`X AND (X OR Z)=X` and `X OR (X AND Z)=X` whenever the
required implication holds. Never infer such an implication between variables
from different supports or player channels. Do not distribute AND/OR or create
new strategic q children to simplify.

## Bounded experiment

Add an **opt-in** `simplifyByPoset` flag (false by default) to the same exact
symbolic compiler. Preserve default baseline byte-for-byte semantics; compare
both modes on the identical fixed support controls, seeds and budgets.

Use 60k allocated gates, 300k substitutions, max 15 seconds per compilation.
Do not escalate the failed empty-root case. Re-run all complete physical q and
128 abstract generator tests, compare WDL and optimal action vectors with the
oracle-free recursive q reference and independent physical rule evaluator.
Measure both allocation and *reachable* circuit gates/edges, circuit
depth, generated operations, end-to-end compile/query work, and branch counts.

If the simplifier is correct but provides no material reduction, reject its
adoption and preserve the result. If it causes a mismatch, preserve the first
q/support/action falsifier and do not claim success. If the empty root remains
over budget, preserve that negative without increasing resources.

This test concerns support-local **representation economics** only, not
minimality, polynomial complexity, or proof that all strategic branching is
eliminated.
