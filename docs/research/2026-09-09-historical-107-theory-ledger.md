# Historical 107-candidate theoretical ledger

**Date:** 2026-09-09  
**Status:** research theory/evidence synthesis; maintained source and `main` unchanged.  
**Method:** `2026-09-09-categorical-reasoning-calibration.md`.

This ledger applies sharpened categorical reasoning to every item in the preserved 107-item historical inventory. It deliberately does **not** turn the columns into one score. A failed implementation form is kept distinct from the broader mechanism it attempted to test.

## Legend

Projected effectiveness is a **metric vector**, not a grade:

- `T` = time-to-proof / wall time
- `N` = node/proof-work effect
- `M` = memory/locality effect
- `P` = parallelism effect

Symbols apply only to the named metric: `++` strong positive expected, `+` positive, `0` neutral, `-` negative, `--` strong negative, `R` regime-dependent, `?` insufficient theory/evidence.

`Confidence` is confidence in the projection, not effectiveness magnitude.

`Compatibility` describes relation to the current residual/fixed-width/decision-state core:

- `native` — naturally fits;
- `co-design` — compatible but shares a representation/resource contract;
- `peripheral` — outside the core hot state, can coexist;
- `conflicting-form` — the tested/literal form violates current hot/core principles;
- `substitutive` — alternative realization rather than additive feature.

`Leverage` records breadth only: `single`, `dual`, `multi`, `platform/control`. It is not merit.

---

# Representation and cache access — 1 to 16

