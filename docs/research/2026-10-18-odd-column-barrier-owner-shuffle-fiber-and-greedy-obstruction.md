# A nonlocal shuffle fiber and a minimal causal scheduling obstruction on the original 7×6 board

**2026-10-18, FROZEN BEFORE physical controls.** Canonical research owner: `research/semantic-quotient`. Mathematical status: exact finite combinatorial lemma and a candidate guarded original-source application, NOT a Level2 best-action certificate or a universal source strategic solution. Current qualified game-theory authority remains IsoGraph 1.2; original four-ribbon and owner-color projected batch cofactor theorems remain active.

## 1. The precise quotient question

Fix a real first-win-stopped original `q=(h,R0,R1)`, with physical future events in W strict ascending column chains. A hypothetical finite gravity-legal word w of length m has event-owner projection `A_p(w)`, assigning each original played physical cell to its actual alternating-turn owner; equivalently each column has a local owner-bit word. The earlier exact batch theorem proves that equal `A_0,A_1` give the same nonterminal final oriented q **if neither player first-wins inside the word**, and the same ultimate completed source lines regardless of chronology. This is history/sequence equivalence, **not** strategic root-move equivalence.

A plausible shortcut is to generate all equal-owner-projection histories from one via short local color-preserving swaps (three-turn alternating braids or four-turn two-round exchanges). The following theorem proves such a bounded-local presentation is insufficient EVEN on the genuine standard 7×6 board.

## 2. An exact two-element, odd-length column barrier fiber

Take any THREE distinct currently gravity-playable original columns a,b,c from q, with at least one future event in a and b and at least an ODD L>=1 future events in c. Only the following multiset of m=L+2 events is considered: one a event, one b event and L consecutive next events of c. No other future columns are included in this finite **segment**, although they remain available after the segment.

Define two proposed complete segment words:

    u = a c^L b
    v = b c^L a.

These are gravity legal: all c occurrences follow their ascending physical column chain, and a,b each appear once. Let current mover be p=n mod2 and o=1-p.

Since L is ODD, the a and b events in either word lie at odd (1 and L+2) relative placements, both owned by p. The c events are placed in exact positions 2,...,L+1, therefore their owner bits alternate `o,p,o,p,...,o` by their local row ordinal. Both u and v assign precisely the same owner to EVERY original physical cell they place.

**Exact fiber theorem.** Among all gravity-legal permutations w of this very same finite event multiset {a,b,c repeated L times}, the set of w with exactly that original physical owner projection is **{u,v}**, with cardinality exactly TWO.

*Proof.* Since the fixed projection assigns p to both a and b events, both must occur at odd relative positions in any realizing alternating word. Number the L c events by their original gravity order j=1..L. In u each c_j has exactly ONE outer singleton (a) before it, so its absolute owner is determined by parity of j+1. In any w with the same c-event owner, the number `N_j` of outer singleton events strictly BEFORE c_j must be odd, because the c_j placement rank equals j+N_j and must match j+1 modulo two. But `N_j∈{0,1,2}`, hence `N_j=1` for ALL c_j. Therefore exactly one outer singleton is before ALL c events, the other is after ALL c events. The only possibilities are u and v. Gravity has already fixed the relative order of c_j. QED.

**Finite original Connect4 consequence.** On an EMPTY W=7,H=6,K=4 board take (a,b,c,L)=(1,2,4,5):

    u=1444442
    v=2444441.

These are distinct true alternating original 7×6 gravity histories using exactly the same physical cells and same respective owners. The candidate SOURCE terminal guard is: no surviving p generator G⊆A_p, and no surviving o generator G⊆A_o over this segment allocation. At the empty standard root this guard holds: there is no four-in-a-row after either seven-event segment, so both have the SAME final oriented q, not merely equal scalar WDL.

The exact phase-owner fiber of this selected seven-event multiset has only u and v. Their FIRST and LAST literal symbols differ. Any rewrite changing at most a contiguous window of length six or fewer while preserving the exact original per-cell owner projection, this seven-event multiset and gravity legality would have to move through a *third* fiber word, but no third exists. Thus **no sequence of local ≤6-event projection-preserving rewrites connects u to v**, even if arbitrary local 3- or 4-event swaps are permitted. Any local rewrite basis complete for this source colored word fiber must admit at least a 7-event nonlocal operation (or introduce state/auxiliary mechanisms beyond local owner-fiber words).

