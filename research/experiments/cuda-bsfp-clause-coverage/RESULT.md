# CUDA-BSFP clause-coverage device qualification

**Status:** synthetic and real-workload portable Device-JS compile/prepare/submit qualified; native semantic device execution not yet qualified.

**Research direction:** Josh Oshiro.

## Scope

This experiment isolates the fixed-two-u32 execution shape of the variable-width support-local clause-coverage BSFP candidate.

The semantic representation remains geometry-selected:

```text
coverageWords(S) = ceil(|D(S)| / backendWordBits).
```

The current 64-bit profile is only the first device qualifier. It is not a 42-cell, 69-line, WSL-625, or universal one-u64 solver contract.

## Device primitive

The current experimental plan implements:

```text
record conjunction:
    candidate = leftCoverage OR rightCoverage

cheap exact legal-slice rejection:
    forced singleton overflow
    zero remaining capacity with unsatisfied clauses
    one remaining stone using Contains_S[cell] subset tests

frontier normalization:
    fixed-width subset antichain reduction
```

## Exact structural substrate

The research lane independently qualified the support-local clause dictionary:

```text
D(S)
  = occupied singleton cells
    union unique nonempty { winningLine intersect S }

|D(S)| <= rank(S) + L(W,H,K)
```

and the coverage algebra:

```text
record implication:
    A => B iff U(B) subseteq U(A)

record conjunction:
    U(A AND B) = U(A) union U(B).
```

The support-edge cofactor is exact directly in coverage form:

```text
child coverage
    -> precomputed Boolean edge transform
    -> parent coverage

opponent singleton {x}
    -> exact record kill
```

No minimal-clause reconstruction is required in the persistent cofactor path.

### Independent semantic recurrence qualification

Draft PR #47 (`experiment/bsfp-support-local-clause-coverage`) compares the support-local coverage recurrence with precomputed cofactor maps against the variable-array beneficiary-relative clause-CNF authority on complete controls.

Successful workflow run:

```text
run:  35036205242
head: fd7a8df05eadfbf47f5a3569423c552284542d15
controls:
  4x3 c3
  4x4 c4
  5x3 c4
  4x4 c3
  4x5 c4
  5x4 c4
support mismatches: 0
```

The same qualification found the largest exact 5x4 c4 universal merge at support `3,1,1,3,3`:

```text
rank:                         11
beneficiary:                  P0
local dictionary width:       22 bits
left/right records:           32 x 19
raw Cartesian pairs:          608
unique raw OR signatures:     245
exact duplicate pair results: 363
legal-slice rejected:         486
accepted pair occurrences:    122
unique accepted signatures:    83
subset-minimal survivors:      32
```

This semantic qualification is separate from the CUDA device experiment below.

## Qualification history

### Compile falsifier

The first portable run failed Device-JS validation because the experimental kernel used JavaScript `ConditionalExpression` syntax.

No device semantics were executed. Unsupported ternary expressions were removed without changing the algebra.

### Qualifier-boundary falsifier

The next run compiled/submitted but the portable qualifier incorrectly compared testing-runtime output buffers with the CPU authority.

The CUDA-JS testing runtime is compile/prepare/submit authority; it does not execute arbitrary device-kernel semantics. The qualifier was corrected to use:

```text
portable:
    compile + load + prepare + bind + submit + completion

native:
    exact output/rejection/frontier equality
```

This was a qualification-boundary defect, not a semantic failure.

### Real-fixture provenance correction

The first real-workload generator applied the exact legal-slice filter recursively while evolving the CPU recurrence. Although the filter only rejects impossible exact-cardinality records, this changed the operational frontier from which the benchmark hot jobs were selected and therefore was not independent benchmark provenance.

The generator was corrected so that:

```text
recurrence evolution:
    unfiltered exact clause-CNF frontier

captured device job:
    exact legal-slice filter applied only to that Cartesian merge
```

This restores the independently qualified 5x4 hot job from `30 x 19 = 570` to `32 x 19 = 608`. The earlier 570-pair figure must not be interpreted as a semantic improvement; it was a benchmark-generation artifact.

## Synthetic portable qualification

At commit `c0d52029e90dded697cbe82e1ef42cf97adc22b6`, workflow run `35035210597` passed:

```text
portable compile:       pass
module load:            pass
prepared DAG creation:  pass
view/binding checks:    pass
submission/wait:        pass
CPU fixture authority:  constructed
native kernel outputs:  not claimed
```

## Corrected real BSFP workload qualification

Code commit:

```text
64d4f9ed9ea6a04d595820bbbf667cbd1c6c8203
```

Workflow:

```text
bsfp-clause-coverage-experimental
run 35036638808
job 104607110401
result: success
```

