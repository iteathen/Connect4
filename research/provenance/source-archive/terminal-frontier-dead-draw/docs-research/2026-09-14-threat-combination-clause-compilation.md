# Threat-combination compilation into affine clauses, blocker clauses and adversarial min-max ranks

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Test the guarded affine-clause closure against one of the historically richer offensive structures: White/first-player threat combinations from Allis Chapter 8.

Threat combinations are important because their concrete play contains variants in which the eventual odd threat can occur in different columns. If those variants required a new runtime logical primitive, the current reduced calculus would be incomplete.

The result of this pass is stronger: the **common strategic consequences** Allis extracts from the variants compile into the already identified affine ownership facts, monotone blocker clauses, response resources and completion-before-deadline facts. The new structural ingredient is only the correct adversarial quantifier rule over certificate branches.

## 1. Historical/source boundary

Allis's example threat combination reasons through several opponent variants and concludes that White/first player can force an odd threat or win. The following general section does not retain the complete branch tree as its reusable rule. Instead it records claims that hold in all relevant variants, including forms such as:

```text
opponent gets no selected odd squares in one column;
opponent cannot get both of two specified cells;
controller can use a Baseinverse under stated playability conditions;
controller answers moves in another column up to a specified odd square;
some blocker holds because the controller must already have won before both cells can be acquired.
```

These are the consequence shapes classified below.

Source: Victor Allis, *A Knowledge-based Approach of Connect-Four* (1988), Chapter 8, especially §§8.3-8.4.

## 2. Fixed odd-square ownership/exclusion

A claim that the opponent cannot get a specified odd square, while the controller's response strategy guarantees it to the controller, is a guarded unit ownership fact:

```text
q(v)=controller.
```

Against the opponent this is equivalently the singleton blocker clause

```text
x_v=1.
```

The guard retains any exception for an initially/directly playable lowest square and the response conditions that make the ownership guarantee valid.

No new logical type is needed.

## 3. 'Opponent cannot get both' claims

Several threat-combination conclusions have the exact semantic form

```text
opponent cannot own both u and v.
```

This is the pair blocker clause

```text
x_u OR x_v = 1.
```

It is **not** promoted to XOR/split ownership unless a separate exact split relation is established.

Where the reason is that the controller must already have completed a win before both cells can be acquired, the clause is deadline-valued:

```text
C_{u,v}=1 before D.
```

This is precisely the guarded monotone-clause + temporal layer already in the current kernel.

## 4. Baseinverse and follow-up components

When the threat-combination construction invokes Baseinverse, its preserved minimum consequence is a guarded pair blocker clause under the original playability/resource premise.

When the construction says every opponent move in one column is answered up to a designated height, that is a response-resource certificate. It generates the same-column ownership/blocker consequences already represented by the control-potential and clause layers.

The response schedule also carries its ordinary event-rank parity and deadline effect; it does not create a new ownership operator.

## 5. Branch-dependent threat location is not itself the reusable invariant

The concrete tactical proof may contain branches such as

```text
branch A -> odd threat at f3
branch B -> odd threat at g3
branch C -> immediate win.
```

A flat representation that insists on naming the final threat cell must branch.

The general strategic rule avoids that by projecting every branch into a common consequence language and retaining the facts that survive all opponent variants.

Let

```text
Pi(b)
```

be the set of reduced consequences (affine facts, blocker clauses, resource/deadline facts) established in branch `b`.

For opponent-controlled variants, the unconditional reusable consequence set is

```text
Pi_guaranteed = intersection_b Pi(b).
```

This is the correct branch quotient: retain the invariant consequences, not the tactical coordinates that vary.

## 6. Adversarial earliest-rank algebra

Suppose consequence `f` is established in every opponent branch `b` with earliest certification rank

```text
t_b(f).
```

The controller cannot guarantee `f` before the slowest opponent branch permits it. Therefore

```text
t_guaranteed(f)=max_b t_b(f).
```

If the controller has several alternative certificate policies `s` that each guarantee `f`, the controller may choose the earliest one:

```text
t(f)=min_s t_s(f).
```

Within one certificate, conjunctive prerequisites also wait for their latest prerequisite:

```text
t_C=max(h_C,t_1,...,t_k).
```

Thus the same `min`/`max` rank algebra has three semantic readings:

```text
max -> all prerequisites must hold;
max -> all opponent-controlled branches must be survived;
min -> controller/proof may choose the best valid certificate alternative.
```

This is a bottleneck/min-max proof algebra over compressed certificates, not ordinary recursive legal-move minimax.

## 7. Static hyperedge form

A local threat-combination template can be compiled once as a guarded proof hyperedge:

```text
prerequisites/resources
  -> {opponent variants}
  -> common reduced consequences.
```

The runtime closure need not replay the tactical move variants if the template has already been independently proved correct. It consumes the common consequence descriptor and its worst-branch certification horizon.

This is the same role the historical named rule plays, but the runtime output is generic:

```text
affine facts;
blocker clauses;
resource reservations;
deadline ranks.
```

The historical name is provenance/regression identity, not semantic state.

## 8. Consequence for NDC completeness

Threat combinations were a strong candidate for a missing fourth Boolean consequence type because they guarantee 'one of several threats or a win.'

After projection to their reusable invariant conclusions, no new Boolean primitive is required.

The current consequence vocabulary still suffices:

```text
affine fact;
monotone blocker clause;
guarded resource/deadline composition;
terminal proposition.
```

What must be added to the closure semantics is explicit **controller/opponent quantification over certificate alternatives** so branch-dependent facts are not unsafely unioned.

## 9. Relation to the historical center-opening boundary

Allis's flat rule evaluator could use threat combinations and related strategic rules but still did not close the standard 7x6 center opening without automated search.

Therefore compiling threat combinations into the reduced algebra is necessary evidence of expressiveness, but it does not prove the current closure is complete enough for the root.

The open question is whether nested fixed-point reuse of these generic consequences collapses the early conditional dependency structure that the historical flat evaluator left unresolved.

## Next theorem target

Extend the guarded closure state from one-context facts to a finite **proof hypergraph** in which:

```text
AND prerequisites / universal opponent variants use max rank;
controller-selectable alternative certificates use min rank;
semantic consequences are canonical affine/clause facts;
shared subcertificates have one identity.
```

Then test whether the standard center opening still requires a large number of incompatible strategic alternatives or collapses to a bounded quotient of proof obligations.

## Proof boundary

The logical compilation in §§2-4 preserves only consequence strengths explicitly supported by the historical threat-combination conclusions; it does not promote blocker clauses to XOR. The min/max branch laws are direct consequences of earliest guaranteed certification under controller choice versus opponent variation. This note does not use the solved 7x6 winner as a premise.
