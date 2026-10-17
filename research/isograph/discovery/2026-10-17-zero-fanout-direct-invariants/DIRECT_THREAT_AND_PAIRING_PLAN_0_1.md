# Frozen source-only ZERO-fanout candidate: threat saturation and gravity-legal pairing

**Date:** 2026-10-17 Pacific. **Research owner:** `research/semantic-quotient`. **Live HEAD at plan freeze:** `d9f5fe7626187af98646c8e536c6a2ba04e5c1c9`.
**Status:** precise hypotheses, NOT evidence and NOT a full-game generic zero-fanout theorem.

## Strict owner objective
Find an exact source-only `Z(q)=(unrestricted WDL, ALL optimal literal moves)` with **zero game-semantic fanout**. Do not run child games, quantified strategy alternatives or hidden game-tree search in the candidate, and never count fewer remaining branches as success. Independent qualified `exact-q-core.solve` is an independent *post-derivation falsifier only*. A result that applies to a subset of positions is an exact nonbranching subdomain, NOT the requested total Connect4 zero-branch algorithm.

## Candidate A: immediate opponent threat saturation

Let mover p, opponent o=1-p, and `L(q)` the currently gravity-playable literal next cells. Set
  `T_p={c in L(q): singleton future-cell {x_c} in normalized R_p}`,
  `T_o={c in L(q): singleton {x_c} in normalized R_o}`.
All data come from the ONE source residual q, without any cofactor successor construction.

**Proposition A:** If `|T_o|>=2`, for EVERY legal mover action c,
  `Value(q after c)= winValue(p)` if c in T_p,
  `Value(q after c)= winValue(o)` otherwise.
Proof: a nonwinning mover placement can block at most ONE opponent currently immediately playable winning cell; the other remains a playable one-cell terminal win on the opponent's next action. The mover's immediate winning cells are exactly T_p and stop play first. This is a full unrestricted WDL action vector, not merely a bounded interval or one selected policy. If T_p nonempty, M* is exactly T_p; otherwise EVERY legal move loses and all tie. This must hold regardless of whether the opponent has other strategic threats. Require two DISTINCT playable columns, not duplicate residual descriptions. No game continuation is constructed.

## Candidate B: gravity-playable involution matching for P0 no-win

Source q is nonterminal and P0 to move (even rank), N remaining cells is even. Partition ALL empty source cells into fixed disjoint pairs such that after P0 takes any currently playable untouched pair element, its mate is ALWAYS gravity-playable for P1 in the same round. Two legal pair-block primitives:
  1. vertical solo column c when H-h_c is EVEN: consecutive pairs (c,h_c+2j),(c,h_c+2j+1);
  2. horizontal twin columns c,d with h_c=h_d: for every future row r>=h_c, pair (c,r),(d,r).
A partition of currently nonfull columns into such blocks is a purely STATIC source certificate. Every source P0 residual winning generator must CONTAIN both cells from at least one matching pair. Then P1's fixed mate-response strategy blocks EVERY possible remaining P0 winning line, without evaluating any alternate P0 strategic future. First-win stopping holds because P0 can never acquire both cells of a covered pair, including immediately before the paired response.

**Proposition B (exact DRAW special case):** In addition, if `R1=[]` initially (P1 has no remaining unblocked winning lines), then P1 can NEVER win under any play; the paired strategy prevents P0 winning. Therefore `V(q)=DRAW`, and **every legal first P0 move is exactly DRAW**, so the complete optimal set is all L(q). No future q or policy search in the producer. With R1 nonempty, pairing alone certifies P0 cannot force a win, but cannot determine exact WDL or the full best action set and MUST return UNKNOWN.

Use a deterministic source-only partition constructor with a documented attempt/proof count; enumeration of alternative game move histories or future strategic values is prohibited. Static pairing certificate search is allowed only as finite source constraint work, not future-game evaluation. If no valid matching is found, report INCOMPLETE and do not run conventional minimax as fallback.

## Mandatory predeclared qualification
- Exhaust all physically legal nonterminal 4x3-c3 and 4x4-c4 q states, deduplicate by exact core.key(q). Independently compare every exact action vector returned by each candidate with `core.solve` after construction; report all incorrect outcomes, ties and how many source states qualify, by mover/rank, with source proof work separately.
- Use `223` quantified-order counterexample, `111` bounded-equality/full WDL different, canonical standard7x6 `44444` (P1 to move) and start-state empty board as mandatory scope controls; don't infer a value when certificate absent.
- Explicit mutation controls: duplicate singleton threats in SAME column must NOT trigger A; an uncovered P0 winning line must invalidate B; an opponent open residual must prevent B from claiming DRAW; gravity-unsafe horizontal columns with unequal heights must not be paired; empty R0/R1 must be handled exactly.
- Inspect actual qualifying cases with more than ONE legal initial action. A one-legal-move terminal suffix alone isn't strong evidence.
- For each certified q, candidate counters must report `strategic_future_evaluations=0`, `game_tree_branching=0`, exact source certificate, V and ALL tied optimal move labels. Unqualified q returns UNKNOWN.
- Strict historical per-compile budgets (60k nodes, 300k nontrivial Boolean operations, 10k supports, 15s) remain experiment safety envelopes but are not mathematical success gates. No authority promotion or merge.

**Success boundary:** A correctly proved exact *restricted-domain* nonbranching Z is meaningful mathematics, but does NOT prove existence of a total nonbranching optimal-action algorithm for arbitrary Connect4. Any stronger claim requires extending the structural invariant, not hiding a minimax recursion in the implementation.
