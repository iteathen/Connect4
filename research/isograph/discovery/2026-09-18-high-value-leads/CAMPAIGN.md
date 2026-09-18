# High-value lead investigation campaign — 2026-09-18

**Owner:** `research/semantic-quotient`  
**Base authority:** Connect4 IsoGraph 1.1  
**Input leads:** 2, 20, 32, 36, 40, 43 from the DP/NEI campaigns  
**Authority mutation:** none

## Objective

Investigate the six highest-value surviving leads from the Discovery Protocol + NEI campaigns and determine whether each is:

- real structure;
- a representation gap;
- a theorem candidate;
- a falsified interpretation;
- or still genuinely unresolved.

## Results at a glance

| Lead | Result |
|---|---|
| semantic-scope derivation | **STRUCTURE ESTABLISHED** — current claim schema cannot derive full semantic scope from structured fields |
| deductive-independence derivation | **CURRENT-CORPUS STRUCTURE ESTABLISHED** — typed generalization candidate |
| profile-mediated safe collapse | **REFINED** — contextual correspondence span, not necessarily a quotient function |
| context-dependent identity projection | **STRUCTURE ESTABLISHED** — artifact identity alone does not determine lineage |
| standard 7x6 same-q identity | **DEDUCTIVE CANDIDATE MATHEMATICALLY RESOLVED** for ordinary future behavior |
| same-q breaker search | **RECLASSIFIED** as adversarial theorem/implementation qualification |

## 1. Semantic scope

Whole-corpus audit:

~~~text
claims                              74
explicit scope field                31
nonempty guards                      8
scope or guards                     39
neither                             35

empirically_supported               26
empirical with no explicit scope    13

guarded_exact                        7
guarded_exact with no guards/scope   2
~~~

Conclusion:

~~~text
semantic scope
    cannot be exactly recovered
    from current structured scope/guards fields
~~~

The single current notion of scope conflates:

- claim domain;
- guards;
- evidence coverage;
- anti-lift exclusions.

Successor representation should type these separately.

See `SEMANTIC_SCOPE_NORMALIZATION.md`.

## 2. Deductive evidence-lineage mode

Authority 1.1 has:

~~~text
10 lineages
8 empirical/reproduction
2 deductive-only
~~~

The two `not_applicable_deductive` lineages are exactly the two with:

- proof/derivation-only event semantics;
- no empirical run/workflow identity;
- normalized derivation evidence.

The current classifier has zero counterexamples, but it relies on partially free-text roles.

Successor candidate:

~~~text
evidence_mode =
    empirical
    deductive_only
    mixed
~~~

and derive empirical-independence applicability from that typed mode.

See `DEDUCTIVE_LINEAGE_MODE.md`.

## 3. Contextual identity spans

The evidence graph contains:

~~~text
26 artifact incidence records
21 unique underlying artifact objects
~~~

Artifact 3000222 occurs in five lineages.

Artifact 3000283 occurs in two.

Thus neither:

~~~text
artifact -> lineage
~~~

nor even:

~~~text
(artifact, claim) -> lineage
~~~

is globally functional.

The native graph already creates separate lineage-local artifact records tied to the same underlying object SI.

Hidden distinction:

~~~text
immutable artifact object
!=
artifact-lineage occurrence/incidence
~~~

General identity structure:

~~~text
              contextual occurrence i
             /                       \
            v                         v
     fine referent F             scoped carrier V
~~~

The functional SIU `physical state -> q` quotient is one special case of this more general anchored correspondence.

See `CONTEXTUAL_IDENTITY_SPANS.md`.

## 4. q future-behavior congruence

For legal nonterminal standard-7x6 states define:

~~~text
q =
    support
    + normalized P0 residual antichain
    + normalized P1 residual antichain
~~~

Side to move is determined by support rank parity.

The investigation derives:

~~~text
q(s)=q(t)
    ->
same legal actions
same immediate terminal result per action
same successor q per nonterminal action
    ->
same complete action-labelled future
    ->
same W/D/L and distance-sensitive exact action/state values
~~~

The proof uses:

1. support-determined legal landings and side to move;
2. exact mover/opponent residual cofactors;
3. minimal-antichain congruence;
4. first-win stopping;
5. induction on remaining cells.

### Antichain adversarial control

An exhaustive abstract control checked:

~~~text
32,906 set families
131,474 mover/opponent cofactor cases
PASS
~~~

The first checker version appeared to fail because it compared residual state after a terminal win.

That was a harness overconstraint.

First-win stopping makes post-terminal residual differences unobservable.

After correcting that, all cases passed.

### Generalization

The proof does not use 7, 6, or 4 specifically.

Candidate generalization:

> On any fixed finite gravity Connect-K geometry under the same first-win/no-pass semantics, equal support plus equal exact normalized residual antichains determines ordinary future behavior.

This broader statement still requires explicit nonstandard-board qualification.

See `STANDARD_7X6_Q_CONGRUENCE.md`.

## 5. What happened to the breaker search?

The original 7x6 breaker target asked for equal-q states with different:

- legal moves;
- terminal behavior;
- successor q;
- strong/action scores;
- W/D/L.

After the congruence proof, such a case would indicate:

- a q-construction defect;
- an antichain/cofactor defect;
- support/side-to-move defect;
- first-win bug;
- or a scope mismatch.

So the breaker search remains valuable, but as **adversarial qualification**, not as the primary means of discovering a missing semantic coordinate.

The existing 30,254-state solved-db sample does not positively test q collapse because its exact-q signature was injective over the sample:

~~~text
30,254 physical samples
30,254 exact-q classes
~~~

No sampled merge means no sampled evidence for or against same-q pair behavior.

## 6. NEI consequence

Historical result `NEI-C4-0007` remains:

~~~text
INCOMPLETE_UNQUALIFIED
~~~

under the evidence revision pinned by the NEI application.

This campaign is newer evidence.

Current interpretation:

~~~text
mathematical future-behavior closure:
    deductive candidate appears resolved

qualified NEI authority:
    not yet updated

next NEI successor action:
    independently review/qualify the q-congruence proof,
    then reassess NEI-C4-0007 under a new evidence revision
~~~

The historical result is not rewritten.

## 7. Cross-lead synthesis

The six leads converge on one recurring requirement:

> **Before collapsing information, make the context that licenses the collapse explicit.**

That context appears as:

- typed claim scope;
- evidence mode;
- incidence/query anchor;
- NEI profile;
- exact transition semantics.

The major structural pattern is no longer simply "quotient as much as possible."

It is:

~~~text
fine structure
+ explicit context/profile
+ qualified projection/correspondence
-> safe scoped identity/collapse

while:
    residual
    provenance
    out-of-scope distinctions
remain represented
~~~

## Files

- `SEMANTIC_SCOPE_NORMALIZATION.md`
- `DEDUCTIVE_LINEAGE_MODE.md`
- `CONTEXTUAL_IDENTITY_SPANS.md`
- `STANDARD_7X6_Q_CONGRUENCE.md`
- `antichain-congruence-control.mjs`
- `antichain-congruence-control-result.json`
- `LEAD_LEDGER.json`

## Final disposition

~~~text
HIGH_VALUE_LEADS_INVESTIGATED = 6

structure established / refined      4
deductive theorem candidate          1
breaker lead reclassified            1

high-value leads left conceptually vague
    = 0

remaining work
    = normalization + independent qualification + authority ingestion
~~~
