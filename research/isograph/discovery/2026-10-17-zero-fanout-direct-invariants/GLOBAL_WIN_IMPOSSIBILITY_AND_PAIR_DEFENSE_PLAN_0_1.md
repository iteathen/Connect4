# Frozen mathematical experiment: global zero-branch WIN-impossibility and guarded pairing defensive bounds

**Date:** 2026-10-17 Pacific. **Owner research branch:** `research/semantic-quotient`. **Live HEAD before test:** `a98b60125da19846893ab355dd3f63b738bf90fd`.
**Status:** PRE-EXPERIMENT EXACT HYPOTHESES, not verified value classification.

## Owner success criterion
Not fewer search branches, not faster solve, and no hidden alternate game futures. Exact `(unrestricted P0-relative WDL, COMPLETE optimal literal action set)` from original source q with max ONE inequiv game-semantic future evaluated at any state. Source-local static proof-certificate enumeration is permitted; gameplay continuations or separately evaluated child WDL are prohibited.

## Two source-only nonlocal exact value bound candidates

**Winline extinction theorem (no strategy needed).** In legal nonterminal q=(h,R0,R1), if `R0=[]`, P0 can never complete a first win in any continuation: `V(q)` and EVERY currently legal first-action value are in `[-1,0]`. If `R1=[]`, P1 can never win: `V(q)` and each legal action value are `[0,+1]`. This follows because original residual win requirements can only contract upon an owner's acquisition and disappear upon an opponent's blocker; a missing generator family NEVER reappears. Simultaneous extinction gives DRAW for all. This is a full-future source-bound law independent of which player is to move.

**Attacker-first paired-response defensive theorem.** At legal nonterminal q with mover p at rank n, remaining future total cell count even, suppose there is a static partition of EVERY remaining future cell into paired available cells, each pair either
  - a consecutive vertical pair within a nonfull column, lower cell first, or
  - a horizontal same-row pair from two currently same-height columns paired at every future row,
such that EVERY minimal original source residual winning requirement for ATTACKER p contains BOTH cells of at least one paired block. Then defender 1-p has an exact fixed mate-response strategy: whenever attacker first takes a cell of an untouched pair, its mate is immediately gravity playable for defender. After the response the pair is fully occupied, so attacker never owns both cells of any pair, and therefore cannot complete any of R_p's residual winning requirements before defender responds. Consequently
  p=P0 to move => `V(q)` and all first-action values have upper <=0;
  p=P1 to move => `V(q)` and all first-action values have lower >=0.
Defender may win earlier (which only strengthens its bound); first-win stopping respected. If R_defender is empty as well, the result sharpens to DRAW for every first action, already covered by the previous direct-pairing theorem (P0 attacker + P1 empty), now with mover symmetry.

**Crucial proof guard:** This applies when the ATTACKER moves FIRST in the static pairing game, and defender responds SECOND. Pairing is NOT automatically a winning strategy for the first-moving player if the defender moves first; do not swap turn roles. Opposite-player residual generator masks may overlap pair cells and do not invalidate the bound, but may produce an earlier defender first win.

## Static proof construction
Use one deterministic source-only pairing matching, not a search over game histories: pair odd remaining columns horizontally with a currently equal-height partner, and pair remaining even-capacity columns vertically or horizontally when its source residual generator coverage improves. The historical `direct-zero-fanout-operator.mjs` already contains a direct pairing proof *restricted to P0 as attacker and R1=[]*. Extract a solver-neutral certificate producer for either mover, report actual source generator and bitset tests. A deterministic failure is INCOMPLETE, not proof no pairing exists; a future *static certificate search* may explore matchings only, never game futures.

## Test sequence
1. Freeze this theorem/plan FIRST; implement source-only q->all-label player win-impossibility interval constraints and a source-certificate pairing finder for either mover. No `core.next`, solved values, game-continuation search, BDD/QBF in the producer.
2. Independently exhaust 3,734/34,094 exact legal small-board q; compare each interval and pairing certificate with qualified full q value and all legal first-action WDLs. Zero false interval exclusions and verify computed pairing contains a pair in every ATTACKER original residual; verify gravity mate legality formally/generic mutation cases.
3. At canonical standard7x6 `44444` calculate the exact source pairing/WDL extinction disposition. No game value claim from a failed certificate. In particular remaining cell count 37 (odd), so pure all-cell pair response theorem cannot apply at this source; do NOT infer a DRAW/nonloss.
4. Optionally combine bounds with prior exact source two-turn threats, certified full-future weak WDL orders, full behavior equivalence and the **strict optimal-set separation rule**, then follow at most ONE future q, never another inequivalent continuation. Compare EXACT V and ALL best labels on independent small boards. Count new qualified source q vs existing 2,914/6,725, and report strict max game-semantic fanout.
5. Validate current legal `223` quantifier dependency, `111` bounded-signature/full-WDL counterexample, first-win, column release, terminal and horizontal same-height constraints. Preserve historical negative and qualified results; a new one-sided WDL bound is not an exact WDL or zero-branch complete optimal-set theorem on its own.
6. Historical 60k nodes / 300k Boolean operations / 10k supports / 15s per-source caps remain safety controls, NOT success metrics. Source proof construction operations charged separately. No authority promotion, solver implementation, or merge.

**Success boundary:** prove an additional sound **global no-win bound** operating at zero game-semantic fanout, and possibly enlarge restricted-domain exact `(V,M*)` closure; the total arbitrary-state zero-branch Connect Four algorithm is NOT thereby discovered.
