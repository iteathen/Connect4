# IsoMax Core 0.20 primitive semantic kernel 0.1

**Status:** execution candidate
**Owner:** `research/semantic-quotient`
**Work branch:** `work/isomax-core020-primitive-semantics-20260927`
**Author-local date:** 2026-09-27
**Parent strict checkpoint:** `ISOMAX_HOT_LOOP_GRAPH_0_4_CANDIDATE.*`
**Core authority:** `iteathen/IsoGraph@84e2f4d2386f9cd1a7b2c533752600eee82e44bf`,
Core 0.20 SHA-256
`9a619b552a6ef7719e5b4b5f3a9df4a732ff4377b9bc7b86c385ed5c992b88e7`

## 1. Purpose

Close the semantic roots required by the qualified IsoMax hot-loop graph without
using the current high-level `997xxx` Connect4 game-theory graph as a primitive
leaf.

This layer is deliberately smaller than the complete Connect4 corpus. It
contains exactly the mathematical/execution semantics needed to reconstruct the
hot-loop graph's retained exact claims:

1. support/legal gravity transition;
2. residual term and antichain semantics;
3. mover/blocker cofactors;
4. orientation-sensitive ordinary state `q_o`;
5. reflection-orbit relation `q_r` and action transport;
6. rank-well-founded ordinary W/D/L dependency;
7. advisory singleton-effect move ordering;
8. task-necessity control;
9. ranked q dependency;
10. the seven retained representation-equivalence claims.

Anything not needed by those claims remains outside this kernel rather than
being imported as a familiar domain concept.

## 2. Primitive dependencies

The native bundle may embed, rather than merely cite, the exact clauses from:

- `PRIMITIVE_LOGIC_KERNEL_0_1`;
- `PRIMITIVE_NATURAL_ARITHMETIC_0_5`;
- `PRIMITIVE_DATA_CONSTRUCTORS_0_5`.

These are supporting candidates, not promoted authorities. Their clauses are
part of the successor's own qualification burden.

No semantic meaning is inherited from their filenames or human labels.

## 3. Raw finite geometry

### 3.1 Columns, rows and cells

Use seven raw column values `c0..c6`, six raw row values `r0..r5`, and 42
raw cell values.

The cell-coordinate relation is the complete 42-tuple extension:

```text
CELL_COORD(cell(r,c), c, r)
for r in 0..5 and c in 0..6.
```

No arithmetic formula defines the board geometry.

### 3.2 Column reflection

Use the complete extension:

```text
c0 <-> c6
c1 <-> c5
c2 <-> c4
c3 <-> c3
```

Cell reflection is derived only from `CELL_COORD` plus this raw relation.

### 3.3 Above-cell relation

Use the exact finite extension:

```text
ABOVE(cell(r,c), cell(r+1,c))
for r in 0..4.
```

This is used by advisory ordering and does not import board arithmetic.

## 4. Support

A support object has exactly one height field for each physical column.
Heights are the natural numerals 0 through 6.

```text
SUPPORT_VALID(S)
iff
  for every column c
  there exists exactly one h in {0,...,6}
  with SUPPORT_AT(S,c,h).
```

`SUPPORT_AT` expands to the seven explicit support fields. It is not a hidden
map operation.

A column is playable exactly when its height is one of 0 through 5.

The landing cell is the unique raw cell whose column and row equal the selected
column and current height.

```text
LANDING(S,c,x)
iff
  SUPPORT_AT(S,c,h)
  and ROW(h)
  and CELL_COORD(x,c,h).
```

Support transition is extensional field replacement:

```text
SUPPORT_STEP(S,c,S')
iff
  LANDING(S,c,x)
  and for every column d:
      if d=c then height'(d)=succ(height(d))
      else height'(d)=height(d).
```

No mutation, packed integer, bit shift or array access belongs to this semantic
definition.

## 5. Rank and side to move

Support rank is the natural sum of its seven heights using the embedded
primitive addition relation.

```text
RANK(S,n) := h0+h1+...+h6=n.
```

Player values are two raw tokens `P0` and `P1`.

```text
SIDE(S,P0) iff exists k: k+k = RANK(S)
SIDE(S,P1) iff exists k,e: k+k=e and succ(e)=RANK(S)
```

The standard reachable range is 0..42, so exactly one branch holds.

For every `SUPPORT_STEP(S,c,S')`:

