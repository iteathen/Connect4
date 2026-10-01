# RLC ranked controlled-invariant instantiation audit design 0.1

**Date:** 2026-10-01  
**Status:** frozen before execution  
**Branch:** \`research/universal-structural-policy-20260930\`  
**Superclass:** \`RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md\`

## Purpose

Audit recent qualified RLC mechanisms against the new generic hierarchy without changing any underlying theorem or production code.

The audit must classify each source as exactly one of:

- **CIC** — controlled-invariant safety certificate;
- **RCIC** — controlled invariant plus explicit well-founded progress proving eventual success;
- **PROGRESS_EDGE** — a qualified decreasing/handoff macro that is not by itself a complete win certificate;
- **NONCONFORMING** — one or more generic obligations are absent.

## Frozen sources

Consume only these already-qualified artifacts:

1. \`CPC_CURRENT_STATE_GUARD_SET_D15_0_1.json\`
2. \`CPC_GUARD_SET_FRESH_STRUCTURAL_0_1.json\`
3. \`CPC_TRIGGER5_FORCED_COMPRESSION_0_1.json\`
4. \`CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_0_1.json\`
5. \`CPC_BX_VIABILITY_FINITE_RESERVOIR_0_1.json\`
6. \`CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json\`

No diagnostic W/D/L file may be loaded.

## Audit dimensions

For every mechanism record:

- current-state resource representation;
- live obligation representation;
- response totality evidence;
- safety/coverage evidence;
- exact re-entry or handoff evidence;
- explicit progress measure, if any;
- strict-decrease evidence, if any;
- terminal-success evidence;
- source theorem acceptance;
- oracle/solved-input flags;
- production mutation boundary.

## Expected classifications to test, not assume

### Guard set

Candidate classification: **CIC**.

Required evidence:

- D15 root accepted constructively;
- all seven attacker triggers have licensed responses;
- every child re-enters \`GUARDSET_D13\`;
- guards are reconstructed after each child;
- independent fresh structural corpus confirms exact guard reconstruction/update;
- no win-progress rank is asserted.

### Forced compression

Candidate classification: **PROGRESS_EDGE**.

Required evidence:

- source accepted;
- direct c5 reply closes by immediate Player-1 win;
- every off-column reply is forced back through c5 by production CPC and literal exact reply enumeration;
- attached residual contracts from two cells to an active singleton;
- no standalone downstream win is claimed by the compression artifact itself.

Progress measure:

\[
\mu_{\text{obligation}}=|R|
\]

with the nonterminal branch satisfying \(2\to1\).

### Target-reservoir pairing

Candidate classification: **RCIC**.

Required evidence for every qualified row:

- active Player-1 singleton target;
- no playable Player-2 singleton;
- complete residual coverage;
- target assigned as Player-1 response;
- finite truncated reservoir;
- exact validation passes with no failure;
- every row accepted.

Progress measure:

\[
\mu_{\text{reservoir}}=\text{remaining relevant paired events}
\]

decreases by one trigger/response pair until a Player-1 terminal.

### Bx viability / phase transfer

Candidate classification: **RCIC**.

Required evidence:

- source accepted;
- every qualified Player-2 state satisfies \(Bx=1\);
- every EXPOSE edge gives exact Player-1 terminal;
- every TRANSFER edge returns to \(Bx=1\);
- c7 capacity strictly decreases on every TRANSFER;
- induction reaches all states from reservoir-zero sinks upward.

Progress measure:

\[
\mu_{\text{phase}}=\text{remaining c7 capacity}.
\]

### Finite phase-transfer machine

Candidate classification: **RCIC_REALIZATION** subordinate to the Bx RCIC rather than a new top-level species.

Required evidence:

- every frozen policy branch accepted;
- every transfer is legal/nonterminal;
- every terminal edge is exact Player-1 first win;
- sink equality is proved exactly, not inferred from support.

## Merger test

The audit succeeds only if:

- guard-set qualifies as safety-only CIC;
- forced compression qualifies as a progress edge but not a standalone RCIC;
- target-reservoir and Bx/phase qualify as RCICs;
- the finite phase-transfer machine is representable as a concrete state-machine realization of the same Bx RCIC;
- no source requires solved W/D/L or ordinary game-tree value as a theorem premise.

## Boundary

This audit changes theorem taxonomy only. It proves no new Connect Four state.

It must not modify production CPC, JSMinSys, or BSFP.
