# Verified rank-33 response transition: ONE fixed P0 move resolves TWO differently shaped P1 defenses

**Date:** 2026-10-20 (Pacific). **Owner branch:** `research/semantic-quotient`. **Status:** exact guarded source sufficient P0 WIN from a real 7×6 K4 rank33 position, independently physically validated over one-step P1 branches; not a general source-from-empty WDL theorem. This is the exact restart seam following user UI-desync. Qualified IsoGraph gameplay 1.2 and solver untouched. No target-winning-line list enters any source test.

## 1. Where the previous work was on resynchronization

Live canonical GitHub HEAD before continuing was `5e10acb41dee06becf0d7af896c68555d96e240e`; both the FROZEN theorem `docs/research/2026-10-19-frozen-single-fixed-reply-two-contract-bridge-rank33.md` and its unexecuted Node source implementation `research/isograph/discovery/2026-10-19-causal-defense-ladder/standard7x6-single-fixed-response-two-guard-source.mjs` were already committed. The previous internally physically verified two-column pair-clock candidate certified six distinct archived rank35 original q and twelve rank37 original q; original published empty7×6 winning VALUE is known but source-only root WDL remains OPEN.

## 2. New source-only P0 winning theorem (not a game-tree recursion)

At an actual P1-to-move original nonterminal q, inspect ORIGINAL 69 finite four-cell lines and find P0 winning lines missing one physically empty future cell e=(c,r), not yet gravity-playable. Choose ONE P0 response COLUMN b deterministically as the latent cell with minimum vertical support distance r−h_c, then minimum c, then minimum r. No existing oracle move label or future strategic state value may be used.

For each **current** legal P1 column a, use original P1 cofactor/gravity to check whether P1 wins right now (such a branch kills this candidate). If P1 does not, P0 answers in the SAME FIXED selected column b; disallow b if physically full. Certify each resulting condition by at least one of these source-only sufficient methods:
- P0 b first-wins physically NOW;
- original `Z_{n+2}=1`: every next P1 legal move exposes an immediate original P0 four-body winning cell (and P1 cannot first-win before this reply);
- the previously independently frozen and tested **two-column latent K4 threat even-pair clock**: exactly two remaining columns A and B, one already P0 3-of-4 winning cell above the currently playable A frontier, and an EVEN remaining B capacity2m. P1 entering A first exposes P0's immediate terminal win; P1 entering B can be met by P0's gravity-legal upper mate while consuming one of m remaining pairs, so ultimately B exhausts and P1 must enter A. P1 immediate firstwins in A or B are explicitly ruled out along the uniquely defined B profile.

If ALL current literal P1 action labels pass using the SAME P0 b, then P0 has a verified exact WIN from q under actual FIRST-WIN stopping. This is a finite conjunction of current-action source guards, **not** strategic recursion, but it inspects P1 alternatives and is not a fully branch-free closed-form universal WDL solution. Source failures yield INCOMPLETE, never a false LOSS.

## 3. Concrete original 7×6 position, now certified TWO turns earlier

Take real 33-ply prefix of archived issue41 terminal-line witness #13. Literal moves one-based (original column labels):
```
444443333311555555676611124612366
```
The zero-based source word is
```
333332222200444444565500013501255
```
Original actual heights at occupied rank33 (zero-based columns):
```
[6,2,6,6,6,6,1]
```
All columns except one-based 2 and 7 are FULL. P1 to move (absolute move34). Genuine original P0 one-missing K4 target cells include column2 row5 and column2 row6 (one-based row). Column2 row5 is physically unplayable until lower support is claimed. The SOURCE selects fixed P0 b=**column2**, irrespective of P1 current choice.

| P1 first column (move34) | P0 fixed move35 | Original source continuation guarantee |
|---|---|---|
| **2** | **2** | At resulting original rank35, `Z35=1`: BOTH P1 current choices (2,7) expose an immediate P0 firstwin on P0's next move. P1-col2 after this pair has no immediate P1 own win. |
| **7** | **2** | Resulting original rank35 satisfies two-column timer: A=col2 with 3 remaining, B=col7 with 4 remaining =2 pair slots. P1 must avoid A, while P0 legally mates every P1 B move above it. After two P1 B/P0 B pairs, B fills and P1 must move A, releasing row5 for P0 firstwin on absolute move41. |

The second branch's responder word from rank35 onward is (P1 col7/P0 col7) repeated twice, then (P1 col2/P0 col2) with the final P0 winning cell at col2 row5. In the first branch, P1's next two alternatives both make P0 win immediately; the source checker recognizes this as `Z35=1` rather than incorrectly expecting the same timer in both branches.

