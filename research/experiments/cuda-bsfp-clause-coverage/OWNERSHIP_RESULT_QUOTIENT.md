# Ownership-antichain exact result quotient qualification

Research attribution: **Josh Oshiro**

Date: 2026-09-15

Status: **qualified on independent ownership-antichain representation**

## Purpose

This is the independent-representation falsifier for the solution-to-solution invariant-synthesis candidate first observed in support-local clause coverage.

The question is whether exact generated-result identity remains an independently useful quotient **after core/envelope-relative product absorption** in the older ownership-antichain representation, or whether the earlier result was merely a property of clause coverage.

This experiment does not use clause dictionaries, clause guards, or coverage signatures as authority. The maintained full-Cartesian ownership solver is the authority.

## Stripped invariant under test

For a finite local semantic universe, let a product stage generate a multiset `M` of exact semantic result values. Let downstream normalization be multiplicity-insensitive and depend only on exact value plus fixed local context.

Then exact result multiplicity is semantically irrelevant:

`N(M) = N(set(M))`

where equality is authoritative full result equality, not a hash.

The ownership representation tests both lattice polarities:

- OR product followed by subset-minimal normalization;
- AND product followed by subset-maximal normalization.

Core/envelope absorption remains a separate preceding theorem. The candidate quotient is tested only on the results that absorption actually emits.

## Authority

Authority implementation:

`components/bsfp/ownership-antichain-solver.mjs`

The authority retains ordinary full Cartesian ownership products and exposes exact per-support win/loss frontiers.

Candidate qualifier:

`research/experiments/cuda-bsfp-clause-coverage/qualify-ownership-result-quotient.mjs`

Experimental implementation checkpoints:

- `ee5a6f1f9f7830f015835b867fd8c51fb91b7ec5` — `research: add ownership result quotient falsifier`
- `266935d4196ea797bc4a27359e75982806e92c2f` — `ci: qualify ownership result quotient`

CI qualification:

- workflow: `bsfp-clause-coverage-experimental`
- run: `35053369489`
- head: `266935d4196ea797bc4a27359e75982806e92c2f`
- result: green

## Bounded falsifier

The candidate reconstructs the ownership recurrence on the same five complete geometries previously used to qualify core-relative absorption:

| Geometry | Supports |
| --- | ---: |
| 4x3 c3 | 256 |
| 4x4 c4 | 625 |
| 5x3 c4 | 1,024 |
| 4x4 c3 | 625 |
| 4x5 c4 | 1,296 |
| **Total** | **3,826** |

Hard leashes:

- wall-clock: 30,000 ms;
- raw product pairs: 1,000,000;
- supports: 4,000;
- no larger geometry or solver descent;
- no timeout extension.

For every product call the candidate:

1. applies the already-qualified core-relative OR/minimal law or envelope-relative AND/maximal dual;
2. records all emitted absorber representatives and remaining Cartesian product results;
3. groups those generated results by exact `BigInt` ownership-mask equality;
4. subset-normalizes both the occurrence multiset and the exact-identity set and requires equality;
5. reconstructs the complete recurrence;
6. compares **every support win/loss frontier** against the maintained full-Cartesian ownership authority.

The experiment additionally fails if post-absorption duplicate result classes are absent in either lattice polarity.

## Qualification result

Across all five complete controls:

| Metric | Result |
| --- | ---: |
| Supports | **3,826** |
| Raw Cartesian product pairs | **772,878** |
| Generated operations after core/envelope absorption | **278,757** |
| Exact generated-result classes | **168,230** |
| Duplicate generated occurrences eliminated | **110,527** |
| Additional elimination after absorption | **39.6499%** |
| Generated / raw | 36.0674% |
| Exact classes / raw | **21.7667%** |
| Support-frontier mismatches | **0** |
| Observed wall time in CI | 1,307 ms |

### OR / subset-minimal polarity

| Metric | Result |
| --- | ---: |
| Product calls | 3,996 |
| Raw pairs | 314,342 |
| Residual pair products after absorption | 96,386 |
| Generated operations | 124,326 |
| Exact result classes | 74,143 |
| Duplicate occurrences eliminated | **50,183** |
| Additional post-absorption elimination | **40.3640%** |
| Calls containing duplicates | 3,556 |

### AND / subset-maximal polarity

| Metric | Result |
| --- | ---: |
| Product calls | 3,668 |
| Raw pairs | 458,536 |
| Residual pair products after absorption | 120,680 |
| Generated operations | 154,431 |
| Exact result classes | 94,087 |
| Duplicate occurrences eliminated | **60,344** |
| Additional post-absorption elimination | **39.0751%** |
| Calls containing duplicates | 3,502 |

### Per-geometry duplicate elimination

The result is not concentrated in one geometry:

| Geometry | OR/min duplicates | OR/min rate | AND/max duplicates | AND/max rate |
| --- | ---: | ---: | ---: | ---: |
| 4x3 c3 | 936 | 32.66% | 1,365 | 38.38% |
| 4x4 c4 | 2,332 | 35.76% | 3,002 | 36.82% |
| 5x3 c4 | 3,098 | 42.02% | 1,716 | 47.12% |
| 4x4 c3 | 10,595 | 38.59% | 11,547 | 39.24% |
| 4x5 c4 | 33,222 | 41.47% | 42,714 | 38.95% |

All complete-control support frontiers matched the independent ownership authority exactly.

## Interpretation

The clause-coverage observation survives an independent representation and both order polarities. The useful common law is therefore broader than clause coverage:

> **Extensional exact result-identity quotient law.** Within a fixed authoritative semantic context, multiplicity of exact-equal generated semantic results may be erased before any downstream operation that is extensional in that exact result identity. Occurrence information must be retained only when target semantics require it.

For antichain product pipelines the qualified ordering is:

`core/envelope extraction -> constructive row/column absorption -> exact result-identity collapse -> extensional per-result guard/work when present -> subset-minimal/maximal normalization`

This ordering is strictly stronger than core absorption alone on the tested controls: it removed another 110,527 generated occurrences after absorption had already acted.

## What this does not establish

- Core-relative absorption and antichain normalization are **not the same theorem**.
- The quotient does not authorize equality across different supports, dictionaries, local universes, or coordinate systems without an explicit exact transporter/canonicalization contract.
- Hash equality is not semantic equality authority.
- Multiplicity-sensitive consumers cannot erase occurrence multiplicity.
- The ownership representation has no clause legal-slice guard at this product seam, so this experiment qualifies quotient-before-normalization there; the earlier clause experiments separately qualify quotient-before-extensional-guard.
- This is CPU semantic work-shape qualification. It is not native CUDA runtime evidence.

## Supersession / synthesis relationship

The result supports a smaller residual-product calculus with distinct stages rather than more optimization names:

1. **constructive order-fiber quotient** — core/envelope absorption removes whole dominated Cartesian fibers before materialization;
2. **exact extensional result quotient** — exact duplicate outputs are collapsed after generation;
3. **admissibility guard** — when extensional in exact identity, evaluate once per exact class;
4. **order quotient** — antichain normalization removes strict subset-dominated results.

O3 remains the occurrence-sensitive sibling: it uses exact semantic identity to compute an expensive transform once per class, but preserves occurrence sidecars and lifts the result back. Exact result collapse is the idempotent-output specialization where multiplicity itself is discardable.

This is sufficient evidence for shared **exact identity / class / provenance machinery**, but not for one monolithic kernel and not for conflating structural, transition, semantic, and proof identity.
