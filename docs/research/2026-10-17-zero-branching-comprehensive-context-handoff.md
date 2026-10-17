# Comprehensive zero-strategic-branching Connect4 research handoff — October 17, 2026

**Owner direction:** Josh Oshiro. **Canonical durable research owner:** `iteathen/Connect4`, branch `research/semantic-quotient`.  
**Status:** CONTEXT/SYNTHESIS AND PROVENANCE NAVIGATION, NOT a new game-theory semantic authority or a claim the total Connect Four problem is solved.  
**Latest independent candidate checkpoint:** `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/CO_RELEASE_ONE_LANE_FULL_REFERENCE_RESULTS_0_1.json` (source control committed and subsequently run successfully on both complete small-board q corpora).  
**Current-state routers:** `STATUS.md` and `next_step.yaml`. Re-fetch live branch HEAD when resuming; do not rely on a fixed commit from this document.

## 1. Non-negotiable objective: ZERO strategic branching

The owner insists on eliminating **BRANCHING ITSELF**, not reducing branches, branching factor, number of recursive evaluations, time-to-solve, BDD size or number of value queries. At no point may a candidate evaluate TWO inequivalent strategic continuations separately, whether sequentially, in parallel, hidden in a BDD/QBF/CNF, memoized, or disguised inside an enumerated action/strategy-proof graph. Source-local algebra, scanning all current literal action labels and finite residual win generators, algebraic proof cases and STATIC source matching certificates are permitted if they do not create separately evaluated strategic future games. Report STATIC certificate-witness alternative enumeration transparently as source algebraic work; do not pretend it is zero computation.

The output must be `(V(q), M*(q))`: exact unrestricted ordinary P0-relative WIN/DRAW/LOSS (−1/0/+1) and the COMPLETE set of legal equally optimal literal columns, maximizing V when P0 moves, minimizing V when P1 moves. A proven value-equivalent set can be one logical output; to follow one representative future state for all labels requires the STRONGER full-future game behavioral isomorphism or bisimulation. Weak value inequality cannot certify a tie or justify continuation equivalence.

Permitted semantic evaluation fanout is ONE, not two. If two or more inequivalent strategic futures need separate values, the candidate must return **INCOMPLETE** rather than perform any disguised search/minimax fallback. The old recursive exact residual-q solver is a complete, branching independent reference, NOT the desired algorithm.

The total arbitrary-legal-7×6 zero-branch solver is NOT DISCOVERED. This remains the dominant unsolved question despite substantial restricted-domain progress.

Formal owner override: `docs/research/2026-10-17-zero-strategic-branching-objective.md`. The older October 16 branch-elimination objectives and any claims about `root branch elimination` mean PARTIAL PRUNING only and must not supersede the override.

## 2. Repo authority, research topology and guard discipline

Before any new mathematics, read the global `iteathen/.github/AGENTS.md` and repository `AGENT_LOCAL.md` and `research/AGENTS.md`. One canonical research owner branch: `research/semantic-quotient`; do not create a new solver branch or merge. Research commits and factual proof/evidence on that branch; solver implementations remain separate. Crash-safe small checkpoints: never leave more than one meaningful result unsaved, freeze experiment before work, preserve negative evidence. On UI desync, recover LIVE GitHub HEAD and newer work FIRST.

Current qualified game-theory/logic authority root is `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md` plus `CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_2.json`, its native successor candidate and claim-coverage files. Earlier authority 1.1 and legacy CPC/WSL/NDC specifications are historical/candidate evidence, not a second authority. New research does not automatically promote a new IsoGraph revision. If claims are new and nontrivial, route them with honest `guarded_exact`/candidate/evidence status, never silently rewrite promoted authority.

Read `docs/specs/C4-0006-control-parity-and-winspace-v1.md` (Candidate), `C4-0007-nested-dependency-closure-v1.md` (Candidate), and owner-authored `docs/research/2026-09-09-owner-searchless-connect4-findings.md` plus `2026-09-09-universal-strategic-algebra.md`, `2026-09-09-nested-strategic-dependency-closure.md`, `2026-09-09-searchless-solver-hypothesis.md`. GSP-003 and GSP-004 are the gameplay strategy routes but do not independently promote logic.

## 3. Foundational exact source residual algebra and unavoidable guards

