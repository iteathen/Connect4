# IsoMax Draft 0.3 complete ordinary-worker cost baseline

Scope inspected: `11f3ec619f5348aa0145a151d62f6af936df9bcc`, plus the
support-first q change qualified in ISSUE-CAMPAIGN.md. Authority:
NEES `3a78310a3ba14fb3acb4046c8dffd396209c213c`, C4-0011,
Connect4 logic authority 1.2 and hot-loop graph authority 0.3 on canonical
research `21cfe24af925a2eceaadccac494cacc87b0faf6f`.
Runtime: Node 26.7.0, V8 14.6.202.34-node.28, Windows x64, i5-12600K.

This is the one-time complete E0-E2 source/cost/debt inventory, not a claim
of globally optimal assembly. Existing Draft 0.2 generated-code, allocation,
operation and timing evidence remains applicable to unchanged mechanisms.
Hardware branch/cache/TLB counters remain unavailable: no zero-cost inference.
Current candidate changes require their own qualification before promotion.

## Entry, lifetime and scope closure

`solveIsoMax -> IsoMaxBranchManager.solveMoves -> executor -> worker.runTask`
validates legal replay, reconstructs one native state, reserves pool/chunk/q
storage and seals it. `solveNode` owns synchronous recurrence; its entire
ordinary call closure is covered below. The ordinary worker rejects a nonempty
certificate index or RBA resolver at entry. Optional guarded/value consumers
remain separately scoped APIs, not hidden conformance exceptions.

`profile.mjs` precomputes the 625-term vocabulary, reflection, reduction,
superset incidences and 42 cell masks. `move-order.mjs` compiles pair incidences.
String/Map/Array construction there is startup work. No such construction is
required by the admitted ordinary recursion. All borrowed residual scratch is
used synchronously; q coordinates surviving descendants are scalar locals.

## Complete E0-E2 inventory

Each row covers calls/dispatch, branches, dependent loads/stores, conversion,
allocation and scans relevant to that operation. An exact semantic operation
can be REQUIRED while its current realization remains a separate debt item.

