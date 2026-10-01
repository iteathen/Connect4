# CPC rank-20 c5/reply-c5 target-reservoir rejection localization 0.1

**Date:** 2026-10-01  
**Status:** frozen structural diagnostic before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume the five exact target-reservoir-rejected singleton contraction states from:

`CPC_RANK20_C5_REPLY5_POST_CONTRACTION_CPC_REENTRY_DIAGNOSTIC_0_1.json`.

Reconstruct each state independently at pinned JSMinSys authority.

## Purpose

The existing target-reservoir synthesizer is all-or-nothing: it returns no template when any active Player-2 residual lacks a coverage witness.

Do not infer a new response rule from that rejection.

Instead enumerate the complete finite pairing/prefix search already used by the synthesizer and preserve its best partial covers.

## Exact enumeration

For each rejected state:

1. require the active P1 singleton target and P1 CPC target ownership;
2. require no currently playable P2 singleton;
3. reconstruct the same target-truncated capacities and odd-column set;
4. enumerate every perfect pairing of odd columns;
5. enumerate every allowed odd synchronized prefix length exactly as the current target-reservoir search does;
6. discard candidates for which the target is not a response event;
7. for every remaining candidate, run the existing `coverageWitness` predicate on every active P2 residual.

Record:

- total pairing/prefix candidates;
- target-response-valid candidates;
- maximum defender residuals covered;
- minimum uncovered count;
- every inclusion-distinct uncovered residual set among maximum-coverage candidates;
- exact residual geometry/attachment for each uncovered residual;
- whether each uncovered residual is currently minimal;
- witness-kind histogram for the covered residuals;
- pairing/prefix structure of every maximum-coverage candidate, subject to deduplication by exact pairing/prefix signature.

No candidate is selected using W/D/L or theorem success.

## Recurrence census

Across the five states, group uncovered residuals by exact attached cell set, not diagnostic ID alone.

Report:

- recurrence count;
- source states;
- residual sizes;
- whether the same obstruction appears under multiple supports/ranks.

## Success signal

A useful localization result is a small recurring uncovered set—especially one residual geometry recurring across multiple rejected states.

That becomes a candidate for an independently qualified blocker/response theorem.

## Negative signal

If failures are diffuse with large unrelated uncovered sets, target-reservoir rejection is not localized enough to justify a new blocker route.

## Boundary

No oracle, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.

Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.

This is discovery evidence only.