| ID | Candidate | Projected effectiveness | Confidence | Measured / code evidence | Core compatibility | Important directional synergy / overlap | Leverage | Form / correctness risk | Sharpened theoretical assessment |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | BigInt state | T:--, N:0, M:- | very high | BigInt+Map exact path ~0.416M nodes/s before Map failure; fixed two-word arithmetic ~9.5-10M/s | conflicting-form hot; native cold/reference | `FW -> replaces hot BigInt`; useful as independent oracle representation | single/control | low semantic, extreme hot cost | Exclude from recursive specialized 7x6 state. Retain for cold constants, independent checks, tooling where conversion cost is amortized. |
| 2 | V8 Map TT | T:--, N:+ possible, M:-- | very high | hit 2^24 Map entry ceiling; ~1.04GiB RSS and ~0.416M/s path | conflicting-form hot | fixed typed TT substitutes; coarse proof directory is a different lower-frequency candidate | single | high capacity/allocation risk | Reject per-node Map TT. Do not transfer this negative to a bounded coarse task/proof directory. |
| 3 | Two-word fixed state | T:++, N:0, M:+ | very high | ~9.47-9.99M/s single-thread arithmetic; same sandbox C ~9.03M/s | native | `FW <-> CTT/RANK/RWS-native` | platform | low-medium packing risk | Strong execution substrate. Exact word split may change, but fixed-width scalar state is effectively established. |
| 4 | Direct-mapped TT | T:+/R, N:R, M:+ | high | consistently beat tested 2/4-way forms in V8; simple local probes fastest | native | `CTT -> direct map` lowers entry cost; `RANK -> direct map` removes impossible collisions | dual | collision sensitivity | Keep as strongest simple baseline. Do not infer universal optimality after key density/canonicalization changes. |
| 5 | keyLo -> keyHi -> payload probe | T:+ small, N:0, M:+ | high for full-key form | ~6.784M/s vs ~6.624M/s prior value-first family; ~75.6% rejected on keyLo in sample | substitutive with CTT | `CTT` may eliminate second key load entirely | single | low | Good full-key short-circuit ordering, but likely superseded by exact compact-key validation rather than a permanent architecture fact. |
| 6 | Two-way association | T:-/R, N:+ possible, M:- | medium-high | tested 2-way reduced some nodes but lost elapsed | co-design | could revive only if CTT density makes retained collisions unusually valuable | single | extra probes/cache lines | Current prior negative. Re-test only after causal trigger: measured collision cost at equal bytes. |
| 7 | Four-way direct | T:--/R, N:+ possible, M:-- | high current form | ~3.62M/s family vs ~6.78M/s simple direct | co-design | overlaps direct map/replacement; CTT may alter trade | single | high probe traffic | Strong negative for V8 hot kernel absent radically different packed/vector access. |
| 8 | Four-way/tagged | T:--/R, N:+ possible, M:- | high current form | ~3.83M/s family; short tag cannot authorize exact proof | co-design / correctness tension | probabilistic tag may reject only; exact CTT substitutes for identity | single | false-hit severity critical | Reject tag-as-authority. A tag-only rejection prefilter remains theoretically possible but presently unjustified. |
| 9 | 32K physical slabs | T:+/R, M:+ | high | chunk sweep peak around 32K entries; compact entry changes bytes per slab | native physical layer | `CTT -> changes slab bytes`; `RANK/CAP -> compose slabs` | dual | low | Preserve as allocation/locality granule candidate, not semantic family capacity. Re-derive in bytes. |
| 10 | One family per 32K chunk | T:--, N:-, M:- stranded | high | underused total arena; fairer nested-32 tests badly worse | conflicting-form | multi-slab + fallback substitutes | single | capacity starvation | Reject literal one-family/one-slab policy. Logical families may span multiple slabs. |
| 11 | Larger flat is always better | T:- as universal rule, N:+ | very high | larger tables often reduced nodes after wall-time knee and got slower | conflicting-form as rule | `CAP` directly replaces universal rule | control | low | Falsified. Capacity is a resource variable; optimize time-to-proof, not hit/node count alone. |
| 12 | Dynamic active capacity | T:+/R, N:R, M:+ | high mechanism; medium selector | multiple workload-dependent knees | native coarse policy | strong with CTT, RANK, STT, worker count | multi | selector noise/lock-in | High-priority coarse-boundary policy. Prefer simple bands/calibration before online controller. |
| 13 | Worker-local TTs | T:-, N:-- under overlap, M:R | high local-only | shared equal-capacity tests cut nodes ~25-39% and wall ~20-40% | peripheral/substitutive | immutable shared-read + local-write is separate hybrid | single | duplicate proof work | Reject local-only as default multicore proof memory. Retain as control or niche private-write layer if sharing cost forces it. |
| 14 | One global shared TT | T:++/R, N:++, P:+ | high | strong equal-capacity cross-worker hit/node/time gains | native/co-design concurrency | CTT, CAP, YBWC strongly positive | multi | publication correctness critical | Strong multicore candidate; `global visibility` does not require one replacement pool or per-node atomics. |
| 15 | Seqlock-style publication | T:R, N:0, P:+ possible | medium-low correctness | inherited research scheme returns correct tested scores but no full ECMAScript interleaving proof | co-design | CTT lowers payload; coarse write ownership/atomic payload are substitutes | single | **critical** torn/stale-hit risk | Treat as unresolved publication form, not accepted architecture. Exact identity proof is separate from publication coherence. |
| 16 | False misses allowed, false hits forbidden | T:+ through simpler synchronization, N:R | very high | governing exact-cache principle throughout prototypes | native invariant | enables conservative retirement/publication; constrains CTT/STT | platform/correctness | critical if violated | Near-certain invariant. Miss/recompute is acceptable; any unvalidated stale/colliding proof is not. |

# Parallel execution and workers — 17 to 27

