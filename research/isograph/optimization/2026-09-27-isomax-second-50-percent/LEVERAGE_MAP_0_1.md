# IsoMax Phase 2 leverage map — initial checkpoint

Date: 2026-09-27
Status: research shortlist; Phase-1 winner confirmation still active.

## Governing target

Phase 2 seeks another cumulative 50% improvement from the qualified Phase-1
winner. Whole exact-solve effectiveness is the target; node count and
cycles/node are both means, not ends.

## Historical leverage that should guide Phase 2

### 1. Search-tree reduction is high leverage but must reuse transition work

Recovered evaluator/search lineage shows:

- live-line move ordering historically cut a representative Fhourstones tree by
  about 49.3%;
- residual maturity ordering cut a qualified small cohort by about 21.5%;
- exact winspace/quotient reuse cut one controlled cohort by about 31.2%.

But several versions became slower because they recomputed child transitions,
added expensive representation work, or over-materialized ordering.

Durable rule:

> A node-reduction strategy should consume work the solver already needs or make
> that work reusable. Recomputing child state solely to decide order is a known
> regression pattern.

### 2. Full-order materialization has already been attacked

Historical JSMinSys work retained:
- fused live-line transition;
- stable insertion-order materialization;
- branchless/fused live-line popcount work.

A two-pass best-first-only form was rejected despite slightly fewer nodes because
its production timing regressed materially.

Do not rediscover:
- score child, discard transition, then recompute transition;
- naive two-pass best-first;
- branch-per-word zero skipping in the live-line scorer;
- parity-dominant generic ordering.

### 3. Exact witness / best-child reuse remains structurally interesting

The quotient-native best-child campaign showed that a single already-materialized
child witness can support transition reuse / ETC without a full state×columns
edge table. Its effect was workload-dependent but the mechanism is attractive
for Phase 2 because:

- exact-cache/TT information already exists;
- it can reduce nodes or avoid child reconstruction;
- it need not import solved-game answers;
- it is potentially much cheaper than broad edge storage.

Before implementation on current IsoMax, audit whether the present exact cache
already exposes a reusable move/witness or whether adding one would enlarge the
hot entry enough to lose locality.

### 4. CPC should be split by economic role

Prior factorial evidence established:
- tactical CPC restriction/loss information can prevent large tree growth;
- some predictive CPC work costs more than the search it removes;
- removing all CPC or collapsing it to a single “on/off” variable is wrong.

Phase-2 CPC experiments should target:
- selective invocation;
- reuse of already-derived CPC facts across child/order/cofactor consumers;
- rank/depth/economic gating;
- proof of total solve-cycle reduction, not CPC-local speed.

### 5. Quotient / semantic compression is a candidate only when representation
cost is cheaper than the avoided search

Exact quotient/winspace reuse has produced substantial node reductions in
controlled cohorts, but broad replacement sometimes lost elapsed time.

Phase-2 test rule:
- measure hit/reuse concentration first;
- use small/bounded exact witness structures before broad state×action tables;
- preserve current q identity/provenance;
- reject a representation that reduces nodes but raises whole-solve cycles.

### 6. Parallel work is secondary unless the search kernel changes

Lazy-SMP investigation already rejected:
- shared-hit private backfill;
- shifted shared slots as a global replacement;
- root/spread diversity variants;
- cross-invocation shared-cache persistence;
- wake-driven wait replacement.

Do not begin Phase 2 by revisiting these.

Parallel experimentation becomes high-value again only when:
- Phase-2 search changes alter exact endpoint availability;
- worker trees become substantially more/less overlapping;
- a new witness/ordering mechanism changes sharing economics.

## First Phase-2 measurement matrix after Phase-1 freezes

Re-profile and collect one whole-solve census on the exact qualified winner:

1. total process cycles / wall;
2. nodes / cofactors;
3. node rank/depth distribution;
4. branching-factor distribution after CPC restrictions;
5. exact-cache hit distribution by rank;
6. CPC exact/bound/restrict/forced distribution by rank;
7. move-order first-child cutoff rate and winning-child rank;
8. fraction of nodes where an exact-cache/proof witness exists before ordering;
9. amount of child/cofactor/live-line work computed for siblings never searched
   because an earlier child cuts off;
10. support/q reuse concentration for any proposed semantic witness.

The next Phase-2 experiment should come from the largest avoidable whole-solve
work found by this matrix, not from syntax-level code inspection.

## Initial candidate families

Priority order is provisional until the winner census exists:

A. **Already-owned witness first**
   - promote/reuse an exact TT/proof child hint without constructing a new broad
     edge table;
   - test as primary order or equal-score tie-break depending soundness.

B. **Lazy child materialization**
   - avoid computing full sibling order/transition metadata for siblings never
     visited;
   - preserve retained insertion-order economics and do not repeat rejected
     best-first recomputation.

C. **CPC economic gating/reuse**
   - identify predictive CPC calls that provide no pruning-relevant result;
   - gate only with a cheaper rule-derived predicate.

D. **Structural q/quotient reuse**
   - small exact witness/transition reuse before full semantic cache expansion.

E. **Algorithmic search-window redesign**
   - only after current fail-high/fail-low/exact-publication rates are measured.

## Durable negative list

Do not repeat without new evidence:
- broad CPC removal;
- predictive no-win work assumed universally useful;
- recomputed child transition for move scoring;
- parity-dominant generic ordering;
- naive two-pass best-first ordering;
- per-word branchy live-line zero skip;
- Lazy-SMP cache-backfill / shifted-slot / persistence campaigns;
- broad quotient representation justified by node count alone.

## Repository checkpoint policy

Commit after:
- every experiment plan;
- every material diagnostic/census;
- every accepted or rejected arm;
- every change to the current winner/denominator.

Do not leave a Phase-2 hypothesis/result solely in chat state.