Canonical source is `q=(h,R0,R1)`: current column heights h, minimal antichains R_p of all still feasible original winning-line requirements for each player, over the future available gravity-cell universe. Current mover by parity of `sum_c h_c`, with player P0 maximizing and P1 minimizing P0-relative WDL.

For a legal action at next gravity cell `x=(c,h_c)` by mover p:
- Owner `R_p` contracts x from each residual generator and inclusion-normalizes (only if the cell was present).
- Opponent `R_(1-p)` deletes every original residual requirement CONTAINING x (a blocker), then inclusion-normalizes.
- An EMPTY REQUIREMENT GENERATOR is an immediate owner first win, and play TERMINATES. A full-board nonwinning move gives DRAW. Neither side's winner can be decided from future potential after another player already won.
- A missing entire residual family `R_p=[]` NEVER regains future winning possibilities under subsequent owner contraction/opponent blocker deletion.
- Same normalized q/support denotes same future legal game semantics under qualified identity. Exact recursive `exact-q-core.mjs` under `research/isograph/discovery/2026-10-16-algorithmic-core/` is the validation reference.
- Same-h/support P0-favorable residual-upset inclusion certifies full future weak WDL order, under correct first-win/terminal guard and owner/opponent cofactor isotonicity. Do NOT apply pointwise inclusion across differing support unless a proven legal future transporter is supplied.

CPC rank/event reservation is deeper than raw row parity:
`N(t)=(r-h_c+1)+sum_{d!=c}(H-h_d)=(W-1)H-ply+r+1`.
A change in event reservoir preserves relevant control only with the correct even parity AND response-resource/event-order/timing guards. Read `2026-09-14-cpc-control-potential-unification.md`, `2026-09-14-support-graded-middle-duality.md`, `2026-09-14-response-capacity-hall-closure.md`, `2026-09-14-guarded-affine-clause-closure-kernel.md`; do not transplant advisory parity into an unrestricted winning certificate.

## 4. Original historical move-seven/move-eight structural transition is ALREADY solved in its scoped sense

Canonical legal history `44444` means FIVE absolute moves all in one-based center column 4. P1 is next on absolute move SIX. Height vector is `[0,0,0,5,0,0,0]`, 37 future empty cells, qualified normalized source requirement generator counts R0=48, R1=42. Absolute move7 is P0's next turn; absolute move8 is P1's. This matters because recent experiments name `k8/k9` EIGHT/NINE *ADDITIONAL* moves after `44444`, NOT absolute game move8/9.

The historical column-completion rank/mover transition and bounded turn8 defensive action masks were proved and physically checked, including 324 scoped histories; see `docs/research/2026-10-16-column-completion-through-full-game.md` and `MOVE7_MOVE8_COLUMN_CLOSURE_RESULTS_0_1/0_2.json`. Do NOT revisit a solved local transition unless the new theorem specifically depends on it. This DOES NOT prove full unrestricted 7x6 WDL or all optimal moves after `44444`.

At `44444`, genuine full-future board horizontal reflection yields only FOUR action equivalence classes `{1,7},{2,6},{3,5},{4}`. Four classes remaining is STILL branching for the owner's actual objective; no overall WDL is inferred.

## 5. Historical structural deductions and why they are insufficient

Important earlier corpus: `docs/research/2026-10-16-connect4-algorithmic-core-formula.md`, `2026-10-16-constructive-algorithmic-core-completeness.md`, `2026-10-16-equivalence-first-wdl-quotient.md`, `2026-10-16-response-cover-next-quantifier-law.md`, `2026-10-16-branch-elimination-primary-objective.md`, `2026-10-16-bilateral-treewidth-and-galois-response-closures.md`, `2026-10-16-action-robd-output-cone-functional-quotient.md`. The ordinary exact recursive q core is complete but branches.

