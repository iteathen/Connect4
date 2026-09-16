# Guarded affine-clause closure kernel with min-max deadline ranks

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Define the smallest exact closure kernel currently supported by the decomposed Connect-4 research:

```text
pairwise affine ownership/control facts
+ monotone blocker clauses
+ residual zero-edge win targets
+ support/resource guards
+ earliest-certification ranks / deadlines.
```

The goal is not to rename historical strategic rules. It is to classify the actual consequence shape of each qualified certificate and compose those consequences without silently strengthening them.

This note also identifies the natural temporal algebra: alternative proofs combine by `min`, conjunctive prerequisites combine by `max`, yielding a min-max/bottleneck fixed-point profile when a scalar event/completion rank is valid.

## 1. Fixed support context and guarded facts

Closure is evaluated relative to a fixed physical/support context `S` (current support frontier, side-to-move derivable from rank, residual geometric requirements and immutable already-played prefix).

A derived fact is not stored as an unconditional proposition unless its premises are unconditional in `S`.

Conceptually use

```text
GuardedFact:
  guard
  consequence
  earliestRank
```

where `guard` may include:

```text
support/playability predicates;
response-resource availability/exclusion;
event precedence;
other certificate identities;
reservoir/parity premises;
first-win / no-earlier-terminal premises where required.
```

Different incompatible policy alternatives remain different guarded facts. Their consequences may not be unioned as though the guards were simultaneously true.

This is the sound way to preserve alternatives without immediately converting them into move-tree branches.

## 2. Affine ownership layer

Use absolute owner bit

```text
q(v)=0 first player
q(v)=1 second player.
```

The currently justified affine primitive forms are

```text
q(v)=b
q(u)+q(v)=b
```

with `b in F2`.

The first form is an ownership anchor. The second is a same/opposite-owner relation.

For one player `p`, relative variables

```text
x_v=q(v)+p
```

allow the same parity structure to be used directly against a player-specific residual target.

A parity-DSU / signed-graph component is an exact canonical representation of this pairwise affine profile:

- each component has one root potential;
- every variable is root plus one parity bit;
- a fixed root anchors absolute ownership;
- inconsistent cycle parity is an exact contradiction under the active guard.

No higher-arity XOR equation is currently required by the qualified consequence shapes below. If one appears later, the affine owner must be generalized rather than approximated by pairwise relations.

## 3. Monotone blocker-clause layer

Against player `p`, a certified blocker set `B` is

```text
C_B = OR_(v in B) x_v = 1.
```

A player-`p` residual requirement `R` asks for

```text
x_v=0 for every v in R.
```

Therefore

```text
B subset_of R
```

is exactly the logical condition under which `C_B` contradicts completion of `R`.

This is the existing WSL upward-closure rule in ordinary Boolean form.

Minimal blocker sets form a monotone-clause antichain. Semantic strengthening is measured by the closure of certified clauses, not by raw antichain list inclusion.

## 4. Exact affine normalization of a blocker clause

Under a pairwise affine theory, every relative literal `x_v` has one of the forms

```text
0
1
r
1+r
```

for one unfixed parity-component root `r`.

Normalize a blocker clause by replacing every literal with that canonical form.

Exact simplifications:

1. If any literal is `1`, the blocker is already affine-entailed.
2. Remove every literal `0`.
3. Duplicate copies of the same root literal collapse.
4. If both `r` and `1+r` occur, the clause is a tautology and therefore affine-entailed.
5. If exactly one nonconstant root literal remains, the blocker clause is a unit and fixes that root literal to `1`.
6. If two or more distinct root literals remain, the clause remains genuinely nonlinear under the current affine information.
7. If no literal remains, the clause conflicts with the active affine assumptions/guard; the guard cannot support that certified blocker together with those ownership facts.

This is exact for the selected pairwise affine profile.

## 5. Affine impossibility of a residual requirement

A residual requirement `R` for player `p` is affine-feasible iff its all-zero relative assignment is consistent with the parity components.

For pairwise affine facts, infeasibility occurs exactly when either:

```text
some x_v in R is fixed to 1;
```

or

```text
some u,v in R satisfy x_u+x_v=1.
```

