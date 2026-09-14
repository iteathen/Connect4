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

Claim-relative theorem reuse, action-relative proof cones, proof-term equality, and execution-shard identity are not q equality.

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

The current program is to close every arbitrary P1 deviation inside the post-block C3/G3 contract, promote only the exact latent state when branch-complete, then push the theorem backward through the full D3-hinge reply horizon.

## Action-relative repair correction

Global state-like progress quotients failed cross-action congruence. The retained abstraction is:

```text
ActionProgressCone(S, a)
```

which keeps only E/R/P/C/N facts load-bearing for the selected action claim.

Qualified local routing includes:

- 108 exact action-progress replies;
- 20 immediate enabled-target terminal certificates;
- 40 chain continuations with another strict selected-column descent or terminal closure;
- 48 exhausted-tail handoffs;
- 12 exact bounded states where every legal P0 move permits an immediate P1 terminal response;
- backward elimination of 8/12 D/E/F tail actions;
- target-adjacent survivor rule:
  - remaining G3 target -> F tail;
  - remaining C3 target -> D tail;
- complementary-tail continuation after the adjacent-tail survivor.

## Five-column repair induction

The first well-founded repair measure is

```text
mu(S) = sum remainingCapacity_c(S), c in {A,B,D,E,F}.
```

Inside the qualified repair subsystem:

- selected P0 repair actions decrease `mu` by one;
- P1 replies do not increase it;
- the original restricted 16-start predecessor control closes 16/16;
- the retained finite proof certificate contains 9,635 physical proof states and 1,022 conservative canonical proof classes.

This is a valid induction schema, not evidence that `mu` is a value classifier or that the game has only 1,022 semantic states.

Detailed earlier evidence:

`docs/research/2026-09-13-repair-capacity-predecessor-induction.md`

## `mu` is not a sufficient classifier

Matched positive/negative controls produced ten proved/unproved `mu=15` pairs matched at the strongest tested tier:

- same remaining target;
- same `mu`;
- same root P1 deadline set;
- same GF(2) phase location;
- same sorted five-column repair-capacity multiset.

Therefore `mu`, phase, root deadlines, and repair-capacity shape are not sufficient W/D/L or proof-success classifiers.

## Resolved-tail lexicographic induction

The missing resource coordinate is the remaining tail of the already-resolved C/G column.

Define

```text
delta(S) = remaining capacity in the previously resolved C/G column
rho(S)   = (delta(S), mu(S))
```

with lexicographic descent under exact terminal/live-target/deadline guards.

Qualified roles:

- resolved-tail P0 action decreases `delta`;
- A/B/D/E/F repair action decreases `mu`;
- P1 replies are nonincreasing in the ordered resource pair.

Qualified clean `mu=15` result:

- previously unproved representatives: 12/12 proved;
- exact clean corpus: 160/160 proved;
- failed: 0;
- execution-only structural shards: 42;
- maximum proof states in one shard: 41,893;
- no proof/state cap increase.

## `mu=16` exact boundary

On the exact clean deadline-free G3/`mu=16` rank-20 corpus, both the additive resolved-tail rank and lexicographic `rho` theorem prove 35/37 and fail on the same exact roots:

```text
46656555464431333374
46656555464432333374
```

These are structural falsifiers for any claim that resolved-tail ordering alone completes the post-block calculus.

## Forced target-support / forced-defense sequence

At both exact `mu=16` falsifiers, P0:G2 is the only retained structural action family not already eliminated.

Across fourteen legal P1 replies:

- 12 deviations yield immediate P0 terminality on G3;
- 0 are immediate P1 terminal;
- exactly 2 are forced P1:G3 target consumptions.

After forced P1:G3, P1 has an enabled G4 singleton. P0:G4 is a true forced defense: every nonblocking nonterminal P0 action permits immediate P1:G4 terminality.

The post-G4-block continuation requires a new contract transition because G3 has been consumed.

## Support-distance-two re-entry

A guarded support-distance-two target-support macro is now qualified and composed into the post-block predecessor control.

