# Connect4 candidate retest: structural search experiments

Date: 2026-09-09
Branch baseline: `research/exact-solver-perf-checkpoint-2026-09-08` at `bdf16764e16325fceb36509b43809b326d17bfdd` before this unit.
Status: research evidence only. No maintained implementation change.

## Purpose

After the broader architectural rethink, three candidates were selected for direct testing because they change problem structure rather than add policy around the existing search:

1. **Win-space state identity**: search canonical remaining winning requirements plus legal placement skeleton, rather than preserving all colored-board distinctions.
2. **Intrinsic rank-banked TT**: use move count / occupancy rank, which every legal path agrees on, as a natural storage partition.
3. **Monotone proof retention**: keep stronger same-state bound knowledge instead of blindly overwriting it.

The candidates were tested separately so one mechanism could not hide another.

## 1. Win-space state identity

For each player, start from all still-possible winning lines, convert each to its remaining unclaimed cell set, deduplicate identical requirements, and remove any strict superset when a subset already wins no later for the same player.

Search state is then column heights / move count plus player 0 and player 1 minimal remaining winning requirements. A legal move still chooses a real column and landing cell. The move transforms the requirement system directly: mover requirements containing the cell remove it; opponent requirements containing it disappear; an empty mover requirement is a completed win; if neither player has any remaining requirement, the state is an exact draw.

### Complete smaller-game exhaustions

All compared representations returned the same exact root score.

| Game | Colored-board states | Live original-line states | Minimal-requirement states | Minimal-requirement reduction |
| --- | ---: | ---: | ---: | ---: |
| 4x3 connect-3 | 4,659 | 4,499 | 3,735 | 19.83% |
| 4x4 connect-4 | 139,625 | 37,323 | 34,095 | 75.58% |
| 5x3 connect-4 | 152,003 | 17,455 | 11,317 | 92.55% |
| 4x5 connect-4 | 1,385,521 | 361,427 | 294,593 | 78.74% |

Merely recording which original win lines remain alive is weaker than canonicalizing the remaining obligations.

### Ordinary 7x6 late-position sample

Twelve legal nonterminal positions were generated from a fixed seed without selecting on candidate speedup. Exact physical-board memo search and exact minimal-requirement memo search agreed on every root score.

- physical memo states: 1,463;
- win-space memo states: 917;
- weighted state reduction: **37.32%**;
- median per-root reduction: **19.61%**;
- exact draw-complement cuts: 34.

Individual nontrivial roots ranged from about 9.7% to 59.4% reduction. Three trivial/tactical roots had no reduction.

The exploratory implementation canonicalizes variable BigInt requirement arrays and uses `Map`/string keys. It is frequently slower per state than the compact bitboard baseline. That is an implementation cost, not evidence that the reduced state graph is illusory. The experiment establishes state-space compression and exact-score agreement, not a production 7x6 speedup.

**Disposition: strong structural positive.** The next question is how to represent the antichain of remaining requirements without rebuilding/sorting dynamic sets at every node.

## 2. Intrinsic rank-banked TT

Every legal move increases occupancy by exactly one, so positions at different move counts can never be transpositions. The candidate prevents useless cross-rank direct-mapped collisions without dependency-family analysis.

The worker still runs ordinary two-word negamax. TT slot selection is `rank -> fixed bank -> ordinary hash within bank`. No dependency map, allocation, redirect, cleanup, or scheduler policy was added.

### 512K equal-total-capacity result

On `41267575`, exact score +3:

- flat 512K: **5,945,560 nodes**, 1,119,606 TT hits, 3,383,162 writes;
- 16 rank banks x 32K: **5,282,073 nodes**, 935,240 TT hits, 3,014,569 writes.

That is **11.16% fewer nodes** at the same total 512K entry capacity.

An eight-bank / 64K layout also reduced the search to 5,400,857 nodes (~9.16%), so the effect is not unique to one boundary set.

A six-pair reversed-order timing confirmation remained noisy on the shared sandbox. The latest batch had median wall times of roughly 1.84 s flat versus 1.30 s rank-banked, but earlier paired batches showed a much smaller wall-time margin. The repeatable claim is the node reduction; a stable speedup percentage is not yet qualified.

On `663152175`, rank layouts were roughly node-neutral: exact-16 searched 1,006,240 versus 1,004,480 flat. This supports workload-dependent use rather than unconditional banking.

**Disposition: promising structural positive.** Rank is intrinsic, exact, cheap, and path-independent. Next work should combine rank banking with the compact exact-key layout and test stable bank sizing without an online controller.

## 3. Monotone proof retention

Two variants were tested on the preserved two-word kernel:

- do not replace a stronger same-type bound with a weaker same-type bound;
- retain separate same-key lower and upper bounds.

On `663152175` at 512K, both variants returned the same exact score and searched exactly the same **1,004,480 nodes**, with the same 184,502 TT hits and 577,277 write attempts as baseline. Earlier 256K and 1M probes showed the same node identity. The extra checks/storage only added timing noise/overhead.

**Disposition: negative in this integration.** The interval model remains useful for coarse proof sharing, but extra same-key bound retention in this hot direct-mapped kernel did not avoid work.

## Combined reassessment

Two different structural ideas succeeded in the metric they were meant to affect:

- **Win-space identity reduces the number of distinct exact game states.**
- **Rank banking reduces destructive collisions between states that can never be transpositions.**

They are complementary rather than competing. One changes semantic identity; the other changes physical placement using an intrinsic property of that identity.

The strongest next candidate is a low-level win-space representation that preserves the observed antichain compression, followed by a fair comparison with and without intrinsic rank banking. The proof-retention negative removes one tempting layer from that integration.
