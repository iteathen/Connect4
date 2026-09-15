# CUDA-BSFP clause-coverage device qualification

**Status:** portable Device-JS compile/prepare/submit qualified; native semantic device execution not yet qualified.

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

The CPU fixture constructs actual monotone clause dictionaries/coverage records and computes an independent exact authority for this bounded-capacity primitive.

## Qualification history

### Compile falsifier 1

The first portable run failed Device-JS validation because the experimental kernel used JavaScript `ConditionalExpression` syntax.

No device semantics were executed.

Disposition:

```text
remove unsupported ternary expressions;
preserve the algebra unchanged.
```

### Qualifier falsifier 2

After the syntax repair, the program compiled/submitted but the portable qualifier tried to compare output buffers with the CPU authority.

The CUDA-JS testing runtime is compile/prepare/submit authority; it does not execute arbitrary device-kernel semantics. Existing portable BSFP qualifiers intentionally do not treat testing-runtime output buffers as kernel-result authority.

Disposition:

```text
portable mode:
    compile + load + prepare + bind + submit + completion only

native mode:
    exact output/rejection/frontier equality authority
```

This was a qualifier-boundary defect, not a semantic failure of the kernel.

## Successful portable run

Commit:

```text
c0d52029e90dded697cbe82e1ef42cf97adc22b6
```

Workflow:

```text
bsfp-clause-coverage-experimental
run 35035210597
```

Result:

```text
portable compile:       pass
module load:            pass
prepared DAG creation:  pass
view/binding checks:    pass
submission/wait:        pass
CPU fixture authority:  constructed
native kernel outputs:  not claimed
```

The repository verify, normal BSFP portable, benchmark-evidence and strength-evidence workflows were also green at this commit. The experiment remains isolated from `solver/cuda-bsfp` behind draft PR #46.

## Current authority boundary

Qualified now:

- Device-JS accepts the fixed-two-u32 program;
- the operation DAG and memory-access contracts prepare successfully;
- the complete fixture can be bound and submitted on the testing runtime;
- the CPU bounded-capacity/coverage authority is deterministic and independent of device output.

Not yet qualified:

- native GPU output equality;
- native rejection-count equality;
- native timing versus equally optimized rank-slice ownership;
- real BSFP support/rank fixture timing;
- multiword coverage kernels;
- production profitability.

## Related exact structural results

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

The next device boundary is the support-edge cofactor transform, which is expected to compile to precomputed Boolean coverage contributions plus an exact opponent singleton-kill condition.

## Next steps

1. Generate real support-local dictionaries/frontiers from a complete variable-size BSFP control rather than synthetic arbitrary clauses.
2. Capture the largest actual universal/intersection jobs as device fixtures.
3. Qualify the precomputed coverage cofactor transform.
4. Run native exact output qualification.
5. Compare packed clause coverage directly with **rank-slice packed ownership**, not unsliced ownership.
6. Measure product rejection, materialized records, subset work, retained/scratch bytes, cofactor work and kernel/whole-slice time independently.

## Disposition

Continue the isolated device experiment.

Do not merge or adopt the clause-coverage representation into production BSFP on the basis of the portable pass alone.
