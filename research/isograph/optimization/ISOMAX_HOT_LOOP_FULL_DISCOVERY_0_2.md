# IsoMax hot-loop full Discovery Protocol pass 0.2

**Date:** 2026-09-19  
**Owner:** `research/semantic-quotient`  
**Solver inspected:** `solver/isometric@69a1ae0929b934682d475b31cdd4a38fac77fc12`  
**Research freeze for protocol ledger:** `b8774306c209b530b8bd1b6f7e6dcb2f74eee475`  
**IsoGraph source:** `iteathen/isograph@8208cf659e65f162649a14cea1d7d80511bf4200`  
**Base performance graph:** `ISOMAX_HOT_LOOP_OPTIMIZATION_GRAPH_0_1.*`  
**Corrective identity layer:** `ISOMAX_HOT_LOOP_NEI_APPLICATION_0_2.*`  
**Authority effect:** none on Connect4 logic authority 1.1

## Purpose

Run the complete IsoGraph Discovery Protocol schedule against the integrated IsoMax semantic/source/runtime/machine/cost graph, after first correcting the graph's NEI implementation against the actual qualified NEI semantics.

This pass is deliberately optimization-focused. It is allowed to derive implementation candidates, but:

```text
DP candidate != semantic authority
representation equivalence != NEI SAME
source simplification != performance win
unknown performance relation != zero cost
```

Discovery Protocols 0.1-0.4 are used as the qualified cumulative module. DP 0.5 is used only as observation-first discrepancy guidance.

## NEI correction before discovery

The re-audit found a real defect in the issue-73 0.1 identity layer.

The earlier graph had correctly guarded `hash != q` in prose, but it still over-strengthened representation equivalence into NEI `SAME` without fully encoding the required positive identity authority. Its native `.isg` also lacked a proper A/B/P/E claim structure.

The correction is now:

- `P-ISOMAX-OPERATION-WORD32-0.2` asks only whether two representation occurrences denote the same **operation-observed 32-bit word referent** under one pinned operation;
- it explicitly declares the exact 32-bit projection as identity-preserving **for that application carrier**;
- `NEI-HOT-001` qualifies the prepared q-hash signed/unsigned representations as SAME only under that narrow profile;
- `NEI-HOT-002` does the same for the isolated-bit input to `Math.clz32`;
- source representation/provenance remains distinct;
- hash versus q has no NEI claim at all;
- task occurrences remain contextual occurrences, not q identity;
- standard-7x6 q NEI remains `INCOMPLETE_UNQUALIFIED` under the currently promoted Connect4 NEI authority;
- #96 remains an unqualified identity/performance candidate until the complete hash-mix consumer boundary is proved.

The corrected native encoding now carries:
- profile authority;
- carrier;
- fixed evidence;
- identity-preserving/separating law;
- queried subjects A/B;
- profile dependency;
- SAME result;
- provenance;
- verification and completeness roles.

## Protocol execution discipline

For every DP-01 through DP-45 route:

1. align semantic quantity, layer, scope and authority;
2. inspect the requested structure;
3. generate only bounded candidate explanations;
4. seek a structural breaker, rigid authority or identity separator where applicable;
5. preserve residuals and unknowns;
6. distinguish discovery disposition from qualification status;
7. stop low-information lexical/layout/identifier routes once stronger structure dominates.

NEI is invoked only where natural/domain identity actually matters. QU owns unresolved lowering, hardware-cost and distribution economics.

## Complete protocol ledger

