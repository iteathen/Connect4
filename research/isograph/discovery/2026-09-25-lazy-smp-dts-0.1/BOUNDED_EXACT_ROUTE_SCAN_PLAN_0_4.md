# Lazy SMP DTS 0.1 — Bounded Exact Route-Exercise Scan Plan 0.4

**Date:** 2026-09-25  
**Status:** CHECKPOINTED BEFORE SCAN  
**Authority effect:** none  
**Solver-method effect:** none

## Why this scan exists

The protected-route candidate has:

- exactness preserved;
- no large pure-overhead penalty on the solved control;
- route-6/8 residency changes on unresolved workloads;
- but fixed-duration hard probes have unstable CPU availability and no stable progress-normalized result metric.

The cleanest next falsifier is a **bounded exact position** that both:

1. reaches an exact result on the four-worker baseline in a reasonable runner window; and
2. exercises route-6 and/or route-8 direct-map displacement under the diagnostic baseline.

That allows ordinary same-runner completion-cost comparison instead of interpreting fixed-time CPU occupancy as progress.

## Scan design

Use the existing measurement JSMinSys head:

`0bb979c61c012290fdbd4d69dd845f4896f70877`

with:

```text
workers                  4
sharedSampleMask         7
diagnosticProvenance     1
overlap tracing          disabled
shared/local capacity    65536
timeout                  8 s per candidate
```

The positions are deterministic legal nonterminal continuations of hard seed `13333111`, sampled across later plies. The scan is candidate discovery only; it is not performance qualification.

For every position record:

- EXACT/TIMEOUT;
- exact WDL/witness if solved;
- route-6 and route-8 stores/hits;
- different-key displacement counts of route 6/8;
- incoming routes responsible for those displacements;
- wall/CPU/cycles for context only.

## Selection rule

Prefer the earliest/slowest exact position that shows repeatable route-6 or route-8 displacement. If several qualify, retain more than one so the A/B is not position-specific.

Do not tune the protected-route policy from the candidate's performance result; the policy is already frozen for the first A/B.
