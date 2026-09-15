# Connect4 minimax / semantic-residual composition — context-window harvest

Date: 2026-09-11

Status: durable research note / handoff evidence. This is not a new governing specification and does not promote any candidate merely because it appears here.

## Governing execution discipline

For every meaningful unit, preserve the repository's governing cycle:

**assess → research → reassess → plan → execute → qualify → review → cleanup/document**

Prior-agent conclusions, issue text, PR descriptions, CI output, this note, and historical research are evidence, not authority. Read the actual repository state, `AGENTS.md`, `AGENT_LOCAL.md`, relevant specs, and the owning lane before mutation.

The current optimization campaign follows three non-negotiable research rules:

1. **Do not reject a mechanism from one bad implementation or one bad workload.** A negative result attaches to the tested form and regime.
2. **Do not test candidates only in isolation.** The signed synergy graph is directional and order-sensitive; candidates must also be tested in plausible compositions.
3. **Promotion/adoption state must not bias evidence, confidence, or test scheduling.** Adoption metadata is loaded only after the candidate/evidence map is built.

## Repository topology and pinned heads at harvest

Protected `main`:

- `ed26481faef9ec635d1fd0d790cf7030a29f64ee`
- latest integration: PR #32, physical stale-ref cleanup, archiving/retiring 40 stale refs with preservation proofs.

Canonical durable lanes:

- `main` — protected product/repository authority and routing surface.
- `solver/minimax-alpha-beta` — canonical minimax/negamax/alpha-beta implementation/research lane.
- `solver/cuda-bsfp` — canonical CUDA-BSFP implementation/qualification lane. BSFP is solving, not search.
- `research/semantic-quotient` — solver-neutral exact semantic quotient / behavioral state / residual automaton research.

Current canonical/relevant heads:

- `solver/minimax-alpha-beta`: `bf2c1b4d12a7b6f869d145735371c9ae4336fa38` — **Qualify typed exact MQ5 interning**.
- `research/semantic-quotient`: `0e4e64748375e6bf68b9e6d525b265c484e67a0e` — strengthened serialized/materialized MQ4 flat replay qualification.
- `solver/cuda-bsfp`: `5397e9c538ef5929b4ddf8bd173d5bf9f91e65cb` — post-O3 seam routed to CUDA-Algorithms issue #9.
- active minimax composition campaign: `work/minimax-candidate-composition-20260911`; observed head before this context-harvest commit was `6e218ac6c9bf46b31eaed7bfb3a509103c26bc9f` — **Map U1 Test B compatibility forms**.
- `research/zdd-transfer-20260910` still exists at `54d63ae9a066dba42b2748b3ad51353611a2c52a`; it is not a canonical authority lane.

Open PR surface at harvest:

- only PR #25 is open: draft `solver/cuda-bsfp -> main`, canonical CUDA-BSFP integration/review surface.

## Repository restructuring result

The large branch/research cleanup is complete enough that it is no longer the engineering task. Physical stale-ref cleanup landed on protected main after the earlier logical restructure. Do not restart the restructure unless actual repository state exposes a new inconsistency.

The important outcome is the ownership split above. In particular:

- shared quotient mathematics and behavioral equivalence belong to `research/semantic-quotient`;
- minimax proof/search behavior and candidate composition belong to `solver/minimax-alpha-beta` / the current minimax campaign;
- CUDA-BSFP owns backward symbolic fixed-point composition and native evidence;
- generic scans/order/group/compaction/dense-ID producer mechanisms belong in CUDA-Algorithms, not Connect4.

## Semantic-quotient program: MQ1–MQ4

The semantic research established that Connect Four can be represented substantially below the historical colored-board state while preserving exact future behavior.

### MQ1 — identified-line quotient qualification

The identified-line quotient `(support, H0, H1)` was exhaustively compared against physical game graphs on bounded complete controls. The qualification checked terminal semantics, successor signatures, exact strong values and per-action values rather than only W/D/L labels.

