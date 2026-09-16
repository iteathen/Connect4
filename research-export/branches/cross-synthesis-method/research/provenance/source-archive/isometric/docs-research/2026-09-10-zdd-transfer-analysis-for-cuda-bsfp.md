# ZDD transfer analysis for CUDA-BSFP

**Status:** research evidence and experiment direction only. This is not a production representation change, a CUDA performance result, or an empty-board 7x6 solve claim.

## Scope

This note asks which ideas from ZDD/ZBDD family algebra and decision-diagram construction are transferable to the Connect4 CUDA-BSFP exact solver.

The target is not "replace C1 with CUDD". The target is the measured BSFP scaling wall: moderate exact Win/Loss boundaries feed very large Cartesian candidate families, after which duplicate/dominance normalization performs very large amounts of exact subset work.

Existing exact evidence remains governing for the current implementation. In particular, on 5x5 C1 the maximum boundary width is only about 568 records while pair generation is about 81.5 million and reported subset work is about 2.16 billion checks. This makes candidate-family materialization and post-product antichain reduction a more promising target than merely compressing a few hundred final boundary records.

The newer identified-win-line quotient/product-antichain work is also relevant. It demonstrated exact tested W/L boundary compression in the product order over `(H0,H1)`, but did not yet establish a compact direct recurrence.

## 1. What a ZDD actually contributes

The reusable ideas are broader than the ZDD node format.

A reduced ZDD gives a canonical immutable representation of a family of sets under a fixed variable order. Equal suffix families share a node. A unique table canonicalizes `(variable, lo, hi)` triples, and an operation cache canonicalizes repeated algebraic subproblems such as `(operation, lhsRef, rhsRef)`.

The zero-suppression rule removes a node when taking the represented element can never reach a family member. This is especially effective for sparse set families.

For CUDA-BSFP the potentially valuable properties are therefore:

1. exact canonical family identity via small integer references;
2. structural sharing of repeated suffix families;
3. memoization of repeated family operations by reference identity;
4. applying family algebra directly to the compressed representation instead of enumerating every member;
5. performing semantic subsumption during construction rather than as a second pass over a materialized family;
6. variable/order selection based on the actual fixed incidence structure;
7. levelized construction as an alternative to recursive pointer chasing.

A conventional host ZDD library is not automatically a good GPU realization of those ideas.

## 2. The closest literature analogue to the BSFP hot operation

### 2.1 Coudert: fuse pair generation with maximality

Olivier Coudert, *Solving Graph Optimization Problems with ZBDDs* (ED&TC 1997, DOI 10.1109/EDTC.1997.582363), defines specialized ZBDD family operations for graph optimization, including maximal/minimal filtering and a fused operation for maximal pairwise unions.

The important pattern is not the graph application. It is that the algorithm does not first enumerate every pairwise union and then perform an unrelated quadratic maximality pass. Combination and subsumption elimination are recursive parts of one family operation.

This maps directly onto the present BSFP structure.

For minimal Win generators `A` and `B` at one support:

```text
up(A) intersect up(B)
  = up(MinJoin(A,B))

MinJoin(A,B)
  = minimal_under_subset({ a union b | a in A, b in B })
```

For maximal Loss caps `C` and `D`:

```text
down(C) intersect down(D)
  = down(MaxMeet(C,D))

MaxMeet(C,D)
  = maximal_under_subset({ c intersect d | c in C, d in D })
```

C1 currently materializes the pair candidates and then normalizes. Coudert's pattern says the more fundamental operation is the already-minimized family product.

### 2.2 Subsumption-free ZBDD clause algebra

Philippe Chatalic and Laurent Simon's ZBDD clause work (*Multi-Resolution on Compressed Sets of Clauses*, ICTAI 2000, DOI 10.1109/TAI.2000.889839), and follow-up ZBDD SAT work, is an even closer structural precedent.

Their clause families are antichains under subsumption. They define a subsumed-difference operation and use it to construct **subsumption-free union** and **subsumption-free product**. Subsumed members are eliminated while the output ZBDD is being built, rather than by materializing an enormous clause family and cleaning it afterward.

