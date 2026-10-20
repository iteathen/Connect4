# Owner correction: EXISTING qualified exact7x6 Oracle is primary for empty-root perfect-play measurements

**Date:** 2026-10-19. **Owner instruction:** “Can we use our existing Oracle instead?” **Decision: YES.** Scope stays original standard W7,H6,K4; both players' moves must be proven optimal beginning at the literal empty board, stopping on the first original win/draw. Research branch: `research/semantic-quotient`. Existing IsoGraph1.2/gameplay/production source unchanged.

## 1. What is already in this repository

`components/oracle/exact7x6.mjs` is a distinct 7×6 exact strong-score oracle, validated against **128 externally sourced Pascal Pons parent-position numeric checkpoints** and separately **30 opening-position spot checks**, accepted in `docs/specs/C4-0005-solved-strength-oracle-v1.md`. The following public class interface is CURRENTLY available:

- `new ExactConnect4Oracle()` creates own transposition cache `oracle.table`, own `oracle.nodes` counter; `reset()` wipes both.
- `oracle.solveSequence(sequence)` returns exact strong score for the current side after a nonterminal original one-based column move word.
- `oracle.analyzeSequence(sequence)` returns all seven per-action exact strong scores, `-1000` sentinel for illegal columns, and determines best actions by maximum score.
- Both methods retain reusable original oracle transposition bounds in the same instance's `Map`. Reuse ONE instance across all root-class solves and all later legal history queries; **do not call `reset()` between moves** unless performing independent cold-root test.

This Oracle ALREADY was used in prior `independent-true7x6-EMPTYROOT-exact-oracle-perfect-play-campaign.mjs`. The previous blocker was **COMPUTATION COST** of the very early ORIGINAL empty root, not missing functionality or insufficient score semantics. Hard-cap experiments `analyzeSequence('')` were interrupted at 200,001 and 4,000,001 expanded nodes before full vector; they are **INCOMPLETE, NOT proof of wrong scoring or an unsolvable problem**.

## 2. Exact opening reflection reduces seven costly original child solves to four

At the physically empty original board `q0`, the qualified left-right gravity-preserving reflection `Jx(c,r)=(6−c,r)` gives equal game-theoretic exact strong scores for reflected first actions:

\[
s(q_0,1)=s(q_0,7),\quad
s(q_0,2)=s(q_0,6),\quad
s(q_0,3)=s(q_0,5).
\]

No action class is merged for strategic convenience; this is an exact original-game reflection isomorphism already known and qualified. The entire seven-score empty-root vector can be computed by ONE reused Oracle instance with FOUR strong child solves:

\[
v_j = - \operatorname{Oracle.solveSequence}(\text{one-based literal }j),
\quad j=1,2,3,4,
\]
then
\[
\operatorname{scores}=[v_1,v_2,v_3,v_4,v_3,v_2,v_1].
\]

The minus sign accounts for exact negamax change of side after the opening move, **not** a new structural WDL shortcut. The first move cannot already make four on an empty 7×6 board. This reduces the number of root child strong-value evaluations from seven to four, but it does NOT guarantee any child solve is cheap. **Do not claim exact optimal root moves or complete root-to-terminal perfect histories until ALL four numbers have actually been returned.**

Source qualification before campaign: on an actual already checkpoint-qualified late original q `2252576253462244111563365343671351441`, the current Oracle produced move scores `[-1000,-1000,-1000,-1000,-1000,-1,-2]`; on its exactly reflected legal q `6636312635426644777325523545217537447`, it returned `[-2,-1,-1000,-1000,-1000,-1000,-1000]`, exactly reflected as required. The same JavaScript Oracle instance retained TT entries and finished the check quickly. This is a REFLECTION/INTERFACE sanity check, NOT an empty-root game-score measurement.

## 3. Actual owner-mandated test generation

1. Begin with exact empty original board, no imported solved position or unverified opening sequence.
2. Obtain the **complete exact root vector** using the existing Oracle and four reflection representatives, with persistent within-run transposition cache; checkpoint each exact *completed* child score. An aborted child score must never be recorded as complete. Later optionally use published opening book only if performance is prohibitive, with separately recorded provenance.
3. At every next original nonterminal position on the selected path, use `oracle.analyzeSequence(currentHistory)`; choose only the exact max strong-score set. Use independently implemented true 69 original winning-line K4 detection to validate legal gravity, alternating P0/P1 and first-win stop.
4. Vary among equal exact max-score actions using deterministic tie-seeds **from the empty board** only. Store per-ply score vector, chosen action, terminal and original 69-line identity/owner-wave structures. Across histories measure the UNION of firstwinning K4 line IDs as distinct from single-board U=69−double-dead.
5. If runtime/memory caps are exhausted before a complete root score vector, record `INCOMPLETE` and preserve partial child classes as isolated qualified results. **Do not switch to a random/preselected solved midgame** or present the previous 158-parent/30-tail conditional data as root-perfect.

## 4. Source/validation separation

The independent Oracle is **allowed as an external-to-research game-theoretic teacher** for perfect-play labeling, even though it performs negamax internally. It is NOT the hoped-for source *non-search* exact WDL formula; no claim is made that querying the Oracle discovers the intended algebraic solution. The structural investigation remains focused on unfolded-fourway-junction P0/P1 wave functions and exact signed cancellations, not presuming defensive obligations.

### Supersedes prior incorrect priority

`docs/research/2026-10-19-EXTERNAL-SOLVED-DATA-FIRST-EMPTYROOT-PERFECT-PLAY-RESEARCH.md` showed viable official Pascal Pons opening books and Böck full original WDL BDD. They remain **optional accelerators or independent cross-checks**, not REQUIRED primary data and not the default next step. Do not waste additional work downloading 33 MB or 47 GB before attempting the qualified existing Oracle with a sensible runtime/memory budget and proven root reflection.

**Current qualification:** exact internal Oracle implementation and known calibrated strong-score contract CONFIRMED; precise empty-root seven move-score vector still **INCOMPLETE** due prior bounded cold root work; no new root-perfect game history or strategic surviving-line count asserted by this note.
