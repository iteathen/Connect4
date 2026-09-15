# Compatible-cover and progress calculus

**Date:** 2026-09-13  
**Status:** theoretical research / blind structural derivation; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction and conceptual framing:** **Josh Oshiro**  
**Formalization and synthesis:** OpenAI ChatGPT

## Purpose

Sharpen the remaining gap between the existing CPC -> WSL -> NDC structural stack and the exact set-valued perfect-play output algebra.

The target perfect-play terminal-line subset remains an output. Its suspected cardinality is not a premise, tuning target, or allowed classification input.

This note uses historical Allis strategy theory only as independently proved structural evidence. No external perfect-play terminal-line subset, opening book, witness line classification, or solved-state table is imported.

## 1. The exact gap exposed by the output algebra

For the mechanically derived geometric line universe `Lambda`, the exact perfect-play output is the set-valued game function:

```text
G(s) subset_of Lambda
```

where `G(s)` contains exactly the P0 terminal winning lines reachable on at least one W/D/L-perfect trajectory from `s`, and is empty when P0 cannot force a win.

The recursive semantic equations are exact, but they still quantify over physical children. The research objective is to derive the same predecessor result directly from structural facts.

The missing step is therefore not geometry, residualization, or parity. It is the production and discharge of a **total strategic policy certificate**.

## 2. Historical confirmation of the missing object

Victor Allis's 1988 evaluator already organized defensive proof in almost exactly this shape:

1. enumerate candidate strategic-rule instances (`solutions`);
2. record which opponent winning groups each solution refutes;
3. record which pairs of solutions cannot be used simultaneously;
4. find a mutually compatible chosen subset whose solved-group union contains every remaining opponent problem.

Allis explicitly reduced the final selection step to a graph problem: choose an independent subset of solution nodes whose neighbourhood covers all problem nodes. VICTOR solved that selection problem by recursive backtracking.

This is important for the current project because it identifies an old, concrete instance of the same gap:

```text
local strategic facts
  -> blocker coverage
  -> compatibility
  -> choose a total compatible cover
```

The old named-rule system solved the first three layers but still searched the fourth.

The current CPC/WSL/NDC program should therefore not reproduce the named taxonomy. It should generalize the *proof object* and try to eliminate the compatible-cover backtracking algebraically.

## 3. Generic policy-fragment model

A policy fragment `f` should be represented by its semantic descriptor rather than a rule name:

```text
Fragment f:
  Coverage(f)        // opponent residual requirements blocked by f
  ResponseMask(f)    // reserved/consumed physical response resources
  Parity(f)          // GF(2) ownership/release constraints
  Order(f)           // event-precedence constraints
  Guards(f)          // support/playability/horizon premises
  Progress(f)        // optional own-progress/race consequence
```

A set of fragments `F` is compatible only if:

```text
response/resource obligations are jointly satisfiable
AND parity equations are consistent
AND precedence union is acyclic / timing-safe
AND every fragment guard remains true under the composition
```

A **total cover** against player `q` additionally requires:

```text
for every active residual requirement R_q:
  exists f in F such that Coverage(f) contains R_q
```

Equivalently, using WSL blocker semantics:

```text
ActiveRequirements_q subset_of OR_{f in F} Up[Blockers(f)]
```

when every blocker in the expression is certified under the composed policy.

## 4. Safety theorem

Define:

```text
Safe(p, s, h)
```

as: player `p` has a compatible total policy cover preventing the opponent from completing any active residual winning requirement before horizon `h`.

Then:

```text
Safe(p, s, terminal-horizon)
=> opponent cannot win from s while the policy remains valid.
```

If the board subsequently exhausts without `p` completing a line, the result is a draw. Thus safety alone establishes an **at-least-draw / opponent-nonwin certificate**, not necessarily a win.

This is the generalized form of Allis's defensive `solution` concept.

## 5. Why safety is not enough for a winning predecessor

The standard root is P0-winning. Therefore the structural calculus must prove more than `Safe(P0)`.

A winning certificate additionally needs **liveness/progress**:

```text
Progress(p, s, mu)
```

where `mu` is a well-founded rank such that under the certified policy every nonterminal policy macro-step either:

```text
1. ends in a p terminal win; or
2. strictly decreases mu.
```

and:

```text
mu = 0 => p terminal win.
```

Since Connect Four is finite, a sound strictly decreasing rank proves eventual completion without enumerating all policy continuations.

Therefore the generic positive theorem is:

```text
Safe(p, s, h)
AND Progress(p, s, mu)
AND PolicyTotal(p, s)
=> p can force a win from s.
```

The defensive theorem is the same object with the progress obligation omitted:

```text
Safe(p, s, terminal-horizon)
=> opponent cannot force a win.
```

This separates the remaining calculus into **safety** and **liveness** rather than treating `win` as one opaque predicate.

## 6. Generic race blocker — the structural content of `Before`

The historical `Before` rule exposes a reusable theorem that should be expressed without the rule name.

Let `Q` be a live own winning requirement of controller `p`. Let `E(Q)` be the currently empty target cells of `Q`, and suppose every `e in E(Q)` has a physical successor `succ(e)` in the same column.

Assume a certified policy satisfying, for every `e in E(Q)` before the relevant terminal horizon:

```text
p obtains e
OR
(opponent obtains e => p obtains succ(e) in time)
```

and assume the opponent cannot win earlier while this policy is executed.

Then the successor set

```text
S(Q) = { succ(e) | e in E(Q) }
```

is a certified blocker against the opponent.

Reason:

- if `p` obtains every empty target in `Q`, `Q` completes and the game ends before the opponent can later acquire all successors;
- otherwise the opponent acquires some `e`, and the policy gives `succ(e)` to `p`, so the opponent cannot own all of `S(Q)`.

Hence:

```text
RaceResponse(Q)
=> CertifiedBlocker(opponent, S(Q), deadline(Q))
```

Any opponent residual requirement containing `S(Q)` is eliminated by ordinary WSL upward closure.

This is exactly the generic `own completion + trigger-response + precedence -> blocker` form already anticipated by NDC. `Before` is one historical specialization, not a required runtime primitive.

## 7. Positive control as safety + forced progress

Allis's first-player strategic treatment gives another useful decomposition.

An odd threat is not itself a complete winning proof. Its role is to create a progress/control reservoir. If the first player can simultaneously refute every opponent winning requirement on the remainder of the board, finite event depletion eventually forces the critical support/target sequence.

The generic theorem should therefore be expressed as:

```text
Safe(p, s, h)
AND ControlledCompletion(p, ownRequirement, h)
=> Win(p, s)
```

where `ControlledCompletion` is proved from CPC event-rank parity, support order, response resources, and a decreasing finite event reservoir.

This is more general than `odd threat`, `double threat`, or any named historical pattern.

## 8. Compatible-cover selection as a finite constraint problem

Once candidate fragments are generated, the exact selection problem can be represented propositionally.

For each candidate fragment `f`, introduce Boolean variable `x_f`.

For every active opponent requirement `R`, require at least one covering fragment:

```text
OR_{f : f covers R} x_f
```

For every incompatible fragment pair `(f,g)`:

```text
NOT x_f OR NOT x_g
```

Additional parity/order/guard dependencies become implication or finite constraint clauses.

Thus total policy discharge is exactly a finite CSP/SAT problem over structural fragments. This is a valid complete control formalism and still avoids legal move-tree minimax.

However, generic compatible cover is combinatorial. The research objective is stronger: exploit Connect-Four-specific structure so the same constraints close by cheap algebraic propagation rather than generic branch-and-backtrack.

## 9. Candidate non-branching cover calculus

The following inference rules are sound candidates for monotone closure:

### 9.1 Forced fragment

If an uncovered requirement has exactly one still-compatible fragment capable of covering it, that fragment is mandatory.

```text
Candidates(R) = {f}
=> Choose(f)
```

Then remove every fragment incompatible with `f` and mark all of `Coverage(f)` solved.

### 9.2 Failure

```text
R is uncovered
AND Candidates(R) = empty
=> no compatible total cover
```

### 9.3 Fragment dominance

A fragment `a` dominates `b` if:

```text
Coverage(b) subset_of Coverage(a)
AND Resources(a) subset_of Resources(b)
AND Order(a) subset_of Order(b)
AND ParityObligations(a) subset_of ParityObligations(b)
AND Guards(a) are no stronger than Guards(b)
```

with consequence:

```text
b may be deleted
```

because replacing `b` by `a` cannot reduce coverage or make composition harder under the declared descriptor order.

### 9.4 Requirement subsumption

If every fragment capable of solving requirement `A` also solves requirement `B`, satisfying `A` discharges `B` automatically for cover-selection purposes.

### 9.5 Component decomposition

If the coverage/conflict/dependency hypergraph splits into independent connected components, each component can be closed independently and the results composed.

### 9.6 Parity contradiction

