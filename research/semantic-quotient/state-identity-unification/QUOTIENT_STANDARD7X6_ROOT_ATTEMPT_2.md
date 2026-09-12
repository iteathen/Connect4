# Standard 7×6 online Negamax root attempt 2

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** worker activation improved; fixed TT entry capacity still exhausted before root proof  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

Attempt 2 changed only the dependency split depth from 3 to 8. It retained the same online exact semantic identity, WDL threshold semantics, three search workers and fixed shared table.

Configuration:

```text
search workers:          3
available logical lanes: 4
split depth:             8
root WDL window:         [0,1]
TT entry capacity:       8,388,608
TT term-ID capacity:     460,000,000
prebuilt global graph:   none
```

## Result

The fixed entry table again became full before a root proof, this time after about **106.6 seconds**:

```text
TT entries:       8,388,608 / 8,388,608
term IDs used:      91,752,430 / 460,000,000
root WDL:          unresolved
process RSS:       ~3.60 GB
```

The term-ID descriptor arena remained mostly empty. The limiting resource is the number of retained semantic states, not descriptor bytes.

## Worker activation

The deeper split corrected the serial-principal-span problem from attempt 1.

At roughly 15 seconds:

```text
TT entries:       5,532,402
submitted tasks:          17
completed tasks:           7
active workers:             3
queued tasks:               7
worker assignments:     [5,3,2]
worker expansions:   3,455,424
```

At roughly 30 seconds:

```text
TT entries:       8,365,312
submitted tasks:          33
completed tasks:          10
active workers:             3
queued tasks:              20
worker assignments:     [5,4,4]
worker expansions:   5,575,886
```

At failure the executor had distributed work approximately evenly:

```text
worker task counts: [10,13,10]
shallow expanded:   26
worker expanded:    5,575,886
leaf tasks issued:  33
scout tasks:        32
```

Thus standard 7×6 needs a substantially deeper dependency split than the bounded 4×5 controls, and depth 8 is sufficient to expose useful parallel work on the four-lane hosted runner.

## Storage consequence

The current semantic TT is append-only open addressing. Once every entry is occupied, a new unseen semantic state cannot be inserted and the solve stops.

The evidence now supports a fixed-capacity replacement/reclamation design rather than simply increasing table size:

- all search workers are usefully active;
- descriptor storage has large unused capacity;
- RAM is not the first limiter;
- more than 8.3 million distinct semantic states are encountered before the win threshold is proved.

Replacement may discard old proof information and cause recomputation, but it must never manufacture a false hit or let a stale proof publication attach to a newly replaced key.

The next implementation therefore uses bounded set-associative buckets with exact descriptor comparison and per-slot generations. Search-worker lookup remains local/shared-memory and does not require per-node RPC to maintenance. Maintenance remains the lifecycle/reclamation owner.