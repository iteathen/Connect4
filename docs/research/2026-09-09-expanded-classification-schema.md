# Expanded candidate classification schema

**Date:** 2026-09-09  
**Status:** research classification only; maintained source and `main` unchanged.  
**Research lineage:** continues `research/forced-macro-implication-2026-09-09`.

## Purpose

Candidate classification must keep distinct questions in distinct categories. No single score should collapse usefulness, compatibility, synergy, evidence, performance, substitution, or architectural leverage.

This schema extends the existing multi-axis classification with two additional categories requested by the owner:

1. **synergy with specific core candidates**;
2. **multi-problem leverage / optimization encapsulation**.

These are not synonyms.

## Core categories retained

For each candidate classify separately:

- expected usefulness / adoption likelihood;
- evidence maturity;
- hot-path performance risk;
- architectural dependency;
- exclusion risk;
- implementation-form risk;
- relationship type;
- pairwise compatibility;
- substitution / overlap;
- amplification potential.

## New category: synergy with core-group candidates

This category asks:

> If this candidate is combined with each specific member of the current core, does either side become materially more effective or cheaper?

Do **not** assign one generic synergy score. Record a **synergy vector/matrix** against individual core candidates or coherent core clusters.

Useful relation labels include:

- **strong positive synergy** — measured or strongly mechanistically expected super-additive improvement;
- **positive synergy** — one candidate clearly increases the usefulness/hit rate or lowers the cost of the other;
- **independent/additive** — both can coexist, but little second-order effect is expected;
- **overlapping** — they solve substantially the same work, so combined benefit may be less than independent multiplication;
- **cost-sharing synergy** — both consume the same maintained metadata/precomputation, reducing combined overhead;
- **state-simplification synergy** — one reduces/canonicalizes the state so the other becomes cheaper or applies more often;
- **proof-order synergy** — one improves ordering/window selection so the other reaches useful cutoffs/proofs sooner;
- **cache synergy** — one changes identity/locality/admission so the other's cache value increases;
- **negative synergy/interference** — one reduces hit rate, destroys locality, changes proof order adversely, or duplicates the other's work;
- **unknown** — no adequate mechanism/evidence yet.

Example distinctions:

- cardinality bounds × residual automorphisms: positive, already measured;
- tactical closure × forced macro-edges: strong positive, already measured;
- support-event frontier × support-aware earliest-win: expected cost-sharing/state-simplification synergy;
- support-event frontier × implication reuse: expected cost-sharing synergy because support compatibility may become native state rather than a separate check;
- residualized evaluator metadata × proof-cost ordering: expected cost-sharing/proof-order synergy;
- automorphism canonicalization × compact TT identity: potentially positive for hit rate but also a co-design dependency because key encoding changes;
- rank banking × automorphism canonicalization: uncertain/possible interference because canonicalization changes placement distribution.

This category should be revisited after every important representation change; synergy is often representation-dependent.

## New category: multi-problem leverage / optimization encapsulation

This category asks:

> How many distinct optimization or correctness problems does adopting this candidate solve through one shared representation/mechanism?

This is **not** raw performance and not synergy. A candidate can have high multi-problem leverage even before any pairwise speedup is measured.

Record the distinct problems it addresses, not merely a count. Suggested classifications:

- **single-purpose** — primarily solves one narrow problem;
- **dual-purpose** — naturally resolves two independently valuable problems;
- **multi-purpose** — one mechanism addresses several distinct problems;
- **platform/enabler** — creates a substrate on which many optimizations become cheap/native;
- **unifying representation** — replaces multiple separate mechanisms or sources of truth with one owned state representation.

Also record a `problems_solved` list so the classification remains inspectable.

Examples:

### Residual win-space

Likely **unifying representation / platform**. It contributes to:

- smaller semantic state identity;
- irrelevant historical-color elimination;
- requirement cardinality bounds;
- residual automorphisms;
- neutral/dead distinction;
- Allis-rule coverage representation;
- implication relations;
- evaluator residualization;
- proof-cost features.

This broad leverage is a major reason to design around it even before final hot representation is settled.

