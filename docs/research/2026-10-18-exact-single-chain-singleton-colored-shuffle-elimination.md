# Exact alternating turn-shuffle elimination for one gravity chain plus distinct singleton columns

**2026-10-18 — frozen mathematical SOURCE theorem before repo physical controls.** Research owner: `research/semantic-quotient`. Current gameplay authority remains qualified IsoGraph 1.2. This exact theorem solves an explicit **restricted colored-phase schedule-feasibility problem** without enumerating future words and connects the owner's four-ribbon/geometry unfolding to a concrete, constant-work-per-event elimination of the turn sequence. It is NOT a perfect-play strategy value, Level2 best move, or a theorem for arbitrary collections of multi-event columns.

## 1. Exact finite physical event input

Let `q=(h,R0,R1)` be a genuine original first-win-stopped nonterminal Connect Four position with dimensions W,H,K and ply `n=Σh_c`. Choose one **primary gravity column** `c`, and L≥1 of its consecutive next original future cells `e_1,...,e_L` (from row h_c upward). Choose `s≥0` OTHER pairwise DISTINCT currently playable columns `a_1,...,a_s`, disjoint from c, and take precisely ONE next root gravity event `f_i=(a_i,h_{a_i})` from each. The segment has `T=L+s` physical events, and all its possible proposed words are gravity-legal iff the L c events appear in their fixed increasing order (singletons impose no within-segment cross dependencies). Beyond this finite segment, other original future events remain unused.

Supply a target physical owner-color bit `x_j∈{0,1}` for each primary chain event `e_j` and `y_i∈{0,1}` for each singleton `f_i`. These colors are a **candidate phase allocation**; they are NOT an opponent strategy or an oracle-solved game.

Question: Does there exist AT LEAST ONE ordinary alternating gravity-legal segment interleaving assigning exactly those physical cell owners, before considering any game termination?

## 2. Direct parity-transition scalar M and total owner-count test

Without any singleton event, the primary chain event e_j would appear at relative move j and have base owner bit

    base_j = (n+j-1) mod 2.

Let `ε_j=x_j XOR base_j`. It represents the parity of the number of singleton events scheduled before e_j in ANY word realizing the requested c-event owner colors. Define the nonnegative integer SOURCE phase-transition cost

    M(x) = ε_1 + Σ_{j=2}^{L} (ε_j XOR ε_{j-1}).

Let the actual number of P0 and P1 turns in an alternating T-event segment be

    quota_p(n,T) = #{k∈{0,..,T-1} : (n+k) mod2=p}.

The requested physical colors must have EXACT quota counts:

    #{j:x_j=p} + #{i:y_i=p} = quota_p(n,T)
    for p=0,1.

**THEOREM (necessary and sufficient, no word enumeration):**

    The supplied one-chain-plus-distinct-singletons
    original physical owner allocation is attainable by
    some alternating gravity-legal segment
    IFF
      (a) both requested owner quotas match the turn clock, AND
      (b) s >= M(x).

Proof is fully direct:

Any interleaving partitions its singleton events into the L+1 gaps `g_0,...,g_L`: before e_1, between each consecutive e_j and e_{j+1}, and after e_L. Their counts are nonnegative integers summing to s. The rank of e_j is `j+Σ_{k=0}^{j-1}g_k`, so required parity ε_j is the parity of that sum. Thus necessarily

    g_0 mod2 = ε_1
    g_j mod2 = ε_{j+1} XOR ε_j (1<=j<L).

Each odd gap contains AT LEAST one singleton event, giving s>=M. Quota matching is also necessary for any alternating segment.

For sufficiency, choose the **deterministic minimal** gap lengths

    g_0=ε_1;
    g_j=ε_{j+1} XOR ε_j (1<=j<L);
    g_L=s-M.

These are nonnegative and sum to s. Insert the c events into the resulting T-slot template in column order. By construction their owner bits match `x_j`. The remaining singleton slots have predetermined alternating-clock owner bits. The total quotas then guarantee exactly the requested number of each color remains available. Assign each original distinct singleton column label of a given requested color bijectively to the corresponding still-free slots, in ascending literal column order. Because singletons come from **different columns** and are individually currently gravity-legal, this is an actual legal gravity schedule. No other feasibility condition remains. QED.

Complexity: O(L+s+W) for assignment and the original source quota, plus the optional terminal guards below; there is no alternate event-word enumeration, no game successor valuation and no source strategic game tree. This is an exact **single-chain phase realization / turn-sequence elimination** result, not just necessary constraints.

## 3. Exact source terminal and nonterminal q closure when realizable

From the requested owner bits, form original physical masks

    A_p = {e_j : x_j=p} ∪ {f_i : y_i=p}.

