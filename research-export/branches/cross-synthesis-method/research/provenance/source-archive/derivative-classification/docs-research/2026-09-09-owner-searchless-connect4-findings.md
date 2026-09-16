# My findings toward a searchless mathematics for Connect Four

**Date:** 2026-09-09  
**Author:** Josh Oshiro  
**Status:** my preserved research findings with subsequent qualification evidence.  
**Branch:** `research/low-confidence-survival-2026-09-09`  
**Maintained source / `main`:** unchanged.

## Purpose

I am preserving the conceptual path that led from my earlier Connect Four evaluator to the current searchless solver work.

Several of the strongest ideas here began as intuitions from my earlier engine rather than as conclusions read out of later benchmarks. The later algebraic reductions, prototypes, falsifiers, and oracle checks are evidence used to test those ideas.

My core hypothesis is:

> **Connect Four may ultimately be solvable by one fairly simple mathematics rather than by conventional move-tree search.**

I developed the CPC → winspace → nested-dependency → backward-closure line independently. I did not derive it from Victor Allis's work. Only later, after the main conceptual path was already present, did I compare it against Allis's earlier published Connect Four theory and discover meaningful overlap. Where that overlap exists, I want Allis cited correctly as earlier published related work without implying that his work was the source of my method.

---

## 1. My original future-control parity intuition — CPC

My earlier Connect Four engine used a parity count over the number of moves that can occur before a strategically relevant target square.

The idea was not merely that parity is a useful evaluator feature. I was using it to infer that the future controller of a square can sometimes be known without explicitly playing the intervening moves.

For target cell `t=(c,r)` with current column height `h_c`, the future-event count reduces to:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)

  = (W - 1)H - ply + r + 1
```

The target-column height cancels.

Future target ownership/control therefore depends on the parity of the event rank:

```text
owner(t) <- (N(t) - 1) mod 2
```

For standard 7x6, `(W-1)H = 36` is even, so the relation simplifies further.

I now call this mathematical shape **CPC — Control Parity Calculus**.

### Later-recognized correspondence with Allis

After this line was already developed, I compared it against Victor Allis's earlier Connect Four theory. His published Control of Zugzwang and strategic-rule interaction framework contains related parity-sensitive control structure.

In particular, when his Zugzwang-dependent rule combinations are reduced algebraically, even versus odd release of future squares produces a mod-2 control effect of the form:

```text
N'(t) = N(t) + Delta

owner'(t) = owner(t)
    iff Delta mod 2 = 0
```

I treat that as a **later-recognized structural correspondence between independently developed work and earlier published work**. It is not the source from which I derived CPC.

Related analysis is preserved in:

- `docs/research/2026-09-09-universal-strategic-algebra.md`
- `docs/research/2026-09-09-unification-candidate-map.md`

---

## 2. Winning positions rather than the full board — WSL-625

I then pushed toward the idea that the solver does not fundamentally need to carry the full colored board history as its primary state object.

What matters is the remaining set of ways each player can still win, together with enough support/accessibility and timing information to preserve legality.

This led to the residual winspace representation:

```text
state ~= surviving winning requirements
      + support / accessibility
      + side / event rank