- One-layer guarded source response relation for P1 b and P0 a, `K_a={b:P(b,a)}`; transposed `S_b={a:P(b,a)}`. Inclusion-MINIMAL distinct S_b are the hardest UNIVERSAL obligation antichain. Preserves BOTH `∀b∃a P(b,a)` and `∃a∀b P(b,a)` for that ONE bounded predicate. Do NOT COMMUTE the two scopes. Exhausted all 65,536 4×4 Boolean matrices × 16 legal reply masks (1,048,576 cases), 0 wrong. Full legal P1 q state censuses: 2,208 sources 4×3, 67,992 sources 4×4, bounded obligation count reductions 54.47% / 52.94% overall, 39.60% / 20.77% in successful universal-proof subset. These are NOT full-WDL equivalence or absence of branching.
- Crucial adversarial FULL-game separation: legal 4×3 Connect3 `111` P1 replies columns 2 and 3 have equal short-horizon successful P0 response signature 0x0 BUT their unrestricted P0 WDLs are +1 versus 0. 220 such differing-full-value/equal-bounded-signature pairs on full 4x3 P1 census. On 4×4 legal `1111222234334`, P1 replies 3 and 4 equal bounded signature zero but full P0 WDL −1 vs 0; 22,380 such equal-bounded-signature/different full WDL pairs over full P1 corpus. These refute one-layer quotient lifting.
- Genuine full-future source structural simulations: two-ply P1 b/P0 c vs P1 c/P0 b conditioned `q` diamond, ending SAME support but ownership differs; finite P0/P1 upset inclusion certifies weak FULL future WDL or equal entire residual behavior WITHOUT downstream future evaluation. Exhaustive distinct q-and-column pairs: 4x3 1,522 eligible / 72 equal / 352 weak orders; 4x4 39,798 eligible / 2,372 equal / 9,380 weak orders. Zero false full WDL references. At `44444`, all 21 distinct-column diamonds incomparable under this source order.
- Fixed full future column transporter across DIFFERENT literal supports: height-preserving column permutation π with mapped P0 upset included and reverse P1 upset included certifies exact weak unrestricted WDL, and reciprocal inclusions under SAME π certify all-future PROGRAM ISOMORPHISM with all future action label transport. Genuine NON-geometric future equivalences appeared after original blockers remove geometry constraints. Full distinct P1 q corpora: 86 / 2,280 nonreflection full program isomorphisms and 320 / 3,760 one-way orders (4x3/4x4), zero false. Source `1111222` on 4x4: P1 actions 3 and 4 full-future isomorphic under [1,2,4,3] one-based (NOT global horizontal reflection).
- Fixed-transporter generalized to BOTH P0/P1 movers: full q controls 75 / 2,411 P0 turn future-isomorphism pairs and 86 / 2,280 P1 turn pairs (4x3/4x4), with 399 / 13,276 independently checked mapped future action values. `EITHER_MOVER_FUTURE_EQUIVALENCE_PHYSICAL_RESULTS_0_1.json`.
- Directed P1 action weak WDL order graph: SCCs are scalar value-equal; source components are enough for MIN. Correctly omitted 370 of 4,872 and 5,554 of 50,034 independent P1 scalar root WDL proof requests in full distinct small-board q corpora (7.6% / 11.1%). This is PARTIAL branch reduction, not the zero-branch algorithm; weak ordering can hide ties.
- Fully inert future columns (no future cell in ANY R0/R1) may dynamically pool neutral tempo tokens even across different column-capacity multisets; exact full-future bisimulation. Full 4x4 small q corpus yielded 94 extra scalar requests omitted beyond fixed transport, zero false action ties, but a consumer only reduced actual q successor transitions about 0.44% while added source work. This is source supporting structure and NOT the owner's objective or a speed research target.

### QBF/BDD negative and supportive carrier evidence

Full-depth guarded alternating action-QBF can be **represented exactly** from original source q without enumerating successor q objects, but uncomputed quantified choices still hide strategic alternatives. For canonical `44444` full k37 action-QBF CNF had about 12,436 variables, 36,976 clauses, 111 action decision bits, and a proven bilateral trunk-aligned upper width 232; no quantified winner decided by merely building CNF. Reduced ordered BDD output cone shares identical Boolean future cofactors, and live-GC/source deterministic gate ancestor reductions helped actual bounded threshold calculation: k8 all seven action bounds remain [-1,+1]; k9 lower false all seven but upper incomplete; prior source-owner reflected BDD reaches k11 bounded and remains UNKNOWN. Static order, GC, expanded support classes and alternate QBF factorization are NOT true zero branching. No hidden policy/strategy enumerations. Do not prioritize more of this for the user's immediate requested breakthrough.

