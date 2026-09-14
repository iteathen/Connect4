# Bayesian research mask around the exact Connect4 logic

**Date:** 2026-09-13  
**Status:** active research meta-layer; deliberately outside proof semantics  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / Bayesian-mask framing:** **Josh Oshiro**  
**Formalization / synthesis / qualification:** OpenAI ChatGPT

## 1. Architectural rule

The Bayesian layer is a **mask around research selection only**. The exact Connect4 logic is unaware that the mask exists.

```text
literature / controls / falsifiers / experiments
                  |
                  v
         BAYESIAN RESEARCH MASK
       credence + utility + test priority
                  |
                  v
          choose next bounded test
                  |
                  v
       candidate theorem / counterexample
                  |
          exact proof gate only
                  |
                  v
        EXACT LOGIC / CERTIFICATE CORE
          E + R + P + C + N + G + Q
```

There is no inference edge from probability, confidence, expected utility, ranking, or literature popularity into an exact certificate.

A candidate crosses the membrane only as:

```text
hypothesis
 -> bounded falsification / derivation
 -> exact theorem with explicit guards
 -> accepted deterministic rule
```

When it crosses, all Bayesian metadata is discarded.

---

## 2. Canonical evidence clusters after isomorphism resolution

The structural isomorphism resolution in:

```text
docs/research/2026-09-13-structural-isomorphism-resolution.md
```

collapses previously separate-looking candidates into seven canonical evidence clusters:

```text
E  causal event substrate
R  residual obligation structure
P  parity / temporal constraints
C  typed policy/resource structure
N  guarded dependency closure
G  alternating strategic proof semantics
Q  observation-preserving quotient/output layer
```

### Anti-double-counting rule

Different mathematical names inside one cluster are **correlated representations**, not independent evidence.

Examples:

```text
E:
  poset + order ideals + distributive lattice + poset antimatroid + trace diamonds
  = one gravity/accessibility object

R:
  WSL antichain + Sperner hypergraph + monotone DNF
  = one residual-obligation object

P:
  CPC event-rank parity + Allis even-release Zugzwang + affine GF(2)
  = one parity-control invariant family

C:
  Allis fragments + response pairs + gain-cost-rest + danger/fork views
  + matching/Hall special cases + compatible-cover CSP + paving projections
  = one typed policy/resource problem family

N:
  dependency DAG + directed implication hypergraph + disjunctive enabling
  + alternative convergence
  = one guarded dependency-closure family

G:
  E/A grammar + AND/OR DAG + alternating circuit + fixed-point unfolding
  = one strategic predecessor semantics
```

Evidence supporting two labels in the same cluster must not be multiplied as if independent.

---

## 3. What the mask tracks

For each unresolved bridge hypothesis `H`, track separately:

```text
P_valid(H | EVIDENCE)
  subjective credence that the narrowly stated bridge is valid/applicable

P_useful(H | valid, EVIDENCE)
  subjective credence that the bridge materially reduces the 7x6 proof burden

cost(H)
  bounded theorem/experiment cost

info_gain(H)
  expected discrimination among competing explanations
```

These are research-management quantities only.

Evidence classes:

```text
T = exact theorem / representation equivalence
I = exact internal qualification
L = close external literature result
A = analogy / representational fit
F = falsifier / negative control
```

Correlated evidence from one theorem, experiment, paper family, or resolved isomorphism cluster must not be treated as independent likelihood factors.

---

## 4. Current cluster-level epistemic state

The following numbers are approximate subjective credences for research management, not solver values.

| Cluster | Narrow scoped claim | P_valid | P_useful | Interpretation |
|---|---|---:|---:|---|
| E | gravity/support is correctly modeled by the finite event poset and ideal lattice; independent guarded interleavings can be quotiented | 0.999 | 0.86 | representation is exact; amount of remaining proof compression is open |
| R | WSL residual antichains are the correct canonical obligation object and blocker duals are useful derived views | 0.999 | 0.94 | exact structural semantics; realizability lives in P/C/N |
| P | CPC/even-release/GF(2) captures the parity-control invariant needed by typed certificates | 0.998 | 0.93 | exact scoped parity results; completeness of parity facts is not claimed |
| C | typed policy/resource contracts subsume the useful semantics of named response rules and compatibility views | 0.94 | 0.93 | strongest open representation/compression candidate |
| N | guarded implication hypergraphs correctly represent shared/disjunctive certificate dependencies | 0.995 | 0.91 | representation is strong; completeness of current inference vocabulary is open |
| G | alternating fixed-point semantics is the exact strategic owner; safety/progress certificates can witness membership | 0.999 | 0.99 | semantic target is settled; compact proof construction is open |
| Q | q is the accepted ordinary-transition/value projection and q+Pi0 is required for provenance-sensitive output | 0.995 | 0.89 | exact declared boundary; q minimality is not assumed |

