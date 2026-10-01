# NEES CPC guard-survival checkpoint

**Date:** 2026-10-01  
**Branch:** `research/universal-structural-policy-20260930`  
**Status:** NEES kernel qualified through D25; D27 constructive-class obstruction localized to root trigger 6

## Representation correction

The active proof kernel uses the existing JSMinSys RBA representation as the sole board/game-state authority.

Removed from the hot proof path:

- physical 49-bit position identity;
- canonical gray physical position identity;
- base64/string RBA keys;
- JavaScript `Map` proof memo;
- `Map`/`Set` response/template carriers;
- per-node witness/result objects;
- per-transition state allocation.

Neutral/gray ownership remains subsumed by the already-qualified RBA neutral-token quotient. No second gray-token board identity is maintained.

The only extra proof side-state is the compact odd-row guard ownership mask required by the frozen guard theorem.

## JSMinSys NEES kernel

Research branch:

`research/cpc-guard-proof-memo-nees-v1`

Qualified baseline kernel revision:

`db9cda32fc814a7f982816556cb59ab82a7a4782`

Later optimized/diagnostic revisions remain on that branch and retain the same proof semantics.

Hot representation:

- caller-owned 43-frame exact RBA arena;
- caller-owned basis spans;
- fixed typed scratch;
- 7-bit response masks;
- numeric proof return codes;
- fixed-capacity typed proof memo;
- standard 7x6 lossless compact exact RBA identity: 8 RBA words + guard-mask word + horizon word.

Hash/slot identity is addressing only. Direct-map collisions are misses/replacements and cannot produce a false proof hit.

## NEES status

NEES authority:

`iteathen/NEES@7650bef0aecc0d2b226ecf253a1f8937ccf89d69`

The new JSMinSys kernel has:

- explicit E0/E1/E3/COLD execution-class ownership;
- decomposed cycle-ledger entries for every declared function;
- no legacy whole-body symbolic cost in the kernel;
- source-blob guards that fail CI whenever ledgered source changes without refreshed accounting;
- full JSMinSys test-suite gate.

Latest full-suite qualification observed:

- 185 tests;
- 185 passed;
- 0 failed.

## Governing-unit performance

### Prior research implementation, D19

RBA proof grammar with `Map`/base64 class memo:

- wall: 36.06 s
- max RSS: 592,872 KB
- accepted D19

### Full NEES kernel, D19

- wall: 14.13 s
- max RSS: 250,380 KB
- accepted D19

Relative to the old research implementation:

- approximately 60.8% less wall time;
- approximately 57.8% less peak RSS.

### Full NEES kernel, D25

- kernel elapsed: 181.740 s
- workflow wall measurement: 181.79 s
- max RSS: 250,724 KB
- accepted D25
- absolute ply: 35

Thus the durable constructive lower reach remains:

[
\boxed{D25}
]

from the rank-10 candidate-6 root, i.e. through absolute ply 35.

## Memo-capacity result at D19

Same kernel, only direct-map memo capacity changed:

- 262,144: 18.787 s
- 1,048,576: 17.846 s
- 4,194,304: 17.694 s
- 8,388,608: 17.759 s

D19 best observed capacity: 4,194,304 entries.

A D25 capacity sweep is separately running because the D25 working set is much larger.

## Subset optimization

Replacing generic shape-subset scans in the minimal-residual pass with the initialization-prepared dense subset table gave a matched D19 wall ratio of approximately 0.941, about a 5.9% improvement with essentially unchanged RSS.

Inlining the already-proven dense table lookup beyond that produced only a small additional matched effect (~0.4% wall improvement in the first A/B), so it is lower priority than the current theorem obstruction.

## Corrected D27 boundary

The D27 workflow itself completed successfully, but the constructive proof class returned:

- accept: false
- result code: 7
- first unclosed root trigger: column 6
- requested horizon: D27
- absolute target ply: 37
- runtime: 271.593 s kernel / 271.66 s workflow
- max RSS: 250,360 KB

This is **not** an attacker upper bound and does not prove a forced win at D27.

It means only that the current frozen constructive grammar cannot close every attacker trigger through D27.

Therefore:

- D25 remains the last proved constructive survival horizon;
- D27 is the current minimum grammar obstruction;
- deeper D29/D31 survival runs are not justified until the D27 trigger-6 transition is understood or closed.

## Current action

A bounded diagnostic is being run against only the D27 root trigger in column 6.

It uses the same frozen response grammar and records, for every already-licensed defender response:

- response column;
- exact D25 child proof code;
- next failed trigger when unclosed;
- exact support vector;
- reconstructed guard set;
- CPC status;
- active minimal residual/deadline profile.

The diagnostic introduces no response type and uses no oracle/WDL/best-move premise.

## Claim discipline

This checkpoint does not claim:

- candidate 6 is formally optimal;
- exact loss remoteness;
- an attacker forced-completion theorem;
- D27 is a true upper boundary;
- v5 authority;
- a complete standard 7x6 solve.
