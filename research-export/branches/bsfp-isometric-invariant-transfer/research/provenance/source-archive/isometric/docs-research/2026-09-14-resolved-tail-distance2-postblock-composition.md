# Resolved-tail lexicographic induction, distance-two re-entry, and post-block residual

**Date:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

This note records the current qualified structural seam after the five-column repair induction. It replaces the obsolete view that repair capacity `mu` alone, or support-distance-two re-entry alone, is the missing post-block calculus.

The root is not solved. All statements here are local guarded predecessor theorems or exact bounded falsifiers. Unknown is not loss, proof failure is not loss, and action-family failure is not state loss.

## 1. `mu` is a well-founded rank but not a value classifier

The original repair measure is

```text
mu(S) = sum remainingCapacity_c(S), c in {A,B,D,E,F}.
```

Within the qualified repair subsystem a selected P0 repair action decreases `mu` by one and legal P1 replies do not increase it. That made the restricted predecessor induction possible, but later matched controls show that `mu` does not determine whether a clean live-target state is proved.

The decisive matched control compared qualified positive and independently unproved clean `mu=15` states. Ten proved/unproved pairs matched at the strongest tested tier:

- same remaining target;
- same `mu`;
- same empty root P1 deadline set;
- same GF(2) phase location;
- same sorted five-column repair-capacity multiset.

Therefore `mu`, root deadlines, GF(2) phase, and repair-capacity shape are not sufficient value classifiers.

## 2. Missing resource: the already-resolved C/G column tail

The matched pairs exposed a load-bearing resource omitted by `mu`: remaining capacity in the already-resolved C/G column.

Define

```text
delta(S) = remaining capacity in the previously resolved C/G column
rho(S)   = (delta(S), mu(S))
```

with lexicographic descent under the guarded repair contract.

Qualified transition roles:

- a resolved-tail P0 action decreases `delta`;
- an A/B/D/E/F repair action decreases `mu`;
- legal P1 replies are nonincreasing in the ordered resource pair;
- terminal, live-target, support-distance-one, and deadline guards remain explicit.

This is not q equality and is not a global state quotient.

### Qualified `mu=15` closure

The resolved-tail lexicographic induction proves:

- 12/12 previously unproved `mu=15` representatives;
- 160/160 exact clean `mu=15` corpus states;
- 0 logical failures in that clean corpus;
- 42 execution-only structural shards;
- maximum 41,893 proof states in one shard;
- unchanged proof/state limits.

Thus the `mu=15` gap was a missing resource coordinate, not evidence against induction.

## 3. `mu=16` produces two exact falsifiers

On the exact clean deadline-free G3/`mu=16` rank-20 corpus, both the additive resolved-tail rank and the lexicographic `rho` induction prove 35/37 states and fail on the same two roots:

```text
46656555464431333374
46656555464432333374
```

This is a useful negative control: adding resolved-tail ordering is necessary, but it is not by itself the complete post-block calculus.

## 4. Forced G2 -> G3 -> G4 temporal sequence

At each exact `mu=16` falsifier, P0:G2 is the only retained structural action family not already eliminated.

Across the fourteen legal P1 replies from the two roots:

- 12 deviations yield an immediate P0 terminal on G3;
- 0 replies are immediate P1 terminal;
- exactly 2 replies are forced P1:G3 target consumptions.

After forced P1:G3, P1 has an enabled G4 singleton. P0:G4 is then a true one-turn forced defense: every nonblocking nonterminal P0 action permits immediate P1:G4 terminality.

The fourteen legal P1 replies after the G4 block are nonterminal, but the original live-G3 theorem no longer applies because G3 has been consumed. This identifies a temporal contract transition rather than a scalar-rank defect.

## 5. Guarded support-distance-two target-support re-entry

A separate guarded theorem was extracted and qualified for the exact post-block support-distance-two domain.

Claim-relative preconditions:

- P0 to move;
- remaining P0 target singleton is live;
- target support distance is exactly two.

Candidate macro:

1. P0 advances the first support cell in the live target column;
2. any exact P1 terminal reply rejects that action;
3. immediate P0 terminal successors discharge directly;
4. otherwise the successor must enter the qualified support-distance-one lexicographic theorem.

This macro is action-conditioned and exact-domain qualified. It is not generalized to arbitrary physical states.

