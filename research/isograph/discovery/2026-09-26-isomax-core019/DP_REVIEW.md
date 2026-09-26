# Bounded independent review of the DP report

Date: 2026-09-26.

**Disposition: no blocking claims found for the report's stated scope of source-grounded optimization candidates.** This review does not qualify an implementation, establish a measured benefit, certify exhaustive DP coverage, or reopen the completed source-rendering gate. The parent reports that independent reviewer B completed that gate and promotion occurred in `18104ccc`; that result is an input to this bounded review, not a result independently reproduced here.

Reviewed `DP_REPORT.md`, `discovery-support.json`, `discovery-controls.mjs/json`, the relevant original JSMinSys cofactor/canonicalization, alpha-beta, worker, and live-line code, and the four historical reports linked by the DP report. The separately supplied four/eight-worker reports were also inspected. No solver changes or benchmarks were performed.

## Checks and evidence

- Independently checked all **465** support hashes against the previously frozen complete reconstruction: 15 function occurrences, 449 operation occurrences and the worker-entry program. Every pointer resolved and hash matched. The report correctly treats this as static navigation, not a dynamic frequency or cost profile.
- Reran the finite-model controls in memory with their file-output statement removed. Results match the recorded JSON: 168 upsets, 2,688 absorption cases, six enumerated directional-bound cases, and 64 reflection/removal cases. No reconstructed solver or production benchmark ran.
- Confirmed that the worker selects `RBA_AB_CPC_ONLY`, uses `index % columns`, and calls a private prepared alpha-beta solver with the shared exact-cache interface. The distinction between complete static closure and active recursive path is justified.

## C1 — Closure absorption

The stated algebra is sound for a fixed induced child-basis poset: if U is upward closed and x belongs to U, every basis element above x already belongs to U. Inserting the principal upset again cannot change U. This requires neither a complete Boolean lattice nor a probability model; the finite Boolean-lattice control is an appropriately limited falsifier rather than a production proof.

The implementation initializes both target coordinates to zero before processing residual images. It writes an image and then completes its strict-superset expansion before beginning the next parent residual. Shape cardinality ordering makes the current larger-shape scan consistent with this invariant. The report retains the essential guards: test the coordinate before the current insertion, use the same child basis/subset semantics, complete earlier closure, and retain terminal/blocking rules.

P0/P1 checks must remain independently gated by the current `write0`/`write1` conditions. One player's membership cannot authorize skipping the other player's needed insertion, nor authorize writing a coordinate blocked by the played cell. The prose's “which target needs it” must be implemented as those existing survival guards AND absence of its own image bit. The report already states independent-player and opponent-blocking guards; no correction is required.

The report does not assert a speedup from this algebra. Added loads/branches, induced bases, terminal cases, selected helper implementations and scratch contracts remain production-qualification and measurement obligations. C1 is a reasonable first isolated candidate under those constraints.

## C2 — Directed WDL endpoint publication

The endpoint argument is exact: lower bound +1 or upper bound -1 on a value in {-1,0,1} yields a singleton. A lower bound 0 or upper bound 0 does not. A sign or endpoint value without its bound direction is insufficient.

The active `searchCpcOnly` loop returns from recursive fail-high before the final full-window store. Thus the stated source mechanism exists. This does not establish how often useful new stores would occur; the report explicitly preserves that uncertainty and the prior census showing no measured recursive-publication population.

The current-key warning is especially important and accurate. A forced continuation advances `keyOffset`, `basisOffset`, `mover`, `orientation`, alpha/beta and `sign` inside one invocation. At a current-state fail-high site, the endpoint must be interpreted for that current mover and converted with that mover; `sign * best` is the value transported back to the original invocation and is not directly the absolute value for the current key. The current iteration's key/hash/slot must remain aligned. The report excludes accidental ancestor publication and requires narrow-window, forced-chain, mirror and oracle checks before implementation qualification.

Scalar exactness must not be turned into a changed root action witness. Sampling, full-key validation, row publication and replacement effects stay load-bearing. The report preserves them and admits that extra exact stores can hurt performance.

The review initially noted that the finite model enumerated all six direction/bound combinations but explicitly asserted only the two exact endpoints and two interior cases. The author added and reran assertions that lower(-1) and upper(+1) each retain all three values; I inspected the corrected control. This minor test-completeness point is resolved. It does not upgrade the controls to a production proof.

## C3 — Reflection fusion

The removal/reflection commuting relation and preservation of subset inclusion are sound. The source canonicalizer first compares reflected support, and only if support ties does it compare the reflected residual coordinate words. Therefore a strictly selected reflected support can determine the target orientation before residual materialization; support-symmetric children require the existing residual tie rule.

The report correctly requires the reflected basis to be sorted in the same global-ID order and its local bit positions remapped. It also retains action transport, physical live-line orientation XOR, root mirror witness, terminal metadata, scratch lifetime and geometry contracts. Those conditions prevent mistaking equal scalar value under reflection for literal action identity.

The 2x2 finite control proves neither the complete production basis permutation nor correct action transport. The report explicitly says so and demands differential child-key, basis and transported-action equality before measuring. No fusion or speed claim is promoted prematurely.

## Residuals and historical negatives

R1 is appropriately cautious. The live-line evaluator counts original line incidence, while residual coordinates can merge requirements into common shape identities. The report neither proves universal redundancy nor claims an impossibility theorem; it withholds deletion pending an exact recovery function or a reachable separating example. Equal WDL alone cannot justify deleting a move-ordering carrier.

R2's static claims match source: worker 7 repeats worker 0's configured order on a seven-column board; insertion sorting retains prior order among equal scores; root ordering uses the common geometry action priority. Shared-cache timing can still differentiate otherwise matching workers, so the report correctly avoids equating configuration with trace identity.

The supplied matched-instrumentation report at `C:/r/isomax-lazy-smoke/docs/qualification/20260926-four-worker-controlled/REPORT.md`, together with `../20260926-worker-scaling/REPORT.md`, supports the observed 1.718x aggregate visit throughput, 2.005x process cycles and the same one completed input. These are one earlier eight-worker sample per input and a later matched-instrumentation four-worker run, not randomized paired scaling evidence. R2's interpretation respects those limits. Immutable citations have now been added to the DP report.

The all-leads report supports retaining the failures/mixed outcomes of full-sharing density, local backfill, persistence, shifted shared slots, recursive spread and root rotation. The provenance census supports the scoped 100% CPC_EXACT claim for measured stores/hits, not a universal impossibility of recursive publication. The route-8-only checkpoint remains an unfinished experiment rather than a newly successful discovery. The DP report handles these distinctions correctly.

The historical sentence about reverted hash-value reuse is not independently established by the four inspected historical reports; source inspection is consistent with recomputation but is not revision-history evidence. That sentence is not load-bearing for C1–C3. A direct reversion citation, or removal of the chronology, would improve traceability without changing this disposition.

## Scope conclusion

The report separates an admitted source rendering from unimplemented optimization candidates, finite-model falsifiers from production qualification, and measured historical observations from new performance claims. It does not promote whole-structure isomorphism, natural identity, solver correctness, deterministic scheduling or machine-cost conclusions. Its proposed next unit—C1 alone, native differential qualification, then matched whole-operation measurement with unchanged results and witnesses—is consistent with the evidence. No blocking change is required to the candidate reasoning.
