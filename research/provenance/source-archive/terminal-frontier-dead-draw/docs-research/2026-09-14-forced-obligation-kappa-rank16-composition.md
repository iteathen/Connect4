# Forced-obligation loss, target-distance induction, and rank-16 composition

**Date:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

This note records the qualified successor to the 22-root post-block residual described in `2026-09-14-resolved-tail-distance2-postblock-composition.md`.

The important correction is that the 22 roots should not all be forced into a winning predecessor theorem. Exact response-capacity analysis exposes one genuine P0-loss state. The other 21 residual roots close under a stronger well-founded target-distance induction. Composing these exact rank-18 outcomes backward through the forced resolved-column defense yields eleven P0-winning rank-16 scheduler contexts and one P0-losing context.

The root of Connect Four is not solved. The latent state `466565554644` is not yet promoted into `W`.

## 1. Response-capacity differential

The exact 84-state rank-18 post-block boundary was reclassified by one-turn obligation structure.

The differential found:

- 81 exact multi-obligation response-capacity-defect children;
- 533 verified single-obligation forced-defense children;
- zero residual/qualified-positive roots with the same complete one-turn obligation profile.

This established that exact enabled-singleton obligations and response slots are load-bearing, but the aggregate counts themselves are not value classifiers.

A follow-up action-role census falsified the tempting hypothesis that the missing theorem was simply a forced defense outside the old `rho=(delta,mu)` action vocabulary. Target-column/non-`rho`-decreasing forced defenses occur in already-qualified positives, not in the residual family. The residual obstruction therefore had to be followed through the obligation chain rather than encoded as a new scalar feature.

## 2. Exact forced-obligation P0-loss certificate

The loss-only propagator uses no unknown-as-loss rule.

At a P0 proof node:

1. if P0 has an immediate terminal action, loss is rejected;
2. with zero enabled P1 singleton obligations, the node remains unknown to this calculus;
3. with two or more enabled P1 singleton obligations, loss is certified only after every legal P0 action is exhaustively checked to leave an immediate P1 terminal;
4. with exactly one enabled P1 singleton, every nonblocking P0 action must be shown P1-terminal, and the unique blocking action propagates loss only if some exact P1 reply is immediately terminal or recursively loss-certified.

On the 84 exact rank-18 roots this calculus contradicts none of the 62 already-qualified positives.

It certifies exactly one of the original 22 residual roots as P0-loss:

```text
466565554644323332
```

At that state the opponent owns simultaneous enabled singleton completions at `A1` and `E5`. P0 has only one move and cannot discharge both obligations; exhaustive legal-action checking supplies the one-turn response-capacity defect.

Backward propagation through the unique forced resolved-column defense proves exactly one rank-16 scheduler context P0-losing:

```text
4665655546443233
```

The adversarial chain is:

```text
4665655546443233
  -- forced P0:C4 -->
  -- P1:B2 -->
466565554644323332
```

where the child has the exact `A1` / `E5` two-obligation defect.

This is a local guarded loss theorem, not a root result.

## 3. Target-distance lexicographic induction

The remaining residual roots are not losses. They expose one more well-founded resource coordinate: support distance to the still-live target singleton.

Define

```text
kappa(S) = (d(S), delta(S), mu(S))
```

lexicographically, where:

- `d` is support distance to the live C3/G3 target;
- `delta` is remaining capacity in the already-resolved C/G column;
- `mu` is remaining repair capacity over A/B/D/E/F.

Exact proof rules retain terminality, live-target status, deadlines, and response-capacity defects. At distance two, an accepted P0 action must strictly decrease `kappa`; every exact P1 reply must not increase it. Distance-one leaves delegate to the already-qualified `rho=(delta,mu)` theorem.

No proof/state cap was increased and no wider q frontier was generated.

### G3 residual half

All seventeen previously residual G3 roots were qualified in isolated kernels:

- proved: 16;
- failed: 1;
- resource failures: 0.

The sole failure is exactly the independently loss-certified root:

```text
466565554644323332
```

Thus the G3 residual is completely classified: sixteen wins and one loss.

### C3 residual half

