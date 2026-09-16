# Copy-paste handoff prompt — Connect4 structural search optimization

Continue the **Connect4 structural-search / terminal-frontier optimization campaign** from the repository handoff below.

This is an **EXECUTION REQUEST**, not a request for generic Negamax advice, a fresh architecture exercise, or a restart from zero.

Repository:

`iteathen/Connect4`

Active experimental branch:

`research/terminal-frontier-horizon-exact`

Draft PR:

`#45 — research: exact decisive frontier before horizon evaluation`

The branch head may have advanced. **Re-fetch live PR/branch state first. Do not reset to a SHA named in this prompt merely because it is named here. Preserve any newer valid work.**

Do **not** modify/read agent-policy files as part of this continuation; the user previously asked to skip agent files. Use the research/code authorities below instead.

## Critical method requirement

The previous context only became productive after it had read and synthesized **all three layers together**:

1. the structural/logic research;
2. the code/performance research and experiment history;
3. the actual current implementation, line by line.

Do not optimize from only one of those layers.

Before mutation, read completely:

- `docs/research/2026-09-15-cross-layer-logic-code-synthesis-protocol.md`
- `docs/research/2026-09-15-terminal-frontier-search-optimization-handoff.md`
- `docs/research/RESEARCH_INDEX.md`
- repository-root `STATUS.md` and `next_step.yaml` for current state/proof seam

Then follow the primary routes in `RESEARCH_INDEX.md` for the logic stack and relevant code/performance research, and read **every line** of the live implementation you will touch: search, position/transition state, evaluator, TT, ordering/profile, and Branch Manager/work-queue code where relevant.

The point is to search for **isomorphs/correspondences between theorem-side structure and runtime-side structure**. Examples already found include residual degree/terminal consequence, anchored-zero-edge line logic, CPC/control-potential projections, claim-relative event isomorphism, WDL interval bounds, and transition-owned first-order structural facts.

Use the governing cycle for every meaningful unit:

**assess -> research -> reassess -> plan -> execute -> qualify -> review -> cleanup/document**

Treat prior-agent conclusions, issues/PR descriptions, CI output, benchmark notes, solved labels, historical code, and the handoff as **evidence, not authority**.

## Pre-alpha rule

This repository is pre-alpha.

Do not preserve legacy/compatibility behavior for its own sake. No compatibility aliases, frozen self-play sequences, or historical heuristic numeric outputs are authorities. If semantics are proven wrong, correct them and replace stale tests with current invariant/qualification evidence.

## Proof discipline

Keep these boundaries strict:

- unknown != loss;
- absence of certificate != opposite certificate;
- theorem failure != theorem negation;
- resource failure != strategic rejection;
- same dimension != natural isomorphism;
- finite solved-data agreement != universal theorem;
- solved DB labels are discovery/falsification only;
- GF(2) span is not positive monotone residual incidence;
- residual degree/cardinality is not signed value;
- no Hall deficiency is not draw/no-force evidence;
- legal reachability is not perfect-play reachability;
- do not hide recursive search inside something claimed to be a symbolic proof.

## Performance rule

A performance loss does **not** mean immediately abandon a structurally sound idea.

Diagnose first:

- maintenance-only cost versus consumption benefit;
- wrong ownership/placement;
- repeated object/property traffic;
- allocations/GC/cache effects;
- duplicated interpretation;
- whether a first-order fact should be maintained but its second-order consequence derived cheaply;
- whether representation changes shifted an old break-even point.

This rule already mattered: the first terminal frontier was ~14–16% slower maintenance-only, then became a major win when its consumers were moved onto it.

## Current accepted result

The behavior-preserving terminal/frontier optimization reached approximately **1.7x** speedup on the paired Node 26 workload by maintaining exact first-order per-line/residual facts and reusing them for terminal/tactical/evaluator work.

Accepted checkpoint in that lineage:

`6da8d00e607e860cce7a32628c07d4e98de91e0c`

Do not blindly reset to it; it is a comparison/control point.

The main lesson is:

> maintain stable first-order structural facts once; derive cheap second-order consequences at the consumer unless maintaining the aggregate clearly pays for itself.

## Current semantic result

PR #45 promotes exact decisive knowledge ahead of heuristic horizon evaluation:

- playable current-player singleton residual -> exact +1-ply win;
- opponent >=2 distinct playable completion cells -> exact +2-ply forced loss;
- otherwise evaluate heuristically;
- non-horizon double-threat distance is likewise +2 plies;
- unique forced block is not by itself an exact value.