```

rather than treating:

```text
state = complete historical colored board
```

as the only useful representation.

The standard 7x6 residual requirement universe was later reduced to a fixed **625-element** subset universe. I now call it **WSL-625 — Winspace Lattice 625**.

WSL-625 is useful not only as a compact identity. It is also a natural domain for:

- surviving winning requirements;
- strategic blockers;
- implication/subsumption;
- exhaustion;
- solved-group coverage;
- upward-closure queries;
- strategic certificates.

Evidence and development are preserved in:

- `docs/research/2026-09-09-win-space-representation-discussion.md`
- `docs/research/2026-09-09-win-space-search-representation.md`
- `docs/research/2026-09-09-structural-candidate-retest.md`
- `docs/research/2026-09-09-decision-state-proof-bitset-followup.md`

---

## 3. Terminal detectors are not ordinary search optimizations

I identified a missing conceptual category in the candidate graph.

Methods that infer a future disposition are not simply pruning or search-structure techniques. They can infer an eventual terminal proposition from the current state while skipping the intervening game entirely.

This led me to distinguish:

- search-structure optimization;
- admissible future bounds;
- forced-transition compression;
- **future-terminal detection / terminalization**.

Examples include:

- immediate win: exact one-ply terminalizer;
- double threat: bounded forced terminalizer;
- bilateral winspace exhaustion: exact strategic draw terminalizer;
- one-sided exhaustion: exact one-sided no-win certificate;
- compatible strategic cover: one-sided no-win certificate;
- projected exact parity/Zugzwang disposition: strategic future-terminal candidate.

This distinction is preserved in:

- `docs/research/2026-09-09-terminalization-candidate-audit.md`
- `docs/research/2026-09-09-candidate-classification-schema-v5.md`

---

## 4. Search for one underlying mechanism, not a catalog of tricks

I then proposed that several candidates might not merely interact well but might reduce to **one universal cheap mechanism**.

My instruction was to ignore named surface details, reduce the problems to lower-level algebraic shape, and only then compare them.

That reduction exposed two especially useful universal forms.

### U1 — parity / response / race algebra

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

This captures a common lower-level shape behind CPC and multiple strategic response patterns.

Later comparison showed that several of Allis's named strategic rules also admit reductions into this kind of structure. I credit Allis for the original named rules; the reduction into the common algebra is later comparative analysis.

### U2 — blocker lattice

Another universal proposition emerged:

> the opponent cannot own every cell in blocker set `B`.

Any winning requirement containing `B` is therefore dead.

Because useful blockers are subsets of geometric winning lines, they fit naturally into WSL-625.

The solved-group operation becomes:

```text
Solved(B)
  = OR over precomputed upward closures of blocker IDs
