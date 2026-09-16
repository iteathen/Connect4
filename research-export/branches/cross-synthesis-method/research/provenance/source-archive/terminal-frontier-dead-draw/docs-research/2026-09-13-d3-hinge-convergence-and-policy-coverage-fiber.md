# D3 hinge convergence and the policy-to-coverage fiber

**Date:** 2026-09-13  
**Status:** exact local structural results + bounded controls; no complete 7x6 solve claim  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / invariant-first isomorphism program:** **Josh Oshiro**  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

The zero-phase control at `4665655546` reduced the unresolved P0 residual winspace to seven requirements after applying the qualified vertical paired-response mask. This note records the next reduction.

The seven-term core is not seven equally difficult requirements. Existing structural fragment generation covers five families richly, but leaves two requirements untouched:

```text
{C3,D3}
{D3,G3}
```

Those two share `D3`. Playing the hinge event `D3` converts both into live singleton obligations `{C3}` and `{G3}` under every legal P1 reply. This exposes a temporal scheduling problem that static blocker coverage cannot represent.

The same controls expose a more general cross-layer principle: projection from typed policy realizability `C` to residual coverage `R` has nontrivial fibers. Distinct policies may induce identical solved-requirement sets while differing in exact temporal validity.

No external W/D/L labels or recursive hard-frontier search are used by the controls below.

---

## 1. Parent context: zero-phase seven-term core

At:

```text
4665655546
```

we have:

```text
rank:     10
heights:  [0,0,0,2,4,4,0]
phase:    0000000
P0 residuals: 37
```

The qualified vertical P1 response mask on rows 2,4,6 intersects 30 residuals and misses exactly seven:

```text
C3-D3
D3-G3
A1-B1-C1
A5-B5-C5-D5
B5-C5-D5-E5
C5-D5-E5-F5
D5-E5-F5-G5
```

See:

```text
docs/research/2026-09-13-column-phase-defect-and-zero-phase-core.md
```

---

## 2. Candidate-fragment census

Implementation:

```text
research/semantic-quotient/state-identity-unification/src/
  quotient-standard7x6-zero-phase-fragment-census.mjs
```

Workflow:

```text
.github/workflows/frontier-zero-phase-fragment-census.yml
```

Successful run:

```text
34800004789
```

The historical Allis A1-A9 machinery is used here only as a **candidate fragment generator**. Its rule names and historical compatibility search are not proof authority. Each generated blocker is used only for exact subset coverage conditional on the fragment being valid.

The census finds 54 candidate instances touching at least one member of the seven-term core.

### Coverage by requirement

```text
C3-D3             candidate types: none
D3-G3             candidate types: none
A1-B1-C1          A2, A7, A9
A5-B5-C5-D5       A4, A5, A6, A8
B5-C5-D5-E5       A4, A5, A6, A8
C5-D5-E5-F5       A2, A4, A5, A6, A7, A8, A9
D5-E5-F5-G5       A2, A4, A5, A6, A7, A8, A9
```

Therefore the old fragment vocabulary is not merely incomplete globally; at this support it has a precise blind spot:

```text
H = { C3-D3, D3-G3 }.
```

Both terms share `D3`, so the seven-term problem factors into:

```text
D3 hinge subsystem
+
bottom/row-5 repair subsystem.
```

The latter has many candidate fragments. The hinge has none in A1-A9 coverage space.

### Direct playable-pair examples

The census also finds Baseinverse-style directly playable pairs:

```text
A1-B1
A1-C1
B1-C1
```

covering `A1-B1-C1`, and:

```text
E5-F5
```

covering both:

```text
C5-D5-E5-F5
D5-E5-F5-G5.
```

These are candidate typed fragments only. Their simultaneous compatibility with the broader policy remains a separate C/N question.

---

## 3. D3 hinge transition

Implementation:

```text
research/semantic-quotient/state-identity-unification/src/
  quotient-standard7x6-zero-phase-d3-hinge.mjs
```

Workflow:

```text
.github/workflows/frontier-zero-phase-d3-hinge.yml
```

Run:

```text
34800109267
```