The first case extracts a singleton blocker `{v}`; the second extracts a pair blocker `{u,v}` whose blocker truth is actually affine-entailed.

Thus U1 can emit U2 consequences canonically without pretending every preexisting pair blocker was XOR.

## 6. Clause-to-affine feedback

A certified blocker clause can become affine after other facts arrive.

Examples:

```text
x_u OR x_v = 1
x_u=0
=> x_v=1
```

and

```text
x_u OR x_v = 1
x_u+x_v=0
=> x_u=x_v=1.
```

More generally, after affine normalization, any unit clause anchors one parity component. That new anchor may:

```text
fix additional ownership variables;
make other clauses units or tautologies;
make residual requirements affine-infeasible;
produce new blockers;
change which CPC/control-potential targets are resolved.
```

This is an exact affine-clause feedback cycle.

## 7. Residual elimination

For each player `p`, let `R_p` be the current physical residual requirements and let `E_p` be the set already proved impossible under the active guarded closure.

A requirement enters `E_p` when either:

```text
an affine contradiction to its all-p target is certified before its completion deadline;
```

or

```text
a certified blocker clause B with B subset_of R is valid before the requirement's completion deadline.
```

Within a fixed support context, `E_p` grows monotonically.

One-sided exhaustion is

```text
R_p subset_of E_p.
```

Bilateral exhaustion gives draw only when first-win/earlier-terminal conditions are also satisfied, exactly as required by C4-0006/C4-0007.

## 8. Consequence-shape classification of preserved strategic families

The classification below deliberately states only consequence strength already supported by the preserved research. Historical rule names are certificate generators, not runtime primitive types.

### CPC / zero-reservation target ownership

Consequence shape:

```text
guarded affine unit q(t)=b.
```

A changed event reservoir modifies the binary control potential by the certified release/reservation parity correction.

### Claimeven

Where its qualified response certificate guarantees the upper event to the controller before the relevant horizon:

```text
guarded affine unit ownership
```

and equivalently a singleton blocker clause against the opponent.

### Baseinverse

Preserved minimum consequence:

```text
guarded two-event blocker clause.
```

Do **not** promote to `q(u)+q(v)=1` unless the particular certificate separately proves exact split ownership.

### Vertical

Preserved minimum consequence:

```text
guarded two-event blocker clause
```

from the same-column response resource. Exact split ownership, when independently proved for a profile, may additionally enter the affine layer; it is not implied merely by the rule name.

### Lowinverse

Preserved consequence shape:

```text
several guarded pair-blocker clauses
```

(two vertical pairs plus the qualified cross-pair consequence in the preserved reduction). Any affine relation must be separately justified.

### Highinverse

Preserved consequence shape:

```text
several guarded pair-blocker clauses
```

including the qualified vertical/cross/component pair consequences and their original conditional premises. Conditional lower/upper pairs remain guarded; they are not unconditional clauses.

### Baseclaim

Preserved consequence shape:

```text
guarded pair-blocker clauses.
```

Again, blocker does not imply XOR.

### Aftereven

Consequence shape:

```text
guarded blocker clause(s) with own-completion-before-opponent deadline
+ qualified component Claimeven consequences.
```

The load-bearing extra datum is temporal, not a new Boolean operator.

### Before

Consequence shape:

```text
guarded successor/blocker clause
+ qualified component Claimeven/Vertical blocker facts
+ completion/response deadline.
```

### Specialbefore

Consequence shape:

```text
Before-style guarded clauses
+ extra playable-response resource/premise
+ completion/response deadline.
```

### Exhaustion

Consequence shape:

```text
terminal/no-win proposition derived from residual elimination state.
```

No new ownership relation is introduced.

### Immediate win / multiple singleton obligations

Immediate win is direct satisfaction of one anchored zero-edge target under first-win semantics.

Two or more distinct enabled opponent singleton cells with only one response placement slot produce the already-qualified response-capacity loss boundary. This is a terminal consequence of obligation/resource cardinality, not a new Boolean ownership operator.

No currently preserved family requires a fourth consequence shape beyond:

```text
affine fact;
monotone blocker clause;
guarded temporal/resource composition;
terminal proposition.
```

