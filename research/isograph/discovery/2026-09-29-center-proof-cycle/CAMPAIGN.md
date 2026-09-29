# Center-prefix proof and cycle campaign

Owner direction: Joshua Oshiro. Started 2026-09-28 local / 2026-09-29 UTC.
Status: OPEN research campaign; no new gameplay authority or runtime adoption.
Strategy owner: GSP-004 guarded obligation closure.

## Questions and frozen boundaries

For one-based prefixes `44`, `444`, `4444`, construct a small rule-derived
certificate of the optimal next-move set. Initially optimal means W/D/L, with
ties retained; distance-to-win/loss is a separate possible requirement.
Do not assume center is optimal or unique. Input consists only of geometry,
gravity, alternating turns, first-win stopping, and the literal prefix.
No solved tables, opening books, prior outcome labels, or best-move labels may
enter the producer. Earlier exact results are validation provenance only.

Separate three burdens: certificate soundness; cost to check it; cost to find
it. A polynomial-time checker does not establish polynomial-time construction.
For a polynomial claim state the board/input family and bound all intermediate
frontiers. Fixed-depth enumeration is a probe, not the desired theorem.

## Live sources recovered

- Connect4 canonical research: d9d4031c24a11bcfd62a0ea02dbb9646429d5efc.
- Prior independent rule-only `44` work: ../2026-09-28-44-geometry-blind/.
  Its exact computations are not a compact structural certificate. Its relaxed
  live-line dominance is explicitly not an adversarial value theorem.
- JSMinSys selected source: 6bbba7c71c60afb1018a22b6d5c03f495f5d2c9e.
  Evidence/launcher head: 68093ae185bb13e60976436a82235e457ae20df4.
- IsoGraph main: e14065689ad1c2183a6363f8e0cb85bd5630dc05;
  qualified Core 0.20 / DP 0.8 routing, with continuation-support synthesis.
- Connect4 logic 1.2 remains current domain authority; RBA algebra-core and
  proof/value boundaries remain load-bearing. No authority revision here.

## First bounded experiments

P1: inspect all roots and action orbits with existing native CPC, retaining
its UNKNOWN result. Independently test a geometry-only leaf vocabulary:
terminal, immediate win, unavoidable double threat, and same-column paired
response under its even-remaining-capacity guard. Report an uncovered residual
as a missing premise, never as a loss or evidence against all structural proofs.

P2: compose these sound intervals over all legal actions to depths 2/4/6.
Memoization is local to each fresh probe, and stores only newly derived bounds.
Keep incomplete leaf counts, per-depth work and action bounds. A diagnostic
physical representation is permitted here only as an independent research
control; it is not a replacement IsoMax solver or production replay path.
Validate against rule-recursive exhaustive small-board values and reflection.

P3: use uncovered obligations to choose a stronger deadline/resource-aware
certificate, rather than increasing depth without a hypothesis. Preserve the
existential action / universal reply quantifiers. Only checked rule-derived
leaves may enter any eventual proof DAG. Do not seed fronts with old outcomes.

C1: investigate duplicated CPC exact-interval checks after the CPC_EXACT
return. Prove the return-kind invariant and check experiment history first.
If valid, isolate a runtime change, update every affected cycle unit and source
seal, regenerate variants, qualify correctness, then use matched fixed-SHA
four-worker exact controls. A branch removed in source is not a measured win.

Opportunity ledger: record further findings with premise, falsifier, total-cost
mechanism and prior-history search. No unmeasured stacking.

## Performance boundary

Use the existing selected localhost profile unchanged:
isomax-four-pcore-10g-576m-i5-12600k-20260928; pinned Node nightly; one wide plus
three deep; 10 GiB shared TT; 576 MiB private per worker; full sharing.
No single-worker performance qualification. Serial proof/correctness probes
are not timing evidence. Primary authority is total process cycles to exact
output, with matching W/D/L and root move; fixed-window throughput is descriptive.
Existing 10-minute empty baseline is retained, not rerun as a ritual.

No gray/column masks, support pooling, new TT identity, BSFP changes or PR #84
merge. Original owner-neutrality already costs zero additional worker work.

## Durability

Commit the plan before probes, then controls/raw observations, then disposition.
Keep canonical findings here and implementation/economics in JSMinSys. Stop a
failed candidate rather than tuning to prior solved labels. This initial pass
starts the campaign; it does not promise a polynomial proof exists.
