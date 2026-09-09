# Universal strategic algebra — reducing parity, Zugzwang, Allis rules and residual certificates to common shape

**Date:** 2026-09-09  
**Status:** theoretical research / candidate unification; maintained source and `main` unchanged.  
**Branch:** `research/low-confidence-survival-2026-09-09`

## Question

Can several apparently different Connect Four candidates be replaced by one or two cheap universal mechanisms rather than implemented as separate optimizations/rules?

The target set includes the owner's future-target parity/Zugzwang count, Allis strategic rules, one/both-sided exhaustion, support-event reasoning, compatible strategic cover, and related terminalization candidates. The analysis deliberately reduces named rules to their algebraic obligations before comparing them.

## 1. Lowest useful game model

After residualization, the remaining game can be viewed as three objects:

1. **future placement events** `E`;
2. a **partial order** on those events induced by gravity (each column is a chain);
3. each player's surviving winning requirements, a hypergraph over `E`.

For standard 7x6 Connect Four, every useful residual winning requirement is a nonempty subset of one of the 69 geometric winning lines. The already-established fixed universe contains exactly **625 requirement IDs**.

The full colored history is not necessary for this layer. What matters is which strategic events remain, when they can become playable, and which sets of them still constitute a win.

## 2. The owner's parity count reduces to event-rank parity

For a future target cell `t=(c,r)` with current column height `h_c`, count all moves which can be played before or at the target while excluding cells above the target in its own column:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)
```

Since total occupied cells are `ply = sum h_d`:

```text
N(t) = (W - 1)H - ply + r + 1
```

The target-column height cancels.

The player who receives the `N(t)`-th event from the current turn is determined only by:

```text
(N(t) - 1) mod 2
```

Thus the future-target ownership calculation is a **GF(2) event-rank invariant**, not fundamentally an evaluator score.

For standard 7x6, `(W-1)H = 36` is even, so the parity reduces further to current move rank plus target-row parity.

This explains why the incumbent optimized evaluator's parity expression and the older explicit support/reservoir count are algebraically equivalent.

## 3. Allis Zugzwang compatibility is the same invariant

Allis's chapter on interaction of strategic rules gives the governing compatibility observation in operational language:

> after a rule is filled, the number of additional squares becoming available must be even, otherwise control of Zugzwang changes.

Algebraically, if a strategy fragment changes the number of events available before a future target by `Delta`, then:

```text
N'(t) = N(t) + Delta
owner'(t) = owner(t)  iff  Delta mod 2 = 0
```

Therefore the owner's target-parity method and Allis's rule-combination parity test are not merely related. They are the **same mod-2 invariant expressed at different abstraction levels**:

- owner method: compute the future event rank directly;
- Allis: ensure local strategy composition changes that rank only by an even amount.

This is the strongest unification result of this pass.

## 4. Primitive strategic facts reduce to ownership/split constraints

Ignoring rule names, the elementary Allis observations and the owner's Zugzwang reasoning produce only a small number of primitive propositions.

### Fixed ownership

```text
owner(e) = controller
```

Example: a valid Claimeven can guarantee the relevant even square.

### Split / response ownership

```text
owner(e1) XOR owner(e2) = 1
```

or, for terminal-certificate purposes:

```text
opponent cannot own both {e1,e2}
```

Examples include Baseinverse, Vertical, and the pairwise consequences of Lowinverse, Highinverse and Baseclaim.

### Deadline / race blocker

```text
opponent cannot own every event in B before controller completes its own win
```

Examples include the nonlocal consequences of Aftereven, Before and Specialbefore.

The first two forms are naturally pairwise GF(2) constraints. The third is a blocker over the event poset and the controller's own winning deadline.

## 5. Universal solution candidate U1 — parity/response algebra

### Core object

Maintain a tiny **parity-response constraint system** over future strategic events.

The intended machine form is not a generic solver. Most constraints are of the forms:

```text
x = 0/1
x XOR y = 0/1
```

which can be represented by a parity union-find / XOR-disjoint-set structure, fixed masks, or an even cheaper generated representation for the 42-cell board.

Each strategy fragment additionally carries:

- reserved/response cell mask;
- per-column event interval(s);
- trigger -> response obligations where needed;
- parity of cells released when the fragment resolves;
- prerequisite/event-order guards.

### What U1 can potentially replace

U1 directly targets the common mechanism behind:

- the owner's future-target parity/Zugzwang ownership detector;
- Allis Zugzwang-control checks;
- Claimeven ownership;
- Baseinverse split ownership;
- Vertical split ownership;
- Lowinverse pair consequences;
- Highinverse pair consequences;
- Baseclaim pair consequences;
- much of the current type-specific Allis compatibility table.

### Compatibility as an invariant, not a rule-type table

A set of response fragments is compatible when:

1. response/resource obligations do not conflict;
2. required event precedence is acyclic/satisfied;
3. every release that can occur before another parity-dependent obligation preserves the relevant event-rank parity.

The third condition is a GF(2) condition. Allis's special table entries such as “no Claimeven below the inverse” are geometric shorthand for violations of this underlying release-parity/order invariant.

This suggests that the rule-type compatibility matrix may be replaceable by a **generic descriptor check over masks + event order + parity**, eliminating named pairwise compatibility code.

### Cheapness projection

- event count: at most 42 physical cells and fewer strategic events after residualization;
- parity arithmetic: XOR/bit tests;
- resource conflicts: 42-bit masks / two 32-bit words;
- event-order data: already present or cheaply derivable from SUP/event frontier;
- no dynamic graph objects are required.

The strongest remaining uncertainty is not arithmetic cost but whether every useful rich rule can be compiled into this descriptor without losing strength.

## 6. Universal solution candidate U2 — strategic blocker lattice

### Blocker definition

A blocker is a nonempty set of future cells `b` for which the controller has an exact strategy guaranteeing:

```text
opponent cannot own every cell in b
```

An opponent winning requirement `r` is strategically solved whenever:

```text
b subset_of r
```

for at least one valid blocker `b`.

### The 625-ID universe already contains every useful blocker

If a blocker can solve a Connect Four winning requirement, it is a subset of a geometric winning line. Therefore every useful blocker is representable in the **same 625-ID universe** already used for residual winning requirements.

No second strategic-object universe is needed.

Let `Up[b]` be the precomputed 625-bit upward closure containing every requirement ID that is a superset of blocker `b`.

For blocker set `B`:

```text
Solved(B) = OR_{b in B} Up[b]

