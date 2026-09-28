# Next measured operation class: private tag publication

2026-09-28. Status: hypothesis/planned; no runtime implementation or timing yet.
Base: be7c2887defcefb37080fa61de7ce1dc38dc2990.

## Evidence and novelty boundary

The packed-private-tag plan identified private metadata access at every searched
node and at least28.36% exact private hits in its historical winner. The current
completed4-worker control visits4.579M nodes and records1.609M shared stores on
average; shared publications are only a subset of private publication work.
This identifies a frequent operation class, not a measured isolated cycle share.

Current source constructs `((cache.epoch<<3)|value)>>>0` for each private exact,
weak and coalesced draw publication. Epoch does not change inside a solve.
The existing private-tag experiment packed stamp/value traffic, but did not
prepare the shifted epoch at reset. Source/history searches for epochTag,
epochBase, tagBase and epochPrefix found no implementation in fetched JSMinSys
branches; this is a scoped search result, not a universal novelty claim.

## Candidate to assess before implementation

Prepare the current shifted epoch prefix once at cache creation/reset. Use it
for exact/weak/coalesced publication. Keep epoch ownership,29-bit wrap clear,
full-q hash, compact keys, private codes0..5 and shared exact-only semantics.
Compare a realization that preserves the existing epoch probe against one that
uses masked-prefix equality, if supported by a precise cost/contract argument.
Do not add two competing runtime variants before selecting the smaller test.

For valid codes, prefix+value can represent the same uint32 tag without shifting
the epoch on each store. Its JS Number/int32/JIT cost is unknown; do not assume
addition is cheaper. A cached derived field has cold maintenance cost and may
affect object layout. Count those costs and all hot loads/conversions.

Do not replace generation equality with a one-sided monotone comparison unless
the entire public cache contract proves future-generation tags impossible.
Do not alter public exact-value semantics or silently accept invalid code inputs.

## Guards and falsifiers

- Exact values1/2/3, weak4/5, same-q coalescing and exact-row priority unchanged.
- Ordinary reset invalidates old rows; maximum29-bit epoch and wrap clear tested.
- High-bit unsigned tag values and cold prefix initialization tested explicitly.
- Nonstandard geometry and generated behavior/frontier variants stay coherent.
- Full source/cycle-ledger/generation checks and normal Verify before timing.
- No new table, cache resize, weak shared value or hidden prior information.
- Four workers1wide+3deep; primary353335714, eight balanced pairs, fixed clean
  sources, Node26.7.0, shared4194304/private1048576/mask0.
- Whole-process cycles95% interval must establish improvement. A lower store
  operation count alone is not acceptance; reject if loading/maintaining the
  derived field or JIT effects erase the expected saving.

The separate inherited CPC interval-ledger undercount must remain tracked as an
accounting defect, not be conflated with this runtime hypothesis or credited as
a speed improvement. The CPC proof-mask rejection is not reopened by this plan.
