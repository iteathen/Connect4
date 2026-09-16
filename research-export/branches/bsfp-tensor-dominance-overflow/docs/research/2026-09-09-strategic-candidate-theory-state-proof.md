# Strategic candidate theoretical assessment — state, proof, cache, parallelism

**Date:** 2026-09-09  
**Status:** research theory/evidence synthesis; maintained source and `main` unchanged.  
**Method:** `2026-09-09-categorical-reasoning-calibration.md`. Categories remain independent; no composite score is assigned.

This document sharpens the current strategic candidates that govern state representation, exact proof reduction, cache design and parallel execution. Evaluator/Allis/proof-cost candidates are assessed separately.

Abbreviations used below:

- **RWS** — residual win-space semantic state
- **RID** — fixed residual-requirement ID universe (625 IDs for standard 7x6)
- **SUP** — minimal exact support/accessibility state; event-frontier realization remains a candidate
- **FW** — fixed-width allocation-free hot execution
- **INC** — precomputed/incremental transitions and metadata
- **IWIN** — exact immediate-win closure
- **DTH** — exact opponent double-immediate-threat loss closure
- **FBLK** — exact forced single-block restriction
- **FMAC** — forced macro-edges / decision-state TT admission
- **CARD** — cardinality earliest-win bound
- **SEWB** — richer support-aware earliest-win bound
- **EXH** — one-sided win-space exhaustion bounds
- **AUTO** — residual-game automorphism/equivalence collapse
- **DEAD** — dead/neutral physical-choice equivalence compression
- **IMPL** — support-compatible implication/dominance proof reuse
- **RANK** — intrinsic occupancy-rank TT banking
- **CTT** — compact exact TT identity
- **PH** — proof/bound authority separated from ordering-only hints
- **STT** — globally shared TT knowledge across workers
- **CAP** — coarse active-TT capacity selection
- **YBWC** — bounded lazy YBWC/Jamboree-style parallelism
- **AFF** — temporal/affinity grouping of already-eligible coarse work
- **CPR** — completed coarse-proof reuse
- **JOIN** — in-flight duplicate proof joining/coalescing
- **MHINT** — compact TT/cutoff move hint

---

## 1. RWS — residual win-space semantic state

**Underlying idea vs form.** The candidate is the semantic quotient `(remaining minimal winning obligations for both players + exact legal/support state + side to move)`, not the current BigInt/array prototype or any particular root compiler.

**Projected effectiveness.** Nodes/states: **strong positive expected**, confidence **very high**. Time-to-proof: **positive expected but implementation-sensitive**, confidence **medium-high**. Mechanism: histories that leave the same future winning obligations and legal frontier become one state; blocked lines disappear and strict-superset obligations become redundant. Regime: strongest where many historical color distinctions have ceased to matter; weaker in early/open states before much structure has died.

**Measured effectiveness.** Complete small games reduced colored-board state counts by about 19.8%, 75.6%, 92.6% and 78.7% on the four studied variants. Twelve ordinary late 7x6 roots reduced exact memo states 1,463 -> 917 (~37.3% weighted). A lower-level native implementation reduced nodes by 13%-29% on several cohorts but had mixed elapsed results: one ordinary cohort ~5.3% faster, fresh holdout ~6.6% slower despite 20.6% fewer nodes, structural cohort ~17.5% slower despite 29.1% fewer nodes, and two early anchors ~6.5% slower. Thus semantic effectiveness is strongly measured; broad time effectiveness is not yet established.

**Adoption likelihood.** **Near-certain underlying idea**, confidence **high**. The exact hot representation remains open.

**Proof authority.** Exact semantic-state reduction. A defect can produce a false proof, so correctness-risk severity is **critical**.

**Benefit mechanisms.** State quotienting; draw exhaustion; smaller identity domain; enables semantic transitions, symmetry, dominance, proof rules and evaluator projection.

**Execution/resource profile.** Hot-path risk **medium-high** in current forms because dynamic requirement arrays, strings, sorting and broad bitsets can overwhelm the saved states. Footprint is representation-dependent. Incrementalizability is **high in principle** because RID shows the canonical antichain can be maintained by construction. Cache effect is potentially strongly positive through fewer distinct semantic states, but changed hash distribution can still worsen a bounded direct map. GPU suitability is **high only for fixed-width/bitset realization**.

**Reroot/persistence.** Semantic facts should have high persistence, but the current native root-program-local key clears caches across program changes. Cross-root/program compatibility remains an unresolved implementation issue.

**Evidence maturity.** Exact semantic reduction: **strong/exhaustive + independent-oracle evidence**. Native performance: **prototype/mechanism-qualified, not production-qualified**.

**Form risk.** **High**. The current forms are not expected to be final.

**Regime sensitivity/variance.** High measured runtime variance; semantic state reduction itself is consistent but magnitude is position-dependent.

**Stage / information half-life.** State compilation + every transition + TT identity. Information lasts for the entire descendant search and potentially reroots if compatible identity is established.

