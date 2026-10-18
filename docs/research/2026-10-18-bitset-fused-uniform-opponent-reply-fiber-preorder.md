# Bitset-fused source-only uniform opponent reply-fiber WDL preorder

**2026-10-18 — exact algebraic reformulation FROZEN BEFORE independent original W7H6K4 controls.** Research owner `research/semantic-quotient`; gameplay authority IsoGraph 1.2 unchanged. This builds directly on the frozen one-round alternating reply transporter `docs/research/2026-10-18-uniform-opponent-reply-fiber-source-action-preorder.md` and its separate physically controlled 12,500-original-root screen. That screen produced 112 previously unproved weak first-action inequalities (against direct one-ply swap/reflection), and 11 new physically confirmed single-best original move roots where immutable V4 was INCOMPLETE on the **same original q**. This theorem aims to remove the per-reply raw two-ply cofactor construction from the SOURCE operator itself.

**Strong scope guard:** This proves a *weak ordinary perfect-play WDL order between two current literal first actions*. It is NOT a general solution for all q, nor complete all-tied Level2 set, nor new ordinary root scalar WDL. It may inspect finite original generator incidence and W legal ROOT columns but must evaluate zero future game values and materialize zero alternative strategic q states.

## 1. One fixed root column transporter and direct root reply-bit algebra

Given original genuine first-win-stopped q=(h,R0,R1), n=Σh, current player p=n mod2 and o=1-p, choose distinct original legal first actions a,b and ONE deterministic root-height-preserving column involution π with π(h)=h and π(a)=b. Allowed π are the one swap (a b) when equal heights, or exact full horizontal reflection when h is reflection-invariant. No permutation search or multiple future q valuations.

Skip when either first p placement is already an immediate original FIRST WIN, or when n+2≥WH so the two-ply comparison can reach full-board DRAW. For every root reply r still gravity-legal immediately after first action a, π maps it to a legal reply π(r) after b. Original first/second landing event identities are given DIRECTLY by root physical heights:

    x=(a,h_a),  x'=(b,h_b);
    y_r=(r,h_r+[r=a]),  y'_r=(π(r),h_(πr)+[πr=b])=π(y_r).

Let `D` be the W-bit SOURCE bitmask of all actually legal opponent reply labels r after a. It is computed ONCE from root h and a, not from distinct future q states.

