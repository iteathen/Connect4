# Output-sensitive provenance quotient

**Date:** 2026-09-13  
**Status:** exact complete-small-game theorem/control; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

The current research target is richer than W/D/L. It asks for the subset of the mechanically derived geometric winning lines that can occur as terminal P0 wins under perfect W/D/L play:

```text
G(s) subset_of Lambda
```

The existing WSL/support-event quotient was designed for existential game value. This note determines whether that same quotient is also exact for terminal-line identity, and derives the smallest robust correction found by complete-game controls.

The suspected standard-board output cardinality remains unavailable to the derivation.

---

## 1. Two objectives require two equivalence relations

For W/D/L, two P0 residual requirements with the same exact future cell set are semantically interchangeable for the proposition:

```text
P0 can complete at least one surviving line.
```

Likewise, at identical support/timing context, a strict residual superset can be removed when a smaller requirement already suffices for the same existential objective.

That is the basis of WSL deduplication and minimal-antichain normalization.

But the output objective asks a different question:

```text
which original geometric line label can be the terminal win?
```

Two original lines may currently have the same residual subset while remaining distinct terminal labels. A dominated original line may also remain a possible terminal label even though it is unnecessary to prove that *some* P0 win exists.

Therefore W/D/L equivalence does not automatically imply output equivalence.

---

## 2. Complete 4x3 counterexample to W/D/L-output congruence

On complete `4x3 connect-3`, the exact support-event W/D/L quotient uses:

```text
X_V =
  (ply,
   aggregate dead-event pool,
   per-column next-relevant-event gaps,
   P0 minimal residual antichain,
   P1 minimal residual antichain)
```

It collapses:

```text
4,659 physical states -> 3,670 structural states
```

with zero W/D/L value mismatches and zero structural successor-set mismatches.

However, computing the exact perfect-play terminal-line set `G(s)` on the physical control reveals:

```text
181 X_V classes contain more than one G(s) value.
```

So `X_V` is exact for value but not congruent for line-output semantics.

### Explicit witness

The legal prefixes

```text
A: 1,1,3,3,4,3
B: 3,1,1,3,4,3
```

have the same W/D/L support-event key and both have absolute P0 value `Win`.

Yet:

```text
G(A) = {0,3,7,11}
G(B) = {3,7,11}
```

where line `0` is the bottom horizontal:

```text
A1-B1-C1.
```

In A that original line remains live for P0. In B, P1 owns A1 and permanently kills that line.

The minimal residual antichain nevertheless becomes identical because another original line supplies the same existential residual requirement. That merge is correct for W/D/L and incorrect for output attribution.

This is an exact witness of **objective-dependent quotienting**.

---

## 3. Provenance-annotated WSL

Define an output-provenance relation for P0:

```text
Pi0(r) subset_of Lambda
```

with meaning:

> `L in Pi0(r)` iff original geometric line `L` is still live for P0 and its exact current nonempty residual requirement is `r`.

This can be stored as a sparse grouping:

```text
residual RID -> origin-line bitset
```

rather than as one independent record per line.

Duplicate exact residuals therefore still merge structurally, but their output labels merge by **union of provenance**, not by erasure.

### P0 event transition

For event `x`:

```text
x notin r:
  Pi0(r) remains

x in r and r\{x} nonempty:
  move Pi0(r) into Pi0(r\{x})

x in r and r\{x} empty:
  every L in Pi0(r) is completed by this event
```

If several provenance groups empty on one event, all corresponding original lines are emitted as simultaneous terminal labels.

### P1 event transition

For a P1 event `x`:

```text
x in r:
  delete Pi0(r)
```

because every original P0 line represented by that group is now permanently blocked.

Other groups remain.

This is exactly the ordinary WSL shrink/kill transition with an origin-label annotation.

---

## 4. Antichain normalization becomes objective-dependent

For value semantics, if:

```text
r1 strict_subset r2
```

at identical support/timing context, `r2` may be removed from the P0 W/D/L antichain because completing `r1` already proves existence of a P0 win no later.

For terminal-line output semantics, the corresponding provenance cannot in general be discarded:

```text
Pi0(r2) != empty
```

may contain original line labels absent from `Pi0(r1)`.

Therefore the safe architecture is:

```text
value layer:
  minimal WSL antichain

output layer:
  exact provenance-annotated residual relation Pi0
```

The value layer remains aggressively quotientable. The output layer retains only the additional attribution required by the richer question.

This does not invalidate C4-0006 antichain semantics; it restricts them to their stated existential objective.

---

## 5. Output-sensitive support frontier

Output provenance also changes which future physical events remain relevant.

A cell absent from the minimal W/D/L antichain may still belong to a live original P0 line whose label must be tracked. Such a cell can affect when that line can complete.

Therefore define output-event relevance from:

```text
domain(Pi0)
union
P1 value-relevant minimal residuals
```

rather than from the P0 minimal W/D/L antichain alone.

The same support-event compression still applies:

```text
ply
aggregate dead-event pool
per-column distance to next output-relevant event
```

