# Search volume and structural closure reassessment

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

## Assessment and research

The user's comparison with published Connect Four solves changes the next
investigation priority: establish why proof work is necessary or repeated before
treating node throughput or worker utilization as the dominant cause. This does
not undo the qualified lifecycle repairs or pending hot-loop changes.

Primary published comparisons inspected on 2026-09-12:

- [Tromp's Fhourstones 3.1](https://tromp.github.io/c4/fhour.html): empty-board
  W/D/L solve, 1,479,113,766 searched positions; the three eight-ply fixtures use
  51,596, 8,716,732 and 169,704,432 positions. These are distinct inputs.
- [Kite's empty-board benchmark](https://github.com/tristan852/kite#-empty-board-benchmark):
  version 1.8.1 reports 233,863,140 Negamax invocations, opening book disabled and
  TT cleared. Its documentation distinguishes this from its later mixed-position
  benchmark. This is author-reported evidence, not a locally reproduced result.

Neither mixed-position averages nor opening-book lookups are an empty-root
search count. Nor are TT replacements, residual writes or retained state capacity
counts equivalent to Negamax invocations.

## Actual failed-run counters

Run 34693275092, revision 9e93018f06ca8a3f1fd2c012fb7ea4aa39b07775,
ended at the 30-minute job limit without a root result. The last progress sample
at 1,800,727.937089 ms reports:

- workerExpanded: 171,561,248;
- completed tasks: 5; active tasks: 3; submitted tasks: 19;
- shared TT replacements: 368,162,311;
- RSS: 11,703,025,664 bytes.

Source inspection of quotient-negamax-engine.mjs runLeaf confirms workerExpanded
is accumulated only after a leaf task returns. Its deep expanded counter excludes
TT/tactical/bound returns and forced transit iterations. Active tasks are absent
from that aggregate. Therefore the run does not establish a total invocation
count or an apples-to-apples ratio against either published solver. In particular,
171.6 million must not be presented as the whole failed search. Replacement count
demonstrates churn, but does not measure how many evicted proofs were recomputed.

## Structural invariant and implementation gap

C4-0006 and the universal strategic algebra define residual winning requirements
and certified blockers in the same WSL universe. For jointly valid blockers B:

```text
Solved(B) = union of Up[b] for b in B
remaining = activeRequirements & ~Solved(B)
remaining == 0 => certified no-win for that player within the certificate's scope
```

CPC and NDC own certification, compatibility, response resources and event/race
deadlines. Eventual ownership alone is insufficient. The coverage operation is
shared; named strategic rules are ways of establishing premises. An empty
requirement member signifies completion; an empty requirement family signifies
no remaining win. One-sided no-win is not a forced loss. Bilateral no-win yields
a draw under the no-earlier-win convention; winning certificates must establish
completion before the opponent's terminal deadline.

The actual slot64 frontierBoundCode tests physical residual-class emptiness.
The substrate tacticalCode recognizes playable singleton wins/threats and forced
responses. The active import path has no complete CPC/NDC strategic certificate
closure feeding those bounds. C4-0010 explicitly distinguishes its local cases
from the complete strategic language. This is a confirmed integration gap;
its contribution to standard-root search volume is not yet measured.

Independent physical-terminal checks with zero mismatches qualify the local
terminal predicates. They do not demonstrate that the engine recognizes every
research-certified future terminal proposition before branching.

## Reassessment, plan and limits

Next owner: structural closure coverage and repeated proof work, ahead of further
throughput tuning. Use bounded research-certified fixtures to compare closure
facts with the active frontier result and count unresolved decisions. Measure
invocations, expanded decisions, forced transit, closure returns and proof reuse
separately on identical inputs and windows, with explicit cold/warm TT policy.
Live reporting must include running workers through a bounded asynchronous
handoff; its absence must never appear as zero work.

No new full root was launched, no strategic implication was invented, and no
solver semantics were changed by this reassessment. Pending local source changes
remain a separate, uncommitted qualification packet. The old completed source
audit is not evidence that the full research closure has been implemented.
