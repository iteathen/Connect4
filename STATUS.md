# Connect4 current research status

**Updated:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is the current-state router. Detailed evidence remains under `docs/research/**`; executable controls remain under `research/semantic-quotient/**`.

## Objective

Derive a complete internal structural proof of standard 7x6 Connect Four perfect-play W/D/L, then derive exact P0 perfect-play terminal winning-line provenance. Suspected output cardinalities are outputs only, never proof premises.

## Exact semantic boundary

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

Ordinary value identity remains C4-0010:

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

Claim-relative theorem reuse, action-relative proof cones, and proof-term equality are not q equality.

## Root boundary

All six non-center first moves are internally structurally proved P0-nonwinning:

```text
V(opening c) <= 0 for c in {1,2,3,5,6,7}.
```

The unresolved root obligation is still the positive structural proof after opening column 4. The repository does **not** yet claim a complete standard-7x6 solve.

There are exactly 69 geometric winning lines. The retained historical `28` count is a fixed-seam witness count, not a proved 69 -> 28 reduction.

## Claim-relative theorem substrate

Qualified generic operations:

```text
DependencyCone_of_claim
Canonicalize_typed_cone
Verify_structure_preserving_renaming
Instantiate_theorem_with_opaque_nonincident_context
Export_typed_theorem_contract
Unify_conclusion_with_premise
Verify_opaque_frame_condition
Verify_temporal_resource_compatibility
Verify_terminal_complete_composition
Compose_theorem_chain
```

Qualified seed families include enabled-singleton discharge, same-column stutter preservation, cross-support pair staging, GF(2) phase transport, the D3 hinge, and the exact finite response-capacity theorem. The general rule remains: erase a distinction only when it is a congruence for the exact downstream claim.

The exact bridge

```text
4665655546 -- P0:D3 -- P1:D4 --> 466565554644
```

is guarded-composition qualified. It activates the latent C3/G3 contract but does not itself prove a win.

## Action-relative correction

The attempted 12-class local progress graph and its 14-class continuation refinement both fail as action-complete state quotients. Cross-action controls split them.

The replacement abstraction is:

```text
ActionProgressCone(S, a)
```

which retains only the E/R/P/C/N facts load-bearing for the selected action claim. It licenses local theorem reuse without promoting physical states to q identity.

Qualified one-round facts:

- A/B chain actions strictly consume one selected support resource;
- D/E/F tail actions strictly consume the final selected tail resource;
- immediate P1 replies never increase the selected-column capacity;
- exact incident R remains available to stronger continuation claims.

## Exact reply routing and tail handoffs

The 108-reply action-progress control partitions exactly into:

- 32 chain off-channel continuations;
- 8 chain same-column deeper continuations;
- 20 enabled target-singleton immediate P0 terminal certificates;
- 48 exhausted-tail handoffs.

The 40 non-target chain branches admit another same-column P0 action with strict capacity descent or terminal closure.

For the 48 exhausted-tail handoffs:

- A/B both safe: 16;
- exactly one A/B safe: 8;
- no A/B safe: 24;
- after broadening to A/B/D/E/F, 12 still have no safe off-target action.

The original universal A/B handoff conjecture is therefore retained as a falsified candidate theorem.

## Twelve exact local P0-loss states

All seven P0 columns were exhausted in the 12 no-safe-off-target rank-22 states.

Result:

- 12/12 have a universal immediate P1 terminal-response certificate;
- 0 escape actions.

This is an exact local P0-loss certificate for those 12 states only. It is not a general state classifier.

## Tail-action elimination and structural survivors

Pushing those 12 local-loss certificates one predecessor step backward over the 12 D/E/F tail actions gives:

- 8 adversarially eliminated tail actions;
- 4 surviving tail actions.

The survivor is structural and independent of resolved-singleton owner:

```text
remaining target G3 -> survivor F
remaining target C3 -> survivor D
```

Within the retained D/E/F family, the only surviving tail action is the column immediately adjacent to the remaining target.

## Adjacent-tail continuation seam

Across the 20 exact P1 replies after the four adjacent-tail survivors:

- 4 are immediate P0 target-terminal certificates;
- 6 leave both A/B safe;
- 2 leave exactly one A/B safe;
- 8 leave neither A nor B safe.

Thus the stronger universal A/B re-entry conjecture is also retained as falsified.

All seven P0 actions were then classified in the eight no-A/B states:

- 0 immediate P0-certificate states;
- 8 states with a qualified continuation;
- 0 unresolved states.

Each of the eight has exactly one qualified continuation:

> After the target-adjacent tail survives, if P1 consumes one of the two remaining D/E/F tails, P0 consumes the other remaining tail.

The eight complementary-tail continuations were replayed over all 40 immediate P1 replies:

- 8 replies yield a P0 predecessor certificate;
- 32 yield another qualified continuation;
- 0 unresolved replies.

## Well-founded five-column repair measure

The channel-switching continuations expose the correct structural rank:

```text
mu(S) = sum remainingCapacity_c(S), c in {A,B,D,E,F}
```

For every selected repair action in the qualified subsystem:

- P0 decreases `mu` by exactly one;
- every P1 reply is nonincreasing in `mu`.

Observed nonterminal P0 induction levels are the odd sequence:

```text
15, 13, 11, 9, 7, 5, 3, 1
```

## Restricted alternating-predecessor induction

A bounded structural proof DAG was run over the 16 nonterminal successors of the four adjacent-tail survivor actions. Four sibling replies are already immediate P0 target-terminal certificates.

Recursive P0 invariant:

- P0 to move;
- remaining target singleton live;
- target support distance exactly one.

Allowed P0 witness actions are restricted to `A,B,D,E,F`.

A witness action is accepted only if every legal P1 reply is nonterminal for P1 and routes to either immediate P0 terminality or another invariant state with strictly smaller `mu`.

Qualified result:

- start states: 16;
- proved: 16;
- failed: 0;
- memoized physical proof states: 9,635;
- candidate P0 actions checked: 25,424;
- P1 branches checked: 80,384;
- maximum induction depth: 7;
- hard proof-state cap: 100,000.

This closes the four adjacent-tail survivor actions inside the restricted repair-policy subsystem.

Detailed evidence:

`docs/research/2026-09-13-repair-capacity-predecessor-induction.md`

## Proof-term review

The finite proof DAG was canonicalized claim-relatively after exact branch coverage.

Retained in a proof term:

- current `mu`;
- complete P1 branch multiplicity;
- terminal alternatives;
- child proof-class multiset.

Physical action/reply labels are erased only at this proof-claim boundary.

Result:

- 1,022 total canonical proof classes including terminal base;
- 1,021 nonterminal classes;
- 9 proof classes across the 16 required start states;
- exactly one `mu=1` base class: `M1[T]`.

**Do not call 1,022 classes a small universal theorem library.** This is a valid finite restricted proof certificate with a useful well-founded induction schema, but substantial branch diversity remains.

## Immediate execution seam

The old `build_local_effect_class_transition_graph` task is retired.

The next proof obligation is:

```text
compose_repair_capacity_induction_back_to_latent_contract
```

For each exact rank-20 latent-contract state, prove that P0 has at least one legal action whose exhaustive P1 replies are discharged by one of:

- immediate P0 terminal certificate;
- qualified chain descent;
- the proven target-adjacent-tail / repair-capacity induction subsystem;
- another already-qualified guarded contract.

If all exact rank-20 latent-contract states close, promote that finite domain to a guarded structural P0-winning contract and compose it backward through the qualified D3/D4 hinge. Do not claim center-opening membership in `W` until those compositions are actually closed.

Current router: `next_step.yaml`.

## Hygiene

- Exact search/minimax/oracle WDL is discovery/falsification only.
- Bayesian confidence never enters proof semantics.
- Unknown is not loss.
- Failure of a candidate P0 action family is not P0 loss.
- Phase is not a W/D/L classifier.
- Claim/proof/action isomorphism is not q equality.
- Response-capacity application requires exact obligation/slot mapping.
- No q/frontier cap or recursion-depth increase without a new theorem.
- Every research qualifier has a hard five-minute wall-clock limit.
