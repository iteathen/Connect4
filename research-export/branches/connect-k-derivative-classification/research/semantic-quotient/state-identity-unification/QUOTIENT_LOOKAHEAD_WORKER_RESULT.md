# Quotient Lookahead Work-DAG Worker Tournament

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** qualified bounded-control scheduler result; full 7x6 optimum remains open  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Architecture

The dedup/cleanup worker owns a shallow exact quotient work DAG rather than handing search workers root branches blindly.

For a selected split depth `d` it:

1. expands the canonical quotient graph from the root through depth `d`;
2. closes immediate tactical W/L/D nodes locally;
3. follows only forced-response edges where tactical closure requires one move;
4. deduplicates every reached state by canonical qID;
5. retains parent dependency edges for exact bottom-up reduction;
6. estimates unresolved frontier cost with a bounded shallow probe;
7. sorts frontier qIDs by estimated work and fan-in;
8. dispatches only unresolved frontier qIDs to search workers;
9. reduces completed exact frontier values through the retained DAG to the root.

Search workers share the one-byte proof/TT arena. They never own canonical dedup or work-DAG lifecycle.

## Qualification

Workflow run: `34659160200`  
Job: `103457869443`  
Conclusion: **success**

Every tested combination reproduced the independently qualified 4x5 connect-4 exact result:

```text
root W/D/L: 0
root actions: [0, 0, 0, 0]
canonical q states: 294,593
residual classes: 69,707
```

Lookahead DAG shapes were:

```text
depth 2:  21 unique nodes,  16 frontier tasks,   0 transposed parents
depth 3:  73 unique nodes,  52 frontier tasks,  12 transposed parents
depth 4: 233 unique nodes, 160 frontier tasks,  60 transposed parents
depth 5: 673 unique nodes, 440 frontier tasks, 244 transposed parents
```

## Timing result on this bounded proxy

Median end-to-end task+reduction time:

```text
workers   depth 2    depth 3    depth 4    depth 5
1          6.391 ms   11.427 ms   20.257 ms   39.263 ms
2          6.127 ms    9.456 ms   15.539 ms   25.658 ms
3          4.070 ms    6.489 ms   11.959 ms   21.925 ms
4          4.312 ms   11.522 ms   12.810 ms   18.892 ms
```

The bounded-control winner was **3 search workers at depth 2**, median `4.070 ms`.

This does **not** supersede earlier depth-3/4 observations on larger/different workloads. The 4x5 control has only four columns and a shallow exact graph, so deeper work-DAG splitting creates more independently exact subproblems than the saved scheduling balance can justify.

## Worker-count interpretation

The runner reported four available logical lanes. Three search workers consistently beat four at the best shallow split. This is consistent with the intended role separation in which dedup/planning/cleanup consumes a separate execution lane rather than competing with search for the same performance resources.

Therefore worker count must not simply equal `os.availableParallelism()`.

The intended production initialization is:

```text
hardware-role calibration
  -> identify performance-lane set
  -> max search workers from measured performance capacity
  -> place dedup/planning/cleanup on efficiency/background capacity
  -> short exact lookahead-depth calibration
  -> real solve
```

## Disposition

Promote the **lookahead work-DAG scheduler architecture**.

Do not promote depth 2 as a universal constant. Treat `{2,3,4,5}` as an initialization-calibrated band, with depth 3/4 still the expected larger-scale candidates until standard-7x6 evidence settles the optimum.

Do not choose worker count from raw logical CPU count alone. The next system layer is hardware-role calibration and affinity-aware search/cleanup placement.