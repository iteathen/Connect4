# Connect4 IsoGraph authority 1.1 — Core 0.18 sanity audit

**Date:** 2026-09-18  
**Canonical research owner:** `research/semantic-quotient`  
**Connect4 authority audited:** IsoGraph logic authority 1.1  
**Authority head at audit start:** `ab638ed92b3082dd0fdd0918869c5cc91f2465f5`  
**Qualified semantic base of authority 1.1:** IsoGraph Core 0.17  
**Additional audit lens:** IsoGraph Core 0.18 Observation-First Discrepancy Clarification **candidate**  
**Core 0.18 authority status:** unqualified candidate; used here as a sanity lens only  
**Semantic authority changed by this audit:** no

## Overall result

```text
AUTHORITY_1_1_REPRESENTATION_COMPATIBILITY_WITH_CORE_0_18_IDEALS = PASS
AUTHORITY_1_1_UNKNOWN_AND_EVIDENCE_STRUCTURE = PASS
AUTHORITY_1_1_FROZEN_EVIDENCE_PRESERVATION = PASS
AUTHORITY_1_1_OLD_ADJUDICATION_DISCOVERY_PRESERVATION = PARTIAL
SEMANTIC_REPAIR_REQUIRED = NO
NEW_CANDIDATE_FREEZE_REQUIRED = NO
FRESH_COLD_RERUN_REQUIRED = NO
```

Authority 1.1 does not need semantic repair to satisfy the observation-first ideals expressed by Core 0.18.

The main compatibility gap is procedural and post-qualification: the 1.1 adjudication correctly established several cold-output errors for the qualification contract, but its final label — `SEMANTIC_CANDIDATE_SOUND_DECODER_FIDELITY_ERRORS_ONLY` — is too closed when interpreted as a discovery disposition.

Under the Core 0.18 observation-first model, a discrepancy may be a decoder error **for qualification** while still leaving a separate structural-discovery lead open.

This audit preserves those leads without changing any frozen 1.1 semantic or qualification artifact.

---

## Why authority 1.1 is already strongly aligned

Authority 1.1 was itself created because a discrepancy was allowed to propagate rather than being locally patched.

The C4-R0044 source-count mismatch ultimately exposed that these were different semantic quantities:

```text
citation occurrence
artifact identity
evidence event
evidence lineage
independence group
```

The response was not merely to change a count. The corpus boundary and evidence ontology were rebuilt.

That is directly aligned with Core 0.18's central doctrine:

```text
discrepancy
-> observation
-> hidden distinction exposed
-> dependency consequences followed
-> representation refined
```

Authority 1.1 also replaced the manually bounded 1.0 corpus with a dependency-closed boundary:

```text
432 corpus objects
568 dependency edges
0 missing dependency targets
```

This is similarly aligned with the rule that newly exposed load-bearing structure is allowed to propagate through its dependency cone rather than being suppressed.

---

# Core 0.18 compatibility matrix

## 0. Observation != judgment; discrepancy != defect

**Result: PASS for authority construction; PARTIAL for the final cold-adjudication wording.**

The R0044 discrepancy was treated as evidence and triggered deeper investigation.

The frozen cold report, score, and provider output were preserved rather than rewritten after later adjudication.

However, the final 1.1 cold adjudication collapses all surviving cold mismatches into:

```text
SEMANTIC_CANDIDATE_SOUND_DECODER_FIDELITY_ERRORS_ONLY
```

That is correct as a **qualification disposition** but incomplete as a **discovery disposition**.

Core 0.18 requires those two questions to remain separable.

---

## 1. Discrepancy is initially observational

**Result: PASS/PARTIAL.**

Pass:

- R0044 was treated observationally and produced the evidence-lineage model.
- the mechanical cold failure was preserved unchanged;
- no rerun was used to seek a cleaner answer;
- the semantic candidate was not mutated to agree with the decoder.

Partial:

- later cold discrepancies were adjudicated primarily by proving the decoder wrong relative to the requested mechanical quantity;
- the adjudication did not separately record whether the same anomaly still suggested a structural question.

No semantic authority error follows from this. The missing piece is a discovery ledger.

---

## 2. Semantic alignment precedes value comparison

**Result: PASS.**

The adjudication explicitly distinguishes the quantities being compared.

Examples:

### R0045

The qualification field was:

```text
claim source_count
```

The canonical claim contains four explicit source citations.

The evidence-lineage graph independently represents lineage semantics.

The adjudication correctly states that evidence-lineage grouping must not redefine the explicit claim source-count field.

### Scope mismatches

For R0010, R0034 and R0054, the mechanical field was:

```text
explicit scope field present?
```

The decoder sometimes answered a different semantic question by inferring contextual/conditional scope.

R0054 makes this especially visible: the statement is guarded/conditional, while the canonical record has no explicit `scope` field.

The adjudication correctly separates:

```text
explicit scope metadata
    !=
semantic/domain validity restriction
```

