# Freeze: Lift Fibonacci restricted phase language to complete original K4 DRAW-terminal language

**Date:** 2026-10-20. **Owner:** research/semantic-quotient. **Primary target:** a dimension-wide exact no-search WDL mechanism, not another selected 7x6 local source event. This test separates static terminal colorability, chronological gravity realizability, and adversarial strategy.

## 1. Exact full-coloring transfer, before any experimental counts

Fix original W,H>=5, K=4. A full physical board is a binary column-word tuple `v_1,...,v_W`, each `v_c∈{0,1}^H`; bit0 means P0, bit1 P1. Vertical firstwinning original K4 is absent iff each column v excludes 0000 and1111 as a contiguous four-row substring. Let `A_H` be this vertical-safe column alphabet. For four contiguous columns a,b,c,d in `A_H`, let `Q_H(a,b,c,d)` be 1 iff NO genuine original 4-cell horizontal row, rising diagonal, or falling diagonal entirely inside these four columns is monochromatic for either owner. Precisely, for r=0..H-1 require a_r,b_r,c_r,d_r not all equal; for r=0..H-4 require both a_r,b_(r+1),c_(r+2),d_(r+3) and a_(r+3),b_(r+2),c_(r+1),d_r not all equal. No cyclic K4 windows.

Then exact terminal K4-free full binary colored boards are exactly the accepted paths of a finite WIDTH automaton with state last three column words and transition (a,b,c)->(b,c,d) if Q_H(a,b,c,d)=1. Give each d a weight `z^{#P0(d)}`. Initialize with every vertical-safe initial triple weighted by the sum of their three P0 counts. Its exact polynomial
```
 Z_(W,H)(z) = sum_(v1,...,vW in A_H) z^{sum_c #P0(vc)} prod_(s=1..W-3) Q_H(vs,vs+1,vs+2,vs+3).
```
This is an EXACT no-future-game-search WIDTH transfer-matrix identity counting ALL original full-board K4-free owner colorings, *not merely* the restricted alternating-column Fibonacci subclass. It is valid even if an accepted full coloring is not reachable by legal alternating gravity from EMPTY.

For genuine firstwinfree current q, restrict each column word v_c to agree with ALREADY OWNED original cells (same true physical columns/rows). The corresponding source polynomial Z_(W,H;q)(z) counts all static full K4-free binary owner extensions of q. Under original P0-first alternation, any completed DRAW on a W*H board must have EXACTLY ceil(W*H/2) P0 stones, so
```
 D_phys_necessary(q) = [z^ceil(WH/2)] Z_(W,H;q)(z).
```
This is a necessary and generally NOT sufficient condition for a legal DRAW continuation: an accepted static coloring must also admit a gravity-respecting alternating schedule extending the true history. It is NOT itself a game value. If D=0, no legal full DRAW is possible from q even under cooperative players; by FIRSTWIN absorption some owner MUST FIRSTWIN along every actual legal completion.

### Source WDL composition theorem

This gives a source-computable sufficient signed WIN law applicable to any true original W,H,K q whenever the independent player-safety guarantee is already proved:

**If player p has a genuine legal strategy from q preventing opponent 1-p from FIRSTWIN, and D_phys_necessary(q)=0, then p can FORCE FIRSTWIN against every opponent choice.**

Reason: game is finite, no pass, all continuations either terminalize with a true firstwinning owner or fill board to DRAW. The independent nonloss strategy excludes opponent firstwin; zero static terminal extensions excludes DRAW. Thus every legal continuation under p's nonloss strategy must terminate with p firstwin. This is an exact WDL inference from one independent safety certificate plus one non-strategic spatial-transfer ZERO witness. It does NOT supply the missing nonloss strategy from arbitrary q, and it is not a full root WDL theorem.

## 2. Frozen source experiments and falsifiers

1. Independently generate all true original K4 lines for W=5..8 and H=5,6 (optional H7 if affordable), independently verify that the four-column automaton exactly accepts full static original K4-free colorings. For W=4,H=4 brute force all 2^16 colorings is an independent small complete check. If an enumerated accepted coloring disagrees with original 4-ray game K4 check, save defect.
2. Compute exact total `Z(1)` and its required global owner-balance coefficient for W5..8,H5/6. These will usually vastly exceed the 4F_W restricted Fibonacci profiles, and will demonstrate that the restricted phase repair domain is not the full K4-free DRAW configuration space.
3. Independently compute `D_phys_necessary(q)` for genuine 7x6 archived 27 firstwinning histories at representative occupied ranks, and for a known full 42-ply DRAW. If a prefix has D=0, note the **earliest observed no-draw-possible phase** but DO NOT claim it proves which player WINS without an independently source-proved nonloss policy. If it remains positive near the end, preserve that counterexample to simple inevitability.
4. Build at least one actual legal full 7x6 DRAW with an intentionally non-alternating owner pair in a column and P0 first center. Candidate frozen for independent validation: one-based full42 word `414121111222223333334444655555566666777777`, including prefix P0c4/P1c1/P0c4 (two adjacent P0 stones in column4). It was constructed by swapping owners of row2 at original columns1 and4 in a safe restricted phase coloring `1000100`; test that it contains ZERO actual K4 at every chronological move. Under the older Fibonacci-only per-column phase representation, compatible terminal word set becomes EMPTY at rank3, yet actual DRAW still exists. This directly refutes use of Fibonacci-phase feasibility as a necessary condition for ALL drawing continuations.
5. Compare with externally solved root WDL W5H6 DRAW, W6H6 P1 WIN, W7H6 P0 WIN, W8H6 P1 WIN only AFTER the universal formula is frozen; do not fit coefficients to labels. Recognize a static no-draw-possible obstruction is only one half of signed WDL and cannot replace adversarial source nonloss.
6. Preserve rigorous semantics: no future P0/P1 game-tree numeric WDL values, original owner-specific K4 hypergraph, monotone FIRSTWIN stop; source static DP over last 3 columns and owner-count index is not minimax nor a legal draw-reachability proof by itself.

Success: a DIMENSION-WIDE exact original terminal-language tensor law and compositional safety+no-draw=>WIN theorem, plus explicit positive and negative original physical controls. If computational cost is high restrict H/W but do not fabricate completion; maintained Node CI and external formal proof assistant must be described truthfully. No production solver or accepted IsoGraph1.2 changes.
