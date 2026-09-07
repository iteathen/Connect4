# Connect4 Status

**Updated:** 2026-09-07
**Phase:** qualified incumbent Node candidate / benchmark-protocol extraction

## Product role

Connect4 is an independent Node benchmark/validation product. It owns Connect Four domain/evaluator/benchmark meaning and consumes generic CUDA-MCGS/CUDA-JS-Tensor/CUDA-JS contracts only through public surfaces.

It is not a CUDA-family semantic library and does not own generic search/runtime/Tensor mechanisms.

## Protected foundation

C4-0001 owns the accepted canonical standard 7×6 benchmark-domain rules. The incumbent evaluator/search implementation remains dimension-parameterized because the historical engine supports adjustable boards.

## Incumbent candidate

The current incumbent candidate establishes:

- C4-0002 frozen optimized evaluator behavior, including live-line positional value, tactical packing, support/parity reasoning and the repeated-immediate frontier promotion;
- C4-0003 explicit-root-player alpha-beta with tactical prepass and depth preference;
- primitive typed-array game/search state with no board cloning or object-per-node hot path;
- fixed-size preallocated persistent TT with separate root-perspective banks;
- safe score reuse only for same-perspective, sufficient-depth entries;
- shallow/opposite-perspective inherited best moves available for ordering under the production policy;
- reroot-safe terminal score normalization;
- explicit benchmark reset without making reset the production move policy;
- frozen evaluator, fixed-depth search and historical self-play conformance vectors;
- a Node-local reroot benchmark harness separating persistent cross-move memory from reset-isolated runs.

## Qualification evidence

The owner re-supplied the exact legacy archive. Its SHA-256 matched the recorded provenance. Exact benchmark-relevant source bytes are now retained in `reference/legacy-source/Connect4-engine-source.zip` so future evaluator/search work does not depend on a transient upload.

Direct differential work against those exact bytes produced:

- **400,442/400,442** exact optimized evaluator player-score matches across 4×4, 5×4, 6×5, 7×6 and 8×7 legal random positions;
- **190/190** exact fixed-depth move and score matches across the same profile family;
- exact reproduction of every historical self-play move sequence at depths 3 through 12 under the `legacy-qualified` compatibility policy.

The production `persistent-best-move` policy intentionally uses inherited shallow/opposite-perspective best moves for ordering even when their scores are invalid. This can change tie-selected self-play lines and is kept distinct from compatibility evidence.

Development-container evaluator timing under Node 22 showed a large primitive-representation speedup, but it is explicitly non-canonical. Performance claims remain blocked until exact Node 26.7 benchmark evidence is captured under bound runtime/hardware/configuration identity.

## Next executable seam

1. Qualify this candidate in repository CI on exact Node 26.7.
2. Freeze the Node-local benchmark protocol/profile and collect reproducible incumbent evidence: nodes/sec, evaluator calls/sec, TT hit/reuse classes, cutoffs, reached depth under wall time, and practical allocation/GC evidence.
3. Add solved-game oracle/position-corpus strength evidence by depth when an independent oracle is selected.
4. Only after the incumbent benchmark is qualified should a CUDA-MCGS comparison lane be defined through public dependency surfaces.

CUDA-MCGS #124 remains paused under explicit owner instruction.

## Repository governance

Governance alignment remains tracked separately in issue #3. Do not infer repository-policy parity from product CI success. Main protection and required `verify` remain governance facts requiring independent live readback/admin alignment.

## Non-claims

- no CUDA-MCGS performance advantage is demonstrated;
- no GPU-resident Connect Four engine exists here yet;
- local Node 22 timing is not canonical benchmark evidence;
- historical self-play is an integration oracle, not proof of game-theoretic perfect play;
- no Python or cross-language comparison is in scope for the first benchmark gate.