Result: the identified-line state is exact on the bounded controls tested.

### MQ2 — exact behavioral minimization

The identified-line quotient was then minimized by complete action-labeled future behavior.

Key result on the bounded corpus:

- identified-line classes: **420,704**
- exact behavioral classes: **269,347**

Important structural result: some exact behavioral classes cross physical-support and rank boundaries. Therefore raw support/height history is not itself irreducible game state.

### MQ3 — residual win-space antichain + support

Minimal residual winning-requirement antichains paired with support were tested as a more compact semantic representation.

Result:

- residual antichains + support are exact on the bounded complete controls tested;
- residuals without support fail — gravity/accessibility information is essential;
- the representation is still not behaviorally minimal: even at the same support, distinct antichains can share complete future behavior.

Interpretation: ordinary Boolean antichain minimization is canonical over independent cell variables, but legal Connect Four continuation semantics identifies more functions than ordinary Boolean equivalence.

### MQ4 — direct semantic residual automaton

A residual automaton was generated directly from its own state law starting at the empty root, without colored ownership history.

Representative bounded result:

- 4x5 control: **294,593 semantic states**;
- naive flat per-column table: about **4.71 MB**.

A qualification gap was found in the first MQ4 “flat replay” claim: the original harness recomputed semantic child keys and verified dense-ID membership rather than replaying the encoded table itself.

That gap was repaired. The strengthened qualifier now:

- materializes the flat transition table;
- crosses a byte serialization boundary;
- decodes the table;
- traverses reachable state entirely through decoded entries;
- checks rank/transition validity;
- solves strong values bottom-up from the decoded table;
- checks per-column action values and orphan states.

All bounded controls passed with zero transition/action/state mismatches. This is merged on `research/semantic-quotient` at `0e4e6474...`.

The semantic lane therefore supports the exact machine shape:

`dense semantic state ID + local column -> terminal value or dense semantic state ID`.

## MQ5 — semantic residual state under exact alpha-beta

MQ5 transferred the semantic state law into a serial exact alpha-beta/negamax environment rather than continuing only on complete small-game graph enumeration.

The control is already a strong board-state solver, not naive minimax. It uses the compact decision-state/rank-banked exact search stack and a 512K TT.

Frozen exact anchors:

- loss anchor `663152175` => exact score **-4**.
- win anchor `41267575` => exact score **+3**.

### Initial MQ5 result

The exploratory string-heavy semantic implementation was mechanically expensive but immediately showed structural proof reduction.

Loss anchor:

- board control: about **1,014,754 nodes**;
- semantic state: **786,581 nodes**;
- reduction: **22.48%**.

Win anchor:

- board control: about **5,261,422 nodes**;
- semantic state: **4,138,812 nodes**;
- reduction: **21.34%**.

Exact scores were preserved.

The first representation was tens of times slower because of JS strings, BigInt composite keys, `Map` interning and transition caches. That timing did not invalidate the proof-volume result.

### Factored side state

Current/opponent residual sides were interned separately. This removed substantial materialization overhead while preserving the **exact same semantic proof-node counts**. That separated state semantics from representation cost.

### WSL-625 fixed-ID substrate

The residual requirement universe was compiled to the **625 unique nonempty residual subsets of the 69 Connect Four winning lines**. Requirement records became `u16` IDs.

A serious coordinate bug was caught in the first version: the table was sized for 42 playable cells even though the incumbent native board uses a 7-stride 49-bit coordinate domain, with playable bit indices reaching 47. The broken form returned score `0` instead of `-4` on the loss anchor. The corrected form sizes transitions for the native 49-bit coordinate space and has an explicit regression guard.

After correction, WSL-625 preserved the exact MQ5 proof trees and materially reduced payload/runtime overhead.

### Typed exact open-address interning — now qualified

The earlier current seam “remove JS Map/BigInt identity authority” has now been executed and merged on `solver/minimax-alpha-beta`.

Qualified form: `MQ5-TYPED-OPENADDR-V1`.

