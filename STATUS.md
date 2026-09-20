# Connect4 Isometric implementation status

**Updated:** 2026-09-19  
**Branch:** `solver/isometric`  
**Solver family:** Isometric  
**Research direction / structural architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

This branch is an **implementation lane**. All durable research authority—including structural derivations, theorem development, hypotheses, research experiments/results, falsifiers, negative results, and research evidence—belongs on `research/semantic-quotient`.

The Isometric solver consumes canonical research; it does not own a separate research corpus.

## Solver-family boundary

Isometric is the active forward structural solver family governed by C4-0011. CUDA-BSFP is the active backward solver and SUT is their future composition lane. Minimax/Negamax and Hybrid Confluence are historical lineages.

Historical descent from the terminal-frontier experiment does not make Negamax semantics or branch ownership authoritative here.

## NEES hot-loop conformance — 2026-09-19

The IsoMax hot loop now has an explicit extreme-performance realization contract:

`components/isometric/NEES_PROFILE.md`

Pinned standard:

`iteathen/NEES@3a78310a3ba14fb3acb4046c8dffd396209c213c` — Draft 0.3.

Current scope:

- E0 recursive ordinary-value kernel: **NEES-EXTREME required**;
- E1 native transition/cache/apply/undo path: **NEES-EXTREME required**;
- E2 scheduled control and any future branch/claim/reconciliation hot path: **NEES-EXTREME at that cadence**;
- E3 task/worker/manager orchestration may retain richer objects/Promises/messages while it remains outside the hot cadence;
- COLD preparation/reporting remains outside hot-loop restrictions.

NEES has no gameplay-authority effect. C4-0011 and canonical Connect4/IsoGraph research still define what is true.

The first implementation alignment preserves native forced-cell provenance: a unique playable forced cell established by `nativeFrontierCode` now bypasses the certificate-facing cell validator, while certificate-origin forced cells remain fully checked.

Conformance record: `components/isometric/NEES_CONFORMANCE.md`. The completed Draft 0.2 audit remains inherited evidence; the Draft 0.3 full E0-E2 baseline is now recorded in `components/isometric/NEES_BASELINE_0_3.md`, with explicit unresolved optimization debt. The active ordinary native worker profile is declared conformant at E0/E1/E2; optional certificate/RBA synchronous consumers require a separate E0 conformance decision before any hot-worker promotion. Current Branch Manager orchestration remains E3 only while amortized at the existing coarse task quantum.

Qualification follows NEES cadence: one coherent PR/change set is the default qualification unit. Full correctness/performance/JIT qualification is not rerun after every optimized line.

## Research-coupled update readiness — 2026-09-19

The native worker hot-loop restoration removes per-node frontier objects and
empty-certificate materialization, seals search storage before each quantum,
and packages continuations only after recursive unwind. Periodic performance
reporting runs in a separate worker. Manager q keys are numeric. Qualification
and paired timing evidence: `benchmarks/isomax-workers/HOT-LOOP.md`.
These changes preserve the reinstated Branch Manager and exact native ordering;
they do not claim optimal assembly generation or eliminate all V8/runtime work.

The subsequent issue campaign extends owner-protected comments through 72
transitive callees and qualifies scalar q reuse, a fixed 64K transition prefix,
preloaded masks, flat ordering incidence, direct singleton metadata, bounded
busy-task retirement, preparation amortization and V8 boxing/context repairs.
At `a34743cd`, 112 tests pass; serial/one/four-worker medians improve
2379.87/2761.83/2429.99 ms to 1709.77/2052.99/1779.85 ms on three synthetic
18-ply roots. This is not Begin-Hard or an empty-board solve. Four workers still
perform substantially more work than serial; exact portable reuse remains #78.
The normal 30-second empty-root check times out with no WDL and complete cleanup.
Measured tradeoffs, rejected candidates, issue dispositions and reproduction:
`benchmarks/isomax-workers/ISSUE-CAMPAIGN.md`.