| Site / repeated operation | Cost and disposition | Evidence / constraint / next question |
|---|---|---|
| `solveNode` control threshold and node counter | REQUIRED resource bound; scalar load/compare/increment | One threshold per entry, not clock/RPC. Counter means calls, including cache and exact closures, not expanded states. |
| `solveNode` prepared q derive/probe | REQUIRED exact reuse; dependent key -> hash -> slot -> full equality | Parent coordinates retained as scalars. No scratch/slot retained through recursion. |
| `prepareKey` pool check | REQUIRED ownership at prepared API boundary; possible UNVERIFIED-DEBT in already-owned recurrence | Removing public checks globally is forbidden; prior unchecked split did not qualify. |
| `gameplayKey` mirror construction/order | REMOVED needless reflection/comparison for asymmetric support under #97 | Support-first total order; symmetric support retains residual content tie. Action transporter must follow the same order; proof orientation does not. |
| `reflectedSupportCode` seven scalar fields | COSTED-OUT maintained mirror field (#74); current bit arithmetic REQUIRED for orbit choice | Do not reintroduce state maintenance without fresh transition+lookup economics. Direct bit permutation remains UNVERIFIED-DEBT. |
| `reflectClass` cache check | TRADEOFF memo against repeated term reflection | Immutable classes, pool-local ownership, terminal sentinel. Reflection miss scans active terms, fills scratch, interns exact content. |
| `reflectClass` dense scratch load before scan | UNVERIFIED-DEBT extra intermediate word traffic | Same fusion question as #100, independently measure reuse/profile; never alias `reflectBits` with intern scratch. |
| `compareClasses` ID fast equality / descending exact word scan | REQUIRED stable content order for symmetric support and proof signatures | IDs are not portable order. `wordAt -> slot.word` is two dependent indexed loads; extra memo is UNVERIFIED-DEBT. |
| `mix32`, `hashSignature`, `hashWords2`, `hashChunkTuple` | REQUIRED locator; UNVERIFIED-DEBT conversion chain #96 | Only bitwise consumers admit signed carriage. Uint32 class-hash strict equality needs explicit magnitude boundary. Hash never authorizes identity. |
| q `findPreparedSlotUnchecked`, get/set | REQUIRED collision probing/full triple; TRADEOFF 70% load factor | Linear probe and repeated store probe preserve descendant insertion correctness. Cached probe address is unsafe. |
| q capacity check before publication | REQUIRED sealed failure; COSTED-OUT hit-before-growth variant | No grow/rehash in sealed recursion. Reservation bounds entries before entry. |
| generic q `values` array | REQUIRED generic payload semantics; UNVERIFIED-DEBT ordinary WDL specialization #101 | Manager objects/public arbitrary values cannot be narrowed. Ordinary solver may own a separately qualified representation. |
| `assertExactValue`, `storeExact` validation/counters | REQUIRED fail-closed exact publication; UNVERIFIED-DEBT redundant validation at trusted caller | Existing public/custom cache can return invalid values. No narrowing without explicit owner boundary. |
| `nativeFrontierCode` status and bilateral exhaustion | REQUIRED first-win/exhaustion semantics | Scalar status, empty class; one-sided exhaustion is not draw. #98 needs terminal-entry census before adding earlier branch. |
| frontier own/opponent singleton masks | REQUIRED local exact closure; TRADEOFF cached metadata/playable masks | Two unsigned halves; zero/one/multiple only, no full popcount. Own win precedes opponent double threat. |
| `firstCell`, winner | REQUIRED scalar bit/status interpretation | Signed isolated bit + clz32 preserves high half offset. Existing generated-code evidence applies. |
| certificate/RBA/no-win dispatch in `solveNode` | UNVERIFIED-DEBT retained optional-consumer branches | Ordinary worker admits empty/null once; richer paths excluded. Specializing whole recurrence may cost code size; must preserve public contradiction checks. |
| forced-cell selection | REMOVED proof-facing validation for native provenance | Native code proves playable cell. Certificate origin remains checked; targeted trap protects separation. |
| `promotedColumn` center scan | REQUIRED advisory order; TRADEOFF early class-2 exit | Root scope from imported root ply; no sorting/child simulation. No WDL/bound inferred. |
| `singletonEffectClass`, `hasSingletonAt` | REQUIRED exposure veto/dedup; REMOVED repeated word loads #99; UNVERIFIED-DEBT repeated checked membership | Consecutive word reuse removes 25.47M dependent lookups on the control corpus and qualifies in serial/one/four workers. Physical-threat differential unchanged. |
| child loop legal fullness / minimizing/maximizing / cutoff | REQUIRED exact recurrence | Bounds come from exact no-win facts only. No alpha-beta/heuristic substitution. `sawMove` guard is possible trusted specialization debt. |
| recursive call / try-finally / undo | REQUIRED dependency and exact restoration | V8 supports optimized exception handling. Do not remove cleanup for stale folklore. No replay or clone per edge. |
| `applyUnchecked` own then blocker | REQUIRED residual evolution | Public terminal residuals remain observable; skipping blocker after win is not authorized merely by stopping semantics (#98). |
| play/undo support, heights, playable, ply/side/status/history | TRADEOFF cached derived scalars vs reconstruction | Minimal native history restores exact class/status; cached support occupancy and heights support public/guard APIs. Eliminating fields needs end-to-end owner proof, not only worker reads. |
| play/undo cell masks | REMOVED allocation/arithmetic by prepared immutable lookup | All 42 cells, unsigned bit31/high half covered. Two dependent mask loads remain; arithmetic alternative was qualified previously. |
| own/block `assertClass`, `assertCell`, `cacheIndex` | REQUIRED public validation; UNVERIFIED-DEBT repeated trusted checks | Previous unchecked experiment rejected; new stronger frontier provenance may admit a different specialization. |
| own/block transition prefix | TRADEOFF 64K prefix, 21 MiB/pool | Qualified against 4K/16K; outside-prefix recomputation remains a locality/retention tradeoff. No recursive cache growth. |
| own singleton and reduce-terminal checks | REQUIRED general API; UNVERIFIED-DEBT frontier-qualified nonterminal cofactor F-002 | Quiet/forced ordinary parent excludes own immediate win, but public replay/root witness does not. Do not remove checks globally. |
| own dense load/transform/reduced union/superset normalization | REQUIRED exact antichain; UNVERIFIED-DEBT intermediate `inputBits` pass #100 | Dense mover retained after branchy/lazy regression. Sparse supersets may affect arbitrary slots; blocker locality does not transfer. |
| blocker ten slots/masks/change tests | REQUIRED slot-local mask; UNVERIFIED-DEBT affected-slot traversal #100B | Must still prepare every chunk ID for tuple interning; list indirection may lose. |
| slot intern/equals/hash/ensureCapacity | REQUIRED exact immutable content; TRADEOFF chunk reuse | Scalar two-word stores; growth branches fail sealed. Hash-collision/full equality and width limits preserved. |
| class intern/equals/metadata/width checks | REQUIRED exact tuple; UNVERIFIED-DEBT repeated width predicates under reservation | Uint32 hash equality, ten IDs, preallocated singleton masks. Cold helper placement removes captured-context allocation. |
| singleton metadata projection | REMOVED scan under startup-proved ID/cell correspondence | Word1 mask is required because larger terms share the word. Vocabulary change must fail before execution. |
| scalar unsigned casts and bit extraction outside hash chain | UNVERIFIED-DEBT where only bits are observed | Do not mechanically change numeric comparison, public return or storage semantics. Generated-code evidence required for boxing claims. |
| `checkTaskControl` two Atomics, quantum, continuation stores | REQUIRED resource/liveness protocol; TRADEOFF 512-call cadence | Manager writes abort/needed, worker reads Atomics; precreated yield/retire symbols; continuation uses existing bytes, no object packaging before unwind. |
| control failure diagnostics | REQUIRED failure only | Error/stack allocation only on abnormal abort/capacity path; not evidence of ordinary per-node allocation. |

This closure includes scalar pool helpers `word`, `copyTo`, `bitIndex32`,
`referenceTypeFor`, `computeSingletonMasks`, `classEquals`, `cacheIndex`,
`assertClass`, `assertCell` and all prepared cache operations. Cold growth
helpers are reachable only through a failing sealed guard, not permitted hot
fallbacks. Public allocating default signature APIs are bypassed by supplied
scratch in recursion. No successful ordinary E0-E2 Promise, native/FFI/WASM
crossing, message transport, text construction, manager query or reporting
path is present. Allocation traps cover constructor/copy/iterator/string
regressions but do not prove absence of V8 boxing; keep those claims separate.

## E3 audit and critical-path uncertainty

Manager build/replay, q DAG Maps/Sets, parent reduction, `required()` traversal,
submission, continuation packaging and worker result objects remain E3 at the
qualified 64K/128K quanta. A future decision-frontier architecture reclassifies
them E2; moving the same objects to another file/process does not conform.

The manager's q DAG already preserves shared dependencies and exact completion;
private recursion still duplicates work. #78/#89-95/#102 address that uncertainty.
Prior sampled portable overlap is not measured saved subtree work. Extra active
cores are not a benefit unless root latency/useful work improves. Full memory
snapshots per worker result and executor pre-dispatch cloning remain E3 debt,
not free diagnostics. Source/task timing does not establish cache-hit provenance.

## Disposition and revisit

No known avoidable MUST violation is intentionally retained as conforming.
Suspected alternatives above remain visible UNVERIFIED-DEBT, not claims that
their current realization is necessary or optimal. Prior measured rejected
variants are COSTED-OUT only on their declared workloads/runtime.

Revisit on Node/V8 or platform changes, altered vocabulary/identity, added
consumer, changed task cadence, or new measurements. Keep protected comments.
Qualification results and issue dispositions are appended to
`benchmarks/isomax-workers/ISSUE-CAMPAIGN.md`; subsequent units inherit this
baseline and re-audit the affected causal neighborhood.
