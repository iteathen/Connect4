# Current hot-path method CPU assessment

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

Source reviewed: `3e56d8cb62028be0f232ec4d31d8b22cdb387ab3`.
Scope: the active online slot64 deep worker, its exact proof/semantic adapters,
and the shallow coordinator/task boundary. This supersedes the CPU observations
in the earlier hot-loop report for current source; historical measurements stay
attached to their original revisions. No production code changed in this review.

**The whole path is not CPU-minimal.** The immediate evaluator and several scalar
frontier operations are compact. Exact identity reconstruction, residual misses,
layered validation, interning and proof publication perform substantial work.
The representation still retains some equivalent neutral physical choices.

## Meaning of the assessments

- **Tight:** a compact implementation of this operation; no established local
  algorithmic waste. This is not proof of optimal generated machine code.
- **Partial:** optimized elements exist, with identifiable repeated/avoidable work.
- **Costly:** a substantial transformation, synchronization or reconstruction
  remains. Improving the representation/ownership can remove invocations.
- **Boundary:** setup, task dispatch, shallow orchestration or reporting; not
  charged once per deep node. CPU improvements may still matter at small tasks.
- **Inactive:** not in the selected production deep path; do not blame it for
  per-node cost merely because its source remains in the repository.

Potential improvements below are proposals, not accepted patches or measured
speedups. Retain exact equality, monotone proof publication, generation ownership,
transactional failure and fail-closed boundaries. Reduce repeated validation by
improving ownership and trusted internal contracts, not by masking invalid input.

## Local measurements

Node 26.7.0 Inspector CPU sampling, 1 ms requested interval. Each case had three
warmups and eight sampled cold searches; kernel/TT construction, explicit GC,
profile serialization and reporting were outside sampling. Cases: 4×5 with
65,536 and 4,096 TT entries; 4×6 with 65,536. All connect-4, response closure on,
prefix cache 4,096 classes, edge caching off, ETC off. All 24 profiled searches
returned exact draw. This is single-threaded, using the production shared-TT
adapter without competing workers. No standard-root solve ran.

The 4×6 case yielded 3,395 samples, about 98.6% beneath `searchNode`. The smaller
cases yielded only 314/365 samples and support broad observations, not fine ranks.
JIT inlining and sampling affect attribution. Self samples belong to the sampled
leaf; inclusive samples include callees and **overlap** across call chains.
Percentages are not per-call CPU costs, and the profile is not a JIT disassembly
or a contention measurement.
Standard geometry has a larger incidence/requirement vocabulary; these percentages
must not be extrapolated to its full solve or large worker state capacities.

| Method, 4×6 | Self samples | Inclusive samples |
|---|---:|---:|
| `slot64WriteTermIds` | 7.33% | 13.23% |
| `ownTransitionSlot64` | 5.66% | 13.78% |
| `slot64TermCount` | 4.77% | 6.07% |
| `stableDescriptorHandle` | 4.36% | 10.13% |
| `blockTransitionSlot64Direct` | 3.56% | 5.74% |
| `installDescriptor` | 2.71% | 15.20% |
| `hotStateDescriptor` | 1.86% | 12.96% |
| state-pool `intern` | 1.50% | 2.18% |
| `advanceInto` | 1.33% | 1.68% |
| `prepareMoves` | 0.85% | 3.39% |
| `valueAtStack` | 0.35% | 0.53% |
| `moverNoWin` | 0.12% | 0.38% |

Each 4×6 search made 123,525 calls / 55,646 expansions, built 190,971 transient
state descriptors, wrote canonical term sequences 241,118 times and counted terms
283,768 times. Descriptor-layer state/class object allocations and temporary
term-array materializations remained zero: **zero allocations did not mean zero
transformation work**. It wrote 891,130 term IDs through that layer.

Of 123,524 own transitions, 77,560 missed the cache, including 69,967 outside its
prefix. Of 123,524 block transitions, 83,012 missed, including 74,048 outside the
prefix. Parent chunk reuse still avoided over a million chunk re-interns.
These are direct counters, not inferred percentages of elapsed time.

