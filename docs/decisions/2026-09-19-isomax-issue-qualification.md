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

## Optional ordinary-value boundary consumer (#70)

`IsoMaxRbaValueResolver({ pool, minimumHeights, ...limits })` constructs a bounded
completed support cone. Pass it as `valueResolver` to `IsoMaxSolver`. Default is
null. It runs after native exact and guarded certificate conclusions, before
forced/recursive transitions. Missing cone membership returns unknown; bounded
construction failures throw before publication. Native terminal handling stays
first. The consumer reuses the public Connect4 RBA reference (unchanged from
`solver/cuda-bsfp@64d6b69cd49f7b38655a023ed91d17a67eaf19bf`) and its qualification
fixtures instead of introducing a second implementation. Residual conversions
are cached per pool-local class. Reflection maps both support and residuals.
No physical board is reconstructed in the solver and no proof is produced.

Tests reproduce 608 persisted boundary hashes across the two rank-33 cones,
exhaust all 4,659 legal nonterminal 4x3 states/11,818 edges in the independent
RBA control, and retain complete 2x2 abstract-domain/cofactor and skyline tests.
The IsoMax consumer additionally checks 484 direct boundary memberships across
complete legal late cones (including 12 physically distinct q-collision pairs
and mirrors), W/D/L and every preserving action against physical and recursive
controls. There are 110 boundary hits. Missing/incomplete cones, pool mismatches,
certificate precedence and absence of proof synthesis are covered.

Recursive and move-selection play/undo now use `try/finally`. An injected child
certificate failure verifies full live-state restoration instead of leaving the
caller's state at a child. Qualification: 34/34 Isometric + RBA tests pass.

Economics reproduction: `node components/isometric/qualification/rba-economics.mjs`.
Three fresh Node 26.7.0 processes, alternating control/consumer order, 20 timed
samples per root after two warmups; raw data in `rba-economics.json` beside it.
For support `[5,3,5,6,6,6,5]`, median across processes:

- construction: 6.4295 ms (normalization separately 1.3787 ms);
- recursive control: 0.0864 ms;
- completed-boundary solve: 0.0105 ms (query about 0.0080 ms);
- 35 recursive children and 7 forced transitions avoided;
- construction plus one solve: about 6.44 ms, substantially worse than control.

The other root closes natively and gains nothing from a boundary. **No default
promotion**: faster warm membership and fewer children do not justify worse
total economics. Shared repeated queries are a future workload to qualify, not
a demonstrated amortized benefit. Existing recursion remains the exact control.

## Contradictory no-win bound repair

Review found a further fail-closed violation: max/min backup replaced a child
value crossing a certified bound with that bound before checking contradiction.
A legal rank-34 P0-winning root with a false P0-no-win certificate returned draw.
The matching P1/min case had the same defect. Backup now keeps the observed value
and rejects the contradiction before publication. Independent physical controls
at ranks 34 and 37 verify both orientations, root-state restoration and absence
of a cached draw after failure. Valid no-win cutoff semantics are unchanged.
