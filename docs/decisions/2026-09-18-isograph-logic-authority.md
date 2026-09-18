# Decision: IsoGraph is the authoritative Connect4 logic representation

**Date:** 2026-09-18  
**Status:** owner-authorized representation-authority decision  
**Effective target:** integration into `research/semantic-quotient`  
**Qualification:** `research/isograph/qualification/FINAL_QUALIFICATION_REVIEW_1_0.md`

## Decision

The authoritative representation of the qualified Connect4 logic corpus is now the IsoGraph authority rooted at:

- `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_0.isg`
- `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_0.md`

The promoted authority wraps the exact frozen candidate:

`82366fbf406dcab11f7926ee5a9487e538003cd3`

which renders the current logic corpus frozen at:

`aea692af800f524569ea1c2fda722087cd9bca39`.

The final qualification review establishes complete source coverage, exact round-trip fidelity, complete canonical-claim preservation, complete source-occurrence accounting, explicit uncertainty preservation, isolated semantic reconstruction and adversarial distinction preservation.

## Scope

This representation authority covers the complete corpus boundary declared by `CONNECT4_LOGIC_PROFILE_0_1.md`, including repository/research routing logic included in the freeze, Connect4 domain/spec/profile logic included in the freeze, canonical research claims and relations, maps and synthesis, hypotheses/missing laws/open questions, confidence schema, and exact evidence/provenance dependencies referenced by canonical claims.

Unknown or unresolved source material remains authoritative **as unknown/unresolved structure**. It is not omitted and is not promoted into a theorem.

## Representation authority versus ownership

This decision changes the canonical representation of logic. It does not collapse repository ownership boundaries.

- `research/semantic-quotient` remains the single durable owner of Connect4 research.
- solver branches remain implementation and implementation-qualification owners.
- main/shared product ownership remains distinct from solver implementation ownership.
- consuming a logical claim does not transfer ownership of that claim.

## Legacy corpus disposition

The pre-IsoGraph prose/Markdown/JSON logic corpus is retained for provenance, reconstruction, compatibility and human inspection.

It is no longer the conflict-resolution authority for the frozen logic it supplied.

Where a legacy source and the promoted IsoGraph representation appear to disagree:

1. treat the mismatch first as a representation/integrity defect;
2. verify against the frozen exact source image and qualification provenance;
3. do not silently choose the legacy prose as current authority;
4. correct or roll back the IsoGraph authority only through an explicit qualified revision/decision.

The old files are not deleted because they remain useful provenance and bridge material.

## Ongoing authoring rule

New durable Connect4 logic or a change to existing logic must be incorporated into a new qualified IsoGraph authority revision.

Human-readable Markdown/JSON views may continue to exist, but after this decision they are derived/bridge views unless an explicit separate ownership contract states otherwise. A direct edit to a legacy view does not become authoritative merely because it is newer.

Every authority revision must:

1. preserve the previous authority revision immutably;
2. represent determinate changes exactly;
3. represent unresolved material explicitly;
4. distinguish source-native uncertainty from rendering gaps;
5. run applicable deterministic integrity/differential gates;
6. run fresh semantic qualification when the semantic change warrants it;
7. publish an explicit promotion record.

## Uncertainty authority

The frozen corpus uses the qualified local bridge:

`research/isograph/qualification/CONNECT4_INCOMPLETE_SCOPE_BRIDGE_0_1.md`

That bridge qualifies only the exact 27 source-native `INCOMPLETE_SCOPE` records in this corpus. It does not promote or import global QU 0.1 semantics.

## Reopen condition

This decision is reopened only by evidence of a material omission/strengthening/weakening/reconstruction mismatch, an explicitly qualified successor IsoGraph authority revision, or explicit owner instruction.

Historical topology/prose statements remain evidence at their recorded revisions and do not override this decision.
