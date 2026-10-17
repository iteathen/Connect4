# Frozen hypothesis: co-release static pairings across different height columns

**Date:** 2026-10-17 Pacific, pre-experiment branch HEAD `931341e5921c213a7240d51eaa3daf066763545f`.
**Owner:** research/semantic-quotient. **Status:** MATHEMATICAL CANDIDATE + FALSIFIER PLAN, NOT a proved Connect4 value or total zero-branch method.

## Exact full-future pairing generalization

At a legal nonterminal q, consider all ORIGINAL future empty cells as the disjoint union of W strictly ordered chains (each column's gravity placement order). Partition these available event cells into DISJOINT two-cell static response pairs. Let `pairID(x)` denote the pair containing event cell x. An attacker p moves first; defender 1-p responds immediately in the OTHER cell of each pair when attacker takes the first cell.

To guarantee the mate is gravity-playable **whenever the attacker can first touch any uncompleted pair**, enforce:

**Vertical domino pair:** two consecutive cells (c,r),(c,r+1) of ONE column. If the lower becomes playable, attacker must take it first; defender's upper becomes playable immediately.

**Co-release cross-column pair:** two cells (c,r),(d,s) with c!=d, such that EITHER both are current first empty cells in their columns, OR their immediate in-column predecessors (c,r-1) and (d,s-1) lie in the SAME ALREADY-CONSTRUCTED static response pair. This ensures both cells become available simultaneously after their shared predecessor pair completes. Their original row coordinates r and s NEED NOT BE EQUAL.

A static matching obeying these rules admits a gravity-safe mate-response strategy by induction on source pair dependencies: after every attacker/defender double placement, every pair is either untouched or fully filled, and any next-playable pair has an immediately available mate. A fixed pair cover of EVERY original ATTACKER residual winning requirement `r∈R_attacker` with at least one full pair implies the attacker cannot complete ANY winning line through all remaining play. The defender may win earlier, strengthening the prevention bound. This is an EXACT unrestricted WDL bound, not tactical horizon.

**New feature:** source columns with unequal heights can be paired when their first CURRENT events are co-playable; e.g. (c,h_c) paired with (d,h_d). Their successors remain co-playable if each has the same previously paired source predecessor. This captures certain diagonal residual requirements impossible under the old same-row horizontal-only pairing. The static perfect-matching must still consume ALL available future cells, which is even in a guaranteed attacker-first/defender-second paired sequence.

## Constructive source-only matching certificate
Maintain one source **construction frontier** height vector `k_c`, and the pair ID whose completion releases the next cell in each column. At each source proof-construction step choose the first still unpaired available column c (canonical column order), either
  1. pair its next two cells vertically (if both exist), increment k_c by 2; or
  2. pair its next cell with next cell of ANY other available d whose source predecessor pair ID equals that of c (both initial sentinel or the SAME earlier pair), increment both k_c,k_d by 1.
The pair ID of each newly constructed matching edge is unique and assigned to every participating column's last completed event. Because each construction step adds a STATIC matched pair, not a game continuation, enumerating alternative **static proof candidate pairings** is allowed, but the operator must report all such pairings/cell subset tests and NEVER construct/evaluate a game-semantic future q. At most W<=7 columns, 42 source cells; if a certificate search times out/caps, return INCOMPLETE, not a false WDL result.

Return only a fully verified source static pair certificate for all empty cells AND full-pair coverage of every attacker's source residual minimal generator. Prove source action guards and first-win stopping. An attacker could choose pairs in any actual legal order; the predecessor co-release condition, not proof-construction order, guarantees pairing always works.

## Mandatory independent falsification BEFORE any game-value claim
1. Generic abstract chain matching structural validator: every produced cross-column pair has both predecessors absent or in same previous source static pair; every vertical pair consecutive; all cells covered exactly once. Enumerate ALL paired-construction partial-order-consistent ATTACKER legal first cell selections for small 2/3-column chains and verify mate always playable under any completed-pair subset (independent proof-control ONLY, not producer). Mutate one cross pair to have different predecessor pair IDs: validator MUST reject.
2. Full independent exact-q memo-state controls on 4x3 Connect3 and 4x4 Connect4: source pairing certificate => attacker-first cannot win, verify both the root and every literal first-action WDL is within correct bound. Compare #new co-release certificates to the earlier vertical/equal-row scheme under same source and count actual source proof work.
3. Source-per-first-action nonloss pairing: after mover p first plays source landing x_c, opponent o attacks next. Co-release matching of remaining future cells covering opponent R_o^c certifies p cannot lose, potentially exact action DRAW when R_p^c empty. Verify every legal source c independently by qualified exact WDL, first-win and draw event order. Do not pass solved values into producer.
4. Canonical `44444`: after any P1 first action, 36 empty cells allow perfect matching. Check source co-release matching, preserve all seven action label values as UNKNOWN if no certificate. A certificate may prove nonloss for an action, not automatically full game WDL or best move set.
5. If sound, combine co-release bounds with source full-future inequality WDL lattice and one-lane exact optimal-set separator; zero strategic fanout max ONE, no numeric inferior WDL fabrication. Count new exact best sets and false positives.
6. Original 60k nodes/300k source operations/10k support representations/15s safety envelope remains unchanged; these are NOT game solve-time research success metrics. No authority promotion/merge.

**Adversarial guards:** a merely threatened upper cell cannot be treated as playable before source predecessor completion; a cross pair whose predecessors belong to distinct pairs can have one mate inaccessible and MUST be rejected. Opponent immediate singleton cannot be blocked by a complete attacker-owned pair. Certifying a pairing on the **wrong mover turn** is unsound. Full 7x6 result remains UNKNOWN until a complete direct exact WDL/tie theorem is produced.
