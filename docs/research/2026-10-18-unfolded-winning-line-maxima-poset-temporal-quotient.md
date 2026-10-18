# Exact source-only temporal quotient: original winning-line completion races over gravity-chain posets

**FROZEN before original 7x6 physical controls. 2026-10-18.** Research owner `research/semantic-quotient`. This is an exact partial **turn-order factorization**, NOT a perfect-play Level2 theorem. Retain symbolic W,H,K. Qualified IsoGraph gameplay 1.2 unchanged; earlier owner-directed geometry unfolding and phase/race factorization are prerequisites.

## 1. Event geometry and the limited chronology question

From any genuine legal nonterminal original `q=(h,R0,R1)`, future events are a union of W strictly ordered column chains `E_c={(c,h_c),...,(c,H-1)}`. A complete hypothetical gravity-legal future word is a linear extension `w` of that poset, with first-win stopping suspended ONLY as algebraic bookkeeping. The rank `t_w(e)` determines the future owner phase `χ_w(e)=(n+t_w(e)-1) mod 2`. An original source residual winning generator G∈R_p is eventually completed by p precisely when `M_p(G,χ)=∏_{e∈G}[χ(e)=p]=1`. Its completion rank is `T_w(G)=max_{e∈G}t_w(e)`. Final-color payoff `F0-F1` needs an additional race correction only if both sides would complete some requirement (previous exact source theorem).

This note answers a narrower structural question: AFTER χ is supplied, which portions of total chronological order can be discarded, with original first-win preserved?

## 2. Unconditional subset-completion precedence from a direct source guard

For two disjoint nonempty ORIGINAL future-cell sets A,B, define a **gravity maximal-precedence relation**

    A ≺_g B   iff   ∀a∈A ∃b∈B:
                  col(a)=col(b) AND row(a)<row(b).

This involves only original physical cell positions and SAME-COLUMN gravity predecessor links, not a future word or a game-value calculation.

**Theorem (necessary and sufficient for order over ALL gravity shuffles):**

    A ≺_g B
      iff
    for EVERY complete linear extension w of the remaining column chains,
      MAX_{a∈A}t_w(a) < MAX_{b∈B}t_w(b).

**Sufficiency:** for any a∈A its later-column-chain witness b∈B must have t(a)<t(b)≤max t(B); applying this to the last a shows max t(A)<max t(B).

**Necessity:** if some a∈A has no larger B element in its own column, there is NO original gravity-poset edge a≺b for ANY b∈B. Add precedence edges `b→a` for ALL b∈B: the extension stays acyclic, because a→...→b is absent. A topological ordering of the augmented graph is a legitimate original gravity shuffle placing EVERY B event before a, giving max t(B)<t(a)≤max t(A), contradicting the universal inequality. A∩B=∅ avoids equal-event ambiguities. (When owner-tagged G0/G1 both eventually complete, their required cell sets are automatically disjoint because a physical cell cannot have two owners.)

This is an exact order-theoretic criterion for **all** gravity extensions; it does not require alternating χ realizability. Failure of the relation does NOT show both arrival orders can occur with a FIXED feasible χ or under perfect play. It simply fails to certify universal order.

For any pair G0∈R0, G1∈R1:
- If G0∩G1≠∅, both original requirements cannot eventually complete in one future owner coloring: class **SHARED_CELL_EXCLUSION**.
- Else if G0≺_g G1, completion of G0 is always BEFORE completion of G1, if both become owner-complete: **P0_FORCED_FIRST**.
- Else if G1≺_g G0: **P1_FORCED_FIRST**.
- Else: **CHRONOLOGY_UNRESOLVED**.

The two strict forced orders cannot coexist because the gravity poset is acyclic.

## 3. Exact finite race-interface quotient for any one complete future word

Let U(q) consist of only **CHRONOLOGY_UNRESOLVED** cross-owner generator pairs. For each such pair (G0,G1) and a supplied extension w, retain one bit `b_{G0,G1}(w)=[T_w(G0)<T_w(G1)]`. For every other cross-owner pair, its completion comparison is a STATIC source constant or is provably irrelevant because the sets share a future cell.

**Exact winner logic:** if neither F0 nor F1 has any ultimately owner-complete original generator, DRAW. If only one has one, that player FIRST WINS. When both have one, P0 wins FIRST iff

    ∃G0∈R0:
       M0(G0,χ)=1
       AND ∀G1∈R1:
          (M1(G1,χ)=0 OR Before(G0,G1)),

