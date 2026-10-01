# Pons strong-score horizon calibration for the consumed v4 boundary

**Date:** 2026-09-30  
**Status:** oracle calibration only / not a proof premise  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Calibrate the physical-ply scale of the already-consumed v4 oracle scores so the structural proof program targets the correct horizon.

This note does **not** add oracle data to the runtime move finder. The prefix is already consumed training evidence, and the score interpretation is used only to understand how far a successful rank-local theorem must reach.

Pinned oracle authority:

\`PascalPons/connect4@d6ba50d8aaf2308c769d9bf2abd42d90f34baf41\`

## Pons score convention

In the pinned \`Solver.cpp\`:

- \`Solver::analyze(P)\` returns \`-solve(P2)\` for a nonterminal candidate child \`P2\`;
- an immediate win in a position with \`n\` moves has score

\[
\left\lfloor\frac{43-n}{2}\right\rfloor
\]

on standard 7x6;
- the strong score therefore carries terminal distance, not merely W/D/L.

For the rank-10 child positions here, a positive child score \(k\) corresponds to the winning side's terminal move at absolute move count

\[
43-2k.
\]

Thus:

- child score \(+2\) -> terminal on move 39 -> 29 physical plies from rank 10;
- child score \(+1\) -> terminal on move 41 -> 31 physical plies from rank 10.

## Consumed v4 boundary

At parent prefix:

\`444441566\`

the already-recorded Pons action scores include:

- candidate 2: parent action score \(-2\);
- candidate 3: parent action score \(-2\);
- candidate 6: parent action score \(-1\).

Since \`analyze\` negates the child score:

- child 2 is a \(+2\) win for the new side to move -> terminal on move 39;
- child 3 is a \(+2\) win -> terminal on move 39;
- child 6 is a \(+1\) win -> terminal on move 41.

So the exact oracle remoteness gap at this consumed boundary is:

\[
\boxed{29,\ 29,\ 31}
\]

physical plies from the rank-10 child states.

## Research consequence

The current CPC survival proof classes certify only:

\[
[5,+\infty],\ [5,+\infty],\ [9,+\infty].
\]

Therefore the missing theorem is not a small tactical refinement around horizons 5–11.

To explain the oracle behavior structurally, the proof system ultimately needs a long-horizon resource/renewal account that can distinguish a two-ply difference near board exhaustion.

This strongly favors research on:

- finite renewal/resource automata;
- tail/resource exhaustion;
- support-phase transport;
- polarity-preserving CPC hyperedges;
- exact end-horizon closure;

rather than additional short local obligation scores.

## Claim discipline

The values 29/29/31 are training-side oracle calibration only.

They are **not**:

- premises of CPC;
- admissible runtime constants;
- a v5 move-selection rule;
- evidence that the current structural grammar proves those exact distances.

Any promoted rule must still be derived independently from rank-local geometry and qualified on fresh positions.
