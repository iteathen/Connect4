# Research prototype router

`reference/research-prototypes/**` is a **non-production research/evidence area**.

Prototype code may be exact, bounded, exploratory, rejected, superseded, or merely a
reproducer for a research note. Presence here does not make a prototype production
authority. Failure of a candidate theorem does not make its reproducer useless:
negative controls and counterexamples are deliberately retained.

When usefulness is uncertain, retain the prototype.

## Active perfect-play winning-line controls

Directory:

```text
2026-09-13-perfect-play-winline/
```

This is the current prototype/control home for the perfect-W/D/L terminal-line proof
program.

Important scripts:

- `line_output_algebra.mjs` — exact set-valued perfect-play line-output semantics on
  small complete games.
- `opening_premise_projection.mjs` — bounded opening/third-ply premise projection;
  control only, not terminal-line theorem authority.
- `negamax_bsfp_proof_intersection_control.mjs` — complete small-game Negamax/BSFP
  intersection and paired-response interval qualification.
- `response_capacity_calculus.mjs` — response-capacity structural calculations.
- `center_response_serialization.mjs` — exact event-order check underlying the center
  response-serialization correction.
- `center_certificate_compatibility_core.mjs` — shared center certificate geometry /
  compatibility support.
- `c1_draw_policy_certificate.mjs` — structural certificate work for the C1/manual
  draw-policy route.
- `opening_cover_boundary_defect.mjs` — center/non-center boundary-defect control.
- `poisoned_support_4x3_control.mjs` — small-game poisoned-support control.
- `early_blocker_union_non_discrimination.mjs` — negative/control evidence that
  shallow blocker union does not discriminate strategic value.
- `center_before_local_compatibility.mjs`, `center_phase_cover_uniqueness.mjs`,
  `center_repair_static_cover.mjs`, `center_defect_lift.mjs`, and
  `center_defect_repair_exposure.mjs` — retained center-repair/defect experiments.
  Read `../../docs/research/2026-09-13-center-response-serialization-correction.md` before
  assigning strategic meaning to static post-trigger coverage.

Current research routing:
`../../docs/research/RESEARCH_INDEX.md`.

## High-value earlier structural controls

### `2026-09-09-low-confidence-survival/`

Retain. This directory includes important falsifiers and reusable control machinery,
including:

- `searchless_dependency_shapes.mjs`
- `support_event_equivalence.mjs`
- `allis_a123_survival.mjs`
- `allis_blocker_unification.mjs`
- `e3_root_asymmetry_rank.mjs`

Several candidate approaches in this area were shown incomplete. Their failures are
evidence against repeating the same unsound shortcut.

### `2026-09-09-decision-state/`
### `2026-09-09-residual-automorphisms/`
### `2026-09-09-structural-candidates/`
### `2026-09-09-winspace/`
### `2026-09-09-winspace-native/`

**HISTORICAL / RETAINED.** These directories contain decision-state, exact-search,
residual-symmetry, win-space and structural-candidate experiments. They are not the
current proof authority, but may contain reusable code, witnesses, counterexamples,
and comparison baselines.

## BSFP / quotient / OQS prototypes

### `2026-09-10-bsfp-terminal-specialization/`
### `2026-09-10-bsfp-winspace-inference/`
### `2026-09-10-identified-winline-quotient/`
### `2026-09-10-oqs/`
### `2026-09-10-r5-scope/`
### `2026-09-10-zdd-transfer/`

**HISTORICAL / RETAINED.** These contain BSFP, identified-line quotient,
separator/history, OQS, flat-transfer and representation experiments. The current
perfect-play proof line may reuse proved structural facts, but these prototypes do
not override current CPC/WSL/NDC, interval, response-capacity, or output-provenance
semantics.

## Retention and deletion policy

Do not delete a prototype merely because:

- it is old;
- its candidate optimization did not win;
- its candidate theorem was falsified;
- a newer prototype exists;
- its immediate production path was abandoned.

Deletion requires evidence that the artifact is redundant for both positive and
negative research value, has no unique witness/provenance, and is not referenced by
a spec, report, evidence file, handoff, or active reproducer.

The 2026-09-13 organization pass intentionally deletes no prototypes. See
`../../docs/research/2026-09-13-research-organization-cleanup.md`.
