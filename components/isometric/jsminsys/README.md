# IsoMax JSMinSys implementation

This directory is the current Connect4 adapter for the merged JSMinSys
shared-TT CPC-first Surplus execution path.

Pinned library:

`vendor/jsminsys` -> `iteathen/JSMinSys@3a8f8fa5d27ab7b28579aee460eed43eda1c0e48`

## Execution topology

```text
solve7x6 legal replay
  -> runtime-configured 7x6 RBA geometry
  -> canonical root q + basis
  -> shared RBA TT + ready queue
  -> N evaluator workers
       -> claim ready q directly
       -> CPC/RBA evaluation
       -> retain one unresolved continuation
       -> publish all remaining unresolved children directly as surplus
       -> NO dedupe / NO transposition merge / NO TT cleanup
  -> independent Branch Manager
       -> inspect shared surplus
       -> dedupe equivalent queued branches
       -> merge duplicate/transposed q
       -> maintain TT dependency/evidence topology
       -> clean dead/resolved/stale TT and queue state
       -> reprioritize inspected ready work
       -> reset workers whose retained q became redundant
  -> exact root W/D/L + deterministic caller-frame move
```

Workers do not round-trip through the manager to continue or publish work.
The manager does not consume surplus and does not generate branches.

## Work queue and TT ownership

Workers publish unresolved surplus directly to the shared intrusive ready-q
queue. Worker publication uses blind TT allocation: it deliberately does not
probe for an equivalent q first.

The Branch Manager alone performs shared duplicate/transposition discovery and
merge. Duplicate redirects carry a temporary canonical lifetime pin so pending
parent edges cannot observe a recycled canonical row.

The manager also removes stale/redundant queue membership and sweeps reclaimable
TT state. Reference/pin updates are bookkeeping beneath those topology changes,
not an independent worker responsibility.

## Priority

Workers attach CPC-derived usefulness priority to surplus. The manager inspects
a bounded ready-queue window each maintenance turn and fronts the highest
priority inspected item. This is bounded asynchronous prioritization, not a
claim that the entire queue is globally sorted on every mutation.

## Qualification

Connect4 CI run `35933307127`:

- Connect4: 57/57 tests passed.
- Pinned JSMinSys: 128/128 tests passed.
- Maintained late 7x6 oracle controls agree at 1/2/4 evaluator workers.
- Mirrored caller-frame witnesses agree.
- Worker-side surplus publication and manager-only dedupe are qualified.
- Redundant retained work triggers manager reset rather than worker retirement.
- Redirect lifetime is pinned through pending-edge transfer.
- Deadline/cancellation cleanup remains fail-closed.

The earlier capacity-filling Branch Manager benchmark predates these ownership
and cleanup corrections and is historical evidence only.