Evidence: [profile and counters](evidence/2026-09-12-hot-methods/profile.json),
compressed raw Inspector profiles and `reproduce.mjs` in the same directory.
Run the reproducer from repository root with Node `--expose-gc`; its output
directory is the existing sibling `frontier-audit-results`.

## Deep exact policy — `quotient-negamax-engine.mjs`

| Method | Assessment | Current work and possible improvement |
|---|---|---|
| `searchNode` | Partial | Scalar windows/signs, recursive unresolved decisions, iterative forced chains, typed stacks, no Promise/RPC per deep node. Still performs identity/proof work before tactical closure on every visit and branches over physical columns. Primary improvement is fewer distinct relational decisions/repeated proofs. Reordering closure and TT access requires preserving contradiction detection. |
| `search`, `solveState`, `solveRoot` | Boundary | Validate requested window/seed and enter deep search. Root threshold/full-window policy changes need matched evidence; not a loop micro-optimization. |
| `initializeFrontier` | Boundary | Copy initial seed once per requested search and obtain rank. Reuse already-owned seed storage where lifetime permits. |
| `prepareMoves` | Tight/Partial | Preallocated typed insertion order over at most seven moves; no object sort in deep search. It separately checks legality and obtains landing, scores each physical choice, then shifts entries. A canonical action/landing interface could eliminate duplicate lookups and equivalent neutral choices. |
| `frontierComesBefore` | Tight | Scalar score, equal-score proof hint, then column tie. No established reason to replace the arithmetic. |
| `legalProofHint` | Partial | Validates hint legality using another landing lookup. Reuse the same legal-action description; hint remains advisory. |
| `createLegalAccess` returned `legalAt` | Partial | Checks column then calls an adapter that checks it again and obtains a landing. Consolidate at the owning action boundary. |
| `landingForLegalMove`, `advanceFrontier` | Partial | Reacquire landing after move ordering and transition already acquired it. Carry the owner-produced landing through the operation rather than reconstruct it. |
| engine `transition`, `checkedTransition`, `requireLegalTransition`, `assertTransitionResult`, `assertRank` | Partial | Multiple wrapper/result checks; parent/child ranks are reloaded after the kernel advances support. A single checked owner transition can expose the established rank/landing facts. Preserve rank-increasing failure controls. |
| proof access `probe`, `ensure` | Partial | Stable local state IDs, delayed admission. Probe still resolves shared identity each node; parent publication often needs a new descriptor resolution. Improve adapter-owned binding reuse. |
| proof access `read` | Partial | One reusable three-scalar snapshot replaced three separate proof loads. Revalidates interval/hint already checked below. Consolidate coherent record ownership. |
| proof access `upper` | Inactive here | Used by ETC child probing; ETC is disabled in the production root. Enabling it adds child transitions/probes and is not a default CPU win. |
| `frontierBoundsFor`, `applyFrontierBoundCode` | Tight/Partial | Mutate existing scratch, scalar interval intersection and contradiction detection. No old tuple allocation. Repeated target/interval checks can be consolidated inside a sound owner contract. |
| `classifyBoundReturn` | Tight | Scalar telemetry classification. Reduce telemetry frequency only with explicit accounting changes. |
| `publishResult` | Tight | Scalar fail-low/fail-high/exact classification. The downstream publication path is the material cost. |
| proof access `publishExact`, `publishLower`, `publishUpper`, `assertPublication`, `assertKey` | Partial | Forward scalar publications with duplicated validation and possible identity admission. Keep classification; remove redundant boundary traversals only through ownership refactoring. |
| `assertFrontierScore` | Tight | Integer/range check; diagnostic formatting is on failure. Not a priority beside materialization. |

## Online adapter — `quotient-online-semantic-search-lib.mjs`

