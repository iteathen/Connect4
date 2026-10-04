# C4-0011 — Solved-Knowledge-Independent Exact-Solver Benchmark Contract v1

**Status:** accepted benchmark-independence specification

## Purpose

This contract defines when a Connect Four benchmark may be described as independent of solved-game knowledge.

It supplements, rather than replaces, C4-0001 through C4-0010. In particular:

- C4-0001 owns the standard game semantics.
- C4-0004 owns the historical incumbent Node benchmark lanes, including its explicitly persistent cross-root TT experiment.
- C4-0005 owns solved-game oracle evidence and validation.
- C4-0011 owns clean-run solved-knowledge independence, admissible prior knowledge, pruning authority, cold-start requirements, theorem provenance, comparison targets, and benchmark reporting.

A C4-0004 persistent-TT experiment is not automatically a C4-0011 clean run. A benchmark must explicitly declare which contract/profile it is claiming.

The governing principle is:

> A solver may know the rules of Connect Four and generic ways to reason about those rules. It may not know the solution to the benchmarked Connect Four position before the benchmark starts. Position-specific information that contributes to an exact answer must be derived during the current run from admitted inputs or from an explicitly admitted structural theorem.

---

## 1. Game semantics

Unless a benchmark profile says otherwise, the game is standard Connect Four as defined by C4-0001:

- 7 columns by 6 rows, 42 cells;
- connect length 4;
- players 0 and 1 alternate, with player 0 moving first;
- a legal move selects a non-full column and gravity places the stone in its lowest empty cell;
- there are exactly 69 theoretical horizontal, vertical, rising-diagonal, and falling-diagonal four-cell winning lines;
- a player wins immediately when the newly placed stone completes at least one owned winning line;
- no move may follow a terminal position;
- a full non-winning board is a draw.

The side to move is determined by the number of stones/moves already accepted in the legal reachable position, not by an external label.

Any supplied move prefix must be a legal reachable sequence replayable from the empty board without a move after a terminal state.

External human-facing sequences may use one-based columns 1..7. Implementations may use zero-based columns 0..6. Evidence must state the convention.

---

## 2. Benchmark target must be declared before the run

The phrase “exact result” is not sufficient by itself. Every benchmark must declare one target class before execution.

### 2.1 Exact W/D/L root outcome

Return and prove the root result class under perfect opposition:

- WIN,
- DRAW, or
- LOSS.

This target does not require identifying every optimal root move unless separately requested.

### 2.2 One value-preserving root action

Return at least one legal root action whose child preserves the exact root W/D/L value.

This is weaker than returning the complete optimal-action set.

### 2.3 Complete W/D/L-preserving root action set

Return every legal root action that preserves the exact root W/D/L value and exclude every legal action that does not.

### 2.4 Strong score / remoteness target

Return an exact score under a named and frozen strong-score or remoteness convention. The scoring convention must be specified because faster-win/later-loss preferences are not identical to weak W/D/L optimality.

### 2.5 Other exact targets

A benchmark may define another exact target, but its semantics and success condition must be frozen before execution.

Two performance results are directly comparable only when their target semantics are the same or the difference is made explicit.

A proof certificate is required only when the declared benchmark profile requires a certificate-producing solver. Otherwise exactness may be established by the accepted solver semantics plus independent qualification. A heuristic move without exact proof authority is never an exact result.

---

## 3. Admitted initial knowledge

A clean run may begin with:

- board dimensions and connect length;
- turn order;
- gravity and legal-move rules;
- first-win and draw semantics;
- the benchmark starting position;
- the current ownership of occupied cells;
- the mechanically generated 69 winning lines;
- support/accessibility relations mechanically derived from the current board and rules;
- generic mathematics and algorithms;
- generic data structures;
- generic alpha-beta, negamax, fixed-point, transposition, symmetry, canonicalization, proof, parity, algebraic, or graph algorithms that do not embed solved answers for the benchmarked game.

Static game geometry may be generated at startup or loaded from a frozen rule-derived artifact. If loaded, its provenance/hash must show that it encodes game rules or geometry rather than solved-position information.

---

## 4. Forbidden solved/self-game knowledge

A clean run must not begin with information obtained by previously solving the same 7x6 game, the benchmark root, or relevant descendant positions.

Forbidden inputs include:

- opening books;
- solved-position databases;
- position-to-W/D/L tables;
- prior best-move labels;
- prior optimal-action sets;
- strong scores or remoteness values;
- solved subtrees or stored proof results for benchmark positions;
- persisted root bounds;
- warm TT entries from an earlier solve;
- persisted proof caches;
- perfect-play maps;
- oracle outputs;
- precomputed game-theoretic move-equivalence classes;
- root-specific or prefix-specific constants whose meaning is derived from solved play.

