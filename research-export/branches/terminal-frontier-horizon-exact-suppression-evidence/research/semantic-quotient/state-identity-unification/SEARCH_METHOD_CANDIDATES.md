# Search-method candidates for the relational solver generation

**Status:** Research candidate matrix; no solver selection yet

**Branch:** `research/semantic-quotient`

## Purpose

Treat the forward search method as an experimental dimension rather than selecting negamax/alpha-beta by convention. Candidates are evaluated in combination with the already identified Connect4 optimization core and with the requirement that the resulting search line remain natively compatible with CUDA-BSFP and hybrid confluence.

The question is not "which textbook search expands the fewest nodes in isolation?" It is:

> Which exact or exact-capable search formulation obtains the best total time-to-proof after composition with the relational state, exact transposition reuse, tactical closure, move/proof ordering, fixed-width typed storage, parallelism, and BSFP proof injection?

## Hard BSFP compatibility contract

A primary search candidate is considered BSFP-compatible only if it can satisfy all of the following without translating back to a colored board ontology.

### Common semantic state

The shared logical identity is the qualified relational state:

```text
q = support/accessibility
  + side-to-move orientation
  + normalized P0 residual requirements
  + normalized P1 residual requirements
```

Physical layouts may differ. Search may use a dense/packed ID and BSFP may use symbolic frontiers, but both must refer to the same exact semantic `q`.

### Exact-fact consumption

The search method must be able to consume an authoritative BSFP result at any reached `q`:

```text
classify(q) -> Unknown | exact W/D/L | exact stronger value when qualified
```

A BSFP exact fact must dominate heuristic evaluation and terminate the corresponding proof obligation immediately.

Where the search uses lower/upper bounds, an exact BSFP result may tighten both bounds to a singleton. Where the search uses proof/disproof obligations, a BSFP proof must close the matching obligation exactly.

### Sound publication back to BSFP/hybrid

The forward search may publish only facts whose proof meaning is explicit and monotone, for example:

- exact W/D/L;
- exact strong/distance-sensitive value when qualified;
- valid lower/upper value bounds under a declared value order;
- certified existential/universal proof closure under a declared contract.

Search-order hints, heuristic scores, proof-number estimates, neural values and speculative bounds are not BSFP authority.

### Direction independence

The common language does **not** require a reversible state transition.

```text
forward search: T(q, a) -> terminal | q'
BSFP:           Pre_a(Q) -> set/symbolic region of predecessor q
```

A candidate is not penalized because `T^-1` is set-valued. Adding discarded history merely to make state-level undo unique would weaken the quotient and is not a compatibility goal.

### Control-flow independence

BSFP remains a backward symbolic fixed-point solver, not a search specialization. The forward candidate remains a forward proof/search method. Compatibility means exact fact exchange over `q`, not merged control flow.

## Optimization core to compose with every serious candidate

Where semantically applicable, candidates should be measured both in a minimal/reference form and with the same qualified optimization portfolio:

- relational residual state rather than historical colored-board identity;
- WSL-625/fixed residual requirement substrate for standard 7x6;
- compact exact identity and typed fixed-width hot storage;
- incremental/precomputed relational transitions;
- semantic transposition merging and residual automorphisms;
- exact immediate-win closure;
- double-threat loss closure;
- forced single-response restriction;
- forced macro-edge / decision-state exposure;
- one-sided win-space exhaustion;
- cardinality/support-aware earliest-win bounds where exact;
- center/TT/proof-cost ordering variants;
- strongest-proof retention / exact bound storage separate from hints;
- previous-pass/TT cutoff-action hints;
- neutral/dead-choice compression;
- equal-memory TT/cache comparisons;
- coarse-grained parallelism variants;
- exact BSFP/hybrid proof injection keyed by `q`.

A method that cannot use an optimization because the optimization is formulation-specific should not receive a fake substitute. Record the incompatibility as part of the result.

## Primary exact-search candidates

### R0 — relational negamax + alpha-beta

Role: control/reference candidate for the new relational generation.

Strengths:

- simplest side-to-move-relative exact recurrence;
- direct compact TT bound semantics;
- native fit for forced-response/tactical pruning and move ordering;
- easy BSFP exact-value injection;
- can publish exact/lower/upper facts with familiar semantics;
- excellent baseline for measuring whether more exotic drivers actually help.

Risks:

- depth-first directional search may still perform redundant proof work despite the quotient;
- performance depends strongly on move order.

BSFP compatibility: **native/high**.

### R1 — PVS / NegaScout over relational negamax

Role: principal-variation/null-window alpha-beta driver.

Strengths:

- retains alpha-beta proof/bound semantics;
- strongly benefits from good move ordering, TT cutoff actions, forced responses and exact BSFP hits;
- most nodes are searched with narrow windows after the first candidate;
- low conceptual distance from the control.

Risks:

- poor ordering causes re-searches;
- interaction with exact distance scoring and TT bound normalization must be qualified.

BSFP compatibility: **native/high**.

### R2 — MTD(f) / memory-enhanced Test driver

Role: repeated null-window driver over an exact memory-enhanced alpha-beta/negamax kernel.

