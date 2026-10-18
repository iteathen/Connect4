# Exact two-chain colored-phase event-rank bounds and sufficient first-winner race certificate

**2026-10-18 — mathematical source theorem FROZEN BEFORE independent genuine original 7×6 physical falsification.** Owner `research/semantic-quotient`, game authority qualified IsoGraph 1.2 unchanged. This extends `docs/research/2026-10-18-two-chain-boolean-antidiagonal-phase-convolution.md` and earlier payoff formula `PAYOFF=F0−F1+F0F1ρ`. It is a **restricted fixed-owner-pattern first-terminal certificate**, not an arbitrary-game Level2 best move or ordinary root WDL calculation.

## 1. Input and the exact prefix/suffix source bitset interface

Fix true first-win-stopped original source `q=(h,R0,R1)`, ply n=Σh. Take two distinct original current legal columns a,b, first A and B future gravity events with supplied binary physical owner words x_1..x_A and y_1..y_B, total T=A+B. The preceding exact two-chain source decides whether some alternating gravity schedule realizes *this one supplied physical color allocation*, using bitsets of all compatible prefix resource-count pairs (i,j) with j=k−i.

For k=0,...,T−1 let `U_k` and `V_k` be source masks for legal a- or b-column next events at rank k+1 (requiring prescribed event owner = (n+k) mod2). Let

    P_0=1;
    P_(k+1) = ((P_k & U_k)<<1) | (P_k & V_k).

And with suffix feasibility

    S_T=2^A;
    S_k=((S_(k+1)>>1)&U_k) | (S_(k+1)&V_k).

Bit i of `P_k` says some original fixed-profile color-compatible gravity prefix can reach counts (i,k−i); bit i of `S_k` says the remaining event suffix from those counts can be completed compatibly. The physical-color projection is feasible iff S_0 bit0=1. No future game score, other owner profile, or game-strategy branching is needed.

## 2. Exact attainable rank interval for each individual ORIGINAL future event

For `1≤j≤A`, event e=a_j (the jth original future event in a) can be the (k+1)th placement of a full profile-realizing word **if and only if**:

    i=j−1 is a feasible original prefix a-count at rank k;
    (P_k & 2^i)!=0;
    (U_k & 2^i)!=0;
    (S_(k+1) & 2^(i+1))!=0.

For event e=b_j, put b-count j−1, so i=k−(j−1), and replace the U step with

    (P_k & 2^i)!=0;
    (V_k & 2^i)!=0;
    (S_(k+1) & 2^i)!=0.

The exact set of possible relative physical event placement ranks across all compatible complete hypothetical future words is therefore computable from the source prefix/suffix bitsets, by scanning O(T(A+1)) root STATIC resource positions. Define

    lo(e)=minimum attainable rank; hi(e)=maximum attainable rank.

These endpoints are EXACT extrema over compatible colored gravity shuffles, not guesses about strategic control. They exist for every selected physical event when source feasibility succeeds. Although intermediate color-prefix resource positions are represented as bitsets, NO separately scored original future games or opponent policies are constructed.

## 3. Conditional original FIRST-winner race certificate

From original surviving q source requirements, compute the exact fixed-allocation owner-terminal generator families

    W_p = {G∈R_p : G⊆A_p},

where A_p is the set of physical segment events prescribed to be p-owned. A nonempty W_p means p eventually completes at least one original winning line in every hypothetical full realization (possibly after another player first-wins).

For a fixed generator G∈W_p, its completion rank in any realizing schedule w is `C_G(w)=max_{e∈G}t_w(e)`. By the exact per-event bounds,

    L(G)=max_{e∈G}lo(e) ≤ C_G(w) ≤ U(G)=max_{e∈G}hi(e).

Define, for each p with W_p nonempty,

    L_p = min_{G∈W_p} L(G)
    U_p = min_{G∈W_p} U(G).

