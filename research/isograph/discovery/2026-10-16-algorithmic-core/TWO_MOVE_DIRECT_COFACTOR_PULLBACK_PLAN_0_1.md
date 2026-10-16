# Direct pullback of P0-OR / P1-AND / P0-OR in one fixed horizon

**Date:** 2026-10-16. Canonical owner: `research/semantic-quotient`.
**Preexisting exact result:** `UNIVERSAL_ONE_REPLY_POLYNOMIAL_RESULTS_0_1.json`, a rule-derived simultaneous all-P1-reply operator. This is not a game-tree policy-search input.
**Authority:** qualified residual q, exact terminal and owner-true/false cofactor. No authority mutation.

## Conjectured algebraic compositional identity (frozen before probe)

At P0-to-move nonterminal q, consider one prospective P0 landing `x_a`.
If `{x_a}` belongs to P0 residuals, the action wins immediately.
Otherwise, if it does not fill the board, suppose P0 takes a and P1 is next.
For each child legal column c, let `z_c` be its **new** gravity landing and
`u_c` the next cell above it if present. Then directly from the **original**
parent residual antichains (no child q construction):

```text
ChildP0Threat(c) =
    ({z_c} in R0(q)) OR ({x_a, z_c} in R0(q))

ChildP0LatentAbove(c) =
    ({u_c} in R0(q)) OR ({x_a, u_c} in R0(q))

ChildP1ImmediateWin(c) =
    ({z_c} in R1(q))
```

The P0 pair-source alternatives arise from owner-true cofactor removing
`x_a`. The P1 singleton survives the opponent-blocker cofactor because
`z_c != x_a`. The initial `{x_a}` terminal guard must be applied FIRST.
Residual antichain canonicalization and support restrict every expression to
legitimate future cells; no empty source residual is admitted.

Plug these three arrays into the previously derived **one-opponent-turn**
polynomial:

```text
NoP1ImmediateWin
AND [ (exists c<d ChildP0Threat(c) ChildP0Threat(d))
   OR (exists c ChildP0Threat(c) ChildP0LatentAbove(c))
   OR (every legal c ChildP0LatentAbove(c)) ]
```

This gives **exactly** the set of P0 first actions that can force P0 to
complete Connect-K **on its first or second own move**, provided P1 may
choose any legal intervening action. It is a rank-local exact
`P0 OR / P1 AND / P0 OR` composition law; failure of the predicate is
**not** an eventual WDL loss.

The entire calculation uses parent source residual requirements of size
**at most 2**, board support, deterministic Boolean masks and first-win
guards. It constructs ZERO child q objects and ZERO opponent continuations,
and does not recursively search any game branch. It may inspect all
P0 candidate action *labels* to return the complete certified move set;
this is local algebraic work, not recursive subsolving.

## Control and fixed limits

- Implementation derived from the formulas above; no import of the original
  certificate-producer, winning policies, oracle, or compiled value frontiers.
- Independently compare against the already-committed
  `universal-one-reply-fusion.mjs` one-step cofactor/fusion path, and
  against separate physical first-win two-P0-move checks on **all 4x3**
  states plus **4x4 within the unchanged 800,000 validation transition
  cap**. Respect 200,000 physical states, 300,000 formula checks and 30s
  per dimension. Do not raise any budget.
- Record exact move-mask equality, terminal precedence, number of P0 actions
  checked, length-2 source-residual hits, zero constructed intermediate child
  q, all adversarial discrepancies and first falsifier.
- Negative control: deliberately delete the pair `{x_a,z_c}` antecedent,
  or the upper latent `{u_c}` antecedent. Must detect any actual
  physical counterexample or explicitly record if natural finite control
  does not cover the mutation.
- Do not treat this fixed two-P0-turn result as general branch elimination
  over arbitrary-length strategic computation; next question is whether the
  composition remains compact when more turns are added.