| Protocol | Name | Disposition | Finding | Issues |
|---|---|---|---|---|
| DP-01 | Cross-boundary relational structure | STRUCTURE_ESTABLISHED | Semantic/source/runtime/machine/cost boundaries are distinct but causally connected. NEI 0.1 implementation defect was exposed at the identity-authority boundary; q-DAG/task boundary remains a distribution seam. | #97, #98, #101 |
| DP-02 | Constraint-structure discovery | STRUCTURE_ESTABLISHED | First-win stopping, exact-q equality, sealed-capacity rules, proof/q separation and operation-word identity guards are load-bearing constraints. First-win excludes nonterminal-q authority after terminal transition. | #98 |
| DP-03 | Interface / port correspondence | STRUCTURE_ESTABLISHED | Generic IsoMaxTransitionCache and ordinary-WDL solver use the same key interface but have different value-domain ownership. Global Int8 conversion is invalid; consumer-specific WDL specialization is the lawful candidate. | #101 |
| DP-04 | Dependency-topology discovery | STRUCTURE_ESTABLISHED | Semantic value dependency is a ranked q DAG while worker execution materializes private subtree occurrences. Existing #89-#95 remain valid candidate refinements; no scheduler winner is promoted. | #89, #90, #91, #92, #93, #94, #95 |
| DP-05 | QU / open-region topology | STRUCTURE_ESTABLISHED | Three open regions remain valid: V8 lowering, dynamic hardware cost, and parallel-distribution economics. They are connected constrained unknowns, not missing scalars. No justified QUI between them. | — |
| DP-06 | Repeated relational motifs | STRUCTURE_ESTABLISHED | Repeated over-general representation motif spans signed hash/isolated-bit, fixed masks, singleton projection, move-order incidence, and remaining hash-mix chain. Repeated same-word move-order loads form a new local motif. | #96, #99 |
| DP-07 | Alternative-factorization discovery | OPEN_STRUCTURAL_LEADS | Residual-first mirror canonicalization can be refactored to support-first without changing the reflection orbit; dense ownTransition can fuse class loading with its existing dense transform. | #97, #100 |
| DP-08 | Residual-structure discovery after partial match | STRUCTURE_ESTABLISHED | The initial #73 NEI layer's residual was not a natural distinction but a qualification defect. Corrected 0.2 preserves representation equivalence separately from NEI authority. Lower-confidence residuals: derived support masks and blocker affected-slot traversal. | — |
| DP-09 | Symmetry / automorphism discovery | SUPPORTED_CANDIDATE | Horizontal reflection is exact. Support-first orientation can decide asymmetric mirror orbits before residual reflection; residual comparison remains only for support stabilizers. Per-class reflection-order memo is demoted to a symmetric-support fallback. | #97 |
| DP-10 | Role-equivalent elements under different labels | STRUCTURE_ESTABLISHED | Signed and unsigned representation occurrences can play the same operation-word role only under the explicit P-ISOMAX-OPERATION-WORD32-0.2 identity law; role match alone is not NEI SAME. | #96 |
| DP-11 | Invariants across admissible variation | STRUCTURE_ESTABLISHED | NEI-HOT-001 and -002 are determinate only because exact operation-word projection plus fixed evidence settles identity. #96 remains unqualified because full-chain consumer closure is not yet proved. | #96 |
| DP-12 | Known/unknown interface correspondence | STRUCTURE_ESTABLISHED | Known source/runtime observations attach to QU-HOT-01/02/03 at exact boundaries. Hardware counters remain unknown; failure to configure xperf is not zero cost. | — |
| DP-13 | Multi-scale common substructure | STRUCTURE_ESTABLISHED | The same mismatch pattern appears from bit-level carriers through residual kernels to task scheduling: implementation generality/materialization can exceed semantic need. No claim of one universal mechanism is made. | #96, #97, #98, #99, #100, #101 |
| DP-14 | Transformation-invariant discovery | SUPPORTED_CANDIDATES | Exact results survive signed/unsigned carrier changes, table precomputation, flattening, reflection and preparation reorder. Support-first mirror selection is a new transformation-invariant candidate; hash-mix signing remains pending. | #96, #97 |
| DP-15 | Information-flow structure | STRUCTURE_ESTABLISHED | q information flows from state to prepared key to cache; residual content flows through an avoidable inputBits copy before dense own cofactor; exact values flow backward across task/q dependencies. Dense load-transform fusion is candidate. | #100 |
| DP-16 | Causal / temporal structure | SUPPORTED_CANDIDATE | First-win stopping is a causal cut: once mover transition terminalizes, no later future-game state exists. Current q lookup occurs after terminalization at recursive entry and opponent cofactor is computed before terminal recognition. Stage A terminal-before-q is candidate; Stage B post-win blocker suppression requires explicit terminal-state scope. | #98 |
| DP-17 | Containment / ownership structure | STRUCTURE_ESTABLISHED | Generic q cache owns arbitrary payload semantics and Branch Manager object-valued q nodes; ordinary worker owns WDL-only values. This ownership boundary blocks global Int8 conversion and permits only scoped specialization. | #101 |
| DP-18 | Cardinality / multiplicity structure | STRUCTURE_ESTABLISHED | Ordinary WDL has cardinality three while generic cache value domain is open; pair-incidence records have repeated word multiplicity; one canonical q can have many parent/task occurrences. These counts are optimization cues, not identity evidence. | #90, #99, #101 |
| DP-19 | Dual / reversed structures | NO_NEW_LEAD | Own and blocker cofactors are complementary player-event roles but not interchangeable algorithms; global own normalization prevents mechanically importing block locality. Existing dense-own/block separation is retained. | #100 |
| DP-20 | Complement / exclusion structure | STRUCTURE_ESTABLISHED | First-win stopping excludes post-terminal continuation semantics; sealed storage excludes growth; unresolved proof guards exclude optimistic applicability. Terminal boundary candidate uses only the first exclusion. | #98 |
| DP-21 | Fixed-point / recurrence structure | STRUCTURE_ESTABLISHED | Ordinary game value is rank-well-founded, not intrinsically a global fixed point. Current task quantum is execution policy over that DAG. Existing rank-cut/supply-front candidates remain valid; terminal nodes are recurrence leaves and need not be nonterminal q cache entries. | #89, #93, #98 |
| DP-22 | Compositional-structure discovery | SUPPORTED_CANDIDATE | ownTransition composes class load then dense transform then normalization; the first two can potentially fuse without changing composition semantics. q mirror canonicalization similarly composes orbit selection with exact triple representation. | #97, #100 |
| DP-23 | Reconstruction-structure discovery | OPEN_STRUCTURAL_LEAD | supportLo/supportHi are reconstructible from gravity support/heights and are consumed by optional proof guards, while ordinary workers exclude certificates/RBA. A worker-only omission could be possible, but specialization/branching economics and public-state reconstruction obligations are unresolved; no issue filed. | — |
| DP-24 | Proof / witness topology | STRUCTURE_ESTABLISHED_CORRECTION | 0.1 native NEI records lacked proper A/B/P/E claim topology. Corrected NEI 0.2 uses ^94000/01/02/03/07/08/10/11/17/24/25 roles. q/proof identity remains separate. | — |
| DP-25 | Refinement-relation discovery | REVISION_NOT_REFINEMENT | NEI application 0.2 corrects an invalid identity-strengthening in 0.1; it is a corrective successor/revision of that qualification layer, not evidence-narrowing refinement. Runtime observations from 0.1 remain valid. | — |
| DP-26 | Boundary-movement invariance | STRUCTURE_ESTABLISHED | Moving growU32 to module scope changed runtime allocation without semantic change, proving administrative/source boundary can matter to machine realization. Support-first q candidate moves the mirror-decision boundary while preserving the q orbit; must not move proof-transporter authority. | #97 |
| DP-27 | Parameter-role correspondence | NO_NEW_LEAD | worker count, node quantum, 512 poll interval, 64K transition prefix and retention caps have distinct resource/control roles. Existing #75/#79/#94 evidence already owns them; numerical coincidence gives no new relation. | #94 |
| DP-28 | Dimensional / unit structure | STRUCTURE_ESTABLISHED_NO_NEW_CANDIDATE | Fixed widths (42 cells, 20 frontier words, 10 chunks, 32-bit words, 3 WDL values) explain several exact specializations, but width alone does not authorize a representation change. New fixed-width cache candidate is ownership-scoped in #101. | #101 |
| DP-29 | Ordering / partial-order structure | STRUCTURE_ESTABLISHED_EXISTING | Support-local action-value isotony and task dependency leverage remain separate ordering relations. Move-order pair record term IDs are monotone enough to make same-word reuse possible without reordering advisory semantics. | #92, #99 |
| DP-30 | Reachability / connectivity structure | STRUCTURE_ESTABLISHED | Manager q graph exposes only part of worker-internal reachability; rank-cut #89 targets earlier convergence. Terminal states are absorbing leaves, reinforcing #98. No hidden bypass invalidates first-win stopping. | #89, #98 |
| DP-31 | Conservation / balance structure | STRUCTURE_ESTABLISHED | Exact apply/undo, prepared-key bit preservation, mirror orbit equality and WDL invariance are conservation obligations across optimized representations. They are qualification constraints, not new semantics. | #96, #97, #98, #99, #100, #101 |
| DP-32 | Threshold / phase-boundary structure | NO_NEW_PROMOTION | Measured thresholds 64K transition prefix, 512 necessity poll, worker-count-dependent quantum, and retention caps are policy boundaries. Empty-root class high-water crosses the four-worker retention share, but #84 already found existing hysteresis effective and lacks a new measured case; retain as QU observation only. | #94 |
| DP-33 | Degenerate / special-case structure | SUPPORTED_CANDIDATES | Terminal states, horizontally symmetric supports, singleton terms, empty residuals and forced edges expose simpler exact structures. Terminal special case -> #98; support stabilizer is the only case where #97 still needs residual tie-break. | #97, #98 |
| DP-34 | Failure-mode correspondence | STRUCTURE_ESTABLISHED | Rejected hit-first interning, blocker memo, trusted fast paths and manager epochs share a failure mode: source-operation reduction/reuse did not improve end-to-end economics. This is a negative discovery law used to gate new candidates. | — |
| DP-35 | Exception-structure discovery | STRUCTURE_ESTABLISHED | Exceptions define lawful optimization scopes: support symmetry for residual mirror tie-break; terminal states for q bypass; proof-enabled states for support masks; object-valued manager cache for generic payload. Exceptions prevent over-generalizing candidates. | #97, #98, #101 |
| DP-36 | Representation-redundancy discovery | HIGH_VALUE_LEADS | Confirmed past redundancies: general Number carriers, runtime cell masks, object pair incidence, singleton scan, lexical helper context. New candidates: support-first avoids unnecessary residual reflection, WDL specialization avoids general payload only at ordinary-worker boundary, dense own copy may be redundant. supportLo/Hi redundancy remains open. | #97, #100, #101 |
| DP-37 | Equivalent constraint-closure discovery | STRUCTURE_ESTABLISHED_WITH_IDENTITY_GUARD | Operation-word signed/unsigned forms can be equivalent under exact projected consumer closure, but equivalence does not automatically imply NEI SAME. Corrected profile supplies explicit identity law only for NEI-HOT-001/002. Mirror canonical representative alternatives preserve the same exact reflection equivalence class. | #96, #97 |
| DP-38 | Semantic-identity candidate discovery | QUALIFICATION_DEFECT_REPAIRED | Full NEI audit found 0.1 overreach. Corrected 0.2 qualifies only two determinate operation-word SAME claims; hash-vs-q has no NEI claim; task-occurrence/q is contextual only; standard-7x6 q NEI remains INCOMPLETE_UNQUALIFIED; #96 remains unqualified. | #96 |
| DP-39 | QUI extension from partial unknown correspondence | DORMANT_NO_CANDIDATE | QU-HOT-01/02/03 are different unknown questions with no qualified structural isomorphism target. Equal uncertainty shape would not establish identity or optimization equivalence. No QUI is proposed. | — |
| DP-40 | Global whole-structure isomorphism | REJECTED_AS_TARGET | Semantic, source, V8, machine and scheduling layers are intentionally not globally isomorphic. The useful object is a typed causal correspondence with residuals/unknowns. Whole-graph isomorphism would erase load-bearing implementation distinctions. | — |
| DP-41 | Literal-value coincidence | LOW_VALUE_NO_LEAD | Repeated values such as 32, 42, 64K or 512 are meaningful only with their structural roles. No candidate is based on literal coincidence. | — |
| DP-42 | Lexical / name similarity | LOW_VALUE_NO_LEAD | Labels such as hot/cold, cache, frontier or identity are retrieval hints only. The cold-helper result is a direct counterexample to trusting lexical hot/cold classification as machine behavior. | — |
| DP-43 | Shared ontology / class-label hints | LOW_VALUE_NO_LEAD | Shared class/module labels did not supply optimization authority. Generic cache and ordinary WDL cache share ontology labels but differ in ownership; structural contract wins. | #101 |
| DP-44 | Serialization / layout similarity | LOW_VALUE_BOUNDED | Flat numeric layout was historically beneficial, but layout similarity alone is not evidence. Native .isg/JSON/JS layout differences carry no identity claim; runtime layout changes require exact A/B qualification. | — |
| DP-45 | Raw identifier correspondence | NEGATIVE_GUARD | Pool-local residual class IDs, task IDs, SIs and hash values are addressing only. They are not portable q/NEI/proof identity. This explicitly blocks shared-TT schemes keyed directly by worker class IDs. | #78 |

