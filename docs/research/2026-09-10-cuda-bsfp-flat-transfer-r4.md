# CUDA-BSFP R4 — pointer-free flat transfer-table qualification

Date: 2026-09-10

Research branch: `research/zdd-transfer-20260910`

Semantic implementation commit: `87e319275f7f4224d8019a66672084b615a9725c` (`Qualify pointer-free flat BSFP transfer tables`)

Full one-shot qualification: GitHub Actions run `34536926175`, job `103070616141` — green through R4 and the independent monotone-closure ROBDD control.

Compact repeat used for durable measurement extraction: commit `6032b66c9eaf327e06c1d4328eac840365fff513`, run `34538247853`, job `103074743581` — green. The extraction workflow was temporary and is removed by the commit adding this document.

## Question

R3 established that the canonical residual-function quotient is closed under adjacent line-first transitions on the tested controls. R4 asks whether that semantic quotient can be compiled into a hardware-oriented runtime representation with no persistent BDD/ZDD/object graph and no semantic map lookup in the hot line-to-line transfer path.

The qualified runtime form is:

```text
stateId + inputOrdinal
        |
        v
targets[offset[table] + stateId * fanout + inputOrdinal]
        |
        v
next layer-local stateId
```

The compiled artifact uses one contiguous minimum-width unsigned target array, a `Uint32Array` of table offsets, and a `Uint8Array` of introduced-cell widths. State IDs are dense and layer-local. Maps and canonical residual-function objects exist only while constructing/checking the artifact against the R3 semantic oracle; they are not part of the proposed runtime representation.

## Qualification verdict

**PASS on every tested control.**

Across all cases:

- semantic target mismatches: **0**;
- narrow typed-array serialization mismatches: **0**;
- capacity failures: **0**;
- minimum next-layer target coverage: **1.0**;
- maximum introduced ownership width never exceeds connect length;
- maximum fanout is therefore bounded by `2^connect` (8 for the connect-3 control and at most 16 for connect-4 controls).

This is a physical-representation qualification of the already-qualified R3 quotient. It is not a 7×6 solve claim and not a CUDA performance claim.

## Exact measured results

| Geometry / selection | Tables | Total dense states | Max dense states | Max flat slots | Max input bits / fanout | Target width | Transition entries | Runtime bytes | Uint32-target baseline | Bytes / transition | CPU contiguous replay |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 4×3 c3 / all 256 supports | 3,584 | 49,470 | 116 | 256 | 3 / 8 | 1 B | 65,503 | 83,427 | 279,936 | 1.2736 | 782.5 M reads/s |
| 4×4 c4 / all 625 supports | 6,250 | 174,125 | 512 | 1,024 | 4 / 16 | 2 B | 325,652 | 682,558 | 1,333,862 | 2.0960 | 336.1 M reads/s |
| 5×3 c4 / all 1,024 supports | 6,144 | 26,191 | 23 | 32 | 4 / 16 | 1 B | 54,447 | 85,171 | 248,512 | 1.5643 | 398.8 M reads/s |
| 4×5 c4 / R1-worst support | 17 | 4,161 | 510 | 1,024 | 4 / 16 | 2 B | 6,092 | 12,273 | 24,457 | 2.0146 | 341.2 M reads/s |
| 5×4 c4 / R1-worst support | 17 | 3,019 | 579 | 2,048 | 3 / 8 | 2 B | 4,365 | 8,819 | 17,549 | 2.0204 | 398.4 M reads/s |
| 5×5 c4 / R1-worst support | 28 | 16,736 | 1,603 | 4,096 | 4 / 16 | 2 B | 22,598 | 45,340 | 90,536 | 2.0064 | 455.7 M reads/s |

The 1-byte cases reduce target storage to 25% of an unconditional `Uint32` target array. The larger tested connect-4 cases use 16-bit layer-local target IDs, reducing target storage to 50% of `Uint32`. Offset and width metadata are small; on the 5×5 worst support the complete transition artifact is only 45,340 bytes.

The earlier R3 correction remains authoritative: the tested 5×5 worst layer has 1,603 live states in a 4,096-slot rectangular key space. R4 successfully serializes and replays that quotient with 16-bit targets.

