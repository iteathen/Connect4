# Structural-calculus research handoff — 2026-09-16

Research direction: Josh Oshiro

This handoff preserves the current structural-logic / invariant-calculus campaign after repeated executor disconnects. It is intentionally a research-state record, not a promotion of every focused-branch result into canonical shared truth.

## Live heads checked before handoff

- `research/structural-calculus-handoff-20260916` starts from `research/center-reply-partition` at `401fb8d38c0cbfbd655b84772018bead73106d60`.
- `research/center-reply-partition`: `401fb8d38c0cbfbd655b84772018bead73106d60` — `research: isolate on-contract center target`.
- `research/lossless-join-realizability`: `6a3b22199ededa4cf18e29dfe7f25c2dfb25b020` — `research: normalize seven-wide opening necessity`.
- `research/unified-knowledge`: `0e5e29e4ca4fd3941bdcffe70a52b66348705589` — canonical routing branch; it has not yet absorbed the newer C4-R0060+ focused-branch work.
- `isometric`: `b112c341d8a365cbec8d1dd2c474b3b11fec7806` — latest IsoMax audit/reuse note, not the primary lane for this logic campaign.
- `research/bsfp-isometric-invariant-transfer`: `e8e3bb5266a39a92549248f2a586b45de4f2709e` — positive-certificate algebra qualification; adjacent structural evidence.
- `research/export`: `2476ac2f7c3cf6518ea3a851205750b3a4cf4515` — consolidated downloadable snapshot, not a mutation target.

Before continuing, re-fetch all relevant refs; do not reset to these SHAs if they have advanced.

## Established focused-branch work that must be preserved

The `research/lossless-join-realizability` lineage contains the current strongest formalization of the missing composition seam:

1. Fixed-support line-hit image membership is an exact pinned NAE / hypergraph-two-coloring CSP over occupied-cell owners (`C4-R0060` lineage).
2. Local and pairwise line compatibility do not imply global realizability; an odd inequality cycle gives a concrete higher-order obstruction (`C4-R0061`).
3. Fixed colored support is legal-history realizable before terminal stopping iff the gravity-chain owner words shuffle into the global alternating player word, equivalently iff the colored support poset has the required alternating linear extension (`C4-R0062`).
4. Exact projection recombination is a lossless-join / join-dependency problem; static lossless composition is still distinct from transition equivalence, proof identity, and game value (`C4-R0063`).
5. Dynamic sufficiency was sharpened to observation-based/uniform strategy plus explicit strategy-dependency information; projection-relative strategy preservation is stronger than state feasibility.
6. The A/B mixed-cofactor witness was reclassified: exact full residual state already distinguishes the states, so the missing law is a guarded controllable/alternating consequence predecessor rather than another raw board coordinate.
7. For Connect-K, one-move pure-followup-safe columns are singleton transversals of the interval hypergraph of consecutive K-column windows. A unique such column exists exactly when `W=2K-1`; the same equation gives the unique maximum initial requirement-impact event. For K=4 this selects width 7 and the center column structurally, independent of solved play.
8. On seven-wide even-height K=4 boards, all non-center first moves are non-winning under an explicit constructive defender policy. Standard 7x6 therefore has a theorem-level opening-necessity result: center is the only opening not structurally eliminated. This does not by itself prove center sufficiency/win.

Do not identify the structural `28`, strong-play terminal-support `28`, `6x7 -> 30`, or coarse W/D/L `61`. They are distinct objects unless a specific bridge is proved.

## Center-positive continuation state

The next campaign moved onto `research/center-reply-partition`, using executable frontier controls only as qualifiers/falsifiers, not theorem authority.

Latent structural prefix under study:

```text
466565554644 -> P0:C1
```

The reply analysis established a much smaller structural partition than raw move fanout:

- low/off-system refusal examples `A1` and `B1` close under existing proof machinery;
- target-column deviation `C2` closes;
- on-contract `G1` is a separate class;
- high refusals `D5/E5/F5` form a common observation class for which blindly seizing `G1` is not sound as a uniform macro.

Why the naive `G1` seizure fails on the high class was localized structurally:

- some high-pair continuations create a second playable P1 singleton alongside the forced `G4` obligation, yielding a size-two response-capacity/Hall circuit;
- the remaining failing pairs create a delayed row-5/diagonal fork after P0 spends on `G4`;
- these are genuine response-capacity losses, not arbitrary rho-certificate implementation failures.

A key positive result then emerged:

> `A1` and `B1` both qualify as uniform P0 responses from all three high-refusal states `D5/E5/F5` under the existing exact rho calculus.

This is exactly the kind of observation-based strategy compression predicted by the strategy-dependency formalization: P0 does not need to retain which of D/E/F occurred to choose one of those common responses for this scoped consequence.

