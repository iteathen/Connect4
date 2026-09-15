# Total-domain logical foundation for finite Connect Four boards

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

The board-size domain is the set of all positive integer rectangles `W x H` with connect length `K=4`. No theorem in this note is justified by sweeping finitely many board sizes. Finite executions may be retained as implementation checks, but they are not evidence for the quantified claims.

The intended calculus must therefore be defined from generated geometry, support order, and response structure, and small boards must occur only as degeneracies of those same objects.

## 1. Total-domain geometric count

Let

- `a = max(W - 3, 0)`;
- `b = max(H - 3, 0)`.

For every positive integer `W,H`, the number of geometric connect-4 requirements is

`L(W,H) = H a + W b + 2ab`.

### Proof

A horizontal length-4 requirement is determined by a row and a starting column. There are `H` row choices and exactly `a` legal starting columns, hence `Ha` horizontals.

A vertical requirement is determined by a column and a starting row. There are `W` column choices and exactly `b` legal starting rows, hence `Wb` verticals.

For each diagonal orientation, a legal start requires four columns and four rows, hence `a b` starts. There are two diagonal orientations, contributing `2ab`.

The four direction classes are disjoint, so the total is `Ha + Wb + 2ab`.

The positive-part factors make this a single formula over the whole domain. If a dimension is too short to host a direction, that direction contributes zero automatically; no small-board branch is introduced.

## 2. A universal mate-response lemma

Let `R` be any set of disjoint cell pairs. Suppose a player can maintain the following invariant for every pair `{u,v}` in `R`:

> once the opponent owns one endpoint, the player owns the other endpoint before the opponent can own both.

Then every winning requirement containing both endpoints of at least one pair in `R` is permanently unavailable to the opponent.

If every generated winning requirement contains a pair from `R`, the opponent can never win. If the same response construction is available to either player from the empty board, each player has a no-loss strategy. Since the game is finite and has no simultaneous wins, the empty-board value is draw.

This is a logical certificate: it proves non-loss from the response invariant and requirement coverage, not from solved labels.

## 3. Gravity-chain response matching

For each column `x`, pair consecutive support events

`(x,0)-(x,1), (x,2)-(x,3), (x,4)-(x,5), ...`.

Call this matching `R_support`.

### Lemma: every vertical length-4 interval contains an `R_support` pair

Take an arbitrary vertical interval with row indices

`{s,s+1,s+2,s+3}`.

- If `s` is even, `{s,s+1}` is one of the support pairs.
- If `s` is odd, `{s+1,s+2}` is one of the support pairs.

Therefore every vertical connect-4 requirement contains a support pair, for arbitrary starting row `s` and arbitrary board height.

### Legality of the mate response

If the opponent occupies the lower endpoint of an unresolved support pair, the upper endpoint becomes immediately playable by gravity, so the player may take it on the next move.

The opponent cannot be the first owner of the upper endpoint of an unresolved pair: gravity requires the lower endpoint to have been occupied already. If the lower endpoint belongs to the player, the requirement is already blocked; if it belonged to the opponent, the prescribed response would already have occupied the upper endpoint.

A player's own incidental move into either endpoint cannot damage the blocking invariant, because that endpoint is then permanently unavailable to the opponent.

Thus `R_support` is a valid no-loss response matching for either player.

## 4. Width-below-connect corollary: all `W < 4` boards are draws

Assume `1 <= W < 4` and arbitrary positive `H`.

Then `a=max(W-3,0)=0`. By the total-domain line formula,

`L(W,H) = W b`.

So every generated winning requirement is vertical; horizontal and diagonal requirement sets are empty by generation, not by a special rule.

By the gravity-chain lemma, every one of those vertical requirements contains an `R_support` pair. Hence either player can prevent the opponent from completing a winning requirement. Therefore every finite board with `W<4` is a draw.

This includes `1x1` automatically. When `H<4` as well, `b=0`, so the winspace itself is empty and the same theorem collapses vacuously.

## 5. Initial-frontier response matching

On a one-row board, every cell is initially playable. Pair adjacent frontier events

`(0,0)-(1,0), (2,0)-(3,0), (4,0)-(5,0), ...`.

Call this matching `R_frontier`.

### Lemma: every horizontal length-4 interval contains an `R_frontier` pair

Take an arbitrary interval of four consecutive columns

`{s,s+1,s+2,s+3}`.

- If `s` is even, `{s,s+1}` is a frontier pair.
- If `s` is odd, `{s+1,s+2}` is a frontier pair.

Because all remaining cells on a one-row board are playable, the mate of an opponent move in an unresolved pair is immediately legal. If the player already owns the mate, the pair is already blocked.

Therefore `R_frontier` is a valid no-loss response matching for either player.

## 6. One-row corollary: all `H = 1` boards are draws

For `H=1`, `b=0` and the only possible generated winning requirements are horizontal. Every such requirement contains an `R_frontier` pair by the interval lemma. Hence either player has a no-loss strategy and every one-row board is a draw.

Again this is not a board-size exception. It is the same generated requirement/response calculus specialized by the event structure: the support DAG has only its initial frontier.

## 7. What has and has not been proved

Proved for all positive integer dimensions, without finite enumeration:

1. the exact geometric line-count formula `L(W,H)=H(W-3)_+ + W(H-3)_+ + 2(W-3)_+(H-3)_+`;
2. the universal mate-response blocking lemma;
3. the gravity-chain interval lemma;
4. every `W<4` board is a draw as a structural corollary;
5. the initial-frontier interval lemma;
6. every `H=1` board is a draw as a structural corollary.

Not yet proved:

- a complete closed-form value theorem for every positive `W,H`;
- that the primitive pair matchings alone settle every thin height (`H=2` or `H=3`);
- that the current 7x6 middle-space / residual / CPC construction has already been lifted to a single quantified all-board theorem.

Those remain the next calculus work. The correct standard is now explicit: new all-board claims require symbolic derivation over arbitrary `W,H`; finite board sweeps are permitted only to falsify an implementation or catch algebra mistakes.
