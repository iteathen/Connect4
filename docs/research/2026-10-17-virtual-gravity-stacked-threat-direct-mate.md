# New direct source theorem: one-column stacked threats form a gravity-assisted forced win

**2026-10-17 Pacific.** Candidate owner-directed no-search **one VALID Level-2 move** theorem, frozen BEFORE standard 7×6 physical controls. Original symbolic W,H,K retained. Qualified original source q, first-win and gravity semantics unchanged; no IsoGraph 1.2 promotion. This is a refinement of the more general forced-threat ladder theorem and uses **ZERO** source future game q construction.

Let p be current mover on genuine nonterminal q=(h,R0,R1). For candidate literal legal column a let x=(a,h_a). Assume p does NOT instantly win at x; if they do, the immediate terminal rule already gives a best action. Let the new after-p-move gravity-playable target of column b be y=(b,h_b+1_{a=b}), and let z=(b,row(y)+1) be the cell DIRECTLY above y in the SAME column, requiring row(z)<H.

Let p-owner sources of future target t after p moves x be exactly identifiable from CURRENT q by the original residual test:

    Threat_p(q,x,t) :=
        ({t} in R_p(q)) OR ({x,t} in R_p(q)).

A normalized antichain after owner contraction has singleton {t} iff this expression is true (or an immediate win was already detected).

Opponent's immediately winning replies from CURRENT q after p moves x are the cells t that are playable after x AND `{t}` belongs to R_o(q). Owner p's move deletes any enemy residual containing x, and cannot transform any surviving enemy doubleton into singleton. Thus the guard

    For every new playable t, {t} NOT in R_o(q)

suffices to guarantee that the opponent has NO immediate win on their next move.

**STACKED GRAVITY-FORK THEOREM.** If a nonwinning source action a satisfies (i) the no-immediate-opponent-counterwin guard, (ii) `Threat_p(q,x,y)`, and (iii) `Threat_p(q,x,z)` for two consecutive SAME-column original future cells y,z described above, then action a is a **forced FIRST-WIN** for p against ANY opponent reply:

- If o chooses a column other than b, y remains immediately playable and p takes y, completing an original K-line before any other response.
- If o chooses b, o occupies y and by gravity releases z, which remains an untouched owner-p singleton winning requirement (it cannot contain y because source test requires {z} or {x,z}); p then takes z and wins.
- o cannot first-win on the intervening reply by guard. The board cannot full-draw before p's terminal reply because z exists above y. Thus the theorem respects first-win stopping and all original winning geometries.

This is a *sequential same-column fork*, not the standard immediate TWO-THREAT rule requiring two **different simultaneously playable columns**. It is a SOURCE local sufficient condition with no post-action q; source examines current original R_p,R_o, heights and player parity. It may certify a WIN continuation using an existing blocked-or-unblocked SINGLE playable threat PLUS an unplayable immediately-above future threat. A complete Level2 move set is NOT claimed; one literal certified a is sufficient for VALID_CONTINUATION.

**Direct source action-scan permissible:** evaluate this predicate for current legal columns a from one q to find one certificate; static q-mask scans are structural proof operations, NOT independent game semantic future value evaluations. Alternatively select first matching a deterministically, return it with explicit x,y,z, source residual witnesses and opponent-immediate guard. There is no search for alternate strategic futures, no oracle, and no need to construct q_a or q_ab.

**Controls frozen before trial:**
1. Standalone pure SOURCE producer uses exact original future singleton and owner doubleton incidence; no game-next, solver.solve, physical array, or strategy graph. Count all original mask operations, and preserve one-based original literal column names. Output proof y/z and t sources.
2. Generate true standard7x6 nonterminal physical prefixes. Independent true physical first-win-stopped evaluator must inspect every opponent literal reply to a source positive a and verify p immediate wins in b (if opp deviates) or at z (if opp plays b). For all success source witnesses, independently compute the full unrestricted physical winner/action value where feasible, and explicitly report whether any root result was already a standard immediate win or two-distinct-column fork.
3. Discover **at least one** valid actual7x6 candidate a where TWO same-column stacked singleton win requirements exist, p has NO two distinct currently playable threats, a not immediate win, o has no immediate counterwin. If none is found in bounded sample, mark SAMPLE NEGATIVE and do not claim mathematical incompleteness or source coverage gain.
4. No claim that 44444 has such a certificate unless computed. Owner arbitrary-q total no-branch Level2 remains OPEN; source partial theorem is scoped.

**Why this matters:** the opponent cannot block both winning *events* with one move even though the two threat events live in the SAME column. Gravity's release constraint works FOR the attacker: the forced defensive blocking stone is exactly what makes the higher p-winning cell legal. This is an explicit rank-2 conditional resource relation invisible to a naive count of distinct concurrently playable winning columns.