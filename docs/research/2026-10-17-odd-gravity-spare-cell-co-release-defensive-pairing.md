# Odd-capacity source defensive pairing with ONE unmatched, immediately playable isolated cell

> **Critical qualification / supersession (2026-10-17):** The original broad one-pending-pair claim below is **FALSE when the underlying co-release match has cross prefixes longer than ONE pair**. A real 7×6 illegal mate counterexample is preserved at [odd-spare-gravity-cross-prefix-rejection-and-safe-restriction.md](2026-10-17-odd-spare-gravity-cross-prefix-rejection-and-safe-restriction.md). The tested, valid candidate restricts EVERY cross-column block to prefix length at most ONE, with only vertical paired tails. The unrestricted theorem below is retained for historical provenance, NOT as a valid statement. See verified independent standard7x6 control evidence `STANDARD7X6_ODD_SINGLE_SPARE_SAFE_GRAVITY_PAIR_NO_FORCED_WIN_RESULTS_0_1.json`.

**Date 2026-10-17 Pacific. Owner continuing zero-strategic-branching Level2 research, original standard W=7,H=6,K=4.** Source-only structural theorem candidate frozen BEFORE independent real7×6 and abstract gravity-poset falsifiers. Preserve W,H,K in proof for later generalization. Qualified IsoGraph 1.2 gameplay unchanged. A source result proves the current mover **cannot FORCE win**, not draw, root WDL, or a best action by itself.

## Main mathematical obstacle

Earlier source full-cell co-release defender pairing required **EVEN** remaining board capacity T. But original actual 7×6 source q=44444 has n=5 stones, T=37 ODD, last center column capacity one. In odd T, current p has one more turn than o, so pairing all cells is impossible. The missing turn can be represented by **one unmatched source cell U**, not by inventing a pass.

## Proposed exact odd-gravity source theorem

Let q=(h,R0,R1) genuine first-win-stopped and current mover p=n mod2 with T=WH−n=2m+1 ODD, o=1-p. Choose a column u such that **H−h_u=1**, so the remaining cell U=(u,h_u) is currently playable and is its column's last possible cell. Remove U from the future-cell support, leaving exactly 2m cells in remaining columns, all with original gravity release chains.

Find a co-release-safe PERFECT pairing of those 2m future cells with these requirements:

1. Every original surviving p winning residual requirement G∈R_p contains BOTH members of some one pair P_G from this matching, and U is never inside any matched pair.
2. Pair components have **acyclic release precedence**: within vertical pairs or equal-relative-ordinal cross-column prefix blocks, an untouched pair with every lower predecessor pair completed has at least one currently gravity-playable cell; when p first plays a cell of an untouched pair, the mate is immediately playable for o. This is the existing source block normal form of `co-release-pair-block-proof.mjs` restricted to columns other than u, and it must not be assumed for arbitrary pairs.
3. Source U belongs to a *single-cell capacity-one column*, so it does not obstruct access to any other pair. Full original p requirements may contain U: the coverage condition still requires a complete matched pair elsewhere in each p winning requirement.

**One-defender-move-per-attacker-turn policy with one pending pair:**

Maintain (a) all completed matched pairs contain at least one o stone, (b) at most ONE pending pair whose first member is o-owned while its mate is still empty, and (c) all remaining matched pairs untouched. Initially no pending pair.

- If p touches an untouched matched pair, o immediately takes its other member by the certified gravity release guard, completing it. Keep any prior pending pair unchanged.
- If p plays U or the as-yet-unplayed mate of the ONE pending pair, o **preemptively takes one currently playable cell of an untouched matched pair**, creating the next pending pair. (If p played the old pending mate, that previous pair is now completed.) The static release DAG guarantees such an untouched playable pair exists at each nonterminal o response: before U is played there cannot be a pending pair; once U is played any pending mate is the only unmatched future event, and after it is taken the remaining uncompleted pairs are all untouched. An original pair with all predecessors completed has a playable source cell. If no untouched pair remains, p's current move must have been the FINAL full-board move and no o response is owed.
- Both branches preserve the invariant and consume one p and one o physical placement. With 2m+1 initial cells, o responds exactly m times unless a FIRST win terminates earlier, and p may play the last leftover cell U or pending mate; its move cannot complete any originally paired p winning requirement.

