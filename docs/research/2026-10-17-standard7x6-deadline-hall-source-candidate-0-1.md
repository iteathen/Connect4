# Standard 7×6 Connect4: frozen gravity deadline-prefix Hall invariant and falsifiers

**Date:** 2026-10-17 Pacific. **Owner direction:** zero strategic branching, standard 7×6 Connect4 FIRST with symbolic W/H/K preserved. **Canonical branch:** research/semantic-quotient. **Epistemic status:** CANDIDATE SOURCE CERTIFICATE, FROZEN PRIOR TO INDEPENDENT 7×6 REFERENCE. No IsoGraph authority promotion; no universal WDL or complete best-action claim.

## Motivation / comparison with source last-event capacity

The prior source-only lemma checks a whole residual win requirement G against the most generously delayed cell among G: if |G| exceeds the owner's available turn slots through *every* cell's latest legal event rank, G is impossible. That check can overlook an EARLY subset of G whose gravity deadlines require more owner stones than owner-turn slots available before those deadlines. The missing cross-cell coupling is a unit-job, ordered-deadline capacity obstruction, checked on ONE original source winning hyperedge, without building strategic futures or action-history distributions.

## Dimension-bearing source definition

Let W,H,K remain explicit, with current experiment W=7,H=6,K=4 and 69 genuine geometric lines. q=(h,R0,R1) is a first-win-stopped legal nonterminal residual position, n=sum h; side to move s=n mod 2. Each G in R_p is a nonempty subset of an original K-cell winning line still possible for player p. A future required cell t=(c,r) satisfies h_c<=r<H.

Define an **optimistic absolute latest relative deadline** under *all* legal future gravity schedules:

```
U_q(c,r)=(r-h_c+1)+sum_{d!=c}(H-h_d)=(W-1)H-n+r+1.
A_p(k,q)=floor(k/2)+ (k mod 2)*[p=s].
T_k(G,q)={t in G : U_q(t)<=k}.
```

The turn slots are those of the ordinary alternating game; every future play of length >=k has exactly A_p(k,q) placements by p in its first k positions. A required cell's placement cannot happen later than U_q(t), even in a hypothetical first-win-free continuation, because all cells above t in its own column are unavailable before it.

**New source lemma — deadline-prefix Hall necessary condition:** If a player p completes G at any later rank in a legal first-win-observing continuation, then for EVERY integer k>=1,

```
|T_k(G,q)| <= A_p(k,q).
```

Proof: all targets with latest possible rank <=k must already be placed by p within the first k moves. If a legal win terminates before k, complete the hypothetical gravity schedule just far enough for these already-owned targets: early placement doesn't weaken their slot bound; equivalently, the j-th earliest deadline of a target must have at least j p-turn slots by that rank. This is a pigeonhole/one-sided Hall condition on REQUIRED original source cells and unique owner-turn slots, not a claim that all such slots are actually usable under gravity. Precisely, if U_(1)<=...<=U_(m) is the sorted list of required-cell upper ranks (ties retained), define

```
EDF_possible(G,p,q) := FOR ALL j=1..m : j <= A_p(U_(j),q).
EDF_impossible(G,p,q) := NOT EDF_possible(G,p,q).
```

If EDF_impossible, p cannot win by G under ANY strategy or future opponent behavior. The source no-win condition is `every G in R_p is EDF_impossible`. Thus first-win-safe future P0 scalar outcomes belong to [-1,0], if P0 is proven unable to win, and [0,+1] if P1 unable to win. Both no-win => exact draw.

**Strict relation to prior candidate:** the last-event rule is the single j=m inequality of this ordered-prefix system. Thus this new test cannot lose sound source negatives but can add new negatives whenever an earlier prefix j<m overloads the owner turn budget despite the last j=m inequality passing. It does not claim sufficiency of EDF_possible, nor does it turn failure of one proposed defending policy into a winning proof.

## Current-action simultaneous source bounds and full M* reconstruction

For every one-based literal legal first move c inspect its cell x=(c,h_c) at q, not a future game:
- if own residual singleton {x}, immediately terminal winner: original mover wins, overriding any later rule;
- otherwise contract x from every owner residual and delete all opponent residuals containing x; update h_c->h_c+1, n->n+1, s->1-s; test EVERY nonempty residual G for that player's EDF owner slot overload;
- if only P0 cannot win => exact value interval [-1,0]; if only P1 cannot win => [0,+1]; if neither => [-1,+1]; if both => [0,0]; board full and nonwinning => [0,0].
- Combine with existing source-justified intervals/weak full-future orders, but never infer optimal membership without EXACT root value and strict best-set separation. If >1 inequivalent unresolved strategic class would require separate game values, return INCOMPLETE.

The producer is a static source event-row/rank arithmetic and residual-generator scan. No game-tree expansion, hypothetical strategy table, hidden QBF/BDD branching or full-game reference in the producer. Static action labels all evaluated algebraically at q are *not* separately valued future games.

## Frozen 7×6-only evidence plan and disconfirming controls

1. Build 69 W,H,K-generated original line masks using 42-cell-safe BigInt. Cross-check counts horizontal 24, vertical 21, diagonal 12+12. Verify 625 unique nonempty subsets if computed.
2. Generate deterministic, legal, explicitly first-win-stopped **standard 7×6** validation prefixes from move 0 through late plies using seeds/method recorded with machine artifact; record source q and source family antichains and column heights. Validation-generated paths are outside source-only producer and are not proof of unrestricted game behavior.
3. Evaluate source-only last-event versus EDF-sorted-prefix no-win statements at q and after each currently legal literal first action. Report incremental source certificate counts BY RANK and beyond whole-family exhaustion. Save witnesses with full 7×6 histories, h, player, requirement masks, and which j failed. Note **no general solution** if all early/mid-game instances remain undecidable.
4. A genuinely independent physical first-win recursive solver, restricted to sampled **STANDARD 7×6 near-terminal prefixes only** and never accessible by the producer, independently tests each asserted no-win interval, exact draw, root exact WDL and full optimal labels if claimed. Explicitly distinguish absence of samples from correctness proof.
5. Mandatory standard `44444` (move6 P1), `444444` (move7 P0), `4444442` (move8 P1) chronology; don't interpret lack of early capacity obstruction as a failure theorem. None may be declared solved unless *unrestricted* (V,M*) certified.
6. Any false no-win or value/move-label claim, invalid first-win, wrong BigInt/row indexing, or any >ONE inequivalent semantic future evaluation means FAIL. Preserve negative evidence. Small 4×3/4×4 board outcomes are NOT part of present positive qualification.
7. Freeze this proof and its falsifiers in source control BEFORE running the independently implemented test. Capture executable harness before expensive work and checkpoint result after.

**Status of universal zero-fanout Connect4:** OPEN. The new lemma is a complete algebraic impossibility proof for each qualified SOURCE claim, not a new total-game WDL theorem.