The earliest p-winline completion time `τ_p(w)=min_{G∈W_p}C_G(w)` obeys **for EVERY compatible fixed-color word**:

    L_p ≤ τ_p(w) ≤ U_p.

Therefore when BOTH W0 and W1 are nonempty, the following original source-only sufficient rules are EXACT:

    U_0 < L_1    ⇒  P0 must FIRST WIN in EVERY realizing word;
    U_1 < L_0    ⇒  P1 must FIRST WIN in EVERY realizing word.

Both cannot hold simultaneously. If neither strict inequality holds, return `INCOMPLETE_DUAL_COMPLETION_RACE`; failure is not evidence the first winner actually varies with turn sequence. This computes the correction `ρ` for a guarded subset of dual-owner-completion configurations, WITHOUT checking different hypothetical full words, full-game WDL or strategies.

This condition is *sufficient, not necessary*: individual event rank extrema may be attained in different schedules, and discarding correlation can widen the generator completion interval. Exact signed gravity-poset forced-order relationships from `docs/research/2026-10-18-unfolded-winning-line-maxima-poset-temporal-quotient.md` can be unioned as a separate proof family, but may not be promoted to best-action equality or actual root WDL.

When no W_p or exactly one is nonempty, the earlier fixed-allocation source payoff and original direct batch q results already apply. All source statuses continue to refer to **one caller-supplied owner coloring and its feasible schedules**, never an unknown-quality or perfect-play opponent's possible strategies.

## 4. Frozen physical falsification contract

1. Implement a SOURCE-only ESM producer importing the unchanged earlier two-chain source bitset eligibility/suffix proof. Independently recover forward prefix bitsets from the exact root target colors, scan the two-color resource grid to compute exact per-event rank extrema and bounded earliest-win intervals, and emit a first-winner certificate ONLY when the strict interval-separation guard holds. No strategically inequivalent future WDL, no alternate word enumeration or simulated game termination. Count source mask/rank ops separately.
2. Freeze a separate ORIGINAL physical 7×6×4 checker that enumerates hypothetical interleavings ONLY for validation, observes exact physical FIRST four-in-row on 69 original geometric windows, and computes per physical event actual min/max rank across all realizations of each fixed owner coloring. Compare source exact event-rank bounds against those physical extrema on matched previously frozen 76 two-column original cases, and verify every source fixed-winner claim against **ALL** actual physical first winners in that coloring fiber. When source still INCOMPLETE, retain it despite physical oracle knowing a unique winner.
3. Compare on SAME original input profile corpus to immutable `STANDARD7X6_TWO_CHAIN_31788_OWNER_COLOR_PROFILES_EXACT_SOURCE_PHYSICAL_0_1.json`: exactly 31,788 profiles, 3,509 color-feasible, including previously **184** dual-owner-line-completion source-INCOMPLETE profiles. Report specifically how many NEW conditional race closures occur among those 184; do not add to Level2 best-move coverage.
4. Include original empty `c1/c2` A=B=4 target colors c1=[1,1,1,1], c2=[0,0,0,0]. P0's fourth future stone is necessarily on its fourth own turn at relative rank7, while P1's fourth is on relative rank8. The previous source conservatively returned DUAL_RACE_INCOMPLETE; this new bound should certify P0 first-win for **this fixed profile**, not from the empty real root under unknown strategies.
5. Preserve any false first-winner claim or rank interval mismatch as a negative durable research artifact. Node26 CI and external mechanical proof checking separately qualified only when run. No authority promotion, solver merge, or new original best move for canonical `44444` claimed.

## 5. Fundamental epistemic limit

The proof eliminates FIRST-WINNER race chronology for some **prescribed owner allocations**, not adversarial allocation selection. The underlying full-game strategic problem still quantifies over opponent-conditioned next actions; event-owner patterns with different first heads are not automatically equivalent. The physically independently falsified rank34 trace/strategy counterexample remains controlling. Future work must derive an observation-sensitive source response-fiber invariant, not pass off a set of fixed-trajectory payoff checks as a universal solver.
