# C4Q8 — Exact grade-three WIN and grade-four READY-trap support envelopes after P1 center-blocks at rank 8

**Date:** 2026-10-23 Pacific. **Canonical branch:** \`research/semantic-quotient\`; **research direction:** Josh Oshiro. **Source pre-document HEAD:** f0fd27b5cd38199b3172b37ec5239fcf8c5f13c3. **Epistemic class:** deductively exact SHORT-HORIZON SOURCE gravity/WSL support calculation with genuine physical firstwinner controls. **NOT original empty-board WLD or a force-winning policy.** No solved-game knowledge, below-five gameboard or game-state WLD tree is a premise.

## 1. Actual original7x6 source position and qualified source field

Original genuine firstwinner-free center-first prefix \`4214254\` (rank7, P1 to move) has source P0 minimum WSL grades1:0,2:1,3:14,4:33. P1 first plays c4r4, permanently occupying the sole P0 grade-two original diagonal's needed c4r4. The new actual live rank8 P0-to-move position is

\`\`\`text
42142544
\`\`\`

Physical column heights h=[1,2,0,4,1,0,0]. The checked physical owner-grid after these eight plies, bottom first, is:

\`\`\`text
r6  .......
r5  .......
r4  ...O...
r3  ...X...
r2  .X.O...
r1  XO.XO..
     1234567
\`\`\`

where X=P0 and O=P1. (Cell annotations are verified against actual source history, not oracle WLD.) The original genuine H24,V21,R12,F12 K4 catalogue produces P0 inclusion-minimal WSL antichain exactly **39 masks**, by grade:

| P0 missing-site cardinality | Original q8 source minimal residuals |
|---:|---:|
| 1 | 0 |
| 2 | 0 |
| 3 | **13** |
| 4 | **26** |

Since P0 has no singleton or two-piece source minimum, it cannot FIRSTWIN before claiming three more actual sites; after two P0 placements no P0 READY singleton can arise from source grade 3 except where P0 already supplied two missing cells and D created appropriate gravity support. The prior source-grade m+1 theorem remains qualified; it does not guarantee future legal access.

## 2. Exact short-horizon source support-envelope test, without a game tree

Consider only true original source WSL minimum generator G. By rank13, P0 may claim exactly THREE additional true physical cells, and P1 exactly TWO, in **chronological order A,D,A,D,A** (A=P0).

**Direct FIRSTWIN from grade 3.** To FIRSTWIN any G of cardinality 3, A must claim ALL three true missing cells F=G, while D cannot claim any of F. For each f=(c,r) in F, gravity requires every physical site between the source height h_c and f's row to have been filled. Let R(F) be the UNION of those genuine column prefix cells. Source sites in \(R(F)\setminus F\) must be D-supplied. Thus the source support necessary condition is

\[
\boxed{|R(F)\setminus F|\le2,\qquad |R(F)|\le5.}
\]

Of all **13** source grade-three generators, exactly TWO satisfy this bound:

| Original source P0 K4 | Actual missing cells F | Opponent prefix support required |
|---|---|---|
| Vertical c1 rows1–4 | c1r2, c1r3, c1r4 | None |
| Vertical c2 rows2–5 | c2r3, c2r4, c2r5 | None |

Each has a genuine local legal five-event realization with D harmlessly claiming c6r1 and c7r1 between the A vertical placements:
- \`4214254416171\` — P0 FIRSTWINS original vertical c1r1–r4 on ply13.
- \`4214254426272\` — P0 FIRSTWINS original vertical c2r2–r5 on ply13.

These are examples of PHYSICAL POSSIBILITY, not wins P0 can force; D is free to claim a blocking upper site in the attacked column.

**READY terminal trap from grade 4.** For each original minimal G of cardinality4, choose a future empty target y in G; A must claim F=G\{y} (THREE actual cells), while at the end y must lie exactly one row ABOVE the future playable frontier in its column. Thus final column occupancy must be \(\mathrm{height}_{c_y}=\mathrm{row}(y)-2\), with y itself and the site below y still empty. Include this target-column support along with all F-gravity prefixes in R(G,y). Require R contain no y or its prohibited one-below-y final site, all three A sites, and at most two remaining D-support sites. Of **26×4=104** potential (G,y) original masks, exactly ONE satisfies the physical source support gate:

\[
\begin{aligned}
&L=\{c1r2,c2r3,c3r4,c4r5\} \quad\text{(actual original rising diagonal)},\\
&y=c3r4,\quad F=\{c1r2,c2r3,c4r5\},\\
&D\text{ must supply } \{c3r1,c3r2\}.
\end{aligned}
\]

It has a genuine alternating, firstwinner-free source realization
\`4214254413234\`; after rank13, c3 has height2 and P0 has original diagonal singleton \(\{c3r4\}\), a real READY terminal trap above next playable c3r3.

**Event-order verification:** the independent checked-in verifier rebuilt all 69 original K4 windows and a second physical directional-ray winner. It ran exactly 36 local A,D,A,D,A order-control candidates: four truly legal terminal grade3-win schedules and six truly legal nonterminal ready grade4-trap schedules (each of the latter is an A-site permutation; D must go c3 twice). These are small original SOURCE event-order tests, not game-history WLD values.

## 3. Precisely what is and is not established

These are **necessary support-envelope tests with real legal realizations** under selected D actions. They say the three named source K4 outcomes are feasible within three A turns; they do not say that P0 can force any of them against adaptive P1 choices. The original source antichain contains other grade3 candidates that might produce a READY trap rather than a terminal win when m=3; the present two distinct filters were frozen specifically for grade3 DIRECT WIN and grade4 READY trap. They are **not a complete classification of every possible q8 future singleton or of P0 WLD**.

The most significant causal separation is that the sole grade4-ready-trap candidate requires BOTH of P1's intervening moves to be c3r1 and c3r2. The two grade3 direct-win candidates require no help from P1 but can be blocked by P1's deliberate future owner claims. A single forward Fourier/source potential that ignores action labels, owner depth, or the FIRSTWIN stopping order would falsely treat these possibilities as forced.

The correct next research target is a compact, source-derived adversarial INTERCEPTION/RESOURCE theorem: when P1 uses its two moves to prevent both vertical grade3 opportunities, what source K4 and gravity/turn obligations are thereby released for P0? That relation must be proved symbolically (or with a factored small source response algebra) before upgrading the q8 original WLD classification. The still-unresolved rank7 root path also includes b1∈{1,3,5,6} and the urgent P1 double-c5 vertical FIRSTWIN deadline; not just c4.

## 4. Provenance and verification

Frozen BEFORE the new source verifier: \`docs/research/2026-10-23-frozen-q8-P1-c4-source-third-P0-turn-grade4-and-grade3-support-envelope.md\`. Exact checked-in source: \`research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-original7x6-q8-center-c4-grade3-grade4-support-envelope.js\`. Matching GitHub-blob-linked machine packet: \`research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/C4Q8_C4_BLOCK_G3_WIN_G4_TRAP_0_1.json\`.

Actual source q8 was rebuilt directly from empty with original gravity; grade counts, 69 actual winning windows, all candidate source row masks and event-order firstwinning were independently checked against physical rays in the source program. The original exploratory two-grade3/one-grade4 source envelope tally preceded the new verifier and is NOT falsely labelled prospective discovery. The resulting checked-in code was fetched back from GitHub and re-executed in exact V8. **Maintained Node26 CI, external theorem prover and all-position game WLD search were NOT run.** No modified qualified IsoGraph1.2 authority, no source oracle value, no claim of general optimal action list.

**Unresolved original game-root result:** no source-only zero-strategic-fanout WLD proof from empty. Failure to force one selected source outcome is INCOMPLETE, not a draw/loss.
