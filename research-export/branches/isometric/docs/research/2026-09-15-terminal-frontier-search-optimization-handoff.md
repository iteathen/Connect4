# Terminal-frontier / structural-search optimization handoff

**Date:** 2026-09-15  
**Repository:** `iteathen/Connect4`  
**Active experimental branch:** `research/terminal-frontier-horizon-exact`  
**Draft PR:** #45 — `research: exact decisive frontier before horizon evaluation`  
**Research direction / structural architecture:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

> This is an execution handoff. Preserve valid work and continue from the current seam. Do not restart the solver investigation from zero.

## 0. Critical continuity rule

Before mutating code in a fresh context, read:

1. [`2026-09-15-cross-layer-logic-code-synthesis-protocol.md`](2026-09-15-cross-layer-logic-code-synthesis-protocol.md);
2. `docs/research/RESEARCH_INDEX.md` and the primary logic stack it routes;
3. the relevant code/performance research notes;
4. **every line of the live search implementation and directly owned transition/evaluator/TT/ordering/Branch Manager code**.

The productive work in this campaign only began after logic research, code research, and live implementation were loaded simultaneously and structural isomorphs were sought between them.

Do not reduce this to generic Negamax optimization advice.

---

## 1. Live repository state at handoff

PR #45 is a **draft semantic research experiment** on top of `research/frontier-negamax-conformance`.

At the moment this handoff is being written:

- PR #45 code checkpoint before handoff documentation: `329b74e6a7b8a2196c21c09bdeb5d3a8bee067c1` — `perf: localize terminal frontier transition state`;
- the branch then received the synthesis-protocol documentation commit `491498c3ca1524b4f8631a8addf9ad5f31a98843`;
- this handoff commit will advance branch head again;
- base branch checkpoint used by PR #45: `research/frontier-negamax-conformance` at `9bf620adaf5586b5f44cdaf4f6565d57928c8592` when PR metadata was last checked.

**Do not assume any SHA above is still branch head. Re-fetch branch/PR state first and preserve newer valid work.**

PR #45 depends conceptually on the behavior-preserving terminal-frontier work developed in PR #44. Do not conflate the two campaigns.

---

## 2. Governing process / proof discipline

Use the cycle:

```text
assess -> research -> reassess -> plan -> execute -> qualify -> review -> cleanup/document
```

Treat prior conclusions, PR/issue text, CI, benchmarks, historical code, solved labels, and this handoff as **evidence, not authority**.

Repository is pre-alpha:

- no legacy compatibility burden;
- no compatibility aliases merely to preserve old names;
- no frozen heuristic numbers merely because an older engine emitted them;
- proven semantic defects are corrected and stale tests are replaced by current conformance/qualification evidence.

Proof boundaries remain strict:

- unknown != loss;
- absence of certificate != opposite certificate;
- theorem failure != theorem negation;
- finite solved-data agreement != theorem;
- DB labels are discovery/falsification only;
- no hidden minimax/search result inside a claimed symbolic proof;
- same dimension != natural isomorphism;
- algebraic cofactor commutation != temporal/first-win commutation without guards.

---

## 3. Why the earlier redesign premise was retired

An earlier discussion accidentally inspected the wrong board-backed Negamax and concluded the search architecture was poor. After the correct implementation/research lineage was read, that premise was discarded.

The actual forward architecture already contains good ideas that should not be casually redesigned away:

- semantic/residual-native state work;
- transition-time terminal consequences;
- exact WDL/proof intervals in frontier-native research;
- TT/proof reuse;
- forced-response handling;
- structural bounds;
- work-DAG/Branch Manager research;
- direct semantic edge reuse in the quotient line.

Current strategy is to make fewer unresolved states require expensive generic search by compiling/reusing exact structural facts — **not** to replace Negamax merely because Negamax exists.

Reflection/symmetry canonicalization is parked unless future profiling shows materially duplicated reflected work.

---

## 4. Accepted behavior-preserving terminal-frontier result

The first major campaign moved terminal/tactical/evaluator work onto an exact incremental first-order line/residual frontier.