Strengths:

- unusually attractive with a small/discrete outcome domain and strong TT reuse;
- relational state collapse increases the amount of reusable memory between probes;
- BSFP exact results or bounds can sharply reduce convergence range;
- shares most implementation machinery with R0/R1, enabling fair driver comparisons.

Risks:

- repeated probes can become expensive if TT locality/capacity is insufficient;
- distance-sensitive value range is wider than pure W/D/L and needs careful starting-guess policy;
- total work, not individual null-window efficiency, is decisive.

BSFP compatibility: **native/high**.

### R3 — MT-SSS* / MT-DUAL* driver family

Role: best-first solution-tree behavior expressed through memory-enhanced null-window alpha-beta.

Strengths:

- can reuse the same exact relational kernel/TT as R2;
- tests whether different bound-refinement directions interact better with our proof distribution;
- historical memory objection may change under relational state collapse.

Risks:

- may offer little beyond MTD(f) once TT behavior is strong;
- repeated passes and retained solution-tree memory can hurt locality.

BSFP compatibility: **high**, because exact/bound semantics remain alpha-beta compatible.

### R4 — proof-number search (PNS)

Role: existential/universal proof-directed AND/OR search.

Strengths:

- proof/disproof semantics align naturally with Connect4 forced-win obligations and BSFP existential/universal closure;
- expands nodes according to estimated proof difficulty rather than fixed depth;
- exact BSFP facts can set proof/disproof obligations to solved immediately;
- search-proved W/L facts can be published with clear proof meaning.

Risks:

- ordinary proof-number backup is tree-oriented and can misestimate work in a DAG with transpositions;
- W/D/L and distance-sensitive values need explicit multi-stage/multi-valued treatment rather than assuming binary mate solving is enough;
- memory demand can be high.

BSFP compatibility: **semantically very high; graph-accounting risk**.

### R5 — df-pn / parallel df-pn

Role: depth-first thresholded proof-number search.

Strengths:

- keeps PNS proof-directed behavior with substantially different memory characteristics;
- transposition tables and shared-memory parallel variants are established techniques;
- BSFP exact facts directly discharge proof/disproof thresholds;
- candidate for difficult narrow proof obligations where alpha-beta explores broad alternatives.

Risks:

- proof-number over/underestimation in DAGs/transpositions requires careful handling;
- exact draw handling and full W/D/L certification require explicit design;
- optimization compatibility with our move-ordering portfolio must be measured rather than assumed.

BSFP compatibility: **very high**, subject to correct DAG/transposition treatment.

### R6 — PDS-PN / proof-number descendants with bounded/depth-first memory

Role: proof-directed variants designed to alter the time/memory tradeoff of PNS.

Strengths:

- same proof-obligation language as R4/R5;
- worth testing if relational transposition sharing makes their historical tradeoffs shift;
- potentially better bounded-memory behavior for large 7x6 proof regions.

Risks:

- extra policy complexity;
- literature variants have different backup/selection semantics and must not be conflated;
- fewer of our alpha-beta-specific optimizations transfer directly.

BSFP compatibility: **very high** at the proof-semantic layer.

### R7 — Proof-Set Search (PSS / bounded PSS(P,D))

Role: proof-directed search designed for game graphs with transpositions by backing up proof/disproof **sets** rather than only scalar counts.

Why it is especially relevant here:

The relational quotient intentionally converts many physical histories into a DAG with shared semantic nodes. Ordinary proof-number arithmetic can double-count shared descendants. PSS was developed specifically to address this graph/transposition weakness.

Strengths:

- architecture matches our transposition-rich relational state unusually well;
- set-valued proof objects may correspond naturally to shared relational proof obligations;
- bounded/truncated variants expose a memory/quality continuum;
- BSFP regions/certificates may be usable as already-closed elements of proof sets.

Risks:

- proof-set maintenance may be expensive enough to lose despite fewer expansions;
- representation of proof sets must be made fixed-width/compact or bounded before hot-path viability;
- W/D/L/distance extension must be defined explicitly.

BSFP compatibility: **potentially exceptional**, because both systems reason over sets/regions of exact relational obligations. High-priority research candidate.

### R8 — Best-First Minimax / Best Node Search family

Role: expand frontier obligations based on which node currently controls/refines the root result.

Strengths:

- may exploit exact relational merging and strong bounds effectively;
- BSFP exact facts can collapse frontier obligations;
- potentially reduces irrelevant depth-first exploration.

Risks:

- frontier/memory management can dominate;
- less directly compatible with our existing hot fixed-width recursion than R0-R3;
- requires careful exact value/bound definition for strong-distance scores.

BSFP compatibility: **high at value/bound interface, uncertain physically**.

### R9 — B* / optimistic-pessimistic bound search

Role: prove one root alternative dominates the others using upper/lower estimates.

Strengths:

- relational state exposes exact structural bounds (exhaustion, earliest-win, forced obligations) that may make admissible intervals stronger than board heuristics;
- exact BSFP results are perfect singleton intervals.

Risks:

