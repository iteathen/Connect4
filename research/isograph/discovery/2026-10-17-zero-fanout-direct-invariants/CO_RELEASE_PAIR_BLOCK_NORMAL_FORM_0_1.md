# Deductive source matching normal form for co-release defender-pair certificates

**Date:** 2026-10-17 Pacific. **Research owner:** research/semantic-quotient. **Status:** source structural sufficient theorem and experiment design, NOT a Connect4 root WDL certificate.
**Parent frozen experiment:** `GUARDED_CO_RELEASE_STATIC_PAIRING_PLAN_0_1.md`.

## Local release law
At q, every remaining cell is an event in the gravity chain for its column. A defender responding second to attacker can guarantee a chosen paired cell mate is playable after attacker's first-touch if the two cells are (a) consecutive vertical in one column, lower-first, or (b) on two columns whose immediately preceding events are in the SAME already completed pair (or both current initial events). This makes the cross-pair cells available simultaneously regardless of order of independent pair completions. Perfect pair coverage of all future cells and at least one full pair inside every original attacker residual win generator proves attacker can never first-win, by induction; no game continuation exploration in source certificate.

## Simple source block NORMAL FORM for a safe pairing family
A deterministic subset of such co-release pairings is specified by partitioning the nonfull SOURCE column set into blocks of size one or two:
- A single column c with even remaining capacity `m_c=H-h_c`: pair consecutive relative event ordinals (0,1),(2,3),... vertically.
- A TWO-column block {c,d} whose remaining capacities `m_c,m_d` have the SAME PARITY. Choose a prefix length `t` where `1<=t<=min(m_c,m_d)` and `m_c-t`, `m_d-t` are both EVEN. Pair each first t relative event ordinal `j` across columns:
    `(c,h_c+j)` with `(d,h_d+j)` for j=0,...,t-1.
  Then vertically pair each remaining tail in its own column, starting at relative event t. Because both predecessor events of each cross-pair j>0 belonged to the preceding common pair, the j-th pair co-releases. Vertical tail dominoes are response-safe after completion of their preceding common pair, even if one column exhausts earlier.

Different INITIAL source heights are permitted. A pair across columns (c,h_c+j) and (d,h_d+j) has EQUAL relative release index j but may differ in ABSOLUTE row by h_c-h_d. It may therefore cover original diagonal winning requirements which the previous same-absolute-row pairing missed.

The block representation uses a disjoint source-column partition with at most W=7 columns, chooses one finite prefix length per two-column block, and constructs one STATIC pairing *proof certificate*. It does NOT enumerate future moves or strategic policies. Checking all block partitions is static proof-witness discovery, charged separately from game semantic fanout (zero).

This is a mathematically sufficient family of source defensive pairings, not a claim that EVERY possible winning defender strategy has such a static certificate. Its favorable-case WDL bound is as in the parent plan.

## Frozen falsifiers
1. For every emitted pairing, independently verify exact event coverage (each future cell in exactly one pair), vertical cells consecutive and initially gravity-release ordered, cross pairs equal relative release ordinal within the same source block, chosen cross prefix contiguous from ordinal 0, vertical tails even and consecutive. Check each attacker source winning requirement contains BOTH cells of some paired block.
2. Independently enumerate all attacker first-touch legal future event choices on *small abstract chain profiles* and verify mate immediately playable whenever attacker is first to touch an incomplete pair, for every complete-pair-prefix state. A deliberately mutated cross pair at different RELATIVE release ordinals must FAIL.
3. Qualified full-WDL small-board reference controls for all distinct q, and source-per-first-action paired defensive bounds, in addition to original fixed equal-height source pair method to measure newly qualified source certificates.
4. Standard canonical `44444` (P1 to move, rank5; after first move 36 empty) must remain UNKNOWN if this static pairing family cannot produce a certified WDL bound. Different source column capacity/center fill guards must be preserved.

No solver runtime optimization, arbitrary subtree branching, source policy lookup, game-theory authority promotion or merge.
