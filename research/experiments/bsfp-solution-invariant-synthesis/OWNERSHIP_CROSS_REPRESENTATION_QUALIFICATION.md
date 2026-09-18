# Solution-to-solution synthesis: ownership cross-representation qualification

Research attribution: **Josh Oshiro**

Date: 2026-09-15

Status: **representation-independent exact result quotient qualified on tested set-lattice products**

This note continues and supersedes the pending independent-ownership falsifier status recorded in `RESULTS.md` at `a6641f21086e83006413a18e643107adee7849d1`.

## Candidate invariant

Strip away clause IDs, coverage words, ownership masks, and CUDA implementation details.

A product stage in a fixed local semantic context emits a multiset `M` of exact semantic results. Downstream work is extensional if equal exact results receive the same downstream result and occurrence multiplicity has no semantic meaning for that operation.

The candidate law is:

> **Extensional exact result-identity quotient law.** Within a fixed authoritative semantic context, multiplicity of exact-equal generated semantic results may be erased before any downstream operation that is extensional in that exact result identity. Occurrence information must be retained only when target semantics require it.

For multiplicity-insensitive normalization `N`:

`N(M) = N(set(M))`

For an extensional guard/evaluator `G` under fixed context:

`N(G(M)) = N(G(set(M)))`

The equality relation is authoritative exact equality. A hash may accelerate grouping but is not equality authority.

## Mapping between qualified solutions

### Clause-coverage product

- **Objects:** support-local upward-coverage signatures.
- **Preserved relation:** exact full coverage equality, then subset implication/order.
- **Information discarded:** multiplicity of identical generated signatures.
- **Commutes with:** support-local exact legal/capacity guard and subsequent subset-minimal normalization.
- **Exactness guard:** same support dictionary, coverage width, beneficiary/count metadata, and full exact signature equality.
- **Eliminated work:** repeated guard evaluation and later duplicate/subset work.

Qualified observations already persisted in `RESULTS.md`:

- rank-27 three-word fixture: `1,020 -> 977` exact classes, 43 guard evaluations removed, 0 mismatches;
- rejection-heavy real suite: `581 -> 514`, 67 guard evaluations removed, including 36 repeated rejected candidates, 0 mismatches.

### Ownership-antichain product

- **Objects:** exact ownership masks in the maintained ownership recurrence.
- **Preserved relation:** exact ownership-mask equality plus subset order.
- **Information discarded:** multiplicity of identical OR or AND product results.
- **Commutes with:** subset-minimal normalization for OR products and subset-maximal normalization for AND products.
- **Exactness guard:** same support/local ownership universe and exact full `BigInt` mask equality.
- **Eliminated work:** duplicate generated-result occurrences before antichain normalization.

Authority is the maintained full-Cartesian solver:

`components/bsfp/ownership-antichain-solver.mjs`

Candidate qualifier on `experiment/bsfp-clause-coverage`:

- `ee5a6f1f9f7830f015835b867fd8c51fb91b7ec5` — `research: add ownership result quotient falsifier`
- `266935d4196ea797bc4a27359e75982806e92c2f` — `ci: qualify ownership result quotient`

Green CI run: `35053369489` at exact head `266935d4196ea797bc4a27359e75982806e92c2f`.

## Independent ownership falsifier

Five complete controls, identical to the historical ownership core-absorption qualification set:

| Geometry | Supports |
| --- | ---: |
| 4x3 c3 | 256 |
| 4x4 c4 | 625 |
| 5x3 c4 | 1,024 |
| 4x4 c3 | 625 |
| 4x5 c4 | 1,296 |
| **Total** | **3,826** |

Hard leashes:

- wall clock: 30 seconds;
- raw product pairs: 1,000,000;
- supports: 4,000;
- no larger geometry/descent;
- no timeout extension.

For every support the candidate recurrence was compared against the maintained full-Cartesian ownership authority. The candidate also required exact equality between normalization of the post-absorption occurrence multiset and normalization of its exact-result set for every product call.

## Qualification result

Across all five complete controls:

| Metric | Result |
| --- | ---: |
| Supports | **3,826** |
| Raw Cartesian pairs | **772,878** |
| Generated operations after core/envelope absorption | **278,757** |
| Exact result classes | **168,230** |
| Additional duplicate occurrences eliminated | **110,527** |
| Additional elimination after absorption | **39.6499%** |
| Generated / raw | 36.0674% |
| Exact classes / raw | **21.7667%** |
| Authority support-frontier mismatches | **0** |
| Observed wall time | 1,307 ms |