The prohibition is semantic, not file-format based. Re-encoding an answer does not make it admissible.

---

## 5. No derived answer leakage

Solved-game knowledge must not be transformed into a heuristic, threshold, mask, feature, ordering rule, pruning rule, stop condition, constant, partition, structural class, or theorem premise and then presented as if it had been derived only from the game rules.

Examples:

- The complete set of 69 winning lines is admissible because it follows mechanically from the 7x6/connect-4 geometry.
- A subset of winning lines selected because they occur in perfect play is not admissible unless the selection itself has an admitted rule-derived proof independent of solved-game labels.
- A table of “equivalent” moves learned from solved outcomes is forbidden even if stored only as compact class IDs.
- A numeric feature is forbidden when its constants were fitted against solved outcomes and then frozen into the solver for the clean benchmark.

An oracle-informed selector or ordering heuristic is not “rule-derived” merely because it performs no pruning. Its use must be disclosed and lineage-classified. It is forbidden in the strict `lineage-clean` lane, but may be used in the narrower `runtime-input-only` lane when it does not consume solved data at runtime and is listed in the benchmark declaration.

---

## 6. Symmetry and equivalence

Rule-derived symmetry is allowed.

For standard 7x6 Connect Four, horizontal reflection is a board automorphism derived from geometry, gravity, ownership relabeling rules, and winning-line incidence. A solver may exploit that symmetry without solved-game knowledge.

More generally, a canonicalizer may compute automorphisms mechanically from the declared game structure.

This does **not** authorize precomputed game-theoretic equivalence classes. Two moves or positions may be treated as equivalent for pruning only when their equivalence follows from an admitted exact symmetry/isomorphism/proof, not merely because an earlier solve found identical values.

---

## 7. Runtime structural selectors, including RLC

A runtime structural selector is admissible computation when it is evaluated from the current position and admitted rule-derived structure without reading solved data.

The current Rank-Local Landing Certificate (RLC) dependency audit is pinned to:

- path: `research/publications/2026-10-03/RANK_LOCAL_FIVE_PLY_CENTER_CERTIFICATE_0_3.md`
- commit: `02848960fb8d6a1e930778e9c6979f8007873526`
- blob: `df178a01b97744c719cff3622dc49ab878b356b2`

That pinned revision explicitly frames the five moves as **certificate self-play**, states that the result is a runtime/proof-input dependency result rather than a historically blind discovery claim, and does **not** claim that RLC selection proves game-theoretic optimality.

RLC computes its generic rule from current geometry. Its five-ply dependency audit establishes that its selections through the prefix 44444 can be reproduced without reading solved-game data.

However:

> **RLC selection is not, by itself, proof of game-theoretic optimality.**

Therefore, an RLC output may be used for:

- choosing the next move of a declared composite solve method;
- advancing the live game state when that move was actually recomputed during the current run;
- move ordering;
- worker scheduling;
- speculative work priority;
- diagnostics;
- non-pruning hints.

A benchmark that starts from the empty board remains an **empty-board execution** when its solver computes one or more moves during that run and then hands the resulting live position to another solving method. Runtime state advancement is solver work; it is not equivalent to supplying a precomputed opening prefix.

RLC selection alone still does **not** authorize a different claim: if a component purports to prove the W/D/L value of a fixed root while leaving the root unchanged, RLC selection by itself cannot discharge unexamined legal alternatives. Such pruning requires separate exact proof authority.

The generic RLC rule may survive into a clean run. The discovered result “44444” may not survive as a stored table, cache, prefix constant, or supplied starting position. It must be recomputed from the actual evolving position if used.

---

## 8. Exact pruning authority

A legal move, response, or state may be removed from the exact proof obligation only by one of the following:

- terminal game rules;
- exact alpha-beta or equivalent logical bounds;
- exact transposition identity;
- exact rule-derived symmetry/isomorphism;
- exact equivalence proved under an admitted theorem;
- an admitted structural theorem whose premises are satisfied in the current state;
- another sound exact certificate whose semantics are frozen and qualified.

For this contract, **qualified** means that an immutable evidence record binds the exact certificate/theorem semantics to a source commit or content hash and records the proof, tests, controls, or other acceptance evidence required for the specific authority being exercised. A passing experiment or favorable oracle comparison alone is not qualification for pruning authority.

