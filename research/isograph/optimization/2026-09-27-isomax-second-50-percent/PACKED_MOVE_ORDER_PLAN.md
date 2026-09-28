# Phase-2 continuation — packed move-order rows

Date: 2026-09-28. Status: planned experiment, not selected.

## Live reconstruction

Selected solver remains `f2d56c2788ef3a4c49fc4bef9d447c5be3184059`;
JSMinSys PR #114 is open/draft at `49ca575b1e98640cab1ebccf8429eb23f9cd4f0f`.
PR #84 remains open/draft at `40b63f3c51f37e22ef7c58b33ce0002f6de15ec9`.
Canonical research was `609f61455a09720bb2ff52979da99081c29bbd08`.
No later solver experiment was found in the fetched branches/PRs.

The later fixed-source packed-tag rerun 36455549930 is additional evidence,
not a replacement for the original qualification. Artifact 10985388398,
SHA256 `1659777e1545f48eefbe44cbf6296cd7b5d1ab552042d4f67da1e8f24739ce51`:
16/16 exact (-1, move 4), cycles -0.761%, paired 95% [-1.647%, +0.125%].
It is directionally consistent but does not independently qualify. Preserve
both runs; do not claim each repeat establishes improvement.

The unpromoted Connect4 branch `research/isomax-core020-dp-dts-20260927`
at `331592f3` records two rejected CPC close-only realizations (PR #95).
Its shared-miss-stutter diagnostic targets the old all-noncutoff shared
fallback, which is absent from the selected baseline. Do not resurrect that
rejected path merely to execute an obsolete diagnostic plan.

IsoGraph main `e140656` retains qualified Core 0.20 / DP 0.8, integrated with
QU 0.1, NEI 0.4 and DTS 0.1 (Experiment 052). Its newer continuation-support
synthesis requires preservation *and* cheap next-operation access. It does
not license existential dominance pruning across alternating Connect4 turns.
The IsoMax IA fixed point explicitly separates advisory ordering, scalar
identity, orientation and task occurrence; it is not a speed proof.

## Prior work consulted

Read the complete recent Phase-2 plan/result/census chain, the Core-0.20
primitive semantic contract and closure reports, and the unpromoted DP/DTS
close-only/stutter work. Historical source/history searches included live-line,
CPC, cofactor, ordering, shared caches and best-child witnesses.

Load-bearing antecedents:
- `docs/research/2026-09-24-live-line-evaluator-lineage.md`: fused live updates,
  stable insertion and fused popcount retained; two-pass best-first rejected.
- `ORDERING_NODE_AUDIT.md` in the total-cycle campaign: changing ties or worker
  diversity changes visited work substantially. Preserve both exactly.
- `QUOTIENT_BEST_CHILD_RESULT.md`: witness reuse is conditional, not a free win;
  current scalar caches do not own a reusable child/action witness.
- latest lazy-upper-bound result: repeated scans cost more than skipped scores.
- compact shared/private and packed-tag results: reduce representation traffic
  only with exact reconstructibility and completed-solve measurements.

## Bounded hypothesis

Current stable insertion moves two separate fields for each shifted sibling:
score scratch and per-depth column. Carry score and column in one uint32 row
entry so a shift needs one load/store pair. This does not skip scoring; it tests
a cheaper realization of the retained one-pass insertion algorithm. No selector
rescan, child reconstruction, new cache field, witness, pruning or role policy.

Preparation chooses b=ceil(log2(columns)), stride=2^b, mask=stride-1.
Enable only for b<31 and lineCount <= (0xffffffff >>> b); this conservative
geometry guard proves every live-line score fits. Entry=(score<<b)|column.
The comparison threshold is (score<<b)>>>0. A prior entry >= threshold iff its
score >= the incoming score: its low column bits cannot cross a score boundary.
Thus equal scores remain stable in the existing worker-specific action order.
Decode column by entry&mask. Outside the guard, retain the existing two-field
path. Root rows remain ordinary columns; recursive rows are disjoint by depth.

Source invariant: exact score/column pair plus stable order.
Target: packed pair with inverse decode. Discarded information: none.
Legal transitions, CPC filtering, reflection transport, bounds and exact cache
publication are unchanged. No identity quotient or gameplay theorem is added.
The cost risk is packing/decode and the cold-selected branch paying more than
the removed memory traffic. Reject if whole-process cycles do not improve.

## Execution plan

- [ ] Isolated JSMinSys branch from exact f2d56c27; baseline checks.
- [ ] Add regression for geometry guard, maximum fields, stable ties and actual
  recursive packed-row behavior. Observe RED before source changes.
- [ ] Change canonical alpha-beta preparation/recursive insertion only. Generate
  behavior/root-frontier variants using existing tools; never edit mirrors.
- [ ] Update all affected function cycle scenarios, operation counts and actual
  generated Git blob seals together. Run catalog/coverage/freshness checks.
- [ ] Differential ordered-node traces at multiple worker order offsets and
  mirrored/late roots; existing independent-oracle and worker tests; full Verify
  equivalents before timing. Serial internal correctness traces are not a
  single-worker performance qualification.
- [ ] Commit fixed candidate; eight balanced AB/BA pairs in fresh Node26.7.0
  localhost processes, four workers = 1 wide + 3 deep, rootFrontier=true,
  shared4194304/local1048576, mask0, fixture353335714. Capture full JSON,
  process cycles, CPU/wall/nodes/winner/per-worker/shared/RSS and environment.
- [ ] Whole-process paired cycle interval must be wholly below zero to qualify.
  Report all samples; no favorable-sample selection. If promising, use existing
  hosted protocol for independent qualification. Hard35333571 remains optional
  secondary censored control at unchanged120000ms; no unrelated campaign.
- [ ] Commit/push raw evidence, analysis and accepted/rejected disposition in
  JSMinSys and matching canonical Connect4 result. No PR84/114 merge.

Use inline execution (executing-plans skill); tests and cycle accounting are
part of each implementation unit. No change to production pins without evidence.
