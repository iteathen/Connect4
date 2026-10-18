# True 7×6 counterexample: geometry and parity cannot determine perfect-play Level 2

**Frozen source before validator:** `docs/research/2026-10-17-no-search-level2-direct-source-proof-candidate-program.md`.
**Independent physical falsifier:** `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-same-heights-different-L2-physical-falsifier.mjs`, exact blob `853f99b447d98b0ec88bb6a796e0534ad4483aed`.
**Results:** `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/STANDARD7X6_IDENTICAL_GRAVITY_SUPPORT_DIFFERENT_WDL_AND_L2_RESULTS_0_1.json`.

**Status:** independently checked real standard W=7,H=6,K=4 source negative; mathematical single-support-owner-info insufficiency; NOT proof that a richer q-derived no-search algorithm is impossible.

## Exact counterexamples

**WDL differs despite identical geometry:** On ply 36 with heights `[3,6,6,6,3,6,6]`, P0 to move with legal columns {1,5}, both positions have identical row release, height-gradient, XOR column-phase gradient and original K-line geometry.

- Legal first-win-stopped history `176233462722464426755463717326315734`: **V=-1**, complete perfect-mode Level-2 best columns **{1,5}**, normalized source residual counts R0=1,R1=4.
- Different legal first-win-stopped history `413374727463414426632166226237753755`: **V=+1**, complete Level-2 best columns **{5}**, residual counts R0=1,R1=3.

**Level 2 labels differ EVEN WHEN scalar WDL agrees:** On ply 40 with identical heights `[5,5,6,6,6,6,6]`, P0 to move with legal columns {1,2}:

- Legal history `4645277416674332116163135555352234477276`: **V=0**, complete Level-2 best columns **{1}**.
- Legal history `5516453267116323455516366277721732374444`: **V=0**, complete Level-2 best columns **{2}**.

Validator sampled 4,800 first-win-stopped genuine standard7×6 trajectories, collected 17,451 actual late source roots and found both witness categories after inspecting 129 positions. All four decisive physical references were rechecked by the independent exact residual-q solver; no mismatches.

**Consequence:** A classifier based ONLY on height `h`, height-gradients `Delta`, relative parity `g`, turn parity, legal columns and immutable original winline incidence cannot produce full perfect-play outcome or complete Level-2 action sets. The current owner-tagged surviving original source residual families `R0,R1` (or equivalent information) are essential. This rejects **height/phase-only**, not direct source strategy invariants, cross-line adaptive blocker theorems, or other proposed full-q structural algebra.

Reference oracle intentionally branches. The primary research goal is still ZERO separately evaluated inequivalent strategic game futures; no value produced at canonical `44444`. Qualified IsoGraph 1.2 unchanged.