# Standard Connect4 as one bounded linear word with four linked K-interval constraint ribbons

**2026-10-17 Pacific; research/semantic-quotient; owner-directed mathematical hypothesis.** **Status:** new EXACT representation-isomorphism theorem, candidate/frozen before true 7×6 implementation and independent physical controls; not a total zero-strategic-branching solver; qualified IsoGraph 1.2 unchanged. W,H,K MUST remain symbolic; current research and tests W=7,H=6,K=4 only.

## 1. Linearizing the computational PROCESS, not merely drawing 2D lines flat

Fix ANY legal first-win-stopped source q0=(h0,R0,R1), current n0=sum h0. Let m_c=H-h0_c be remaining capacity of physical column c, so T=sum m_c=WH-n0. Let Σ={0,...,W-1} be the alphabet of literal column labels.

A future proposed move history is a **one-dimensional word**

    w=(c_1,c_2,...,c_t) ∈ Σ^t,  0<=t<=T,

with no symbol c occurring more than m_c times in ANY prefix. Every such word has a unique gravity-legal **hypothetical** event sequence via:

    event of k-th additional occurrence of column c = (c,h0_c+k-1).

And conversely, every ordinary gravity-legal sequence of proposed columns is such a bounded word. In actual play, terminate on the FIRST completed K-line or full-board DRAW; any word continuing beyond first win is invalid as an actual game (may be used as a hypothetical full scheduling control only).

**Exact one-step transition:** append one allowed symbol a to w, triggering exactly the next physical gravity cell x=(a,h0_a+count_a(w)). The move owner is the XOR clock

    mover=(n0+|w|) mod2.

Thus game branching choices, legal gravity, support and turn sequence have been represented as **appending ONE symbol** to an ordinary linear word, with per-symbol capacity guards. No board-grid coordinates are needed at runtime except the precomputed original event lookup.

The 69 geometric winning lines are recognized by the four-ribbon lift of the companion document: concatenate all 37 strands (with 36 separators), giving a SINGLE 1D tape with 168 physical-cell occurrences and 36 delimiter slots = **204 tape slots** for standard W=7,H=6,K=4. Each original Connect4 win line is EXACTLY one contiguous four-occurrence substring entirely INSIDE one strand, no substring crossing a delimiter counts. Every physical event carries four tape-occurrence references; all four are aliases of the SAME underlying event, not independent stones.

This is an exact **linked linear tape / constrained bounded-word game**, not four independent games. The dimensions remain parameterized:
    numberOfTapeOccurrences=4WH;
    numberOfStrands=H+W+2(W+H-1);
    numberOfSeparatorSlots=numberOfStrands-1;
    numberOfKWindows=L(W,H,K).

## 2. Exact source q conjugacy via one-character append

Represent a live word state by (h0, counts_c(w), current normalized residual R0(w),R1(w), length |w|), with literal column-symbol sequence optionally retained as trace/provenance only. The game state is still q(w) where

    h_c(w) = h0_c + counts_c(w).

When symbol a is appended, let x=(a,h_a(w)), and p=(n0+|w|) mod2:

- If some p-tagged source surviving requirement is {x}, append terminates immediately with winner p.
- Otherwise remove x from each owner's source residual generator containing x; delete every opposing residual generator containing x (permanently blocked), normalize each surviving family to its inclusion-minimal antichain; and increment counts_a(w).
- If now sum h=WH and no first win occurred, return DRAW.

Everything is expressed by updates of linked 1D tape event tokens, plus source residual incidence; the original board is not consulted to determine its cofactor.

Let F(q0,w) be the source word state after processing w, and T_c ordinary q-cofactor. The exact induction target is

    decode(F(q0,w)) = T_{c_t} ... T_{c_1}(q0)

as long as every prefix before the last remains nonterminal, with equal immediate terminal tokens at the first terminal append. More locally, for all legal symbol a:

    decode(Append_a(wordState)) = T_a(decode(wordState))

or equal terminal token. THIS is the desired "without changing its computational process" condition; it proves exact labelled-future game bisimulation for the representation, preserving unrestricted V and COMPLETE M* as semantic properties **without yet computing them**.

A word may be long but its exact ordinary semantic identity is still compressed by (h,R0,R1); distinct words can map to one q. No private history or alternative player-color semantics are smuggled into q.

## 3. XOR player clock and K-window GF2 constraint shape

For a complete hypothetical bounded word w with length T, let pos_w(c,k) be the 1-based relative position of its k-th occurrence of column c. The future event (c,h0_c+k-1) has exact ownership bit

    χ_w(c,k)=(n0+pos_w(c,k)-1) mod2.

