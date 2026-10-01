# v4 fresh falsifier — response-profile compression

Date: 2026-09-30

## Live branch

`research/universal-structural-policy-20260930`

Observed v4 validation head before this note:
`9c4cef1b982827a1fbe9e9a031c9281381ee7f14`

## Fresh v4 falsifier

Prefix before ply 10:

`444441566`

v4 structural selection:

`{2,3}`

Pascal Pons full exact vector:

`[-3,-2,-2,-2,-3,-1,-4]`

Project-acceptable move set under the current convention:

`{6}`

All legal moves lose. Column 6 alone has the least-negative strong score, so it alone maximizes loss delay.

This position is now consumed oracle-informed training evidence for any v5 repair.

## Structural diagnosis

v4 ordering is:

1. phase closure;
2. universal phase-response certificate, when any candidate has it;
3. earliest residual deadline race;
4. deadline-response overload only when the selected race is temporally behind;
5. local landing-cell Pareto impact.

At this falsifier no candidate has the universal phase-response certificate.

The earliest-race scalar favors columns 2 and 3:

- move 2: mover earliest 4, opponent earliest 5, margin +1;
- move 3: mover earliest 4, opponent earliest 5, margin +1;
- move 6: mover earliest 4, opponent earliest 3, margin -1.

v4 therefore eliminates move 6 before response-capacity structure is allowed to matter.

However the opponent deadline-response structure at the first overloaded horizon tells a different story.

By deadline 5:

- move 2:
  - minimum blocker/transversal size tau = 3;
  - available defender response capacity = 2;
  - deficit = 1;
  - opponent residual requirements due by the deadline = 7;
  - minimum tau-size blocker sets observed = 9.

- move 3:
  - tau = 4;
  - capacity = 2;
  - deficit = 2;
  - due residual requirements = 12;
  - minimum tau-size blocker sets observed = 9.

- move 6:
  - tau = 3;
  - capacity = 2;
  - deficit = 1;
  - due residual requirements = 4;
  - minimum tau-size blocker sets observed = 12.

Thus move 6 has a nominally worse *earliest scalar race* but a materially lighter and more flexible early opponent response burden.

## Current clue

The failure is not evidence for another move-specific exception.

It says the response object is still being compressed too aggressively.

A v5 candidate should test a full deadline-response profile before allowing the single earliest-race scalar to eliminate candidates. The natural profile contains, at each deadline t:

- tau(t): minimum blocker/transversal size;
- response capacity C(t);
- overload deficit max(0, tau(t)-C(t));
- number of opponent residual requirements due by t;
- response-flexibility information such as the number/structure of minimum blocker sets.

Do not promote a particular v5 ordering until it is checked for regressions against already-consumed training positions and then frozen before fresh oracle validation.

No oracle score is consumed by the runtime structural operators themselves.
