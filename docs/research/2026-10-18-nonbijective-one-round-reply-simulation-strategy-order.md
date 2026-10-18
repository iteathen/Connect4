# Non-bijective one-round opponent-reply simulation: source-only WDL order for unequal-height first actions

**2026-10-18 — FROZEN before source producer and independent true original 7×6 physical WDL/V4 tests.** Research owner `research/semantic-quotient`. Qualified IsoGraph gameplay authority 1.2 unchanged. This is a direct mathematical extension of the already validated **uniform bijective opponent-reply fiber** source theorem and existing qualified **full-future same-support residual upset WDL monotonicity**. Target: find one NEW Level2-best ORIGINAL 7×6 q with **three or more** currently legal moves, beyond the same-root immutable V4 source, while evaluating ZERO strategically different future game WDL values in producer. If absent on the preregistered bounded corpus, preserve null/negative and stop this candidate family.

## 1. Why the previously frozen bijection is stronger than needed

Fix genuine first-win-stopped q=(h,R0,R1), W,H,K symbolic, mover p=n mod2. For distinct currently legal first columns a,b (each nonterminal; n+2<WH), denote ordinary unrestricted post-first-action P0-relative WDL values J_a,J_b∈{-1,0,1}. Let L_a and L_b be their sets of legal *opponent second-move literal columns*, derived algebraically from root h. Each opponent second action r,s has an exact full-future P0-relative value V_ar,V_bs, but the SOURCE MUST NOT calculate these scalar values or expand a game state.

In a two-player perfect-play game the first-action values satisfy:

    if p=P0:  J_a = MIN_{r∈L_a} V_ar, J_b = MIN_{s∈L_b} V_bs.
    if p=P1:  J_a = MAX_{r∈L_a} V_ar, J_b = MAX_{s∈L_b} V_bs.

**NONBIJECTIVE COVERAGE THEOREM:** Let E(r,s) be any original source proof that V_ar≤V_bs, including first-terminal-safe value bounds. Then

    when p=P0:  [∀ s∈L_b  ∃ r∈L_a: E(r,s)] ⇒ J_a≤J_b;
    when p=P1:  [∀ r∈L_a  ∃ s∈L_b: E(r,s)] ⇒ J_a≤J_b.

Proof: If p=P0, choose s* minimizing right value. The ∀s∃r certificate supplies r* with V_a,r*≤V_b,s*=J_b, and J_a=min_r V_a,r≤V_a,r*≤J_b. If p=P1 choose r* maximizing left value; get s* with J_a=V_a,r*≤V_b,s*≤max_s V_b,s=J_b. The only source obligation is a reply relation covering ONE side, **not** a bijection, nor a chosen root opponent strategy.

This corrects a common false inference: for p=P0 checking every *left* r is insufficient to upper-bound J_a against J_b; for p=P1 checking every *right* s is insufficient. Preserve exact min/max orientation.

## 2. One reply-pair source E(r,s), no strategic future values

For original columns a,b with first landing x_a=(a,h_a) and x_b=(b,h_b), and current legal opponent replies r after a and s after b, second landing events are y_ar=(r,h_r+[r=a]) and y_bs=(s,h_s+[s=b]).

