# Minimum-description exact state: semantic quotient shared by minimax and BSFP

**Date:** 2026-09-10  
**Branch:** `research/semantic-quotient`  
**Status:** cross-solver research synthesis and experiment program; no solver implementation promotion.

## 1. Question

The minimax and CUDA-BSFP research lines have converged on the same structural question from opposite directions:

> What is the smallest exact description of the **remaining game**, rather than of the historical colored board?

Kolmogorov complexity motivates the direction but is not a computable engineering metric. The usable target is an exact behavioral quotient: remove a distinction only when it cannot change any future transition or game-theoretic consequence required by the consuming solver.

The two solvers should not be merged. They may nevertheless consume the same compressed game ontology:

```text
rules + geometry
      |
      v
exact semantic quotient / transition system
      |                         |
      v                         v
alpha-beta / minimax         BSFP fixed point
```

The research objective is therefore not "bring BSFP into minimax." It is to reuse BSFP/OQS discoveries about **which information future behavior actually depends on**.

---

## 2. Exact minimax equivalence criterion

For a minimax state representation `Q(s)`, equality must preserve more than W/D/L.

A sufficient action-labeled behavioral criterion is:

For any two legal nonterminal physical states `s` and `t` with `Q(s) = Q(t)`:

1. side to move is identical, or is derivable from the quotient;
2. exact ply/rank needed by distance-sensitive terminal scoring is identical, or derivable;
3. the legal action set is identical;
4. for every legal action `a`, immediate terminal/winner meaning is identical;
5. for every nonterminal action `a`,
   `Q(T(s,a)) = Q(T(t,a))`.

Then exact minimax value and every action value are preserved by induction on remaining capacity. If terminal scores depend only on quotient-preserved rank/terminal facts, the quotient preserves the distance-sensitive strong score as well as W/D/L.

This is the practical correctness criterion. It is close to an action-labeled bisimulation / Myhill-Nerode-style future equivalence.

A smaller representation is not accepted from bit count, hash agreement, sampled score agreement, or W/D/L agreement alone when the minimax consumer requires stronger action/distance semantics.

---

## 3. What the existing minimax research already proved

The consolidated minimax line established several pieces of this quotient idea independently.

### Historical color is not always semantic state

Win-space mechanism tests accepted exact TT hits between different colored historical boards when their residual winning structure and support state matched. On the selected structural cohort, allowing those exact cross-history hits reduced nodes from 112,170 to 77,169, while rejecting them restored the larger tree.

Thus some physical board distinctions are already known to be representational redundancy for exact search.

### WSL-625 is finite and incrementally maintainable

Standard 7x6 has 625 unique non-empty residual winning requirements derived from the 69 geometric winning lines. The minimal requirement antichain can be maintained using fixed IDs and precomputed subset/transition relations rather than rebuilt through dynamic set operations.

### Support/accessibility cannot be discarded casually

The support/event research repeatedly falsified representations that preserved win sets but lost legal timing/accessibility. Any smaller quotient must retain enough support/event information to preserve legal actions and terminal timing.

### Decision states matter more than transit states

Forced single-choice states can be collapsed into macro-edges and omitted from general TT admission. This is already a minimum-description result at the graph level: a deterministic transit state does not necessarily deserve independent proof-memory identity.

### Residual automorphisms are real

Distinct physical column arrangements can become interchangeable after residualization even when ordinary board symmetry does not apply. This is further evidence that the right equivalence acts on the remaining game, not the original coordinates/history.

---

## 4. What CUDA-BSFP adds

The BSFP/OQS line contains several stronger quotient/compiler results that are directly relevant to minimax state design.

### 4.1 Identified line-hit quotient

At fixed support, define immutable `I(x)` as the set of identified winning lines incident to cell `x` and:

```text
H0 = OR I(x) over P0-owned occupied cells
H1 = OR I(x) over P1-owned occupied cells
```

Candidate physical state:

```text
Qphysical = (support, H0, H1)
```

A legal move is a local monotone update:

```text
P0 at x: H0' = H0 OR I(x)
P1 at x: H1' = H1 OR I(x)
```