```

As a comparative test against Allis's prior rule framework, this generic blocker operation was checked across all nine of his rule families:

- **331,955 generated A1-A9 rule instances**;
- **0 solved-group mismatches** between the named Allis `Solutions` predicates and the generic blocker-upward-closure operation.

This does not mean the rule families originated here. It means their solved-group semantics can be represented by the common WSL-625 blocker operation.

Evidence:

- `docs/research/2026-09-09-universal-strategic-algebra.md`
- `docs/research/2026-09-09-universal-strategic-algebra-test-a.md`
- `docs/research/evidence/2026-09-09-universal-blocker-unification.json`

---

## 5. My critical insight: nest the dependencies — NDC

I then sharpened the hypothesis substantially:

> **The trick to solve from the first move is to nest the dependencies.**

This changes the architecture from a flat set of strategic rules or blockers into a recursive proof grammar.

A fact may depend on lower-level future facts:

```text
A depends on B and C
B depends on D
D depends on a terminal winning condition
```

Once `D` is established, it supports `B`; once `B` and `C` are established, they support `A`.

The proof can therefore span many future plies without enumerating those plies as conventional game states.

I now call this algorithmic idea **NDC — Nested Dependency Closure**.

### Why flat blocker closure was insufficient

Initial tests of flat blockers and simple static pairing policies did not solve the empty small-game roots.

A naive nested blocker rule also produced an unsound conclusion because it ignored temporal race order.

That falsifier was important:

```text
"I eventually get these cells"
!=
"I get these cells before the opponent completes a win"
```

Therefore NDC must include **temporal/event precedence** as a first-class fact.

This is preserved in:

- `docs/research/2026-09-09-nested-strategic-dependency-closure.md`
- `docs/research/2026-09-09-searchless-solver-hypothesis.md`

---

## 6. Stronger claim: the dependencies may replace search

I clarified that I was not merely proposing:

> use these dependencies to prune search.

I meant:

> **the dependencies may replace search entirely.**

That led to a deliberately stronger experimental target:

```text
no recursive minimax
no physical colored-state enumeration
start from terminal winning conditions
derive the game algebraically backward
```

### Proof-dependency compression control

Before the direct symbolic solver existed, the complete game graph was solved as a control and then quotient-compressed by proof dependency shape.

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

## 7. My backward direction: start at every potential win

I then supplied the decisive propagation direction:

> **Run the nested tree backwards starting from each potential winning position.**

This reframes geometric winning lines as proof axioms.

Instead of asking forward:

```text
what happens after this move?
```

I wanted the solver to ask backward:

```text
what predecessor ownership/support facts can reach this win?
what predecessor states force all replies into a win/loss class?
```

For W/D/L this naturally becomes an alternating fixed point:

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

## 8. Direct searchless symbolic solver — BSFP

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

It does not recursively call minimax and does not enumerate physical colored-board states during the direct solve.

I now call the solver architecture **BSFP — Backward Symbolic Fixed-Point**.

### Exact complete-game results

The direct backward symbolic solver correctly solved:

- 4x3 connect-3 -> first-player win;
- 4x4 connect-4 -> draw;
- 5x3 connect-4 -> draw;
- 4x5 connect-4 -> draw.

Independent qualification compared its symbolic W/D/L function against **every reachable physical state** of those games:

- **1,681,808 physical states**;
- **3,869,237 legal edges**;
- **0 W/D/L disagreements**.

### Standard 7x6 roots

The same backward symbolic recurrence, specialized by constant-folding already-known root stones, returned the correct W/D/L sign on all eight frozen 7x6 roots.

Evidence:

- `docs/research/2026-09-09-searchless-symbolic-backward-solver.md`
- `docs/research/evidence/2026-09-09-searchless-symbolic-backward-solver.json`
- `docs/research/2026-09-09-searchless-backward-candidate-update.md`

---

## 9. I required the terminal facts to be independently qualified

Because the whole backward proof begins at terminal winning axioms, I asked for a separate terminal-boundary check against known boards and outcomes rather than allowing BSFP to certify its own axioms.

### Exhaustive small-game terminal boundary

Across four complete games:

- **1,634,924 nonterminal states checked**;
- **3,869,237 legal edges checked**;
- **414,691 actual winning terminal edges**;
- **96,960 full-board terminal draws**;
- every geometric winning-line schema exercised;
- independent line-mask versus directional-scan agreement;
- **0 terminal predicate mismatches**;
- **0 reconstructed terminal-board mismatches**;
- **0 post-terminal states admitted**.

### Standard 7x6 external anchors

Externally documented 7x6 terminal games were independently reconstructed and matched:

- `4455673` -> first-player win;
- `1212121` -> first-player vertical win;
- `1525364` -> first-player horizontal win.

Each nonterminal parent was assigned the maintained oracle's exact immediate-win score `18`.

A documented 4x4 full-board draw was also reconstructed with no winner.

Evidence:

- `docs/research/2026-09-09-terminal-boundary-qualification.md`
- `docs/research/evidence/2026-09-09-terminal-boundary-qualification.json`

---

## 10. Current synthesis

My current conceptual stack is:

```text
GEOMETRIC WINNING-LINE AXIOMS
        |
        v
CPC — CONTROL PARITY / EVENT PRECEDENCE / RACE
        |
        v
WSL-625 — WINSPACE REQUIREMENTS / BLOCKERS
        |
        v
NDC — NESTED DEPENDENCY CLOSURE
        |
        v
BSFP — BACKWARD SYMBOLIC FIXED-POINT
        |
        v
