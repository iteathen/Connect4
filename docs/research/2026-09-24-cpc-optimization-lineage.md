# CPC optimization lineage and current hot-path targets

**Date:** 2026-09-24
**Scope:** CPC/NDC realization inside JSMinSys production CPC-first Negamax.
**Status:** recovery checkpoint before new implementation work.

## Structural authority already consumed

C4-0006 gives `N(t)=(W-1)H-ply+r+1`; target-column height cancels. The later control-potential result strengthens the implementation consequence: absolute zero-reservation target ownership is `q0(c,r)=((W-1)H+r) mod 2`, independent of current heights or prefix rank.

JSMinSys already consumed this result in `b7303ab934e87f34c6124d7415d7d5b463694b6d` (remove target-column branch from parity loop) and `5eb20a11e9a1e53eed73b329e8660bc2dd2e26c3` (collapse target ownership completely to prepared geometry parity). Do not restore per-node CPC owner-parity accumulation.

## Current JSMinSys CPC lineage

Retained changes include direct singleton identity from shape ID, a nonterminal-only CPC hot entry, preemption-width implication, CPC-owned projected/precursor/forced telemetry, CPC-only recursive search specialization, and geometry-only target ownership.

Current production order remains: exact cache -> CPC exact/bounds/restriction -> advisory ordering -> RBA child -> recurse.

## Historical minimax evidence

### Fixed-width exact solver

The Sep. 8 two-word exact solver computes active winning-position bitboards and derives candidate cells, opponent winning cells, forced defense, multi-threat exact loss, and losing-move elimination with direct bit operations. Its state semantics differ from RBA/CPC, so formulas are not copied literally. The transferable hot-path principle is: operate on the active tactical fact set rather than test the entire candidate vocabulary.

### Residual forced macro

The Sep. 9 residual solver separated immediate own singleton win, opponent double-threat exact loss, exactly-one-opponent-singleton forced defense, and ordinary search. Collapsing true forced chains removed about 31.5% of nodes beyond tactical recognition on the frozen 7x6 cohort and 17.3% on a fresh non-tactical cohort. In the then-current structural stack, fresh-cohort runtime improved about 21%. Intermediate forced TT reuse could help isolated positions, so the result was aggregate rather than monotone per position.

### Quotient-native Negamax

The later quotient-native Negamax implements the promoted forced-chain idea directly: when tactical closure yields one forced column, it advances the child in a loop and continues without recursively admitting the intermediate forced state as an ordinary branch frame. This is direct precedent for a future CPC-forced macro pass in current IsoMax.

## Current CPC representation mismatch

The RBA coordinate representation is a packed active-membership bitset over a sorted basis. Some CPC paths already exploit it: `pairedResponseNoWin` walks only set coordinate bits with `firstSetBitIndex32` and `bits &= bits-1`.

By contrast, `collectPlayerSingletons` walks every basis entry in the singleton prefix and calls `coordHas`, while `deriveForkPreemption32` walks every pair-basis entry and separately calls `coordHas` for mover/attacker membership.

This is inconsistent with both the packed representation and the historical exact-solver principle.

## First target: active-pair fork traversal

Candidate:
- load mover and attacker coordinate words once;
- iterate only set bits in their union;
- map active basis indices to sorted residual shapes;
- skip active singleton entries and stop at the first active triple-or-larger shape;
- test mover/attacker membership from the already-loaded word bit instead of calling `coordHas`;
- preserve existing singleton, playability, distinct-column and precursor guards;
- delay `forkTargets32.fill(0)` until the first attacker pair survives all precursor guards.

Semantics are unchanged: the same active mover pairs enforce the minimal-pair guard; the same active attacker pairs generate precursor edges; the same preemption intersection, exact-loss, restriction and forced-column result is computed.

## Falsifiers and accounting

Reject if any CPC kind/interval/preemption result differs, if production node/cofactor counts change unexpectedly, or if same-runner CPC-only timing/cycles regress materially. Every changed operation must be reflected in the JSMinSys add-on cycle ledger in the same commit.

## Follow-up order

1. If active-pair traversal survives, test the same active-coordinate principle for singleton collection.
2. Then test true CPC forced-chain macro compression using the Sep. 9 and quotient-native implementations as provenance.
3. Only then consider stronger CPC theorem additions.

Do not promote the opt-in synchronized frontier-response scan to standard 7x6 production merely because it is exact: maintained standard-board prefix controls previously showed zero additional interval/kind closure, so its recurring scan cost remains unjustified.
## Qualified optimization result: singleton dedupe

JSMinSys `a32a23de4188237b17edbe94ebe8558e54d61396` removes the impossible duplicate-cell guard in `collectPlayerSingletons`. The proof is structural: basis IDs are unique and singleton shape ID equals cell ID.

Qualification preserved every search/CPC counter. Same-runner search B/C/C/B improved CPC-only warm medians by 12.72%. Same-runner Fhourstones B/C/C/B on `45461667` (Connect4 run `36080807337`) preserved 806,844 nodes and 455,568 CPC calls while mean total cycles fell from 4,590,139,471.5 to 4,531,617,656.5 (**-1.27%**), about 5689.00 -> 5616.47 cycles/node. Wall improved 0.79%.

Disposition: **retained**.

Two preceding source-level CPC candidates were rejected and preserved in JSMinSys:

- cycle reduction 112: active-pair fork traversal; warm production regression despite identical semantics/counters;
- cycle reduction 113: duplicate fork-output reset removal; fewer stores but adverse V8 timing.

The next experiment is the historically promoted forced-chain macro: eliminate deterministic CPC forced transit states as ordinary recursive/TT nodes, following the Sep. 9 residual solver and Sep. 12 quotient-native Negamax evidence.
