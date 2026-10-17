# Owner correction: zero strategic branching, not branch reduction

**Date:** 2026-10-17 (America/Los_Angeles)
**Research owner:** `research/semantic-quotient`
**Direction:** Josh Oshiro
**Pre-commit live branch HEAD:** `b8230db619df79147fd1740dbb3ba531974fc322`
**Status:** GOVERNING RESEARCH OBJECTIVE / DEFINITION OF SUCCESS; not a new mathematical theorem, qualified gameplay authority, solver benchmark, or claim that the goal is achievable.

## 1. Exact correction

The intended algorithmic goal is **to eliminate BRANCHING**, not merely to eliminate SOME BRANCHES or reduce their number.

Do not reinterpret this as a runtime target, a branching-factor reduction, a more efficient minimax/negamax implementation, deeper BDD/QBF symbolic compilation, or a clever form of pruning.

A computation that branches into 7 strategic continuations and then reduces to 4 is STILL branching. A computation that leaves 2 unequivalent strategic futures and evaluates both is STILL branching. A procedure that computes a shared BDD/QBF/circuit by implicitly expanding multiple strategic alternatives is STILL branching for the purpose of this research. It does not matter if those alternatives are ultimately deduplicated, pruned, garbage collected, memoized, or evaluated quickly.

The ONLY exception permitted by the owner is **a set of moves proven equivalent for the intended value semantics, treated as ONE decision/outcome rather than multiple strategic evaluation directions**.

## 2. Required operator and single-lane evaluation invariant

For each legal, nonterminal source residual state `q=(h,R0,R1)`, the sought structural operator is

    Z(q) -> (V(q), M*(q)),

where `V(q)` is the unrestricted ordinary P0-relative W/D/L and

    M*(q) = { c in L(q) : Value(q after c) = V(q) }

with MAX on P0 turns, MIN on P1 turns. `M*(q)` must include **every** equally optimal legal move, not one arbitrarily chosen representative.

**ZERO STRATEGIC FANOUT contract.**

- From source q, the candidate may calculate source-local algebraic invariants, normalize or rewrite a *single* descriptor, examine finite literal column labels and source residual generators, and construct mathematical proofs or constraints.
- It MUST NOT fork into two or more inequivalent speculative game continuations and compute or build their separate future values/response obligations. This prohibition includes sequential exploration, memoized exploration, factorized product exploration, hidden support/strategy enumeration inside QBF/BDD/circuits, and separately calculating the full game for each legal action.
- For a zero-branch result, the algorithm's chain of game-semantic evaluation states is **ONE** deterministic lane. Ordinary program conditionals, finite generator scans, case splits in a written proof, and a final SET of labels do not count as game-semantic branching; creating separate future-game evaluation obligations DOES.
- A candidate cannot replace an unresolved choice with a recursion/search fallback and still claim zero branching. It must explicitly return INCOMPLETE until a structural law produces the exact result.
- If a set `C` of moves is output as one logical best outcome, a mathematically justified **value equality** for every member is required. To continue using ONE quotient successor for the whole set, a **future-behavior equivalence/transport** or another proof that the quotient preserves all later strategic questions is additionally required. Equal scalar WDL at q by itself does not make two distinct subsequent states interchangeable as future computation carriers.
- Every other legal action must be excluded by an exact source-derived value/order certificate or included in the equally optimal set. Weak dominance alone cannot exclude a possible tie.

The **desired discovery** is an exact rank-local/structural law for finding `V(q)` and `M*(q)` from q without resolving a game tree. Neither the existence nor the tractability of such a law is assumed proved.

## 3. Two different predicates that MUST NOT be conflated

**Equivalent move labels for current W/D/L:** `Value(q after c)=Value(q after d)`. This permits both c and d in the optimal output set when they equal V(q). It does NOT automatically permit one representative continuation to stand for both after a human actually chooses a move.

**Equivalent future games:** the successor games have a proven full-future behavioral isomorphism/bisimulation (including action transporter, legality, first-win/draw and future mover). Only this stronger condition licenses using ONE further strategic evaluation carrier for that whole class.

The original `q_o/q_r` identity/reflection result, nongeometric source column transports and neutral-token dynamic bisimulation provide some genuine examples of the stronger relation; they are not themselves a general zero-branch evaluator. They may be reused as lemmas in a **single-lane** algebra, not as a partial success criterion based on how many conventional minimax branches they prune.

## 4. Consequences for research status

The exact ordinary recursive residual/cofactor/Bellman algorithm remains **constructively complete**. It does not satisfy the owner's **stronger ZERO-BRANCH objective**.

Keep all preceding mathematically qualified and negative findings, but **reclassify their relationship to this objective**:

| Finding | Sound scoped result | Zero-branching success? |
|---|---|---|
| Source-q owner cofactors and full-depth recursive WDL | Exact game semantics and complete branching core | NO |
| Historic turn7/turn8 column completion and bounded defensive sets | Exact transition/bounded choice law | NO general zero-branch law |
| Source-owner BDD / guarded QBF / decision diagrams | Alternative representation and quantified evaluation | NO if multiple strategic alternatives are built/eliminated |
| One-pass labelled action-vector projection | Shares work across root actions | NO if its inner adaptive quantifiers branch |
| Dual universal-response antichain | Fewer **bounded** proof obligations, labels preserved | NO; fewer is not zero |
| Two-ply same-support diamond / full-future column transport | Exact pairwise full-future equivalence or weak WDL order | Supporting mathematical lemmas, NOT zero globally |
| Root SCC dominance quotient | Correctly **reduces** number of first-action scalar WDL requests | NO; evaluating remaining representatives is still branching |
| Inert-column neutral-token dynamic bisimulation | True full-future equivalence of a class of moves | Permissible ONE logical move class, but NO general exact action selector or value |
| Faster solver / fewer visited q / search time savings | Engineering metrics | Not the research target |

A comparison that reduces 7 action values to 4 (e.g. `44444` mirror groups), or an observed 7–11% reduction in value queries, must NOT be described as successfully *eliminating branching*. Rephrase as structural supporting evidence and retained negative controls only.

**Status:** The zero-strategic-branching Connect4 algorithm has NOT been discovered or proved. In particular, at `44444` the unrestricted WDL and complete optimal action set remain UNKNOWN in this research evaluator.

## 5. Mandatory next mathematical work (not a speed experiment)

Define and derive a **nonbranching optimality invariant or operator** that takes `q` and identifies the mover-optimal W/D/L and ALL tied move labels without spawning separate future-game descriptors. Required mathematical obligations:

1. **Selection:** Identify the exact maximizer/minimizer action class by source residual/obligation relations alone. A partial order that merely prunes inferior candidates while leaving 2 incomparable classes is NOT enough.
2. **Value:** Certify the exact unrestricted W/D/L of that class without evaluating multiple future choices. Never replace an unproved value with a short-horizon interval.
3. **Tie completeness:** Certify equality of every reported move to that optimum and strict inferiority (or another proof of non-equality to the optimum) for every excluded move. Return the complete optimal set even if it has more than one label.
4. **Closure:** If the method maintains an abstract next state and treats a set as one lane, prove the quotient commutes with all future guarded cofactors/turn alternations. Preserve `forall b exists a` distinct from `exists a forall b`.
5. **No concealed fanout:** Specify where the operator gets its answer and account for any strategy/response obligation generated in intermediate structures. Merely writing `max`, `min`, `forall`, `exists` or building a compact unevaluated formula is NOT a solution to this research goal.

A sufficient next formal research target is an **exact single-valued structural closure**, `I(q)` or an equivalently direct algebraic normal form, from which `(V,M*)` can be read without invoking separate `I(next(q,c))` for different inequivalent c. Prove it by source-local identities/induction **before** comparing it to an independent oracle or full-game reference.

The prior strict 60k-node/300k-nontrivial-Boolean-op/10k-support/15-second numbers remain **experiment safety/reproducibility envelopes when an experiment uses them**, not mathematical success criteria. The owner explicitly deprioritizes search solve time; do not optimize it or infer success/failure of the ZERO-BRANCH theorem from it. Never widen a protected experimental limit silently, but a mathematical theorem is not rejected merely because a prototype exceeds 15 seconds.

## 6. Falsification contract

Use independently qualified ordinary q/physical exact game behavior **ONLY AFTER** the new structural law is formulated. Mandatory controls include 4x3 Connect3 and 4x4 Connect4 all-action exact WDL/ties, legal `223` noncommutation, `111` and `1111222234334` bounded-equality/full-WDL counterexamples, original absolute moves 7 and 8, standard `44444` with P1 to move on absolute move6, first-win and full-column guards, empty and terminal boundaries.

A prototype may be mathematically **correct** yet **FAIL_ZERO_BRANCH** if it computes the answer through two or more inequivalent strategic futures. Correctness alone is not enough.

For every proposed operator, report separately:
- `exact_WDL_and_complete_optimal_set`: PASS / FAIL / UNKNOWN
- `zero_strategic_fanout`: PROVED / DISPROVED / UNKNOWN
- `future_equivalence_class_transport`: PROVED / NOT_NEEDED / UNKNOWN
- `solver_speed`: explicitly **NOT_A_RESEARCH_GATE**
- hidden action-history or strategy enumeration: any occurrence means `FAIL_ZERO_BRANCH`.

**Final owner criterion:** success is ZERO strategic branching. Partial pruning, branch-count reduction and runtime improvement are supporting mathematics, never a substitute.
