# Connect4 frontier-native forward-solver research status

**Updated:** 2026-09-11  
**Branch:** `research/frontier-negamax-conformance`  
**Forward solver authority:** `docs/specs/C4-0010-quotient-native-negamax-v1.md`

## Governing contract

```text
C4-0001 legal game/domain
  -> C4-0006 CPC + WSL-625
  -> C4-0007 NDC where strategic closure is used
  -> C4-0010 exact forward W/D/L Negamax
```

The exact ordinary forward identity remains:

```text
supportIndex
+ normalized P0 residual winning requirements
+ normalized P1 residual winning requirements
```

A hash is only a filter; shared proof identity is exact descriptor equality. The forward lane consumes structural facts rather than redefining them. BSFP remains the separate backward fixed-point solver lane.

## Qualified execution

Current execution includes dynamic live-line frontier ordering, exact local frontier/WSL bounds, forced-response macro normalization, generation-safe 8-way semantic proof replacement, dependency-qualified incremental sibling completion with detached obsolete work, `drainBackground()` before reset, and Branch Manager bounded exploration when enabled. Busy workers are never interrupted.

Autonomous exploration remains disabled in standard-7x6 resource-isolation measurements.

## Resource progression

The standard-7x6 forward solver has successively exposed and corrected distinct lifetime owners:

1. Shared proof entry count reached `8,388,608` and became a real limiter.
2. Append-only descriptor-incarnation terms exhausted `460,000,000` words; ownership moved to physical proof slots.
3. Reusable slot spans exposed millions of retained worker state descriptor objects; state descriptors became ephemeral.
4. Run `34674060855` then exposed v4 whole-span growth, exhausting the term arena after `855441.400302 ms` and `153,310,210` replacements.
5. v5 slot-owned extension chunks removed that hard term-lifetime boundary.

See the dedicated research notes under `docs/research/` for historical evidence.

## v5 shared proof result

Revision-1 standard-7x6 run `34675467051` demonstrated that v5 fixed the old shared term-arena failure. The hosted runner shut down after roughly 780.56 s with:

```text
entries:             8,388,608
replacements:      168,397,037
chunk count:        27,238,990
descriptor data:   210,231,525 words
chunk headers:      81,716,970 words
total arena:       291,948,495 / 460,000,000 words
RSS:                15,751,729,152 bytes
```

The solver step was cancelled by runner shutdown, not by semantic-TT term exhaustion. Root remained unresolved.

This moved the measured failure boundary back to worker host memory. Each worker retained roughly 10-11 million residual semantic class descriptors and 103-116 million cached exact term IDs, with V8 heap high-water around 3.84-4.22 GB.

See `docs/research/2026-09-11-7x6-proof-term-lifetime.md`.

## Flat worker residual semantic descriptor ownership

The previous worker cache retained one JS descriptor plus one separately allocated `Uint16Array` per residual class. The active slot64 kernel already represented each class canonically by stable class ID plus compact chunk references, so the semantic layer was duplicating ownership millions of times.

The cache now uses:

```text
flat class metadata:
  start Uint32
  length Uint16
  hashLo Uint32
  hashHi Uint32

+ one growable worker-local Uint16 term arena
+ zero retained per-class descriptor objects
+ zero retained per-class term-array objects
```

State descriptors remain ephemeral class references. The shared TT materializes exact terms into one reusable scratch buffer only after a 64-bit hash match or during descriptor installation. Hash-mismatch lanes do not reconstruct terms.

This changes resource ownership only. CPC, WSL-625, NDC, forced macros, move ordering, Branch Manager, task wire format, proof identity and Negamax control semantics are unchanged.

### Bounded qualification

The correction has a complete bounded evidence chain:

- coherent replacement `34676281224` — success;
- coherent dependency-aware proof `34676281219` — success;
- coherent idle ExploreHint `34676281229` — success;
- telemetry dependency-aware proof `34676359852` — success;
- telemetry idle ExploreHint `34676359849` — success;
- targeted ownership/stale-handle/growth run `34676380760` — success.

The targeted control preserved:

```text
exact root:     0
exact actions:  [0,0,0,0]
retained per-class descriptor objects: 0
retained per-class term-array objects: 0
```

See `docs/research/2026-09-11-worker-residual-descriptor-ownership.md`.

## Active standard-7x6 revision 2 measurement

Exactly one full-root comparison run is active:

```text
workflow run:                     34676507073
job:                              103507205045
admission revision:               2
admission commit:                 8052b757002758494e9776b1f4c23224e6eeb44f
search workers:                   3
unresolved decision split depth:  8
autonomous Branch Manager explore: disabled
shared proof entries:             8,388,608
shared term arena words:          460,000,000
worker descriptor storage:        flat typed metadata + one flat term arena
```

The revision-2 gate commit launched only the standard-7x6 workflow.

**Do not admit or launch another standard-7x6 root run while `34676507073` is active.**

When this run closes, compare process RSS, worker V8/external/ArrayBuffer high-water, local state/class counts, kernel typed bytes, flat descriptor metadata/arena bytes, shared v5 term-arena growth, and exact root/action WDL if resolved. Change the next resource lifetime only from the measured owner.

## Open mathematics

Complete cheap U1/U2/NDC forward integration remains open. Do not claim it is solved merely because exact Negamax can search unresolved decisions.

## Pre-alpha

There is no released compatibility contract. Preserve useful evidence and current semantics; do not preserve obsolete executable architecture as compatibility baggage.