| ID | Candidate | Projected effectiveness | Confidence | Measured / code evidence | Compatibility | Synergy / overlap | Leverage | Risk | Assessment |
|---:|---|---|---|---|---|---|---|---|---|
| 17 | Independent worker scaling | P:++, T:+ capacity control, N:-- duplicate if solving same proof | very high | raw 1/2/3/4 workers ~8.81/13.74/20.77/30.17M/s; one 33.27M/s | peripheral control | tells YBWC/CAP available compute, does not solve proof partition | control | benchmark misinterpretation | Keep as machine-capacity control, never as proof-speedup evidence by itself. |
| 18 | Naive root splitting | T:0/-, N:- | high | dominant root child ~1.57M nodes while six siblings near-trivial; 1-4 workers ~same wall | conflicting-form | YBWC/coarse recursive split substitutes | single | critical-path imbalance | Reject static root-only split for general solver. |
| 19 | Lazy YBWC/Jamboree | T:+/R, N:- speculative, P:+ | medium-high | meaningful wall wins on heavy roots with extra nodes; depth/width sensitive | peripheral/native scheduler | STT, MHINT, proof-cost signals amplify | single/dual | speculative work | Strong parallel candidate with bounded null-window speculation; dynamic split location required. |
| 20 | Unlimited speculation | T:-- likely, N:--, P:R | high | launching too many younger siblings materially inflated work; deeper split worsened | conflicting-form | bounded YBWC substitutes | single | exponential wasted work | Reject universal wide speculation. Idle cores are not proof of profitable work. |
| 21 | Two lanes | T:+/R, P:+/R | medium | two speculative lanes strongest in some sandbox regimes; three/four sometimes unprofitable despite raw capacity | peripheral | CAP/worker selector subsumes fixed lane count | single | regime sensitivity | Keep as one calibrated operating point, not architectural constant. |
| 22 | Shallow parallel shell | T:+/R, N:- | medium-high | shallow depth can expose work; fixed depth under/overexposes across roots | peripheral | proof-cost selector can replace depth proxy | single | fixed-depth brittleness | Keep coarse shell concept, demote fixed split depth. |
| 23 | Fixed worker count | T:R | high | machine/workload scaling varies | peripheral control | dynamic/banded worker selection substitutes | single/control | under/over-subscription | Useful benchmark control; production fixed count not justified. |
| 24 | availableParallelism gives desired count | T:- as rule | very high | raw available lanes do not imply profitable alpha-beta lanes | conflicting assumption | measured capacity selector substitutes | control | heterogeneous/SMT blindness | Use only as ceiling/input, not desired count. |
| 25 | Dynamic workers | T:+/R, N:R, P:+ | medium | first resource selector improved some heavy solve wall time but maturity low | peripheral | YBWC/CAP/STT/proof-cost all interact | multi | controller instability | Promising at coarse boundaries; prefer stable worker bands until a causal selector wins held-outs. |
| 26 | Equal P/E/SMT lanes | T:- as assumption | high | no evidence cores are homogeneous; task/cache mix matters | conflicting assumption | measured throughput/stealing substitutes topology guess | control | portability | Reject hard-coded equal-capacity assumption. |
| 27 | Work stealing | T:+/R, P:+, M:- possible | medium | not fully isolated; cache affinity concern established | peripheral | AFF suggests affinity-first + escape path | dual | destroys locality if unrestricted | Keep bounded/affinity-aware stealing, not unrestricted stealing or rigid pinning. |

# Dependency identity and placement — 28 to 40

| ID | Candidate | Projected effectiveness | Confidence | Evidence | Compatibility | Synergy / overlap | Leverage | Risk | Assessment |
|---:|---|---|---|---|---|---|---|---|---|
| 28 | Bottom-row identity | T:R, M:+ possible | medium | coarse projection reduced overpartition vs two rows; not universal reuse predictor | peripheral scheduling/cleanup | can prove some irreversible domains; RWS identity is separate | single | conflating task/cache/state identity | Keep only as cheap coarse feature, never semantic TT identity. |
| 29 | Two-row identity | T:R/-, M:R | high form risk | forms overlapping lattice; many hot signatures ancestor/descendant | peripheral | may improve disjointness discrimination but destroys sharing if treated as buckets | single | overpartition | Use as evidence feature, not automatic physical family. |
| 30 | Dependency partitioning generally | T:R, N:- possible, M:+ | high regime dependence | disjoint A/B isolation can protect A reuse; ancestor/desc split destroys reuse; locality controls explain many apparent wins | peripheral/co-design cache | temporal grouping is substitute; CAP determines benefit | multi | physical split of overlapping domains | Conditional only: isolate proved-disjoint domains or deliberately profitable overlap loss. |
| 31 | Dependency switches inside negamax | T:--, N:R | very high | millions of routing/map events in failed prototype; violates intended coarse boundary | conflicting-form | dispatch-time resolution substitutes | single | hot policy machinery | Strong reject. |
| 32 | Per-node chunkMap lookup | T:-- | very high | same family of hot routing overhead | conflicting-form | fixed descriptor substitutes | single | random indirection | Reject. |
| 33 | Resolve once at dispatch | T:+, M:+ | high | corrected worker with fixed descriptor restored ordinary kernel class | peripheral/native coarse | enables chunkMap without hot routing | dual | low | Strong boundary rule if dependency placement retained. |
| 34 | One fixed descriptor per subtree/task | T:+, M:+ | high | corrected coarse-task tests | peripheral | compatible with STT inside descriptor; stale holders finish | dual | descriptor semantics | Strong coarse execution contract; descriptor may contain multiple regions/views. |
| 35 | Switch to more-specific running region | T:-- in implicit form | high | violates fixed holder model; would add routing | conflicting-form | explicit frontier continuation is a distinct algorithm | single | lifetime/overlap | Reject invisible switch. Reopen only as explicit coarse continuation creation. |
| 36 | Dependency tree owns physical layout | T:-, M:- | high | lattice/overlap evidence: logical topology ≠ disjoint memory | conflicting-form | separate topology/storage substitutes | single | ownership conflation | Reject as universal ownership model. |
| 37 | Separate topology and storage | T:+, M:+ | high | required to interpret partition results correctly | native architectural principle | supports AFF, selective isolation, cleanup independently | multi | extra abstractions only if overbuilt | Strong principle, but may be simplified if final solver no longer needs dependency topology. |
| 38 | Stable logical IDs | T:0/+, M:+ | medium-high | useful for chunkMap/forwarding; no need in simple flat/RANK TT | peripheral | chunkMap/lifecycle consumer | single | extra state | Conditional infrastructure, not core semantic state. |
| 39 | chunkMap indirection | T:+ coarse / -- hot | high | coarse resolve model works; per-node does not | peripheral | stable IDs -> descriptors | single | routing stage | Accept only outside recursion. |
| 40 | Descriptor table | T:+/0, M:+ | medium-high | fixed base/mask/view at task boundaries supports safe layout experiments | peripheral | CAP/RANK/partition can consume descriptors | dual | lock-in | Useful physical abstraction if multiple layouts survive; unnecessary for one flat static table. |

