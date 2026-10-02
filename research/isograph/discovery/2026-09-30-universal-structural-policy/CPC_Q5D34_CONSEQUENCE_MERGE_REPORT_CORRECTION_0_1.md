# CPC q5d34 consequence merge-report completeness correction 0.1

**Date:** 2026-10-01  
**Status:** frozen reporting-completeness correction before rerun  
**Branch:** `research/universal-structural-policy-20260930`  
**Source design:** `CPC_Q5D34_THREE_SAFE_ACTION_CONSEQUENCE_CLOSURE_DESIGN_0_1.md`  
**Source result:** `CPC_Q5D34_THREE_SAFE_ACTION_CONSEQUENCE_CLOSURE_0_1.json`

## Trigger

The frozen design requires exact semantic-q merging between different E/F/G physical histories to be reported whenever it occurs.

The first implementation built `exactQMergeGroups` only from states actually visited as forced-chain steps.

It did **not** include the already-computed exact one-ply consequence q values stored in each step's `actionAudit[].childQ`.

That omission hides a real exact convergence already present in the frozen result:

- E6 -> P1:F6 -> q `e5d63da12420fdb3`;
- F6 -> P1:E6 -> q `e5d63da12420fdb3`.

Both paths are exact semantic-q identities, not support-only matches.

## Correction

Recompute only the merge-report layer.

For every root action E/F/G include:

1. each visited forced-chain step q;
2. every nonterminal `actionAudit.childQ` generated from that step;
3. the exact physical sequence and originating root action for each member.

Group by exact q and report:

- member count;
- distinct root-action count;
- whether the group crosses different root actions;
- member provenance.

Require the E/F cross-reply q `e5d63da12420fdb3` to appear as a cross-root merge with two distinct root actions.

## Boundary

No state transition changes.

No forced-safety classification changes.

No W/D/L, oracle, minimax, search, threshold, or new certificate is introduced.

Production CPC, JSMinSys, legacy repair semantics, RCIC semantics, forced-loss semantics, and BSFP remain unchanged.
