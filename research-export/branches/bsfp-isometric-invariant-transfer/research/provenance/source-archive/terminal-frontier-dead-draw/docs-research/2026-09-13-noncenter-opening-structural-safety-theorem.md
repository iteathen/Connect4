# Non-center opening structural safety theorem

**Date:** 2026-09-13  
**Status:** exact constructive safety proof for all six non-center first moves on standard 7x6  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization, implementation, and qualification:** **OpenAI ChatGPT**

## Result

For standard 7x6 Connect Four, every non-center first move by P0 admits an explicit P1
response policy that prevents P0 from ever completing a geometric winning line.

Using 1-based columns, it is enough to prove representatives:

```text
P0 1 -> P1 2
P0 2 -> P1 3
P0 3 -> P1 4
```

Horizontal reflection supplies:

```text
P0 7 -> P1 6
P0 6 -> P1 5
P0 5 -> P1 4
```

Therefore:

```text
NonWin0(opening 1)
NonWin0(opening 2)
NonWin0(opening 3)
NonWin0(opening 5)
NonWin0(opening 6)
NonWin0(opening 7)
```

or, in the absolute-P0 interval lattice, every non-center first move receives the
one-sided bound:

```text
[-1,0]
```

No solved opening value, exact W/D/L table, minimax recursion, or final terminal-line
classification is used by the proof.

## 1. Proof language: three local response components

The accepted proof uses only three generic local components.

### Normal even-column responder

An initially empty column is partitioned into vertical trigger/response macros:

```text
P0 row 1 -> P1 row 2
P0 row 3 -> P1 row 4
P0 row 5 -> P1 row 6
```

Local automaton:

```text
4 P0-turn states
3 macro edges
0 invalid responses
```

### Initial coupled pair

Two adjacent columns begin with:

```text
left bottom = P0
right bottom = P1
```

Thereafter:

```text
P0 move below row 6 -> P1 directly above
P0 top move          -> P1 lowest empty cell in the other column
```

Local automaton:

```text
21 P0-turn states
24 macro edges
0 invalid responses
```

This is the component already isolated by the opening-3 proof.

### Empty coupled pair

Two empty columns begin uncommitted. When P0 first enters either column at row 1, P1
immediately takes row 1 of the other column. The component then follows the same
coupled-pair transition law as above.

Local automaton:

```text
43 P0-turn states
50 macro edges
0 invalid responses
```

This is the generic response-contract content of the historical base-pair idea, but the
accepted theorem does not depend on a historical rule name.

## 2. Asynchronous product theorem

Partition the seven columns into disjoint local components of the three kinds above.

At every P0 turn:

1. the chosen legal column belongs to exactly one component;
2. the local state of that component is a certified P0-turn state;
3. its local transition supplies one legal P1 response;
4. only that component changes state;
5. all other local invariants remain true.

Therefore, by induction, the asynchronous product of total local components is a total
P1 policy. No global move-tree construction is needed to establish policy totality.

## 3. Component partitions

### P0 opens column 1; P1 replies column 2

```text
normal columns:         3,4,7
initial coupled pair:   1,2
empty coupled pair:     5,6
```

### P0 opens column 2; P1 replies column 3

```text
normal columns:         1,4,5
initial coupled pair:   2,3
empty coupled pair:     6,7
```

### P0 opens column 3; P1 replies column 4

```text
normal columns:         1,2,5,6,7
initial coupled pair:   3,4
empty coupled pair:     none
```

These component patterns were independently suggested by historical non-center safety
structures, but the theorem is generated and verified from the local response semantics
above.

## 4. Generated invariant compiler

For each local component, enumerate only its tiny local response automaton and derive:

```text
SingletonBlocker(x)
  := P0 owns x in no intermediate local state

ForbiddenPair(x,y)
  := P0 never jointly owns x and y in any intermediate local state

SupportPrecedes(u)
  := whenever P0 owns upper cell u, P1 already owns its direct support cell
```

The compiler does not select hand-authored tactical patterns. It then generates all 69
standard geometric P0 winning lines and classifies each line by:

1. a singleton blocker;
2. a same-component forbidden pair; or
3. support-shadow race/preemption.

## 5. Support-shadow race/preemption

