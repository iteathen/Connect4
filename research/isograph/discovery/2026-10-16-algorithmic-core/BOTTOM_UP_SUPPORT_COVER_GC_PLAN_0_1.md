# Support-indexed, action-preserving symbolic value composition with liveness reclamation — pre-test plan 0.1

**Date:** 2026-10-16. Research owner `research/semantic-quotient`.
**Start HEAD:** `6febac19bf17ea3338b45ad20cebec908b1a8d79`.
**Governing semantic authority:** qualified q_o/cofactor/first-win game-theory authority 1.2; no promotion.
**Research target:** the **full action-labelled adaptive response-cover / alternating Bellman problem**, NOT more input-specific forward search or another state-transition theorem.

## Existing results and essential negative

1. The owner-mask residual/cofactor transition works to rank42 with unchanged rules. That settles fixed-history transition semantics, not strategic quantifiers.
2. Earlier `symbolic-residual-circuit.mjs` composes exact P0-WIN / P0-NONLOSS monotone circuits using support-indexed residual-upset coordinates and explicit action-fronts. It passed bounded 4x3/4x4 controls but **failed the empty 4x3 root at 60,000 allocated gates**, even with sound residual-poset absorption.
3. `RBA_FOUR_FRONT_BLOCK_CHECKPOINT_0_1.md` and `RBA_ALGEBRA_CORE_CHECKPOINT_0_1.md` already prove semantically exact symbolic composition. Mixed reply covers require full alternating quantifier scope; naive union-only or Upper-only flattening is false.
4. The 4x3 physical state after `223` has literal P1-to-P0 reply covers `[0xe,0x4,0xe,0x7]`, proving `forall b exists a` differs from `exists a forall b`. Preserve **per-action threshold circuit roots**, not a scalar cover union.

## One tested proposal: static support DAG + lifetime-aware formula reclamation

Build the same exact monotone `WIN,NLOSS` front functions over residual variables for **every support reachable by adding stones to one root support**, without constructing concrete q states, candidate winning policies or enumerating game histories:

- Enumerate support vectors in `[h_root,H]^W` and process in **descending occupied rank**, so a child support's threshold formulas exist before its parents'.
- Propagate exact child variables to parent via qualified owner-true/cofactor and opponent blocker preimages, with terminal/winning-first/draw guards at each literal action.
- Preserve **each action-specific WIN and NLOSS formula** until its containing parent support has consumed the child; do not discard action labels or collapse `forall b exists a` into `exists a forall b`.
- Precompute the number of **immediate predecessor supports** of each support. After constructing a parent, decrement each child support's outstanding predecessor-reference count. A child support's compiled formulas can be released when all predecessor supports have consumed them.
- Run a **stop-the-world hash-consed DAG mark/sweep** at each support completion, remapping currently referenced variable and gate IDs into a compact canonical intern table, with no in-flight recursive stack or stale references.
- Keep residual shape variable nodes and active support formulas as GC roots. Non-referenced intermediate substitution/gate objects are discarded; count total gates allocated, peak live gates, reclaimed dead nodes, GC passes, total substitution calls and support arcs.

This is exact support-dependency DAG composition, **not a full history search**. It retains AND/OR choice fanout. Even if successful, it is an output-sensitive representation technique and **does not by itself prove global strategic branch elimination or polynomial complexity**.

## Hard, predeclared gates

- Try first empty **4x3 Connect-3** root: at most **60,000 simultaneously retained Boolean DAG nodes** (the prior gate limit), **300,000 substitutions** (prior limit), 15s compilation time. *Do not relax*. Stop/relabel PARTIAL if a bound fails.
- If root compiles, compare full W/D/L action vector and all W/D/L-optimal action labels at empty 4x3 with the **independent q-only recursive core**, but use it only **after** symbolic compilation. Also compare on **all 4,631 legal nonterminal physical states** by compiling support-root circuits under separate bounded resources if possible; otherwise sample predeclared 128 deterministic legal fixtures over varying ranks and report coverage. No solved data in candidate construction.
- Check the prior 3 support fibers `[2,2,1,2]` (4x3 c3), `[1,1,1,1]` (4x3 c3), `[3,3,2,2]` (4x4 c4) and compare to qualified earlier circuit and independent physical values. If resource-limited, preserve partial.
- Hold per-action roots, not only scalar result. Verify `223`'s adaptive mix of opponent/P0 responses remains valid at the corresponding rank when decoded.
- Measure true actual cost, whether root compilation finished, GC compression, transient aggregate node growth, peak live nodes, and support fanout. **Do not claim no branching** because a single circuit was returned.
- Deliberate falsifiers: remove P1 first-win guard, remove one action-specific root, or use union-of-reply scalar instead of adaptive family; these must be rejected by independent value/action tests or the established `223` counterexample.

## Failure interpretation

If root still exhausts node or substitution/clock budget, checkpoint the precise first root/support, growth measures and obstruction, not a conjecture of impossibility. Do not transition to a searched proof producer. If root finishes only through support-wide exhaustion/large work, classify accurately: a complete **symbolic-algebraic realization**, but no guarantee of efficient nonbranching realization on standard7x6.
