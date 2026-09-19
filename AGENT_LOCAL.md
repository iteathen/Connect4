# Repository context: Connect4

Universal engineering and design guidance comes from the account-global `AGENTS.md`.

## Crash-safe runner checkpoint discipline

Runner and long-form execution tasks must assume the chat/tool transport can disconnect at any time. Durable progress is part of normal execution, not cleanup at the end.

Required behavior:

- **Never accumulate more than one meaningful unsaved research or implementation step.** A new exact result, falsifier, negative result, algorithmic observation, changed hypothesis, selected control, new wall, or completed qualification unit must be written to the correct durable owner promptly.
- **Checkpoint before any long, bounded, expensive, or multi-stage run.** Persist the live branch/head, target, harness/source needed to reproduce the run, inputs/configuration, and the exact question/falsifier being tested before launching it.
- **Make expensive runs resumable by default.** Persist monotone cache/progress state incrementally when recomputation would be material. Do not rely on `/tmp`, process memory, chat context, or an uncommitted generated artifact as the only copy.
- **Checkpoint immediately after a meaningful phase completes**, even when a larger campaign is still running. Do not wait for the whole campaign, full boundary, full benchmark matrix, or final interpretation.
- **Persist negative evidence too.** Timeouts, rejected approaches, mismatches, unexpected bottlenecks, and localized walls are durable research/engineering results when they change the next action.
- **Before switching algorithms or hypotheses, save the evidence that justified the switch.** The prior path must remain reconstructable after a disconnect.
- **Before a run likely to cross a connection boundary, persist the executable harness or exact reconstruction recipe first.** Transient prototypes may remain transient only when their complete semantics and recovery seam are already durable.
- **On reconnect, re-fetch the live branch and latest durable checkpoint before doing new work.** Preserve any newer valid work. Do not reconstruct from an older chat checkpoint when the repository has advanced.
- **If a write or publish call disconnects, treat mutation as uncertain.** Re-fetch the live ref/file before retrying; never assume the write failed or succeeded.
- **Chat updates are not checkpoints.** The sole durable copy of a result must not exist only in conversation text.
- Route the checkpoint to the correct owner: canonical research results to `research/semantic-quotient`; solver implementation/contracts/qualification to their durable solver branch; shared accepted product changes through the repository's normal authority path.

The default bias is toward many small durable checkpoints. Consolidation can happen later; lost research cannot.


## Single research owner

All durable Connect4 research is owned by `research/semantic-quotient`, regardless of which solver exposed it. This includes derivations, hypotheses, research experiments/results, falsifiers, negative results, research evidence, open questions, synthesis, maps, and provenance.

This branch owns implementation, implementation contracts/status, qualification/reproduction machinery, and implementation-local qualification evidence—not a separate research corpus. Solver-local or historical paths named `research/` or `docs/research/` are source/provenance or implementation-experiment material unless and until their durable research meaning is integrated into canonical research. Do not add new durable research here.

See `docs/decisions/2026-09-17-single-research-owner.md`.

## Current durable topology authority

This branch is the **durable active CUDA-BSFP solver head** under `docs/decisions/2026-09-18-three-active-solver-topology.md`.

The durable set is closed. Do not create or promote another continuity branch without explicit owner instruction. Any `work/*`, `experiment/*`, noncanonical `research/*`, `feature/*`, handoff, staging or evidence ref created from this lane must name this or another durable owner, preserve useful results back to that owner or an immutable archive, and retire when its bounded purpose ends.

## Mission and ownership

Connect4 is an independent Node benchmark/validation product and exact-solver laboratory for Connect Four. It owns Connect Four domain semantics, the custom evaluator and conformance vectors, solved-game oracle evidence, benchmark positions/budgets/fairness/metrics/evidence, BSFP qualification semantics/evidence, and product composition of public CUDA libraries.

The repository currently contains two deliberately separate solver lanes:

- `components/incumbent/` on `main` is a retained minimax/alpha-beta reference baseline; Minimax is historical rather than an active solver-family owner.
- `components/bsfp/` owns Connect4 CUDA-BSFP consumer semantics: backward symbolic fixed-point proof-state meaning, Connect4-specific derivation/terminal/proof rules, and composition of generic GPU-algorithm capabilities.
- `solver/isometric` owns the active forward structural exact solver; `solver/sut` is retained for future exact composition of the two active solver capabilities.

Do not make BSFP a specialization of the incumbent search component, and do not import minimax/alpha-beta/search lifecycle semantics into BSFP merely because both solve the same game.

CUDA-Algorithms owns reusable provider-neutral GPU parallel-algorithm semantics. CUDA-MCGS owns generic search/evaluator/resource/session semantics. CUDA-JS-Tensor owns generic Tensor semantics. CUDA-JS owns CUDA runtime/compiler/memory/provider/lifecycle mechanisms.

## Local routing

