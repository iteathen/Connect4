# Strategy dependency, uniformity and the complexity boundary of history realizability

**Research direction / structural architecture:** Josh Oshiro  
**Formalization / qualification:** OpenAI ChatGPT  
**Date:** 2026-09-16

## Classification

This packet records exact semantic reductions, one Connect-4 theorem witness, one finite counterexample and literature-aligned complexity boundaries. No solved W/D/L label, optimal-play database result or recursive game search is a premise.

Affected claims: `C4-R0064` through `C4-R0067`.

It continues the earlier exact split:

```text
ownership-image feasibility          C4-R0060
lossless static recombination        C4-R0063
legal alternating history            C4-R0062
strategy under projected information C4-R0064/C4-R0065
resource/deadline/NDC closure        still separate
```

---

## 1. A projection induces an information structure

Let `H_p` be finite legal histories ending at a turn of player `p`, and let

```text
alpha : H_p -> O
```

be a proposed structural history projection/observation.

A strategy `sigma` **factors through alpha** when there exists a function

```text
bar_sigma : O -> Action
```

such that

```text
sigma(h)=bar_sigma(alpha(h))
```

for every history relevant to the strategy.

Equivalently,

```text
alpha(h)=alpha(h') => sigma(h)=sigma(h')
```

on histories consistent with the strategy. This is exactly the standard observation-based/uniform-strategy condition for the equivalence relation induced by `alpha`.

### Proof

If `sigma=bar_sigma o alpha`, equal observations have equal actions immediately. Conversely, if `sigma` is constant on every `alpha`-fiber encountered by the strategy, define `bar_sigma(o)` to be that common action for each encountered observation `o`; values outside the strategy outcome are irrelevant to the objective and may be completed arbitrarily where legal. QED.

For symmetry quotients, equality of raw action labels is replaced by the proved action transport under the symmetry. The theorem here deliberately keeps action labels fixed.

### Consequence

A state/history projection can be:

```text
statically lossless for its recorded facts
and every projected record individually realizable
```

while still being too coarse for a strategic objective, because the correct action may depend on a distinction discarded by the projection.

---

## 2. Exact Connect-4 dependency witness from response serialization

The retained center response-serialization theorem gives a clean strategy-dependency witness without a solved oracle.

After the exact legal prefix

```text
D1 E1 A1 A2
```

P0 can play either

```text
B1
```

or

```text
C1.
```

The theorem establishes:

```text
branch B1: P1 must occupy C1 before P0's next turn;
branch C1: P1 must occupy B1 before P0's next turn.
```

These are distinct mandatory actions. Any history abstraction that merges the two branches while erasing the trigger/bottom-cell identity has no uniform P1 safety response: choosing `B1` fails/is unavailable in the B1 branch and choosing `C1` fails/is unavailable in the C1 branch; any other move leaves the corresponding bottom singleton unblocked.

This is an exact example of a **lost strategy dependency**. The missing information is not another ownership scalar. It is the fact that the defender response is permitted to depend on which attacker event occurred.

Primary repository source:

```text
research/provenance/source-archive/derivative-classification/docs-research/
2026-09-13-center-response-serialization-correction.md
```

(or its live frontier-branch source document).

---

## 3. Bounded strategy dependence as Skolem dependence

Unroll a finite two-player horizon. Encode relevant opponent choices by universally quantified variables and controller choices by existential variables. Put legal move, support, terminal, first-win and requested proof conditions in the Boolean matrix.

In ordinary QBF, an existential variable may depend on the preceding universal variables. Dependency QBF (DQBF) states each existential dependency set explicitly. Semantically, a true DQBF is witnessed by Skolem functions with exactly the permitted universal inputs.

Therefore a proposed structural observation has a direct interpretation:

```text
retained opponent distinction
    -> may appear in a response Skolem dependency set

discarded opponent distinction
    -> response must be independent of it.
```

For the serialization witness let one universal bit `u` denote which bottom trigger P0 selected and one existential response `e` denote P1's terminal block. The required contingent response is a nonconstant function of `u`. With

```text
D(e)={u}
```

a Skolem response exists. With

```text
D(e)=empty
```

no one action satisfies both branches.

This is the quantified analogue of C4-R0064's uniform-strategy criterion.

### Literature alignment

- Balabanov, Jiang, Janota, Widl, *Henkin Quantifiers and Boolean Formulae: A Certification Perspective of DQBF*, Theoretical Computer Science 523 (2014), DOI `10.1016/j.tcs.2013.12.020`: DQBF semantics and certification are formulated through Skolem-function models with explicit dependencies.
- Ge-Ernst, Scholl, Sic, Wimmer, *Solving Dependency Quantified Boolean Formulas Using Quantifier Localization*, Theoretical Computer Science 925 (2022), DOI `10.1016/j.tcs.2022.03.029`: explicit dependency sets and localization remain first-class semantic structure.
- Maubert and Pinchinat, *Uniform Strategies, Rational Relations and Jumping Automata*, Information and Computation 242 (2015), DOI `10.1016/j.ic.2015.03.012`: standard observation-based strategies are an instance of uniform strategies over observationally equivalent histories.

The imported result is terminology/semantics, not a claim that a generic DQBF solver is the desired Connect-4 proof engine.

---

## 4. Full strategic quotient ceiling: alternating/game bisimulation

A much stronger, standard sufficient relation for quotienting games is game/alternating bisimulation: corresponding positions preserve observations and can match each side's strategic transitions. Alternating-bisimilar game structures preserve strategic temporal properties in the relevant ATL-style settings.

This is useful as a **ceiling**, not the current minimum target. Connect-4 W/D/L equivalence or one claim-relative theorem may be coarser than full alternating bisimulation. The project should therefore seek the weakest objective-relative uniformity/congruence that suffices, while using bisimulation as a strong control when exact transition commutation is claimed.