Implementation evidence:

- `research/minimax/semantic-residual-mq5/residual_solver_wsl625_typed.mjs`
- `run_wsl625_typed.mjs`
- `run_wsl625_typed_repeated.mjs`

Exactness requirement: hashes choose candidate slots only; **full-record equality remains authority after collisions**.

Qualification:

- strict parity for score, nodes, TT hits/writes, forced transitions, state count, side-state count and transition-cache cardinalities on both MQ5 anchors;
- seven alternating-order runs per anchor, first two treated as warmup;
- repeated median speedup over the previous WSL-625 `Map`/BigInt form:
  - loss anchor: **1.493x**;
  - win anchor: **1.571x**.

A first draft omitted full antichain normalization and singleton winning-count metadata. It was corrected before any benchmark result was accepted; the failed form remains retained evidence, not evidence against typed interning.

Canonical minimax head after this work: `bf2c1b4d12a7b6f869d145735371c9ae4336fa38`.

## Complete unbiased candidate map

The user explicitly required the optimization map to include already-promoted candidates **without biasing them**.

The campaign now has a machine-built master map assembled from:

1. all **107** historical candidate rows;
2. the signed directional interaction graph;
3. post-ledger mechanism/form records;
4. current campaign form extensions;
5. explicit harness-only exclusions;
6. adoption metadata joined only after assessment.

At campaign head `6e218ac6...`, the map validation reported:

- historical candidates: **107**, complete with no ID gaps;
- signed graph mechanisms: **52**;
- signed graph edges: **39**;
- post-ledger forms: **36**;
- post-ledger observed relations: **20**;
- synthetic mechanisms: **1**;
- total unique IDs: **196**;
- active campaign executable sources: **31**;
- candidate-evidence executables: **30**;
- harness-only executables: **1**;
- unmapped campaign sources: **0**;
- projected/unobserved signed edges remaining: **31**.

The master-map workflow and campaign-source audit are green. Any new campaign `.mjs` source that is neither mapped as evidence nor explicitly classified harness-only causes the completeness gate to fail.

The scheduling script deliberately does **not** load adoption metadata. It orders outstanding mapped edges by stage, then projected confidence, then projected magnitude, with no composite “candidate score.” Missing relation means **unassessed, not neutral**. Negative edges mean scoped saturation/interference hypotheses, not mechanism rejection.

The three umbrella forms still reported active/open by the scheduler are:

- `MQ5-TYPED-EXACT-INTERN` — umbrella hypothesis; note that the specific realization `MQ5-TYPED-OPENADDR-V1` is already qualified.
- `A123-COMPILED-U1U2` — umbrella/current-work label; the specific geometry-native V4 form is already strongly qualified.
- `IMPL-RID-NATIVE` — still genuinely open because current forms preserve proof benefit but not runtime profitability.

Do not interpret these umbrella states as undoing the evidence of their qualified child forms.

## Composition harness policy

The campaign deliberately does not use a one-shot winner/loser table.

The historical harness philosophy was reconstructed into a current crossed composition framework:

- frozen exact roots and oracle checks;
- deterministic node/work metrics separated from wall time;
- repeated/rotating-order timing where timing matters;
- feature toggles crossed in multiple plausible contexts;
- pairwise and selected triple combinations driven by the directional synergy graph;
- reverse-order controls when stage ordering itself can change payoff;
- failed harness constructions preserved as invalid-form evidence rather than silently deleted.

## Established ordering / stage results

The current research scaffold should not be mistaken for a final production pipeline, but several stage-order conclusions are strong.

### Tactical normalization

`IWIN -> DTH -> FBLK -> FMAC` should happen early.

FMAC is one of the strongest repeated proof-volume reducers in the campaign. Across a broad 48-context cross it removed roughly 47–95% of nodes depending on context, with a median around 65%.

The promotion-blind schedule still contains obvious saturation edges such as `IWIN/DTH -> FMAC/E1`; those are structural facts to record/close, not reasons to reorder the already-correct tactical pipeline.

