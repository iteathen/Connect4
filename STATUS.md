# Connect4 frontier-native forward-solver research status

**Updated:** 2026-09-11  
**Branch:** `research/frontier-negamax-conformance`  
**Forward solver authority:** `docs/specs/C4-0010-quotient-native-negamax-v1.md`

## Governing model

```text
C4-0001 legal game/domain
  -> C4-0006 CPC + WSL-625
  -> C4-0007 NDC where strategic closure is used
  -> C4-0010 exact forward W/D/L Negamax
```

The forward lane consumes exact structural facts; it does not redefine them. BSFP remains the separate backward fixed-point solver lane.

The qualified ordinary forward identity remains:

```text
supportIndex
+ normalized P0 residual winning requirements
+ normalized P1 residual winning requirements
```

A hash is only a filter. Shared proof identity is exact descriptor equality.

## Qualified execution

The current forward engine includes:

- incremental player-relative live-line frontier ordering;
- exact immediate-win / forced-response / multiple-threat / WSL-exhaustion bounds;
- forced-response macro normalization;
- non-allocating ordinary shared-proof probes;
- 8-way exact-descriptor shared TT with generation-safe proof handles;
- v5 physical-slot-owned descriptor extension chunks;
- dependency-qualified sibling scouts with incremental completion and detached obsolete work;
- `drainBackground()` before reset/cleanup;
- Branch Manager bounded autonomous exploration when enabled.

Busy workers are never interrupted. Autonomous exploration remains disabled in standard-7x6 resource-isolation runs.

## Standard-7x6 resource progression

### Shared proof entry count

A corrected proof-admission run filled all `8,388,608` entries before resolving the root. This established retained proof-entry count as a real limiter.

### Append-only semantic-incarnation terms

Replacement removed the entry-count hard stop, but append-only descriptor incarnation storage exhausted `460,000,000` term words after about 149 s. This established semantic incarnation as the wrong descriptor-storage owner.

### Physical slot spans and worker state objects

Physical-slot-owned reusable spans removed the immediate append-only term failure, then a 7x6 run died around 225 s / 15.4 GB RSS. Telemetry localized the next major owner to millions of worker-local retained state descriptor JS objects. State descriptors were made ephemeral and bounded conformance stayed exact.

See `docs/research/2026-09-11-7x6-worker-descriptor-retention.md`.

### v4 whole-span growth

Run `34674060855` survived for `855441.400302 ms` after the state-descriptor correction, then failed exactly at:

```text
semantic TT term arena exhausted: 460000025 > 460000000
```

At failure:

```text
entries:        8,388,608
replacements: 153,310,210
reuses:       134,966,299
grows:         18,343,911
term IDs:     459,999,998 / 460,000,000
RSS:           15,600,738,304 bytes
```

### v5 slot-owned extension chunks

The shared TT now appends only the missing descriptor capacity to a physical slot instead of abandoning a whole prior span. Generation-bearing handles and exact proof identity are unchanged.

Bounded qualification passed replacement, dependency-aware, idle-explore, stale-handle, and adversarial slot-growth controls.

Standard-7x6 v5 run `34675467051` then demonstrated that the old shared-term lifetime boundary was removed. The hosted runner shut down after roughly 780.56 s with the shared term arena still healthy:

```text
entries:             8,388,608
replacements:      168,397,037
chunk count:        27,238,990
descriptor data:   210,231,525 words
chunk headers:      81,716,970 words
total arena:       291,948,495 / 460,000,000 words
RSS:                15,751,729,152 bytes
```

The solver step was cancelled by runner shutdown; it did not throw term-arena exhaustion. Root remained unresolved.

See `docs/research/2026-09-11-7x6-proof-term-lifetime.md`.

## Current measured owner: worker residual semantic descriptors

At the end of run `34675467051`, each worker retained roughly 10-11 million residual semantic classes and 103-116 million cached exact term IDs. V8 heap high-water was about 3.84-4.22 GB per worker.

The previous cache represented every observed class with a retained JS descriptor object plus a separately allocated exact `Uint16Array`, duplicating payload already represented canonically by the slot64 residual kernel.

The worker descriptor cache has now been changed to:

```text
flat typed class metadata:
  start / length / hashLo / hashHi

+ one growable worker-local Uint16 term arena
+ zero retained per-class descriptor objects
+ zero retained per-class term-array objects
```

State descriptors remain ephemeral. The shared TT accepts class-reference descriptors and materializes exact terms into one reusable per-view scratch buffer only after a 64-bit hash match or on installation. Hash-mismatch bucket lanes do not reconstruct residual terms.

This is a resource-lifetime change only. CPC, WSL-625, NDC, move ordering, forced macros, Branch Manager, task wire format, proof identity, and Negamax control semantics are unchanged.

See `docs/research/2026-09-11-worker-residual-descriptor-ownership.md`.

## Bounded qualification of flat worker descriptor ownership

Coherent implementation head `33413500c2ff68f5e4c1c12e3ec430c86fc7e91f` passed:

- replacement run `34676281224`;
- dependency-aware run `34676281219`;
- idle ExploreHint run `34676281229`.

Executor telemetry commit `cec2e3e2e93649ed86034c93038484d594a02921` passed:

- dependency-aware run `34676359852`;
- idle ExploreHint run `34676359849`.

Targeted replacement/ownership run `34676380760` at `7e4f88aba8f4d56ab598c284a8bd99cbac7623cd` passed with:

```text
exact root:     0
exact actions:  [0,0,0,0]
retained per-class descriptor objects: 0
retained per-class term-array objects: 0
```

The targeted run also requalified stale generation handles and v5 slot-owned growth.

## Current seam

The worker residual-descriptor ownership correction is bounded-qualified. No standard-7x6 run is currently active.

The next action is to admit **exactly one** standard-7x6 qualification revision using the same comparison configuration:

```text
search workers:                   3
unresolved decision split depth:  8
autonomous Branch Manager explore: disabled
shared proof entries:             8,388,608
shared term arena words:          460,000,000
```

Measure process RSS, per-worker V8/external/ArrayBuffer high-water, kernel typed bytes, flat descriptor metadata/term-arena bytes, shared v5 arena growth, and exact root/action WDL if resolved. Follow only the next measured owner.

## Open mathematics

Complete cheap U1/U2/NDC forward integration remains open. Do not claim it is solved merely because exact Negamax can search unresolved decisions.

## Pre-alpha

There is no released compatibility contract. Preserve useful evidence and current semantics; do not preserve obsolete executable architecture as compatibility baggage.
