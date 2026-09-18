# Variable-width coverage cofactor qualification

**Status:** exact CPU packing/map authority plus portable Device-JS compile/prepare/submit qualified for a real three-u32 6x5 Connect-4 terminal-band fixture. Native device result equality remains unqualified.

**Research direction:** Josh Oshiro.

## Purpose

Remove the fixed-two-u32 execution assumption from the support-local clause-coverage cofactor without changing the width-independent semantic theorem.

The semantic contract is:

```text
coverageWords(S) = ceil(|D(S)| / 32)
```

where `D(S)` is the support-local clause dictionary. No one-u64 or fixed standard-board assumption is part of the contract.

## Fixture provenance

A full 6x5 solve is unnecessary to cross the 64-bit boundary.

The independent variable-array clause authority solves only the terminal band:

```text
rank 30: 1 support
rank 29: 6 supports
rank 28: 21 supports
```

It then captures real rank-27 -> rank-28 support-edge cofactors.

This is rule/recurrence-derived exact work, not a solved-game database or precomputed search result.

The selected child dictionaries contain 67 IDs and parent dictionaries contain 65-66 IDs, forcing three u32 coverage words.

## Exact CPU authority

For each selected edge:

```text
child clause frontier
  -> independent variable-array clause cofactor
  -> parent clause record | killed
```

is compared with:

```text
child clause frontier
  -> three-word upward-coverage encoding
  -> precomputed multiword kill mask + basis-image map
  -> parent three-word coverage | killed
```

Fixture construction fails before CUDA submission on any disagreement.

Portable qualification result:

```text
segments:             8
word count:           3
max dictionary:      67
total input records: 64
killed records:       4
retained records:    60
packed CPU mismatches:0
```

Both edge relations are present:

```text
mover == beneficiary   -> owner-true satisfaction mapping
mover != beneficiary   -> opponent reduction / singleton-kill mapping
```

Selected owner-true segments contain 9 records each; selected owner-false segments contain 7 records each and exercise exact kills.

## Device form

The experimental multiword kernel uses flattened u32 word vectors:

```text
inputWords[record, word]
validWords[segment, word]
killWords[segment, word]
contributionWords[segment, childClauseId, parentWord]
outputWords[record, word]
```

For a retained record, each parent output word is computed as the OR of the precomputed parent-word contributions of every set child coverage ID.

The first implementation intentionally favors a simple correctness surface over throughput. It rescans child dictionary IDs for each output word. Native timing is required before choosing a production execution form.

## Portable Device-JS evidence

Connect4 branch:

```text
experiment/bsfp-clause-coverage
```

Qualification commit:

```text
3df1b161a75f1ed99207589e04e950d4fa0763aa
```

Workflow:

```text
bsfp-clause-coverage-experimental
run: 35040736959
job: 104619788633
result: success
```

Pinned CUDA-JS authority:

```text
98e2ebc942c14d63acf4dd82e912dd548c363a05
```

Qualified at the portable boundary:

```text
fixture derivation:          pass
packed CPU exact map:        pass
Device-JS compile:           pass
module load:                 pass
prepared DAG creation:       pass
view/binding checks:         pass
submission/wait:             pass
native device outputs:       not claimed
```

The testing runtime does not execute arbitrary device kernel semantics; its submit/wait time is not native GPU performance evidence.

## Consequence

The fixed-two-u32 profile is **not** an inherent cofactor ABI limit.

The exact support-edge coverage map extends directly to geometry-selected multiword vectors. The first genuine >64-bit real fixture requires no new CUDA-JS correctness mechanism.

This does not yet qualify:

- native multiword output equality;
- native multiword timing;
- multiword universal product/filter/normalization;
- scalable multiword antichain normalization;
- production profitability.

## Next seam

Apply the same authority structure to the universal/intersection stage:

```text
independent variable-array clause recurrence
  -> capture a >64-ID real universal merge
  -> multiword coverage OR
  -> exact consumer-owned legal-slice filter
  -> exact multiword subset-minimal normalization
```

Keep reusable normalization ownership with CUDA-Algorithms #11 and domain feasibility/proof semantics in Connect4.
