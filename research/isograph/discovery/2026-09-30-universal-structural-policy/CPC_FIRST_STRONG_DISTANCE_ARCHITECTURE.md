# CPC-first strong-distance architecture for the universal move finder

**Date:** 2026-09-30  
**Status:** research architecture correction / execution priority  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Make Conclusive Play Certificates (CPC) the preferred aggregate owner of rank-local proof obligations for the universal move finder.

The immediate reminder is important: the move finder should not grow a parallel family of special-purpose obligation solvers when CPC already evaluates the complete active residual basis as one current-state calculation.

Individual singleton, Hall, fork, support-release, or response-resource obligations remain useful as:

- theorem witnesses;
- proof provenance;
- falsifier diagnostics;
- local exact lemmas used internally by CPC.

They should not become independent move-ranking systems by default.

## 1. Existing CPC already aggregates multiple obligation classes

The pinned JSMinSys CPC evaluator consumes one prepared rank-local RBA state/basis and, under one call, already combines exact/conservative routes including:

- current-mover immediate singleton terminal;
- multiple opponent playable singleton overload;
- stacked-singleton support-release loss;
- exactly-one opponent singleton forced response;
- all-legal-moves support lift into opponent singleton;
- fork-precursor exact loss/restriction;
- paired/frontier long-range response no-win closure;
- mover/opponent residual exhaustion interval closure.

These are internal CPC proof routes, not separate move-finder scores.

The control-potential work also identifies CPC ownership parity as the common scalar field behind phase and seam derivatives. Support, resources, deadlines, residual blockers, and first-win semantics remain causal guards on where CPC consequences are valid.

## 2. Native one-call v4 boundary result

Current pinned JSMinSys authority used by the aggregate probe:

\`iteathen/JSMinSys@0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb\`

CPC source blob:

\`addons/cpc-connect4.mjs@cd8c062f267509f120253633f38449c8040589ce\`

The same CPC source blob is present at the earlier selected diagnostic revision \`6bbba7c...\`.

One native \`evaluateConnect4Cpc32\` call was made for each state, with the full active residual basis and the qualified frontier-response option enabled.

At:

- candidate 2 child: \`4444415662\`;
- candidate 3 child: \`4444415663\`;
- candidate 6 child: \`4444415666\`;
- candidate-6 forced split \(2\to3\): \`444441566623\`;
- candidate-6 forced split \(3\to2\): \`444441566632\`;

the current native CPC implementation returns:

\[
\boxed{\text{CPC\_NONE}}
\]

with absolute W/D/L interval

\[
[-1,+1],
\]

no forced column, no preemption mask, and no precursor closure.

With projected advisory enabled, the current projected-singleton counters are also zero at these five states.

## 3. Meaning of CPC_NONE here

This result does **not** mean the positions have no obligations.

It means only:

> the currently implemented CPC theorem grammar does not close or restrict these states through its present exact/bound/restriction outputs.

This is compatible with the independently proved facts that:

- candidate 6 has a synchronized-response survival lower bound \(H=5\);
- candidates 2 and 3 have \(H=3\);
- candidate 6 has forced \(2\leftrightarrow3\) response fragments;
- those fragments are survival stutters under response-template switching.

Those facts should therefore be candidates for **CPC strengthening**, not reasons to build a second competing obligation engine.

## 4. CPC-first rule for subsequent research

For every proposed new coordinate or theorem:

1. ask whether it can be derived inside one CPC calculation over the complete current residual/support state;
2. if yes, define it as a CPC consequence/output or an internal CPC proof route;
3. retain individual obligation objects only as witnesses required to prove the aggregate result;
4. create a separate external operator only if CPC cannot represent the required information without losing soundness or introducing unrelated machinery.

This changes the default from:

\[
\text{obligation}_1+\text{obligation}_2+\cdots
\to
\text{move score}
\]

to:

\[
\boxed{
\text{current rank-local state}
\to
\text{one CPC closure}
\to
\text{proof consequences}.
}
\]

## 5. Strong-distance CPC extension target

The current CPC result vocabulary is primarily W/D/L-oriented:

- exact value;
- value bound;
- current-action restriction;
- unresolved.

The universal move finder additionally needs sound strong-distance information for the all-losing case.

The research target is an aggregate CPC envelope with logically separate authority fields, conceptually:

\[
CPC^*(P)=
\left(
V(P),
\underline T(P),
\overline T(P),
R(P),
W(P)
\right),
\]

where:

- \(V(P)\) is the ordinary CPC W/D/L interval;
- \(\underline T(P)\) is a constructive terminal-survival lower bound when proved;
- \(\overline T(P)\) is a constructive forced-completion upper bound when proved;
- \(R(P)\) is an exact current-action restriction/preemption set when proved;
- \(W(P)\) is optional proof-witness/provenance data.

A missing bound is \(\bot\)/unknown, never a guessed value.

The first qualified candidate for \(\underline T\) is the bounded synchronized-response horizon theorem already proved in this branch.

The existing immediate, Hall-fork, and forced-singleton certificates are candidate **internal witnesses** for \(\overline T\), not separate move selectors.

## 6. Important loss-delay guard

Distance information alone is not enough to apply project loss-delay semantics.

To eliminate a sibling because it loses sooner, CPC must also establish the relevant decisive value class structurally.

For example, strict interval separation:

\[
\underline T(P_a)>\overline T(P_b)
\]

licenses a loss-delay preference only when the proof context has already established that the compared children are losses under the project's value semantics.

Oracle labels may validate this after freezing, but cannot supply that premise at runtime.

## 7. Consequence for current v4 falsifier

At the consumed \`444441566\` boundary, the current evidence is therefore:

- native CPC W/D/L closure: unresolved for children 2, 3, 6;
- CPC-like constructive survival lower bounds: \(3,3,5\);
- current finite forced-completion upper grammar: unresolved for all three;
- no sound interval separation;
- no sound v5 ordering license.

The next theorem should strengthen the CPC aggregate itself.

It should not add another heuristic over residual counts, deadlines, Hall deficits, or template identities.

## 8. Next experiment

Prototype a CPC strong-distance closure over the same full active residual basis, retaining current CPC semantics and guards.

First extension:

- integrate the already-qualified synchronized-response survival horizon as a CPC lower-bound output;
- preserve current \`CPC_NONE/BOUND/EXACT/RESTRICT\` W/D/L authority independently;
- do not change move selection;
- confirm the aggregate calculation reproduces \(H=[3,3,5]\) on the consumed children and \(H=5\) across both candidate-6 forced stutter successors;
- then derive a CPC-native upper-bound/progress rule rather than adding separate obligation-specific ranking logic.

## Claim discipline

This architecture correction:

- does not assert that current production CPC already proves every future obligation;
- does assert that CPC is the preferred aggregate owner for obligation reasoning;
- keeps individual obligations as proof witnesses where useful;
- does not create v5;
- does not use Pons as a proof premise;
- does not promote any unresolved distance bound into a heuristic move score.
