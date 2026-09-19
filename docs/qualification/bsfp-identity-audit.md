# BSFP reusable-fact identity audit

Issue: #61. Scope: solver/cuda-bsfp, P2 retained; RBA reference v1.
Contracts: C4-0006/0007/0008/0009 as updated 2026-09-19.
No q-level SAME is lifted to proof/certificate SAME.

| Implementation site | Domain and exact equality / completion guard |
| --- | --- |
| residual-winspace: normalizeResidualRequirements, residualRequirementsKey, residualStateKey; residual-frontier buckets | Q_ITEM. Exact normalized BigInt DNF terms, support and explicit side; geometry is local to caller. Bucket rejects different support/side. Public shared keys must additionally use gameplayIdentity's geometry scope. No generic proof reuse. |
| wsl-requirement-lattice: requirement dictionary, closure words, dominance | REPRESENTATION_ITEM implementing ordinary q order. Geometry-owned mask dictionary and full packed closure inclusion. No hash-only comparison; local IDs cannot move between lattice instances. |
| reference-solver / symbolic-mtbdd unique, apply, restrict, ite | REPRESENTATION_ITEM. Manager-local full variable/child tuples; operation name; root/variable/assigned bit; or predicate/true/false IDs. Manager instance owns ID namespace. Support-indexed roots finalize only after all legal actions. |
| ownership-antichain-solver, rolling-solver, packed42-rolling-solver | REPRESENTATION_ITEM. Full BigInt or exact 42-bit integer mask; geometry, support, polarity and P0 ownership meaning are invocation/frontier context. Up/min and down/max separate. Rank maps contain completed frontiers only; child and current rank distinct. |
| compact-hybrid prepareSupport / reduceIntersectionStages / finalizeSupport | REPRESENTATION_ITEM. Child lookup is geometry-local exact support; polarity fields separate. Cofactors have no memo cache. Terminal cones remain support/mover-specific. Every action and every Cartesian tile completes before parent publication; terminal exclusion precedes losing-frontier publication. |
| compact-hybrid reflection | REPRESENTATION_ITEM. Canonical support chosen by exact numeric comparison; complete masks are reflected back before use. Reflection permutes cells and preserves subset order. No proof premises or evidence occurrence is merged. |
| packed-antichain-42-collective / segmented-packed-antichain / dominance programs | REPRESENTATION_ITEM. Both low32 and high10 words participate in equality/subset checks. Cardinality selects work order only. Duplicate-first checks both words; no cardinality or digest is identity. Segment/direction/owner context is supplied by the caller. |
| packed42 pair reducer services | REPRESENTATION_ITEM. Each job has its own segment offsets, direction and parent owner. Overflow regeneration must reproduce the complete job; output status is checked before use. No cross-job result cache. |
| tensor overflow normalizer: seen / contexts | REPRESENTATION_ITEM. Per-job/per-cardinality Set stores the exact low+2^32*high mask, after high-bit and popcount validation. contexts caches execution plans by direction under one fixed session/configuration; this is resource reuse, not value/proof equality. Tensor exact 42-bit dot products classify full subset relations. |
| compact-ownership program / plan | REPRESENTATION_ITEM. Geometry/rank/support slot/polarity plus full low/high records. Result API requires complete schedule and zero semantic/capacity errors, not administrative operation completion alone. scheduled Map and binding Set are telemetry/resource-name bookkeeping, not proof identity. |
| dense-symbolic-4x3 | REPRESENTATION_ITEM. Exact bounded support × ownership assignment address under fixed geometry. Full static rank barrier before consuming children; first-win overrides child continuation. |
| OQS cofactor / factored mapping, fixtures | REPRESENTATION_ITEM. Residual pair payload dedup is full sorted win/loss lists; crossing ownership remains an occurrence field. Pair IDs are table-local. Final target key includes crossing mask plus full pair. Fixtures use set equality; SHA-256 is a diagnostic reproduction checksum only. Mapping checks all upstream statuses. These are historical qualification experiments, not new q interning. |
| rba-wdl-reference normalizeBoundary / fiber shape IDs | VALUE_BOUNDARY_ITEM. Complete BigInt generator, support-local exact residual-shape dictionary and revision; canonical sorted boundary. Shape IDs/bit positions are fiber-local, not global. |
| RBA cofactor min/max caches | VALUE_BOUNDARY_ITEM coordinate operator. One instance binds exact parent/child fiber, landing action, owner polarity; separate >= and <= maps keyed by complete child upset. No cache escapes its action. |
| RBA completed map / four fronts | VALUE_BOUNDARY_ITEM. Invocation geometry/revision + exact heights + named threshold and polarity + canonical generators. Side follows standard rank parity. All children and actions must finalize before publication. |
| future shared q / proof reuse | identity.mjs explicitly binds cache to domain, geometry and profile revision. Q payload is exact normalized residual state. Proof payload additionally includes declared premise schema and ALL supplied premises. Boundary payload includes support, threshold, polarity and full generator. Cross-domain/profile access throws. |
| NDC certificate sharing / proof-state finalization | No maintained NDC certificate-sharing or guarded-obligation implementation is present in this lane. A value frontier is an ordinary-value artifact, not PROOF_ITEM. A future proof producer must demonstrate premise-schema completeness; the key utility does not prove its guards. |

## Qualification

node --test components/bsfp/test/identity.test.mjs

- A real pair of distinct reachable physical boards with equal q shares the
  same ordinary WDL; representation keys remain distinct.
- Equal q with different deadline/resource/reservation premises cannot retrieve
  the stored proof fact. Missing required premises are rejected.
- Changed proof revision and intentional Q/representation/proof/boundary domain
  access are rejected.
- Boundary threshold, polarity, support, geometry and profile revision remain
  distinct.
- Exact serialization preserves types and refuses unsupported/omitted data.
- Existing actual P2 recurrence tests cover every reference frontier, both
  polarities, mirror orientation, varied shards, tile completion, failure
  cleanup, and high-word cells. No P2 recurrence/reducer code changed.

The legacy low-level helpers remain geometry-local; this audit does not authorize
sharing their naked strings, pool IDs, masks or structural projections across
profiles. Full identity keys are comparison data, not proof that a certificate
was derived correctly.