Heuristic preference is not pruning authority.

A rule that merely scores one move above another cannot advance the claimed root unless an exact bridge from that score to the declared benchmark target has been proved.

For a root W/D/L solve, all legal alternatives remain semantically in scope unless an admitted exact proof discharges them.

---

## 9. Structural-theorem provenance

The phrase “previously proved structural theorem” is not sufficient provenance by itself.

Every theorem used as exact pruning/root-advancement authority in a solved-knowledge-independent benchmark must be cited by immutable file identity and commit/hash and classified before the run.

### 9.1 Lineage-clean rule-derived theorem

For the strict independence lane, all of the following are required:

- the theorem statement and proof obligations were frozen before solved-game/oracle validation;
- its discovery/selection record states that solved-game outputs, opening books, prior best moves, and oracle labels were not used to choose the theorem statement or tune its premises;
- the proof itself depends only on admitted rules, geometry, mathematics, and explicitly listed premises;
- the frozen candidate commit/hash predates oracle validation;
- any later repair after oracle inspection is a new candidate and requires a new fresh validation boundary.

The discovery/selection statement is necessarily a researcher self-attestation unless an independent development process provides stronger evidence. The contract does not pretend otherwise. The attestation must nevertheless be explicit, immutable, and consistent with the repository chronology so that an auditor can check the available evidence.

A theorem meeting these requirements may be admitted as exact pruning authority if its proof/qualification status permits it.

### 9.2 Oracle-informed theorem or rule

A theorem or rule may still be mathematically correct when solver/oracle feedback participated in its discovery, selection, or tuning.

Such a result must be labeled oracle-informed.

It is **not** admissible as pruning/root-advancement authority in the strict lineage-independent lane unless the benchmark profile explicitly relaxes that requirement.

It is also **not** admissible as an ordering selector or heuristic in a run declared `lineage-clean`. It may be used for non-pruning move ordering only in a `runtime-input-only` or explicitly relaxed lane, where it must be listed under `admitted_selectors_and_heuristics` with its immutable identity and lineage classification.

### 9.3 Runtime-input-only audit lane

A benchmark or audit may explicitly ask only whether the executing algorithm reads solved-game data at runtime.

In that narrower lane, historical oracle-informed design does not by itself fail the audit, provided the runtime/proof inputs are accurately disclosed.

Results from the runtime-input-only lane must not be described as lineage-independent.

---

## 10. Oracle and solved-reference validation

Solved references are validation instruments, not live benchmark inputs.

Before any candidate algorithm, formula, theorem, feature, or pruning rule is tested against a solved oracle:

1. record its immutable source commit or content hash;
2. record its complete semantics and declared success/falsification criterion;
3. freeze the validation set or holdout identity;
4. only then query the oracle.

If oracle output is inspected and the candidate is changed, the revised candidate is new. The previous holdout has become development data and cannot be represented as fresh validation for the revised candidate.

A fresh holdout must remain unqueried until the new candidate is frozen.

The benchmark evidence must make the freeze-before-oracle chronology auditable. Acceptable anchors include an immutable Git commit, signed or annotated tag, CI run tied to a commit, immutable workflow artifact, or another timestamped content-addressed record that establishes the candidate identity before the oracle query. A mutable local file or an undocumented verbal assertion is not sufficient chronology evidence.

---

## 11. Cold-start requirement

A clean run must begin without position-specific state from an earlier solve.

Use a fresh process, fresh container, or an equivalent isolation mechanism that prevents accidental reuse of mutable solver state.

Before timing/execution, the benchmark log must record at least:

- TT capacity and initial occupancy/count;
- proof-cache capacity and initial occupancy/count, when applicable;
- opening-book status;
- persisted-cache status;
- any preloaded rule/geometry artifacts and their hashes;
- starting root identity;
- process/runtime identity;
- executable source commit/hash;
- an attestation that the runtime dependency closure contains no embedded opening book, solved W/D/L table, best-move table, answer-bearing prefix constants, or equivalent compiled-in solved data.

The embedded-data attestation must be backed by an auditable source/dependency scan, build manifest, or equivalent content-hash record covering the code and static data actually reachable by the benchmark executable. The repository may contain oracle corpora elsewhere; the requirement concerns the benchmark runtime closure.

For a clean run, mutable answer-bearing tables must report empty/zero initial contents and the runtime closure must contain no forbidden answer-bearing constants.

A separately labeled warm-cache benchmark is permitted, but it is not a C4-0011 clean run.

---

## 12. Current-run learning is allowed

After the benchmark starts, the solver may create and reuse information derived during that same run, including:

- TT entries;
- exact bounds;
- proof certificates;
- history/order statistics;
- worker-shared exact facts;
- symmetry/canonicalization results;
- current-run structural caches.

Reuse is allowed only where the corresponding semantics remain valid.

Current-run learning does not convert the run into a warm-start benchmark.

---

## 13. Same benchmark problem

Competing solvers must receive the same semantic starting problem:

- same legal reachable starting position;
- same side to move;
- same terminal semantics;
- same declared exact target.

For an empty-board benchmark, every solver begins at the empty board.

For a prefix benchmark, every solver receives exactly that prefix/current state.

A solver may not be **initialized** farther down the game because a heuristic, RLC, book, prior solve, or expected line predicts the preceding moves.

This does not prohibit the solver from advancing its own live position after the benchmark begins. If the declared start is empty and the solver computes moves 1..k during that run from admitted inputs, the resulting position is a runtime output of the empty-board execution, not a different benchmark start.

If a structural theorem exactly eliminates alternatives inside a fixed-root proof, that proof work is part of the benchmark unless the benchmark profile explicitly declares the theorem as admitted pre-run authority under Section 9.

When a theorem is admitted as pre-run authority, the historical cost of discovering or proving that theorem is outside the timed benchmark. **The cost of evaluating its premises, constructing its position-specific instance, and checking that it applies to the current benchmark state remains position-dependent work and must be included under Section 14.**

---

## 14. Position-dependent preprocessing counts

Work that depends on the benchmark position is part of solving that position.

A benchmark may not move expensive position-specific work into initialization and exclude it from the measured solve merely to improve the reported result.

Pure reusable rule/geometry construction may be reported separately when it is position-independent and its boundary is disclosed.

Whole-solver comparisons should report complete exact-result wall time including all position-dependent:

- initialization;
- structural preprocessing;
- scheduling;
- search/fixed-point work;
- proof construction;
- synchronization;
- cleanup/drain required to obtain the declared result.

---

## 15. Hardware and resource disclosure

Every result must record the material execution environment, including where applicable:

- CPU model;
- architecture;
- OS;
- Node/runtime/compiler version;
- worker count;
- memory limit;
- TT/cache capacities;
- affinity/pinning policy;
- GPU model and VRAM for GPU lanes;
- benchmark root and target;
- source commit.

Comparisons should use the same machine or a clearly comparable declared resource class.

Different algorithms and languages are allowed unless a project-specific profile says otherwise.

---

## 16. Reproducibility, determinism, and scheduling

A benchmark must disclose whether execution is deterministic.

For deterministic solvers, record any RNG seed and scheduling configuration needed to reproduce the run.

For intentionally nondeterministic parallel solvers such as Lazy SMP:

- record worker count and scheduling policy;
- record RNG seeds if any stochastic mechanism exists;
- run enough repetitions to characterize wall time and work variation;
- report min/median/max or another frozen summary;
- do not present one node count as a uniquely reproducible invariant when worker scheduling can change it.

A decision checksum or root-result identity should be recorded when practical.

---

## 17. Work metrics

At minimum, report:

- wall-clock time;
- declared exact target/result;
- workers actually used;
- memory/TT configuration;
- a solver-native work metric.

Where available, also report:

- CPU time;
- nodes;
- evaluator calls;
- proof steps/certificates;
- cache statistics;
- synchronization or worker-efficiency metrics.

Node counts from different solver architectures are not automatically commensurate. A solver may not redefine “node” or move substantive work outside its accounting solely to manufacture a favorable comparison.

Any external historical baseline must identify:

- source;
- solver/version or commit;
- benchmark root;
- target semantics;
- hardware when relevant;
- node-count definition when a node figure is quoted.

Unsourced historical node figures are not normative benchmark authority.

---

## 18. Correctness precedes speed

Performance evidence is valid only for an exact result under the declared target semantics.

Search reductions, structural certificates, quotienting, symmetry, pruning, and caching are performance techniques only when their exact semantic authority is established.

A fast heuristic answer is not an exact solve.

A selector that chooses the same move as an oracle on a test position is not thereby a proof of optimality.

---

## 19. Connect4 / IsoMax project addendum

This section is project-specific and is not part of the portable independence core.

### 19.1 Runtime

IsoMax performance work is conducted in Node/JavaScript unless an owner-authorized benchmark profile explicitly says otherwise.

### 19.2 Worker count

Performance/parallel benchmarks use at least two workers unless Joshua Oshiro explicitly revokes that restriction for the named run.

