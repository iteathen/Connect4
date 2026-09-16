# Research organization cleanup — conservative first pass

**Date:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`  
**Pre-cleanup head:** `8bf24b6818b4e2775a3b41cd21e517b94e36271c`  
**Research direction / architecture:** Josh Oshiro  
**Cleanup / classification / documentation:** OpenAI ChatGPT

## Purpose

Reduce discovery cost without destroying uncertain research value.

The branch had moved through a large September 13 proof-calculus continuation while
the root `STATUS.md`, `next_step.yaml`, and `docs/research/RESEARCH_INDEX.md` still
primarily routed September 12 optimization work. This made historical telemetry look
like current action and obscured the active mathematical seam.

The cleanup policy is deliberately asymmetric:

```text
known current value      -> route prominently
known historical value   -> retain and demote from current-state surfaces
known failed candidate   -> retain as negative control
superseded interpretation-> retain facts, annotate corrected authority
unknown usefulness       -> retain
proved redundant junk    -> eligible for later deletion
```

This pass did not find a deletion whose safety was established strongly enough to
justify removing it.

## Exact historical preservation

The complete pre-cleanup versions of the root current-state files and research index
remain recoverable from Git at:

```text
8bf24b6818b4e2775a3b41cd21e517b94e36271c
```

That snapshot includes the long September 12 optimization/status ledger that is being
removed from current-state routing, not from history.

No source file, research document, evidence file, prototype, specification, or branch
was deleted or reset by this pass.

## Changes

### `STATUS.md`

Changed from a chronological optimization ledger into a current-state router for:

- the perfect-play winning-line objective;
- governing authority;
- accepted structural boundary;
- winning-region / interval / output-provenance semantics;
- the center response-serialization correction;
- the active missing calculus;
- the differential-reconstruction seam;
- retention rules.

Historical benchmark and optimization claims remain in their dated research records
and in the pre-cleanup Git snapshot.

### `next_step.yaml`

Collapsed accumulated run telemetry into the current executable research task:

```text
reconstruct_current_certificate_differential
```

The new file records current authority, active theory/control inputs, hard
non-circularity constraints, correction boundaries, success conditions, and cleanup
policy.

### `docs/research/RESEARCH_INDEX.md`

Reoriented the index around status classes:

```text
ACTIVE CORE
CONTROL / QUALIFICATION
CORRECTIVE / SUPERSEDING
NEGATIVE CONTROL
HISTORICAL / RETAINED
UNKNOWN / RETAIN
```

The index now routes the September 13 proof program first while preserving branch
routes for frontier optimization history, semantic quotient work, minimax/alpha-beta,
and CUDA-BSFP/OQS research.

### `reference/research-prototypes/README.md`

Added a prototype router. It marks prototypes as non-production evidence and makes
the active September 13 controls easy to find without implying that failed or older
prototype directories are disposable.

## Important authority correction preserved by cleanup

`2026-09-13-center-response-serialization-correction.md` shows that several earlier
center-repair experiments combined a post-`A1` move with an `A2` ownership guarantee
that would have consumed the same P1 response turn.

Therefore these earlier notes retain their static geometry/coverage results but lose
authority as realizable strategy states:

- `2026-09-13-center-defect-edge-denial-amplification.md`
- `2026-09-13-five-diagonal-singleton-capacity.md`
- `2026-09-13-center-defect-lift.md`

This is a model for future cleanup: correct the interpretation rather than delete the
evidence.

## Active seam after cleanup

The old scratch differential `/tmp/c4diff.mjs` is not present in the repository.
Remembered counts such as:

```text
2023 -> 419 + 1604
```

remain unverified evidence only.

The next research unit is:

```text
current interval / response-capacity / provenance certificates
  -> reconstructed differential
  -> causal-isomorphism quotient
  -> sound guarded refinement, if derivable
  -> smallest unexplained counterexample
```

The reconstruction must not tune toward either the remembered scratch counts or the
suspected final terminal-line cardinality.

## Deferred cleanup

No file deletion is authorized by this ledger.

A later deletion pass may be considered only after dependency/provenance checking
establishes that an artifact is genuinely redundant. Until then, uncertain material
is intentionally retained.
