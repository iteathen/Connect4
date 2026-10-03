# CPCX Direct Three-Trigger Wing Renewal 0.1

**Status:** frozen theorem contract; implementation/qualification pending  
**Scope:** experimental CPCX only  
**Observation:** one attacker-to-move anchored three-trigger forcing macro with explicit deviation debt

## Purpose

Generalize the existing post-action wing contract to positions where the attacker is already to move and an exact anchored three-trigger residual is live now.

The existing post-action compiler includes one preceding defender event because it was designed for the `44444` sixth-action boundary. That event is not logically part of the three-trigger forcing mechanism itself.

This theorem removes only that accidental prefix requirement. It does not add a new value rule, choose an arbitrary future reply, or infer a first win from the existence of a residual.

## Objects

Let `S` be one exact nonterminal finite-gravity Connect-K position with attacker `A=S.mover` and defender `D=A^1`.

Let `L` be one current live `A` winning-line residual with exactly three missing cells and one already-owned anchor cell.

Let the missing cells, in deterministic outer-to-anchor order, be

```text
t1, t2, t3
```

and let

```text
r1 = cell immediately above t1
r2 = cell immediately above t2.
```

The third same-column response above `t3` is not part of the honored script because `A:t3` must terminally complete `L` first.

## Premises

The direct wing contract may be emitted only when all of the following hold.

1. **Exact nonterminal source.** `S` is exact and nonterminal.

2. **Attacker to move.** `S.mover=A`.

3. **Exact anchored residual.** `L` is a live attacker residual with:
   - exactly three missing cells;
   - exactly one line cell already owned by `A`;
   - no defender cell on the line.

4. **All three triggers currently supported.** Each of `t1,t2,t3` is a current legal frontier cell in `S`.

5. **Same-column response geometry.** `r1` and `r2` are exactly one row above `t1` and `t2` in their respective columns and are initially empty.

6. **Deterministic trigger order.** Trigger order is reconstructed from geometry as farthest-from-anchor first, with a fixed column tie-break. No solved label or future outcome chooses the order.

7. **Honored fixed script is exact.** Exact first-win verification of

```text
A:t1 ; D:r1 ; A:t2 ; D:r2 ; A:t3
```

is legal and reaches its first terminal event exactly on `A:t3`, on line `L`.

8. **No earlier terminal on the honored path.** Premise 7 includes first-win stopping; any terminal event at an earlier script index rejects the contract.

## Response partition

The contract has exactly two defender decision points.

At decision `i in {1,2}`:

```text
HONOR_i:
    D occupies required same-column response ri

DEVIATE_i:
    D makes any other currently legal event
```

The direct wing theorem does not enumerate or select the deviation event. `DEVIATE_i` is a flat current-frontier set class.

A deviation emits the existing CPCX pair-debt object:

```text
trigger cell already acquired by A
+ omitted same-column response cell ri
+ one defender external event
-> one explicit repair obligation at ri
```

The existing universal debt-repair theorem, first-win guards, vertical two-stage theorem, support-release neutralization, or later independently qualified operators must close that debt. The direct wing contract itself does not assume they succeed.

## Conclusion

Under Premises 1-8, CPCX may emit

```text
DIRECT_THREE_TRIGGER_WING_ATTACK(A,L)
```

with:

- exact honored-path `CERTIFIED_FIRST_WIN(A)` on the third trigger;
- two set-valued deviation classes carrying explicit debt;
- no recursive continuation;
- no value claim for an unresolved deviation class.

If an independent composition theorem certifies every deviation class, then and only then the surrounding proof may promote the source position to `CERTIFIED_FIRST_WIN(A)`.

## Prefix generalization

The reusable wing/debt representation shall carry an explicit fixed `initialEvents` prefix.

For the historical post-action contract:

```text
initialEvents = [defender sixth action]
```

For direct renewal:

```text
initialEvents = []
```

All subsequent debt prefixes are reconstructed as:

```text
initialEvents
+ trigger/honored-response events up to the selected decision.
```

This is a representational generalization only. Existing post-action semantics must remain theorem-equivalent.

## First-win semantics

Every fixed event script is checked with exact terminal stopping.

`NO_CERTIFICATE` remains epistemic only.

No deviation is classified by solved W/D/L, remoteness, minimax, or oracle information.

## Complexity

For one candidate residual on fixed Connect-K geometry:

```text
candidate reconstruction: O(live line count)
honored fixed-script verification: O(K * line incidence)
debt response set construction: O(number of columns + live residual count * K)
```

CPCX retains `K<=4` for residual cardinality. There is no recursive legal-move-tree traversal.

## Required qualification controls

Qualification must include:

1. a fresh direct positive case not derived from `44444`;
2. a case with a non-bottom source rank/support context;
3. rejection when one trigger is not current frontier;
4. rejection when an honored response is support-illegal;
5. rejection when an earlier terminal precedes the third trigger;
6. regression proving the existing post-action wing/debt contract is unchanged;
7. production-CPC / solver / oracle / recursion isolation.

## Move-6 use boundary

The center-only move-6 states currently expose a common pristine A-C anchored wing, but those consumed states are not premises of this theorem.

After generic qualification, the theorem may be used to ask whether the existing debt/vertical polynomial closes every direct-wing deviation in those states.

Until that composition closes, this theorem does not prove the center sixth move, does not transport a certificate across physically distinct states, and does not prove:

```text
Best(44444)=LegalActions(44444).
```
