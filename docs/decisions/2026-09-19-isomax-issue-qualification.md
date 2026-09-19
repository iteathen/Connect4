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
