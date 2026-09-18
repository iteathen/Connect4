# Variable-width core-relative absorption qualification

**Status:** exact semantic qualification passed on real three-u32 6x5 Connect-4 universal merges.

**Research direction:** Josh Oshiro.

## Purpose

Remove the fixed-two-u32 assumption from the core-relative antichain-product absorption law before considering a variable-width CUDA execution profile.

The authority is the existing rank-27 6x5 multiword universal qualifier:

```text
unfiltered variable-array clause recurrence
-> real rank-27 universal merges
-> three-u32 upward-coverage full Cartesian OR
-> exact bounded legal-slice guard
-> exact multiword subset-minimal normalization
```

The candidate uses the same real merges and applies:

```text
common core = AND(left frontier) OR AND(right frontier)
-> strip common core from both inputs
-> exact residual frontier normalization
-> residual cross-frontier absorption
-> generate only unabsorbed residual pairs plus absorbed row/column records
-> reattach common core
-> same legal-slice guard
-> same exact multiword normalization
```

No solved-game database or external search result is consumed.

## Evidence

Connect4 branch:

```text
experiment/bsfp-clause-coverage
```

Qualification head:

```text
7e4e8838367f724b51367ac63a8247faec157f02
```

Workflow:

```text
bsfp-clause-coverage-experimental
run: 35049040329
job: 104645196454
result: success
```

Real fixture:

```text
geometry:            6x5 connect-4
solved ranks:         30, 29, 28, 27
captured merges:      66
maximum dictionary:   66 clause IDs
coverage words:        3 u32
frontier mismatches:   0
```

Aggregate work:

```text
raw Cartesian pairs:            1,503
residual Cartesian pairs:       1,503
residual pairs actually formed:   852
absorbed row/column emits:         168
all generation operations:      1,020
```

Ratios:

```text
residual pair products / raw:   0.5668662675
all generation ops / raw:       0.6786427146
```

Thus the absorption stage avoided about **43.3% of ordinary pair products** and about **32.1% of total generation operations** on this terminal-band three-word workload while preserving the exact frontier.

The common-core quotient did not reduce the input frontier counts on these particular rank-27 merges; its benefit here came from enabling residual cross-frontier absorption. This is workload evidence, not a statement that residual normalization is generally inactive.

### Hottest captured merge

```text
support:                 [4,5,4,5,5,4]
move column:             5
dictionary IDs:          66
word count:               3
left/right records:       8 x 5
raw pairs:               40
common-core bits:        12
left residual absorbed:   6
right residual absorbed:  0
remaining pair products: 10
absorbed-record emits:    6
total generation ops:    16
exact survivors:         16
frontier mismatch:        0
```

The hottest real merge therefore reduced `40` raw Cartesian positions to `16` generation operations (`0.40x`) with the same exact 16-record output frontier.

## Consequence

Core-relative absorption is not a fixed-u64 identity. The same law remains exact across a real three-u32 support-local clause dictionary.

This closes the current >64-bit **semantic** gap for the absorption law.

It does not yet establish:

- native GPU execution or speedup for variable-width absorption;
- a production multiword absorption ABI;
- profitability at the rank-22/21 6x5 wall;
- a replacement for CUDA-Algorithms issue #12 ownership of the reusable generic primitive.

## Next seam

Qualify the absorption marking stage itself on a geometry-selected multiword Device-JS profile:

```text
flattened records[record, word]
+ segment offsets
+ active word count / valid tail mask
-> per-segment common cores
-> absorbed-left / absorbed-right marks
```

Keep candidate generation, legal-slice filtering, proof meaning and final frontier authority in Connect4. Keep the reusable antichain-product reduction ownership with CUDA-Algorithms #12.
