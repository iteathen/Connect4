# Handoff prompt — Connect4 minimax semantic-residual composition

Copy the prompt below into the continuation agent/chat. It is intentionally self-contained, but the agent must still read live repository state and governing authority before mutation.

---

Continue the **Connect4 exact minimax / semantic-residual optimization composition campaign** from the checkpoint described below.

This is an **EXECUTION REQUEST**, not a request for general advice, a fresh architecture exercise, or a restart of the research from zero. Preserve valid work, read the current repository state, and continue from the actual live seam.

Use the governing engineering cycle for every meaningful unit:

**assess → research → reassess → plan → execute → qualify → review → cleanup/document**

Treat this handoff, research notes, candidate maps, issues, PR text, comments, CI output, and prior-agent conclusions as **evidence, not authority**. Read actual files, current refs, governing docs and exact evidence before mutation.

## Critical process rules

The user explicitly requires the optimization campaign to obey all of these:

- Do **not** rule out an optimization mechanism from one bad test.
- A negative result belongs to the **tested implementation form + workload + stage order**, not automatically to the parent mechanism.
- Some candidates pay dividends only when combined. Test plausible **synergies and directional interactions**, not only isolated toggles.
- **Ordering matters.** Use the signed interaction graph and dependency/saturation order; test reverse legal orders when order itself may change payoff.
- Already-promoted/adopted candidates must remain in the candidate universe **without receiving favorable evidence/confidence simply because they are promoted**.
- Promotion/adoption state is metadata only. The master-map builder intentionally joins adoption metadata *after* evidence assessment and the test scheduler deliberately does not load adoption metadata.
- Missing graph edge means **unassessed, not neutral**.
- Negative graph edges represent scoped saturation/interference hypotheses, not global candidate rejection.
- Preserve failed harnesses/forms when they teach us something; classify invalid constructions separately from candidate evidence.
- Periodically persist research findings, experiment results, rejected forms, active hypotheses and next seams to the repo.
- Keep maintained implementation JS/Node + public Device-JS; no Python escape path.
- Strict ownership boundaries apply.

## Repository and ownership

Repository: `iteathen/Connect4`

At handoff harvest, protected `main` is:

`ed26481faef9ec635d1fd0d790cf7030a29f64ee`

The physical branch cleanup/restructure is complete enough that it is **not the current engineering task**. Do not restart it unless actual repo state exposes a new inconsistency.

Durable lanes:

- `main`
  - protected product/repository authority and routing surface.
- `solver/minimax-alpha-beta`
  - canonical minimax/negamax/alpha-beta implementation and exact-search research.
- `solver/cuda-bsfp`
  - canonical CUDA-BSFP implementation/qualification lane. **BSFP is solving, not search.**
- `research/semantic-quotient`
  - solver-neutral exact semantic quotient, behavioral equivalence, residual automata, minimum-description state research.

Pinned heads observed at harvest:

- `solver/minimax-alpha-beta`:
  - `bf2c1b4d12a7b6f869d145735371c9ae4336fa38`
  - merge title: **Qualify typed exact MQ5 interning**
- `research/semantic-quotient`:
  - `0e4e64748375e6bf68b9e6d525b265c484e67a0e`
- `solver/cuda-bsfp`:
  - `5397e9c538ef5929b4ddf8bd173d5bf9f91e65cb`
- minimax composition campaign:
  - `work/minimax-candidate-composition-20260911`
  - source research head before context-harvest commits: `6e218ac6c9bf46b31eaed7bfb3a509103c26bc9f`
  - that head includes mapped U1 Test B compatibility forms.
- historical/incoming ref `research/zdd-transfer-20260910` still exists at:
  - `54d63ae9a066dba42b2748b3ad51353611a2c52a`
  - it is **not** a canonical authority lane.

Only open PR observed at harvest:

- draft PR **#25**, `solver/cuda-bsfp -> main`, canonical CUDA-BSFP review/integration surface.

Before doing anything, re-read:

- `AGENTS.md`
- `AGENT_LOCAL.md`
- lane-local status / next-step files
- `research/minimax/composition-campaign/2026-09-11-context-window-harvest.md`
- `research/minimax/candidate-map/README.md`
- `research/minimax/candidate-map/post-ledger-forms.json`
- `research/minimax/candidate-map/campaign-form-extensions.json`
- `research/minimax/candidate-map/build-master-map.mjs`
- `research/minimax/candidate-map/schedule-next-tests.mjs`
- `research/minimax/composition-campaign/ORDERING.md`