**Directional synergy.** `RWS -> AUTO`: strong projected and partly observed state-simplification synergy. `RWS -> CARD/SEWB`: strong cost-sharing. `RWS -> IMPL`: strong because formulas are native state. `RWS -> Allis`: strong because opponent groups become explicit obligations. `RWS -> evaluator residualization`: strong. `RID -> RWS`: very strong cost-reduction synergy. `FW/INC -> RWS`: necessary cost synergy.

**Substitution/displacement.** Can displace full colored-board TT identity and some separate dead-state/draw logic; does not displace physical support state.

**Multi-problem leverage.** **Unifying representation.** Distinct problems addressed: state identity, irrelevant-history removal, draw exhaustion, exact bounds substrate, symmetry substrate, proof-rule substrate, dominance substrate, evaluator live-line projection.

**Next decisive falsifier.** Representation-native fixed-width descendant-minimal implementation measured against the ~10M/s single-thread / 13.74M/s aggregate performance envelope on ordinary and structurally rich holdouts.

---

## 2. RID — fixed residual-requirement universe / 625-ID substrate

**Projected effectiveness.** Time/NPS: **strong positive expected as an enabler**, confidence **high**; direct node effect is mostly neutral because RID changes how the same residual semantics are represented. Mechanism: turns dynamic set construction, subsumption, transition, symmetry and implication predicates into table/bit operations.

**Measured effectiveness.** The fixed-ID bitset transition reproduced exactly the canonical minimal-requirement state counts of expensive dynamic implementations across all complete tested small games. Precomputed 625-ID automorphism maps turned an orbit mechanism that was runtime-negative/neutral in expensive form into a measured composition speed win. Initial bitset dominance preserved semantic node reductions; remaining cost moved to candidate-proof indexing rather than implication itself.

**Adoption likelihood.** **Near-certain for specialized 7x6 residual search**, confidence **high**. General Connect-Four profiles will have different finite universes.

**Proof authority.** Static exact compilation substrate. Correctness risk is critical if transition/subsumption tables are wrong.

**Benefit mechanism.** Per-node arithmetic/metadata reduction rather than direct search pruning.

**Hot/resource profile.** Hot risk **low if active state is compact**, **high if code scans all 625 IDs every node**. Cold precomputation cost is modest and highly amortized. Incrementalizability **very high**. GPU suitability **very high** because tables and bitsets are fixed.

**Evidence maturity.** Exact mechanism-qualified; production packing/locality unresolved.

**Form risk.** Medium: the universe is strong, but hot active-set encoding may be words, sparse IDs, generated transitions or another fixed representation.

**Directional synergy.** `RID -> RWS/AUTO/IMPL/Allis/evaluator`: very strong projected cost-sharing; `RID -> CARD`: strong because requirement-size metadata is precomputed. Reverse synergies are weaker.

**Multi-problem leverage.** **Platform/enabler.** Distinct problems: transitions, minimality, implication closures, symmetry transforms, rule coverage, size/cardinality metadata, provenance.

**Next falsifier.** Fixed-width generated kernel that demonstrates the active RID state/update fits the performance envelope without broad scans.

---

## 3. SUP — minimal exact support/accessibility state; support-event frontier candidate

**Projected effectiveness.** The necessity of *some* exact support state is certain; the **event-frontier realization** has **strong positive projected time-to-proof/leverage**, confidence **medium**. Mechanism: represent only neutral gaps and future strategic support events rather than historical occupancy/color while making reachability distances native.

**Measured effectiveness.** Heights/support are already exact in residual prototypes. Support-aware earliest-win bounds were slightly stronger than cardinality, but much of their node benefit was captured by the cheaper cardinality bound. The event-frontier form itself is not yet independently performance-qualified.

**Adoption likelihood.** Exact support responsibility: **near-certain**. Event-frontier form: **medium-high**, confidence medium.

**Proof authority.** Exact physical-state foundation; a missing support distinction can make pruning unsound. Correctness-risk severity **critical**.

**Benefit mechanisms.** Potentially state compression, reachability timing, neutral-gap preservation, richer exact bounds, parity/event rule support.

**Execution/resource profile.** Hot risk **medium-high** because a richer frontier can add words/branches; cold compilation may be moderate. Incrementalizability is projected **high** if event chains are fixed. GPU suitability is likely high if represented as small per-column tapes/indices, poor if graph objects are required.

**Evidence maturity.** Exact heights are mature; event frontier is **conceptual/early prototype theory**.

**Form risk / lock-in.** **Very high**: heights, event tapes or another frontier are alternative realizations and influence canonical TT identity, neutral compression, Allis parity rules and compact keys.

**Directional synergy.** `SUP-event -> SEWB`: very strong projected cost-sharing. `SUP-event -> IMPL`: strong by making support compatibility/native skeleton identity cheap. `SUP-event -> DEAD`: very strong because neutral gaps can be safely distinguished from genuinely dead tails. `SUP-event -> Aftereven/Before`: very strong. `RID/RWS -> SUP-event`: moderate, because surviving obligations tell the compiler which cells are strategic events.

**Substitution.** Event frontier likely substitutes for plain heights plus separate neutral-gap and support-distance calculations.

**Multi-problem leverage.** **Potential unifying representation.** Distinct problems: legal placement, support timing, neutral tempo, support-aware bounds, parity rules, event-chain equivalence, dead-tail detection.

