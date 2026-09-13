# Connect4 research index

**Updated:** 2026-09-13  
**Purpose:** route the retained research corpus without turning historical artifacts into current authority.

Research direction and architecture: **Josh Oshiro**.  
Formalization, implementation, and qualification: **OpenAI ChatGPT**.

## How to use this index

Use status labels conservatively:

- **ACTIVE CORE** — current theory or exact semantics used by the active research seam.
- **CONTROL / QUALIFICATION** — exact or bounded evidence used to falsify or qualify theory; not theory-construction authority by itself.
- **CORRECTIVE / SUPERSEDING** — newer work that changes the interpretation or authority of earlier work.
- **NEGATIVE CONTROL** — falsified candidate or known-incomplete method retained because it constrains future work.
- **HISTORICAL / RETAINED** — useful provenance, earlier optimization/solver work, or a superseded line that may still contain reusable facts/code.
- **UNKNOWN / RETAIN** — not yet classified well enough to remove. This is the default for uncertain usefulness.

Deletion is not implied by any label. Unknown usefulness is retained.

Current state lives in repository-root `STATUS.md` and `next_step.yaml`. Non-production
prototype routing lives in `reference/research-prototypes/README.md`.

---

## 1. Active perfect-play winning-line proof program

### Objective

Derive the exact subset of the 69 geometric standard-board winning lines that can
occur as P0 terminal wins on at least one W/D/L-perfect trajectory.

The suspected final cardinality is **output only**. It is not a premise, tuning
target, or acceptance criterion.

Exact search/enumeration is permitted as a control. Externally solved perfect-play
terminal-line classifications are not admitted as theorem authority.

### ACTIVE CORE — semantic shell

1. [`2026-09-13-perfect-play-line-output-algebra.md`](2026-09-13-perfect-play-line-output-algebra.md)  
   Set-valued perfect-play terminal-line semantics.

2. [`2026-09-13-choice-elimination-predecessor-calculus.md`](2026-09-13-choice-elimination-predecessor-calculus.md)  
   Existential P0 choice elimination and universal P1 winning predecessor logic.

3. [`2026-09-13-winning-region-output-factorization.md`](2026-09-13-winning-region-output-factorization.md)  
   Exact two-stage factorization: first derive the P0 winning region `W`, then
   derive line provenance by existential reachability inside `W`.

4. [`2026-09-13-alternating-fixed-point-calculus.md`](2026-09-13-alternating-fixed-point-calculus.md)  
   Exact least/greatest fixed-point view of strategic predecessor and safety proof.

5. [`2026-09-13-wdl-interval-predecessor-calculus.md`](2026-09-13-wdl-interval-predecessor-calculus.md)  
   Six-element W/D/L interval lattice as shared proof currency for exact and
   one-sided structural certificates.

6. [`2026-09-13-output-provenance-quotient.md`](2026-09-13-output-provenance-quotient.md)  
   Exact small-game counterexample showing W/D/L quotient equivalence does not
   imply terminal-line-output equivalence; introduces provenance-annotated residuals.

### ACTIVE CORE — Connect-Four-specific certificate calculus

- [`2026-09-13-temporal-response-capacity-calculus.md`](2026-09-13-temporal-response-capacity-calculus.md)  
  Current predecessor seam: temporally feasible response coverage, capacity,
  deadlines, safety and progress.

- [`2026-09-13-response-channel-antichain-calculus.md`](2026-09-13-response-channel-antichain-calculus.md)
- [`2026-09-13-response-matroid-defect-transfer.md`](2026-09-13-response-matroid-defect-transfer.md)
- [`2026-09-13-compatible-cover-progress-calculus.md`](2026-09-13-compatible-cover-progress-calculus.md)
- [`2026-09-13-poisoned-support-progress-calculus.md`](2026-09-13-poisoned-support-progress-calculus.md)
- [`2026-09-13-response-capacity-and-center-repair.md`](2026-09-13-response-capacity-and-center-repair.md)
- [`2026-09-13-center-response-channel-cut-deficiency.md`](2026-09-13-center-response-channel-cut-deficiency.md)
- [`2026-09-13-center-phase-response-fork.md`](2026-09-13-center-phase-response-fork.md)