This is almost exactly the desired change in BSFP terminology:

```text
current:
  Cartesian combine
    -> candidate materialization
    -> exact dedup
    -> dominance scan
    -> boundary

candidate:
  subsumption-free MinJoin
    -> canonical exact boundary family directly
```

The analogy is mathematical; SAT search/control-flow semantics are not imported into BSFP.

## 3. A stronger simplification: one minimal-requirement family type

At a fixed support universe `U`, C1 currently has two dual boundary types:

- minimal P0 ownership sets proving Win;
- maximal P0 ownership caps proving Loss.

A Loss cap `C` can instead be stored as its complement in the occupied support:

```text
R1 = U \\ C
```

`R1` is a minimal set of cells that must belong to P1 for that Loss cone.

Therefore both outcomes can be represented as **minimal required-player families**:

```text
P0-requirement family -> upward-closed P0-Win region
P1-requirement family -> upward-closed P1-required / P0-Loss region
```

Under this representation the expensive intersection operator for both orientations is the same algebra:

```text
MinJoin(A,B)
  = Min_subset({ a union b | a in A, b in B })
```

Alternative/existential family composition is likewise:

```text
AbsorbUnion(A,B)
  = Min_subset(A union B)
```

This suggests a much smaller semantic kernel:

```text
RequirementFamilyRef

AbsorbUnion(lhsRef, rhsRef) -> familyRef
MinJoin(lhsRef, rhsRef)     -> familyRef
```

Terminal/first-win authority remains Connect4-owned and must not be hidden inside a generic family operation.

This unification is attractive independently of whether the eventual representation is a ZDD, trie, flat packed antichain, or a custom canonical DAG.

## 4. Canonical references are more important than raw pointers

The prior `maskRef` idea aligns directly with decision-diagram hash-consing.

A production-friendly form would use immutable integer references, not raw CUDA pointers:

```text
maskRef   -> canonical fixed-width mask
familyRef -> canonical family/subproblem root
```

After exact canonicalization:

```text
familyRefA == familyRefB
```

is exact family equality.

An operation cache can then use:

```text
(opcode, min(lhsRef,rhsRef), max(lhsRef,rhsRef)) -> resultRef
```

for commutative operators. The cache is performance-only: eviction or a cache miss must never change semantics.

This could exploit repetition at two levels already suggested by existing research:

1. repeated identified-line masks;
2. repeated suffix/subfamilies composed from those masks.

The second level is the one that must be measured next. Mask interning alone saves storage but does not eliminate Cartesian family work.

## 5. Frontier construction may fit the 42-cell / 69-line geometry unusually well

Frontier-based ZDD construction stores only information attached to graph entities that have incidence on both the processed and unprocessed sides of a fixed order. When the last relevant incident object is processed, that local state can be forgotten. States with the same exact frontier information merge.

This is significant for Connect4 because standard 7x6 geometry is a fixed sparse incidence hypergraph:

```text
42 cells
69 winning lines
276 line-cell incidences
```

Two dual constructions are worth measuring:

```text
process cells:
  frontier = winning lines crossing the cell cut

process winning lines:
  frontier = cells touched by both processed and unprocessed lines
```

The second construction is especially interesting because the frontier state could be substantially smaller than carrying all 69 line identities at every DD level.

Variable/order choice is not cosmetic. Frontier-based-search work explicitly relates construction cost and DD size to frontier/pathwidth-like width, and reports large sensitivity to the chosen edge/object order. Therefore the 7x6 incidence graph should receive a dedicated ordering census before any node format is frozen.

Useful order candidates include natural geometric orders, center/edge orders, line-center orders, greedy minimum-frontier orders, local search, and small beam search. The goal is not a globally optimal NP-hard path decomposition; it is a deterministic small-width order for this one fixed 42/69 geometry.

## 6. The line-product order can be converted to ordinary subset order

The qualified candidate P0-favorable order is:

```text
(H0,H1) <= (K0,K1)
iff
  H0 subset_of K0
  and
  K1 subset_of H1
```

