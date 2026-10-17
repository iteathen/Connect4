# Independent direct-physical finite-horizon interval falsifier (0.1)

Date 2026-10-16, owner `research/semantic-quotient`.
Prior candidate intervals are computed by source-q anchored four-threshold
support-cone BDD, NOT by game-tree search; source q residuals are qualified.

## Why

At canonical standard7x6 rank18 prefix `432146363423573176`, the
symbolic WDL interval converged at depth **two**, giving P0 WIN with
only column5 optimal, using 35 supports. The independent **FULL** q
solver used strictly as a reference exhausted its fixed 800,000-move
budget with 179,397 q states and cannot confirm this deeper claim
within that envelope. Yet a **depth-two physical** falsifier is
feasible and directly checks the mathematical horizon certificate
without searching to full completion.

## Frozen independent control

Use an independently authored physical game evaluator based on legal
gravity and contiguous Connect-K line counting, NOT residual
antichains or source BDD formulas. On a given source physical state s
and integer remaining horizon k:

- base k=0, if s remains nonterminal, return absolute WDL interval
  [-1,+1] (no invented terminal);
- on terminal action, return exact value (+1 P0, -1 P1, draw 0),
  checked before descending;
- otherwise compute every child's bounded interval recursively,
  P0 maximizes lower and upper separately, P1 minimizes both,
  retaining **all literal first-action lower/upper intervals**.
- This enumerated physical AND/OR validation is NOT the candidate
  solver; it may check a fixed small horizon but supplies **no**
  winning-policy or solved-value input to the symbolic source-q
  constructor.

Controls predeclared: rank18 k=2 and rank20 k=4 of the frozen
`43214636342357317661423762461717147` history; also empty 4x3
Connect3 k=1,3,5 and legal 4x3 prefix `223` k=2,3.
If newly derived rank16/rank14/root `44444` source intervals close
at k<=4, they may be added only as **post hoc falsifiers**, explicitly
labelled separate from the frozen primary controls.

Hard independent physical limits: <=300,000 move transitions,
<=200,000 visited `(position,depth)` states and <=30 seconds per
source/horizon. On exhaustion mark PARTIAL. For each case compare
absolute root lower/upper and every literal action lower/upper, not
only the selected optimal move. Reject incorrect terminal ordering,
false bound tightening or label parity. Preserve exact rank, source
history, horizon, checked physical move count and first mismatch.

This directly validates the finite-horizon interval semantics;
it does not promote finite-sample correctness to a global polynomial
arbitrary-depth theorem, nor demote the exact recursive q core.