| Method | Assessment | Current work and possible improvement |
|---|---|---|
| `proofKey`, `probeHandle` | Costly | Probe exact shared content on each node; this path does not reuse the previous node's lookup just because a local state ID is stable. Adapter-owned bounded generation bindings could avoid repeated descriptor work. |
| `descriptor` | Partial | State validation plus hot descriptor construction; no retained second descriptor arena. Avoid repeated calls through valid binding reuse. |
| `rememberHandle` | Tight/Partial | One cached state/handle, scalar assignments and repeated checks. Cache size one loses the parent binding during descent; any larger cache stays adapter-owned and generation-checked. |
| `ensureProofKey`, `ensureHandle`, `currentHandle` | Costly | Cached current handle is cheap, otherwise descriptor reconstruction and bucket-locked ensure. On 4×6: 67,446 ensures for 67,446 publications. Scoped/bounded binding reuse is a candidate, not permission for the engine to own generation handles. |
| `readBound` | Partial | Uses current binding, loads record and rechecks generation; retries on staleness. Coherent safety is correct. Fuse redundant checks within the same owner, not across an unprotected replacement interval. |
| adapter `readInto` | Partial | One shared record then three scalar decodes into caller scratch. Stable cached READY case still has 11 atomic loads through precheck/load/postcheck, excluding initial TT lookup; old three-field path could require 33. |
| adapter `lower`, `upper`, `bestMove`, `isCurrent` | Conditional | Individual access repeats resolution/coherence work. Main deep loop uses `readInto`; individual upper is used by ETC. Do not accidentally revert to three individual reads. |
| `publishCurrent` and adapter `publishExact/Lower/Upper/Hint` | Partial/Costly | Reuses method references (old per-publication callback allocation removed), retries generation-stale publication. Identity admission/locking remains synchronous. |
| adapter `rankAt`, `isLegal`, `landingCellAt`, `transition`, `tacticalCode`, `frontierBoundCode` | Partial | Useful public fail-closed boundaries, but validated arguments/results are checked again above and below. Seal ownership and use one checked operation per fact; keep malformed-input controls. |
| `assertStateId`, `assertColumn`, `assertHandle` | Partial | Scalar checks, but state count/class bounds are repeatedly inspected. Potential comes from fewer crossings, not disabling validation globally. |

## Semantic descriptor and hash — `quotient-local-semantic-descriptor.mjs`, `quotient-semantic-identity.mjs`

| Method | Assessment | Current work and possible improvement |
|---|---|---|
| `hotStateDescriptor` | Costly | Reuses an object, but reads fields, ensures class metadata, recombines six hash stages and updates counters on every call. Reduce calls via canonical relation/binding reuse. |
| `readStateParts` | Partial | Repeated state/class checks and metadata access; no old temporary parts object. One owned state view can avoid traversing the same layers. |
| `ensureClassMetadata` | Partial | Memoizes class length/hash; first encounter counts, writes, hashes all terms. Repeated cache hits still validate and check capacity. Metadata could be produced once by canonical class ownership. |
| descriptor `termCount` | Costly underneath | Calls canonical pool's full count scan even though class content is immutable. Move count production to the canonical owner and consume it; avoid duplicate metadata owners. |
| `writeClassTerms`, `termSource.writeTermIds` | Costly | Exact direct write avoids temporary term arrays, but repeats count/length/target checks and walks all terms for TT matches/installs. Compare or publish canonical content directly where the shared contract permits it. |
| `hashResidualTermIds`, `foldTermIds` | Partial | Hash immutable class content once, with two passes for two lanes. A fused two-lane traversal can reduce scans; moving hash production into canonical interning may remove a later traversal. Measure memory and maintenance costs. |
| `hashSemanticQuotientDescriptorPartsUnchecked`, `mix32` | Tight/Partial | Scalar Math.imul/shift mixing, no allocation with provided scratch. Recombination frequency is the larger issue; hash remains only a prefilter. |
| `writeHash` | Partial | Reusable target but runtime object/frozen/assignment checks. An internal typed/owned result contract could avoid repeated shape checks. |
| `semanticQuotientP0Length`, `semanticQuotientP1Length` | Partial | Dispatch between materialized and class-reference formats and validate on each use. Bind the active descriptor contract once, preserving public format validation. |
| `writeSemanticQuotientTermIds` | Costly underneath | Validates descriptor lengths/format, dispatches writes for both classes. Remove intermediate sequence reconstruction through an exact shared-content contract, never hash-only equality. |
| descriptor `assertStateId`, `assertClassId`; identity `assertUint16Length`, `assertTermIds`, `assertClassId` | Partial | Repeated small checks add sampled cost in aggregate. Make the owning path establish each fact once; exported APIs remain strict. |
| descriptor `ensureClassCapacity`, `nextPowerOfTwo`, `refreshRetainedBytes` | Occasional costly | Allocate/copy metadata on capacity growth. Improve class/state population first; segmented storage is a measured locality/allocation tradeoff. |
| `stateDescriptor`, `classDescriptor`, materialized descriptor constructors | Inactive here | Allocating public/diagnostic forms; active access uses `hotStateDescriptor`. No reason to charge their object allocations to every node. |

