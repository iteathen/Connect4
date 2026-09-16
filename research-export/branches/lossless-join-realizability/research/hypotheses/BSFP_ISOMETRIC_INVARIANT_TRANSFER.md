# BSFP–Isometric invariant-transfer candidates

**Status:** live hypotheses / experiment inventory. Nothing in this note is solver authority unless already covered by a cited exact/guarded claim.

**Research direction:** Josh Oshiro.

## Provenance rule

BSFP improvement work distinguishes three information sources:

1. **static exact structure** derived from rules, geometry, algebra, support, parity, or proved logic — may drive solver semantics;
2. **runtime-earned exact facts** produced by the running solver/search/proof process — may become premises for the remainder of that run;
3. **external/precomputed solved knowledge** — qualification/falsification only and may not become solver premises.

Thus the externally qualified optimal-play `28` and solved-horizon board bounds are not admissible as built-in BSFP knowledge. Independently derived structural `28` objects remain admissible only with their actual semantics.

## Cross-lineage observation

The Isometric theorem lane and BSFP lane appear to attack the same missing composition problem from opposite directions.

Isometric currently reduces the missing game content to guarded composition of exact cofactors through:

```text
support / accessibility
+ universal opponent intervention
+ shared response resources
+ deadlines / event precedence
+ first-win stopping
-> certified obligation / bound.
```

BSFP's direct line-hit/product lane has a corresponding missing requirement:

```text
compact support-local realizability
+ exact move preimages
+ terminal subtraction
+ existential/universal predecessor composition
-> exact symbolic recurrence without reconstructing ownership.
```

The candidates below are ordered by epistemic strength rather than implementation preference.

---

## A. Unconditional exact reduction candidates

### A1. Horizontal-reflection orbit quotient

Horizontal reflection is an exact automorphism of rectangular Connect-4 geometry and gravity. For the empty standard 7×6 root, work may be organized over reflection orbits rather than duplicating left/right representatives.

Exact geometry census:

```text
support vectors:                 7^7 = 823,543
reflection-fixed supports:       7^4 = 2,401
support reflection orbits:       (823,543 + 2,401) / 2 = 412,972

geometric winning lines:         69
reflection-fixed line IDs:       3
line reflection orbits:          36

WSL nonempty residual masks:     625
reflection-fixed residual masks: 43
residual reflection orbits:      334
```

At rank 21, the support schedule has 60,691 raw supports and 30,400 reflection orbits.

Candidate implementation form:

```text
canonical support representative
+ orientation/reflection action
+ reflected frontier/line/residual ID mapping.
```

For a reflection-fixed support, the symbolic boundary itself is reflection-invariant as a set; record-level orbit compression is a separate qualification question.

Falsifier: any operation whose canonicalized result cannot be reflected back to exactly the unquotiented recurrence.

### A2. Legal ownership-cardinality slice pruning

At support rank `r`, a legal game prefix has exactly

```text
k0 = ceil(r/2)  P0 stones
k1 = floor(r/2) P1 stones.
```

For a root-only legal solve, an upward P0-Win generator `g` cannot intersect the legal ownership slice when

```text
|g| > k0.
```

A downward P0-Loss cap `c` cannot intersect the legal ownership slice when

```text
|c| < k0.
```

These irrelevance conditions are preserved by the existing cofactor, union, intersection and terminal-subtraction operations: predecessor cofactors never turn an already slice-disjoint cone into one intersecting the predecessor legal slice; OR-products only enlarge upward generators; AND-products only shrink downward caps; terminal subtraction moves in the same irrelevant direction.

Hypothesis: a **slice-aware root-only BSFP mode** can discard such records before Cartesian materialization while preserving the empty-root W/D/L result.

This intentionally changes the solved symbolic domain from "all ownership assignments at every support" to the legal cardinality slice needed by the root recurrence. The full C1 symbolic domain remains the qualification oracle.

Strong control: complete small games must match both the full symbolic C1 root and exhaustive legal-state W/D/L.

### A3. Fixed-fact cone feasibility

If exact static or runtime-earned certificates fix occupied cells `F0` to P0 and `F1` to P1 at a support with legal P0 count `k`, feasibility becomes cheaper still.

Upward generator `g` can intersect the feasible ownership family only if

```text
g ∩ F1 = empty
and
|F0 union g| <= k.
```

Downward cap `c` can intersect it only if

```text
F0 subset_of c
and
|c \ F1| >= k.
```

These are exact pre-materialization rejection tests.

Generalization target: replace fixed bits by the Isometric affine/clause constraint store and reject a BSFP cone whenever the cone plus current guarded constraints is unsatisfiable.

---

## B. Concrete bridge to the BSFP realizability gap

### B1. Exact `(support,H0,H1)` realizability as affine/clause satisfiability

For fixed support `S`, let `O_lambda = S ∩ lambda` be the occupied cells on geometric line `lambda`. `H0(lambda)` and `H1(lambda)` mean that P0/P1 owns at least one cell of `O_lambda`.

For every line, the requested hit pair has an exact local Boolean interpretation:

```text
O_lambda = empty:
  only (H0,H1)=(0,0) is realizable.

O_lambda != empty, (1,0):
  every v in O_lambda is P0.            // affine units

O_lambda != empty, (0,1):
  every v in O_lambda is P1.            // affine units

O_lambda != empty, (1,1):
  at least one P0 occurs in O_lambda
  and at least one P1 occurs in O_lambda. // blocker clause against each player

O_lambda != empty, (0,0):
  impossible.
```

The conjunction over all lines is **necessary and sufficient** for an ownership assignment to induce the requested line-hit pair, because these clauses are simply the exact definitions of the two hit predicates under fixed support.

Therefore the support-local realizability problem behind the direct line-product recurrence can be stated entirely in the current Isometric primitive vocabulary:

```text
pairwise/anchored ownership facts
+ player-relative monotone blocker clauses
(+ exact legal cardinality when solving only legal slices).
```

This is not yet a claim that realizability can be maintained cheaply or that affine closure alone decides every instance. It removes the ambiguity about what hidden relation must be preserved.

First experiment:

1. encode every `(support,H0,H1)` class on complete small controls into the exact unit/clause formula above;
2. compare formula satisfiability against enumerated quotient realizability;
3. derive parent preimages symbolically under one landing event;
4. compare resulting realizable parent classes against the existing quotient oracle;
5. measure clause/affine state after normalization.

### B2. Constrained line-hit recurrence rather than arbitrary product closure

For P0 landing at `x`:

```text
H0_child = H0_parent OR I(x)
H1_child = H1_parent.
```

For P1 the roles swap.

The inverse is set-valued on line bits incident to `x`. Instead of taking an arbitrary Cartesian preimage, retain the Isometric realizability formula as the compatibility relation on those alternatives.

This is a candidate direct solution shape for C4-R0043:

```text
line-hit boundary
+ compact affine/clause realizability descriptor
-> exact relational preimage
-> existential/universal BSFP composition.
```

If the descriptor grows to ownership-equivalent complexity, the candidate fails as a compression even though it remains logically exact.

---

## C. Isometric proof mechanisms that can seed or contract BSFP

### C1. Six-element W/D/L interval fixed point

Isometric's interval predecessor calculus uses exactly six noncontradictory intervals:

```text
[-1,+1] unresolved
[-1, 0]  P0 cannot win
[ 0,+1]  P1 cannot win
[-1,-1]  exact P1 win
[ 0, 0]  exact draw
[+1,+1]  exact P0 win.
```

BSFP currently centers exact P0-Win/P0-Loss boundaries. Candidate: allow exact structural certificates to seed the two one-sided no-win regions and propagate interval bounds backward before all exact values are known.

Potential benefit: a no-win proof can eliminate candidate work without proving the opposite player has a win.

Qualification requirement: prove the monotone frontier orientation of the two intermediate regions under the selected BSFP state order and verify interval predecessor aggregation against exact complete controls.

### C2. Guarded affine/clause closure as candidate prefilter

Isometric already provides an exact consequence language:

```text
pairwise affine ownership constraints
+ positive blocker clauses
+ residual targets
+ support/resource guards
+ min-max earliest certification ranks
+ first-win semantics.
```

Candidate BSFP placement:

```text
support/rank arrives
-> saturate cheap exact guarded closure
-> derive fixed owners / impossible residuals / one-sided no-win bounds
-> reject infeasible cones and products
-> run ordinary BSFP only on the unresolved residue.
```

The closure is a reducer/certificate source; failure to prove a fact leaves ordinary BSFP work intact.

### C3. Typed resource-cut antichains

The Isometric response-channel calculus proves that feasible preservation families of typed response-resource contracts are downward closed and therefore exactly representable by maximal antichains.

This has the same structural shape as BSFP boundary compression.

Candidate: compile a qualified `NoCompatibleCover` / response-capacity cut into a one-sided interval certificate and inject it into BSFP before child-product generation.

This is especially attractive because alternative certificate families are reduced by antichain operations rather than legal-move recursion.

### C4. Forced-response macro edges

When exact closure proves all but one response lose immediately, the predecessor is not a genuine decision. Isometric's interval calculus and current tactical singleton theorem both justify this shape.

Candidate: collapse qualified forced-response chains into macro predecessors in BSFP, potentially skipping intermediate support ranks for those symbolic regions.

Guard: macro composition must preserve first-win stopping, support, resource and terminal alternatives. An ordinary same-column pair is not a macro merely because its parity effect is neutral.

---

## D. Isometric matching as an execution-reuse principle

### D1. Claim-relative transformation reuse

O3 already proves one instance:

```text
same exact residual pair + same input
-> compute cofactor once
-> map across many crossing occurrences.
```

Isometric claim-relative event isomorphism generalizes the principle:

```text
same load-bearing dependency cone for observation O
-> reuse the theorem/transform for O
```

without asserting full state equality.

Candidate BSFP observations to canonicalize separately:

- residual cofactor;
- terminal-line injection/subtraction;
- cone-feasibility rejection;
- blocker-clause normalization;
- response-capacity cut;
- interval-bound predecessor;
- reflection transport.

