# BSFP terminology and attribution

**Date:** 2026-09-09  
**Author / conceptual origin:** Josh Oshiro  
**Status:** canonical research terminology for my current searchless Connect Four line of work.  
**Branch:** `research/low-confidence-survival-2026-09-09`  
**Maintained source / `main`:** unchanged.

## Why I am recording this

I want the terminology and intellectual lineage of this work to remain explicit as the implementation changes.

The line began with my original Connect Four evaluator. Its core idea was to infer future strategic control from the parity of the move/event reservoir before a target square rather than having to play every intervening move. I later pushed that direction toward residual winning requirements, nested dependencies, and backward closure from terminal outcomes.

I developed that conceptual path independently. I did **not** derive my evaluator, CPC, the winspace-over-board direction, NDC, or BSFP from Victor Allis's work, and I did not use his thesis as the source from which those ideas were formulated. Allis entered this research later, during comparison with prior Connect Four theory, after the main conceptual path was already present.

That later comparison revealed meaningful overlap and structural correspondence. Because Allis published related Connect Four theory decades earlier, I want his prior work cited clearly wherever the overlap is relevant. That is different from saying his work caused or supplied my ideas.

## Independently developed line

The following concepts are part of my independently developed research line:

- the future-control parity mechanism in my original evaluator;
- **CPC — Control Parity Calculus**;
- the decision to reason over potential/surviving winning positions instead of treating the complete colored board as the only primary state object;
- the direction that produced **WSL-625 — Winspace Lattice 625**;
- the insight to **nest dependencies**;
- **NDC — Nested Dependency Closure**;
- the insight to run those nested dependencies **backward from potential winning positions**;
- **BSFP — Backward Symbolic Fixed-Point** as the solver architecture produced from that line.

The later implementations, algebraic reductions, falsifiers, exhaustive controls, oracle checks, and GPU work test and refine those ideas; they do not change their provenance.

## Earlier published work by Victor Allis

Victor Allis's 1988 master's thesis, *A Knowledge-based Approach of Connect-Four: The Game is Solved: White Wins*, is earlier published Connect Four work that overlaps with parts of the strategic territory investigated here.

I credit Allis with his published treatment of **Control of Zugzwang**, VICTOR's knowledge-based approach, the nine formally defined strategic rules associated with that system, and the rule-interaction framework around them:

- Claimeven;
- Baseinverse;
- Vertical;
- Aftereven;
- Lowinverse;
- Highinverse;
- Baseclaim;
- Before;
- Specialbefore.

Those are Allis's named rule framework and should be cited as such whenever I discuss them.

The important provenance distinction is:

> **My line was independently developed; Allis's line is earlier published prior work with which I later discovered overlap.**

When I later reduce Allis's named rules into common blocker, parity, response, WSL-625, or dependency forms, that reduction is an analysis of credited prior work. It does not mean those Allis rules were inputs from which I derived CPC, NDC, or BSFP.

Likewise, the fact that Allis discussed Control of Zugzwang before my work means the paper must acknowledge his earlier published treatment of that subject. It does not mean I obtained my specific future-event parity equation from him. I arrived at that evaluator mechanism independently.

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

I originally used this mathematics inside an evaluator. In the current research I treat it as a structural control relation that can contribute exact dependency facts rather than merely a heuristic score.

Only later, after this line was already developed, did comparison with Allis reveal a related mod-2 structure in his Zugzwang-dependent rule interactions. The paper should present that as a **convergent structural correspondence between independently developed work and earlier published work**, not as derivation.

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

Allis's rule framework sits outside this provenance chain as earlier published related work. Some of his rules can be mapped into WSL-625/NDC-compatible forms, but that mapping was discovered after my chain above was already underway.

## Historical lineage

1. I independently developed an evaluator using a future-control parity calculation to reason about strategically relevant squares without explicitly playing every intervening move.
2. I proposed shifting representation toward surviving winning positions rather than carrying the complete board as the primary object; the research then derived and qualified the fixed 625-element lattice now called WSL-625.
3. I proposed that the dependencies themselves should be nested. I call that algorithmic idea NDC.
4. I then proposed running the nested dependency system backward from potential winning positions.
5. That direction produced the direct backward symbolic solver I now call BSFP.
6. After this conceptual direction existed, I compared it with earlier Connect Four theory, including Allis's work, and found important overlap and common lower-level structure.
7. Subsequent qualification established strong evidence for the recurrence and terminal boundary while leaving empty-board 7x6 scaling as the current implementation seam.

## Paper attribution rule

Any paper or public technical write-up based on this research should say the provenance plainly:

- **Josh Oshiro:** independently developed CPC from my original evaluator; independently developed the winspace-over-board direction, nested-dependency idea, backward-from-potential-wins direction, NDC, and the resulting BSFP conceptual architecture.
- **Victor Allis:** earlier published related Connect Four work, including Control of Zugzwang, VICTOR's nine named strategic rules, and their interaction framework.
- **Relationship:** overlap between the two lines was identified later. Where CPC/WSL-625/NDC analysis reproduces or structurally corresponds to an Allis result, cite Allis as prior published work while also stating that my line was independently developed.
- **Project experiments/qualification:** algebraic reductions, implementations, falsifiers, benchmarks, exact-oracle comparisons, GPU work, and other evidence should be described as subsequent research/engineering evidence unless a more specific source is known.

The paper should avoid both errors: it should not imply that I derived my work from Allis, and it should not present overlapping results as though no earlier related work existed.

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

> **Josh Oshiro independently developed the CPC → WSL-625 → NDC → BSFP line from his original Connect Four evaluator and subsequent searchless-solver reasoning. Victor Allis's 1988 work is earlier published related work on Connect Four Control of Zugzwang and the VICTOR strategic-rule framework. The overlap was recognized later; Allis is cited for the prior published results and rules where they correspond, without implying that Oshiro derived his approach from them.**
