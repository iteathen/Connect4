# Connect4 current research status

**Updated:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is the current-state router. Detailed evidence remains under `docs/research/**`; executable controls remain under `research/semantic-quotient/**`.

## Objective

Derive a complete internal structural proof of standard 7x6 Connect Four perfect-play W/D/L, then derive exact P0 perfect-play terminal winning-line provenance. Suspected output cardinalities are outputs only, never proof premises.

## Semantic boundary

Canonical stack:

```text
E  causal support / enabled events
R  residual winning-requirement antichains
P  CPC / GF(2) phase / precedence
C  temporal contracts / response resources / deadlines
N  guarded dependency closure
G  alternating predecessor fixed point
Q  observation-sensitive value / provenance quotients
```

Ordinary value identity remains:

```text
q = exact support + normalized R0 + normalized R1
```

Output identity remains stricter:

```text
q + exact P0 provenance Pi0
```

Winning region remains:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

Claim-relative theorem reuse, action-relative proof cones, proof-term equality, execution-shard identity, and guarded braid transport are not q equality.

## Root boundary

All six non-center first moves are internally structurally proved P0-nonwinning:

```text
V(opening c) <= 0 for c in {1,2,3,5,6,7}.
```

The unresolved root obligation remains the positive structural proof after opening column 4. The repository does **not** yet claim a complete standard-7x6 solve.

There are exactly 69 geometric winning lines. Historical `28` is a fixed-seam witness count, not a 69 -> 28 reduction.

## Qualified bridge and latent state

The guarded bridge

```text
4665655546 -- P0:D3 -- P1:D4 --> 466565554644
```

is qualified. It activates the latent C3/G3 temporal contract but does not itself prove `466565554644 in W`.

The active program is now to complete the cross-pair scheduler around `466565554644`, then push any exact latent-state theorem backward through the full D3-hinge reply horizon.

## Repair and resolved-tail induction

Global state-like progress quotients failed cross-action congruence. The retained abstraction is claim/action-relative.

The first repair measure is

```text
mu(S) = sum remainingCapacity_c(S), c in {A,B,D,E,F}.
```

It is a valid well-founded repair coordinate, but exact matched controls prove that `mu`, GF(2) phase, root deadline set, and sorted repair-capacity shape are not sufficient proof-success or value classifiers.

The missing resource for the support-distance-one clean gap is the already-resolved C/G tail:

```text
delta(S) = remaining capacity in the previously resolved C/G column
rho(S)   = (delta(S), mu(S))
```

The qualified `rho` induction closes the full clean `mu=15` corpus 160/160 under unchanged limits.

Detailed evidence:

- `docs/research/2026-09-13-repair-capacity-predecessor-induction.md`
- `docs/research/2026-09-14-resolved-tail-distance2-postblock-composition.md`

## Target-distance induction

The 22-root post-block residual exposed one further well-founded coordinate: support distance to the still-live C3/G3 target.

The retained induction is

```text
kappa(S) = (d(S), delta(S), mu(S))
```

lexicographically, under exact terminal/live-target/deadline/response-capacity guards.

At distance two, accepted P0 progress actions strictly decrease `kappa`, legal P1 replies are required not to increase it, and distance-one leaves delegate to the qualified `rho=(delta,mu)` theorem.

No proof/state/quotient cap was increased and no wider q frontier was generated.

## Exact forced-obligation loss theorem

The 22 residual roots should not all be forced into a winning predecessor theorem.

A loss-only forced-obligation calculus was qualified. It certifies loss only through exact enabled-P1-singleton response obligations:

- zero obligations -> unknown to this calculus;
- one obligation -> all nonblocking P0 actions must be shown P1-terminal, then the unique block propagates loss only through an immediate or recursively qualified losing P1 reply;
- two or more obligations -> every legal P0 action must be shown to leave an immediate P1 terminal before one-move response-capacity loss is certified.

It contradicts none of the already-qualified positive rank-18 roots.

The unique exact rank-18 loss is:

```text
466565554644323332
```

with simultaneous P1 singleton obligations at `A1` and `E5`.

Backward propagation proves exactly one rank-16 scheduler context losing:

```text
4665655546443233
```

through the forced C4 defense and adversarial P1:B2 reply.

## Complete rank-18 post-block classification

The exact post-forced-block boundary contains 84 rank-18 states.

Combining the previously qualified enhanced predecessor, the target-distance `kappa` theorem, isolated C3 action qualification, and the forced-obligation loss theorem gives:

```text
83 P0-win
 1 P0-loss
 0 unknown
```

The unique loss is `466565554644323332`.

For the formerly residual G3 half, `kappa` proves 16/17 with zero resource failures; the one failure is exactly the independently loss-certified root.

For the five formerly residual C3 roots, all five are now proved. Three roots required top-level action isolation under unchanged limits and each has exactly one qualified witness:

```text
466565554644757776 -> G
466565554644757777 -> F
466565554644767775 -> G
```

Execution isolation is hygiene only and is not semantic identity.

Detailed evidence:

`docs/research/2026-09-14-forced-obligation-kappa-rank16-composition.md`

## Exact rank-16 composition

The twelve rank-16 scheduler contexts each carry one resolved-column P1 singleton deadline. Exact composition first proves the corresponding P0 block is forced, then enumerates every P1 reply and consumes only qualified rank-18 child contracts.