## Optional state-ID lookup tradeoff

A packed-key → dense-state-ID lookup is not needed in the hot line-to-line transfer loop once the state is already represented by a dense ID. R4 nevertheless measured it for build/boundary use.

The representative worst-layer probes show direct dense lookup substantially faster than binary search over sorted sparse keys:

| Geometry | Dense lookup bytes | Sparse lookup bytes | Dense / sparse memory | Dense ns/query | Sparse ns/query | Sparse / dense time |
|---|---:|---:|---:|---:|---:|---:|
| 4×3 | 1,024 | 580 | 1.77× | 1.84 | 9.68 | 5.26× |
| 4×4 | 4,096 | 2,568 | 1.60× | 2.83 | 13.24 | 4.67× |
| 5×3 | 128 | 115 | 1.11× | 1.13 | 5.84 | 5.15× |
| 4×5 worst | 4,096 | 3,060 | 1.34× | 1.70 | 18.48 | 10.86× |
| 5×4 worst | 8,192 | 3,474 | 2.36× | 1.58 | 17.48 | 11.08× |
| 5×5 worst | 16,384 | 9,618 | 1.70× | 0.98 | 13.61 | 13.87× |

These are Node/CPU sanity probes, not CUDA predictions. They do establish the expected engineering trade: rectangular direct lookup spends modest extra memory for much cheaper address resolution. Because the steady-state transfer path needs no such lookup, the default runtime design should not retain either structure unless a later boundary/kernel contract requires it.

## Cost finding

The flat **runtime representation is not the current scaling problem**. The exact research compiler/oracle is.

Measured end-to-end R4 qualification time per case in the compact repeat:

- 4×3 all supports: 1.105 s;
- 4×4 all supports: 3.786 s;
- 5×3 all supports: 0.821 s;
- 4×5 R1-worst support: 0.875 s;
- 5×4 R1-worst support: 1.951 s;
- 5×5 R1-worst support: **75.375 s**.

The 5×5 control therefore spends roughly 75 seconds constructing and independently validating a table whose finished hot-path artifact is only ~45 KiB. The expensive part is canonical semantic enumeration/oracle construction, not table traversal or storage.

Blindly extending the current serial 5×5 harness from one support to all 28 R1 hot supports would be a poor next CI experiment. Even a naive linear extrapolation would be tens of minutes, while providing no evidence that the runtime table itself is problematic.

## Reassessment

R4 strengthens the graph-free direction materially:

1. R1 showed crossing ownership alone is not a complete symbolic C1 boundary.
2. R2 showed processed-line summaries can retain enough information on controls but are wider than the true semantic quotient.
3. R3 showed the minimal canonical residual class itself is transition-stable on the tested controls.
4. R4 shows those transitions can be compiled into a small pointer-free flat array artifact with exact target preservation.

The remaining risk has moved. It is no longer "can the quotient be represented without a graph?" on the tested controls. The immediate questions are:

- does R3/R4 closure continue to hold across a broader adversarial support sample?;
- can the semantic compiler be made incremental/transfer-native so qualification does not repeatedly reconstruct canonical residual functions?;
- how do state width and target width evolve toward 7×6?

## Decision / next seam

**Promote the pointer-free flat transfer table as the current physical runtime candidate on the tested controls.** Do not design a CUDA object graph or persistent BDD/ZDD representation unless broader exact tests later falsify this result.

Next research unit (R5):

- widen 4×5 and 5×4 from the single R1-worst support to the full 28-support hot set, because their current per-support qualification cost is small;
- do **not** serially run all 28 5×5 hot supports with the present compiler;
- instead construct a cost-aware adversarial 5×5 sample from the existing R1 hot set (including the R1 worst support and supports stressing distinct crossing/history/class profiles), then test R3/R4 closure and table width on that sample;
- in parallel, instrument where 5×5 compile time is spent so the next semantic compiler can reuse adjacent-cut work rather than rebuilding equivalent residual functions.

The production CUDA-BSFP lane remains unchanged by R4. This document and all R4 implementation/evidence stay on `research/zdd-transfer-20260910`.
