# JSMinSys experimental PR review — 2026-09-26

Read-only review of PRs #33–48. No merges, closures, comments, branch deletion, or repository source edits were performed by this reviewer. #49 belongs to the parent reviewer. Actual source diffs were inspected at the heads below, not inferred from PR titles. No new performance benchmarks ran.

Initial comparison base: `04d37498607ace16dae33c79462ddfe1503c8a0d`. During review, #49 merged; final integration assessment uses `d41bd3d3042024b0c5a5a9c316d89be2b3a48fda`.

Authority read: account-global AGENTS.md, EVIDENCE_POLICY.md, SECURITY_AGENT_POLICY.md; Connect4 AGENT_LOCAL.md for evidence interpretation. No JSMinSys repository AGENTS/AGENT_LOCAL/coordination registry was found. PR descriptions are claims, not acceptance authority. Connect4 research checkout inspected: `6eb48c1fdaefb610267e0b97f9c7b36298488e52`, research/semantic-quotient branch. Research records do not promote their underlying Candidate theory to accepted production authority.

## Recommended disposition

**Promote immediately: none of these exact heads against the final main.**

**Retain experiment/qualified candidate: #33, #41, #45, #46, #47.**

**Close rejected/complete after preserving exact source heads: #34–40, #42–44, #48.**

Closing a PR and deleting its working branch should be separate from source preservation. Create an annotated archive tag at each exact head before deletion, with PR URL, disposition, evidence URL, and baseline. Verify tag resolution after pushing. These heads contain unique experimental source absent from main; the Connect4 reports preserve conclusions but do not replace executable source provenance. Suggested tags: `archive/pr-N-20260926`. Retained PRs/branches should remain available until their stated follow-up or replacement is resolved.

