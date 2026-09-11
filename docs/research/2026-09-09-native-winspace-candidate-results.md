# Native win-space negamax: candidate results

Date: 2026-09-09. Status: research only; no maintained-source promotion.

## Result

The user's proposed representation is implemented: recursive search carries live
winning conditions and legal frontiers, not either player's stone-color bitboard.
A compact version reduced nodes on two seeded ordinary cohorts and a pre-existing
structural cohort. It is not yet a general elapsed-time improvement. The first
ordinary cohort improved 5.3%; a fresh post-freeze cohort regressed 6.6% despite
20.6% fewer nodes. The broader negative results are retained below.

## Exact source and scope

Remote starting research head: bdf16764e16325fceb36509b43809b326d17bfdd.
Main read before work: de47d43f4f4133a68973d0876a402531ef5735da.
Unchanged shared-kernel input Git blob: 965c3806c92a7add544dce4777d965b3e12376d6.
Its mounted source bytes were checked against that blob before execution.
Existing organic packet supplies the owned cold geometry/cell-array oracle and
54 structural cases. Those cases predate the new implementation. This work does
not claim to have rerun the prior packet's expensive independent stress oracle.

This is a new search representation, not another shared-TT partition experiment.
Negamax, exact distance-sensitive scoring, tactical elimination, and threat-union
move ordering are retained. No Monte Carlo, new scheduler, live descriptor
routing, neutral-column branch collapse, or per-node cleanup policy was added.

## Candidates actually executed

1. Raw line state: 69 fixed geometric goal IDs, live-goal masks for both sides.
2. Root-compiled state: eliminate blocked goals, remove same-player supersets,
   merge identical remaining requirements, and use a smaller goal dictionary.
3. Cold specialization: unroll the dictionary's one, two, or three word groups.
4. Dense root-context identity: retain private-goal ownership in the immutable
   root program instead of redundantly encoding it in every cache record.

Recursive state includes packed column heights, two live-goal masks, bit-sliced
empty-count planes, and two cached words describing which cells are empty.
Those last two words ARE occupancy bitboards, retained as a fast derivative of
the legal frontiers. The claim is no recursive stone-COLOR board, not no bitwise
board geometry. Static goal masks map requirements back to board-cell addresses.

A placement clears the opponent's incident live goals and decrements the empty
counts of incident goals in parallel. A public-root immediate-win check preserves
the internal negamax precondition. Once neither player has a live goal, the
position returns zero without enumerating remaining filler continuations.
Unresolved or merely contested goals are never declared draws by default.

The root compiler removes duplicates and supersets once. It does NOT implement
full dynamic minimal-requirement canonicalization at every descendant. The cache
key is root-program-local; caches are cleared before a different program is bound.
No cross-root or cross-program TT reuse has been qualified.

## Structural encoding improvement

An initially private goal can only remain alive for its original owner or die.
Its owner therefore need not be stored twice. Initially shared goals are sorted
first. Cache records store the union of live goals and the current player's
ownership bits for shared goals. Eleven such bits fit above the 21 height bits.
Extra shared-ownership words are used when needed; no artificial <=11 domain cap.
If an initially shared goal is untouched, the frontiers identify that both sides
still own its possibility. Once touched, its ownership cannot remain shared.
This permits exact reconstruction, not probabilistic fingerprinting.

Raw records use 34 bytes. Compiled records initially used 18/26/34 bytes. Dense
records use 14 bytes throughout the 54-case structural cohort, and 22 bytes on
the two early anchors. The empty-root maximum is supported with more words.
All record figures include the inherited control word, bound byte, and writer tag.

## Fair comparison and limits

One worker, Linux x64, Node v22.16.0, AMD EPYC 9V74; reported parallelism 4.
TT budgets: 1,835,008 bytes for ordinary/structural cohorts; 7,340,032 for anchors.
Native variants allocate one fixed SAB arena and rebind typed views at roots;
there is no backing-store growth in recursive search. Baseline uses its original
fixed arrays. Native records use floor(budget / recordBytes) exact entries.
An arbitrary-size modulo control was included beside the unchanged bitmask
baseline, but the final comparisons use the faster original baseline.

These are equal TT-byte budgets, not identical entire-process memory footprints.
Native typed scratch/static arrays total 6,295 bytes versus baseline 2,709, a
3,586-byte difference. JS compiler objects and generated-code overhead are not
included in those typed-byte figures. Compile and cache-clear time IS included
in the confirmation; initial backing allocation, input parsing, and warmup are not.

The ordinary cohort is 24 newly seeded survivor-rollout positions: four successful
rollouts at each occupancy 14/18/22/26/30/34, with no candidate-speed selection.
This is not a representative human-game distribution. Three positions account
for 99.3% of its baseline nodes; one accounts for 75.5%.
The 54-case priorStructural cohort was deliberately favorable to a different,
earlier neutral-space experiment. It is exploratory and not fresh holdout data.
The two anchors are 663152175 (-4) and 41267575 (+3).

After finalizing the candidate, one fresh 24-position cohort used seed 197cdf42,
the same occupancy strata, and no timing-based selection. No candidate changes
followed that holdout result. Ordinary/anchor expected values are baseline
agreement, not independent early-game solving evidence.

## Paired confirmation, seven repetitions

Each number is the median time for a complete cohort, with a cold table at each
root, including root compilation and clearing. Order alternates between pairs.
All samples, including slower baseline and candidate runs, are retained.

