# Native win-space candidate packet

Research only. See `docs/research/2026-09-09-native-winspace-candidate-results.md`.
The original full-key two-word solver is a pinned input, not modified here.

Publication preserves independently added research through
`e9bb28e08766bfbfaa797c7366164344527ee1e5`. The compared delta since the measured
starting head `bdf16764e16325fceb36509b43809b326d17bfdd` contains no overlapping
paths. Those additional experiments were not executed or qualified in this unit.
The local measured source and uploaded blobs were compared before ref advancement.

Run qualification with `qualify_dense.mjs` and `dense_key_check.mjs` from any
working directory. `restore_evidence.mjs` recreates the exact original paired
JSONL and corpus from the compact UTF-8 TSV records. `replay.mjs` reads the TSV
corpus directly and writes new measurements to `replay.jsonl`.

`holdout.mjs` is the original capture source: it overwrites `holdout.jsonl` when
rerun. Use an isolated checkout or preserve that raw file before replaying.
The fresh seed is no longer an untouched holdout after this published result.

For `ablate.mjs`, copy the restored corpus to `confirmation-corpus.json` in the
same evidence directory first. This original capture path is intentionally kept
unchanged. No timing claim is based on the ablation.

The downloadable packet additionally preserves every exploratory matrix,
qualification stdout, original capture harness, failed source snapshots, and
SHA-256 manifest. These larger dumps are not all individually uploaded here.
