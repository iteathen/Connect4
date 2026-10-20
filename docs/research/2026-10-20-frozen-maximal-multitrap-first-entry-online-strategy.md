# Frozen candidate: maximal multi-trap first-entry envelope and online responder WDL

Date 2026-10-20. Canonical owner research/semantic-quotient. Status **deductive guarded candidate before physical tests**, not a universal source WDL algorithm or promoted IsoGraph game-theory authority. Discovery objective: move from full static terminal K4-free colorability to a source-derived, strategy-restricted *temporal* compatibility cut. No strong-terminal 28 lines, past oracle values, or recursively evaluated q values enter the proposed source guard.

## Finite original owner/gravity setting

Let q be any genuine nonterminal no-firstwin original W×H Connect-K state (K>=2; primary new tests K4 W,H>=5, strict interior W,H>=6). D is the current mover, A=1-D is respondent. Each column c has physical height h_c and free t_c=H-h_c.

For any c with t_c>=2, write x_c=(c,h_c) for currently playable lower cell, and y_c=(c,h_c+1) for cell directly above it. Define the **maximal source trap set**

    C_A(q) = {c : t_c>=2 and y_c is an original A one-missing K winning-line target}

The A-owned K-1 other cells must already exist in the original board, with no D blocker; y_c is currently unplayable, becomes playable upon D claiming x_c. Include ALL such columns, not one chosen trap. Assume C_A is NONEMPTY and every NONTRAP column d outside C_A has EVEN remaining capacity t_d (including 0).

For each such nontrap d define its finite lower half-pair sites

    E_d = { (d,h_d+2j) : 0<=j<t_d/2 }.

Let E be the UNION of E_d over all nontrap columns and let T be the set of trap frontier cells {x_c:c in C_A}. Let R_D(q) be the COMPLETE family of live original D winning-line missing-cell requirements (blocked D lines excluded, same-game all K orientations, every original physical line).

### One-pass source guard

For every G in R_D(q), form F_G=G\E. Require

    F_G is neither EMPTY nor the SINGLETON {x_c} for any c in C_A.

Equivalently no live original D residual winning requirement is contained in E OR contained in E union {x_c} for any SINGLE trap column c. This is a full owner-specific residual requirement check plus gravity parity masks, not a per-winline scalar count or approximate greedy line score.

This differs from the naïve aggregate envelope E union T. The owner D CANNOT occupy TWO distinct trap frontier cells before A firstwins: A wins IMMEDIATELY upon the FIRST such entry, so they must not be treated as simultaneously attainable. In particular a D line whose only missing cells are x_c and x_d at two distinct traps is harmless under THIS response policy, even though it lies inside E union T and would defeat an over-conservative all-traps-at-once envelope test.

## Exact conditional WIN theorem (to test independently)

Under the source guards, the respondent A has an explicit legal ONLINE firstwinning strategy:

- If D plays current x_c in ANY trap c∈C_A, A immediately drops at now-legal y_c, completing the existing original A K-line. A firstwins unless D firstwon on x_c, which the source guard prevents.
- If D plays in a nontrap column d, A immediately drops at the new upper mate (d,h_d+1). Because its prior remaining capacity was even, there is always a legal upper cell, and completing this pair restores an even capacity in d. All trap columns remain untouched and their latent K-line targets persist.

Write m=Σ_(d not in C_A) t_d/2. Each surviving nontrap D/A pair reduces m by 1, and no nontrap can remain playable once all m pairs are used. Since at least one trap c has two free cells, D eventually must enter a trap, where A firstwins. Along every prefix before A firstwin, all D new owner cells lie in E, except that on the final D turn D may own ONE trap x_c. The source guard excludes every original D winning-line residual G from BOTH attainable envelopes, so D can never firstwin earlier. A may firstwin on an earlier mate move; this only strengthens the conclusion.

Therefore A forces FIRSTWIN within at most 2m+2 further plies, under arbitrary adaptive D moves. Signed exact V(q)=+1 if A=P0 and −1 if A=P1. Guard failure means INCOMPLETE, NEVER D win or A draw. Source construction reads q, true owner-specific original K-line residuals and gravity only; its source complexity is O(WH + K*N_original_winlines) with a bounded O(W) check for singleton trap remainders, no recursively valued successors.

This is a strict SET-VALUED FIRST-ENTRY TEMPORAL-ENVELOPE refinement of the 2026-10-20 one-danger multireservoir theorem. For |C_A|=1 it reduces to that theorem's masks and guard. For multiple traps the single-entry safety envelope is generally narrower than E union T; an actual strict original-game witness must be measured independently before claiming observed added coverage. Does not claim necessity, exact all-q Safe_A, or empty-root WDL.

### Relation to terminal languages

The *unrestricted* static full K4-free terminal language Z_WH(q;z) may be nonempty, and even a legal cooperative draw may exist, while this A response policy prevents any draw. The response-contract language has no safe terminal extension: if D avoids every trap, all nontrap even pairs exhaust while trap columns remain at least 2-high; the very next D choice enters a trap and A firstwins. This is a genuine STRATEGY-RESTRICTED temporal terminal obstruction. Static D_static(q)=0 is therefore NOT required for this theorem; it is a different, stronger source guard route to A's safe firstwin.

## Preconditions, counterexamples and independent falsifier protocol

Freeze here BEFORE collecting positives or adjusting definitions. Reject immediately if q is terminal, C_A empty, any nontrap odd t, original y is not A-owned-three-plus-empty valid K target, or some D residual G is contained in E or E union one trap x. Only after source guard passes may a checker validate original gameplay. No reference best-move or 28 terminal lines allowed in source selection.

1. Implement a transparent Node ESM source checker and an independently written Python original physical ray checker. On true legal firstwin-free W5..10,H5..8 K4 states (including W6H6, W7H5, W7H6, W8H6 where feasible), compute maximal trap C, E and F_G with true original K-lines. Record positive/negative counts and at least one live C>=2 example if found.
2. For every positive, independently play ALL current D opponent legal actions against exactly this online policy (to depth bounded by m+1 D moves; branching only in the **validator**, not the source guard), check every original firstwinning cell, legality, bound, no D firstwin and eventual A firstwin. If an exhaustive opponent tree is too large, report a finite sampled check and rely on theorem's proof rather than fabricate exhaustive verification.
3. Compare source-positive C>=2 roots against EACH valid one-danger source theorem guard on the SAME q. An added coverage result is only real if old guard returns INCOMPLETE and new guard proves WIN. Record any counterexample and retract or narrow candidate, never patch away physical failures without their raw history.
4. Screen known genuine cooperative drawn histories and selected historical firstwinner prefixes without using their solved WDL labels as selection inputs. Independently compute full D_static(q) for a bounded positive sample when practical; D_static>0 alongside exact multi-trap WIN would witness true policy-vs-spatial separation.
5. Use published empty-root outcomes W5H6 DRAW,W6H6 P1 WIN,W7H5 DRAW,W7H6 P0 WIN,W8H6 P1 WIN,W10H6 P0 WIN only AFTER candidate freeze as consistency controls, not fitted coefficients. Empty q has no trap K-1-in-line, hence candidate necessarily says INCOMPLETE at all these roots.

Hard limitations: The theorem is a guarded responder-certificate family, not the sought total nonsearch WDL law. The central missing component for universal WDL remains a source-derived mechanism for creating/maintaining trap/reservoir compatibility against every opponent strategy from early q, including odd unpaired columns and opponent counterthreats. All qualified IsoGraph 1.2 files and production solvers remain unchanged.