Independent solved-strength evidence improved substantially at shallow depths (e.g. calibration depth 1 `111 -> 118 / 128` optimal; beginning spot-check `27 -> 29 / 30`). Keep the stronger semantics and optimize around it; do not restore weaker horizon semantics merely because the first implementation changes search cost.

## Current code checkpoint immediately before handoff docs

`329b74e6a7b8a2196c21c09bdeb5d3a8bee067c1`

This localizes mutable terminal-frontier state inside apply/undo loops and publishes derived singleton-line counters at the transition boundary. Full verification was green.

The singleton-line zero gate is exact but currently around break-even/marginal depending on workload. Do not spend the next context micro-tuning it unless new profiling supports that.

## Current seam — structural move ordering

The previous context stopped **before mutating move ordering**.

The live incumbent search at the checkpoint roughly does:

- exact cached winner;
- exact horizon singleton/double-threat classification;
- TT probe/bounds/best-move hint;
- exact non-horizon tactical singleton classification;
- forced block if unique;
- otherwise TT best move first;
- then remaining legal columns in static profile move order;
- alpha-beta;
- TT store.

Therefore the next high-leverage experiment is to derive **move-order effect classes from native transition/residual structure**, not to invent a board-scanning weighted heuristic.

Candidate effect facts, in theorem tiers:

1. exact terminal successor;
2. exact decisive tactical/forcing class;
3. creation/destruction of playable singleton residuals;
4. exact degree-2 -> degree-1 cofactor contraction;
5. opponent residual destruction/blocking;
6. own residual contraction/live-line incidence;
7. later qualified blocker/control-potential/response-capacity consequences;
8. deterministic static tie-break.

Important:

- a degree drop is exact algebra but not automatically signed value;
- claim-relative event isomorphism may permit effect/proof-transformer reuse without TT-state equality;
- theorem/certificate classes must dominate advisory ordering proximity;
- do not flatten everything into an opaque weighted scalar;
- ordering may consume non-value-complete structural facts, but pruning/WDL may not.

Preferred shape:

```text
static precompile / canonical residual incidence
                +
        native transition information
                |
                v
          tiny effect class/facts
                |
                v
             ordering
```

Avoid applying/undoing every move merely to reconstruct an expensive heuristic if the effect can be inferred/precompiled from information already owned by the transition frontier.

## Other high-leverage targets after ordering

Keep these active in the synthesis, because a structural fact may serve several of them:

- Branch Manager work selection / queue mechanics, especially proof externality, fan-in, interval width, certificate deficit, response resources and deadline slack;
- TT collisions and retention economics: distinguish key aliasing, bucket/probe cost, capacity/replacement eviction, and cross-worker contention;
- compiled structural consequence/effect plane feeding terminal classification, ordering, TT retention and scheduling;
- moving invariant checks and interpretation out of production hot loops while keeping qualification/debug paths strong.

Reflection/symmetry canonicalization is parked unless measurements later show material reflected duplicate work.

## Active theorem seam remains unresolved

Do not pretend the guarded cofactor-to-obligation theorem is already solved. The active research target is still of the form:

```text
MixedCofactorConsequence
+ AdmissibleSupport
+ UniversalInterventionStability
+ SharedResourceAccounting
+ FirstWinBeforeDeadline
-> CertifiedObligation
```

Optimization code may prepare hooks to consume a future certificate, but cannot invent the missing proof.

## Immediate execution sequence

1. Re-fetch live PR #45 / branch state.
2. Read the two 2026-09-15 handoff/synthesis documents completely.
3. Rebuild the structural vocabulary from the routed primary research, including negative controls.
4. Read the current search/position/evaluator/TT/profile/Branch Manager code line by line.
5. Map theorem-side structures to runtime relations before proposing a mutation.
6. Design the smallest attributable structural-ordering experiment.
7. If new maintained metadata is needed, measure maintenance-only cost separately before/with consumption.
8. Qualify semantic/strength changes against independent solved/deeper evidence.
9. Qualify performance with same-runner Node 26.7.0 paired evidence; hosted runner absolute timings alone are not trustworthy.
10. Persist accepted results, negative results, and current hypotheses before context fills.

Do not restart from generic Connect4 knowledge. Continue from this seam and preserve the cross-layer logic/code synthesis method.