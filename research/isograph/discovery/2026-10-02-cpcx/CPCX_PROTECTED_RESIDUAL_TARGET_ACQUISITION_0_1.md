# CPCX Protected-Residual Target Acquisition 0.1

**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Observation:** one current controller event on one currently playable protected residual target

## Purpose

Package the exact current-rank contraction that occurs when the controller itself occupies a currently playable missing cell of one pinned protected residual.

This is the cardinality-decreasing companion to protected residual support advance:

- support advance preserves missing cardinality and decreases support debt by one;
- target acquisition decreases missing cardinality by one and preserves the support debt of the remaining targets.

Together they provide a natural lexicographic progress pair: (missing cardinality, support debt).

No W/D/L value is inferred from this measure alone.

## Objects

Let S be an exact nonterminal CPCX position. Let A be the current mover and controller, D=A xor 1, R one pinned live residual owned by A, and t one missing target of R.

## Premises

1. Exact nonterminal source.
2. R is live at S with exact player and line ancestry.
3. t belongs to the missing set of R and has support distance zero.
4. No second missing cell of R lies in t's column.
5. t is the current legal frontier cell of its column.
6. Either S has no immediate obligation, or t is itself an exact current terminal move for A.
7. Applying A:t contracts R by exactly t, unless it completes R.
8. If A:t is nonterminal, the child must not give D an immediate terminal move. If the child overloads D with distinct A singleton threats, a first-win certificate for A may be emitted.
9. In the nonterminal contraction case, support debt over the remaining missing cells is unchanged.
10. Relative event phase over the remaining missing cells is preserved under the one-rank global gauge update.

## Conclusion

The theorem emits CERTIFIED_FIRST_WIN when A:t completes the protected line or creates exact opponent response overload.

Otherwise it emits PROTECTED_RESIDUAL_TARGET_ACQUISITION containing the exact action cell, source and child line ancestry, source and child missing-cell sets, missing-cardinality delta -1, remaining support-debt delta 0, the exact child immediate boundary, the event-phase gauge relation, and rank delta +1.

The lexicographic tuple (|R.missing|, debt(R)) strictly decreases because the first coordinate decreases by one.

## Failure conditions

Fail closed if the source is terminal, the pinned residual is not live, t is not a protected target, t is not currently playable, another missing target shares t's column, an unrelated immediate obligation has precedence, the cofactor does not contract exactly by t, the child exposes an immediate opponent terminal, remaining support debt changes unexpectedly, or the phase gauge cannot be certified.

## What this theorem does not prove

It does not prove that target acquisition is globally best, that every controller state has a playable protected target, eventual completion, any W/D/L value, the turn-6 best set, or a recursive strategy.

## Complexity

O(liveLineCount + K + lineIncidence), with K<=4. No reply tree, minimax, oracle, solved table, or recursive future-state search is used.

## Turn-6 use boundary

The normalized P1 target-transfer census at workflow run 37133241820 found one protected-target occupation among 98 current P1 responses.

That event is B5, which kills A6-B5-C4-D3 but transfers the diagonal control defect to C4-D3-E2-F1 with retained overlap C4,D3, missing count 3, support debt reduced from 8 to 4, and currently playable transferred target F1.

This theorem may be applied next to test whether P0 acquisition of F1 contracts that transferred carrier from missing cardinality 3 to 2.

The consumed turn-6 fixture is an application target, not a theorem premise.

## Required qualification controls

1. a fresh nonterminal current target acquisition that contracts missing cardinality by one;
2. a fresh direct protected-line completion;
3. rejection of a non-protected target;
4. immediate-precedence rejection where appropriate;
5. exact remaining-support-debt preservation;
6. phase-gauge preservation;
7. production CPC / solver / oracle / recursion isolation.
