# Exact two-gravity-chain phase-convolution and all feasible first heads, without enumerating shuffle words

**2026-10-18 — FROZEN before independent original standard 7×6 physical controls.** Research owner `research/semantic-quotient`. Status: **derived exact source scheduling theorem; physical falsification pending at freeze**. Qualified IsoGraph 1.2 game theory untouched. This is a fixed-ownership, fixed-two-column feasibility theorem, NOT a source perfect-play WIN/DRAW/LOSS algorithm, a Level2 best-action certificate, or an unrestricted strategic branching-elimination theorem.

## 1. Exact problem and prior guard

Let q=(h,R0,R1) be a genuine legal first-win-stopped original W×H×K gravity position, n=Σh. Choose TWO distinct original columns a,b with A≥1 and B≥1 next ascending physical gravity events (A≤H−h_a, B≤H−h_b). Their owner-color sequences, prescribed as input, are binary words

    x=(x_1,...,x_A),  y=(y_1,...,y_B),  x_i,y_j∈{0,1}.

A future hypothetical fixed segment w of T=A+B events consists of precisely these chain events, internally ordered within each column, with globally alternating actual owner phase

    p_k=(n+k) mod2,  k=0,...,T−1.

A prescribed owner projection (x,y) is feasible iff some gravity-respecting interleaving places every fixed event on a turn with its prescribed owner. This is **not** a question about an opponent's optimal strategy and does not determine actual game value.

The previous exact one-chain + *distinct singletons* theorem gave scalar M and quota constraints. It cannot be applied separately to the TWO nontrivial columns, since `1212` from the empty real 7×6 board supplies mutual parity flips and gives column1 owner word [0,0], column2 [1,1].

## 2. A single antidiagonal source Boolean bitset, no schedule enumeration

At hypothetical segment rank k (number of already placed events), let i be the number of a-column events already placed and j=k−i the number of b-column events; physically possible `0≤i≤A`, `0≤j≤B`. For fixed k, the entire set of potentially relevant physical gravity prefix counts fits into **ONE binary bitset indexed by i**, width A+1. Crucially, each bit is only a prefix-count feasibility fact for the SAME **prescribed final colored event allocation**; no alternative original future-game WDL is computed.

Define exact current-mover color `p_k=(n+k) mod2`, and original SOURCE bitmasks on the k-th antidiagonal:

    U_k := Σ_i 2^i [0≤i<A, 0≤k−i≤B, x_(i+1)=p_k].
    V_k := Σ_i 2^i [0≤i≤A, 0≤k−i<B, y_(k−i+1)=p_k].

`U_k` allows the next a event; `V_k` allows the next b event. No original q child, outcome, winning strategy or shuffled word is constructed to compute these masks.

Define source prefix-feasibility bitsets `P_0=1`, and for `k=0,...,T−1`:

    P_(k+1) = ((P_k AND U_k) << 1) OR (P_k AND V_k).

This is one bitset operation per event rank, with the two event choices merged by Boolean OR **before** any successor game is valued or even represented. The result uses at most `(A+1)` bits and `O(T(A+1))` current-target-color/column-chain checks, on standard7×6 at most seven bits and 12 antidiagonals.

**EXACT THEOREM:**

    A prescribed two-column owner projection is realizable
       iff
    (P_T AND 2^A) ≠ 0.

Induction: bit i of P_k is one exactly when some legal k-prefix has used i a-events and k−i b-events while matching every previously supplied original target owner color. The next event is necessarily the next a or b chain head and has the known owner p_k. U/V encode precisely these conditions. No other gravity/legal-prefix constraints exist for the selected two chains before terminal stopping. Thus the bitset recurrence is exact.

A global owner quota check is an OPTIONAL fast necessary early rejection; the recurrence alone is sufficient and also identifies more subtle prefix deadlocks.

## 3. Direct full causal FIRST-HEAD set by a single backwards bitset closure

The preceding forward recurrence can decide feasibility, but to determine *all* first columns without evaluating alternative future games or separately solving the a- and b-first subproblems, compute ONE **backward source suffix-feasibility closure**:

    S_T = 2^A.
    S_k = ((S_(k+1) >> 1) AND U_k) OR (S_(k+1) AND V_k)
         for k=T−1,...,0.

Bit i of S_k means: from the prescribed original gravity prefix counts (i,k−i), the remaining colored chain events can be realized, including the correct alternating owner phase at every event. This holds by backward induction. In particular:

    projection feasible  ⇔  (S_0 AND 1) ≠ 0.

And when feasible the COMPLETE fixed-profile admissible first original literal columns are:

    a is a possible first column
      iff x_1=(n mod2) AND (S_1 AND 2^1)≠0;

    b is a possible first column
      iff y_1=(n mod2) AND (S_1 AND 2^0)≠0.

