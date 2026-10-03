# CPCX Dual Vertical Three-Stage Response Cover 0.1

**Status:** rejected by consumed U13 B6 falsifier before implementation  
**Scope:** experimental CPCX only  
**Observation:** one flat opponent response layer over two disjoint protected vertical three-stage ladders

## Purpose

Generalize the structural shape exposed by the current U13 rank-26 CPCX state
without creating a descendant-response grammar.

The existing qualified vertical three-stage theorem certifies an attacker-to-move
residual with support profile

```text
[0,1,2]
```

by one deterministic setup into the existing vertical two-stage theorem.

The present theorem addresses the preceding state: the opponent is to move while
the controller owns **two** such protected vertical three-stage residuals in
different columns.

One opponent placement can physically occupy at most one of those two columns.
However, disjointness alone is not enough under first-win semantics: an external
opponent move can create another immediate terminal obligation that invalidates
the surviving setup.

Therefore the theorem is a guarded **response cover**, not a bare disjointness
claim.

## Objects

Let `S` be one exact nonterminal CPCX position.

Let:

- `D=S.mover` be the current opponent/defender;
- `A=D^1` be the proof controller;
- `R0,R1` be two exact live `A` vertical residuals;
- each residual have exactly three consecutive missing cells;
- each residual have exact support profile `[0,1,2]`;
- the two residuals occupy distinct physical columns.

The exact physical winning-line ancestry of `R0,R1` is pinned by line ID.

## Premises

1. **Exact nonterminal source.** `S` is exact and nonterminal.

2. **Opponent to move.** `S.mover=D`; both protected residuals belong to
   `A=D^1`.

3. **Exact protected ladders.** `R0,R1` are current live vertical residuals
   satisfying the qualified three-stage geometry:
   - missing count 3;
   - one column each;
   - consecutive missing rows;
   - support profile `[0,1,2]`.

4. **Column disjointness.** The two protected ladder columns are distinct.

5. **No source opponent terminal.** The current immediate CPCX classification
   does not give `D` a terminal move.

6. **Flat current-response audit.** For each current legal frontier event
   `d` of `D`:
   - apply exactly that one event;
   - if `D:d` is terminal, the theorem fails closed;
   - otherwise reconstruct only the two pinned line ancestries `R0,R1`;
   - require at least one of them to instantiate
     `certifyCpcxVerticalThreeStageSetup` exactly in the child.

7. **Deterministic witness selection.** If both protected ladders remain exact
   after one response, select the witness by fixed line-ID order. No outcome,
   remoteness, solver value, or future response chooses the ladder.

8. **First-win inheritance.** Every selected child three-stage certificate
   already includes:
   - child immediate-precedence audit;
   - exact one-event setup;
   - reconstruction of the existing two-stage theorem;
   - first-terminal stopping.

## Conclusion

Under Premises 1-8, emit:

```text
DUAL_VERTICAL_THREE_STAGE_RESPONSE_COVER
```

with one row for each current legal opponent response and one exact selected
three-stage certificate in every row.

The semantic conclusion is only:

```text
for every current opponent event,
the controller has at least one protected three-stage setup
whose premises are already certified in that exact child.
```

This is a one-layer response cover.

It does **not** assert that the source is already
`CERTIFIED_FIRST_WIN(A)`.

## Composition boundary

A later theorem may collapse the response cover only if it proves that every
selected three-stage successor enters one common admitted proof class after the
inherited two-stage macro.

In particular, the following are not licensed by this theorem alone:

- recursive reuse of the response cover;
- arbitrary future opponent enumeration;
- value equivalence of the two ladder choices;
- deletion of external opponent residuals;
- a completion upper bound;
- `Best(44444)`.

## Why this is not search

The quantified set is exactly the **current legal frontier**.

For each member, CPCX performs:

```text
one exact event
-> reconstruct two pinned line ancestries
-> run one already-qualified local theorem
```

No child is evaluated by W/D/L, minimax, recursive proof search, or arbitrary
future continuation.

The proof cost is polynomial in current width and live-line incidence.

## Complexity

For width `W` and live-line count `L`:

```text
current response set: O(W)
child event application: O(W * line incidence)
two pinned ladder reconstructions: O(W * L)
three-stage guard calls: O(W * L)
```

No recursion.

## Required qualification controls

Qualification must include:

1. a fresh positive case with two disjoint vertical three-stage ladders;
2. a positive case where a response destroys the first ladder but the second
   survives;
3. a positive external-response case where both survive and deterministic
   witness selection is stable;
4. a negative case where one opponent response is terminal;
5. a negative case where an external response leaves the physical ladders but
   causes the selected three-stage first-win guard to fail;
6. a negative case with only one protected ladder;
7. production-CPC / solver / oracle / recursion isolation.

## Falsification result

The consumed U13 B6 application falsifies this theorem as a useful closure
rule at the motivating boundary.

After the current P0 action `B6`, P1 has five legal nonterminal replies:

```text
A4, C3, E5, F5, G3.
```

The diagnostic
`run-uc4a-cpcx-u13-b6-dual-vertical-ladder.mjs` found:

```text
everyNonterminalReplyLeavesExactThreeStage = false
exact ladder count after every reply = 0
```

Moreover:

- `P1:E5` enters an exact P1 first-win certificate after deterministic
  normalization;
- `P1:G3` creates an exact P1 singleton overload.

Therefore physical disjointness of the A/C ladders is insufficient even with
the proposed child-certificate reconstruction discipline. Current first-win
obligations can preempt both ladder continuations without physically occupying
both ladder columns.

Do not implement or promote this response-cover theorem as written.

The useful retained lesson is narrower:

```text
disjoint protected ladders
!=
disjoint first-win proof resources.
```

A future theorem must carry the opponent immediate/response-capacity interface
as part of the state rather than attempting to recover it only after one
response.

## U13 move-6 use boundary

At the current consumed U13 rank-26 state, the protected ladders are:

```text
A3-A4-A5-A6  missing {A4,A5,A6}
C2-C3-C4-C5  missing {C3,C4,C5}
```

After the candidate setup `P0:B6`, P1 is to move and neither protected
ladder has been touched.

That state may be used only as a post-qualification application fixture.

The theorem itself contains no U13, B6, move-6, or solved-value condition.