These rows are **cluster credences**, not independent theorem votes.

---

## 5. Uncertainty now lives on bridges, not ontologies

After resolution, the main uncertain hypotheses are connections between canonical layers.

### B1 — compact safety bridge

```text
R + P + C -> compact exact total safety certificate
```

Current mask:

```text
P_valid  ~= 0.88
P_useful ~= 0.90
```

Evidence:

- exact WSL/blocker substrate;
- typed response-contract cut theorem;
- Allis compatibility prior art;
- danger/fork and matching views;
- static/untyped response approaches already falsified.

Main risk: load-bearing timing/resource interactions may prevent compact closure.

### B2 — reusable typed implication bridge

```text
C + N -> small reusable implication/composition algebra
```

Current mask:

```text
P_valid  ~= 0.84
P_useful ~= 0.89
```

Evidence:

- NDC already supports guarded dependencies;
- resource-contract projections eliminate classes of alternatives;
- disjunctive enabling maps naturally to shared consequences.

Main risk: implication descriptors may degenerate to one record per exact q state.

### B3 — positive proof bridge

```text
N + G -> complete center-positive proof without broad exact-q recursion
```

Current mask:

```text
P_valid  ~= 0.62
P_useful ~= 0.98
```

This is the decisive high-value uncertainty. Exact semantics says what a proof must mean, but we do not yet know whether the current structural vocabulary is complete enough to construct it compactly.

### B4 — trace normalization bridge

```text
E confluence -> material proof compression before enumeration
```

Current mask:

```text
P_valid  ~= 0.77
P_useful ~= 0.69
```

Local confluence is exact. The uncertainty is whether interleaving redundancy is a large enough share of the unresolved frontier to matter materially.

### B5 — finite boundary-defect bridge

```text
infinite/semi-infinite closed response policy
 + finite E restriction
 -> exact defect calculus explaining the 7x6 asymmetry/win
```

Current mask:

```text
P_valid  ~= 0.66
P_useful ~= 0.85
```

This remains a high-information structural hypothesis, not an exact rule.

### B6 — proof-language normalization bridge

```text
linear/pomset/focusing representation
 -> smaller exact certificate without changing E/R/P/C/N/G semantics
```

Current mask:

```text
P_valid_as_translation ~= 0.72
P_useful               ~= 0.58
```

This is deliberately lower priority now that those logics have been resolved as possible proof languages rather than missing semantic layers.

---

## 6. Negative evidence retained

The mask keeps explicit low posterior weight on already-falsified or poorly performing directions:

| Direction | P_useful now | Evidence |
|---|---:|---|
| same-column vertical follow-up as complete global calculus | 0.01 | chain controls re-expand/off-column |
| exact-q proof-term subset absorption as main local compressor | 0.01 | 28 terms -> 28 minimal; zero absorption |
| deeper raw exact-q recursion as next theorem-discovery method | 0.02 | 100001-state cap without new proof class |
| cardinality-only child/frontier descriptors | 0.02 | identical arity signatures with later behavior divergence |
| untyped static response capacity | 0.03 | center serialization/resource conflict falsifier |

A falsifier lowers only the tested claim; it does not invalidate the canonical parent mathematics.

---

## 7. Next-test policy

Use expected information gain under the hard five-minute rule.

Current highest-value bounded test remains the fixed sibling family:

```text
46656551
46656552
46656555
46656557
```

Build only the canonical finite relation:

```text
R residual obligations
+ P parity/deadline facts
+ C typed response/resource contracts
+ N implication edges
```

Then use derived views only diagnostically:

```text
blocker duals
minimal transversals
danger/fork intersections
gain-cost-rest projection
Hall/capacity deficiency where its assumptions hold
Allis-fragment generators
event-trace confluence
```

Question:

> Does a small canonical `R/P/C/N` invariant separate the three closing siblings from broad-reexpansion control `46656555` despite their identical one-step arity signature?

Positive evidence for B1/B2 is a reusable semantic discriminator that does not reconstruct q identity. Negative evidence is equally valuable and should reduce those bridge posteriors.

No deeper raw frontier recursion is justified before such a discriminator exists.

---

## 8. Strict isolation contract

```text
EXACT CORE MAY EMIT:
  theorem proved
  theorem falsified
  counterexample
  exact census/result
  proof/certificate size
  bounded runtime/resource evidence

MASK MAY CONSUME:
  all of the above
  literature evidence
  competing explanations
  research cost

MASK MAY EMIT:
  next-test priority
  hypothesis/bridge credence
  expected information gain
  archive/deprioritize recommendation

MASK MAY NOT EMIT INTO EXACT CORE:
  probabilistic fact
  likely blocker
  likely owner
  likely W/D/L
  likely implication
  confidence-weighted certificate
```

The only route back into exact logic is a proved deterministic rule with explicit guards.