At `4665655546`, P0 plays:

```text
D3.
```

This move is legal and is not an immediate terminal win.

Residual transition:

```text
{C3,D3} -> {C3}
{D3,G3} -> {G3}.
```

So after the hinge:

```text
Singleton(C3)
and
Singleton(G3).
```

---

## 4. Exact alternative convergence across every P1 reply

The control exhausts the seven immediate legal P1 replies after P0:D3. No reply is an immediate P1 terminal win.

For every reply:

```text
Singleton(C3)
Singleton(G3)
```

both remain live.

At every resulting rank-12 P0-to-move state, the base zero-reservation CPC relation also assigns both target events to the side to move.

Therefore the exact local shared consequence is:

```text
P0:D3
----------------------------------------------
for every legal immediate P1 reply:
  LiveSingleton(C3) AND LiveSingleton(G3)
```

with the important boundary that the singleton targets are not necessarily **currently playable**. This theorem establishes future obligations, not an immediate double threat.

This is an NDC alternative-convergence pattern: seven physical replies share one higher semantic consequence.

---

## 5. Phase split after the hinge

Before D3:

```text
phi = 0000000.
```

After P0:D3:

```text
phi = 0001000.
```

P1's reply then splits into exactly two phase classes:

```text
P1:D4  -> phi = 0000000
all other replies -> phase weight 2.
```

Thus the defender has an exact structural choice:

```text
preserve the zero-phase response skeleton via D4
or
inject a two-coordinate phase defect elsewhere.
```

The singleton consequence `{C3},{G3}` survives either class.

This is stronger than merely observing branch convergence: the branches factor into a common N consequence plus a small P phase residue.

---

## 6. Poisoned vertical contracts at the zero-phase-preserving branch

Follow the zero-phase-preserving response:

```text
466565554644
```

(rank 12, P0 to move).

The live P0 singleton obligations remain:

```text
{C3}
{G3}.
```

The old vertical response contracts in columns C and G are now terminally unsafe.

### C-column local theorem

If:

```text
P0:C1
P1:C2
```

then:

```text
P0:C3
```

is an immediate terminal win.

### G-column local theorem

Likewise:

```text
P0:G1
P1:G2
P0:G3
```

ends in an immediate P0 terminal win.

Implementation:

```text
research/semantic-quotient/state-identity-unification/src/
  quotient-standard7x6-hinge-poisoned-pair-transfer.mjs
```

Workflow:

```text
.github/workflows/frontier-hinge-poison-transfer.yml
```

The first successful run was `34800232540`. Its transition result was correct but the reporting labels printed the trigger as C2/G2 rather than C1/G1. Commit `1522ae94109805d856ff2c11b920477b7d09ea4f` corrects that reporting-only defect; run `34800352635` requalifies the corrected output.

Therefore a valid defender policy cannot blindly retain the former same-column contracts:

```text
C1 -> C2
G1 -> G2.
```

The presence of the future singleton targets changes the temporal meaning of those response pairs.

---

## 7. Negative result: the poison does not transfer through static coverage

The same control removes C2 and G2 from the old vertical blocker mask and recomputes P0 residual coverage.

At `466565554644`:

```text
P0 residual count: 23
```

The original vertical mask misses exactly:

```text
C3
G3
A1-B1-C1
A5-B5-C5-D5
B5-C5-D5-E5
C5-D5-E5-F5
D5-E5-F5-G5
```

Removing both poisoned response cells C2 and G2 changes the uncovered set by:

```text
0 requirements.
```

Equivalently:

```text
PrivateCoverage(C2) = empty
PrivateCoverage(G2) = empty.
```

So the tempting defect-transfer hypothesis:

```text
poisoned response contract
-> remove it
-> some previously covered WSL requirement reopens
```

is false here.

This is useful: the missing semantics is not another coverage relation.

---

## 8. Hidden cross-layer structure: policy-realization fibers

Let:

```text
Cover : C_policy -> R_coverage
```

map a fully typed policy realization to the set of residual requirements that its certified blockers would cover.

The poisoned-pair result proves that this projection can forget load-bearing information.