Completeness of certificate *generation* from the empty board is not thereby proved.

## 9. Earliest-certification rank

To preserve deadline meaning, attach to every derived consequence its earliest certification rank/horizon.

For a scalar well-founded profile, use

```text
t(f) in RANK union {infinity}.
```

Unknown facts begin at `infinity`.

If one certificate for consequence `f` requires facts `f_1,...,f_k` plus a local event/rule horizon `h_C`, then its earliest possible certification rank is

```text
t_C(f)=max(h_C,t(f_1),...,t(f_k)).
```

If several alternative certificates derive the same semantic consequence, keep

```text
t(f)=min_C t_C(f).
```

Therefore alternatives combine by `min` and conjunctive prerequisites by `max`.

This is the idempotent min-max / bottleneck algebra on proof ranks.

If the selected NDC profile needs a partial event order rather than one scalar rank, replace scalar `max` by the appropriate least upper bound / explicit precedence proof. Do not force incomparable events into an unsound scalar order.

## 10. Deadline test

A fact may discharge a requirement only when its certification relation satisfies the requirement's exact completion-before-deadline convention.

Schematically,

```text
t(blocker) before D(R).
```

Whether equality is allowed is owned by the concrete certificate/profile and must not be guessed by this abstract kernel.

The min-max rank supplies the earliest candidate horizon; the rule-specific temporal guard supplies the exact comparison semantics.

This separates:

```text
eventual truth
```

from

```text
truth in time to prevent terminal completion.
```

## 11. Monotone fixed-point order

For one fixed guarded policy/support context, define semantic information strength by:

```text
more affine equations / smaller affine solution set;
more certified blocker-clause consequences;
more eliminated residual requirements;
more terminal/no-win propositions;
earlier (never later) certification rank for the same consequence.
```

The closure rules above only strengthen information in that order.

A canonical implementation may therefore start from primitive guarded facts and repeatedly apply:

```text
AFFINE-CLOSE
CLAUSE-NORMALIZE
UNIT-FORCE
AFFINE-TO-BLOCKER
BLOCKER-COVER
RESIDUAL-ELIMINATE
CPC/POTENTIAL-CONSEQUENCE
DEADLINE-CERTIFY
TERMINALIZE
```

until no semantic fact/rank improves.

Because the event universe, residual/blocker universe and finite rank set are finite for every finite board, this selected guarded context reaches a least fixed point.

This is NDC closure, not legal-move recursion.

## 12. Guarded alternatives and the non-branching boundary

Incompatible response policies must not share unconditional consequences.

The closure may preserve alternatives symbolically as

```text
guard_A -> fact
guard_B -> fact
```

and combine them only when a common consequence is valid under the disjunction or when one guard is independently established.

If proving the requested root result ultimately requires choosing among a large number of mutually incompatible guards with no compact symbolic sharing, that is the known falsifier of a cheap searchless closure.

This note does not assume that problem away.

## 13. Current reduced proof algebra

The active candidate proof system is now

```text
F2 signed/control potential
+ pairwise affine ownership constraints
+ positive blocker clauses
+ residual anchored zero-edge targets
+ finite support/resource guards
+ min-max earliest proof ranks
+ first-win terminal semantics.
```

This is a much smaller set of primitive relation types than the historical named-rule taxonomy.

## 14. Next theorem target

Construct a canonical guarded closure descriptor for the standard width-7 center prefix and prove, without solved W/D/L labels, whether the closure can derive:

```text
01  (first-player win)
```

or only a weaker no-loss fact.

The decisive diagnostic is not a finite game-tree result. It is which unresolved guarded clause/deadline dependency remains after the affine+clause min-max closure saturates.

That missing dependency, if any, is the next candidate derived axiom or necessary strategic-alternative object.

## Proof boundary

The affine/clause normalizations and WSL subset correspondence are exact Boolean algebra. The min-max timing law is exact for any selected scalar rank profile where a certificate becomes valid once all prerequisites and its own horizon are reached; profiles with partial event order must preserve that richer order. The named-rule classification records only consequence shapes already present in preserved research and intentionally does not strengthen blocker clauses to XOR. No solved W/D/L table is a premise.
