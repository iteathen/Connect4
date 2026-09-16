# Native two-word local relational key

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

## Assessment and derivation

The owner proposed making identity directly suitable for lookup rather than
deriving another identity. Read the actual local state pool, reservation owner,
semantic identity contract, prior address investigation, AGENT_LOCAL and
C4-0001/0006/0010. Local HEAD is
`0317c1c95eeae2e6b3e60040eed57198f4f5f9eb`, with existing uncommitted changes retained.

The local canonical triple is support index plus two canonical residual-class
IDs. Given frozen owner capacities, concatenation is injective:

```text
key = support | (P0class << supportBits)
              | (P1class << (supportBits + classBits))
```

This expression specifies mathematical bit concatenation. The executable uses
two Uint32 words and initialization-selected shifts, not runtime BigInt.
Depth 8's current reservation needs 20+20+20=60 bits; the recent depth-21
reservation needs 20+22+22=64. Other geometries and capacities derive their own
widths; larger totals are rejected by this prototype. No player-to-move field
is added, since support rank already determines it.

The identity is exact within its residual-class owner. Packing does not turn
independently assigned worker-local IDs into shared semantic identity. Shared
TT content comparison and generation lifecycle remain unchanged. The existing
slot64 residual chunk is already represented by two exact mask words.

## Execution and qualification

Implemented isolated replacement-layout prototypes in the evidence directories,
without changing production storage. Each process ran the normal empty 7-column,
6-row connect-4 depth-8 search, then built its lookup corpus after search ended.
All result, search, proof, descriptor and operation counters match the prior
qualified final depth-8 reference exactly: 4,777,115 calls and 221,398 local states.
The horizon result remains unresolved, not an exact draw.

26,144 independent BigInt-oracle checks cover every fitting support/class bit-width
regime, zero-width fields, split-word fields, high signed bits and Uint32 maxima.
Overflow layouts and invalid value domains fail. Every observed state's packed
key matches independent bit concatenation; every lookup returns its exact prior
state ID. Collision chains use both complete words, never bucket equality.

Uniform shuffled successful queries are repeated 16 times, 3,542,368 per measured
batch. Tables have the same 1,048,576 slots. Production triple hashing is copied
exactly; the pair uses `mix32(lo ^ imul(hi, 0x9e3779b1))` only for addressing.
Widths, arrays and query order are prepared before timing. Reporting is after
timing. Measured batch-function times are linked to their source entry lines.
Separate CPU profiles were attempted, but V8 attributed the work to the enclosing
module with unknown line number. These profiles do not establish individual hot-line
costs; the attribution failure is retained explicitly in the report.

| Second experiment, symmetric order | Mean elapsed ms | Mean CPU ms |
|---|---:|---:|
| Current triple representation and hash | 98.218 | 101.5 |
| Repack triple into two words on every query | 147.864 | 140.5 |
| Read identity natively as two words | 80.554 | 86.0 |

Native lookup is 18.0% faster in this isolated measurement. Repacking is slower.
The first experiment independently observed the repacking regression (137.691
versus 100.917 ms). Results are preserved, not replaced by the improved candidate.
Triple lookup takes 4,018,592 probes per batch and pair lookup 4,018,624: the
native gain does not come from materially fewer collisions in this corpus.
Candidate payload is eight bytes per state versus twelve, a one-third reduction
in key storage only. Table/edge/proof/residual storage is excluded from that saving.

Both child processes exited successfully, in 2.677 and 3.272 seconds respectively,
each under its 60-second hard timeout. No full root was launched.

## Review and integration decision

This qualifies the exact layout and a promising lookup primitive. It is not an
integrated solver speedup: query frequency is uniform, insertions are not timed,
and the representation and bucket mixer changed together. Two measured repetitions
per variant are indicative, not a statistically established speed guarantee.

Production transitions, tactical detection, frontier ordering and descriptors
currently consume separate support/P0/P1 arrays. Replacing those arrays requires
measuring extraction from packed words at these consumers and including candidate
construction during state interning. Keeping both layouts would duplicate state
storage and is rejected as the integration design. Repacking each query is also
rejected by these measurements. Wider valid configurations must retain an exact
representation; the engine's supported domain must not be narrowed to fit 64 bits.

Production source is therefore unchanged. The next owner is the local state pool
and its field consumers as one integrated representation change, followed by the
normal identical-counter bounded comparison. Shared TT compression requires a
separate cross-worker canonical-content design; this experiment does not provide it.

## Evidence

- [Initial repacking runner and results](evidence/2026-09-12-packed-relational-key/results.json)
- [Native runner](evidence/2026-09-12-native-relational-key/run.mjs)
- [Native results](evidence/2026-09-12-native-relational-key/results.json)
- [Function timing and sampling limitation](evidence/2026-09-12-native-relational-key/line-samples.md)
- [Native lifecycle](evidence/2026-09-12-native-relational-key/lifecycle.json)

Both directories include CPU profiles, engine source hashes and runner hashes.
Source hashes were compared before and after execution. Current-state routing and
the audit ledger were updated; no protected-main/ref/workflow mutation occurred.