# Arena, capacity and selection — 41 to 56

| ID | Candidate | Projected effectiveness | Confidence | Evidence | Compatibility | Synergy / overlap | Leverage | Risk | Assessment |
|---:|---|---|---|---|---|---|---|---|---|
| 41 | Fixed SAB arena | T:+, M:+, P:+ | very high | fixed SAB ordinary loads near AB; growable/length-tracking and atomics much slower | native | STT/CTT/RANK/CAP | platform | allocation sizing | Strong substrate: preallocate outside timed recursion; no growth. |
| 42 | Multi-slab capacity | T:+/R, M:+ | medium-high | one-slab families starve; multi-slab is required for fair logical regions | peripheral | 32K granules + CAP | dual | fragmentation | Conditional positive if partitioning survives; not needed by simple flat/RANK bank layout. |
| 43 | Power-of-two sizes | T:+ small, M:+ | high | bitmask addressing and lower-half preservation useful | native implementation | CTT/RANK/resize | dual | capacity granularity | Good implementation constraint, not semantic optimization. Prime/modulo alternatives remain separate if justified. |
| 44 | Equal family capacity | T:-, N:- | high | family work highly skewed; tiny family got same allocation as heavy | conflicting-form | work-aware CAP substitutes | single | stranded capacity | Reject fixed equal family allocation. |
| 45 | Capacity from dependency depth | T:- | high | old `dynamic` sizing was static depth guess and lost | conflicting-form | measured demand/CAP substitutes | single | wrong proxy | Reject. |
| 46 | Capacity from coarse work | T:+/R, M:+ | medium | work share is useful signal but hot-signature hindsight failed when domains overlap | peripheral | needs disjointness + locality pressure + CAP | dual | work ≠ retention value | Keep as one selector feature, not sole allocator objective. |
| 47 | Selective hot promotion | T:R/+ | medium | isolated promotion gains mostly locality unless domains proved disjoint; incompatible sibling smoke positive | peripheral | disjointness proof + CAP required | dual | overlap | Conditional candidate only for proven domains or measured profitable isolation. |
| 48 | Promote hottest exact signatures | T:- in tested meaning | high | whole-solve hindsight top-three promotion increased nodes ~14.8% | conflicting-form | semantic overlap awareness required | single | splits shared descendants | Reject heat-only selection. |
| 49 | Promote every nested child | T:-- | very high | nested 32K fragmentation exploded nodes/time | conflicting-form | selective multi-slab/fallback substitutes | single | fragmentation | Strong reject. |
| 50 | One slab for each hot child | T:-- | very high | fair nested-32 tests badly worse | conflicting-form | multi-slab selective domains | single | undercapacity | Reject. |
| 51 | Parent fallback for cold children | T:+/R, M:+ | medium-high | avoids stranded dedicated capacity and preserves broad reuse | peripheral | selective promotion | dual | overlapping ownership must be clear | Preferred shape if dependency isolation retained. |
| 52 | First-pass predictor | T:+/R | medium | first mandatory pass useful for resource hints but can be tiny/unrepresentative | peripheral | CAP/YBWC | single | predictor variance | Keep as cheap feature, not authority. |
| 53 | Previous-pass replanning | T:-/R | high current form | remapped on tiny pass and damaged cross-pass reuse | conflicting-form selector | stable placement/hysteresis alternative | single | churn | Negative without stronger causal model. |
| 54 | Cumulative replanning | T:-/R | medium-high | did not beat stable placement in tested form | peripheral | may be too sluggish and ignores overlap | single | churn/lag | Low priority. |
| 55 | Hysteresis | T:? | low | not independently justified; warning not to add arbitrary threshold to rescue weak selector | peripheral | can stabilize a proven selector | single | parameter patching | Do not add until a selector with real signal exists. |
| 56 | Hindsight hot-signature oracle | T:- as allocator, diagnostic:+ | high | true whole-solve hottest signatures still lost because overlap, not forecasting, was root issue | control | validates/falsifies selector upper bound | control | none | Valuable falsification tool; negative as production allocation criterion. |

