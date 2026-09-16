# Single-seam safety and local phase-toggle admissibility

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Prove the first nontrivial finite-boundary closure step in the pure-followup/domain-wall calculus.

A free controller move after a top defect flips one column phase above its landing row, creating one vertical seam. This note proves an exact sufficient-and-necessary bulk-side condition for that one seam to preserve geometric no-win safety: both pure phases on either side of the seam must be safe.

The result is independent of seam height and board height.

## 1. Two pure phases differing in one column

Let

```text
phi in F2^W
```

be a pure-followup column phase and choose column `j`.

Define

```text
phi' = phi + e_j.
```

Let the corresponding pure ownership colorings be

```text
q_phi(x,y)  = a + y + phi(x)
q_phi'(x,y) = a + y + phi'(x).
```

They differ only in column `j`, where every cell owner is complemented.

Assume both pure phases are safe, equivalently

```text
d=delta phi
```

and

```text
d'=delta phi'=d+delta e_j
```

contain neither `000` nor `111`.

## 2. Hybrid single-seam coloring

Choose any seam row `r` and define

```text
q(x,y)=q_phi(x,y)              for x != j
q(j,y)=q_phi(j,y)              for y < r
q(j,y)=q_phi'(j,y)             for y >= r.
```

Thus only column `j` changes phase, and it changes exactly once.

This is the ownership field produced by one free move in column `j` followed by re-entry into same-column pure followup, abstracting away the support/deadline conditions that made the free move available.

## 3. Nonvertical lines

A horizontal or diagonal Connect-4 line intersects any fixed column at most once.

Take an arbitrary nonvertical four-line `ell`.

- If `ell` does not intersect column `j`, then `q_phi=q_phi'` on every cell of `ell`, so the hybrid line is one of the already-safe pure lines.
- If `ell` intersects column `j` at a cell below `r`, then that cell uses `q_phi`; every other cell is in a different column where `q_phi=q_phi'`. Hence the entire hybrid line agrees cell-for-cell with `q_phi` on `ell`.
- If the intersection cell is at or above `r`, the same argument shows the entire hybrid line agrees cell-for-cell with `q_phi'` on `ell`.

Therefore every horizontal and diagonal line is safe because it is exactly a line from one of the two assumed-safe pure colorings.

## 4. Vertical lines

Every column other than `j` remains a pure alternating column and therefore cannot contain four equal owners.

In column `j`, ownership alternates below the seam and alternates above the seam. At the seam boundary itself the phase flip changes the ordinary opposite-owner edge into one same-owner edge.

So the vertical disagreement sequence in column `j` is

```text
... 1,1,1, 0, 1,1,1 ...
```

with at most one zero.

A vertical Connect-4 would require three consecutive zero disagreement edges. That is impossible.

Therefore no vertical win is introduced by the seam.

## 5. Single-seam theorem

Combining the two cases:

> **Single-seam safety theorem.** If `phi` and `phi+e_j` are both pure-followup-safe, then a single phase seam in column `j` at any row produces a geometrically Connect-4-free hybrid coloring.

The proof is symbolic and independent of `W,H,r` except for the existence of the relevant cells.

This is a geometric theorem. A game-strategy use still requires the free move to be legal and the response relation to hold before any earlier terminal deadline.

## 6. Local toggle test

Toggling column `j` changes the derivative word only by

```text
d' = d + delta e_j.
```

`delta e_j` is supported only on the one or two width-path edges incident to column `j`.

If `d` is already safe, every length-three derivative window disjoint from those incident edges remains unchanged and safe.

Therefore to decide whether the new phase is safe, it is sufficient to inspect only length-three derivative windows whose support intersects an edge incident to `j`.

This is a bounded neighborhood test independent of board width.

So a boundary free-move candidate has a local exact bulk-admissibility predicate rather than requiring recanonicalization of the whole phase word.

## 7. Why multiple seams are the next real problem

The theorem relies on the fact that a nonvertical four-line intersects the changed column only once and therefore sees one globally consistent pure phase.

With seams in multiple columns, one four-line can intersect several independently flipped columns at different seam heights. It can then see a mixture that is not equal to any one global pure phase.

Thus the first seam closes exactly; interactions among two or more nearby seams are the first genuinely new geometric boundary object.

The domain-wall normal form handles those interactions through the local seam masks and derived diagonal edge rows.

## Next target

Classify the two-seam interaction up to neighborhood-preserving isomorphism. Because a Connect-4 line spans at most four columns and four rows, only relative column separation `<=3` and relative seam-height separation `<=3` can create a shared geometric interaction. All more distant seam pairs factor geometrically.

This should yield a finite catalog of local seam-interaction types independent of total `W,H`.

## Proof boundary

The theorem follows directly from the two pure-followup colorings and the fact that a nonvertical line intersects one column at most once. No finite board census or solved outcome is used. Support legality and NDC timing remain separate prerequisites for strategy use.