opponentNoWin
  iff (opponentActiveRequirements & ~Solved(B)) == 0
```

This is the same subset-closure machinery already used by residual minimality/implication work.

### Allis rules in blocker form

The named rule taxonomy collapses substantially:

- **Claimeven** -> singleton blocker at the guaranteed even square;
- **Baseinverse** -> two-cell blocker;
- **Vertical** -> two-cell blocker;
- **Lowinverse** -> three useful pair blockers (two vertical pairs + upper cross-pair);
- **Highinverse** -> several pair blockers (vertical, upper-cross, middle-cross, plus conditional lower/upper pairs);
- **Baseclaim** -> two pair blockers;
- **Aftereven** -> blocker(s) induced by the controller's guaranteed completion deadline plus its Claimeven components;
- **Before** -> successor-event blocker plus component Claimeven/Vertical blockers;
- **Specialbefore** -> Before-style successor blocker augmented by the extra playable response, plus pair/component blockers.

The difference among these rules is therefore primarily **how the blocker is certified**, not how solved opponent requirements are represented or checked.

### Exhaustion as degenerate blocker/requirement algebra

- one-sided exhaustion: opponent requirement set is empty -> exact one-sided no-win;
- bilateral exhaustion: both requirement sets empty -> exact draw.

No separate terminal search structure is needed.

## 7. Why U1 and U2 are probably two layers of one engine

U1 answers:

> Which ownership/split/deadline guarantees are simultaneously valid under gravity, turn parity and response-resource constraints?

U2 answers:

> Given those valid guarantees, do they hit every surviving opponent win requirement?

This separation is valuable because it avoids Allis's historical architecture of rule-type-specific “solution” and compatibility machinery.

A likely final object is:

```text
SUP/event frontier
 + residual requirement antichains (RID)
 + parity/response constraints (U1)
        -> certified blocker IDs
 + blocker upward closure (U2)
        -> one-sided no-win / exact draw / unresolved
```

## 8. Rich rules may reduce to a generic race closure

Aftereven, Before and Specialbefore look different only because they introduce an **own-win deadline**.

At lower level they say:

1. controller can guarantee progress/completion of one own residual requirement;
2. if opponent tries to acquire certain successor events, controller either answers immediately or completes first;
3. therefore opponent cannot own a particular blocker set before terminal completion.

This suggests replacing the three named rule families with a generic **requirement-race closure**:

```text
certified own completion path
 + event precedence / response constraints
 -> opponent blocker(s)
