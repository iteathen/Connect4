# Opponent residual suppression as an ordering tier — rejected after cross-corpus qualification

**Date:** 2026-09-15  
**Research direction / structural architecture / invariant-first program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT  
**Branch:** `research/terminal-frontier-horizon-exact`  
**PR:** #45 — `research: exact decisive frontier before horizon evaluation`

## Status

**Rejected as a general incumbent move-order tier at the tested placement.**

The underlying structural fact is retained as exact, unsigned transition information:

```text
mover claims landing cell x
AND an opponent-only live residual contains x
-> that opponent residual is destroyed by the positive cofactor.
```

What is rejected is the stronger engineering choice:

```text
prefer moves by opponent residual destruction degree
```

as a general advisory ordering tier below the accepted playable-singleton effect class.

This experiment is an important negative result because the candidate produced large deterministic savings on the original paired fixture while materially increasing search work on an independent solved-strength calibration corpus. The failure therefore cannot be dismissed as hosted-runner timing noise or implementation breakage.

## Control

Accepted structural-order control:

`b45a6350fbc026b7a3429c5b49816c7d3a248f9e`

That checkpoint contains the accepted native playable-singleton ordering result. It keeps exact terminal/tactical normalization and TT authority ahead of advisory ordering, then promotes one non-TT move when its landing-cell transition creates one or two distinct playable own singleton completion cells without exposing an opponent singleton.

The accepted control remains the production ordering baseline after this experiment.

## Structural correspondence tested

For a legal mover placement at cell `x`, the live position already owns exact incident-line state:

- owner counts per winning line;
- cell -> line incidence;
- empty-cell XOR;
- singleton refs;
- support heights.

Therefore opponent residual destruction can be inferred without child materialization:

```text
ownCount = 0, opponentCount = 2
-> claiming x destroys an opponent degree-2 residual

ownCount = 0, opponentCount = 1
-> claiming x destroys an opponent degree-3 residual
```

`opponentCount = 3` is excluded from ordinary ordering because playable opponent singleton threats are already consumed by the exact tactical forced-block layer.

The algebraic interpretation is exact positive cofactor deletion. It does **not** supply signed W/D/L value.

## Variant 1 — broad lexicographic suppression

Implementation lineage:

- `b5637e75d0a0fffa2bcaf1db0ee17dbf07c12bd` — broad suppression ordering;
- `bc285cb3e585dac48954fd3ece34a8189f51957d` — structural-effect qualification.

The ordering key was conceptually:

```text
(playableSingletonClass, opponentSuppressionClass)
```

with suppression class:

```text
2 = destroy opponent degree-2 residual
1 = destroy opponent degree-3 residual
0 = neither
```

Paired Node 26.7.0 run: `34998095647`.

Against the accepted singleton control:

```text
persistent nodes:       660,565 -> 603,465   (-8.64%)
persistent eval calls:  341,205 -> 307,595   (-9.85%)
reset nodes:            794,750 -> 706,665  (-11.08%)
reset eval calls:       416,335 -> 363,185  (-12.77%)
decision checksum:      unchanged
```

This was a real deterministic reduction on the paired fixture.

However, independent solved-strength evidence showed a severe calibration regression at depth 12:

```text
accepted singleton control:
  nodes            167,372
  evaluator calls   35,759

broad suppression:
  nodes            227,366
  evaluator calls   56,338
```

Move-quality aggregates remained unchanged. The beginning-position corpus improved slightly, so the result was workload-dependent rather than a universal degradation.

This falsified acceptance based on the paired fixture alone.

## Variant 2 — suppression isolated below singleton ordering

The first diagnosis was ownership/placement interference: suppression may have been disturbing ties inside the stronger accepted singleton tier and forcing longer incident-line scans.

Lineage:

- `5470942c8b2fc82bf1c4c3bbed16163dd00f4307` — isolate suppression below singleton ordering;
- `d03812de661aaf22a862ebb8d4843bf0263fd083` — tier-isolation invariant qualification.

This variant restored the accepted singleton selector's first-match/early-exit behavior. Suppression was emitted only when the move had no playable-own-singleton effect, and the test explicitly required the singleton and suppression tiers not to coexist in one descriptor.

Full verification run: `34998829230` — success.  
Paired Node 26.7.0 run: `34998829346` — success.  
Solved-strength run: `34998829287` — success.

Paired fixture improved further:

```text
persistent nodes:       660,565 -> 599,680   (-9.22%)
persistent eval calls:  341,205 -> 305,320  (-10.52%)
reset nodes:            794,750 -> 702,270  (-11.64%)
reset eval calls:       416,335 -> 360,320  (-13.45%)
decision checksum:      unchanged
```

But calibration depth 12 still regressed materially:

```text
accepted singleton control nodes: 167,372
tier-isolated suppression nodes:   226,816
```

