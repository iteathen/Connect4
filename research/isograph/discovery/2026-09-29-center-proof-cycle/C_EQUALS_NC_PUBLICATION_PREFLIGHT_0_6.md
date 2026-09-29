# C = NC? publication preflight — revision 0.6

**Status:** publication preflight PASS  
**Date:** 2026-09-29 America/Los_Angeles  
**Paper:** research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_6.md  
**Paper blob reviewed:** adbc08fc1df80c74a0cd0d9c21dbeef6166632c3  
**Paper commit:** 1fe0ddc75b5e0d5d2ba36567af9bfadb3ee2c3f5  
**Canonical research branch:** research/semantic-quotient

## 1. Revision purpose

Revision 0.6 preserves revisions 0.1 through 0.5 and adds the theorem-contamination firewall.

The new rule addresses the risk that prior solved-game knowledge can be hidden upstream in definitions, lemmas, thresholds, case partitions, fitted parameters, stopping rules, selected "important" structures, or previously contaminated proof dependencies.

PASS.

## 2. Production theorem provenance rule

The paper now requires:

> Every theorem used to eliminate search must have a complete provenance chain terminating only in game rules, board geometry, explicitly admissible current-state facts, and previously qualified rule-derived theorems.

The rule applies to the complete proof graph, not merely the surface form of the final theorem.

PASS.

## 3. Discovery versus authority

The paper permits prior solved knowledge to suggest a conjecture, indicate where to investigate, provide a post-hoc validation target, or falsify a frozen theorem.

It forbids solved knowledge from determining the authority of theorem premises, theorem acceptance, definitions, thresholds, parameters, case splits, or supporting lemmas.

PASS.

## 4. Deletion test

The paper defines a practical provenance test.

Delete:

~~~text
solved tables
opening books
oracle outputs
known best-move labels
fitted outcome-derived parameters
solved-game annotations
~~~

Retain:

~~~text
board geometry
game rules
current position
generic theorem code
proof certificates
previously qualified rule-derived lemmas
~~~

Then re-derive/re-check the theorem.

~~~text
reduction still follows
    -> provenance-clean

reduction no longer follows
    -> contaminated
~~~

PASS.

## 5. Blind perturbation control

The paper recommends changing width, height, Connect-K, or another structural parameter as a falsifier for disguised answer-fitting.

Successful perturbation is not treated as proof of generality; it is a contamination/falsification control.

PASS.

## 6. Relation to engine correctness

The paper distinguishes:

~~~text
ordinary exact-engine correctness
    !=
rule-only theorem provenance
~~~

An engine can remain mathematically exact while using an opening book, persistent solved cache, or outcome-informed heuristic.

The stronger research claim requires search-eliminating theorems to be independently reconstructible from the formal game.

PASS.

## 7. Existing technical content

Revision 0.6 adds methodology/provenance discipline only.

It does not alter the existing 41 technical references or introduce a new game-theoretic result.

Authorship and AI-assistance disclosures remain intact.

PASS.

## 8. Final disposition

~~~text
authorship/provenance:                 PASS
AI-assistance disclosure:             PASS
core-findings attribution:            PASS
theorem-contamination firewall:       PASS
proof-graph provenance requirement:   PASS
deletion test:                        PASS
blind perturbation control:           PASS
discovery/authority distinction:      PASS
no unsupported result claim:          PASS
references preserved:                 PASS
license:                              PASS

publication disposition:
    READY AS RESEARCH PREPRINT REVISION 0.6
    ON research/semantic-quotient
~~~

No merge to main and no production-solver change is implied.