```

If this holds, U1+U2 can absorb A4/A8/A9 rather than merely hosting their outputs.

This is currently a theoretical projection and needs direct construction tests.

## 9. Mapping beyond Allis

The same two-layer algebra touches many current candidates without claiming they are all identical optimizations.

### Directly unified / potentially subsumed

- ZPAR exact parity/Zugzwang terminalization;
- E2 parity metadata (as substrate, not proof authority);
- A1-A10 strategic rules / compatible cover;
- EXH/BEXH terminalization;
- strategic DEAD/unreachable win obligations;
- part of support-aware event ownership.

### Shared substrate / likely cheaper through the same algebra

- IMPL: already uses the same 625 subset lattice/upward closure;
- CARD/SEWB: requirement size/event distance are fields on the same objects;
- AUTO: automorphisms act on the same requirement/blocker/event representation;
- E1/proof-cost features: summaries of the same residual requirement state.

### Not actually unified

- FMAC/FBLK: deterministic transition compression;
- TT/cache layout (CTT/RANK/STT/CAP);
- YBWC/AFF/JOIN: parallel/scheduling structure;
- fixed-width execution itself.

Those may benefit because terminalization removes work, but they are not instances of the strategic certificate algebra.

## 10. Important complexity warning

The **coverage check** is cheap once a simultaneously valid blocker set is known.

The difficult problem is selecting a set of strategy fragments whose response policies are compatible and whose blockers cover all opponent requirements.

In arbitrary positional games, finding pairing strategies is known to be computationally hard; therefore we should not assume a generic set-cover/matching search will be cheap merely because the final coverage test is bitwise.

The opportunity specific to Connect Four is stronger structure:

- only 42 physical cells;
- disjoint column chains under gravity;
- 625 fixed residual/blocker IDs;
- most ownership constraints are pairwise XOR;
- Allis compatibility itself reduces heavily to event order + even-release parity;
- the support-event frontier removes irrelevant filler events.

The research question is therefore whether **Connect-Four-specific parity/poset structure removes the combinatorial selection problem**, not whether arbitrary hypergraph pairing is easy.

## 11. Strongest current hypothesis

There are likely **two universal cheap mechanisms**, with a possibility they collapse into one generated fixed-point kernel:

### U1 — parity-response algebra

A GF(2) / response-resource system over the support-event poset, owning Zugzwang, future ownership and compatibility.

### U2 — blocker-lattice closure

A 625-ID antichain/upward-closure system owning strategic coverage and terminal no-win/draw detection.

Together they may replace a large family of separately implemented evaluator parity logic, Allis rule classes, compatibility tables and terminal-state detectors.

The evidence for the common shape is strong. The evidence that a complete implementation is both **universal enough** and **cheaper than selective named rules** is not yet sufficient.

## 12. Decisive next tests

### Test A — rule-to-blocker completeness

Compile A1-A9 instances into U1/U2 descriptors and verify that the universal blocker coverage reproduces every Allis `Solutions` relation on exhaustive small games and sampled 7x6 states.

### Test B — generic compatibility vs Allis table

Generate rule-instance pairs and compare a generic `resource conflict + event precedence + even-release parity` compatibility predicate against Allis's accepted combination conditions. Any mismatch is a concrete missing invariant.

### Test C — owner's parity detector as U1 special case

Prove/differential-check that the existing target-ownership parity count is exactly the zero-reservation case of the U1 event-rank equation, then introduce reserved/released event masks and verify owner flips exactly on odd delta.

### Test D — generic race closure

Attempt to derive Aftereven/Before/Specialbefore solution masks from `own requirement + response constraints + event precedence` without named rule logic. This is the strongest test of true unification.

### Test E — cost envelope

Only after semantic equivalence succeeds, build a fixed-width kernel and compare:

- named-rule implementation;
- U1+U2 universal implementation;
- no strategic terminalization.

Measure checks, hits, avoided nodes per hit, NPS, time-to-proof and state footprint separately.

## Sources consulted

- Victor Allis, *A Knowledge-based Approach of Connect-Four* (1988), especially chapters 4, 6 and 7: future-square parity/Zugzwang, the nine strategic rules, and the even-release compatibility invariant.
- General positional-game pairing-strategy literature: winning sets as hyperedges and response pairs as a Breaker strategy. This supports the blocker/pairing abstraction but is not implementation authority for this repository.
