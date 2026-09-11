# Searchless closure test — nested dependency proof compression

**Date:** 2026-09-09  
**Status:** research evidence only; maintained source and `main` unchanged.  
**Branch:** `research/low-confidence-survival-2026-09-09`

## Question

Can the exact Connect Four proof be represented as a small nested dependency object rather than as the move/state tree, supporting the stronger hypothesis that a future solver may derive the result by algebraic closure without ordinary search?

This batch deliberately separates two claims:

1. **proof-object compression** — does the complete game graph collapse to a much smaller dependency grammar once board identity is removed?
2. **direct searchless derivation** — can that grammar be generated from geometry/U1/U2 without first enumerating the game graph?

The first is tested here. The second remains open.

## Method

The Node-only harness performs two phases.

### Phase A — neutral control graph

Enumerate every reachable nonterminal state from the supplied root and every legal edge. Immediate winning moves are terminal facts rather than child states.

This phase is intentionally expensive and supplies the complete control graph. It is **not** claimed as the desired searchless algorithm.

### Phase B — bottom-up dependency fixed point

No recursive minimax is used in this phase. States are processed from greater ply to smaller ply and replaced by interned dependency signatures.

For W/D/L relative to the player to move:

- `T:W` — immediate terminal win;
- `W:x` — one already-proved losing-child dependency is sufficient as a witness;
- `L:x,y,...` — every distinct child proof class must be winning for the opponent;
- `D:d|x,y,...` — one draw witness plus proof that every non-draw child is winning for the opponent.

For a winning/drawing witness, the already-derived child with the smallest proof-tree cost is chosen. Identical dependency signatures are hash-consed regardless of physical board identity.

A stricter **action-labeled** control includes the move column on proof edges, so it measures compression of an executable strategy grammar rather than only logical outcome structure.

The harness also records a conservative exact-distance dependency quotient. That control retains every distinct child exact proof shape and is intentionally much less compressed than the W/D/L proof.

## Complete small games

| Game | Reachable states | Legal edges | Exact root score | WDL root proof DAG | Action-labeled WDL root DAG |
|---|---:|---:|---:|---:|---:|
| 4x3 connect-3 | 4,659 | 11,818 | +2 | **9** | 40 |
| 4x4 connect-4 | 139,625 | 304,574 | 0 | **17** | 23 |
| 5x3 connect-4 | 152,003 | 377,229 | 0 | **16** | 54 |
| 4x5 connect-4 | 1,385,521 | 3,175,616 | 0 | **21** | 407 |

The striking point is not merely that transpositions exist. The **root proof object** is tiny even when the reachable game contains hundreds of thousands or more than a million physical states.

### 4x3 first-player win grammar

The exact WDL root proof uses only nine unique dependency shapes:

```text
T:W
L:T:W
W:(previous loss)
L:(terminal win, previous win)
W:(previous loss)
L:(terminal win, previous win)
W:(previous loss)
L:(earlier win, previous win)
W:(root loss obligation)
```

The preserved numeric intern IDs are:

```text
2   T:W
5   L:2
9   W:5
14  L:2,9
23  W:14
31  L:2,23
46  W:31
76  L:9,46
77  W:76   <- root
```

The full 4,659-state first-player win therefore has a **9-node logical proof DAG** and a 14-node proof tree under this witness policy.

This is direct evidence for the owner's nested-dependency intuition: the proof is structurally much smaller than the operational move graph.

## Frozen 7x6 roots

The same experiment was run on all eight established frozen research positions. Exact root scores matched the established values.

| Sequence | States | Edges | Score | WDL root DAG | Labeled WDL root DAG |
|---|---:|---:|---:|---:|---:|
| `764353221241721325116531` | 214,461 | 689,986 | -2 | **38** | 145 |
| `5563576621726752473477144213` | 7,217 | 24,870 | +7 | 1 | 1 |
| `3253472274311154254412135` | 50,140 | 184,874 | -9 | 1 | 1 |
| `24763565123272565531172315` | 10,855 | 36,479 | +2 | **13** | 49 |
| `544111352647536626717444135` | 3,227 | 11,657 | -8 | 1 | 1 |
| `3412761563244125763551573` | 128,375 | 486,089 | -9 | 1 | 1 |
| `1174534625627233274533652316` | 21,834 | 69,244 | -6 | 4 | 6 |
| `463141571213634656162165252` | 5,437 | 16,496 | +7 | 2 | 3 |