**THEOREM — opponent can force p NOT TO WIN.** Against EVERY p strategy, the above one-pending-pair uniform gravity-safe o response policy ensures o owns at least one cell from every matched pair that p could ever complete; therefore p can never own both members of any pair covered by every original p winning requirement, and cannot FIRST win. This implies current p cannot FORCE victory. It does NOT prove o wins: game may draw, and the opponent may choose to lose by refusing the policy.

## More exact release-DAG justification

The source pair-block constructor partitions column chains into disjoint blocks:
- single-column even tails of consecutive vertical pairs, partially ordered bottom-to-top;
- two-column prefix chains of synchronous equal RELATIVE ordinal cross-column pairs, optionally followed by even vertical tails in the two separate columns.

Each component block's pair precedence is an acyclic **forest** (one prefix chain followed by zero, one or two vertical-tail chains). Fully completed predecessor pairs make its minimal untouched pair have a currently playable cell, and first touch by p releases its mate immediately. The exceptional U has an independent one-cell-only column and no predecessor/successor interdependence with matched components.

Before U is touched the policy never creates a pending pair. After U is touched exactly one pending pair can exist, and when its mate is played by p that pair becomes complete before choosing a new virgin pair. Therefore at every o forced preemptive turn, the set of all unfinished pairs has NO previously pending pair; choosing a minimal untouched pair is gravity legal. This is a direct **one-token slack invariant**, not an enumerated tree of conditional opponent strategies.

## Specialization and target

For original canonical history `44444` (P1 to move at n=5, center col4 has height5, one empty TOP U; all six other columns have 6 future cells), the source should temporarily mark U absent **ONLY inside the pairing witness search** and seek a full 36-cell co-release-safe pair matching outside the center such that every original P1 residual winning requirement contains a complete paired obstruction. If it succeeds, P0 has a nonsearch proof that P1 cannot force win from the canonical q; if it fails, report INCOMPLETE and DO NOT infer P1 can win.

The odd spare theorem also works at any original legal q where one column capacity=1 and other columns can be paired as a full block matching by the already proven source pair theorem after U is removed. It is strictly broader than even-T-only co-release pairing in parity domain and distinct from p source winline extinction, but positive original 7×6 coverage remains to be measured.

## Frozen independent proof falsifiers

1. Freeze a PURE original-q odd source producer: for each legal capacity-one singleton column U in static source order, let h' differ only with h'_u=H, and call the pre-existing even co-release pair proof on h' AND the ORIGINAL p source residual set (no earlier/current move played and no q successor). Verify all original future cells except U paired exactly once and every p original source requirement includes a full other pair. The result is only p CAN'T FORCE WIN; it is not exact Level2.
2. Freeze independent gravity-poset adversarial control: on small abstract original vertical-chain supports with one U plus multiple even columns (and optionally source cross-prefix pair structures), repeatedly let p choose ANY gravity-legal first cell, apply the prescribed o responder and prove safety/legality through exhaustive independent opponent-choice DFS (validator branches, source NEVER branches); preserve negative witnesses if o ever has no legal response.
3. On genuine standard7×6 first-win-stopped physical positions, source certify pairing positive q then replay actual physical p choices under o's deterministic pending-token policy; p must never first-win. Independently full recursive physical WDL on affordable late roots must show p cannot force win. If no 7×6 source certificates succeed under bounded pairing proof construction, record SAMPLE NEGATIVE, NOT theorem false.
4. At `44444`, report exact source pairing result, blocker and source work; DO NOT proclaim scalar WDL or best action when no matching witness is found.
5. This method does NOT enumerate strategically inequivalent q futures or use solved policy labels. Static column-block matching search and physical independent DFS falsification must be separately accounted. No reduction to artificial "passed" moves, multiple future game-value lanes, or first-win time assumptions.