The updated-spec implementation pass is qualified. Details and reproducible
measurements: `docs/decisions/2026-09-19-isomax-issue-qualification.md`.

Stable execution boundary:

```text
q-native gameplay state
  -> exact transition cache
  -> native frontier consequences
  -> guarded proof/certificate consequences
  -> qualified q/RBA ordinary-value closure when available
  -> recursive exact W/D/L fallback/control
```

The alignment decision is:

- `docs/decisions/2026-09-19-isomax-rba-update-alignment.md`.

Current game-theory authority is Connect4 logic authority 1.2 at canonical
research `21cfe24af925a2eceaadccac494cacc87b0faf6f`, manifest blob
`5f401c93f8ea653fd3bc96e386b08ef7d92c519e`. Authority 1.1 and the old overlays
remain immutable historical evidence. Qualified q_o congruence and q_r reflection
transport are integrated with ordinary-value RBA relations; support-local
isotony/frontier qualification and C4-R0076 remain separate open obligations.
A consumer still pins its actual producer/evidence revision and rechecks live
canonical research before meaningful implementation changes.

The guarded-obligation/proof-value bridge remains a separate stronger proof/certificate seam. It does not block an independently exact ordinary-value RBA consumer.

## Current implementation

The latest alignment campaign retains support-first q canonicalization with its
matching action transporter, ordering-word reuse, signed hash carriage with an
explicit unsigned class-equality boundary, compact ordinary WDL cache storage,
and bounded rank3 admission at four workers. Manager telemetry now distinguishes
entered calls, expansion entries and transition attempts without new hot work.
125 relevant tests pass. Against 11f3ec61, median completed three-root times are
1717.79 -> 1406.73 ms serial, 2077.26 -> 1751.80 ms one worker, and
1798.25 -> 1497.66 ms four workers. The independent 96-root rank-cut comparison
reduces expansion entries 3.65% and time 3.12%. These are synthetic corpora,
not Begin-Hard or an empty-board solve.

Final 30-second empty-root qualification `20260920T055749673Z-isomax` reaches
the existing 29-second internal deadline: 107,980,863 settled calls, 48,082,766
expansion entries, root WDL unknown, peak RSS 1,074,970,624 bytes, owned workers
terminated. The earlier peak was lower; more calls before timeout do not prove
less remaining work or a faster eventual solve. No limit was increased.

Issues #89/#96/#97/#99/#101 have qualified implementations; #87/#90-95/#98/#100
have explicit scoped no-promotion dispositions. #78/#102 remain unimplemented
sharing/scheduler work, #83 lacks its shared completed-artifact producer contract,
and #67 retains its open canonical proof law. No claim that every issue is solved.
Detailed evidence and rejected variants: `benchmarks/isomax-workers/ISSUE-CAMPAIGN.md`.

Native Branch Manager/worker execution is reintegrated. The standard
`bench:isomax:performance` command now starts a bounded native worker pool
and reports queue, active-worker, split/exact-task and cleanup telemetry.
The default is up to four workers with an explicit configurable count.
Workers use packed IsoMax; the old quotient solver is not invoked.

The initial integration lost continuation work and recycled caches too eagerly;
both were repaired before final qualification. On three expensive synthetic
roots, four-worker median latency was 2507 ms versus serial 2533 ms (overlapping
ranges; no broad speedup claim). Fifteen workers were much worse at 8143 ms.
Private recursive caches and redundant speculative proof remain scaling limits.
See `components/isometric/execution/README.md` and
`benchmarks/isomax-workers/`. This is operational reintegration, not proof of
full-core efficiency or an empty-board solve.

The maintained implementation uses native Isometric/WSL state and exact recursive resolution for residue not closed by structural consequences.

### IsoGraph / q alignment

The current implementation is already substantially aligned with the newer canonical research:

~~~text
ordinary gameplay identity:
    q = support + normalized P0 residuals + normalized P1 residuals

