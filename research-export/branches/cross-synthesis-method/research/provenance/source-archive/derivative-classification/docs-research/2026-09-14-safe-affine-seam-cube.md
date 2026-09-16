# Safe affine phase cubes and arbitrary-height seam composition

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Strengthen the one-move safe-entry and single-seam theorems into a compositional multi-seam theorem.

The pure-followup safe phase set is not merely a finite automaton language. Around every one-move setup column it contains a large coordinate-affine subspace. That subspace supplies a height-independent reservoir of seam columns whose phase flips may be composed in arbitrary order and at arbitrary seam heights without creating a geometric Connect-4, provided each such column is flipped at most once.

No solved outcome data is used.

## 1. Pure phase safety as a four-bit pattern exclusion

Let

```text
phi in F2^W
```

be a pure-followup column phase and

```text
d=delta phi.
```

For four consecutive phase bits

```text
(phi_i,phi_(i+1),phi_(i+2),phi_(i+3)),
```

we have

```text
d_i d_(i+1) d_(i+2) = 000
```

iff the four phase bits are constant:

```text
0000 or 1111.
```

Likewise

```text
d_i d_(i+1) d_(i+2) = 111
```

iff the four phase bits alternate:

```text
0101 or 1010.
```

Therefore pure-followup safety is exactly the local phase-word exclusion

```text
0000, 1111, 0101, 1010
```

on every four-consecutive-column window.

## 2. One-move safe entry means the setup column hits every four-window

For a one-move setup

```text
phi=e_c,
```

the previous safe-entry theorem gave

```text
max(0,W-4) <= c <= min(W-1,3).
```

This condition has a direct geometric interpretation:

> column `c` belongs to every generated four-consecutive-column horizontal window.

Indeed the leftmost window requires `c<=3`, and the rightmost window requires `c>=W-4`; intermediate windows are then also hit.

So a one-move safe entry is exactly a single marked column piercing every width-4 window.

## 3. Opposite-parity affine cube

Assume `c` is a one-move safe-entry column.

Let

```text
J_c={j : j mod 2 != c mod 2}.
```

Define

```text
C_c
  = e_c + span{e_j : j in J_c}.
```

Equivalently, every phase in `C_c` satisfies

```text
phi_c=1;
phi_j=0 for every j != c with j mod 2 = c mod 2;
all opposite-parity coordinates are arbitrary.
```

## 4. Affine-cube safety theorem

Take any four-consecutive-column window.

Because `c` belongs to every such window, the window contains:

- column `c`, whose phase bit is fixed to `1`;
- exactly one other column of the same parity as `c`, whose phase bit is fixed to `0`;
- two opposite-parity columns whose bits may be arbitrary.

The window therefore contains both a fixed `1` and a fixed `0` on positions of the **same coordinate parity**.

Consequences:

1. The four bits cannot be constant, because they already contain both `0` and `1`.
2. The four bits cannot alternate, because an alternating four-word has equal bits on equal-parity positions, while the two same-parity positions here are fixed oppositely.

Thus none of

```text
0000,1111,0101,1010
```

can occur in any four-window, independent of the arbitrary opposite-parity coordinates.

Therefore:

> **Safe affine-cube theorem.** For every one-move safe-entry column `c`, every phase in `C_c` is pure-followup-safe.

This is an all-width symbolic statement over the widths for which such a `c` exists; no phase enumeration is the proof.

## 5. Coordinate-subcube interpretation

`C_c` is a coordinate affine subspace of dimension

```text
|J_c|.
```

For the nontrivial widths `4<=W<=7` admitting one-move safe entry, this gives the familiar dimensions depending on the parity/location of the setup column.

For standard width 7 the unique setup is `c=3`, so

```text
J_3={0,2,4,6}
```

and

```text
C_3=e_3+span(e_0,e_2,e_4,e_6).
```

Hence

```text
dim C_3=4
|C_3|=16.
```

All 16 phase words are safe by the theorem, not by a finite check.

## 6. Multi-seam lifting theorem

Let `J` be any set of columns and suppose an affine phase cube

```text
phi + span{e_j : j in J}
```

is entirely pure-followup-safe.

For each `j in J`, choose at most one seam height `r_j`, arbitrarily and independently. Build a hybrid coloring that uses the original phase below `r_j` in column `j` and flips that column above `r_j`.

Consider any nonvertical four-line `ell`.

`ell` intersects each column at most once. For each seam column it intersects, the line cell lies either below or above that column's seam. Therefore the ownership pattern on `ell` agrees **exactly** with one pure phase obtained from `phi` by toggling the subset of seam columns whose intersection cells lie above their seam heights.

That subset phase belongs to the assumed-safe affine cube. Hence `ell` is safe.

In each individual seam column there is at most one vertical phase flip. As proved in the single-seam theorem, one vertical seam cannot create three consecutive zero vertical disagreement edges. Thus every vertical four-line is also safe.

Therefore:

> **Affine multi-seam theorem.** If a coordinate affine phase cube is contained in the pure-safe set, then placing at most one seam in each cube coordinate at arbitrary independent heights produces a globally Connect-4-free ownership coloring.

The seam heights and their ordering disappear from the geometric proof.

## 7. Standard 7x6/7xH implication

After the unique width-7 center setup, the four even columns

```text
0,2,4,6
```

form an exact four-dimensional safe seam reservoir.

A controller may insert one free-move seam in any subset of those columns, at arbitrary heights and in arbitrary order, and pure geometric safety is preserved automatically.

This does **not** prove a game result. It removes a large class of geometric seam-interaction checks from the remaining boundary problem.

The unresolved constraints are now narrower:

```text
can the required free move always be placed in an unused safe-cube column?
what happens when a safe-cube column must be used a second time?
how do top-defect counters and resource reservations constrain those choices?
when does the controller complete its own winning requirement before a defensive response is needed?
```

Those are support/capacity/deadline questions, not ordinary coloring safety inside the cube.

## 8. Why this is an isomorphism-friendly object

The safe reservoir is an affine binary code/subcube rather than a named Connect-4 rule:

```text
fixed same-parity skeleton
+ free opposite-parity coordinates.
```

Boundary free moves act as coordinate translations. Multi-seam geometry is safe because every local line projects to a cube vertex.

This makes the object directly comparable to affine subcodes, cubical complexes, binary constraint systems and switching classes without converting through named strategic-rule taxonomies.

## Next theorem target

Analyze the **second use** of a safe-cube column. Two seams in one column are no longer represented by one coordinate bit; their vertical separation becomes relevant. Classify that recurrence together with the defect-counter action.

An alternative successful closure would be to prove that a terminal own win must occur before all safe-cube coordinates can be exhausted, avoiding second-use analysis entirely.

## Proof boundary

Sections 1-6 are exact binary phase/domain-wall arguments. Section 7 identifies a standard-width consequence but makes no W/D/L claim. Finite enumerations may validate implementations of the cube but are not proof evidence.