Exact preconditions:

- P0 to move;
- remaining P0 target singleton live;
- target support distance exactly two.

The macro advances the first support cell in the target column, rejects any exact P1 terminal reply, discharges immediate P0 terminal successors, and otherwise requires entry into the support-distance-one resolved-tail lexicographic theorem.

This is action-conditioned and exact-domain qualified, not a global state theorem.

## Enhanced 84-state rank-18 post-block predecessor

The exact post-forced-block boundary contains 84 rank-18 roots: 42 with remaining target C3 and 42 with remaining target G3.

The enhanced predecessor composes:

- immediate P0 terminal certificates;
- support-distance-one resolved-tail lexicographic induction;
- guarded support-distance-two target-support re-entry.

### G3 half

All 42 G3 roots are evaluated:

- closed: 25;
- logical failures: 17;
- resource failures: 0.

Across attempted actions in those 17 failed roots, the compact first-failure census is:

- immediate `P1_terminal`: 8;
- `distance1_lexicographic_unproved`: 14;
- `distance2_target_support_rejected`: 97;
- `outside_supported_contract`: 0;
- coarse signatures: 8.

These are action-attempt mechanism counts, not mutually exclusive state labels.

The zero `outside_supported_contract` count is important: the G3 residual remains inside known temporal/repair contract types.

### C3 half after execution isolation

The shared C3 arena mixed logical outcomes with allocator/resource contamination, so all 42 exact C3 roots were rerun as fourteen independent three-root partitions with unchanged limits.

Exact aggregate:

- evaluated: 42/42;
- closed: 37;
- logical failures: 5;
- resource branches: 0.

Exact remaining C3 roots:

```text
466565554644757774
466565554644757776
466565554644757777
466565554644747775
466565554644767775
```

Their residual mechanisms reduce to combinations of:

- immediate enabled-P1-singleton terminality;
- distance-two target-support re-entry rejected by an adversarial P1 terminal reply;
- distance-two re-entry whose distance-one child has `no_lex_predecessor`;
- direct support-distance-one lexicographic failure.

`466565554644757774` is a clean example: the nonclosing branches expose exact P1:D6 terminality. These are genuine logical residuals, not resource artifacts.

## Current theorem gap

The remaining post-block problem is no longer a broad frontier problem and no longer a pure rank problem.

Current exact residual domain:

```text
17 G3 rank-18 logical failures
 5 C3 rank-18 logical failures
22 total residual roots
```

The smallest plausible next calculus is a guarded deadline/response-capacity predecessor contract that keeps, for each selected P0 action and adversarial reply:

- the live target claim;
- exact enabled P1 singleton terminal obligations;
- P0 immediate terminal alternatives;
- available defensive/response slots;
- the exact `rho=(delta,mu)` child;
- terminal-complete branch coverage.

Do not promote a scalar incidence/deadline count to theorem authority. Derive the dependency cone from the exact residual branches and falsify it across mirrored C3/G3 instances.

Detailed current evidence:

`docs/research/2026-09-14-resolved-tail-distance2-postblock-composition.md`

## Immediate execution seam

Current router: `next_step.yaml`.

The next proof obligation is to close or further separate the exact 22 residual rank-18 roots under unchanged proof/state limits. When both C3 and G3 halves close 42/42, compose the resulting post-block theorem into the actual C/G scheduler at `466565554644`.

Only after the exact latent state is branch-complete may it be promoted into `W`; only then push backward through the D3 hinge. Do not claim center-opening or root membership in `W` earlier.

## Hygiene

- Exact search/minimax/oracle WDL is discovery/falsification only.
- Unknown is not loss.
- Failure of a candidate action/theorem family is not state loss.
- `mu`, phase, and simple deadline counts are not value classifiers.
- Claim/proof/action isomorphism is not q equality.
- Response-capacity use requires exact obligation/slot mapping.
- No physical-frontier broadening or arbitrary q recursion.
- No proof/state cap increase without theorem justification.
- Every research qualifier retains the five-minute outer wall and 270-second inner timeout.