**Next falsifier.** Prove exact future-transition equivalence against colored-board oracle and compare fixed-width event-state kernel against height-state kernel on both NPS and time-to-proof.

---

## 4. FW — fixed-width allocation-free hot execution

**Projected effectiveness.** **Strong positive time/NPS**, confidence **very high**. This is execution discipline rather than state pruning.

**Measured effectiveness.** Two-word fixed-width arithmetic sustained roughly 9.47-9.99M nodes/s single-thread in the sandbox versus ~0.416M/s for the BigInt+Map path before failure; same-sandbox C reference was ~9.03M/s. Long multicore proof passes averaged ~13.74M/s aggregate and one reached 15.61M/s.

**Adoption likelihood.** **Near-certain** for CPU Node hot search.

**Proof authority.** Execution substrate; semantic neutrality if operations are exact.

**Hot/resource profile.** It is the primary control on hot-path risk. State footprint, locality and branch count still matter. GPU suitability is conceptually very high because the same fixed-width discipline maps naturally to device data.

**Evidence maturity.** Strong performance evidence; production final residual fields still unresolved.

**Directional synergy.** `FW -> every rich semantic candidate`: strong cost synergy. `RWS/RID/INC -> FW`: they reduce how much state/logic FW must carry.

**Multi-problem leverage.** Platform: NPS, allocation/GC avoidance, cache predictability, SAB compatibility, GPU portability.

---

## 5. INC — precomputed/incremental transitions and metadata

**Projected effectiveness.** **Strong positive time/NPS**, confidence high. Direct node count generally neutral; it makes pruning candidates affordable.

**Measured effectiveness.** 625-ID transitions reproduced dynamic antichain semantics exactly; precomputed swap maps materially improved automorphism runtime; fixed per-node word arithmetic in the exact kernel is already performant.

**Adoption likelihood.** Near-certain.

**Proof authority.** Exact implementation strategy; generated/precomputed tables must be qualified.

**Hot/resource profile.** Usually lowers hot cost at the expense of cold tables/cache footprint. Incrementalizability is the candidate itself. GPU suitability high if tables fit sensible memory tiers.

**Amplification / leverage.** Very high and broad: RWS, AUTO, CARD/SEWB, IMPL, evaluator metadata, Allis masks and DEAD can all become cheaper through shared incremental state.

**Next falsifier.** Measure table footprint/locality so precomputation does not merely trade ALU for random-memory latency.

---

## 6. IWIN — exact immediate-win closure

**Projected effectiveness.** **Strong positive node/time**, confidence very high, especially tactical regimes.

**Measured effectiveness.** Maintained incumbent already checks and returns immediate wins before ordinary recursion. Residual tactical-control experiments showed tactical closure as one of the largest exact reductions before macro compression. Pascal Pons independently treats direct winning/losing anticipation as a major exact Connect-Four pruning step.

**Adoption likelihood.** Near-certain.

**Proof authority.** Exact terminal proof; correctness severity critical but validation easy.

**Hot/resource profile.** Low risk if winning targets are already maintained; can become redundant cost if rescanned separately from residual singleton metadata.

**Synergy.** `IWIN -> FMAC`: strong; terminates chains. `RID/RWS -> IWIN`: strong cost-sharing because singleton requirements expose it directly.

**Leverage.** Primarily single-purpose terminal proof, with secondary TT/ordering work avoided.

---

## 7. DTH — exact opponent double-immediate-threat forced loss

**Projected effectiveness.** **Strong positive in tactical regimes**, confidence very high.

**Measured effectiveness.** Present in maintained incumbent and residual tactical experiments. Exact tactical closure reduced frozen 7x6 work by roughly an order of magnitude in a cohort selected to include search after baseline filtering.

**Adoption likelihood.** Near-certain.

**Proof authority.** Exact terminal proof.

**Hot risk.** Low if playable singleton threats are already represented; avoid separate board scans.

**Synergy.** Strong with FMAC, FBLK and RWS singleton requirements.

**Leverage.** Narrow proof rule with broad downstream work avoidance.

---

## 8. FBLK — forced single-response restriction

**Projected effectiveness.** **Strong positive branching reduction**, confidence very high wherever unique immediate defense occurs.

**Measured effectiveness.** Maintained incumbent restricts recursion to the sole block. Residual research independently reproduced the mechanism; extending repeated forced blocks into macro-edges produced substantial additional savings.

**Adoption likelihood.** Near-certain.

**Proof authority.** Exact transition restriction, not terminal proof.

**Hot risk.** Low.

**Directional synergy.** `FBLK -> FMAC`: very strong; it is the primitive that creates deterministic chains. `RWS/RID -> FBLK`: cheap threat identification.

**Leverage.** Primarily lower branching; secondary cache pressure reduction.

---

## 9. FMAC — forced macro-edges / decision-state TT admission

**Projected effectiveness.** Nodes: **positive-to-strong**; TT traffic and time: **strong positive expected**, confidence high. Mechanism: deterministic transit states are represented as edges rather than general-purpose cache/search vertices.

