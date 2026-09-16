# Opening cover boundary defect

**Date:** 2026-09-13  
**Status:** structural theorem / qualified finite geometry control; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Anti-unify the independently proved non-center-opening draw certificates into one geometric blocker template, then apply the same template to the center opening to identify the exact structural defect that prevents the safety proof from closing.

The perfect-play terminal-line subset and its suspected cardinality remain outputs only. No terminal-line classification is used here.

Mathematical columns and rows are 1-based.

## 1. Historical input reduced to generic predicates

Allis Appendix B gives compatible defensive covers after the three left non-center openings:

```text
1.A1 ...b1
1.B1 ...c1
1.C1 ...d1
```

The descriptions share the same semantic form:

- some columns are **even-controlled**: P1 obtains every relevant even-row cell;
- other columns occur in **pairs**: P1 obtains at least one cell of each relevant odd-row cross pair;
- vertical response relations in paired columns prevent a P0 vertical completion;
- the remaining apparent P0 horizontals are defeated by P1 completing the horizontal directly below first.

Reflection supplies the right-half openings.

The named historical rules are not retained as primitives. The generic objects are:

```text
EvenControlledColumn(c)
OddRowPair(c,d)
VerticalPairBlocker(c)
LowerShadowPreempts(L_lower, L_upper)
```

## 2. K-shifted cover template

For `K=4` and a left-side opening `j in {1,2,3}`, with P1 responding toward the center at `j+1`, define paired column blocks:

```text
(j, j+1)
(j+K, j+K+1)     when the second pair still fits in width 7
```

Every column not belonging to one of those pairs is even-controlled.

This exactly reproduces the Appendix-B column structure:

```text
opening 1:
  pairs  (1,2), (5,6)
  even   3,4,7

opening 2:
  pairs  (2,3), (6,7)
  even   1,4,5

opening 3:
  pair   (3,4)
  even   1,2,5,6,7
```

The appearance of the second pair shifted by exactly `K=4` is derived from the connect length rather than a separate rule label.

## 3. Static blocker field

For a template instance, use the following blocker facts:

1. the defender's first response `(j+1,1)` is a singleton blocker;
2. every even-row cell in an even-controlled column is a singleton blocker;
3. for each paired column pair `(a,b)`, every odd-row cross pair

```text
{(a,1),(b,1)}
{(a,3),(b,3)}
{(a,5),(b,5)}
```

is a blocker;
4. each paired column carries the central vertical pair blocker

```text
{(c,3),(c,4)}.
```

This last pair intersects all three four-cell vertical windows in a six-cell column.

All coverage from these facts is ordinary WSL subset/upward-closure algebra.

## 4. Non-center result: exactly `67 + 2`

Mechanical application of the template to the 69 geometric lines gives, for **each** `j in {1,2,3}`:

```text
67 lines eliminated by static singleton/pair blockers
 2 lines left uncovered
```

The two survivors are always horizontal and occur on rows 3 and 5 over the four-column interval:

```text
j+1 ... j+K.
```

Explicitly:

```text
opening 1 -> B3-E3, B5-E5
opening 2 -> C3-F3, C5-F5
opening 3 -> D3-G3, D5-G5
```

For each survivor, the response/control predicates imply that P0 ownership of all four upper cells entails P1 ownership of all four cells directly underneath.

Since support order makes every lower cell occur before its corresponding upper cell, the lower P1 horizontal completes strictly before the purported P0 upper horizontal.

Therefore:

```text
67 static blockers + 2 lower-shadow first-win preemptions = 69
```

and the cover is a complete P0-nonwin safety certificate.

Horizontal reflection gives the same result for openings 5, 6 and 7.

## 5. Generic support-shadow preemption theorem

The two-line residual is an instance of a reusable temporal theorem.

Let `L` be a candidate winning line for player `p`. Let `M` be another geometric winning line for opponent `q`. Suppose there is a bijection

```text
f : L -> M
```

such that for every `x in L`:

```text
f(x) physically precedes x
```

and the active control/response policy proves:

```text
p owns x => q owns f(x).
```

Then:

```text
p owns every cell of L
=> q owns every cell of M.
```

Let `x*` be the latest event of `L`. Every `f(x)` occurs before its corresponding `x`, and every `x` occurs no later than `x*`. Therefore every cell of `M` occurs strictly before `x*`.

Hence:

```text
CompletionRank(M) < CompletionRank(L)
```

and the first-win rule gives:

```text
RefuteTerminal(p,L).
```

For a horizontal line one row above another, `f` is simply the gravity-support projection downward by one row. This is the **support-shadow preemption theorem**.

It converts ownership/control facts on mandatory supports into a terminal-line refutation without move-tree enumeration.

## 6. Apply the same template at the center

Now apply the identical K-shift construction to the center opening:

```text
opening 4, response 5
pair   (4,5)
even   1,2,3,6,7
```

The second K-shifted pair would be `(8,9)` and therefore does not exist on a seven-column board.

The static blocker field now covers:

```text
66 of 69 lines
```

and leaves exactly three P0 horizontals:

```text
A1-D1
A3-D3
A5-D5.
```

The row-3 and row-5 lines still satisfy support-shadow preemption and are therefore discharged by the same temporal theorem.

But:

```text
A1-D1
```

lies on the bottom row.

It has **no lower support shadow**.

Therefore the non-center safety calculus closes only:

```text
66 static + 2 preempted = 68
```

and leaves one unresolved requirement.

## 7. Boundary-defect theorem

For the Appendix-B-derived K-shift safety template on the standard board:

```text
W = 2K - 1 = 7
K = 4
```

the three non-center left openings admit complete 69-line safety closure, while the center opening leaves exactly one bottom-row requirement after all corresponding static and lower-shadow preemption rules have fired.

The defect exists because:

1. the center opening is `j=K`;
2. the second pair shifted by `K` falls beyond the board boundary;
3. the surviving extreme length-K bottom interval has no predecessor row from which a first-win preemption certificate can be constructed.

Thus the center/non-center asymmetry is exposed by:

```text
connect length
+ board width
+ blocker coverage
+ gravity support order
+ first-win precedence.
```

No terminal-line solution table is involved.

## 8. What this does and does not prove

This result **does not** prove that P0 can force the specific line `A1-D1` under perfect center play. The blocker template is one attempted P1 safety construction; failure of that construction is not yet failure of every possible P1 policy.

What is proved is narrower and important:

- the same structural safety mechanism that completely proves every non-center opening non-winning has a one-requirement boundary defect at the center;
- that defect is bottom-row and therefore cannot be discharged by the lower-shadow preemption calculus;
- the unique location of the defect is forced by `W=2K-1`, the center opening, and the K-shifted pair construction.

The next positive-calculus question is therefore no longer vague:

> Can every attempted P1 repair of this bottom boundary defect be shown to release another P0 requirement, producing a monotone progress chain that ends in a P0 completion?

That is a concrete **cover-defect propagation** problem.

## 9. Reproduction

Prototype:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/opening_cover_boundary_defect.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-opening-cover-boundary-defect.json
```

The control mechanically generates all 69 lines from board geometry and verifies the `67+2` non-center pattern and `66+2+1` center boundary defect.

## 10. Claim boundary

Established:

- one generic K-shifted blocker template reproduces the column structure of the three left non-center draw certificates;
- each non-center instance statically covers exactly 67 lines and leaves exactly two lower-shadow-preemptible horizontals;
- the corresponding center template covers 66 statically, preempts two more, and leaves exactly one bottom-row line;
- support-shadow preemption is an exact reusable first-win inference rule.

Not established:

- that the K-shift template is the only possible P1 safety policy;
- that the bottom-row defect alone is sufficient to prove the center-root win;
- that every P1 attempt to repair the defect necessarily yields a P0 progress certificate;
- any membership or cardinality of the final perfect-play terminal-line subset.