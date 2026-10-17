# Guarded reciprocal forced-response exchange: promote two-ply XOR diamond to full root action WDL order

**Frozen 2026-10-17 before independent 7×6 reference results.** Canonical research owner research/semantic-quotient. Owner objective EXACT unrestricted (V,M*) with ZERO strategic branching. W,H,K retained symbolically; experimentation and positive claims apply first to true 7×6 Connect4 (W=7,H=6,K=4) only. **Status: narrowly guarded source-only root WDL-order/equality candidate; NOT a general solver or new IsoGraph authority.**

## 1. Problem solved in this narrowly scoped theorem

The earlier source two-ply diamond for q after x,y versus y,x compares their unrestricted WDL under a same-support residual-upset inclusion, but only after conditioning on the two replies. It does NOT generally compare the original first actions because the opponent might choose a different response. Here we construct a fully qualified circumstance in which **the reply IS semantically forced by terminal threat logic**, so exact conditioned diamond inequalities become real source-only root-action WDL inequalities and, when mutual, complete equal-value labels without querying either continuation game.

Let q=(h,R0,R1) be legal and NONTERMINAL, p=n mod2 to move (absolute original player bit), o=1-p. Let distinct legal literal columns a,b have currently gravity-playable x=(a,h_a), y=(b,h_b). No source original first win may have already occurred. Let q[a] denote symbolic first-action cofactor, with p owning x. Check the following SOURCE-ONLY **forced-reply guards**, each independently and symmetrically:

1. Neither first action a nor b immediately wins p (if one does, existing source exact action win rule already applies).
2. In q[a], the set of DISTINCT currently playable p singleton winning target cells is **EXACTLY {y}**, and in q[b] that set is **EXACTLY {x}**. The opponent's move may cover the unique threat only by playing the named other column. The cells are physically playable and different columns; no "eventually accessible" proxy.
3. In each q[a], q[b], opponent o has NO currently playable immediate winning singleton target ANYWHERE. This rules out an alternate immediate counter-win that would make the threatened response nonbinding.
4. Both conditioned histories a,b and b,a are nonterminal (if terminal, source terminal value is handled separately; do not mis-transport program identity past game stop). Same support after two moves holds because a≠b and both were initially legal.

Then, for **every other opponent reply c≠b** after a, o fails to occupy y, and cannot win immediately under guard 3, so p plays y NEXT and wins first. Thus all c≠b lead to exact p WIN. At opponent o's turn, choosing b is at least as favorable to o as a move that permits p a certain win. Therefore for unrestricted ordinary first-win WDL:

    V(q after a)=V(q after a,b).
    V(q after b)=V(q after b,a).

This is an exact two-ply forced macro law, with no evaluated alternate games or speculative reply strategy graph. It remains valid if b is the only legal response (trivial), but the interesting case is multiple opponent legal actions.

## 2. Original-source XOR diamond / residual order

Both q_ab and q_ba have the SAME support h+e_a+e_b and same next mover p. They differ only in which original player owns x and y: exactly the GF2 adjacent-event owner-swap.

Directly from original q and original source R_i, construct after the two actions a,b:

    R_i^{ab} = Min { G \ {x} : G∈R_i, y∉G }   if i=p;
    R_i^{ab} = Min { G \ {y} : G∈R_i, x∉G }   if i=o.

In q_ba interchange x,y in that formula. No later game q/value is evaluated. First-win and board-full terminal checks guard the applicability. Every original G containing both x and y is blocked in BOTH orders, every G containing NEITHER survives identically; only the **ODD incidence** generators with indicator [x∈G] XOR [y∈G]=1 create differences (up to normalization). This is a source GF2 **exchange sensitivity filter**, not a claim that game value itself is XOR-linear.

For same support define A <=_P0 B iff
 - for every G∈R0^A, some F∈R0^B satisfies F⊆G (P0 has all A win continuations plus more in B);
 - for every G∈R1^B, some F∈R1^A satisfies F⊆G (P1 can win no more easily in B).