The beginning depth-12 corpus was slightly better:

```text
865,252 -> 860,583 nodes
```

Move-quality aggregates again remained unchanged.

This falsified the hypothesis that cross-tier interference was the primary cause. The suppression signal itself was selecting expensive first branches in an important independent corpus.

## Variant 3 — degree-2 destruction only

The next bounded falsifier asked whether weak degree-3 suppression was responsible.

Rather than mutate production again, commit

`df3d2d0917be63d3ccacaba223ab6ac3772478f9`

changed the paired workflow to create an **ephemeral runner-only candidate** that removed degree-3 suppression while leaving production source untouched. The runner:

1. patched the candidate workspace to emit suppression only for opponent degree-2 residual destruction;
2. ran the full repository test suite;
3. ran the ABBA Node 26.7.0 paired benchmark;
4. ran the solved-strength corpus;
5. uploaded all evidence.

Run: `34999321715`.  
Artifact: `10409515680`.

The full repository test suite passed before benchmarking.

The degree-2-only candidate improved the paired fixture again:

```text
persistent nodes:       660,565 -> 583,405  (-11.68%)
persistent eval calls:  341,205 -> 295,655  (-13.35%)
reset nodes:            794,750 -> 692,150  (-12.91%)
reset eval calls:       416,335 -> 354,155  (-14.94%)
decision checksum:      unchanged
```

But calibration depth 12 remained substantially worse than the accepted singleton control:

```text
accepted singleton:
  nodes            167,372
  evaluator calls   35,759

degree-2-only suppression:
  nodes            216,649   (+29.44%)
  evaluator calls   51,509   (+44.05%)
```

Beginning depth 12 improved only slightly:

```text
865,252 -> 857,948 nodes
```

Move-quality evidence remained unchanged:

```text
calibration d12: 128/128 optimal, 128/128 result class preserved
beginning d12:    28/30 optimal,   29/30 result class preserved
```

The known hard vector `54676552255627` remained wrong at depth 12 and correct at depth 19, confirming again that the ordering candidate did not close the semantic/value-calculus gap.

## Final disposition

### Retain

The exact structural fact:

```text
claiming x deletes every opponent-only residual containing x.
```

This remains useful candidate information for consumers whose objective is not identical to alpha-beta first-child ordering, including:

- TT retention/replacement economics;
- Branch Manager scheduling/proof externality;
- a future compiled structural consequence/effect plane;
- diagnostics and theorem/runtime correspondence studies.

### Reject

Do not restore the tested ordering policies without materially new evidence:

```text
opponent degree-3 destruction as lower move-order tier
opponent degree-2 destruction as lower move-order tier
lexicographic suppression inside or below singleton ordering
```

The reason is not semantics or correctness. The reason is **cross-corpus search economics**: all tested variants saved substantial work on the original paired fixture but materially increased search work on the independent calibration corpus.

### Production cleanup

The exact pre-cleanup experiment state is preserved on:

`research/terminal-frontier-horizon-exact-suppression-evidence`

The active branch restores the accepted singleton-order production source and ordinary paired harness. The solved-strength artifact publication added during this campaign is retained because durable machine-readable qualification evidence is generally useful.

## Cross-layer lesson

The campaign refines the earlier performance rule:

> An exact structural effect can be cheap, locally owned, and highly predictive on one search distribution while still being a poor global first-child ordering relation.

So theorem/runtime correspondence is necessary but not sufficient for an ordering tier. The consumer's objective matters.

The accepted singleton effect has a stronger causal relationship to near-term alpha-beta cutoffs because it creates an immediately playable tactical frontier. Opponent residual deletion, even at degree two, is structurally exact but often lacks enough support/resource/deadline information to rank the resulting strategic consequence reliably.

This is consistent with the theorem-side boundary:

```text
residual degree/cardinality != signed value
cofactor deletion != certified obligation
```

and with response-serialization evidence showing that local residual geometry may be dominated by timing and response-resource structure.

## Next seam

Do not immediately replace suppression with another raw residual-count scalar.

Before the next mutation, reassess the remaining candidate tiers against the failure mechanism:

1. **own residual contraction / live-line incidence** — test only if represented as a small structural class, not a weighted count, and require independent cross-corpus evidence;
2. **TT retention** — suppression may be more useful as a retention/externality descriptor than as first-child order;
3. **Branch Manager** — opponent suppression may proxy proof externality or certificate deficit only after explicit scheduling semantics are defined;
4. **compiled effect plane** — consider only if multiple consumers demonstrably need the same descriptor.

The theorem-side active target remains unchanged:

```text
MixedCofactorConsequence
+ AdmissibleSupport
+ UniversalInterventionStability
+ SharedResourceAccounting
+ FirstWinBeforeDeadline
-> CertifiedObligation
```

No ordering experiment supplies that missing proof.
