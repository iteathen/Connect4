# Lazy SMP — Core 0.19 Implicit Assertions Test Final Report 0.1

**Date:** 2026-09-25  
**Status:** COMPLETE first application test  
**Core candidate:** `iteathen/IsoGraph@426a808ac212441dbd718d348977eff0172e6fc6`  
**Connect4 base:** `research/semantic-quotient@71e09504b706d6b7aea6e2c926345526825ef8f5`  
**Test branch:** `experiment/lazy-smp-implicit-assertions-v1`  
**Authority effect:** none  
**Solver-method effect:** none

## Executive result

Applying the Core 0.19 implicit-assertion candidate to the existing Lazy SMP IsoGraph rendering was useful.

The test admitted 17 bounded implicit assertions over five productive passes and reached an operational no-new-assertion pass on pass 6.

The strongest new structural synthesis is:

```text
PRE-COMMIT PHASE
    matching reusable exact truth does not yet exist
    same-q_r private resolution may overlap
    matching shared hit is impossible

FIRST MATCHING EXACT COMMIT
    -----------------------

POST-COMMIT PHASE
    matching exact truth can be consumed
    residency/replacement affects reuse
```

The prior research contained the ingredients for this result, but not this phase boundary as one governing assertion.

## Immediate research consequence

The phase split establishes a hard mechanism boundary:

> a policy that only changes committed shared-cache rows cannot eliminate duplicate same-key work already underway before the first matching exact commit.

Therefore:

- route-8 residency protection is a post-commit mechanism;
- pre-publication overlap is a pre-commit mechanism problem;
- success/failure evidence from one cannot be transferred to the other without an explicit bridge.

This is a useful falsifier for future Lazy SMP proposals.

## Second new consequence

The current deterministic share mask controls several event classes at once.

Before first commit, an eligible matching probe cannot hit.

After commit, the same gate may produce exact reuse.

The same mask also controls publication eligibility.

Therefore the current mask couples:

```text
pre-commit probe-miss exposure
post-commit reuse opportunity
shared publication opportunity
```

The existing asymmetric-gating QU remains open, but now has a sharper structural basis.

No profitability assertion is made.

## Discovery Protocol effect

A full DP-01..DP-45 delta rerun found material changes in:

- cross-boundary structure;
- constraints;
- dependency topology;
- alternative factorization;
- residual handling;
- invariants;
- transformation structure;
- information flow;
- temporal structure;
- composition;
- reconstruction;
- refinement;
- boundary movement;
- parameter roles;
- reachability;
- phase-boundary structure;
- failure-mode analysis.

No NEI route was needed.

No QU was improperly collapsed.

No new behavior-changing optimization was established.

## New lead with highest information value

Run a measurement-only phase-resolved shared-probe census:

```text
pre-commit eligible probes
post-commit eligible probes
post-commit hits
publications
```

This would quantify how much shared-probe traffic is structurally unable to produce the matching hit because it occurs before first commit.

Do not change behavior before measuring this distinction.

## Core 0.19 test observations

### Supported

The candidate successfully handled:

- explicit versus implicit support;
- multiple implicit rounds;
- assertions derived from earlier implicit assertions;
- recoverable support lineage;
- graph-only versus evidence-enriched support;
- QU preservation;
- exact support without inventing probability;
- method-neutral AI reasoning;
- distinction between search motivation and validity support.

### Important negative result

The first provisional “fixed point” was wrong.

While preparing the DP rerun, another valid implicit assertion was exposed, followed by another assertion in the next pass.

This directly supports the Core 0.19 rule:

```text
failure to find
    != proof of absence
```

and shows why an operational no-new-assertion pass must not be described as universal semantic closure.

### No observed constitutional violation

This test did not require:

- hidden premises;
- scope leakage;
- authority amplification;
- QU collapse;
- probabilistic promotion;
- ungrounded support cycles;
- target-conditioned validity;
- rewriting implicit structure as source-explicit structure.

## Disposition

```text
Core 0.19 usefulness:                  SUPPORTED
implicit multi-pass behavior:          SUPPORTED
explicit/implicit provenance split:    SUPPORTED
QU boundary behavior:                  SUPPORTED
bounded fixed-point discipline:        SUPPORTED, with useful correction
new Lazy SMP structural synthesis:     YES
new production optimization:           NOT ESTABLISHED
Core 0.19 qualification:               NOT ESTABLISHED
```

This is development evidence for the Core 0.19 candidate.

It should be used to improve adversarial qualification design, not as promotion evidence by itself.
