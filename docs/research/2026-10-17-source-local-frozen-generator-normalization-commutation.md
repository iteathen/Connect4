# Exact source-local generator streaming: normalize only when reading q, not after every move

**2026-10-17 Pacific. Canonical Connect4 research branch: research/semantic-quotient. Owner's objective:** remove standard 7×6 four-in-a-row geometric obfuscation while preserving exact gravity, XOR alternating turn, first-win stopping, unrestricted outcome semantics and eventually ZERO separately valued inequivalent strategic continuations. **Status:** SOURCE MATHEMATICAL THEOREM, frozen before independent actual7×6 physical/q conformance; not a value/optimal-action algorithm and NOT IsoGraph game-theory authority promotion. W,H,K symbolically retained for later generalization; tests only actual W=7,H=6,K=4.

## 1. Why this is more than drawing the geometry differently

The canonical source q=(h,R0,R1) normalizes each player's residual winning generator family to an inclusion-minimal antichain. A single cell placement only changes generators physically incident to that cell. However if one immediately globally inclusion-normalizes the entire family after every placement, surviving named minimal generators can disappear due to subsumption, making the apparent representation update global.

We can avoid that normalization **during the computational process** without changing any game rule. Keep an unnormalized source family F0,F1 of ORIGINAL surviving generator masks at the chosen start q, one mask per source generator. Masks are never expanded; a generator either loses currently occupied owner cells or is deleted when blocked by the opponent. Each generator mask G0 in the source F_p(q) is contained in at least one original fixed K-geometric window; record one such original window only as a source-incidence container, never as false physical/game proof identity.

## 2. Exact two-cofactor/normalization commutation theorem

For any finite collection F of subsets of the **same fixed future physical cell universe** E, let Min(F) discard exact duplicates and each strict superset when a smaller generator is present. Define at source playable future cell x:

    O_x(F) = {G\{x}:G∈F}                  [owner positive cofactor, includes empty generator]
    B_x(F) = {G∈F:x∉G}                     [opponent blocker deletion].

Then, as equality of normalized minimal antichains,

    Min(O_x(F)) = Min(O_x(Min(F)))
    Min(B_x(F)) = Min(B_x(Min(F))).

**Proof:** If A⊆B, then A\{x}⊆B\{x}. Thus owner contraction is monotone for inclusion and any discarded larger B remains redundant. For opponent blocker deletion, if x∈A then x∈B, so a blocked smaller A and its larger B both disappear. If x∉B then x∉A, so any surviving larger B is still dominated by its surviving smaller A. These properties extend through arbitrary chains of owner contractions and opponent blockers. Empty generator membership is preserved by Min and is tested BEFORE any post-first-win game continuation. Full nonwinning board draw has unchanged support-based meaning.

Consequently starting from any correctly normalized legal q at rank n, initialize unnormalized stream F0=R0(q), F1=R1(q). For each legal move by current p into x=(c,h_c):

1. If SOME generator in O_x(F_p) is empty, TERMINATE p first-win immediately.
2. Otherwise set F_p←O_x(F_p), F_(1-p)←B_x(F_(1-p)), increment h_c.
3. If the board is now full without a prior win, terminate DRAW.
4. At ANY nonterminal rank, decode q=(h,Min(F0),Min(F1)).

The above equations prove by induction on remaining board cells that **every** decoded q and EVERY terminal-first token equals the original canonical q cofactor game for the SAME legal literal moves, including all tied-optimal semantics in a future game. This is exact future-behavior conjugacy, NOT a way to calculate (V,M*) without branching.

### Crucial directionality: do NOT normalize halves separately

If G crosses a left/right cut, store exact physical masks (G_L,G_R). Two generator pairs can dominate one another only when BOTH left and right masks satisfy inclusion simultaneously. Normalizing one side alone can incorrectly erase cross-factor combinations. The streaming theorem leaves such two-sided generators distinct and has no need for a global or side-local Min during the move process.

