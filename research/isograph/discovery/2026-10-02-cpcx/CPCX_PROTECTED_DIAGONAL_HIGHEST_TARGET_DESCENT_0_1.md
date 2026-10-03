# CPCX Protected Diagonal Highest-Target Descent 0.1

**Status:** frozen theorem contract before implementation
**Scope:** experimental CPCX only
**Observation:** deterministic controller descent on one pinned diagonal residual

## Purpose

Replace per-state choice among several protected-residual progress actions with
one deterministic rank-local rule.

For a live controller diagonal residual, order its missing targets by physical
row, highest first. The theorem selects the unique highest-row target, with a
fixed column tie-break if ever needed, and proves either exact target
acquisition when that target is playable or exact one-step support advance when
it is not yet playable, provided a local first-win safety audit passes.

The theorem does not compare solved outcomes and does not inspect future reply
histories.

## Objects

Let S be one exact nonterminal finite-gravity position. Let A=S.mover be the
controller, D=A^1, and R one current live A residual with diagonal orientation
D+ or D-. Every missing target of R must occupy a distinct physical column.

Let t be the missing target of greatest physical row. Break an equal-row tie by
smallest physical column.

Define the lexicographic measure:

    mu(R) = (missingCount(R), supportDebt(R))

## Source precedence

The theorem applies only after deterministic forced normalization has been
handled. NO_IMMEDIATE_OBLIGATION is admissible. An immediate A terminal is
admissible only when t itself is that terminal target. Any other forced-response
or opponent-terminal boundary belongs to the higher-precedence CPCX
normalization layer and is not consumed here.

## Case 1 — highest target playable

If supportDistance(t)=0, apply the qualified protected-residual target
acquisition theorem.

It must return either CERTIFIED_FIRST_WIN(A) or
PROTECTED_RESIDUAL_TARGET_ACQUISITION with:

    missingCount' = missingCount - 1
    supportDebt'  = supportDebt

Therefore mu strictly decreases.

## Case 2 — highest target support-hidden

If supportDistance(t)>0, let d be the current legal frontier cell in t's column
and let u be the next frontier cell in that column after A:d.

The ordinary protected-residual support-advance theorem already supplies the
exact cofactor/support transition. This theorem adds a local sufficient
first-win guard for the newly released cell u.

### Highest-target local safety guard

After exact nonterminal A:d, inspect only geometric winning lines incident to
u. Every such line must satisfy at least one of:

1. CONTROLLER_BLOCKED — it already contains an A-owned cell; or
2. NOT_SINGLETON — it contains at least two empty cells.

If a line contains no A-owned cell and u is its unique empty cell with all
other cells D-owned, the guard fails as
HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON.

The audit is local because changing support in t's column can make a new
opponent singleton playable only at the newly released frontier u. No other
cell changes playability.

When the local guard passes, the qualified support-advance theorem must return
either A first win or PROTECTED_RESIDUAL_SUPPORT_ADVANCE with identical
residual ancestry/missing set and:

    supportDebt' = supportDebt - 1

Thus mu strictly decreases.

## Conclusion

Emit one of:

    CERTIFIED_FIRST_WIN(A)

or:

    PROTECTED_DIAGONAL_HIGHEST_TARGET_DESCENT
      action = deterministic highest-target acquisition/support action
      sourceMeasure = mu(R)
      childMeasure < sourceMeasure

The controller action is determined entirely from current protected geometry;
no outcome label or future branch selects it.

## First-win discipline

The source immediate boundary is checked first. Every physical event is applied
with exact first-terminal stopping. The local released-cell line audit is a
sufficient explanation of the support-advance first-win guard; it does not
erase unrelated existing immediate obligations.

## Complexity

For fixed Connect-K residual cardinality K:

    select highest target:          O(K)
    released-cell incidence audit: O(lines incident to one cell * K)
    protected cofactor transition: existing O(liveLineCount + K)

For Connect Four K=4. There is no legal-reply tree or recursive solving.

## Required qualification controls

1. fresh playable highest-target acquisition;
2. fresh support-hidden highest target with controller-blocked release lines;
3. fresh support-hidden highest target with non-singleton release lines;
4. rejection when the released frontier is an opponent singleton;
5. rejection when a higher-precedence forced response exists;
6. rejection for a non-diagonal residual;
7. deterministic selection under a synthetic equal-row tie if geometry permits;
8. production-CPC / solver / oracle / recursion isolation.

## Turn-6 application boundary

The current A-cycle diagnostic at head d163a2d9b0f2... contains:

    84 controller decision states
    84 exact highest-row protected actions
    0 failures

Highest targets observed:

    A6: 80
    C4: 3
    F5: 1

Released-cell line census:

    CONTROLLER_BLOCKED: 285
    NOT_SINGLETON:      135
    OPPONENT_SINGLETON:   0

These consumed fixtures are qualification evidence only. The theorem is generic
and must not contain U-class IDs or the sequence 44444.

This theorem supplies the deterministic controller-descent half of the
protected-diagonal automaton. It does not by itself prove that every later
opponent event preserves an admissible protected carrier, nor does it prove
Best(44444).