**Measured effectiveness.** Against a tactical control, forced macros removed ~10%-36% additional small-game nodes and ~31.5% on the frozen 7x6 cohort. Fresh non-tactical cohort showed ~17.3% fewer nodes beyond tactical alone and ~38.2% beyond current+tactical in the then-current stack; stacked timing improved ~21%. Separate low-level decision-state admission on `41267575` reduced 5.946M -> 5.521M nodes and TT writes 3.383M -> 2.173M; CPU batches were ~23% lower. `663152175` searched ~0.6% more nodes but still cut writes ~26% and CPU was lower. 100 independent late 7x6 oracle roots agreed exactly.

**Adoption likelihood.** Very high, confidence high.

**Proof authority.** Exact graph normalization / cache-admission rule.

**Hot/resource profile.** Low-medium risk: closure checks cost something but avoid recursion/TT traffic. Footprint neutral-to-positive. GPU suitability high because deterministic chains reduce divergent branch-state count, though variable chain length can diverge lanes.

**Regime sensitivity.** Benefit scales with forced-chain density and TT pressure; node count may occasionally rise because skipped transit entries cannot be reused.

**Synergy.** `FBLK/DTH/IWIN -> FMAC`: observed strong. `RANK -> FMAC` and `FMAC -> RANK`: observed positive under tight cache because rank banks retain useful decision states while FMAC removes pollution. `FMAC -> AUTO/IMPL/ordering`: projected positive by reducing how often expensive decision-only mechanisms run.

**Multi-problem leverage.** Multi-purpose: branching normalization, TT traffic reduction, recursion reduction, cache pollution reduction, downstream symmetry/ordering cost reduction.

**Next falsifier.** Native residual fixed-width implementation under serial and shared-worker kernels, including cross-chain transposition-loss cases.

---

## 10. CARD — cardinality earliest-win bound

**Projected effectiveness.** Nodes/time: **positive expected**, confidence high; per-node cost projected very low with RID metadata.

**Measured effectiveness.** On the repaired frozen 7x6 cohort: baseline 43,269 -> 31,671 nodes (~26.8%). It retained about 96% of the node savings of the more detailed support-aware version on the original frozen comparison. Small-game reductions were consistently positive in several geometries. Combined with residual transposition automorphisms it reached 28,606 nodes and ~5.6% faster than CARD alone in repeated prototype timing.

**Adoption likelihood.** Very high as a cheap fallback exact bound.

**Proof authority.** Exact admissible mate-distance bound.

**Hot risk.** Very low if minimum active requirement size is incrementally maintained; high only if implemented as scans.

**Synergy.** `RID -> CARD`: strong cost-sharing. `CARD -> AUTO`: observed positive proof-order/state-volume interaction. `SEWB -> CARD`: likely substitution/subsumption if richer bound becomes equally cheap.

**Leverage.** Primarily exact bounding, with secondary alpha-beta/TT pressure improvements.

---

## 11. SEWB — support-aware earliest-win bound

**Projected effectiveness.** Node effect: **slightly stronger than CARD**; time effect: **positive only if support distance is native**, otherwise sign uncertain/negative. Confidence high on exactness, medium on implementation payoff.

**Measured effectiveness.** Frozen 7x6 support-aware result 31,233 nodes versus CARD 31,671: only 438 additional nodes removed on a 43k baseline. Earlier small games sometimes showed stronger differences, but CARD captured most of the value on the frozen 7x6 set.

**Adoption likelihood.** Role is medium-high; current scan-heavy form low. If SUP event frontier makes distances free, adoption rises substantially.

**Proof authority.** Exact admissible bound.

**Hot risk.** Medium-high if support distances are reconstructed; low if maintained by SUP.

**Directional synergy.** `SUP-event -> SEWB`: very strong projected cost-sharing. `SEWB -> CARD`: likely subsuming, not additive.

**Multi-problem leverage.** Narrow as a bound; its strategic value is mainly evidence supporting the event-frontier substrate.

---

## 12. EXH — one-sided win-space exhaustion bounds

**Projected effectiveness.** **Small positive expected only as a free consequence**, confidence high. Building machinery specifically for it is projected negative.

**Measured effectiveness.** Small games were mixed: roughly neutral/slightly worse on 4x3 and 4x5, ~2.4% node reduction on 4x4, ~34.2% on 5x3. A heavier late 7x6 root dropped 156 -> 130 nodes. Composition with neutral tempo was non-monotonic.

**Adoption likelihood.** High *if* RWS already exposes side-empty status; low as standalone subsystem.

**Proof authority.** Exact WDL-side bound (`P0 no win-space => V_P0 <= 0`, dual for P1).

**Hot risk.** Essentially zero if active-count/empty flag is maintained.

**Synergy.** Free-rider on RWS/RID; may overlap with stronger exact terminal/earliest-win bounds.

**Leverage.** Single-purpose bound.

---

## 13. AUTO — residual-game automorphism/equivalence collapse

**Projected effectiveness.** Nodes/states: **strong positive in symmetry-rich regimes, positive overall**, confidence high. Time: **positive expected only with incremental/fixed canonicalization**, confidence medium-high.

