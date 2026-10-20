# Corrected method: use external EXISTING 7x6 solved data before any new empty-root solve

**Date:** 2026-10-19. **Owner directive:** "Why don't you try looking it up on the web instead of generating all the results yourself?" Owner also requires any sample called perfect play to be generated from the EMPTY original 7×6 board, with each P0 and P1 action truly optimal. **Scope:** W=7,H=6,K=4 only, true alternating gravity and first-win stop. Research owner \`research/semantic-quotient\`.

## Web-verified authoritative data, ranked for this experiment

### A. Pascal Pons's original solver + downloaded 7x6 precomputed OPENING book (priority 1: practical)

Official solver: https://connect4.gamesolver.org/en/  
Official C++ source: https://github.com/PascalPons/connect4  
Official release: https://github.com/PascalPons/connect4/releases/tag/book  
**Verified GitHub release metadata via public GitHub REST API:**
- Release tag \`book\`, ID \`15166758\`, release source commit \`68a1da6\`.
- Main full \`7x6.book\`, exact public release asset \`https://github.com/PascalPons/connect4/releases/download/book/7x6.book\`, **33,554,524 bytes**, asset ID \`10766475\`.
- Small \`7x6_small.book\`, exact public asset \`https://github.com/PascalPons/connect4/releases/download/book/7x6_small.book\`, **6,291,513 bytes**, asset ID \`10766476\`.
The release says both are for the standard7x6 board and small covers fewer positions. No source binary book was yet transferred/loaded in this environment.

Official C++ \`main.cpp\` supports default \`7x6.book\`, \`-b PATH\` for other book, \`-a\` to print per-column exact scores, and accepts one-based original column histories on STDIN (including empty line). Direct source: https://github.com/PascalPons/connect4/blob/master/main.cpp . Solver.hpp exposes \`loadBook(book_file)\` and \`analyze(P, weak=false)\` with \`INVALID_MOVE=-1000\`. Direct source: https://github.com/PascalPons/connect4/blob/master/Solver.hpp . **Do not confuse the opening book with a complete offline lookup of every 4-trillion-position game state**: Pons's solver searches outside book coverage, and no complete "perfect play from empty" trajectory was fetched by website in this turn.

Existing optional runtime alternative \`connect-4-solver\` documents loading external \`.book\` files with its \`OpeningBook\` and \`analyze("4424",{book})\` interface: https://ecc521.github.io/connect-4-solver/getting-started.html ; https://ecc521.github.io/connect-4-solver/solution-books.html . No additional package was installed in this environment.

### B. Markus Böck, strongly solved COMPLETE original7x6 WDL BDD database (priority 2: truly full-coverage)

Paper \`Strongly Solving 7x6 Connect-Four on Consumer Grade Hardware\` (2025): https://arxiv.org/abs/2507.05267 . Reports complete 89.6 GB strong **WDL** lookup representation, computed in 47 hours with 128 GB memory using binary decision diagrams. This is already solved output, NOT a task to recompute.

**Official deposited dataset with code for position-by-position WDL and best-move probing:**
- Zenodo: https://zenodo.org/records/14582823 (DOI \`10.5281/zenodo.14582823\`, published 2025-01-18, metadata modified 2025-07-09).
- Dataset \`strong_solution_w7_h6_archive.7z\` **46.8 GB compressed**, recorded md5 \`59750231c1131ee352a8bda03f231aea\`.
- Includes probing code, BDD full original7x6 WDL values, and eight-ply opening book. C source: https://github.com/markus7800/Connect4-Strong-Solver .
- The author's \`wdl_w7_h6.out solution_w7_h6/ 332\` example demonstrates querying WDL evaluation and each move's resulting W/D/L **without re-solving game tree**. An optional alpha-beta component finds fastest win / slowest loss **DTM**, which is NOT intrinsically stored as exact duration in WDL BDD. Source docs https://github.com/markus7800/Connect4-Strong-Solver .

**Important:** WDL-class-optimal continuations can be generated with complete BDD directly. *Strong-score* shortest-win/longest-loss continuations require a distance-to-mate solver or Pons's scoring. The user earlier distinguished broad WDL-optimal from strong-score optimal; keep them separate.

### C. John Tromp's independent historical reference (provenance/secondary source)

https://tromp.github.io/c4/c4.html confirms solved 7x6, an eight-ply database with 67,557 selected unfinished/unforced positions and an interactive perfect-game engine. Useful corroboration, NOT a comprehensive downloaded dataset of arbitrary root-to-terminal perfect histories by itself.

## Exact owner-mandated new empirical protocol

1. Download and checksum one of these existing externally SOLVED artifacts into the data input surface (outside canonical research files; never commit a 32MB/47GB blob to text research directory). Use official book \`7x6.book\` first for practical speed; full Zenodo WDL BDD remains the alternative for exhaustive results when storage/resources are available. Verify width7, height6, connect4, record size/checksum/version/license and query adapter contract BEFORE analysis.
2. Start at **genuine empty original board**. Obtain exact 7 per-column Pons strong scores using external artifact+solver (or full BDD per-column WDL values); do NOT guess any opening, handcraft a position, or use selected middle/end parents as substitutes.
3. At **EVERY** future original P0 or P1 move, query full per-action outcomes from the official book-backed engine, choose exclusively among highest strong-score columns. For separately labeled WDL-perfect sampling, choose among all WDL-category preserving moves, not among merely probable "good" moves. Vary deterministic tie seeds and eventually enumerate/summarize optimal branch-equivalence classes as resources allow. Original game stops IMMEDIATELY on first completion or full DRAW.
4. For each verified original root-to-terminal continuation, independently reconstruct original 37 open strands, 42 four-way owner junctions, 69 K4 lines, geometric U=69−both-owners-dead, L0,L1,S and all physical first-winning K4 line IDs. Sampled set-of-first-winning-lines across all root-perfect game variants is a DISTINCT estimand \`|union_h firstWinningLineIDs(h)|\` from single-position \`U(h,t)\`. Explicitly test owner 27/28 hypothesis under BOTH definitions without numerical target-fitting.
5. Compare Fourier owner-potential overlays/line set cancellation AFTER assigning actual P0/P1 ownership on the unfolded linked geometry; no toroidal windows, hypothetical complete-game postterminal continuation, or default "defensive obligation" framing.
6. The external published solution is only **ground truth for testing**. The future goal—a new analytic NONSTRATEGIC-BRANCHING exact WDL algorithm—remains distinct. Do not declare a downloaded solved table itself an original new algorithmic derivation or use the book as a hidden lookup inside the proposed nonsearch proof.
7. Archive reproducible exact root game ledgers and original winline IDs as code/data plus provenance in \`research/isograph/discovery/\`; commit incremental root and tie-variant checkpoints. No solver/main or qualified IsoGraph1.2 changes.

## Previous work now superseded as perfect-root testing

Original source \`independent-true7x6-EMPTYROOT-exact-oracle-perfect-play-campaign.mjs\` and direct in-house exact cold-root query experiments were a wasteful FIRST approach: a bounded cold solve failed to complete the seven root scores at 200,000 and again at 4,000,000 nodes. Those incomplete resource walls remain historical negative evidence, not a reason to substitute arbitrary middle/end states. **Use existing book/BDD before recomputing root**.

Unresolved in THIS execution: binary opening book or Zenodo table was **NOT actually downloaded/loaded**; outgoing network transfer to local container failed and a GitHub release binary could not be materialized through available tools. Therefore **ZERO real empty-root-to-terminal perfect-play histories were certified using newly web-found source data here**. The next execution must first provide/connect the published artifact or a browser/desktop environment capable of downloading it. Do not fabricate trajectories or attach root-perfect labels to arbitrary historic positions.

**Bottom line:** Correct and authoritative source data exists now. Compute perfect-play statistics from the published solution, not by cold-solving the same original game from zero for every candidate.
