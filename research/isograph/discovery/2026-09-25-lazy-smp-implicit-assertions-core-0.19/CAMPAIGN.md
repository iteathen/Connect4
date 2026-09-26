# Lazy SMP — Core 0.19 Implicit Assertions Test Campaign

**Date:** 2026-09-25  
**Status:** ACTIVE test campaign  
**Owner:** `research/semantic-quotient`  
**Authority effect:** none  
**Solver-method effect:** none

## Purpose

Test the unqualified Core 0.19 implicit-assertion candidate against the already frozen Lazy SMP IsoGraph rendering and its existing measurement evidence.

The test must not modify the source rendering in order to manufacture assertions.

## Frozen semantic candidate

IsoGraph branch:

`research/core-0.19-implicit-assertions`

Candidate commit:

`426a808ac212441dbd718d348977eff0172e6fc6`

Candidate artifact:

`CORE_SPEC_DRAFT_0_19_IMPLICIT_ASSERTIONS_CANDIDATE.md`

The candidate is unqualified. This campaign is development evidence only.

## Frozen Lazy SMP rendering

Research owner head at campaign start:

`iteathen/Connect4@71e09504b706d6b7aea6e2c926345526825ef8f5`

Primary subject:

- `research/isograph/successor/CONNECT4_LAZY_SMP_SEARCH_METHOD_0_2.md`
- `research/isograph/successor/CONNECT4_LAZY_SMP_SEARCH_METHOD_0_2.isg`
- `research/isograph/successor/CONNECT4_LAZY_SMP_SEARCH_METHOD_0_2.json`

Implementation anchor encoded by that rendering:

`iteathen/JSMinSys@04d37498607ace16dae33c79462ddfe1503c8a0d`

## Existing discovery/evidence inputs

The assertion test may consume already recorded evidence, but every evidence-derived implicit assertion must identify that fact.

Primary prior records:

- full DP rerun:
  `research/isograph/discovery/2026-09-25-lazy-smp-full-decode-nei-qu-dp/DP_RERUN_0_3.md`
- full-decode final report:
  `research/isograph/discovery/2026-09-25-lazy-smp-full-decode-nei-qu-dp/FINAL_REPORT_0_3.md`
- DTS model:
  `research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/DTS_MODEL_0_1.json`
- DTS first DP pass:
  `research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/DP_PASS_0_1.md`
- overlap census:
  `research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/OVERLAP_CENSUS_0_1.md`
- provenance census:
  `research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/PROVENANCE_CENSUS_0_1.md`
- route replacement matrix:
  `research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/ROUTE_REPLACEMENT_MATRIX_RESULT_0_1.md`
- exact route-8 continuation scan:
  `research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/ROUTE8_EXACT_SCAN_RESULT_0_6.md`
- exact route-8 A/B:
  `research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/ROUTE8_EXACT_AB_RESULT_0_8.md`

## Method

Run implicit-assertion expansion in two layers.

### Layer A — graph-only

Use only structure already explicit in the full 0.2 Lazy SMP rendering.

### Layer B — evidence-enriched

Add frozen measured facts from the existing DTS/DP campaign as explicit evidence supports.

For both layers:

1. do not add a premise because it would improve a desired optimization;
2. keep source-explicit and implicit support distinct;
3. preserve QU dependencies;
4. retain recoverable support chains;
5. iterate newly admitted implicit assertions into later passes;
6. stop the operational pass when a full pass yields no materially new valid assertion;
7. do not call that stop universal semantic closure.

After expansion, rerun Discovery Protocol against the expanded structure and distinguish:

- already explicit prior findings;
- implicit restatements of prior findings;
- materially new structural synthesis;
- hypotheses/leads that remain non-assertive.

## Falsifier

The campaign fails as evidence for Core 0.19 usefulness if the implicit-assertion process:

- imports unrepresented assumptions;
- promotes QU to certainty;
- invents probability;
- uses the desired optimization as validity support;
- merely renames prior explicit statements without exposing additional structure;
- or cannot preserve the support lineage of its claimed new assertions.