| PR | Exact reviewed head | Disposition | Concrete source/evidence basis |
|---|---|---|---|
| [33](https://github.com/iteathen/JSMinSys/pull/33) | `1921368c017dbd468ad71d5e80be4aefda43ff8c` | Retain qualified standalone candidate; current integration blocked | Dense-indexed cofactor replaces six solver/search calls. Historical exact A/B supports this candidate against 04d3749; new main C1 absorption is absent from the dense body. See detailed finding below. Preserve branch and unique research note. |
| [34](https://github.com/iteathen/JSMinSys/pull/34) | `1b882b39a412f11fef5cdedafadfbbe6d4eac6f5` | Close complete; archive source | Adds worker timing, shadow eligibility/rank hits and collision-replacement instrumentation. Completed canonical all-leads campaign uses this exact head. Unique instrumentation, not a production optimization. |
| [35](https://github.com/iteathen/JSMinSys/pull/35) | `a08f47601c467f82bd6663d5457eb4feea56e963` | Close rejected; archive source | Shared exact hits backfill private direct-map rows. Canonical report records shared hits ~102k→7.5k but wall +0.92%, CPU +0.14%, cycles +0.48%. Mechanism worked; economic claim did not. |
| [36](https://github.com/iteathen/JSMinSys/pull/36) | `edacf7d8f188e4961893489d3fd33cd19d645c92` | Close rejected; archive source | Root order changes from geometry order to per-worker rotated state order at both score and selection sites. Canonical report records failed serial/Lazy-SMP move-witness equality; exact WDL alone does not meet that surface's contract. |
| [37](https://github.com/iteathen/JSMinSys/pull/37) | `adcc8a0d5eb565218bc69e1089bf3620e1a81d0a` | Close rejected; archive source | Replaces host polling promise with an Atomics.waitAsync wake loop. Canonical report records wall +6.66%, CPU +0.78%, cycles +0.14%; small observation tail supplies no justification. |
| [38](https://github.com/iteathen/JSMinSys/pull/38) | `2a63ee02026d1f3394e00d5f6f4dd1412ca35594` | Close rejected; archive source | Adds optional caller-supplied persistent cache, checks key width/mask, and reuses table/stats. Repeat-solve evidence: wall +6.34%, CPU +2.28%, cycles +2.62%. Production geometry/revision identity and aging are also unfinished. |
| [39](https://github.com/iteathen/JSMinSys/pull/39) | `2dcd6ab2a4b4c456cdd0985bf039713c4b1c905f` | Close rejected; archive source | Recursive offset becomes `(index*2)%columns`. Canonical report: wall -1.98% but CPU +2.65%, cycles +3.02%; increased diversity does more total work. |
| [40](https://github.com/iteathen/JSMinSys/pull/40) | `cb93c196b458b1a249f8dc5dfda1b1bd26ef3bc9` | Close rejected; archive source | Shared slot address shifts hash right by 8 at both probe/store. Solved-control wall -2.69%, cycles -0.06%; hard 13333111 probe CPU +10.61%, cycles +9.87%. Canonical report rejects global promotion. |
| [41](https://github.com/iteathen/JSMinSys/pull/41) | `79a54026ded43d36e917a40d0513adf6154b01af` | Retain experiment | Unique per-worker publication-owner and value/rank/density/legal histograms. Actual measurement run exists and completes exact controls, but this is research instrumentation with domain-sized bins and recurring conditional hot-path work. No production benefit claim is established. Keep source until its results/replacement are durably reconciled. |
| [42](https://github.com/iteathen/JSMinSys/pull/42) | `ec1977f5bc072d891208615a336968e2925f9194` | Close rejected; archive source and raw result summary | Adds key-meta rank>=36 override to mask-based sharing. Raw same-runner evidence independently checked: solved control wall +5.13%, CPU +0.23%, cycles +0.63%; hard probe cycles +0.48%; empty cycles -3.20%. Broad workload-sensitive policy lacks promotion support. |
| [43](https://github.com/iteathen/JSMinSys/pull/43) | `1b4b2abd42de8a5f4ce921301d2b98250f2bc765` | Close rejected; archive source and raw result summary | Scans column heights on hash-rejected accesses and shares when legal count<=2. Raw solved control wall +1.78%, CPU +1.18%, cycles +2.04%; hard CPU +5.50%, cycles +5.23%. |
| [44](https://github.com/iteathen/JSMinSys/pull/44) | `3eeece2eeecd089018f2a28cf4b6d6502723e664` | Close rejected; archive source and raw result summary | Computes rank39 recursion-offset threshold once at root, uses it in shared probe/store gates. Raw solved control wall -0.80%, CPU +1.06%, cycles +0.89%; hard CPU +3.36%, cycles +3.43%. Removing meta rereads did not rescue economics. |
| [45](https://github.com/iteathen/JSMinSys/pull/45) | `2afb6690984d33e3593f2ccc072a43bb082a0e9f` | Retain unqualified experiment | Same offset mechanism as #44, threshold 40. Exact CI fails ledger source identity. No exact performance result found. Do not conflate a catalog defect with demonstrated performance rejection. |
| [46](https://github.com/iteathen/JSMinSys/pull/46) | `c7dd91b4bcec0d8a93b4b158a3e27a70f2a7d645` | Retain unqualified experiment | Same offset mechanism as #44, threshold 41. Exact CI fails ledger source identity. No exact performance result found. Preserve pending repair/decision, not merge. |
| [47](https://github.com/iteathen/JSMinSys/pull/47) | `0bb979c61c012290fdbd4d69dd845f4896f70877` | Retain experiment | Unique bounded per-worker full-key interval traces plus CPC exact-route, shared provenance and displacement matrix instrumentation. Exact head is consumed by canonical route scans/matrix. Route8 refinement remains checkpointed; preserve this reproducibility source. |
| [48](https://github.com/iteathen/JSMinSys/pull/48) | `05a699b575e15d4039d835af61aa5c35b00822e1` | Close rejected v1; archive source | CPC emits routes; shared exact-value word packs route bits; incoming 3/4/5 cannot replace committed 6/8. Canonical exact controls establish correctness and density-sensitive gain: high-displacement route8 cycles -1.10%, lower-displacement +0.92%, route6 +0.46%. V1 global policy is rejected; rare-route mechanism remains research. |

## #33: qualified in isolation, unsafe to treat separate evidence as composed evidence

The PR's net implementation adds `connect4RbaCofactorKnownHeightDenseIndexed`. It consumes existing dense remove/subset tables, caller-owned scratch, and sequential child-basis traversal. Sparse geometry or nonzero seen offset falls back to generic cofactor. Inspection found its dense logic matches the prior generic implementation's terminal handling, child-basis construction, player filtering, and upset propagation.

The final implementation `7f0c47b0e38d37846ff73bcda699b4c8c4040545` differs from PR head only by the research document. Earlier rejected adjacency representations are removed from the final net implementation. Exact-head [Verify run 36153616482](https://github.com/iteathen/JSMinSys/actions/runs/36153616482) succeeds.

Historical evidence: [same-runner A/B 36152954193](https://github.com/iteathen/Connect4/actions/runs/36152954193), [candidate record](https://github.com/iteathen/JSMinSys/blob/1921368c017dbd468ad71d5e80be4aefda43ff8c/research/connect4-cofactor-dense-indexed-optimization.md). The record combines four baseline and four candidate samples from two attempts: wall -11.38%, CPU -8.68%, cycles -8.72%, all exact +1, move3, oracle matched, clean four-worker exit. I inspected raw latest-attempt labels and four samples: baseline04d3749 versus candidate7f0c47b, exact clean results, lower candidate cycles. Different-CPU profiler snapshots are not used as before/after performance evidence.

Fresh bounded qualification at exact head:

- 6,142 generic/dense transition comparisons passed: dense4x4 624; dense7x6 1,602; sparse4x4 624; sparse7x6 1,392; sparse10x10 1,900. Compared full words, terminal result and child basis. This checks equivalence to generic, not an independent theorem oracle.
- 32 existing configured-geometry, configured-RBA, CPC-alpha-beta and Lazy-SMP tests passed; those include independent physical/late-position oracles.
- Catalog: 297 sealed functions, 193 add-on units, 30/30 blocks, zero deferred; runtime geometry audit passed.
- Node v26.7.0, local Windows; no performance claims from these tests.

Test source is `C:/r/jsminsys-pr33-review-compare.mjs`; isolated source export is `C:/r/jsminsys-pr33-review`. Export with `git -c core.autocrlf=false archive` for catalog identity: the initial default Windows export converted line endings and falsely failed an unchanged branch-manager blob; the LF export passes. No repository source was repaired to pass verification.

**New-main integration finding:** d41bd3d adds per-player principal-upset absorption to the generic cofactor. #33 redirects the active dense solver/search call sites to a copied body with no absorption guard. A textual merge can therefore leave C1's optimization present in generic code while bypassing it in the standard dense path. Neither historical #33 A/B nor #49 A/B measures that composed target. The evidence does not establish that #33 is a regression against C1, but equally does not qualify promotion against it. Retain #33; the next bounded implementation task is to compose absorption with the dense body, refresh cycle accounting, review/test that exact target, and obtain proportionate same-runner evidence before promotion. Do not silently discard either valid candidate's mechanism.

## Evidence for closed campaigns

#34–40 canonical records:

- [Campaign and exact heads/runs](https://github.com/iteathen/Connect4/blob/research/semantic-quotient/research/isograph/discovery/2026-09-25-lazy-smp-all-leads-investigation/CAMPAIGN.md)
- [Final report with individual mechanism results](https://github.com/iteathen/Connect4/blob/research/semantic-quotient/research/isograph/discovery/2026-09-25-lazy-smp-all-leads-investigation/FINAL_REPORT.md)
- [Machine-readable disposition ledger](https://github.com/iteathen/Connect4/blob/research/semantic-quotient/research/isograph/discovery/2026-09-25-lazy-smp-all-leads-investigation/LEAD_LEDGER.json)

#42–44 PR claims were checked against the actual machine outputs rather than title wording:

- [Rank36 and low-legal run36166571121](https://github.com/iteathen/Connect4/actions/runs/36166571121); Connect4 head `0fca9b797bbcc60e491273a8a553b29737031752`.
- [Rank39 run36167332422](https://github.com/iteathen/Connect4/actions/runs/36167332422); Connect4 head `2ed88683ba46fc4d99790414ad99a2e409acf400`.

Both runs use B/C/C/B on `45461667`, then 15-second baseline/candidate hard and empty probes, exactly four workers with mask7. All solved samples were EXACT +1/move3 and clean; all unresolved probes timed out cleanly with four exited workers. A fixed-time unresolved probe's CPU/cycles is workload evidence, not completion-cost proof. The solved controls already show no robust CPU/cycle improvement. Preserve these summaries or the relevant raw JSON in durable research because Actions logs can expire; I did not locate a dedicated canonical final report for this later threshold campaign.

#48 canonical exact-head records:

- [Route6 exact A/B](https://github.com/iteathen/Connect4/blob/research/semantic-quotient/research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/ROUTE6_EXACT_AB_RESULT_0_7.md)
- [Route8 exact A/B and final v1 rejection](https://github.com/iteathen/Connect4/blob/research/semantic-quotient/research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/ROUTE8_EXACT_AB_RESULT_0_8.md)
- [Checkpointed route8-only refinement](https://github.com/iteathen/Connect4/blob/research/semantic-quotient/research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/ROUTE8_ONLY_CANDIDATE_PLAN_0_9.md)

The refinement is not already implemented by #48. Archiving v1 preserves the baseline needed for that controlled comparison; closing v1 should not close the research hypothesis.

## Retained instrumentation and incomplete threshold evidence

#41: [actual leverage census run36165803251](https://github.com/iteathen/Connect4/actions/runs/36165803251) at Connect4 `83ba06858c409be1f00e1fb148e04ddaff1bbd45` includes four exact solved controls, four exact late controls, and clean hard/empty timeouts. Source provides a different diagnostic dimension from #34 and #47; neither contains this implementation as an ancestor. No complete durable feature-census writeup was found during this bounded review. Retain pending source/result consolidation, not production promotion.

#45: [failed Verify36167798959](https://github.com/iteathen/JSMinSys/actions/runs/36167798959). Catalog expects rank39 source blob `47b21d0df5aae6e3fde46e7453ddf3652de39735`, actual rank40 blob is `4e21230c034451840b1b5056ba694b0f68308e5f`.

#46: [failed Verify36167807778](https://github.com/iteathen/JSMinSys/actions/runs/36167807778). Same stale expected rank39 blob, actual rank41 blob `b524721f0df5672f419f9560c82457d0a33b9876`.

These failures occur before the verify job reaches correctness tests. The ledger must be truthfully refreshed and qualification completed before either can be promoted. No evidence authorizes claiming their performance is bad merely because #44 failed. Their unique threshold changes are small but currently unfinished work.

#47: the [route replacement matrix](https://github.com/iteathen/Connect4/blob/research/semantic-quotient/research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/ROUTE_REPLACEMENT_MATRIX_RESULT_0_1.md), [bounded scan](https://github.com/iteathen/Connect4/blob/research/semantic-quotient/research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/BOUNDED_EXACT_ROUTE_SCAN_RESULT_0_5.md), and [route8 scan](https://github.com/iteathen/Connect4/blob/research/semantic-quotient/research/isograph/discovery/2026-09-25-lazy-smp-dts-0.1/ROUTE8_EXACT_SCAN_RESULT_0_6.md) explicitly pin `0bb979c`. Its per-worker bounded trace ownership and existing full-key equality remain visible; this is measurement code with cost, not an optimization suitable for default merge. Preserve for ongoing refinement/reproduction.

## Remaining scope limits

This review establishes exact-head dispositions and a concrete #33 integration hazard. It does not authorize changing contracts to admit root-witness diversity, claim global performance from green CI, or assume a closed research question just because its PR is closed. No fresh long benchmarks, complete re-qualification of all rejected heads, or formal concurrency proof was performed. Global authority permits reusing valid historical evidence; discarded candidates do not need their losses remeasured merely to close them.

Local read-only evidence files: `C:/r/review-run-36166571121.{json,log}`, `C:/r/review-run-36167332422.{json,log}`, `C:/r/review-run-36165803251.{json,log}`, `C:/r/review-run-36152954193.{json,log}`. Retain until durable summaries/archive disposition have been recorded. The isolated #33 export, zip and comparison script are review scratch; safe to remove after this handoff is accepted. No user/pre-existing files were deleted.