even though it did not preserve that distinction as an explicit discovery lead.

### Lineages and events

The adjudication correctly establishes:

```text
10 evidence lineages
13 evidence events
```

and identifies the cold prose's "13 evidence lineages" statement as a quantity substitution.

---

## 3. Preserve observation before repair

**Result: PASS.**

Authority 1.1 has unusually strong preservation here.

The following remain frozen:

- cold provider report;
- provider metadata;
- provider diagnostic;
- mechanical score;
- candidate manifest;
- semantic candidate;
- adjudication;
- qualification review.

The mechanical score remains FAIL.

The model was not rerun merely to obtain a cleaner output.

No frozen source or authority 1.0 artifact was rewritten.

This is fully aligned with Core 0.18 and the IsoGraph design ideals.

---

## 4. Hidden distinction and hidden equivalence are both possible

**Result: PARTIAL.**

The hidden-distinction side is strongly demonstrated by R0044.

The hidden-equivalence / alternate-aggregation side was not fully preserved for the later cold mismatches.

The following structural leads remain open after this audit.

### Lead A — explicit scope metadata vs semantic validity scope

**Qualification disposition:** decoder field extraction error for R0010/R0034/R0054.  
**Discovery disposition:** OPEN STRUCTURAL LEAD.

Question:

```text
When can semantic validity restrictions be derived exactly
from statement/guard/dependency structure even when no explicit scope field exists?
```

This does not mean the decoder was mechanically correct.

It asks whether:

```text
explicit_scope_metadata
```

and:

```text
derived_semantic_scope
```

have a qualified relation for some claim classes.

R0054 is the clearest motivating case.

R0010 and R0034 should remain weaker observations until their exact inferred basis is established.

### Lead B — explicit relation set vs possible generating relation basis

**Qualification disposition:** decoder relation-count errors for R0015, R0016 and R0052.  
**Discovery disposition:** OPEN, LOW-CONFIDENCE STRUCTURAL LEAD.

Observed pattern:

```text
R0015: explicit 2 -> decoder 1
R0016: explicit 2 -> decoder 1
R0052: explicit 6 -> decoder 5
```

Question:

```text
Did the decoder merely omit edges,
or was it implicitly treating one relation as derivable
from another relation plus surrounding claim structure?
```

No generating-basis claim is established.

The explicit authority graph remains correct until an exact derivation/coverage proof says otherwise.

### Lead C — R0045 intermediate evidence identity

**Qualification disposition:** claim source-count error; canonical count is 4.  
**Discovery disposition:** OPEN, LOW-CONFIDENCE STRUCTURAL LEAD.

Known exact structure includes:

```text
4 claim source citations
2 represented evidence lineages
cross-lineage independence = UNKNOWN
```

The decoder returned 3.

The number 3 has no current authority.

But under observation-first discipline it should not be discarded without noting the question:

```text
Is there a useful intermediate evidentiary identity/aggregation
between claim citation occurrence and evidence lineage?
```

The answer may simply be no.

Until demonstrated, no new evidence level is introduced.

### Lead D — explicit deductive-independence tags vs semantically derivable inapplicability

**Qualification disposition:** decoder overreach.  
**Discovery disposition:** OPEN STRUCTURAL LEAD.

The cold prompt requested exactly five claims covered by the two explicit:

```text
independence_status = not_applicable_deductive
```

lineages.

The decoder generalized the concept to many other deductive/guarded claims, included duplicates, and even included R0016 despite its `empirically_supported` status.

Mechanically, the decoder was wrong.

The surviving structural question is different:

```text
explicitly asserted not_applicable_deductive
    !=
property inferable from claim/evidence type
```

A future model could test whether a safe derived predicate exists.

No such predicate is currently authoritative.

### Lead E — 10 lineages / 13 events prose substitution

**Qualification disposition:** decoder prose slippage.  
**Discovery disposition:** NO NEW STRUCTURAL LEAD REQUIRED.

The distinction is already explicit and first-class in authority 1.1.

The structured decoder output otherwise recovered the distinction.

This looks like ordinary summarization substitution rather than evidence of another missing semantic layer.

---

## 5. Failure classification is downstream of observation

**Result: PARTIAL.**

The cold adjudication performed enough direct comparison to justify its qualification findings.

Therefore these statements remain valid:

- the explicit field-count assertions were correct;
- the requested deductive-independence control was correctly scoped;
- the decoder output failed those mechanical obligations.

The issue is only the final all-purpose wording.

A Core-0.18-compatible interpretation is:

```text
qualification:
    decoder/output fidelity errors established

semantic candidate:
    no defect established

discovery:
    some anomaly-derived structural questions remain open
```

That is more precise than treating "decoder fidelity errors only" as the complete meaning of the discrepancies.

---

## 6. Unknown distinctions are not projection permission

**Result: PASS.**

Authority 1.1 is strongly aligned here.

It preserves:

- 31 qualified local `INCOMPLETE_SCOPE` records;
- zero rendering-created uncertainty;
- four source-native unresolved state-identity documents;
- C4-R0045 cross-lineage independence as explicitly UNKNOWN;
- correlated R0037/R0038 evidence;
- reproduction relation for R0074;
- eight unresolved canonical claims;
- missing laws/candidate rules/hypotheses without promotion.

The 1.1 bridge explicitly prevents `INCOMPLETE_SCOPE` from being silently strengthened into:

- OPEN;
- POSSIBLE;
- UNRESOLVED;
- probability;
- a complete QU realization family.

Unknown structure is preserved rather than used as permission to collapse or complete the corpus.

---

## 7. Scoped equivalence is not global identity

**Result: PASS.**

Authority 1.1 does not promote the state-identity-unification packet into settled identity claims.

The packet remains `source_native_unresolved_logic`.

The evidence-lineage model permits scoped grouping such as:

```text
two artifacts
-> one evidence lineage
```

without turning those artifacts into one artifact identity.

Likewise, no factorization-space completeness or global canonical-factorization claim was added during promotion.

This is consistent with scoped quotient semantics.

---

## 8. Discovery lead may survive qualification adjudication

**Result: GAP FOUND — PROCESS/DOCUMENTATION ONLY.**

This is the principal Core 0.18 mismatch.

The old adjudication records qualification conclusions but no independent discovery disposition.

As a result, later readers can reasonably interpret:

```text
DECODER_FIDELITY_ERRORS_ONLY
```

as meaning:

```text
nothing structurally interesting remains
```

That stronger interpretation is not justified.

This audit therefore records the surviving leads above without changing the historical adjudication.

The original adjudication remains immutable evidence of the qualification process that actually occurred.

---

## 9. Dependency invalidation may reveal load-bearing structure

**Result: PASS.**

The transition from authority 1.0 to 1.1 is direct evidence.

A small R0044 discrepancy exposed:

- under-factored evidence identity;
- an under-complete manually selected corpus boundary.

The response expanded the ontology locally and rebuilt the corpus through dependency closure.

The propagation was not suppressed merely to preserve 1.0.

Authority 1.0 remains historical evidence while 1.1 supersedes it.

This is exactly the intended behavior.

---

## 10. Observation-first burden remains bounded

**Result: PASS.**

The 1.1 campaign did not demand endless semantic reruns.

Once the frozen candidate was shown unchanged and the cold-output errors were localized:

- no new candidate freeze was created;
- no new cold model call was made;
- deterministic evidence was reused where sufficient;
- the red mechanical score was preserved rather than optimized away.

Core 0.18 does not require reopening every decoder error indefinitely.

This audit similarly leaves low-confidence leads open without making them authority or blocking 1.1.

---

# Authority consequence

No authority 1.1 semantic artifact should be modified as a result of this sanity check.

In particular, do not mutate:

- the authority 1.1 manifest;
- the frozen candidate manifest;
- canonical claims;
- uncertainty records;
- evidence-lineage graph;
- frozen cold report;
- frozen score;
- original adjudication;
- final qualification review;
- 1.1 promotion decision.

The original 1.1 qualification remains a valid Core-0.17 qualification.

Core 0.18 is currently an unqualified successor candidate and cannot retroactively become qualification authority over the frozen 1.1 campaign.

This audit is a **compatibility and process review**, not a requalification.

---

# Future successor requirement

A future Connect4 IsoGraph authority revision using the observation-first successor stack should preserve two separate dispositions for every material semantic discrepancy:

```text
qualification_disposition
discovery_disposition
```

At minimum, it should make explicit:

1. what each observer measured;
2. whether quantity/scope/layer/authority were aligned;
3. the qualification consequence;
4. any surviving hidden-distinction or hidden-equivalence lead;
5. any unresolved factor that blocks collapse;
6. whether downstream invalidation is required;
7. whether the lead is strong enough to justify further work.

A value error may close qualification while leaving discovery open.

A discovery lead may remain open without blocking authority promotion when it does not undermine the representation claim.

---

# Final disposition

```text
Connect4 IsoGraph authority 1.1:
    semantically compatible with Core 0.18 ideals

Representation repair:
    not required

Authority promotion status:
    unchanged

Historical 1.1 qualification:
    preserved

Main gap:
    old adjudication did not separately preserve discovery dispositions

Surviving structural leads:
    explicit scope metadata vs derived semantic scope
    explicit relation set vs possible generating basis
    R0045 intermediate evidence identity/aggregation
    explicit deductive-independence tag vs derivable inapplicability

Already-established structural discovery:
    citation != artifact != event != lineage != independence group

Ordinary error with no new structural burden:
    10-lineage / 13-event prose substitution
```

**CORE_0_18_SANITY_AUDIT_1_1 = PASS_WITH_PROCESS_GAP**

The process gap is now explicitly recorded. It does not invalidate authority 1.1.
