# Direct line-hit BSFP with realizability completion

**Status:** major positive qualification of C4-R0043 on complete small controls. Not yet promoted into the canonical claim registry and not yet a CUDA performance result.

**Research direction:** Josh Oshiro.

## Problem

C4-R0042 showed that exact BSFP Win/Loss boundaries can be represented as antichains over identified line-hit pairs

```text
Q = (support, H0, H1)
```

with player-0 favorable order

```text
a <= b
iff
    a.H0 subseteq b.H0
    and
    b.H1 subseteq a.H1.
```

C4-R0043 remained open because arbitrary Cartesian combinations of `(H0,H1)` are not support-locally realizable by any ownership partition.

A direct recurrence therefore needs a closure law that preserves realizability without enumerating ownership states.

## 1. Exact support-local realizability constraints

Fix occupied support `S`. For geometric line `lambda`, let

```text
O_lambda = lambda intersection S.
```

For a concrete ownership coloring:

```text
H0(lambda) = 1 iff O_lambda contains a P0 cell
H1(lambda) = 1 iff O_lambda contains a P1 cell.
```

For nonempty `O_lambda`, the line-hit pair has exact meanings:

```text
10 -> every occupied cell of the line is P0
01 -> every occupied cell of the line is P1
11 -> the occupied cells contain both colors
00 -> impossible.
```

Thus exact realizability is a shared-cell coloring constraint system. In particular, `11` is an NAE constraint over the occupied line cells; for two occupied cells it reduces to exact opposite ownership.

This characterization is exact but a general feasibility test alone is not sufficient for antichain composition.

## 2. Why "join then filter" is wrong

For beneficiary player `p`, write a line-hit boundary pair in player-relative coordinates:

```text
A = required own-hit lines
B = allowed opponent-hit lines
```

A feasible state satisfies the upward bound when:

```text
A subseteq H_p
and
H_opponent subseteq B.
```

Ordinary product intersection forms the raw bound

```text
A = A1 union A2
B = B1 intersection B2.
```

That raw pair may be unrealizable.

Discarding it would be unsound because realizable states can exist strictly above it. The exact intersection boundary is the antichain of **minimal realizable upper completions**.

Dually, downward composition requires maximal realizable lower completions.

## 3. Constructive upper-completion theorem candidate

For raw player-relative upper bound `(A,B)` at support `S`, an ownership set `P` for beneficiary player `p` is sufficient exactly when:

```text
for every line not in B:
    all occupied cells O_lambda are owned by p

for every line in A:
    at least one occupied cell O_lambda is owned by p.
```

Therefore:

1. Lines excluded from `B` produce forced beneficiary-owned cells.
2. Required own-hit lines in `A` not already satisfied by those units produce positive hitting-set clauses.
3. Enumerate the **minimal transversals** of those clauses, starting from the forced units.
4. Map each minimal ownership certificate to its induced `(H0,H1)` pair.
5. Normalize those pairs under the beneficiary-favorable product order.

The resulting antichain is the minimal realizable upper completion of `(A,B)`.

Why minimal ownership transversals are sufficient:

```text
P subseteq P'
=>
Q(P) <=_p Q(P')
```

so any non-minimal ownership solution is product-dominated by a subset-minimal solution with the same or a less favorable feasible hit pair.

The lower-completion law is the exact player-swapped dual.

This is the key new bridge to the existing blocker/antichain calculus: realizability closure becomes a monotone transversal problem, not general ownership enumeration.

## 4. Direct beneficiary-relative product recurrence

Store two minimal positive winner frontiers:

```text
W0 -> P0-favorable line-hit antichain
W1 -> P1-favorable line-hit antichain.
```

For landing cell `x`, let `I(x)` be the set of geometric line IDs incident to `x`.

### Cofactor / preimage

For child boundary `(A,B)` relative to beneficiary `p`:

If mover is `p`:

```text
A_parent_raw = A \ I(x)
B_parent_raw = B
```

because the move itself supplies every own hit in `I(x)`.

If mover is the opponent:

```text
I(x) must be a subset of B
```

or the preimage is empty, because the opponent move necessarily adds those opponent hits. When the guard holds:

```text
A_parent_raw = A
B_parent_raw = B.
```

In either case, apply minimal realizable upper completion at the **parent support**.

### Move aggregation

For beneficiary equal to mover:

```text
union action frontiers
```

For beneficiary equal to opponent:

```text
intersect action frontiers
```

where intersection is:

```text
raw product join
-> minimal realizable upper completion
-> antichain normalization.
```

### Terminal injection

For a terminal-ready line `lambda` through landing cell `x`, mover `p` wins immediately when the opponent has no hit on `lambda` in the parent.

This is the raw p-relative bound:

```text
A = empty
B = allLineIDs \ {lambda}
```

followed by realizability completion.

### First-win exclusion for the opponent

The complement of that terminal region says the opponent already hits `lambda`.

In the opponent's favorable coordinates this is:

```text
A = {lambda}
B = allLineIDs
```

followed by completion.

Intersect the opponent's propagated winner frontier with this blocker for every simultaneously terminal-ready mover line.

Thus first-win stopping remains explicit rather than being inferred from later child semantics.

## 5. Direct recurrence qualification

The qualifier evaluates the line-product recurrence above independently of ownership enumeration.

