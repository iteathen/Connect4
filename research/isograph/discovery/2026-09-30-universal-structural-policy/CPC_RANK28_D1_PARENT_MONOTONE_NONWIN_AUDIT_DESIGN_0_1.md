# CPC rank-28 D1 parent monotone nonwin audit design 0.1

**Date:** 2026-10-01  
**Status:** frozen exact propagation/classification design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Target

Frozen state `SECOND_D1_C5_CONTRACTION`:

- sequence `4444415666662322224255115153`;
- rank 28;
- support `[4,6,2,6,5,5,0]`;
- P0 to move;
- target residual G3 at support distance 2.

The exact semantic-q class must be reconstructed and recorded before any
classification.

## Qualified inherited action bounds

From the frozen first-failure and forced-obligation evidence:

- P0:G followed by P1:A reaches q `622683928b72c4be`, exact P0 loss;
- P0:A followed by P1:A reaches q `d21a89605c399aca`, now qualified
  P0-nonwinning by `CPC_RANK30_D21_STRUCTURAL_NONWIN_BACKPROP_0_1.json`;
- P0:E followed by P1:A reaches q `00788378b8ae8d01`, exact P0 loss;
- P0:F followed by P1:A reaches q `8b007f7dfd990ea6`, exact P0 loss.

Therefore A/E/F/G already have sound upper bounds <= 0.

The only legal root action not yet bounded this way is C.

## C-action child audit

After exact P0:C, enumerate every legal P1 defender reply and reconstruct each
rank-30 child by complete semantic q.

For every unique child, query in this order without modifying theorem
semantics:

1. exact P0-loss handoff from the qualified forced-obligation loss census;
2. exact P0-nonwin handoff from qualified interval-backprop evidence;
3. immediate P0 terminal;
4. exact qualified positive-q handoff;
5. bounded rank-1 / rank-3 forced-completion grammar;
6. adaptive repair-capacity induction;
7. shared legacy-target adapter:
   - LAMBDA;
   - THETA;
   - distance-2 target-support re-entry;
   - distance-1 resolved-tail capacity;
8. generic target-reservoir / CPC-forced contraction RCIC routes;
9. unchanged forced-obligation loss classifier.

Disposition per child:

- `P0_WIN` if a qualified positive certificate accepts;
- `P0_LOSS` if an exact loss certificate accepts;
- `P0_NONWIN` if an exact qualified one-sided nonwin handoff matches;
- `UNKNOWN` otherwise.

A positive/nonwin or positive/loss collision is a hard falsifier.

## C action and parent composition

For P0:C:

- any P1 reply classified P0_LOSS -> `P0_ACTION_LOSS_REPLY`;
- else any P1 reply classified P0_NONWIN -> `P0_ACTION_NONWIN_REPLY`;
- else if every reply is P0_WIN -> `P0_ACTION_WIN_ALL_REPLIES`;
- otherwise `P0_ACTION_UNKNOWN`.

For the rank-28 parent:

- if C is nonwinning/loss, every legal P0 action has U<=0 and the parent is
  `P0_NONWIN [-1,0]`;
- if C is constructively winning, the parent is P0-winning;
- otherwise the parent remains unknown and the first exact unknown C child is
  the next obstruction.

## Exact identity and monotonicity

No child may be merged by support alone. Equal q requires support plus
normalized P0/P1 residual antichains.

Before an unknown child is called a new obstruction, the complete currently
routable certificate catalog above must have been queried with logical
rejection separated from resource failure.

## Boundary

No oracle, solved W/D/L, minimax, unrestricted free-branch value search,
opening book, best-move table, BSFP solved frontier, or sealed holdout.

Production CPC, JSMinSys, legacy proof semantics, RCIC semantics and BSFP are
unchanged.
