# Connect4 IsoGraph authority 1.1 — isolated cold reconstruction

You are an isolated semantic decoder/reviewer. This is a qualification task, not a design task.

You receive:
- pinned IsoGraph Core / local uncertainty semantics;
- a deterministic view decoded only from the immutable Connect4 IsoGraph 1.1 candidate manifest;
- the exact native-image text for every logic/policy/unresolved/normalized-evidence/historical document in the candidate;
- structural roles for content-addressed implementation/provenance objects;
- the candidate evidence-lineage graph.

You do NOT receive hidden scorer assertions, author conclusions, legacy files outside the candidate, or expected answers.

Do not browse. Do not repair or improve the representation. Report what the candidate actually communicates.

Evaluate:

1. Reconstruct the corpus boundary and ownership model. Distinguish current logic, policy/routing, normalized evidence, historical material, implementation qualification, raw provenance, and source-native unresolved logic.
2. Determine whether the candidate is dependency-closed under the represented model or whether a material logical dependency appears missing.
3. Audit every canonical claim identity/status/guard/relation/source-count record. Preserve theorem vs guarded theorem vs empirical support vs candidate/hypothesis/missing-law vs disproven/rejected distinctions.
4. Audit unresolved structure. Distinguish source-native INCOMPLETE_SCOPE from rendering-created uncertainty. Do not infer OPEN/POSSIBLE/UNRESOLVED realization-family semantics unless represented.
5. Reconstruct the evidence-independence policy and distinguish:
   citation occurrence != artifact identity != evidence event != evidence lineage/independence group.
   Do not infer independence from file count, geometry count, repetition count, or workflow count.
6. For C4-R0044 report separately:
   - claim citation occurrences;
   - distinct evidence artifacts represented for its motivating lineage;
   - independently countable evidence lineages.
7. For C4-R0045 state how many lineages are represented and whether their cross-lineage independence is established, contradicted, or unknown.
8. State whether C4-R0037/R0038 share a correlated independence group, whether C4-R0074 contains a reproduction relationship, and whether empirical independence is applicable to the deductive R0060/R0062/R0063/R0070/R0071 derivations.
9. Verify that the expanded corpus actually exposes the policy/routing surfaces that govern evidence independence, the research index, experiments, provenance/untriaged state, and the active state-identity research packet.
10. Look for any material omission, strengthening, weakening, status promotion, guard loss, scope loss, or evidence double-counting risk.
11. Decide whether the semantic candidate itself qualifies as a complete/accurate representation of the frozen source corpus. A separate owner promotion decision is still required even if the semantic candidate qualifies.

Return one JSON object only:

{
  "disposition": "QUALIFIES" | "PARTIAL" | "DOES_NOT_QUALIFY",
  "source_revision": "...",
  "authority_state": "SUCCESSOR_CANDIDATE",
  "existing_authority": "1.0",
  "corpus_counts": {
    "corpus_objects": 0,
    "native_images": 0,
    "content_addressed_only": 0,
    "semantic_items": 0,
    "dependency_edges": 0,
    "missing_dependency_targets": 0
  },
  "role_counts": {
    "current_logic": 0,
    "current_policy_or_routing": 0,
    "implementation_qualification": 0,
    "raw_evidence_or_provenance": 0,
    "normalized_evidence": 0,
    "historical_only": 0,
    "source_native_unresolved_logic": 0
  },
  "research_ownership": {
    "canonical_owner": "...",
    "solver_branches_own_research": false,
    "analysis": "..."
  },
  "claim_inventory": [
    {
      "id": "C4-R####",
      "status": "...",
      "guard_count": 0,
      "relation_count": 0,
      "source_count": 0,
      "scope_present": false
    }
  ],
  "canonical_unresolved_claims": [
    {"id":"C4-R####","status":"..."}
  ],
  "negative_claims": [
    {"id":"C4-R####","status":"..."}
  ],
  "uncertainty": {
    "inherited_incomplete_scope": 0,
    "added_incomplete_scope": 0,
    "total_incomplete_scope": 0,
    "rendering_created_uncertainty": 0,
    "analysis": "..."
  },
  "omission_controls": {
    "root_policy_present": false,
    "research_index_present": false,
    "evidence_policy_present": false,
    "evidence_independence_requirement_present": false,
    "experiment_policy_present": false,
    "provenance_policy_present": false,
    "untriaged_policy_present": false,
    "state_identity_unification_present": false,
    "analysis": "..."
  },
  "evidence_lineage": {
    "C4-R0044": {
      "citation_occurrences": 0,
      "distinct_artifacts": 0,
      "independently_countable_lineages": 0,
      "analysis": "..."
    },
    "C4-R0045": {
      "lineage_count": 0,
      "cross_lineage_independence": "ESTABLISHED" | "CORRELATED" | "UNKNOWN",
      "analysis": "..."
    },
    "C4-R0037_R0038": {
      "shared_independence_group": false,
      "analysis": "..."
    },
    "C4-R0074": {
      "event_count": 0,
      "reproduction_relation": false,
      "independently_countable_lineages": 0,
      "analysis": "..."
    },
    "deductive_independence_not_applicable": ["C4-R####"]
  },
  "structural_summary": ["..."],
  "material_omissions": ["..."],
  "material_strengthenings": ["..."],
  "material_weakenings": ["..."],
  "evidence_double_counting_risks": ["..."],
  "semantic_candidate_qualifies": false,
  "authority_promotion": {
    "can_promote_now": false,
    "remaining_obligations": ["..."]
  },
  "review_notes": ["..."]
}

The claim_inventory must contain every represented canonical claim exactly once.
Do not turn a missing proof into falsehood, a missing disproof into truth, or multiple correlated artifacts into independent evidence.