Aggregate control graph:

- **441,546** reachable nonterminal states;
- **1,519,695** legal dependency edges.

Aggregate root proof closures:

- **61** unlabeled WDL dependency shapes across the eight roots;
- **207** action-labeled WDL shapes across the eight roots.

The hardest root in this cohort therefore compresses from 214,461 physical states to **38 logical WDL proof shapes**, or **145** when move columns are retained.

That is much too large a reduction to treat the physical move tree as an obviously irreducible representation of the proof.

## Behavior quotient control

Before proof-only minimization, states were also interned only by:

```text
relative W/D/L class
+ whether an immediate win exists
+ set of child behavior-shape IDs
```

This already collapses physical state identity substantially:

- 4x3: 4,659 -> 940 behavior shapes;
- 4x4: 139,625 -> 8,197;
- 5x3: 152,003 -> 1,087;
- 4x5: 1,385,521 -> 86,518.

The proof-only reduction is dramatically stronger because a proof does not need to preserve every possible continuation; it only needs the dependencies that establish the result.

## Exact-distance control

The current product oracle uses distance-sensitive scores, not merely W/D/L. The conservative exact dependency quotient in this harness retains every distinct child exact proof shape.

That object is much larger. For example, the largest frozen root has 40,504 exact dependency shapes in its root closure versus only 38 W/D/L shapes.

This is not evidence that distance necessarily requires 40,504 objects; the exact control is intentionally conservative and does not use lower/upper proof obligations or threshold-specific witnesses. It does show that **W/D/L is the cleanest target for the first direct searchless closure experiment**. Distance refinement should be treated as a second, separately optimized proof problem.

## Earlier searchless falsifiers from this campaign

Several overly simple forms were tested and rejected before this dependency quotient was constructed:

- static future-target row parity alone is not an exact solution;
- flat blocker coverage does not solve the empty roots;
- naive nested blocker resolution that ignores temporal precedence is unsound;
- a single static response-pair matching is insufficient for the complete 4x4 draw in the tested local matching family;
- simple mirror/vertical response policies do not provide the needed universal strategy.

The key failure mechanism is **race order**: `I eventually obtain the needed cells` is weaker than `I obtain them before the opponent completes a winning requirement`.

Therefore U1 needs temporal/event precedence as a first-class dependency, not only GF(2) ownership and blocker subsets.

## What the result establishes

### Strongly supported

1. Exact WDL proof dependencies have a very small quotient compared with the physical state graph.
2. This remains true on genuine 7x6 research positions, not only toy boards.
3. Retaining action labels increases the object size but preserves large compression, so the effect is not purely from forgetting strategy realization.
4. Nested dependencies are therefore a credible target representation for a searchless solver.

### Not yet established

1. The empty 7x6 board has **not** been solved directly by U1/U2 closure.
2. The compact dependency grammar is currently discovered by first enumerating the complete control graph.
3. We do not yet have the algebra that generates those 9/17/16/21 small-game root proof shapes directly from geometry.
4. A complete temporal response algebra may still encounter a genuine combinatorial branch-selection problem.

## Sharpened hypothesis

The research target is no longer merely:

> prune the move tree more aggressively.

It is:

> construct the small proof-dependency DAG directly from residual winning requirements, support-event precedence, parity/response constraints and blocker closure, without constructing the physical state DAG.

For W/D/L, the measured size of the target object makes this materially plausible.

## Next decisive seam

The next experiment should use the complete small-game controls to learn/derive the missing **temporal dependency production rules**.

For every edge in the 9-node 4x3 proof grammar and the 17-node 4x4 draw grammar:

1. map representative physical states to RWS + SUP/event + U1/U2 facts;
2. determine the smallest invariant that predicts the child proof class;
3. express that invariant as a monotone dependency-production rule;
4. rerun the closure from the empty geometry with **state enumeration forbidden**.

Success on 4x3 and 4x4 would be the first actual direct searchless solve by the proposed universal algebra.

## Reproduction

```sh
node reference/research-prototypes/2026-09-09-low-confidence-survival/searchless_dependency_shapes.mjs
```

Structured evidence:

`docs/research/evidence/2026-09-09-searchless-dependency-shape-results.json`
