# Full-future W/D/L comparison without continuation evaluation: source-only two-ply ownership-swap simulation

**Date:** 2026-10-17 Pacific. **Canonical research owner:** `research/semantic-quotient`.  
**Research direction:** Josh Oshiro.  
**Status:** Exact finite-rank structural WDL preorder theorem for same-support source residual states; an explicit original-source two-ply diamond constructor and independent exhaustive 4×3/4×4 physical/q WDL controls. **Scoped full-future conditional continuation comparisons, NOT a full nonbranching root solver.** No new game-theory authority or merge.

## 1. The correct objective and prior negative result

The owner requests ELIMINATING independently expanded strategic alternatives, not simply optimizing CNF/BDD compilation depth. The residual `q=(h,R0,R1)` gameplay/cofactor/terminal core is mathematically complete; the historical *chronological* move7/move8 column completion and its short-horizon defensive sets are already solved.

The preceding exact P1 universal-obligation dual antichain reduces **one-layer** reply-signature classes, but cannot be promoted to unrestricted value identity. Legal 4x3-c3 source `111` has P1 replies 2 and 3 with identical short-horizon P0-answer signature 0x0 yet exact unrestricted P0-relative WDL +1 and 0. Full 4×3/4×4 censuses found 220/22,380 such bounded-equal but full-WDL-unequal reply pairs. This refutes the simple shortcut that all seven P1 move6 alternatives at `44444`, whose bounded masks are zero, have the same eventual value.

We therefore sought a **source-only certificate whose conclusion really applies through all remaining moves**.

## 2. Same-support residual-favorable order: an exact full-future theorem

For any normalized minimal residual antichain R of remaining future winning requirements, define the monotone completion upset:

    U_R(S) = 1 iff some r in R is contained in S.

For two legal NONTERMINAL q states A,B with exactly the same support/column heights, mover and remaining future-cell domain, define

    A <=_P0 B  iff
        U_R0(A) subseteq U_R0(B)     [P0 no weaker in B]
      and U_R1(B) subseteq U_R1(A).    [P1 no stronger in B]

**Finite generator lemma:** `U_X subseteq U_Y` iff for every residual generator x∈X there exists y∈Y with y⊆x. Proof: testing the monotone upset at S=x proves necessity; an arbitrary S containing x also contains y, proving sufficiency. Empty generator families are handled vacuously. This is a finite, source-local inclusion test—no query of a solved WDL label.

**Theorem MONOTONE-Q-WDL (ordinary first-win/draw game).** Under the qualified owner/cofactor/terminal semantics, `A <=_P0 B` implies `V(A) <= V(B)` for the **unrestricted** exact P0-relative WDL value, at ANY finite remaining rank.

**Proof sketch with all relevant guards:** Legal landing columns are identical because heights are identical. On a P0 move at common landing x, owner-true contractions `U_0'(S)=U_0(S∪{x})` preserve the first upset inclusion, while P1 blocker deletions `U_1'(S)=U_1(S)` for future sets avoiding x preserve reverse inclusion. The dual rules hold on a P1 move. Immediate P0 first win in A implies the same first win in B; immediate P1 first win in B implies that first win in A. Any other asymmetric immediate terminal is ordered in the favorable direction, and full-board nonwinning draw happens at the same rank/support. Thus either terminal values compare appropriately, or the nonterminal child states remain in `<=_P0`. Induct on remaining empty cells. When P0 moves, max over the same legal columns preserves the order; when P1 moves, min over the same legal columns also preserves it. No actual future game continuation is inspected to establish the theorem.

**Exact equality case:** If both `A<=_P0 B` and `B<=_P0 A` hold, their P0 and P1 *upsets* coincide. Normalized minimal antichains are the unique generators of those upsets, so A and B have the same exact residual-q behavior. Their unrestricted W/D/L and **complete future optimal action sets** are identical under the common literal support. **One-way relation proves only weak value dominance**, not strict value difference and not permission to erase possibly tied optimal labels.

This is a useful source-local specialization of the project's established same-support favorable-order / q-congruence principles, not a new general theory of perfect-play order.

## 3. The two-ply source-only ownership-swap diamond