Literature alignment:

- Alur, Henzinger, Kupferman, *Alternating-Time Temporal Logic*, JACM 49(5), 2002, DOI `10.1145/585265.585270`.
- Belardinelli et al., *Bisimulations for Verifying Strategic Abilities...*, Information and Computation 276 (2021), DOI `10.1016/j.ic.2020.104552`, proves preservation of ATL* strategic abilities for its alternating-bisimulation setting.

No claim is made that the current Connect-4 quotient already satisfies such a bisimulation.

---

## 5. Exact complexity boundary for the history layer

C4-R0062 fixed the pre-terminal history question as follows. Given bottom-to-top column owner words

```text
w_1,...,w_W
```

and even total occupied rank `2m`, decide whether

```text
(01)^m in shuffle(w_1,...,w_W).
```

This is exactly the constrained-shuffle problem

```text
CSh[(ab)*]
```

under the relabeling `0=a`, `1=b`: the input precedence graph is a disjoint union of strings/chains, and the target topological ordering must belong to the fixed regular language `(ab)*`.

Amarilli and Paperman, *Topological Sorting under Regular Constraints* (arXiv:1707.04310), Theorem 3.9, prove

```text
CSh[(ab)*] is NP-hard.
```

Therefore generalized variable-width pre-terminal alternating history realizability is NP-hard before Connect-K line geometry, resource competition or first-win stopping is added.

### What follows

This is a strong falsifier of an **all-width** complete criterion based only on a constant collection of simple scalar counts, unless those scalars somehow encode an NP-hard relation.

### What does not follow

It does not rule out:

```text
fixed-width transfer algorithms;
width-7 finite-state/separator structure;
polynomial algorithms parameterized by fixed W;
restricted ownership languages generated by a strategic certificate;
sufficient no-loss/win subfamilies;
claim-relative proof compression.
```

The project should exploit precisely those restrictions instead of assuming the unrestricted shuffle relation is simple.

---

## 6. Falsifying interval-only matching for history reconstruction

A tempting repair to global owner counts is to attach each event an earliest/latest compatible turn interval and then solve a unit-capacity matching problem. This is still insufficient because independent windows forget within-chain correlation.

Take two column words

```text
w0=01
w1=0011
```

with target

```text
010101.
```

### No shuffle exists

- If rank 1 consumes `w1`'s first `0`, both next available events are `0`, so rank 2 cannot be owner `1`.
- If rank 1 consumes `w0`'s first `0`, rank 2 must consume `w0`'s `1`; rank 3 then consumes `w1`'s first `0`, but `w1`'s next event is another `0`, so rank 4 cannot be owner `1`.

Hence the colored support is not history-realizable.

### Yet the event-window matching is feasible

Individual parity-compatible earliest/latest positions permit the assignment

```text
w1[0] -> 1
w1[1] -> 3
w1[2] -> 4
w1[3] -> 6
w0[1] -> 2
w0[0] -> 5.
```

Every event receives a distinct slot of the correct owner parity inside its individual window, but `w0[0] -> 5` and `w0[1] -> 2` reverse the required column order.

So Hall/matching over individual time windows loses a precedence correlation. This does not weaken the existing guarded response-capacity theorem, because that theorem assumes the legal slot sets and independent unit-job semantics have already been established. It only prevents reusing Hall capacity as a complete history-realizability calculus.

---

## 7. Updated composition seam

The current smallest established relational stack is:

```text
line-hit projection image
  -> pinned NAE CSP / lossless join

fixed colored support
  -> constrained shuffle / alternating linear extension

history abstraction
  -> observation equivalence
  -> uniform strategy existence

bounded controller/opponent alternatives
  -> explicit Skolem dependency synthesis (DQBF/QCSP form)

resource/deadline proof
  -> typed contracts + Hall/cut facts + guarded NDC closure

full objective-preserving quotient
  -> may use game/alternating bisimulation as a strong sufficient criterion
```

The critical new separation is:

```text
joint tuple realizability
!=
strategy dependency realizability.
```

The first asks whether one global assignment realizes all projected facts. The second asks whether a controller has one function from the information it is allowed to observe to actions/certificates that works against every admissible opponent continuation.

---

## 8. Consequence for the strong-play 28 problem

Nothing here derives the distance-sensitive strong-play `28`.

It does narrow the missing theorem. A proposed selector based on the empty-board 28-dimensional core, phase/deadline coordinates or another compact invariant must establish more than static reconstruction. It must show that the relevant perfect-play strategy is **uniform over every history merged by the proposed selector**, with the necessary opponent dependencies, resource contracts and first-win order retained.

Thus equal dimension remains irrelevant; the missing bridge is a strategy-factorization theorem.

---

## 9. Next bounded proof targets

1. Recast the guarded mixed-cofactor obligation-birth rule as one dependency-aware quantified certificate:

```text
exists controller certificate/response as a function of retained observation
for all admissible opponent interventions
  -> certified obligation before deadline.
```

2. On the exact response-serialization witness, compile the smallest observation/dependency set and verify that deleting any trigger identity needed by the response destroys uniform safety.
3. For the A/B mixed-cofactor collision, determine whether the first unresolved difference is a new dependency edge, a shared-resource constraint, or a deadline fact once full residual incidence is retained.
4. For standard fixed width 7, seek a bounded transfer/separator representation of C4-R0062 rather than an all-width scalar formula; actively use the NP-hardness result as the falsification boundary.
5. Keep alternating/game bisimulation as a strong control when a representation claims full transition/strategy equivalence; do not require it for narrower claim-relative proofs without need.
