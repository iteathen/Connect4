# Bayesian research mask around the exact Connect4 logic

**Date:** 2026-09-13  
**Status:** active research meta-layer; deliberately outside proof semantics  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / Bayesian-mask framing:** **Josh Oshiro**  
**Formalization / synthesis / qualification:** OpenAI ChatGPT

## 1. Architectural rule

The Bayesian layer is a **mask around the research process**. The exact Connect4 logic is unaware that the mask exists.

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
      CPC + WSL + NDC + event causality
      + fixed-point / provenance semantics
```

There is **no inference edge** from a probability, confidence score, prior, posterior, expected utility, or ranking into an exact certificate.

The mask may decide:

- which candidate structure deserves attention;
- which falsifier has highest expected information gain;
- which experiment should run next;
- which literature analogy deserves formalization;
- when a research direction has become low-value.

The mask may **not** decide:

- ownership of an event;
- whether a blocker is certified;
- whether a requirement is eliminated;
- whether a state is W/D/L;
- whether two proof records are equivalent;
- whether a terminal line is reachable under perfect play.

Those remain exact logical statements.

## 2. Promotion membrane

A candidate crosses from the mask into the exact logic only through a proof boundary:

```text
hypothesis
  -> bounded falsification / derivation
  -> exact theorem with explicit guards
  -> accepted certificate rule
```

When it crosses, its Bayesian annotation is discarded.

The exact logic sees only:

```text
premises
rule
consequence
rank / horizon
resource / timing / provenance guards
```

not:

```text
P(rule is right) = 0.93
```

A 99.9% research belief that lacks an exact derivation is still **not a proof fact**.

Conversely, once a theorem is established, the exact logic does not need a probability of correctness as part of its semantics.

## 3. What the mask tracks

For each candidate hypothesis `H`, track separate quantities:

```text
P_valid(H | E)
  subjective credence that the scoped structural claim is valid/applicable

P_useful(H | valid, E)
  subjective credence that it materially reduces the missing 7x6 proof burden

cost(H)
  bounded experimental/theorem-development cost

info_gain(H)
  expected ability of the next test to separate competing explanations
```

These are **research-management quantities**, not solver quantities.

The numbers are engineering Bayesian credences, not claimed outputs of an independent calibrated statistical model. Evidence sources are correlated; they must not be multiplied as if independent.

## 4. Evidence classes

Use explicit evidence provenance:

```text
T = exact theorem / structural equivalence
I = exact internal Connect4 qualification
L = close external literature result
A = analogy / representational fit
F = falsifier / negative control
```

Update conservatively:

1. `T + I` can justify near-certain belief in the narrowly stated mapping.
2. `L` raises belief only where game convention and guards genuinely transfer.
3. `A` can raise test priority but cannot enter proof semantics.
4. `F` lowers only the tested claim, not unrelated parent mathematics.
5. Results from the same experiment/paper family are correlated evidence.
6. Transfer from Maker-Breaker, Gomoku, infinite Connect Four, linear logic, event structures, antimatroids, or generic concurrency must preserve strong-game terminal semantics, gravity, alternating ownership, CPC, resources, deadlines, NDC guards, and output provenance where applicable.

## 5. Current integrated structural landscape

The broad program now looks like one composite exact object surrounded by several candidate compression languages:

```text
legal gravity substrate
  = order ideals of seven disjoint column chains

future winning requirements
  = WSL residual hypergraph / minimal requirement antichains

future ownership / timing
  = CPC parity + event precedence + deadlines

nested consequences
  = NDC monotone dependency closure

strategic choice
  = alternating existential/universal fixed-point proof

response feasibility
  = typed resource compatibility / matching / capacity

observable terminal identity
  = provenance-annotated residual/output relation