## Major new findings

### F1 — support-first horizontal-reflection canonicalization

Current q canonicalization reflects P0/P1 residual classes and compares their contents before support participates in choosing orientation.

But q mirror sharing requires only one deterministic representative of the exact reflected triple. The current specification does not make residual-first ordering semantically authoritative.

A support-first order can decide every asymmetric-support orbit before residual comparison:

```text
support < reflectedSupport
    -> original orientation
    -> no residual reflection required

reflectedSupport < support
    -> reflected orientation
    -> residual reflection required, but no class comparison

support == reflectedSupport
    -> residual comparison remains the stabilizer tie-break
```

This is candidate **#97**.

The previously considered per-class reflection-order cache is retained only as a possible symmetric-support fallback. It is weaker than eliminating reflection work entirely.

### F2 — first-win terminal boundary occurs before nonterminal q

C4-0011 states that the terminal outcome is emitted by the transition and is not an additional nonterminal q coordinate.

Current recursive order is nevertheless:

```text
derive/probe q
-> native terminal classification
```

and state transition computes the opponent blocker cofactor even when the mover cofactor already terminalizes.

This reveals two stages:

1. **#98 Stage A:** classify terminal status before q derivation/cache and do not cache terminal q.
2. **#98 Stage B:** only after Stage A qualifies, determine whether ordinary-worker terminal transition can omit the post-win opponent cofactor without weakening any supported terminal-state API.