## 6. Enhanced exact rank-18 post-block predecessor

The exact post-forced-block boundary contains 84 rank-18 states: 42 with remaining target C3 and 42 with remaining target G3.

The enhanced predecessor composes:

- immediate P0 terminal certificates;
- support-distance-one resolved-tail lexicographic induction;
- guarded support-distance-two target-support re-entry.

### G3 half

The complete G3 half evaluates all 42 roots:

- closed: 25;
- logical failures: 17;
- resource failures: 0.

A compact census over attempted actions in those 17 failed roots gives:

- immediate `P1_terminal` first failures: 8;
- `distance1_lexicographic_unproved`: 14;
- `distance2_target_support_rejected`: 97;
- `outside_supported_contract`: 0;
- distinct coarse failure signatures: 8.

These counts are action-attempt mechanism counts, not 17 mutually exclusive state labels.

The absence of `outside_supported_contract` is important: the remaining G3 obstruction is inside known temporal/repair contract types. The missing premise is in branch composition, deadline coverage, or residual response capacity, not an unexplained new physical-state family.

### C3 half: isolated qualification

The shared C3 arena previously mixed logical failures with execution-resource contamination. The 42 exact C3 roots were therefore partitioned into 14 independent three-root jobs without changing proof or quotient limits.

All 14 jobs completed successfully. Aggregate exact result:

- roots evaluated: 42/42;
- closed: 37;
- logical failures: 5;
- resource branches: 0.

Exact remaining C3 logical roots:

```text
466565554644757774
466565554644757776
466565554644757777
466565554644747775
466565554644767775
```

Representative residual mechanisms are:

- immediate P1 singleton terminality after a candidate action;
- a support-distance-two target-support macro rejected because an adversarial reply exposes P1 terminality;
- a support-distance-two macro whose distance-one child has `no_lex_predecessor`;
- direct support-distance-one lexicographic failure in the same local family.

One especially clean exact failure is `466565554644757774`: its nonclosing routes reduce to immediate P1:D6 terminality after the relevant candidate branches. This is a genuine logical separator, not allocator ambiguity.

## 7. Current interpretation

The post-block problem has narrowed from a broad state-space question to a guarded temporal-response problem.

What is already established:

1. five-column repair capacity supplies a valid well-founded component;
2. the resolved C/G tail is a second load-bearing resource coordinate;
3. `rho=(delta,mu)` closes the complete clean `mu=15` corpus;
4. support-distance-two target-support progress is a qualified re-entry mechanism;
5. execution isolation removes C3 resource ambiguity;
6. every remaining G3 failure stays within known contract families;
7. the remaining failures concentrate on exact opponent terminal deadlines and `no_lex_predecessor` children.

The next theorem should therefore not be another scalar rank and should not broaden the physical frontier. It should identify the smallest action-conditioned temporal/dependency premise that covers or schedules the opponent's enabled terminal obligations while preserving entry into the lexicographic induction.

A useful form to test is a guarded deadline/response-capacity predecessor contract:

```text
current live target
+ selected progress action
+ exact enabled P1 singleton obligations after each reply
+ available P0 response/terminal alternatives
+ decreasing rho child
=> branch-complete predecessor
```

This is a hypothesis family, not yet a theorem.

## 8. Next composition boundary

Work only on the exact residual rank-18 failures:

- 17 G3 roots;
- 5 C3 roots.

For each candidate P0 action, retain the first adversarial P1 reply and classify the dependency cone of the terminal/deadline or `no_lex_predecessor` obstruction. Test mirrored C3/G3 instances for typed theorem reuse. Do not infer loss from a failed action or failed theorem family.

Once both halves close 42/42, compose the resulting post-block contract into the actual C/G cross-pair scheduler at:

```text
466565554644
```

Only if every arbitrary P1 deviation is terminal-for-P0 or absorbed by a qualified contract may that exact latent state be promoted into `W`. Only then push the proof backward through the D3 hinge reply horizon.

## Boundary retained

- No solved-WDL or external solver premise.
- No unknown-as-loss inference.
- No q equality from claim-relative or action-relative theorem reuse.
- No proof/state cap increase.
- No arbitrary q-frontier recursion.
- No 69-to-28 geometric-line reduction.
- Root remains unsolved.
