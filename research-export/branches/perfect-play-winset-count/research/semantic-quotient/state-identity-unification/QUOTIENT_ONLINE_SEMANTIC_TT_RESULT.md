# Online Semantic-Content Shared TT — Bounded Worker Qualification

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Status:** exact semantic-TT bridge qualified; static full-window frontier scheduling rejected as production scheduler  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Question

Can search workers keep independent fast quotient class/state IDs while sharing exact proof information without a complete global qID graph or per-node dedup RPC?

## Exact identity bridge

Each worker runs its own quotient-native slot64 kernel. A shallow dedup-owned work plan supplies one representative move path for each frontier q state.

Workers replay that path into their local quotient kernel and key the shared TT by:

```text
supportIndex
+ exact sorted P0 residual term sequence
+ exact sorted P1 residual term sequence
```

The TT uses two deterministic hash words for addressing only. A candidate hit is accepted only after exact support, length, and term-sequence comparison against the descriptor stored in the shared arena.

Therefore hash collisions cannot manufacture exact hits.

Local class IDs and qIDs are allowed to differ between workers.

## Qualification

Workflow run: `34660309196`  
Job: `103461243171`  
Conclusion: **success**

All worker counts reproduced the qualified 4x5 connect-4 result:

```text
root W/D/L: 0
root actions: [0, 0, 0, 0]
```

Recursive search did not consume the complete prebuilt graph. The prebuilt bounded graph was used only by the shallow planner to obtain canonical representative paths and exact bottom-up reduction for this isolation experiment.

The shared semantic TT converged to approximately:

```text
65,613-65,624 exact semantic state descriptors
~407,740 term IDs in the exact descriptor arena
```

across worker counts and repetitions.

## Timing

Depth-2 lookahead, five measured repetitions after worker warmup:

```text
workers    median task time    median total time    median expansions
1             128.804 ms           129.157 ms           65,483
2              76.829 ms            77.141 ms           65,540
3              89.142 ms            89.392 ms           66,351
4              86.585 ms            86.837 ms           66,890
```

Two workers were the bounded winner for this online semantic implementation, about 40% faster than one worker.

## Important negative scheduler result

The proof-work count is much larger than the native alpha-beta solve because the static lookahead campaign solved every frontier node independently with a full exact window before reducing the work DAG.

That destroys important parent alpha-beta dependencies.

The online semantic identity bridge therefore **passes**, while the static "solve all frontier nodes exactly" scheduler does **not** become the production worker policy.

This distinction is important:

> The lookahead structure must be a dependency-aware alpha-beta work tree, not merely a balanced list of frontier subtrees.

## Next scheduler

Use a Young-Brothers / Jamboree-style dependency rule:

1. at each split node, search the preferred/first child before releasing siblings;
2. use that result to establish the parent alpha bound;
3. release remaining sibling proof work only after the first-child dependency is satisfied;
4. allow siblings to run concurrently with the established bound;
5. stop/cancel or ignore remaining sibling work after a certified cutoff;
6. retain the shared exact semantic TT so sibling workers immediately reuse proofs;
7. keep the split-depth band initialization-calibrated, with depth 3-4 still expected to be important at standard 7x6 scale.

The dedup/cleanup worker remains the owner of work-tree identity and lifecycle.

## Disposition

**Promote:** exact semantic-content shared-TT identity across independent local quotient kernels.

**Reject as production default:** bulk exact full-window solving of every shallow frontier node.

The next implementation seam is dependency-aware parallel alpha-beta over the lookahead work tree.