### CARD / SEWB bounds

CARD is cheap and strong, historically around a 23% median node reduction in the crossed campaign.

SEWB is semantically stronger but its first scan implementation was too expensive.

The event-native form precompiles WSL-625 support metadata (`columnMask + supportBase`):

- static metadata: about **1,250 bytes** for all 625 requirements;
- differential: **120,617 per-requirement checks + 4,840 complete bounds**, zero mismatches;
- isolated support-bound speedup: **7.82x** (about 298.1 ms -> 38.1 ms in that run);
- full-search scan-vs-event: identical per-root nodes and bound cuts, about **15–18% whole-search improvement**.

This transformed SEWB from “proof-positive but expensive” into a competitive stage.

### DEAD / neutral tempo

The first pooled-neutral implementation was invalid because it wrote exact TT authority after alpha-beta cutoffs. That draft is retained as `DEAD-POOLED-V1-INVALID-TT` and is **not evidence against DEAD**.

Corrected interval-TT form:

- node reduction across crossed contexts: roughly **3.25–14.88%**, median about **9.83%**.
- neutral move should be searched **absolute last**. Neutral-first increased nodes across the tested crossed contexts.

`DEAD + event-SEWB + AUTO + E1->E2 + neutral-last` reached **1,119 nodes** on the frozen small strong-stack cohort, versus 1,233 for the pre-DEAD event-SEWB strong stack.

### AUTO placement

Residual automorphism/equivalence pruning should happen **before expensive child scoring**.

AUTO-before and AUTO-after preserved the same nodes, but AUTO-before avoided scoring about **5.4–8.7%** of children in the stage-order controls.

### E1/E2/P1 ordering

Under the strong `FMAC + CARD + AUTO` stack:

- `E1 -> E2`: **1,296 nodes** — best tested order in that cohort;
- `E2 -> E1`: 1,373;
- E1 alone: 1,481;
- center: 1,906;
- dominant P1 forms: >2,000 in that context.

P1 is not globally rejected. Earlier crossed tests showed it can help in some contexts and hurt materially in others. It remains a regime/order-sensitive candidate.

Parity as a **secondary** tie-break on maturity was positive in all eight crossed contexts in the early matrix. That result coexists with older adverse parity-primary evidence; form/order matters.

## A1–A3 / Allis certificate program

This became one of the strongest discoveries in the current window.

### Raw coverage census

Across 1,731 sampled roots and 32,011 opponent residual requirements:

- A1–A3 raw coverage: **79.45%**;
- A1–A9 raw coverage: **93.26%**;
- roots with raw full coverage:
  - A1–A3: 31 / 1,731 = **1.79%**;
  - A1–A9: 506 / 1,731 = **29.23%**.

This is coverage evidence, **not** proof authority for A4–A9. Compatibility/controller constraints must still close.

Marginally, A8 was especially valuable, followed by A5/A6 and A4 in that sample. A7 showed no additional raw coverage after A1–A3 in that particular cohort, but it is not globally rejected.

### U1 event/rank role generalization

A support/event parity identity was qualified over:

- 2,750 states;
- 61,416 targets;
- 798,408 event deltas;
- zero rank, owner or delta mismatches.

For standard 7x6 the future owner of row `r` simplifies to player `r mod 2`, allowing the old even-ply Claimeven/Vertical split to be expressed role-generically.

Role-generalized A1/A3 plus Baseinverse was tested on 96 exact roots, split evenly across move parity:

- 11 compatible covers;
- zero false one-sided no-win claims;
- zero mismatches against the historical even-ply Claimeven/Vertical classification.

### Dynamic A1–A3 in search

The exact dynamic certificate reduced the physical-support `SEWB + AUTO` strong stack from **1,233 -> 919 nodes**, about 25–26%, but dynamic rule generation/DFS initially made runtime worse.

