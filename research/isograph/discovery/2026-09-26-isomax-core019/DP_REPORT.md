# IsoMax: Core 0.19 source rendering and optimization discovery

Date: 2026-09-26. **Scoped DP campaign complete; optimization candidates only.**
No solver implementation, benchmark configuration or timeout was changed.
The [bounded independent review](DP_REVIEW.md) found no blocking candidate
claims. Its citation and finite-control suggestions were addressed.

The requested order was followed: locate existing representation, extend its
coverage to the current complete executable source, qualify exact rendering
under Core 0.19, then run discovery. The earlier Lazy SMP 0.2 rendering and
September 25 DP/DTS results remain evidence; their qualification is not
retroactively widened to today's complete source rendering.

## Inputs and admission

- Connect4: `2ed88683ba46fc4d99790414ad99a2e409acf400`.
- JSMinSys: `04d37498607ace16dae33c79462ddfe1503c8a0d`.
- IsoGraph: `43490735f0073acccb4f900e247cd0db19681e1f`;
  qualified Core 0.17 + 0.18 + 0.19, cumulative DP 0.1-0.7.
- Exact rendering: [Q0-Q7 record](RENDERING_QUALIFICATION.md), promoted in
  `18104ccc`; native SHA-256
  `8d002aa2728ebabb9f1f7f7fc5a6c563f5514fab8a568fbec4954475ca867718`.
- Historical graph:
  [Lazy SMP 0.2](../../successor/CONNECT4_LAZY_SMP_SEARCH_METHOD_0_2.md).
- Historical discovery:
  [full-decode DP](../2026-09-25-lazy-smp-full-decode-nei-qu-dp/FINAL_REPORT_0_3.md),
  [all-leads investigation](../2026-09-25-lazy-smp-all-leads-investigation/FINAL_REPORT.md),
  [DTS provenance census](../2026-09-25-lazy-smp-dts-0.1/PROVENANCE_CENSUS_0_1.md),
  [route-8-only checkpoint](../2026-09-25-lazy-smp-dts-0.1/ROUTE8_ONLY_CANDIDATE_PLAN_0_9.md).
