# Connect4 current research status

**Updated:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is a current-state router. Retained history and controls remain under `docs/research/**` and executable controls under `research/semantic-quotient/**`.

## Objective

Derive a complete structural proof of standard 7x6 Connect Four perfect-play W/D/L, then derive the exact P0 perfect-play terminal winning-line set with provenance. Suspected output cardinalities are outputs only, never premises or tuning targets.

## Canonical exact stack

```text
E  causal event poset / support ideals
R  residual winning-requirement antichains
P  CPC / GF(2) phase / precedence / deadlines
C  typed temporal policy contracts / resources / compatibility
N  guarded monotone dependency closure
G  alternating predecessor fixed point
Q  observation-sensitive value / provenance quotients
```

One legal placement is one typed event with simultaneous E/R/P/C/N projections.

Ordinary value identity remains C4-0010:

```text
q = exact support + normalized R0 + normalized R1
```

Output identity remains stricter:

```text
q + exact P0 residual/original-line provenance Pi0
```

Winning region remains:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

The governing compression rule is:

```text
Erase a distinction only when it is a congruence for the exact downstream claim being proved.
```

Claim-relative theorem reuse and theorem composition are not q equality.

## Root boundary

All six non-center first moves are internally structurally proved P0-nonwinning:

```text
V(opening c) <= 0 for c in {1,2,3,5,6,7}.
```

The unresolved root-value obligation remains the positive structural proof after opening column 4. This repository therefore does **not** yet claim a complete internal standard-7x6 solve.

There are exactly 69 geometric winning lines. The retained `28` result is a fixed-seam proof-term/witness count, not a proved 69 -> 28 reduction of the geometric line universe.

## Claim-relative typed-event library

The generic theorem layer implements:

```text
TypedEventSignature(claim, context, event)
DependencyCone_of_claim
Canonicalize_typed_cone
Verify_structure_preserving_renaming
Instantiate_theorem_with_opaque_nonincident_context
```

Canonicalization is exact within a hard bounded permutation budget. Nonincident context remains live but opaque. Successful reuse explicitly does not imply q equality, full-successor equivalence, provenance equivalence, or later-strategy equivalence.

The generic hostile/positive suite passes 9/9 controls.

### Replay-qualified seed claims

- `enabled_singleton_discharge`: 3 physical contexts -> 1 theorem class.
- `same_column_stutter_preserves_latent_contract`: 5 physical macros -> 1 theorem class.
- `cross_support_pair_establishes_two_chain_stage`: 2 mirrored macros -> 1 theorem class.
- `phase_defect_transport`: 92 exact legal nonterminal transport macros -> 1 pure-phase theorem class.
- `size_two_response_capacity_circuit`: 9 finite matching models, exactly 2 Hall/rank violations -> 1 abstract circuit class; general Connect4 certificate-to-obligation mapping remains incomplete.
- `universal_hinge_generates_two_latent_singletons`: exact D3 hinge with all 7 legal P1 replies checked; both C3/G3 singleton consequences survive the one-reply horizon and no P1 reply is immediately terminal.

Authority and detailed boundaries:

`docs/research/2026-09-13-claim-relative-signature-library.md`

## Primitive factorization

Two cross-claim factors are exact executable controls:

```text
R_monotone_residual_cofactor
  -> hinge pair-to-singleton generation
  -> opponent singleton discharge

P_two_ply_GF2_column_operator
  phi' = phi + e_a + e_b
  -> a=b: same-column zero-displacement stutter
  -> a!=b: distinct-column toggle / phase-defect transport
```

A third factor is structurally indicated but remains partial:

```text
C_response_matching_capacity
```

because the general strategic-certificate -> obligation/response-slot mapping has not yet been proved.

## Guarded theorem composition

The missing theorem-composition operation is now implemented and qualified:

```text
Export_typed_theorem_contract
Unify_conclusion_with_premise
Verify_opaque_frame_condition
Verify_temporal_resource_compatibility
Verify_terminal_complete_composition
Compose_theorem_chain
```

