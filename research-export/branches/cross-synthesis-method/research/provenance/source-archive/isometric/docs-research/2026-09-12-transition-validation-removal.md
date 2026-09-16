# Transition state-validation ownership removal

**Date:** 2026-09-12  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Scope

Continue the frontier-native exact W/D/L Negamax optimization from audited head
`101bc53f79471fd65e83fb7664fa1f6eff2728a8`. The governing rule from the preceding
transition-state read audit was to remove another validation only after proving it
was duplicate under the current canonical state owner.

This unit changes no game semantics, CPC/WSL/NDC fact, proof identity, proof
publication rule, move ordering, tactical closure, resource capacity, Branch
Manager behavior, or full-root trigger.

## Finding

The hot transition entry `advance(stateId, column)` validated `stateId` before
checking the column. For every valid column it then immediately called the state
owner's `edgeAt(stateId, column)`, which validates the same state and column before
reading the direct semantic-edge table. On a cache miss, `writeStateParts()` later
validates the state again before decoding the canonical support/P0/P1 payload.

The outer state validation therefore added no authority. The canonical state owner
already rejects an invalid state before the first state-dependent read. The
existing outer column guard remains because its public semantic contract is to
return `QN_ILLEGAL` for an invalid column rather than throw an edge-address error.

## Execution

Source commit:

```text
08b9b341b5ade09f155c3d56d160d691efbf4209
Remove duplicate transition state validation
```

Source change:

- remove the kernel-level `assertStateId(stateId)` at the start of `advance()`;
- keep the state owner's validation in `edgeAt()` and `writeStateParts()`;
- keep the invalid-column `QN_ILLEGAL` guard unchanged.

A regression control was added to the packed-state test. It verifies:

- invalid state ID still fails at the packed state owner;
- invalid negative/high columns still return `QN_ILLEGAL`;
- a legal transition returns a valid child;
- the repeated direct-edge lookup returns the same child.

The exact base-to-source diff contains one production-line deletion plus the
regression control. No other production source changed.

## Bounded qualification

All four automatically routed bounded lanes passed on exact source
`08b9b341b5ade09f155c3d56d160d691efbf4209`:

```text
semantic proof replacement:          34730882786  success
online dependency-aware Negamax:     34730882819  success
idle ExploreHint:                    34730882800  success
slot-local 64-bit residual pool:     34730882798  success
```

The slot64 lane also executed the ordinary bounded 7x6 connect-4 depth-8 timing
probe on Node 26.7.0.

Exact candidate counters:

```text
calls:                 4,777,115
expanded:                672,690
local states:            221,398
local residual classes:  305,714
edge hits:              4,355,811
edge misses:              421,303
cutoffs:                    2,424
horizon leaves:         4,014,763
```

These match the immediately preceding audited source exactly.

Timing observation:

```text
preceding source 5ec678f6 search: 2657.891633 ms
candidate 08b9b341 search:       2581.172551 ms
candidate user CPU:                    3.04 s
candidate system CPU:                  0.08 s
```

The observed search-time delta is about -2.9%. This is one hosted sample and is
not a qualified speedup. The retained claim is narrower: one duplicate validation
was removed from every transition request with exact search/proof/identity counters
unchanged and all bounded lifecycle/correctness lanes green.

## Review

The optimization preserves the ownership boundary:

```text
kernel transition policy
  -> canonical state owner validates address
  -> direct semantic-edge read
  -> on miss, canonical state owner decodes exact state parts
```

Validation was not disabled globally and no unchecked state reader was exposed.
No hash was promoted to equality. Proof generations and semantic descriptors are
unchanged.

The next candidate is the remaining **miss-only** duplicate state validation:
`edgeAt()` validates before reporting an unknown edge, then `writeStateParts()`
validates the same state again before decoding the miss payload. Any fusion must
remain state-owner-owned, preserve invalid-column behavior, preserve cache metrics,
and keep `writeStateParts()` strict for its other callers such as tactical
classification. Do not make `writeStateParts()` generally unchecked.

No standard empty-root full solve was launched.
