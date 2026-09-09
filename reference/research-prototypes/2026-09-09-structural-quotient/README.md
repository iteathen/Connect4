# Root-compiled winning requirements (research only)

One root compilation creates fixed key relevance and equivalent-neutral-action masks; ordinary negamax receives those masks. No requirement lists, routing or allocation occur in recursive search. Exact distance-sensitive values are preserved by the tested quotient; custom evaluator values are not covered.

Start with `docs/research/2026-09-09-structural-quotient-protocol.md` and the matching results note. Baseline remains unchanged, pinned by Git blob 965c3806c92a7add544dce4777d965b3e12376d6. `build.mjs` verifies that identity before deriving the three tiny variants. Generated files are reproducible and are included in the full downloadable artifact, rather than duplicated in the repository commit.

## Reproduce

Use Node 22 or newer from repository root. Preserve existing evidence before rerunning; the downloadable artifact contains all original output, so use a separate output directory for new measurements.

```sh
D=reference/research-prototypes/2026-09-09-structural-quotient
mkdir -p docs/research/evidence/2026-09-09-structural-quotient
node "$D/build.mjs"
node "$D/qualify.mjs"
node "$D/corpus.mjs"
node "$D/wing-corpus.mjs"
node "$D/bench.mjs" 19 5 > docs/research/evidence/2026-09-09-structural-quotient/trials-512k.jsonl
C4_CORPUS=./corpus-wing.json node "$D/bench.mjs" 19 7 openWing > docs/research/evidence/2026-09-09-structural-quotient/trials-wing-512k.jsonl
C4_CORPUS=./corpus-wing.json node "$D/bench.mjs" 17 7 openWing > docs/research/evidence/2026-09-09-structural-quotient/trials-wing-128k.jsonl
node "$D/deep-oracle.mjs"
node "$D/draw-guard.mjs"
node "$D/summarize.mjs" docs/research/evidence/2026-09-09-structural-quotient/trials-512k.jsonl docs/research/evidence/2026-09-09-structural-quotient/trials-wing-512k.jsonl docs/research/evidence/2026-09-09-structural-quotient/trials-wing-128k.jsonl
```

Cases are generated with fixed seeds, without solver results or timing-based selection. Original corpus hash: 14dd8a049879d3c0c4026283e58046910d4d2464e21fd866ec14edb85c61154c. Extended corpus hash: 9c557548184796c387776c653c8672d4a349f398dee079a57678cdb8f0bb2c32.

## Evidence and limits

The repository source and summary are textual. Full JSONL timing records, generated kernels, frozen corpora, stdout/stderr/exit evidence, and the 96-case oracle record are distributed as `C4-structural-experiment.zip` with the research response; they are not all copied into this commit. Summary is derivative, not raw trial data.

4,434 trials completed. Structural validation: exhaustive 4x3 connect-3 graph (4,659 nonterminal states, 3,735 requirement classes); independent cell-array oracle on 96 7x6 endgames; an independently implemented cell-array alpha-beta oracle on all 16 performance-wing positions; separate both-dead draw guard. Shared-TT multiwriter publication is inherited and not concurrently qualified.

Key validity is confined to one compiled root. Changing compiler/root requires invalidation or a separately proved scope-compatibility mechanism. Never share differently masked identities silently. Cold TT clearing costs are recorded separately; persistent-baseline comparisons remain open.

One active arena: 14 bytes per entry, 7 MiB at 512K, 1.75 MiB at 128K. Immutable geometry typed arrays: 608 bytes. Move-order scratch: 2,709 bytes per solver instance. The comparison harness holds four instances referencing the same arena. The cold compiler also allocates JavaScript arrays; their VM-dependent overhead has not been separately measured. No zero-allocation/zero-overhead claim.