Original first-win guard: first a,b do not immediately win for p and are non-full. Second-opponent-mover o=1-p can first-win immediately on y_ar or y_bs if and only if the ORIGINAL R_o contains singleton {y_ar} not already blocked by x_a, respectively {y_bs} not already blocked by x_b. (The current first player's stone can prevent an o line.) A second move by o cannot complete a new p line. When either pair is terminal, source may assert E(r,s) only when logically safe:
- both terminal at o's same WDL: exact equality;
- left terminal and o=P1: left value −1≤anything;
- right terminal and o=P0: anything≤right value +1;
- otherwise the pair is *unproved* unless an independent full-terminal source theorem applies.
No numerical future-game oracle.

For NONTERMINAL reply pairs, let h^ar=h+e_a+e_r, h^bs=h+e_b+e_s. A bijective gravity action transport of full future games is possible under a simple **whole-column permutation π** only when the histogram of heights in h^ar and h^bs is equal. If histograms differ, this structural E fails (INCOMPLETE; this is not proof V_ar>V_bs). If equal, choose ONE deterministic π by sorting original physical columns by the pair (post-two-ply height, original literal column) on left/right and matching equal-height class ranks. This is a SINGLE stable class map, not a search or enumeration of permutations. π sends each currently remaining future column chain in the left conditioned game bijectively to a same-height remaining future chain in the right conditioned game; action alphabet mapping and first-win move rank are preserved.

**Optional fixed specialized π:** for the same (r,s), if both h^ar and h^bs are related under EXACT whole-board horizontal reflection, use that one fixed map; else if a single original root first-column transposition (a b) transports h^ar→h^bs, use it; else stable height-class map. This is a deterministic closed priority, not branching strategy game evaluation; it is at most three explicit source maps, no static assignment search or new game values. A source-positive certificate must specify precisely which π was chosen. (If stable fails generator inclusion, do NOT backtrack and try other permutations.)

RAW original source cofactor requirement families after those TWO fixed owner-tagged events:

    F_t(a,r) = { G\{x_a} : G∈R_t, y_ar∉G } if t=p,
               { G\{y_ar} : G∈R_t, x_a∉G } if t=o.

Similarly F_t(b,s). No normalizing, materializing or numerically evaluating q_ar or q_bs. Let πG be the fixed original cell-index permutation (column π, same original row).

The familiar current full-future favorable-upset finite mask containment proof suffices:

    for each G∈F_0(a,r) there is H∈F_0(b,s) with H⊆πG,
    for each H∈F_1(b,s) there is G∈F_1(a,r) with G⊆π^{-1}H.

These imply V_ar≤V_bs by the qualified same-support original source WDL monotonicity, including full future alternating P0/P1 choices and first-win stopping. π need not map the original first a to b separately: only the TWO-PLY future height supports must map. This strictly enlarges the admissible source comparison mechanisms beyond original first-action height-preserving swaps/reflection and the previously frozen single **bijective** reply fiber ρ(r)=πr.

## 3. Source ONE root Boolean reply relation

Form at most W×W current-opponent-label TRUE/FALSE relation bits E(r,s) from direct original terminal facts and one deterministic fixed post-two-ply column-map generator containment. No source construction of alternate q, no WDL valuation, no future policy tree. Determine ordered first-action edge a→b by one finite reply coverage condition:

    if p=P0:  (for every right reply s, OR_{r in left L_a} E(r,s))=TRUE;
    if p=P1:  (for every left reply r, OR_{s in right L_b} E(r,s))=TRUE.

This is one source-local finite **reply COVERAGE** algebra, not one semantic continuation per pair. It can be fused using W-bit reply masks; upper bound ~49 static (r,s) conditions per root action pair, each guarded by original R0/R1 generator subset checks. The source never invokes min/max over computed scalar game outcomes. Unknown E cannot be treated as false WDL relation or true loss, only as missing proof evidence.

Take transitive closure on the CURRENT <=7 root literal action labels for SOUND proved J_a≤J_b, select one global upper extremum if P0 or lower if P1. Any direct immediate first p WIN root labels or full terminal require a separately qualified guard, or leave this comparator INCOMPLETE.

## 4. Strict 3+-legal source success / negative gate

This source relation must be **frozen as theorem and implementation before inspecting physical WDL**. The independent 69-original-K-line physical reference shall:
1. Generate a PREDECLARED original true7×6 first-win-free q corpus focused on roots with **at least 3 legal columns**, including BOTH mover parities; freeze source positives, reply-pair map/source generator witnesses, first action candidates and root fingerprints BEFORE scalar WDL or V4 source evaluation.
2. Independently verify source-positive edges J_a≤J_b with ordinary physical WDL (budgeted ranks ≥~29), and verify each source-selected BEST root first literal label. Compare same q to pinned unchanged V4 using fixed-swap dependency, record new SOURCE BEST roots beyond V4 with actual >=3 legal columns.
3. Include known legal original rank34 `2532541156412471331416356736376672` (4 legal) where fixed two-round same endpoint DOES NOT imply J2=J5; source must not assert a false J2≤J5 or identify a wrong winner. Include `44444` (7 legal), where success would be valuable but NEVER fabricated.
4. If no physical-sound V4-marginal **3+-legal BEST root** arises, preserve the null result and STOP this candidate extension. It is not sufficient merely to find new *edges* on 3+-legal q or more 2-legal samples. No ad hoc tuning of guard/map precedence after seeing oracle labels.
5. Node26 CI and external independent proof assistant remain NOT RUN unless explicitly executed; qualified IsoGraph 1.2 and active solver branches untouched.

## 5. Mathematical warning

A SOURCE proof depending on a different deterministic π for each (r,s) is a *nonuniform original response simulation relation*. This is legitimate for the **weak scalar first-action order** because its ∀∃ direction is justified, but it is NOT a complete behavioral isomorphism between the two first-action games and does not license quotienting their future state identity or claiming tied moves. Proof obligation is only J_a≤J_b; simulation of each selected pair's unrestricted full future is supplied by prior true same-support monotone-q theorem.

The static source complexity grows with the number of currently legal ROOT replies and original generator masks; it does not reduce total adversarial game solving for all 7×6 q, but offers a falsifiable exact extension where root-height-preserving π was previously too strict.