Stage B is explicitly not assumed safe merely because first-win stopping exists.

### F3 — repeated residual-word loads inside already-flat move-order incidence

The successful #77 flat incidence transformation preserved term-ID order. Therefore `pairWord` is naturally grouped/nondecreasing within a cell's pair span.

Current classifier still calls `wordAt` for every pair record.

Candidate **#99** keeps one locally loaded residual word until `pairWord` changes. It changes no ordering or state representation.

### F4 — dense own-transition factorization contains an avoidable intermediate copy

The retained mover transform must stay dense; the historical branchy/lazy mover is negative evidence.

But the current dense path:

```text
class chunks
-> copy all 20 words to inputBits
-> scan all 20 inputBits
-> dense cofactor
```

can potentially become:

```text
class chunks
-> dense cofactor directly
```

while keeping the exact same dense arithmetic and normalization.

Candidate **#100 Experiment A** tests that factorization. Its independent blocker experiment tests profile-static affected-slot traversal without generalizing block locality into own normalization.

### F5 — WDL value cardinality is narrower than the generic q-cache owner

Ordinary recursion stores only `{-1,0,+1}`, but `IsoMaxTransitionCache.values` is a JavaScript Array.

The tempting global `Int8Array` conversion is **rejected by ownership**:
- public cache tests store arbitrary numbers/objects;
- Branch Manager uses q-cache values as manager node objects.