## Shared semantic TT — `quotient-semantic-shared-tt.mjs`

| Method | Assessment | Current work and possible improvement |
|---|---|---|
| `probe` | Costly | Up to eight lanes, lifecycle reads, hash prefilters, exact equality. Adapter binding reuse can avoid many probes; bucket policy needs measured collision/replacement economics. |
| `bucketBase`, `encodeHandle` | Tight | Numeric index/handle arithmetic and safety checks. No per-handle object. Preserve safe integer/generation domains. |
| `assertDescriptor` | Partial | No previous temporary validation tuple arrays, but repeated descriptor-format checks. Bind the active contract at construction where possible. |
| `stableDescriptorHandle` | Costly | Generation/status reads before and after exact equality. Needed coherence; avoid invoking it through repeated identity reconstruction. |
| `descriptorEquals` | Costly | Cheap support/length prefilters, then materializes exact terms and compares them. Direct canonical-content comparison is a major structural opportunity. |
| `materializeDescriptorTerms`, `ensureDescriptorTermScratch` | Costly/Partial | Reuse growing scratch, but write whole term sequence before comparison. No temporary term array allocation; still repeated CPU/memory traffic. |
| `termsEqual` | Partial | Short-circuit scalar comparison across linked chunks. Could stream from canonical source or compare an agreed compact exact representation. Local class IDs/hashes are insufficient. |
| `ensure` | Costly | Locks bucket before scanning even for an existing descriptor, then may select/rewrite a victim. Fewer admissions/re-ensures, better binding reuse and lower churn are priorities. |
| `acquireBucket`, `releaseBucket` | Costly under contention | CAS plus synchronous `Atomics.wait(...,1)` retries; release stores/notifies. No contention measured here. Nonblocking ownership redesign must preserve installation lifetime and bounded resource behavior. |
| `chooseVictim` | Partial | Bounded scan prefers non-exact records, using modulo/status/proof reads. Better retention can avoid whole future solves; cheaper arithmetic alone may be irrelevant. |
| `installDescriptor` | Costly | Materialize, allocate/grow/reuse slot chunks, copy payload, update counters/metadata, publish generation. Reuse fixes memory lifetime, not repeated work. Reduce reinstalls or change exact canonical storage. |
| `writeDescriptorTerms` | Partial | Scalar copy through chunk chain. Chunk spans could enable bulk/streamed writes; preserve partial-install poisoning and exact payload. |
| `allocateTerms`, `allocateTermChunk` | Occasional costly | CAS cursor, linked chunk header creation and several global counters. Reduce allocation frequency and header/fragmentation costs with truthful resource accounting. |
| `chunkNext`, `setChunkNext`, `chunkCapacity` | Partial | Small header operations with range checks at each link. Prefer fewer links/checks within a validated owned span. |
| `addSharedCounter`, `incrementSharedCounter` | Partial | CAS loops even for some telemetry counters. Separate correctness/resource counters from telemetry; only the latter is eligible for bounded aggregation/asynchronous reporting. |
| `nextGeneration` | Tight | Checked atomic generation increment. Required anti-aliasing, not a target for weakening. |
| `poisonInstall` | Failure path | Cold safety action; preserve it. |

## Packed proof records — `quotient-packed-proof-store.mjs`, `quotient-negamax-search-record.mjs`