Define a tagged-set transform over two copies of the 69-line universe `L`:

```text
T(H0,H1) = tag0(H0) union tag1(L \\ H1)
```

Then:

```text
(H0,H1) <= (K0,K1)
iff
T(H0,H1) subset_of T(K0,K1)
```

So product-order dominance can, in principle, reuse ordinary subset-family machinery over 138 tagged coordinates.

This does **not** establish that a plain 138-variable ZDD is a good representation. The complemented `H1` channel may be dense, which works against ordinary zero suppression. Alternatives to test are:

- a complement-aware second channel;
- paired canonical family references with a custom product-order operator;
- BDD/CZDD rather than plain ZDD;
- a four-state-per-line MDD-like representation;
- a structured decomposition such as ZSDD only if strict linear ordering proves poor.

The transform is useful because it demonstrates that no fundamentally new dominance mathematics is required merely because the quotient order is two-sided.

## 7. Family operation order is another free degree of freedom

`MinJoin` is semantically commutative and associative because it represents intersection of upward-closed regions.

Therefore combining multiple legal-move contribution families need not use an arbitrary left fold. The final exact family is unchanged under:

```text
left fold
balanced pair tree
smallest-family-first
predicted-result-size-first
shared-substructure-first
geometry-overlap-first
```

Peak intermediate node count and total operation work can differ dramatically even when the final family is identical.

A Huffman-like smallest-first schedule is a cheap baseline. If `familyRef` reuse becomes meaningful, a cost model can also prefer operands sharing canonical suffixes.

This is a low-semantic-risk optimization because the algebraic equality is exact; only the execution order changes.

## 8. Chain reduction and structured DDs are secondary candidates

Randal Bryant's chain-reduced DD work (TACAS 2018, DOI 10.1007/978-3-319-89960-2_5) combines BDD and ZDD reduction ideas. It proves a chain-reduced ZDD is never larger than the corresponding ordinary ZDD and is at most twice the size of the corresponding BDD. The relevant transferable mechanism is representing long runs/ranges of equivalent decisions compactly.

If Connect4 family DAGs exhibit long stretches of skipped or forced variables, a range/chain node could be worthwhile:

```text
topLevel
bottomLevel
loRef
hiRef
```

Do not add this machinery before measuring run-length distribution.

Zero-suppressed sentential decision diagrams (ZSDDs) are another fallback. Nishino et al. show ZSDDs strictly subsume ZDDs and derive bounds related to treewidth/branch decomposition for graph-structured families. This may matter if the 42x69 incidence graph has a much better tree decomposition than linear path decomposition. It is materially more complex than a ZDD-like linear representation, so it should remain a fallback if the simpler ordering experiment fails.

## 9. A critical negative result: family algebra can still blow up exponentially

Nakamura, Nishino, and Denzumi, *Single Family Algebra Operation on BDDs and ZDDs Leads to Exponential Blow-Up* (ISAAC 2024, DOI 10.4230/LIPIcs.ISAAC.2024.52), corrects an important piece of folklore.

Basic family operations such as union/intersection/difference have favorable polynomial bounds in DD size, but many richer family-algebra operations do not. The paper proves worst-case exponential blow-up for a broad class of operations, even allowing arbitrary variable ordering.

Therefore none of these claims are justified:

```text
ZDD => polynomial BSFP
ZDD => MinJoin is cheap
better variable ordering => no exponential case
canonical DAG => candidate explosion disappears
```

The correct goal is empirical and structural:

> Does Connect4's particular fixed support/line incidence structure cause the fused exact family operations to stay small enough on the actual BSFP operand distribution?

This is why a reference prototype on captured real operands comes before a production CUDA DD.

## 10. Simpler exact baseline: set trie / Patricia-like containment index

The DD hypothesis should compete against a simpler containment structure.

Set tries store sorted set members in a trie and support exact subset/superset existence/retrieval without scanning every stored set. Published analysis and experiments show strong performance for some low-cardinality set distributions.

For C1 frontiers with only hundreds of final members, a packed set trie or Patricia-like index may eliminate most expensive dominance comparisons with far less construction/canonicalization machinery.