Its four tape occurrences share that ONE χ; no independent coloring can be attached to each strand.

For each p-tagged SOURCE residual generator G∈R_p(q0), define

    C_{p,G}(w) = PRODUCT_{e=(c,h0_c+k-1) ∈ G} (1 XOR χ_w(c,k) XOR p).

Exactly when C=1, its already qualified original line has been completed by p somewhere in the hypothetical full schedule. Its completion time is the LATEST pos_w among its required future events; first-win time is the EARLIEST such generator completion (or DRAW if none), respecting the current q source and first-win stop. This is EXACT and does not reconstruct unknown past colors from q0.

The game is now a **bounded word-building process** constrained by
- symbol capacities and first-win stopping,
- four linear strips of contiguous K-interval win constraints,
- equality wires for four aliases of every event,
- binary turn parity and, if desired, 131 edge XOR differences with rank 41 / 90 consistency cycles on a fully described standard board.

The win predicate is an AND of K owner relations / K-1 equal-phase relations, the overall first-win outcome is nonlinear, and perfect-play interleaving remains adaptive. This is *linear arrangement preserving nonlinear truth*, not an unjustified equation of Connect4 with XOR-SAT or a sum of independent column games.

## 4. Exact source cut interface after center column completion

After legal source history \`444444\` on standard W=7,H=6,K=4, center column 4 is filled. It cannot occur again in any future word; the alphabet of legal next column symbols is {1,2,3,5,6,7}. But the four-ribbon source q still has 12 viable P0 and 12 viable P1 residual generators whose future required cells lie on BOTH sides of center column, coupled through an already occupied center cell. Therefore deleting the center symbol from the word alphabet DOES NOT split the string game into two independent 3-letter word games. Original K-window constraints are coupled even when one strand's vertical chain is consumed.

Any proposed "linear transfer" decomposition must carry these cross-cut residual factors and shared global parity clock. The ordinary word transition does not acquire an extra phase beyond (n0+|w|)mod2; the κ column phase updates and relative β interleavings are algebraic projections of the SAME linear word.

## 5. Frozen actual 7×6 independent falsification plan

1. Construct a single linear 204-slot tape with fixed segment separators; verify 168 nonseparator physical occurrence references, four references per physical event, exactly 37 strands, exactly 69 legal consecutive K-substrings and no K-substring spanning a separator falsely recognized.
2. For each real legal source history \`44444\`, \`444444\`, \`444441\`, \`4444442\`, and deterministic sampled early/mid/late FIRST-WIN-STOPPED standard 7×6 physical positions q0, initialize a source word state from q0 (NO past physical owner-color data in the word state).
3. Append source-literal columns using a deterministic independent sampled suffix until FIRST win or full DRAW, and compare every append against qualified exact q transition and separately maintained physical gravity behavior, including literal legal columns, original W,H,K K-line first-win stopping and normalized R0/R1 after every nonterminal action. DO NOT construct two inequivalent strategic VALUE continuations; randomized suffixes are validator inputs only.
4. For independently supplied hypothetical full bounded words, confirm χ event owner parity and first-completion time/winner from q0 against the independently qualified source-q fixed-order payoff and physical checker. These are FIXED-WORD payoffs, not perfect-play values.
5. Verify canonical full-center boundary with 24 P0/P1 source cross-side residual generators and no future center symbol. Do not assert the left/right word subalphabets are independent merely because the center letter exhausted.
6. Record source script, exact rerun, seed and sample counts before claiming the theorem qualified; tests are standard 7×6 ONLY. A reproduced full future-state bisimulation does NOT mean source zero-fanout V/M* extraction has been discovered.

## 6. Remaining strategic problem

The exact transformation preserves the game but still allows multiple possible NEXT word letters a. An algorithm that enumerates all legal words, all strategies or both binary NAND child-value zero-loci is still strategically BRANCHING, even though each individual proposed play is an unbranched 1D word. The mathematical research target is now precise:

**Derive a direct source-only operator for both nested full-game action-zero-locus sets from the linked one-dimensional tape constraints, W/H/K, current q, and GF2 phase relations, while preserving adaptive universal/existential responses, first-win timing and all tied labels, without separately evaluating inequivalent future word games.**

This remains OPEN for arbitrary standard 7×6 Connect4, including canonical \`44444\`. No generalization to reduced board sizes is being pursued now, and no accepted game-theory authority or solver implementation is modified by this research note.