- Existing performance observations at Connect4
  `b3d487f89737aaf50f85cc3b280827e5cf5e9464`:
  [four/eight-worker report](https://github.com/iteathen/Connect4/blob/b3d487f89737aaf50f85cc3b280827e5cf5e9464/docs/qualification/20260926-worker-scaling/REPORT.md)
  and [matched four-worker control](https://github.com/iteathen/Connect4/blob/b3d487f89737aaf50f85cc3b280827e5cf5e9464/docs/qualification/20260926-four-worker-controlled/REPORT.md).

Final live-state check: IsoGraph main advanced to
`378a5170d5a51319f1d4f3cd3deb786fbd3db258` during execution. Its PR #43 adds
Ising/MWC research and branch-history classification. A direct git diff of
Core, extensions and qualification authority against the frozen `43490735`
revision is empty. The frozen Core 0.19/DP authority is therefore still current;
the native packet was not silently repinned or reinterpreted.

The full-stack integration qualification remains revision-scoped to the older
Core-0.18 composition. This report does not claim that integrating the entire
IsoGraph family with Core 0.19 has separately been qualified.

## What the current solver actually does

The public entry starts Lazy SMP. Every worker owns a private CPC/RBA alpha-beta
solver and local exact cache. Workers share exact scalar results through a
sampled shared cache. They do not consume branch tasks from a search manager.
Imported manager/framework and four-front functions exist in the complete
static source closure, but the active worker explicitly selects CPC-only mode.
Calling this active path a shared-TT branch-expansion scheduler would be wrong.

The recursive route is cache lookup, CPC consequences, interval tightening,
then either a forced local continuation or scored RBA cofactors. Child support
and residual coordinates are canonicalized; live-line ordering state follows
physical orientation. Root ingress/history is cold setup. Ordinary child
generation uses native cofactor transitions, not board/history reconstruction.

Derived support index: [discovery-support.json](discovery-support.json).
It pins 15 function occurrences and 449 operation occurrences back to native
JSON-pointer paths and SHA-256 hashes. This projection is navigation only;
the complete native trees and pinned language/runtime model supply semantics.
No call occurrence count is presented as a dynamic frequency or cycle count.

| Mechanism | Native occurrence |
|---|---|
| CPC-only recursion and cutoffs | `/modules/7/program/body/22` |
| Exact publication | `/modules/7/program/body/14` |
| Cofactor image and upset closure | `/modules/8/program/body/10/declaration` |
| Child basis update | `/modules/8/program/body/7/declaration` |
| Reflection/canonicalization | `/modules/8/program/body/12/declaration` |
| Cold selected helper profile | `/modules/13/program/body/16/declaration` |
| Physical live-line update | `/modules/3/program/body/4/declaration` |
| Shared probe/store | `/modules/14/program/body/2/declaration`, `/modules/14/program/body/3/declaration` |

## Adaptive DP execution ledger

The priority is whole-operation cost and exact work avoided, not more visits,
smaller source files, greater sharing density or superficial graph similarity.
Routes were selected adaptively; this is not a claim of 45 exhaustive passes.

| Routes actually applied | Primitive comparison / expansion | Result and stopping reason |
|---|---|---|
| DP-04 dependency topology; DP-16 causal/temporal | Follow worker's mode binding into actual recursion; distinguish represented but inactive exports. Trace ordered cofactor, canonicalization, live-state update and recursive call. | Active causal unit established. Optimizing inactive four-front code cannot explain or improve this benchmark path. |
| DP-06 repeated motifs; DP-36 redundancy; DP-37 equivalent closure | Repeated image membership OR plus superset OR loops; decompose coordinates independently and inspect the invariant after each completed loop. | C1: guarded closure absorption. Finite falsifiers pass; production differential and cost remain open. |
| DP-02 constraints; DP-32 thresholds; DP-33 special cases | Compare exact-cache acceptance with return-bound direction and finite WDL range. Follow early cutoff before full-window publication. | C2: endpoint exactness may retain previously discarded work. Do not generalize interior/nondirectional bounds to exact values. |
| DP-07 alternative factorization; DP-09 symmetry; DP-14 transformation | Compare cofactor then reflection with reflected cofactor image, including support-first selection, basis ordering and orientation consumers. | C3: fused strictly selected orientation is plausible. Symmetric ties and physical-action transport remain explicit residuals. |
| DP-08 residual analysis; DP-15 information flow; DP-18 multiplicity | Decompose residual membership versus live-line incidence into origin-line identity, multiplicity, support and orientation. | R1: no proof that the ordering carrier is redundant; do not delete it. Different encodings alone do not establish natural distinctness. |
| DP-01 cross-boundary; DP-24 witness topology | Follow exact producer, local row, sampled shared publication, validated consumer and skipped CPC work; compare prior provenance/overlap experiments. | Existing sharing transports measured CPC facts, not demonstrated expensive recursive proofs. C2 can change the producer population; its value must be tested separately. |
| DP-05 unknown regions; DP-12 known/unknown interfaces | Retain unknown JIT cost, schedule, cache replacement and dependency fan-in; contrast four/eight worker observations with the source order function. | R2: node-rate growth does not establish solve progress. No invented scheduling probability or universal scaling claim. |

Cumulative DP 0.2-0.4 discipline: residuals were recursively decomposed by role,
not dismissed by labels or declared wholly equivalent. DP 0.5-0.6 discipline:
these are scoped operational/algebraic correspondences, not natural-object
SAME/DISTINCT conclusions; no NEI conclusion is asserted. DP 0.7 discipline:
every derived mechanism links back to primitive occurrence support. QU retains
unmeasured cost and scheduling alternatives without assigning probabilities.
DTS-sensitive facts remain occurrence-scoped: a reusable WDL fact is not a
worker, action witness, execution trace or deterministic root move.

## C1 — Skip closure already established in the child coordinate

**Priority 1: candidate for implementation qualification.**

The cofactor currently finds an image, writes its membership bit, then scans
larger child shapes and ORs every containing shape. Different surviving parent
residuals can cause repeated expansion of an image already covered by earlier
expansions. The current code shares expansion between players where possible,
but does not first use each target coordinate's existing closure membership.

Source invariant: each completed insertion leaves target player coordinate U
an upset of the same child basis B. Target invariant: the same U after processing
all surviving images. Mapping: omit insertion of principal upset up(x) when x
is already in U. Preserved relation: x in U implies up(x) is a subset of U,
so U union up(x) equals U. Induction over the ordered image loop gives equal
final coordinates. No legal-time information or residual correlation is dropped.

Proposed direct hot-path form: after locating the image bit, compute whether
P0 and P1 each need it. If neither needs it, omit expansion; otherwise expand
once and write only the coordinates that need it. Keep the existing selected
JSMinSys subset/remove implementations, same fixed scratch and same child basis.
This proposes no new identity table, closure arena or alternate solver.

Guards: target initially zeroed; each previous insertion finished its closure;
same basis and pure subset relation; P0/P1 tested independently; terminal/first-win
short circuits and opponent-blocking rules remain before this operation. A bit
written before its closure finishes is not a valid saturation witness.

Performed falsification: exhaust all 168 upsets of the four-element Boolean
lattice (16 shapes), testing all 16 insertions per upset: **2,688 equal results**.
The incomplete-closure guard has an explicit counterexample; player coverage
cannot be borrowed from the other coordinate. This finite model supports the
guarded algebra, not a qualified 7x6 implementation.

Residual: extra target loads/branches may cost more than saved scans, especially
for small late bases or mostly novel images. Next test must count duplicate
images, subset tests and both-player cases by rank/basis size off the production
timing path, then differentially qualify native transitions and benchmark total
cycles for the complete solve operation. Stop if fewer scans do not repay cost.

## C2 — Publish proven WDL endpoints without requiring a full window

**Priority 2: candidate for correctness-first evaluation.**

The source returns on recursive cutoffs before its full-window-only exact store.
That conservatively avoids publishing ordinary alpha-beta bounds as exact.
But the result domain has endpoints: for V in {-1,0,1}, a proven lower bound
V >= 1 implies V = 1; a proven upper bound V <= -1 implies V = -1.

Source invariant: correctly directed bound on the current q's mover-relative
value. Target invariant: exact absolute P0-valued WDL for that same q. Mapping:
intersect the bound with the closed three-value domain, publish only a singleton.
Discarded information: how that exact scalar was proved, which the current
cache already does not carry. Preserve q identity, sign/mover conversion,
sample mask, row validation and root witness semantics.

An initial experiment should isolate recursive fail-high winning endpoints;
do not globally treat every returned +1 or -1 as exact without bound direction.
Tail-forced continuation changes keyOffset, mover and sign: publish against
the current q with its current mover, never an overwritten ancestor key.
No unwind stack or second proof cache is proposed. Likewise, terminal/forced
facts may already be caught by CPC; source reachability does not prove a useful
new producer population exists in real workloads.

Performed falsification: all six endpoint/interior directional-bound cases;
interior lower bound 0 admits both draw and win, so ordinary cutoff caching
is rejected. The bounded mathematical model passes; production return-bound
semantics still require targeted narrow-window, forced-chain, mirror and
independent exact-oracle tests before a code change could qualify.

Why it is worth testing: the previous provenance census observed **100%** of
shared stores/hits as CPC_EXACT, with no recursive full-window publications.
That is evidence about measured runs, not an impossibility theorem. C2 could
make costly recursive conclusions reusable without broadening all sharing.
New stores can also evict better facts or add shared-memory cost. Measure
producer cost, consumer work avoided and whole-solve cycles; reject if the new
population is absent or its publication costs exceed critical-path savings.

## C3 — Fuse cofactor output with strictly selected canonical orientation

**Priority 3: structural candidate; more qualification burden than C1.**

Current composition creates a child in parent orientation, then canonicalization
may construct reflected basis/mapping, permute coordinates and publish copies.
Child support depends only on parent support and selected column. If that child
support strictly chooses reflected orientation, it is known before coordinate
materialization. A fused kernel could publish images in that orientation once.

Mapping: for cell-set reflection r and played cell c,
r(X minus {c}) = r(X) minus {r(c)}. Reflection preserves subset inclusion, so
upset closure transports too. The reflected target basis must be sorted under
the same global IDs; reflection is not permission to reuse original local bit
indices. For support-symmetric children, the current residual-coordinate tie
comparison remains necessary and this shortcut alone does not select a side.

Performed falsification: all 16 subsets and four removals in a 2x2 geometry,
**64 commuting cases**, plus reflection involution. This is an abstract control,
not evidence that the current full-profile fusion exists or is faster.

Preserve action labels, root mirror witness, orientation XOR carried into
physical live-line scoring, terminal metadata, scratch lifetime and supported
geometry contracts. Residual: reflected basis construction/mapping may remain
most of the work; specialization or dispatch may offset saved copies. Next
step is a differential prototype inside the existing JSMinSys coordinate
kernel, not an adapter. Require identical child keys, bases and transported
actions before measuring whole-operation cycles. No production change here.

## R1 — Do not delete physical live-line state on apparent redundancy

The live-line carrier records whether each original geometric line is still
unblocked and scores candidate incidence by counting those lines. The RBA
coordinate is an upset of residual requirements; support-local shape IDs can
collapse contributions from multiple originating lines. Equal-looking masks
or preserved WDL do not establish equal line multiplicity or move-order score.

Residual decomposition: support can supply landing height; orientation can
transport a column; residual membership supplies remaining requirements.
The unresolved part is recovering origin-line incidence/multiplicity from
those components for every reachable position. A function proving that recovery
or a reachable counterexample is still needed. This campaign found neither and
does not assert universal impossibility. Removal is **not admitted**; changing
the heuristic intentionally would be a different candidate needing measurement.

## R2 — Eight workers do not create eight independent search orders

The worker binds orderOffset to index modulo column count. For seven columns,
worker 7 repeats worker 0's nominal order. Recursive score sorting is stable,
so the rotation changes tied priorities; root action priority is shared. Shared
cache timing can still differentiate traces. This explains a mechanism for
duplicated work, not a quantified attribution of the observed slowdown.

The existing matched four/eight-worker report shows increased aggregate visits
without an extra completed benchmark case. Those visits include duplicate
states and are not an exact-proof progress metric. More workers can consume
nearly twice the aggregate CPU cycles while raising visit throughput. No new
benchmark was run during this source-rendering/DP campaign.

Prior wider recursive spread raised total cycles; root rotation failed the
deterministic-witness control. Therefore this campaign does not promote either
as a fresh improvement. Preserve the prior failures. A new scheduling candidate
would need a genuinely different causal mechanism and witness-safe experiment.

## Prior negatives retained; no repeated promotion

Do not promote full sharing from its approximately eightfold increase in hit
count, shared-hit local backfill, persistent cache reuse, simple shifted-slot
decorrelation, broader recursive spread or root rotation. The prior all-leads
report gives the individual rejected/mixed outcomes. More reused facts can
still increase total cost through traffic, displacement and duplicated search.

Route-8-only protection remains the existing unfinished, separately scoped
candidate. It is not renamed as a new DP discovery or claimed successful here.
Likewise, reuse of already-known hash values was reverted by the
[pinned JSMinSys baseline commit](https://github.com/iteathen/JSMinSys/commit/04d37498607ace16dae33c79462ddfe1503c8a0d),
whose subject is `revert(lazy-smp): reject known-hash reuse`; it is not
automatically a win because it removes source operations.

## Results, limits and next experiment

Three candidate formulations are retained, ordered C1, C2, C3. Two tempting
directions are constrained by explicit residuals/prior evidence. No exact
whole-structure isomorphism, natural identity theorem or measured optimization
is promoted. QU cost/schedule alternatives remain open. Low-level name/layout
coincidence routes were demoted because the actual ordered operations supplied
stronger support; there was no reason to run a ceremonial exhaustive 45-route
checklist or another external campaign.

Recommended next execution unit: implement C1 alone in JSMinSys, qualify native
cofactor equality across both players, terminal states, induced bases and
reflection, then compare total cycles and solve latency on identical roots with
four workers and unchanged limits. Use the applicable NEES whole-operation
qualification; this research report does not itself qualify production changes.
Count total nodes and cycles/node as
diagnostics; accept only whole-operation benefit with unchanged result/witness.
Do not combine C1-C3 in one benchmark and lose causal attribution.

Reproduce local discovery evidence from this directory:
`node discovery-support.mjs` and `node discovery-controls.mjs`.
The latter's result is [discovery-controls.json](discovery-controls.json).
Production code, BSFP, active solver branch, memory limits and timeouts remain
unchanged. The output of this request is an admitted representation and a
source-grounded discovery campaign, not an implemented optimization campaign.
