# Connect4 Status

**Updated:** 2026-09-07
**Phase:** qualified incumbent Node baseline / strength-oracle next

## Product role

Connect4 is an independent Node benchmark/validation product. It owns Connect Four domain/evaluator/benchmark meaning and consumes generic CUDA-MCGS/CUDA-JS-Tensor/CUDA-JS contracts only through public surfaces.

It is not a CUDA-family semantic library and does not own generic search/runtime/Tensor mechanisms.

## Protected foundation

C4-0001 owns the accepted canonical standard 7×6 benchmark-domain rules. The incumbent evaluator/search implementation remains dimension-parameterized because the historical engine supports adjustable boards.

C4-0002 freezes the optimized incumbent evaluator behavior. C4-0003 freezes the explicit-root-player low-allocation alpha-beta control and persistent cross-move TT semantics. C4-0004 freezes the first Node-local benchmark protocol.

## Qualified incumbent baseline

The incumbent establishes:

- live-line positional evaluation, tactical packing, support/parity reasoning and the preserved repeated-immediate frontier promotion;
- explicit-root-player alpha-beta with immediate-win, forced-block and double-threat tactical prepass;
- primitive typed-array game/search state with no board cloning or object-per-node hot path;
- fixed-size preallocated persistent TT with separate root-perspective banks;
- same-perspective/depth-qualified score and bound reuse;
- shallow/opposite-perspective inherited best moves for ordering under the production policy;
- reroot-safe terminal score normalization;
- explicit benchmark reset without making reset the production move policy;
- frozen evaluator, fixed-depth search and historical self-play conformance vectors;
- fixed-request persistent-vs-reset and fixed-wall-clock benchmark lanes.

## Correctness qualification

The owner re-supplied the exact legacy archive. Its SHA-256 matched the recorded provenance. Exact benchmark-relevant source bytes are retained in `reference/legacy-source/Connect4-engine-source.zip` so future evaluator/search work does not depend on a transient upload.

Direct differential work against those exact bytes produced:

- **400,442/400,442** exact optimized evaluator player-score matches across 4×4, 5×4, 6×5, 7×6 and 8×7 legal random positions;
- **190/190** exact fixed-depth move and score matches across the same profile family;
- exact reproduction of every historical self-play move sequence at depths 3 through 12 under the `legacy-qualified` compatibility policy.

Repository `verify` run **34116027286** passed on the C4-0004 head under exact Node **26.7.0**. The earlier incumbent qualification run **34114421777** also passed all 20 tests under exact Node 26.7.0, including depth-3 through depth-12 self-play.

## Node 26.7 benchmark evidence

`benchmark-evidence` run **34116027347** executed C4-0004 at source revision `5ca077c2073b7e5e4432c9267da729836efbacb0` on Ubuntu 24.04, AMD EPYC 7763, 4 logical CPUs.

At the frozen 7×6 depth-8 reroot workload, 3 repetitions / 36 root searches:

- persistent TT: **501,027 nodes**, **289,914 evaluator calls**, **480.55 ms**;
- reset before every root: **624,351 nodes**, **371,565 evaluator calls**, **542.69 ms**;
- both lanes produced decision checksum `2804412475`;
- persistence reduced nodes by about **19.75%**, evaluator calls by about **21.97%**, and elapsed time by about **11.45%** on this runner;
- persistent search recorded **40,290** cross-generation position hits, **40,461** cross-generation ordering hits and **564** cross-generation score hits.

The same evidence run's 250 ms wall-clock depth sweep completed depth 12 at a **200.96 ms** median and found depth 13 over budget at **361.72 ms** median.

Raw nodes/second was higher in the reset lane than the persistent lane. That does not contradict the persistence win: persistence completed the same semantic request workload sooner by eliminating substantially more nodes/evaluator calls. Throughput and useful-work reduction are therefore reported together.

This is exact-profile, machine-bound reference evidence, not a universal CPU performance claim. See `docs/research/2026-09-07-node26-benchmark-evidence.md`.

## Next executable seam

1. Add an independent solved-game oracle/position corpus and report strength by depth without treating self-play as proof of perfect play.
2. Use that oracle to distinguish useful incumbent quirks from genuine evaluator/search defects before changing frozen behavior.
3. Only after the incumbent benchmark/strength baseline is accepted should a CUDA-MCGS comparison lane be defined through public dependency surfaces and under current owner authorization.

CUDA-MCGS #124 remains paused under explicit owner instruction.

## Repository governance

Governance alignment remains tracked separately in issue #3. Do not infer repository-policy parity from product CI success. Main protection and required `verify` remain governance facts requiring independent live readback/admin alignment.

## Non-claims

- no CUDA-MCGS performance advantage is demonstrated;
- no GPU-resident Connect Four engine exists here yet;
- GitHub-hosted-runner timing does not generalize to another CPU/runtime/profile;
- process-memory snapshots are not a complete V8 allocation count;
- historical self-play is an integration oracle, not proof of game-theoretic perfect play;
- no Python or cross-language comparison is in scope for the first benchmark gate.