This suggests **operation-specific dense IDs**, not one universal state quotient.

Falsifier: two instances assigned one operation signature but requiring different outputs for that declared observation.

### D2. Cross-support behavioral identity

Existing semantic minimization showed some exact future-equivalent classes cross support/rank boundaries, while the maintained residual frontier requires identical support and side-to-move before comparison.

Candidate: identify the weakest exact accessibility/transition signature required by the BSFP operation being performed, instead of making raw support ID an unconditional identity field.

This is higher risk than D1 because it approaches state identity rather than theorem reuse. Require exact transition/output congruence, not equal scores alone.

---

## E. Existing BSFP quotient/compiler work reinterpreted through Isometric

### E1. Separator hidden history = minimal compatibility memory

The separator census showed crossing ownership alone is insufficient for the full symbolic C1 function, while a small additional exact residual-history class was enough on tested controls. Processed-line viability was sufficient but much wider than the behavioral quotient.

Interpretation: this is another concrete measurement of the compatibility information that Isometric calls load-bearing context.

Candidate: derive the hidden-history class from the affine/clause realizability descriptor or from a claim-relative dependency cone, then compare to the canonical residual-function class.

### E2. R3/R4/R6 dense transfer quotient

The qualified transfer work shows that once the exact semantic class is known, it can be represented by small dense layer-local IDs and pointer-free flat transition tables; R6 further shows those classes can be synthesized incrementally rather than rebuilt from forgotten histories.

This remains a strong runtime form after the logical state is improved. New proof-side reductions should aim to reduce the number/width of exact classes feeding this representation rather than replace the flat representation without evidence.

### E3. Device grouping/chaining

O3 still leaves exact output grouping, variable-length compaction, dense next IDs and device chaining open. These are generic execution mechanisms; residual equality and all proof semantics remain Connect4-owned.

Reflection canonicalization, claim-relative transform IDs and constraint-aware filtering should occur before or during grouping so generic CUDA work is spent only on surviving semantic classes.

---

## F. Static 28/69 and derivative/quiver candidates

### F1. Structural 28 is a representation clue, not a line whitelist

The searchless `Y_line=Y_cell=28` on 7×6 and the `69 = 28 + 6 + 28 + 7` A4 decomposition may justify a factored coordinate system. They do **not** justify deleting 41 geometric terminal axioms.

Candidate experiment: project exact BSFP residual/line-hit states into the A4 sectors and measure which additional compatibility data is required to recover transition/terminal behavior exactly.

### F2. Derivative-generated incidence

K=4 line geometry is generated by the exact third-difference algebra, including derived diagonal relations. This can generate/index incidence without treating each of 69 lines as unrelated data.

However positive OR/AND residual semantics are not GF(2) span semantics. Any attempt to replace positive residual incidence by a linear basis is explicitly falsified unless the missing nonlinear information is retained.

---

## G. Runtime exact-search certificates

Runtime search is allowed to create exact premises because its cost and proof are part of the running algorithm. External solved facts are not.

Candidate hybrid policy:

```text
choose a narrow exact query
-> obtain a bound / forced event / fixed owner / deadline / terminal horizon
-> convert it to a typed certificate
-> contract BSFP through the exact mechanisms above
-> continue fixed point.
```

Selection metric:

```text
BSFP candidate/proof work eliminated
------------------------------------
runtime cost of obtaining certificate
```

Over time, repeated runtime-search certificates are training/falsification material for Isometric: when a common invariant explanation is proved, replace that query by the new searchless law.

---

## Initial experiment priority

1. **A2 legal-cardinality slice pruning** — small exact theorem, likely cheap to prototype, attacks frontier width directly.
2. **A1 reflection orbit schedule** — unconditional exact near-2× support reduction on empty 7×6; compose with line/residual ID reflection.
3. **B1 line-hit realizability formula** — decisive test of whether the R0043 compatibility relation is naturally expressible in Isometric affine/clause form.
4. **A3 fixed-fact/constrained cone feasibility** — extend A2 using exact closure/certificates.
5. **D1 claim-relative transform reuse** — generalize the already-successful O3 factorization.
6. **C1 interval BSFP** — potentially large semantic reduction, but requires a new partial-bound frontier contract.
7. **C3 typed resource cuts / C4 macro predecessors** — consume proof work as it becomes qualified.
8. **F1 static-sector factorization** — important for the calculus program but lower confidence as an immediate runtime win.

## Non-negotiable falsifiers

- unknown treated as loss/draw/no-certificate;
- oracle-derived 28/30/horizon used as a built-in premise;
- GF(2) span substituted for positive residual incidence;
- blocker OR silently strengthened to XOR;
- cone feasibility accepted without exact guard compatibility;
- a claim-relative reuse key used as full state identity;
- runtime search result reused outside the exact scope it proved;
- reflection canonicalization losing action/provenance mapping;
- legal-slice optimization changing the root result on any complete control;
- interval/certificate propagation narrowing beyond exact W/D/L.
