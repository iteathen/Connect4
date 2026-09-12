# Standard 7×6 online Negamax root attempt 1

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** exact attempt stopped by fixed TT entry capacity before root proof  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

The first real empty-root attempt used the online dependency-aware quotient Negamax runtime rather than a prebuilt global q graph.

Configuration:

```text
search workers:          3
available logical lanes: 4
split depth:             3
root WDL window:         [0,1]
TT entry capacity:       8,388,608
TT term-ID capacity:     460,000,000
prebuilt global graph:   none
```

The maintenance host successfully ran in semantic-only mode and allocated no complete graph or graph-indexed proof arena.

## Result

The attempt stopped after about 199.9 seconds because the semantic TT entry table became completely full:

```text
TT entries:       8,388,608 / 8,388,608
term IDs used:      90,793,600 / 460,000,000
process RSS:       ~3.15 GB
root WDL:          unresolved
```

The descriptor slab was therefore **not** the limiting resource. The live search used only about 19.7% of the provisioned term-ID capacity when the entry table saturated.

The deeper-search descriptor density was much lower than the early-rank sizing sample:

```text
90,793,600 term IDs / 8,388,608 states ~= 10.82 term IDs per TT entry
```

This is consistent with residual winning requirements shrinking as play progresses.

## More important scheduler observation

Only one leaf task was submitted and only worker 0 became active:

```text
submitted tasks: 1
worker tasks:     [1,0,0]
coordinator shallow states: 4
```

This is not a worker-pool failure. It is the expected Young-Brothers dependency chain with a split depth that is far too shallow for a 42-ply board. The preferred child at each of the first three plies had to establish its bound before sibling work could be released, leaving one worker with an enormous remaining subtree.

Thus the 4×5 depth-3 result must not be transferred directly to standard 7×6.

## Disposition

Do not enlarge the descriptor slab based on this failure; it had abundant space.

The next experiment keeps the same exact semantic TT and WDL threshold semantics but increases the dependency split depth to reduce the serial principal span. Depth 8 is the next candidate. The objective is to get the principal leaf small enough to finish and release sibling proof obligations to the remaining performance workers before the fixed table saturates.

If a deeper split activates the worker pool but the table still fills, the next storage change is a bounded replacement/reclamation policy rather than unbounded growth.