A1–A3 was then composed with DEAD without lying about certificate semantics: DEAD owned the search/TT quotient, but certificate checks temporarily restored retired physical column heights before proving the response strategy.

Result:

- DEAD+SEWB strong stack: **1,119 nodes**;
- A123-before: **823 nodes**;
- A123-after-SEWB: **825 nodes**.

The certificate therefore remained strongly additive with DEAD.

### Implementation-form sequence

A1–A3 is an important example of why mechanisms and forms must be separate nodes.

- v1 compiled reverse-index form: about 3x faster hot, catastrophic cold/lifecycle behavior because mostly-unique support programs created 625-way reverse arrays.
- v2 light cached form: about 2.8x warm improvement, still loses on cold unique-support streams.
- v3 direct no-cache form: removes support-cache lifecycle, but per-check BigInt/string/Map fragment construction remained about 25% slower than dynamic in the microbenchmark.
- **v4 geometry-native fixed-scratch form**: precompiled singleton/pair blocker IDs and resource geometry, no support cache, no blocker `Map` lookup, fixed scratch arrays.

V4 qualification:

- 1,800-state differential, zero mismatches;
- geometry median about **2.913 ms** vs dynamic **7.027 ms** — **2.413x faster** in the microbenchmark;
- full strong-stack keeps the exact **823/825** node trees and exact certificate check/hit/cut counts;
- 823-node before-bound form: about **15.1% faster than dynamic A123** and only **2.17% slower than A123-off** while cutting nodes **26.45%**.

### A1–A3 on real MQ5 exact-distance anchors

This is the strongest evidence in the current window.

The harness explicitly crossed:

- baseline;
- EXH-only;
- nonempty A123-only;
- EXH+A123;

so exhaustion effects are not misattributed to A123.

Loss anchor `663152175`:

- MQ5 semantic baseline: **786,581 nodes**, score -4;
- A123: **557,605 nodes**;
- node ratio: **0.708897** => **29.11% reduction**;
- measured time ratio in that run: about **0.8354** => ~16.5% faster;
- A123 checks: 245,093;
- A123 hits: 10,149;
- A123 cuts: 6,394.

Win anchor `41267575`:

- MQ5 semantic baseline: **4,138,812 nodes**, score +3;
- A123: **3,161,623 nodes**;
- node ratio: **0.763896** => **23.61% reduction**;
- measured time ratio: about **1.0041** => essentially break-even;
- A123 checks: 1,281,767;
- A123 hits: 67,137;
- A123 cuts: 39,150.

Compared to the older compact board baseline, semantic MQ5 + A123 is about **45.05% lower node count on the loss anchor** and **39.91% lower on the win anchor**.

A123 also materially reduces representation workload. On the win anchor, whole semantic states fell from about 2.20M to **1.81M** and move preparations from 14.44M to **11.09M**.

### EXH saturation with A123

EXH alone was slightly adverse in node count on both MQ5 anchors and adds negligible proof reduction when A123 is already active.

Loss:

- baseline 786,581;
- EXH 786,896;
- A123 557,605;
- EXH+A123 556,980.

Win:

- baseline 4,138,812;
- EXH 4,143,313;
- A123 3,161,623;
- EXH+A123 3,166,088.

Interpretation: retain EXH as a cheap native consequence where already available; do not mistake saturation in this stack for global mechanism rejection.

## U1 Test B — generic Allis compatibility

This work advanced after the earlier A123 results and must be included in any continuation.

Goal: compare a **type-blind generic compatibility predicate** based on resource conflict / event ordering / even-release structure against the accepted Allis compatibility table, while keeping the Allis table as oracle and proof authority.

Forms:

### V1 — invalid harness

`U1-ALLIS-COMPAT-V1-INVALID`

The first harness computed claim descriptors but omitted them from the returned descriptor structure. It failed before producing candidate evidence. Preserve as harness evidence only.

### V2 — strict generic overlap exclusion

`U1-ALLIS-COMPAT-V2-STRICT`

