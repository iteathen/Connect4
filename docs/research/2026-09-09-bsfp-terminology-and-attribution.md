# BSFP terminology and attribution

**Date:** 2026-09-09  
**Author / conceptual origin:** Josh Oshiro  
**Status:** canonical research terminology for my current searchless Connect Four line of work.  
**Branch:** `research/low-confidence-survival-2026-09-09`  
**Maintained source / `main`:** unchanged.

## Why I am recording this

I want the terminology and intellectual lineage of this work to stay explicit as the implementation changes.

The line began with my original Connect Four evaluator, which inferred future strategic control from the parity of the move/event reservoir before a target square rather than playing out every intervening move. I later pushed that direction toward residual winning requirements, nested dependencies, and backward closure from terminal outcomes — developed independently of Victor Allis's work. Allis entered this research later, during comparison against prior Connect Four theory, once the main conceptual path was already in place. That comparison revealed meaningful overlap, which I credit him for below.

## Independently developed line

The following are part of my independently developed research line:

- the future-control parity mechanism in my original evaluator;
- **CPC — Control Parity Calculus**;
- reasoning over potential/surviving winning positions instead of the full colored board as the primary state object;
- the direction that produced **WSL-625 — Winspace Lattice 625**;
- the insight to nest dependencies — **NDC — Nested Dependency Closure**;
- running those nested dependencies backward from potential winning positions — **BSFP — Backward Symbolic Fixed-Point**.

The later implementations, algebraic reductions, falsifiers, exhaustive controls, oracle checks, and GPU work test and refine these ideas; they don't change their provenance.

## Earlier published work by Victor Allis

Victor Allis's 1988 master's thesis, *A Knowledge-based Approach of Connect-Four: The Game is Solved: White Wins*, is earlier published Connect Four work that overlaps with parts of the strategic territory investigated here.

I credit Allis with his published treatment of **Control of Zugzwang**, VICTOR's knowledge-based approach, and the nine named strategic rules associated with that system and their interaction framework:

- Claimeven;
- Baseinverse;
- Vertical;
- Aftereven;
- Lowinverse;
- Highinverse;
- Baseclaim;
- Before;
- Specialbefore.

Where I later reduce one of these rules into a common blocker, parity, response, WSL-625, or dependency form, that reduction is an analysis of credited prior work — not evidence that the rule was an input to CPC, NDC, or BSFP.

### Reference

Victor Allis, *A Knowledge-based Approach of Connect-Four: The Game is Solved: White Wins*, M.Sc. thesis, Vrije Universiteit Amsterdam, October 1988, Report IR-163.

## Canonical names

### CPC — Control Parity Calculus

**Control Parity Calculus (CPC)** is my name for the mathematical shape that originated in my original evaluator.

CPC asks who controls a strategically relevant future event or square from the parity and ordering of the events that can occur before it. In the simplest target-square form:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)

  = (W - 1)H - ply + r + 1
```

Future ownership/control is then determined by the parity of the resulting event rank, subject to support, response, and race constraints.

I originally used this mathematics inside an evaluator; in the current research I treat it as a structural control relation that can contribute exact dependency facts rather than merely a heuristic score. Comparison with Allis later revealed a related mod-2 structure in his Zugzwang-dependent rule interactions — a convergent structural correspondence between independently developed work and earlier published work, not a derivation.

### WSL-625 — Winspace Lattice 625

**WSL-625 (Winspace Lattice 625)** is my name for the fixed 625-element residual requirement/blocker universe used for standard 7x6 Connect Four.

The conceptual direction came from reasoning over potential winning positions rather than carrying the full board as the primary search object; the exact 625-element subset construction was then derived and qualified during this research.

I use WSL-625 to represent the subset structure needed for:

- surviving winning requirements;
- strategic blockers;
- implication/subsumption;
- exhaustion;
- solved-group coverage;
- upward-closure queries;
- strategic certificates.

### NDC — Nested Dependency Closure

**Nested Dependency Closure (NDC)** is my name for the algorithmic idea of recursively composing the dependencies of terminal outcomes until those dependencies close over earlier states or symbolic facts.

The key insight I stated during the research was:

> **The trick to solve from the first move is to nest the dependencies.**

I then sharpened the direction:

> **Run the nested tree backwards starting from each potential winning position.**

NDC therefore starts from terminal propositions and repeatedly derives prerequisite, adversarial, support, ownership, blocker, and temporal/race dependencies. A dependency may itself depend on deeper dependencies, producing a proof DAG rather than a conventional move tree.

NDC names the algorithm/mathematics — it isn't tied to one concrete symbolic representation such as an MTBDD.

### BSFP — Backward Symbolic Fixed-Point

**BSFP (Backward Symbolic Fixed-Point)** is my name for the solver architecture that executes this backward symbolic closure.

BSFP:

1. seeds geometric terminal winning predicates;
2. represents unresolved earlier positions or support skeletons symbolically;
3. propagates exact W/D/L dependencies backward;
4. composes existential and universal predecessor obligations;
5. continues until the relevant least/greatest fixed points are reached.

## Relationship among the terms

```text
my original evaluator mathematics
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

CPC and WSL-625 provide structural facts and domains; NDC composes nested dependencies; BSFP is the backward symbolic execution architecture. None of them alone solves the game.

## Naming key

```text
CPC      = Control Parity Calculus
WSL-625  = Winspace Lattice 625
NDC      = Nested Dependency Closure
BSFP     = Backward Symbolic Fixed-Point
```

## Credit line

For concise use in a paper or public document:

> **I independently developed the CPC → WSL-625 → NDC → BSFP line from my original Connect Four evaluator and subsequent searchless-solver reasoning. Victor Allis's 1988 work is earlier published related work on Connect Four Control of Zugzwang and the VICTOR strategic-rule framework. The overlap was recognized later; Allis is cited for the prior published results and rules where they correspond, without implying that I derived my approach from them.**