Key runtime state introduced/used in the incumbent `PrimitivePosition` family:

- packed per-line owner counts (`lineState`);
- per-line empty-cell XOR (`lineEmptyXor`);
- per-cell singleton residual references (`singletonRefs0`, `singletonRefs1`);
- per-ply terminal winner cache (`winnerByPly`).

The important architecture lesson:

> Maintain stable **first-order** structural facts once at the transition boundary, then let hot consumers derive cheap **second-order** consequences. Do not automatically materialize every exact derived aggregate.

### Performance qualification

Accepted behavior-preserving checkpoint:

`6da8d00e607e860cce7a32628c07d4e98de91e0c`

Same-runner Node 26.7.0 comparisons against the untouched solver showed roughly:

- ~40–42% lower fixed-workload elapsed time;
- ~1.68x persistent speedup;
- ~1.74x reset-root speedup;
- wall-clock reach improved by roughly one ply on the benchmark fixture;
- decisions/checksum, node counts, evaluator calls, tactical counts, TT counts, and alpha-beta cutoffs remained behavior-identical in that campaign.

Important causal sequence:

1. **maintenance-only frontier initially lost ~14–16%**;
2. consuming it for terminal/tactical queries turned it into a major win;
3. reusing it in the horizon evaluator produced another large gain;
4. an attempted second-order playable-threat aggregate did not justify its complexity;
5. replacing that aggregate with a fused read over first-order state produced another ~6–8% improvement over the already-optimized frontier.

This is the concrete example behind the user rule:

> A performance loss means diagnose/rework the solution before giving up on a structurally sound idea.

---

## 5. Dead-residual draw experiment

The theorem remains exact:

If neither player has any surviving unblocked four-line residual in a nonterminal state, no future play can produce a Connect4, so the result is draw.

A maintenance/instrumentation experiment counted first entries into that region.

Measured workload result through depth 14:

- **0 early dead-draw entries** in the exercised persistent/reset workloads and depth sweep;
- maintaining dedicated live-residual counters cost roughly 5–6% at deeper depths.

Classification:

> **Exact theorem, deferred runtime mechanism.**

Do not call it false. Do not pay permanent hot-loop cost until profiling or a cheaper representation makes it useful.

---

## 6. Semantic horizon correction (PR #45)

PR #45 intentionally changes semantics rather than preserving historical behavior.

At a depth horizon, before heuristic evaluation, certify only currently proven decisive classes:

- current player has a playable singleton residual -> exact win at physical terminal distance `+1` ply;
- opponent has at least two **distinct playable completion cells** -> exact forced loss at physical terminal distance `+2` plies;
- otherwise use the heuristic evaluator.

The ordinary non-horizon double-threat shortcut was corrected to the same `+2`-ply physical distance. The old `+1` distance was a semantic defect.

Unique forced block remains unresolved by itself; it is not an exact value certificate.

Historical self-play/frozen heuristic-score expectations were removed/reworked where they only encoded old behavior.

### Strength evidence

Independent solved/deeper qualification supported the change strongly:

- 128-position calibration corpus, depth 1 optimal moves: **111 -> 118 / 128**;
- beginning spot-check, depth 1: **27 -> 29 / 30** optimal;
- shallow calibration depths improved broadly;
- deeper/perfect region remained stable where already solved;
- horizon evaluator calls fell by roughly 3.2% persistent and 2.5% reset in the fixed benchmark because certified decisive leaves bypass evaluation.

Conclusion:

> Keep the stronger exact semantics. If runtime loses, optimize the implementation/search response to the better information; do not restore the weaker semantics merely for speed.

---

## 7. Singleton zero-gate subexperiment

A cheap-looking derived aggregate was tested:

```text
singletonLineCount0
singletonLineCount1
```

These count live residual **lines** of degree 1, not distinct playable completion cells. Their only exact use is as a zero/nonzero prefilter; nonzero counts do not themselves decide immediate wins/double threats.

### Maintenance-only

