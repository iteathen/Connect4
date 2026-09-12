# Connect4 frontier-native forward-solver audit status

**Updated:** 2026-09-12  
**Branch:** research/frontier-negamax-conformance  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

The line-by-line correctness/compliance audit is in progress. **Standard 7x6
root admission remains blocked.** The current audit ledger is
[full-engine sanity audit](docs/research/2026-09-12-full-engine-sanity-audit.md).

C4-0001 owns legal game semantics, C4-0006 CPC/WSL structural meaning,
C4-0007 strategic dependency premises, and C4-0010 the exact forward proof
procedure. Semantic identity remains support plus separate normalized P0/P1
residual requirements, with exact equality after hash filtering. No new CPC/NDC
implications are claimed.

## Preserved qualified work

The handed-off engine has separate semantic and proof state, stable local proof
keys with adapter-owned generation rebinding, direct canonical residual term
materialization, fail-closed workers/executor, transactional ExploreHint
completion, sealed coordinator diagnostics, frontier-primary ordering with proof
hints only breaking equal-score ties, and poisoned failed TT installs. The root
harness defaults to split depth 3 and records authoritative proof time separately
from detached cleanup.

Revision-2 root run 34676507073 is historical: it ended without a root proof near
15.7 GB RSS. It is not an active run. Its descriptor representation and split
depth 8 are superseded. See the audit ledger for exact historical evidence.

## Current continuation

Started from verified head 83dfe6f32c0cb6dcafa8bdfaee8f7dcc276030e2. Packed proof
storage now rejects unknown/malformed arena contracts and invalid W/D/L records
before coercion. A reproduced replacement-before-proof-lock race no longer
strands the acquired generation in PROOF_WRITING. Five targeted controls and
bounded replacement, stale-generation recovery, dependency-aware and ExploreHint
campaigns pass locally on Node 26.7.0. Remote qualification is pending this packet.

Next: complete TT shape/reset/counter/chunk/probe audit, then semantic identity,
slot64 residual and state/support storage, exact engine, coordinator, worker and
Branch Manager lifecycle, root harness, and bounded workflow dependencies.

## Readiness

Do not change standard7x6-root-qualification-revision.txt or launch a full root
until the complete active import graph is consciously reviewed, correctness and
lifecycle defects are resolved, all relevant bounded lanes pass, and the ledger
records a final readiness decision. Run at most one integrated root afterward.

Priority probing, ETC, stored-state hashes, large capacity tiers and replacement
pressure remain performance hypotheses. Do not retune them merely because a
correctness packet passed. Complete cheap U1/U2/NDC forward integration is not
established.