Fix legal nonterminal q with **P1 to move**, two distinct currently legal columns b,c, and their ORIGINAL source landing cells `x_b=(b,h_b)`, `x_c=(c,h_c)`.

Consider the conditioned histories:

    BC : P1 plays b, P0 responds c
    CB : P1 plays c, P0 responds b.

When BOTH histories stay nonterminal, each reaches **the identical support `h+e_b+e_c`**, because the two columns are distinct. Ownership differs, so their residuals are not presumed equal.

The exact original-source residual antichains, with `Min` normalized by inclusion, are

    R0_BC = Min({r \ {x_c}: r in R0(q), x_b notin r});
    R1_BC = Min({r \ {x_b}: r in R1(q), x_c notin r});

    R0_CB = Min({r \ {x_b}: r in R0(q), x_c notin r});
    R1_CB = Min({r \ {x_c}: r in R1(q), x_b notin r}).

These follow by owner-true contraction / opponent-blocker deletion, using ONLY original source residual generators, not producing intermediate q or enumerating any later action. First-win-before-next-move and full-board draw are hard exclusions from this nonterminal comparison, rather than inference by a phase bit.

Check the two inclusions of Theorem MONOTONE-Q-WDL by the **finite source-generator subset criterion**:

    R0_BC upset subset R0_CB upset,
    R1_CB upset subset R1_BC upset.

When both hold, output `V(BC)<=V(CB)`. Check both directions and output exact full-future equality when both hold. Every certificate names the original two-move labels, common support, source generator containments, and terminal exclusions. This has at most W(W-1)/2 candidate unordered column pairs at a source and finite source antichain subset work; it never runs a minimax recursion in the producer.

**Critical scope:** This proves ordering/equality of the TWO CONDITIONED **P1,P0** continuation games, not of the unrestricted P1 action b vs c. For the latter, P0 may make MANY responses; a full alternating simulation requires a valid matched response for EVERY relevant P0 action under the right quantified direction. The diamond contributes one such correspondence (b then c, versus c then b), not a complete matching policy. A root best-move set still needs full action-value proof, with all ties intact.

## 4. Frozen experiments and genuine independent WDL controls

Precommitted plan:
`research/isograph/discovery/2026-10-17-dual-obligation-quotient/TWO_PLY_OWNER_SWAP_SIMULATION_PLAN_0_1.md`.
Source-only producer:
`two-ply-owner-swap-simulation.mjs`.
Independent full physical/q validator:
`two-ply-owner-swap-control.mjs`.
Machine evidence:
`TWO_PLY_OWNER_SWAP_RESULTS_0_1.json`.

The independent validator enumerated every legal first-win-stopped physical source position on two boards, reconstructed q separately, checked BOTH intermediate physical/q cofactors and their exact resulting same-support residual-upset inclusions, then called the qualified exact recursive q WDL evaluator **ONLY on already frozen structurally certified pairs**. This computes no strategy/solved label in the candidate; it is a value falsifier of the source-only theorem.

**RAW DISTINCT PHYSICAL SOURCE POSITION counts:**

| Board | Eligible nonterminal two-ply diamonds | Equal full-future residual states | One-way full-future WDL dominance | Wrong certificates |
|---|---:|---:|---:|---:|
| 4×3 Connect3 | 1,530 | 72 | 354 | **0** |
| 4×4 Connect4 | 84,026 | 17,642 | 24,644 | **0** |

Many different physical positions have the SAME exact residual q. Because the owner's goal is *actual independent strategic work saved*, these repetitions **must not be counted as independent algebraic branches**. After deduplicating by canonical q key + unordered b,c:

| Board | Unique q-and-action diamonds | Equal future states | Weakly ordered future states | Certified fraction |
|---|---:|---:|---:|---:|
| 4×3 Connect3 | **1,522** | **72** | **352** | **27.86%** |
| 4×4 Connect4 | **39,798** | **2,372** | **9,380** | **29.53%** |

Complete 4x3: 4,631 physical nonterminal states / 2,208 P1-to-move sources / 1,786 distinct P1 q values; 6,120 independently checked double-q cofactor transitions and 2,944 value-reference transitions. Complete 4x4: 134,289 physical nonterminal states / 67,992 P1 source positions / 16,950 distinct P1 q values; 336,104 independent double-cofactor transitions and 36,088 value-reference transitions. Across both full control runs: zero source upset inclusion mismatches, zero false weak WDL order certificates, zero false equality certificates.

