# CPC one-switch synchronized-response survival theorem

**Date:** 2026-09-30  
**Status:** exact constructive survival theorem / correction to fixed-template separation  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Strengthen the CPC strong-distance lower envelope from one fixed synchronized-response template to one explicit response exchange followed by a certified template switch.

The result is constructive and oracle-free. It also corrects an important interpretation at the consumed v4 boundary: the fixed-template lower bounds `[3,3,5]` do **not** remain separated once one sound adaptive response-template switch is allowed.

## 1. One-switch certificate

Fix a nonterminal state `P` with attacker `A` to move.

Choose one complete synchronized-response template `Pi` derived from the current support state.

For every legal attacker move `a`:

1. `a` must be nonterminal;
2. `Pi` supplies its exact legal partner response `r_Pi(a)`;
3. first-win stopping is checked before the response;
4. the response is applied exactly;
5. if the defender terminates, the attacker cannot later win;
6. otherwise the exact successor `Q_a = P + a + r_Pi(a)`, with `A` to move again, must have an independently certified CPC-basis survival horizon `H(Q_a)`.

Then `Pi` plus successor template switching certifies survival through:

`L_Pi(P) = min_a (2 + H(Q_a))`,

with defender-terminal branches treated as already closed against an attacker win.

Maximizing over initial complete templates gives:

`L1(P) = max_Pi L_Pi(P)`.

This is a lower bound on attacker terminal time only.

## 2. Proof

The attacker cannot win on the first move by condition 1.

For any legal first move, the template response is immediately legal by the synchronized-response theorem and is applied on ply 2.

If that response terminates for the defender, the attacker cannot terminally win later because play has stopped.

Otherwise the exact successor `Q_a` begins on attacker-relative ply 3. Its independently certified horizon `H(Q_a)` prevents attacker terminal completion for the next `H(Q_a)` physical plies measured from that successor.

Therefore the original attacker cannot terminally complete through physical ply `2 + H(Q_a)` on that branch.

The attacker chooses the worst branch, hence the minimum over `a`. The defender may choose the best valid initial complete template, hence the maximum over `Pi`.

QED.

## 3. Relation to CPC

The residual obligations are not separately scored.

Each successor horizon is recomputed from the minimal active generators of the native RBA/CPC residual coordinate. The initial response is one aggregate synchronized-response policy over all current obligations, and the successor calculation again consumes the whole CPC residual basis.

This is therefore a constructive CPC strong-distance lower route, not a parallel obligation taxonomy.

## 4. Consumed v4 boundary

At prefix `444441566`, after candidate moves 2, 3, and 6, the previously qualified fixed-template horizons were `[3,3,5]`.

The one-switch control gives:

`[5,5,5]`.

### Candidate 2

A complete initial template using channels `(1,2)` length 1 and `(4,5)` length 1 responds legally to all seven attacker columns. Every exact nonterminal successor has CPC-basis fixed-template horizon 3.

Therefore `L1(P2)=5`.

### Candidate 3

A complete initial template using channels `(1,3)` length 1 and `(4,5)` length 1 likewise has every exact successor at horizon 3.

Therefore `L1(P3)=5`.

### Candidate 6

The prior maximizing fixed template uses `(1,4)` length 1, `(5,6)` length 1, and `(2,3)` length 2.

The forced `2<->3` branches and column-7 vertical branch reach successors with horizon 5, so those branches would survive through 7. However attacker moves in columns 1, 4, 5, or 6 lead, after the prescribed response, to successors whose best fixed-template horizon is only 3.

Thus the universal first-move guarantee remains `L1(P6)=5`.

## 5. Correction to the earlier fixed-template clue

The strict fixed-template inequality `H(P6)>H(P2),H(P3)` was already explicitly forbidden as a move-ranking theorem.

The one-switch result now shows a stronger reason:

`L1(P2)=L1(P3)=L1(P6)=5`.

So the earlier `[3,3,5]` difference is not invariant under even one sound round of response-template adaptation. It must not be used as evidence that candidate 6 has intrinsically greater strong loss distance.

## 6. Relation to the fixed-template defect envelope

The fixed-template defect envelopes remain exact diagnostics of that restricted certificate family:

- candidates 2/3: `0,0,2,6,8,...`;
- candidate 6: `0,0,0,4,6,...`.

But positive fixed-template defect counts are not forced-completion facts, and the one-switch theorem demonstrates that a positive horizon-5 defect for candidates 2/3 can be repaired by explicit response-and-switch composition.

Therefore fixed-template defect count is not, by itself, a well-founded strong-distance progress rank.

## 7. Current strong-distance boundary

After this correction, the sound CPC lower envelope at the consumed children is at least `[5,5,5]` under the one-switch certificate family.

The CPC forced-completion upper envelope remains `[+infinity,+infinity,+infinity]`.

There is still no interval separation and no v5 license.

## 8. Next target

Do not extend v5 from the former `[3,3,5]` separation.

The next useful research question is whether a compact CPC certificate-switch closure can be proved without degenerating into ordinary game-tree recursion.

A valid extension must retain an explicit response-policy invariant or compressed proof state. Merely iterating physical branches until a difference appears would violate the project objective.

On the upper side, a finite CPC forced-completion rank remains the decisive missing theorem.

## Claim discipline

This theorem is rank-local, geometry-derived, constructive, and oracle-free. It proves survival only, not exact remoteness. It does not imply that candidates 2, 3, and 6 are truly equal-distance and does not create v5.