Both lattice polarities survived independently:

| Polarity | Raw pairs | Post-absorption generated | Exact classes | Duplicates eliminated | Additional elimination |
| --- | ---: | ---: | ---: | ---: | ---: |
| OR -> subset-minimal | 314,342 | 124,326 | 74,143 | **50,183** | **40.3640%** |
| AND -> subset-maximal | 458,536 | 154,431 | 94,087 | **60,344** | **39.0751%** |

Per-geometry post-absorption duplicate elimination ranged from roughly 32.7% to 47.1%; the effect was not localized to one board shape.

## Reassessment

The independent falsifier survives strongly enough to promote the **narrow common law** from clause-specific to representation-independent over the qualified finite set-lattice products.

The new reduction is not supplied by core-relative absorption alone: after absorption had already reduced Cartesian work, exact identity removed another 110,527 emitted occurrences on the ownership controls.

The useful common pipeline is therefore:

`extract compulsory core/envelope`
`-> constructively absorb dominated product fibers`
`-> collapse exact generated-result identity`
`-> evaluate any extensional admissibility/semantic guard once per class`
`-> subset-minimal/maximal antichain normalization`

The stages remain distinct theorems.

### Relationship to core-relative absorption

Core-relative absorption is an **order-fiber quotient before materialization**. It uses a constructive witness to prove that an emitted real product result dominates an entire Cartesian row or column.

Exact result quotient is an **equality quotient after materialization/emission**. It removes multiplicity among the survivors and constructive absorber representatives.

Neither subsumes the other. Their composition strictly subsumes absorption alone on the tested workloads.

### Relationship to #11 normalization

The result strengthens the boundary already assigned to CUDA-Algorithms #11:

`true exact duplicate collapse -> subset-minimal/maximal normalization -> compact retained records/indices`

The rank-22 evidence had shown why a linear prior-equality scan was not the desired implementation. This cross-representation result establishes that exact duplicate collapse is not merely a clause-coverage cleanup detail; it is a reusable semantic stage worth implementing as a real exact identity grouping primitive such as sort/RLE or equivalent grouping before subset dominance.

### Relationship to O3

O3 and exact result quotient share the stripped pattern:

`many occurrences -> authoritative exact semantic identity -> compute extensional work once per identity class`

But the lift differs:

- O3 is occurrence-sensitive and retains sidecars/transporters so one canonical transform result can be restored to every concrete occurrence;
- antichain result quotient is occurrence-idempotent and may erase multiplicity entirely.

Therefore a shared **exact identity/class/provenance contract** is justified as a research architecture target, while one monolithic kernel is not.

## Supersession relationship

The strongest retained synthesis is a theorem family:

`authoritative exact quotient factoring`

with specializations:

1. **constructive order-fiber quotient before generation** — core/envelope-relative absorption;
2. **idempotent exact-result quotient** — duplicate result collapse before extensional work / #11 normalization;
3. **occurrence-sensitive semantic quotient + lift** — O3 residual reuse.

This is useful because it yields:

- one exact quotient theorem replacing clause-specific and ownership-specific duplicate-collapse arguments;
- shared exact identity/class/provenance machinery as a legitimate architecture target;
- a strict composed work reduction beyond core absorption alone;
- a principled ordering that moves exact duplicate collapse left of an extensional guard when one exists.

It does **not** justify treating structural equality, transition equality, semantic identity, and proof identity as interchangeable.

## Exactness boundaries

Promotion is limited by the following guards:

- exact value equality only; hash != equality authority;
- fixed semantic context/local universe unless a proved transporter canonicalizes coordinates and metadata;
- downstream operation must be extensional in the quotient identity;
- multiplicity-sensitive consumers require occurrence sidecars instead of erasure;
- equality quotient does not itself prove subset dominance;
- core/envelope absorption still requires its own constructive witness;
- clause legal-slice guard commutation was separately qualified in clause coverage; ownership qualifies quotient-before-normalization at its product seam;
- CPU semantic work-shape evidence is not native CUDA performance evidence.

## Disposition

**PROMOTE the Extensional Exact Result-Identity Quotient Law within the qualified scope.**

**DO NOT promote the stronger claim that core absorption, exact duplicate collapse, normalization, and O3 are one implementation kernel.** They are specializations/compositions of a smaller quotient calculus with different authority and lifting requirements.

The solution↔solution synthesis method has therefore passed its first substantive test: deconstructing successful solutions exposed a new exact reduction, independently reproduced it across representations and dual lattice polarities, and reduced several local arguments to one guarded law.
