# Constrained algebraic synthesis-space pilot

**Date:** 2026-09-13  
**Status:** NEGATIVE CONTROL / discovery-space assessment  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization / pilot implementation / assessment:** OpenAI ChatGPT

## Question

Can exact complete-small-game data be used to generate a *small* family of structural algebraic conjectures which fit known states and are then independently proved backward from Connect Four rules?

The purpose of this pilot was not to discover a fitted value evaluator. It was to determine whether the conjecture space is constrained enough to make the proposed workflow credible before spending substantial time on it.

Exact W/D/L data was used only as synthesis/falsification data. No fitted expression is proof authority.

## Control reconstructed

A standalone complete `4x3 connect-3` control was reconstructed from geometry and legal first-win stopping semantics:

```text
reachable states:       7,157
nonterminal states:     4,631
legal edges:           11,818
```

The already-established positive proof grammar was independently reproduced:

```text
I = playable P0 singleton completion
O = P1-to-move response-overload leaf
E = existential P0 predecessor
A = universal P1 predecessor
```

`I/O + E/A` saturation again produced the complete nonterminal P0-winning region with:

```text
false positives: 0
false-negative nonterminal wins: 0
root proof rank: 7
selected root proof DAG: 38 states
root shape:
E(A(E(A(E(A(E(O)|I))|I))|E(O)))
```

The synthesis set excluded the `I/O` seed leaves and contained 647 derived positive proof states (`rank > 0`). Across the complete control those states carried 34 canonical recursively selected proof-shape expressions. The selected root DAG still uses only the much smaller previously established root-specific shape family.

## Pilot 1 — scalar structural snapshot grammar

The first grammar used 28 structural scalar features derived from support, legal-action count, residual-antichain counts by size, residual union size, playable/latent singleton counts, simple support horizons, residual disjointness, and zero-reservation CPC ownership counts.

Observed feature thresholds/equalities produced 166 distinct Boolean atoms after truth-vector deduplication.

The 647 examples were split deterministically into:

```text
train:   519
holdout: 128
```

The complete scalar feature vectors produced:

```text
304 distinct feature signatures
18 signatures containing multiple proof shapes
42 states inside ambiguous signatures
maximum shapes in one signature: 3
```

This is already a warning: the scalar description is close to state reconstruction rather than a strongly compressed algebra, yet it still does not determine proof shape.

### One- and two-predicate conjunction search

For each of the four most common proof shapes, all distinct one- and two-atom conjunctions were tested as implications:

```text
condition(s) => proofShape(s) = target
```

A candidate had to be perfect on train, cover at least four train examples, and remain perfect while covering at least one holdout example.

Results:

| target shape | examples | formulas tested | train-perfect | holdout-perfect | distinct surviving coverage sets |
|---|---:|---:|---:|---:|---:|
| `E(O)` | 207 | 13,861 | 470 | 230 | 106 |
| `A(E(O)|I)` | 188 | 13,861 | 120 | 94 | 71 |
| `E(A(E(O)|I))` | 115 | 13,861 | 96 | 96 | 3 |
| `A(E(A(E(O)|I))|I)` | 51 | 13,861 | 4 | 0 | 0 |

The shallow classes are therefore **underconstrained**: dozens to hundreds of mutually different simple formulas fit both train and holdout perfectly. The deeper class is simultaneously **underexpressed**: no two-predicate formula survived holdout.

An attempted unrestricted extension to three-predicate conjunctions exceeded the bounded execution window before completing. This is not a complexity theorem, but it was the operational stop condition requested for the pilot: widening a grammar already exhibiting many accidental shallow fits would be poor information value.

## Pilot 2 — add proved local transition relations

The grammar was then tightened toward the known positive calculus by adding seven local relational quantities based on:

- one-support-away latent singletons;
- stacked singleton structure;
- defender moves that release an immediate P0 singleton;
- P0 moves creating immediate response overload;
- P0 moves creating a poisoned-support configuration.

This increased the representation to:

```text
35 scalar/relational features
192 distinct Boolean atoms
308 complete feature signatures
17 ambiguous signatures
38 states inside ambiguous signatures
```

So proof-shape ambiguity improved only marginally (`42 -> 38` states).

More importantly, the shallow conjecture space became *larger*:

| target shape | formulas tested | train-perfect | holdout-perfect | distinct surviving coverage sets |
|---|---:|---:|---:|---:|
| `E(O)` | 18,528 | 658 | 368 | 209 |
| `A(E(O)|I)` | 18,528 | 219 | 179 | 125 |
| `E(A(E(O)|I))` | 18,528 | 109 | 109 | 5 |
| `A(E(A(E(O)|I))|I)` | 18,528 | 6 | 0 | 0 |

The best surviving formulas for the third class covered only eight of its 115 examples. The fourth class still had no surviving two-predicate formula.

Adding semantically relevant local scalar relations therefore did **not** make ordinary formula synthesis converge. It supplied more ways to interpolate the shallow data while still failing to express the deeper alternating predecessor structure.

## Assessment

The proposed overall workflow remains promising, but the conjecture language used in this pilot is the wrong one.

The evidence supports the following diagnosis:

```text
arbitrary scalar snapshot algebra
  -> too many accidental shallow explanations
  -> combinatorial growth when conjunction depth increases
  -> insufficient representation of deeper E/A proof structure
```

The missing information is not another scalar count. It is the **typed relation between a parent obligation and the structural effect of each legal/support event**.

This agrees with the existing 4x3 proof result: the hard object is alternative generation/convergence, not terminal classification.

## How to tighten the discovery space

A future synthesis pass should *not* enumerate arbitrary threshold formulas. Restrict the grammar to proof-carrying operators already justified by the structural calculus.

### 1. Make quantifiers grammatical primitives

Candidate laws should have forms aligned with exact predecessor semantics:

```text
exists action a:
  Guard(s,a) AND EffectClass(s,a,C)

forall defender actions a:
  SafeAlternative(s,a) -> EffectClass(s,a,C1 | ... | Ck)
```

rather than trying to infer `E/A` classes from parent snapshot counts.

### 2. Synthesize action-effect descriptors, not state labels

For each currently legal/support event, derive a typed descriptor such as:

```text
support advance
P0 residuals shrunk / completed
P1 residuals killed
singleton releases
poisoned-support releases
response resources consumed/released
CPC reservoir delta
race/deadline delta
NDC guards preserved/created
```

Then search for equivalence/implication among **effect descriptors**. This is much closer to the missing alternative-class calculus and has at most seven immediate action records on standard 7x6.

### 3. Restrict atoms to theorem-bearing predicates

Prefer:

```text
I
O
PoisonedSupport
StackedSingletons
ResponseOverload
CertifiedBlocker
CPCControl
DeadlineBefore
CompatibleResponse
AlternativeConverges
```

over arbitrary numeric thresholds such as residual-count cutoffs. Numeric quantities should appear only where they carry a proved capacity/rank meaning.

### 4. Learn implications/transports, not classifiers

The useful conjecture target is:

```text
certificate A + action-effect relation R
  -> certificate B
```

or:

```text
all alternatives fall into already-proved classes
```

not `snapshot -> exact proof-shape label`.

### 5. Use root/local cones for generation, whole games for falsification

The selected 4x3 root proof needs only 38 physical states and a tiny root-specific proof-shape family. Use those states to propose anti-unified effect laws, but immediately falsify each proposed law over the complete 4x3 graph and then the other complete bounded controls. This keeps generation narrow without allowing root-specific memorization to become authority.

### 6. WSL pair algebra should feed the effect grammar

The 195,000 unordered pairs of the 625 standard residual fragments are cheap enough to precompute, but their role should be to answer typed questions—intersection, containment, shared blocker/response resource, support coupling—not to become 195,000 unconstrained Boolean atoms in a generic formula search.

## Conclusion

The answer to the pilot question is mixed but useful:

- **The proof-shape space itself is small enough to be encouraging.** The complete 4x3 root proof is tiny and the positive grammar is only `I/O/E/A`.
- **The naive algebraic guess space is too unconstrained.** Even two-predicate snapshot formulas produce hundreds of equally valid shallow conjectures, while deeper proof classes remain unexplained.
- **The space can plausibly be tightened sharply** by moving synthesis from scalar state predicates to quantified, typed action-effect relations and alternative convergence.

Therefore this pilot stops here. The next synthesis experiment, if pursued, should be an **action-effect / alternative-convergence grammar**, not a wider scalar formula search.

No 7x6 solve, center-root win, terminal-line membership, or terminal-line cardinality is claimed by this pilot.