The latest commit `401fb8d...` isolates the on-contract branch and qualifies two candidate structural targets, `C3` and `G3`. GitHub Actions run `35130636857` completed successfully; both matrix jobs `target-C3` and `target-G3` passed. This is qualification evidence only; it still needs structural interpretation and canonical normalization before becoming a shared research claim.

## Current unresolved seam

The immediate research question is no longer “why center?” at the opening level; non-center necessity is already closed. The unresolved semantic seam is:

> Can the center-opening positive branch be expressed as a compact observation-based controllable predecessor / certificate policy that covers every opponent reply class and composes recursively without rebuilding the ordinary game tree?

Concretely, continue from the `466565554644 -> P0:C1` partition and determine what the successful on-contract `C3` and `G3` targets mean structurally. Do not simply record that both probes pass. Identify:

1. the exact obligations each target discharges or creates;
2. which support/deadline/resource relations are invariant across the relevant histories;
3. whether `C3` and `G3` are equivalent under the same observation or represent two distinct strategy branches;
4. the smallest retained observation needed to choose between them, if a choice is necessary;
5. whether the resulting policy fragment composes with the uniform high-refusal `A1/B1` response into one guarded controllable predecessor rule;
6. the first counterexample if any proposed collapse loses a legal adversarial continuation.

The goal is a load-bearing positive center-progress theorem, not another case table.

## 28-selection bridge

The structural side is already strong:

```text
K=4
-> unique singleton-transversal / safe-entry / maximum-impact center
-> W=7
-> existing core-balance relation
-> H=6
-> structural core Y=28
```

What remains before relating this to strong-play `28` is semantic selection:

1. center-opening positive progress / sufficiency under adversarial response;
2. delay-preservation / phase-selection through the relevant late structure;
3. only then a theorem connecting the structural 28 object to the independently observed strong-distance terminal-support 28.

Do not use equality of cardinalities as the bridge.

## Broader composition seam still open

Canonical `C4-R0043` remains load-bearing: direct line-product BSFP needs a realizability-preserving predecessor/composition law. The newer pinned-NAE/lossless-join/history/strategy-dependency results refine that missing law but do not yet supply a compact owner-free recurrence.

A plausible layered target is:

```text
support / geometry
-> pinned-NAE ownership-image relation
-> alternating-history realizability
-> first-win admissibility
-> observation-based controllable predecessor
   carrying response resources + deadlines + dependencies
-> terminal/proof certificate
-> game value
```

Actively falsify attempts to collapse any adjacent layers.

## Adjacent but secondary evidence

`research/bsfp-isometric-invariant-transfer` at `e8e3bb52...` established a guarded positive-certificate product homomorphism under fixed positive-monotone exact-cardinality context. It also found 2,368 failures when the capacity guard was removed and 23 cross-context completion-key collisions. Its next bounded seam is overlap/ordering with core/envelope absorption. This is relevant as a cross-project example of guarded semantic identity and compositional transport, but it should not displace the Connect4 center-positive theorem as the immediate logic objective.

`isometric` at `b112c341...` records guarded response/context-relative reuse constraints and explicitly says the full corpus audit remained incomplete. Do not turn that note into implementation authority for this research task.

## Canonical normalization debt

`research/unified-knowledge` is the canonical shared research plane, but its head predates the focused-branch C4-R0060+ work and center-reply evidence. The next executor should not blindly copy files. Normalize graph semantics deliberately:

- re-fetch `research/unified-knowledge` first;
- read `research/AGENTS.md`, `research/README.md`, `canonical/CORE_MODEL.md`, `canonical/CLAIMS.md`, and every registry shard in `canonical/CLAIM_INDEX.json`;
- compare the focused-branch claim IDs/semantics against the canonical global ID space;
- preserve stable IDs where non-conflicting and semantically identical;
- if IDs conflict because unified-knowledge evolved independently, reconcile by semantic identity rather than number preference;
- update affected human ledgers, maps, open questions, source queue and evidence in the same graph transaction;
- do not promote CI success into a deductive theorem without a derivation.

## Recommended next execution order

1. Re-fetch live heads and preserve newer work.
2. Read the latest center-reply scripts/results around `401fb8d...`, including the successful `C3/G3` matrix run.
3. Derive the structural meaning of `C3/G3`; formulate one falsifiable controllable-predecessor rule.
4. Attempt to compose that rule with the uniform `A1/B1` high-refusal response and existing low/C2 branches.
5. Search smallest counterexamples and intervention/resource/deadline failures.
6. If a coherent center-positive policy fragment results, document and commit it on the focused research branch.
7. Normalize the proven/qualified semantics into `research/unified-knowledge` as a research-graph transaction.
8. Only then continue toward delay preservation and the strong-play-28 selection bridge.

## Process discipline

For every substantial unit:

```text
assess -> research -> reassess -> formulate -> falsify -> formalize -> qualify -> review -> document -> commit
```

Use execution/oracle controls to falsify and qualify proposed structure, not to replace derivation. Preserve negative results. Commit coherent units frequently.