The lawful candidate is **#101**: qualify a consumer-owned ordinary-WDL cache specialization without narrowing the generic cache.

This is an example where DP-18 cardinality found a real compression opportunity, while DP-17 ownership prevented an invalid global optimization.

## Existing candidate corrected rather than promoted

### #96 full signed hash-mix chain

The structural candidate remains useful:

```text
mix32/FNV intermediates
-> repeated unsigned Number conversion
-> hot consumers appear bit-pattern-only
```

But the full chain is **not yet NEI SAME**.

The corrected state is:

```text
DP distinction audit:
    no natural significance has been established for signed-vs-unsigned
    representation inside the full chain

NEI:
    unqualified until every identity-relevant consumer factors through pi32

QU-HOT-01:
    V8/performance consequence remains OPEN
```

The issue must be qualified through exact bit-pattern closure plus generated-code/allocation/end-to-end evidence.

## Reinforced existing distribution findings

The full pass strengthens the earlier workload-distribution interpretation without selecting a winner:

- #89 rank-cut q frontiers;
- #90 dependency-leverage priority;
- #91 worker structural affinity;
- #92 support-fiber dominance-cone scheduling;
- #93 local demand-triggered supply front;
- #94 structural-pressure adaptive task quanta;
- #95 forced-chain macro edges;
- #78 portable cross-worker exact reuse.

