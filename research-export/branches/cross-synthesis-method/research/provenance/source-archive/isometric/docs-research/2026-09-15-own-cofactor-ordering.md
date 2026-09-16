# Own-cofactor proximity as a move-order tier — rejected after cross-corpus qualification

**Date:** 2026-09-15  
**Research direction / structural architecture / invariant-first program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT  
**Branch:** `research/terminal-frontier-horizon-exact`  
**PR:** #45 — `research: exact decisive frontier before horizon evaluation`

## Status

**Rejected as a general first-child ordering tier at the tested placement.**

The structural facts remain exact and useful:

```text
own live residual containing landing event x
+ mover claims x
-> exact positive-cofactor contraction of that residual.
```

Specifically:

```text
degree 2 -> degree 1
degree 3 -> degree 2
```

are exact residual transformations when the line remains opponent-free. What is rejected is the engineering inference that these unsigned transformations should generally rank alpha-beta first children after the accepted playable-singleton class.

This result closes the raw residual-proximity ordering seam for now. It follows the separate rejection of opponent-residual suppression ordering and strengthens the same lesson: an exact theorem/runtime correspondence is not automatically a robust search-order relation.

## Control

Accepted structural-order control:

`b45a6350fbc026b7a3429c5b49816c7d3a248f9e`

The control already promotes a non-TT move when its landing-cell transition creates one or two distinct **playable own singleton completion cells** without exposing an opponent singleton. Exact terminal/tactical normalization and TT authority remain ahead of this advisory tier.

Accepted control strength/performance reference used here:

```text
calibration depth 12:
  nodes            167,372
  evaluator calls   35,759
  optimal moves     128/128

beginning depth 12:
  nodes            865,252
  optimal moves     28/30
  result class      29/30
```

## Historical live-line assessment before mutation

The prior quotient-native live-line orderer was not treated as authority.

`quotient-live-line-move-order.mjs` maintains surviving winning-line bitsets and scores a landing cell by mover live-line incidence/popcount. It was integrated into a real dependency-parallel solver, but the retained performance records do **not** isolate live-line ordering from exact residual-exhaustion bounds and other solver changes.

In particular, historical integration commit

`c7ff593dfbc9b05025894ee0af9c30548afcb3c5`

exposed both frontier ordering and exact residual-exhaustion bounds in the same integration step. Later solver gains therefore cannot be assigned cleanly to line incidence.

That justified one new attributable incumbent experiment, but a narrower one than raw line-count ordering: exact own-cofactor proximity inferred from the incumbent transition frontier.

## Variant 1 — degree-3 / latent-degree-2 own cofactor proximity

The candidate was tested **ephemerally in CI**; production source remained on the accepted singleton implementation.

Candidate classes below the existing playable-singleton tier:

```text
2 = own degree-2 residual contracts to degree-1 but the remaining completion is still nonplayable
1 = own degree-3 residual contracts to degree-2
0 = neither
```

Rules:

- accepted playable-singleton class remained dominant;
- cofactor proximity was consulted only if no playable-singleton candidate existed;
- a candidate exposing an opponent singleton was vetoed;
- no line count, degree-4 incidence, weighted scalar, child materialization, or new maintained metadata was added;
- all facts were inferred from the landing cell's existing incident-line state.

The first workflow construction at `4ea2f63bb810015cec65affee4820c140ea8bc91` created no runnable job because of malformed YAML around an embedded temporary test. It carries **no candidate conclusion**.

The repaired experiment ran successfully at:

- branch head: `d0af7b391bafc139c6b69ec586156324d2f6745f`
- Actions run: `35000866244`
- artifact: `10410085649`

The structural oracle and full repository suite passed before performance evidence was accepted.

### Paired Node 26.7.0 fixture

Against the accepted singleton control:

```text
persistent:
  nodes            660,565 -> 619,825   (-6.17%)
  evaluator calls  341,205 -> 312,100   (-8.53%)
  elapsed          -5.04% hosted ABBA

reset each root:
  nodes            794,750 -> 731,215   (-7.99%)
  evaluator calls  416,335 -> 372,330  (-10.57%)
  elapsed          -3.30% hosted ABBA

decision checksum unchanged
```

This is a genuine deterministic fixture improvement.

### Independent solved-strength corpus

Move-quality aggregates remained unchanged, but calibration work regressed materially:

```text
calibration depth 12:
  control nodes            167,372
  candidate nodes          211,718   (+26.49%)

  control evaluator calls   35,759
  candidate evaluator       48,318   (+35.12%)
```

The beginning corpus moved in the opposite direction:

```text
beginning depth 12 nodes:
  865,252 -> 817,045   (-5.57%)
```

The known hard vector `54676552255627` remained wrong at depth 12 and correct at depth 19. Therefore the candidate changed search economics, not value semantics.

The cross-corpus split rejected the broad own-cofactor ordering tier and made degree-3->2 the primary suspect.

## Variant 2 — latent degree-2 -> degree-1 only

One final bounded ablation was justified because a latent degree-2 contraction is structurally closest to the already successful playable-singleton transition. Degree-3->2 proximity was removed entirely.

This was again an ephemeral candidate; production remained unchanged.

Experiment:

- head: `92a8d8f586a8be8f8c7f5896f9a75221a85ec0ba`
- Actions run: `35001166103`
- artifact: `10410041306`
- evidence branch: `research/terminal-frontier-horizon-exact-own-cofactor-evidence`

The independent effect oracle and full repository suite passed.

### Paired fixture

```text
persistent:
  nodes            660,565 -> 630,440   (-4.56%)
  evaluator calls  341,205 -> 318,110   (-6.77%)
  elapsed          -3.30% hosted ABBA

reset each root:
  nodes            794,750 -> 750,575   (-5.56%)
  evaluator calls  416,335 -> 384,155   (-7.73%)
  elapsed          -4.80% hosted ABBA

decision checksum unchanged
```

Deep wall-depth work also decreased on the paired position; for example depth 14 moved from 603,507 to 513,973 nodes.

### Independent solved-strength corpus

Quality remained unchanged:

```text
calibration depth 12: 128/128 optimal, 128/128 result class
beginning depth 12:    28/30 optimal,   29/30 result class
```

But calibration work still regressed:

```text
calibration depth 12:
  nodes            167,372 -> 183,108   (+9.40%)
  evaluator calls   35,759 ->  39,679   (+10.96%)
```

Beginning depth 12 again improved:

```text
865,252 -> 817,128 nodes   (-5.56%)
```

The reduced but persistent calibration regression falsifies the hypothesis that degree-3 proximity alone caused the cross-corpus problem.

## Final disposition

### Retain as exact transition facts

```text
own degree-3 -> degree-2 contraction
own degree-2 -> degree-1 contraction
whether the remaining degree-1 completion is playable now
```

These are exact, cheap projections of native transition structure.

### Retain as first-child ordering authority

Only the already accepted class:

```text
creation/exposure of distinct playable own singleton completions,
with opponent-singleton exposure veto.
```

### Reject at tested first-child placement

```text
raw live-line incidence/popcount as authority without a dedicated positive ablation
own degree-3 -> degree-2 cofactor proximity
latent own degree-2 -> degree-1 proximity when still nonplayable
opponent residual destruction/suppression
```

Do not replace these with another weighted residual-count score. Any reopening requires a materially different causal guard or consumer.

## Interpretation

The boundary is now sharper than “degree drop is unsigned.”

A residual transformation may be:

- algebraically exact;
- locally cheap;
- structurally close to the same calculus used by terminal classification;
- predictive on one search distribution;

and still be a poor **global alpha-beta first-child relation**.

The accepted singleton effect differs because it crosses a concrete support boundary into an immediately playable tactical frontier. The rejected lower residual effects remain farther from terminal consequence and therefore leave more of the missing support/resource/deadline/response structure unresolved.

This aligns with the theorem seam:

```text
cofactor contraction
+ support / intervention / resource / deadline / first-win guards
-> certified obligation
```

The ordering failures are therefore consistent with, not evidence against, the structural calculus.

## Next consumer

Stop the raw residual first-child campaign here.

The exact transition descriptors should next be assessed where their meaning matches the consumer objective better:

1. **TT retention/replacement economics** — structural externality may help decide which colliding entries are worth retaining, but key aliasing, probe cost, capacity eviction and replacement policy must be separated first;
2. **Branch Manager scheduling** — proof externality, fan-in, interval width, certificate deficit, response resources and deadline slack are more natural scheduling quantities than move-value estimates;
3. **compiled structural effect plane** — only if more than one consumer demonstrates reuse value.

Fewer TT accesses caused by a smaller search tree are not evidence for a better TT retention policy. Any TT mutation must be attributed directly.
