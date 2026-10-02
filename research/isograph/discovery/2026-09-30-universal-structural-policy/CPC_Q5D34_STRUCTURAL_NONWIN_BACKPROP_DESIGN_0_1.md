# CPC q5d34 structural nonwin back-propagation design 0.1

**Date:** 2026-10-01  
**Branch:** `research/universal-structural-policy-20260930`  
**Recovered head before design:** `e00c41b12e4ae725482f09b728b1383477bb988d`

## Purpose

Propagate the newly qualified 3+1 deferred-singleton tail nonwin theorem
backward through the exact q5d34 obstruction using the already-established
choice-elimination / interval-predecessor calculus.

This experiment does not attempt to prove q5d34 loss or draw. Its target is
the one-sided statement:

```
P0 cannot force a win from q5d34.
```

Equivalently, in the P0-global W/D/L interval lattice:

```
q5d34 <= [-1,0].
```

## Exact root

- exact q: `5d34e24395b9d801`
- sequence locator: `4444415666662322224255115153113777`
- rank: 34
- support: `[6,6,3,6,5,5,3]`
- mover: P0
- legal columns: C/E/F/G
- terminal-safe P0 columns: E/F/G

The C action is already structurally unsafe: after P0:C4, P1 has immediate
terminal C5.

## Qualified / frozen premises

### Root E and F actions

`CPC_Q5D34_EF_NONWIN_CONVERGENCE_0_1.json` established:

- q5d:E6 cannot force a P0 win;
- q5d:F6 cannot force a P0 win.

Both use exact semantic-q convergence and the already-certified q649 draw
handoff. They are one-sided nonwin facts, not solved-value imports.

### Root G action

After P0:G4, the exact P1 replies E6 and F6 reach:

- `f435a6ec7dd5469e`;
- `6c9a60f756817109`.

`CPC_Q5D34_G4_EF_REPLY_G5_SURVIVOR_0_1.json` records the remaining P0
actions in those states.

For q `f435a6ec7dd5469e`:

- C4 is eliminated by immediate P1 terminal exposure;
- F6 reaches exact q649 and is P0-nonwinning;
- G5 reaches rank-37 q `5992c0c8965586f2`.

For q `6c9a60f756817109`:

- C4 is eliminated by immediate P1 terminal exposure;
- E6 reaches exact q649 and is P0-nonwinning;
- G5 reaches rank-37 q `7cac0ef80f3901f7`.

### Qualified rank-38 nonwin theorem

`CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_NONWIN_THEOREM.md`, qualified by
`CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_QUALIFICATION_0_1.json`, gives
P0-nonwin interval `[-1,0]` to:

- q `4f5444dc55bb5371`;
- q `60fba7c1d1c84a97`;
- q `e7eb0902f1f7984c`.

The rank-37 survivor q `5992...` has P1 replies into q `60f...` and
q `e7eb...`.

The rank-37 survivor q `7cac...` has P1 replies into q `4f...` and
q `e7eb...`.

Therefore each rank-37 P1 state has at least one legal reply into an exact
P0-nonwin child.

## Frozen derivation

Use only monotone interval predecessor rules.

### P1 predecessor rule

If P1 has any legal child with P0 upper bound `U <= 0`, then:

```
U(parent) = min_a U(child_a) <= 0.
```

Therefore both rank-37 G5 survivor states are P0-nonwinning.

### P0 predecessor rule

If every legal P0 action has child upper bound `U <= 0`, then:

```
U(parent) = max_a U(child_a) <= 0.
```

Therefore both exact rank-36 G5-predecessor states are P0-nonwinning because
all of their legal P0 actions are covered by:

- immediate P1 terminal exposure;
- exact q649 draw handoff;
- G5 -> rank-37 P0-nonwin handoff.

### q5d:G4

After P0:G4, P1 may choose E6 or F6 into an exact rank-36 P0-nonwin state.

Therefore q5d:G4 cannot force a P0 win.

### q5d root

Every legal root action is P0-nonwinning:

- C4 -> immediate P1 terminal response C5;
- E6 -> qualified P0-nonwin;
- F6 -> qualified P0-nonwin;
- G4 -> P1 has a reply into a qualified P0-nonwin state.

Hence:

```
q5d34 -> [-1,0].
```

## Verification requirements

The executable audit must:

1. reconstruct q5d34 exact identity from the frozen sequence;
2. verify the exact root legal/action-safety table;
3. verify the exact q identities of the G4 E/F reply states;
4. verify the exact rank-36 action partitions;
5. verify the rank-37 survivor exact q identities;
6. verify the qualified 3+1 theorem covers at least one P1 reply of each
   rank-37 survivor;
7. compute every predecessor interval explicitly;
8. reject any support-only handoff;
9. preserve q5d34 as one-sided `P0_NONWIN`, not silently upgrade it to loss
   or draw.

## Boundaries

- No oracle, solved W/D/L table, minimax, unrestricted ordinary game-tree
  search, opening book, best-move table or BSFP solved frontier.
- Exact q equality is required for every handoff.
- Production CPC, JSMinSys and BSFP remain unchanged.
- The result may be consumed by later predecessor/choice-elimination routing
  as a sound `[-1,0]` certificate.