**Measured effectiveness.** Narrow exact transposition-orbit pruning reduced frozen 7x6 nodes ~9.9% alone and another ~9.7% beyond CARD; CARD+AUTO measured ~5.6% faster than CARD. Complete residual canonicalization showed very large semantic quotient potential: ~55.9%, 69.2%, 86.8% state reductions on three complete small variants; refined structural signatures recovered the exact full-permutation quotients. Seven late 7x6 roots showed roughly 4%-38% state reduction. High-level full canonicalizers remain too expensive. Ordinary board reflection is a different mechanism and was weak/negative in the direct-mapped TT.

**Adoption likelihood.** Very high for some residual-equivalence mechanism; current transposition-only detector/canonicalizer form uncertain.

**Proof authority.** Exact semantic equivalence reduction; correctness severity critical.

**Hot/resource profile.** Medium-high risk: discovering automorphisms can cost more than avoided search. Incrementalizability is plausible because requirements disappear monotonically and RID supplies transformed-ID maps. GPU suitability could be good for fixed fingerprints/refinement, poor for variable permutation enumeration.

**Regime sensitivity.** Very high: some states have huge residual symmetry, others almost none.

**Synergy.** `RWS/RID -> AUTO`: very strong state/cost synergy. `CARD -> AUTO`: observed positive. `DEAD -> AUTO`: projected positive by erasing distinctions and enlarging equivalence classes. `AUTO <-> CTT/RANK`: co-design tension because canonicalization changes key/bank distributions.

**Multi-problem leverage.** Primarily duplicate-state/branch removal; secondary TT density and move-equivalence reduction.

**Next falsifier.** Incremental canonical-label/fingerprint kernel whose cost is bounded by changed local requirement signatures rather than permutation enumeration.

---

## 14. DEAD — dead/neutral physical-choice equivalence

**Projected effectiveness.** Node/time: **positive in structurally eligible regimes**, confidence high for genuine dead equivalence, medium for generalized neutral compression. Mechanism: multiple physical actions that differ only in irrelevant filler consequences become one semantic action while preserving consumed tempo/support.

**Measured effectiveness.** Neutral-tempo alpha-beta reductions ranged ~1.5%-39.5% across complete small games. Structural quotient open-wing cohort reduced 165,029 -> 100,231 nodes and ~44.36 -> 24.44 ms solve time at 512K; ablation showed neutral action collapse contributed more than color-erased identity. Ordinary/random/dense cohorts often showed little benefit. A tempo witness (`11124224`) proves neutral moves cannot simply be deleted: consuming the turn changes exact value.

**Adoption likelihood.** High for elimination of **genuinely equivalent dead choices**; medium for a separate global neutral-pool implementation.

**Proof authority.** Exact semantic action equivalence; correctness risk critical if tempo/support is lost.

**Hot risk.** Medium-high if equivalence is rediscovered dynamically; low if SUP/RWS compile neutral gaps/events directly.

**Regime sensitivity.** Very high; open-wing/structural regimes can be strong, ordinary roots may pay setup tax.

**Synergy.** `SUP-event -> DEAD`: very strong projected correctness/cost synergy. `RWS/RID -> DEAD`: strong because live obligations reveal irrelevant cells. `DEAD -> AUTO`: positive by exposing larger equivalence classes. `DEAD + EXH`: measured non-monotonic proof-order interaction.

**Substitution.** Event-frontier canonicalization may subsume a separate neutral pool.

**Multi-problem leverage.** If integrated into SUP, it addresses branch reduction, support-state compression and symmetry exposure; standalone global pool is narrower.

---

## 15. IMPL — support-compatible implication/dominance proof reuse

**Projected effectiveness.** Node reduction: **positive-to-strong**, confidence high. Time-to-proof: **sign uncertain today; positive expected only with cheap indexing**, confidence medium. Mechanism: exact monotone bounds transfer between non-identical states rather than only exact TT equality.

**Measured effectiveness.** Small-game live searches reduced nodes roughly 5%-37% depending harness; WDL Pareto frontier reduced expanded states up to ~49.9% on 4x5. Frozen 7x6 bounded implication cut nodes ~23%; fresh cohort ~27%. But comparison/frontier implementations were substantially slower. Even after FMAC, a bounded implication variant cut nodes ~13.6% while increasing time ~22%.

**Adoption likelihood.** Medium-high as a semantic mechanism; low-medium for current frontier/index forms.

**Proof authority.** Exact admissible cross-state lower/upper bounds under identical compatible support skeleton and proven formula implication.

**Hot/resource profile.** Current risk high due candidate search/frontier comparisons and extra memory. Implication predicate itself becomes cheap under RID bitsets; the unresolved cost is locating relevant certificates. GPU suitability depends almost entirely on fixed bounded indexing.

**Regime sensitivity.** Stronger where many related proof states share support skeletons; saturation rises after FMAC/tactical closure.

**Synergy.** `RID -> IMPL`: very strong predicate-cost synergy. `SUP-event -> IMPL`: potentially very strong index/skeleton synergy. `RWS -> IMPL`: foundational. `RANK -> IMPL`: possible indexing locality because rank constrains comparable states. `FMAC -> IMPL`: mixed: fewer states to query lowers overhead but also removes some addressable work.

