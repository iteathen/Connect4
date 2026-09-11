# Nested strategic dependency closure — candidate path to first-move solution

**Date:** 2026-09-09  
**Status:** theoretical research; maintained source and `main` unchanged.  
**Branch:** `research/low-confidence-survival-2026-09-09`

## Hypothesis

The likely missing step between a local universal strategic algebra and a first-move solution is **nested semantic dependency closure**.

A flat parity table, flat blocker set, or flat collection of Allis rules can prove many mid/late positions but is weak from the empty board because most decisive strategic facts are not primitive yet. They depend on lower-level future facts which themselves depend on still-lower future events.

The empty-board proof therefore needs to let certificates depend on certificates and then collapse those dependencies recursively.

This is a semantic dependency structure, not the previously rejected TT/cache dependency-routing architecture. No per-node cache routing is implied.

## 1. Well-foundedness

Connect Four has an intrinsic rank:

```text
rank(state) = occupied cell count
```

and every legal move raises rank by one.

At the event level, gravity gives each column a strict chain:

```text
(c,0) < (c,1) < ... < (c,H-1)
```

A future ownership/resource fact about a higher event can depend only on conditions involving events no later than the relevant strategic horizon. Once dependencies are oriented by event rank / completion rank, the strategic dependency graph is well-founded.

This means nested certificates can be evaluated bottom-up or as a monotone fixed point rather than by unrestricted cyclic theorem search.

## 2. Primitive facts

The leaf layer contains cheap exact facts already identified:

- current playable events;
- immediate wins / double threats;
- column precedence;
- event-rank parity;
- fixed ownership facts;
- response-pair / XOR ownership constraints;
- residual winning requirements;
- exhausted requirement sets;
- direct blocker relations.

These are the base cases.

## 3. Derived certificate node

A strategic certificate node should be represented generically as:

```text
certificate C:
  prerequisites: {C1, C2, ..., event/order predicates}
  response/resource constraint: R
  consequence:
    - ownership constraint, or
    - blocker ID(s), or
    - terminal proposition
  horizon/rank: k
```

The important point is that `prerequisites` may contain earlier **certificates**, not only physical-board predicates.

Therefore:

```text
primitive facts
  -> local response guarantees
  -> blocker guarantees
  -> requirement impossibility
  -> new event/ownership consequences
  -> larger blockers / race guarantees
  -> terminal proposition
```

can recurse to arbitrary strategic depth while remaining finite.

## 4. U1/U2 become one nested closure system

The previously proposed split:

- U1 parity/response algebra;
- U2 blocker-lattice closure;

may be implementation views of one monotone inference system.

### U1 transition

From parity/order/resource facts derive a response or ownership guarantee:

```text
facts -> guaranteed blocker b
```

### U2 transition

From blocker `b` derive solved residual requirements using the existing 625-ID upward closure:

```text
b -> Up[b]
```

### Feedback

When requirements disappear or become strategically irrelevant, the strategic event frontier changes. That can simplify parity/resource dependencies and enable higher certificates:

```text
new blocker
 -> requirements eliminated
 -> event dependency set shrinks
 -> new parity/response guarantee
 -> new blocker
```

So the universal mechanism is naturally a **fixed-point closure** over a finite lattice of:

- active residual requirements;
- certified blockers;
- event ownership/response constraints;
- strategic terminal propositions.

## 5. Why nesting matters at the first move

Near the endgame, many strategic dependencies are already physically resolved, so a flat detector can fire directly.

From the empty board:

- almost every winning requirement is live;
- most future target ownership facts are conditional;
- no single blocker covers much;
- the useful proof is composed of statements such as:

```text
if event family A resolves this way,
  then response relation B becomes forced;
  which guarantees blocker C;
  which destroys requirement family D;
  which changes the relevant event reservoir;
  which fixes the parity of event E;
  which creates blocker F;
  ...
```

The proof therefore appears combinatorial if represented as a move tree, but may be compact if represented as a nested dependency DAG.

The key compression opportunity is to share a derived certificate once wherever multiple future branches depend on it, rather than rediscovering it through move enumeration.

## 6. Algebraic form

Let the closure state be:

```text
X = (R0, R1, B0, B1, P)
```