| Method | Assessment | Current work and possible improvement |
|---|---|---|
| semantic `decode` | Tight/Partial | Safe numeric generation decode and slot modulo; old handle object removed. Scoped binding reuse can reduce repetitions. |
| semantic `isCurrent` | Tight locally | Three atomic lifecycle reads to establish current generation. Consolidate with read only inside an equivalent coherent owner operation. |
| semantic `load` / public `readRecord` | Partial | One atomic byte with generation/status coherence; **does not wait for PROOF_WRITING**. The surrounding duplicated pre/post checks are an improvement seam. |
| semantic `update` | Costly under contention | Acquires PROOF_WRITING by CAS; synchronous wait if another writer holds it; always releases/notifies even if record unchanged. Consider a qualified same-generation no-op fast path or nonblocking publication design. Never drop proven results. |
| packed `publishExact`, `publishLower`, `publishUpper`, `publishHint`, `assertHint` | Partial | Strict scalar value/hint validation then update; no transform closures. Repeated checks can be combined inside the owner. |
| `transformRecord` | Partial | Numeric interval/hint transform, but repeated record checks through helpers. Decode/check once internally and preserve exact replacement semantics. |
| `readInto`, `lower`, `upper`, `bestMove` | Partial | Cheap bit extraction after storage load; individual methods repeat storage work. Use coherent combined access on the deep path. |
| `proofLower`, `proofUpper`, `bestMoveHint`, `assertSearchRecord` | Partial | Shift/mask arithmetic is tight; each accessor revalidates the entire record. One validated decode can return all fields in existing scratch. |
| `withProofBounds`, `withBestMoveHint`, `assertProofValue`, `assertBestMove` | Partial | Bit packing with layered validation. Tight internal transform possible with a strict public boundary. |
| `staleRead`, `stalePublication` | Tight exceptional | Counter plus unknown/null result. Adapter retry preserves authority; do not pretend stale is a valid current proof. |
| static proof-store `load/update/reset`, `withProofLower/Upper`, `exactProofRecord` | Inactive in this deep path | Other adapters/helpers exist; semantic shared store and `transformRecord` are selected here. |

## Support/state kernel — `quotient-native-negamax-support-layout-kernel.mjs`

| Method | Assessment | Current work and possible improvement |
|---|---|---|
| packed `rankAt` | Tight | Table word, shift/mask. Coordinate decoding happened at setup. Reduce repeated calls through owner-produced facts. |
| packed `landingAt` | Tight/Partial | Decode height, full-column test, address arithmetic. Repeated independently for legality, tactical scan, scoring, transition and frontier update. Reuse a single action descriptor. |
| packed `childAt` | Tight | Full-column check and radix-weight addition. Incremental relation should preserve this legality fact without duplicate lookups. |
| packed `hasEvenColumnRemainders` | Tight | One precompiled parity mask comparison; geometry-dependent setup handles odd/even heights. This checks one response profile's resources, not all CPC strategic terminality. |
| substrate `supportIndexAt`, `assertStateId`, `assertSupportIndex`, `assertSupportColumn` | Partial | Small checked accessors invoked repeatedly through layers. Improve encapsulated ownership, not global unchecked access. |
| `advance` | Costly as composition | Calls edge accessor, obtains landing/rank, applies two residual transforms, advances support, interns child, calls edge setter. Carries no coloured board. A canonical event/action can eliminate repeated physical-coordinate work and equivalent choices. |
| `tacticalCode` | Tight/Partial | Cached singleton intersections and legal landing scan; immediate win now returns immediately. Could consume a maintained legal-frontier mask instead of rediscovering landings. Preserve mover-win precedence; full CPC/NDC closure remains incomplete. |
| state `intern`, `hashStateTriple` | Partial | Exact numeric triple equality and open-address table. Load-factor growth check precedes lookup, so a hit can trigger a rehash; deferring growth until confirmed insertion is a candidate. Stored hash removal was a memory/CPU tradeoff, not speedup. Bigger gain is canonicalizing proven-equivalent future relations. |
| state `edgeAt`, `setEdge`, `#assertEdgeAddress` | Partial | Validate even when edge caching is disabled. Select an owned no-cache transition path at construction; retain public malformed-edge rejection. |
| state `#assertClass` and intern input checks | Partial | Multiple validations before probing. Single semantic owner could establish immutable class references once. |
| state `_ensureStateCapacity`, `_growHash`, `nextPowerOfTwo` | Occasional costly | Allocate/copy power-of-two arrays; recompute hashes on rehash. Population reduction is primary; different growth granularity needs peak-memory/locality evidence. |
| `normalizePairs`, `pairSubsetOf`, `hashPairSequence`, legacy residual methods | Inactive | Used in old/bootstrap representation, then replaced by installed slot64 residual methods. Their Array/map/sort work is not current per-transition cost. |
| table support alternative, geometry/vocabulary construction, `stateView`/`classTerms` | Inactive/Boundary | Packed profile selected; inspection/materialization APIs are not deep-loop calls. |