# Domain relations and isolation — 57 to 66

| ID | Candidate | Projected effectiveness | Confidence | Evidence | Compatibility | Synergy / overlap | Leverage | Risk | Assessment |
|---:|---|---|---|---|---|---|---|---|---|
| 57 | Signatures are independent families | T:-- as assumption | very high | lattice/ancestor relations directly decoded | conflicting assumption | disjointness proof substitutes | control | lost transpositions | Falsified. |
| 58 | Ancestor/descendant separation is bad | T:+ as avoidance rule | very high | shared pair saved ~8.3% total nodes; second task ~24.1% | native cache relation | STT/AFF preserve overlap | single | low | Strong measured relation for raw-key domains. |
| 59 | Compatible sibling separation | T:- expected unless locality pays | high | same principle: compatible domains may share descendants | co-design | temporal grouping/shared TT preferred | single | lost reuse | Default against separation; only override with direct time evidence. |
| 60 | Ownership contradiction proves disjointness | N:0, T:+ isolation enabler | high for raw keys; medium after canonicalization | opposite-owner pair showed exactly no cross reuse | co-design with AUTO | enables safe partition/cleanup | dual | proof must follow canonical identity | Strong sufficient condition for raw descendant disjointness; must be re-proved after symmetry/canonicalization. |
| 61 | Isolate incompatible siblings | T:+/R, M:+ | high | A1/B/A2 split restored A2 exactly; benefit 5.3%→1.1% as capacity grew | peripheral | CAP controls value; AFF is alternative | dual | extra active bytes | Real conditional cache optimization in tight regimes. |
| 62 | A1/B/A2 smoke | diagnostic:++ | very high | clean interleaving experiment isolated eviction effect | control | supports 61/64 | control | none | Preserve as mechanism benchmark, not production policy. |
| 63 | Separate B restores A2 | N:+, T:+ expected | very high structural | exact deterministic restoration across capacities | control/relationship | validates isolation mechanism | single | none | Strong evidence about interference, not proof of whole-solve selector. |
| 64 | Isolation value depends on capacity | T:R, M:R | very high | recovery shrank ~5.3%→2.8%→1.1% with 256K→512K→1M per-domain | native resource fact | CAP | dual | none | Strong categorical fact; isolation is pressure-dependent. |
| 65 | A 2M partition win validates classification | T:- as inference | very high | flat-quarter locality control tied promote3; most gain was 512K local working set | control correction | CAP/locality | control | confounding | Falsified inference. |
| 66 | flatQuarter control | diagnostic:++ | very high | separated local table size from semantic partitioning | control | should accompany partition tests | control | none | Methodological must-have for future placement claims. |

# Task working sets and scheduling — 67 to 80