where:

- `R0/R1` are active minimal residual requirement bitsets;
- `B0/B1` are certified blocker bitsets/sets;
- `P` is the compact parity/response/event-order relation state.

Define a monotone inference operator:

```text
F(X) = X union all exact consequences derivable from X
```

with consequences including:

- new blockers from response/parity facts;
- newly solved requirements from blocker upward closure;
- new response facts from reduced event obligations;
- one-sided no-win when one requirement set is eliminated;
- exact draw when both are eliminated;
- stronger terminal propositions from race/ownership closure.

The strategic solution is the least fixed point:

```text
X* = lfp(F)
```

If `X*` contains a terminal proposition for the current proof goal, search is unnecessary. If not, search expands only unresolved decision choices and recomputes/increments the closure.

## 7. Conditional dependencies rather than premature branching

The dangerous implementation is to convert every unresolved strategic condition into ordinary move-tree branching.

Instead represent unresolved dependencies symbolically where possible:

```text
A -> B
A xor C -> D
{B,D} -> blocker e
```

and propagate consequences only when premises become fixed.

For parity relations, many conditional dependencies can remain compact as GF(2) equations. For blocker/requirement relations, RID bitsets provide finite monotone closure.

Only genuinely incompatible response-policy alternatives should force a branch in the strategic proof system.

This is the key candidate route to avoiding Allis-style combinatorial rule selection.

## 8. Relation to Allis rules

Named Allis rules can be interpreted as **pre-proved local lemmas** in the nested closure:

- Claimeven/Baseinverse/Vertical are low-depth lemmas;
- Lowinverse/Highinverse/Baseclaim are compositions of response lemmas;
- Aftereven/Before/Specialbefore are deeper race/deadline lemmas;
- compatible rule cover is a terminal query over accumulated blockers.

A universal nested system should derive the same consequences without needing rule names in the runtime representation.

The names remain useful as regression witnesses: if the generic closure cannot reproduce an Allis lemma, the missing invariant is identifiable.

## 9. Connection to the owner's original parity engine

The original future-target parity count is a depth-0/1 instance of the same closure:

```text
current event reservoir
 -> parity of target rank
 -> projected owner
```

The generalization is not a different principle. It is:

```text
nested conditional reservoirs
 -> nested parity/response dependencies
 -> fixed-point ownership/blocker closure
```

This explains why a simple parity evaluator could feel close to a complete solution while failing to solve the opening directly: the invariant was present, but the dependency composition layer was missing.

## 10. Cheap implementation hypothesis

A practical fixed-width implementation may need only:

- RID active requirement words;
- RID blocker/coverage words;
- compact event-frontier indices;
- fixed parity/response relation words;
- a small dirty/event queue or generated dependency schedule;
- precomputed rule/implication tables.

Because all domains are finite and tiny for 7x6, closure can potentially be event-driven:

```text
new fact -> mark only dependent predicates dirty -> propagate until stable
```

rather than rescanning all rules/625 IDs.

The target is a bounded amount of incremental work per newly derived fact, not generic SAT/graph search.

## 11. Main falsifier

The hypothesis fails as a **cheap universal solver** if reaching Allis/ZPAR-strength closure from early positions requires branching over a large number of mutually incompatible response-policy choices.

It survives if either:

1. the dependency partial order + parity equations select a canonical policy without branching; or
2. the remaining alternatives collapse into a very small bounded set of strategic dependency branches, dramatically smaller than the legal-move tree.

## 12. Next experiment

Construct a small-game nested closure oracle which:

1. uses no named Allis rule types in its runtime state;
2. starts from event order + parity/response primitives + residual requirements;
3. derives blocker closure recursively;
4. records dependency depth of every derived blocker/terminal fact;
5. compares closure-derived one-sided-no-win/draw outcomes with exact complete-game values;
6. measures how often unresolved closure requires strategic branching as board rank decreases toward the empty root.

The central measurement is not NPS yet. It is:

```text
closure success rate by ply
max/mean dependency depth
number of strategic alternatives required
terminal proposition strength
```

If closure success remains high while strategic alternatives stay tiny as ply approaches zero, the single-math hypothesis becomes substantially stronger.