In general W≥3 and column capacity H≥L for odd L, the same construction has minimum possible nontrivial owner-fiber rewrite support length L+2, so **no universal CONSTANT local window width** handles all heights. This is a bound on local exact trace presentations, NOT an impossibility theorem for a global no-strategic-branching algebra.

The nonterminal SOURCE batch cofactor can be used to obtain identical future q if the guard holds. Without terminal guard, identical eventual colors can still permit two different first winners because of chronological races; never omit that condition.

## 3. A still smaller causal scheduling failure: a legal head can destroy realizability

On the original EMPTY 7×6 board, prescribe this *finite* physical owner-color projection for two columns A=1 and B=2:

    A first future cell: p
    B first future cell: p
    B second future cell: o

The legal alternating sequence `B,B,A` (`221` from empty) realizes this allocation: `B_1=p,B_2=o,A_1=p`. Initially both A and B have currently playable first cells requiring p, but choosing A first leaves the next global turn o while B's next required cell must be p, so NO interleaving consistent with the target projection can continue. Equivalently, `122` is a physically legal gravity move sequence but changes B's owner pattern to `o,p`, so it is not in the specified fiber.

This counterexample falsifies the tempting sufficiency `a projected owner coloring is realizable AND current column head has correct owner => choosing that head retains realizability`. At minimum, realizing an owner-column projection must preserve **future colored release constraints**; greedy selection without such a certificate is invalid. This is a *static schedule-feasibility* distinction, not a Connect4 game-value computation or claim that 1 is a bad actual gameplay action.

## 4. Mathematical consequences for sequence factorization

The following three distinctions must survive any ultimate geometry-unfolded, turn-sequence-eliminated Level2 algebra:

1. **Projection feasibility** — which per-column owner-color words admit any alternating gravity shuffle? Their phase-feasible head choices cannot simply be guessed or treated as independent; the 3-event obstruction shows conditional feasibility.
2. **Trace equivalence** — when legal shuffled words have exactly the same colored physical event allocation, is their fixed-word first winner also the same? First-win needs the dual-completion race bit, while nonterminal batching is exact. The odd barrier shows that phase fibers can require nonlocal rewrite rules even when their endpoints are exactly the same.
3. **Strategic equivalence** — does the quotient preserve which player observes what choice before selecting a conditional reply, and hence the minimax best-action order? The independently physically established rank34 `2532541156412471331416356736376672` counterexample proves fixed trace equality does NOT automatically imply same root first-action WDL.

The new insight is that there are *two different obstructions prior to game-value elimination*: static colored-shuffle feasibility and nonlocal trace connectivity, IN ADDITION to adaptive-response causality. A geometry/phase representation that ignores any of these has already been falsified on actual 7×6.

**Next actual research target:** a DIRECT source-only **colored-prefix admissibility/obligation** predicate from the column-chain and owner-tagged line incidence that can certify legal alternating shuffle completion and source winner/race conditions without enumerating all legal words. It must not be confused with eliminating P0/P1 adversarial decision quantifiers; ultimately certify ONE best original column via a full-future guarded source order or tier proof, not the existence of a favorable physical word.

## 5. Frozen independent falsifiers

- Freeze original-q generator: check distinct columns, odd L, capacity, exact A_p masks computed directly from root h and alternation, source no-internal-win guard `∀G∈R_p, G⊄A_p` and opponent analogue, and the analytical two-word phase-fiber proof. No alternative future game-valuations, no enumerated interleavings.
- Independent physical TRUE7×6 checker must replay from empty first-win-stopped and verify `1444442` and `2444441` both legal, no early win, colored boards and original R0/R1 exactly identical. Enumerate all 7!/(5!)=42 distinct placements of the fixed two-singleton/five-center multiset ONLY as an independent FALSIFIER of the analytically frozen exact fiber-2 claim. Count equal-owner allocations exactly 2; no physical solver/game-values.
- Check `221` realizes the three-event projected ownership `A_1=p,B_1=p,B_2=o`, while `122` fails it and also the head-selection property; both remain ordinary gravity-legal histories. Preserve detailed counterexamples, counts and scope.
- General odd L proof is mathematically combinatorial and not claimed as externally formally checked; provide a separate small W,H checker only as optional validation. Do not alter q_o authority, status of canonical `44444`, source V4 or historical first-touch results. No merger/CI qualification assumptions.

**External analogy only:** Castellan–Clairambault–Rideau–Winskel, *Games and Strategies as Event Structures*, LMCS 13(3:35), 2017, explains the need for receptivity/courtesy in concurrent games. That literature does not automatically prove a Connect4 strategic quotient; our two small original-board witnesses give a game-specific constraint.