**Multi-problem leverage.** Primarily cross-state proof reuse; may also become the owner of strongest-proof antichains if integrated well.

**Next falsifier.** Bounded bit-indexed certificate retrieval with no linear frontier scan, benchmarked after FMAC/RANK on target fixed-width kernel.

---

## 16. RANK — intrinsic occupancy-rank TT banking

**Projected effectiveness.** Node/time: **positive in tight/moderate TT pressure, neutral at roomy capacity**, confidence high. Mechanism: states at different ply/occupancy can never be identical, so direct-map collisions across rank are pure destructive interference; rank also tracks the moving working set better than branch count.

**Measured effectiveness.** `41267575` 512K: 5.946M -> 5.282M nodes (~11.2%) for 16x32K banks; 8x64K ~9.2% reduction. `663152175` roughly neutral. Combined with decision-state admission: 5.261M nodes and 38.5% fewer writes than flat baseline. At 256K the combined node advantage rose ~24%; at 1M shrank ~2.8%. Branch-factor banking was negative, showing intrinsic disjointness alone is insufficient.

**Adoption likelihood.** Medium-high, explicitly workload/capacity-dependent.

**Proof authority.** Physical placement/cache policy, semantically neutral when exact key identity preserved.

**Hot/resource profile.** Low hot risk if bank selection is simple arithmetic. Can strand capacity if boundaries are poor. GPU suitability good for fixed rank bands; parallel workers can share same rank banks naturally.

**Synergy.** `FMAC <-> RANK`: observed positive. `CTT <-> RANK`: observed co-design success via 15-bit-local exact encoding. `CAP -> RANK`: likely strong because bank widths should reflect active bytes/demand. `AUTO -> RANK`: uncertain because canonicalization changes within-rank distribution but not rank itself.

**Multi-problem leverage.** Primarily collision/retention plus coarse lifecycle locality; not a semantic state reduction.

**Next falsifier.** Re-derive banks by **bytes and decision-state demand** after final compact residual entry format, across multiple capacities and positions.

---

## 17. CTT — compact exact TT identity

**Projected effectiveness.** Memory: **strong positive**. Time: **positive expected**, confidence high on memory, medium-high on time. Mechanism: slot/address already carries exact identity bits, so redundant key bits need not be stored/loaded/published.

**Measured effectiveness.** Exact candidate reduced TT arrays 14 -> 10 bytes/entry (~28.57%) at equal entries. Full solve/final-table comparisons matched identity and counters. `41267575` exploratory repeated medians showed ~9%-13% lower time across several 1/4-worker 512K/1M settings; smaller `663152175` 4-worker 256K was effectively tied. Pons independently demonstrates the same broad principle of combining table index with stored partial key to reduce Connect-Four TT storage.

**Adoption likelihood.** Very high as a principle; specific encoding medium because canonicalization/banking/relocation remain open.

**Proof authority.** Exact cache identity. False hits are forbidden; correctness severity critical.

**Hot/resource profile.** Lower memory traffic and footprint; small reconstruction arithmetic. Lock-in can be high when local address bits participate in identity. Relocation/resizing then requires invalidation or proven transform.

**Parallelism/GPU.** Smaller entries improve shared-cache bandwidth and GPU memory density; publication semantics remain separate.

**Synergy.** `CTT -> STT`: strong by lowering shared bandwidth/footprint. `CTT <-> RANK`: observed co-design. `AUTO -> CTT`: canonicalization may improve hit identity but forces encoding redesign. `CAP -> CTT`: key width changes wall-time capacity knee.

**Multi-problem leverage.** TT footprint, cache locality, memory bandwidth, equal-byte capacity; possibly publication stores.

**Next falsifier.** Final canonical-state encoding + equal-byte capacity sweep + concurrent publication/lifecycle qualification.

---

## 18. PH — proof/bound authority separated from ordering-only hints

**Projected effectiveness.** Correctness architecture: **strong positive/near-required**. Performance: positive by allowing weak/stale knowledge to guide search without falsely authorizing cutoffs.

**Measured effectiveness.** Maintained incumbent already distinguishes perspective/depth-qualified score reuse from shallower/cross-perspective best-move ordering reuse. Persistent TT fixed-request benchmark showed fewer nodes/evaluator calls and lower elapsed while score reuse remained much narrower than position/ordering reuse.

**Adoption likelihood.** Near-certain.

**Proof authority.** This candidate defines authority classes rather than one proof rule.

**Hot risk.** Low if metadata stays packed; excessive hint schemas can grow entries.

**Synergy.** Enables safe evaluator, prior-pass, Allis and proof-cost hints. Also clarifies CPR/JOIN validity conditions.

**Multi-problem leverage.** Correctness isolation, ordering reuse, reroot persistence, stale-knowledge handling.

---

## 19. STT — global shared TT knowledge across workers

**Projected effectiveness.** Nodes/time: **strong positive under useful parallel overlap**, confidence high; can become negative if synchronization/working-set widening dominates.

**Measured effectiveness.** Equal-total-capacity 4-worker comparisons: `663152175` 256K local -> shared cut nodes ~39% and wall ~40.5%; `41267575` 256K cut nodes ~24.6%, wall ~20.5%; at 512K cut nodes ~34.7%, wall ~21.8%. Cross-worker validated hits were directly observed (~16%-25% of hits in representative runs). Shared capacity has a workload-dependent locality knee.