If neither passes, no scheduling first column exists. There are no independently valued strategic futures. One deterministic realizing word is reconstructed greedily by choosing the lowest-literal eligible next chain whose corresponding S_(k+1) bit remains 1; its correctness is certified by S and never backtracks.

The backward scan computes at most T+1 bounded bitsliced masks; preserving BOTH forward/backward layers is useful for an independent consistency check but not required to find one canonical realization.

### Complexity and honest non-search distinction

The operator **does not enumerate full interleavings** (`C(A+B,A)` possible words) and does **not evaluate any strategically inequivalent future-game outcome**. It DOES inspect up to `(A+1)(B+1)` distinct **STATIC prefix-count resource positions** in masks, so do not call it literally zero combinatorial work or a proof that Connect4 strategic branching is solved. It resembles Boolean convolution/transfer on a fixed two-chain event-poset slice, not a game-value Bellman recurrence. It cannot be promoted to Level2 without a separate source game-tier or universally quantified causal opponent response proof.

## 4. Source first-win and exact batch-q guards

Given (x,y), derive original physical owner event masks A0,A1 directly from root h and the per-column owner bits; no future word or q successor needed.

    F_p=[∃G∈R_p with G⊆A_p].

- If both Fp false, ALL feasible realising words are first-win-free through the segment. The exact batched q source is `R'_p=Min{G\A_p : G∈R_p, (G∩A_(1−p))=∅}`, h'_a=h_a+A, h'_b=h_b+B. If the entire support is full, terminal DRAW.
- If exactly one Fp true, EVERY complete hypothetical realizing word has that same p as FIRST winner at some prefix, although its timing may differ; actual play stops there.
- If both Fp true, the first-terminal *race* may depend on order; classify **INCOMPLETE_DUAL_COMPLETION_RACE** unless an additional exact source gravity-poset race theorem applies.
- Failed colored-projection feasibility is SOURCE `NOT_REALIZABLE`, NOT player LOSS or an ordinary game WDL.

This is a payoff/history factor, NOT an alternating-strategy quotient. The original true7×6 rank34 counterexample `2532541156412471331416356736376672` proves owner-preserving completed sequences can have different root first-action values due to opponent conditional responses. That negative authority remains intact.

## 5. Frozen true7×6 independent falsification before any source experiment

1. Freeze one ORIGINAL q-only ESM source implementation of U,V,P,S, complete feasible first-head labels, and canonical realizing word. Do NOT call physical WDL or enumerate competing future words in source.
2. Freeze an independently written physical ORIGINAL W7×H6×K4 (all 69 original four-cell windows), gravity and first-win checker. From EMPTY root select columns1 and2 with A,B ranging 1..6 (36 exact configurations). Deliberately enumerate `Σ_{A,B=1}^6 C(A+B,A)=3,418` complete hypothetical two-column words ONLY inside the physical falsifier. Test ALL `Σ_{A,B=1}^6 2^(A+B)=15,876` prescribed owner-color profiles, verifying source exact feasible/infeasible and head sets against physical word fibers.
3. Repeat same 36 configurations from genuine canonical prefix `44444` (owner parity reversed), and four rank34 cases with cols2/4 lengths1..2 from the preserved independent no-win original physical history. Explicitly test `1212` from blank, desired x=[0,0], y=[1,1]. Compare source canonical realization and physical first-win; test physically both positive and negative quota-matched profiles to ensure this is not a quota-only check.
4. For every source feasible pattern with F0=F1=0, compute exact direct source original batch q only once and compare against independently replayed original physical nonterminal position. When only one Fp=1, check physical actual FIRST winner for all realizing words; when both positive, record race INCOMPLETE rather than inventing a universal fixed winner.
5. Freeze code, source-input profile matrix and resource limits before physical execution. Track counts of checked profiles, physical words, static bitset checks, real original terminal outcomes, infeasible source constraints, unique/multiple scheduling heads and disagreements.
6. Node26 CI and external formal proof-assistant checking are NOT implied by isolated V8 controls. Do not touch solver branches/qualified IsoGraph1.2. Canonical `44444` unrestricted perfect-play WDL and Level2 best original literal column remain UNKNOWN.

## 6. Next opening after two chains

This theorem shows a simple exact **same-color phase-admissibility transfer kernel** across TWO interacting gravity chains. Beyond two, prefix resource vectors are dimension W and naive general Boolean closure may grow with `∏_c(H−h_c+1)`, becoming a symbolic rewriting of many alternative histories. Future work should seek a genuine finite-rank cross-column phase/resource factor or an algebraic closed invariant, and then prove preservation of P0/P1 **adaptive information/observation** rather than merely completing a prescribed owner coloring. Do not present a faster hidden game-state search as the owner's zero-strategic-branching goal.

### Mathematical context

This bitset recurrence is a direct elementary two-chain shuffle-membership identity; analogous formal-language shufflers and product automata are established mathematical tools. We claim a *guarded source-specific formulation and physical validation*, not invention of generic shuffle dynamic programming.
