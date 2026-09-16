# Cross-layer logic/code synthesis protocol

**Date:** 2026-09-15  
**Research direction / structural architecture:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

This document preserves the working method that finally made the Connect4 optimization investigation productive.

The important capability is **not** generic Negamax optimization and is **not** reading only the latest implementation. The productive method is to reconstruct three bodies of knowledge together and then deliberately search for structural isomorphs between them:

1. **logic / theorem research** — residuals, cofactors, blockers, affine ownership facts, control potential, domain walls, response capacity, deadlines, claim-relative event isomorphism, guarded theorem composition, WDL intervals, obligation birth, and negative controls;
2. **code / performance research** — semantic quotient work, frontier-native experiments, TT studies, evaluator studies, Branch Manager/work-DAG research, benchmark campaigns, accepted/rejected optimizations, and the reasons old ideas won or lost;
3. **current implementation** — every line of the active search kernel and all directly owned transition, evaluator, TT, queue/Branch Manager, and state-representation code.

Only after those three views are loaded should optimization synthesis begin.

The goal is to recognize cases where a theorem-side structure and a runtime-side structure are the **same relation in different clothes**, so one maintained/precompiled fact can serve multiple hot-path consumers.

---

## Governing engineering cycle

For every meaningful unit:

```text
assess -> research -> reassess -> plan -> execute -> qualify -> review -> cleanup/document
```

Prior-agent conclusions, issues, PR descriptions, CI output, benchmark notes, solved labels, historical code, and this protocol are **evidence, not authority**. Read actual repository state and governing specifications/contracts before mutation.

This repository is **pre-alpha**. Do not preserve legacy behavior, compatibility aliases, stale self-play vectors, or historical numeric heuristic scores merely because they existed before. If semantics are proven wrong, fix the semantics and replace stale tests with current invariant/qualification evidence.

---

## Required synthesis pass before mutation

### Pass A — logic vocabulary

Read the current research index and then the primary theorem stack closely enough to reproduce the proof boundaries without guessing.

At minimum understand:

- exact residual/cofactor semantics;
- positive monotone incidence versus GF(2) projections;
- anchored-zero-edge four-line representation;
- affine ownership facts versus monotone blocker clauses;
- CPC/control-potential and domain-wall representation;
- support/playability and gravity constraints;
- response capacity / Hall-style sufficient certificates;
- claim-relative event isomorphism and dependency cones;
- guarded theorem composition;
- WDL interval predecessor calculus;
- the active mixed-cofactor -> guarded obligation seam;
- all listed negative controls.

Do **not** compress these into a vague phrase like “threat logic.” The distinctions matter to what may legally prune search.

### Pass B — code research / historical experiments

Read enough implementation/performance history to know not just what was tried, but **why** it won or lost.

Especially retain these recurring lessons:

- moving an invariant into the component that already scans/owns the authoritative relation is often a large win;
- query-time reconstruction/materialization usually loses;
- maintaining derived second-order state can cost more than reading it cheaply from first-order state;
- a performance loss does **not** immediately reject a structurally sound idea — diagnose placement, representation, duplicated work, cache/GC pressure, and break-even changes first;
- old negative performance results do not automatically transfer after the representation changes;
- direct semantic edge reuse became a major win only after surrounding representation costs changed;
- separate semantic correctness from performance qualification.

### Pass C — current code, line by line

Read the **actual active implementation**, not a similarly named incumbent or historical engine.

For forward search this means, at minimum:

- search kernel / Negamax recurrence;
- native position or quotient transition representation;
- terminal/tactical classification;
- evaluator;
- TT/proof-store representation, hashing, probing, replacement, and move hints;
- move ordering;
- Branch Manager / work DAG / queue system where applicable;
- benchmark and conformance harnesses.

Do not infer architecture from filenames or old notes. Trace the live call path.

---

## The synthesis step

After the three passes, build an explicit **logic-to-runtime correspondence table** before proposing a change.

For each candidate theorem-side object ask:

```text
What runtime relation already owns the same information?
Can it be produced once at transition time?
Can several consumers reuse it?
Can it be precompiled over static geometry or canonical residual classes?
Does it remain exact, or is it only ordering/advisory information?
What guards prevent an algebraic identity from becoming an invalid temporal claim?
What would have to be maintained on apply/undo?
What hot-loop interpretation would disappear?
```

The preferred optimization shape is:

```text
static geometry / canonical class compile
            +
native transition already being executed
            |
            v
small exact first-order structural facts
            |
    +-------+--------+---------+---------+
    |                |         |         |
terminal         ordering     TT      scheduler
classification   effects    retention  priority
```

One fact may feed several subsystems, but each subsystem interprets the fact according to its own contract. Avoid collapsing everything into one heuristic scalar.

---

## Current structural correspondences worth preserving

### Residual degree and transition consequence

A player residual reaching degree 0 is physical terminal completion. A playable degree-1 residual is an immediate winning move. Distinct playable singleton completion cells can certify a double threat. Cofactor contraction from degree 2 to degree 1 is exact algebra, but becomes a temporal forcing statement only under the necessary support/resource/deadline guards.