where `Before` is the static +1 for P0_FORCED_FIRST, static 0 for P1_FORCED_FIRST, and a single U bit otherwise. Shared-cell pairs cannot have M0=M1=1. If no G0 satisfies this formula and both Fp=1, P1 wins. This formula follows by choosing P0's earliest completed generator and comparing its time to every P1 generator's time.

Therefore the entire hypothetical original future word affects first-win payoff ONLY via:

    (1) final physical future-event owner coloring χ∈{0,1}^T;
    (2) pairwise order bits b for the explicitly source-computed U(q) interface.

**No other detailed event rank or chronological permutation information is needed** to reproduce the fixed-word first winner once (χ,b) is supplied. This is an exact sufficient quotient of schedule PAYOFF, not an identity of strategy trees. In general, different w with the same χ can produce different b, as proved by the earlier canonical physical opposite-first-winner witness. U bits are correlated by realizability and MUST NOT be treated as independent free Boolean variables.

**Stronger sufficient guard eliminating ALL chronological race after χ is known:** `U(q)=∅`. Then for EVERY future complete gravity-legal word w, its original first-winner payoff is a function of χ alone using the static pair classes, even if both players can complete distinct original lines. This strict condition includes the previous no-disjoint-pairs guard but may be more permissive. It does not remove dependence of χ on adaptive move choices or give Level2.

**Further chronological compression:** for a source G, only the TOPMOST required original event of G in each column can determine its completion rank. Lower same-column cells are causally preceded by that topmost event. One may store up to min(K,W) frontier-event coordinates per original G rather than an entire winning requirement when computing its MAX completion timing. This reduction MUST NOT change the separate owner-completion condition M(G,χ), which still needs every original G cell.

## 4. Why this targets the owner's unfolding-and-factor intuition

The four tied ribbons turn winning geometry into interval factors. The moving-event union of W gravity chains is a partial order, while the XOR clock gives χ; the theorem proves which *cross-owner interval-completion comparisons* survive factoring out a complete chronology. All pair inspections are SOURCE generator incidence and original same-column predecessor checks. Neither a future game successor nor a strategically alternative WDL value is ever materialized. This is stronger information than the previous trivial shared-cell race elimination, because two DISJOINT owner generators may still have a forced relative finish order.

**Crucial boundary:** this is a FULL-WORD PAYOFF quotient, not an alternating-strategy quotient. A move chosen at rank t changes which player is entitled to choose at rank t+1, which future χ are attainable under adaptive opposition, and which first wins terminate play. Algebraically collapsing hypothetical words by (χ,U bits) does not license interchanging player quantifiers or replacing an opponent strategy by one word. That next step is OPEN.

## 5. Frozen falsification and no-strategic-branch discipline

1. Source-only ESM producer takes original q=(h,R0,R1), checks every current cross-owner residual-generator pair for intersection and `≺_g`; returns guarded chronology-race-free, unresolved-pair counts, and positive/negative witnesses. It must NOT evaluate any hypothetical future word, q successor, or oracle WDL.
2. Independently reconstruct actual ORIGINAL 7×6×4 positions via 69 geometric K-windows, correct alternating gravity and FIRST-WIN-stopped histories; measure pair class counts at canonical `44444` and diverse genuine q, including whether `U(q)=∅` beyond the previous empty-disjoint guard.
3. In a separately frozen physical validator, take caller-supplied complete hypothetical gravity words as TEST INPUTS, compute their χ, U order bits and the quotient winner predicate. Compare to direct original-grid first-win physical observer and earlier exact fixed-word `F0-F1+F0F1ρ` theorem. For every source pair marked forced, assert its T ranking on tested words; for all guarded U-empty positions test no schedule-phase-only winner disagreement.
4. Preserve counterexamples and legitimate negative findings. If U is large at `44444`, that is a measured residual chronology interface, NOT impossibility of more powerful factoring exploiting alternating χ or strategic dominance.
5. Maintained Node26 CI, independent proof assistant qualification, total original7x6 no-strategic-branch Level2, and canonical `44444` best move are all still NOT established.

External context: Mazurkiewicz trace theory models quotienting sequences by **proved** partial commutations (A. Mazurkiewicz, *Theory of Traces*, Theoretical Computer Science 1988); it does not imply Connect4 opposite-mover decisions commute or that a payoff quotient is a perfect-play strategy quotient.
