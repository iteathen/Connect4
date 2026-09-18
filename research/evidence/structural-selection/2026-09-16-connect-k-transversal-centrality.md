# Connect-K interval transversals, safe entry, and initial-event centrality

**Research direction / structural architecture:** Josh Oshiro  
**Formalization / qualification:** OpenAI ChatGPT  
**Date:** 2026-09-16

## Classification

Deductive structural result. No solved W/D/L table, move-tree search, opening book, strong-distance oracle, or terminal-line census is used as a premise.

This note generalizes the K=4 safe-entry theorem and relates it exactly to empty-board requirement incidence. The purpose is to strengthen the structural half of the still-open semantic selection bridge.

Affected claims: `C4-R0070`, `C4-R0071`.

---

## 1. Pure-followup ownership for general K

Use the pure-followup ownership field

```text
q(c,r)=a+r+phi(c) mod 2.
```

Adjacent cells in one column have opposite owners, so no vertical monochromatic K-line exists for `K>=2`.

For a horizontal K-line across columns `s,...,s+K-1`, row is constant, so the ownership word is monochromatic iff

```text
phi(s),...,phi(s+K-1)
```

is constant.

For either diagonal orientation, row parity changes on every one-column step. Therefore the ownership word is monochromatic iff the phase word alternates:

```text
0101...  or  1010....
```

Thus the exact pure-followup bulk safety language for Connect-K is:

> every consecutive K-column phase window is neither constant nor alternating.

This specializes to the earlier K=4 exclusion of `0000`, `1111`, `0101`, `1010`.

---

## 2. One setup move is a singleton transversal

After one setup move in column `c`:

```text
phi=e_c.
```

Consider a consecutive K-column window.

- If it omits `c`, its phase word is `0^K`, so it creates an unsafe horizontal monochromatic K-line in the eventual pure-followup coloring.
- If it contains `c`, its phase word has exactly one `1` and `K-1` zeros. It is nonconstant. For `K>=4`, an alternating K-word contains at least two `1`s and at least two `0`s, so the one-hot window is not alternating either.

Therefore, for `K>=4`, the setup is pure-followup-safe iff `c` belongs to every consecutive K-column window.

Define the interval hypergraph

```text
H_{W,K}:
  vertices = {0,...,W-1}
  hyperedges E_s={s,...,s+K-1},  s=0,...,W-K.
```

Then the one-move safe-entry columns are exactly the singleton transversals of `H_{W,K}`.

If `W<K`, there are no horizontal/diagonal K-windows; every column is safe for this bulk coloring.

For `W>=K`, the intersection of all hyperedges is

```text
intersection_s E_s = [W-K, K-1].
```

Hence

```text
K <= W <= 2K-1:
  S_safe = {W-K,...,K-1}
  |S_safe| = 2K-W;

W >= 2K:
  S_safe = empty.
```

The safe-entry set is a singleton iff

```text
W=2K-1,
```

with unique column

```text
c=K-1.
```

For K=4 this reproduces exactly:

```text
W=4 -> {0,1,2,3}
W=5 -> {1,2,3}
W=6 -> {2,3}
W=7 -> {3}
W>=8 -> empty.
```

This gives the K=4 safe-entry theorem a standard mathematical identity: it is an interval-hypergraph transversal theorem.

### Boundary of the theorem

For `K=3`, a one-hot window can equal `010`, which is alternating, so the simple transversal equivalence is false without an extra position condition. `K=2` is also degenerate. The claim is therefore intentionally scoped to `K>=4`.

---

## 3. General initial bottom-event requirement impact

Assume `W,H>=K`. On the empty board the only legal events are bottom cells.

Let

```text
h_{W,K}(c)
```

be the number of horizontal consecutive K-windows containing column `c`.

The bottom event `(c,0)` belongs to exactly:

```text
1                         vertical K-line
+h_{W,K}(c)               horizontal K-lines
+I(c <= W-K)              one rising diagonal endpoint line
+I(c >= K-1)              one falling diagonal endpoint line.
```

Thus

```text
d_{W,K}(c)
 = 1+h_{W,K}(c)+I(c<=W-K)+I(c>=K-1).
```

This is exact line incidence, not an evaluator.

Let

```text
n=W-K+1
```

be the number of horizontal K-windows.

### Case A: K <= W < 2K-1

Then `n<K`. The horizontal incidence maximum is `n`, attained exactly on the transversal interval

```text
[W-K,K-1]=[n-1,K-1].
```

The two endpoints receive one diagonal endpoint bonus each. Interior points receive none. Outside points have horizontal incidence at most `n-1` and at most one diagonal endpoint bonus.

Therefore the **only** maxima of `d` are

```text
c=W-K
c=K-1.
```