## 6. The directly relevant 2026-10-17 restricted ZERO-FANOUT program

Overriding research contract `docs/research/2026-10-17-zero-strategic-branching-objective.md`. Full mathematical derivation through previous stage `docs/research/2026-10-17-direct-one-lane-zero-strategic-fanout-closure.md`. Current executable files under `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/`.

A **SOURCE-ONLY exact-action evaluator** that does NOT even construct a child q:
1. If mover has a currently gravity-playable OWN singleton residual winning target, that action wins immediately, regardless of opponent threats.
2. If nonwinning mover action leaves a currently gravity-playable OPPONENT singleton next-turn win, that action's exact full outcome is loss for mover.
3. If mover after taking source cell x has at least TWO DISTINCT still playable owner singleton threats (original owner residual `{y}` or `{x,y}`) and opponent cannot win immediately, mover can force a win on next turn: opponent one move cannot block both.
4. If both residual winning families become impossible after source blocker action, guaranteed DRAW.
5. If both entire source families already empty, all moves draw.
6. If one legal column remains, rank/row owner parity determines exact outcome by the earliest residual completion without walking the forced future.
7. If defender responds second and a gravity-safe full matching covers every attacking residual generator with a complete pair, opponent can prevent attacker win forever. If the defender itself also has no winning family, exact DRAW. No first-win terminal guards dropped.

These rules can give exact per-action unrestricted WDL values for ALL legal columns **simultaneously**, without evaluating any strategic future.

**Single-lane closure:** If source rules leave exactly ONE unknown first action, recurse into its ONE q successor. If >1 unknown first actions are all source-certified full-future program equivalent via one behavioral class (mirror, nongeometric fixed-column program isomorphism, inert neutral-token bisimulation), recurse into one representative and transport its WDL to all labels. If two or more inequivalent unresolved classes remain, return INCOMPLETE; NEVER branch to evaluate them separately. A source full-future weak value order gives bounds `lo_b≥lo_a`, `hi_a≤hi_b` when V(a)≤V(b), which are propagated on the finite WDL lattice {−1,0,+1}. At most one mover-favorable globally source-certified order-extremal class may be recursively valued, and after that the algorithm stops if any other exact best-move membership remains ambiguous.

**Critical last output refinement:** the owner wants exact ROOT WDL and EVERY optimal legal move, not exact numeric WDL of every inferior action. After certified root WDL V is known from root WDL intervals, for P0 MAX, c is guaranteed optimal iff `lo_c=V`, guaranteed inferior iff `hi_c<V`; P1 MIN, c optimal iff `hi_c=V`, inferior iff `lo_c>V`. If every label is classified optimal or strictly inferior, return (V, ALL best labels) even when numeric WDL of inferior actions remains a wider interval. This is an exact nonbranching mathematical theorem. Generic four-action controls: all 4,096 possible directed weak-order graphs, 540,672 source-compatible action-value anchor subsets, 1,081,344 mover-specific complete best-set checks, 435,728 exact certificates (20,352 with still-open inferior numeric WDL), ZERO false optimal memberships.

**Historically QUALIFIED full small-board exact q stages**, cumulative source states certifying exact WDL and ALL optimal labels with MAX true semantic future fanout ONE:
| Stage | 4x3 Connect3 / 3,734 | 4x4 Connect4 / 34,094 |
|---|---:|---:|
| Basic direct source singletons/parity/pair/draw | 925 | 1,202 |
| Two-turn source frontier | 2,019 | 2,866 |
| One unresolved q lane | 2,881 | 5,978 |
| One full-future-equivalent unknown move class | 2,908 | 6,521 |
| Source full-future WDL order lattice | 2,910 | 6,581 |
| Strict optimal set separation without inferior numeric WDL | 2,914 | 6,725 |
| Original equal-height/vertical gravity paired defense | 2,928 | 7,338 |
| NEW staggered-height co-release pairing | **2,928** | **7,618** |

These are independent *exact q positions* not the raw physical board state counts, and NOT a success percentage for standard 7x6. The original full first-win-stopped physical-state corpora had 4,631 4x3 and 134,289 4x4 legal nonterminal physical states, collapsing by exact q identity to 3,734 / 34,094. Reference WDL was computed by the qualified ordinary branching solver **after** candidate structural decisions, not used as an input.

