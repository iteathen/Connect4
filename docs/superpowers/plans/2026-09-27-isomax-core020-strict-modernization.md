# IsoMax Core 0.20 strict IsoGraph modernization plan

**Date:** 2026-09-27 (author-local)
**Status:** execution checkpoint
**Owner branch:** `research/semantic-quotient`
**Work branch:** `work/isomax-core020-strict-20260927`

## Live pins recovered before execution

- Connect4 research authority: `ad92c3a5d044d3a1aed67e364b723b8d7ca3b312`
- latest research-integrity run at recovery: `36368807525`, PASS
- IsoGraph main: `84e2f4d2386f9cd1a7b2c533752600eee82e44bf`
- current integrated semantic authority:
  `Core 0.17 + 0.18 + 0.19 + 0.20 + QU 0.1 + NEI 0.4 + DP 0.1–0.8 + DTS 0.1`
- Core 0.20 SHA-256:
  `9a619b552a6ef7719e5b4b5f3a9df4a732ff4377b9bc7b86c385ed5c992b88e7`

## Predecessor preserved

The qualified predecessor is
`research/isograph/discovery/2026-09-26-isomax-core019/`.

It remains historically qualified for its frozen Core-0.19 exact-source scope.
This modernization MUST NOT rewrite its packet, qualification, DP results,
controls, or discrepancy history.

## Goal

Create a versioned Core-0.20 successor whose authoritative support bottoms out
in primitive logic or justified raw carrier/data atoms. ECMAScript, Node,
worker, queue, cache, solver, arithmetic, transition, and other definable
semantic constructions may remain as derived navigation views but may not be
load-bearing leaves.

## Admission gates

1. Audit every predecessor semantic-leaf family and classify it as
   `CLOSED_PRIMITIVE`, `DERIVED_VIEW`, `RAW_DATA_ATOM`,
   `QU_UNEXPANDED`, or `REJECTED_AS_LEAF`.
2. Represent primitive closure natively. English/JSON may audit or index it but
   may not provide meaning absent from the native IsoGraph bundle.
3. Preserve exact reverse mapping from derived syntax/domain views to primitive
   support.
4. Arithmetic and computation behavior must route to explicit primitive
   relations rather than familiar operator or runtime labels.
5. Unknown external scheduling/timing/JIT/hardware behavior remains QU; no
   deterministic schedule, probability, or cost claim is invented.
6. Remove every `DERIVED_VIEW` in a firewall test and verify that the declared
   exact primitive claims remain supported.
7. Adversarially relabel derived views and verify the primitive kernel is
   invariant.
8. Reconstruct the frozen source-semantic boundary from the primitive bundle
   plus raw data, with no semantic sidecar.
9. Run NEI only on expanded support where identity is material; do not infer
   sameness from shared high-level names.
10. Apply DTS to load-bearing transition structure and preserve QU at unresolved
    transition/environment boundaries.
11. Record any irreducible missing definition as `QU_UNEXPANDED`; do not
    promote it to a primitive leaf.
12. Do not claim Core-0.20 qualification until fresh independent controls pass.

## Execution units

### A. Audit and native closure contract
Create `research/isograph/discovery/2026-09-27-isomax-core020/` with:
- a frozen authority/source manifest;
- a primitive-closure ledger;
- a native primitive vocabulary/kernel;
- a derived-view reverse-map contract;
- an explicit QU boundary ledger.

### B. Mechanical verification
Add checks for:
- native parse/delimiter integrity;
- closure-ledger completeness;
- no load-bearing `REJECTED_AS_LEAF`;
- no hidden domain leaf in authoritative paths;
- derived-view deletion firewall;
- derived-label relabeling invariance;
- exact occurrence/reverse-map coverage;
- preserved predecessor pins.

### C. Reconstruction and sameness
Verify the successor retains the predecessor's frozen source meaning at its
declared boundary while moving semantic authority below the old ECMAScript/Node
leaf layer. Keep transport equivalence separate from semantic qualification.

### D. Review and promotion
Freeze results, open a PR to `research/semantic-quotient`, run
`research-integrity`, and only then state the strongest supported disposition.
If any load-bearing definition remains unresolved, leave the successor
explicitly candidate/QU-bounded rather than weakening Core 0.20.