## Canonical residual owner — `quotient-slot64-residual-pool-v2.mjs`

| Method | Assessment | Current work and possible improvement |
|---|---|---|
| `isEmpty` | Tight | Validated canonical empty ID comparison. Bilateral exhaustion closes filler regions without search. |
| `hasSingletonAt` | Tight | Two cached mask intersections; no line scan or temporary tuple. Reuse one validated class/landing context if reducing calls. |
| `ownTransitionSlot64` | Costly on misses | Cache hit cheap; miss loads 20 words, reduces affected terms, normalizes strict supersets, interns. 56.6% of all 4×6 own calls were outside the cached prefix. Incremental affected-slot/event relations or measured bounded transition caching can remove recomputation. |
| `blockTransitionSlot64Direct` | Partial | Filters only potentially affected chunks and reuses unchanged chunk IDs; no full temp class scan/materialization. Still loops ten slots and interns changed results; compiled affected-slot lists are a candidate. |
| `cacheGet`, `cacheSet` | Partial | Direct prefix table with repeated class/cell checks. Out-of-prefix work is deliberately uncached; choosing more useful bounded entries requires measurements, not unrestricted growth. |
| `loadClassBits` | Partial | Copies all ten chunk pairs through checked `copyTo` calls. An affected-chunk transition can avoid loading untouched data. |
| `internBits` | Partial | Parent-chunk reuse is effective; still visits ten slots, hashes tuple and probes. Structural transition results or propagated changed-slot masks could bypass unchanged comparisons. |
| `classEquals`, `hashChunkTuple` | Tight/Partial | Exact ten-ID tuple and scalar hash. Reduce how often they are needed through canonical relation reuse. |
| `computeSingletonMasks` | Partial | Cached once at new class creation, but scans 20 words and singleton terms. Maintain from transition effects if cheaper with one canonical owner. Blocking already updates singleton masks directly. |
| `slot64TermCount` | Costly by repetition | Twenty popcounts on immutable class content, repeated 283,768 times per sampled 4×6 solve. Store/maintain count in canonical class metadata and remove redundant count ownership above if justified. |
| `slot64WriteTermIds` | Costly | First recounts terms, then walks chunks and bits to write sorted IDs; 241,118 writes per solve. A trusted capacity contract can avoid recounting; direct canonical-content TT comparison can avoid the whole conversion. |
| `everyTermInMask` | Tight/Partial | Short-circuit 20-word inclusion test on canonical chunks. A canonical cached predicate could eliminate scans, but measured share is small and extra metadata has a cost. |
| chunk-pool `equals`, `intern`, `copyTo`, `_assertId`, `assertWordSource` | Partial | Compact two-word exact dictionary with multiple checks per operation. Batch owned chunk access or compiled transition reuse could reduce calls; no object-key dictionary in the hot path. |
| `bitIndex32`, `popcount32`, `hashWords2`, `mix32` | Tight | Scalar bit operations / Math.clz32 / Math.imul. Prefer eliminating traversals to replacing these primitives by intuition. JIT-generated machine code was not disassembled. |
| `assertClassId`, `assertCell`, `assertCellBits`, `assertBits`, `assertMask` | Partial | Strict scalar/shape checks; old mask tuples and exponentiation removed. Repeated checks on the same owned values remain. |
| `ensureReferenceWidth`, `ensureClassCapacity`, `growClassHash`, chunk `_ensureCapacity/_growHash`, `referenceTypeFor`, `nextPowerOfTwo` | Occasional costly | Widen/copy/grow/re-hash typed storage. Mixed reference widths may affect JIT specialization; no deoptimization attribution was established. Preserve stable IDs and transactional publication. |
| `termIds`, `terms`, `memoryStats` | Boundary | Allocating inspection/telemetry paths. TT hot materialization uses direct writes instead of these temporary arrays. |

