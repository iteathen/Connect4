# Opponent-residual deletion equivalence audit

**Status:** bounded exact structural discovery evidence  
**Research direction:** Joshua Oshiro  
**Experimental branch:** research/nim-control-parity-algebra-20260929  
**Workflow:** 36576114391 — success  
**Gameplay-authority effect:** none  
**Production-solver effect:** none

## Question

After the current exact local realizability closures, how often can one opponent residual obligation be deleted while landing on another reachable structural state in exactly the same recursive action-unlabelled class?

The audit is post-hoc over the structural graph. Recursive classes are used only to identify equivalence after the producer is frozen; no solved W/D/L labels are used.

## Exact 4x4 Connect-4 result

~~~text
single opponent-residual deletions tested   24,619
reachable deletion target states             7,775
class-preserving deletions                      438

exact open-cap residual deletions               170
move-capacity explained deletions                76
support-release explained deletions              80
unexplained after support-release               358
~~~

Support-release capacity subsumes the simple move-count impossibility in this audit, so the current local timing/resource rules explain only 80 / 438 = about 18.26% of these exact deletion equivalences.

About 81.74% remain structurally unexplained.

## Rank distribution

~~~text
rank  8      1
rank  9     10
rank 10    175
rank 11     92
rank 12    143
rank 13     17
~~~

There are no class-preserving single-opponent-residual deletions before rank 8. The first such event occurs exactly at the same rank as the earliest residual-orbit to recursive-class merges.

## Interpretation

This family is substantially larger than the residuals eliminated by the newly proved local realizability rules. It is therefore not accurate to interpret the remaining recursive quotient gap primarily as ordinary impossibility of completing an opponent line.

The evidence instead supports a broader branch-local phenomenon:

~~~text
opponent residual present
and
opponent residual absent
    -> same future action-class set
~~~

under contexts that are not generally captured by raw move count, support-release timing, or the existing cap rule.

The first rank-8 instance is especially important because it lies at the earliest dynamic merge boundary. It should be isolated explicitly and compared against the nine complete rank-8 merge pairs before proposing a general dominance clause.

## Non-claims

Class-preserving deletion is evidence of semantic redundancy in the completed finite quotient; it is not by itself a local theorem permitting the residual to be erased in all contexts. A rule must be derived from geometry, support, resources, deadlines, or another rule-only invariant and independently qualified before it may enter the producer.
