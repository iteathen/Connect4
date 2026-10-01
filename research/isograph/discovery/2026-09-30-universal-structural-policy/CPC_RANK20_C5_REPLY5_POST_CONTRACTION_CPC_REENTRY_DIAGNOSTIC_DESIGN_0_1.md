# CPC rank-20 c5/reply-c5 post-contraction CPC re-entry diagnostic 0.1

**Date:** 2026-10-01  
**Status:** frozen bounded diagnostic before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source evidence

Consume:

- `CPC_RANK20_C5_REPLY5_DUAL_PAIR_CHOICE_ELIMINATION_PROBE_0_1.json`.

Use pinned JSMinSys authority and reconstruct every source state from exact move cofactors.

## Purpose

The best c1-first dual-pair route repeatedly contracts a Player-1 aligned pair to a Player-1-owned singleton, with no playable Player-2 singleton, but the static target-reservoir RCIC has no valid template.

Before proposing any new certificate, test whether production CPC supplies a forced transition from those exact rejected contraction states.

This is a diagnostic of existing machinery only.

## Frozen rejected contraction states

Reconstruct every `target-reservoir-rejected` state under the c1-first orientation:

1. first defender c3, then P1 consumes c1r3 -> singleton c3r5;
2. first defender c1, second setup c5, then second defender c1/c3/c6/c7 and P1 consumes c5r5 -> singleton c7r3.

Do not include the double-taken c5/c5 branch because no singleton contraction occurred.

## Checks per state

Require:

- exact rank/support from replay;
- active Player-1 singleton target;
- CPC projected owner = Player 1;
- no currently playable Player-2 singleton;
- existing target-reservoir synthesis returns no template.

Then evaluate production CPC in baseline and frontier-response modes.

Record:

- CPC kind/interval/forced column in both modes;
- whether both modes agree on one `CPC_RESTRICT` column;
- all legal Player-2 replies by exact cofactor;
- any Player-2 first terminal;
- for each nonterminal reply, immediate Player-1 terminal columns;
- for the agreed forced reply, exact support/rank, active/minimal residuals, aligned P1 pairs, and exact qualified theorem-root match.

## Positive signal

A rejected contraction state is **CPC-reentry promising** if:

- baseline/frontier agree on one forced column;
- no defender reply is a Player-2 first terminal;
- every off-forced reply exposes an immediate exact Player-1 terminal.

This does not yet certify the forced child. It only proves the rejected static RCIC can be compressed to one exact continuation state.

## Negative signal

Preserve states where:

- CPC is NONE/BOUND/EXACT rather than one-column restriction;
- baseline/frontier disagree;
- an off-forced reply is not immediately closed;
- or a defender first terminal exists.

## Boundedness

No recursive search and no new RCIC synthesis after the CPC step.

The probe stops at the forced child profile.

## Boundary

No oracle, Pons score, solved W/D/L, minimax, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.

This is discovery evidence only.
