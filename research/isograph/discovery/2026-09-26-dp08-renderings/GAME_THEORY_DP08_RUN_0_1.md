# DP 0.8 discovery run — Connect4 game theory 1.2 + Core 0.19 support — 0.1

**Status:** experimental successor discovery; DP 0.8 is unqualified and this file is not game-theory authority  
**Campaign branch:** `research/dp08-discovery-20260926`  
**Modernization input commit:** `6d386c180d98f4be6dc96b8c72db769a4d75620f`  
**Qualified game-theory authority:** `CONNECT4_LOGIC_AUTHORITY_1_2`  
**Valuation profile:** none

## Frozen inputs

| Artifact | Git blob |
|---|---|
| `CONNECT4_LOGIC_AUTHORITY_1_2.md` | `14f46d82cfe349b01aea7fa881568dfdca9aa5a0` |
| authority manifest 1.2 | `5f401c93f8ea653fd3bc96e386b08ef7d92c519e` |
| authority promotion native | `f65bd319d9b955254d2f4c99247af829bd63340b` |
| semantic root 1.2 | `0359e8e7a3d7e5402d562c4ae5be04d2617f46fb` |
| semantic machine graph 1.2 | `761bb2ad4ec3c45eff4707bbeb216b467bc7c300` |
| semantic native topology 1.2 | `dba9fccee417dc6c593011d85330d42f5b71b079` |
| Core 0.19 W/D/L support native | `3742da884bebf701c6f591268faf69daf071a8fb` |
| Core 0.19 W/D/L support JSON | `1c057ae36cfeaf05edfca6411d18c07268238f39` |
| Core 0.19 W/D/L support prose | `4d9d012685e83d969d89c5e80ab620e9d6acf25d` |

The 1.2 manifest records the exact semantic package as qualified authority. The Core 0.19 support overlay is unqualified derived support and changes no gameplay authority.

## Declared discovery objectives

### C4-WDL

Establish an exact completed P0-oriented ordinary outcome classification:

```text
WIN = +1
DRAW = 0
LOSS = -1
```

for the qualified ordinary-value semantics.

### C4-VALUE

Establish exact scalar ordinary value for a legal standard-7x6 state.

### C4-LITERAL-ACTION

Establish scalar value plus a literal orientation-sensitive action/move label.

### C4-PROOF

Establish a guarded proof/certificate whose validity may depend on non-q premises such as deadlines, response resources, realizability, provenance, dependency cone, or guard context.

The objectives are intentionally separate because their sufficient support differs.

---

# 1. Exact W/D/L partition produces three residual classifiers

Qualified authority supplies the exact ordinary value domain:

```text
{-1,0,+1}
```

and the support overlay records it as mutually exclusive and collectively exhaustive for an exact completed ordinary W/D/L classification.

The already recorded residual is:

```text
not WIN
and not LOSS
    -> DRAW
```

DP 0.8 derives the two symmetric residual consequences under the same partition authority:

```text
not WIN
and not DRAW
    -> LOSS

not DRAW
and not LOSS
    -> WIN
```

Therefore an exact classifier need not obtain three independent positive class detections.

Three alternative sufficient classifier topologies exist abstractly:

```text
exact WIN exclusion + exact LOSS exclusion
    -> residual DRAW

exact WIN exclusion + exact DRAW exclusion
    -> residual LOSS

exact DRAW exclusion + exact LOSS exclusion
    -> residual WIN
```

This is an information/support result, not an implementation recommendation.

No valuation profile says which exact exclusions are cheapest or easiest to establish.

## Critical firewall

The result requires **exact closed classification support**.

It does not authorize:

```text
partial CPC did not find WIN
and partial CPC did not find LOSS
    -> DRAW
```

because a partial CPC pass may still be unresolved.

**Disposition:** residual W/D/L class support is exact; partial-detector complement remains rejected.

---

# 2. Semantic outcome versus independent detector

For C4-WDL:

```text
DRAW as a semantic outcome
    !=
requirement for one independent DRAW detector
```

The same is true symmetrically for WIN and LOSS once the other two exact exclusions are established.

Thus:

- all three semantic outcomes remain represented;
- any one direct class-test may be nonessential for one exact classifier topology;
- the omitted class must remain derivable from exact partition support;
- a detector may still have valuation value even when not uniquely necessary for correctness.

No semantic outcome is deleted from authority 1.2.

---

# 3. Rank-well-founded ordinary value support

Authority 1.2 states:

- legal nonterminal moves increase occupied-cell rank by one;
- the game is finite;
- first win stops;
- P0 nodes take max over action outcomes;
- P1 nodes take min over action outcomes;
- global fixed-point machinery is not a primitive requirement.

Therefore the ordinary value dependency is well-founded by rank.

A direct sufficient topology for C4-VALUE is:

```text
terminal outcome semantics
+ exact legal actions
+ exact successor relation
+ rank-well-founded max/min recursion
    -> exact V(q_o)
```

A separately materialized global fixed-point engine is **NONESSENTIAL_FOR_SUFFICIENCY** for this declared ordinary-value objective.

This does not mean fixed-point or supply-driven algorithms are invalid or economically inferior. They are alternate evaluation schedules.

---

# 4. q_o versus q_r — target-dependent sufficient support

Authority 1.2 makes the distinction exact.

## q_o

Equal `q_o` preserves:

- literal legal columns;
- terminal token for each literal action;
- successor `q_o` for each nonterminal literal action;
- complete orientation-sensitive action-labelled future behavior.

## q_r

`q_r` is the horizontal-reflection orbit quotient of `q_o`.

Equal `q_r` preserves the complete future game only under an explicit identity-or-reflection transporter:

```text
orientation same:
    c -> c

orientation reflected:
    c -> 6-c
```

It preserves exact scalar W/D/L/value reuse.

## DP 0.8 consequence

### Objective C4-VALUE

For scalar ordinary value, the literal orientation carried by `q_o` is not uniquely necessary at the cache/value-identity boundary.

```text
q_r
+ exact reflection automorphism/value invariance
    -> sufficient scalar value reuse
```

So a literal-orientation-sensitive cache key is **NONESSENTIAL_FOR_SUFFICIENCY** for scalar value reuse when the exact `q_r` quotient is available.

This does not remove `q_o` from the semantic game representation.

### Objective C4-LITERAL-ACTION

`q_r` alone is insufficient to return a literal column label.

The target needs:

```text
q_r value/action information
+ orientation / transporter metadata
    -> literal action label
```

Therefore transporter orientation is **LOAD_BEARING** for the literal-action objective.

This gives a clean objective-scoped split:

```text
scalar WDL:
    q_r sufficient

literal move:
    q_r alone insufficient
    q_r + transporter sufficient
```

---

# 5. q/value versus proof/certificate support

Authority 1.2 explicitly says q/value equality does not transport non-q proof premises.

For C4-PROOF, support may additionally require:

- temporal/deadline facts;
- response resources;
- realizability;
- CPC/NDC premises;
- provenance/dependency cone;
- guard context.

Therefore:

```text
same q_o or q_r
or same exact scalar value
    !=
same valid proof/certificate
```

A q/value cache hit is not a sufficient substitute for a stronger guarded proof unless the guard premises themselves are preserved or independently re-established.

**Disposition:** proof/value boundary remains load-bearing.

This is also a direct negative control against overusing support quotienting.

---

# 6. Alternative sufficient value topologies already represented

For C4-VALUE, current authority contains materially distinct exact routes when their preconditions hold.

## V1 — ordinary recursive dependency

```text
successor values
+ max/min player rule
+ rank well-foundedness
    -> V(q)
```

## V2 — q_r exact value reuse

```text
existing exact cached V(q_r)
+ reflection transporter/value invariance
    -> scalar V for an orbit-equivalent state
```

## V3 — complete RBA boundary

Where an RBA boundary is complete and publishes an exact ordinary-value consequence:

```text
complete exact residual/value boundary
    -> exact ordinary value
```

## V4 — qualified guarded shortcut

Where a qualified guarded theorem has all of its non-q premises:

```text
guard premises
+ theorem
    -> exact ordinary value consequence
```

These are alternative sufficient topologies, not interchangeable source semantics.