W / D / L
```

Named strategic rules, parity/Zugzwang facts, blockers, exhaustion, immediate terminals, and several historical search candidates may ultimately be simplification rules or special cases inside one proof algebra rather than independent solving systems.

Later comparison with Allis's prior work showed that several of his named strategic rules map cleanly into parts of this algebra. I treat that as evidence that two independently developed descriptions are touching some of the same underlying Connect Four structure.

This is the closest the research has come to my long-standing intuition that there is **one fairly simple mathematics underlying Connect Four**.

---

## 11. What is established versus still open

### Established with strong evidence

1. Future-square control has a parity/event-rank structure in CPC.
2. Later comparison shows a structural correspondence between CPC-style control parity and parts of Allis's earlier published Zugzwang framework.
3. All nine Allis solved-group relations tested can be represented by one generic blocker/upward-closure operation over WSL-625, with 331,955 generated instances and zero solved-group mismatches.
4. Flat static strategic rules are insufficient; dependency nesting and temporal precedence matter.
5. Exact W/D/L proof objects are dramatically smaller than physical move/state graphs.
6. Backward propagation from winning-line axioms is a correct direction for exact W/D/L solving on the tested games.
7. A direct backward symbolic solver can solve complete small games exactly without explicit colored-state enumeration or recursive minimax.
8. The same recurrence works on nontrivial standard 7x6 frozen roots.
9. The terminal axioms have been independently validated against exhaustive physical games, known terminal fixtures, and the maintained oracle.

### Still open

1. Empty standard 7x6 has **not yet completed** in the current generic raw-ownership MTBDD implementation.
2. The primary current obstacle is symbolic representation width, not correctness of the backward W/D/L recurrence on the tested domains.
3. The generic MTBDD is almost certainly not the final representation.
4. The strongest next representation is expected to use WSL-625 residual requirements, support events, CPC parity/response facts, blocker closure, and dominance antichains directly.
5. Exact strong-score/distance refinement remains a second proof problem after W/D/L unless the backward algebra is extended to carry distance directly.
6. It remains to be shown whether the entire strategic response-selection problem collapses to canonical algebraic closure with no combinatorial branch selection.

---

## 12. Research priority implied by these findings

I do not want ordinary forward-search optimization treated as the primary path until the compact backward algebra has been fairly tested.

The next high-value work is:

1. replace raw ownership variables inside BSFP with the already-proven residual/event algebra;
2. represent winning/losing regions by dominance-antichain frontiers;
3. compile CPC parity/response/race constraints into backward predecessor operators;
4. use WSL-625 blocker closure directly as symbolic terminal/proof simplification;
5. exploit symmetry/canonicalization at the symbolic proof level;
6. batch the work so bounded VRAM determines shard size rather than maximum solvable graph size;
7. use the CUDA-JS ecosystem for GPU execution where the fixed-width symbolic workload maps cleanly;
8. retry the empty 7x6 board;
9. only after W/D/L is solved compactly, decide whether exact-distance refinement should also be searchless or use a smaller second-stage proof process.

---

## Attribution and publication note

I want the provenance stated accurately in any paper or public write-up.

### My independently developed line

I, **Josh Oshiro**, independently developed or supplied the conceptual direction for:

- my original future-control parity evaluator;
- CPC — Control Parity Calculus;
- reasoning over potential/surviving winning positions rather than treating the full board as the only primary representation;
- the direction that led to WSL-625;
- recognizing future-terminal detectors as distinct from ordinary search-structure optimization;
- looking for one underlying algebra across apparently different mechanisms;
- **nesting dependencies** as the route to solving from the first move;
- NDC — Nested Dependency Closure;
- the stronger hypothesis that those dependencies may replace search entirely;
- **running the nested dependency system backward from every potential winning position**;
- BSFP — Backward Symbolic Fixed-Point;
- requiring terminal states to be independently confirmed against known solutions and reconstructed terminal boards before trusting the backward proof.

### Victor Allis's earlier published related work

Victor Allis independently published earlier Connect Four work that overlaps with parts of the strategic territory here. I credit him for his 1988 treatment of Control of Zugzwang, the VICTOR knowledge-based framework, the nine named strategic rules, and their rule interactions.

I did not take CPC, NDC, or BSFP from Allis. The overlap was recognized later. When my later analysis maps an Allis rule into CPC/WSL-625/NDC form or reproduces a structure already present in his work, the paper should cite him as earlier published prior work while stating that my route to the method was independent.

That wording avoids both mistakes: claiming earlier overlapping work as though it did not exist, or falsely implying that my method was derived from it.

**Allis reference:** Victor Allis, *A Knowledge-based Approach of Connect-Four: The Game is Solved: White Wins*, M.Sc. thesis, Vrije Universiteit Amsterdam, October 1988, Report IR-163.