current exact-value cache equality:
    canonical P0 residual class
    + canonical P1 residual class
    + canonical support
~~~

`gameplayKey()` exposes exactly this triple; transport is separate and the cache
enforces residual-pool ownership. Full-field comparison remains mandatory.

Stored `ply`, `sideToMove`, terminal status, support/playable masks and reversible history remain useful runtime fields. They are not all irreducible gameplay-identity coordinates.

Coarse WSL certificate buckets are also intentionally not transition identity: they locate candidate certificates, and guards establish contextual applicability.

Completed implementation scope:

1. explicit pool-bound q keys and separate reflection transport (#64);
2. immutable canonical proof payload binding and collision rejection (#65);
3. deliberate physical q-collision and cross-profile controls (#66);
4. optional bounded RBA value closure before forced/recursive fallback (#70);
5. recursive exception restoration and rejection of contradictory no-win bounds.

The RBA consumer remains opt-in: one late root avoids 35 recursive children and
7 forced transitions, but roughly 6.43 ms construction outweighs the 0.086 ms
recursive control. A faster warm query alone does not justify promotion.
Temporal/resource/realizability proof guards and guarded obligation birth (#67)
remain deferred pending qualified canonical proof semantics. Unresolved stays
unresolved; ordinary value is not a proof premise.

See `docs/decisions/2026-09-18-isometric-isograph-realignment.md`.



Current accepted implementation properties include:

- exact first-win stopping;
- exact mover/opponent residual cofactor updates;
- bilateral residual exhaustion as draw;
- exact immediate-win / forced-reply / double-threat frontier consequences;
- guarded certificate consumption;
- stronger transition identity than coarse WSL retrieval identity;
- recursive fixed-P0 W/D/L backup for unresolved residue;
- native playable-singleton effect ordering below the root, with opponent-exposure veto;
- optional bounded ordinary-value membership before forced/recursive fallback;
- recursive state restoration on downstream errors;
- fail-closed contradictory exact/no-win certificate handling.

The previously tested opponent-residual-suppression first-child tier remains rejected for the tested placement because it improved one paired fixture while materially worsening the independent calibration corpus.

The qualified singleton-effect method is now the default native recursive move
order. Root tie selection stays center-first. It consumes the existing WSL
carrier directly; no speculative child or legacy board is created. The paired
96-root evidence showed 26.43% fewer nodes and 17.55% less aggregate median
time, with a small overlapping timing regression on one subset. See
`benchmarks/isomax-ordering/README.md` for qualification and reproduction.

## Research dependency

Canonical research authority:

`research/semantic-quotient`

The guarded mixed-owner cofactor obligation theorem, structural calculus, selector/value questions, and other open research seams live there. This solver branch may consume only the currently qualified research result/guard surface.

Historical `docs/research/**` and inherited `research/**` files on this branch are provenance or implementation-experiment records, not current research ownership.

## Current implementation seam

Maintain and qualify the native Isometric solver against canonical research contracts while improving implementation consumers only when the consumed research guard/consequence is already established.

Remaining assessment areas:

1. temporal/resource/realizability guard implementation after research qualification;
2. actual repeated-query economics before promoting optional RBA closure;
3. transition/certificate cache economics and native transition efficiency.

No new theorem, hypothesis, research result, or research evidence should be authored as durable authority on this branch. Such work goes to canonical research first.

## Qualification

The Isometric native WSL workflow targets `solver/isometric` and qualifies
domain/native WSL plus shared RBA controls under Node 26.7.0. The final local
suite covers domain, Isometric (including native ordering) and RBA. Bounded controls do not prove a
universal quotient theorem, complete proof calculus, or empty-board performance.

## Routing

- all research -> `research/semantic-quotient`
- Isometric implementation/contracts/qualification -> `solver/isometric`
- shared accepted product/domain changes -> `main`

See `ISOMETRIC_BRANCH.md`, C4-0011, and `docs/decisions/2026-09-17-single-research-owner.md`.