## Product goal

Solve standard 7×6 Connect Four exactly, connect-4, from the empty board extremely fast.

For the minimax lane the primary engineering objective is **time to exact proof**, while preserving exact score semantics and honest evidence.

Do not conflate this minimax work with CUDA-BSFP. They are separate exact solver lanes.

# 1. Semantic quotient research already completed

## MQ1 — identified-line quotient

The identified-line quotient `(support,H0,H1)` was exhaustively compared with physical complete-game controls. Qualification covered terminal meaning, action-labeled successors, exact strong score and legal-column action values rather than only W/D/L labels.

Result: exact on the bounded complete controls tested.

## MQ2 — coarsest exact behavioral partition

The identified-line quotient was minimized under complete action-labeled future behavior.

Important measured result:

- identified-line classes: **420,704**
- exact behavioral classes: **269,347**

Some behavioral classes cross support and rank boundaries. Therefore raw column height/support history is not itself irreducible state.

## MQ3 — minimal residual antichains + support

Minimal residual winning-requirement antichains paired with support were exact on bounded complete controls.

But:

- residuals **without support** fail;
- support/gravity accessibility is essential;
- residual-antichain + support is still not behaviorally minimal;
- even at the same support, different residual antichains can have identical full future behavior.

Interpretation: ordinary Boolean antichain minimization is not the final quotient under Connect Four’s legal continuation language.

## MQ4 — direct semantic residual automaton

The residual automaton can be generated from its own state law without colored-board history.

Representative 4x5 result:

- **294,593 semantic states**
- naive flat per-column table about **4.71 MB**

A qualification weakness was caught: the first “flat replay” test recomputed semantic children rather than genuinely replaying encoded transition entries.

That was repaired. The strengthened qualifier now materializes the flat table, crosses a byte serialization boundary, decodes it, traverses actual encoded transitions, checks rank transitions, solves values bottom-up from decoded entries, verifies action values and checks for orphan states.

All bounded controls passed with zero transition/action/state mismatches.

This is merged to `research/semantic-quotient` at `0e4e6474...`.

Exact machine shape now supported by evidence:

```text
dense semantic state ID + column
  -> terminal value OR next dense semantic state ID
```

# 2. MQ5 — semantic residual state under alpha-beta

Frozen strong-distance anchors:

- `663152175` -> exact **-4**
- `41267575` -> exact **+3**

The control is already a strong optimized exact board-state search, not naive minimax.

## Semantic proof-volume reduction

Loss anchor:

- board control: about **1,014,754 nodes**
- semantic residual: **786,581 nodes**
- reduction: **22.48%**

Win anchor:

- board control: about **5,261,422 nodes**
- semantic residual: **4,138,812 nodes**
- reduction: **21.34%**

Exact scores preserved.

The first implementation used strings, BigInt tuple keys and JS Maps and was mechanically very slow. That was representation overhead, not a failure of the semantic quotient.

## Factored side-state identity

Current/opponent residual sides were factored and interned separately.

Result: exact same proof-node counts, lower materialization overhead. This helped isolate semantic benefit from representation cost.

## WSL-625 requirement IDs

The 69 standard 7x6 winning lines induce **625 unique nonempty residual requirement masks**. These are now a fixed `u16` ID universe.

A critical bug was caught in the first implementation:

- transition table incorrectly allocated for 42 cell indices;
- native incumbent bitboard uses 7-stride, **49 bit slots**;
- playable cells reach bit index 47;
- broken candidate returned `0` rather than `-4` on the loss anchor.

Corrected implementation uses the full native coordinate domain and has a regression test. After the fix, exact semantic proof-node counts were preserved.

# 3. Typed exact MQ5 interning is now QUALIFIED

Do not restart this as an unfinished idea.

Canonical minimax head at harvest:

`bf2c1b4d12a7b6f869d145735371c9ae4336fa38`

Specific qualified form:

`MQ5-TYPED-OPENADDR-V1`

Files include:

- `research/minimax/semantic-residual-mq5/residual_solver_wsl625_typed.mjs`
- `research/minimax/semantic-residual-mq5/run_wsl625_typed.mjs`
- `research/minimax/semantic-residual-mq5/run_wsl625_typed_repeated.mjs`

