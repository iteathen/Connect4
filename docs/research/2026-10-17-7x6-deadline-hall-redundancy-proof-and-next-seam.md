# Why per-winning-line deadline-prefix Hall gives no new Connect4 source information

**2026-10-17 | research/semantic-quotient | mathematical result (scoped source theorem, with independent 7×6 support audit); universal zero-strategic-branching Connect4 OPEN.**

**Owner geometry policy:** actual standard **W=7, H=6, K=4** is the primary discovery/qualification board. Keep W,H,K in all derivations for possible LATER generalization. No authority promotion or solver implementation change.

## 1. Precise claim

Take a first-win-stopped nonterminal gravity state q=(h,R0,R1). For any surviving minimal residual requirement G of player p, G is the exact set of STILL EMPTY future cells of one original geometric K-in-a-row line; previously filled cells on that line belong to p. Write its m=|G| required future target rows in nondecreasing order r1,...,rm (ties retained). The source latest placement deadline and p-turn capacity are

    U_j = (W-1)H - n + r_j + 1 ,    n=sum_c h_c
    A_p(k,q) = floor(k/2) + ([k odd] if p is current mover else 0).

Previously frozen last-event candidate: "G cannot be completed if m > A_p(U_m,q)."

New sorted-deadline Hall refinement: "G cannot be completed if any j=1..m satisfies j > A_p(U_j,q)."

**THEOREM (line-local redundancy):** for a horizontal, vertical, or 45-degree diagonal original winning line in the **standard 7×6 Connect4 geometry**, these predicates are identical on all legal gravity support vectors h and both possible owners p:

    [ EXISTS j<=m : j > A_p(U_j,q) ]
       IFF
    [ m > A_p(U_m,q) ].

This is a source-only theorem: no reference WDL, game strategy, continuation value, action-history enumeration, Bellman computation, or first-win simplification can produce an extra sorted-prefix certificate. The proof below leaves W,H,K symbolic and uses only the three original winning-line shapes, but its **only independently enumerated geometry is 7×6 Connect4**. The broader notation is not a project shift toward solving other board sizes.

## 2. Structural proof

We only need to show that *if* the last test PASSES (m<=A_p(U_m)), all earlier tests pass.

**Horizontal original line:** all surviving cells have the same row r. Thus every U_j=U_m, and A_p(U_j)=A_p(U_m)>=m>=j.

**Vertical original line:** the surviving required cells form a **contiguous suffix** of the consecutive vertical original line: column gravity has already filled every lower original-line cell. Hence r_m-r_j=m-j, and U_j=U_m-(m-j). In any alternating-turn schedule, removing d time slots can remove at most d turns belonging to p:

    A_p(k-d) >= A_p(k)-d.

Thus A_p(U_j)>=A_p(U_m)-(m-j)>=j. No ownership parity assumption beyond correct absolute mover is used.

**Diagonal original line:** each surviving cell lies in a DIFFERENT column and a DIFFERENT row. Distinct rows sorted ascending satisfy r_i<=H-m+i-1, hence remaining vertical capacity for its column is

    H-h_{c_i} >= H-r_i >= m-i+1.

Choose the j-th target (c_j,r_j). The original CPC last-rank identity before simplification gives

    U_j=(r_j-h_{c_j}+1) + SUM_{d!=c_j} (H-h_d).

The first summand is >=1. Every other column carrying another required diagonal target contributes at least m-i+1 future placements. Thus

    U_j >= 1 + SUM_{i != j} (m-i+1)
        = 1 + m(m+1)/2 - (m-j+1)
        = m(m-1)/2 + j.

For every earlier j<=m-1, with m>=2,

    m(m-1)/2 >= m-1 >= j.

So U_j>=2j, and even the SECOND-to-move player has at least floor(U_j/2)>=j turns available by the j-th required-cell deadline. Hence *every j<m inequality automatically holds*, independently of whether the final j=m inequality holds. This is stronger than merely proving conditional redundancy.

The j=m case is exactly the previous source test. Combining three cases proves the equivalence. G normalization removes original-line supersets but never creates a mixed/original-nonline residual generator. Terminal empty-generator wins have already stopped and are excluded.

**Important boundary:** this proof concerns one original winning requirement's optimistic event deadlines. It does NOT show that p can actually realize a passing requirement under adversarial responses, prove a full no-win response strategy, or compute unrestricted WDL. It says the proposed per-line EDF/Hall refinement has no added negative certificates beyond the existing last-event condition. Geometry is causally load-bearing.

## 3. Frozen executable all-height support audit: actual W=7,H=6,K=4

