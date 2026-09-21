# IsoMax external Pons parent-score qualification

This harness compares the existing IsoMax implementation against externally sourced Pascal Pons benchmark parent-position scores without modifying solver logic.

The first campaign targets the first 64 rows of `Test_L3_R1` already frozen in `reference/oracles/solved-actions-v1.tsv`.

Before solving any position, the harness re-fetches the exact pinned public mirror revision and verifies that every tested frozen sequence and parent score matches the external file.

The external Pons score is relative to the side to move. IsoMax returns P0-relative exact W/D/L, so the only translation is:

`expectedP0Wdl = sign(PonsScore) * (evenPly ? +1 : -1)`

This campaign tests **parent-position W/D/L correctness only**. It does not validate the repository-generated per-move score vectors and does not establish comparative performance superiority.

No operational solver file is modified by this campaign.

## Frozen result — Test_L3_R1

Campaign source revision: `085cd4f713a909358e1b666b714addafe7c28611`.

- External reference: pinned `megakilo/alphafour` revision `cf2d4546e5824c155e9dd7e888a572bff3128498`, `testdata/Test_L3_R1`.
- External file SHA-256: `fae47639d993cc91f074d0b642a5f2bb251d31b15cea9df496d672c01fb2efec`.
- Frozen rows revalidated against the external file before execution: **64/64**.
- IsoMax parent-position W/D/L matches after side-to-move/P0 perspective conversion: **64/64**.
- Mismatches: **0**.
- Solver nodes across the 64 positions: **8,830**.
- Measured solver loop elapsed time in the GitHub Actions run: **260.694 ms** (descriptive only; no comparative performance claim).
- Workflow run: `35551784373`; full per-position result artifact: `10618642668`.
- Frozen aggregate: [`results/2026-09-20-isomax-Test_L3_R1.summary.json`](results/2026-09-20-isomax-Test_L3_R1.summary.json).

**Disposition:** REFERENCE-GROUNDED parent-position W/D/L correctness for these 64 external Pons benchmark positions. This does not validate move-distance scores, the internally generated per-move score vectors, or performance superiority.
