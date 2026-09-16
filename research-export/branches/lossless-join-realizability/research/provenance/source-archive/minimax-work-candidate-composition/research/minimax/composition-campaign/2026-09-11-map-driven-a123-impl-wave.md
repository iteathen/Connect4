# Map-driven A123 / IMPL composition wave

**Date:** 2026-09-11  
**Status:** research evidence; no maintained solver promotion implied.

## Governing rule

This wave was selected from the status-blind master candidate map. Adoption/promotion state was not used to rank or interpret the candidates. Negative results attach to the tested form/regime, not automatically to the parent mechanism.

## A123 — implementation-form sequence

The role-generalized A1-A3/U1+U2 certificate remains exact and removes about 25-26% of proof nodes in the established late-game strong stack. The implementation question was whether the certificate can become cheap enough to retain.

### v3 direct no-cache generation

Workflow run `34592298558`, job `103240130547`.

- differential states: 1,800;
- exact cover mismatches: 0;
- covers: 31;
- dynamic median: 9.350 ms;
- direct no-cache median: 12.447 ms;
- cached-cold median: 16.037 ms;
- cached-warm median: 3.975 ms.

Direct generation removes the bad cold support-cache lifecycle and beats cached-cold by about 1.29x, but it is still about 25% slower than the dynamic certificate because fragment IDs/resources are rebuilt expensively per check.

### v4 geometry-native fixed scratch

Workflow run `34592597105`, job `103241077616`.

The standard 7x6 U1 event-rank law simplifies future owner of row `r` to player `r mod 2`. This allows singleton/pair blocker IDs, adjacent resources, and pair resources to be compiled once as static geometry. Runtime uses fixed scratch arrays plus global WSL-625 upward closures; there is no support cache and no blocker string/Map lookup.

- differential states: 1,800;
- exact mismatches: 0;
- covers: 31;
- dynamic median: 7.027 ms;
- geometry-native median: 2.912 ms;
- speedup versus dynamic: **2.413x**.

### Full strong-stack qualification

Workflow run `34592902097`, job `103242026446`.

Pipeline remains:

`IWIN -> DTH -> FBLK -> FMAC -> DEAD -> event-SEWB/A123 stage -> AUTO-pre -> E1 -> E2 -> neutral-last`

The geometry-native implementation replaced only the compiled A123 implementation. Dynamic and A123-off controls were unchanged. The harness required exact equality of nodes, certificate checks, hits, and cuts.

Results:

| form | nodes | median ms | checks | hits | cuts |
|---|---:|---:|---:|---:|---:|
| A123 off | 1,119 | 2.136 | 0 | 0 | 0 |
| dynamic before SEWB | 823 | 2.513 | 626 | 169 | 47 |
| geometry before SEWB | **823** | **2.183** | 626 | 169 | 47 |
| dynamic after SEWB | 825 | 2.547 | 576 | 144 | 30 |
| geometry after SEWB | 825 | 2.512 | 576 | 144 | 30 |

The before-bound geometry form is about **15.1% faster than dynamic A123**, retains **26.45% fewer nodes than A123-off**, and is now only about **2.17% slower than A123-off** on this cohort. This is a near-amortized exact certificate form, not yet a universal wall-time win.

## IMPL — exact RID filtering/indexing forms

The RID-native implication frontier preserves the historical dominance mechanism and strong proof-work reduction on complete small W/D/L controls, but the original frontier spends too much time in lookup/maintenance comparisons.

### Four conservative 32-bit rejection signatures

Workflow run `34592164251`, job `103239711787`.

Every signature form preserved exact score, expanded-state count, dominance hits, and retained frontier. Four signatures reduced exact RID closure checks on 4x5 by **84.64%** and improved the raw closure form by about **1.23x**, but total IMPL remained slower than no-IMPL because frontier traversal still dominates.

### Conservative 8-bit support-local frontier index

Workflow run `34592471811`, job `103240680883`.

Again, exact score, expanded work, dominance hits, and frontier were unchanged.

On 4x5 connect4:

- no-IMPL: 241,276 expanded / ~1,834.9 ms;
- exact closure IMPL: 120,930 / ~4,588.9 ms;
- 8-bit indexed IMPL: 120,930 / ~4,272.8 ms;
- candidate visits reduced about **24.2%** versus the signature-only traversal;
- indexed form about **1.074x** faster than raw closure in that run.

The index is too coarse and its group traversal is itself expensive. This is not evidence against support-compatible implication. It says further W/D/L frontier micro-tuning is low-value until the mechanism's **marginal strong-distance benefit under the current normalized stack** is measured.

## Reassessment

1. A123 geometry-native is ready for broader strong-distance qualification on the frozen MQ5 win/loss anchors.
2. IMPL remains semantically strong, but the next decisive experiment is strong-distance/current-stack authority and marginal proof reduction, not another arbitrary W/D/L index width.
3. If IMPL remains strongly additive after FMAC/DEAD/SEWB/A123, a stronger two-sided fixed index is justified. If its marginal is mostly saturated, retain the mechanism but deprioritize hot-path engineering.