Qualified result:

```text
12 exact rank-16 contexts
11 P0-win
 1 P0-loss
```

The unique loss is:

```text
4665655546443233
```

The composition consumes:

- 62 previously qualified enhanced-predecessor wins;
- 21 target-distance `kappa` wins;
- 1 forced-obligation loss;
- 0 direct P1-terminal children after the forced block.

The permanent qualifier is `.github/workflows/frontier-postblock-rank16-outcome-composition.yml`.

## Scheduler consequence

At scheduler state

```text
46656555464432
```

the old P0:C2 continuation is adversarially eliminated because P1:C3 reaches the proved losing rank-16 context `4665655546443233`.

This eliminates that action; it does **not** prove `46656555464432` losing.

The previously proposed recovery was P0:B2, consuming the same B-column pair after the preceding off-subsystem P1:B1. That candidate has now been exactly tested and is **not** a same-contract scheduler stutter.

## Guarded braid transport law

The braid view exposed a missing composition law rather than a missing geometric game axiom.

The accepted specifications already govern terminal boundaries, CPC/GF(2) validity, NDC temporal correctness, response obligations, event order, and well-founded dependency ranks. The missing integration was an explicit transport law connecting those facts across a short event macro.

The new guarded transport substrate requires:

```text
exact claim-interface preservation
exact side-to-move preservation where observed
obligation conservation
causal deadline-clock accounting
response-resource preservation
support/event-order preservation
legal and nonterminal transported events
strict well-founded resource descent for neutral-pair re-entry
```

It explicitly denies player renaming, implicit frame preservation, q equality, and later-strategy equivalence.

Focused generic qualification passed **8/8** adversarial controls. The broader pre-alpha cleanup qualification also passed.

Detailed evidence:

`docs/research/2026-09-14-guarded-braid-transport-reversed-stutter.md`

## Reversed-ownership B1 -> B2 falsifier

The exact candidate is:

```text
4665655546443 -- P1:B1 --> 46656555464432 -- P0:B2 --> 466565554644322
```

Both events are legal and nonterminal.

Before P1:B1 and after P0:B2, the board-facing downstream interface is exactly restored:

```text
C3 live = true, support distance = 1
G3 live = true, support distance = 2
full GF(2) column phase = 0010000
P1 enabled singleton surface = empty
P1 immediate terminal surface = empty
next C support = C2
next G support = G1
mu = 18 -> 16
```

Thus the candidate looks like a valid stutter under support, target, phase, terminal-surface, and finite-resource observations.

It nevertheless fails the temporal contract exactly.

After P0:C1, the accepted latent support-pair relation is:

```text
P0:C1 -> P1:G1
response deadline: next_P1_turn
```

P1:B1 consumes that next P1 turn. The old obligation therefore has zero remaining temporal slack. Re-entering the same latent contract after P0:B2 would restore its remaining deadline to one turn.

The guarded transport control rejects this as:

```text
obligation_deadline_regenerated
```

with certificate:

```text
obligation = support-pair:P0:C1->P1:G1
remaining before = 1
elapsed P1 turns = 1
maximum remaining after = 0
attempted remaining after = 1
```

Therefore the reversed `B1 -> B2` pair is **not** an exact same-contract stutter. This is a theorem falsifier only; it does not classify either state as W/L and does not prove P0:B2 is a bad game move.

No A/D/E/F generalization is warranted from the B case alone.

## Current theorem gap: expired-response consequence

The correct next seam is no longer reversed-stutter re-entry.

At

```text
4665655546443 -- P1:B1 --> 46656555464432
```

P1 has declined the support-pair response `G1` on its accepted next-P1-turn deadline. The latent scheduler automaton specifies the response relation and deadline, but it does not yet export the consequence of **refusal/expiry**.

The next theorem must derive what exact structural fact replaces the expired obligation. Candidate consequence shapes include:

```text
immediate P0 terminality
strengthened P0 residual/ownership requirement
forced target-support action
exact P1 response-capacity defect
smaller guarded contract with the old obligation explicitly discharged/replaced
or a preserved exact separator showing another E/R/P/C/N predicate is missing
```

Do not reset the old deadline. If P0:B2 remains useful, it must be justified by this new consequence theorem rather than by same-contract stutter.

Only after the B refusal branch is understood should typed renaming/generalization to A/D/E/F be attempted. Only after every legal P1 response from `466565554644` closes may that latent root be promoted to W.

## Hygiene

- Exact search/minimax/oracle WDL is discovery/falsification only.
- Unknown is not loss.
- Candidate-action or theorem-family failure is not state loss.
- Response-capacity loss requires exact obligation-to-response-slot evidence and exhaustive legal-action coverage.
- No implicit frame rule, deadline reset, or ownership reversal.
- Physical/phase re-entry is not temporal-contract re-entry when a causal clock advanced.
- `mu`, phase, deadline counts, physical sequence, and execution partition are not value classifiers.
- Claim/proof/action isomorphism and guarded transport are not q equality.
- No physical-frontier broadening or arbitrary q recursion.
- No proof/state/quotient cap increase without theorem justification.
- Every focused research qualifier retains the five-minute outer wall and 270-second inner timeout.
