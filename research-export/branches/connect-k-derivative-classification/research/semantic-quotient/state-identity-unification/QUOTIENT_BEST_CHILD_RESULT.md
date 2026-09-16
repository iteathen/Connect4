# Quotient-native best-child witness campaign

**Status:** complete; selective child witness remains conditional, not 4x5 default  
**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`

## Question

Can the quotient-native solver retain only one already-materialized child witness for each `qID`—normally the TT best/refutation move—and use it for transition reuse and ETC without paying for a full `state × columns` edge table or speculative child construction?

## Contract

A witness stores:

```text
qID -> (moveTag, exactChildQID | terminal-win)
```

A move-tag mismatch or absent child is a cache miss only. It may cause recomputation but can never change semantics.

The campaign compared:

- `B0`: native full-window W/D/L baseline, no witness;
- `B1`: best-child transition reuse;
- `B2`: best-child transition reuse + ETC using only the stored exact child;
- `B3`: two-threshold W/D/L + best-child reuse + best-child ETC.

Every candidate was independently checked against the BSFP oracle for root W/D/L and every legal root action before timing.

Authority:

- `src/quotient-native-best-child-campaign.mjs`
- Actions run `34646887500`, job `103419703662`

## Results

### 4x5 c4

| Candidate | Median total | Expanded | Witness ETC probes | ETC cutoffs | Transition reuses | Extra witness bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **B0 native baseline** | **19.140 ms** | 15,054 | 0 | 0 | 0 | 0 |
| B1 reuse | 19.505 ms | 15,054 | 0 | 0 | 823 | 81,920 |
| B2 reuse + ETC | 19.358 ms | **14,800** | 823 | 254 | 569 | 81,920 |
| B3 threshold + ETC | 19.501 ms | 14,890 | 928 | 269 | 659 | 81,920 |

The selective witness is doing real work: B2 removes 254 expansions (about 1.69%) without constructing speculative children. But the witness lookup/storage cost still outweighs that reduction on the largest control, making B0 slightly faster.

### 4x4 c4

The selective witness was materially beneficial:

```text
B0 baseline:            9.106 ms, 4,250 expansions
B1 reuse:               7.439 ms, 4,250 expansions
B2 reuse + ETC:         6.019 ms, 4,199 expansions
B3 threshold + ETC:     4.556 ms, 4,231 expansions
```

B2 used 155 witness ETC probes and obtained 51 exact cutoffs. B3 used 191 probes and obtained 57 cutoffs.

### 5x3 c4

```text
B0 baseline:            0.747 ms, 852 expansions
B2 reuse + ETC:         0.703 ms, 824 expansions
B3 threshold + ETC:     0.691 ms, 857 expansions
```

The effect is small but demonstrates that selective witness ETC can be economical in some geometries.

### 4x3 c3

The apparent timing win is not authoritative: the candidate recorded zero witness reuses, zero ETC probes and zero ETC cutoffs. At this scale setup/JIT noise dominates.

## Disposition

The best-child witness is **qualified but conditional**.

For the current 4x5 performance baseline:

```text
no per-state edge cache
no best-child witness
no forcing ETC
```

remains fastest.

Retain the witness mechanism as a candidate when:

- a driver naturally revisits a state enough to make the witness useful;
- a geometry exhibits a favorable witness-hit rate;
- a future packed TT can store the move tag and child handle at near-zero incremental lookup cost;
- PVS/MTD(f)/threshold control flow creates more repeated first-child transitions than the current full-window baseline.

This last point is important: the witness mechanism should be reconsidered **inside the native driver tournament**, not promoted independently.

## Architectural conclusion

Three native-kernel experiments now agree on the larger bounded control:

1. full `state × columns` edge caching is too expensive;
2. forcing child construction for ETC is too expensive;
3. selective best-child witnesses are much closer to break-even but are not yet faster on 4x5.

The current machine representation is therefore stable enough to stop exploring general transition caching and proceed to the native driver tournament.
