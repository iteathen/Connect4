# Candidate compatibility ranking against the clear-winner core

**Date:** 2026-09-09  
**Status:** research classification; maintained source and `main` unchanged.  
**Research lineage:** continues `research/forced-macro-implication-2026-09-09`.

## Core assumed for this classification

This ranking treats the following as the current clear-winner core, meaning the final solver is expected to retain these mechanisms or their semantic equivalent:

- residual win-space as semantic state;
- fixed 625-ID minimal residual-requirement substrate;
- minimal physical/support state rather than full historical colored-board state;
- fixed-width, allocation-free hot kernel;
- precomputed/incremental residual transitions;
- exact immediate-win / double-threat tactical closure;
- forced single-response restriction;
- forced macro-edges / decision-state exposure;
- cardinality earliest-win bounds;
- compact exact TT identity;
- authoritative proof/bound storage separated from ordering hints;
- residual automorphism collapse;
- neutral/dead-choice compression.

Compatibility is not the same as standalone performance or final desirability. It answers: if the clear-winner core remains, how naturally can this candidate coexist with it without reintroducing expensive board-shaped state, dynamic per-node policy, incompatible cache semantics, or unsound proof assumptions?

A candidate that replaces one provisional realization of a core concept can still be highly compatible. For example, an event frontier competes with plain column heights as the concrete implementation of minimal support state, but is highly compatible with the core semantic direction.

## Ranked compatibility

### 5/5 — native or nearly native to the core

**One-sided win-space exhaustion bounds.** Residual requirement emptiness is already present; the bound is a nearly free consequence. It should not require a separate subsystem.

**Broader residual automorphisms.** Extends an already clear-winner mechanism. Arbitrary cycles/refinement should be evaluated as cheaper ways to expose equivalence already native to semantic state.

**Residualized/incemental incumbent-evaluator ordering signals.** Live-line density, parity ownership, tactical class, and related evaluator facts are highly compatible when projected onto requirement IDs or maintained incrementally. Full evaluator rescans are a separate low-compatibility implementation.

**Local Allis proof certificates compiled to fixed masks (especially Claimeven, Baseinverse, Vertical).** These act directly on surviving opponent winning obligations and fit naturally as precomputed `solves` masks and small compatibility facts over the 625-ID substrate.

**Strongest-proof retention / selective proof admission.** Fits the existing separation between exact/bound authority and hints. The exact replacement/admission policy remains open.

**Previous-pass / TT cutoff-move hints.** Ordering-only reuse is already part of the accepted incumbent philosophy and imposes no semantic conflict with exact residual search.

**Coarse active-TT capacity selection.** Compatible when resolved outside recursion at root/pass/task boundaries. It changes memory exposure, not state semantics.

**Support-event frontier as a realization of minimal support state.** This is a candidate representation, not an additive feature. It may replace plain heights while retaining the same semantic responsibility. High conceptual compatibility, but it must preserve fixed-width hot execution.

### 4.5/5 — strongly compatible if represented natively

**Support-aware earliest-win bounds from maintained event distance.** The previous board-scan implementation was expensive, but if support distance is already part of the state, the richer bound becomes a cheap extension of cardinality.

**Proof-cost / conspiracy-inspired move or threshold ordering.** Safe if it only chooses proof order and consumes metadata already maintained for other reasons. It becomes less compatible if it introduces a separate dynamic search-policy engine.

**Aftereven / Before rules expressed as event-frontier consequences.** Their conclusions concern future reachability/ownership of cells after support events; this can align extremely well with event-frontier state.

**Outcome-class-first then distance refinement.** Compatible with exact proof semantics provided TT identity/bound meaning remains explicit and no result is promoted beyond its proved class.

**Proof-threshold / null-window selection by predicted proof cost.** Changes which exact proof is attempted first rather than changing semantic authority. Best when based on already-maintained features.

### 4/5 — compatible, but with real cost/interaction risk

**Lowinverse, Highinverse, Baseclaim, Specialbefore and richer Allis combinations.** Semantically fit the residual proof model, but compatibility/conflict machinery can become expensive. They stay high only if compiled to fixed masks/local resources rather than recreated as VICTOR's dynamic solution graph.

**Rank banking / intrinsic rank-aware TT placement.** Semantically compatible and may improve locality, but it interacts strongly with compact key width, active capacity, automorphism canonicalization, and replacement pressure. It should be treated as one possible physical layout, not a semantic requirement.

**Dynamic worker count / bounded YBWC / coarse proof parallelism.** Largely orthogonal to residual semantics if all scheduling decisions occur at coarse boundaries. Main risk is speculative node amplification overwhelming structural node reductions.

**Global shared proof cache with coarse publication.** Valuable in principle, but exact compact identity, lifecycle, relocation, and concurrent publication must remain coherent. More compatible than worker-local-only knowledge, less trivial than single-thread TT.

**Previous-pass immutable read table + local writable region.** A hybrid cache form that preserves proof separation and avoids per-node multiwriter synchronization. Potentially compatible if equal-byte evidence wins.

### 3/5 — semantically compatible, hot-path tension