Maintaining the two scalars cost roughly 4–5% with search behavior unchanged.

### Consumed gate

Using the counts to skip singleton-cell scans when both are zero repaid much of the cost on the fixed depth-8 workload:

- about 4.4% faster persistent versus the exact-horizon semantic control on one paired run;
- about 2.2% faster reset;
- exact same search tree/counters/checksum.

But the deeper sweep was slightly worse (~1–3% around d12–d14).

### Placement correction

Commit `329b74e6a7b8a2196c21c09bdeb5d3a8bee067c1` localized mutable frontier arrays/scalars inside apply/undo loops and published the scalar counts once at the transition boundary instead of repeatedly reading/writing object properties.

Against the exact semantic control, the localized form was around break-even/noise depending on workload:

- fixed persistent ~1.4% faster;
- fixed reset ~1.7% slower;
- d12 ~0.7% faster;
- d13 ~1.8% faster;
- d14 ~2.1% slower.

Verification is green.

Current classification:

> The zero gate is exact and can be mildly useful, but it is **not a major lever**. Do not spend the next context micro-tuning these two counters unless new profiling says otherwise.

The more important lesson is that mutable transition facts should remain local until the transition boundary where possible.

---

## 8. Current live search shape at the handoff seam

The active incumbent search file on the code checkpoint `329b74e6...` does roughly:

1. increment node counter;
2. read exact cached `winner()`;
3. at horizon, use singleton-line zero gates + singleton-cell refs to detect exact immediate win / opponent double threat, else evaluate;
4. probe TT and recover score/bounds/best-move hint;
5. run the same exact tactical singleton classification at non-horizon nodes;
6. immediate win -> exact return/store;
7. opponent double threat -> exact +2-ply loss return/store;
8. unique forced block -> search only that move;
9. otherwise search TT move first, then remaining legal columns in static `profile.moveOrder`;
10. alpha-beta update/cutoff;
11. store TT result/best move.

The important observation immediately before handoff:

> **Ordinary unresolved move ordering is still essentially TT-best-move then static column order.**

The next campaign was about to investigate structural move ordering from transition effects. No move-order mutation had been made yet when the handoff was requested.

---

## 9. Next experiment: structural transition-effect ordering

Do **not** begin by inventing a weighted board heuristic.

The intended experiment is to ask what exact/advisory information the already-maintained residual frontier can provide for each candidate transition cheaply enough to improve ordering.

Candidate transition-effect facts include, in theorem tiers:

1. exact terminal successor;
2. exact decisive tactical consequence / certified forcing class;
3. creation/destruction of playable singleton residuals;
4. exact degree-2 -> degree-1 cofactor contraction;
5. opponent residual destruction/blocking;
6. own residual contraction / live-line incidence;
7. qualified control-potential / blocker / response-capacity consequences as those become cheaply compilable;
8. deterministic static tie-break.

Important distinctions:

- degree drop is exact algebra but **not automatically signed value**;
- claim-relative theorem/effect isomorphism can reuse an effect transformer without merging TT state;
- proven facts should dominate advisory proximity; do not flatten theorem tiers into an opaque weighted sum;
- ordering may use information that is not value-complete, but pruning/WDL may not.

Preferred implementation shape:

```text
native transition / precompiled incidence
          -> tiny effect facts or effect class
          -> ordering tier/key
```

Avoid:

```text
for every move:
    apply full move
    interpret whole state
    undo
    compute expensive heuristic
```

The research goal is to move classification/precomputation **out of the hot decision loop** where possible.

### Required controls

Before accepting ordering changes, record:

- same semantic result / solved-strength comparison;
- node-count change;
- cutoff change;
- TT hit/store/replacement change;
- elapsed time same-runner;
- per-depth wall-clock sweep;
- any maintenance-only cost if new transition metadata is introduced.

If ordering explores fewer nodes but is slower, diagnose effect-class computation/maintenance rather than immediately rejecting the ordering idea.

---

## 10. Other high-leverage targets after ordering

### Branch Manager / queue

