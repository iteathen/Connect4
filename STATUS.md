# Connect4 Isometric implementation status

**Updated:** 2026-09-17  
**Branch:** `solver/isometric`  
**Solver family:** Isometric  
**Research direction / structural architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

This branch is an **implementation lane**. All durable research authority—including structural derivations, theorem development, hypotheses, research experiments/results, falsifiers, negative results, and research evidence—belongs on `research/semantic-quotient`.

The Isometric solver consumes canonical research; it does not own a separate research corpus.

## Solver-family boundary

Isometric is a first-class solver family governed by C4-0011. It is distinct from Minimax/Negamax, CUDA-BSFP, Hybrid Confluence, and SUT.

Historical descent from the terminal-frontier experiment does not make Negamax semantics or branch ownership authoritative here.

## Current implementation

The maintained implementation uses native Isometric/WSL state and exact recursive resolution for residue not closed by structural consequences.

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

1. exact transition/certificate cache economics;
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
