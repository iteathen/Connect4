# BSFP terminology and attribution

**Date:** 2026-09-09  
**Author / conceptual origin:** Josh Oshiro  
**Status:** canonical research terminology for my current searchless Connect Four line of work.  
**Branch:** `research/low-confidence-survival-2026-09-09`  
**Maintained source / `main`:** unchanged.

## Why I am recording this

I want the terminology and intellectual lineage of this work to remain explicit as the implementation changes.

The line began with my original Connect Four evaluator. Its core idea was to infer future strategic control from the parity of the move/event reservoir before a target square rather than having to play every intervening move. I later pushed that direction toward residual winning requirements, nested dependencies, and backward closure from terminal outcomes.

The algebraic reductions, implementation experiments, falsification tests, oracle qualification, and terminology refinement that followed are evidence used to test and sharpen those ideas. I do not want later implementation work to obscure the origin of the core hypotheses, and I also do not want this work to absorb earlier Connect Four theory that belongs to Victor Allis.

## Prior work that I explicitly credit to Victor Allis

Victor Allis's 1988 master's thesis, *A Knowledge-based Approach of Connect-Four: The Game is Solved: White Wins*, is prior work for the strategic-rule and Zugzwang material used in this research.

I specifically credit Allis with the Connect Four **Control of Zugzwang** treatment and with the nine formally defined strategic rules used by VICTOR:

- Claimeven;
- Baseinverse;
- Vertical;
- Aftereven;
- Lowinverse;
- Highinverse;
- Baseclaim;
- Before;
- Specialbefore.

I also credit Allis with the rule-interaction and Zugzwang-dependence framework surrounding those rules. When this project reduces those named rules into common blocker, parity, response, or dependency forms, that reduction is new analysis of Allis's prior strategic rules; it is not a claim that I originated the rules themselves.

Likewise, my term **Control Parity Calculus** is not a claim that I originated the general idea of controlling Zugzwang in Connect Four. Allis's published treatment predates my work. My contribution is the specific future-event parity calculation from my original evaluator and the way I later generalized that mechanism into the CPC/WSL-625/NDC/BSFP line.

### Reference

Victor Allis, *A Knowledge-based Approach of Connect-Four: The Game is Solved: White Wins*, M.Sc. thesis, Vrije Universiteit Amsterdam, October 1988, Report IR-163. The thesis describes VICTOR as a Shannon C-type strategy program based on nine proven strategic rules and contains dedicated chapters on Control of Zugzwang, formal rule definitions, and rule interaction.

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

I originally used this mathematics inside an evaluator. In the current research I treat it as a structural control relation that can contribute exact dependency facts rather than merely a heuristic score.

A later comparison with Allis showed that the same mod-2 structure appears in his Zugzwang-dependent rule-combination conditions: even release preserves control parity while odd release changes it. That structural correspondence does not erase the separate provenance of the two lines of work.

### WSL-625 — Winspace Lattice 625

**WSL-625 (Winspace Lattice 625)** is my name for the fixed 625-element residual requirement/blocker universe used for standard 7x6 Connect Four.

The conceptual direction came from my observation that I could reason over potential winning positions rather than carrying the full board as the primary search object. The exact 625-element subset construction was then derived and qualified during this research.

I use WSL-625 to represent the subset structure needed for:

- surviving winning requirements;
- strategic blockers;
- implication/subsumption;
- exhaustion;
- solved-group coverage;
- upward-closure queries;
- strategic certificates.

Historical references such as "625-ID universe", "RID universe", or "blocker universe" refer to this same structure unless a document explicitly states otherwise.

### NDC — Nested Dependency Closure

**Nested Dependency Closure (NDC)** is my name for the algorithmic idea of recursively composing the dependencies of terminal outcomes until those dependencies close over earlier states or symbolic facts.

The key insight I stated during the research was:

> **The trick to solve from the first move is to nest the dependencies.**

I then sharpened the direction:

> **Run the nested tree backwards starting from each potential winning position.**

NDC therefore starts from terminal propositions and repeatedly derives prerequisite, adversarial, support, ownership, blocker, and temporal/race dependencies. A dependency may itself depend on deeper dependencies, producing a proof DAG rather than a conventional move tree.

NDC names the algorithm/mathematics. I do not tie it to one concrete symbolic representation such as an MTBDD.

### BSFP — Backward Symbolic Fixed-Point

**BSFP (Backward Symbolic Fixed-Point)** is my name for the solver architecture that executes this backward symbolic closure.

BSFP:

1. seeds geometric terminal winning predicates;
2. represents unresolved earlier positions or support skeletons symbolically;
3. propagates exact W/D/L dependencies backward;
4. composes existential and universal predecessor obligations;
5. continues until the relevant least/greatest fixed points are reached.

`BSFP` supersedes the earlier temporary research label `BSF`. Historical commits and evidence that say `BSF` remain valid provenance and refer to the same solver lineage before I finalized the name.

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

This does not imply that CPC alone solves the game or that WSL-625 contains all temporal information. CPC and WSL-625 provide structural facts and domains; NDC composes nested dependencies; BSFP is the backward symbolic execution architecture.

Allis's strategic rules remain credited prior work wherever they appear inside this stack. Their reduction into WSL-625 blockers or NDC-compatible dependency primitives is a transformation of Allis's rule semantics, not a reassignment of authorship.

## Historical lineage

1. I developed an earlier evaluator that used a future-control parity calculation to reason about strategically relevant squares without explicitly playing every intervening move.
2. I proposed shifting representation toward surviving winning positions rather than carrying the complete board as the primary object; the project work then derived and qualified the fixed 625-element lattice now called WSL-625.
3. I directed an algebraic comparison with Allis's prior strategic rules. This exposed common parity/response and blocker forms while retaining Allis's authorship of the named rules and Zugzwang framework.
4. I proposed that the dependencies themselves should be nested. I call that algorithmic idea NDC.
5. I then proposed running the nested dependency system backward from potential winning positions.
6. That direction produced the direct backward symbolic solver I now call BSFP.
7. Subsequent complete-game and standard-7x6 qualification established strong evidence for the recurrence and terminal boundary while leaving empty-board 7x6 scaling as the current implementation seam.

## Paper attribution rule

Any paper or public technical write-up based on this research should preserve these boundaries explicitly:

- **Josh Oshiro:** CPC as developed from my original evaluator; the winspace-over-board direction; the nested-dependency insight; backward propagation from potential wins; NDC; and the resulting BSFP conceptual architecture.
- **Victor Allis:** the 1988 knowledge-based Connect Four work, Control of Zugzwang treatment, the nine named strategic rules, and their rule-interaction framework.
- **Project experiments/qualification:** algebraic reductions, implementations, falsifiers, benchmarks, exact-oracle comparisons, GPU work, and other evidence should be described as subsequent research/engineering evidence unless a specific individual source is known.

Where the paper claims a structural correspondence—for example, between my CPC event-rank parity and Allis's Zugzwang-dependent rule combinations—it should state that it is a correspondence between separately sourced ideas, not retroactively attribute one to the other.

## Naming rule going forward

```text
CPC      = Control Parity Calculus
WSL-625  = Winspace Lattice 625
NDC      = Nested Dependency Closure
BSFP     = Backward Symbolic Fixed-Point
```

When editing historical documents, preserve old labels where needed to understand the original experiment, but note that `BSF` is the former name of BSFP and that earlier 625-ID/RID terminology maps to WSL-625.

## Credit line

For concise use in a paper or public document:

> **Josh Oshiro:** CPC, the winspace representation direction, NDC, and the BSFP conception. **Prior work by Victor Allis (1988):** Control of Zugzwang and the nine VICTOR strategic rules and their interaction framework. BSFP research uses and algebraically re-expresses parts of that prior work while preserving its attribution.