**Adoption likelihood.** High for multicore exact solver; publication/layout form remains open.

**Proof authority.** Cache mechanism; false misses acceptable, false hits forbidden.

**Hot risk.** Medium due coherence/atomics/working-set contention. Existing research publication protocol is not final memory-model qualification.

**Synergy.** `CTT -> STT`: strong bandwidth/footprint. `CAP -> STT`: strong because shared knee is workload-dependent. `YBWC -> STT`: strong duplicate-work reduction. `CPR -> STT`: potentially complementary at coarse vs recursive granularity.

**Multi-problem leverage.** Cross-worker duplicate proof reduction, shared ordering/bounds, memory pooling.

---

## 20. CAP — coarse active-TT capacity selection

**Projected effectiveness.** **Positive expected**, confidence high that a workload-dependent optimum exists; confidence medium on any selector. Mechanism: node savings continue with capacity after cache/locality cost has passed wall-time optimum.

**Measured effectiveness.** Shared capacity sweeps showed different knees: smaller position around ~256K, larger around ~512K; 1M/2M could reduce nodes but increase wall. Earlier single-worker/local sweeps similarly showed active capacity dependence.

**Adoption likelihood.** High as a root/pass/task-boundary policy; low for continuous per-node adaptation.

**Proof authority.** Resource selection only.

**Hot risk.** Low if resolved outside recursion; online controllers can add lock-in/noise.

**Synergy.** Strong with CTT (bytes shift knee), RANK (bank size), STT (shared footprint), YBWC (worker concurrency changes pressure).

**Multi-problem leverage.** Memory footprint/locality/resource adaptation; narrow compared with semantic candidates.

**Next falsifier.** Simple calibrated bands vs adaptive selector on held-out workloads after entry format/ordering stabilizes.

---

## 21. YBWC — bounded lazy YBWC/Jamboree-style parallelism

**Projected effectiveness.** Wall time: **positive for heavy proofs with exposed sibling work**, confidence medium-high. Nodes: usually negative because speculation adds work. Mechanism: preserve first-child cutoff information before exposing bounded younger null-window tasks.

**Measured effectiveness.** Raw independent compute scales well, but naive root splitting failed because one child dominated. Lazy shell on `663152175` showed representative ~192 -> 135 ms with ~23% extra nodes. `41267575` depth-4 shell ~2.06 -> 1.54 s but ~65% extra nodes; split depth 2 preserved work but underutilized workers, depth 5 over-speculated. Literature on Jamboree/YBWC supports first-child protection and restricting speculative work primarily to narrow-window tests.

**Adoption likelihood.** Medium-high for CPU multicore; exact split policy remains conditional.

**Proof authority.** Scheduling/execution mechanism; exactness depends on window/result handling.

**Hot risk.** Low inside serial kernel if scheduling remains coarse; system-level risk medium-high from wasted work and contention.

**Synergy.** `STT -> YBWC`: strong by recovering duplicate speculative work. `MHINT/evaluator/proof-cost -> YBWC`: potentially strong because better first-child ordering reduces speculation. `FMAC -> YBWC`: may reduce available parallelism while shortening critical path; sign uncertain.

**Multi-problem leverage.** Mainly multicore critical-path reduction.

---

## 22. AFF — temporal affinity/grouping of eligible work

**Projected effectiveness.** **Positive expected for cache retention with low lock-in**, confidence medium. Mechanism: schedule related ready work near each other so shared cache knowledge survives, without physically partitioning memory.

**Measured effectiveness.** A1/B/A2 replay showed grouped temporal order in a shared 512K table reproduced the node count of split-extra storage with half active entries. Whole-solve YBWC effects are not yet qualified.

**Adoption likelihood.** Medium.

**Proof authority.** Scheduling hint only.

**Hot risk.** Low if dispatcher-only; can harm critical path/load balance if grouping waits too aggressively.

**Synergy.** `AFF -> STT`: positive retention. `CAP -> AFF`: moderate. `YBWC -> AFF`: co-design tension because alpha-beta eligibility/order constrains grouping.

**Multi-problem leverage.** Cache retention + possibly reduced need for physical partitioning; otherwise narrow.

---

## 23. CPR — completed coarse-proof reuse

**Projected effectiveness.** Nodes/dispatches/time: **positive expected when coarse obligations recur**, confidence medium-high.

**Measured effectiveness.** In one `41267575` 4-worker/512K experiment, shared coarse proof layer reduced ~13.059M -> 10.660M nodes, ~5,441 -> 2,530 dispatches and ~1.012 -> 0.805 s. Ablation indicated completed-proof reuse was at least as valuable as the more complex in-flight graph and sometimes slightly faster. Smaller position was not a stable timing win.

**Adoption likelihood.** Medium-high, particularly if parallel proof tasks are retained as a layer above negamax.

**Proof authority.** Exact coarse interval/bound reuse; must include state, orientation, window/obligation validity.

**Hot risk.** Low because it can remain outside recursion; footprint/indexing moderate.

