# CPCX Protected-Residual Forced Normalization 0.1

**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Observation:** deterministic forced-response closure relative to one pinned live residual

## Purpose

Compose the already-qualified exact forced-response closure with protected residual cofactor/support transport.

The current universal-diagonal automaton repeatedly reaches positions where the controller has exactly one forced response before any support-progress theorem may run. `SOURCE_IMMEDIATE_PRECEDENCE` is therefore not itself a strategic failure.

This theorem packages such deterministic normalization as one typed transition. It does not add a free reply layer and does not choose among legal moves.

## Objects

Let S be an exact nonterminal CPCX position.

Let:

- A be the owner of one pinned live residual R;
- D=A^1;
- R be pinned by exact player/line ancestry;
- current immediate classification of S be exactly `FORCED_RESPONSE`.

The mover at S need not equal A in the general statement.

## Premises

1. **Exact nonterminal source.** S is exact and nonterminal.
2. **Pinned live residual.** R is live at S with exact player, line ID and missing-cell set.
3. **Deterministic source boundary.** Current immediate classification is exactly one `FORCED_RESPONSE`.
4. **Exact deterministic closure.** Repeatedly apply only the already-qualified unique forced response until the first non-forced boundary.
5. **First-win stopping.** If any forced event is terminal, terminal for A may emit `CERTIFIED_FIRST_WIN(A)`; terminal for D rejects protected normalization.
6. **Protected-event classification.** For every nonterminal forced event: outside the current protected missing set, use the exact protected-residual support-transition theorem; on a protected target owned by A, exact cofactor algebra must contract the pinned line; on a protected target owned by D, reject with `OPPONENT_KILLS_PROTECTED_RESIDUAL`.
7. **Ancestry preservation.** After every allowed nonterminal step, the same physical line remains live for A, possibly at lower missing cardinality.
8. **Open-boundary requirement.** If deterministic closure does not end in an open nonterminal state or an A first win, fail closed.

## Conclusion

On a nonterminal open boundary emit `PROTECTED_RESIDUAL_FORCED_NORMALIZATION` containing:

- exact deterministic event script;
- per-step classification: `SUPPORT_STUTTER`, `SUPPORT_ADVANCE`, or `RESIDUAL_CONTRACTION`;
- same protected line ancestry;
- exact final missing-cell set;
- exact final support vector/debt;
- no opponent terminal during the macro;
- positive physical rank delta.

The protected residual support debt is nonincreasing across the macro. Residual cardinality is nonincreasing.

At least one of rank or the stronger residual measures progresses because the macro consumes one or more physical events.

## What this theorem does not prove

It does not prove that the open successor is winning, that an opponent-to-move successor is safe against every current event, that repeated normalization alone terminates in a controller win, that a killed residual may be replaced by another line, or any W/D/L/best-move claim.

## Complexity

The ordinary exact forced closure has at most the remaining board-capacity steps. For residual cardinality K<=4, each protected transition/cofactor audit is polynomial in live-line incidence. No branching occurs.

## Required qualification controls

Qualification must include:

1. a fresh one-step external support stutter;
2. a fresh support-advance forced response;
3. a fresh controller contraction forced response;
4. a multi-step deterministic forced chain;
5. rejection if a forced opponent event occupies a protected target;
6. rejection/first-win stopping on opponent terminal;
7. production-CPC / solver / oracle / recursion isolation.

## Turn-6 use boundary

The current move-6 diagnostics contain 16 exact `SOURCE_IMMEDIATE_PRECEDENCE` seams: 13 after the B-column controller-cycle response audit and 3 at the P1-mover simplex boundary.

The successful diagnostic `run-uc4a-cpcx-simplex-forced-normalization-closure.mjs` shows all 16 close nonterminal while preserving or contracting the protected D3 diagonal carrier.

Those consumed fixtures may qualify the application after generic controls, but they are not theorem premises.

`Best(44444)` remains unproven until the resulting P1-to-move states are closed by a response-total, well-founded defect automaton.