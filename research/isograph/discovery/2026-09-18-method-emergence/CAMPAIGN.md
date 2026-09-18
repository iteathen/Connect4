# Connect4 IsoGraph Discovery Campaign — method emergence from existing topology

**Date:** 2026-09-18  
**Owner:** `research/semantic-quotient`  
**Base authority:** Connect4 IsoGraph logic authority 1.1  
**Post-authority input:** standard-7x6 q future-behavior congruence deductive candidate  
**Starting head:** `f072859e2c6f0c299593ef4894d0ded6e5e8710c`  
**Authority mutation:** none

## Objective

Test the hypothesis that the mathematical method currently recognized through IsoMax and CUDA-BSFP can be recovered primarily from **existing Connect4 IsoGraph topology**, rather than by adding solver ontologies to the graph.

The experiment deliberately removes solver names, implementation structures, and `consumed_by` labels first. It then asks what exact operational/proof structure remains.

## Input freeze

Primary semantic inputs:

- authority-1.1 canonical claims and relation graph;
- C4-R0003/R0004/R0009/R0021 terminal structure;
- C4-R0008/R0025/R0026 behavior-preserving quotient and residual automaton;
- C4-R0018 nested dependency closure;
- C4-R0043/R0046 predecessor/composition and exact frontier algebra;
- C4-R0047 exact existential/universal W/D/L set algebra;
- C4-R0064/R0065 strategy uniformity and quantifier dependency;
- C4-R0069 observation-relative controllable predecessor;
- C4-R0073/R0074 predecessor-closed support-local clause topology.

Newer derived input:

- `STANDARD_7X6_Q_CONGRUENCE.md`, which gives the post-authority candidate that ordinary standard-7x6 future behavior is determined by support plus normalized P0/P1 residual antichains.

Current solver specifications were used only as **external realization controls** after the topology was derived. They were not permitted to define the candidate method.

## Protocol routing

Primary Discovery Protocol families:

- DP-10 — role match under different labels;
- DP-11 — invariant across variants;
- DP-23 — explicit versus derived structure;
- DP-25 — refinement;
- DP-36 — redundant representation / layer substitution;
- DP-37 — equivalent closure structure.

NEI applicability: `GUARD_ONLY` for preserving the distinction between ordinary gameplay identity and stronger proof/certificate identity. Identity is not the main conclusion of this campaign.

## Experiment 1 — erase solver-consumer labels

The current authority has 74 canonical claims.

`consumed_by` multiplicity:

~~~text
consumed by 3 solver labels    35
consumed by 2 solver labels    27
consumed by 1 solver label     11
other multiplicity              1
~~~

Thus **62/74 claims are already shared across at least two historical/current solver labels**.

For the 18-claim operational/proof core selected for this campaign, 17 are consumed by at least two solver labels. The one exception is the explicit statement that the structural calculus still lacks complete composition/closure laws.

Removing every `consumed_by` relation does **not** disconnect the operational claim graph. Examples:

~~~text
C4-R0026 ->supports-> C4-R0008

C4-R0069 ->refines-> C4-R0011

C4-R0047 ->constrains-> C4-R0011 <-refines<- C4-R0069

C4-R0073 ->supports-> C4-R0043 <-supports<- C4-R0046

C4-R0021 ->supports-> C4-R0003
~~~

Disposition: solver names are consumer/provenance metadata at this layer, not load-bearing semantic topology.

## Experiment 2 — strip implementation vocabulary

Representative translations:

| implementation/solver phrase | remaining Connect4 relation after stripping implementation language |
|---|---|
| IsoMax immediate-win shortcut | legal action reaches independently qualified first-win terminal |
| IsoMax forced reply | exactly one admissible response remains before opponent immediate completion |
| IsoMax recursive residue | demand-driven evaluation of unresolved action successors |
| IsoMax transition cache | previously resolved value for same ordinary gameplay identity |
| BSFP terminal seed | independently qualified terminal subset/value |
| BSFP predecessor step | preimage / controllable predecessor of an exact consequence |
| BSFP existential/universal reduction | player-choice quantification over legal successors |
| BSFP antichain frontier | canonical representation of a closed family of states/clauses |
| BSFP rolling ranks | bounded evaluation schedule induced by one-cell rank dependence |
| CUDA frontier/buffer | machine materialization of a semantic family |

After stripping implementation vocabulary, every tested item except machine materialization maps to an already represented Connect4 relation or closure concept.

## Central layer correction

The apparent `forward solver` versus `backward solver` distinction mixes two arrow types.

### State-evolution orientation

~~~text
q_r --legal move--> q_(r+1)
~~~

### Exact value-dependency orientation

~~~text
V(q_r) depends on V(q_(r+1))

therefore exact value information flows:

V(q_(r+1)) --> V(q_r)
~~~

IsoMax follows state-evolution edges forward to discover unresolved children, then returns exact value information against the edge direction.

BSFP works directly in the value-dependency/predecessor orientation.

Therefore `forward` versus `backward` is primarily an **evaluation/control-flow distinction**, not two different game-value semantics.

## Emergent exact recurrence

Let `Q` be any exact ordinary future-behavior carrier for legal nonterminal Connect4 states.

For the bounded qualified controls, the residual automaton supplies such a carrier. For standard 7x6, the post-authority q-congruence proof supplies the current deductive candidate:

~~~text
q = support + normalized P0 residual antichain + normalized P1 residual antichain
~~~

Let:

~~~text
A(q)       legal columns
tau(q,a)   terminal token | q'
turn(q)    player to move, derived from support rank under ordinary play
rho(q)     occupied-cell rank
~~~