## Evaluation and compiled response closure

| Method | Assessment | Current work and possible improvement |
|---|---|---|
| `valueAtStack` | Tight | Incidence AND/popcount over live-line words, geometry-driven; about 0.53% inclusive in sampled 4×6. Reuse scores/landing facts only when relation updates establish validity. Eval policy stays unchanged. |
| `advanceInto` | Tight/Partial | Updates existing typed stack: copy live-line words, clear opponent incident lines. It checks general overlap/shape each call despite the deep stack using known disjoint rank slices. A bound internal stack contract could simplify this; immutable input semantics stay intact. |
| `assertPlayer`, `assertCell`, `assertWordRange` | Partial | Public boundary checks recur for every score/update. Validate a stack/action capability once and preserve strict external APIs. |
| `popcount32` | Tight | Small integer arithmetic; no proven need to replace it. |
| `valueAtSeed`, `advanceSeed`, `createRootSeed` | Boundary | Used during shallow coordination/path replay. `advanceSeed` allocates a new typed seed; use owned reusable/persistent frontier storage with correct asynchronous lifetimes. |
| `orderLegal` | Inactive in deep worker | Allocates scored objects and sorts for callers such as qualification; deep search uses typed `prepareMoves`. |
| response `moverNoWin` | Tight for its scope | Packed resource-mask predicate plus canonical coverage test. About 0.38% inclusive here. This implements one jointly executable adjacent-response profile, not complete CPC/NDC. |
| slot64 kernel `frontierBoundCode` | Partial | Loads both classes, emptiness and response coverage. Could expose cached class facts coherently; strategic strengthening requires a proved relation, not more arbitrary guards. |

Domain-contract helpers `assertInteger`, `assertWdlValue`, `assertWdlInterval`,
`assertTacticalColumns`, `assertTacticalCode`, `assertProofReadTarget`,
`tacticalImmediateColumn` and `tacticalForcedColumn` are compact scalar checks or
decodes. Their arithmetic is tight; repeated invocation at several layers is
partial optimization. `assertSearchWindow`/`assertFrontierSeed` primarily validate
entry/shallow contexts. Factories, `assertPort`, `assertFrontierOrder`, arena/domain
validation, geometry construction and bootstrapping are setup, not per-node work.

## Shallow coordinator, worker/task boundary and reporting

These are on the production execution path but not the synchronous deep-node loop.
Their methods were reviewed from source; the deep-worker profile does not rank them.