Research already contains work estimates and fan-in-aware priority, while some backlog paths remain FIFO-like. The structural calculus suggests scheduling by **proof externality** rather than subtree size alone.

Potential exact/advisory signals:

- fan-in / waiting parents;
- current WDL interval width;
- certificate deficit (how many guards of an obligation theorem are already discharged);
- forced-chain length;
- deadline slack;
- response-resource pressure;
- whether completing the work discharges multiple parent obligations.

Do not treat scheduler priority as WDL authority.

### TT collisions / retention economics

Distinguish:

- true key alias (must never grant false authority; exact descriptor comparison protects this where implemented);
- bucket/probe cost;
- capacity/replacement eviction;
- cross-worker contention.

The important question is not merely collision count but **proof value lost when a useful entry is displaced**.

Investigate with existing telemetry where available:

- hash collisions;
- max bucket scan;
- replacements;
- exact vs non-exact victims;
- lock/proof-writer waits;
- reopened work after eviction;
- whether structured q keys distribute poorly into low bucket bits.

Possible later direction: packed retention classes based on proof strength + reuse leverage, but only if metadata cost is justified.

### Structural precompile / consequence plane

Longer-term target:

```text
static geometry + canonical residual vocabulary + theorem templates
                         |
                         v
                compact effect transforms
                         |
         native state + action -> effect facts
                         |
        terminal / ordering / TT / scheduler
```

This is the main cross-layer synergy direction.

---

## 11. Logic research that must stay mentally active

Do not read only the optimization notes. The useful structural material includes, at minimum, the current index routes for:

- total-domain incidence / `69 = 28 + 6 + 28 + 7` decomposition;
- third finite-difference / A4/quiver structure;
- CPC/control-potential unification;
- Z2 domain-wall and gravity-adapted normal form;
- safe phase/seam transfer;
- anchored-zero-edge residuals;
- affine + monotone blocker decomposition;
- response capacity / Hall closure;
- guarded affine-clause closure;
- claim-relative event isomorphism;
- dependency-cone product calculus;
- temporal response/resource calculus;
- guarded theorem composition;
- alternating fixed-point and WDL interval predecessor calculus;
- solved-DB collision work identifying the mixed-cofactor obligation seam;
- semantic quotient MQ1–MQ4;
- negative controls against GF(2)-only/value-by-degree/support-only shortcuts.

The 28-dimensional/common-middle work is useful as structural coordinates/effect classification, **not** as TT value identity unless a stronger continuation theorem is actually proved.

---

## 12. Current active proof seam remains separate from optimization

Repository-root `next_step.yaml` on the base research line routes the guarded mixed-cofactor obligation-birth derivation:

```text
MixedCofactorConsequence
+ AdmissibleSupport
+ UniversalInterventionStability
+ SharedResourceAccounting
+ FirstWinBeforeDeadline
-> CertifiedObligation
```

Optimization work may prepare runtime hooks/effect classes that could consume a future certified obligation, but it must not pretend the missing theorem is already solved.

---

## 13. Immediate next actions for the new context

1. Re-fetch PR #45 and active branch head; preserve newer work.
2. Read `2026-09-15-cross-layer-logic-code-synthesis-protocol.md` completely.
3. Read `RESEARCH_INDEX.md` and primary theorem notes, then code/performance research.
4. Read every line of the live incumbent search/position/evaluator/TT/profile code and any frontier-native/Branch Manager implementation being compared.
5. Reconstruct the accepted/marginal benchmark checkpoints above from CI if needed.
6. Assess structural move-ordering candidates by mapping theorem-side transitions to runtime incidence already maintained.
7. Design the **smallest attributable first experiment**; prefer instrumentation/maintenance-only separation where new metadata is required.
8. Qualify with same-runner Node 26.7.0 paired evidence and solved-strength evidence when semantics/order decisions change.
9. Persist results/rejections before context fills again.

Do not spend the next context re-arguing whether reflection is interesting, re-inspecting the wrong board-backed engine, or rebuilding the structural vocabulary from scratch if this package and the routed research are present.
