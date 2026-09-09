# Backward winning-line fixed point — nested retrograde dependency test

**Date:** 2026-09-09  
**Status:** research evidence only; maintained source and `main` unchanged.  
**Branch:** `research/low-confidence-survival-2026-09-09`

## Hypothesis tested

Instead of expanding the game forward from the empty board, start from the finite set of geometric winning positions and propagate the proof **backward** through nested dependencies.

The natural W/D/L formulation is a pair of fixed points over proof obligations:

```text
Win  := terminal-win
        OR controllable-predecessor(Loss)

Loss := universal-predecessor(Win)
```

Iterating those two operators from terminal winning axioms gives the **least fixed point** of forced wins/losses. States not attracted to either side form the **greatest-fixed-point safety residue**, i.e. draw under perfect play.

This is mathematically different from recursive minimax even when a complete state graph is used as a control. The intended final form is to compute the same fixed point symbolically over residual/event dependencies rather than materialized boards.

## Control implementation

A Node-only control enumerated reachable states only to provide predecessor relations. The solve phase then used no minimax recursion:

1. seed every state having an immediate winning move from one of the game's geometric winning lines;
2. propagate backward:
   - predecessor is `W` when it has a child already proved `L`;
   - predecessor is `L` when all legal nonterminal children are already proved `W`;
3. iterate until no new W/L state appears;
4. classify the unclaimed residue as draw.

This is a control for the direction/algebra, not the desired searchless implementation because the concrete predecessor graph is still enumerated first.

## Backward-wave result

| Game/root | Reachable states | Legal edges | Root WDL | Terminal-win seed states | Backward waves to fixed point/root |
|---|---:|---:|---|---:|---:|
| 4x3 connect-3 empty | 4,659 | 11,818 | W | 2,570 | **9** |
| 4x4 connect-4 empty | 139,625 | 304,574 | D | 24,685 | 12 total W/L attractor waves; root remains in draw residue |
| 5x3 connect-4 empty | 152,003 | 377,229 | D | 11,079 | 10 total W/L attractor waves; root remains in draw residue |
| 4x5 connect-4 empty | 1,385,521 | 3,175,616 | D | 348,191 | 16 total W/L attractor waves; root remains in draw residue |
| 7x6 `764353221241721325116531` | 214,461 | 689,986 | L | 113,996 | **15** |
| 7x6 `24763565123272565531172315` | 10,855 | 36,479 | W | 8,009 | **12** |

The backward operator therefore reconstructs the same W/L result from terminal wins alone, and the draw roots arise as the complement/safety fixed point rather than by searching for a terminal draw sequence.

## Winning-line axioms, not terminal-board axioms

The thousands of terminal-win seed states are instances of a very small geometric axiom set:

| Geometry | Potential winning-line schemas |
|---|---:|
| 4x3 connect-3 | 14 |
| 4x4 connect-4 | 10 |
| 5x3 connect-4 | 6 |
| 4x5 connect-4 | 17 |
| 7x6 connect-4 | 69 |

A stricter proof quotient retained the **winning-line ID** as the terminal axiom and hash-consed all derived W/L/D dependencies.

Results:

- 4x3 first-player win: root proof uses **9 of the 14** winning-line axioms and 31 line-aware dependency shapes;
- frozen 7x6 `+2` root: root proof uses only **3 of the 69** winning-line axioms and 17 line-aware dependency shapes;
- frozen 7x6 `-2` root: root proof uses only **5 of the 69** winning-line axioms and 58 line-aware dependency shapes;
- 4x4 and 5x3 draws require no terminal-line axiom in the final coinductive root witness: they remain outside all winning attractors.

This is directly aligned with the proposed reverse direction: geometric win lines are the finite axioms; the strategy/result is a nested dependency closure derived backward from them.

## Connection to the earlier tiny proof-DAG result

The previous proof-only quotient found:

- 4x3 first-player win: 9 logical WDL dependency shapes;
- 4x4 draw: 17;
- 5x3 draw: 16;
- 4x5 draw: 21;
- hardest frozen 7x6 root: 38 unlabeled WDL proof shapes.

The retrograde experiment shows those objects can be understood as **backward fixed-point proof grammars rooted in winning axioms**, not only as accidental forward-search compression.

## Dominance antichain control

The residual dominance theorem gives another key property needed for a symbolic backward solver:

```text
S >= T  =>  V(S) >= V(T)
```

at identical support/accessibility skeleton.

Therefore P0-winning regions are upward-closed under residual dominance, and P0-losing regions are downward-closed. They can be represented by frontier antichains rather than all residual states.

Complete-game control results:

| Game | Residual semantic states | Win frontier | Loss frontier | W/L frontier total | Frontier / residual | Monotonicity violations |
|---|---:|---:|---:|---:|---:|---:|
| 4x3 c3 | 3,735 | 1,293 | 788 | 2,081 | 55.7% | 0 |
| 4x4 c4 | 34,095 | 2,255 | 2,769 | **5,024** | **14.7%** | 0 |
| 5x3 c4 | 11,317 | 1,306 | 640 | **1,946** | **17.2%** | 0 |

The maximum frontier per support skeleton was only 29/19 win/loss certificates on 4x4 and 6/4 on 5x3.

This does not yet prove that the *intermediate* fixed-point frontiers remain equally small, but it strongly supports antichain representation of the backward winning/losing regions.

## Stronger mathematical formulation

The current best searchless formulation is now:

```text
Axioms:
    geometric winning hyperedges

State algebra:
    RWS + RID + support/event precedence
    + U1 parity/response constraints
    + U2 blocker closure

Order:
    residual dominance / implication

Operators:
    CPre_exists  -- current player has a dependency into losing region
    CPre_forall  -- every legal response enters opponent winning region

Solution:
    mu (least fixed point) of winning/losing attractors from win-line axioms
    plus
    nu (greatest fixed point) safety residue for draws
```

The remaining challenge is **not** the fixed-point mathematics. The concrete control validates it. The challenge is implementing the controllable predecessor directly on compact residual/event antichains so that no physical-state predecessor graph is created.

## Why this matches the nesting intuition

Each derived proof obligation can itself be used as an axiom by an earlier obligation. A future winning line is not expanded forward into all play sequences; instead its prerequisites are recursively pulled backward through:

- gravity/event precedence;
- parity ownership;
- forced responses;
- blockers;
- strategic resource/race dependencies.

The proof naturally nests until it either reaches the empty-root facts or fails to cover them.

## External conceptual cross-check

Symbolic reachability/safety-game literature uses exactly this family of constructions: controllable-predecessor fixed points, often with antichain representations of upward/downward-closed regions and succinct strategies. That is useful conceptual confirmation, not implementation authority for this repository.

Relevant examples include antichain algorithms for safety/reachability games and controllable-predecessor operators over complete lattices.

## Next decisive experiment

Implement a **state-enumeration-forbidden** symbolic predecessor for the 4x3 and 4x4 games:

1. initialize from the 14 / 10 geometric win-line axioms;
2. represent W/L sets as residual-dominance antichain frontiers per support/event skeleton;
3. derive predecessors using inverse RID transitions + event precedence, not concrete parent boards;
4. alternate existential/universal predecessor closure to fixed point;
5. root outcome must be W for 4x3 and D for 4x4;
6. no materialized physical-state graph and no recursive minimax are allowed.

That would be the first actual direct backward/searchless solve rather than a control proving that the target algebra exists.
