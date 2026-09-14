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

Claim-relative theorem reuse is not q equality.

## Root boundary

All six non-center first moves are internally structurally proved P0-nonwinning:

```text
V(opening c) <= 0 for c in {1,2,3,5,6,7}.
```

The unresolved root-value obligation remains the positive structural proof after opening column 4. This repository therefore does **not** yet claim a complete internal standard-7x6 solve.

There are exactly 69 geometric winning lines. The retained `28` result is a fixed-seam proof-term/witness count, not a proved 69 -> 28 reduction of the geometric line universe.

## Claim-relative typed-event library

The generic theorem layer now implements:

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

Focused qualification runs:

- `34804665143` on `722d2f69a289bf40561f24aef9ae115a10f260d1`;
- `34805072309` on `27fe94853a8a6625b6a79c9ff80bf68374a381d7`;
- `34805220177` on `41acdedf735d2d0532ccaee1cc4fe6708b373dff`.

All focused jobs obey the five-minute wall with 270-second inner process bounds.

## First primitive factorization

Two cross-claim factors are now exact executable controls:

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

## Exact composition seam

The qualified hinge and latent-contract controls touch at an exact state boundary:

```text
4665655546 -- P0:D3 -- P1:D4 --> 466565554644
```

The destination is exactly the fixed C3/G3 latent-target contract root.

This bridge does **not** prove a win. The target-only subsystem is locally defensible by the qualified cross-pair scheduler. Its importance is that it gives a real bounded seam for testing theorem composition without reconstructing the physical q-tree.

## Missing calculus / immediate execution seam

Theorem reuse is now executable. The missing operation is **guarded theorem composition**.

A sound composer must prove that theorem A's exact conclusion discharges theorem B's exact premises while threading:

- event order / side-to-move;
- temporal-contract state;
- CPC/GF(2) phase;
- resources and deadlines;
- NDC guards;
- terminal alternatives;
- opaque nonincident frame conditions;
- provenance when observable.

The next task is to build and falsify this composition calculus on the exact D3->D4->latent-contract bridge, then use it to identify which premise still blocks promotion of local structural theorems into center-opening membership in `W`.

Current router: `next_step.yaml`.

## Hygiene

- Exact search/minimax/oracle values are discovery/falsification controls only.
- Bayesian confidence is external research-priority metadata only and never enters proof semantics.
- Static blocker coverage is not policy realizability.
- Phase is not a W/D/L classifier.
- Local theorem isomorphism is not q equality.
- Response-capacity circuits require an exact obligation/slot mapping before Connect4 application.
- Unresolved frontiers remain unknown, not losses.
- No q/frontier cap or recursion-depth increase without a new theorem.
- Every experiment has a hard five-minute wall-clock limit.
