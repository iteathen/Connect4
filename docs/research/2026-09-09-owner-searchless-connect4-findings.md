# Owner-originated findings — toward a single searchless mathematics for Connect Four

**Date:** 2026-09-09  
**Status:** preserved owner research findings with subsequent qualification evidence.  
**Branch:** `research/low-confidence-survival-2026-09-09`  
**Maintained source / `main`:** unchanged.

## Purpose

This note preserves the project owner's conceptual findings separately from later implementation and qualification work.

The distinction matters. Several of the strongest ideas in the current research direction did not arise as post-hoc interpretations of benchmarks. They originated as design intuitions from the owner's earlier Connect Four engine work and were then sharpened, algebraically reduced, implemented, falsified where necessary, and qualified against exact oracles.

The core owner hypothesis is:

> **Connect Four may ultimately be solvable by one fairly simple mathematics rather than by conventional move-tree search.**

The current research has materially strengthened that hypothesis.

---

## 1. Original parity / Zugzwang intuition

The owner's earlier Connect Four engine used a parity count over the number of moves that can occur before a strategically relevant target square.

The original intuition was not merely that parity is a useful evaluator feature. It was that the future owner of a square can sometimes be known without playing the intervening moves.

For target cell `t=(c,r)` with current column height `h_c`, the relevant future-event count reduces algebraically to:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)

  = (W - 1)H - ply + r + 1
```

The target-column height cancels.

Therefore future target ownership depends only on the parity of this event rank:

```text
owner(t) <- (N(t) - 1) mod 2
```

For standard 7x6, `(W-1)H = 36` is even, so the relation simplifies further.

### Later connection to Allis

When Allis's strategic rules were reduced below their named surface forms, the same invariant appeared again.

Allis's Zugzwang compatibility condition says, operationally, that composing a strategic rule must release an even number of squares if future Zugzwang ownership is to remain unchanged.

That is the same algebra:

```text
N'(t) = N(t) + Delta

owner'(t) = owner(t)
    iff Delta mod 2 = 0
```

Thus the owner's parity calculation and Allis's rule-combination Zugzwang condition are two expressions of the same GF(2) future-event invariant.

This is preserved in:

- `docs/research/2026-09-09-universal-strategic-algebra.md`
- `docs/research/2026-09-09-unification-candidate-map.md`

---

## 2. Winning positions rather than the full board

A second owner observation was that search does not fundamentally need the full colored board history.

What matters is the remaining set of ways each player can still win, together with enough support/accessibility information to preserve legality.

This led to the residual win-space representation:

```text
state ~= surviving winning requirements
      + support / accessibility
      + side / event rank
```

rather than:

```text
state = complete historical colored board
```

The residual requirement universe for standard 7x6 was later reduced to a fixed **625-ID** subset universe.

That universe now appears to be more than a compact search identity. It is also a natural algebraic domain for strategic blockers, implication, exhaustion, and potentially the backward symbolic proof engine.

Evidence and development are preserved in:

- `docs/research/2026-09-09-win-space-representation-discussion.md`
- `docs/research/2026-09-09-win-space-search-representation.md`
- `docs/research/2026-09-09-structural-candidate-retest.md`
- `docs/research/2026-09-09-decision-state-proof-bitset-followup.md`

---

## 3. Terminal detectors are not ordinary search optimizations

The owner identified a missing conceptual category in the candidate graph.

Methods such as an exact parity/Zugzwang disposition are not simply pruning or search-structure techniques. They can infer an eventual terminal proposition from the current state while skipping the intervening game entirely.

This led to the explicit distinction between:

- search-structure optimization;
- admissible future bounds;
- forced-transition compression;
- **future-terminal detection / terminalization**.

Examples:

- immediate win: exact one-ply terminalizer;
- double threat: bounded forced terminalizer;
- bilateral win-space exhaustion: exact strategic draw terminalizer;
- one-sided exhaustion: exact one-sided no-win certificate;
- Allis compatible cover: strategic one-sided no-win certificate;
- projected exact parity/Zugzwang detector (`ZPAR`): strategic future-terminal candidate.

This distinction is preserved in:

- `docs/research/2026-09-09-terminalization-candidate-audit.md`
- `docs/research/2026-09-09-candidate-classification-schema-v5.md`

---

## 4. Search for a universal solution, not a catalog of tricks

The owner then proposed that several candidates might not merely interact well, but might be solvable by **one universal cheap mechanism**.

The instruction was to ignore named surface details, algebraically reduce the problems to lower-level shape, and only then compare them.

That reduction produced two closely related universal mechanisms.

### U1 — parity / response algebra

Primitive strategic facts reduce largely to:

```text
fixed ownership:
    owner(e) = player