GF(2) closure that derives both values for the same ownership relation invalidates the policy fragment set.

### 9.7 Order contradiction

A strict event-precedence cycle invalidates the policy fragment set.

### 9.8 Race-blocker generation

A certified own progress/race dependency generates new blocker IDs through the successor-set theorem above; WSL coverage is then recomputed, possibly forcing additional fragments.

These rules deliberately feed back into NDC:

```text
forced fragment
 -> new blocker
 -> requirements removed
 -> event relevance changes
 -> CPC reservoir changes
 -> new control relation
 -> new fragment / stronger dominance
 -> ...
```

## 10. Relation to the existing CPC / WSL / NDC stack

The resulting division of responsibility is now precise:

```text
CPC
  proves ownership/parity/release relations

WSL-625
  represents residual requirements and blocker upward closure

NDC
  composes nested guarded facts, timing and feedback

compatible-cover closure
  proves a total jointly realizable safety policy

progress rank
  upgrades safety to a forced win when own completion is inevitable

choice elimination
  propagates Win/NonWin through the exact predecessor quantifiers
```

The missing calculus is therefore not one monolithic new rule family. It is the combination of:

1. **compatible-cover synthesis** for safety; and
2. **well-founded progress synthesis** for liveness.

## 11. Historical localization of the same gap

This decomposition explains the 1988 result unusually well.

Allis's strategic rule system could prove, without legal move-tree search, that the second player can at least draw on every `7 x (2n)` board when the first player does not open in the middle column. Appendix B gives explicit compatible rule covers for the first three non-middle opening classes; reflection supplies the others.

But Allis explicitly reports that the knowledge system was not strong enough to solve the standard 7x6 center-opening root. Search was added to bridge that knowledge gap.

So the historical boundary aligns with the present one:

```text
negative / safety certificates: already structurally strong
positive center-root win: missing sufficient progress / predecessor calculus
```

This makes the current target sharper than simply "find more strategic rules".

## 12. Bounded predicate evidence from the current research line

The current 49 third-ply prefix control already falsifies a too-coarse candidate representation:

- residual requirement-size histograms merge positions of different exact W/D/L value;
- minimal-antichain size histograms also merge positions of different value;
- adding support/accessibility information removes those particular bounded collisions.

A stronger exploratory finite check showed that a histogram of minimal residual requirements indexed by `(requirement size, mandatory future support volume)` separates all 49 third-ply positions up to horizontal reflection. This is **not** claimed as a sufficient strategic quotient: it is effectively injective on those reflection orbits and therefore may simply be reconstructing the tiny prefix state.

The useful conclusion is narrower:

```text
winspace shape without support timing is insufficient;
support/race information is genuinely load-bearing.
```

## 13. Decisive next tests

1. **Generic race closure** — generate successor-set blockers from every structurally valid own requirement without named `Before` code and reproduce the blocker consequences of historical `Before` instances.
2. **Compatibility normalization** — replace the historical rule-type matrix with resource masks + event precedence + GF(2) even-release conditions, then compare against the known-valid historical compatibility cases.
3. **Cover closure** — measure how many known policy-cover instances are discharged by forced-fragment, dominance, subsumption, component and parity/order propagation before any generic SAT/backtracking fallback.
4. **Positive progress** — for independently known winning prefixes, search for a structural rank `mu` over event reservoirs / residual requirements that proves own completion while safety closure prevents an earlier opponent result.
5. **Small-game completeness** — require the same safety+progress calculus to derive the complete 4x3 connect-3 win and 4x4/5x3/4x5 connect-4 draws from geometry with legal move-state enumeration forbidden.

## 14. Current claim boundary

Established here:

- the old `solution selection` problem is an exact historical instance of the present compatible-policy-cover gap;
- safety and progress are logically distinct proof obligations;
- a generic successor-set race blocker subsumes the core semantic idea of `Before`;
- the total policy-selection problem has an exact finite CSP/SAT formulation;
- current bounded evidence requires support/timing information in addition to residual-set cardinality.

Not established:

- that the proposed propagation rules alone decide every Connect Four compatible-cover instance;
- that a polynomial/non-branching compatible-cover algorithm exists for the standard game;
- that the positive progress calculus is complete at the empty 7x6 root;
- the membership or cardinality of the perfect-play terminal-line output subset.

The next seam is to turn the safety+progress decomposition into a direct closure on the existing 625 residual universe and CPC event frontier, then test it first on complete small games and the independently proved non-center opening certificates.