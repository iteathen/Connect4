# C4-0005 — Solved-game strength oracle v1

**Status:** accepted strength-evidence specification

## Purpose

Define the independent solved-game oracle and strength metrics used to judge the qualified Node incumbent without treating historical self-play, evaluator score, or search depth as proof of perfect play.

This specification is Connect4-owned benchmark evidence. It does not alter C4-0002 evaluator semantics, C4-0003 search semantics, or generic CUDA-MCGS behavior.

The oracle lane is intentionally limited to the canonical standard **7×6** game because its external checkpoints are standard solved Connect Four. That limitation does not remove adjustable-board support from the incumbent evaluator/search machinery.

## Independence boundary

`components/oracle/exact7x6.mjs` is a separate exact solver used only for correctness/strength evidence.

It:

- does not import the incumbent evaluator, incumbent alpha-beta implementation, incumbent TT, or benchmark domain class;
- uses its own 7×6 bitboard state, current-player-relative negamax, alpha-beta bounds, deterministic move ordering, and transposition state;
- follows the publicly documented Pascal Pons strong-score game-theoretic convention;
- is not timed or presented as a competitor to the incumbent;
- must pass external numerical checkpoints before any oracle-generated child/action score is admitted as evidence.

Algorithmic lineage from a public exact solver is acceptable here; independence means independence from the system under test, not novelty of game-solving mathematics.

## Strong score

For the player to move, the solved score is:

- positive when perfect play wins;
- zero when perfect play draws;
- negative when perfect play loses.

Magnitude encodes the strong-solution distance preference used by Pascal Pons: faster wins receive larger positive scores and later losses receive less-negative scores.

For one position, each legal move has its own solved strong score. The position score is the maximum legal move score. Unplayable columns use `-1000` only as corpus sentinel and never as a game score.

## External checkpoint authority

Parent-position scores come from the Pascal Pons `Solving Connect Four` benchmark test sets, whose notation is a one-based sequence of played columns.

The retained v1 calibration corpus uses the first 64 rows of each of:

- `Test_L3_R1` — end/easy;
- `Test_L2_R1` — middle/easy.

Those 128 parent scores are external facts. The exact test-set bytes were independently observed in two unrelated public GitHub mirrors and had identical Git blob identities:

- `Test_L3_R1`: `180daa64dc3f52f3ac931be95c99c964945554b2`;
- `Test_L2_R1`: `66089b7cf493c00e44f23ddcf12ad1ea0fe8a1a8`.

Mirror revisions are frozen in `reference/oracles/solved-actions-v1.meta.json` + `solved-actions-v1.tsv`.

The oracle must match **all 128 external parent scores exactly** before its per-move analysis is accepted. For every frozen vector, `max(moveScores) == externalParentScore` is then required.

## Beginning-game spot checks

`reference/oracles/beginning-spotchecks-v1.meta.json` + `beginning-spotchecks-v1.tsv` adds 30 deliberately non-representative beginning-position spot checks drawn from `Test_L1_R1` and `Test_L1_R2`.

Their external parent-score blobs are:

- `Test_L1_R1`: `125e3d872dfec4ea13fe09641606dff992f152ee`;
- `Test_L1_R2`: `481876168e3690e6bf080c56683b9d506e5ddd58`.

These positions were retained under a bounded local exact-action-generation cost so the oracle conformance suite remains practical in Node CI. This creates selection bias. Therefore:

- they are always reported as **spot checks**;
- they are never merged into the deterministic 128-position calibration percentage without an explicit combined label;
- no global strength or perfect-depth claim may be inferred from their sample frequency.

## Strength measurements

Each solved position is searched by a fresh production incumbent engine so independent corpus positions cannot donate TT information to each other. Inside one search, normal iterative deepening and the production `persistent-best-move` policy remain enabled.

At each requested depth report:

- `optimalMoveRate`: chosen move strong score equals the best strong score;
- `resultClassPreservationRate`: chosen move preserves win/draw/loss sign;
- `meanStrongRegret`: mean `(bestStrongScore - chosenStrongScore)`;
- `resultClassDrops`: count where the chosen move falls to a worse game-theoretic result class;
- incumbent nodes and evaluator calls.

A position is **game-theoretically correct** when its chosen move preserves the solved result class. Exact strong-score optimality is stricter because it additionally prefers faster wins and later losses.

## Known incumbent-v1 solved defect vector

Sequence:

`54676552255627`

Frozen move scores for columns 1..7:

`[1, 2, -2, -5, 1, -2, -14]`

The position is a solved win for the side to move. Incumbent v1 at production depth 12 selects column 3, whose solved score is `-2`, so it converts a win into a loss under perfect opposition. The same baseline selects the optimal column 2 at depth 19.

Both the `legacy-qualified` fixed-depth lane and production ordering lane make the same depth-10 through depth-20 choices on this vector. The defect is therefore not attributed to cross-move TT ordering.

This vector is evidence of a horizon/evaluator-search limitation in incumbent v1. It does **not** by itself identify which evaluator behavior should be changed.

## Evaluator-change rule

A frozen evaluator quirk may be challenged using solved oracle evidence, but a replacement is not accepted merely because it fixes one position or one depth.

A candidate replacement must demonstrate a materially better solved-corpus result without creating offsetting regressions, and must receive a new evaluator/search compatibility version rather than silently changing C4-0002/C4-0003 behavior.

The repeated-immediate promotion remains frozen in incumbent v1 unless such evidence is established.

## Non-claims

- The 128 calibration positions are not a statistically representative sample of all legal Connect Four positions.
- The 30 beginning spot checks are explicitly selection-biased and qualitative.
- Perfect performance on either corpus does not prove globally perfect play at that depth.
- Oracle execution speed is not a benchmark result.
- The oracle does not become the evaluator used by the incumbent or a future CUDA-MCGS comparison lane.

## CUDA boundary

C4-0005 completes the first independent strength gate for the Node incumbent. It does not resume CUDA-MCGS issue #124 and does not authorize upstream CUDA-MCGS mutation.
