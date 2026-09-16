# Support/event composition wave — observed synergy update

**Date:** 2026-09-11  
**Status:** research evidence on `work/minimax-candidate-composition-20260911`; no maintained solver promotion yet.

## Governing policy

These results update directional interaction evidence. No candidate is rejected from one adverse context. Node/proof-work effects remain distinct from elapsed-time effects, and implementation-form cost is tracked separately from semantic value.

Default tested stage order:

`RWS/RID/SUP -> IWIN -> DTH -> FBLK -> FMAC -> DEAD -> exact bound -> AUTO(pre-score) -> E1 -> E2 -> neutral tempo last`

## 1. Event-native SEWB realization

The prior SEWB realization reconstructed, for every active residual requirement, the highest required row in each of seven columns and then scanned all columns. The event-native form compiles each of the 625 WSL requirement IDs to two bytes of metadata:

- one 7-bit participating-column mask;
- one `supportBase = sum(highestRequiredRow + 1)` byte.

For a reachable residual requirement:

`supportFills = supportBase - sum(currentHeight[c] for participating columns)`.

The full static metadata cost is 1,250 bytes for all 625 requirements.

### Differential microqualification

Workflow run `34587201241` / job `103224051084`:

- reachable samples: 2,420;
- per-requirement support-distance checks: 120,617;
- final bound checks: 4,840;
- mismatches: 0;
- scan median: 298.129 ms;
- event median: 38.110 ms;
- isolated support-bound speedup: **7.823x**.

### Full alpha-beta qualification

Workflow run `34587553790` / job `103225139065` compared scan-SEWB and event-SEWB under four contexts (`AUTO` off/on x center/E1E2).

All contexts matched exactly on:

- root scores;
- per-root node counts;
- aggregate node counts;
- SEWB bound-cut counts.

Whole-search speedups from the event realization were:

- center, AUTO off: **1.158x**;
- E1E2, AUTO off: **1.183x**;
- center, AUTO on: **1.147x**;
- E1E2, AUTO on: **1.161x**.

In the strong `AUTO + E1E2` context the exact work remains 1,233 nodes / 134 bound cuts. Broad support work falls from 30,982 seven-column iterations plus 9,761 requirement-cell visits to 8,087 participating-column operations.

**Interaction update:** `SUP-event -> SEWB` moves from projected to **observed positive cost synergy** in this realization.

## 2. DEAD x event-SEWB crossed composition

Workflow run `34587732718` / job `103225704934` tested 36 configurations crossing:

- DEAD off/on;
- no bound / CARD / event-SEWB;
- AUTO off/on;
- center / E1E2;
- historical descriptor-positioned neutral tempo / true absolute-last neutral tempo where DEAD is active.

All configurations matched the independent frozen root oracle.

### Strong-stack node counts

| Stack | Nodes |
|---|---:|
| CARD + AUTO + E1E2 | 1,296 |
| event-SEWB + AUTO + E1E2 | 1,233 |
| DEAD + CARD + AUTO + E1E2 + absolute-last neutral | 1,171 |
| **DEAD + event-SEWB + AUTO + E1E2 + absolute-last neutral** | **1,119** |

Thus event-SEWB retains another **4.44%** node reduction beyond CARD even after DEAD and AUTO are active. DEAD independently removes **9.25%** from the event-SEWB + AUTO + E1E2 context (1,233 -> 1,119).

On this short shared-runner cohort, event-SEWB versus CARD in the strongest DEAD context was approximately wall-time neutral/slightly adverse (~0.5%); this is not treated as a negative semantic result. The prior scan-heavy SEWB form was clearly more expensive, so the event realization has materially changed the cost regime.

**Interaction update:** `SUP-event -> DEAD` remains correctness/state synergy, while the combined `DEAD + event-SEWB` result demonstrates that the two mechanisms are not mutually saturating. Both still remove proof work after tactical normalization and residual automorphism reduction.

## 3. Neutral tempo ordering

The earlier DEAD harness used a descriptor order where the nominally `last` neutral move could still outrank a negative E1 real move. This wave tested true absolute-last placement.

In the strongest `DEAD + event-SEWB + AUTO + E1E2` context:

- descriptor placement: 1,130 nodes;
- absolute-last placement: **1,119 nodes**;
- node improvement: ~0.97%;
- median elapsed improvement in this run: ~1.79%.

Other contexts were mixed in elapsed time and small in node effect, so the rule is retained as an ordering preference rather than a universal semantic claim. It is consistent with the prior crossed result that eagerly searching neutral tempo was usually harmful.

## Current support/event disposition

1. Preserve event-native SEWB as the preferred SEWB implementation form for subsequent composition tests.
2. Preserve exact DEAD with finite pooled neutral tempo; global deletion remains unsound.
3. Use true late/last neutral tempo as the default tested order, with reverse controls retained where needed.
4. Do not stack CARD and SEWB blindly: they are primarily substitutes. CARD remains the cheap fallback/control; event-SEWB is the richer exact bound.
5. Continue into the remaining `SUP-event` synergy edges: compiled Allis certificates/coverage and support-compatible IMPL indexing.