## 3. Proven locality of the unnormalized source stream

At start source q, label each raw mask G with one original straight K-cell geometric window containing it (exact source container). No future move introduces a cell into G; owner moves only REMOVE cells, opponent moves delete the full generator. Therefore any later cell x can belong to G only if x belonged to that ORIGINAL window. A move into x can edit at most the number of original K-windows containing x PER player. Since four orientations each admit at most K windows through a fixed cell, a general dimension-bearing upper bound is

    incidentOriginalWindows(x) <= 4K.

For standard Connect Four K=4 this gives **≤16 source generator edits for each player** before deduplication, independent of the 69 original winning lines. The actual maximum over 42 standard cells will be determined by a frozen geometric incidence control. A source q initial minimal generator cannot arise as more than one generator per original geometric window (a viable original K-line contributes one residual mask per player; normalization can remove masks, never add extra masks), so the witness-injection assumption holds for a q built from genuine original lines. If no injective window assignment exists in a putative q, reject the strong 4K edit bound; the general normalization commutation remains sound without that bound.

Each placement updates only the generator masks currently incident to its ONE landing cell. All other named raw masks remain literally unchanged. Support height h and current turn parity still update. The compact normalized q may have different generator IDs elsewhere due to inclusion absorption, but this is a **readout effect**, NOT a required global computational transition.

An indexed implementation may precompute for every future physical cell a list of initial-generator IDs that contain it (bounded by original window incidence), then on a move visit only those IDs. Its index is STATIC source incidence algebra, not a hidden future-game history/strategy graph.

## 4. Can this explain the user's proposed linear geometry?

Together with the dimension-bearing height-gradient shear

    j=r-h_c,
    Δ_c=h_(c+1)-h_c,
    j_next=j+s-Δ_c,     s∈{0,+1,-1}

and the XOR phase clock

    χ(c,r)= (n+j) mod2 XOR β(c,r),

each raw generator becomes a fixed K-window interval/ribbon factor updated by touching only its linked source event. The *gameplay process* is now one letter appended to a bounded column-word, one event on 42-cell shared alias graph, at most 4K candidate original windows per player touched and at most TWO neighboring Δ interfaces changed. That is a truly local process with an exact normalized q decoder. It is not an affine entire game value equation: GF2 phase β, K-line AND, OR across lines, earliest completion and adaptive legal action choice remain.

## 5. Frozen standard7×6-only tests and falsifiers

1. Count original winning-line incidence at all 42 physical cells and show actual max, direction splits, exact K bound, with W,H,K still symbolic.
2. Starting from many genuine FIRST-WIN-STOPPED physical 7×6 q (from empty, 44444, 444444, 4444442, and sampled early/mid/late states), initialize raw F0/F1 from q.R0/R1 ONLY (no historical colored-board data in producer).
3. For each independently generated legal physical source suffix, run the unnormalized streaming process along that SINGLE prescribed word. After EVERY nonterminal move, global-Min-DECODE and compare exact h,R0,R1 against independently qualified q-core, including first-win and full DRAW. Count raw generator mask edits, newly dominated-but-retained raw masks, and maximum generator incidence per placement; verify actual local edits never exceed 4K per owner.
4. Compare independent **physical first-win** and 69 original K-line win geometry against stream terminal boundary. Never evaluate multiple inequivalent future games in the stream or return a bogus value.
5. With a chosen geometric cut, exhibit (if one exists) a nonlocal change to the normalized minimal antichain due ONLY to source inclusion absorption after a physically localized move, while the raw stream remains local. Record both the negative and positive observation honestly; if absent in sampled q, do not invent.
6. Keep standard 44444 (P1 to move absolute sixth move) WDL/complete best set UNKNOWN. The q-normalization commute theorem is a structural fact, not proof of zero-strategic-branch full outcome.

**Preserve discovery/qualification separation.** A valid streaming representation is NOT a proof of faster performance, a shortcut to all action-zero loci, or a second IsoGraph game-theory authority.
