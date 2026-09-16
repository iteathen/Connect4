# Connect4 current research status

**Updated:** 2026-09-15  
**Branch:** `research/terminal-frontier-horizon-exact`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This file is the current-state router, not a theorem ledger. Exact derivations and qualification evidence live in `docs/research/**`; the executable theorem continuation lives in `next_step.yaml`; forward-lane controls live under `research/semantic-quotient/**`.

## Authority and proof boundary

- Domain target: every positive finite rectangle `W x H`, Connect-4 (`K=4`).
- C4-0006 and C4-0007 remain Candidate structural/proof specifications. C4-0010 is an accepted research consumer and does not promote imported Candidate clauses.
- Finite sweeps, solved W/D/L tables, strong-distance data, and varying-board censuses are discovery/validation/falsification evidence only.
- Unknown is not loss; theorem failure is not theorem negation; equal dimension is not a natural isomorphism; absence of a forcing certificate is not a draw certificate.
- No recursive minimax/Negamax/MCTS/PNS result or solved database label is a premise of an asserted structural theorem.
- First-win stopping remains authoritative over partial structural observations.
- Structural move-order descriptors are advisory only unless a separately qualified theorem upgrades them to an exact interval/value consequence.

## Closed structural foundation currently in use

The current research stack is:

```text
geometric winning-line axioms
  -> support / future placement-event frontier
  -> CPC control potential / event precedence
  -> positive residual antichains and blocker clauses
  -> guarded response/resource/deadline consequences
  -> NDC certificate closure
  -> solver-specific exact proof procedure.
```

The following September 14 results are retained as the active foundation rather than repeated here in full:

- **total-domain static geometry and third-difference calculus** — symbolic formulas for line count, incidence rank/kernel, axis/phase quotients, and their board-family boundary cases;
- **A4/quiver decomposition** — canonical static decomposition of the principal empty-board maps; standard 7x6 yields `69 = 28 + 6 + 28 + 7`;
- **thin-board theorem** — `min(W,H)<4` implies empty-board draw by quantified legal response proof;
- **binary control potential** — CPC, phase, seams, and ownership correction are views of one parity/control potential rather than duplicated player-color state;
- **domain-wall / gravity normal form** — terminal four-lines are zero-edge predicates; ownership fields admit an anchor-plus-seam representation;
- **safe pure-followup / seam reservoir** — exact defensive geometry, including the standard width-7 center-safe affine seam cube;
- **anchored zero-edge residuals** — both players share one zero-edge terminal geometry with player identity supplied by the ownership anchor;
- **affine/clause separation** — blocker sets are positive monotone clauses, not XOR unless split ownership is separately certified.

Primary routing for these results is in `docs/research/RESEARCH_INDEX.md` and the `required_authority` / `qualified_premises` sections of `next_step.yaml`.

## Current strategic interpretation

The smallest preserved common strategic shape is:

```text
binary control potential
+ full positive residual incidence
+ affine ownership/parity relations
+ monotone blocker clauses
+ support / response-resource / deadline guards
+ NDC composition
-> exact terminal or proof consequence where qualified.
```

Pure-followup/domain-wall safety is a defensive/no-loss substrate, not a signed value theorem. Hall/resource deficiency is a sufficient forcing/stopping certificate only under its exact guards; absence of Hall deficiency is not draw evidence.

## Active theorem seam — guarded mixed-owner cofactor obligation birth

The solved-database collision audit changed the classification of the missing mechanism.

For player `p`, the positive residual antichain is a monotone Boolean completion formula. Owner-labelled events are exact cofactors. On distinct cells, owner-`p` and owner-`1-p` substitutions commute algebraically. Therefore the missing noncommuting game content is not another residual-algebra primitive; it enters through legality/admissibility, support, response resources, deadlines, opponent-universal intervention, and first-win stopping.

Current classification:

```text
new primitive enabling predicate        not warranted
owner-labelled enabling                derived certificate relation
cofactor degree drop                   exact algebra, not yet obligation birth
intervening-choice stability           missing guard
cofactor -> obligation quantifier lift primary missing composition rule
winner/sign lift                       downstream of decisive terminal certificate
```

Target rule shape:

```text
MixedCofactorConsequence
+ AdmissibleSupport
+ UniversalInterventionStability
+ SharedResourceAccounting
+ FirstWinBeforeDeadline
-> CertifiedObligation.
```

Apply this first to the documented shared d-column continuation of the minimal six-ply collision. Stop at the first required guard not derivable from existing support, blocker, control-potential, response-resource, deadline, or first-win coordinates. Only that residue is a candidate new predicate.

### Bounded collision control

Zero-based paths:

```text
A = [6,6,6,6,2,2] -> database draw
B = [2,6,6,2,6,6] -> database P0 win
```

They share support `[0,0,2,0,0,0,4]`, degree-2 structural signatures, and all first-P0-event degree-2 jets. Independent structural replay reproduced exactly 13 differing degree-2 signatures among 49 common two-event column pairs. `P0 a1, P1 d1` exposes a B-only P1 residual `{e1,f1}`.

