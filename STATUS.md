# Connect4 current research status

**Updated:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`  
**Pre-cleanup snapshot:** `8bf24b6818b4e2775a3b41cd21e517b94e36271c`  
**Research direction / architecture:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This file is a **current-state router**, not a historical journal. Historical results,
negative controls, superseded interpretations, benchmark records, and prior optimization
work remain under `docs/research/**` and in Git history. Start with
[`docs/research/RESEARCH_INDEX.md`](docs/research/RESEARCH_INDEX.md).

## Current objective

Derive the exact subset of the 69 geometric Connect Four winning lines that can occur
as P0 terminal wins on at least one W/D/L-perfect trajectory, using structural proof
rather than an externally supplied solved terminal-line classification.

The suspected final cardinality is **output only**. It must not be used as a premise,
tuning target, acceptance criterion, or measure of whether a candidate theorem is
"getting warmer."

Exact enumeration/search is permitted as a bounded control or qualification oracle.
It is not theory-construction authority.

## Governing authority

Read in this order before mutation:

1. account-global `iteathen/.github/AGENTS.md`;
2. `AGENT_LOCAL.md`;
3. `docs/specs/C4-0006-control-parity-and-winspace-v1.md`;
4. `docs/specs/C4-0007-nested-dependency-closure-v1.md`;
5. `docs/specs/C4-0010-quotient-native-negamax-v1.md`;
6. current research routed by `docs/research/RESEARCH_INDEX.md`.

C4-0010 remains the forward-solver contract. The current mathematical work does not
silently redefine its exact game semantics.

## Accepted structural boundary

The mechanically derived standard-board geometry contains:

- 69 geometric winning lines;
- 625 unique nonempty residual fragments;
- CPC for parity/control/event-precedence facts;
- WSL-625 for residual requirements and blocker closure;
- NDC for monotone nested dependency closure.

Residual identity or residual-antichain inclusion alone is **not** strategic
equivalence. Support/playability, ownership, response resources, event order, race
horizons, deadlines, guards, and provenance can remain load-bearing.

## Current exact semantic decomposition

### Winning region

The P0 winning region is the finite least fixed point

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

where `PreE` is the P0 existential predecessor and `PreA` is the P1 universal
predecessor. See
`docs/research/2026-09-13-winning-region-output-factorization.md` and
`docs/research/2026-09-13-alternating-fixed-point-calculus.md`.

### W/D/L proof currency

Sound structural facts may narrow the six possible W/D/L intervals rather than prove
an exact value immediately. The exact predecessor action is max/min over child
interval endpoints. See
`docs/research/2026-09-13-wdl-interval-predecessor-calculus.md`.

A qualified paired-response theorem already gives a nontrivial bounded witness:
122 physical states / 90 quotient classes on complete 4x3 connect-3, including
77 genuine decision states / 57 decision classes, with zero exact-value mismatches.
It proves the one-sided interval `[-1,0]`; it does not overclaim draw versus loss.
See `docs/research/2026-09-13-paired-response-interval-witness.md`.

### Terminal-line output

Perfect-play terminal-line identity is a richer objective than W/D/L and requires
output provenance. The value quotient may discard information that output attribution
must retain. See
`docs/research/2026-09-13-output-provenance-quotient.md`.

Once `W` is known, perfect trajectories from a P0-winning state are the legal paths
remaining inside `W`, so per-line output becomes existential reachability inside that
region. This is the current two-stage value/output factorization.

## Current corrective boundary

`docs/research/2026-09-13-center-response-serialization-correction.md` supersedes the
**strategic interpretation** of these earlier static repair experiments:

- `2026-09-13-center-defect-edge-denial-amplification.md`
- `2026-09-13-five-diagonal-singleton-capacity.md`
- `2026-09-13-center-defect-lift.md`

Their enumerated static geometry/coverage facts remain retained evidence. They are not
proofs of a realizable contingent policy after the conflicting response event.

This is the cleanup rule generally: superseded interpretation lowers authority; it
does not erase potentially useful evidence.

## Current missing calculus

The active Connect-Four-specific seam is symbolic discharge of strategic predecessors
from CPC / WSL / support / response / deadline facts without enumerating all physical
or quotient successors.

The current certificate vocabulary includes:

- complete defender safety coverage;
- temporal response capacity and response-slot conflicts;
- CPC ownership/parity/event-order premises;
- WSL blocker/residual coverage;
- NDC guard and dependency closure;
- well-founded progress for positive predecessor proofs;
- W/D/L interval intersection;
- output-sensitive provenance after value closure.

A complete policy proof must establish legality, totality over the represented
attacker continuation classes, resource compatibility, timing/deadline safety, and
coverage. Static blocker union is insufficient.

## Immediate execution seam

Reconstruct the lost proof differential using **current** certificate semantics:

```text
current interval / capacity / provenance certificates
  -> reconstructed differential
  -> causal-isomorphism quotient
  -> sound guarded refinement, if derivable
  -> smallest unexplained counterexample
```

The historical scratch `/tmp/c4diff.mjs` is not preserved in the repository. Remembered
counts such as `2023 -> 419 + 1604` are unverified evidence, not targets.

Do not import generic residual dominance to explain those counts. C4-0007 treats
candidate dominance/refinement relations as proof obligations, not production
authority.

## Research hygiene

- `STATUS.md` and `next_step.yaml` contain current state only.
- `docs/research/RESEARCH_INDEX.md` routes retained research.
- `reference/research-prototypes/README.md` routes non-production prototypes.
- Negative controls are retained.
- Corrected/superseded experiments are retained with downgraded interpretation.
- Unknown usefulness is retained by default.
- Deletion requires demonstrated redundancy or obsolescence plus preserved provenance.

The cleanup that created this router is recorded in
`docs/research/2026-09-13-research-organization-cleanup.md`.