No current valuation ranks them universally.

---

# 7. Implicit support around q transport

A useful derived distinction is:

```text
q_o equality
    -> literal action-labelled future equivalence

q_r equality
    -> transported action-labelled future equivalence
    -> scalar value equality
```

The second arrow projects away orientation only for objectives invariant under the transporter.

This exposes a general DP pattern:

```text
exact symmetry quotient
    can be sufficient for invariant observable
    while being insufficient for coordinate-sensitive witness
```

No NEI conclusion is added. Authority 1.2 already owns the relevant future-behavior identity/equivalence scope.

---

# 8. Counterfactual tests

| Candidate support | Counterfactual | Result |
|---|---|---|
| third independent W/D/L class detector | derive class residually from the other two exact exclusions + partition | **NONESSENTIAL_FOR_SUFFICIENCY** for C4-WDL in that classifier topology |
| exact partition/exhaustiveness | remove it while attempting residual-class inference | **LOAD_BEARING** |
| first-win terminal semantics | remove it from ordinary future-game semantics | **LOAD_BEARING** |
| literal orientation in scalar q cache key | replace q_o keying by exact q_r orbit key | **SUBSTITUTABLE** for scalar value reuse |
| reflection transporter for literal move output | remove orientation mapping | **LOAD_BEARING** for C4-LITERAL-ACTION |
| non-q guard premises | reuse q/value alone as proof certificate | **LOAD_BEARING** for C4-PROOF where theorem validity depends on them |
| global fixed-point engine | use rank-well-founded recursion | **NONESSENTIAL_FOR_SUFFICIENCY** for exact ordinary value semantics |
| solver policy name (IsoMax/BSFP/etc.) | change evaluation/materialization schedule while preserving exact dependency | **NONESSENTIAL AS GAME SEMANTICS**; performance/implementation value not assessed |

---

# 9. Residual classes

DP 0.8 identifies several legitimate residual/quotient structures with different scopes:

1. **W/D/L residual class** — one exact outcome follows after exclusion of the other two.
2. **reflection orbit** — `q_r` quotients `q_o` under horizontal reflection for transporter-invariant value reuse.
3. **proof residual** — not collapsible to q/value because non-q premises may remain.
4. **RBA open region** — not collapsed; exact value consequences are usable only where boundary closure is established.

These must not be merged into one generic “same state” relation.

---

# 10. Minimal / minimum status

No global minimum support is claimed for Connect4 value computation.

Reasons:

- multiple exact value routes exist;
- guarded proof routes are context dependent;
- RBA alternative construction space remains open;
- algorithmic/materialization schedules are not exhausted;
- no universal valuation or support-size order is supplied.

Within the tiny abstract candidate space consisting only of the three exact class-exclusion pairs for a completed W/D/L classifier, every two-class-exclusion pair is sufficient to recover the third class. There is no unique preferred pair without valuation.

That local classification result is not a minimum solver theorem.

---

# 11. QU / DTS / NEI

- **QU:** C4-R0076 proof/value bridge remains open; RBA representation/evaluation alternatives remain open; global minimum support unresolved.
- **DTS:** required whenever a proposed shortcut changes first-win transition meaning, guard availability, or the orientation/action transporter.
- **NEI:** no new natural identity judgment is made. The qualified authority already owns the scoped `q_o` future-behavior result and `q_r` transporter-aware equivalence.
- **Valuation:** none. No inference from fewer transitions/tests to lower runtime.

---

# 12. Disposition

DP 0.8 found useful structure without changing game theory:

1. exact W/D/L is a three-class partition with **three symmetric residual-classifier topologies**;
2. semantic DRAW is not an independent-detector requirement;
3. rank well-foundedness makes a global fixed-point engine optional for ordinary-value sufficiency;
4. `q_r` is sufficient for scalar value reuse but requires transporter orientation for literal action output;
5. q/value remains insufficient for proof/certificate objectives with non-q premises;
6. recursive, q-cache, complete-RBA, and guarded-theorem routes remain alternative sufficient value topologies.

All findings remain successor discovery until separately qualified; authority 1.2 bytes are untouched.