- **695,232** pair comparisons;
- **10,938 false negatives**;
- every false negative localized to A5/A6 paired with A1 at the claim/inverse boundary-sharing seam.

This was a useful falsification: blanket overlap exclusion was too strict.

### V3 — event-interval claim/inverse boundary sharing

`U1-ALLIS-COMPAT-V3`

- **695,232** rule-pair comparisons;
- all **359,512 Allis-table-allowed pairs** accepted;
- **zero false negatives** against the Allis allowed set;
- **82,367 additional generic overlap pairs** also accepted by the type-blind predicate.

Critical authority boundary: those 82,367 generic-extra pairs are **diagnostic only**. Their soundness is not established. They must not authorize A10 proof composition. Conservative Allis section 7.4 compatibility remains proof authority until the extras receive an independent proof or exact exhaustive qualification.

This is promising because U1 removed all sampled false negatives without hard-coded rule-type exceptions, but the extra-acceptance soundness problem remains the next mathematical boundary.

## ZPAR / exact parity-Zugzwang program

ZPAR was selected by the promotion-blind scheduler as a high-upside, genuinely unqualified stage-2 candidate. The current work is intentionally conservative and does **not** grant broad terminalization authority.

Qualified form: `ZPAR-SINGLETON-PAIR-V1`.

Evidence:

- `zpar_single_threat_exact.mjs`: **112** qualified exact 7x6 states across four observed singleton-threat classes and mirrors, zero mismatches. Harness grants no pruning authority beyond the tested predicate.
- `zpar_black_odd_census.mjs`: targeted **2.16M-state** census found five `WE_BO_diff` classifiable cases; all were exact draws as predicted.
- `zpar_black_odd_structure.mjs`: **1.44M-state** structural census found 7,928 both-singleton Black-odd states and 3,441 White-odd/Black-odd pairs, but **zero** full different-column `WO_BO_diff` cases.

Current limitation:

- authority remains restricted to sampled classes where each player has exactly one nonplayable singleton residual and no other surviving winning requirement;
- `WO_BO_diff` remains unresolved/non-authoritative;
- absence in the census is not an impossibility proof.

Do not inflate this into a general parity terminalizer.

## IMPL / support-compatible implication proof reuse

The underlying dominance relation remains semantically attractive and repeatedly reduces proof work, but its current runtime forms are expensive.

Baseline exact frontier idea: for the same support/rank bucket, reuse solved bounds when one residual requirement state dominates another under the exact support-compatible relation.

RID-native closure retest preserves the old dominance hits/proof reductions while making implication tests cheaper.

`IMPL-RID-SIG4`:

- four conservative 32-bit rejection signatures;
- exact RID closure remains authority;
- preserves score, expanded-state counts, dominance hits and retained frontier;
- on 4x5 rejects **84.64%** of full exact closure checks;
- roughly **1.23x** faster than unfiltered closure in that run;
- still slower than no-IMPL baseline.

`IMPL-RID-INDEX8`:

- conservative 8-bit support-local grouping plus SIG4 + exact RID closure;
- preserves exact frontier/proof work;
- on 4x5 cuts candidate visits about **24.2%**;
- improves wall about **1.07x vs raw closure / 1.09x vs signature-only** there;
- still far slower than no-IMPL baseline.

Do not reject IMPL globally. The next meaningful test is **marginal value on the current strong-distance solver after the semantic state, typed interning and A123 have erased a large fraction of the tree**. If its marginal proof reduction is saturated there, further frontier-index engineering becomes low priority. If it remains large, a stronger two-sided index is justified.

Any strong-distance IMPL transfer must preserve alpha-beta bound direction. Do not treat null-window returns as exact values:

- lower bounds may transfer from dominated states in the appropriate direction;
- upper bounds may transfer from dominating states;
- cutoff results and completed fail-low results must retain correct bound type.

## Candidate scheduler state

At the harvested campaign head, the promotion-blind scheduler reports **31 projected/unobserved signed edges**.