Use the qualified original surviving p source antichain R_p and directly test

    F_p(A)= [exists G∈R_p with G⊆A_p].

These are static source subset checks. They do NOT depend on which realizing word is chosen. If `F0=F1=0`, no original winline can complete at any prefix of ANY realizing word: first win is impossible within the entire segment. All realizing interleavings have the **same source-oriented q_o after the segment** given by the earlier exact batch cofactor:

    R'_p = Min{G\A_p : G∈R_p, G∩A_{1-p}=∅}
    h'_c = h_c + L
    h'_{a_i}=h_{a_i}+1.

If support is full, the segment instead terminates in DRAW. If `(F0,F1)=(1,0)` or `(0,1)`, the single completing owner must be the **fixed-segment** first winner regardless of interleaving, although first-win timing may differ. If both are 1, a first-winning-line race still matters and source must return `INCOMPLETE_DUAL_COMPLETION_RACE` absent an additional static gravity-poset winner relation. NONE of these conclusions asserts perfect-play root value or first-action optimality.

This provides a new true **finite family** where the chronology of all allowed projected events can be FACTORED OUT by a scalar M and quota equations without a word search, and then exact q is computed from original winning-line incidence. It does not cover arbitrary multi-column chains or eliminate alternating strategic choice.

## 4. Existing two obstructions become corollaries

**Odd-column barrier:** s=2 and odd L, desired a/b owner both current p and c event owners shifted by one move compared with the c-alone base ⇒ ε_j=1 for every j. Thus M=1; the deterministic template puts a singleton before all L primary events and another after. The exact fiber has only the two arrangements `a c^L b` and `b c^L a`, whose nonlocality was separately proved and physically verified. For W7,H6, `1444442` and `2444441` are the L=5 concrete instance.

**Greedy scheduling obstruction:** from empty standard W7,H6 choose primary column B=2 with two desired cell owners [p,o] and singleton A=1 with desired owner p. Their primary ε=[0,0], M=0, quota counts agree, and the canonical feasible word is `221`. Choosing singleton 1 first instead yields `122`, which is legal gravity but makes the first B cell o-owned, violating the prescribed target. A feasible colored projection does NOT mean any locally matching first column is safe.

## 5. Frozen reproducible true7×6 independent falsifiers

1. SOURCE ESM producer must read only original q, column identities, L, and desired per-physical-cell owner bits. It computes M, total quotas, and ONE canonical realization directly, without generating other words or other future game values. If realizable, compute original F0/F1 and direct batched q only under exact first-win guards. A negative parity/capacity result must be reported as `NOT_REALIZABLE` (this is an exact structural negative, not ordinary game LOSS).
2. Independent physical 7×6×4 checker constructs exactly the 69 original K-lines, gravity drops and first-win stopping. For a chosen actual finite event multiset with primary c plus s distinct singleton columns, enumerate all gravity-legal interleavings **ONLY AS VALIDATOR INPUTS**, collecting exact owner allocation signatures. Compare source predicate against ALL possible color assignments with proper quota. For each source feasible projection, physically replay the one canonical word, check ownership per physical cell and direct first-win; when both F flags are false check identical h/R0/R1 for ANY supplied member words with the same phase allocation.
3. Priority exhaustive original-empty example c4,L5 and singletons [1,2,7], s3,T8: there are `(8! / 5!)=336` distinct event words. Physical collection finds 62 distinct owner-color signatures; verify pure source formula picks EXACTLY that same set, and rejects all other color projections. Original physical first-win during some counterfactual 8-event words does NOT invalidate schedule feasibility; do not confuse an early terminal with an unattainable phase coloring.
4. Also test L∈[1,6] with s∈[0,3], actual original 7x6 root, plus seeded first-win-stopped late q with feasible nontrivial source antichains, varying root clock parity. Preserve positive/negative source counts and mismatches; these controls are INTERNAL and do not prove any universal strategic collapse.
5. Do not infer one correct Level2 root move from a feasible segment. Root `44444` unrestricted perfect WDL and one source-certified best original column remain UNKNOWN. Maintain IsoGraph1.2, V4 and all historical negative proofs unmodified.

## 6. External context and delimitation

Word shuffle/interleaving and precedence-constrained unit-job scheduling are established mathematical fields; our exact quota-plus-transition sufficiency uses the very specific **one nontrivial column chain and singleton-only other columns** shape and should not be generalized without proof. In particular, two or more nontrivial columns can introduce real causal deadlocks that are not captured by these scalar counts. The source theorem does not evade the earlier physically established adaptive-strategy causality counterexample at rank34; eliminating all schedules of a single fixed event allocation is weaker than selecting a minimax best move.
