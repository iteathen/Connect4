# Standard 7x6 perfect-play closure horizon — 2026-09-13

## Status

Measured research checkpoint. This result is **not** a standard-empty-board root qualification and does not revise `standard7x6-root-qualification-revision.txt`.

The experiment asks a narrower question: along one deterministic exact strong-score-optimal 7x6 line, how early can the current quotient-native solver independently establish exact W/D/L from a prefix under a bounded resource/time envelope?

## Provenance

Repository branch: `research/frontier-negamax-conformance`

Measurement source commit: `ff780ba559ca3bf2606a7d3ac71fccd1e98293f0`

Workflow: `Frontier perfect-play closure horizon`

Successful run: `34744996898`

Successful job: `103691163565`

Runner: Ubuntu 24.04, Node 26.7.0

External path oracle/control only:

- Pascal Pons `connect4` source commit: `d6ba50d8aaf2308c769d9bf2abd42d90f34baf41`
- source commit purpose: adds `Solver::analyze(Position)` for exact scores of all legal actions
- official `7x6.book` release asset id: `10766475`
- asset size: `33,554,524` bytes
- SHA-256: `f346cd449626fb81da93be0958e017ee854e5f74d85b6d38062357f5403aec53`

The upstream binary/book are ephemeral workflow-only controls. They are not Connect4 production solver dependencies and their scores are not accepted as quotient proof publications.

## Deterministic exact strong-score line

Action selection used maximum exact strong score with deterministic center-order tie breaking.

Generated line:

```text
44444456233333565556621265362227771111177
```

The line terminates at physical ply 41 with a first-player win.

Root exact action scores from the pinned Pons control were:

```text
[-2, -1, 0, 1, 0, -1, -2]
```

so center column 4 is the unique winning root action in this score vector.

Path generation took about 931 ms with the opening book bound.

## Static closure versus recursive closure

These are deliberately separate measurements.

### Static structural/tactical closure

For the selected spine, physical plies 0 through 39 had:

```text
frontierBoundCode = FRONTIER_BOUND_NONE
```

The current `guarded-adjacent-response-coverage-v1` response closure therefore did **not** directly close or even one-side-bound any selected-line prefix.

Some prefixes had a forced tactical move, but no tactical exact W/D/L result appeared until ply 40.

At ply 40:

```text
sequence = 4444445623333356555662126536222777111117
tacticalCode = immediate win
staticExact = +1
```

Thus the earliest static exact closure on this selected line is ply 40, one move before terminal.

### Recursive quotient exact closure

The experiment intentionally did **not** launch the quotient solver from the standard empty root. Prefix probes begin at ply 8.

Every prefix from ply 8 through ply 40 independently resolved to the exact W/D/L expected from the external oracle:

```text
probed prefixes   = 33
resolved prefixes = 33
earliest probed exact prefix = 8
contiguous exact suffix = ply 8 through ply 40
unresolved prefixes = 0
```

The external exact scores were validation/path-selection evidence only. A prefix counted as exact only when the current quotient solver independently returned the matching W/D/L result.

## Measurement resource envelope

Each fresh prefix process used the already-measured standard-depth-10 resource envelope as a hard measurement cap:

```text
searchStorage.states        = 2,097,152
searchStorage.classes       = 4,194,304
searchStorage.chunksPerSlot = 4,194,304
sharedArena.entryCapacity   = 262,144
sharedArena.termCapacity    = 144,703,488
```

Per-prefix process timeout: 15 seconds.

This envelope is a measurement/resource bound, not a Connect Four semantic limit.

## Representative exact prefix work

| Prefix ply | Recursive calls | Expanded | Frontier-bound cuts | Search time |
| ---: | ---: | ---: | ---: | ---: |
| 40 | 1 | 0 | 0 | ~4.2 ms |
| 33 | 22 | 11 | 2 | ~6.8 ms |
| 27 | 216 | 94 | 8 | ~14.1 ms |
| 25 | 1,286 | 455 | 73 | ~25.1 ms |
| 24 | 2,084 | 782 | 180 | ~32.0 ms |
| 21 | 13,165 | 4,755 | 1,114 | ~72.0 ms |
| 18 | 23,028 | 8,255 | 1,371 | ~107.3 ms |
| 15 | 36,663 | 12,941 | 1,792 | ~141.4 ms |
| 13 | 106,955 | 35,919 | 4,538 | ~298.6 ms |
| 11 | 355,081 | 116,962 | 11,166 | ~726.1 ms |
| 10 | 355,082 | 116,963 | 11,166 | ~729.6 ms |
| 9 | 355,083 | 116,963 | 11,166 | ~727.7 ms |
| 8 | 355,084 | 116,964 | 11,166 | ~716.9 ms |

Search time is runner-specific and secondary. Exact recursive work is the primary structural measurement.

## Important structural finding

There is a sharp distinction between the selected spine and its descendants:

- the selected spine itself has no static frontier-bound closure through ply 39;
- exact recursion from the ply-8 prefix nevertheless obtains **11,166 frontier-bound cuts** in descendant states;
- the ply-8 prefix is proven in only **355,084 calls**, despite 33 physical plies remaining on the selected perfect-play line.

Therefore the current parity/response/exhaustion machinery is already useful primarily **off the principal variation**, not as a direct selected-spine terminal shortcut. That is the relevant location for exact game-tree proof reduction.

## Relation to the depth-scaling curve

The empty-root bounded-depth campaign measured:

```text
depth 8  =   4,777,115 calls
depth 9  =  30,748,514 calls
depth 10 = 191,526,252 calls
```

with a stable local growth factor near 6.3x per added physical ply.

The branch-local ply-8 exact solve requires only 355,084 calls. This demonstrates that physical distance to terminal is not the relevant prediction horizon once exact tactical/quotient/frontier closure is available.

It does **not** establish that the standard root proof horizon is ply 8.

## Scope and non-claims

This experiment establishes:

> On one deterministic exact strong-score-optimal line, every tested prefix from physical ply 8 onward is independently exact-solvable by the current quotient solver within the stated resource/time envelope.

It does not establish:

- that all legal or proof-relevant ply-8 states close;
- that the worst proof-relevant opening branch closes at ply 8;
- that a production root proof can yet terminate on a ply-8 frontier;
- a standard-empty-board root runtime;
- standard-root memory readiness;
- promotion readiness.

The next useful experiment is therefore not blind depth-11 extrapolation. It is a **proof-frontier census**: construct a minimal W/D/L root proof attempt using the pinned exact oracle only for winning-node move selection, expand all legal replies at loss nodes, and measure how many unique frontier states at a bounded opening depth can be independently discharged by the quotient solver. This converts a principal-variation observation into a proof-relevant opening envelope while preserving the rule that external oracle scores never become quotient proof authority.
