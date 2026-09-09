# BSFP terminology and attribution

**Date:** 2026-09-09  
**Status:** canonical research terminology for the current searchless Connect Four line of work.  
**Branch:** `research/low-confidence-survival-2026-09-09`  
**Maintained source / `main`:** unchanged.

## Attribution

The conceptual line documented here is credited to **Josh Oshiro**, project owner.

The research progression began with Oshiro's original Connect Four evaluator, whose core idea was to infer future strategic control from the parity of the move/event reservoir before a target square. During the 2026-09-09 research work, that idea was generalized into a searchless exact-solving architecture built around residual winning requirements, nested dependencies, and backward closure from terminal outcomes.

Implementation experiments, algebraic reductions, falsification tests, oracle qualification, and terminology refinement were performed subsequently to test and sharpen those owner-originated ideas. Those later experiments are evidence for the concepts; they are not the origin of the core hypotheses.

## Canonical names

### CPC — Control Parity Calculus

**Control Parity Calculus (CPC)** is the canonical name for the mathematical shape originating in Josh Oshiro's original evaluator.

CPC asks who controls a strategically relevant future event or square from the parity and ordering of the events that can occur before it. In the simplest target-square form:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)

  = (W - 1)H - ply + r + 1
```

and future ownership/control is determined by the parity of the resulting event rank, subject to support, response, and race constraints.

Historically this mathematics was used inside an evaluator. In the current research it is treated as a structural control relation that can contribute exact dependency facts rather than merely a heuristic score.

The later connection to Allis-style Zugzwang compatibility is that even release preserves the same control parity while odd release flips it.

### WSL-625 — Winspace Lattice 625

**WSL-625 (Winspace Lattice 625)** is the canonical name for the fixed 625-element residual requirement/blocker universe discovered for standard 7x6 Connect Four.

It represents the subset structure needed for:

- surviving winning requirements;
- strategic blockers;
- implication/subsumption;
- exhaustion;
- solved-group coverage;
- upward-closure queries;
- strategic certificates.

The name deliberately avoids treating the structure as only an attack table or only a defense table. The same lattice supports both remaining winning possibilities and the blockers that eliminate them.

Historical references such as "625-ID universe", "RID universe", or "blocker universe" refer to this same structure unless a document explicitly states otherwise.

### NDC — Nested Dependency Closure

**Nested Dependency Closure (NDC)** is the canonical name for the algorithmic idea that recursively composes the dependencies of terminal outcomes until those dependencies close over earlier states or symbolic facts.

The defining owner insight was:

> The trick to solve from the first move is to nest the dependencies.

and then:

> Run the nested tree backwards starting from each potential winning position.

NDC therefore starts from terminal propositions and repeatedly derives prerequisite, adversarial, support, ownership, blocker, and temporal/race dependencies. A dependency may itself depend on deeper dependencies, producing a proof DAG rather than a conventional move tree.

NDC is the algorithm/mathematics. It is not tied to one concrete symbolic representation such as an MTBDD.

### BSFP — Backward Symbolic Fixed-Point

**BSFP (Backward Symbolic Fixed-Point)** is the canonical name for the solver architecture that executes the backward symbolic closure.

BSFP:

1. seeds geometric terminal winning predicates;
2. represents unresolved earlier positions or support skeletons symbolically;
3. propagates exact W/D/L dependencies backward;
4. composes existential and universal predecessor obligations;
5. continues until the relevant least/greatest fixed points are reached.

`BSFP` supersedes the earlier temporary research label `BSF`. Historical commits and evidence that say `BSF` remain valid provenance and should be read as referring to the same solver lineage before the name was finalized.

## Relationship among the terms

The current conceptual stack is:

```text
Josh Oshiro's original evaluator mathematics
        |
        v
CPC — Control Parity Calculus
        |
        +----> support / event precedence / race facts
        |
        v
WSL-625 — Winspace Lattice 625
        |
        +----> requirements / blockers / implication / exhaustion
        |
        v
NDC — Nested Dependency Closure
        |
        v
BSFP — Backward Symbolic Fixed-Point
        |
        v
exact W / D / L proof
```

This is not intended to imply that CPC alone solves the game or that WSL-625 alone contains all temporal information. CPC and WSL-625 provide important structural facts and domains; NDC composes nested dependencies; BSFP is the backward symbolic execution architecture.

## Historical lineage

The research lineage should be described as follows:

1. **Josh Oshiro's original evaluator** introduced the control-parity shape: infer future ownership/control without explicitly playing every intervening move.
2. Residual win-space work showed that complete colored boards are not the only useful state representation and produced the 625-element requirement/blocker lattice now named **WSL-625**.
3. Algebraic reduction connected CPC's parity structure to broader response/Zugzwang relations and connected named strategic rules to generic blocker closure.
4. Oshiro proposed that the dependencies themselves should be **nested**, leading to **NDC**.
5. Oshiro then proposed running those nested dependencies **backward from potential winning positions**.
6. That direction produced the direct backward symbolic solver now named **BSFP**.
7. Subsequent complete-game and 7x6 qualification established strong evidence for the recurrence and terminal boundary while leaving empty-board 7x6 scaling as the current implementation seam.

## Naming rule going forward

Use these names in new research material:

```text
CPC      = Control Parity Calculus
WSL-625  = Winspace Lattice 625
NDC      = Nested Dependency Closure
BSFP     = Backward Symbolic Fixed-Point
```

When editing historical documents, preserve old labels where they are necessary to understand the original experiment, but add a note that `BSF` is the former name of BSFP and that the earlier 625-ID/RID terminology maps to WSL-625.

## Credit line

For concise attribution in future documentation:

> **Conceptual origin: Josh Oshiro.** BSFP grew from Oshiro's earlier Control Parity Calculus evaluator, his winspace representation work, and his later insight to nest dependencies and propagate them backward from potential winning positions.
