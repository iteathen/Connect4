# Oracle-blind 44 continuation-support experiment

Date: 2026-09-28

## Question

Can the next move after one-based prefix `44` be selected from board geometry
and game rules without any solved position value, best-move label, opening book,
or perfect-play map?

## Firewall

This branch starts from pre-experiment research commit `1c96bf6d667136774815a0b666b5c1df639794d9`.
The executable is self-contained and consumes only:

- 7 columns;
- 6 rows;
- Connect-4 length 4;
- gravity;
- alternating ownership;
- prefix `44`;
- mechanically generated winning-line incidence.

It imports no oracle, solved-action corpus, opening book, or WDL result.

The solved reference is not to be read while deriving the rule.

## First pass

1. quotient seven legal P0 moves after `44` by reflection;
2. construct exact P0/P1 live winning-line residual families;
3. measure residual literal support directly from those formulas;
4. take every one-ply P1 reply without evaluating WDL;
5. test a conservative residual-relaxation order;
6. if center emerges, classify it only as a structural lead unless a theorem
   connects that relaxation order to adversarial perfect-play continuation
   dominance.

The intended output is allowed to fail. A failure is a DP/DTS discrepancy lead,
not permission to consult the oracle.