Cells before the next relevant event in a column are interchangeable filler events except for their contribution to event rank/parity. Columns with no remaining relevant event contribute only to the aggregate dead-event pool.

---

## 6. Direct structural dynamics: no colored board required

On complete `4x3 connect-3`, define:

```text
X_G =
  (ply,
   output-relevant dead-event pool,
   per-column next-output-relevant-event gaps,
   Pi0,
   P1 minimal residual antichain)
```

A transition is generated directly from `X_G`:

1. a neutral event consumes one unit of `dead-event pool`;
2. a filler event before a column's next relevant event decrements that column's gap;
3. a relevant P0 event applies exact `Pi0` residual subtraction and P1 requirement killing;
4. a relevant P1 event kills affected `Pi0` groups and shrinks P1's own residuals;
5. support gaps/dead-pool are recomputed from the remaining relevant-event universe.

Residual requirements never grow, so once a column has no output-relevant future event it cannot later regain one.

Starting from the empty **structural** root, this transition system regenerates exactly:

```text
4,353 structural states
```

which is exactly the observed output-sensitive quotient of the 4,659 physical states:

```text
missing structural states  0
extra structural states    0
G successor mismatches     0
```

Thus the colored board is unnecessary even for terminal-line-output dynamics in the complete control.

---

## 7. Direct G recurrence on the quotient

Apply the already derived set-valued perfect-play recurrence directly to the structural graph:

```text
P0 terminal edge:
  emit the exact origin labels completed by the Pi0 transition

P1 terminal edge:
  empty

P0 decision:
  union G over nonempty/winning alternatives

P1 decision:
  empty if any alternative has empty G;
  otherwise union G over all alternatives
```

The empty structural root returns:

```text
|G(root)| = 14
```

which matches the complete physical control: every one of the 14 geometric connect-3 lines occurs on at least one W/D/L-perfect P0 winning trajectory.

No physical board identity is consulted by the structural recurrence.

---

## 8. Cross-game provenance qualification

The W/D/L support-event quotient is frequently too coarse for `G` on larger complete controls as well:

```text
4x3 connect-3: 181 mixed-G W/D/L classes
4x4 connect-4: 280
5x3 connect-4: 646
4x5 connect-4: 7,765
```

Adding exact P0 line-to-residual provenance removes every observed `G` collision:

```text
4x3: 0
4x4: 0
5x3: 0
4x5: 0
```

A thinner overlay recording only each live line's remaining-cell **count** is not generally sufficient. Complete controls retain mixed-G classes:

```text
4x4: 18
5x3: 78
4x5: 50
```

So the robust candidate is exact residual provenance, not merely live/dead status or residual cardinality.

---

## 9. Consequence for the standard 7x6 output problem

The desired standard-board output is:

```text
Lambda_PP = G(root) subset_of Lambda_69
```

The structural solver should therefore separate two responsibilities:

### Value proof substrate

```text
support/event frontier
+ P0/P1 minimal WSL antichains
+ CPC
+ blockers/responses/deadlines
+ NDC / predecessor proof
```

This answers whether P0 can force a win.

### Output attribution overlay

```text
Pi0 : residual RID -> original P0 geometric-line labels
```

This answers *which* original lines can be terminal on perfect winning trajectories.

The output overlay should not contaminate or weaken the more aggressive value quotient merely because the research question asks for terminal labels.

---

## 10. Sharpened remaining calculus gap

The complete small-game work now establishes:

1. local terminal/progress leaves can be expressed as residual/support/response predicates;
2. alternating `E/A` predecessor closure exactly reconstructs the complete winning attractor;
3. support-event residual states have exact constructive transition dynamics without a colored board;
4. provenance-annotated residual states have exact constructive `G` dynamics without a colored board.

The unresolved searchless problem is therefore narrower:

> derive and merge the relevant `E/A` alternative classes algebraically from CPC/WSL/support/NDC relations **without enumerating the structural quotient graph itself**.

For the 69-line output target, any such alternative-class calculus must carry `Pi0` through the proof so that value-equivalent alternatives do not erase distinct terminal-line labels.

---

## Evidence

```text
docs/research/evidence/2026-09-13-output-provenance-quotient.json
docs/research/evidence/2026-09-13-output-provenance-transition-control.json
```

## Claim boundary

Established:

- W/D/L structural equivalence does not imply perfect-play terminal-line-output equivalence;
- the failure is concretely caused by loss of original geometric-line provenance under residual deduplication/antichain minimization;
- exact P0 residual provenance removes every observed G collision on four complete small-game controls;
- the output-sensitive 4x3 quotient is generative from its own structural root and returns the exact physical-control `G(root)`;
- no colored-board state is required for either W/D/L or output-sensitive transitions in that complete control.

Not established:

- that the exact provenance relation is globally minimal;
- the final standard-7x6 output subset or its cardinality;
- a direct non-enumerative generation of all required `E/A` proof alternatives on 7x6;
- that every strategic certificate required on 7x6 is already expressible by the current CPC/WSL/NDC/progress predicate family.