Runtime implication: terminal and tactical consequence should be produced from the **native residual transition/frontier**, never by reconstructing/scanning a board merely for detection.

### Anchored zero-edge representation

A four-line can be represented by an anchor plus three ownership-disagreement edges. Terminal monochromatic ownership corresponds to edge word `000`, with the anchor selecting the winner. Blocker relations and parity facts can therefore sometimes be compiled as cheap local line/consequence metadata.

Do not silently treat every blocker as XOR: pair/blocker clauses are monotone unless split ownership is independently certified.

### CPC / control potential

Ownership, phase, seam, and pair relations are projections/derivatives of a common binary potential in the qualified calculus. Where runtime code independently derives several of these, look for a single maintained/precompiled source rather than duplicate representations.

### Claim-relative event isomorphism

Different exact game states may share the same local proof transformer/dependency cone. This is **not** TT equality and does not authorize merging values. It may authorize theorem/proof-transformer reuse, effect-class reuse, or scheduler bucketing.

### Guarded commutation / braid structure

Some event orders commute algebraically or under qualified temporal/resource guards. Treat this first as proof/work reuse or macro scheduling. Promote it to actual branch elimination only when continuation congruence including first-win/deadline semantics is proven.

### WDL intervals

The exact six-element W/D/L interval lattice is the correct currency for partial proofs. Structural theorems may narrow an interval without solving the node. Do not fabricate a scalar value or mate distance from a one-sided theorem.

---

## Exactness tiers

Keep a hard distinction between:

1. **physical terminal facts** — completed four, full-board draw;
2. **exact immediate consequences** — playable singleton, exact double threat, qualified forced response;
3. **exact structural bounds/certificates** — no-win bound, guarded obligation, response-capacity certificate, certified draw;
4. **exact structural descriptors not value-complete** — residual degree, 28-dimensional middle coordinates, GF(2) phase location, live-line incidence;
5. **ordering/scheduling signals** — useful structural proximity or proof leverage that may change work order but may not prune or assert WDL.

A candidate may move upward only by proof/qualification, not by benchmark success.

---

## Negative controls / non-negotiable proof discipline

Never make these substitutions:

- unknown = loss;
- absence of a certificate = opposite certificate;
- theorem failure = theorem negation;
- resource failure = strategic rejection;
- same dimension = natural isomorphism;
- finite solved-data agreement = universal theorem;
- solved DB label = theorem premise;
- GF(2) span = positive monotone residual incidence;
- low residual degree = signed value;
- no Hall deficiency = draw/no-force;
- legal reachability = perfect-play reachability;
- recursive search hidden inside something claimed to be a symbolic proof.

Solved databases and deep searches are allowed for **qualification, falsification, and independent oracle comparison**, never as hidden inputs to a purported structural theorem.

---

## Performance campaign discipline

For behavior-preserving changes, freeze:

- exact workload;
- checksum / decisions;
- node count;
- evaluator calls;
- tactical counters;
- TT counters/cutoffs;
- Node/runtime/hardware provenance.

Use same-runner paired measurements where possible because hosted-runner hardware variance is large.

For semantic changes, first prove/qualify the semantic change independently, then compare strength against solved/deeper evidence, and only then optimize its runtime cost. Do not revert a stronger exact semantic rule merely because its first implementation is slower.

When a structurally sound candidate loses performance:

1. verify correctness/workload equality where applicable;
2. isolate maintenance-only cost versus consumption benefit;
3. inspect placement/ownership and repeated object/property traffic;
4. inspect allocation/GC/cache effects;
5. ask whether a first-order fact should be maintained while the second-order consequence is derived cheaply at read time;
6. try the obvious ownership-boundary correction before rejecting the mechanism;
7. record the negative result and causal lesson.

---

## Current high-leverage optimization targets

Reflection/symmetry canonicalization is parked unless profiling later provides evidence that reflected duplicate proof work is material.

Primary targets are:

- terminal / tactical classification;
- move-order evaluation from exact transition effects;
- Branch Manager work selection and queue mechanics;
- TT collisions, replacement/retention economics, and probe cost;
- structural precomputation / compiled effect classes;
- moving interpretation and invariant checks out of production hot loops;
- sharing one exact structural fact across terminal, ordering, TT, and scheduler consumers where contracts allow.

The intended direction is **not** to cheat around search with imported solved answers. It is to make every unit of legitimate search/proof work cheaper and to avoid re-deriving facts the structural calculus can supply exactly.

---

## Handoff rule

When context is becoming full, hand off **before** losing the cross-layer synthesis state.

A good handoff must preserve:

- exact repo/branch/PR/head;
- accepted and experimental checkpoints;
- benchmark/strength results including negative results;
- current proof boundary;
- current implementation seam;
- the next experiment and its control commit;
- the instruction to reread the logic/code/implementation triad before mutation;
- this synthesis protocol as the method authority.

Do not rely on a short chat summary alone.