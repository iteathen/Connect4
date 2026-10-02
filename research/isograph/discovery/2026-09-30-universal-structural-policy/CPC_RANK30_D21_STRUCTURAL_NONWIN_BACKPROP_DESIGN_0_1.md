# CPC rank-30 d21 structural nonwin back-propagation design 0.1

**Date:** 2026-10-01  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Propagate the newly qualified q966 P0-nonwin certificate one exact predecessor
layer backward to the rank-30 state:

- exact q: `d21a89605c399aca`;
- sequence: `444441566666232222425511515311`;
- rank: 30;
- support: `[6,6,2,6,5,5,0]`;
- mover: P0.

This state is the frozen leaf
`SECOND_D1_C5_CONTRACTION:A->A`.

## Frozen premises

From
`CPC_RANK20_RANK32_FORCED_OBLIGATION_LOSS_CENSUS_0_1.json`:

- legal root actions E/F/G are eliminated;
- each has an exact P1:c3 reply into a rank-32 state with a qualified
  forced-obligation P0-loss certificate;
- C was the sole surviving root action.

From
`CPC_RANK30_D1_A_BIDIRECTIONAL_PROOF_LIBRARY_CLOSURE_0_1.json`:

- after P0:C, P1:c7 reaches exact q `966e6353e06e4d41`;
- C was unresolved only because q966 was previously unknown.

From
`CPC_Q966_NONWIN_PROPAGATION_SURVIVING_G_AUDIT_0_1.json`:

- exact q966 is now structurally `P0_NONWIN`;
- its sound global interval is `[-1,0]`.

## Frozen derivation

Use the exact P0 predecessor interval rule.

Root action intervals:

- C: P1 has a legal c7 reply into q966 `[-1,0]`, therefore
  `U(C) <= 0`;
- E: exact P1 reply into a P0-loss child, therefore `[-1,-1]`;
- F: exact P1 reply into a P0-loss child, therefore `[-1,-1]`;
- G: exact P1 reply into a P0-loss child, therefore `[-1,-1]`.

Thus every legal P0 action has upper bound at most draw:

```
U(q) = max_a U(a) <= 0.
```

No lower-bound proof is added. The state is therefore:

```
P0_NONWIN
[-1,0].
```

## Verification

The executable audit must independently:

1. reconstruct exact q from the sequence;
2. verify the legal P0 action set is C/E/F/G;
3. verify the frozen rank-32 loss witnesses for E/F/G by exact q identity;
4. verify P0:C followed by P1:c7 reaches exact q966;
5. consume q966 only after exact q equality;
6. apply the interval predecessor algebra;
7. preserve the result as one-sided nonwin, not loss or draw.

## Boundary

No oracle, solved W/D/L, minimax, unrestricted game-tree value search,
opening book, best-move table or BSFP solved frontier is used.

Production CPC, JSMinSys and BSFP remain unchanged.