Two policy records may have the same `R_coverage` image while differing in exact temporal validity because one response schedule enables an earlier opponent terminal event.

Therefore:

```text
same coverage != same policy semantics.
```

The fiber:

```text
Cover^{-1}(S)
```

may contain both valid and invalid policy realizations.

This is structurally parallel to two already-established observation-dependent quotient boundaries:

```text
history -> q
```

where order/timing distinctions may matter to richer strategic observations, and:

```text
q -> q+Pi0
```

where equal value-transition state does not imply equal terminal-line provenance.

The generic principle is:

> A projection may erase a degree of freedom only when the forgotten distinctions are a congruence for every downstream transition and observation being claimed.

For the policy layer, blocker coverage alone is **not** a congruence for temporal realizability.

This explains the earlier control in which raw Allis blocker union fully covered P0 requirements in win, draw and loss positions alike: coverage was observing the wrong quotient.

---

## 9. Latent singleton target contract

The new hinge is not a conventional immediate double threat because C3 and G3 are not initially playable.

Each singleton is instead a **latent completion target** behind a short support chain.

For target C3 at `466565554644`, the support chain is:

```text
C1 < C2 < C3.
```

The old response `P0:C1 -> P1:C2` is poisoned because it makes C3 playable on P0's next turn.

A safe defender schedule, if one exists, must instead arrange the parity/order so that when C3 becomes playable it is P1's turn to consume it, or P1 terminates first. One simple shape would be:

```text
P0:C1
P1:off-column skip
P0:C2
P1:C3
```

with all intermediate guards, resources and opponent deadlines preserved.

G3 has the same local shape.

This suggests a generic typed contract:

```text
LatentTargetDefense(t):
  target residual singleton t
  support predecessors Pred(t)
  forbidden response placements that expose t on attacker turn
  allowed phase-shift / skip resources
  terminal deadline
  target-capture consequence
```

The pair `{C3},{G3}` then becomes a finite **temporal scheduling/capacity** problem over two latent targets, not a static blocker problem.

This is a candidate C/P/N abstraction, not yet a promoted theorem family.

---

## 10. Relationship to older Connect Four strategy vocabulary

This shape resembles the strategic role traditionally attributed to odd threats / Zugzwang reservoirs: a future target is controlled through parity and the order in which support cells are consumed.

The present derivation does not require `OddThreat` as a primitive named rule. The candidate abstraction comes directly from:

```text
R: live singleton target
E: support predecessor chain
P: turn/phase parity
C: skip/response resources
N: guarded target-capture implication
```

If the generic `LatentTargetDefense` contract can reproduce the relevant historical threat rules, the named vocabulary should compile into this lower-level object rather than become another semantic owner.

---

## 11. Bayesian update boundary

The Bayesian mask may now:

- lower utility for additional static-coverage refinements at this seam;
- raise priority for temporal policy fibers and latent-target scheduling;
- raise confidence that the missing bridge lives in `P/C/N`, not `R` alone.

It may not infer W/D/L from the observed hinge, phase class or poison pattern.

All promoted statements above are exact local transition/coverage facts only.

---

## 12. Next bounded seam

Do not recurse q states from this point.

The next exact question is:

> Can the pair of latent singleton targets `{C3},{G3}` be simultaneously defended by one finite typed P1 schedule, preserving all required earlier safety facts, or does every admissible schedule contain a finite parity/resource/deadline obstruction?

Build only the local typed scheduler needed for:

```text
C1 < C2 < C3
G1 < G2 < G3
```

plus the finite set of off-column skip/resource events that can change target parity before either completion deadline.

Required fields:

```text
support prerequisite
current/global rank parity
trigger event
forbidden immediate response
allowed skip/resource event classes
response target
deadline
resource sharing/exclusivity
phase displacement
terminal consequence
```

Success is either:

1. one exact compatible finite P1 schedule satisfying both latent-target contracts; or
2. one exact finite circuit/cut proving every such schedule fails.

Either result is useful. Stop if the scheduler expands into the ordinary physical move tree.

All experiments remain under the hard five-minute wall-clock rule.
