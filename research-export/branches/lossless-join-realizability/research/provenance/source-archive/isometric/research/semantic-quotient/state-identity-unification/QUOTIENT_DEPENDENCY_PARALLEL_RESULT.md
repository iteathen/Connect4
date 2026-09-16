# Dependency-aware parallel quotient Negamax — result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Solver authority:** `docs/specs/C4-0010-quotient-native-negamax-v1.md`  
**Status:** exact bounded-control result; online semantic-TT integration remains next

## Question

Can parallel quotient Negamax expose worker work only after alpha-beta dependencies are satisfied, rather than solving every shallow frontier state independently with a full exact window?

## Architecture tested

The unified Negamax owner now has a dependency-aware asynchronous execution form.

At each shallow split node it:

1. consumes existing shared proof bounds and tactical closure;
2. searches the preferred first child before exposing sibling work;
3. uses the resulting parent alpha to define sibling scout windows;
4. releases sibling `(state, alpha, beta)` proof obligations to persistent workers;
5. re-searches a sibling only if its scout result actually improves alpha without cutting off;
6. publishes proof facts through the same monotone shared proof store.

The worker executor dynamically schedules windowed state tasks by measured shallow work priority. Epochs explicitly drain outstanding worker work before proof-arena reset or worker shutdown.

This campaign used the complete 4x5 quotient graph only as the bounded state-space control. It did not change quotient or proof semantics.

## Qualification

Workflow run: `34664541848`  
Job: `103473690626`  
Conclusion: **success**

Every tested split-depth / worker-count combination reproduced:

```text
root W/D/L: 0
root actions: [0, 0, 0, 0]
```

Tested:

```text
split depths: 2, 3, 4
search workers: 1, 2, 3, 4
repetitions: 5
```

## Baseline

Ordinary shared-proof single-thread root Negamax:

```text
median elapsed: 7.132945 ms
expanded:       10,530
calls:          19,083
```

Timing is hosted-run evidence and should not be treated as a stable machine-independent ratio. Proof-work counts are the stronger structural comparison.

## Dependency-aware results

| workers | depth | median ms | median expanded |
| ---: | ---: | ---: | ---: |
| 1 | 2 | 3.009732 | **10,530** |
| 1 | 3 | 3.876704 | 10,533 |
| 1 | 4 | 6.055640 | 11,525 |
| 2 | 2 | 4.096885 | 15,581 |
| 2 | 3 | **2.898753** | 15,596 |
| 2 | 4 | 6.386910 | 16,787 |
| 3 | 2 | 6.977672 | 16,204 |
| 3 | 3 | 7.094549 | 15,557 |
| 3 | 4 | 4.097085 | 14,659 |
| 4 | 2 | 13.797675 | 21,390 |
| 4 | 3 | 5.333330 | 17,437 |
| 4 | 4 | 6.130805 | 17,198 |

All bounded configurations reported zero full-window re-searches after sibling scout work.

## Main finding

The one-worker depth-2 form expanded **exactly the same 10,530 states as ordinary Negamax**.

That is the decisive semantic result. The earlier static full-window frontier scheduler expanded roughly 65,000 states on the same bounded problem because it discarded alpha-beta parent dependencies. The dependency-aware formulation restores ordinary proof-work behavior when concurrency is removed.

Therefore:

```text
parallel work tree
!= arbitrary frontier fanout

parallel work tree
= ordinary Negamax dependencies
  + coarse independent proof obligations exposed after those dependencies are satisfied
```

## Parallel tradeoff

With multiple workers, aggregate proof work rises because concurrent scout searches cannot all benefit immediately from sibling discoveries that a serial search would see first.

This is the expected parallel alpha-beta tradeoff rather than the earlier architectural failure:

```text
baseline:               10,530 expansions
1 worker depth 2:       10,530
2 workers depth 3:      15,596
old static frontier:   ~65,000
```

The bounded wall-clock winner was 2 workers at depth 3 (`2.898753 ms` median), but no fixed worker count or depth is promoted from this small control. Larger boards are expected to expose more useful parallel slack and amortize scheduling overhead more effectively.

## Interpretation

The result supports C4-0010's dependency-aware parallel shape:

```text
preferred child
  -> establish parent bound
  -> release sibling scout obligations
  -> shared proof reuse
  -> re-search only when required
```

It also supports initialization/presearch profiling rather than fixed constants. Worker count and split depth affect both elapsed time and duplicate proof work, and the optimum changes with workload shape.

## Remaining limitation

The current successful campaign uses stable q-state IDs from the complete bounded 4x5 graph. The production direction uses worker-local quotient IDs and exact semantic-content shared proof identity.

The next experiment therefore applies the same dependency-aware alpha/beta obligations to the already-qualified online semantic-TT worker architecture:

```text
shallow planner state / representative path
  -> worker-local quotient replay
  -> search(path, alpha, beta)
  -> exact semantic shared TT
```

Recursive worker search must continue to require neither a complete global qID graph nor per-node maintenance RPC.
