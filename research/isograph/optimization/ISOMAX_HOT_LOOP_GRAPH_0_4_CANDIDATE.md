# IsoMax Hot-Loop Integrated IsoGraph — 0.4 DP 0.8 Successor Candidate

**Status:** unqualified successor performance-research candidate  
**Current qualified predecessor:** `ISOMAX_HOT_LOOP_GRAPH_AUTHORITY_0_3.md`  
**Gameplay authority effect:** none  
**Research owner:** `research/semantic-quotient`

This candidate updates the hot-loop interpretation to the current Core 0.19 / DP 0.8-era research surface without rewriting qualified hot-loop 0.3.

It specifically incorporates the completed CPC ablation evidence from the 2026-09-26 total-cycle campaign.

## 1. Source/rendering boundary

The complete executable-source closure used by the earlier Core 0.19 campaign is separately exact-source-rendering qualified for its pinned revisions:

`research/isograph/discovery/2026-09-26-isomax-core019/RENDERING_QUALIFICATION.md`

That qualification does not automatically extend to later JSMinSys experiment revisions.

This 0.4 candidate therefore treats the later CPC experiment sources as pinned implementation evidence, not as silently requalified exact native source renderings.

## 2. Game-outcome implicit support

The companion overlay:

`research/isograph/CONNECT4_GAME_THEORY_CORE019_SUPPORT_0_1.*`

makes explicit that, for a **completed exact ordinary W/D/L classification**:

```text
WIN, DRAW, LOSS
    form an exact three-value exclusive/exhaustive outcome partition

not WIN
AND
not LOSS
    ->
DRAW
```

But:

```text
partial nonterminal CPC does not detect WIN
AND
partial nonterminal CPC does not detect LOSS

    !=

DRAW
```

because the CPC pass may remain unresolved.

This distinction is load-bearing.

## 3. Current CPC topology

For the tested CPC-only recursive composition, separate:

### Tactical/exact-restriction family

- immediate mover win;
- opponent double threats;
- forced block;
- support-lift loss;
- fork-preemption loss;
- exact action restrictions.

### Predictive no-win/bound family

- initial residual-exhaustion/no-win bounds;
- long-range response no-win bounds.

These bounds may narrow W/D/L without being exact draw conclusions.

### Exact fallback / terminal closure

Unresolved positions continue through exact alpha-beta/RBA transitions.

Actual first-win and full-board draw handling remains in the RBA transition.

## 4. DP 0.8 sufficiency result

### Predictive no-win/bound family

The no-draw experiment removes the predictive bound family while retaining tactical loss/restriction support and exact fallback.

Current disposition:

```text
NONESSENTIAL_FOR_SUFFICIENCY_CANDIDATE
for the selected exact-search composition
```

Reason:

- removed deductions weaken bounds rather than redefining W/D/L;
- retained proof paths do not depend on those bounds;
- selected independent small/late exact oracles agree;
- measured completed solve result is unchanged.

Qualification boundary:

- not a full-suite/final solver qualification;
- not proof that every individual draw-related deduction is negative-value;
- not a universal claim across workloads.

### Tactical family

The win-only ablation removed far more than predictive draw/no-win analysis, including valuable tactical loss/restriction work.

It preserved the sampled root answer but increased total process cycles by **45.46%**.

Therefore DP 0.8 must not infer:

```text
not correctness-load-bearing in one sample
    ->
should be removed
```

The valuation layer matters.

## 5. Valuation profile — total process cycles

Pinned profile:

```text
metric:
    total process cycles

host:
    Intel i5-12600K / Windows

runtime:
    Node 26.7.0
    V8 14.6.202.34-node.28

workers:
    4 Lazy SMP

input:
    45461667

shared/local cache entries:
    65,536

sample mask:
    7
```

### No-draw candidate

Initial paired total-cycle change:

```text
-3.093%
95% descriptive interval [-5.776%, -0.410%]
```

Confirmation:

```text
-3.768%
95% descriptive interval [-7.333%, -0.202%]
```

All eight paired blocks favored the candidate on total cycles.

Wall-time intervals span zero in both screens, so no corresponding elapsed-time ordering is established.

### Win-only candidate

```text
+45.46% total process cycles
95% descriptive interval [39.29%, 51.62%]
```

Rejected under this valuation.

### CPC-owned transition win-check removal

After CPC proves the selected CPC-only recursive path has no immediate mover win, the duplicate transition-level immediate-win check can be omitted on that guarded path while root/checked-entry/terminal obligations remain.

Confirmation total-cycle result:

```text
-1.825%
95% descriptive interval [-2.867%, -0.784%]
```

This is another DP 0.8 pattern:

```text
established upstream support
    ->
duplicate downstream test
    ->
nonessential on the guarded consumer path
```

Broader qualification remains pending.

## 6. Measurement discipline

These results are not universal cost laws.

The graph preserves:

- exact host/runtime/workload scope;
- fresh-process ABBA measurement design;
- descriptive intervals;
- diagnostic-versus-production separation;
- contrary/noisy diagnostic evidence;
- lack of production promotion.

A named metric without measured/derived evidence would remain unresolved rather than being guessed.

## 7. Relationship to qualified hot-loop 0.3

Hot-loop 0.3 remains current qualified performance-research authority.

0.4 adds:

- Core 0.19 derived-support routing;
- DP 0.8 sufficiency/valuation separation;
- current CPC ablation evidence;
- explicit partial-CPC-versus-exact-draw boundary;
- explicit nonessential-support-versus-omission-preference distinction.

No 0.3 historical evidence is rewritten.

## 8. Promotion burden

Before 0.4 can replace 0.3 as qualified performance-research authority:

1. mechanically close native/JSON/Markdown correspondence;
2. pin every consumed experiment revision and evidence path;
3. independently verify the W/D/L derived-support overlay against authority 1.2 + Core 0.19;
4. independently verify the guarded CPC-owned transition substitution;
5. run broader no-draw correctness/measurement controls sufficient for the intended authority scope;
6. preserve valuation-specific conclusions rather than converting them into universal performance claims;
7. rerun Discovery Protocol using the then-qualified DP authority—DP 0.8 if promoted, otherwise retain its findings as unqualified successor research.