A one-worker unit test may be used to prove control-flow behavior, such as showing that a pre-search selector returns before Lazy SMP would reject a one-worker request. Such a unit test is not a parallel performance benchmark.

### 19.3 Localhost resource profile

GitHub-hosted-runner memory constraints are CI constraints, not the normative local IsoMax performance profile.

IsoMax benchmark evidence must cite the selected localhost resource profile actually used. Temporary reduced-memory CI settings must not be silently substituted for the intended local configuration.

### 19.4 NEES and cycle accounting

NEES is a Connect4/IsoMax project accounting requirement, not part of the portable benchmark core. When a benchmarked JSMinSys/IsoMax function is subject to NEES accounting, report the relevant NEES/cycle-ledger identity, source revision, and applicable cycle/work totals with the benchmark evidence.

### 19.5 RLC scope

The current RLC publication establishes runtime/proof-input solved-knowledge independence for its move selections through plies 1–5 only.

A declared composite solver may therefore start from the empty board, recompute those moves one at a time, advance the live state, and hand the resulting position to the exact-search stage. Such a run is an empty-board composite execution because no prefix was supplied in advance.

This does not turn RLC's scoring relation into a generic game-theoretic optimality theorem, and it does not permit the literal result `44444` to be embedded or loaded as prior knowledge.

From ply 6 onward, solved-knowledge dependence/independence must be audited separately.

---

## 20. Benchmark declaration template

Every clean benchmark should freeze a declaration equivalent to:

    contract: C4-0011-v1
    independence_lane: lineage-clean | runtime-input-only
    start_position: <empty or legal reachable prefix>
    external_column_notation: one-based | zero-based
    exact_target: WDL | one-value-preserving-action | complete-WDL-action-set | strong-score | <other frozen target>
    source_commit: <sha>
    admitted_structural_theorems:
      - <file + commit/hash + lineage classification>
    admitted_selectors_and_heuristics:
      - <name + file/commit/hash + lineage-clean | oracle-informed + permitted use>
    oracle_available_to_runtime: false
    opening_book_loaded: false
    persisted_answer_cache_loaded: false
    runtime_closure_hash_or_manifest: <identity>
    embedded_answer_data_attestation: <source/dependency scan evidence>
    cold_start_attestation: <fresh process/container + zero table counts>
    runtime: <version>
    workers: <count>
    memory_and_cache_profile: <identity>
    deterministic: true | false
    seed: <value or none>
    repetitions: <count>
    metrics: <declared set>

The benchmark report must state any deviation from this contract rather than silently weakening it.

---

## 21. Normative summary

For a strict solved-knowledge-independent exact benchmark:

> The solver starts from the declared legal root with no stored or embedded answer-bearing state. It may use game rules, mechanically derived geometry, generic algorithms, current-run learning, and admitted structural theorems under the declared independence lane. Every selector and heuristic is declared with its lineage classification. A solver may compute moves during the run, advance its live state, and hand that state between solving methods; this remains one execution from the declared root. What is forbidden is supplying or embedding those position-specific results before the run. Oracle information is excluded from execution and is used only under the declared validation boundary. Every position-specific contribution to the result is derived during the current run or discharged by an explicitly admitted theorem.

## 22. Referenced Connect4 specifications

The local specifications referenced by this contract are:

- `docs/specs/C4-0001-domain-v1.md` — standard Connect Four domain semantics.
- `docs/specs/C4-0002-incumbent-evaluator-v1.md` — incumbent evaluator semantics.
- `docs/specs/C4-0003-incumbent-search-v1.md` — incumbent search semantics.
- `docs/specs/C4-0004-incumbent-benchmark-v1.md` — historical incumbent Node benchmark protocol.
- `docs/specs/C4-0005-solved-strength-oracle-v1.md` — solved-game oracle/strength evidence.
- `docs/specs/C4-0006-control-parity-and-winspace-v1.md` — candidate structural CPC/WSL specification.
- `docs/specs/C4-0007-nested-dependency-closure-v1.md` — candidate proof/certificate specification.
- `docs/specs/C4-0008-bsfp-exact-solver-v1.md` — BSFP exact-solver specification.
- `docs/specs/C4-0009-bsfp-cuda-execution-profile-v1.md` — BSFP CUDA execution profile.
- `docs/specs/C4-0010-quotient-native-negamax-v1.md` — quotient-native Negamax research specification.

Their individual status declarations remain authoritative within their own scopes; reference from C4-0011 does not promote a Candidate specification to Accepted.

---

This is the benchmark-independence contract.
