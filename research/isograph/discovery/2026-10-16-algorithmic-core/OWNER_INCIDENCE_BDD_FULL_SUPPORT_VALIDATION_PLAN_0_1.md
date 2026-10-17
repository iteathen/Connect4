# Full-support independent owner-incidence BDD qualification — bounded follow-up

**Date:** 2026-10-16; canonical owner `research/semantic-quotient`.
The rule-only owner-incidence BDD successfully compiled empty **4×3 Connect-3** (256 supports, peak 2,003 BDD nodes, P0 WIN all four moves) and empty **4×4 Connect-4** (625 supports, peak 7,354 BDD nodes, DRAW all four moves), under 60,000-node/300,000-visit/15s per-board caps. Their outcomes were NOT queried or incorporated during compilation. Preliminary record `OWNER_INCIDENCE_BDD_PRELIMINARY_ROOTS_0_1.json`.

## Narrow extra experiment

Add a **validation-only `retainAllSupportFunctions` option** to the same exact BDD compiler, using the identical support transforms and owner-restriction semantics. It retains the complete support-indexed action threshold pairs rather than releasing each child after last predecessor use, enabling a single completed symbolic compilation to evaluate **every legal physically reachable nonterminal board** at its own support. This trades more memory for much broader implementation qualification. It does not search colored boards or game histories during formula production.

**Fixed budgets unchanged:** 60,000 simultaneously retained BDD nodes, 300,000 nontrivial apply/restrict/not visits, 10,000 supports, 15 seconds compilation per board. If all-support retention fails, revert to the already completed liveness reference and qualify selected legal support fibers; DO NOT increase budgets.

**Independent controls after compilation:**
- 4x3 physical enumerator complete 4,631 nonterminal states/11,818 transitions, exact physical W/D/L and all literal action values; compare every compiled owner-variable BDD threshold/action result.
- 4x4 complete 134,289 nonterminal states/304,574 legal transitions if symbolic retention closes, otherwise report subset honestly.
- Absolute P0 value convention +1/0/-1, all WDL-tied actions. Compare fresh independent q-only recurrence and physical first-win validator rather than solved oracle labels.
- Scope positive/negative: terminal-first exact P1 winning guard, P0 owner-variable restriction. Try deliberate mutations, preserve the first physical counterexamples. Preserve literal reflection transported action sets; do not infer that all mirrored physical q are literally equal.
- Compile 4x3 chosen support [2,2,1,2], [1,1,1,1] if all-support retention unavailable and check all associated physical q. Additional abstract q *unrealizable* residual pairs are OUT OF SCOPE for this ownership-carrier model.
- Standard7x6 near-terminal supports only if budgets allow; empty standard root cannot fit 10k support bound and is **not** a qualification target.

**No stronger claim:** a completed 4x3 symbolic WDL compiler with polynomial work **for that fixed board** does not prove polynomial scaling in dimension or general computational branch elimination. Every support/action edge is still an encoded alternating choice. Record 4x4 load, memory, BDD widths and all repeated subcalls honestly.