It will not automatically solve Cartesian candidate generation, which is why it is primarily a baseline against the **dominance-index** part of the ZDD hypothesis.

If a trie gives most of the gain, do not import a family-DAG runtime merely for structural elegance.

## 11. CUDA realization: steal the semantics, not the recursive implementation

A conventional recursive host package generally relies on pointer-heavy node objects, unique tables, recursive `Apply`, and irregular cache probes. That is poorly aligned with the existing CUDA-BSFP execution constraints.

However, decision diagrams do not require depth-first recursive execution. Adiar reformulates BDD Apply/Reduce as iterative levelized/time-forward algorithms for external memory. TdZdd provides top-down/breadth-first construction and parallel processing. Recent GPU decision-diagram work also demonstrates full layer expansion on GPU with successor generation, duplicate elimination, and dominance filtering.

The transferable CUDA shape is therefore a bounded bulk operator graph:

```text
input workset: (opcode, lhsRef, rhsRef)
        |
        v
resolve exact terminal/base cases
        |
        v
expand unresolved subproblems by level
        |
        v
semantic absorption / nonsubset filtering
        |
        v
canonicalize node tuples in bulk
        |
        v
assign immutable integer refs
        |
        v
resolve parents / next level
```

Possible opcodes for a first research implementation:

```text
ABSORB_UNION
MINJOIN
NOT_SUPERSET / NOT_SUBSET
GET_NODE
```

Generic bounded worksets, sort/compaction, and reusable canonicalization mechanisms naturally belong in CUDA-Algorithms if/when a consumer-neutral need is proven. Connect4 must continue to own requirement-family semantics, exact subset meaning, terminal authority, and BSFP composition.

Before inventing a dynamic concurrent GPU unique table, prefer testing whether existing generic sort -> unique -> reference assignment is sufficient. Bulk canonicalization is easier to bound, qualify, and make deterministic.

## 12. Specific experiment sequence

### E1 — 7x6 incidence frontier/order census

Research-only JavaScript prototype. Generate the 42-cell / 69-line incidence structure deterministically and measure maximum/mean frontier width for both cell-ordered and line-ordered decompositions. Compare geometric, greedy, local-search, and bounded beam orders.

Record the full width profile and exact order so later DD experiments are reproducible.

### E2 — family structure census on authoritative operands

Capture exact C1 boundary families from complete small games and selected 4x5/5x4 hot supports. Encode the same families as:

1. flat packed antichain;
2. sorted set trie / Patricia baseline;
3. reduced ZDD;
4. optionally CZDD after ordinary ZDD statistics justify it.

Measure member count, unique masks, DD/trie nodes, estimated bytes, width by level, sharing ratio, variable-order sensitivity, and chain/skip distribution.

### E3 — fused exact `MinJoin` prototype — highest priority

Implement two independent reference paths.

Baseline:

```text
all a union b pairs
-> exact dedup
-> exact minimal-under-subset
```

Candidate:

```text
canonical family operation
-> absorb dominated branches during construction
-> exact minimal family directly
```

The candidate should be independently derived from the Coudert/Chatalic family-algebra pattern rather than copied from third-party implementation code.

Measure:

- exact output equality;
- baseline pair count;
- number of family subproblems;
- operation-cache hit rate;
- canonical node count;
- peak live nodes/work items;
- dominated branches removed before materialization;
- final antichain cardinality;
- estimated memory traffic.

Use real BSFP operands, not only synthetic favorable examples.

### E4 — multi-child aggregation order

On the same supports, compare left fold, balanced, smallest-first, and structure-aware `MinJoin` schedules. Final output must be byte-for-byte/canonically equal.

### E5 — identified-line product representations

Compare direct family representations of the qualified line-product boundary:

```text
138-bit tagged subset transform
paired H0/H1 refs
complement-aware H1 channel
4-state-per-line MDD-like form
```

Only if the linear forms remain large should ZSDD/tree-decomposition machinery be investigated.

### E6 — containment-index baseline

