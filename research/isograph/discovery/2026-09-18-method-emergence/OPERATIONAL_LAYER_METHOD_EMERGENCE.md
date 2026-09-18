# Operational-layer method emergence from the Connect4 IsoGraph

**Status:** derived discovery synthesis; no semantic authority change  
**Base:** Connect4 IsoGraph authority 1.1 + newer q-congruence candidate  
**Purpose:** state precisely what emerged when solver labels and implementation vocabulary were removed

## 1. The layer stack that resolves the apparent solver multiplicity

~~~text
L0  physical/event game
    cells, support, alternating placement, first-win stopping

L1  structural state
    residual requirements, blockers, support/accessibility, geometric relations

L2  ordinary behavioral semantics
    exact behavior carrier Q, legal actions, terminal token, successor relation

L3  value / proof dependency
    existential and universal choice, controllable predecessor, guarded consequence

L4  evaluation policy
    demand-driven, supply-driven, bidirectional/meeting, theorem-shortcut order

L5  representation
    antichains, clause dictionaries, IDs, tables, frontiers, proof DAGs

L6  machine realization
    JS arrays/maps, TT layout, CUDA buffers/kernels, workers, scheduling
~~~

The earlier tendency to speak of `IsoMax topology` and `BSFP topology` mostly mixed L3-L6.

The discovery result is that the load-bearing game-value structure already exists at L2-L3.

## 2. Exact ordinary game relation

Let `Q` be an exact future-behavior state carrier.

An ordinary legal Connect4 position induces:

~~~text
turn : Q -> {P0,P1}

A : Q -> finite set of legal columns

tau : Q x action ->
      terminal(P0_WIN | P1_WIN | DRAW)
      | Q

rho : Q -> occupied-cell rank
~~~

with:

~~~text
nonterminal tau(q,a)=q'
    => rho(q') = rho(q)+1
~~~

Authority-1.1 inputs:

- C4-R0008 — behavior-preserving quotient requirement;
- C4-R0025 — support is required with residual antichains in tested exact quotient;
- C4-R0026 — direct residual automaton replay exact on bounded controls;
- C4-R0021 — independently qualified terminal boundary.

Post-authority candidate:

- standard-7x6 q congruence establishes `Q=q` for ordinary future behavior if independently qualified.

## 3. Value dependency is the reverse of state evolution

State evolution:

~~~text
q_r --a--> q_(r+1)
~~~

Value dependency:

~~~text
V(q_r) <- V(q_(r+1))
~~~

This simple reversal explains much of the perceived solver difference.

### Demand-driven execution

A root-first recursive evaluator:

1. receives `q_r`;
2. derives a child `q_(r+1)` only when needed;
3. obtains/derives `V(q_(r+1))`;
4. folds the result back into `V(q_r)`.

It **discovers state evolution forward** while **propagating value backward**.

### Supply-driven execution

A terminal-first symbolic evaluator:

1. starts with known value families at higher rank;
2. computes predecessors/lower-rank value families;
3. publishes exact lower-rank consequences;
4. repeats toward the root.

It follows the value-dependency orientation directly.

Thus the two executions differ mainly in *when and how dependencies are materialized*.

## 4. The alternating value fold

For P0-oriented W/D/L order:

~~~text
-1 < 0 < +1
~~~

define `Outcome(q,a)` as terminal value when the action ends the game, otherwise the value of its successor.

Then:

~~~text
turn(q)=P0:
    V(q)=max_a Outcome(q,a)

turn(q)=P1:
    V(q)=min_a Outcome(q,a)
~~~

Equivalent predicate form for a favorable set `X`:

~~~text
CPre_P0(X) contains:

    P0-turn q
        when there exists a legal action into X / favorable terminal

    P1-turn q
        when every legal action remains in X / favorable terminal
~~~

with the dual definition for P1.

Existing topology supporting this formulation:

- C4-R0047 — exact set-valued union/universal W/D/L algebra;
- C4-R0065 — explicit universal opponent / existential controller dependencies;
- C4-R0069 — observation-relative controllable predecessor;
- C4-R0018 — nested dependency closure.

## 5. Why global fixed point is not the primitive ordinary-game requirement

Every legal move raises occupied-cell rank by one.

Therefore the ordinary action graph is acyclic.

Exact W/D/L can be defined by one backward induction over this rank ordering.

A fixed-point implementation is still valid and can be useful for symbolic regions or additional monotone proof closure, but the **game-value dependency itself is rank-well-founded**.

This suggests an implementation distinction:

~~~text
rank progression
    use direct well-founded dependency whenever possible

within-rank / theorem / symbolic closure
    use fixed-point machinery only where an actual closure iteration remains
~~~

C4-R0040 already supplies an implementation-specific instance of this structure: root-only WDL needs only completed rank `r+1` to produce rank `r` in the qualified one-move recurrence.

## 6. Structural theorem edges

Ordinary transition evaluation is complete but can be expensive.

Structural consequences can bypass portions of the immediate dependency graph when a theorem proves the same result.

Example shape:

~~~text
q
|
| many ordinary successor dependencies
v
exact consequence

can sometimes be replaced by:

q --qualified guarded theorem--> exact consequence
~~~

C4-R0069 gives the current strongest form:

~~~text
exact post-cofactor consequence
+ observation-uniform controller policy
+ universal admissible opponent intervention
+ support/resource/precedence/deadline/first-win guards
-> CertifiedObligation
~~~

This is a *shortcut proof edge* over Connect4 semantics, not a new solver ontology.

## 7. Representation layer

Examples:

~~~text
closed semantic family
    -> antichain generators

monotone clause family
    -> support-local coverage signature

behavior state
    -> interned ID / packed record
~~~

C4-R0042, R0046, R0073 and R0074 show exact instances.

Optimization should ask whether a representation preserves and cheaply realizes the relation, not whether the representation itself is the method.

## 8. Current solver realizations after layer correction

### IsoMax

~~~text
ordinary recurrence
+ demand-driven dependency discovery
+ exact q-shaped memoization
+ qualified theorem shortcuts
+ recursive fallback for unresolved dependencies
~~~

### CUDA-BSFP

~~~text
ordinary recurrence
+ supply-driven predecessor/value-family propagation
+ symbolic family representation
+ rankwise progression
+ optional theorem/inference shortcuts
~~~

These mappings are implementation observations, not additions to Connect4 semantic authority.

## 9. Candidate SUT interpretation

A natural combined execution is not necessarily `two semantics talking`.

It may be:

~~~text
one value-dependency relation

root demand front  ---> unresolved dependencies

terminal supply front <--- resolved families

share exact q/value/proof facts where identity profile permits
~~~

Potential meeting objects:

- exact q value;
- exact action value;
- certified W/L/D region membership;
- stronger proof/certificate fact with explicit non-q guard context.

Do not use a q-level SAME result to transfer stronger proof context.

## 10. New optimization questions

1. Can forward `tau(q,a)` and backward predecessor maps be generated from one compiled cofactor authority?
2. Which BSFP candidate distinctions disappear immediately under q or antichain normalization and can therefore be prevented from materializing?
3. Which IsoMax recursive dependencies are already implied by available structural facts and can be replaced by shortcut theorem edges?
4. Can rank progression be separated from true fixed-point closure to remove unnecessary generality?
5. Can exact value publication be shared across SUT without sharing solver-private state?
6. Is there a smaller exact behavioral quotient after q that remains forward-updatable?

## 11. Scope boundary

This synthesis does not establish:

- standard-7x6 q as promoted authority;
- complete searchless structural closure;
- that current BSFP representation is q-native;
- that demand-driven or supply-driven evaluation is universally faster;
- a final SUT architecture.

It establishes a more basic point:

> The ordinary exact solving recurrence can be stated from Connect4 operational/proof topology without introducing IsoMax or BSFP as semantic primitives.
