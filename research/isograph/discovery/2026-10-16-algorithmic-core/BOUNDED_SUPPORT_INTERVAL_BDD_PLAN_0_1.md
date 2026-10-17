# Exact support-cone interval Bellman algebra — predeclared research plan

**Date:** 2026-10-16. Canonical research branch `research/semantic-quotient`.
**Starting live head:** `59511f136a3acf8693e99f11fce55fd9858ad34b`.
**Authority:** qualified q_o first-win/owner-cofactor and alternating P0 max/P1 min. No new authority, no merge.
**Motivation:** Full source-anchored owner-incidence BDD with 64-support batched GC **passed** exact 7x6 WDL and all action values at rank22 after compiling 8,640 future supports under prior limits. The fixed rank20 prefix `43214636342357317661` has 14,400 possible future supports, exceeding the **predeclared 10,000 support ceiling**. It is disallowed to simply raise the ceiling or substitute forward policy search.

## Frozen algebraic proposal

Construct a **bounded-depth support-DAG algebraic interval** on the exact source q=(h,R0,R1), without generating any concrete q successors or searching winning policies. At each support h with depth k remaining:

- At k=0 and still nonterminal, assign unknown absolute P0 value interval **[-1,+1]**. Equivalently winning threshold W_lower=0,W_upper=1 and nonloss threshold N_lower=0,N_upper=1.
- At a full support (nonwinning draw), assign both exact thresholds W=0,N=1.
- On each legal move x by p, compute immediate first-win predicate directly from **source residual R_p** and future-only symbolic owner bits; determine terminal P0 win / P1 win / nonwinning full-board draw BEFORE continuing.
- Otherwise Shannon-restrict each of the child's **four** interval threshold BDD roots (Wlo,Whi,Nlo,Nhi) to the newly played owner's value. Combine P0 actions with OR, P1 actions with AND, separately for all four thresholds. Preserve *every literal action-specific interval*, not merely a scalar union of response covers.
- Correctness by finite-depth induction: the unknown boundary brackets every possible continuation in [-1,+1]; both min and max are monotone. Hence the resulting root interval contains the true perfect-play value for every physically legal source q, even if root depth < full remaining cells. If the lower and upper WDL bounds coincide, the root value is **EXACT** without exploring deeper support ranks.
- An action's interval [l_a,u_a] is a certified optimal action only when **l_a equals the exact root value**. To identify the *complete* WDL-optimal move set, classify every action's upper/lower against the exact root value; if some action interval straddles it, return UNKNOWN rather than invent equivalence.
- No depth-bound ambiguity: a turn with a terminal win *on the cutoff placement* is decided by its mover's immediate terminal guard before unknown child result.
- This is one factored algebraic descriptor over supports and future-owner variables; it retains quantified support-action Bellman fanout, and **is not a claim of full computational branch elimination**.

## Research targets and immutable caps

- First qualify the interval root and action fronts on complete 4x3 Connect-3 (empty root) with depth boundaries k=1..12, and 4x4 Connect-4 with selected k=2,4,6,8,16. At k>=all remaining cells, recover exactly the previously validated complete symbolic WDL result and all WDL-optimal actions.
- The canonical standard7x6 rank20 root input is the physical rules verified legal prefix `43214636342357317661`. Support h=[3,2,5,3,1,4,2], future capacity 14,400 support vectors. Test cutoff depths **4,6,8,10,12** with source support-cone counts **284, 1,187, 3,219, 6,335, 9,723** (these include the rank20 source support). Stop if exact output is proven; if not, preserve intervals. NEVER evaluate the full 14,400-support rectangle under the 10k cap.
- Budget per independent compile is **60,000 simultaneously held BDD nodes, 300,000 nontrivial BDD apply/restrict/not operations, 10,000 support vectors, 15 seconds**. Batched GC every 64 completed supports, high water 40,000, terminal first. On budget error, record PARTIAL and preserve first obstruction. No budget increases. Full independent q WDL reference at rank20 is validation only, permitted **after** algebraic candidate outputs are frozen, capped at 200k q states / 800k transitions / 30 seconds.
- Complete external physical/oracle state enumeration and searched policies may validate but **never** enter interval formula construction.
- Deliberate falsification controls: force cutoff unknown lower=+1, remove the P1 terminal guard or forget owner restriction. They should be rejected on a physically legal small-board counterexample or on violation of interval nesting. Do not alter production semantics to make a test pass.

## Success interpretation

An exact rank20 outcome/all-action proof at bounded depth would be a genuine **early algebraic fixed-point/stabilization result**, not merely another winning certificate found by forward search. A noncollapsed interval would identify insufficient horizon, rather than a loss/draw. An output that closes but exceeds time/node budgets is PARTIAL, not evidence of general impossibility. The next research direction would be monotone frontier/interval convergence and output-sensitive support pruning, not numerical minimality.
