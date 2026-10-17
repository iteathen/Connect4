# Frozen bounded projection test: exact action-bit quantifier elimination over source-QBF DAG

**Date:** 2026-10-16. **Before experiment HEAD:** `5f2aab7601900837bda918000db7d34ce261bdae`. **Status:** FROZEN PLAN, not an outcome claim.
**Owner:** `research/semantic-quotient`.

Source exact guard-complete CNF: `guarded-action-qbf.mjs` and theorem `docs/research/2026-10-16-guarded-action-qbf-full-depth-width.md`.

## Mathematical operator, no move-path discovery

Gate-definitional CNF has unique internal outputs for every assignment of *action input bits*. Recover its straight-line AND/NOT DAG from each Tseitin triple, not from future board play. For innermost action input bit x, substitute both Shannon cofactors `F[x=0]`, `F[x=1]` into a hash-consed DAG and aggregate:
- existential P0 bit: `exists x F = F[x=0] OR F[x=1]`;
- universal P1 bit: `forall x F = F[x=0] AND F[x=1]`.
Process all bits of each action block from right to left, action blocks from last to first. Same-quantifier bits in one action block commute legitimately, but opposite-player blocks never commute. The gate-unique staged-auxiliary proof permits eliminating its definitional variables functionally, not adding them as independent strategic choices.

Count every AND/OR composition, every nontrivial cofactor visit and cache reuse, every retained node and highest live frontier. Store exact remaining support-bit masks for constructed DAG gates; cofactor a gate directly when x lies in its support, skip it otherwise. Boolean complement uses signed edges, preserves work accounting. Do not instantiate move sequences, successor game states, all support configurations, or search-generated policy tables in the constructor.

## Fixed falsifiers and budget

1. Derive source q only from legal physical predeclared histories on 4x3-c3, 4x4-c4 and standard 7x6-c4, including `223`, `1212`, `44444`, `444444` and at least one earlier draw/terminal control. Stop at independently frozen k<=4 (or larger if cheap) and compare all four projected root bits against independent physical alternating max/min. Compare fixed first action values too.
2. Probe canonical `44444` k4, k6, k8, k10, k11, k12 in order while retaining thresholds UNKNOWN when not all roots or actions close. Do NOT raise limits or infer unrestricted WDL from one finite cutoff.
3. Per threshold/workload: 60k retained Boolean nodes, 300k nontrivial AND/OR/cofactor operations, zero counted support representatives (cap10k), 15 seconds local. Count actual visits, not merely final gate count. Stop at first budget failure, record exact stage, partial stats and failure without raising resources.
4. A result computed by bounded projected circuit is exact only for that QBF's declared Wlo/Nlo/Whi/Nhi horizon. Bound convergence is the only source-independent unrestricted WDL certificate. Full k37 QBF truth remains open until actually eliminated.
5. Record both positive and negative outcomes in a reproducible producer/control/evidence packet; subsequent research compares structured-DNNF and bilateral P1/P2 eliminators if Shannon gate rewriting expands.

This is an *evaluation* experiment and must not reintroduce game continuations or conflate a single returned constant with cheap construction.
