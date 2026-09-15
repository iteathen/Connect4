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

The research lane has independently qualified:

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

The support-edge cofactor is also exact directly in coverage form:

```text
child coverage
    -> precomputed Boolean edge transform
    -> parent coverage

opponent singleton {x}
    -> exact record kill
```

No minimal-clause reconstruction is required in the hot cofactor path.

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

## Real BSFP workload qualification

Head:

```text
783617f1fdc74a6982b27f57024163e2aa9a6740
```

Workflow:

```text
bsfp-clause-coverage-experimental
run 35036392581
```

The real fixture is regenerated from complete beneficiary-relative clause-BSFP solves on every run. It selects:

```text
five hottest 5x4 c4 universal jobs
two hottest 4x5 c4 universal jobs
two adversarial 4x4 c3 universal jobs
```

Before any device submission, their clause records are independently encoded into support-local coverage signatures and a second packed CPU implementation re-evaluates OR composition, bounded legal-slice rejection and subset normalization.

Result:

```text
real segments:                  9
raw pair candidates:        3,659
CPU exact pre-normalization
  rejects:                  2,619
CPU normalized survivors:     217
packed CPU authority
  mismatches:                   0
portable Device-JS compile:   pass
prepare/bind/submit:          pass
native output authority:      not claimed
```

The exact pre-normalization rejection rate over the selected real jobs is about 71.6%.

### Hottest current 5x4 c4 job

After upstream legal-slice cleanup has propagated through the recurrence:

```text
support:                     3,1,1,3,3
rank:                        11
beneficiary:                 P0
exact P0 stones:             6
local dictionary width:      22 bits
left/right records:          30 x 19
raw pairs:                   570
unique raw OR signatures:    239
exact duplicate raw pairs:   331
legal-slice rejected:        448
accepted pair occurrences:   122
unique accepted signatures:   83
subset-minimal survivors:     32
```

An earlier 32x19=608 census represented the same semantic merge before prior-stage legal-slice cleanup. The extra 38 pair occurrences were all infeasible and are now eliminated upstream; the accepted 122 / unique 83 / final 32 sets are unchanged.

## Normalization diagnosis

On the selected real workloads, exact duplicate discovery is now a major remaining cost in the correctness-first normalization shape.

For representative 5x4 jobs, 32-44% of accepted pair occurrences are duplicate coverage signatures.

The current device normalizer discovers same-cardinality equality by scanning prior candidate positions before retaining a candidate. On the hottest jobs this causes thousands of prior-position iterations even though the final unique candidate set is only around 80-100 records.

This has been routed to CUDA-Algorithms issue #11:

```text
Feature request: bounded segmented fixed-width set-antichain normalization
```

The generic seam is:

```text
consumer-owned generation/filter
    -> exact fixed-word duplicate collapse
    -> exact segmented subset-minimal/maximal normalization
    -> compact retained indices/records
```

Connect4 retains proof meaning, legal-slice predicates and clause/ownership semantics. No new CUDA-JS runtime/compiler mechanism gap has been found.

## Current authority boundary

Qualified now:

- exact support-local clause vocabulary and variable-width contract;
- exact coverage implication/conjunction algebra;
- exact coverage support-edge cofactor transform;
- deterministic real hot-workload fixture derivation;
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
2. Replace the experiment's quadratic prior-candidate duplicate scan with a qualified exact dedup/normalization composition when CUDA-Algorithms #11 provides one, or retain a Connect4-local experimental form only for qualification.
3. Extend the device experiment with the already-qualified coverage cofactor transform.
4. Run native exact output qualification on a CUDA-capable host at the exact pinned CUDA-JS revision.
5. A/B packed clause coverage against equally optimized rank-slice packed ownership on identical real support/rank workloads.
6. Measure independently: pair rejection, unique candidates, subset work, retained/scratch bytes, cofactor work, kernel time and whole-slice time.

## Disposition

Continue the isolated experiment.

Do not merge or adopt clause coverage into production BSFP on portable evidence alone.