Each theorem contract explicitly carries ordinary structural facts, opaque/load-bearing frame facts, temporal/resource facts, terminal alternatives, and provenance mode/facts when observable.

There is deliberately **no implicit frame rule**. If the downstream theorem observes a fact, the upstream theorem or an intervening exact event contract must explicitly provide it.

The new hostile/positive suite passes 8/8 controls, including rejection of:

- phase-only -> stronger repair-effect composition when incident `R` is missing;
- response-capacity application without exact obligation/slot mapping;
- a dropped live terminal alternative;
- opaque-frame mutation without a qualified event;
- provenance-sensitive composition after a value-only contract;
- missing temporal/resource/deadline state.

Detailed authority and semantics:

`docs/research/2026-09-13-guarded-theorem-composition-calculus.md`

Focused qualification run:

```text
34806311358
head 28a9990b9a8c539ee8e890e9d6d115d77ec31d4a
result success
```

The run re-qualified every earlier claim-relative stage before executing the two new composition stages.

## Exact multi-theorem bridge

The qualified hinge and latent-contract controls are now composed through an exact event bridge:

```text
4665655546
  -- P0:D3 -->
  -- P1:D4 -->
466565554644
```

The three-contract chain is:

```text
hinge_D3_instantiation
-> exact_D4_bridge
-> latent_target_contract_activation
```

Fact provenance is explicit:

- the hinge theorem supplies live P0 singletons C3 and G3;
- the exact D3 transition supplies the after-D3 frame, P1 turn, and current reply deadline;
- the exact D4 transition supplies the destination frame, C1/G1 enablement, P0 turn, response deadline, and one defender slot per attack;
- the qualified temporal theorem then activates the latent C3/G3 cross-pair contract.

The destination state is checked by exact C4-0010 state identity, not inferred from sequence notation.

This bridge does **not** prove a win. The target-only subsystem remains locally defensible.

## Exact stutter re-entry

The active latent contract composes through all five previously qualified fixed-state same-column stutters:

```text
A1 -> A2
B1 -> B2
D5 -> D6
E5 -> E6
F5 -> F6
```

Each exact two-ply macro is legal/nonterminal, returns P0 to move at rank 14, and preserves both C3 and G3 singleton obligations. The theorem-composition layer therefore has a proved re-entry path for these external macro events without asserting q equality.

## Immediate execution seam

The first remaining unproved premise toward center-opening membership in `W` is now:

```text
well_founded_off_subsystem_progress_or_reentry
```

Required form:

> For every legal off-target P0 event not covered by a qualified same-column stutter, prove a guarded composition that either re-enters the latent contract, enters an exact response-capacity circuit with a proved obligation/slot map, or strictly advances a well-founded structural progress rank toward a terminal or alternating-predecessor certificate.

The current exact finite domain for attacking this premise is already available:

```text
20 exact repair transitions
-> 12 exact local semantic-effect classes
   8 nontrivial reused classes
   4 singleton classes
```

The next task is to export guarded contracts for those local semantic classes and build only the theorem-class transition relation justified by retained exact evidence. For each non-stutter class, prove re-entry, terminality, a fully mapped capacity circuit, or strict decrease in a well-founded E/R/P/C/N rank.

Phase weight alone is not an admissible progress rank because qualified controls already show phase-defect transport rather than guaranteed elimination. If the current structural vocabulary contains a cycle instead of a rank, retain the smallest exact strongly connected class set as the falsifier.

Current router: `next_step.yaml`.

## Hygiene

- Exact search/minimax/oracle values are discovery/falsification controls only.
- Bayesian confidence is external research-priority metadata only and never enters proof semantics.
- Static blocker coverage is not policy realizability.
- Phase is not a W/D/L classifier and phase weight is not automatically a progress rank.
- Local theorem isomorphism and theorem composition are not q equality.
- Response-capacity circuits require an exact obligation/slot mapping before Connect4 application.
- Unresolved frontiers remain unknown, not losses.
- No q/frontier cap or recursion-depth increase without a new theorem.
- Every experiment has a hard five-minute wall-clock limit.