**Synergy.** `PH -> CPR`: strong correctness architecture. `RWS/AUTO -> CPR`: may increase coarse-state identity collisions/reuse. `YBWC -> CPR`: likely positive by avoiding redispatch of completed obligations.

**Multi-problem leverage.** Dispatch reduction + completed proof reuse + possible stronger coarse scheduling information.

---

## 24. JOIN — in-flight duplicate proof joining/coalescing

**Projected effectiveness.** **Regime-dependent**, confidence medium. Strong where duplicate coarse requests are common; overhead otherwise.

**Measured effectiveness.** Intentionally duplicated requests showed strong joining. In whole-solve ablation, full graph was not consistently better than completed-proof-only reuse; in single-worker mode it added no join benefit and searched the same reduced graph.

**Adoption likelihood.** Low-medium as universal mechanism; medium for duplicate-heavy parallel regimes.

**Proof authority.** Coordinator-level obligation identity; correctness and cancellation semantics can be subtle.

**Hot risk.** Recursive hot risk low, scheduler complexity/lock-in medium-high.

**Synergy.** `RWS/AUTO -> JOIN` may increase exact duplicate obligation detection. `YBWC -> JOIN` can suppress speculative duplication. `CPR -> JOIN` overlaps heavily; CPR should be the simpler control.

**Leverage.** Narrow: duplicate in-flight work plus dispatch pressure.

---

## 25. MHINT — compact TT / cutoff move hint

**Projected effectiveness.** Nodes: **small-to-moderate positive**, confidence medium; time positive only if storage/probe cost is nearly free. Stronger projected value in parallel search because first-child quality controls speculation.

**Measured effectiveness.** Exact-solver standalone one-byte hint reduced nodes only ~0.6%-1.3% on established roots and was slower/noisy due extra array/bookkeeping. Maintained incumbent has much stronger evidence that inherited best moves can reduce fixed-depth/reroot work, but that is a different search/evaluator regime. Move-order literature strongly supports good first moves for alpha-beta.

**Adoption likelihood.** Medium-high if packed into otherwise available entry bits; low as dedicated byte/array.

**Proof authority.** Ordering hint only; never a cutoff by itself.

**Hot risk.** Low if packed, medium if extra random load/store.

**Synergy.** `PH -> MHINT`: required safety distinction. `MHINT -> YBWC`: potentially strong proof-order/parallel synergy. `CTT -> MHINT`: tension over scarce packed bits but possible free placement. `CPR -> MHINT`: completed proofs can expose witnesses.

**Multi-problem leverage.** Primarily move ordering; secondary speculative-work reduction.

---

# Cross-candidate theoretical conclusions from this tranche

These are relational conclusions, not composite rankings.

1. **RWS + RID + INC + FW** has the strongest projected *cost-sharing* structure. RWS supplies semantic compression; RID/INC are what make it plausible at fixed-width speed. None of those facts implies the current native RWS kernel is already fast enough.

2. **SUP event frontier** has the largest unmeasured multi-problem leverage in this tranche. It can potentially make SEWB, DEAD, Allis parity/event rules and IMPL support compatibility cheap. Its high leverage coexists with low evidence maturity and high form/correctness risk.

3. **IWIN + DTH + FBLK + FMAC** is the strongest measured exact graph-normalization cluster. The primitives and macro-edge are distinct candidates but have observed directional synergy; do not double-count their eliminated states.

4. **RANK + CTT + FMAC** is a measured physical-cache composition. RANK is specifically a memory-pressure candidate, not a universal semantic improvement. CTT changes bytes, so the profitable RANK/CAP boundaries must be re-derived after final entry layout.

5. **AUTO and IMPL** both exploit structure beyond exact-state equality, but their current bottlenecks differ: AUTO needs cheap canonical labeling; IMPL needs cheap certificate retrieval. RID is a shared substrate, so a future representation can plausibly make both cheaper without combining their semantic roles.

6. **STT + YBWC + CAP** is the main multicore cluster. Shared proof knowledge has strong measured value; speculative width/depth and active capacity are regime variables. More workers, more sharing or more capacity are not monotone objectives.

7. **CPR** currently has a stronger theoretical/empirical case than universal **JOIN** because it captures completed reusable proof without requiring every in-flight obligation to participate in a coordination graph.

8. **DEAD** should be treated as an equivalence principle, not the old global neutral-pool implementation. The exact tempo witness makes support timing a hard semantic constraint.

# External theory priors used

External sources are priors only; no external code is imported.

- Pascal Pons, *Solving Connect Four*: move ordering, direct losing-move anticipation, fixed TT caching, optimized partial-key storage, and lower/upper bound use.
- Victor Allis, *A Knowledge-based Approach of Connect-Four*: strategic rule coverage, rule compatibility, and conspiracy-number search.
- Allis, van der Meulen & van den Herik (1994), *Proof-number search*: proof/disproof effort in non-uniform game trees.
- YBWC/Jamboree literature: protect first-child information and limit speculative narrow-window work.

The next document applies the same calibrated reasoning to evaluator-derived candidates, all nine Allis rule families, proof-cost signals, and important negative/control candidates.