## 7. Latest completed co-release result — high priority to reload after UI desync

Old safe pairing only allowed vertical consecutive same-column cells or same ABSOLUTE-row twin columns of equal current height. New co-release rule permits two columns with different SOURCE heights, pairing cells at the same RELATIVE future placement ordinal j. If pair j−1 is complete, both pair-j cells become playable simultaneously even though their original row numbers differ. Static two-column block: contiguous cross-column prefix `t≥1` with the same parity as both remaining column capacities, followed by even-sized vertical tails, all disjoint. Single columns require even capacity and vertical consecutive pairs. Every source attacker residual winning generator must CONTAIN some complete matched pair.

Attacker moving first can never own both cells of a covered pair under the defender's fixed mate response, which is always gravity legal. Thus full-future attacker cannot win. The first-win terminal and turn guards matter: this is generally a ONE-SIDED WDL bound, not an arbitrary exact draw. Post-first-action: original mover c may have a defensive paired response strategy against the next player, proving that c CANNOT LOSE. If original mover source R_p is extinct too, c is exact DRAW.

The exact source proof `co-release-pair-block-proof.mjs` and `co-release-after-first-move-nonloss-bounds.mjs`, `co-release-global-no-win-bound.mjs`, combined one-lane consumer `co-release-defensive-one-lane-optimal-set.mjs`, and independent game reference `co-release-defensive-one-lane-physical-control.mjs` are committed on the research owner branch.

**Generic release timing:** `co-release-pair-independent-release-control.mjs` covered 43 small abstract column-height profiles, 418 two-cell source target masks and generated 134 static pair certificates; an independent validator enumerated 2,185 attacker move orders, checked 2,051 defender immediately playable mates, ZERO failure. A deliberately invalid mismatched relative ordinal cross-pair was rejected. Validator-only game-order exploration is explicitly allowed to falsify the nonbranching SOURCE proof; it never feeds producer values.

**Reference small-board results:** full independent q WDL comparison of all 3,734 4x3 states and all 34,094 4x4 states PASS. New full-future source attack pair certificates 78/4,496 vs older 53/2,445, with care that some count differences are vacuous R_attacker empty cases. Post-first-action pair defense certificates 148/13,662 vs older 128/8,784; **20 / 4,878** additional structural pairing witnesses. Zero false first-action WDL bounds. Finally the separately committed AND DIRECTLY RUN `co-release-defensive-one-lane-physical-control.mjs` verified cumulative **2,928 / 3,734** and **7,618 / 34,094** exact unrestricted WDL + complete optimal move sets, ZERO false root outcomes, false ties or first-action bounds, MAX game-semantic fanout ONE. Over preceding same-row/vertical paired defense, 0 extra exact 4x3 sources and **280 extra exact 4x4 sources**.

Durable machine checkpoint: `CO_RELEASE_ONE_LANE_FULL_REFERENCE_RESULTS_0_1.json` and formal provenance `CO_RELEASE_PAIR_BLOCK_RESULTS_0_1.json`. The control was committed at `88374e719d75e8da7e39d395adca3d1d5dd4e352`; after a UI desync it was independently run from exact GitHub source, both corpora PASS, and results checkpointed. Source producer is JavaScript in isolated V8 evaluation; do not claim full maintained Node26/CI or external formal-proof-assistant qualification without such separate tests.

**STANDARD 7×6 `44444`: STILL NOT SOLVED.** It has 7 legal P1 move6 actions, 37 remaining future cells, 36 after an initial P1 move; even the improved co-release block family finds NO full-future opponent pairing certificate for ANY initial action, every first-action source WDL interval remains [-1,+1]. Current candidate returns INCOMPLETE; unrestricted value and ALL optimal moves UNKNOWN. No failure-to-prove theorem about all possible static pairings or all nonbranching algorithms follows.

## 8. Most urgent next mathematical problem

The remaining unresolved states contain TWO OR MORE *inequivalent* strategic action classes whose exact value/optimal membership cannot be settled by source two-turn first-win rules, current future program equivalence, pairing, or WDL inequality-bound propagation. To solve the owner's actual problem, we need an exact **LONG-RANGE** rank-independent source-structural WIN/LOSS/DRAW and ALL optimal-label invariant that closes these simultaneously WITHOUT evaluating any distinct strategic futures.