Ownership-antichain BSFP is used only as an authority to derive the exact product winner boundary at every support by exhaustive mapping after the ownership solve is complete.

Results:

| Geometry | Supports compared | W0 boundary mismatches | W1 boundary mismatches | Max completion branching encountered by direct recurrence |
|---|---:|---:|---:|---:|
| 4x3 connect-3 | 256 | 0 | 0 | 9 |
| 4x4 connect-4 | 625 | 0 | 0 | 5 |
| 5x3 connect-4 | 1,024 | 0 | 0 | 1 |
| **Total** | **1,905** | **0** | **0** | — |

Direct-recurrence work counters:

```text
4x3 c3:
    completion calls:   19,822
    completion outputs: 25,711
    product pairs:      17,534

4x4 c4:
    completion calls:   25,099
    completion outputs: 28,505
    product pairs:      24,320

5x3 c4:
    completion calls:   11,908
    completion outputs: 11,908
    product pairs:       6,661
```

These are reference work counts, not optimized performance numbers.

## 6. Broader realizability-completion census

A separate exhaustive census over **all distinct raw joins induced by feasible quotient states** showed that support-local realizability is frequently not closed under coordinatewise join, but completion multiplicity remained modest on these controls.

### 4x3 connect-3

```text
supports:                  256
supports with bad joins:   250
distinct raw joins:        335,149
unrealizable joins:        292,018
raw join closure rate:     12.87%
mean minimal completions:  1.455
maximum completions:       19
```

### 4x4 connect-4

```text
supports:                  625
supports with bad joins:   620
distinct raw joins:        320,275
unrealizable joins:        132,986
raw join closure rate:     58.48%
mean minimal completions:  1.258
maximum completions:       10
```

### 5x3 connect-4

```text
supports:                  1,024
distinct raw joins:        82,240
unrealizable joins:        0
raw join closure rate:     100%
```

There is no universal small branching bound established here. A variable-size engine must treat transversal explosion as a real scalability risk.

## 7. Qualifier defect found during execution

The first direct-recurrence run appeared to fail for P0 while P1 matched. The first mismatch localized to a small rank-2 support.

The error was in the **qualifier's pair-antichain normalizer**: it omitted the beneficiary argument and consequently normalized both P0 and P1 pair sets using P1's favorable order.

After repairing the qualifier, all three complete controls passed with zero boundary mismatches.

This harness defect is recorded because it demonstrates why beneficiary orientation must be explicit in any future generic line-product API.

## 8. Variable-size status

The mathematical construction is phrased over:

```text
arbitrary finite rectangular W x H Connect-K geometry
finite geometric line family
support-local line intersections
minimal transversal antichains
```

The qualifier uses u32 masks only because its complete controls are small.

A production representation must derive widths from:

```text
cell count
line count
support-local clause count
selected backend word width
```

No semantic part of the closure law depends on 42 cells, 69 lines, or WSL-625.

## 9. Relationship to Isometric

This is a direct isometric match between two independently developed structures:

```text
BSFP missing realizability closure
<->
Isometric blocker / positive-clause / antichain composition.
```

The completion operator consumes exactly the kind of object Isometric already reasons about:

```text
forced owner facts
positive blocker/hitting clauses
minimal certificate antichains.
```

This does **not** mean IsoMax/Isometric should put the entire realizability structure in its universal state key.

For BSFP, this is a recurrence closure operator. For Isometric, the same algebra may remain claim-relative proof machinery.

## 10. What remains open in C4-R0043

The experiment substantially addresses the stated reference direct-recurrence problem on the tested controls, including:

```text
move preimages
terminal injection
first-win exclusion
existential move composition
universal move composition
support-local realizability
```

Before changing the canonical `missing_law` status, still require:

1. independent review of the completion derivation;
2. a geometry-generic implementation not tied to u32 masks;
3. qualification on additional Connect-K geometries designed to stress transversal branching;
4. proof that the implementation's completion enumerator returns the complete minimal transversal antichain;
5. performance comparison against ownership-BSFP and residual/OQS forms;
6. clear behavior when completion branching exceeds bounded device capacity;
7. confirmation that requested witness/action provenance can be lifted without reintroducing ownership state.

## 11. Immediate research consequence

Do not treat R0043 as requiring a generic SAT object by default.

The first implementation candidate is:

```text
raw line-hit bound
-> forced beneficiary cells
-> support-local positive clauses
-> minimal transversal antichain
-> induced feasible line-hit pairs
-> product-order normalization.
```

This is structurally compatible with GPU antichain machinery and with support-local residual/proof tables.

## Reproduction

Run separately:

```text
node research/experiments/bsfp-line-hit-realizability/direct-line-product-bsfp.mjs 4 3 3
node research/experiments/bsfp-line-hit-realizability/direct-line-product-bsfp.mjs 4 4 4
node research/experiments/bsfp-line-hit-realizability/direct-line-product-bsfp.mjs 5 3 4
```

Any support-level W0/W1 boundary mismatch sets a failing exit code.

## Disposition

**Strongly supports** minimal-transversal realizability completion as the missing direct line-product composition mechanism on the qualified controls.

Do not yet mark C4-R0043 solved universally. Advance this to adversarial geometry qualification and a geometry-generic implementation/performance study.
