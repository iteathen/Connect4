# CPCX Guarded External-Event Commutator 0.1

**Status:** frozen theorem contract; implementation/qualification pending  
**Scope:** experimental CPCX only  
**Observation:** exact nonterminal physical successor, not global transition isomorphism

## Purpose

Explain exact reconvergence of two fixed owner-labelled external events around an already-certified CPCX bridge without using reply-tree search or endpoint coincidence as the proof rule.

The theorem is generic. Move-6 U-class identifiers are discovery/falsification fixtures only and are not premises.

## Objects

Let `S` be one exact nonterminal CPCX position.

Let

```text
x = (cell_x, owner_x)
y = (cell_y, owner_y)
M = [m_1, ..., m_k]
```

where `x,y` are external events and `M` is a fixed owner-labelled bridge supplied by an independently certified CPCX macro.

Define the two fixed scripts

```text
A = x ; M ; y
B = y ; M ; x
```

No recursive continuation is part of this theorem.

Let `L` be the explicit load-bearing cell set for the selected macro/proof observation. Let `R` be the selected protected residual carrier (the full current live carrier is allowed and is the conservative default).

## Premises

The theorem may certify commutation only when all of the following hold.

1. **Exact nonterminal source.** `S` is exact and nonterminal.

2. **Distinct external events.** `x` and `y` occupy distinct cells.

3. **Current-frontier independence.** Both external cells are current legal frontier cells in `S`.

4. **Gravity/support separation.**
   - the external events are in distinct columns;
   - no bridge event lies in either external column;
   - the bridge is support/occupancy legal from `S`.

   Therefore neither external event can supply or remove a gravity prerequisite of the other event or of `M`.

5. **Turn parity.** Both complete scripts have the exact alternating owner sequence beginning with `S.mover`.

6. **Load-bearing exclusion.** Neither external event occupies a cell in `L`. At minimum, every bridge event cell is load-bearing.

7. **Protected residual cofactor commutation.** Applying owner-labelled residual cofactors for `A` and `B` to `R` yields the same canonical protected residual state. Provenance IDs created by cofactor order are not semantic; compare player, source winning-line identity, and remaining cell set.

8. **First-win guard.** Exact fixed-script verification of both `A` and `B` is legal and neither ordering reaches a terminal event. This guard is mandatory even when final occupancy would be identical.

Premise 8 is a two-script finite theorem audit, not legal-reply enumeration.

## Conclusion

Under Premises 1-8,

```text
Successor(S, x ; M ; y) = Successor(S, y ; M ; x)
```

for the CPCX physical-state observation consisting of:

```text
geometry
rank
next mover
owner occupancy
column support heights
nonterminal first-win status
protected residual cofactor state
```

The move-history ordering itself is intentionally erased.

Because Connect-K continuation from an exact nonterminal physical state is Markovian in occupancy/support/mover, any **separately certified deterministic suffix** whose premises depend only on this preserved successor observation may be reused after either ordering.

The theorem does **not** claim:

- one global column permutation;
- equality of transition histories;
- DTS transition isomorphism merely from common endpoints;
- equality of W/D/L values from an approximate descriptor;
- legality of arbitrary future replies.

## Proof sketch

Gravity updates are column-local. Premises 3-4 make `x`, `y`, and the bridge support-independent. Premise 5 preserves the alternating owner schedule. Thus both scripts place exactly the same owner on exactly the same set of physical cells and consume the same number of plies.

Owner-labelled residual cofactors are checked independently in Premise 7 on the protected carrier.

The only remaining way order could distinguish the scripts under first-win semantics is an earlier terminal event. Premise 8 excludes that case explicitly.

Therefore the resulting physical occupancy, support vector, rank, mover, nonterminal status, and protected residual cofactor are identical.

## Complexity

For bridge length `k`, protected residual count `r`, and CPCX residual cardinality bound `K <= 4`:

```text
support/turn audit: O(k)
two fixed-script first-win audits: O(k * line-incidence)
protected cofactor audit: O(k * r * K)
```

There is no recursive game-tree traversal.

## Required falsifiers

Qualification must include at least these negative controls:

1. one external event supplies/supports the other;
2. one external event intersects a load-bearing cell;
3. one ordering reaches an earlier first terminal;
4. one external event changes a load-bearing macro premise/residual before the bridge can be used.

Qualification must also include fresh positive controls outside the move-6 discovery fixtures, including a non-bottom support case.

## Move-6 application boundary

After generic qualification, the theorem may be used to justify exact order-transposition reconvergence discovered in the move-6 unresolved artifact.

It must not use U-class IDs as runtime conditions.

A later claim-relative A-C proof-cone quotient remains a separate theorem. Exact event commutation alone does not authorize deleting opponent residuals or collapsing distinct noncommuting physical states.