The direct multi-action probe proved two of five residual C3 roots while three roots exhausted fixed quotient storage before all candidate actions could be evaluated. This was execution contamination, not interpreted as proof failure.

The three roots were therefore qualified by isolating each top-level action in a fresh kernel under unchanged limits. All 21 action jobs completed. Each hard root has exactly one proved top-level witness and six logical rejects:

```text
466565554644757776 -> G
466565554644757777 -> F
466565554644767775 -> G
```

The other two C3 residual roots were already proved by the direct `kappa` probe.

Therefore all five C3 residual roots are P0-winning under qualified exact contracts.

## 4. Exact rank-18 outcome partition

Combining the already-qualified enhanced predecessor roots, target-distance induction, and forced-obligation loss theorem yields a complete outcome partition over the exact 84-state post-forced-block boundary:

```text
83 P0-win
 1 P0-loss
 0 unknown
```

The unique loss is:

```text
466565554644323332
```

The 83 winning children are consumed as exact child contracts only. This result is not q equality and is not a universal state classifier.

## 5. Backward composition to rank 16

Each of the twelve rank-16 scheduler contexts first has a unique enabled P1 singleton in the already-resolved C/G column. The composition control proves the corresponding P0 block is forced by exhaustively rejecting every nonblocking legal P0 action.

Every legal P1 reply after that forced block is then discharged using the exact 84-child outcome partition.

Qualified result:

```text
12 exact rank-16 contexts
11 P0-win
 1 P0-loss
```

The unique losing context is:

```text
4665655546443233
```

The rank-16 composition consumes:

- 62 children from the previously qualified enhanced predecessor;
- 21 children from the target-distance `kappa` theorem;
- 1 child from the forced-obligation loss theorem;
- 0 direct P1-terminal children after the forced block.

This exact composition is qualified by `frontier-postblock-rank16-outcome-composition.yml`.

## 6. Scheduler consequence

The losing rank-16 context identifies one exact bad continuation of the cross-pair scheduler.

From scheduler state

```text
46656555464432
```

the old P0:C2 continuation is adversarially eliminated: P1 can answer C3 and force entry into the proved losing context `4665655546443233`.

This does not imply that `46656555464432` is P0-losing. It means C2 is not an admissible winning witness there.

The natural recovery candidate is to treat the preceding off-subsystem P1:B1 event as a same-column stutter and answer with P0:B2 before resuming the target scheduler. Analogous A/D/E/F pairs may supply the same structure.

## 7. Current theorem seam: reversed-ownership same-column stutter

The repository already contains a qualified same-column stutter theorem in the opposite move orientation: P0 action followed by P1 same-column response.

The scheduler recovery now requires:

```text
P1 off-subsystem action
-> P0 same-column response
-> scheduler claim preserved
```

That reversed ownership/orientation must not be assumed by symmetry.

The next theorem must prove or falsify, under exact terminal/residual/phase/deadline guards, whether an off-subsystem P1 action in A/B/D/E/F followed by P0 in the same column is a claim-relative stutter for the live C3/G3 temporal contract.

Acceptance requires:

- exact replayable scheduler states;
- no intervening P0/P1 terminal alternative hidden by the macro;
- exact support and residual-effect preservation required by the scheduler claim;
- CPC/GF(2) phase/event-order preservation where load-bearing;
- explicit deadline/response-resource preservation;
- exhaustive P1 branch coverage after composition;
- typed theorem reuse only when the reversed-ownership signature actually matches.

If the reversed macro qualifies, compose it into the rank-14 scheduler decisions and re-evaluate the actual latent root `466565554644` under every arbitrary P1 deviation.

If it falsifies, retain the smallest exact counterexample and derive the missing ownership/phase/deadline premise instead of broadening the state frontier.

## Boundary retained

- No solved-WDL or external solver premise.
- Unknown is not loss.
- Candidate-action failure is not state loss.
- No implicit ownership reversal or frame rule.
- No q equality from claim-relative theorem reuse.
- No proof/state/quotient-cap increase.
- No arbitrary q-frontier recursion.
- Root remains unsolved.
