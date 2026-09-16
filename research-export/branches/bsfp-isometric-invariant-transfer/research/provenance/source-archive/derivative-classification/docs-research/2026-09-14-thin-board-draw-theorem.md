# Total-domain thin-board draw theorem

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Theorem

For finite Connect-4 on any positive integer rectangle `W x H`,

```text
min(W,H) < 4  =>  empty-board value is draw.
```

No board census or solved table is used.

## Case 1: `W<4`

This is the previously proved gravity-chain response theorem. Since `(W-3)_+=0`, generated requirements are vertical only (or the winspace is empty). Pair consecutive support events in each column:

```text
(x,0)-(x,1), (x,2)-(x,3), ...
```

Every vertical length-4 interval contains one such pair. If the opponent takes the lower endpoint, the upper endpoint becomes immediately playable and can be taken as the mate response. The construction is available to either player, so neither player can force a win.

## Case 2: `H<4`

Now no vertical or diagonal Connect-4 requirement can exist. Every generated requirement is horizontal.

Pair columns

```text
(0,1), (2,3), (4,5), ...
```

and maintain the invariant that the two columns in every pair have equal filled heights immediately before an opponent move into either member.

If the opponent plays in one column of a pair at row `r`, equal pre-move heights imply that row `r` is simultaneously the lowest empty cell in the mate column. Therefore the player can reply in the mate column at exactly the same row. After the two moves, the paired columns again have equal heights.

Thus every same-row pair

```text
(2j,r)-(2j+1,r)
```

is a legal mate-response pair for every row `r` that is reached.

Take any horizontal length-4 interval with columns

```text
{s,s+1,s+2,s+3}.
```

- if `s` is even, it contains paired columns `{s,s+1}`;
- if `s` is odd, it contains paired columns `{s+1,s+2}`.

Hence every generated horizontal winning requirement contains a legal response pair and is unavailable to the opponent. The same strategy is available to either player, so each player has a no-loss strategy. Since the board is finite, the result is draw.

## Consequence

The earlier `H=1` theorem is subsumed. Tiny boards such as

```text
1x1, 1x4, 2x4, 3x4, 4x1, 100x3
```

are all consequences of the same generated requirement/response logic.

The theorem does not add a small-board mode. The geometry first deletes impossible direction classes; the surviving direction class is then hit by an ordinary legal response matching.