| Cohort | Baseline ms | Dense ms | Time outcome | Baseline nodes | Dense nodes | Dense paired wins |
|---|---:|---:|---|---:|---:|---:|
| Ordinary, 24 | 127.381413 | 120.624651 | 5.3% faster | 850,321 | 739,382 | 6/7 |
| Fresh holdout, 24 | 56.885215 | 60.655048 | 6.6% slower | 371,612 | 295,062 | 3/7 |
| Prior structural, 54 | 19.148752 | 22.497699 | 17.5% slower | 112,174 | 79,510 | 2/7 |
| Both early anchors | 1,332.161513 | 1,419.315461 | 6.5% slower | 6,950,040 | 7,025,129 | 1/7 |

Node reductions are 13.0%, 20.6%, and 29.1% respectively for the first three
cohorts. Anchor nodes increase 1.1%. There is no universal speedup claim and no
statistical-significance claim from seven pairs. Per-case exploratory matrices
also retain the raw, compiled, specialized, and modulo-control regressions.
Kernel-only savings on structural cases did not repay per-root compilation.
Specialization itself was not consistently faster than the generic compiled case.

## Correctness and causal qualification

- 96 independent late-game roots plus 30 nonterminal child roots; four native
  variants compared with a cell-array oracle and the unchanged solver.
- 608 valid internal null-window bound checks across the native variants.
  152 returned sound bounds different from the exact value: that is expected,
  not a mismatch. Internal entry excludes a current-player immediate win.
- Exhaustive 4x3 connect-three analysis: 4,659 nonterminal physical states,
  11,818 transitions. Raw line signatures produce 4,499 classes; fully reduced
  remaining requirements produce 3,735. Equal signatures have equal legal
  transition signatures and exact values. This checks the semantic abstraction
  on a small game; it does not mean the 7x6 kernel achieves full dynamic reduction.
- 5,497 exact dense-key reconstruction checks over continuations from 614 legal
  roots, covering 1/2/3-word dictionaries and up to 69 shared goals. The same
  preallocated arena survived all program rebindings.
- A no-TT ablation on all 54 structural cases reproduced EXACTLY 427,569 nodes in
  both the original kernel and native kernel with exhaustion draws disabled.
  This checks tactical and ordering parity on that cohort. Enabling structural
  exhaustion reduced it to 405,739 nodes, with 14,870 early draw stops. Thus some
  saved work is demonstrably independent of hashing and TT replacement luck.

The native state/key changes also alter hashing and collision patterns. Do not
attribute every TT-enabled node reduction solely to semantic equivalence.
No concurrent-publication qualification, Windows result, GPU result, complete
empty-board solve, or custom-evaluator equivalence is claimed.

## Corrections retained, rather than hidden

Two early harness reads misunderstood the prior stress-corpus schema and failed
before measurements. A timing tool budget interrupted one exploratory matrix;
its partial rows remain. An early metadata spread overwrote the compiledFast label
with compiled; those rows are excluded from final claims and preserved with the
source that produced them. The first prototype allocated backing arrays on shape
changes; the corrected version uses one fixed arena and was requalified.

Remote byte verification caught a missing closing brace during manual UTF-8
transport of dense_solver.mjs. The defective preview was never installed as a
branch head; the executed local source was unchanged. Corrected remote blobs are
checked against executed-source identities before branch advancement.

## Reproduction and preservation

From repository root:

```sh
node reference/research-prototypes/2026-09-09-winspace-native/qualify_dense.mjs
node reference/research-prototypes/2026-09-09-winspace-native/dense_key_check.mjs
node reference/research-prototypes/2026-09-09-winspace-native/restore_evidence.mjs
node reference/research-prototypes/2026-09-09-winspace-native/replay.mjs --validate-input
node reference/research-prototypes/2026-09-09-winspace-native/replay.mjs
node reference/research-prototypes/2026-09-09-winspace-native/holdout.mjs
```

replay.mjs changes only the confirmation's input-loading step: it reads frozen
TSV rather than constructing the same cases from exploratory JSONL. Its measured
batch body is unchanged. The original capture harness is retained in the packet.
Replay input validation passed; no claim is made that every replay timing will
match these sandbox samples. A replay writes replay.jsonl, not the preserved data.

confirmation.tsv and confirmation-corpus.tsv are small UTF-8 encodings. Restore
checks byte-for-byte SHA-256 identities of the original 10,834-byte JSONL and
12,174-byte corpus. The fresh holdout is preserved directly as UTF-8 JSONL.
Core sources, qualification entry points, complete paired confirmation records,
holdout, and this report are repository-preserved. The attached complete packet
additionally contains every exploratory matrix, qualification stdout, failed
version, capture harness, source manifest, and original pinned baseline bytes.
Those larger exploratory dumps are not all uploaded individually to the repo.

## Disposition and next meaningful seam

Keep the compact native representation as a research candidate, not as the new
baseline. The abstraction removes real historical distinctions and can terminate
exhausted draw regions. That is a positive structural result. Its per-access and
compilation costs still prevent a broad elapsed-time win.

The next useful boundary is cheaper win-space queries and compilation reuse, or
selective root/task use with a separately qualified selector. Do not respond to
this result by adding a dependency allocator or moving back to full color-state
search while calling it the same experiment. Do not tune against the fresh
holdout and continue calling it untouched. Dynamic requirement merging and
cross-program proof reuse remain separate, unimplemented ideas.
