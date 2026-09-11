# Compiled U1/U2 A1-A3 lifecycle findings

**Date:** 2026-09-11  
**Status:** research evidence only; mechanism exactness strengthened, implementation lifecycle still open.

## Context

The dynamic role-generalized A1-A3 certificate removes about 25-26% of the remaining proof work in the current residual stack and composes with DEAD, event-SEWB, AUTO and E1->E2. The strongest measured proof-work stack currently reaches 823 nodes on the frozen eight-root cohort.

The remaining question is whether the certificate can be made cheap enough to keep in the hot exact solver.

## Compiled v1: hot mechanism succeeds, lifecycle fails

The first U1/U2 compiler keyed a response program by physical support + controller parity. Each program stored A1/A3/Baseinverse resource fragments, converted blocker authority to WSL-625 upward closures, and built a 625-way support-local reverse index.

### Differential microqualification

After correcting one harness-construction error (playable Baseinverse resource pairs outside the WSL-625 universe have zero authority and must simply be omitted), the compiler matched the dynamic cover on 1,800 sampled states with zero mismatches.

Workflow run `34589222191`, job `103230405515`:

- samples: 1,800;
- covers: 47;
- differential mismatches: 0;
- support/controller programs: 1,732;
- average useful candidates/program: 13.64;
- zero-authority resource pairs omitted: 14,656;
- dynamic warm median: 174.261 ms;
- compiled warm median: 57.601 ms;
- compiled hot speedup: **3.025x**.

This establishes the U1/U2 compiled blocker-closure mechanism as exact and materially cheaper once a response program exists.

### Full strong-stack qualification

Workflow run `34589489604`, job `103231248976` placed the same compiler into:

`IWIN -> DTH -> FBLK -> FMAC -> DEAD -> event-SEWB/A123 stage -> AUTO-pre -> E1E2 -> neutral-last`.

Compiled and dynamic forms were required to have identical nodes, certificate checks, hits and cuts. They did:

- certificate before SEWB: 823 nodes in both forms;
- certificate after SEWB: 825 nodes in both forms.

But elapsed time regressed catastrophically:

- dynamic before: ~3.163 ms;
- compiled before: ~57.591 ms;
- dynamic after: ~3.103 ms;
- compiled after: ~56.011 ms.

The reason is not the blocker closure itself. The run built ~309-314 mostly unique support programs per solve cohort, and v1 allocated/populated 625 reverse-index arrays per new program despite only ~7.2 useful blocker candidates per program in that search.

**Disposition:** lifecycle/indexing failure, not a semantic or hot-mechanism failure.

## Compiled v2: lightweight candidate programs

The second form removes the 625-way support-local reverse index entirely. A support program stores only the useful small list:

`(resourceMask, blockerID)`

Runtime cover evaluation scans that list against global precomputed WSL-625 upward closures.

Workflow run `34589609170`, job `103231622036`:

- samples: 1,800;
- differential mismatches: 0;
- programs: 1,740;
- average useful candidates/program: 13.59;
- zero-authority pairs omitted: 14,931.

### Cold lifecycle

- dynamic median: 11.687 ms;
- lightweight compiled median: 14.510 ms;
- compiled/dynamic: **0.805x** (about 19.5% slower).

### Warm lifecycle

- dynamic median: 7.906 ms;
- lightweight compiled median: 2.859 ms;
- compiled speedup: **2.765x**.

So removing the reverse index fixes the catastrophic v1 compiler shape, but the sampled support stream is still mostly unique. A Map-backed per-support compiler does not amortize enough on a cold stream.

## Reassessment

The evidence now separates three facts cleanly:

1. **A1-A3 proof semantics are strong:** about 25-26% proof-work reduction in the current stack.
2. **U1/U2 blocker closure is a strong hot mechanism:** ~2.8-3.0x faster than dynamic cover once the support response program exists.
3. **Per-support compilation/caching is the wrong current lifecycle:** supports are too often unique for a Map-backed program compiler to pay for itself.

The next implementation hypothesis should therefore not be another larger cache. Better forms include:

- direct fixed-width response-fragment generation from the maintained support/event state with no Map program object;
- incremental maintenance as support advances by one event;
- precomputed compact geometry tables addressed by the support/event state;
- or simply retaining the dynamic A1-A3 form until the event-frontier representation naturally owns these fragments.

Do not transfer the cold-cache negative to the underlying U1/U2 certificate idea.

## Current campaign order

For the dynamic certificate form, the best current performance-oriented order remains:

`IWIN -> DTH -> FBLK -> FMAC -> DEAD -> event-SEWB -> A1-A3 on restored physical support -> AUTO(pre-score) -> E1 -> E2 -> neutral absolute-last`.

The reverse `A1-A3 -> event-SEWB` order remains a proof-work control because it saves two additional nodes in the frozen cohort but evaluates more certificates.

## Next campaign edge

Continue with `SUP-event -> IMPL`: support-compatible monotone proof reuse already removes substantial proof work, but its old support-local Pareto/index form is too expensive. The next test should determine whether event/support identity and WSL-625 closures reduce that lookup/index cost without weakening proof authority.
