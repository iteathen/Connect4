# Semantic quotient MQ4 — materialized flat replay qualification amendment

**Status:** passed on complete bounded controls. This amends the MQ4 serialization/replay evidence; it does not change the residual-state semantics and is not a standard 7x6 or production-solver claim.

## Why this amendment exists

The original MQ4 qualification proved direct residual reachability plus exact distance-sensitive state and per-column action values. Its `compileFlat()` step assigned dense IDs and verified that recomputed semantic child keys had dense targets, but it did not actually materialize a transition array and replay through decoded entries.

That was sufficient evidence for the residual transition law, but weaker than the recorded `flatDenseTransitionReplayComplete` wording.

This amendment closes that exact qualification gap.

## Reproduction

```text
source branch: work/semantic-quotient-mq4-flat-replay-20260911
source head:   2c93953f78a9feed88693eeea36510d364d6e7fe
source:        research/semantic-quotient/mq4-flat-replay.mjs
workflow run:  34571535359
job:           103174499646
runtime:       Ubuntu 24.04 / Node 26.7.0
```

Durable compact evidence:

```text
docs/research/evidence/2026-09-11-semantic-quotient-mq4-flat-replay.json
```

## What is now actually replayed

The qualifier builds the direct residual automaton, assigns dense state IDs, and materializes one u32 entry per `(stateId,column)`:

```text
0xffffffff                  illegal column
0x80000000 | strongScore    immediate terminal move
dense child state ID        nonterminal move
```

The complete table is then copied through a byte serialization boundary and reconstructed as a fresh u32 view. The replay side does not use semantic child-key lookup to traverse or solve the automaton.

From the decoded table alone it:

1. traverses reachable dense state IDs from root ID 0;
2. verifies every nonterminal target is in range and exactly rank+1;
3. requires every compiled state to be reachable;
4. solves exact strong values bottom-up;
5. obtains each column action score from the decoded entry and decoded child value.

A separate semantic pass then checks every encoded entry against the residual transition law. This keeps table replay and semantic oracle roles distinct.

## Results

All four complete controls passed with:

```text
orphan states:                 0
invalid child targets:         0
invalid child ranks:           0
encoded transition mismatch:   0
per-column action mismatch:    0
strong state score mismatch:   0
```

| Geometry | States | u32 entries | Table bytes | Child entries | Terminal entries | Root score | FNV-1a32 table digest |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 4x3 c3 | 3,735 | 14,940 | 59,760 | 7,842 | 2,390 | +2 | `37d5ae0f` |
| 4x4 c4 | 34,095 | 136,380 | 545,520 | 94,508 | 6,256 | 0 | `b562bf3e` |
| 5x3 c4 | 11,317 | 56,585 | 226,340 | 35,933 | 1,786 | 0 | `64fa523f` |
| 4x5 c4 | 294,593 | 1,178,372 | 4,713,488 | 814,300 | 76,058 | 0 | `5a248105` |

The byte total differs from the original MQ4 table-size estimate on controls whose state count fit in 16 bits because this amendment deliberately uses a uniform u32 serialization. The 4x5 artifact is unchanged at 4,713,488 bytes because its dense IDs already require more than 16 bits.

## Interpretation

The strengthened claim is now supported:

```text
serialized residual transition artifact
+ root dense state ID
+ exact strong-scoring recurrence
```

is sufficient to replay the complete qualified games without colored ownership, line-hit history, or residual-key reconstruction in the solve loop.

This is still research evidence. It does not establish that a complete standard 7x6 artifact is small enough, that eager whole-game compilation is the right 7x6 implementation, or that semantic alpha-beta is faster than the existing fixed-width colored-board solver.

Those questions belong to MQ5 on `solver/minimax-alpha-beta`.