At fixed support, a P0 winning line is viable iff P1 has not hit it, and its remaining cells are derivable from `(support,lineId)`. The same holds dually.

The complete physical-graph qualification on 4x3, 4x4, 5x3 and 4x5 reported zero mismatches for terminal predicates, successor hit signatures, reachable quotient classes and exact W/D/L across 1,681,808 physical nonterminal states.

The quotient strongly collapses late histories: on 4x5 rank 19, 88,520 physical states collapse to 64 quotient states; rank 20 collapses 37,080 physical histories to one quotient class.

This is currently the strongest direct candidate to test as a minimax semantic state.

### 4.2 Important qualification gap for minimax

The published identified-line experiment formally claims physical transition/WDL equivalence. It does not explicitly qualify the minimax line's distance-sensitive strong score and per-action scores.

Because the quotient already preserves support, action availability, terminal detection and per-action quotient transitions in the tested controls, strong-score preservation is strongly suggested. It should nevertheless receive its own explicit exact gate rather than being inferred into authority.

### 4.3 Separator hidden-history census

The line-first separator experiment asks exactly the minimum-description question at an internal symbolic cut.

Crossing ownership alone was insufficient for the full symbolic C1 domain, but the missing future-relevant history remained small on measured controls:

- 4x3: max 8 classes / 3 bits;
- 4x4: max 6 / 3 bits;
- 5x3: max 5 / 3 bits;
- 4x5 hot: max 7 / 3 bits;
- 5x4 hot: max 11 / 4 bits;
- 5x5 hot: max 26 / 5 bits.

The raw processed-line viability description could require tens of thousands of signatures while the exact future-behavior quotient needed only a few dozen classes. This is direct evidence that **future behavior can have much lower description complexity than a natural semantic accumulator**.

The same experiment found no physically reachable collision in the measured controls after the reachability correction. That does not prove the 7x6 physical quotient bound, but it suggests the physical/legal minimax quotient may be smaller than the full symbolic BSFP quotient.

### 4.4 Transition-stable residual classes

R3 established on tested controls that canonical residual-function classes are closed under adjacent line transitions. R4 compiled them into a pointer-free artifact:

```text
stateId + inputOrdinal -> nextStateId
```

with dense layer-local IDs, contiguous typed arrays, no BDD/ZDD graph, and no semantic map lookup in the hot transfer path.

Maximum local ownership input width stayed at or below connect length, giving fanout at most 16 for connect-4 controls.

The representative worst tested 5x5 support produced a runtime artifact of only 45,340 bytes, with 1,603 maximum live dense states and 22,598 transitions.

This is directly transferable as an implementation principle for minimax: **canonicalize once, traverse integer transitions thereafter**.

### 4.5 Incremental OQS

R6 showed that quotient layers need not be rebuilt from all forgotten histories. Starting from one exact semantic seed, each next layer can be synthesized from current quotient states plus only newly introduced local ownership bits.

On the 5x5 support-4426 oracle checkpoint:

```text
incremental synthesis: 230.546 ms
independent rebuild:  16,372.407 ms
ratio:                    71.02x
```

The key transfer is not that minimax should run the OQS line stream while searching. It is that an exact semantic quotient can be **compiled incrementally from its own current classes** rather than reconstructed from historical board descriptions.

### 4.6 Flat transfer rather than dynamic canonicalization

The BSFP research rejected generic pointer-heavy ZDD/BDD runtime machinery even where the Boolean algebra was exact. The winning direction was fixed-width class IDs and flat transition arrays.

This matches the minimax performance evidence: semantic compression only matters if it does not replace the 10M-NPS-class fixed-width kernel with dynamic maps, sets, allocation or graph traversal.

---

## 5. What should transfer to minimax

### A. Identified-line state as the first lower-description control

Test `(support,H0,H1)` directly against the current colored-board two-word exact search.

This representation is attractive because:

- support gives legal landing cells and ply;
- line identity is fixed in 69 bits per side;
- residual requirements can be derived when needed from support + viable line identity;
- move update is a few fixed-width OR operations;
- historical stone color outside its surviving line effects disappears.

