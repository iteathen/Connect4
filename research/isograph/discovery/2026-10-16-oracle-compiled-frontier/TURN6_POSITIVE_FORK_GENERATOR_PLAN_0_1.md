# Positive P0-winning generator: guarded two-threat certificate

**2026-10-16, canonical owner:** `research/semantic-quotient`.

Following the exact all-seven turn-six P1 *three-P0-turn delay* certificate, do not keep adding depth to defensive reply enumeration. Return to the P0-winning objective by constructing one **local positive proof generator**.

## Candidate

After the legal sequence `444444273` (one-based), P1 is to move. P0 has bottom-row cells c2,c3,c4. Claim: immediate P0 winning landings c1 and c5 are both legal, while P1 has no immediate win. This should certify P0 victory in at most one subsequent P0 turn, independent of P1's next action. The claim is a **conjectured witness until independently checked**; it is not an oracle outcome input.

Verify by two independent methods: (a) exact residual winning requirements of P0/P1 and gravity frontier; (b) direct four-in-a-row geometry after every legal P1 action and legal P0 answer. No general game tree, and no solved WDL lookup.

## Backward obstacle

From `444444`, propose P0 first c2, P0 second c3. Enumerate only P1's intervening **six** available actions; identify which preserve the positive fork and which block it. The missing P0-winning predecessor obligation is P1's freedom to preempt either needed bottom threat or a P0 construction cell. Record an explicit reply and the exact failed guard, rather than expanding deeper.

## Budget

At most 50 locally generated physical positions and 500 local line/cofactor predicates. Fixed geometry and deterministic actions; no random seed, no oracle, no rank-shell compilation. Stop on a falsifier or complete six-response census. A successful positive generator **does not prove the proposed P0 two-move plan is forced**, and a failed plan does not disprove P0's eventual forced win.

## Next stage

Use the verified fork as one actual winning-region generator `m` (and its claimant-favorable upward closure at fixed support). Search for a **CPC/NDC guarded forcing condition** that prevents P1 from taking the three preemptive responses before the fork. Do not manufacture a win region by adding unverified descendants.
