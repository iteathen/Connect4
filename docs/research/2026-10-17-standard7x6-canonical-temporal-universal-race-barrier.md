# Canonical 44444 source timing barrier for unconditional temporal-transversal certificates

**Date:** 2026-10-17 Pacific. **Status:** exact deduction from previously frozen source invariants, checked on actual standard 7×6 Connect4 (W=7,H=6,K=4); ZERO strategic game evaluation. Not a game outcome, not a 7×6 zero-branch general solver, no IsoGraph authority promotion. **W,H,K are deliberately symbolic.**

## Root invariant and narrow obstruction

For any gravity nonterminal source q with ply n, CPC gives for future cell t=(c,r) with r>=h_c

    U_q(t)=(W-1)H-n+r+1.

Since r>=0,

    U_q(t) >= D(q):=(W-1)H-n+1.

An entire source residual generator G can only be **universally guaranteed fully played under arbitrary schedules** by L (in the conservative latest-event sense used in the temporal transversal certificate) if

    max_(t in G) U_q(t) <= L.

Let B_o(q) denote the independently valid lower bound on opponent o's *earliest possible* terminal win rank from original residual requirements, gravity prerequisites and alternating owner turns, as previously frozen. The temporal certificate requires STRICT first-win guard L<B_o(q).

**Proved source barrier for this SPECIFIC certificate:**

    D(q) >= B_o(q)
        =>
    no L with L < B_o(q) has ANY nonempty compulsory p requirement F_p(L,q).

Proof: for any L<B_o<=D(q), and every future cell t, U_q(t)>=D(q)>L. Thus no G with nonzero required cells can have all latest ranks <=L. The transversal certificate cannot assemble a positive overload witness, regardless of the quality of fractional packing / greedy ordering / chosen source line set. This says NOTHING about other response/adaptive/strategy certificates, and doesn't mean p cannot force a win under perfect play. It is not a failure theorem for all possible zero-branch algorithms.

## Standard 7×6 actual canonical controls

Frozen executable control (committed BEFORE local Node22 run):

    research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-canonical-transversal-control.mjs

Its exact Git blob is \`405c92422aa88d82a9fb65484e548d60a5c7c410\`, matching the directly run local source. It physically reconstructs all 69 geometric win lines and the exact source antichains of \`44444\`, each \`44444c\` for c=1..7, and the historical \`4444442\` (absolute move8). Both frozen source producers, full-board fractional packing and temporal fractional packing, return INCOMPLETE for p=0 and p=1 in EVERY listed source. An independent ordinary game reference was NOT invoked: this control checks SOURCE certificate absence only. All seven P1 move6 actions remain original literal labels.

| Genuine W=7,H=6,K=4 history | n | Source floor D(q) | min source earliest-opponent-win bound over p=0/1 | Temporal full-source certificates |
|---|---:|---:|---:|---:|
| \`44444\` | 5 | 32 | 6 | 0 |
| each \`444441\`...\`444447\` | 6 | 31 | 5 | 0 |
| \`4444442\` | 7 | 30 | 4 | 0 |

For \`44444\`, both p choices have B_o=6. All seven reply states have both opponent-win lower bounds <=6 (at least one <=5), so D>=B_o for every p. In \`4444442\`, both B_o<=5. The barrier is triggered in ALL these cases; no possible complete improvement of the static fractional packing LP can repair this particular temporal certificate at the canonical early seam.

Actual numerical results are deterministic and reproducible by running the pinned executable, which prints JSON. Compact machine checkpoint:

    research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/STANDARD7X6_CANONICAL_TRANSVERSAL_SCOPE_RESULTS_0_1.json

## Research disposition

**Qualified narrow negative:** full-board and conservative universal-temporal transversal source certificates do not apply at \`44444\`, its seven move-six replies or move8 sample. The temporal certificate's timing conflict is **STRUCTURAL**, independent of packing optimization.

**Immediate next mathematical target:** derive an ADAPTIVE source-only certificate in which compulsory blocking obligations are CONDITIONAL on which original line/threat is exposed at a given rank. It must keep the true \`forall\` defender / \`exists\` winning response scopes, correlated overlapping original lines, shared multi-line blocker moves and distinct first-win races, but must not enumerate multiple inequivalent strategic game futures or hide them in a proof or strategy graph. Investigate a universal potential/descent invariant on ONE q, with source-derived strict move-optimality/tie separation, rather than stronger unconditional all-play guarantees.

The total standard 7×6 zero-strategic-branching algorithm remains UNKNOWN, and \`44444\` exact unrestricted WDL and complete M* UNKNOWN.
