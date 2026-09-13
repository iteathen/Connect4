# Connect4 current research status

**Updated:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`  
**Pre-cleanup snapshot:** `8bf24b6818b4e2775a3b41cd21e517b94e36271c`  
**Research direction / architecture:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This file is a **current-state router**, not a historical journal. Historical results,
negative controls, superseded interpretations, benchmark records, and prior optimization
work remain under `docs/research/**` and in Git history. Start with
[`docs/research/RESEARCH_INDEX.md`](docs/research/RESEARCH_INDEX.md).

## Current objective

Derive the exact subset of the 69 geometric Connect Four winning lines that can occur
as P0 terminal wins on at least one W/D/L-perfect trajectory, using structural proof
rather than an externally supplied solved terminal-line classification.

The suspected final cardinality is **output only**. It must not be used as a premise,
tuning target, acceptance criterion, or measure of whether a candidate theorem is
"getting warmer."

Exact enumeration/search is permitted as a bounded control or qualification oracle.
It is not theory-construction authority.

## Governing authority

Read in this order before mutation:

1. account-global `iteathen/.github/AGENTS.md`;
2. `AGENT_LOCAL.md`;
3. `docs/specs/C4-0006-control-parity-and-winspace-v1.md`;
4. `docs/specs/C4-0007-nested-dependency-closure-v1.md`;
5. `docs/specs/C4-0010-quotient-native-negamax-v1.md`;
6. current research routed by `docs/research/RESEARCH_INDEX.md`.

C4-0010 remains the forward-solver contract. The mathematical work does not silently
redefine its exact game semantics.

## Accepted structural boundary

The mechanically derived standard-board geometry contains:

- 69 geometric winning lines;
- 625 unique nonempty residual fragments;
- CPC for parity/control/event-precedence facts;
- WSL-625 for residual requirements and blocker closure;
- NDC for monotone nested dependency closure.

Support/playability, ownership, response resources, event order, race horizons,
deadlines, guards, and output provenance remain load-bearing where the corresponding
proof or observable depends on them.

## Current exact semantic decomposition

### Value-state identity

C4-0010 owns the qualified ordinary forward quotient:

```text
q = exact support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

The reconstructed certificate differential independently requalified `q` on complete
small games and established the current causal-isomorphism boundary:

- raw `q` is successor-congruent on the primary 4x3 control;
- global support/winning-line automorphisms are exact extension-coherent value
  isomorphisms;
- a same-snapshot descriptor is not an exact merge unless its renaming extends through
  successors;
- non-derivable CPC/NDC/path-dependent certificate state must still extend identity or
  remain context-owned as required by C4-0010.

See `docs/research/2026-09-13-current-causal-certificate-differential.md`.

### Winning region

The P0 winning region is the finite least fixed point

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

where `PreE` is the P0 existential predecessor and `PreA` is the P1 universal
predecessor. See
`docs/research/2026-09-13-winning-region-output-factorization.md` and
`docs/research/2026-09-13-alternating-fixed-point-calculus.md`.

### W/D/L proof currency

Sound structural facts narrow the six possible W/D/L intervals. Exact predecessor
propagation is max/min over child interval endpoints.

The paired-response theorem remains a nontrivial refinement **after** exact causal
isomorphism. On complete 4x3 connect-3 it covers:

```text
122 physical states
90 raw C4-0010 classes
46 geometry-causal classes

77 genuine decision states
57 raw decision classes
29 geometry-causal decision classes
```

with zero exact-value mismatches. The 77 decision states contain 23 draws and 54 P0
losses, so the theorem proves exactly `[-1,0]`; it does not overclaim draw versus loss.

See `docs/research/2026-09-13-paired-response-interval-witness.md` and the current
certificate-differential record.

### Terminal-line output

Perfect-play terminal-line identity is richer than W/D/L.

```text
value layer:   q
output layer:  q + exact P0 residual/origin provenance Pi0
```

Geometry isomorphism transports line labels; it does not erase them. The current 4x3
control has zero output mismatches under the provenance quotient and many collisions
when the value quotient is reused as an output quotient.

Once `W` is known, perfect trajectories from a P0-winning state are legal paths
remaining inside `W`, so per-line output is existential reachability inside that
region. See `docs/research/2026-09-13-output-provenance-quotient.md`.

## Current corrective boundary

`docs/research/2026-09-13-center-response-serialization-correction.md` supersedes the
**strategic interpretation** of the earlier static center-repair experiments while
retaining their static geometry/counterfactual evidence.

Static blocker or capacity counts are not a realizable contingent strategy without
response identity, compatibility, ordering, and deadline correctness. The current
differential independently preserves a ply-3 W/D/L counterexample to a static
capacity summary that erases resource identity/order.

## Current missing calculus

The ordinary exact state differential is no longer the active gap.

The remaining Connect-Four-specific problem is **guarded implication among distinct
exact quotient alternatives** inside `PreE` and `PreA`:

```text
exact q / q+Pi0 state identity
  + sound interval / CPC / WSL / NDC / temporal certificate
  -> theorem-backed alternative implication or elimination
  -> exact max/min predecessor result
```

A complete rule must retain every load-bearing premise and must not turn a proof
refinement into quotient equality.

For negative/no-win results, the safety side includes response resources, timing,
deadlines, CPC control, WSL coverage and NDC guards. For positive winning results, a
well-founded structural progress argument remains necessary.

## Immediate execution seam

Develop and qualify a **guarded alternative-implication / choice-elimination calculus**
over exact quotient classes.

The next unit should:

1. operate on C4-0010 `q`, adding exact `Pi0` whenever terminal-line identity is in scope;
2. build explicit sibling-alternative certificate records for `PreE` / `PreA`;
3. derive only context-preserving implication/elimination rules with stated proof
   obligations;
4. preserve max/min interval endpoints exactly;
5. require a well-founded progress witness for positive-win elimination;
6. mechanically falsify each candidate rule on complete controls and retain the
   smallest counterexample;
7. keep provenance transport through every output-sensitive rule.

The obsolete remembered scratch count `2023 -> 419 + 1604` is now explicitly retired
as unverified historical evidence. It is not a target for the new calculus.

## Research hygiene

- `STATUS.md` and `next_step.yaml` contain current state only.
- `docs/research/RESEARCH_INDEX.md` routes retained research.
- `reference/research-prototypes/README.md` routes non-production prototypes.
- Negative controls are retained.
- Corrected/superseded experiments are retained with downgraded interpretation.
- Unknown usefulness is retained by default.
- Deletion requires demonstrated redundancy or obsolescence plus preserved provenance.

The organization policy is recorded in
`docs/research/2026-09-13-research-organization-cleanup.md`.
