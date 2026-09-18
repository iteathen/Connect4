# Relational identity, neutral capacity and repeated proof work

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

## Question and governing relation

The owner proposed that excessive search may come from duplicate work, missing
pruning, or failure to abstract irrelevant stone distinctions as neutral tokens.
Board-centred transformations can recreate distinctions that the remaining-game
relation has already erased. Preserve relational proof/work identity and use
physical addresses to map legal inputs and returned actions, rather than making
physical history authoritative again.

Read actual source at `85c36c4b1dc404ece30e537b0d98e2d789c455a2`, C4-0010,
C4-0006, the minimum-description/MQ2 research, and the owner's
[win-space discussion](2026-09-09-win-space-representation-discussion.md).
The [DEAD research](2026-09-09-strategic-candidate-theory-state-proof.md#14-dead--deadneutral-physical-choice-equivalence)
already distinguishes collapsing equivalent filler choices from deleting tempo.
This is continuation of that research, not a new conventional search design.

## Actual engine representation

The online worker constructs the slot64 residual kernel and semantic adapter.
Its exact state is support plus canonical P0/P1 residual requirement classes.
Shared descriptors materialize exact residual terms, not coloured bitboards.
Residual chunk/singleton masks encode requirement relationships; live-line masks
carry advisory incidence counts. Paths replay legal structural transitions.
No traditional coloured-bitboard engine was found in this active path.

Different coloured histories already merge when their support and residuals
match. Blocked lines stay removed; antichain normalization absorbs redundant
same-player requirements. Bilateral residual exhaustion returns draw without
enumerating the remaining filler moves. These existing mechanisms are retained.

However, the exact key still contains the full physical support index. The
terminal shortcut does not itself canonicalize different distributions of
neutral capacity. A relational substrate alone is not proof that all removable
distinctions have been eliminated.

## Bounded neutral-capacity census

The new `quotient-neutral-capacity-diagnostic.mjs` builds the complete active
quotient graph for four small variable geometries. It is an allocating research
observer, never a production identity provider or hot-loop optimization.

For each state it computes the union of both players' canonical residual terms.
A column containing no remaining requirement cell supplies only neutral turns.
The diagnostic key retains both exact residual classes, every relevant column's
height, and the total remaining capacity of wholly irrelevant columns. It pools
those columns' capacity, preserving consumed turns rather than assigning their
moves draw values. A gap below a relevant event is outside this reduction.

Every merged group must have identical mapped successors: each relevant column
retains its action label; all available neutral columns map to one neutral action
and the same successor key. WDL is also checked using the complete unpruned
quotient DAG. This is bounded mapped-transition equivalence, not just equal root
values or physical-column-labelled equivalence. Existing independent physical
campaigns qualify the underlying graph; this observer is not a second independent
physical oracle.

| Geometry | Current quotient states | Extra states merged | Extra unresolved states merged | Additional equivalent physical actions visited in root search |
|---|---:|---:|---:|---:|
| 4×3 connect-3 | 3,735 | 65 | 0 | 0 |
| 4×4 connect-4 | 34,095 | 1,174 | 422 | 8 |
| 5×3 connect-4 | 11,317 | 981 | 362 | 0 |
| 4×5 connect-4 | 294,593 | 4,431 | 1,727 | 37 |

All mapped-transition and WDL comparisons pass. Unresolved here means no tactical
immediate/forced/closed classification and no exact structural draw; it includes
side-dependent bounds that do not close every obligation. The last column counts
distinct additional neutral column choices observed at the same parent over the
whole solve. It is not a count of avoidable nodes or necessarily the same window.

Example: 4×4, zero-based path `[1,0,3,1,1,2,2,2]` has two wholly neutral remaining
columns, 1 and 2. Their moves leave exactly the same P0/P1 residual classes and
the same pooled neutral capacity, but the active engine assigns children 13196
and 13244 distinct identities. Both moves have loss value from the mover's
perspective. They are equivalent neutral actions, not separate draw outcomes.
The example uses local IDs only as diagnostic labels, not shared semantic keys.

The 4×5 whole-graph reduction is approximately 1.5%; applicability is uneven.
This narrow neutral-column reduction is a real missing compression opportunity,
but does not yet explain the failed standard-root search volume. More general
support/event equivalence and residual automorphisms remain separate research.

## Repeated proof work and pruning

The existing proof-reuse observer was rerun locally on the current source with
response closure enabled. On 4×5, reducing shared TT capacity from 65,536 to
4,096 entries changed:

- calls: 23,527 → 27,695;
- expansions: 10,756 → 12,791;
- observed misses after earlier publication: 0 → 2,587;
- descriptor replacements: 0 → 10,937.

That is direct evidence of additional work under replacement pressure. A miss
after publication is not proof that the old bound would answer the new window.
Repeated visits can be legitimate stronger-window requests. Both capacities reuse
a warm exact root in one call and zero expansions. This does not establish that
concurrent overlapping worker obligations are coalesced or quantify duplication
in the full root.

The existing independent pruning campaign on this production source passes its
window/publication checks against 1,529,805 physical states and verifies active
TT returns, tactical closure, structural bounds and forced macros. There is no
bounded evidence that pruning has stopped functioning. Missing stronger relational
closure remains distinct from failure of an implemented pruning rule.

The current independent 4×5 ablation provides a concrete check: the exact search
without TT/local structural closure takes 1,066,517 calls; adding TT reduces that
to 48,565; local closure plus frontier ordering reduces it to 23,527. These are
matched bounded calls, not standard-root counts or proof that every available
relational reduction is implemented.

## Decision, qualification and next owner

Preserve the [neutral census](evidence/2026-09-12-relational-duplication/neutral-capacity.json)
and [proof-reuse observations](evidence/2026-09-12-relational-duplication/proof-reuse.json).
No production policy or identity changed in this unit. The initial diagnostic
adapter incorrectly assumed the kernel exported `rankAt`; it failed before
search and was corrected to use the public support-access boundary. This was a
harness construction error, not an engine-result regression. The completed
observer checks all mapped transitions and WDL, and its production search returns
the unpruned graph's root values. No timing claim is made. The bounded workflow
now routes and executes this observer with its existing dependency coverage.

Next: derive a cheap incremental neutral-event relation from canonical residual
ownership, including newly irrelevant columns, capacity consumption and physical
action mapping. Do not ship these diagnostic unions, strings, Maps or graph census
inside the search loop. Qualification must include odd/even dimensions, relevant
cells above gaps, terminal precedence, proof hints under remapped actions and
independent late-standard-board controls. Measure total work including maintenance
cost. Separately measure in-flight overlap and eviction-driven repeated proofs.
No full standard root was run or triggered.