Identity rule is exact:

- hashes choose candidate slots only;
- **full record equality** remains authority after collision.

Qualification preserved, on both frozen anchors:

- exact score;
- exact proof nodes;
- TT hits/writes;
- forced transitions;
- whole-state count;
- side-state count;
- transition-cache cardinality.

Repeated timing:

- seven alternating-order runs per anchor;
- first two warmups excluded from median;
- loss anchor median speedup: **1.493x**
- win anchor median speedup: **1.571x**

Retained failed form:

- first typed draft omitted full antichain normalization and singleton winning-count metadata;
- corrected before accepting timing evidence;
- do not use that failure against the typed mechanism.

The umbrella map entry `MQ5-TYPED-EXACT-INTERN` may still appear active because the map preserves umbrella hypotheses separately from qualified child forms. Do not confuse that with the status of `MQ5-TYPED-OPENADDR-V1`.

# 4. Candidate map / synergy graph

The user explicitly requested a complete candidate map that includes already-promoted candidates without biasing them.

The current machine-built map includes:

- all **107** historical candidate rows with no gaps;
- **52** signed-graph mechanism/control nodes;
- **39** signed graph edges;
- **36** post-ledger forms at harvest;
- **20** post-ledger observed relations;
- **1** synthetic mechanism;
- **196 unique IDs** total;
- **31** active campaign executable sources;
- **30** mapped candidate-evidence executables;
- **1** explicit harness-only executable;
- **0 unmapped active sources**;
- **31 projected/unobserved signed edges** remaining.

Latest map CI observed:

- workflow run **34598242656**
- passed map validation, source-coverage audit, promotion-blind next-test schedule and artifact upload.

Bias firewall:

- `adoption-metadata.json` is not loaded when candidate assessment/scheduling is constructed;
- adoption metadata is joined only after the evidence map exists;
- builder rejects adoption/promotion fields embedded in assessment records.

Scheduling policy:

- stage ascending;
- projected confidence descending;
- projected magnitude descending;
- no composite candidate score.

Missing edge = unassessed, never zero.

Negative edge = scoped saturation/interference hypothesis, never a blanket mechanism rejection.

# 5. Current strong stage order and interaction evidence

The following is a **research scaffold**, not a final production specification.

## Tactical normalization

Use exact tactical erasure early:

```text
IWIN -> DTH -> FBLK -> FMAC
```

FMAC is consistently high leverage. In a 48-context campaign it removed about **47–95%** of nodes depending on context, median roughly **65%**.

## CARD and SEWB

CARD is cheap and useful; crossed campaign median proof reduction was roughly 23%.

SEWB is semantically stronger but the original scan form was expensive.

Qualified event-native form:

- static WSL-625 metadata: `columnMask + supportBase`;
- about **1,250 bytes** total;
- **120,617** per-requirement differential checks;
- **4,840** complete-bound checks;
- zero mismatches;
- isolated support calculation **7.82x faster** in the recorded run;
- full-search scan-vs-event preserved identical nodes/cuts and improved wall roughly **15–18%**.

## DEAD neutral-tempo abstraction

The first exact implementation was invalid because it stored exact TT values after alpha-beta cutoffs. It is retained as an invalid form, not DEAD evidence.

Correct interval-TT form:

- node reduction **3.25–14.88%**, median ~9.83% in crossed contexts;
- neutral action should be **absolute last**;
- neutral-first worsened nodes in every tested crossed context.

Strong small-cohort stack:

`DEAD + event-SEWB + AUTO + E1->E2 + neutral-last`

reached **1,119 nodes**, versus 1,233 before DEAD.

## AUTO

Apply residual equivalence / automorphism pruning **before expensive child scoring**.

AUTO-before and AUTO-after had identical proof nodes, but AUTO-before avoided scoring about **5.4–8.7%** of children.

## E1/E2/P1 ordering

Under strong `FMAC + CARD + AUTO`:

- `E1 -> E2`: **1,296 nodes**
- `E2 -> E1`: 1,373
- E1 only: 1,481
- center: 1,906
- dominant P1: >2,000 in that context

P1 is not globally rejected. It is strongly regime/order sensitive.

Parity as a *secondary* tie-break on maturity was positive in all eight crossed contexts in the early matrix, despite older adverse parity-primary results.

