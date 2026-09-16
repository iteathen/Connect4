# Standard 7x6 recursive proof closure

**Date:** 2026-09-13  
**Research direction / structural target:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Status

**ACTIVE CONTROL / PARTIAL POSITIVE CERTIFICATE RESULT.**

This note records a bounded investigation of the real standard 7x6 positive proof frontier. It does **not** claim a complete center-opening proof or terminal-line-output proof.

Exact solver data is used only to construct or falsify controls. Any root reported as structurally closed below has an independently checkable legal-transition proof under the explicit `I/O/E/A` grammar; its validity does not depend on an external score.

## Source frontier

The retained exact positive proof-frontier census constructs the root proof as:

- OR at P0 `+1` nodes using one exact winning witness;
- AND at P1 `-1` nodes using every legal reply.

Through ply 8 the standard-board frontier is:

```text
ply:             0   1   2   3   4    5    6    7     8
unique states:   1   1   7   7  47   47  277  204  1141
proof paths:     1   1   7   7  49   49  343  231  1616
```

The `277 -> 204 -> 1141` transition is direct standard-7x6 evidence that proof width can contract and then expand. At ply 8:

- 1,141 physical frontier states;
- 1,141 exact raw `q` states;
- 319 immediate P0 wins;
- 822 non-immediate recursive positive obligations.

## Equality-style recursive alphabet differential

The 822 recursive states were partitioned using progressively richer structures derived only from support and WSL residual antichains.

Observed class counts:

```text
exact q modulo horizontal reflection                 531
support only                                         273
support + residual-size profile                      519
support + playable-frontier incidence                531
support + WSL resource/dependency profile            531
resource/dependency + landing-effect multiset        531
resource/dependency + reflection-preserving effects  531
```

There are only 12 support-plus-residual-size classes that merge two exact `q/reflection` classes. Every one of those 12 collisions splits after one exact legal-transition layer, and the one-step refinement returns exactly 531 classes.

Bounded conclusion: on this frontier, equality-style behavioral refinement reconstructs exact `q/reflection`; the missing compression is not another coarse state equality.

## Generic residual-dominance control

A same-support residual implication preorder was tested only as a bounded falsification/discovery control:

```text
A >= B  iff
  same support and side,
  phi_P0(B) => phi_P0(A),
  phi_P1(A) => phi_P1(B).
```

Among the 822 recursive states:

- 444 exact support groups;
- one strict dominance pair;
- zero observed transition violations across the seven corresponding legal moves;
- 821 of 822 obligations remain independently hardest.

The one observed relation is far too sparse to explain proof compression, and this control does **not** supersede the repository rule that generic residual dominance is insufficient without strategic context.

## Sibling cross-response control

The obvious parent-relative repair was also tested. For two P1 sibling replies `b,c`, answer crosswise with P0 moves `c,b`; the resulting grandchildren have equal support and can therefore be compared by exact `q` or the residual preorder.

Across the 204 ply-7 universal parents:

- 4,278 raw sibling pairs;
- 2,619 non-immediate sibling pairs;
- 1,487 pairs where both cross-responses are exact-value-preserving P0 moves;
- **0 exact-q convergence pairs**;
- **0 strict residual-dominance pairs**.

Thus value-preserving two-column swap does not supply the missing recursive consequence law.

## Direct structural `I/O/E/A` closure

The successful direction is proof-class recursion rather than state equality.

Use the grammar:

```text
I
  P0 to move has a legal immediate terminal win.

O
  P1 to move has no terminal winning move and every legal P1 reply
  leaves P0 an immediate terminal win.

E(C)
  P0 has one concrete legal move to already-proven certificate C.

A(C1 | ... | Cn)
  every legal P1 reply reaches an already-proven child certificate;
  duplicate child proof classes are idempotent.
```

A depth-4 bounded proof-DAG pilot began from all 822 recursive ply-8 obligations. Pons selected only which P0 edge to *try* at unresolved existential nodes. Closed expressions themselves are justified entirely by the concrete legal edge plus recursive `I/O/E/A` rules.

The pilot materialized 21,656 `q` states, did not hit its 100,000-state cap, and structurally closed:

- 99 / 822 starting obligations = **12.0438%**;
- 84 as `E(O)`;
- 15 as `E(A(E(O)|I))`;
- only two root proof classes.

Within the 15 proven universal nodes:

- 105 raw defender branches;
- 30 normalized recursive consequence branches;
- **71.4286% branch reduction**;
- maximum normalized universal arity 2.

This is direct standard-7x6 evidence that proof-class compression can be large even when exact `q` state compression is absent.

## Oracle-choice bias eliminated

A second census discarded the oracle-selected existential witness and exhaustively tested **every legal P0 move** for exactly the two local structural forms discovered above:

```text
E(O)
E(A(S)), where every universal child is I or E(O)
```

The result was exactly unchanged:

- 99 structurally proven roots;
- 723 unresolved roots;
- 84 `E(O)`;
- 15 `E(A(E(O)|I))`;
- 105 raw universal branches -> 30 consequence branches.

Therefore the current 723-state gap is **not** caused by choosing the wrong P0 witness among legal moves. It requires deeper recursive proof structure and/or additional theorem-backed leaf predicates.

## Current interpretation

The evidence now separates three ideas sharply:

```text
coarser state equality          -> reconstructs q or becomes unsound
whole-state residual dominance -> almost no leverage
recursive proof expressions     -> real compression on standard 7x6
```

The current seam is therefore not “find a smaller state.” It is:

```text
723 unresolved ply-8 positive obligations
  -> bounded deeper I/O/E/A closure
  and/or
  -> CPC/WSL/NDC/temporal/progress theorem leaves
  -> normalize only by already-proved recursive consequence classes
```

The next bounded control should test the next recursive grammar rank with a hard materialization cap. If frontier growth becomes excessive, stop and classify the unresolved boundary rather than reconstructing the game graph.

## Reproducibility

Controls added on `research/frontier-negamax-conformance`:

- `quotient-standard7x6-recursive-frontier-alphabet.mjs`
- `quotient-standard7x6-recursive-size-differential.mjs`
- `quotient-standard7x6-recursive-dominance.mjs`
- `quotient-standard7x6-sibling-cross-response.mjs`
- `quotient-standard7x6-io-recursive-closure-pilot.mjs`
- `quotient-standard7x6-local-proof-grammar-census.mjs`

Associated GitHub Actions workflows retain the pinned Pascal Pons source/book provenance used by the source-frontier and discovery controls.
