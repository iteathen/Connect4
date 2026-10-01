# CPC current-state guard-set reconstruction theorem

**Date:** 2026-09-30  
**Version:** 0.1 frozen before execution  
**Status:** exact reconstruction/composition theorem candidate  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Replace one-column guard provenance with the complete set of odd-row guards that is already determined by the current colored occupancy.

The immediate motivating state is \`444441566623\`, where independent reconstruction finds guards in columns A, C, and F. Existing single-guard proof classes fail at D13 for each guard considered separately.

The theorem below does not add a new legal response. It changes the proof-state representation from

\[
(q,\text{one selected guard})
\]

to

\[
(q,\Gamma(q)),
\]

where \(\Gamma(q)\) is the complete current-state guard set.

This follows the IsoGraph/Core-0.21 conservation rule: a load-bearing current-state resource must not disappear merely because one provenance path selected a different representative.

## 1. Defender-relative guard reconstruction

Let \(q\) be a legal nonterminal attacker-to-move state and let \(D\) be the defender.

For each nonfull column \(c\) with odd current height

\[
h_c\in\{1,3,5\},
\]

define \(c\in\Gamma(q)\) iff every occupied odd one-based row in that column up through \(h_c\) is defender-owned:

\[
D:c1,\quad
D:c3\text{ if }h_c\ge3,\quad
D:c5\text{ if }h_c=5.
\]

No history is required.

The guard set is therefore a deterministic function of current colored occupancy:

\[
\boxed{\Gamma=\Gamma(q)}.
\]

## 2. Reconstruction consequence

For every \(c\in\Gamma(q)\):

- the next playable cell in \(c\) is at even one-based row \(h_c+1\);
- if \(h_c<5\) and the attacker plays that cell nonterminally, the immediately higher odd cell is playable by the defender;
- the frozen odd-row guard theorem licenses the same-column response and reconstructs \(c\in\Gamma(q')\) at height \(h_c+2\);
- if \(h_c=5\), attacker play at row 6 exhausts the column and that guard retires.

Thus every member of \(\Gamma(q)\) independently owns an exact guard transition.

## 3. Guard-set composition

The proof automaton may retain **all** reconstructed guards simultaneously.

This does not mean every future response must preserve every current guard.

Instead, for an observed attacker trigger, the automaton may use any response already licensed by one of the frozen CPC response theorems:

1. synchronized-template response;
2. same-residual frontier attachment response;
3. cross-residual ladder response;
4. same-column odd-row guard renewal for a triggered guard;
5. support-lift blocker response;
6. top-exhaustion phase-debt blocker repair under the guard-preservation premise of that theorem.

After the exact trigger/response cofactors, the child proof state reconstructs

\[
\Gamma(q')
\]

from the child occupancy.

Therefore resource acquisition, preservation, loss, and retirement are state consequences, not path labels.

## 4. Top-debt scope with several guards

The frozen top-exhaustion theorem requires an already-established guard \(g\) to be preserved by the external repair.

With a guard set, that premise is satisfied only when there exists

\[
g\in\Gamma(q)
\]

such that:

- \(g\) is not the exhausted trigger column;
- the repair does not consume/change the support state of \(g\);
- the exact response leaves the guard ownership predicate for \(g\) true.

The guard-set theorem does **not** weaken that premise.

If no carried guard is preserved, the top-debt theorem cannot license that repair.

## 5. Survival-class composition

Let \(S_D^\Gamma(q)\) be the constructive survival class using the frozen local response grammar plus current-state guard reconstruction.

For every legal attacker trigger \(a\), require at least one frozen-theorem response \(r\) such that:

1. attacker first-win stopping is respected;
2. \(r\) satisfies the premises of its owning theorem;
3. \(r\) is exactly legal after \(a\);
4. the exact child \(q_{ar}\) is terminal in the defender/draw direction or satisfies

\[
S_{D-2}^\Gamma(q_{ar}).
\]

Because \(\Gamma(q_{ar})\) is reconstructed from the exact child, no guard provenance tag is transported by fiat.

This is a finite current-state proof schema, not a move-history tree.

## 6. Why one selected guard is insufficient

The consumed D15 diagnostic establishes:

\`444441566623\`

has reconstructed guard set

\[
\Gamma=\{A,C,F\}.
\]

Testing A, C, or F independently under the single-guard class fails D13.

That does not imply the set fails.

A response that consumes or retires one guard can leave another available; a response in a previously unguarded row-1 column can establish another guard; and top-debt repair can be justified by one preserved guard while later proof steps use a different reconstructed guard.

Discarding the other members of \(\Gamma\) after selecting one loses current-state proof resources.

## 7. Relation to parity-debt ownership

The guard set is a concrete typed candidate representation of distributed parity-control resources.

It is stronger and safer than a scalar "who owns parity" bit:

- each resource has a physical column identity;
- each has a support stage \(1,3,5\);
- each has exact ownership;
- top exhaustion is explicit;
- resource transfer/reconstruction follows exact cofactors.

A later quotient may compress \(\Gamma\) only after proving observation-preserving congruence.

No literal Nim-sum is asserted here.

## 8. Qualification plan

1. freeze this theorem before composition;
2. test the consumed D15 boundary with guard set reconstructed after every exact child;
3. do not add any legal response beyond the already-frozen response grammar;
4. if D15 closes, record the new first failure;
5. generate fresh multi-guard states independently of the consumed prefix;
6. verify exact reconstruction and guard-set transitions;
7. only after structural qualification consider production promotion.

## Claim discipline

This theorem candidate:

- is rank-local and current-state reconstructible;
- uses no oracle/WDL/strong distance;
- adds no outcome-fitted response;
- preserves all guard resources instead of one provenance-selected guard;
- remains an internal CPC temporal-contract representation.

It does not by itself prove candidate-6 optimality, exact remoteness, a literal Nim-sum, or v5.