- value depends on obtaining cheap sound bounds; expensive or weak bounds make the method unattractive;
- not all heuristic evaluator knowledge is admissible proof authority.

BSFP compatibility: **high if all bounds used for proof are sound**.

## Search-policy / ordering candidates rather than initial primary kernels

### P0 — conspiracy-number / proof-cost ordering

Use conspiracy/proof-change estimates to order moves, choose thresholds, or prioritize tasks while an exact kernel supplies authority.

Compatibility with the existing optimization core is high when the metadata is incremental and bounded. Do not let conspiracy estimates become proof facts.

### P1 — Rivest min/max-approximation influence ordering

Use a smooth approximation of min/max to estimate which unresolved leaf or action most influences the root, but retain an exact kernel for certification.

Historically this can reduce expansion work while adding arithmetic overhead; relational fixed-width state may change that tradeoff. Treat as a work-selection experiment first.

### P2 — proof-cost predicted null-window scheduling

Choose MTD/PVS thresholds or action order using already-maintained relational proof-cost features. This is especially compatible with BSFP because exact solved regions can zero the predicted remaining cost.

### P3 — NN/learned ordering on relational features

A policy/value model may order actions or prioritize obligations, but its values remain hints unless independently certified. BSFP exact facts always dominate. This keeps future NN-driven search compatible with the same state/proof contract.

## Hybrid/explorer candidates

MCGS/MCTS-like methods may also consume `q` and exact BSFP classifications, but they are not automatically exact root solvers. They belong in a separate hybrid-forward-explorer comparison unless augmented with a complete exact certification mechanism. Do not compare approximate confidence with exact proof time as if they were the same output.

## Candidate compatibility dimensions

Every benchmark result should report more than wall time.

### Semantic / BSFP compatibility

- uses the exact shared `q` identity;
- consumes exact BSFP W/D/L;
- consumes exact stronger score/bounds where available;
- can publish sound exact/bound facts back;
- does not require board reconstruction for proof exchange;
- does not require state-level reverse transitions;
- preserves first-win/terminal legality.

### Optimization compatibility

For each optimization, record one of:

```text
native
adapted-equivalent
inapplicable
conflicts
not-yet-tested
```

Do not score a method negatively merely because an alpha-beta-only optimization is inapplicable; instead compare total composed performance.

### Economics

Measure at least:

- exact root result and strong score where applicable;
- wall time to proof;
- expanded/visited semantic states;
- unique `q` identities touched;
- transposition reuse;
- TT/proof-store reads and writes;
- transition cost;
- proof/order metadata cost;
- memory peak and bytes per useful proof fact;
- re-search/re-expansion work;
- forced/tactical closures;
- BSFP hits and forward work avoided by them;
- facts published from forward search that BSFP/hybrid can reuse;
- parallel efficiency where tested.

## Experimental structure

Avoid a combinatorial explosion by using staged composition.

### Phase A — minimal relational kernel tournament

Use the same relational transition substrate and common correctness corpus.

Test at minimum:

```text
R0 relational negamax alpha-beta
R1 PVS/NegaScout
R2 MTD(f)
R5 df-pn
R7 PSS/PSS(P,D)
```

Add R3/R4/R6/R8/R9 when the first results justify the corresponding machinery.

### Phase B — optimization compatibility sweep

For each surviving method, add the qualified optimization groups by ownership boundary rather than one switch at a time:

1. tactical/forced closure;
2. semantic identity + symmetry/dead-choice compression;
3. exact TT/proof reuse;
4. structural bounds and compiled certificates;
5. ordering/proof-cost signals;
6. parallelism;
7. BSFP/hybrid proof injection.

The comparison target is the **best valid composition for each method**, not equal feature counts.

### Phase C — cross-method composition

Only after individual method economics are understood, test combinations such as:

- PVS kernel + MTD(f) root driver;
- negamax/PVS with proof-number-inspired action ordering;
- df-pn/PSS for tactical proof regions with alpha-beta fallback;
- alpha-beta/MTD driver with BSFP-exact boundary injection;
- proof-directed forward search with BSFP frontier/certificate injection.

A composition survives only if its additional machinery produces net time-to-proof improvement under equal correctness and declared memory controls.

## Current priority hypothesis, not a decision

The relational quotient increases the value of methods that exploit transpositions and reusable proof memory. Therefore the first serious comparison should include both:

- the strongest memory-enhanced alpha-beta family (`PVS`, `MTD(f)`); and
- graph/proof-directed methods (`df-pn`, `PSS`).

No method is selected for the rebuilt solver until combined-performance evidence exists.

## Literature leads retained for implementation research

- Plaat, Schaeffer, Pijls, de Bruin: memory-enhanced null-window alpha-beta framework, SSS*/DUAL* reformulation, MTD(f).
- Allis: proof-number search / proof-directed game solving.
- Kaneko and related df-pn work: depth-first/parallel proof-number search with shared transposition storage.
- Winands, Uiterwijk, van den Herik: PDS-PN.
- Martin Müller: Proof-Set Search and bounded/truncated PSS variants for transposition-rich game graphs.

Literature motivates candidates; repository experiments decide performance and promotion.