# Frozen action-ROBDD order/width probe at 44444 k9

**Date:** 2026-10-16. **Owner:** research/semantic-quotient. **HEAD at freeze:** `84fbb6e59b122bae939f68b29abc21458dde3ce2`.
**Status:** PLAN; not a value proof.

A canonical ROBDD is exact for any fixed order but can have radically different sizes. The k8 action-QBF matrix compiles and projects after live-node compaction with both chronological/reverse action-bit orders under 60k nodes; independent physical k8 control agrees on all seven [-1,+1] action intervals, and 24 small-board complete optimal sets (13 singleton, 11 ties) were independently checked. At k9 source-QBF Boolean matrix compilation hits 60k under both tested orders, even when only source gates needed by the remaining DAG are retained. No game WDL conclusion or minimal-width lower bound follows.

## Question
Can purely structural, predeclared ordered decompositions expose smaller exact future Boolean cofactors at k9? Compare:
- chronological action blocks;
- reverse chronological;
- bit-plane grouping (same bit position across all turns);
- bit-plane grouping with reversed turn direction;
- player parity grouping (P0 turns before P1 or vice versa, without changing QBF quantifier prefix);
- one alternating chronological/reversed block ordering.
All variable orders are derived from original quantified action block identities before seeing game outcomes. A BDD variable order is only a representation order; quantifiers retain original chronology, and full first-action literal masks remain free.

The live-source gate GC carries all source nodes with future remaining uses, performs one canonical multi-root copy at safe source gate intervals, and charges old+copy nodes simultaneously to 60k. Test periodic GC schedules chosen *before* inspecting output values: default (15000 allocated nodes, every 40 source gates) and more frequent (8000/8) only after baseline fails; these are schedules, not larger resource caps.

## Falsifiers
1. Prove exact order permutation / owner-bit action transporter: BDD truth is invariant under variable-order permutation; do not reorder quantifier scopes. Test on 4x3/4x4 independent complete WDL/tie cases and the legal 223 adaptive response.
2. Under original 60,000 BDD nodes, 300,000 nontrivial APPLY/quantified operations, 10,000 support reps and 15 seconds per compile, compare k7/k8 action masks to already independent physical results and k9 compile/projection success or honest partials. Record source-stage failure, ops, live-source-root count and GC-copy work.
3. If no fixed order completes k9, preserve measured negative; canonicality for a fixed order does NOT imply compactness for all orders or a game-specific lower bound.

No policy oracle, searched future continuations, WDL assumptions, authority promotion or merge.
