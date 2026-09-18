# Confirmation — distributed universal composition wall before semantic collapse

**Date:** 2026-09-18  
**Status:** independently confirmed scoped research finding  
**Base authority:** Connect4 IsoGraph 1.1  
**Authority 1.1 mutated:** no  
**Research direction:** Josh Oshiro

## Finding under review

The direct-propagation campaign reported that standard-7x6 scaling first fails at rank 35 because universal proof-side composition is distributed into large antichain Cartesian products before the result is allowed to collapse to a much smaller residual/value representation.

The confirmation question was deliberately narrower than the proposed remedy:

> Is the observed rank-35 wall really localized to distributed universal composition in the current proof carrier, rather than to rank/support count, serialization, or an already-proved q representation?

## Independent checks

### 1. Rank-35 support count

Independent bounded enumeration of all seven-column support vectors with:

~~~text
0 <= h_c <= 6
sum_c h_c = 35
~~~

returns exactly:

~~~text
1,709 supports
~~~

This matches the direct-propagation report.

Therefore the wall is not explained by an unexpectedly huge number of rank-35 supports.

### 2. Recorded pathological Cartesian domains

The two recorded pathological move-width tuples were recomputed independently:

~~~text
74 * 170 * 210 * 217
    = 573,270,600

43 * 89 * 119 * 129
    = 58,748,277
~~~

The arithmetic in the campaign is exact.

### 3. Current BSFP intersection semantics

The maintained BSFP ownership-antichain implementation independently confirms the relevant operation shape.

`components/bsfp/ownership-antichain-solver.mjs` implements upward intersection by forming pairwise OR candidates over the Cartesian product and downward intersection by forming pairwise AND candidates, followed by exact antichain normalization.

The CUDA P2 profile states the same execution semantics explicitly: the pair reducer generates every Cartesian OR candidate for upward/minimal intersection or every Cartesian AND candidate for downward/maximal intersection before exact survivor reduction.

Thus Cartesian distribution is not an interpretation imposed after the fact. It is the current exact realization of universal frontier conjunction.

### 4. Clause carrier is already independently qualified

Authority claims C4-R0073 and C4-R0074 already establish/qualify the support-local clause carrier used by the direct-propagation experiment:

~~~text
C4-R0073:
support-local monotone-clause dictionaries are predecessor-closed

C4-R0074:
support-local coverage/cofactor recurrence matched the independent
array-CNF authority on complete bounded controls
~~~

Therefore the direct-propagation clause boundary is not relying on a new unqualified predecessor operation.

### 5. Representation collapse is real but must be scoped correctly

The direct-propagation data show:

~~~text
rank 39:
ownership generators                    64,808
abstract residual-shaped signatures        626
abstract residual-Pareto bounds             192
~~~

Independent ratio recomputation gives:

~~~text
ownership / residual-shaped signatures
    = 103.5271565x

ownership / abstract residual-Pareto bounds
    = 337.5416667x
~~~

However, the latest campaign correction is load-bearing:

- these projected completions did not enforce exact P0 cardinality;
- they did not enforce alternating-history realizability;
- therefore they are not a legal-q class census.

The confirmation therefore accepts the **large representation-collapse signal** but rejects the stronger statement that the recorded 626/192 objects are already exact legal q/value classes.

### 6. Localization versus serialization

The campaign separately removed BigInt-to-decimal-string round trips and materially accelerated rank 37, while rank 35 still failed within the bounded run.

That observation is consistent with the wall being structural rather than serialization-dominated.

This check is supporting evidence only; it is not needed for the core algebraic localization.

## Confirmed scoped conclusion

The following statement survives independent review:

> In the tested standard-7x6 direct deadline/clause recurrence, the first unclosed rank is 35. The failure is localized to universal antichain conjunctions whose exact distributed realization forms large Cartesian candidate domains before normalization. Rank-35 support cardinality itself is only 1,709, and benign supports remain small. Existing predecessor-closed clause semantics are independently qualified. High-rank projections show that much of the fine proof/ownership distinction disappears under residual-shaped/value-oriented collapse, although the current projection is not yet a legal-q census.

This supports the interpretation:

~~~text
predecessor-closed proof carrier
        |
        | current implementation:
        | fully distribute universal alternatives
        v
large proof-side Cartesian domain
        |
        v
normalize / later semantic collapse
~~~

The observed scaling wall is therefore a **representation/composition-layer wall before semantic collapse**.

## What is not confirmed

This review does **not** establish:

- existence of a compact exact clause-to-q operator;
- that the abstract residual projection is realizable legal q;
- that such an operator solves the empty 7x6 root;
- that every universal conjunction in Connect4 is problematic;
- that rank 35 has only a formally characterized finite family of pathological supports;
- that the proposed projection will be cheaper than all alternatives.

Those remain research obligations.

## Consequence

The next exact missing-law target is now well scoped:

~~~text
predecessor-closed clause/proof boundary
        ->
compact realizability-preserving controllable predecessor
        ->
residual/q-value boundary

without first distributing every universal proof alternative
~~~

This is the common seam already indicated independently by:

- C4-R0043 — realizability-preserving predecessor/composition;
- C4-R0069 — observation-relative controllable predecessor.

## Confirmation disposition

~~~text
RANK35_SUPPORT_COUNT                         CONFIRMED
PATHOLOGICAL_CARTESIAN_ARITHMETIC            CONFIRMED
CARTESIAN_INTERSECTION_IS_CURRENT_SEMANTICS  CONFIRMED
CLAUSE_PREDECESSOR_CARRIER                   PREVIOUSLY_QUALIFIED
LARGE_PRE_SEMANTIC_REPRESENTATION_GAP        CONFIRMED_SCOPED
RECORDED_626_192_AS_LEGAL_Q                  REJECTED
DISTRIBUTED_UNIVERSAL_COMPOSITION_WALL       CONFIRMED_SCOPED
COMPACT_CLAUSE_TO_VALUE_OPERATOR             MISSING_LAW
EMPTY_ROOT_SOLVED                            NO
AUTHORITY_1_1_MUTATED                        NO
~~~