Possible precise mathematical program (candidates, NOT established results):
- Unify CPC event/control parity and gravity release-rank timing with residual winning-hyperedge threat deadlines. Respect `N(t)` event reservoir, opponent counter-win deadlines and response capacity.
- Derive a source-level Hall/flow/resource feasibility criterion for an adaptive defender covering multiple correlated winning requirements, with shared blockers and forced events; do not turn the Hall graph into a hidden game-tree/strategy enumeration. Existing `2026-09-14-response-capacity-hall-closure.md`, `2026-09-13-temporal-response-capacity-calculus.md`, `2026-09-13-event-dependency-cone-product-calculus.md`, `2026-09-09-nested-strategic-dependency-closure.md`, `2026-09-14-guarded-affine-clause-closure-kernel.md` are first-principles starting points.
- Investigate an exact owner-relative structural fixed point or direct certificate normal form over **ONE q descriptor** yielding `(V,M*)`, rather than enumerating a set of successor game values. If any candidate only shrinks several alternatives to two, mark INCOMPLETE, not success.
- Preserve known negative legal `223` (∀reply ∃answer does NOT commute to ∃oneAnswer ∀reply), `111`, `1111222234334` bounded-equal/full-WDL-unequal, canonical `44444` UNKNOWN and historical absolute move7/8 transition.
- Candidate theorem must be written/frozen BEFORE reading independent solved labels or running tests; verify exact WDL, complete best/tied labels and certified maximum strategic fanout ONE. A stand-alone local theorem may enlarge the restricted domain but cannot be misrepresented as the general 7×6 zero-branch solution.

Next work should be **mathematical synthesis**, not another CPU optimization, BDD/QBF depth, memory handling, generic minimax or minor co-release enumeration tuning. Do not assume these candidate connections are true without proofs.

## 9. Crash-proof continuation and primary reading order

1. Fetch live `research/semantic-quotient` HEAD and recent commits; inspect `AGENT_LOCAL.md`, `research/AGENTS.md`, global instructions; read qualified IsoGraph1.2 + manifest/claim coverage and current STATUS/next_step. Check for concurrent work that supersedes this checkpoint.
2. **Thoroughly load** the main research corpus, with emphasis on owner zero-branch objective, all October 17 full-future and nonbranching proofs/negative results, older October 16 exact q, turn7/8, bounded action-QBF negative alternative, and September CPC/WSL/NDC/response-capacity foundations. Do not rely on this handoff alone; it is a navigation synthesis. Use maximum useful working context, but preserve some token budget to reason, run a bounded experiment and checkpoint.
3. Re-run the latest committed independent `co-release-defensive-one-lane-physical-control.mjs` if necessary; do not turn the user's request to continue MATHEMATICS into repetitive confirmation runs when the source is unchanged.
4. Select a NEW candidate source-level long-range obligation/value closure, contrast several mathematical alternatives, and identify precise positive and negative premises with all first-win/turn/legal/response guards. Freeze plan and clear falsifiers in canonical research before coding/testing.
5. Derive proof algebra and a source-only producer that does not separately evaluate inequivalent future games. Use the qualified full q/physical solver for independent POST-derivation falsification only. Preserve raw discrepancies and all negative results.
6. Commit changes and evidence after every meaningful research stage; keep work batches short enough to tolerate ~10-minute UI desync (historical user preference ~8-minute checkpoints). Update STATUS.md/next_step.yaml and GSP-003/004 when the accepted scope of a claim or next step changes.
7. Report EXACT new mathematics, q scope, (V,M*) correctness, full tie set, zero-fanout trace, canonical 44444 disposition, and verified pushed commit. Do not declare a new total algorithm without proof.

**Epistemic ledger at handoff:** source q/transition exact; global 7×6 WIN/DRAW/LOSS still UNKNOWN under current research; 7×6 optimal move set UNKNOWN; paired defensive source bound exact under guard; 4×3/4×4 reference tests PASS; latest restricted one-lane `2,928 / 7,618` exact-source q cases; arbitrary-position zero branching OPEN. No game-theory authority promotion; no branch merge.
