# Opening-3 structural safety certificate

**Date:** 2026-09-13  
**Status:** exact constructive safety proof for standard 7x6 opening column 3; no solved-value premise  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization, implementation, and qualification:** **OpenAI ChatGPT**

## Result

Using 1-based columns, after:

```text
P0: column 3
P1: column 4
```

P1 has a total constructive response policy under which P0 cannot complete any of the
69 geometric winning lines. Therefore:

```text
NonWin0(after opening 3)
```

and by horizontal reflection:

```text
NonWin0(after opening 5)
```

This replaces the previously admitted opening-3 non-win premise with an internal
structural proof. No exact W/D/L value, solved opening table, full game-tree search, or
perfect-play terminal-line classification is used by the proof.

## Policy

After the initial `C1 ... D1` position:

```text
normal P0 move below row 6
  -> P1 plays directly above it

P0 plays C6
  -> P1 plays the lowest empty D cell

P0 plays D6
  -> P1 plays the lowest empty C cell
```

Columns 1, 2, 5, 6, and 7 therefore decompose into independent vertical
trigger/response pairs. Columns 3 and 4 form one coupled local response channel.

## Normal-column invariant

In each normal column the local macro-step is:

```text
P0 takes row 1 -> P1 takes row 2
P0 takes row 3 -> P1 takes row 4
P0 takes row 5 -> P1 takes row 6
```

Hence P0 can never own the even-row cells in columns 1,2,5,6,7.

Together with the initially occupied P1 cell `D1`, this gives 16 permanent singleton
blockers:

```text
A2 A4 A6
B2 B4 B6
D1
E2 E4 E6
F2 F4 F6
G2 G4 G6
```

The generated 69-line audit shows these singleton blockers already intersect 56 P0
winning lines.

## Coupled C/D local automaton

The C/D response policy has a tiny local state space independent of the other five
columns and independent of W/D/L values.

Starting from:

```text
C1 = P0
D1 = P1
```

ordinary moves advance one chosen special column by the two-cell macro-step
`P0 lower -> P1 upper`. If P0 reaches the top of one special column, the response
occupies the lowest empty cell of the other special column, changing its phase.

The complete local macro automaton contains:

```text
21 P0-turn states
24 P0 macro edges
24 after-P0 intermediate states
0 invalid responses
```

The automaton is an over-approximation with respect to the full game: it ignores wins
elsewhere and therefore cannot obtain safety by prematurely terminating a trajectory.

It proves that P0 can never jointly own any of these four pairs:

```text
{C3,C4}
{D3,D4}
{C3,D3}
{C5,D5}
```

Geometric upward closure from those forbidden pairs eliminates another 11 P0 winning
lines not already hit by the singleton blockers.

## Support-shadow race theorem

Two P0 lines remain after singleton and pair closure:

```text
D3 E3 F3 G3
D5 E5 F5 G5
```

They are eliminated by a generic support-precedence theorem.

### Theorem

Let an attacker winning line be:

```text
R = {u1,u2,u3,u4}
```

and suppose the cells immediately below them form a defender winning line:

```text
Q = {q1,q2,q3,q4}
```

with `qi` supporting `ui`.

If the response policy guarantees, for every `i`, that the defender owns `qi`
strictly before the attacker can own `ui`, then the attacker cannot terminally win on
`R`: before the last cell of `R` can be acquired, all four cells of `Q` are already
defender-owned, so the game has already terminated for the defender.

This is a race/preemption certificate, not a blocker occupancy heuristic.

### Opening-3 instances

For the row-3 P0 line:

```text
attacker: D3 E3 F3 G3
defender: D2 E2 F2 G2
```

For the row-5 P0 line:

```text
attacker: D5 E5 F5 G5
defender: D4 E4 F4 G4
```

In normal columns E/F/G the lower cell is the direct response from the preceding
vertical pair. In column D, the C/D local automaton proves:

```text
P0 owns D3 => P1 already owns D2
P0 owns D5 => P1 already owns D4
```

Therefore both defender shadow lines complete before their P0 lines can complete.

## Complete 69-line closure

The structural verifier mechanically generates the standard 69 geometric lines and
classifies them only by the proved invariants above:

```text
singleton-blocked:       56
forbidden-pair blocked:  11
support-shadow race:      2
---------------------------
total:                    69
unclassified:              0
```

Thus every possible P0 terminal line is impossible under the constructive P1 policy.
The policy is total by the normal-column induction plus the 21-state C/D macro
automaton.

Therefore P0 cannot force a win after opening column 3 and P1 reply column 4.

## Independent qualification

The pre-existing control:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/c1_draw_policy_certificate.mjs
```

executes the same policy against every physical P0 choice and independently asserts:

```text
P0 immediate wins = 0
invalid policy responses = 0
```

It also independently obtains the same line decomposition:

```text
56 singleton + 11 pair + 2 race = 69
```

That full-policy execution is retained as a falsification/control oracle. The proof
above does not depend on the physical policy graph.

## Consequence for the predecessor calculus

The opening proof now has an internally generated safety fact:

```text
response-resource policy
  -> singleton and pair ownership invariants
  -> support-shadow race/preemption
  -> complete WSL/geometric coverage
  -> [-1,0]
  -> NonWin0(after opening 3)
```

This is precisely the missing bridge from response contracts to a one-sided W/D/L
certificate. It also explains why the earlier one-sided projection failed when it
threw away P1 progress: two lines are excluded only because a P1 winning line completes
first.

## Next seam

Apply the same proof compiler to openings 1 and 2:

1. define a small local response-resource automaton rather than a physical move tree;
2. generate singleton, forbidden-subset, and support-shadow/race certificates;
3. require all 69 P0 lines to close structurally;
4. preserve the smallest uncovered line or response-state falsifier if closure fails;
5. use reflection for openings 6 and 7;
6. if openings 1 and 2 close, all six non-center first moves become internal non-win
   theorems, leaving center-positive progress as the only first-move-value proof gap.

## Reproducer / evidence

Prototype:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/opening3_structural_safety_certificate.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-opening3-structural-safety-certificate.json
```

## Claim boundary

This proves only that P0 cannot force a win after opening column 3 (and, by reflection,
column 5). It does not decide draw versus P1 win, does not prove the center opening is
winning, and does not establish the final perfect-play terminal-line set or cardinality.
