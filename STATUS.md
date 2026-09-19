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

The updated-spec implementation pass is qualified. Details and reproducible
measurements: `docs/decisions/2026-09-19-isomax-issue-qualification.md`.

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

`gameplayKey()` exposes exactly this triple; transport is separate and the cache
enforces residual-pool ownership. Full-field comparison remains mandatory.

Stored `ply`, `sideToMove`, terminal status, support/playable masks and reversible history remain useful runtime fields. They are not all irreducible gameplay-identity coordinates.

Coarse WSL certificate buckets are also intentionally not transition identity: they locate candidate certificates, and guards establish contextual applicability.

Completed implementation scope:

1. explicit pool-bound q keys and separate reflection transport (#64);
2. immutable canonical proof payload binding and collision rejection (#65);
3. deliberate physical q-collision and cross-profile controls (#66);
4. optional bounded RBA value closure before forced/recursive fallback (#70);
5. recursive exception restoration and rejection of contradictory no-win bounds.

The RBA consumer remains opt-in: one late root avoids 35 recursive children and
7 forced transitions, but roughly 6.43 ms construction outweighs the 0.086 ms
recursive control. A faster warm query alone does not justify promotion.
Temporal/resource/realizability proof guards and guarded obligation birth (#67)
remain deferred pending qualified canonical proof semantics. Unresolved stays
unresolved; ordinary value is not a proof premise.

See `docs/decisions/2026-09-18-isometric-isograph-realignment.md`.



Current accepted implementation properties include:

- exact first-win stopping;
- exact mover/opponent residual cofactor updates;
- bilateral residual exhaustion as draw;
- exact immediate-win / forced-reply / double-threat frontier consequences;
- guarded certificate consumption;
- stronger transition identity than coarse WSL retrieval identity;
- recursive fixed-P0 W/D/L backup for unresolved residue;
- native playable-singleton effect ordering below the root, with opponent-exposure veto;
- optional bounded ordinary-value membership before forced/recursive fallback;
- recursive state restoration on downstream errors;
- fail-closed contradictory exact/no-win certificate handling.

The previously tested opponent-residual-suppression first-child tier remains rejected for the tested placement because it improved one paired fixture while materially worsening the independent calibration corpus.

The qualified singleton-effect method is now the default native recursive move
order. Root tie selection stays center-first. It consumes the existing WSL
carrier directly; no speculative child or legacy board is created. The paired
96-root evidence showed 26.43% fewer nodes and 17.55% less aggregate median
time, with a small overlapping timing regression on one subset. See
`benchmarks/isomax-ordering/README.md` for qualification and reproduction.

## Research dependency

Canonical research authority:

`research/semantic-quotient`

The guarded mixed-owner cofactor obligation theorem, structural calculus, selector/value questions, and other open research seams live there. This solver branch may consume only the currently qualified research result/guard surface.

Historical `docs/research/**` and inherited `research/**` files on this branch are provenance or implementation-experiment records, not current research ownership.

## Current implementation seam

Maintain and qualify the native Isometric solver against canonical research contracts while improving implementation consumers only when the consumed research guard/consequence is already established.

Remaining assessment areas:

1. temporal/resource/realizability guard implementation after research qualification;
2. actual repeated-query economics before promoting optional RBA closure;
3. transition/certificate cache economics and native transition efficiency.

No new theorem, hypothesis, research result, or research evidence should be authored as durable authority on this branch. Such work goes to canonical research first.

## Qualification

The Isometric native WSL workflow targets `solver/isometric` and qualifies
domain/native WSL plus shared RBA controls under Node 26.7.0. The final local
suite covers domain, Isometric (including native ordering) and RBA. Bounded controls do not prove a
universal quotient theorem, complete proof calculus, or empty-board performance.

## Routing

- all research -> `research/semantic-quotient`
- Isometric implementation/contracts/qualification -> `solver/isometric`
- shared accepted product/domain changes -> `main`

See `ISOMETRIC_BRANCH.md`, C4-0011, and `docs/decisions/2026-09-17-single-research-owner.md`.