split / response ownership:
    owner(e1) XOR owner(e2) = 1

resource / response obligations:
    trigger -> response

release parity:
    Delta mod 2

precedence / race constraints:
    event A must occur before event B
```

This captures the common lower-level shape behind:

- the owner's parity/Zugzwang calculation;
- Allis Zugzwang compatibility;
- Claimeven;
- Baseinverse;
- Vertical;
- much of Lowinverse, Highinverse, and Baseclaim;
- projected generic forms of Aftereven, Before, and Specialbefore.

### U2 — blocker lattice

The owner/assistant reduction also exposed a universal terminally relevant proposition:

> the opponent cannot own every cell in blocker set `B`.

Any winning requirement containing `B` is therefore dead.

Because every useful blocker is a subset of some geometric winning line, it fits in the same 625-ID residual requirement universe.

The solved-group operation becomes:

```text
Solved(B)
  = OR over precomputed upward closures of blocker IDs
```

This was mechanically tested across all nine Allis rule families:

- **331,955 generated A1-A9 rule instances**;
- **0 solved-group mismatches** between named Allis `Solutions` predicates and the generic blocker-upward-closure operation.

This is preserved in:

- `docs/research/2026-09-09-universal-strategic-algebra.md`
- `docs/research/2026-09-09-universal-strategic-algebra-test-a.md`
- `docs/research/evidence/2026-09-09-universal-blocker-unification.json`

---

## 5. The critical owner insight: nest the dependencies

The owner then sharpened the hypothesis substantially:

> **The trick to solve from the first move is to nest the dependencies.**

This changes the architecture from a flat set of strategic rules or blockers into a recursive proof grammar.

A fact may depend on lower-level future facts:

```text
A depends on B and C
B depends on D
D depends on a terminal winning condition
```

Once `D` is established, it supports `B`; once `B` and `C` are established, they support `A`.

The proof can therefore span many future plies without enumerating those plies as game states.

### Why flat blocker closure was insufficient

Initial tests of flat blockers and simple static pairing policies did not solve the empty small-game roots.

A naive nested blocker rule also produced an unsound conclusion because it ignored temporal race order.

That falsifier was important:

```text
"I eventually get these cells"
!=
"I get these cells before the opponent completes a win"
```

Therefore the nested dependency algebra must include **temporal/event precedence** as a first-class fact.

This is preserved in:

- `docs/research/2026-09-09-nested-strategic-dependency-closure.md`
- `docs/research/2026-09-09-searchless-solver-hypothesis.md`

---

## 6. Stronger owner claim: the game may be solvable without search

The owner clarified that the intended claim was not merely:

> use these dependencies to prune search.

It was:

> **the dependencies may replace search entirely.**

This led to a deliberately stronger experimental target:

```text
no recursive minimax
no physical colored-state enumeration
start from terminal winning conditions
derive the game algebraically backward
```

### Proof-dependency compression control

Before a direct solver existed, the complete game graph was solved as a control and then quotient-compressed by proof dependency shape.

The resulting W/D/L proof objects were extraordinarily small:

| Game/root | Physical states | Root WDL proof DAG |
|---|---:|---:|
| 4x3 connect-3 | 4,659 | 9 |
| 4x4 connect-4 | 139,625 | 17 |
| 5x3 connect-4 | 152,003 | 16 |
| 4x5 connect-4 | 1,385,521 | 21 |
| hardest frozen 7x6 root tested | 214,461 | 38 |

The 4x3 first-player win therefore has a nine-node logical dependency proof even though its physical game contains thousands of states.

This established that the move tree is not remotely the minimal representation of the proof.

Evidence:

- `docs/research/2026-09-09-searchless-closure-test-results.md`
- `docs/research/evidence/2026-09-09-searchless-dependency-shape-results.json`

---

## 7. The owner's backward direction: start at every potential win

The owner then supplied the decisive direction of propagation:

> **Run the nested tree backwards starting from each potential winning position.**

This reframes geometric winning lines as the proof axioms.

Instead of forward questions such as:

```text
what happens after this move?
```

the solver asks backward:

```text
what predecessor ownership/support facts can reach this win?
what predecessor states force all replies into a win/loss class?
```

For W/D/L this is naturally an alternating fixed point:

```text
wins/losses: least fixed point grown backward from terminal wins