They are distinct because `W<2K-1`.

### Case B: W=2K-1

The transversal interval collapses to

```text
c=K-1.
```

This event lies in all `K` horizontal windows and is the endpoint of one diagonal of each orientation. Hence

```text
d(K-1)=1+K+2=K+3.
```

Every other column has smaller horizontal incidence and at most one diagonal endpoint bonus. The center is the unique maximum.

### Case C: W>2K-1

Horizontal incidence reaches its full value `K` on the central interval

```text
[K-1,W-K].
```

Every column in that interval receives both diagonal endpoint bonuses, so all have

```text
d=K+3.
```

The interval contains at least two columns. Therefore the maximum is not unique.

Combining the cases:

> For `W,H>=K`, the initially legal bottom-event requirement impact has a unique maximizer iff `W=2K-1`, at `c=K-1`.

For K=4 this reproduces the earlier exact profiles:

```text
W=4 maxima {0,3}
W=5 maxima {1,3}
W=6 maxima {2,3}
W=7 maximum {3}
W>=8 central plateau.
```

The earlier K=4 note is therefore consistent; safe-entry and impact are different sets on W=4 and W=5 and coincide only progressively as the transversal interval narrows.

---

## 4. Exact joint-centrality theorem

For `K>=4` and `W,H>=K`:

```text
unique singleton transversal of H_{W,K}
<=> unique one-move pure-followup safe entry
<=> W=2K-1
<=> unique maximum-impact initially legal event.
```

All four identify the same center

```text
c=K-1.
```

This is a genuine decomposed-invariant correspondence:

1. **source objects:** consecutive K-column interval hypergraph and one-hot phase setup;
2. **target objects:** safe pure-followup entry and initial bottom-event incidence profile;
3. **mapping:** column identity `c`;
4. **preserved relations:** membership in every K-window; one-hot phase position; requirement incidence counts;
5. **discarded information:** finite height/top defects, legal future response availability, residual ownership state, deadlines, opponent policy;
6. **reconstructibility:** exact at the stated geometric/bulk-safety level;
7. **legality guard:** only the setup move itself is currently legal; continued pure followup requires response availability through the chosen horizon;
8. **transition commutation:** not established through finite boundary defects;
9. **proof/certificate commutation:** bulk no-loss certificate only; game-value/strong-distance certificate not established;
10. **failure cases:** K=3 one-hot alternating window; W>=2K no singleton transversal; finite top boundary can break same-column response availability.

This passes the decomposed-isomorph discipline: the objects are related by explicit incidence membership, not by matching cardinalities.

---

## 5. K=4 route to standard 7x6 structural 28

Specialize `K=4`.

The joint-centrality theorem gives

```text
W=2K-1=7.
```

Independently, the already-proved regular K=4 line/cell core-balance equation is

```text
(W-4)(2H-9)=9.
```

Substitute `W=7`:

```text
3(2H-9)=9
H=6.
```

The standard structural core then has

```text
Y_cell=Y_line=28.
```

Thus one can derive the standard board and its target-free structural 28 from:

```text
K=4
+ unique interval-transversal/safe-entry/impact center
+ exact line/cell core balance
-> W=7,H=6,Y=28.
```

No recursive game search and no strong-play terminal-line count is used.

This is a stronger answer to the geometric question “why does 28 arise here?” It is **not** yet an answer to “why does distance-optimal play expose exactly 28 terminal lines?” Those are distinct claims.

---

## 6. What remains in the semantic-selection theorem

The current gap is now narrower than “find a formula for 28.”

The structural side proves that standard 7x6 is the unique regular K=4 board where:

```text
line/cell cores balance;
one setup column pierces every horizontal K-window;
that same setup is the unique safe pure-followup entry;
that same event uniquely maximizes immediate requirement impact;
the phase path also has the same unique center.
```

The semantic side still must prove:

```text
value-/distance-optimal P0 can select this center observation;
AND
optimal P1 delay preserves the relevant phase/deadline structure long enough to reach the rank-5 center-stack extremum;
AND
that extremum's surviving envelope maps to the strong-play terminal provenance object.
```

The first missing edge is a strategy-factorization/controllable-predecessor theorem, not another equality of dimensions.

---

## 7. Falsifiers

Revise C4-R0070 if a `K>=4` one-hot setup column hits every K-window but the corresponding pure-followup coloring contains a monochromatic K-line, or if a safe one-hot setup omits some K-window.

Revise C4-R0071 if, for any `W,H>=K`, the stated impact formula miscounts a bottom event, or if `d_{W,K}` has a unique maximizer at any width other than `2K-1`.

Do not use finite game outcomes to patch either theorem; a counterexample must change the structural proof.
