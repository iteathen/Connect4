# Independent trained-carrier revalidation

All **4,486,550 reachable states** agree statewise with the frozen legacy
comparator. Every exported field matched: state identity/support/rank,
terminal classification/winner, absolute WDL, T2, q, RFG, exact component
multisets, and ROLE_CAPPAR/ZOE signatures. No missing or extra states occurred.

| Trained carrier | Reachable states | Structural classes | Lower rank | Left nullity | OOO image rank |
|---|---:|---:|---:|---:|---:|
| 6x3-k3 | 692,970 | 16,732 | 16,657 | 75 | 75 |
| 4x5-k4 | 1,706,255 | 79,309 | 78,938 | 371 | 294 |
| 6x3-k4 | 2,087,325 | 17,550 | 17,534 | 16 | 16 |

OOO agreement compares complete canonical descriptor-text columns and reduced
row-echelon entries, not merely rank or matching hashes. Original reference
dependency hashes, canonical image hashes, exact source/config identities and
artifact hashes are in `INDEPENDENT_RESULTS.json` and each case's
`independent-comparison.json`. Regenerate the aggregate with
`node research/isograph/discovery/2026-09-30-isomax-revalidation/independent-results.mjs`.

The independent implementation uses ternary BFS, physical run scanning,
recursive negamax, set-based antichains, bipartite slot matching, graph
flood-fill components, inverse-permutation certificates, and BigInt
least-pivot OOO elimination. It imports no legacy research implementation.
The comparison driver deliberately imports the reference adapter. Reading
the reference definitions and serialization conventions means this is
independent implementation evidence, not blind mathematical rediscovery.

The F prose/implementation mismatch is resolved by SEMANTIC_ERRATA_0_1.md;
the implemented contract removes the opponent family. Exhaustive agreement
does not prove RFG generally correct or promote the late algebra to authority.
RS096 remains HOLD, OOO remains provisional, and no new discovery is claimed.
Only the three trained carriers and explicit tiny toys were executed. Both
formula holdouts remain sealed. This oracle's new code has not been qualified
as a native IsoGraph primitive-closure package; the result establishes only the
bounded observational comparison stated here.

Eight toy/I/O tests passed. Two transient Windows checkpoint-rename failures
were preserved and repaired with bounded atomic-rename retry; the subsequent
complete 4x5-k4 and 6x3-k4 runs succeeded. The completed 6x3-k3 result remains
pinned to its original source; no checkpoint identity was silently migrated.
See INDEPENDENT_IO_RESTART.md for the interruption and recovery record.

Keep compact result/config/manifest evidence in the durable owner. Compressed
state shards and binary rank/value checkpoints remain local resumable evidence
identified by their manifests; their absence from a clean checkout does not
change the recorded coverage, but replay requires regenerating them.
