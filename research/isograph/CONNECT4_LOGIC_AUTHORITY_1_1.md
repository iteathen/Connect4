# Connect4 IsoGraph Logic Authority 1.1

**Status:** qualified current logic authority  
**Effective date:** 2026-09-18  
**Authority manifest blob:** `986f10a0011059e4d19598de6c836272c102415d`  
**Frozen semantic candidate manifest blob:** `0b3c54f193b084e2e5dd2eb7f4fb641b1052491a`  
**Frozen candidate revision:** `f1afedf6900c3c5590a3e1210aa30210801f8d4e`  
**Frozen source corpus:** `aea692af800f524569ea1c2fda722087cd9bca39`

## Authority root

The immutable semantic authority is the file set pinned by:

`research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_1.json`

The native promotion record is:

`research/isograph/CONNECT4_LOGIC_AUTHORITY_1_1.isg`

The qualification review is:

`research/isograph/qualification/FINAL_QUALIFICATION_REVIEW_1_1.md`

The explicit successor decision is:

`docs/decisions/2026-09-18-isograph-logic-authority-1-1.md`

Authority 1.0 remains immutable historical qualification evidence. It is not edited or deleted.

## What 1.1 adds

Authority 1.1 replaces the manually bounded 1.0 representation with a role- and dependency-closed frozen corpus:

```text
corpus objects                       432
dependency edges                     568
missing dependency targets             0
native source images                 234
content-addressed-only objects       198
semantic items                    29,650
canonical claims                      74
INCOMPLETE_SCOPE records              31
rendering-created uncertainty          0
evidence lineages                     10
evidence events                       13
```

Evidence identity is first-class. Citation occurrence, artifact identity, evidence event, evidence lineage and independence group are distinct quantities. Unknown/correlated/reproduction relationships remain explicit rather than being converted into independent support.

## Reading order

1. this authority root;
2. `CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_1.json`;
3. `successor/CONNECT4_LOGIC_PROFILE_1_1_CANDIDATE.md` and the 1.1 native vocabulary;
4. `successor/generated/CONNECT4_LOGIC_CORPUS_1_1_CANDIDATE.isg`;
5. source-image/item shards, canonical claims, uncertainty and evidence-lineage records relevant to the question;
6. qualification evidence only when auditing fidelity/provenance.

The word `CANDIDATE` in manifest-pinned semantic filenames records their frozen pre-promotion identity. Promotion does not mutate those files; the qualified authority manifest and promotion decision confer authority on that exact frozen set.

## Uncertainty

The local qualified uncertainty interpretation is:

`research/isograph/qualification/CONNECT4_INCOMPLETE_SCOPE_BRIDGE_1_1.md`

Source-native uncertainty is authoritative as uncertainty. Missing laws, hypotheses, candidates and open questions are not silently completed. Rendering-created uncertainty is zero.

## Ownership

`research/semantic-quotient` remains the sole durable research owner. IsoGraph is the authoritative representation; solver branches remain implementation owners.

## Legacy views

Pre-IsoGraph Markdown/JSON/spec/claim material remains provenance and readability/compatibility bridge material. Where it appears to conflict with authority 1.1, audit the exact frozen source image and qualification provenance rather than silently preferring the legacy view.

A later authority revision must preserve both 1.0 and 1.1 immutably and pass a new explicit qualification/promotion cycle.
