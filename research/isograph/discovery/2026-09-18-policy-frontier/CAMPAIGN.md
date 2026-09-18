# Connect4 IsoGraph Discovery Campaign — exact policy/action-value frontier

**Date:** 2026-09-18  
**Owner:** `research/semantic-quotient`  
**Base authority:** Connect4 IsoGraph 1.1  
**Authority mutation:** none

## Question

Can the existing Connect4 IsoGraph be collapsed far enough to determine the exact best move without preserving the entire future game or reconstructing a conventional search tree?

## Target hierarchy

~~~text
physical state
    -> q future-behavior state
    -> action-value relation
    -> best-action set
~~~

`q` is sufficient but stronger than necessary for move choice.

The campaign therefore tests both:

1. how much policy headroom exists below q;
2. whether an existing structural order makes exact action values representable by compact frontiers.

## Complete controls

Four complete finite games were enumerated independently:

| control | nonterminal physical states | q classes | support+best-action classes | q / support-policy |
|---|---:|---:|---:|---:|
| 4x3 c3 | 4,631 | 3,734 | 1,024 | 3.646x |
| 4x4 c4 | 134,289 | 34,094 | 2,995 | 11.384x |
| 5x3 c4 | 147,563 | 11,316 | 3,017 | 3.751x |
| 4x5 c4 | 1,348,441 | 294,592 | 9,017 | 32.671x |

`support+best-action` is an information-theoretic/decision headroom measurement, not yet a constructive representation.

## Negative control — transition-closed policy automaton

A Moore-style minimization was run on the q transition automaton using the exact best-action set as output.

| control | q classes | minimized policy-congruence classes | collapse |
|---|---:|---:|---:|
| 4x3 c3 | 3,734 | 2,798 | 1.335x |
| 4x4 c4 | 34,094 | 27,392 | 1.245x |
| 5x3 c4 | 11,316 | 9,772 | 1.158x |
| 4x5 c4 | 294,592 | 228,344 | 1.290x |

Conclusion:

> Requiring a smaller transition-closed best-move state machine retains most q distinctions.

The useful collapse must therefore be a decision relation evaluated on the current structure, not merely a smaller automaton state.

## Failed dominance attempt — cross-support residual implication

Candidate:

~~~text
action A dominates B
if after A:
    mover residual formula is pointwise easier
    opponent residual formula is pointwise harder
~~~

without requiring equal support.

Result: unsound.

False-better cases occurred on every tested control:

~~~text
4x3 c3:   70 /   5,886 triggers
4x4 c4: 4,296 / 126,590 triggers
5x3 c4:10,032 / 345,730 triggers
~~~

Adding a simple per-cell accessibility guard removed all observed 4x3 false positives but still left:

~~~text
4x4 c4:   826 /  98,174
5x3 c4: 2,688 / 210,166
~~~

This reproduces the existing IsoGraph boundary: residual implication alone is not game control; support, turn/resource/precedence and first-win semantics are load-bearing.

## Positive result — equal-support favorable residual order

Fix support `S` and side to move `p`.

Define `qA >=_p qB` when:

- the mover's residual completion function in A pointwise contains/eases B;
- the opponent's residual completion function in A is pointwise contained/harder than B.

Complete-control check:

~~~text
comparable q pairs                 6,300,753
W/D/L monotonicity violations              0
strong-distance violations                 0

comparable fixed-action pairs     18,076,405
action W/D/L violations                    0
action strong-distance violations           0
~~~

This is the strongest result of the campaign.

See `SUPPORT_LOCAL_ACTION_VALUE_ISOTONY.md` for the proof candidate.

## Frontier representation

Since fixed-action score is isotone, every score upper set is upward-closed and admits an exact minimal-antichain boundary.

### W/D/L boundaries

| control | explicit action-state entries | Win + NonLoss frontier generators | compression |
|---|---:|---:|---:|
| 4x3 c3 | 10,232 | 5,386 | 1.900x |
| 4x4 c4 | 100,764 | 24,026 | 4.194x |
| 5x3 c4 | 37,719 | 10,983 | 3.434x |
| 4x5 c4 | 890,358 | 149,660 | 5.949x |

### Full strong-distance score boundaries

| control | explicit action-state entries | threshold frontier generators | compression |
|---|---:|---:|---:|
| 4x3 c3 | 10,232 | 8,532 | 1.199x |
| 4x4 c4 | 100,764 | 43,302 | 2.327x |
| 5x3 c4 | 37,719 | 10,842 | 3.479x |
| 4x5 c4 | 890,358 | 467,252 | 1.906x |

The strong-score representation is less compressed than W/D/L on some controls because each distance threshold adds an upper-set boundary, but it remains exact and substantially smaller on three of four controls.

## Negative control — direct policy antichains

The predicate `column c is optimal` was tested for upward closure under the same favorable order.

It fails heavily:

~~~text
4x3 c3:  3,368 /  12,518 upward checks
4x4 c4:111,176 / 399,302 upward checks
5x3 c4: 13,325 /  58,014 upward checks
~~~

A more favorable state can improve another action more strongly and remove `c` from the optimal set.

Therefore:

~~~text
direct best-action frontier     REJECTED
action-value threshold frontier SUPPORTED
~~~

## Emergent method

The exact move-selection procedure suggested by the existing topology is:

~~~text
for each legal action a:
    determine exact action score from support-local residual-order frontiers

choose argmax score
~~~

This is neither conventional recursive search nor a separate BSFP ontology.

It is an exact decision relation over:

~~~text
support
+ residual antichains
+ favorable implication order
+ threshold antichain boundaries
~~~

## Optimization interpretation

### IsoMax

Use known frontier membership to:

- return exact action score immediately;
- bound unresolved actions;
- eliminate dominated siblings;
- recurse only where the current frontier is incomplete.

### CUDA-BSFP

Try propagating only minimal threshold generators under predecessor/cofactor closure rather than materializing interior state families.

### Shared method

Both solvers become ways to construct or consume the same action-value frontier relation.

## Next falsifiers

1. independent proof review of support-local isotony;
2. exact nonstandard-board controls beyond the four current complete domains;
3. construct a 7x6 bounded-rank/frontier slice and measure generator growth before claiming scalability;
4. test whether theorem/certificate closure reduces strong-threshold frontier size materially;
5. test whether the frontier can be represented over a coarser observation than full q while preserving isotony.

## Disposition

~~~text
POLICY_COLLAPSE_HEADROOM              ESTABLISHED_ON_CONTROLS
TRANSITION_CLOSED_POLICY_QUOTIENT     LOW_VALUE
CROSS_SUPPORT_RESIDUAL_DOMINANCE      FALSIFIED
SUPPORT_LOCAL_ACTION_VALUE_ISOTONY    DEDUCTIVE_CANDIDATE + 4 COMPLETE CONTROLS
DIRECT_POLICY_REGION_MONOTONICITY     FALSIFIED
ACTION_VALUE_ANTICHAIN_FRONTIER       SUPPORTED_CANDIDATE
7X6_SCALABILITY                       OPEN
AUTHORITY_1_1_MUTATED                 NO
~~~
