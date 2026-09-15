# CUDA-BSFP clause coverage experiment

This experiment qualifies a fixed-two-u32 execution profile for the support-local monotone clause-coverage calculus.

It is intentionally isolated from maintained BSFP components. It does **not** change the production solver or redefine the variable-size semantic contract.

## Semantic boundary

For one fixed support, a normalized monotone clause record is represented by the upward closure of its clause IDs in a support-local dictionary. In that representation:

```text
record conjunction = bitwise OR
record implication = reversed bitset subset
frontier normalization = minimal bitset antichain
```

The experiment also applies the exact bounded legal-capacity filter currently justified by the research lane:

```text
forced singleton count > k              -> reject
forced singleton count == k + residual  -> reject
forced singleton count == k-1           -> require one cell covering all residual clauses
otherwise                                -> keep unresolved candidate
```

The filter is sound but intentionally incomplete when more than one free beneficiary stone remains.

## Why 64 bits here

Two u32 lanes are a qualification profile only. The real engine is variable-size. A production profile must choose

```text
wordCount = ceil(localClauseDictionarySize / 32)
```

for the active geometry/support orbit.

Nothing in the BSFP↔Isometric semantic interface should expose this fixed width.

## Run

Portable compile/submit/exactness check:

```text
node experiments/cuda-bsfp-clause-coverage/run.mjs portable
```

Native CUDA mechanism check:

```text
node experiments/cuda-bsfp-clause-coverage/run.mjs native
```

Useful environment overrides:

```text
BSFP_COVERAGE_SEGMENTS
BSFP_COVERAGE_CELLS
BSFP_COVERAGE_DICTIONARY
BSFP_COVERAGE_SIDE
BSFP_COVERAGE_WARMUPS
BSFP_COVERAGE_REPS
```

The synthetic fixture constructs actual monotone clause dictionaries, derives exact upward-coverage records, computes a CPU authority for OR-product + bounded-capacity filtering + minimal antichain normalization, and requires the device result to match exactly.

## Admission boundary

Passing this primitive does not establish that clause coverage beats packed rank-slice ownership in a full solver. The next experiment must feed real BSFP support/rank frontier fixtures through both device profiles under identical runtime conditions and separately measure:

- pair candidates;
- pre-materialization rejections;
- dominance checks;
- cofactor-map work;
- terminal work;
- retained/scratch bytes;
- kernel/epoch time;
- exact decoded frontier equality.

Rank-slice ownership remains the production/reference fallback until that A/B is qualified.
