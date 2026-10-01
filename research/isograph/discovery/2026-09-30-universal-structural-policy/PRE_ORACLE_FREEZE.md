# Universal structural policy — pre-oracle freeze

Date: 2026-09-30 (America/Los_Angeles)

Status: PRE_ORACLE_FROZEN_CANDIDATE

This branch exists to keep the runtime structural-policy experiment durable before any perfect-play oracle comparison.

## Anti-cheating boundary

The candidate consumes only:
- board dimensions and Connect-4 geometry;
- gravity and current occupancy;
- legal landing cells;
- mover/opponent live geometric requirements;
- support-height parity / width-path derivative;
- one-step same-column structural repair availability;
- support/turn schedulability for residual completion deadlines.

It does not consume:
- solved W/D/L values;
- best-move labels;
- opening books;
- solved terminal distances;
- recursive minimax/negamax/alpha-beta results.

Any perfect-play oracle read after this commit is validation only. If oracle evidence motivates a repair, that repair is oracle-informed and requires a fresh predeclared validation target before it can count as independent qualification.

## Merged rule

For legal action a from position P:

1. Apply a.
2. If it wins immediately, retain it at the terminal maximum.
3. Compute the support phase word phi=h mod 2 and derivative d_i=phi_i XOR phi_(i+1).
4. Structural phase closure:
   - SAFE if d contains no 000 or 111 factor;
   - REPAIRABLE if one additional same-column event is legal and makes the derivative SAFE;
   - TRAPPED otherwise.
   If at least one SAFE/REPAIRABLE move exists, discard TRAPPED candidates.
5. On retained moves compute:
   A(P,a) = live mover winning requirements containing the landing event;
   B(P,a) = live opponent winning requirements killed by the landing event.
   Keep Pareto maxima in (A,B), with no fitted scalar weights.
6. If a genuine non-symmetric Pareto tie remains, compare support/turn-schedulable residual deadlines. Prefer larger opponent-earliest minus mover-earliest margin, then earlier mover completion.
7. Reflection-equivalent ties are admitted as one structural action orbit.

The move-6 refinement is not a special case: the same phase closure that permits early center moves via remaining same-column repair rejects the sixth top-center event because the center column becomes full and the repair edge disappears.

## Local pre-oracle artifacts

The immediately preceding local prototypes were frozen by digest before oracle access:

- v1 script: 56d7649fba719b08e897cf7b62eda472538aa113ab235b813d70221186d506ab
- v1 output: 734a21f30dc3bc5a2e4ce2ea73217f8afbd819dda5e90e6bb2a7a0520ad48fa8
- v2 script: 4c6d28ea6e10a6cd004b9498a430c63ab5982612efe8f8f977f4a73393d2f8ab
- v2 output: 8b71a1a0c0df8a0527808447c0ba1540a031766f097f5f067615ef9a2c7ed980

The v2 pre-oracle run generated canonical representative sequence:

`44444333333661`

and stopped at ply 15 on a non-reflection tie between columns 1 and 6.

No perfect-play value was consulted to obtain that result.