```

Candidate imported structures attach only where they add expressive or compressive power.

## 6. Initial Bayesian mask

The following values are intentionally approximate and revisable. They rank research, not proof truth.

| Candidate | Scoped claim | P_valid | P_useful | Current evidence / interpretation |
|---|---|---:|---:|---|
| Gravity poset / order ideals | legal support is a finite product/union-of-chains ideal system | 0.999 | 0.92 | exact from gravity; directly aligned with poset positional-game literature |
| Parity-colored event confluence | independent legal same-player column events can commute across an opponent middle event under the proved guards | 0.999 | 0.87 | exact local theorem + 12 observed q convergence points |
| WSL as monotone DNF antichain | residual line requirements normalize by monotone absorption at common support | 0.999 | 0.90 | accepted structural semantics |
| E/A as AND/OR fixed point | strategic positive proof is alternating existential/universal composition | 0.999 | 0.97 | exact winning-region semantics |
| q as residual automaton | q is an exact ordinary-transition residual state; q+Pi0 refines output observation | 0.995 | 0.90 | exact small-game controls and accepted C4-0010 boundary |
| Hypergraph blocker duality | minimal defensive hitting families are the blocker dual of residual threats | 0.99 | 0.86 | exact generic hypergraph theorem; strategic realizability still needs CPC/NDC guards |
| Poset-constrained blocker/ideal dualization | gravity-compatible minimal defenses can be generated in the poset/ideal domain | 0.93 | 0.88 | strong mathematical fit; Connect4 strategic timing still unproved |
| Danger / fork intersection calculus | urgent residual threats can be compressed by common-response intersection and empty-intersection fork witnesses | 0.82 | 0.92 | strong Maker-Breaker analogy; must be lifted to strong-game/CPC semantics |
| Gain-cost-rest threat typing | strategic fragments benefit from explicit gain, forced cost, rest/prerequisite, and effect fields | 0.90 | 0.87 | close Allis/Gomoku precedent and strong fit to NDC/resource contracts |
| Allis fragment compatibility algebra | local response rules compose through explicit compatibility/conflict relations rather than independently | 0.97 | 0.91 | established Connect Four prior art; needs generic re-expression rather than named-rule dependence |
| Disjunctive event causality | one consequence may admit several alternative minimal enabling sets and should not be expanded as separate physical histories | 0.88 | 0.89 | event-structure theory matches alternative convergence seam |
| Linear / pomset logic as proof language | resource-sensitive partial-order connectives can normalize causal certificates and erase irrelevant proof-order permutations | 0.76 | 0.78 | strong representational fit; not yet shown to simplify this finite proof materially |
| Focusing / proof-net normalization | many independent proof permutations can be represented once | 0.86 | 0.83 | known logic property; transfer to current certificate vocabulary still to prove |
| Antimatroid / rooted-circuit layer | legal/gravity prerequisites and some minimal causal obstructions admit rooted-circuit/implicational representation | 0.94 | 0.61 | exact for accessibility substrate; uncertain incremental value beyond simple column chains |
| Hyperedge-incidence dominance | implication between future obligation incidence sets may give sound move/certificate dominance | 0.66 | 0.81 | promising literature lemma; strong-game and timing transfer unresolved |
| Infinite-paving boundary-defect theory | finite 7x6 P0 advantage can be explained as defects in otherwise draw-preserving response systems | 0.72 | 0.88 | Yamaguchi/Allis alignment + internal response findings; not yet a theorem |
| Vertical follow-up alone | same-column pairing is a complete global response calculus | 0.02 | 0.01 | falsified by internal chain controls |
| Exact-q proof-term subset absorption as main compressor | child-ID subset antichains materially compress the current 4665655 seam | 0.02 | 0.01 | bounded control: 28 terms -> 28 minimal, zero absorption |
| Deeper raw exact-q recursion | more recursive depth alone exposes the missing theorem economically | 0.05 | 0.02 | 100001-state cap hit with no new proof class; retained negative control |

The table is a mask state, not specification authority.

## 7. Belief graph rather than flat candidate list

The strongest current synthesis is hierarchical:

```text
A. exact substrate
   gravity poset
      -> legal future events
      -> parity-colored linearizations
      -> local confluence

B. exact objective structure
   WSL residual hypergraph
      -> blocker/minimal-defense dual
      -> CPC/NDC-qualified realizability

C. urgent strategic structure
   candidate move
      -> activated dangers / threat fragments
      -> gain-cost-rest typed obligations
      -> compatibility / conflict / common-response intersection
      -> fork or closed response family

D. causal proof representation
   typed obligations
      -> disjunctive enabling sets
      -> partial-order event certificate
      -> AND/OR fixed-point consequence
      -> provenance annotation

E. possible normalization language
   resource-sensitive / pomset logic
      -> focusing / proof-net normalization
      -> quotient irrelevant derivation/interleaving permutations
```

The exact logic need not adopt the vocabulary of layer E. The mask may test whether that language discovers a smaller theorem; if not, discard it without changing CPC/WSL/NDC.

## 8. Current highest-value compound hypothesis

The most promising combined hypothesis is:

> The unresolved 7x6 positive proof can be represented as a finite antichain of typed danger/response certificates over a parity-colored event poset, where each certificate carries gain/cost/rest or equivalent resource fields, disjunctive causal alternatives, compatibility/deadline guards, and a well-founded progress consequence. Physical histories that differ only by proved-independent interleavings collapse before enumeration.

Mask credence:

```text
P_valid_as_representation  ~= 0.84
P_materially_compressive   ~= 0.78
```

This is **not** a solver premise and not a theorem.

Its main competitors are:

```text
H1: typed danger/event certificates provide strong compression
H2: they are sound but still expand nearly one-for-one with exact q states
H3: another missing invariant, especially temporal/resource coupling, dominates and the imported structures add little
```

The next experiment should discriminate H1/H2/H3 rather than merely produce more examples.

## 9. Next-test policy

Use expected information gain under the hard five-minute rule.

Highest-value current test:

```text
fixed controls:
  46656551
  46656552
  46656555
  46656557

construct without recursive descent:
  minimal urgent danger fragments
  -> response/blocker sets
  -> gain/cost/rest or equivalent typed fields
  -> compatibility graph
  -> common-response intersections / forks
  -> causal precedence and CPC/deadline guards
```

Question:

> Does a small typed danger/compatibility invariant separate the three closing siblings from broad-reexpansion control `46656555`, despite their identical one-step hard-arity signature?

Positive evidence for H1 would be a finite semantic invariant that separates them without introducing one descriptor per exact q state.

Negative evidence would be equally valuable: if all four typed systems remain isomorphic until exact-q identity reappears, lower the utility posterior sharply and move to the next hypothesis.

No deeper raw frontier recursion is justified before such a structural discriminator exists.

## 10. Strict logic/mask isolation contract

The implementation discipline is:

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
  test priority
  hypothesis credence
  expected information gain
  archive/deprioritize recommendation

MASK MAY NOT EMIT INTO EXACT CORE:
  probabilistic fact
  guessed blocker
  likely owner
  likely W/D/L
  likely implication
  confidence-weighted certificate
```

The only route back into exact logic is a newly proved deterministic rule with explicit guards.

This isolation is intentional. The Bayesian mask accelerates discovery while leaving proof semantics purely exact.
