# Symmetric source-q support-orbit WDL intervals — predeclared exact quotient test

Date 2026-10-16. Canonical owner research/semantic-quotient.

## Reason for this instrumental equivalence reduction

For standard7x6 source `44444`, nonreflected
`BOUNDED_INTERVAL_HORIZON_SENSITIVITY_RESULTS_0_1.json` compiles depth9
(7,798 supports, 4,183 peak BDD nodes, 84,318 operations), but
WDL remains [-1,+1]. Depth10 requires 12,341 ordinary supports,
which exceeds the **original unchanged 10,000 support cap**. Earlier
rank10 is asymmetric and is NOT eligible for simple mirror quotient.
A current source q that is exactly horizontal reflection invariant
admits an exact support-orbit quotient with literal action transport.

## Frozen equivalence and source guard

Require BOTH `h=reverse(h)` and `R0` and `R1` invariant under
horizontal column reflection, not merely symmetric support or equal
phase. Check this *before* compilation. A reflected child support
`h+e_c` is mapped to the lexicographically smaller orbit representative.
Its owner-variable BDD must be transported back into the actual child
orientation using a true variable-permutation Boolean cofactor:

```text
J(false)=false; J(true)=true
J(BDD(z_x, low, high))=ITE(z_J(x), J(high), J(low))
ITE(v,hi,lo)=(v AND hi) OR ((NOT v) AND lo)
```

Construct an exact ordered ROBDD after substitution (do not naively
rename node.var, which breaks ordering). Then restrict actual next
landing `z_x=owner` and combine first-win WIN/NLOSS lower+upper
Bellman action formulas as before. Retain *literal action names*.
Build all canonical support representatives DIRECTLY from paired
heights subject to lex h<=J(h) and depth cap, without generating
the discarded mirror half of the support rectangle. Count raw
equivalent supports separately as an informational metric.
Reference-count canonical child dependencies per **literal parent
action edge**, even if distinct edges map to one orbit; release only
after last consumer.

## Frozen budget and falsifiers

Same **60,000 ROBDD nodes**, **300,000 nontrivial apply/restrict/not
operations**, **10,000 canonical support reps**, and **15s** per build;
64-support GC/high-water 40k, no increase. Every BDD ITE work counts
toward the same operation and memory cap.

1. Empty 4x3 Connect3, k=12 and 4x4 Connect4, k=16:
 compare exact complete WDL and all optimal moves to prior anchored
 compiler and independent physical/q WDL reference.
2. Standard7x6 exactly symmetric source `44444` at depths
 **9,10,11** (all within **10,000 canonical support representatives**,
 otherwise explicitly PARTIAL). At depth9 compare EVERY literal
 P1 action interval to non-quotiented `44444` k9 baseline. At
 depths10/11 validate monotonic nesting with the k9 intervals and,
 if root or actions close, validate with independent direct finite
 horizon physical checker within 300,000 transition cap (no expanded
 7x6 perfect-play tree).
3. Negative control: reject asymmetric source q even if heights
 symmetric but residuals asymmetric. Reject direct node.var rename
 as unsound if a physical/abstract counterexample exists; preserve
 actual source-state action discrepancy.
4. On support, BDD node, operations or time limit stop and record
 precise first failed representative; do not enlarge resources.

Success qualifies exact **reflection quotient of the bounded symbolic
Bellman carrier**, not phase equivalence, WDL equivalence of all
rank7 moves, generalized polynomial complexity, or a nonbranching
whole standard Connect4 solver. The remaining q root at canonical
`44444` may still be UNKNOWN under this finite horizon.
