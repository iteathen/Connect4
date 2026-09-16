# Center defect lift: bottom horizontal → diagonals → row-3 horizontal

**Date:** 2026-09-13  
**Status:** exact finite certificate-transition theorem; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Continue the center-opening response-capacity investigation after the five-diagonal singleton deficiency.

The previous chain established, within the qualified parity/certificate family:

```text
center bottom defect A1-B1-C1-D1
 -> P0 denies the unique A-odd complete repair with A1
 -> P1 B1 repair exposes five diagonal requirements
```

The five diagonals cannot be covered by a compatible unconditional singleton extension of the inherited B-odd parity certificate. However, that does not imply the diagonal family is intrinsically unrepairable: P1 may exchange certificates rather than only add them.

This note performs exactly that exchange and finds a simpler invariant transition.

---

## 1. Five-diagonal input

After the structural prefix/certificate context

```text
D1 E1 A1 B1
```

and the best B-odd parity repair, the five uncovered P0 requirements are:

```text
A1-B2-C3-D4
B2-C3-D4-E5
A3-B4-C5-D6
A5-B4-C3-D2
B6-C5-D4-E3
```

Their minimum arbitrary singleton covers include:

```text
{B4,D4}
```

but `B4` conflicts with the inherited unconditional B-odd ownership reservation at `B3`.

Therefore repairing the diagonal family requires **replacing**, not merely extending, part of the old certificate.

---

## 2. Certificate exchange

Abandon the B-odd future reservations `B3,B5` and retain the physically occupied `B1`.

Add instead the exact even-row singleton blockers:

```text
B4
D4
```

These have the same generic blocker semantics as Claimeven-style singleton certificates.

Retain:

```text
E1
A even control: A2,A4,A6
C even control: C2,C4,C6
F even control: F2,F4,F6
G even control: G2,G4,G6
fixed D/E pair blockers
```

Mechanical coverage against all 69 geometric P0 winning lines now leaves exactly:

```text
A3-B3-C3-D3
A5-B5-C5-D5
```

All five diagonal defects are gone.

Thus the repair transition is not:

```text
5 diagonals -> safety
```

but:

```text
5 diagonals -> two horizontal defects.
```

---

## 3. Row-5 support-shadow discharge

For:

```text
A5-B5-C5-D5
```

the complete lower support shadow is:

```text
A4-B4-C4-D4.
```

Every shadow cell is now a certified P1 singleton:

```text
A4  from A-even control
B4  from the replacement certificate
C4  from C-even control
D4  from the replacement certificate
```

Therefore the previously proved support-shadow theorem applies:

```text
P0 owns all of A5-D5
=> P1 owns all of A4-D4 first
=> P1 completes A4-D4 before P0 can complete A5-D5
=> A5-D5 cannot be a P0 terminal win.
```

So row 5 is eliminated by first-win precedence.

---

## 4. Exact surviving defect

The row-3 line

```text
H3 = A3-B3-C3-D3
```

has lower shadow:

```text
A2-B2-C2-D2.
```

Only:

```text
A2,C2
```

are guaranteed by the current P1 certificate.

Neither `B2` nor `D2` is reserved to P1, so support-shadow preemption does not close `H3`.

Hence after static blocker closure plus support-shadow closure:

```text
exact unresolved family = {A3-B3-C3-D3}.
```

This gives the finite transition:

```text
H1
 -> five diagonals
 -> {H3,H5}
 -> H3.
```

The defect has moved from the bottom row to row 3 rather than disappearing.

---

## 5. Singleton repair of H3 is locally impossible without certificate exchange

The inherited singleton reservations around `H3` are:

```text
A2,A4
B4
C2,C4
D4
```

Therefore every cell of `H3` is immediately adjacent in its column to a reserved P1 ownership cell:

```text
A3 adjacent to A2/A4
B3 adjacent to B4
C3 adjacent to C2/C4
D3 adjacent to D4
```

An unconditional P1 ownership guarantee for any one of these row-3 cells is therefore incompatible with the current certificate unless another forced-response/race theorem is supplied: once the lower adjacent P1 cell is placed, the upper cell is exposed to P0 on the alternating turn, while guaranteeing the upper together with the lower also conflicts with ordinary alternating ownership.

Thus:

> **No direct unconditional singleton repair of the remaining row-3 defect can be added monotonically to the current certificate.**

Any repair must either:

1. exchange another existing certificate;
2. use a pair blocker;
3. use a contingent response relation;
4. use a race/preemption theorem.

This is precisely an NDC-style feedback seam rather than ordinary set cover.

---

## 6. Progress interpretation

The transition has a suggestive rank structure:

```text
row 1 horizontal defect
 -> mixed diagonal family
 -> row 3 horizontal defect.
```

The row index increased by two after a complete repair cycle.

This suggests, but does not yet prove, a possible well-founded progress measure based on vertical level:

```text
rho(H_r) = number of remaining odd horizontal levels at or above r
```

or an equivalent support-depth rank.

For a six-row board, odd horizontal levels are only:

```text
1,3,5.
```

If the same certificate-exchange mechanism can be shown to transform an unavoidable row-3 defect into either:

```text
row-5 defect
or immediate terminal/response overload,
```

then the finite height would give a natural termination argument.

This is now the strongest positive-calculus hypothesis.

---

## 7. Relation to PreE / PreA

The game-value shell remains:

```text
W = mu X . [ I union PreE(X) union PreA(X) ].
```

The emerging Connect-specific predecessor macro is not a single tactical rule. It is a **defect transformer**:

```text
safety defect D_r
+ adversarial repair
+ certificate exchange
+ blocker closure
+ support-shadow closure
=> safety defect D_{r+2} or terminal progress.
```

If this transformer is proved universal over all compatible repairs, it supplies the missing progress component needed to establish predecessor membership symbolically.

---

## 8. Evidence

Prototype:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/center_defect_lift.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-center-defect-lift.json
```

The control mechanically verifies:

- all 69 lines are geometry-derived;
- the replacement `B4,D4` certificate eliminates the five diagonal family;
- exactly row-3 and row-5 horizontals remain statically;
- the complete row-4 support shadow certifies row-5 preemption;
- row 3 lacks `B2,D2` shadow ownership and therefore survives;
- all four row-3 singleton repair cells are locally adjacent to inherited singleton reservations.

---

## 9. Claim boundary

### Established

- one exact certificate exchange closes the five diagonal B1-repair family;
- that exchange releases exactly two horizontal requirements;
- support-shadow preemption eliminates the row-5 requirement;
- exactly `A3-B3-C3-D3` remains after closure;
- every monotone unconditional singleton repair of that row-3 line conflicts locally with the current ownership reservations.

### Not established

- that every possible repair of the five diagonals must lead to the same row-3 defect;
- impossibility of pair or contingent repairs of `A3-D3`;
- a universal row-lifting theorem;
- that a row-3 repair necessarily produces row 5 or terminal overload;
- a complete symbolic proof of the center opening;
- any perfect-play terminal-line membership or cardinality.

## Next seam

Enumerate exact pair/response certificates capable of blocking `A3-B3-C3-D3` under the current support state.

For every compatible repair certificate, recompute the complete 69-line closure and classify the successor defect family.

The key falsifier is:

```text
exists repair of H3 that yields complete safety with no new defect?
```

If yes, the row-lift hypothesis fails.

If no, determine whether every repair either:

```text
reopens the five-diagonal family
or lifts the defect to row 5
or creates immediate response overload.
```

That is the next candidate symbolic progress theorem.