**Crucial same-heights negative:** Swapping the first two events yields the SAME heights [6,3,6,6,6,6,2] after P1-col2/P0-col7 versus P1-col7/P0-col2. But the former permits P1 immediate ORIGINAL vertical K4 in col2 rows1–4, whereas the latter does not. Ownership order and FIRST-WIN temporal guards cannot be replaced by parity or a scalar pair resource count. Evidence `RANK33_SAME_HEIGHT_DIFFERENT_OWNERSHIP_P1_PREEMPTION_0_1.json` in the discovery folder.

## 4. Archived 27 genuine game histories and independent original physical checks

Independent checker separately rebuilt all69 original finite K4 four-direction windows as SOURCE unary winning residual predicates, reconstructed genuine physical prefixes from literal empty board, and used a distinct directionally traversed RAY firstwinner function for move-level validation. It **did not** query the original Oracle, consume strong-outcome labels inside source or evaluate future-game WDL values.

Archived histories used for post-frozen validation: 28 terminal line entries, 27 unique real 41-ply histories, 513 total P1-to-move source root positions at odd occupied ranks1..37. Source-positive original q:

| source starting odd rank | positive q among 27 real archived historical prefixes |
|---|---:|
| **33** | **1** |
| **35** | **2** |
| **37** | **8** |
| All earlier odd ranks | **0** |

11 positive (rank,original q) observations across 10 distinct archived historical games. Each positive source proof covers **ALL current legal P1 first actions with ONE predetermined P0 reply**. Independent physical-ray checker validated 1,419 one-P1-option immediate-next-P0-win cases and 23 timer-related individual physically guarded checks with zero mismatches; 52 P1 immediate wins were explicitly detected in failed/candidate cases and were not admitted as source P0-win proof branches.

Negative control: a real legal full 42-move DRAW `123456123456654321654321123456123456777777`, whose odd-rank prefix screens all returned INCOMPLETE (nineteen tests). No draw falsely reported P0 WIN.

Durable machine evidence:
`research/isograph/discovery/2026-10-19-causal-defense-ladder/STANDARD7X6_FIXED_REPLY_TWO_SOURCE_GUARD_513_ARCHIVE_PREFIXES_0_1.json`.
Node research source was already frozen and committed at `5e10acb4...`; the new independent JS checker reproduced its exact source logic, but maintained Node26 CI was NOT run; no proof-assistant independently formalized this result.

## 5. What this does and does not settle

**Settled:** There exists a real ORIGINAL standard7×6K4 source q at rank33, descended from a genuine empty-board historically strong-optimal history, for which P0 can force WIN using one fixed original P0 reply to either P1 current action, with certified nonsearch terminal and pairing-resource proof continuations. This is earlier than the older rank35 and rank39 local P0-win gates, and gives two qualitatively different defender failure modes joined by a single exact source operation. The finite B response reservoir decrement is a strict well-founded pair-clock; the source's physical K4 one-missing latent threat cannot be neutralized by any P1 entering A before P0 firstwins.

**Not settled:** This has **not proved** that P0 can force ALL original P1 strategies from EMPTY into this q or into any presently certified WIN region. Other P1 strategies may force different positions; P0's overall first-player WIN is known from external exact solver evidence, not from this source theorem. Eleven positives in a selected archive are not a census of all source-certifiable boards. An earlier rank with multiple safe P1 moves is not declared P1-winning by this failure. Moreover, the historical **28** are distinct strong-optimal first-terminal winning **line identities across different games**, not the number of moves/pair obligations. A successful source WDL theorem from EMPTY is still weaker than source derivation of maximal-delay strong-optimal selection of exactly those 28.

## 6. Next specific mathematical research step

**Do not return to generic Fourier frequency plotting.** Focus on one level higher than the rank33 joined two-guard proof: find a source-causal **obligation response-compatibility algebra** whose owner-specific original four-body K4 clauses and physical deadlines recognize a favorable class under ALL P1 adaptations, without enumerating incompatible future games. The rank33 example proves that two distinct source-certified outcome subfamilies (immediate universal threat vs exhaustion of an even vertical reservoir) may share one fixed P0 action even when same-height owner-swap is not value-preserving. Seek a canonical invariant/progress measure unifying these (e.g. response capacity deficiency or a source guard relating future event deadlines to surviving owner-specific singleton lines), then test the real rank31 and rank29 origins where the present fixed-b source fails.

**Hard requirement:** a genuine total current-q exact WDL or valid Level2 continuation must be proved from source premises, or reported as INCOMPLETE. No solver modifications, changes to qualified IsoGraph1.2 game semantics, unapproved merges, or use of solved terminal line IDs as formula inputs.
