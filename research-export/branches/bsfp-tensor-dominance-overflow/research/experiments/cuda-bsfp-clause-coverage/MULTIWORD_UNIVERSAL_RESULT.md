# Variable-width universal coverage qualification

**Status:** exact CPU representation qualification passed on real three-u32 6x5 Connect-4 universal merges. This result qualifies multiword OR and subset-minimal normalization, but the selected rank-27 merges produced zero legal-slice rejections; multiword capacity rejection remains a separate qualifier.

**Research direction:** Josh Oshiro.

## Authority

The reference evolves the **unfiltered** beneficiary-relative variable-array clause-CNF recurrence through the 6x5 c4 terminal band and rank 27.

Only the captured universal merge is subjected to the already-qualified exact bounded legal-slice filter. The candidate representation is:

```text
three-u32 upward coverage
  -> wordwise OR product
  -> same bounded legal-slice predicate
  -> exact multiword subset-minimal normalization
```

This preserves the corrected benchmark-provenance rule: the candidate optimization does not modify the recurrence used to generate its own input frontier.

## Evidence

Connect4 branch:

```text
experiment/bsfp-clause-coverage
```

Qualification commit:

```text
e49d4a8977dd2c68bddec0f830f822b16768b807
```

Workflow:

```text
bsfp-clause-coverage-experimental
run: 35040950808
job: 104620459755
result: success
```

Result:

```text
geometry:                 6x5 connect-4
solved supports:
  rank 30:                1
  rank 29:                6
  rank 28:               21
  rank 27:               56
captured >64-ID merges:  66
maximum dictionary:      66
word count:               3
raw pair products:     1,503
authority survivors:    941
packed survivors:       941
frontier mismatches:      0
```

Hottest captured merge:

```text
support:                 [4,5,4,5,5,4]
column:                   5
dictionary IDs:          66
left/right records:       8 x 5
raw pairs:               40
survivors:               16
mismatch:                 0
```

## Important limit

The selected rank-27 workload had:

```text
authority legal-slice rejects: 0
packed legal-slice rejects:    0
```

Therefore this experiment establishes the >64-ID equivalence of:

- coverage encoding;
- wordwise OR conjunction;
- exact duplicate identity over word vectors;
- multiword subset ordering;
- subset-minimal frontier normalization.

It does **not** independently exercise the bounded capacity filter on a candidate whose deciding clause IDs cross the 64-bit boundary.

That last width-sensitive case must be qualified separately rather than inferred from this zero-rejection workload.

## Variable-size width consequence

For `K > 1`, at full support the clause dictionary has exactly:

```text
|D(full)| = W*H + L(W,H,K)
```

because all occupied-cell singleton clauses are present and every distinct geometric winning line survives as a non-singleton clause.

Examples:

```text
6x5 connect-4:
  cells:        30
  winning lines:39
  D(full):      69 IDs
  u32 words:     3

7x6 connect-4:
  cells:        42
  winning lines:69
  D(full):     111 IDs
  u32 words:     4
```

Thus three words are a genuine intermediate variable-size profile; standard 7x6 c4 itself requires four words at full support under this clause identity.

## Consequence

The clause-coverage calculus has now crossed the 64-bit boundary for both:

```text
support-edge cofactor: qualified on real 67-ID dictionaries
universal OR/subset:   qualified on real 66-ID dictionaries
```

No fixed-u64 semantic limit remains in those operations.

Still open:

- multiword bounded-capacity rejection with cross-word deciding clauses;
- Device-JS execution of a multiword universal product/normalizer;
- native multiword numerical equality;
- scalable CUDA-Algorithms antichain normalization;
- native profitability versus rank-slice ownership.

## Next falsifier

Use real full-support clause dictionaries whose width exceeds 64 IDs and construct guarded capacity cases that deliberately exercise:

```text
forced singleton overflow
zero-slack unsatisfied high-ID clause
one-slack feasible high-ID clause family
one-slack infeasible high-ID clause family
```

Compare variable-array clause guards with the generic multiword coverage guard. This tests the width-sensitive predicate directly without requiring a large game solve.
