# CPC Bx viability / finite-reservoir theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact local composition candidate  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Compress the already-qualified three-column phase-transfer win into a well-founded structural proof using the formula-inspired exchange coordinate discovered by the bidirectional bridge pilot.

This theorem does **not** add a new scalar evaluator.

It composes two independently frozen exact evidence objects:

- `CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json`
- `CPC_FORMULA_EXCHANGE_PHASE_BRIDGE_PILOT_0_1.json`

## Bridge coordinate

For the local channels c3, c5, c7, the bridge pilot defines

[
Bx = Bcdot x
]

where:

- (B) means at least one active minimal residual-cell occurrence touches the current gravity frontier;
- (x) is the GF(2) parity of pair edges whose remaining-capacity imbalance and owner-merged positive-depth residual imbalance have opposite signs.

The exact pilot found on every defender transition in the qualified phase machine:

[
oxed{mathrm{EXPOSE}=Delta(Bx)}
]

with zero mismatches.

Equivalently in this finite family:

- post-trigger (Bx=0) iff the move is an exact exposure edge;
- post-trigger (Bx=1) iff the move is a phase-transfer edge.

## Viability set

Let

[
S={Q:;Bx(Q)=1}
]

restricted to the exact reachable Player-2 states of the already-qualified phase machine.

Define the c7 phase-reservoir rank

[
R(Q)=6-h_7.
]

(R) is a nonnegative integer.

## Candidate theorem

For every exact Player-2 state (Qin S) in the qualified family and every legal Player-2 move (m):

### Exposure case

If

[
Bx(Q)oplus Bx(Qcdot m)=1,
]

then the already-qualified CPC response is an exact immediate Player-1 first win.

### Transfer case

If

[
Bx(Q)oplus Bx(Qcdot m)=0,
]

then the already-qualified CPC response is legal and nonterminal, reaches another exact Player-2 state (Q'in S), and

[
R(Q')<R(Q).
]

### Terminal rank

If (R(Q)=0), no transfer edge exists. Every legal Player-2 move is an exposure edge.

Therefore, by well-founded induction on (R), every exact Player-2 state in (S) is a Player-1 win, including the rank-31 root.

## BSFP connection

This is the forward/current-state analogue of a BSFP viability / controllable-predecessor argument:

- (S) is a structurally defined viability region;
- exposure edges leave (S) into an exact terminal attractor;
- transfer responses preserve (S) while strictly decreasing a well-founded rank;
- the (R=0) boundary contains no safe continuation.

No BSFP solved W/D/L frontier is consumed. Only the fixed-point/viability proof pattern is reused and reproved from current-state RBA facts.

## Formula connection

This gives one concrete game-semantic role to a previously structural formula coordinate:

[
Bx quadleftrightarrowquad 	ext{phase viability under local obligation exchange}
]

for this exact family.

This is especially interesting because the old fixed-owner scalar experiment found `By` to carry its tested high scalar character while `Bx` remained structurally real. The present theorem tests the possibility that different members of the 3D formula quotient carry different semantic roles:

- value-like character;
- phase/transition viability;
- mixed attachment/coupling.

No universal decomposition is claimed yet.

## Falsifiers

Reject the theorem if any reachable Player-2 state shows:

- (Bx
e1);
- an exposure edge with (Delta Bx
e1);
- a transfer edge with (Delta Bx
e0);
- an exposure response that is not an exact Player-1 terminal;
- a transfer response that is terminal;
- a transfer child with (Bx
e1);
- a transfer child with (R(Q')ge R(Q));
- any transfer edge at (R=0).

## Scope

Qualification establishes only a compressed proof of the already-qualified rank-31 family.

It does not yet generalize `Bx` to arbitrary Connect Four states, alter production CPC, unseal formula holdouts, prove rank 10, authorize v5, or solve Connect Four.