| ID | Candidate | Projected effectiveness | Confidence | Evidence | Compatibility | Synergy / overlap | Leverage | Risk | Assessment |
|---:|---|---|---|---|---|---|---|---|---|
| 67 | Task-local working set as a resource | T:+, M:+ | high | smaller active local tables often faster despite more nodes | native resource model | CAP, RANK, AFF | multi | too-small tables increase nodes | Strong conceptual variable; measure bytes/locality rather than total backing only. |
| 68 | Always use whole arena | T:- as universal | very high | oversized flat tables slower beyond knee | conflicting rule | CAP substitutes | control | locality | Falsified. |
| 69 | Deepen until ownership resolves | T:--, P:-- | very high | depth4→10 task count ~113x while ~18% work still unresolved | conflicting-form | explicit selective carve-out needed | single | scheduler becomes hot search | Strong reject. |
| 70 | Scheduler-level exclusive formation | T:+/? | low-medium | pair smokes show value if exclusivity obtained; general formation algorithm unresolved | peripheral | disjointness, CAP, YBWC | multi | frontier explosion | Keep research candidate, not current architecture. |
| 71 | Fine-grained frontier scheduler | T:-- expected, P:R | medium-high | depth profiling warns against moving search into scheduler | conflicting-form | coarse task continuation substitutes | single | overhead/lock-in | Low priority / likely reject for CPU kernel. |
| 72 | Broad unresolved pool + child pools | T:+/? | low-medium | conceptually preserves sharing while carving resolved domains; not fully tested | peripheral | STT + selective isolation | multi | complexity | Plausible hybrid if exclusive formation becomes valuable. |
| 73 | Exclusive sibling batches | T:+/R | medium | incompatible siblings can be safely separated; scheduling exact batches not fully tested | peripheral | AFF/CAP | dual | load imbalance | Conditional. |
| 74 | Temporal grouping | T:+/R, M:+ | medium-high | grouped shared 512K reproduced split-extra node count with half active storage in fixed task replay | peripheral | AFF -> STT retention | dual | may delay critical work | Strong low-complexity alternative to physical isolation; whole-solve test needed. |
| 75 | Shared interleaving | N:+ reuse / M:- eviction, T:R | high | A/B interference shows both sides | native baseline | STT | dual | destructive eviction | Baseline strategy, not universally optimal. |
| 76 | Grouped/phased sharing | T:+/R | medium-high | fixed replay positive; pass phases already natural | peripheral | AFF, CPR | dual | ordering constraints | Promising when no critical-path delay. |
| 77 | Split interleaving | T:+ only disjoint/pressure | high | positive A/B smoke, negative overlap | peripheral | CAP/disjointness | single | lost sharing | Conditional exact-domain optimization. |
| 78 | Multicore resolved-batch benchmark | diagnostic:++ | high | needed to separate locality, reuse and scheduler effects | control | validates 70-77 | control | none | Preserve as benchmark methodology. |
| 79 | Live parent splitting | T:-/unsafe | very high | stale masks can overlap reused physical storage | conflicting-form | quiescent split substitutes | single | lifecycle correctness | Reject. |
| 80 | Global quiescent repartition | T:+/R | medium | pass-boundary split mechanically safe and same performance class; profitability selector open | peripheral | CAP/selective isolation | dual | stop-the-world boundary cost | Viable physical operation, not itself a reason to repartition. |

# Lifecycle, cleanup and forwarding — 81 to 94