Every nonterminal move strictly increases `rho` by one.

For P0-oriented exact W/D/L value `V in {-1,0,+1}`:

~~~text
if turn(q) = P0:
    V(q) = max over a in A(q) of outcome(q,a)

if turn(q) = P1:
    V(q) = min over a in A(q) of outcome(q,a)

where outcome(q,a) is the terminal value if tau terminates,
otherwise V(q').
~~~

Because rank is finite and strictly increases along legal play, this recurrence has a unique value by backward induction on remaining cells.

C4-R0047 independently exposes the same existential/universal algebra in set-valued form. C4-R0065 exposes the same controller/opponent quantifier structure. C4-R0069 exposes the guarded structural version as a controllable predecessor law.

### Result

The ordinary exact W/D/L **method skeleton is already present in Connect4 topology**:

~~~text
exact behavior carrier
+ legal action relation
+ terminal boundary
+ alternating player quantification
+ finite rank
=
ranked exact value dependency / controllable predecessor recurrence
~~~

No solver primitive is required to state it.

## What remains solver/method choice

Once the recurrence is fixed, major differences move upward one layer:

### Demand-driven evaluation

Start at the requested root, materialize only demanded successor structure, apply exact local/guarded theorems when available, recurse only on unresolved dependencies, and memoize exact results.

This describes the current IsoMax execution shape without making IsoMax part of the game ontology.

### Supply-driven symbolic evaluation

Start from terminal/exact regions, apply predecessor/value transforms over symbolic families, normalize/compact them, and progress toward lower ranks/root.

This describes the current BSFP execution shape without making BSFP part of the game ontology.

These are evaluation/materialization policies over one value-dependency relation.

## Representation is another layer

Authority already distinguishes multiple exact or qualified representations:

- residual antichains;
- ownership antichains;
- line-hit product antichains;
- support-local monotone-clause dictionaries;
- exact quotient classes.

Claims C4-R0042, R0046, R0073 and R0074 show that antichains/coverage dictionaries can be exact representations of semantic families and predecessor transforms.

They are not, by themselves, separate solving semantics.

## Structural theorem closure is a shortcut layer

C4-R0018 and C4-R0069 do not define a different game.

They attempt to derive exact long-horizon consequences **without materializing every immediate state dependency**.

Thus guarded certificates/NDC are best interpreted as theorem edges that can shortcut the ordinary recurrence:

~~~text
ordinary dependency path:
    q -> child -> ... -> consequence

qualified structural theorem:
    q --guarded derivation--> same exact consequence
~~~

The shortcut calculus remains incomplete. C4-R0011 and R0069 explicitly preserve that gap.

## SUT consequence — candidate only

If IsoMax and BSFP are demand-driven and supply-driven evaluations of one Connect4 value-dependency topology, the natural SUT question changes from:

> how do two different solver semantics communicate?

to:

> how should two evaluation fronts over the same exact dependency relation share resolved state/proof facts?

Candidate interpretation:

~~~text
root-demanded dependency cone
        meets
terminal-supplied solved cone

on a shared ordinary gameplay carrier
+ profile-safe stronger proof context where needed
~~~

This is a **SUPPORTED CANDIDATE**, not current SUT architecture authority.

## Falsification

The central interpretation would need revision if any of the following survives exact review:

1. an exact W/D/L operation used by an active solver cannot be expressed as a relation/consequence of the existing Connect4 transition, terminal, quantifier, rank or proof topology;
2. two equal exact behavior states require different ordinary W/D/L recurrence semantics;
3. a sound structural certificate changes the underlying game-value relation rather than proving a consequence of it;
4. current BSFP or IsoMax exact result semantics differ from the same legal-game W/D/L objective.

No such breaker was found in the present bounded scope.

## Optimization leads exposed by the layer correction

1. **One transition relation, multiple views.** Generate forward action updates and backward predecessor maps from the same exact cofactor/transition authority where possible.
2. **Separate discovery from value propagation.** Do not pay for a state-expansion representation when only value dependency is required.
3. **Earliest safe collapse.** Collapse q-equivalent or closure-equivalent distinctions before downstream normalization/materialization, not after.
4. **Rank specialization.** Ordinary legal W/D/L propagation is acyclic by occupied-cell rank; reserve generic fixed-point machinery for genuinely cyclic/within-rank proof closure rather than for rank progression itself.
5. **Certificates as shortcut edges.** Compile qualified structural theorems into alternate proof dependencies over the same value target rather than parallel solver-specific rule systems.
6. **Shared proof/value publication.** SUT should eventually exchange facts by identity/profile and consequence strength, not by parent-solver private data structure.

These are implementation/research leads, not promoted architecture.

## Final disposition

~~~text
METHOD_EMERGENCE_FROM_EXISTING_TOPOLOGY
    = SUPPORTED_CANDIDATE

WRONG_LAYER_HYPOTHESIS
    = STRONGLY_SUPPORTED

COMMON_RANKED_WDL_RECURRENCE
    = STRUCTURE_ESTABLISHED for an exact behavior carrier
      with standard-7x6 q carrier still post-authority candidate

ISOMAX_VS_BSFP_SEMANTIC_DIFFERENCE
    = RECLASSIFIED primarily as evaluation/materialization policy

STRUCTURAL_SHORTCUT_CALCULUS_COMPLETE
    = NO

FROZEN_AUTHORITY_1_1_MUTATED
    = NO
~~~

See `OPERATIONAL_LAYER_METHOD_EMERGENCE.md` and `DISCOVERY_LEDGER.json`.
