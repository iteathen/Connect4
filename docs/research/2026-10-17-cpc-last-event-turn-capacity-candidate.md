# Source-only CPC last-event capacity: frozen candidate and falsification contract

**Date:** 2026-10-17 Pacific. **Research owner:** `research/semantic-quotient`. **Direction:** Josh Oshiro. **Status:** NEW CANDIDATE / frozen before independent game-value tests; NOT promoted IsoGraph gameplay authority. **Objective:** zero strategic branching, exact unrestricted first-win semantics; not solve-time or tree pruning.

## Origin and scope
From normalized nonterminal q=(h,R0,R1), with width W, height H, ply n=sum h, future gravity events arranged in W chains, a residual requirement G in R_p is a set of as-yet-unclaimed cells ALL of which player p must personally claim to complete one surviving original line. P0 moves on even n. No strategy or solved label is an input to this certificate.

For each source-future cell t=(c,r) (0-based row r>=h_c), the CPC **latest possible event rank**, counting the future event at t, is

```
N_q(t)=(r-h_c+1)+sum_{d!=c}(H-h_d)=(W-1)H-n+r+1.
```

No legal trace can place t later than its N_q(t)-th move counted from q, since a cell above t in its column cannot be placed before t. This is an UPPER bound, not an actual rank, a guaranteed owner, or an assumed parity reservation. Let

```
A_p(k,q)=floor(k/2)+ (k mod 2 if p==side_to_move(q) else 0)
```

be the maximum number of p-turns in the first k moves (precisely the number of p-turn slots, if k moves occur). Define

```
F_p(G,q):= [ EXISTS t IN G : |G| <= A_p(N_q(t),q) ].
I_p(G,q):= NOT F_p(G,q).
D_p(q):= FOR ALL G IN R_p, I_p(G,q).
```

For an EMPTY source family R_p=[], D_p is TRUE. For an immediate zero generator in a terminal winning q, this formula is not used: first-win terminal facts precede it. Since N_q depends monotonically on r, F is also equivalent to checking max row in G, though the all-t formulation makes the last-event proof explicit.

## Claimed sufficiency, no hidden strategic continuation

**Last-event incapacity lemma (candidate):** If I_p(G,q) then no legal, first-win-observing future play can complete G for p, regardless of the opponent. In any claimed completed G, pick its chronologically last cell t. The completed G supplies |G| distinct p placements by the time t is placed, while t is placed by move <=N_q(t) and so the p-turn count by then is <=A_p(N_q(t),q). This contradicts I. Other potential earlier terminal wins only make completing G harder. If D_p(q), p cannot win from q.

This is a strictly stronger negative condition than R_p=[], when its predicates trigger, but it is not a full strategy/value solver. It is a multi-ply source certificate: one single arithmetic scan over source generators and their row ranks, no game successor, adaptive response graph, BDD, QBF, or previously solved value table. Because the proof uses a counting upper bound, failure of F does NOT imply its converse (that p can actually complete G). The certificate is one-sided.

**First-action simultaneous bounds.** For each legal c at q, examine source cofactor by its gravity cell x=(c,h_c) without constructing a child q or exploring futures:
- mover p: remove x from each G in R_p; if empty generator results then action immediately TERMINATES with p win; otherwise assess surviving requirements at n+1 and next mover 1-p;
- opponent o: delete every G in R_o containing x; assess others at n+1;
- use the CPC deadline formula with n+1 for every remaining target. Normalize if needed, although normalization cannot affect soundness of universal incapacity.
When both post-action families are D_0 and D_1, the nonwinning action is an EXACT DRAW. When only D_0 holds, P0 cannot win (action value in {-1,0}); when only D_1 holds, P1 cannot win (action value in {0,+1}). These are unconditional correct WDL intervals; they can combine with previous source-only intervals / source full-future weak inequalities / complete-optimal-set theorem, and can be computed in parallel over ALL legal literal columns without evaluating any distinct future games.

## Important guards / limitations
- Valid normalized first-win-stopped nonterminal q only; original viable residual G is not a completed game win.
- Correct mover parity at source and after hypothetical first action; board-full/nonwinning is draw.
- The upper deadline N is optimistic: all other columns' events may be consumed before t; never interpret its parity as fixed ownership.
- Do NOT infer winner from absence of an incapacity certificate or from potential capacity. Every remaining unresolved action stays INCOMPLETE.
- Post-action scan is source algebra over all legal labels, NOT separate strategic evaluation of action continuations.
- No new proof of universal unrestricted 7x6 (V,M*) or of canonical `44444`.

## Frozen independent falsifiers, before reference observation
1. Algebraic check of N against direct column capacities for all future cells in all small-board source supports; check both current-mover parities and n->n+1 after each hypothetical legal first move.
2. Full 4x3 Connect3 and 4x4 Connect4 legal first-win-stopped physical q corpora. For any emitted D_p source or post-first-action fact, compare independently computed full WDL: **no claimed unable-to-win side may be the winner**. Draw anchors must be exact. Deduplicate by complete (h,R0,R1), preserve all legal action labels.
3. Measure NEW negative no-win certificates compared with raw R_p=[] and NEW exact DRAW first-action anchors compared with raw bilateral extinction. Compute cumulative strict one-lane full (V,M*) only if the correct existing source consumer can be rerun; never invent gain counts.
4. Mandatory `223`, `111`, `1111222234334`, move7/8 chronology and standard `44444`; specifically test whether this source-only bound changes canonical first-action intervals. Never infer a total result from a no-claim test.
5. Independently audit if the result is merely dominated by existing immediate/paired source invariants; preserve a negative marginal outcome as evidence.

**Acceptance:** mathematical soundness and maximum strategic fanout ZERO for this SOURCE lemma, independent reference agreement, accurate scope; not complete zero-branch Connect4 unless exact unrestricted (V,M*) separately certified. This is a CPC/WSL deadline/resource feasibility sublemma, NOT a claimed complete obligation fixed point.

## Post-freeze owner clarification: symbolic W/H/K, standard 7×6 first

**Added after the original candidate was frozen; the preceding derivation and historical falsifier list are preserved unedited.** The owner now requires standard `W=7,H=6,K=4` gameplay geometry for the active mathematical program and primary controls, **while retaining `W,H,K` as symbolic parameters of every applicable formula and guard** for later generalization. In particular `N_q(t)=(W-1)H-ply+r+1` remains dimension-bearing even when evaluated at W=7,H=6. `K` enters via source original winning-line incidence and residual families. No dimension-generic soundness assertion follows from tests of the standard-board case, and no small-board 4×3/4×4 performance percentage counts as progress on the standard game. Earlier small-board falsifiers are retained for provenance but are secondary, not the primary next experiment. Use legal 7×6 Connect4 prefixes from early through near-terminal ranks, and unrestricted independent 7×6 late-suffix WDL controls whenever affordable; never replace unrestricted values at `44444` with bounded claims. See `docs/research/2026-10-17-owner-standard-7x6-geometry-first-zero-branch-domain.md`.