Independent value comparisons reveal 152 unique 4x3 one-way structural certificate pairs and 4,006 unique 4x4 pairs had **different** full-game WDL values. These strict numeric gaps were learned by the independent full-WDL validator, **NOT deduced as strict gaps by the producer**. The source proof certifies <= only. Other one-way structural comparisons can tie in value, so preserving potential tied-best labels remains obligatory.

Concrete legal source `1112234` on 4x3 Connect3 gives:

    BC = P1 column2, P0 column3: exact full WDL for P0 = +1
    CB = P1 column3, P0 column2: exact full WDL for P0 = -1

The original-source residual-inclusion theorem certifies **only** `V(CB) <= V(BC)`; independent exact-q solved values expose this particular strict gap. A separate `1112244` source gives structurally certified future-state equality for P1/P0 owner-swap pairs 2,4 versus 4,2 (full value -1), without asking a value oracle in construction.

## 5. Standard 7x6 canonical 44444 test and failure boundary

At `44444`, P1 moves turn6 and P0 turn7. The two-ply source owner-swap operation checked all 21 unordered distinct legal column pairs. Each remained nonterminal, but **all 21 were INCOMPARABLE** under this particular untransported favorable-upset partial order; 77,900 counted source generator tests/comparisons, no successor q materialization or future game search.

This is useful negative evidence: the direct source partial order is **not sufficient** to collapse the unsolved `44444` P1 move6 reply classes or prove any turn7 full-WDL order by itself. Only the previously established horizontal-reflection classes remain fully justified there: `{1,7}, {2,6}, {3,5}, {4}` for P1 move6 (four full-future classes from seven actions). The 7→1 *bounded* zero-signature quotient is NOT WDL equivalence. The unrestricted root/action value still remains UNKNOWN [-1,+1].

## 6. Stronger next gate: MATCHING all adaptive responses

The two-ply swap proves a source-local **value-preserving diamond**. To turn it into **root strategic branch elimination**, the P1-vs-P1 comparison must satisfy the P0 mover's max quantifier. For two P1 first choices b_h (candidate harder) and b_e (candidate easier), the sufficient full-game simulation condition is:

    For EVERY legal P0 response a_h after b_h,
      THERE EXISTS legal P0 response a_e after b_e
      with source-certified V(q[b_h,a_h]) <= V(q[b_e,a_e]).

Then P0's MAX values satisfy `V(q[b_h])<=V(q[b_e])`, so in P1's MIN over initial replies, b_e is redundant for obtaining the **scalar** optimal WDL (but its literal move label might still TIE and cannot be discarded from the complete best-move set without a separate exact strict/equality result). Analogous alternating action-matching conditions apply to deeper P0/P1 choices; the project has a conditional full-future alternating-simulation theorem and a completed residual-core foundation.

Under the current SAME-SUPPORT operator, for distinct initial b_h,b_e the *only* matching pair with identical two-ply column supports is `a_h=b_e, a_e=b_h`. A P0 mover often has many other legal actions; therefore one diamond cannot generally discharge its full universal matching requirement. A source-supported **transport or conditional simulation across different supports** (beyond trivial reflection), with capacity, first-win, and future resource guards, is the next real mathematical invention required.

**Research selection:** do not retreat to deeper output-cone BDD, QBF compression, or testing unknown game-tree paths. Develop a proof-carrying source residual **multi-action matching/simulation** (possibly G2 support-fiber transport combined with the P0-favorable upset order) that discharges ALL opponent replies at once without computing their values. First check it deductively at the source operator level; then falsify on complete 4x3/4x4 WDL and tied-optimal references, legal `223` quantifier-order and the `111` bounded-equivalence counterexample. Count actual omitted future-value queries and full proof work.

**Strict original resource envelope:** 60,000 nodes, 300,000 nontrivial subset/Boolean operations, 10,000 support representatives, 15s per source compile. No full-game 7x6 WDL claim, no new semantic authority, no merge.
