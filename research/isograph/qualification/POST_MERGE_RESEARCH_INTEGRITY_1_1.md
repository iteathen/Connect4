# Connect4 IsoGraph authority 1.1 — post-merge research integrity

**Result:** PASS  
**Date:** 2026-09-18  
**Canonical owner:** `research/semantic-quotient`  
**Integration PR:** #58  
**Merge commit:** `008ee544e58f8a54e3498a99593221932ea39461`  
**Canonical head qualified after routing repair:** `d5efed70f2a80df607062032fdb5575cfe5c43be`

## Purpose

This is a post-integration repository-state audit. It does not alter or rerun the frozen semantic candidate and it is not a replacement for the deterministic/cold qualification recorded in `FINAL_QUALIFICATION_REVIEW_1_1.md`.

## Post-merge finding and repair

The first post-merge read found four promotion-routing surfaces still naming authority 1.0 as current:

- `research/AGENTS.md`;
- `research/README.md`;
- `STATUS.md`;
- `next_step.yaml`.

This was an integration-routing residue, not a defect in the frozen 1.1 semantic representation. It was repaired on the canonical research owner:

- `4c53a6bfd7df8dea9260331e3d7a3d697c51887d` — research agent routing;
- `120f818b1b4d54d8c96e913c9706521c9c358409` — research README routing;
- `9658e405d4dd0a73f0c639f5936a48f256b4f964` — status routing;
- `d5efed70f2a80df607062032fdb5575cfe5c43be` — next-step routing.

After repair, all current authority entrypoints point to authority 1.1. References to authority 1.0 that remain are explicitly historical.

## Authority identity checks

The post-merge audit re-read the canonical repository and verified:

```text
authority manifest blob   986f10a0011059e4d19598de6c836272c102415d
candidate manifest blob   0b3c54f193b084e2e5dd2eb7f4fb641b1052491a
canonical claim blob      ec4a2c4041dc83cebe43dafe3e63c139ace2881e
```

Key manifest-pinned semantic blobs matched exactly:

- full successor corpus;
- canonical claim record;
- 1.1 uncertainty record;
- evidence-lineage graph.

Authority-manifest counts also matched:

```text
corpus objects                    432
dependency edges                  568
missing dependency targets          0
native source images              234
content-addressed-only            198
semantic items                 29,650
canonical claims                   74
INCOMPLETE_SCOPE records           31
rendering-created uncertainty       0
evidence lineages                  10
evidence events                    13
evidence artifact relations        26
```

## Qualification-evidence checks

The following authority-manifest-pinned qualification blobs were re-read from canonical state and matched exactly:

- frozen OpenRouter cold report;
- frozen mechanical cold score;
- cold discrepancy adjudication;
- qualified 1.1 INCOMPLETE_SCOPE bridge;
- final 1.1 qualification review.

No frozen cold evidence was rewritten after integration.

## Historical preservation

The post-merge audit rechecked these authority 1.0 historical blobs and found them unchanged:

- `CONNECT4_LOGIC_AUTHORITY_1_0.md`;
- `CONNECT4_LOGIC_AUTHORITY_1_0.isg`;
- `CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_0.json`;
- `docs/decisions/2026-09-18-isograph-logic-authority.md`.

## Claim/status disposition

No canonical claim record changed during qualification, promotion, routing repair, or cleanup.

No claim ID was added or duplicated. No hypothesis, candidate rule, missing law, open question, empirical result, unknown evidence-independence relation, or correlated reproduction was promoted to theorem/correctness authority.

The canonical claim blob remains exactly the blob already qualified in authority 1.0 and pinned again by authority 1.1.

## Cleanup

Completed Connect4 one-shot 1.1 Actions workflows and request trigger files were removed before integration; their run IDs and frozen evidence remain recorded in qualification artifacts.

The OX control-plane one-shot OpenRouter trigger was retired after promotion:

- workflow removal commit: `5041009271a09313d49bcbd00caac350564ead69`;
- request removal commit: `bffff6e2bbf3d3ffa97c0fd8bb4c2d314dce6011`.

The reusable cold runner remains available for provenance/reproduction; the removed trigger cannot launch another 1.1 cold call.

Temporary qualification refs had no unique semantic/evidence artifacts remaining:

- Connect4 `work/isograph-logic-authority-1-1-rebuild-20260918` old head `537cc191538c1c763f9f6647b7a04d7c945feac0`;
- IsoGraph `work/connect4-isograph-qualification-1-1-20260918` old head `81277ffb7861cec7172ba5b85476ebf5f37874b6`;
- IsoGraph `work/connect4-isograph-qualification-20260918` old head `caeec6031c5b79f805cbc5c99b304734288677e1`.

The Connect4 temporary ref was reset to the canonical research head. Both IsoGraph temporary refs were reset to IsoGraph `main` at `4d2063aa32b20ad2666aa56ee82fee09f4db83a0`. Their discarded differences were only one-shot workflow/request scaffolding, not qualification evidence.

## Final post-merge disposition

The canonical research branch is internally routed to authority 1.1; the authority/candidate/evidence identities are intact; authority 1.0 is preserved unchanged; temporary qualification machinery has no remaining unique authority/evidence state; and no semantic candidate mutation or fresh cold call was introduced during promotion.

**POST_MERGE_RESEARCH_INTEGRITY = PASS**