These files develop candidate/sound certificate families around CPC, WSL, NDC,
response resources, cut/rank deficiency, and temporal ordering. Read later corrective
documents before treating an early center-repair construction as a realizable policy.

### CORRECTIVE / SUPERSEDING

[`2026-09-13-center-response-serialization-correction.md`](2026-09-13-center-response-serialization-correction.md)
is the current authority on the scheduling conflict exposed after the center-opening
repair experiments.

It **supersedes the strategic interpretation**, but not the enumerated static
geometry/coverage facts, of:

- `2026-09-13-center-defect-edge-denial-amplification.md`
- `2026-09-13-five-diagonal-singleton-capacity.md`
- `2026-09-13-center-defect-lift.md`

Those earlier documents are retained as counterfactual certificate-exchange and
defect-shape evidence.

### CONTROL / QUALIFICATION

- [`2026-09-13-paired-response-interval-witness.md`](2026-09-13-paired-response-interval-witness.md)  
  Qualified exact one-sided bound witness on complete 4x3 connect-3: 122 physical
  states / 90 quotient classes; 77 decision states / 57 decision classes; zero
  exact-value mismatches.

- [`2026-09-13-progress-grammar-4x3-closure.md`](2026-09-13-progress-grammar-4x3-closure.md)
- [`2026-09-13-negamax-bsfp-bidirectional-control.md`](2026-09-13-negamax-bsfp-bidirectional-control.md)
- [`2026-09-13-negamax-bsfp-proof-intersection.md`](2026-09-13-negamax-bsfp-proof-intersection.md)
- [`2026-09-13-negamax-bsfp-bidirectional-proof-intersection.md`](2026-09-13-negamax-bsfp-bidirectional-proof-intersection.md)
- [`2026-09-13-opening-value-premise-closure.md`](2026-09-13-opening-value-premise-closure.md)  
  Bounded external opening-value premise/control. Do not promote its solved table
  into terminal-line theorem authority.
- [`2026-09-09-searchless-closure-test-results.md`](2026-09-09-searchless-closure-test-results.md)  
  Complete small-game proof-DAG controls and negative results.

Prototype controls are routed in `../../reference/research-prototypes/README.md`.

---

## 2. Current open seam

The lost scratch differential `/tmp/c4diff.mjs` was not preserved in Git.
Remembered `2023 -> 419 + 1604` counts are unverified evidence and are not
reconstruction targets.

Current reconstruction path:

```text
current interval / response-capacity / provenance semantics
  -> reconstructed differential
  -> causal-isomorphism quotient
  -> sound guarded refinement, if derivable
  -> smallest unexplained counterexample
```

Do not explain remembered merges by importing generic residual dominance. The current
specs require any refinement/dominance relation to preserve the strategic context
that matters: support/playability, CPC ownership, response resources, event order,
deadlines/races, NDC guards, and output provenance when the objective includes line
identity.

---

## 3. Structural authority and reusable substrate

Primary accepted specifications:

- `../specs/C4-0006-control-parity-and-winspace-v1.md` — CPC + WSL-625.
- `../specs/C4-0007-nested-dependency-closure-v1.md` — NDC proof closure.
- `../specs/C4-0010-quotient-native-negamax-v1.md` — exact forward solver contract.

Important reusable research:

- `2026-09-10-minimum-description-semantic-quotient.md`
- `2026-09-11-semantic-quotient-mq1-strong-score.md`
- `2026-09-11-semantic-quotient-mq2-behavioral-partition.md`
- `2026-09-11-semantic-quotient-mq3-residual-sufficiency.md`
- `2026-09-11-semantic-quotient-mq4-flat-replay.md`
- `2026-09-11-semantic-quotient-mq4-residual-automaton.md`

These remain relevant to quotient construction, but a value-preserving quotient must
not automatically be reused for the richer terminal-line-output objective.

---

## 4. Negative controls that must remain visible

The research corpus intentionally keeps failed approaches because they rule out
attractive but unsound shortcuts.

Examples include:

- `2026-09-10-bsfp-incremental-dominance-rejected.md`
- flat blocker-union coverage as a complete strategic proof;
- naive nested blocker resolution without timing/resource compatibility;
- simple static response pairing;
- mirror/vertical response policies treated as globally complete;
- cardinality-only residual summaries;
- legal reachability used as a proxy for perfect-play reachability.

