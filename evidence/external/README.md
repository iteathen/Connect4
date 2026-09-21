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

## Frozen result — Test_L2_R1

Campaign source revision: `be2142373d2781ca9268a4260b7d5b5776c1855b`.

- External reference: pinned `megakilo/alphafour` revision `cf2d4546e5824c155e9dd7e888a572bff3128498`, `testdata/Test_L2_R1`.
- External file SHA-256: `52b9ee96ab6e92fd755ca4c545792c07c548a5a994fd32beec2775939d071b3c`.
- Frozen rows revalidated against the external file before execution: **64/64**.
- IsoMax parent-position W/D/L matches after side-to-move/P0 perspective conversion: **64/64**.
- Mismatches: **0**.
- Solver nodes across the 64 positions: **86,115**.
- Measured solver loop elapsed time in the GitHub Actions run: **362.617 ms** (descriptive only; no comparative performance claim).
- Workflow run: `35551975006`; full per-position result artifact: `10618653005`.
- Frozen aggregate: [`results/2026-09-20-isomax-Test_L2_R1.summary.json`](results/2026-09-20-isomax-Test_L2_R1.summary.json).

**Disposition:** REFERENCE-GROUNDED parent-position W/D/L correctness for these 64 external Pons benchmark positions. Combined with the frozen Test_L3_R1 campaign, IsoMax now has 128/128 matching external parent-position W/D/L results across the two tiers. This still does not validate move-distance scores, internally generated per-move score vectors, or performance superiority.

## Frozen result — beginning L1 spot checks

Campaign source revision: `ab692df536a62d1aa2c8ccd5caa49f124359330d`.

This campaign uses the repository's pre-existing **deliberately nonrepresentative** bounded spot-check set drawn from Pons `Test_L1_R1` and `Test_L1_R2`. The selection bias is preserved as a limitation rather than hidden.

- External rows revalidated against pinned public Pons-derived files before execution: **30/30**.
- IsoMax parent-position W/D/L matches: **30/30**.
- Mismatches: **0**.
- Timeouts at 30 s/position: **0**.
- Runtime failures: **0**.
- Solver nodes across the 30 positions: **12,846,446**.
- Aggregate measured solver time: **8,995.877 ms** (descriptive only; no comparative performance claim).
- Workflow run: `35552435902`; full per-position artifact: `10619360227`.
- Frozen aggregate: [`results/2026-09-20-isomax-Test_L1-spotchecks.summary.json`](results/2026-09-20-isomax-Test_L1-spotchecks.summary.json).

**Disposition:** REFERENCE-GROUNDED parent-position W/D/L correctness for these 30 externally revalidated, nonrepresentative beginning-position spot checks. Combined with the deterministic L2/L3 campaigns, IsoMax has no mismatch across **158 tested external parent positions**, but only the 128 L2/L3 positions form the deterministic first-64-row calibration subsets.