```text
RANK(S') = succ(RANK(S)).
```

This is the load-bearing well-founded measure for ordinary value recursion.

## 6. Residual term universe

The residual term carrier is finite.

Generate the 69 standard winning lines from fixed 7x6 geometry only for build
convenience, then freeze as raw data every distinct nonempty subset of every
winning line. The native authority contains:

- a raw term value for every distinct residual subset;
- `TERM_HAS(term,cell)` for every membership incidence;
- no hidden line, mask, set or cardinality semantics.

The generation script is not authority. The frozen extension is.

Derived relations are pure logic over `TERM_HAS`:

```text
TERM_EQ(t,u)
  iff forall cell x: TERM_HAS(t,x) <-> TERM_HAS(u,x)

TERM_SUBSET(t,u)
  iff forall cell x: TERM_HAS(t,x) -> TERM_HAS(u,x)

TERM_STRICT_SUBSET(t,u)
  iff TERM_SUBSET(t,u) and not TERM_EQ(t,u)

TERM_REMOVE(t,x,u)
  iff forall cell y:
        TERM_HAS(u,y)
        <->
        (TERM_HAS(t,y) and y != x)

SINGLETON(t,x)
  iff TERM_HAS(t,x)
      and forall cell y: TERM_HAS(t,y) -> y=x

DEGREE2(t,x,y)
  iff x != y
      and TERM_HAS(t,x)
      and TERM_HAS(t,y)
      and forall cell z: TERM_HAS(t,z) -> (z=x or z=y).
```

## 7. Residual antichains

A residual object is a raw predicate occurrence over the finite term carrier.
Application `A(t)` is only ordered incidence; no behavior is hidden in the
residual object's identity.

```text
RESIDUAL_VALID(A)
iff
  forall t: A(t) -> TERM(t)
  and
  forall t,u:
      A(t) and A(u) and t != u
      ->
      not TERM_STRICT_SUBSET(t,u)
      and not TERM_STRICT_SUBSET(u,t).
```

Residual equality is extensional:

```text
RESIDUAL_EQ(A,B)
iff forall t: A(t) <-> B(t).
```

This is the ordinary residual-content equality. It is not physical occurrence,
history or proof identity.

## 8. Mover cofactor

Immediate mover win:

```text
OWN_WIN(A,x)
iff exists t: A(t) and SINGLETON(t,x).
```

For a non-winning event define candidate relation:

```text
OWN_CANDIDATE(A,x,u)
iff
  (A(u) and not TERM_HAS(u,x))
  or
  exists t:
      A(t)
      and TERM_HAS(t,x)
      and not SINGLETON(t,x)
      and TERM_REMOVE(t,x,u).
```

The normalized cofactor contains exactly the inclusion-minimal candidates:

```text
OWN_TRANSITION(A,x,B)
iff
  RESIDUAL_VALID(A)
  and not OWN_WIN(A,x)
  and
  forall u:
      B(u)
      <->
      (
        OWN_CANDIDATE(A,x,u)
        and not exists v:
            OWN_CANDIDATE(A,x,v)
            and TERM_STRICT_SUBSET(v,u)
      ).
```

This expands the old phrase "positive residual cofactor followed by minimal
antichain normalization."

## 9. Blocker cofactor

Opponent terms containing the occupied cell disappear.

```text
BLOCK_TRANSITION(A,x,B)
iff
  RESIDUAL_VALID(A)
  and
  forall t:
      B(t)
      <->
      (A(t) and not TERM_HAS(t,x)).
```

Because a subfamily of an antichain is an antichain, no new normalization
operation is hidden here.

## 10. Ordinary q state

A q object has three semantic fields:

```text
SUPPORT
P0_RESIDUAL
P1_RESIDUAL
```

```text
Q_VALID(q)
iff
  SUPPORT_VALID(S)
  and RESIDUAL_VALID(A0)
  and RESIDUAL_VALID(A1)
  and q has exactly those three fields.
```

Orientation-sensitive equality is content equality:

```text
QO_EQ(q,t)
iff
  SUPPORT_EQ(Sq,St)
  and RESIDUAL_EQ(A0q,A0t)
  and RESIDUAL_EQ(A1q,A1t).
```

No physical-position, history, artifact or proof identity follows.

## 11. Ordinary q transition

For a legal landing `x` in column `c`:

If the mover is P0:

```text
IMMEDIATE(q,c,+1)
iff SIDE(S,P0) and OWN_WIN(A0,x).

Q_STEP(q,c,q')
iff
  SIDE(S,P0)
  and not OWN_WIN(A0,x)
  and OWN_TRANSITION(A0,x,A0')
  and BLOCK_TRANSITION(A1,x,A1')
  and SUPPORT_STEP(S,c,S')
  and q'=(S',A0',A1').
```

For P1 use `A1` as mover, `A0` as blocker and terminal value `-1`.

No q successor is constructed after an immediate win. This is first-win
stopping in primitive form.

If no legal column remains, ordinary value is draw 0.

## 12. Reflection and q_r

Reflection of support is extensional column transport:

```text
REFLECT_SUPPORT(S,T)
iff forall c,h:
  SUPPORT_AT(S,c,h)
  <->
  exists d: REFLECT_COLUMN(c,d) and SUPPORT_AT(T,d,h).
```

Reflection of a term:

```text
REFLECT_TERM(t,u)
iff forall y:
  TERM_HAS(u,y)
  <->
  exists x: TERM_HAS(t,x) and REFLECT_CELL(x,y).
```

Reflection of a residual:

```text
REFLECT_RESIDUAL(A,B)
iff forall u:
  B(u)
  <->
  exists t: A(t) and REFLECT_TERM(t,u).
```

Reflection of q applies these relations to all three semantic fields.

The semantic cache/orbit relation is:

```text
QR_EQ(q,t)
iff
  QO_EQ(q,t)
  or
  exists rt:
      REFLECT_Q(t,rt)
      and QO_EQ(q,rt).
```

Action transport is the raw column-reflection relation whenever the reflected
branch is used.

This defines the orbit relation directly. No canonical numeric representative,
hash, slot or pool-local class ID participates in semantic equality.

## 13. Ordinary W/D/L dependency

Values are three raw tokens with exact finite order:

```text
-1 < 0 < +1.
```

Action outcome:

```text
OUTCOME(q,c,v)
iff
  IMMEDIATE(q,c,v)
  or
  exists q': Q_STEP(q,c,q') and VALUE(q',v).
```

Draw base:

```text
NO_LEGAL(q) -> VALUE(q,0).
```

P0 node:

```text
VALUE(q,v)
iff
  SIDE(q,P0)
  and exists legal c: OUTCOME(q,c,v)
  and forall legal d,w:
      OUTCOME(q,d,w) -> w <= v.
```

P1 node reverses the inequality.

The recursion is admitted only with the explicit support-rank proof:

```text
Q_STEP(q,c,q') -> RANK(q') = succ(RANK(q))
RANK(q) <= 42.
```

Therefore recursive dependencies strictly approach the finite rank-42 boundary.
No generic "minimax" or "recursion" primitive is used.

## 14. Reflection/value theorem support

The native proof-support graph must expose these lemmas separately:

1. reflection is involutive on columns, cells, supports, terms, residuals and q;
2. reflection preserves support legality;
3. mover/blocker cofactors commute with reflection;
4. every q transition transports to exactly one reflected q transition with the
   reflected action;
5. immediate terminal token is reflection-invariant;
6. rank is reflection-invariant;
7. by induction on remaining rank, `QR_EQ(q,t)` implies equal ordinary value.

Only the last item is the derived cache/value theorem. The six lower items are
its primitive/inductive support, not prose justification.

## 15. Advisory singleton-effect ordering

Ordering is explicitly non-value authority.

Let `ABOVE(x,y)` be the raw finite relation and `PLAYABLE(S,y)` mean y is
the current landing cell of its column.

For a candidate move with landing cell x:

- if the cell immediately above x is an opponent singleton, effect class = 0;
- otherwise collect distinct own completion cells from:
  - an own singleton immediately above x;
  - every own degree-two residual containing x whose other member is playable
    now or is immediately above x;
- zero distinct completion cells -> class 0;
- one -> class 1;
- two or more -> class 2.

`CENTER_ORDER` is the raw sequence:

```text
3,2,4,1,5,0,6.
```

`PROMOTED_COLUMN` is the first legal column in that sequence attaining the
maximum effect class. This is deterministic advisory order only.

## 16. Task necessity / DTS slice

Task control is a finite transition/output relation over:

```text
abort flag
needed flag
entered node count
node budget
poll delta
```

Precedence is exact:

```text
abort=true                 -> ABORTED
abort=false, needed=false  -> RETIRED
abort=false, needed=true,
nodes>=budget              -> SPLIT
otherwise                  -> CONTINUE.
```

For CONTINUE:

```text
next_control = min(budget, nodes + 512).
```

The numeral 512 must be represented as a natural term in the native bundle;
the label "512" alone is not arithmetic authority.

Worker-thread timing, JIT tier, OS scheduling and when another process changes
the shared flags remain QU. The transition relation consumes the observed flag
values at the check occurrence and does not invent a schedule.

## 17. Ranked q dependency

The ordinary dependency graph uses q occurrences as nodes and legal
`Q_STEP` incidences as directed edges.

```text
edge(q,q') -> rank(q') = succ(rank(q))
```

so the graph is acyclic by the same finite-rank measure.

Manager task occurrences remain distinct occurrences even when projected to the
same `QR_EQ` class.

Value completion may share exact scalar value under `QR_EQ`; occurrence or
proof identity is not merged.

## 18. Retained representation-equivalence semantics

### 18.1 Prepared hash carriage

A 32-bit word is represented by exactly one Boolean bit at each of 32 raw bit
positions.

Signed and unsigned numeric views are separate representation occurrences.

```text
PI32_EQ(a,b)
iff forall bit position i: BIT(a,i)=BIT(b,i).
```

The prepared locator claim is restricted to consumers whose result is a
function only of those 32 bits. No numeric-magnitude equality is claimed.

### 18.2 Isolated-bit carriage

```text
ISOLATED_BIT(w,i)
iff bit i = 1 and every other bit = 0.
```

Two signed/unsigned views with equal 32 bits therefore yield the same isolated
bit index. The Core-0.20 semantic claim does not require the name
`Math.clz32` as a leaf.

### 18.3 42-cell mask precomputation

Freeze the complete raw extension mapping each of 42 cells to its two 32-bit
mask halves.

The runtime-arithmetic view and precomputed-table view are equivalent exactly
when both reconstruct that same extension.

### 18.4 Degree-two pair incidence

Freeze the complete semantic extension:

```text
PAIR_INCIDENCE(cell, degree2_term, other_cell).
```

Object-record and flat-array realizations are representation views over the
same extension.

### 18.5 Singleton projection

```text
HAS_SINGLETON_AT(A,x)
iff exists t: A(t) and SINGLETON(t,x).
```

A residual scan and fixed-vocabulary direct projection are equivalent only in
that exact predicate scope.

### 18.6 Cold helper relocation

Define `GROW_SEQUENCE(src,n,dst)` by indexed contents:

- destination length is n;
- every source index preserves its exact value;
- newly added indices carry the exact zero/default value.

Nested versus module-scope helper occurrence is irrelevant to this semantic
relation. Runtime/JIT cost remains QU.

### 18.7 Preparation-order equivalence

Define two content-preserving transforms:

- `GROW`: capacity changes, existing logical values preserved;
- `WIDEN`: storage width changes, represented logical values preserved.

For admitted inputs where both transforms are defined:

```text
CONTENT_EQ(WIDEN(GROW(x)), GROW(WIDEN(x))).
```

Only final logical storage content is claimed equal. Physical allocation,
address, timing and machine representation are not.

## 19. QU retained by design

The following do not block primitive semantic closure because the unknown itself
is represented:

- V8/JIT lowering details not fixed by source/runtime pins;
- dynamic branch/cache/instruction cost not observed;
- cross-worker workload-distribution economics;
- OS scheduling and timing;
- physical allocation/address identity where no exact claim requires it.

Known observations inside those regions must remain raw facts. Missing
observations are not zeros.

## 20. Qualification gates

A successor may close a 0.4 `QU_UNEXPANDED` root only if:

1. its native definition uses only Core K0-K6 roles plus embedded primitive
   support;
2. deleting its human/domain label leaves the truth conditions reconstructable;
3. adversarial relabeling leaves primitive support unchanged;
4. every finite raw extension is checked against an independent generator or
   source invariant;
5. every recursive relation has an explicit base, step and well-founded
   measure;
6. reflection/value reuse has an explicit transporter and induction support;
7. task control preserves QU around external scheduling/timing;
8. no representation equivalence expands into a stronger identity statement;
9. the 0.3 source/evidence blobs remain immutable;
10. fresh controls independently reconstruct each closed semantic root.