DP-04/15/18/21/29/30 all point to the same typed mismatch:

```text
semantic unit:
    canonical ranked q dependency DAG

execution unit:
    contextual worker task subtree with private TT
```

The mismatch is established. The economically correct remedy remains QU-HOT-03.

## Open leads deliberately not promoted to issues

### Ordinary-worker support occupancy masks

`supportLo/supportHi` are exact derived information under gravity and are used by proof mask guards. Ordinary worker admission excludes certificates and RBA.

A worker-only state specialization might avoid maintaining these masks recursively, but:
- public/proof-capable state owns them;
- adding a mode branch can erase the saving;
- duplicating state-transition implementations may cost more than four bit operations.

Disposition: **OPEN_STRUCTURAL_LEAD**, no issue yet.

### Worker retention threshold

The final empty-root observation crosses the nominal four-worker class-retention share. However #84 already demonstrated effective retention/hysteresis and rejected several extra-capacity variants.

Without a new measured causal case, this remains a QU/resource observation rather than a reopened optimization.

### Support reflection lookup

If #97 qualifies, support reflection becomes a more central operation and a finite lookup/table realization may then be worth testing. Before #97, this is premature.

## Negative findings

The full run also closed several attractive but invalid routes:

- generic q-cache WDL packing: **rejected by ownership**; only consumer specialization remains;
- global semantic/source/machine isomorphism: **rejected as target**; the useful object is typed correspondence with residuals;
- QUI among current performance QUs: **not justified**;
- raw class IDs as shared-worker identity: **rejected**; pool-local IDs are addresses, not portable q;
- representation difference as NEI DISTINCT: **rejected**;
- representation equivalence as NEI SAME without a qualified identity law: **rejected**;
- standard-7x6 q NEI SAME under current promoted profile: **not claimed**;
- source-operation reduction as performance proof: **falsified repeatedly** by prior rejected candidates.

## Cross-protocol synthesis

The strongest common optimization form after the full pass is:

```text
1. identify the semantic quantity and owner
2. identify the actual observable required by the consumer
3. preserve stronger identity/provenance outside that view
4. factor away representation work not required by the observable
5. keep unknown runtime/machine effects in QU
6. measure the exact realization in the real caller
```

NEI is useful at step 3 only when a genuine identity question is present. It is **not** a generic equivalence engine.

QU is useful at step 5 because it lets us retain unresolved causal structure without forcing a binary optimization judgment.

DP supplies the search strategy and, equally importantly, the stop conditions that rejected several over-broad optimizations.

## Discovery disposition

```text
DP-01..DP-45 executed                       YES
NEI implementation double-checked          YES
NEI 0.1 issue-73 defect found              YES
corrected NEI application 0.2              YES
new candidate issues                       #97-#101
existing candidate corrected               #96
distribution candidate family reinforced   #78, #89-#95
new gameplay semantic law promoted         NO
Connect4 authority 1.1 mutated             NO
QUI promoted                               NO
global isomorphism claimed                 NO
```

The next qualification step is to verify the corrected NEI/native topology and this ledger mechanically, update #96's status text, and publish an issue-73 qualification 0.2 that supersedes the defective NEI portion of qualification 0.1.