That residual is a discriminator, not a proof of the database outcome. Degree contraction alone does not establish an active defensive obligation.

Primary notes:

- `docs/research/2026-09-14-solved-db-structural-discovery.md`
- `docs/research/2026-09-14-solved-db-structural-assessment.md`

Finite database results currently falsify value-completeness of boundary-capacity, degree-2, GF(2)-span, and current-owner degree-2-jet projections. Exact residual identity and the ownerJet signature have no sampled value collision, but this is finite validation only and gives no theorem or compact-selector proof.

## Active solver / terminal-frontier optimization lane

Draft PR #45 owns the current incumbent structural-search experiment.

Accepted semantics remain:

```text
playable current-player singleton at horizon -> exact +1-ply win
opponent >=2 distinct playable completions   -> exact +2-ply forced loss
unique forced block                          -> unresolved value; forced transition only
otherwise                                    -> heuristic horizon evaluation
```

The behavior-preserving terminal/frontier representation remains accepted: stable first-order line/residual facts are maintained once in transition state and consumed by terminal, tactical and evaluator logic.

### Accepted native singleton-effect ordering

Accepted checkpoint:

`b45a6350fbc026b7a3429c5b49816c7d3a248f9e`

The accepted ordering-only effect derives, from native landing-cell incident-line state, whether a non-TT move creates one or two distinct **playable own singleton completion cells**, while vetoing advisory promotion when the support step exposes an opponent singleton. It adds no maintained metadata and does not materialize every child merely to score it.

Paired Node 26.7.0 evidence reduced the original fixed workload by roughly 21-24% nodes and 27-31% evaluator calls relative to the pre-ordering control, with unchanged decision checksum and unchanged solved-strength aggregates. The detailed record is:

- `docs/research/2026-09-15-native-singleton-effect-ordering.md`

### Rejected opponent-residual suppression tier

The next candidate used another exact cofactor fact: claiming the landing cell destroys every opponent-only residual containing that cell. Broad, tier-isolated, and degree-2-only ordering variants all reduced the original paired fixture substantially, but all materially increased depth-12 search work on the independent calibration corpus while preserving move-quality labels.

Final degree-2-only falsifier relative to the accepted singleton checkpoint:

```text
paired persistent nodes:       660,565 -> 583,405  (-11.68%)
paired reset nodes:            794,750 -> 692,150  (-12.91%)

calibration d12 nodes:         167,372 -> 216,649  (+29.44%)
calibration d12 evaluator:      35,759 ->  51,509  (+44.05%)
```

Disposition:

```text
opponent residual destruction structural fact   retain exact/unsigned
opponent residual destruction as move-order tier reject at tested placement
```

The exact experiment state is preserved on `research/terminal-frontier-horizon-exact-suppression-evidence`; active production source is restored to the accepted singleton-order implementation.

Detailed record:

- `docs/research/2026-09-15-opponent-residual-suppression-ordering.md`

This negative result sharpens the optimization rule: theorem/runtime correspondence is not sufficient by itself for first-child ordering. The consumer objective and cross-corpus search economics must also support the relation.

## Immediate execution targets

### Theorem lane

`next_step.yaml` continues to own:

`derive_guarded_mixed_cofactor_obligation_birth`

The first construction must preserve exact support/full residual identity, separate commuting cofactor algebra from legal time, quantify opponent intervention over consequences rather than one named residual, and preserve first-win stopping.

### Solver optimization lane

Do **not** immediately replace the rejected suppression tier with another raw residual-count heuristic.

Next reassessment targets are:

1. own residual contraction / live-line incidence as a small structural class only if it survives the same independent cross-corpus gate;
2. TT retention/replacement economics, where opponent suppression may be a more natural externality descriptor than first-child order;
3. Branch Manager scheduling using proof externality/fan-in, interval width, certificate deficit, response resources and deadline slack;
4. a compiled structural consequence/effect plane only if several consumers demonstrably need the same transition descriptor.

TT investigations must distinguish key aliasing, probe/bucket cost, capacity/replacement eviction and cross-worker contention. Fewer TT accesses caused by a smaller tree are not evidence that TT retention policy itself is improved.

## Paused / preserved work

- post-center strong-distance selector — paused inside the broader guarded value-closure problem;
- history-aware marked residual calculus after the qualified 21-space — preserved;
- forward W/D/L rank-7 P1 horizon at exact state `4665655` — unfinished but preserved;
- varying-board census — validation/falsification only;
- isolated `research/connect-k-derivative-classification` branch — not merged; its predicate/axiom ledger is compatible with the current classification but does not solve the temporal guard seam.

## Retention and cleanup rule

Keep durable theorem derivations, exact qualification evidence, useful falsifiers, and historically important performance/provenance records. Git history and explicitly named evidence branches are the archive for superseded candidates, handoffs, chat summaries, temporary publication checkpoints, and obsolete executable/scaffolding state.

Do not create another chronological status ledger. Update this file only when the current proof boundary, accepted solver seam, rejected optimization boundary, or routing materially changes.