The real fixture is regenerated from complete **unfiltered exact** beneficiary-relative clause-BSFP solves on every run. It selects:

```text
five hottest 5x4 c4 universal jobs
two hottest 4x5 c4 universal jobs
two adversarial 4x4 c3 universal jobs
```

For each captured merge, the exact legal-slice filter is then applied as the candidate pre-normalization rejection step. Before device submission, clause records are encoded into support-local coverage signatures and an independent packed CPU implementation re-evaluates OR composition, legal-slice rejection and subset normalization.

Result:

```text
real segments:                  9
raw pair candidates:        4,176
CPU exact pre-normalization
  rejects:                  3,325
CPU normalized survivors:     199
packed CPU authority
  mismatches:                   0
portable Device-JS compile:   pass
prepare/bind/submit:          pass
native output authority:      not claimed
```

The exact pre-normalization rejection rate over the selected real jobs is about **79.62%**.

### Hottest corrected 5x4 c4 job

```text
support:                     3,1,1,3,3
rank:                        11
beneficiary:                 P0
exact P0 stones:             6
local dictionary width:      22 bits
left/right records:          32 x 19
raw pairs:                   608
unique raw OR signatures:    245
exact duplicate raw pairs:   363
legal-slice rejected:        486
accepted pair occurrences:   122
unique accepted signatures:   83
subset-minimal survivors:     32
```

This is the same workload shape independently observed by the semantic recurrence qualification in PR #47.

## Normalization diagnosis

The real workload exposes two large exact reductions before the final subset frontier:

```text
608 raw pair occurrences
 -> 245 distinct OR signatures
 -> 122 capacity-feasible pair occurrences
 -> 83 distinct feasible signatures
 -> 32 subset-minimal survivors
```

For the hottest job:

- 59.7% of raw pair occurrences duplicate another OR signature;
- 79.9% of raw pair occurrences are rejected by the exact legal-slice filter;
- only 5.3% of raw pair occurrences remain in the final subset-minimal frontier.

The current correctness-first device normalizer still discovers same-cardinality equality by scanning prior candidate positions and performs direct frontier subset scans. That reusable algorithmic seam has been routed to CUDA-Algorithms issue #11:

```text
Feature request: bounded segmented fixed-width set-antichain normalization
```

The generic boundary is:

```text
consumer-owned generation/filter
    -> exact fixed-word duplicate collapse
    -> exact segmented subset-minimal/maximal normalization
    -> compact retained indices/records
```

Connect4 retains proof meaning, legal-slice predicates and clause/ownership semantics. No new CUDA-JS runtime/compiler mechanism gap has been found at this stage.

## 6x5 width relevance

The independent support-local dictionary census over all 46,656 6x5 c4 supports found:

```text
rank 23 max dictionary: 61
rank 24 max dictionary: 63
rank 25 max dictionary: 64
rank 26 max dictionary: 65
full rank max:          69
```

Thus every support through rank 25 fits the current 64-bit execution profile, including the late/high-rank region where the earlier 6x5 ownership CUDA wall first became visible. This is workload evidence only; the semantic contract remains variable-width.

## Current authority boundary

Qualified now:

- exact support-local clause vocabulary and variable-width contract;
- exact coverage implication/conjunction algebra;
- exact coverage support-edge cofactor transform;
- exact full recurrence equality on the selected complete variable geometries;
- deterministic real hot-workload fixture derivation from the unfiltered authority recurrence;
- exact clause -> coverage packing on those real workloads;
- exact packed CPU OR/filter/normalize parity with the clause authority;
- public CUDA-JS compile/load/prepare/bind/submit for synthetic and real fixtures.

Not yet qualified:

- native GPU output equality;
- native rejection-count equality;
- native timing versus equally optimized rank-slice ownership;
- multiword device coverage kernels;
- scalable generic antichain normalization implementation;
- production profitability.

## Next steps

1. Keep rank-slice packed ownership as the production reference/fallback.
2. Preserve the 32x19/608 5x4 hot job as a regression anchor for real-fixture provenance.
3. Replace the experiment's quadratic prior-candidate duplicate/subset scans with a qualified exact normalization composition if CUDA-Algorithms #11 produces one; keep any Connect4-local alternative experimental only.
4. Add the already-qualified coverage cofactor transform to the CUDA profile and qualify it independently from the pair-reduction stage.
5. Run native exact output qualification on a CUDA-capable host at the exact pinned CUDA-JS revision.
6. A/B packed clause coverage against equally optimized rank-slice packed ownership on identical real support/rank workloads.
7. Measure independently: pair rejection, unique candidates, subset work, retained/scratch bytes, cofactor work, kernel time and whole-slice time.

## Disposition

Continue the isolated experiment.

Do not merge or adopt clause coverage into production BSFP on portable evidence alone.