An opponent reply r that immediately makes a FIRST WIN on either side is identified by original opponent singleton winning generators in R_o (after current p first blocks x or x'). Use safe P0-relative terminal inclusion: both terminal gives equality (same opponent), left immediate P1 WIN (−1) makes `J_(a,r)≤J_(b,πr)` automatic, and right immediate P0 WIN (+1) makes the inequality automatic. All other one-sided terminal comparisons are unsupported (must FAIL the ordered pair). Subtract terminal-safe r from D to get a single NONTERMINAL reply mask `D_N`. No per-reply game state is materialized.

## 2. Source raw residual contraction as one mask relation

For each original physical source generator G belonging to owner s∈{0,1}, define the result of two owner-alternating fixed events symbolically by

    C_s^a(G;r) =
       G\{x}    if s=p and y_r∉G;
       G\{y_r}  if s=o and x∉G;
       ABSENT     otherwise.

Define C_s^b(H;πr) analogously for first event x' and matched reply y'_r.

These are literal algebraic expressions over original source winning-line masks. **The SOURCE must never store a separate future-game q or separate raw generator family per opponent reply.**

Define the original W-bit root reply-liveness predicate

    L_s^a(G) = { r∈D_N : C_s^a(G;r) is not ABSENT },
    L_s^b(H) = { r∈D_N : C_s^b(H;πr) is not ABSENT }.

For P0 weak favorability, each original left P0 requirement G must have a matching right requirement H, potentially a *different H on different root replies*, but all alternatives are absorbed in ONE literal reply bitset:

    Cover_0(G,H) = { r∈L_0^a(G)∩L_0^b(H):
                       C_0^b(H;πr) ⊆ π(C_0^a(G;r)) }.

For P1 reversed favorability, each original right P1 requirement H must have a matching left G:

    Cover_1(H,G) = { r∈L_1^b(H)∩L_1^a(G):
                       C_1^a(G;r) ⊆ π(C_1^b(H;πr)) }.

**Exact finite SOURCE coverage clauses:**

    (∀G∈R0)    L_0^a(G) ⊆ OR_{H∈R0} Cover_0(G,H),

    (∀H∈R1)    L_1^b(H) ⊆ OR_{G∈R1} Cover_1(H,G).

These inequalities involve ONLY W-bit REPLY MASKS of ORIGINAL literal labels, and ORIGINAL fixed R0/R1 generator masks with one-time contraction/blacking; the OR is ordinary finite bitwise OR, not game-value aggregation or a selected best opponent branch. Source checks all possible reply conditions **simultaneously** as inclusion of two bitsets, never constructs `q_ar`, `q_b,πr`, or any recursively evaluated response policy.

## 3. Strategy-preserving WEAK WDL proof

For each r in terminal-safe reply mask, the original first-winner values are directly ordered. For each r in D_N, the two source bitset inclusion clauses imply the previously proved original same-support residual upset inequalities after the paired two fixed moves. Thus the unrestricted future q values satisfy

    V(q after a then r) ≤ V(q after b then πr),

without EVER computing those values. Since π maps the entire opponent reply alphabet bijectively, the quantified MIN (opponent P1 when p=P0) or MAX (opponent P0 when p=P1) preserves the order. Hence

    J_a(q) ≤ J_b(q)

for unrestricted ordinary P0-relative perfect-play action values.

**This is a true online observation-reply TRANSPORT rule:** if the opponent actually chooses r after first action a, its corresponding action after b is ρ(r)=π(r). The proof handles ALL observed replies; it does not mistake equal completed four-move sequences for strategy equivalence. The earlier original rank34 trace-diamond counterexample is not refuted or bypassed.

**Important technical distinction:** finite checking of original generator-pair/reply incidence triples is still *STATIC quantified source proof work* (roughly O(W·|R0|²+W·|R1|²)). This is not a universal game solution or elimination of all finite constraints. But there is exactly ONE algebraic source relation per ordered root action pair, with zero separately valued or materialized strategic successor games, one deterministic map, and no solver fallback.

As previously established, take transitive closure over these SOURCE first-action WEAK WDL order edges on the CURRENT literal legal action-label set. For P0, a SOURCE global upper extremum is a valid current best original action; for P1, a global lower extremum. If no such extremum, emit INCOMPLETE. Failure of a coverage clause is not a proof that J order is false.

## 4. Frozen exact original 7×6 regression and marginal falsifier

1. Freeze a NEW SOURCE ESM producer implementing W-bit reply-liveness masks and generator-pair OR coverage directly. No future reply-specific cofactor family arrays, no alternative q, game V or matching over WDL outcomes. Count root generator-pair × literal label scalar subset tests, terminal-safe masks and proof edges. Keep the earlier frozen per-reply source untouched.
2. Reuse exact frozen SOURCE-only `STANDARD7X6_UNIFORM_REPLY_FIBER_12500_PREORACLE_COMPACT_0_1.json` as pre-oracle corpus, including 105 roots with novel weak WDL edges and 12 direct-source best-action candidates. SOURCE bitset-fused operator must prove at least EVERY one of the previously frozen positive edges and first-action best certificates, with no additional unsupported edge inferred by algebraic aggregation.
3. Independently check the new SOURCE edges against actual physical standard 7×6 first-win-stopped game oracle and immutable V4 on the EXACT same q, whose earlier frozen outcome is `STANDARD7X6_UNIFORM_REPLY_FIBER_NEW_ORDER_AND_V4_MARGINAL_PHYSICAL_RESULTS_0_1.json`: 112/112 new direct-over-oneply source edge inequalities physically correct; 12/12 one-best actions physically correct; 11/12 where V4 was INCOMPLETE on same q. Any new source positive not in the old source proof must be separately physically checked before promotion.
4. For canonical genuine history `44444`, source may reproduce mirror-equality edge pairs; do not call an uncovered across-class action BEST. Root ordinary WDL and qualified best column remain UNKNOWN/INCOMPLETE.
5. All artifacts must be committed to research/semantic-quotient with immutable source and negative evidence. No solver/main merges or IsoGraph 1.2 gameplay promotion. Maintained Node26 CI and third-party independent formal proof checker NOT RUN until explicitly executed.

## 5. Honest boundary

The owner’s full zero-strategic-branching Level2 goal is still OPEN on arbitrary 7×6 q. This is ONE valid finite-rank FULL-FUTURE strategy-order certificate that can produce NEW best actions without independently evaluating successor games, but it requires enough source-mask inequalities to cover every root opponent reply. The next high-risk research direction would need a broad source-invariant relationship that covers all current legal first actions without static reply-mask scanning or rank-limited transporter domains. Do not mistake our new 11-same-q results for such a total law.