| Method/path | Assessment | Current work and possible improvement |
|---|---|---|
| coordinator `transition`, `assertStateId`, `assertTransitionTarget` | Boundary/Partial | Representative-path Map lookup plus frozen path copy for newly discovered states. Canonical task relation + boundary witness mapping can reduce replay/copy cost. |
| coordinator `estimate`, `memoSet`, `priorityAt` callback | Boundary/Partial | String keys, Map memo and optional recursive probe. Root probe depth zero mostly returns unit priority; meaningful cost differentiation is unestablished there. |
| dependency `search`, `runLeaf` | Boundary/Partial | Async preferred-child/scout policy; promises per shallow obligation, not per deep node. Initial one-task supply remains limiting. Exact dependency publication and work coalescing need measurement. |
| dependency `orderedMoves`, `nextFrontierSeed`, `rankFor`, `landingForLegalMove`, `transition`, `publishResult` | Boundary/Partial | Object arrays/sort/map, typed seed allocation and repeated checked coordinates. Owned numeric frames could reduce overhead; async branches cannot borrow overwritten scratch. |
| dependency `trackDetached`, `drainBackground`, scout handlers / `Promise.race` | Boundary/Partial | Sets/Maps/continuations and repeated race subscriptions. A completion queue is a candidate; preserve all error/obsolete-work ownership and exact dependency semantics. |
| executor `submit` | Boundary/Partial | Synchronous structuredClone to capture payload, Promise/pending entry, then worker postMessage clones again. A strictly owned numeric task payload could remove duplicate serialization. |
| executor `reorderQueue`, `pump`, `dispatchAuthoritative`, `nextId` | Boundary/Partial | Sort before each dispatch; Array.shift idle/task queues; checked ID and message construction. Heap/ring queues can help if queue volume warrants them. They do not fix missing dependency-ready work. |
| executor `settleWorker`, `observeWorkerResources`, `counter` | Boundary/Partial | Validate completed result, update many resource counters, resolve task and dispatch next. Keep exact-result validation; move bulky reporting/aggregation off scheduling-critical work where possible. |
| worker `snapshotMetrics`, `deltaMetrics`, `localResourceSnapshot`, message handler | Boundary/Partial | Per-task metric objects, Object.entries and process.memoryUsage; synchronous search inside worker. Emit bounded task-boundary data and aggregate asynchronously. No console reporting inside deep recursion. |
| `replayPath`, `searchPath`, `solvePath` | Boundary/Partial | Replays structural transitions and creates frontier seeds from root once per task. Repeated histories can be redundant even without bitboard reconstruction; canonical work identity with a boundary witness is the direction. |
| executor `trackSideEffect`, `notifyDrained`, `isDrained`, `drain` | Boundary | Queued completion/lifecycle promises, not polling the deep search. Keep quiescence semantics; a queue may simplify bookkeeping but is not automatically faster. |
| executor failure/close paths: `poison`, `failActiveWorker`, `rejectPendingTask`, `abandonHintOnce`, `asError`, `detachListeners`, `close` | Cold/failure | Safety work, not ordinary per-node CPU targets. Preserve failure poisoning and deterministic cleanup. |
| Branch Manager `seedExploreSession`, `refillExploreReservoir`, candidate normalization/dedup, `enqueueExploreHint`, `dispatchExplore`, completion/abandonment | Inactive in root | Bounded campaign qualifies them; root disables exploration and omits wiring. Enabling unused work is not a CPU optimization by itself. |
| `progressSnapshot`, timer callback, JSON.stringify / console.error | Boundary/Not minimized | Timer lives outside worker recursion, but snapshot building and JSON formatting are synchronous on the coordinator thread; console sink may block depending on destination. Timer scheduling does not make serialization asynchronous. Move formatting/output to a bounded reporting owner with coarse numeric snapshots. |
| `stats`, memory accounting, setup/reset/cleanup | Boundary | Snapshot allocation and retained-array scans. Avoid requesting on every node; do not defer resource checks that establish exact lifecycle authority. |

## Priority decision

1. Reduce distinctions and transformations through canonical event/residual
   relations: neutral capacity/action equivalence, repeated identity materialization,
   out-of-prefix transition work. These remove operations rather than just trim them.
2. Reduce repeated term counting/writing and adapter binding resolution while
   retaining one canonical semantic owner and exact shared comparison.
3. Consolidate landing/rank/record validation and access inside sound owned ports.
4. Measure concurrent proof overlap, replacement and lock waits; the single-thread
   profile cannot establish their full-root contribution.
5. Move reporting format/output off the coordinator and assess shallow queue/frame
   costs after the useful-work supply is established.

No new per-node promises, RPC, graph census, strings/Maps for canonicalization,
coloured-board reconstruction, hash-only proofs, or unproved parity pruning were
introduced. Tight arithmetic does not establish complete structural closure.
The proposed replacement LEGO should be judged on its maintained relation and
removed work, then bounded exactness/resource qualification and total CPU cost.
