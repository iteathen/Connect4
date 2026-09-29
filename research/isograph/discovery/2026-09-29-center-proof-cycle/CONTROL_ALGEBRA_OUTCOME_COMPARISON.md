# Post-hoc board-outcome comparison for the control-algebra probe

**Status:** descriptive external discovery evidence only  
**Structural producer:** [CONTROL_ALGEBRA_RESULT.md](CONTROL_ALGEBRA_RESULT.md)  
**Outcome source:** frozen Tromp board-size table already preserved in this campaign  
**Outcome source SHA-256:** `19ceb43b647bf734972df2aaa8c68262d8a63424a0e4de14df6d45f9fbf9e00a`

The control-algebra matrix was frozen **before** this comparison. Known outcomes
were not inputs to the GF(2) ranks, safe-defect columns, unmatched-defect tests,
or polynomial boundary identities.

## Overlapping even-height matrix

The blind structural test covered widths 4..10 and heights 4, 6, 8. The frozen
external outcome table contains 18 of those board sizes.

| width | height | safe single-defect columns | first-player W/D/L |
|---:|---:|---:|---:|
| 4 | 4 | 4 | 0 |
| 4 | 6 | 4 | 0 |
| 4 | 8 | 4 | 0 |
| 5 | 4 | 3 | 0 |
| 5 | 6 | 3 | 0 |
| 5 | 8 | 3 | 0 |
| 6 | 4 | 2 | -1 |
| 6 | 6 | 2 | -1 |
| 6 | 8 | 2 | -1 |
| 7 | 4 | 1 | 0 |
| 7 | 6 | 1 | +1 |
| 7 | 8 | 1 | +1 |
| 8 | 4 | 0 | -1 |
| 8 | 6 | 0 | -1 |
| 8 | 8 | 0 | -1 |
| 9 | 4 | 0 | -1 |
| 9 | 6 | 0 | -1 |
| 10 | 4 | 0 | -1 |

Within this incomplete external sample:

```text
safe defects = 4  -> 3/3 draws
safe defects = 3  -> 3/3 draws
safe defects = 2  -> 3/3 second-player wins
safe defects = 1  -> 1 draw, 2 first-player wins
safe defects = 0  -> 6/6 second-player wins
```

This is not an inferential sample and the rows are not independent.

## What the comparison does establish

The first GF(2) skeleton is **not sufficient to determine game outcome**.

For every safe defect tested, regardless of width and height:

```text
paired-response relation nullity = 1
unmatched top event is independent
```

Yet 7x4 is a draw while 7x6 and 7x8 are first-player wins. Therefore the
one-relation / one-unmatched-defect quotient does not contain enough information
to determine W/D/L.

This is a productive falsifier of an over-strong interpretation.

## What remains interesting

Width changes the existence and multiplicity of the safe single-defect family:

```text
W=4 -> four safe entries
W=5 -> three
W=6 -> two
W=7 -> one
W>=8 in the tested range -> none
```

The tested count fits `max(0,8-W)`, with the unique width-seven entry matching
the already-known `W=2K-1` centrality seam for K=4.

Height does not change that safe-entry count in the tested even-height matrix,
but it does change:

- response generator count;
- response-space rank;
- support distance;
- first-win deadlines;
- actual external outcome at width seven.

So the current evidence supports the owner's framing:

> rows and columns bear on outcome, but the directness is not yet known.

The likely latent control object must refine the current GF(2) skeleton with
additional geometry-dependent support/deadline/resource information rather than
replace it.

## Non-claim

No rule in this file may be used as a gameplay certificate. Outcome labels were
consulted only after the structural result was frozen, and this comparison
establishes correlation/falsification scope, not causation or a W/D/L formula.