If P0 target line:

```text
R = {u1,u2,u3,u4}
```

has a one-row-lower P1 line:

```text
Q = {q1,q2,q3,q4}
```

and the component policy proves that P1 owns every `qi` strictly before P0 can own the
corresponding `ui`, then P1 completes `Q` before P0 can complete `R`.

The compiler discovers exactly two such residual race lines for each representative.

Opening 1:

```text
P0: B3 C3 D3 E3    preempted by P1: B2 C2 D2 E2
P0: B5 C5 D5 E5    preempted by P1: B4 C4 D4 E4
```

Opening 2:

```text
P0: C3 D3 E3 F3    preempted by P1: C2 D2 E2 F2
P0: C5 D5 E5 F5    preempted by P1: C4 D4 E4 F4
```

Opening 3:

```text
P0: D3 E3 F3 G3    preempted by P1: D2 E2 F2 G2
P0: D5 E5 F5 G5    preempted by P1: D4 E4 F4 G4
```

This is the exact progress/preemption information missing from blocker-only reasoning.

## 6. Complete generated line closure

The compiler obtains:

```text
opening 1 / reply 2:
  singleton-blocked: 48
  forbidden-pair:    19
  support-shadow:     2
  total:              69
  unclassified:        0

opening 2 / reply 3:
  singleton-blocked: 49
  forbidden-pair:    18
  support-shadow:     2
  total:              69
  unclassified:        0

opening 3 / reply 4:
  singleton-blocked: 56
  forbidden-pair:    11
  support-shadow:     2
  total:              69
  unclassified:        0
```

Because a P0 terminal win must complete one of those 69 lines immediately after a P0
move, and every line is ruled out by an invariant valid at every after-P0 intermediate
state, P0 cannot win under the policy.

## 7. Independent full-policy qualification

A separate physical policy-graph executor was used only as a falsifier. It executes
every reachable P0 choice under the compiled policy and checks response legality and
P0 terminal wins.

```text
opening 1 / reply 2:
  P0-turn states:       56,720
  P0 move edges:       259,980
  P0 immediate wins:         0
  invalid P1 responses:      0
  P1 terminal wins:      1,792
  full-board draws:          54

opening 2 / reply 3:
  P0-turn states:       56,720
  P0 move edges:       259,980
  P0 immediate wins:         0
  invalid P1 responses:      0
  P1 terminal wins:      1,792
  full-board draws:          54

opening 3 / reply 4:
  P0-turn states:       19,936
  P0 move edges:        98,896
  P0 immediate wins:         0
  invalid P1 responses:      0
  P1 terminal wins:      2,304
  full-board draws:           3
```

These counts are qualification evidence only. The accepted proof is the local-product
induction plus the generated 69-line closure.

## 8. Relationship to historical strategy theory

Historical Appendix-B strategies independently exhibit the same large-scale pattern:
normal even-controlled columns separated by paired columns for non-center openings.
That evidence was used only to identify a promising structural decomposition. The
accepted proof object contains no `Claimeven`, `Baseinverse`, `Vertical`, or `Before`
runtime predicates.

Their generic content is reconstructed as:

```text
local response automaton
ownership exclusion
support precedence
race/preemption
geometric closure
```

## 9. Consequence for the complete solve program

The entire **non-center safety side of the first move is now internal**.

The first-move proof boundary is therefore:

```text
columns 1,2,3,5,6,7 -> internally proved <= draw for P0
column 4             -> positive P0-win progress still requires proof
```

If root `P0Win` were admitted externally, the exact existential predecessor immediately
forces the winning first move to column 4. But a complete self-contained solve proof
still requires a structural positive proof for the center opening/root; this theorem
does not assume that value.

The research target should now shift from additional non-center blockers to a
well-founded **center-positive progress calculus**.

## Reproducers / evidence

Structural compiler:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/noncenter_local_policy_compiler.mjs
```

Independent physical control:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/noncenter_policy_full_control.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-noncenter-structural-safety.json
```

## Claim boundary

This theorem establishes only one-sided P0 non-win for all six non-center openings. It
does not distinguish draw from P1 win, does not prove that the center opening wins for
P0, and does not derive the final perfect-play terminal-line subset or cardinality.
