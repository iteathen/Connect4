# Standard 7×6 slot-owned descriptor span run — host memory becomes the limiter

**Date:** 2026-09-11  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Purpose

Re-run the corrected standard-7x6 forward W/D/L root proof after changing semantic descriptor lifetime from append-per-incarnation to physical-slot-owned reusable term spans.

The run retained the same frontier proof configuration:

- three search workers;
- unresolved-decision split depth 8 after forced macro normalization;
- dynamic player-relative live-winning-line ordering;
- one-sided WSL bounds;
- non-allocating proof probes;
- generation-safe 8-way semantic proof replacement;
- incremental sibling completion with non-interrupting detach;
- autonomous Branch Manager exploration disabled for isolation.

## Result

The previous descriptor-term exhaustion was removed as the first limiter. The hosted process was killed by the runner with exit code **137** after RSS reached about **15.4 GB**.

Last published progress at about 225 s:

```text
root W/D/L:                 unresolved, still [0,1] win threshold
live proof entries:         8,388,608 / 8,388,608
shared replacements:       37,595,511
term span reuses:          27,624,098
term span grows:            9,971,413
term IDs used:            269,844,141 / 460,000,000
RSS:                       15,417,847,808 bytes
worker expansions:         30,808,552
leaf tasks issued:                 120
completed authoritative tasks:      56
active workers:                       3
queued authoritative tasks:          61
```

The term arena was only about 58.7% consumed when the process was killed. Shared proof-entry capacity remained operational under replacement. Host memory is therefore the next observed limiting resource.

## Descriptor-lifetime result

Slot-owned spans materially changed term growth. At 150 s:

```text
replacements:      30,579,060
span reuses:       21,580,293
span grows:         8,998,767
term IDs used:    250,884,054
```

The prior append-per-incarnation run exhausted all 460M terms at about 149 s after 30.97M replacements. With slot-owned spans, nearly the same replacement count used only ~250.9M terms.

Thus slot-owned descriptor lifetime is working as intended and should be retained.

## Why the next step is telemetry, not another memory optimization

The root harness currently reports only coordinator-local q states/classes. Those stayed tiny (157 q states / 314 residual classes at the final progress point) and therefore do not explain process RSS.

Search workers already report their local q-state and residual-class counts when each coarse leaf task completes, but the dependency engine currently discards those values. Before changing worker-local storage, cache lifetime, or task granularity, aggregate:

- worker-local q-state high-water;
- worker-local residual-class high-water;
- worker-local typed-byte high-water from the quotient kernel;
- descriptor-cache term-ID high-water if the first three do not explain memory.

The next root/profile run should surface those values in periodic progress output. No worker-local memory policy should be promoted until this measurement identifies the actual owner.

## Qualification identity

Workflow run: `34671597871`  
Job: `103493846720`  
Executed head: `ccbcc64c1eccc31a0acd73599a688a5b326975f3`  
Result: research failure — hosted process killed at ~15.4 GB RSS before root proof; shared proof-entry and descriptor-term capacities were not exhausted.