Exact executable GitHub source (committed **BEFORE run**):

    research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-deadline-hall-all-supports.mjs

It enumerates ALL (H+1)^W=7^7=823,543 gravity-height vectors, excluding the full board (because it has no nonempty future residual targets). For each, it constructs all 69 original line incidences, retains the future cells G of that line, and checks both possible owners. This includes some color assignments that would not be reachable as legal first-win-stopped histories: that is a conservative static *overapproximation*, not mistaken game-semantic evidence.

- **823,542** source non-full height vectors;
- **56,824,398** geometric line-by-support pairs;
- **47,378,933** nonempty future residual-line appearances;
- **94,757,866** potential player-residual tests;
- **5,418** cases impossible under previous last-event capacity;
- **5,418** cases impossible under sorted-prefix Hall;
- **ZERO** strict additional cases, across m=1,2,3,4;
- **ZERO** invalid deadline/range configurations.

By residual size m the owner-line checks were:
- m=1: 23,765,098 tests, 213 impossible under either;
- m=2: 28,336,602 tests, 368 impossible under either;
- m=3: 23,765,098 tests, 1,311 impossible under either;
- m=4: 18,891,068 tests, 3,526 impossible under either.

Actual source file verified bit-for-bit against the isolated Node22 run by matching its git-blob SHA: ac6e55ec71b579a557fa29e8d1b3bfc68aecdbbf. This is a finite static configuration audit; the structural proof in §2 does not depend on its sampling probability or a solved-game oracle. Node26 maintained suite and external proof-assistant qualification were NOT run.

## 4. Genuine 7×6 first-win-stopped physical position sample

A distinct locally executed Node22 control used original 69-line 42-cell BigInt physical boards, 1000 seed-fixed delayed-first-win sample trajectories, explicit canonical prefixes, and independent recursive PHYSICAL future WDL reference only AFTER source rules were applied. Generated 33,811 distinct legal nonterminal physical positions. The source last-event and sorted-prefix rules again agreed exactly:

    source no-win [P0,P1]:  [303,271] == [303,271]
    post-first-action no-win: [449,401] == [449,401]
    post-first-action exact draws: 169 == 169
    new EDF certificates: 0

The source-only last-event/immediate-first-win bound layer certified exact root WDL PLUS complete best labels on 1,228 **of the sampled positions** (not 7×6 population coverage). Independent unrestricted physical reference on 1,000 selected genuinely late (ply>=35) positions checked 2,919 first-action values and 122 exact source root/all-best-mask claims, zero discrepancies. Physical solver explored 16,581 distinct nonterminal states in that sampled suffix reference. This does NOT verify every action/optimal set of every sampled early state, nor the entire standard game.

The first local run incorrectly included 75 *full-board terminal draw* positions in its nonterminal source total. The sample was corrected to exclude them before final numerical checkpoint; preserve this negative observation rather than claiming the older 33,886 / 1,303 count as proper nonterminal evidence. The full local driver remains at /mnt/data/c4research/standard7x6/standard7x6-deadline-hall-control.mjs in this run (not yet committed as a fully reproduced GitHub executable); machine summary is durable at:

    research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/STANDARD7X6_DEADLINE_HALL_PHYSICAL_SAMPLE_RESULTS_0_1.json

**Canonical 44444**: P1 moves on absolute turn 6; all seven first moves still [-1,+1], exact unrestricted root WDL/complete ties UNKNOWN. Likewise 444444 and 4444442 remain unknown to this candidate.

## 5. Research disposition and next mathematical seam

**Qualification disposition:** the sorted-prefix Hall source incapacity lemma is sound under original source/first-win guards, but **strictly REDUNDANT with the already existing last-event capacity for every actual Connect4 original line.**

**Discovery disposition:** no evidence of new source-local WDL/optimal-set progress; preserve the entire failed refinement, exhaustive geometry test and proof. Do NOT iterate more per-line deadline sorting or return to smaller boards, more BDD depth, search optimizations, CPU or fanout reductions.

**NEXT:** leave one-line owner-slot feasibility and target *interacting surviving original lines across opposing players with shared blockers and ADAPTIVE forced response resources*. The missing theorem must handle overlap of multiple threats, CPC event-rank parity/response timing, first-win counter-wins, and an exact well-founded response certificate WITHOUT evaluating two inequivalent future games or hiding move histories in a symbolic strategy graph. Start at actual 7×6 44444 and early/mid source positions, retain W/H/K. Any positive best-label conclusion requires exact unrestricted (V,M*) and maximum strategic fanout ONE.

No new IsoGraph 1.2 authority claim; no solver merges.