By the previously proved first-win guarded source-upset isotonicity theorem,

    A <=_P0 B  =>  unrestricted V(A) <= V(B).

Together with BOTH forced-reply guards:

    q_ab <=_P0 q_ba   => V(q after a) <= V(q after b).

Mutual <= in both directions implies exact scalar WDL equality of original actions a and b even though their ONE-PLY future games need NOT be program isomorphic: it is a true **VALUE EQUIVALENCE caused by reciprocal forced reply**. The resulting class may be ONE logical outcome query, but to follow a representative immediate child as a fully behaviorally isomorphic state would be UNSOUND: the equality relies on the forced two-ply macro. Following the macro endpoint is permitted only with these guards and correct source/proof context.

A one-way order is only a weak WDL inequality, never certifies strict inferiority or rules out tied optimal columns. Any exact output must still reconstruct the full M* by sound source intervals and previously proved complete-optimal-set criterion; if multiple unresolved non-equivalent classes remain, return INCOMPLETE, never branch to value them.

## 3. Source-combinatorial necessity for reciprocal threat

In the particularly instructive case where neither x nor y is already p's immediate singleton, a common original residual two-cell requirement {x,y} is sufficient to create the reciprocal singletons after playing either x or y (provided no additional p singleton targets). This is the binary strategic interaction hinted by the owner: a single geometrically constrained two-cell hyperedge carries an XOR *choice* of which cell goes to p, while the opponent is forced to occupy the other. Because both conditioned histories have one p and one o placement, their common original {x,y} is permanently blocked in BOTH orders. The value difference is entirely governed by the remaining residual generator asymmetries and first-win guards.

This does NOT prove a generic "XOR of two columns" winner law; K=4 original line structure, alternate threats, opponent counterwins and timing can still change the value.

## 4. Frozen falsification on true standard7x6 only

1. Construct real 69 winning lines from W=7,H=6,K=4 and sample reproducible legal first-win-stopped 7×6 positions from early/middle/late ranks including source canonical 44444 and 4444442. Produce full source q via exact antichains without solved-game values.
2. For every unordered distinct first-action pair (a,b) scan source-only gravity-playable singleton threats after both first action cofactors. Verify guards 1..4, derive q_ab/q_ba from ORIGINAL source q, count the exact XOR odd-incidence residual generators and two opposite full-future WDL upset-order inclusions. No independent future game-valuations in source.
3. When source certifies equality or weak inequality, take a genuinely independent PHYSICAL ordinary unrestricted 7×6 game reference on near-terminal positions and compare the **UNRESTRICTED ORIGINAL first-action values** V(q[a]), V(q[b]) — NOT merely the conditioned two-ply values. Confirm any full best-mask only when sufficient separate source constraints classify all labels. Preserve raw counterexamples and first-win failures.
4. Check q_ab and q_ba identical source h and normalized residual generator families when claimed; compare their physical first-win-stop behavior after the conditioned two plies. All value claims must preserve winning move timing, no colored board reconstruction needed in producer.
5. Record actual 7×6 canonical 44444 (P1 move6), all literal labels, exact R0/R1 48/42, and likely lack of reciprocal enabled threats at rank5; if no certificate, remain INCOMPLETE. No smaller-board primary positive extrapolation.
6. Count candidate tested source labels, forced macro matches, mutually value-equal pairs, one-way WDL orders, genuine new action tie certificates beyond simple horizontal reflection/fixed future-program transporter. If no useful cases exist on 7×6, explicitly preserve negative evidence and do NOT redirect to CPU/memory or QBF/BDD tuning.

**Epistemic boundary:** Mathematical deduction under guards; measured 7×6 usefulness and independent original-root-WDL reference remain pending until after this frozen commit. No new universal zero-fanout solver, full 44444 WDL or all tied optimal moves inferred by writing the theorem.