# 6. A1–A3 / Allis program — major current winner

## Coverage census

Across **1,731 sampled roots** and **32,011 opponent residual requirements**:

- A1–A3 raw coverage: **79.45%**
- A1–A9 raw coverage: **93.26%**
- roots with raw full coverage:
  - A1–A3: 31 / 1,731 = **1.79%**
  - A1–A9: 506 / 1,731 = **29.23%**

Raw coverage is not authority for A4–A9. Compatibility/controller conditions must still be proven.

Observed marginal coverage suggested A8 is especially valuable, followed by A5/A6 and A4. A7 had no additional marginal coverage in that sample, but it is not globally rejected.

## U1 event-rank parity

Qualified over:

- **2,750 states**
- **61,416 targets**
- **798,408 deltas**
- zero owner/rank/delta mismatches.

On standard 7x6, future owner of row `r` simplifies to player `r mod 2`.

This allowed Claimeven/Vertical to become role-general rather than hard-coded to even-ply historical conventions.

Role-generalized A1/A3 + Baseinverse qualification:

- 96 exact roots;
- 48 each move parity;
- 11 compatible covers;
- zero false claims;
- zero mismatch against historical even-ply A1/A3 classification.

## Search impact

Dynamic exact A1–A3 reduced the physical-support `SEWB + AUTO` strong stack:

- 1,233 -> **919 nodes**

but dynamic construction/cover DFS was initially expensive.

A1–A3 was composed with DEAD while preserving proof semantics:

- DEAD owns the search/TT quotient;
- certificate temporarily restores retired physical heights before proof.

Results:

- DEAD+SEWB stack: **1,119 nodes**
- A123-before: **823 nodes**
- A123-after-SEWB: **825 nodes**

## Implementation-form sequence

Keep these forms separate in reasoning and map state:

- v1 reverse-index compiler: ~3x faster hot, catastrophic cold/lifecycle due mostly-unique support programs and 625-way arrays.
- v2 lightweight cache: ~2.8x faster warm, still cold-negative.
- v3 direct no-cache: removes support cache but still ~25% slower than dynamic because per-check BigInt/string/Map fragment construction remains.
- **v4 geometry-native fixed-scratch**: current winner.

V4 evidence:

- 1,800-state differential, zero mismatches;
- geometry median **2.913 ms** vs dynamic **7.027 ms**;
- **2.413x** micro speedup;
- full strong stack preserves exact **823/825** trees and exact certificate checks/hits/cuts;
- 823-node form about **15.1% faster than dynamic A123**;
- only about **2.17% slower than A123-off** while removing **26.45%** of nodes.

Specific form ID:

`A123-GEOMETRY-U1U2-V4`

# 7. A1–A3 on real MQ5 exact-distance anchors

The harness deliberately crossed baseline / EXH / A123 / EXH+A123 so one-sided exhaustion cannot be credited to A123.

## Loss anchor `663152175`

- exact score: **-4**
- semantic MQ5 baseline: **786,581 nodes**
- A123: **557,605 nodes**
- node ratio: **0.708897**
- reduction: **29.11%**
- measured time ratio in that run: about **0.8354**
- A123 checks: **245,093**
- hits: **10,149**
- cuts: **6,394**

## Win anchor `41267575`

- exact score: **+3**
- semantic MQ5 baseline: **4,138,812 nodes**
- A123: **3,161,623 nodes**
- node ratio: **0.763896**
- reduction: **23.61%**
- measured time ratio: about **1.0041**
- A123 checks: **1,281,767**
- hits: **67,137**
- cuts: **39,150**

Semantic MQ5 + A123 compared with the older compact physical-board control is approximately:

- **45.05% fewer proof nodes** on the loss anchor;
- **39.91% fewer proof nodes** on the win anchor.

A123 also reduces representation pressure. On the win anchor, whole semantic states fall from about 2.20M to **1.81M**, and move preparations from about 14.44M to **11.09M**.

## EXH interaction

Loss:

- baseline 786,581
- EXH 786,896
- A123 557,605
- EXH+A123 556,980

Win:

- baseline 4,138,812
- EXH 4,143,313
- A123 3,161,623
- EXH+A123 3,166,088

Interpretation: EXH is largely saturated in this stack. Keep it as a cheap native consequence when available, but do not promote it as a major separate stage based on these anchors.

# 8. U1 Test B — generic Allis compatibility