The 2026-09-09 `low-confidence-survival` prototypes contain several of these
falsifiers and must not be cleaned merely because their candidate theorem failed.

---

## 5. Frontier-native exact forward solver history

**Branch:** `research/frontier-negamax-conformance`

September 12 work remains retained as implementation/performance provenance:
semantic identity, storage ownership, frontier bounds, shared proofs, Branch Manager,
resource qualification, CPU profiles, depth-bounded campaigns, and root-run controls.

Useful entry records include:

- `2026-09-12-full-engine-sanity-audit.md`
- `2026-09-12-transition-state-read-commit-audit.md`
- `2026-09-12-integrated-identity-ownership.md`
- `2026-09-12-native-key-integration.md`
- `2026-09-12-search-volume-structural-review.md`
- `2026-09-12-frontier-optimization-handoff.md`
- `2026-09-12-pre-alpha-cleanup-ledger.md`

These are **HISTORICAL / RETAINED** for the current mathematical seam unless a
specific implementation fact is needed. They are no longer the top-level “latest
status.”

---

## 6. Cross-solver semantic quotient research

**Primary branch:** `research/semantic-quotient`

Owns solver-neutral work on the smallest exact future-behavior state, including
behavioral equivalence, support/event sufficiency, residual-class synthesis, flat
transition automata, and cross-solver falsifiers.

Start with:

- repository-root `SEMANTIC_QUOTIENT_RESEARCH.md` where present on that branch;
- `2026-09-10-minimum-description-semantic-quotient.md`;
- the September 11 MQ1–MQ4 records listed above.

The active perfect-play output program may reuse proved quotient facts, but must add
output provenance when line identity is observable.

---

## 7. Minimax / alpha-beta research

**Primary branch:** `solver/minimax-alpha-beta`

Retain this line for exact search controls and earlier experiments involving TT
geometry, decision-state admission, compact keys, residual automorphisms, win-space
search, evaluator/proof ordering, forced macros, implication work, and negative
controls.

Do not copy BSFP recurrence or current perfect-play output semantics into this lane
merely because state mathematics overlaps.

---

## 8. CUDA-BSFP / OQS research

Production-adjacent BSFP work is associated with `feature/cuda-bsfp`; later
representation/OQS research descends through `research/zdd-transfer-20260910` and
related branches.

Retained records include:

- `2026-09-10-cuda-bsfp-research-synthesis.md`
- `2026-09-10-identified-winline-quotient-exact-results.md`
- `2026-09-10-separator-history-census.md`
- `2026-09-10-cuda-bsfp-flat-transfer-r4.md`
- `2026-09-10-r6-incremental-oqs-results.md`
- `2026-09-11-oqs-cuda-cofactor-qualification.md`

These are not deleted when the current line changes solver strategy; they contain
representation and quotient evidence that may transfer.

---

## 9. Historical branch refs and local-packet caveat

Historical refs remain provenance/evidence, not active authority merely because they
still exist. Examples include:

- `research/exact-solver-perf-checkpoint-2026-09-08`
- `research/exact-solver-rethink-controls-2026-09-09`
- `research/forced-macro-implication-2026-09-09`
- `research/residual-automorphisms-2026-09-09`
- `research/low-confidence-survival-2026-09-09`
- `research/identified-winline-quotient-*`
- `research/winline-*`

Some historical large local packets were never fully transported into Git. A retained
report or hash proves the report/evidence that exists; it does not imply the original
full packet is present. Recovered copies should be imported as historical evidence
without rewriting their original reports.

---

## 10. Retention rule

When usefulness is unclear, retain the artifact and classify it later.

Delete only when all of the following are established:

1. the artifact is redundant or obsolete for every known authority/evidence role;
2. any unique evidence/provenance has been preserved elsewhere;
3. no active spec, research note, reproducer, or handoff depends on it;
4. the deletion is documented in a cleanup ledger.

The first 2026-09-13 organization pass intentionally deletes **nothing**. See
[`2026-09-13-research-organization-cleanup.md`](2026-09-13-research-organization-cleanup.md).