draws: greatest-fixed-point residue outside the winning attractors
```

The retrograde control reached:

- the 4x3 first-player win in 9 backward dependency waves;
- representative 7x6 frozen roots in roughly 12-15 waves.

This direction is preserved in:

- `docs/research/2026-09-09-backward-winline-fixed-point.md`
- `docs/research/evidence/2026-09-09-backward-winline-fixed-point.json`

---

## 8. Direct searchless symbolic solver produced from that finding

The backward formulation was then implemented directly.

For each support/height skeleton `h`, define a symbolic W/D/L function `V_h` over ownership of already-filled cells.

For a legal move into cell `x`:

```text
Move_c(h)
  = terminal mover win
      if x completes a geometric winning line
  = V_{h + e_c}[x := mover]
      otherwise
```

Then:

```text
P0 turn: V_h = max over move functions
P1 turn: V_h = min over move functions
```

This is processed **backward from deeper support skeletons toward the empty skeleton**.

It does not recursively call minimax and does not enumerate physical colored board states during the direct solve.

### Exact complete-game results

The direct backward symbolic solver correctly solved:

- 4x3 connect-3 -> first-player win;
- 4x4 connect-4 -> draw;
- 5x3 connect-4 -> draw;
- 4x5 connect-4 -> draw.

The independent qualification then compared its symbolic W/D/L function against **every reachable physical state** of those games:

- **1,681,808 physical states**;
- **3,869,237 legal edges**;
- **0 W/D/L disagreements**.

### Standard 7x6 roots

The same backward symbolic recurrence, specialized by constant-folding already-known root stones, returned the correct W/D/L sign on all eight frozen 7x6 roots.

Evidence:

- `docs/research/2026-09-09-searchless-symbolic-backward-solver.md`
- `docs/research/evidence/2026-09-09-searchless-symbolic-backward-solver.json`
- `docs/research/2026-09-09-searchless-backward-candidate-update.md`

The resulting candidate is tracked as:

```text
BSF — backward symbolic fixed-point solver
```

---

## 9. Terminal facts independently qualified

Because the entire backward proof begins at terminal winning axioms, the owner requested a separate terminal-boundary check against known boards/outcomes.

That qualification was intentionally independent of the BSF recurrence.

### Exhaustive small-game terminal boundary

Across four complete games:

- **1,634,924 nonterminal states checked**;
- **3,869,237 legal edges checked**;
- **414,691 actual winning terminal edges**;
- **96,960 full-board terminal draws**;
- every geometric winning-line schema exercised;
- independent line-mask vs directional-scan agreement;
- **0 terminal predicate mismatches**;
- **0 reconstructed terminal board mismatches**;
- **0 post-terminal states admitted**.

### Standard 7x6 external anchors

Externally documented 7x6 terminal games were reconstructed and matched:

- `4455673` -> first-player win;
- `1212121` -> first-player vertical win;
- `1525364` -> first-player horizontal win.

Each nonterminal parent was assigned the maintained oracle's exact immediate-win score `18`.

A documented 4x4 full-board draw was also reconstructed with no winner.

Evidence:

- `docs/research/2026-09-09-terminal-boundary-qualification.md`
- `docs/research/evidence/2026-09-09-terminal-boundary-qualification.json`

---

## 10. Current synthesis of the owner's hypothesis

The strongest current formulation is:

```text
GEOMETRIC WINNING-LINE AXIOMS
        |
        v
