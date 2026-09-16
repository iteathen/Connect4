# A/B mixed-cofactor collision as a controllable-predecessor diagnostic

**Research direction / structural architecture:** Josh Oshiro  
**Formalization / qualification:** OpenAI ChatGPT  
**Date:** 2026-09-16

## Classification

This packet reclassifies the September 14 six-ply A/B solved-database control using the realizability and strategy-dependency results C4-R0060..C4-R0067.

The structural claims below do not use the solved labels as premises. The published database values/action values remain falsification controls for any proposed complete value rule.

Primary source lineage on `research/frontier-negamax-conformance`:

```text
docs/research/2026-09-14-solved-db-structural-discovery.md
docs/research/2026-09-14-solved-db-structural-assessment.md
STATUS.md
next_step.yaml
```

The live frontier source already states that full positive residual incidence distinguishes the witness and that the missing seam is guarded quantifier closure into obligations. This packet aligns that conclusion with the newly normalized lossless-join and uniform-strategy vocabulary.

---

## 1. Witness

Using zero-based move columns:

```text
A = [6,6,6,6,2,2]
B = [2,6,6,2,6,6]
```

Both have

```text
support = [0,0,2,0,0,0,4]
side to move = P0.
```

Only two occupied owners differ in the g-column stack. In the original audit:

```text
boundary potential: equal
playable singleton/fork observation: equal
both <=2 residual antichains: empty/equal
all one-event current-owner <=2 jets: equal.
```

The external solved source assigned different W/D/L/action behavior, but that is not used below to infer a theorem.

---

## 2. Exact full residual information already separates A and B

Let `R_p(s)` be the exact minimal positive residual antichain for player `p` at state `s`.

The landed structural replay established

```text
(R_0(A),R_1(A)) != (R_0(B),R_1(B)).
```

The difference is higher-order relative to the degree-2 observation. It is therefore not absent from the exact residual state; it was discarded by the tested low-order projection.

After two common owner-labelled events, mixed cofactor substitution contracts one B-only cubic residual to the low-order P1 residual `{e1,f1}` in the first documented witness. Distinct-cell cofactors commute algebraically, so this is exposure of existing positive-incidence information, not creation of a new temporal algebra primitive.

The assessment also records that after the shared d-column continuation, the compared structural states still differ in several higher-order residuals. Therefore the disputed continuation is not a collision of the complete residual identity either.

### Exact conclusion

The A/B witness cannot establish the need for another board-state coordinate beyond the complete residual/support information already present in the exact structural state.

It **does** establish that the lower-order observation/certificate generator was incomplete.

This distinction matters:

```text
state information missing       -> enrich exact state identity
proof transformer missing       -> enrich certificate/guard closure
```

The witness supports the second diagnosis.

---

## 3. Algebra/time separation survives the reclassification

For player `p`, the positive completion formula is

```text
F_p = OR_(R in R_p) AND_(v in R) X_(p,v).
```

Owner-labelled placement is ordinary Boolean cofactor substitution followed by minimal-antichain absorption. For distinct cells, the substitutions commute.

So temporal noncommutativity is not located in the positive Boolean cofactor operator. It enters through:

```text
which event is admissible on which turn;
which support predecessor has occurred;
which opponent intervention is possible;
which response resources are still jointly available;
which consequence is certified before which deadline;
which terminal occurs first.
```

This is the same separation now expressed by C4-R0062 (history), C4-R0064 (uniform strategy) and C4-R0065 (explicit bounded response dependencies).

---

## 4. Obligation birth as an observation-relative controllable predecessor

Let `alpha(h)` be the structural observation retained at a proof history `h`. It may include exact support, full residual antichains, selected CPC/control-potential facts, active typed resource contracts, precedence/deadline state and already-certified consequences.

Let `K` be a candidate post-cofactor consequence, for example a lower-degree residual, blocker clause, singleton/fork obligation, or terminal fact.

A sound obligation-birth theorem must have the following strategic shape:

```text
there exists a controller certificate/response policy f
such that f is uniform on alpha-equivalent histories
and for every admissible opponent intervention y before deadline D:
    the exact support/cofactor/resource transition under y and f
    either entails a consequence equivalent to K before D
    or reaches an independently certified favorable terminal result,
with first-win stopping preserved.
```

This is a **controllable/alternating predecessor over symbolic consequence states**. In bounded propositional form, the distinctions on which `f` may depend are exactly the Skolem dependency set from C4-R0065.

The law is intentionally conclusion-relative. The controller need not preserve one named residual if another residual/certificate entails the same obligation. Conversely, merely observing a degree contraction does not prove obligation birth.

---

## 5. Why no new Boolean consequence type is currently warranted

The current normalized consequence vocabulary already contains:

```text
affine/fixed ownership or pairwise parity fact;
positive monotone blocker clause;
residual/zero-edge terminal target;
guarded response/resource/deadline relation;
terminal proposition / one-sided interval consequence.
```

The A/B replay has not exhibited a consequence that lies outside these shapes. What is missing is the universal strategic guard connecting a post-cofactor structural difference to one of those consequences.

Therefore the disciplined order is:

```text
exact residual difference
-> derive candidate consequence
-> preserve required observation/dependencies
-> quantify all admissible opponent interventions
-> check shared resources/precedence
-> check deadline and first-win
-> certify existing consequence shape
```

Only if this chain stops at a consequence that cannot be represented by the established vocabulary is a new logical primitive justified.

---

## 6. Relation to state, transition, cache and proof identity

This witness now occupies a precise point in the quotient-strength ladder.

### Static/value-transition state

The exact support + full residual pair distinguishes A and B, so the witness is not evidence against that ordinary structural state identity.

### Strategic observation

A cheaper degree-2 projection merges them and is too weak as a complete value/certificate observation. That is a projection failure.

### Proof/certificate identity

Even where exact state identity is sufficient for future legal transition semantics, a reusable proof certificate must retain its guard dependencies, resource horizon and consequence meaning. A/B does not collapse those proof obligations.

No conclusion about an implementation cache namespace follows from this note; cache identity remains its own consumer-specific contract.

---

## 7. Falsifiers

Revise C4-R0068 if structural replay shows that the complete support/full-residual records for A and B (or their shared-d successors) are in fact identical under the exact state semantics claimed here.

Revise C4-R0069 or introduce a new consequence type if an exact guarded instance requires a conclusion that cannot be expressed as any composition of:

```text
affine ownership/parity;
positive blocker clause;
residual/terminal target;
response/resource/precedence/deadline relation;
terminal/interval consequence.
```

A proposed obligation-birth rule is falsified if:

- it permits a response to depend on an opponent distinction absent from its retained observation;
- it omits an admissible opponent intervention that destroys the consequence;
- it spends one response resource twice;
- it certifies eventual truth after the requirement deadline;
- it ignores an earlier terminal;
- it treats one contracted residual as mandatory when a different disjunct may carry the same consequence.

---

## 8. Immediate bounded continuation

For the shared d-column A/B continuation, do not attempt to infer the database value directly.

Instead:

1. retain full post-d positive residual antichains;
2. enumerate/derive the **first consequence-relevant opponent intervention classes**, not the whole game tree;
3. quotient those interventions by claim-relative consequence equivalence;
4. for each class record the minimum observation dependency needed by the controller response;
5. attach exact support/typed-resource/precedence/deadline guards;
6. test whether every class closes into an existing consequence shape;
7. stop at the first non-derivable dependency/resource/deadline fact.

That residue, not the oracle label, is the next candidate law.
