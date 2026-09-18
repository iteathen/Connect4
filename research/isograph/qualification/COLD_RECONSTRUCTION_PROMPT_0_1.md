# Connect4 IsoGraph cold reconstruction qualification 0.1

You are an isolated decoder/reviewer. This is a qualification task, not a design exercise.

You receive only a deterministic view decoded from the candidate native IsoGraph corpus plus its pinned IsoGraph Core/QU authorities and candidate profile. You do NOT receive the original Connect4 source files, hidden scorer assertions, prior author reviews, or expected answers.

Do not browse. Do not repair, redesign, reinterpret, or improve the corpus. Determine what the candidate representation actually communicates.

Evaluate all of these:

1. Reconstruct the represented Connect4 logic architecture, research ownership, solver/research boundary, major structural stack, and current authority state.
2. Audit all canonical claim records for status, guards, scope, relations, and evidentiary strength. Preserve distinctions between theorem, guarded theorem, empirical result, hypothesis, candidate rule, missing law, disproven result, and rejected implementation.
3. Reconstruct all explicitly unresolved canonical claims. Assess whether QU INCOMPLETE_SCOPE faithfully represents each case given the information supplied. Do not turn failure to prove something into semantic UNRESOLVED unless the represented realization-family semantics actually support that.
4. Distinguish source-native uncertainty from migration/rendering uncertainty. State which, if either, may remain when authority is promoted.
5. Check these adversarial semantic neighborhoods without assuming they are equivalent:
   - multiple distinct immediate opponent completions versus one unique immediate completion;
   - race-free nested ownership inference versus temporally guarded nested dependency closure;
   - a supported representation/algebra result versus a rejected implementation form using related machinery;
   - a deductive support-local dictionary theorem versus its bounded empirical recurrence qualification.
6. Look for any material omission, strengthening, weakening, guard loss, scope loss, relation-direction reversal, status promotion, or contradiction in what the native corpus communicates.
7. Decide whether the candidate, as represented to you, is ready for authority promotion. Authority promotion requires semantic completeness and accuracy, not merely byte recovery.

Return one JSON object only, with this schema:

{
  "disposition": "QUALIFIES" | "PARTIAL" | "DOES_NOT_QUALIFY",
  "source_revision": "<represented frozen Connect4 revision>",
  "authority_state": "<represented current authority state>",
  "corpus_counts": {
    "current_logic_documents": <integer>,
    "source_objects": <integer>,
    "canonical_claims": <integer>,
    "semantic_items": <integer>
  },
  "research_ownership": {
    "canonical_owner": "<branch or owner representation>",
    "solver_branches_own_research": <boolean>,
    "explanation": "<brief>"
  },
  "claim_inventory": [
    {
      "id": "C4-R####",
      "status": "<status>",
      "guard_count": <integer>,
      "relation_count": <integer>,
      "source_count": <integer>,
      "scope_present": <boolean>
    }
  ],
  "unresolved_inventory": [
    {
      "id": "C4-R####",
      "status": "<status>",
      "qu_state": "<QU state you reconstruct>",
      "explanation": "<brief>"
    }
  ],
  "negative_inventory": [
    {"id":"C4-R####","status":"<status>","meaning":"<brief>"}
  ],
  "structural_summary": ["<load-bearing reconstructed structure>", "..."],
  "critical_distinctions": {
    "multiple_vs_unique_immediate_completion": "<analysis>",
    "race_free_vs_temporal_ndc": "<analysis>",
    "representation_result_vs_rejected_implementation": "<analysis>",
    "deductive_theorem_vs_empirical_qualification": "<analysis>",
    "source_native_vs_rendering_uncertainty": "<analysis>"
  },
  "qu_bridge_assessment": {
    "incomplete_scope_usage_sound": <boolean>,
    "claims_complete_realization_universe": <boolean>,
    "analysis": "<brief>"
  },
  "material_omissions": ["..."],
  "material_strengthenings": ["..."],
  "material_weakenings": ["..."],
  "authority_promotion": {
    "can_promote_now": <boolean>,
    "remaining_obligations": ["..."]
  },
  "review_notes": ["..."]
}

The claim_inventory must contain every canonical claim represented in the packet exactly once. Do not omit claims because they appear uninteresting or redundant.

A PARTIAL or DOES_NOT_QUALIFY result is correct if the representation does not support the stronger conclusion. Unknown remains unknown.