Replay identical candidate streams through flat scan, cardinality-bucketed scan, set trie/Patricia, and family-DAG filtering. This separates "faster dominance query" from "avoid generating the candidate in the first place."

## 13. Promotion gates

Do not mutate C1 from this research until a candidate representation/operator demonstrates all of the following on independent exact oracle data:

- exact family equality on complete small controls;
- no terminal/first-win semantic change;
- a large reduction in materialized pair candidates or exact subset checks on real hot operands;
- bounded peak memory substantially below the current candidate-array path;
- acceptable sensitivity to a frozen deterministic variable order;
- no hidden blow-up on progressively larger bounded controls.

A useful performance signal would be at least an order-of-magnitude reduction in materialized pair work on the actual hard operations, not merely a smaller final serialization.

## 14. Current disposition

The strongest ZDD-derived candidate is **not a generic ZDD replacement**. It is:

> Build one canonical minimal-requirement-family abstraction and perform a fused, subsumption-free `MinJoin` so Cartesian combination and dominance elimination happen as one exact family operation.

The identified 69-line quotient may make that family substantially more structured, while frontier ordering over the fixed 42x69 incidence graph may reduce the amount of state needed inside the canonical DAG.

The immediate sequence is therefore:

```text
E1 frontier/order census
  +
E3 fused MinJoin reference prototype on real C1 operands
  |
  v
compare against set-trie and current packed normalizer
  |
  v
only then select ZDD/CZDD/custom DAG representation
```

B2/B3, terminal specialization, semantic winspace filters, and C3 diagnostics remain valid independent work. A successful fused family operation can compose with them rather than requiring their removal.

## References consulted

- Shin-ichi Minato, "Zero-Suppressed BDDs for Set Manipulation in Combinatorial Problems," DAC 1993.
- Olivier Coudert, "Solving Graph Optimization Problems with ZBDDs," ED&TC 1997, DOI 10.1109/EDTC.1997.582363.
- Philippe Chatalic and Laurent Simon, "Multi-Resolution on Compressed Sets of Clauses," ICTAI 2000, DOI 10.1109/TAI.2000.889839.
- Fadi A. Aloul, Maher N. Mneimneh, Karem A. Sakallah, "Backtrack Search Using ZBDDs," IWLS 2001; consulted for its description of subsumed difference and subsumption-free union/product, not for search architecture.
- Yuma Inoue and Shin-ichi Minato, "Acceleration of ZDD Construction for Subgraph Enumeration via Path-width Optimization," 2016 technical report.
- Masaaki Nishino et al., "Zero-Suppressed Sentential Decision Diagrams," AAAI 2016, DOI 10.1609/aaai.v30i1.10114.
- Randal E. Bryant, "Chain Reduction for Binary and Zero-Suppressed Decision Diagrams," TACAS 2018, DOI 10.1007/978-3-319-89960-2_5.
- Steffan Christ Sølvsten et al., "Efficient Binary Decision Diagram Manipulation in External Memory," arXiv:2104.12101 / TACAS 2022.
- Kengo Nakamura, Masaaki Nishino, Shuhei Denzumi, "Single Family Algebra Operation on BDDs and ZDDs Leads to Exponential Blow-Up," ISAAC 2024, DOI 10.4230/LIPIcs.ISAAC.2024.52.
- Jun Kawahara, "ZDDs and Frontier-Based Search for Solving Combinatorial Problems," 2025.
- Shuhei Denzumi, Masaaki Nishino, Norihito Yasuda, "Generalization of Family Operations on ZDDs," IEICE Transactions on Information and Systems E109-D(5), 2026, DOI 10.1587/transinf.2025EDP7062.
- Fabio Tardivo, Laurent Michel, Willem-Jan van Hoeve, "Complete Anytime Decision Diagram Search with GPU-Accelerated State Expansion," 2026; consulted only for the GPU levelized-construction pattern, not its search semantics.
- Jurica Radosavljevic et al., "Data structure set-trie for storing and querying sets: Theoretical and empirical analysis," PLOS ONE 2021, DOI 10.1371/journal.pone.0245122.