Do **not** assume the final representation must carry all 138 line-hit bits. This is the first exact semantic control from which a smaller quotient can be derived.

### B. Strong-score behavioral quotient

Define minimax quotient equality by action-labeled future behavior, not by state syntax.

For complete small games, compute the coarsest partition preserving:

- rank/side;
- legal action labels;
- immediate terminal score for each action;
- successor partition class per action.

This yields a finite exact behavioral quotient against which all proposed compact representations can be compared.

This partition is a computable finite analogue of the otherwise uncomputable minimum-description intuition.

### C. OQS-style class IDs as compiled minimax state

If `(support,H0,H1)` still carries redundant distinctions, quotient its states by exact future behavior and assign dense IDs.

Candidate runtime form:

```text
supportId + classId + legal column
    -> terminal score
    or
    -> childSupportId + childClassId
```

If support is implicit in bank/level context, the stored hot key may need only `classId` plus the minimum additional proof identity.

This should be viewed as a compiled transition automaton, not a solved-value database. Values remain computed by alpha-beta unless a separate experiment explicitly precomputes them.

### D. Use the 625 universe as inference vocabulary, not necessarily primary identity

WSL-625 remains extremely useful for:

- tactical completion/blocking;
- subset absorption;
- blocker/Allis certificates;
- dominance implication;
- evaluator/proof-order metadata.

But the identified-line result suggests the complete physical state may often be represented more compactly by support + line-hit information, with WSL requirements derived or compiled as consequences.

This is a candidate reduction of **stored state**, not a rejection of WSL mathematics.

### E. Import the BSFP "hidden-history census" methodology

For every proposed smaller minimax state, do not merely compare root scores. Bucket physical states by the candidate key and ask:

```text
How many distinct future-behavior classes remain behind one candidate key?
```

When more than one class exists, preserve the smallest concrete counterexample and classify the missing information. Add only that information and rerun.

This is a disciplined minimum-description search rather than representation guessing.

### F. Flat transfer tables for expensive semantic updates

If a semantic update would require scanning 69 lines or 625 requirements per visited node, compile the update into a dense transition table where practical.

The desired hot operation is closer to:

```text
nextClass = transfer[classId * 7 + column]
```

than to rebuilding/canonicalizing residual structures inside alpha-beta.

---

## 6. What should NOT transfer

The following BSFP mechanisms should not be imported merely because they exist:

- the BSFP backward fixed-point recurrence;
- C1 symbolic ownership antichains as the minimax search algorithm;
- W/D/L-only quotient equality when minimax needs exact distance-sensitive action values;
- line-cut residual class IDs without a proved mapping to whole-game legal state;
- ownership histories that exist only to represent the full symbolic C1 domain if physical legal states do not require them;
- GPU-specific normalization/reducer machinery that does not reduce minimax hot work;
- a concrete enumeration of every line-hit quotient state;
- generic runtime BDD/ZDD graphs.

The transfer target is semantic information and compilation technique, not solver control flow.

---

## 7. Kolmogorov / description-length accounting

True Kolmogorov complexity cannot be computed. A useful engineering surrogate should track at least four separate costs:

1. **state description** — bits/words needed for one exact current state;
2. **transition description** — static bytes needed to map local actions to next state;
3. **construction cost** — startup/root/coarse-boundary work needed to obtain the quotient/artifact;
4. **proof cost** — actual alpha-beta nodes and elapsed time after using the representation.

A representation with fewer state bits can still lose if its decoder/canonicalizer is expensive. This already happened in the first native win-space minimax prototypes.

Therefore the final objective remains time to exact proof, while description length is used to expose removable information and predict cache/transition advantages.

A useful experiment table should report:

```text
candidate
exactness scope
state bits / record bytes
static transition bytes
compile/preparation time
hot transition operations
TT bytes / usable entries
nodes to exact proof
elapsed time
```

---

## 8. Proposed experiment sequence

### MQ1 — strong-score qualification of the identified-line quotient

On complete 4x3, 4x4 and 5x3 controls, and then 4x5 if practical:

- construct the complete physical legal graph;
- group by `(support,H0,H1)`;
- require equal exact distance-sensitive state value;
- require equal per-column action values;
- require identical legal action labels and terminal timing;
- emit smallest counterexample on any mismatch.