SUPPORT / EVENT PRECEDENCE
        |
        +----> U1 parity / response / race algebra
        |
        +----> U2 blocker / residual requirement lattice
        |
        v
NESTED BACKWARD DEPENDENCY CLOSURE
        |
        v
BSF FIXED POINT
        |
        v
W / D / L
```

The named Allis rules, parity/Zugzwang facts, blockers, exhaustion, immediate terminals, and many historical search candidates may ultimately be simplification rules or special cases inside this one proof algebra rather than independent solving systems.

This is the closest the research has come to the owner's long-standing intuition that there is **one fairly simple mathematics underlying Connect Four**.

---

## 11. What is established versus still open

### Established with strong evidence

1. Future square ownership has a parity/event-rank structure.
2. The owner's Zugzwang parity relation and Allis's even-release compatibility condition share the same mod-2 invariant.
3. All nine Allis solved-group relations can be represented by one generic blocker/upward-closure operation over the 625-ID lattice.
4. Flat static strategic rules are insufficient; dependency nesting and temporal precedence matter.
5. Exact W/D/L proof objects are dramatically smaller than physical move/state graphs.
6. Backward propagation from winning-line axioms is a correct direction for exact W/D/L solving.
7. A direct backward symbolic solver can solve complete small games exactly without explicit colored-state enumeration or recursive minimax.
8. The same recurrence works on nontrivial standard 7x6 frozen roots.
9. The terminal axioms have been independently validated against exhaustive physical games, known terminal fixtures, and the maintained oracle.

### Still open

1. Empty standard 7x6 has **not yet completed** in the current generic raw-ownership MTBDD implementation.
2. The primary current obstacle is symbolic representation width, not correctness of the backward W/D/L recurrence.
3. The generic MTBDD is almost certainly not the final representation.
4. The strongest next representation is expected to use residual requirements, support events, U1 parity/response facts, U2 blocker closure, and dominance antichains directly.
5. Exact strong-score/distance refinement remains a second proof problem after W/D/L unless the backward algebra is extended to carry distance directly.
6. It remains to be shown whether the entire strategic response-selection problem collapses to canonical algebraic closure with no combinatorial branch selection.

---

## 12. Research priority implied by these findings

Do not treat ordinary forward-search optimization as the primary path until the compact backward algebra has been fairly tested.

The next high-value work is:

1. replace raw ownership variables inside BSF with the already-proven residual/event algebra;
2. represent winning/losing regions by dominance antichain frontiers;
3. compile U1 parity/response/race constraints into backward predecessor operators;
4. use U2/RID blocker closure directly as symbolic terminal/proof simplification;
5. exploit symmetry/canonicalization at the symbolic proof level;
6. retry the empty 7x6 board;
7. only after W/D/L is solved compactly, decide whether exact-distance refinement should also be searchless or use a much smaller second-stage proof process.

---

## Attribution note

The following conceptual directions are specifically preserved as **owner-originated findings/intuition** from this research sequence:

- the belief that Connect Four ultimately has one fairly simple mathematical solution;
- future-square ownership via parity/Zugzwang counting from the earlier engine;
- reducing search state toward surviving winning positions rather than carrying the full board;
- recognizing future-terminal detectors as a different class from search-structure optimization;
- looking for one universal cheap mechanism across owner methods, Allis, and other candidates;
- algebraically reducing named methods until common lower-level shape appears;
- **nesting dependencies** as the route to solving from the first move;
- the stronger claim that those dependencies may replace search entirely;
- **running the nested dependency system backward from every potential winning position**;
- requiring terminal states to be independently confirmed against known solutions and reconstructed terminal boards before trusting the backward proof.

Subsequent algebraic derivations, prototypes, falsifiers, benchmarks, oracle checks, and symbolic fixed-point implementations are the qualification/execution evidence that followed those owner directions.