**Support-compatible implication/proof reuse.** Sound under identical support and consistently node-positive, but current frontier lookup is costly. It can become highly compatible if implication metadata/frontiers are maintained incrementally or naturally by the event representation. Until then it competes with the fixed-width hot-path envelope.

**Selective semantic-successor dedup as a separate pass.** Native semantic identity is compatible; a separate dynamic dedup layer is not. Prefer making equivalent successors identical before search rather than detecting duplicates afterward.

**Two-way or higher-associativity TT probes.** No semantic conflict, but every extra probe is directly opposed to the 13M/s-class hot kernel. Only survives if compact keys or costly collision retention make the additional access profitable at equal bytes.

**Dependency-aware TT placement / chunking.** Could improve locality, but partitioning can accidentally split states that residual automorphisms or semantic identity say should share. Placement must be downstream of semantic identity and must not become a second state ontology.

**Coarse temporal grouping of related tasks.** Potentially compatible because it changes scheduling rather than identity. Whole-solve interaction with YBWC and global proof reuse remains open.

### 2/5 — likely conflict unless substantially reinterpreted

**Worker-local-only TT ownership.** Conflicts with the value of global semantic transposition reuse and tends to duplicate proof work. A hybrid private-write/shared-read design is more compatible than strict local-only storage.

**Literal branching-factor TT banking.** Already weak empirically and adds a cache partition based on a fact that does not strongly track working-set locality. It can interfere with compact identity and active-capacity use.

**Previous-pass-read/current-pass-write two-tier TT as a permanent design.** Tested forms lost to flat equal-memory controls. A narrowly scoped immutable-proof directory may survive, but a mandatory two-tier architecture is poorly aligned with simplicity/locality.

**Full board-oriented support scans per node.** The information can be useful, but reconstructing it from board geometry every node conflicts directly with residual state and the throughput envelope. Keep the fact, exclude the implementation.

**Full incumbent evaluator rescans for every candidate move/node.** The evaluator's knowledge is valuable; rescanning all geometric lines in the exact hot search is unlikely to survive. Residualized/incremental forms are the compatible interpretation.

**Dynamic VICTOR compatibility/set-cover graph in recursion.** Exact strategic rules are useful; rebuilding and traversing a generic compatibility graph per node conflicts with the 625-ID/fixed-width architecture. Compile or bound the relation instead.

**Per-node mutable chunk-map / placement discovery.** Conflicts with fixed descriptors, locality, and the rule that resource policy should be resolved outside recursion.

### 1/5 — mostly incompatible with the core hot architecture

**Generic JavaScript Map/Set state/proof directories at per-node frequency.** Useful as cold/reference tooling only. They directly oppose compact numeric identity, locality, and allocation-free recursion.

**BigInt residual/board arithmetic in the hot path.** Acceptable for reference/oracles/precomputation, not compatible with the measured fixed-width kernel.

**Full historical colored board as search identity.** Contradicts the semantic-state reduction that enables most of the clear-winner core.

**Per-node atomics/synchronization.** Conflicts with the throughput evidence and device/CPU hot-loop design. Coarse publication is the compatible form.

**Probabilistic tags used as proof identity.** False hits are unacceptable for exact bounds. Tags may be rejection filters only if complete exact identity is validated before proof use.

**Formula-only move dominance that ignores support/accessibility.** Already falsified semantically. The corrected support-compatible proof-reuse relation is a different candidate.

## Important exclusions are often implementation exclusions, not knowledge exclusions

Several low-compatibility entries contain useful information that should be retained in another form:

- incumbent evaluator knowledge: retain, but residualize/incrementalize it;
- Allis rules: retain, but compile to fixed proof masks rather than dynamic compatibility graphs;
- support-aware bounds: retain, but maintain support distance rather than scan the board;
- semantic successor equivalence: retain natively in state identity/orbits rather than as an extra dedup pass;
- parallelism: retain at coarse proof/task boundaries rather than adding policy/synchronization to negamax;
- cache isolation/locality: retain as physical placement policy, but do not let it redefine semantic state identity.

## Highest-risk compatibility boundaries

The candidates most likely to force an architectural choice are:

1. **support-event frontier vs plain height/support representation** — alternative realizations of the same core responsibility;
2. **global shared TT vs partitioned/local proof storage** — affects concurrency, locality, and duplicate proof work;
3. **implication/frontier proof reuse vs minimal direct TT** — cross-state monotonic reuse may justify extra proof metadata only if its lookup becomes cheap;
4. **compiled Allis rule masks vs richer dynamic compatibility search** — the former fits the core, the latter probably does not;
5. **residualized evaluator/proof-cost metadata vs full rescans** — same knowledge, radically different hot-path compatibility.

## Current compatibility ordering for subsequent classification

When evaluating remaining candidates, default preference should be:

1. facts already encoded by the residual state;
2. fixed precomputed transitions/masks;
3. incremental numeric metadata;
4. small bounded direct probes;
5. coarse-boundary policies;
6. dynamic per-node relation discovery only if measured proof savings overwhelm cost;
7. generic graph/object machinery only outside the hot path.

This ranking is provisional classification, not a substitute for composition benchmarks. A medium-compatibility candidate can become a composition winner if another representation makes its cost disappear; a high-compatibility candidate can still fail if its actual implementation damages time to proof.