This is newer than the initial A123 work and is part of the current seam.

Goal: reproduce accepted Allis rule compatibility with a **type-blind resource/event predicate**, using the Allis compatibility table as oracle and proof authority.

## V1 — invalid harness

`U1-ALLIS-COMPAT-V1-INVALID`

Descriptor computed claims but failed to return them. Failed before candidate evidence. Preserve as invalid harness form only.

## V2 — strict overlap exclusion

`U1-ALLIS-COMPAT-V2-STRICT`

- **695,232 pair comparisons**
- **10,938 false negatives**
- all false negatives localized to A5/A6 paired with A1 at the claim/inverse boundary-sharing seam.

Conclusion: blanket resource-overlap exclusion is too strict.

## V3 — event-interval claim/inverse boundary sharing

`U1-ALLIS-COMPAT-V3`

- **695,232 pair comparisons**
- all **359,512 Allis-table-allowed pairs** accepted
- **zero false negatives** against the Allis allowed set
- generic predicate also accepts **82,367 additional pairs**

Critical authority boundary:

Those **82,367 extra pairs are diagnostic only**. Their soundness is not proven. They must not be used to authorize A10 proof composition. Conservative Allis section 7.4 compatibility remains authority until the extra pairs are independently proven or exhaustively qualified.

The next mathematical seam is to classify/prove/falsify those extras without reintroducing hard-coded rule-type exceptions if possible.

# 9. ZPAR — partial conservative qualification only

Specific form:

`ZPAR-SINGLETON-PAIR-V1`

This is *not* a general Zugzwang terminalizer yet.

Evidence:

- `zpar_single_threat_exact.mjs`
  - **112** qualified exact 7x6 states across four observed singleton-threat classes and mirrors
  - zero mismatches
  - no broad pruning authority granted
- `zpar_black_odd_census.mjs`
  - targeted **2.16M-state** census
  - found five `WE_BO_diff` classifiable cases
  - all were exact draws as predicted
- `zpar_black_odd_structure.mjs`
  - **1.44M-state** structural census
  - 7,928 both-singleton Black-odd states
  - 3,441 White-odd/Black-odd pairs
  - zero full different-column `WO_BO_diff` cases

Authority remains restricted to the sampled strict predicate where each player has exactly one nonplayable singleton residual and no other surviving winning requirement.

`WO_BO_diff` is unresolved. Absence from the census is not proof of impossibility.

# 10. IMPL — proof-positive, runtime-negative in current forms

Parent mechanism: support-compatible implication / cross-state proof transfer.

Do not reject it based on current implementation cost.

## RID closure retest

Exact RID active-set/upward-closure containment reproduces the older nested-mask dominance relation and proof reduction.

## `IMPL-RID-SIG4`

- four conservative 32-bit signatures reject impossible dominance comparisons;
- exact RID closure remains authority;
- preserves score, expanded-state count, dominance hits and frontier;
- on 4x5 rejects **84.64%** of exact full-closure checks;
- about **1.23x** faster than raw closure in that run;
- still slower than no-IMPL baseline.

## `IMPL-RID-INDEX8`

- support-local conservative 8-bit grouping;
- surviving candidates still pass SIG4 + exact RID closure;
- exact frontier and proof work preserved;
- on 4x5 candidate visits down about **24.2%**;
- wall about **1.07x vs raw closure / 1.09x vs signature-only**;
- still far slower than no-IMPL baseline.

Next meaningful IMPL experiment is not more isolated index tuning. Test **marginal proof value on the strongest current exact-distance stack**.

If transferred into alpha-beta, preserve bound direction. A null-window result is not automatically exact:

- lower-bound proof can transfer only in the correct monotone direction;
- upper-bound proof can transfer only in its correct direction;
- cutoff and fail-low publications must keep correct bound type;
- use bounded frontier capacities/forms rather than one arbitrary capacity.

If IMPL’s marginal proof-volume gain is nearly saturated by semantic state + A123, stop spending time tuning its frontier. If it remains large, stronger indexing is justified.

# 11. Promotion-blind outstanding graph edges

The latest map scheduler still has **31** projected/unobserved signed edges.

High-level queue:

- tactical saturation:
  - `DTH/IWIN -> FMAC/E1`
- exact exhaustion saturation:
  - `BEXH -> CARD/SEWB/AUTO/E1/YBWC`
  - `EXH -> CARD/E1`