**Potential extension:** If an odd spare NO-FORCED-p-WIN certificate is proven, combine it with the one first-action source nonloss DRAW theorem to select one BEST DRAW continuation on otherwise unresolved odd-turn positions, still without computing competing action values.


## Restricted preemption-safe theorem and executed standard7×6 proof controls

**New validated additional guard:** If the source matching returned by co-release matcher has EVERY `CO_RELEASE_PREFIX_AND_VERTICAL_TAILS` block with `crossPairPrefixLength<=1`, then its only cross pairs are the FIRST cross pair of their respective blocks. Such a pending cross pair cannot expose another uncompleted cross pair with a mate gravity-blocked by its own pending partner. Any higher released cells in that column belong instead to consecutive vertical pairs, whose mate becomes gravity-playable as soon as its lower cell is played. A pending vertical pair blocks its own next vertical pair until its mate has been played. This restores the source one-dangling-pair release-order invariant: after the attacker consumes spare U or the existing pending mate, there is at least one virgin source pair with a playable member for o to preemptively mark, and touching any virgin pair has a gravity-playable immediate o mate. Every original p K-winning residual includes a FULL pair and is permanently blocked by at least one o stone. Thus `NO_FORCE_WIN_p(q)` (not exact root WDL) follows from this guarded original source q certificate without exploring game strategy alternatives.

**Executed independent actual standard W=7,H=6,K=4 control:** true physical nonterminal sources checked **18,076** at odd ply, **12,293** with a capacity-one column candidate, **65** sound positive original source NO-FORCED-P1-WIN certificates with LIVE R1 winlines (all have ≥2 original legal first actions). The physical simulator independently followed **414** full defender strategy trials, including **306** preemptive virgin-pair claims after the unmatched cell or dangling mate, and ordinary mate replies on touched virgin pairs. Every source pairing defense preserved original gravity and denied p first win; no illegal pair mate and zero incorrect early winner assertions. Full recursive physical WDL separately checked **50** source-positive late roots, all confirming p cannot FORCE WIN. Evidence `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/STANDARD7X6_ODD_SINGLE_SPARE_SAFE_GRAVITY_PAIR_NO_FORCED_WIN_RESULTS_0_1.json`; source `standard7x6-odd-spare-col-co-release-no-win-source.mjs`; physical control `standard7x6-odd-spare-pair-independent-physical-control.mjs`.

**Concrete positive source:** history `7575555752146116171264427741224626363` (original ply37, P1 to move), original legal columns 3 and 4, P1 R1 nonempty. The unmatched one-cell column is original col4 row5. Original col3 has two complete future vertical pairs; the P0 defender can mate P1's first touches, preemptively mark one virgin vertical pair if P1 plays spare or a pending mate, and ensure P1 cannot first-win. Both original first options and their subsequent variations were physically replayed. The source does NOT yet certify which of the two original actions is Level2 best: it only certifies P1 cannot FORCE win.

**Canonical `44444` remains INCOMPLETE.** The source test did not construct a matching covering all P1 original surviving requirements outside center and therefore did not show whether perfect P1 can force WIN. This is structural proof INCOMPLETENESS, not a proof of P1 winning.

**New scope:** This guarded ODD theorem is a direct source **NO-FORCED-WIN** inference usable as the root exclusion half of a future exact DRAW-best continuation if a separate source proves a selected original literal move cannot lose. The 65 source-positive count is not general 7×6 coverage; full unrestricted arbitrary-q Level2 and Level3 conjecture remain OPEN. No IsoGraph 1.2 authority promotion or solver merge.