### Fixed 625-ID universe

Likely **platform/enabler**. It supports:

- fixed transition tables;
- requirement-size classes;
- automorphism maps;
- Allis proof masks;
- implication closures;
- compact metadata;
- potentially evaluator/live-line provenance.

### Support-event frontier

Potentially **unifying representation** if qualified. It could simultaneously solve or simplify:

- legal placement/support state;
- neutral-gap timing;
- support-aware earliest-win bounds;
- Allis Aftereven/Before reachability facts;
- implication support compatibility;
- event-chain equivalence/canonicalization;
- dead-tail compression.

This is exactly the kind of candidate that may justify a larger implementation change because it replaces several separate per-node calculations.

### Tactical/forced normalization

Likely **multi-purpose**:

- immediate terminal recognition;
- forced defense restriction;
- deterministic transit-state elimination;
- reduced TT admission/pressure;
- reduced symmetry/ordering work because only decision states reach those mechanisms.

### Compact exact TT identity

Likely **dual/multi-purpose** depending final form:

- fewer bytes per entry;
- better cache locality;
- more entries for equal memory;
- potentially simpler publication/probe traffic.

### Residualized evaluator metadata

Potentially **multi-purpose**:

- exact-search move ordering;
- proof-cost prediction;
- Allis/threat-rule prioritization;
- shallow incumbent evaluation compatibility;
- perhaps adaptive resource decisions at coarse boundaries.

### Implication reuse

Primarily **single/dual-purpose** today:

- cross-state proof-bound reuse;
- possible strongest-proof retention compression.

It becomes higher leverage only if the support/event representation makes the same monotonic metadata useful elsewhere.

## Additional category worth separating: shared-substrate leverage

This is adjacent to multi-problem leverage but should remain distinct.

Question:

> Does this candidate consume a substrate we already pay to maintain, or does it require a new independent substrate?

Classify as:

- **free rider** — almost entirely consumes existing state/metadata;
- **shared substrate** — adds small data that several mechanisms use;
- **new dedicated substrate** — requires its own state/index/frontier;
- **substrate replacement** — replaces one or more existing sources of truth.

This helps distinguish, for example, a cheap Allis mask over existing requirement bits from a new dynamic rule graph.

## Additional category: optimization coverage redundancy

Question:

> Which other candidates become partly or wholly unnecessary if this candidate succeeds?

Keep separate from exclusion risk. Exclusion risk asks whether the candidate itself may be displaced. Coverage redundancy asks whom **it displaces**.

Examples:

- a rich cheap support-aware earliest-win bound may subsume cardinality-only checks;
- event-frontier neutral handling may subsume a separate neutral-tempo pool;
- full residual canonicalization may subsume some sibling successor dedup/orbit logic;
- a unifying tactical closure operator subsumes separate immediate/double/forced policy layers while preserving their semantic facts.

## Additional category: stage locality

Question:

> At what execution stage does the candidate need to operate?

Classify independently as one or more of:

- compile/root boundary;
- transition update;
- forced normalization;
- decision-state normalization;
- TT probe/store;
- move ordering;
- proof/window selection;
- coarse task scheduling;
- parallel publication;
- cold/reference/oracle only.

Candidates operating at different stages may be highly compatible even when they address related facts. Candidates competing for the same hot stage deserve closer interaction testing.

## Expanded classification schema

The current schema therefore contains at least these independent dimensions:

1. expected usefulness / adoption likelihood;
2. evidence maturity;
3. hot-path performance risk;
4. architectural dependency;
5. exclusion risk;
6. implementation-form risk;
7. relationship type;
8. pairwise compatibility;
9. substitution / overlap;
10. general amplification potential;
11. **synergy with each specific core candidate / core cluster**;
12. **multi-problem leverage / optimization encapsulation**;
13. shared-substrate leverage;
14. optimization coverage redundancy / displacement;
15. stage locality.

Do not average these categories into one score during classification. They may later feed a decision model, but keeping them separate is necessary to expose architectural opportunities such as a candidate that is individually moderate yet unifies four other mechanisms and makes three core optimizations nearly free.