- `STATUS.md` and `next_step.yaml` — current product/workstream state.
- `docs/decisions/2026-09-18-bsfp-isograph-realignment.md` — identity/proof-context alignment after IsoGraph/NEI discovery; P2 remains exact but is a finer representation than q.
- `docs/decisions/2026-09-19-bsfp-rba-update-alignment.md` — current update-pass alignment: ordinary W/D/L may use a boundary-native q/RBA realization without closing the NDC proof/value side seam; P2 remains the exact baseline.
- C4-0001 through C4-0005 — protected baseline domain/incumbent/benchmark/oracle authority within their stated scopes.
- `docs/specs/C4-0006-control-parity-and-winspace-v1.md` — CPC + WSL-625 structural/domain mathematics for the BSFP lane.
- `docs/specs/C4-0007-nested-dependency-closure-v1.md` — NDC dependency/certificate/fixed-point proof semantics.
- `docs/specs/C4-0008-bsfp-exact-solver-v1.md` — exact BSFP W/D/L solver semantics, terminal axioms and result meaning.
- `docs/specs/C4-0009-bsfp-cuda-execution-profile-v1.md` — CUDA-BSFP consumer projection, CUDA-Algorithms/CUDA-JS seam, GPU/Node boundary and physical qualification gate.
- `docs/specs/profiles/C4-0009-P1-4x3-cuda-bsfp-v0.md` — exact first 4x3 CUDA-BSFP qualification profile.
- `docs/specs/profiles/C4-0009-Q1-benchmark-qualification-v1.md` — benchmark qualifier, crash-safe evidence, timeout/VRAM safety and repository publication authority.
- `docs/evidence/cuda-bsfp/qualification/` — immutable Q1-generated report bundles; never rewrite a prior run into a different outcome.
- `docs/research/2026-09-09-*` plus associated evidence/prototypes — preserved research/provenance supporting C4-0006..0009; evidence is not stronger authority than the formal specs.
- `components/bsfp/` — BSFP consumer implementation and local proof semantics on BSFP work branches.
- `tools/cuda-bsfp-qualifier.mjs` and `tools/cuda-bsfp-qualifier/` — Connect4-owned outer qualification/reporting machinery; solver children must not own repository credentials/publication.
- `reference/legacy-source/` — provenance/source evidence only, not specification authority.

On a BSFP work branch, read **C4-0006 → C4-0007 → C4-0008 → C4-0009**, then the selected execution/qualification profile before implementing or changing CUDA-BSFP.

## Local constraints

Maintained source is JavaScript/Node.js plus product Device-JS through public CUDA contracts. No Python, direct CUDA FFI, C/C++/CUDA C++, hand PTX, or native-addon escape path. Benchmark correctness/fairness semantics remain Connect4-owned.

BSFP may consume CUDA-Algorithms only through its public consumer-neutral contracts; generic workset/closure/sequence mechanics must not be copied downstream into Connect4. Conversely, CPC/WSL-625/NDC/WDL semantics, exact BSFP equality/dominance, existential/universal proof reduction and semantic rank completion must not move into CUDA-Algorithms.

After the 2026-09-18 IsoGraph/NEI realignment, distinguish three identity layers in BSFP work:

```text
ordinary gameplay identity = q
representation identity    = exact profile-specific symbolic/physical record
proof identity             = q + proof profile + every required non-q premise
```

P2 ownership masks/frontiers are a valid finer representation, not the canonical ordinary gameplay identity. q-level SAME does not authorize reuse of blocker/resource/deadline/race/NDC facts that are not derivable from q.

For the post-P2 update pass, distinguish ordinary value evaluation from stronger proof closure:

```text
ordinary W/D/L:
    C4-0008 exact Bellman semantics
    candidate q/RBA boundary-native realization

stronger proof/certificate facts:
    optional C4-0007 NDC ProofKey context
```

The RBA successor research on `research/semantic-quotient` is post-1.1 evidence, not frozen authority. Pin the exact research revision consumed, qualify it against retained P2/reference controls, and do not copy durable research ownership into this solver branch. C4-R0043/C4-R0069/C4-R0076 and guarded obligation birth remain a proof/certificate side seam; they do not block an ordinary W/D/L update profile.

Generic ranked activation is not by itself BSFP W/D/L evaluation. A lower-rank BSFP target is authoritative only after the complete required higher-rank contribution set has been accounted for and consumer-owned semantic reduction has finalized it.

Q1 qualification is fail-closed for GPU memory: no GPU case may launch without both a profile-owned finite upper memory bound and current free-VRAM telemetry. Timeouts, memory-safety refusals/aborts, crashes and unsupported geometries must remain visible in evidence. Official qualifier runs publish append-only evidence through a dedicated branch/PR; never push generated reports directly to protected `main` and never pass repository tokens into solver children.

Resolved machine-specific filesystem paths are private runtime data unless the resolved path itself is a deliberately protected Git-controlled location whose disclosure is part of the protected repository contract. Never commit, publish, preserve in repository evidence, emit into durable GitHub logs/reports, or include in PR/issue/review text the actual resolved value of an ordinary local checkout, workspace, home, temporary, cache, executable, or similar machine-specific path. Portable path expressions and abstractions are allowed and encouraged: repository-relative paths, `${{ runner.temp }}`, environment-variable references, `process.cwd()`, `os.tmpdir()`, `path.resolve(...)`, logical component names, and synthetic path fixtures do not disclose the machine path by themselves. A resolved path may survive only when it points to an explicitly protected Git location and exposing that exact protected location is intentional; otherwise sanitize subprocess output, exception/stack text, and generated reports before they cross a repository or GitHub publication boundary so only the expression/logical form or an explicit redacted placeholder survives.