This is the first missing gate.

### MQ2 — compute the coarsest exact behavioral quotient on complete controls

Starting from terminal/rank/action signatures, perform exact partition refinement until stable.

Measure:

- physical states;
- `(support,H0,H1)` classes;
- WSL/residual classes;
- final behavioral classes;
- maximum/mean multiplicity at each stage;
- minimum class-ID bits by rank/support.

This tells us how much description remains removable after the already-known line-hit quotient.

### MQ3 — identify the missing semantic accumulator

If the behavioral quotient is materially smaller than line-hit state, classify what distinguishes line-hit states that nevertheless have identical future behavior.

Candidate explanations include:

- line hits outside all future-relevant support events;
- residual automorphisms;
- neutral/dead capacity;
- already-implied tactical/terminal facts;
- support-event equivalence;
- quotient classes not expressible as one simple mask relation.

Prefer a dense class ID over adding another wide human-readable accumulator when behavior already supplies the canonical partition.

### MQ4 — compile action transitions

Compile:

```text
(classId, legal column) -> terminal | nextClassId
```

per support/rank context.

Require exact transition parity with the physical oracle. Measure target width, table density, bytes/state, bytes/transition and CPU replay throughput.

### MQ5 — plug the quotient into serial alpha-beta

Use the existing exact-distance solver driver but replace board-derived semantic identity/update with the compiled quotient transition.

Keep search policy fixed first:

- same null-window sequence;
- same move order;
- same direct TT capacity in bytes;
- same tactical semantics;
- no parallelism change.

Compare against the strongest fixed-width colored-board control by exact score, nodes and elapsed time.

### MQ6 — reapply proven search-side mechanisms

Only after MQ5:

- decision-state admission / forced macro-edges;
- rank-aware TT placement;
- compact exact key around the new canonical identity;
- residual automorphism if not already subsumed by the quotient;
- completed coarse-proof reuse;
- residual evaluator/proof-order hints.

Many existing mechanisms may become redundant once the quotient is stronger. Requalify instead of blindly stacking them.

### MQ7 — medium/early 7x6 falsification

Use the maintained exact oracle and frozen beginning/middle controls to verify quotient transitions/action values without requiring an empty-board completion first.

Do not tune against one frozen corpus and then call it untouched evidence.

---

## 9. Important possibility: minimax may need a smaller quotient than BSFP

BSFP C1 represents a complete symbolic ownership function over assignments, including histories that need not correspond to one physically reachable legal game path.

The separator census already observed symbolic hidden-history collisions but no physically reachable collision in the tested controls.

Therefore the minimax/search consumer may legitimately admit a smaller state than the full C1 symbolic quotient because its domain is only physically legal reachable states.

This is an important reason **not** to reuse BSFP class IDs blindly. Use the BSFP machinery as a quotient-discovery oracle, then minimize again under the exact minimax behavioral domain.

---

## 10. Research-branch disposition

The research corpus had become fragmented across solver-specific branches. This document establishes `research/semantic-quotient` as the continuity lane for future work whose owner is the shared game representation rather than one solver.

Source implementations remain where they belong:

- minimax/search prototypes and evidence: `solver/minimax-alpha-beta`;
- production-adjacent BSFP: `feature/cuda-bsfp`;
- existing OQS/ZDD/flat-transfer prototypes and evidence: `research/zdd-transfer-20260910` (ancestral source for this branch).

New semantic-quotient experiments should land here first. Once one experiment clearly belongs to a solver implementation, move/promote it deliberately to the appropriate solver branch with solver-specific qualification.

## 11. Current hypothesis

The strongest current hypothesis is:

```text
historical colored board
      -> support + identified future-line effects
      -> exact behavioral quotient class
      -> dense integer state ID
      -> flat action transition
```

with WSL/CPC/NDC facts compiled as certificates, bounds or ordering metadata rather than necessarily stored as the complete recursive state.

If this holds at useful scale, minimax gets the same organic benefit BSFP is pursuing:

> stop paying repeatedly for information that future behavior has already forgotten.
