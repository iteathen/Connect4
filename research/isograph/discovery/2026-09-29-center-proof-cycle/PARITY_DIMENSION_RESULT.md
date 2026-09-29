# Dimension/parity discovery and the shared center-boundary obligation

Research direction: Josh Oshiro. Status: descriptive external evidence plus
bounded rule-only research controls; no new promoted gameplay authority.
No production code, cache, worker profile or cycle ledger changed.

## Published board-size evidence

Source: [John Tromp's board-size outcome table](https://tromp.github.io/c4/c4.html),
retrieved 2026-09-29 UTC. The first table only is frozen in BOARD_SIZE_SOURCE.html;
URL/time/SHA-256 are in BOARD_SIZE_SOURCE.json. Width is horizontal, height is
vertical, Connect-K remains K=4. All 37 listed cells are included. These are
external outcomes, not new solves and never inputs to the geometry probe.

| Width parity | Height parity | Boards | First wins | Draws | Second wins |
|---|---|---:|---:|---:|---:|
| even | even | 11 | 0 | 4 | 7 |
| even | odd | 10 | 5 | 5 | 0 |
| odd | even | 10 | 2 | 5 | 3 |
| odd | odd | 6 | 1 | 5 | 0 |

Exploratory separation of width-4/5 boards (all drawn in the published entries):
among listed widths >=6, even/even has seven second-player wins in seven
entries; even/odd has five first-player wins and one draw in six entries.
Odd/even still contains all three outcomes (2/1/3); odd/odd has one first win
and two draws. This motivates height-parity/control interaction, not a universal
parity classifier. Coverage is incomplete, nonrandom, and neighboring boards
are dependent; no population p-value or confidence interval is justified.

Within a fixed width, changing height by two preserves parity but can change
outcome: 7x4 is drawn and 7x6 first-player winning; 6x5 is drawn and 6x7 first-player
winning. At height six, widths 5/7/9 have draw/first-win/second-win respectively.
The full same-parity contrast inventory is in BOARD_SIZE_ANALYSIS.json.

## Historical results recovered, not rediscovered

- C4-R0070/71: W=2K-1 gives the unique one-hot safe entry and unique initial
  incidence maximum; for K=4 this is width seven, not arbitrary odd width.
- The preserved safe-bulk/boundary-entry derivation gives unmatched top
  u[c]=(H-h[c]) mod 2. Height parity selects the lift of the same bulk phase.
- The 2026-09-14 strict pure-followup draw theorem already supplies a legal
  opponent draw schedule against strict same-column replies: exhaust pairs,
  then take the unmatched top last. Do not infer actual game draw from this.

Sources:
- ../../../evidence/structural-selection/2026-09-16-connect-k-transversal-centrality.md
  (canonical path: research/evidence/structural-selection/).
- research/provenance/source-archive/derivative-classification/docs-research/2026-09-14-safe-bulk-boundary-entry.md
- research/provenance/source-archive/derivative-classification/docs-research/2026-09-14-pure-followup-draw-schedule-theorem.md

## Actual 7x6 center-prefix controls

Use zero-based P0/P1 player names; action labels below are one-based.

After 4/444/44444, P1 initiates and P0 replies above. The ownership template has
no monochromatic winning line, and only the center has an unmatched top event.
That event can occur after 5/3/1 further plies respectively. All these statements
are about the restricted response policy, not arbitrary future ownership.

After 44/4444, swapping initiator/responder gives an all-zero column phase and
12 possible monochromatic horizontal lines per player in the eventual template.
Thus alternating center play changes both the controller role and the relevant
response pattern. Board-dimension parity alone cannot describe this change.

Immediately after the unmatched center-top move in an odd-stack policy, every
other column has consumed 0,2,4,6 cells. There are 4^6=4096 endpoint states.
Every endpoint was independently replayed from all three odd prefixes, with
legal support and first-win checks; their actual colored boards agree.

| Endpoint property | States |
|---|---:|
| P0 has a legal immediate win | 1987 |
| No immediate win for either player | 2108 |
| Full board, no winner | 1 |

This is a finite support-family census, not a complete game solve. The general
family size (H/2+1)^(W-1) is exponential in variable width; no polynomial-time
perfect-play claim follows.

## Stronger policy: take the win, otherwise follow up

We tested a minimal composition of live-line completion and parity control:

1. after every P1 move, P0 takes an immediate win if one is legal;
2. otherwise P0 responds above the last P1 move;
3. if that reply is unavailable and there is no immediate win, return UNKNOWN.

Every P1 choice inside this fixed P0 policy is explored. Full game minimax is
not performed. Equal support is memoized only inside this policy, where its
fixed ownership template is asserted before every memo lookup; this is not a
new production TT quotient. Each edge increases rank, and all opponent choices
are visited. No prior outcomes enter this computation.

| Start | Unique counter states | P1 choices | Immediate-win responses | Unresolved top endpoints | Draw endpoints |
|---|---:|---:|---:|---:|---:|
| 4 | 9180 | 52210 | 20269 | 2108 | 0 |
| 444 | 6673 | 37701 | 13083 | 2108 | 0 |
| 44444 | 3400 | 19046 | 6284 | 2108 | 0 |

The three unresolved endpoint sets are exactly equal, not just equal in size.
The sorted full support keys are preserved once in PARITY_BOUNDARY_RESULTS.json;
the fixed ownership template reconstructs their exact boards. Equality was
checked element by element. The SHA-256 is artifact provenance only.

This is a useful composition result: the old all-neutral draw schedule is
interrupted by a legal P0 completion before board exhaustion. For example,
following 444, filling columns 1 and 2 and then allowing three P1/P0 pairs in
column 3 permits P0 to take column 4 and complete row 4 before finishing that
third pair. The exact prefix, winning move and four cells are stored in the
result. This is an example, not the universal argument; the full counter-DAG
control finds no reachable draw endpoint after admitting immediate wins.

However, 2108 endpoints remain UNKNOWN, including the low-rank center-full
position 444444. No win/value/optimality claim is made for those positions.
Neither zero observed draw endpoints nor zero immediate opponent threats proves
their subsequent game values. Starting at 444, P1 chooses the reply; proving a
P0 win against all replies would establish a WDL loss for P1, not identify a
unique distance-optimal P1 move.

## Next exact question

Can one compatible family of parity/response/deadline certificates cover these
2108 endpoint states, or force an earlier control switch before the problematic
ones? A P0 winning certificate for every reachable unresolved endpoint would
complete this restricted P0 strategy at all three odd prefixes, hence justify
the center continuation at the even prefixes 44 and 4444. Failure at an endpoint
would reject this fixed policy, not all possible center strategies.

Prioritize the existing GSP-004 blocker/deadline and shared-resource vocabulary.
Do not convert the 2108 states into a pre-solved lookup table or feed published
board outcomes into leaf proofs. The first uncovered state is an explicit
missing proof obligation, not a reason to restart broad full-game benchmarks.

## Reproduction / qualification

From repository root:

```text
node --test research/isograph/discovery/2026-09-29-center-proof-cycle/parity-dimension.test.mjs
node research/isograph/discovery/2026-09-29-center-proof-cycle/dimension-outcomes.mjs
node research/isograph/discovery/2026-09-29-center-proof-cycle/run-parity-geometry.mjs
node tools/verify-research-integrity.mjs
```

The test covers table axes/labels, response templates, finite defect distinction,
all 4096 endpoints from each odd prefix, exact equality of the unresolved sets,
and replay of witness prefixes and opportunistic wins. These are correctness
controls, not solver performance measurements. No production runtime adoption.