| ID | Candidate | Projected effectiveness | Confidence | Evidence | Compatibility | Synergy / overlap | Leverage | Risk | Assessment |
|---:|---|---|---|---|---|---|---|---|---|
| 81 | Preserve lower half on shrink | M:+, T:+ small | high algebraic | power-of-two masking preserves residents already in retained half | peripheral | quiescent repartition | dual | key encoding interaction | Useful no-copy property; CTT address-dependent identity must be co-designed. |
| 82 | Avoid split payload copying | T:+, M:+ | high | copying large TT payload at repartition is unnecessary with safe lower-half strategy | peripheral | 81/80 | single | low | Strong implementation preference. |
| 83 | Detect duplicate physical descriptors | T:+/? | medium | lifecycle design concept; not yet needed in simplified strongest stack | peripheral | chunkMap forwarding | single | complexity | Defer until duplicate ownership actually appears. |
| 84 | Forward through chunkMap | T:+ coarse | medium-high | canonical future tasks can resolve survivor directly; no hot chase required | peripheral | 38/39/83 | dual | stale holder semantics | Good coarse dedupe design if dependency allocator exists. |
| 85 | No redirect chains | T:+, correctness:+ | high | prevents hot/lifecycle indirection | native coarse rule | 84 | single | low | Strong invariant if forwarding exists. |
| 86 | Stale workers chase redirects | T:--, correctness risk | very high | contradicts fixed-descriptor task rule | conflicting-form | stale holders finish substitutes | single | use-after-recycle/routing | Reject. |
| 87 | Stale holders finish normally | T:+, correctness:+ | high | consistent with task-fixed descriptor/grace model | peripheral | RETIRING/drain | dual | delayed reclamation | Preferred conservative lifecycle. |
| 88 | RETIRING then FREE after drain | correctness:+, M:+ eventually | high concept | not fully integrated but matches safe grace period | peripheral | 87/proof cleanup | dual | holder accounting outside hot loop | Sound candidate if recycling needed. |
| 89 | Discard loser entries | T:0/+, M:+ | high under false-miss rule | safe if descriptor retired after holders drain; lost knowledge merely recomputed | peripheral | 16/88 | single | only if no false reuse | Prefer discard to payload migration absent measured migration value. |
| 90 | Proof-only cleanup | correctness:++, M:+ | very high | governing principle; false retention acceptable | native/coarse | ownership contradiction can supply proof | platform/correctness | conservative misses | Strong invariant. |
| 91 | Reject heuristic cleanup | correctness:++ | very high | unproven reclaim risks false hits/use-after-recycle | native | 90 | control | critical | Strong rule. |
| 92 | Opposite-owner cleanup proof | M:+/R | high raw-key, medium canonicalized | ownership contradiction gives raw descendant disjointness | co-design with AUTO/RWS | 60/90 | dual | symmetry can merge raw domains | Retain proof schema, re-derive under final canonical identity. |
| 93 | No per-node ages/refcounts/LRU | T:++, M:+ | very high | hot-path performance doctrine; whole-chunk/coarse alternatives | native | FW/CAP | platform | less precise reclaim | Strong execution principle. |
| 94 | Asynchronous cleanup | T:+/R | medium | desirable outside negamax but integrated profit unmeasured | peripheral | 88/90/93 | dual | races/lifecycle | Conditional; exact lifecycle proof precedes performance claim. |

# Ordering and tactical search — 95 to 101

| ID | Candidate | Projected effectiveness | Confidence | Evidence | Compatibility | Synergy / overlap | Leverage | Risk | Assessment |
|---:|---|---|---|---|---|---|---|---|---|
| 95 | Shared best-move hints | N:+ small-to-strong regime, T:R | medium-high | exact-solver standalone byte only ~0.6-1.3% nodes and slower; maintained incumbent persistent hints more valuable | native via PH if packed | MHINT -> YBWC; CTT bit budget tension | dual | extra TT bytes | Keep only near-free/packed for exact kernel; strong ordering principle remains. |
| 96 | Immediate wins | N:++, T:++ | very high | maintained + residual tactical evidence | native | RWS/RID -> cheap singleton; IWIN -> FMAC | dual | critical correctness, easy validation | Core exact proof rule. |
| 97 | Forced defense | N:++, T:++ | very high | maintained unique block + double threat; macro experiments | native | FBLK/DTH -> FMAC | multi | critical correctness | Core exact restriction/proof. |
| 98 | Prior-pass cutoff replay | N:+/R, T:+ if cheap | medium-high | historical current exact solver lacks fully tuned version; incumbent/ID theory supports replay | native hint | PH, MHINT, YBWC | dual | stale/invalid score vs move confusion | Strong ordering candidate as hint only; distinguish from negative two-tier proof storage. |
| 99 | Center prior | N:+ baseline | high | classic Connect-Four baseline; maintained/current solvers use center-out | native | fallback after TT/proof ordering | single | saturation | Keep as cheap deterministic fallback; likely displaced often by stronger hints. |
| 100 | Child cost/history | N:+/R, P:+ | medium | coarse prior-pass work already predicts some next-pass demand; no exact tuned move-history result yet | native if coarse/incremental | proof-cost ordering, YBWC | multi | noisy history | Promising cheap proof-cost feature, especially at task/root boundaries. |
| 101 | Never mix ordering and TT experiments | diagnostic/correctness:++ | very high | representation/layout changes have repeatedly altered collision/node outcomes | control methodology | protects causal attribution | control | none | Strong experimental rule; crossed composition comes only after isolated controls. |

# Objectives, references and broad rules — 102 to 107

