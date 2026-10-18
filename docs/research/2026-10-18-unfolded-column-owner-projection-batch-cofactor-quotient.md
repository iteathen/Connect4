# Original-q column-owner projection and batch cofactor: exact nonterminal turn-order elimination

**2026-10-18, FROZEN BEFORE the next original7x6 physical controls.** Canonical research branch `research/semantic-quotient`. This is a synthesis/strengthening of the previously exact gravity-word, event-owner XOR, source residual-cofactor, and new two-round trace-diamond laws. Qualified IsoGraph 1.2 gameplay unchanged. It is NOT yet perfect-play strategic branching elimination or a total Level 2 best-move source.

## 1. Eliminate total sequence from the finite-block result

Start from ANY real first-win-stopped original `q=(h,R0,R1)` at n=Σh, with future physical cells decomposed into W ordered column event chains. A caller may supply ANY gravity-legal proposed **segment word** w of length m≤WH−n, with first-win stop suspended only to *analyze the counterfactual segment as a mathematical object*.

For the j-th symbol c in w, let k_c(j) be its earlier occurrence count within that same word, and define its ORIGINAL physical event x=(c,h_c+k_c(j)). Assign owner `χ_w(x)=(n+j) mod2` (j is zero-based). Let `A_p(w)` be the original physical event mask for those x whose χ is p. The masks A0,A1 are disjoint and their union has m distinct gravity-legal cells. Their union uniquely determines the final height counts of each column. The W column-local subsequences of owner bits, read in original row order, equivalently determine A0,A1: **which global interleaving generated them is irrelevant to eventual physical owner allocation**.

**Complete colored-column projection criterion (fixed q, equal segment length):**

    A0(u)=A0(v) AND A1(u)=A1(v)
    iff
    every column c has the same local owner-bit word in u and v
    (with the same number of occurrences in c).

This follows because the k-th occurrence of column c always claims the k-th original future cell of that column. It is exact for any W,H,K and any genuine initial q. It DOES NOT assert those projected owner words can be chosen independently: they must admit a gravity-respecting alternating shuffle. The coloring maps are not an opponent strategy.

## 2. Exact batched antichain transition, no chronological q steps

For a single hypothetical segment w with ownership masks `A0=A0(w)`, `A1=A1(w)`, define original static completed-source-generator flags

    F_p(A_p) = 1 iff exists G∈R_p with G ⊆ A_p.

As in earlier exact first-winner factorization, if both F0=F1=1, the FIRST winning player depends on the chronological completion race. If exactly one Fp=1, that p must first win before the end of the segment in every gravity-legal interleaving realizing that owner allocation; if F0=F1=0, neither player wins inside the segment in ANY such interleaving.

**Batch cofactor theorem in the two-sided nonterminal case F0=F1=0:**

    h'_c = h_c + #(occurrences of c in w)

    R'_p = Min { G \ A_p : G∈R_p AND (G∩A_(1-p))=∅ }

where Min is the inclusion-minimal residual-generator antichain operator; a family may be empty (extinct owner requirements), but an individual empty generator would mean a win and is excluded by F0=F1=0. If all cells have filled, the terminal is DRAW instead of q'. This exactly equals applying every one-cell source transition in chronological order, **without constructing even one intermediate q or evaluating a second game**.

Proof: every p-colored physical cell contracts its membership from every surviving p generator, and every o-colored cell irreversibly deletes any p generator containing it. These cellwise operations commute as operations on the **raw** original generator upsets so long as no first winner has terminated the game. Normalizing to inclusion-minimal generators at the end commutes with the outcome of intermediate antichain normalization because subset dominance survives deletion and contraction: if B⊆G originally, the contracted B\A_p stays a subset of G\A_p when both survive, and if B is deleted by A_o, the larger G is also deleted. No omitted requirement can revive. Thus batched q_o equals sequential q_o.

## 3. Direct source theorem comparing TWO supplied segments

For any two caller-supplied gravity-legal same-length u,v whose original per-cell owner masks are identical:

- If F0=F1=0, both are first-win-free throughout, have identical final h, R0,R1 and therefore identical complete literal-labelled ordinary future game under qualified q_o; full support gives identical DRAW.
- If (F0,F1)=(1,0), both first terminate in P0 WIN, though first-win turn can differ. If (0,1), both P1 WIN. No *future state after terminal* exists as a gameplay object.
- If F0=F1=1, original first winner depends on the `ρ` race bit, and two sequences of identical eventual physical owner colors CAN have opposite first winners (already frozen genuine original `44444` witness). The fixed χ and generator flags alone are insufficient; return `INCOMPLETE_DUAL_COMPLETION_RACE` unless an independent, guarded gravity-poset winner order theorem applies.

This directly factors the entire **nonterminal state update** through the column-owner projection, not the literal turn order. It extends the frozen special two-round `abcd ↔ cdab` source diamond. The fixed-word outcome factor `F0−F1+F0F1ρ` exactly handles the terminal case.

**Never infer that two different FIRST actions with the same batched endpoint are both Level2 optimal.** The players are adaptive; opponent policies and move legality/early wins at the intermediate positions can differ. Eliminating branch order from supplied **histories** is weaker than eliminating strategic game-value branching. Complete opponent-response interactive confluence remains OPEN.

## 4. Freeze-and-test genuine original7x6

1. SOURCE original-q producer parses a single supplied segment into original physical A0/A1 masks without constructing any intermediate q. Computes F0/F1 via current original R0/R1; if both false, directly computes the batched R0'/R1' by mask subtraction/deletion and Min antichain; if only one winner flag, emits **fixed-allocation** winner, not root WDL; both winner flags => timing incomplete. Comparing two supplied segments is only a SOURCE representation/equality test, not two future strategic value queries.
2. INDEPENDENT original physical checker replays genuine first-win-stopped prefix, then the proposed segment cell by cell, enforcing gravity and STOPPING at the first K-line (but retaining counterfactual owner allocation separately as a diagnostic). Check full q after segment only when neither player could win inside; compare root original h,R0,R1; both words with same per-column owner projections must agree exactly.
3. Apply to original canonical `44444` and all 7^4=2401 proposed four-symbol strings, discarding illegal capacity words and testing `abcd↔cdab`. Report exactly how many **additional** owner-preserving trace pairs exist beyond four-distinct-column 840; negative matches/collisions must not be silently treated as equivalent.
4. Independently select and check genuine nonterminal late q from different original source support shapes and at least one genuinely dual-completion pair, which must return source INCOMPLETE absent a separately fixed poset order certificate.
5. Build **no hidden strategy tree**; frozen production code computes one supplied segment's owner masks and one batch source cofactor only. Source comparison of two explicitly supplied segments is for proving trace congruence and must NOT be used as an action-value comparison. Independently branching physical exact WDL only after any future strategic theorem is frozen. Status remains `44444` root WDL UNKNOWN and one Level2 best move INCOMPLETE.

**External structural analogy:** deletion/contraction on antichains of bounded posets is standard (Matveev, *A note on operators of deletion and contraction for antichains*, IJMMS 31(12), 2002). The present guarded first-terminal interpretation is the original Connect4 source semantics, not inherited from that publication.