- ZPAR enablement:
  - `SUP/INC/RWS/RID/E2 -> ZPAR`
- richer A10 enablement/certificate supply:
  - `SUP/INC/A4/A5/A8/A7/A6/A9/ZPAR -> A10`
- A10/ZPAR downstream saturation once exact proposition scope closes.

Do not spend equal engineering effort on obvious structural saturation edges. Cheap ones can be closed/documented in batches. Spend experiment budget on uncertain high-value mechanisms/interactions.

# 12. Immediate next execution seam

The highest-leverage missing composition is now very specific:

## A. Combine typed MQ5 + geometry-native A123

`MQ5-TYPED-OPENADDR-V1` and `A123-GEOMETRY-U1U2-V4` are each qualified independently, but their **joint exact-distance solver has not yet been fully qualified as one composition**.

Execute this next.

Use the same frozen anchors:

- `663152175` => -4
- `41267575` => +3

Required controls:

1. typed MQ5 without A123;
2. typed MQ5 + geometry A123;
3. prior Map/WSL625 + geometry A123 where useful for causal comparison.

Acceptance gates:

- exact root scores unchanged;
- A123 proof-node behavior should be understood and any drift explained, not hand-waved;
- TT authority unchanged;
- full-record equality after hash collision remains identity authority;
- no new probabilistic identity shortcut;
- repeated rotating/alternating-order timing, not one run;
- preserve state/side counts, transitions and A123 check/hit/cut statistics.

Primary question:

> Are the ~1.49–1.57x typed-container runtime improvement and the ~23.6–29.1% A123 proof-volume reduction additive in the same solver?

## B. Then test IMPL marginal value on typed+A123

Only after A is qualified.

Use multiple bounded frontier capacities/forms, exact bound-type authority, and compare marginal proof reduction as well as time/candidate scans.

## C. Continue U1 Test B

Classify/prove/falsify the 82,367 generic-extra V3 pairs. Do not use them as proof authority until soundness closes.

## D. Richer A10

Move from raw A4–A9 coverage toward exact compatible rule cover in evidence-driven order, especially A4/A5/A8, while keeping conservative compatibility authority.

## E. ZPAR

Continue only with conservative predicates. Resolve `WO_BO_diff` or establish a formal impossibility argument before widening authority.

## F. Later proof-memory / parallel waves

After the serial semantic/proof kernel stabilizes, revisit:

- CTT / RANK / PH / CAP / CPR
- then STT / YBWC / AFF / JOIN

Do not add multicore scheduling noise before the serial state/proof kernel is stable enough to measure cleanly.

# 13. CUDA-BSFP lane — do not mix into this unit

CUDA-BSFP is a separate backward symbolic fixed-point solver lane, not minimax/search.

Current head at harvest:

`5397e9c538ef5929b4ddf8bd173d5bf9f91e65cb`

Qualified milestones include P1/B1/C1/O1/O2/O3.

O3 already established exact residual-pair factorization/reuse and crossing-occurrence mapping on a bounded 7x6 cut.

Current CUDA-BSFP seam remains:

- accepted checked scan/select contract under CUDA-Algorithms issue #9;
- exact residual ordering/group boundaries with full equality/collision handling;
- compact variable-length representatives;
- dense next-pair/state IDs;
- device-resident next OQS layer chaining without host semantic progression.

Only open PR at harvest is draft PR #25 for this lane.

# 14. Final context compression

The strongest current structural stack is:

```text
optimized compact board alpha-beta
  -> semantic residual state
     (~21–22% less proof work)
  -> WSL-625 fixed residual IDs
  -> typed exact open-address interning/caches
     (~1.493x / 1.571x repeated median speedup vs Map/BigInt MQ5,
      identical proof tree)
  -> geometry-native A1–A3 strategic certificate
     (~29.11% / 23.61% less remaining MQ5 proof work
      on frozen loss/win anchors)
```

The typed runtime and A123 proof certificate have **not yet been jointly qualified in one composed solver**. That is the immediate seam.

The campaign’s core scientific rule is:

**mechanism ≠ implementation form ≠ workload regime ≠ stage order ≠ synergy ≠ promotion status.**

Preserve those distinctions in every experiment and in the master candidate map.

Execute forward from this seam. Do not stop after producing a plan.

---