Earliest/high-confidence outstanding categories include:

- obvious tactical saturation: `DTH/IWIN -> FMAC/E1`;
- draw/no-win saturation: `BEXH -> CARD/SEWB/AUTO/E1/YBWC`, `EXH -> CARD/E1`;
- ZPAR enablement: `SUP/INC/RWS/RID/E2 -> ZPAR`;
- richer A10 enablement/certificate supply: `SUP/INC/A4/A5/A8/A7/A6/A9/ZPAR -> A10`;
- A10/EXH/ZPAR downstream ordering saturation once proof propositions close.

The scheduler is useful for preventing promoted candidates from disappearing, but it is not a command to spend equal effort on trivial structural saturation edges. Cheap structural edges can be closed/documented in batches. Expensive experiment time should prioritize genuinely uncertain high-value interactions.

## Recommended next seam after this handoff

The current best serial semantic proof stack has not yet fully combined all newly qualified runtime forms in one exact-distance benchmark. The highest-leverage immediate unit is:

1. **Compose `MQ5-TYPED-OPENADDR-V1` with `A123-GEOMETRY-U1U2-V4` on the two frozen MQ5 anchors.**
   - Preserve score, proof-node behavior expected from A123, TT authority, and full-record identity checks.
   - Compare against typed-MQ5 without A123 and Map-MQ5+A123 controls where practical.
   - This tests whether the typed runtime speedup and A123 proof reduction are additive rather than assuming they are.
2. Then test **IMPL marginal value on top of the typed+A123 exact-distance stack**, with multiple bounded frontier capacities/forms and correct lower/upper-bound authority.
3. Continue **U1 Test B** by trying to prove/falsify the 82,367 V3 generic-extra compatibility pairs. Until then, conservative Allis compatibility stays authority.
4. Continue richer A10 in the evidence-driven order suggested by coverage and scheduler—especially A4/A5/A8—without granting raw coverage proof authority.
5. Continue ZPAR conservatively; resolve the missing `WO_BO_diff` class or formally show why it cannot occur under the qualified predicate before widening authority.
6. After the serial semantic/proof kernel stabilizes, revisit TT/proof-memory candidates (`CTT/RANK/PH/CAP/CPR`) and only then multicore/shared-TT/YBWC scheduling.

## CUDA-BSFP lane — preserve separation

CUDA-BSFP remains a separate exact solver lane and should not be mixed into minimax composition work.

Current canonical CUDA-BSFP head: `5397e9c538ef5929b4ddf8bd173d5bf9f91e65cb`.

Qualified milestone sequence already includes P1/B1/C1/O1/O2/O3. O3 established exact residual-pair factorization/reuse and occurrence mapping on a bounded 7x6 cut, including the large measured device-memory and submit/wait reduction. It did **not** complete dense next-pair/state ID generation or full device-resident layer chaining.

Current CUDA-BSFP seam remains:

- accepted checked scan/select contract from CUDA-Algorithms issue #9;
- exact residual ordering/group boundaries with collision-safe equality;
- variable record compaction;
- dense next pair/state IDs;
- next OQS layer chaining without host semantic progression.

Only open repository PR at harvest is draft PR #25 for this CUDA-BSFP lane.

## Final research interpretation

The strongest structural story from this context window is now:

`optimized board-state alpha-beta`

`-> exact semantic residual state (about 21–22% less proof work)`

`-> WSL-625 fixed residual IDs`

`-> typed exact open-address identity (about 1.49–1.57x faster than Map/BigInt MQ5 at identical proof tree)`

`-> geometry-native A1–A3 strategic certificate (about 23.6–29.1% less remaining MQ5 proof work on the two exact-distance anchors)`.

These are not yet one fully qualified combined production solver. That exact composition is the immediate next seam.

The campaign's central lesson remains: **mechanism, implementation form, workload regime, stage order, and synergy are separate dimensions**. Preserve all of them in the candidate map; do not collapse the research into a single winner score.