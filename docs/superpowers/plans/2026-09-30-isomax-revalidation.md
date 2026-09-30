# IsoMax chain revalidation implementation plan

> **For agentic workers:** Use superpowers:executing-plans for root execution. Independent oracle construction and lineage auditing use isolated parallel agents; root reviews and integrates each deliverable.

**Goal:** Execute the user's six revalidation units before considering RS-096.

**Architecture:** Preserve old evidence. Add separate revalidation artifacts and an independent implementation; minimally repair the interleaved RS-076 loop. Compare semantic records and row spaces explicitly rather than equating implementation-specific numeric IDs.

**Tech Stack:** Node.js 26, built-in assertions/test/crypto, Git provenance.

**Spec:** `research/isograph/discovery/2026-09-30-isomax-revalidation/REVALIDATION_CONTROL_0_1.json`, reflecting the user's revalidation instructions.

## Global constraints

- Never access outcomes of 3x6-k4 or 5x3-k4.
- Current authority 1.2 is unchanged; canonical research owner is research/semantic-quotient.
- Existing three hard carriers are training data. Freezing a new audit does not make them independent.
- Persist executable/configuration checkpoints before expensive runs.
- No RS-096 discovery while revalidation gates remain unresolved.

## Review focus

- Late preparation failure must prevent every scalar replay (R1 regression).
- Earlier control exactness must be read only during replay (R1 instrumentation).
- Terminal wins must stop expansion and mover-relative labels must use the correct parity (R2 statewise tests).
- Abstract canonical slots and numeric ID allocation must not masquerade as physical or semantic equality (R2/R3 comparison).
- Mover normalization varies by source state and may not descend to an existing dependency coordinate (R6 descent test before any claimed transported law).

## R1: Repair the all-grid freeze

Files: legacy `run-ooo-sign-channel-coupling.mjs`, `ooo-grid-freeze-lib.test.mjs`; new `RS076_FREEZE_SEQUENCE_REQUALIFICATION_0_1.json`.

- [ ] Add a regression that extracts and executes the actual nested RS-076 candidate functions with dependency scalar getters; assert all 64 feature catalogs/rows/bases exist before the first scalar access, and a late preparation exception leaves zero reads.
- [ ] Run the regression and observe the old runner fail.
- [ ] Split `auditCandidate` into `prepareCandidate` and `replayCandidate`; call existing `freezeGridThenReplay`. Move scalar control checks to replay; retain exact report shape.
- [ ] Run unit tests, syntax and research-integrity checks; commit source checkpoint.
- [ ] Run full legacy three-carrier replay; compare LF-canonical full evidence hash to historical 9e26e7a113e30456c871ff5c59a9759a721504f1794faa5c686160ecf4b7e413. Record actual result, not expectation.

## R2: Independent end-to-end oracle

Files: new `independent-*` code/tests and `INDEPENDENT_*` spec/results in the revalidation directory. No research-harness imports.

- [ ] Derive separate enumeration/terminal/minimax/release-schedule/RFG/component implementation from documented definitions; freeze comparison schema and source before expensive execution.
- [ ] Validate toy terminal/parity and structural cases, including sealed-carrier rejection.
- [ ] Add a clearly labeled legacy comparator adapter outside the independent implementation, with per-state semantic records.
- [ ] Run one carrier at a time with durable per-case checkpoints; compare all requested stages and semantic OOO dependencies. Record mismatches before changes.
- [ ] Review independence and report every unverified stage explicitly.

## R3: Transformation DAG and freshness provenance

Files: `LINEAGE_*`, `FRESHNESS_*` in revalidation directory.

- [ ] Audit each RS065–077 warrant and actual map; classify source/target/domain/gauge.
- [ ] Identify prior carrier usage from metadata, without accessing sealed outcomes; record candidate order and provenance limitations.
- [ ] Review the DAG against actual map definitions and persist it.

## R4: Fresh OOO test

- [ ] Use R3 provenance to freeze a resource-bounded candidate/fallback warrant, excluding sealed cases, with non-affine discriminating criterion and OOO feature definitions.
- [ ] Commit structural preparation before scalar replay; record affine cases as non-discriminating rather than cherry-picking an outcome.
- [ ] Execute and independently verify the first admissible discriminating case, preserving any falsifier.

## R5: Objective separation

- [x] Record geometry-parameterized and geometry-blind objectives separately in the control artifact.
- [ ] Integrate this confidence reset into foundational synthesis without rewriting historical results.

## R6: Owner and mover gauges

- [ ] Inspect source-state provenance and define exact owner-swap and per-state mover transport after endpoint reversal.
- [ ] Test whether each transformation descends to the chosen dependency carrier. Freeze maps, catalogs and rows before scalar replay.
- [ ] Compare full controls and the capacity/P1 relation in each valid gauge; distinguish relabeling equivariance from re-estimated carrier sufficiency.
- [ ] Record results, limitations, and RS096 gate disposition. Do not start RS096 automatically on an unresolved check.
