# Owner-directed research objective: eliminate strategic branching

**2026-10-17 OWNER CORRECTION — SUPERSEDED AS A SUCCESS CRITERION:** See [`2026-10-17-zero-strategic-branching-objective.md`](2026-10-17-zero-strategic-branching-objective.md). The owner explicitly requires **ZERO strategic branching**, NOT fewer/minimized branches, eliminated scalar successor queries, better search solve time, or a faster/more compact minimax. Any previous phrasing below that counts *materially reduced independent continuation expansion* as success is historically informative but **NO LONGER THE ACTIVE GOAL**. A complete exact value and ALL tied optimal actions must arise from one nonforking structural evaluation, with proven equivalence sets counted as a single logical result. Prior research/correctness statements remain intact; this is a research direction correction, not a game-theory authority change.

**Date:** 2026-10-16  
**Owner/direction:** Josh Oshiro  
**Canonical research branch:** `research/semantic-quotient`  
**Classification:** Explicit research-priority and success-contract clarification; **not** a newly proven theorem, game-theory authority revision, or rejection of the already complete constructive algorithmic core.

## Decision

**The primary prospective mathematical research objective is to eliminate independently evaluated strategic branching** while retaining exact ordinary Connect Four win/draw/loss (W/D/L) and returning **the complete set of all legal W/D/L-optimal moves**. A singleton best-move set is desirable only when justified by exact value; no arbitrary tie-breaking, omitted equal-value actions, or invented best-move uniqueness.

The existing residual-q, cofactor and finite alternating max/min algorithmic core is already constructively complete. Recursion and branching are allowed for that established core. **Their acceptability under the definition of a core does not demote branch elimination to incidental optimization in the continuing research program.** The open stronger goal is a new mathematical decision operator, not a prerequisite retroactively imposed on the complete core.

For a legal, nonterminal source `q=(h,R0,R1)`, let `L(q)` be the literal legal column labels and let `v_c(q)` denote the exact P0-relative WDL value of making action `c`, including immediate first-win or draw when terminal and otherwise exact alternating future value. Set

    V(q) = max_{c in L(q)} v_c(q)   on P0's turn
           min_{c in L(q)} v_c(q)   on P1's turn.

Then the required complete result is

    A(q) = (V(q), M*(q)),
    M*(q) = {c in L(q) : v_c(q)=V(q)}.

This **specifies the answer**, not a candidate computation. A proposed branchless operator `B(q)` must calculate this exact pair, retaining ordinary WDL tie convention and explicit reflection transport for literal labels when applicable.

## What "branch elimination" must mean

The desired elimination is of **independently expanded/evaluated strategic alternatives**, not a literal ban on a program's conditionals, binary-decision-diagram Shannon nodes, bounded loops over seven column labels, logical AND/OR gates, or mathematical proof case splits. A branchless strategic operator may perform algebraic normalization, quotienting, simultaneous action-mask computation, and exact quantified transformations.

It must NOT:
1. recursively evaluate each move's game value as a separate minimax subproblem and call the returned vector "nonbranching";
2. enumerate move histories, exponentially many response assignments, supports, or winning strategies and hide that work in a QBF, circuit, BDD, antichain, or preprocessing pass;
3. precompute a table from solved-game/oracle outcomes and claim its constant-time lookup is a new structural derivation;
4. assume `forall b exists a` equals `exists a forall b`, or drop first-win, legality, capacity, mover, terminal, draw, response-resource and literal-action guards;
5. assert one optimal move when other legal actions have the same exact WDL value;
6. infer efficient evaluation merely from the compact size of an unevaluated formula or from a small final root expression.

**Required distinction:** a compact formula expressing the whole game is valuable representation research but is not branch-eliminating **evaluation** until quantified truth and all optimal actions are actually derived with full work accounted. A mathematical lower bound demonstrating unavoidable expansion under exact stated assumptions is valuable negative evidence; do not assume the objective is universally achievable.

## Next theorem and experiment target

Seek an exact source-residual-derived *simultaneous action-value/optimal-action operator* built from guarded Boolean threshold functions. For P0-relative three-valued WDL use `W=[V=+1]` and `N=[V>=0]`, with two thresholds sufficient for an exact scalar and four corresponding lower/upper thresholds when intervals have not converged. Preserve **individual legal action thresholds or an equivalent fully reconstructible action-labelled mask**, and use shared dependency-aware quantifier elimination / cofactor quotient / guard-complete antichain or structured DNNF rather than separately solving successor games.

A candidate theorem should explicitly identify:
- the algebraic representation and source-q input constraints;
- sound universal/existential adaptive-response dependencies and first-win stopping;
- the induced exact literal optimal-mask reconstruction law;
- which computations are structurally shared or eliminated, and which still expand;
- construction AND evaluation complexity or exact bounded instrumentation, including peak live/temporary nodes, operations, memory, and time;
- the counterexample or structural premise limiting its applicability.

**Falsifiers/controls:** existing full small-board 4x3-c3 and 4x4-c4 exact q references; independent physical first-win/turn alternation; the legal `223` noncommutation counterexample; correct reflection literal-label transport; canonical `44444` with all legal P1-turn6 replies; original research budgets (60k BDD nodes, 300k nontrivial Boolean operations, 10k support representatives, 15s). Oracle outcomes and independently searched policies are **validation only after derivation**. Failure to close `44444` is reported UNKNOWN, not a draw/loss or proof all replies equivalent.

## Priority and current evidence

**Rank 1:** direct nonbranching strategic decision and the complete optimal action set, measured by eliminated independently evaluated successor obligations rather than expression size alone.

**Rank 2:** mathematical representations/lemmas that lead to Rank 1, especially sound dependency-localized quantifiers, essential future cofactor-function equality, action-labelled response-cover factorization, and guarded multi-output symbolic thresholds.

**Rank 3:** bounded implementation choices (e.g. source-variable-ordered ROBDD baseline versus tree-structured decision diagrams / structured decomposable circuits and fused Apply+Quantify) chosen by **true construction-plus-elimination work**, not by compact encoding alone. Prove semantics and compare before promotion.

**Current facts:** source-anchored reflected interval BDD completed 11 future plies after `44444` while root and literal moves remain UNKNOWN [-1,+1]. Full 37-ply action-QBF representation was built, but not decided. An exact action-QBF Shannon projector with live-DAG compaction fully evaluated bounded k6 thresholds; k7 fails within the next cofactor under 60k peak nodes. This is a measured representation/schedule wall, **not** proof that strategic branching is mathematically unavoidable. The qualified recursive W/D/L/action core remains complete.

**Success requirement:** demonstrate an exact, source-derived strategic-value/complete-optimal-set operation that materially avoids independent continuation expansion, with independent post-derivation conformance and honest, counted costs. The strongest desired result is elimination of that expansion across all ranks, not merely a faster recursive solver or a one-position shortcut. Retain scoped progress even when full elimination remains open.

This record is an owner-authorized **research objective clarification**; no new IsoGraph claims, qualification status, solver adoption or merge follows.
