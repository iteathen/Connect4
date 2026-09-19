# Connect4 Isometric implementation status

**Updated:** 2026-09-19  
**Branch:** `solver/isometric`  
**Solver family:** Isometric  
**Research direction / structural architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

This branch is an **implementation lane**. All durable research authority—including structural derivations, theorem development, hypotheses, research experiments/results, falsifiers, negative results, and research evidence—belongs on `research/semantic-quotient`.

The Isometric solver consumes canonical research; it does not own a separate research corpus.

## Solver-family boundary

Isometric is the active forward structural solver family governed by C4-0011. CUDA-BSFP is the active backward solver and SUT is their future composition lane. Minimax/Negamax and Hybrid Confluence are historical lineages.

Historical descent from the terminal-frontier experiment does not make Negamax semantics or branch ownership authoritative here.

## Research-coupled update readiness — 2026-09-19

The IsoMax implementation lane is aligned for a research-coupled update pass.

Stable execution boundary:

```text
q-native gameplay state
  -> exact transition cache
  -> native frontier consequences
  -> guarded proof/certificate consequences
  -> qualified q/RBA ordinary-value closure when available
  -> recursive exact W/D/L fallback/control
```

The alignment decision is:

- `docs/decisions/2026-09-19-isomax-rba-update-alignment.md`.

Frozen IsoGraph authority 1.1 remains unchanged. Current RBA overlay/QU/topology and late-rank checkpoints are post-1.1 successor research evidence. A value-boundary consumer must pin the exact research revision it consumes and re-check live canonical research before meaningful implementation steps.

The guarded-obligation/proof-value bridge remains a separate stronger proof/certificate seam. It does not block an independently exact ordinary-value RBA consumer.

## Current implementation

The maintained implementation uses native Isometric/WSL state and exact recursive resolution for residue not closed by structural consequences.

### IsoGraph / q alignment

The current implementation is already substantially aligned with the newer canonical research:

~~~text
ordinary gameplay identity:
    q = support + normalized P0 residuals + normalized P1 residuals

current exact-value cache equality:
    canonical P0 residual class
    + canonical P1 residual class
    + canonical support
~~~

So the cache is already effectively q-keyed even though the older C4-0011 wording claimed a stronger key including side/status.

Stored `ply`, `sideToMove`, terminal status, support/playable masks and reversible history remain useful runtime fields. They are not all irreducible gameplay-identity coordinates.

Coarse WSL certificate buckets are also intentionally not transition identity: they locate candidate certificates, and guards establish contextual applicability.

The remaining implementation work is targeted rather than a solver rewrite:

1. expose q/gameplay identity explicitly instead of relying on a transition-signature convention;
2. harden proof-identity deduplication so one proof token cannot silently alias different guarded content;
3. add direct q/cross-profile qualification;
4. add and qualify an optional q/RBA exact-value boundary consumer before recursive fallback;
5. implement temporal/resource/realizability guards and guarded obligation birth only when the stronger proof/certificate research seam is sufficiently qualified.

See `docs/decisions/2026-09-18-isometric-isograph-realignment.md`.



Current accepted implementation properties include:

- exact first-win stopping;
- exact mover/opponent residual cofactor updates;
- bilateral residual exhaustion as draw;
- exact immediate-win / forced-reply / double-threat frontier consequences;
- guarded certificate consumption;
- stronger transition identity than coarse WSL retrieval identity;
- recursive fixed-P0 W/D/L backup for unresolved residue;
- native playable-singleton advisory ordering after exact tactical/TT authority.

The previously tested opponent-residual-suppression first-child tier remains rejected for the tested placement because it improved one paired fixture while materially worsening the independent calibration corpus.

## Research dependency

Canonical research authority:

`research/semantic-quotient`

The guarded mixed-owner cofactor obligation theorem, structural calculus, selector/value questions, and other open research seams live there. This solver branch may consume only the currently qualified research result/guard surface.

Historical `docs/research/**` and inherited `research/**` files on this branch are provenance or implementation-experiment records, not current research ownership.

## Current implementation seam

Maintain and qualify the native Isometric solver against canonical research contracts while improving implementation consumers only when the consumed research guard/consequence is already established.

Near-term implementation assessment areas:

1. explicit q gameplay-key API and transition-signature cleanup;
2. proofIdentity/content binding and collision rejection;
3. q-congruence plus cross-profile negative controls;
4. temporal/resource/realizability guard implementation after research qualification;
5. exact transition/certificate cache economics;
2. TT retention/replacement behavior separated from tree-size effects;
3. Branch Manager scheduling only from already-qualified descriptors;
4. shared compiled consequence/effect data only if multiple implementation consumers demonstrate reuse value;
5. native state/transition efficiency without changing research semantics.

No new theorem, hypothesis, research result, or research evidence should be authored as durable authority on this branch. Such work goes to canonical research first.

## Qualification

The Isometric native WSL workflow targets `solver/isometric` and qualifies domain/native WSL behavior under Node 26.7.0.

## Routing

- all research -> `research/semantic-quotient`
- Isometric implementation/contracts/qualification -> `solver/isometric`
- shared accepted product/domain changes -> `main`

See `ISOMETRIC_BRANCH.md`, C4-0011, and `docs/decisions/2026-09-17-single-research-owner.md`.
