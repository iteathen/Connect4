# Win-space representation: owner discussion checkpoint

Date: 2026-09-09. Status: research discussion, NOT accepted implementation or new benchmark evidence.

Owner request at this checkpoint: preserve research and notes in the repository first; select candidate ideas and run further experiments afterward. This document records the discussion. It does not authorize or report a new experiment, change maintained Connect4 semantics, or select a winning design.

## The owner's actual proposal

The owner clarified that "win space" means stone positions and their relationships that can contribute to a winning line for either player. It does NOT mean two separately solved sets of states from which each player can force a win.

Key owner statements, quoted from this conversation:

> The win spaces means the stone positions that contribute to a win for one or more players.

> we can map the win positions instead of the board, we still need legal move to expand the tree but we don't need a full bitboard in search mostly.

> We can simply build a tree of unique win lines that carry address mapping to the board for usability reasons.

The intended shift is representational: legal moves still supply the transitions, but the internal search state should primarily describe the remaining winning structure, rather than repeatedly carrying a complete colored board and deriving its significance. Board addresses remain available for move selection, display and usability. Negamax remains the selected search/value framework; the owner did not authorize a switch to MCGS.

The organic-design principle is to represent the underlying relationships so that several useful behaviors follow from one structural change. Look for eliminated distinctions, duplicated facts and coordination mechanisms, not merely another policy layered over the current architecture.

## Candidate formulation, not an implementation decision

A possible exact remaining-game state is:

    R = (column frontiers/heights, side to move,
         remaining winning requirements for player 0,
         remaining winning requirements for player 1)

Heights supply legal landing addresses and occupied-cell count. Requirements are sets of addressed empty cells needed to complete a still-available winning line. A legal placement updates this system directly:

- For the mover, satisfy the addressed cell in every requirement containing it.
- For the opponent, remove requirements containing that newly occupied cell.
- Advance the legal frontier and the real move count; alternate the player.

An alternative physical representation keeps live geometric-line masks: L0 contains lines with no P1 stone and L1 contains lines with no P0 stone. Heights identify the occupied/empty cells. A move at x eliminates linesThrough(x) from the opponent's mask; a surviving mover line with no empty cells is a win. This is an alternative encoding of the idea, not a requirement to retain every original line forever.

The distinction between the static winning-condition network and the negamax expansion must remain explicit. A tree/trie can share prefixes; a DAG or incidence representation can share cells and repeated requirements. Do not silently choose a pointer-heavy object graph or copy an entire line tree at each search node. Fixed numeric IDs, masks and precomputed cell-to-line incidence remain candidates.

## Proposed reductions and their exact boundaries

1. Equal remaining requirements for the SAME player can be merged for terminal-game reasoning. Original geometric IDs can remain in explanatory metadata without defining separate search states.
2. A same-player requirement A that is a subset of B absorbs B: completing B necessarily completes A no later. This Boolean simplification is not heuristic move pruning. Opponent occupation that blocks A also blocks B at a shared required cell.
3. Under the proposed representation, legal nonterminal boards with the same heights/turn and identical winning requirements have corresponding legal successors and terminal outcomes. This is a candidate exact-equivalence argument; compact canonical encoding, restoration and full-size performance are not thereby qualified.
4. Cells or colors no longer relevant to any goal may be omitted only while preserving their already-established consequences. Erasing a color must never revive a previously blocked line.
5. A whole remaining column absent from both players' requirement supports can contribute neutral turns. Such turns still consume capacity and alternate the mover. Collapsing equivalent choices is not deleting tempo. An apparently irrelevant cell below a relevant cell is not an unconstrained neutral move.
6. These claims concern exact terminal-game values, including real move timing. They do not automatically preserve the frozen custom evaluator's line counts, weighting, repeated-immediate behavior, or other heuristic semantics.

## What it means for draws to fall out

Do not confuse these two empty cases:

- A retained goal has an EMPTY requirement: the goal is completed; process its winning terminal result first.
- BOTH players have NO remaining goals: no future move can restore a blocked goal; the whole remaining continuation region is an exact draw even if legal filler moves remain.

Other optimal-play draws can retain contested winning possibilities and still require adversarial resolution. They emerge as zero through negamax over the reduced representation. No separate inventory or search representation of draw boards is required.

"Outside the current goal support" is not itself a draw-valued move. Legal support, finite remaining capacity and turn timing remain part of the search state. "Not yet discovered" is not an exclusion proof. Individually blockable goals can interact; do not solve lines independently and assume their defenses compose.

## Candidate connections retained for later selection

- Intrinsic occupied-cell rank for state organization, optional TT banks and limited semantic obsolescence after actual root advancement. Banking deliberately changes addressing; it is not the old fixed-single-base kernel unchanged.
- Same-state monotone interval knowledge [L,U], combining as [max(L1,L2), min(U1,U2)]. Exactness when bounds meet; estimates and move guidance remain distinct from certified bounds. Coherent physical publication is a separate obligation.
- Bounded coarse proof sharing, completed-bound reuse, and optional in-flight request coalescing above synchronous negamax. Do not assume all windows are answered by one result.
- Exact key compression using address information plus a stored residual. Its injectivity and descriptor-coordinate interpretation must compose with resizing and relocation.
- Temporal affinity among already-eligible tasks as an alternative to physical isolation. Replay retention gains are not automatically live-search gains.
- Bit-parallel line incidence/counters; forced-consequence compression; stronger/weaker residual-state relations; reusable proof certificates; residual-game symmetry. These remain hypotheses, with gravity, first-win stopping, distance score and custom-evaluator distinctions explicit.

No ranking or candidate selection is made here. A small apparent goal set does not prove a small number of interacting goal states or a faster implementation.

## Relationship to preserved experiments

Earlier root-compiled neutral-action/key-mask experiments are a narrower result, NOT an implementation of the full line-network search proposed here. Their positive enriched cohorts and negative/no-op ordinary cohorts must both remain visible. The organic experiment packet and the separately committed structural-quotient series have different corpora and measurements; do not combine their counts or results.

Exact-key and coarse-proof packets are separate interventions. Neither establishes the performance of the full win-space representation, rank banking, dynamic line maintenance, or a composed production engine.

All existing failed prototypes remain evidence. A faithful future comparison must preserve exact scoring, include compilation/restoration/metadata costs, distinguish structural applicability from timing-based selection, use independent oracles where feasible, and compare complete solves rather than only a favorable replay or node count.

## Preservation state when this note was written

Remote reads before mutation: main de47d43f4f4133a68973d0876a402531ef5735da; research 30fddaa6dd80a62f2707da1e327f782702693ccd. Main is not a write target. The four mounted research ZIPs and their reports have been inventoried locally. This note's creation alone is NOT a claim that every packet member has reached GitHub; the preservation inventory must report that separately. No search experiment was executed in this preservation unit.
