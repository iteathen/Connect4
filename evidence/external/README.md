# IsoMax external Pons parent-score qualification

This harness compares the existing IsoMax implementation against externally sourced Pascal Pons benchmark parent-position scores without modifying solver logic.

The first campaign targets the first 64 rows of `Test_L3_R1` already frozen in `reference/oracles/solved-actions-v1.tsv`.

Before solving any position, the harness re-fetches the exact pinned public mirror revision and verifies that every tested frozen sequence and parent score matches the external file.

The external Pons score is relative to the side to move. IsoMax returns P0-relative exact W/D/L, so the only translation is:

`expectedP0Wdl = sign(PonsScore) * (evenPly ? +1 : -1)`

This campaign tests **parent-position W/D/L correctness only**. It does not validate the repository-generated per-move score vectors and does not establish comparative performance superiority.

No operational solver file is modified by this campaign.
