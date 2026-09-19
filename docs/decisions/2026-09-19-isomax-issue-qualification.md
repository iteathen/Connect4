# IsoMax updated-spec implementation qualification

Governing contract: C4-0011, with C4-0001/0006 ordinary gameplay semantics and
C4-0007 stronger certificate boundaries. Research authority is the candidate
successor at `104abfbe4444fcd315ac807b46ce2be8da13df39`, not frozen IsoGraph 1.1.

## Proof identity (#65)

`isomax-guarded-canonical-context-v1` names an exact structural bucket, typed
canonical guard/conclusion pair and complete dependency cone. The dependency
cone is **already canonical proof context supplied by the caller**, including
any load-bearing provenance; no spatial transport of opaque dependency data is
inferred. `provenance` is explicitly diagnostic metadata, retained from the
first insertion and excluded from equality. A different profile is rejected.

Proof tokens are scoped to the complete pool-bound index, not each bucket.
Collisions fail closed. Supported data are finite acyclic plain records and
dense arrays; hidden/accessor/symbol properties and lossy serialization are
rejected. Immutable snapshots prevent later mutation. Reflection of supported
guard/conclusion pairs is checked for losslessness; stabilizers compare both
valid images. Unsupported temporal/resource/realizability transport remains
unresolved and is not manufactured from value equality.

Qualification: `node --test components/isometric/test/*.test.mjs`: 21/21 pass.
Added payload-collision, cross-bucket, mirrored/stabilizer, metadata, immutable
snapshot, unsupported-data and unresolved-context regressions. No solver
algorithm or hot-path performance claim accompanies this correctness repair.

## Explicit gameplay identity (#64)

`gameplayKey()` now returns exactly the canonical three-field q key. Reflection
transport is available separately through `gameplayOrientation()`. No legacy
six-field signature alias remains. Stored runtime side/status/frontier fields
are retained. The supported import is legal move replay, not arbitrary field
mutation: support determines rank/turn; a winning residual sentinel identifies
the first-win terminal owner; full support without a win identifies draw.

Residual IDs are pool-local. The gameplay cache now requires its pool and
rejects cross-pool access/injection; raw key insertion is private. Hashes remain
locators and all three fields are compared. Cache capacity input is bounded to
avoid signed-shift overflow during initial rounding.

Qualification: 23/23 Isometric tests pass, including seven or more cache
doublings, occupied probe neighborhoods, mirrored values, arbitrary payloads,
terminal identity and independently checked support/rank/turn relations.
`node components/isometric/test/key-benchmark.mjs` uses seven timed samples
after two warmups, each 250,000 lookups over 84 replay/mirror states. Node 26.7.0
median before/after: **12.8243 / 12.1553 ms**, identical checksum 46122552.
This isolated single-process observation is not a full-solve speedup claim.

## q congruence qualification (#66)

Twelve persisted pairs at ranks 35–36 have distinct legal physical colorings
and move histories but exactly equal support and independently reconstructed
minimal residual antichains. Deterministic discovery rejects premature wins;
it is qualification infrastructure, never solver code. The test exhausts every
legal suffix of each pair and its mirror: 100 paired state occurrences and 76
paired edges. First-win stopping makes these cones much smaller than unrestricted
move permutations. It checks landing cells, immediate terminal tokens, successor
q, full undo, exact W/D/L and the complete value-preserving action set against
an independent physical control. No sampled suffix or hash-only match is used.

Negative cases preserve distinct deadline/resource/realizability and load-bearing
provenance premises despite q equality. Proof contexts remain unresolved, not
draw or false. Together with the existing 96 deterministic game-prefix residual
controls these are bounded implementation qualifications, not a universal
q-congruence theorem or promotion of candidate research authority.

Qualification before adding a value resolver: 25/25 Isometric tests pass.