| ID | Candidate | Projected effectiveness | Confidence | Evidence | Compatibility | Synergy / overlap | Leverage | Risk | Assessment |
|---:|---|---|---|---|---|---|---|---|---|
| 102 | Fhourstones reference | diagnostic:++ | very high | same sandbox ~9.03M positions/s, exact empty board; useful CPU target | control | FW comparison | control | algorithm differs | Preserve as independent performance/reference point, not semantic authority for new representation. |
| 103 | Maximize nodes/sec | T:- as sole objective | very high | persistent incumbent and many TT layouts finish sooner with lower NPS; proof passes show node count dominates too | conflicting objective | performance envelope uses NPS as constraint only | control | optimizes wrong target | Reject as objective. Track NPS separately. |
| 104 | Minimize nodes | T:- as sole objective | very high | implication, larger TTs, partition layouts can reduce nodes yet lose wall time | conflicting objective | time-to-proof is governing outcome | control | ignores per-node/locality cost | Reject as objective. Track work separately. |
| 105 | More sharing always better | T:- as universal | very high | incompatible interleaving evicts useful state; locality knee | conflicting rule | `share overlap, isolate disjoint` refines | control | cache pollution | Falsified. |
| 106 | More partitioning always better | T:- as universal | very high | ancestor/desc splits destroy reuse; equal-locality controls | conflicting rule | temporal grouping/shared TT alternatives | control | stranded capacity/lost reuse | Falsified. |
| 107 | Share overlap, isolate disjointness | T:+/R, N:+/R, M:+ | high raw-key; medium under future canonicalization | pair/interleave smokes directly support; symmetry can alter equivalence domains | co-design with AUTO/RWS | CAP/AFF/STT | multi | disjointness proof must match final identity | Strong relational principle, not a universal physical policy. Isolation still has to pay for its capacity/locality cost. |

---

# Cross-ledger theoretical updates

These are not scores or new categories; they summarize the strongest changes in categorical priors produced by reviewing all 107 items under the current residual architecture.

## 1. The old dependency family is mostly demoted from semantic architecture to optional physical scheduling/cache policy

Items 28-94 contained many useful observations, but the strongest correction is that dependency topology cannot simultaneously own semantic state, task identity, physical cache partitioning, scheduling and cleanup. RWS/RID now has a much stronger claim to semantic state ownership. Dependency signatures remain potentially useful for coarse disjointness, affinity and cleanup proofs, but only outside recursion.

## 2. Physical cache mechanisms are increasingly conditional on the semantic stack

RANK, CTT, AUTO and decision-state admission change which states enter the TT, their key distribution, bytes per entry and rank demand. Therefore old conclusions about slab size, active capacity, associativity and partitioning are priors tied to the old key/search graph. The correct action is not to discard them; it is to rerun equal-byte controls after the semantic state stabilizes.

## 3. The strongest negative results are architectural anti-patterns, not just slow prototypes

High-confidence exclusions in their literal forms include: BigInt/Map hot state, per-node dependency routing/chunkMap, live redirect chasing, one-32K-family policy, heat-only partitioning, unlimited speculation, naive root split, WDL-first exact-score staging, global neutral deletion, dynamic VICTOR graph, and full evaluator rescans. These violate either exactness or the fixed-width time-to-proof envelope for known causal reasons.

## 4. Several historical `failures` retain a narrower role

- worker-local TT -> possible private-write/shared-read hybrid;
- associativity -> only if a future compact layout shows expensive direct collisions at equal bytes;
- dependency partition -> only proved-disjoint/tight-pressure domains;
- seqlock publication -> unresolved form, not disproven sharing;
- previous-pass data -> move/proof hints and CPR remain useful even though two-tier physical TT lost;
- semantic successor dedup -> equivalence belongs in canonical state, not a second hot pass.

## 5. The historical ledger increases, rather than decreases, the value of the new unifying candidates

RWS/RID/SUP-event/INC potentially replace many separate identity, dependency, support, neutral, implication and rule-coverage calculations. This is exactly the multi-problem leverage category the old list could not expose when each experiment was evaluated locally.

## Next use of this ledger

The 107 rows are now theory priors, not a backlog that must be reimplemented item by item. The next candidate-selection pass should cross-reference:

- the strategic state/proof profiles;
- evaluator/Allis profiles;
- this historical ledger;
- the directional synergy matrix;
- current evidence maturity and representation dependencies.

Candidates should only be revived from a negative historical form when a named new substrate or mechanism changes the causal reason it lost.