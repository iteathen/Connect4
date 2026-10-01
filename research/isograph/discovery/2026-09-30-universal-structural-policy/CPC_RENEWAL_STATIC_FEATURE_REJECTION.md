# CPC renewal static-feature rejection and transport boundary

**Date:** 2026-09-30  
**Status:** exact control interpretation / negative result for renewal compression  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Record what the qualified renewal census rules out before deriving the next CPC renewal operator.

The structural labels in this note are not oracle labels:

- **repairable** means the state has fixed synchronized-response horizon \(H=3\) but the independently verified one-switch theorem proves horizon \(5\);
- **nonrepairable** means the same fixed horizon \(H=3\) remains \(3\) under the one-switch certificate family.

All states are descendants of the already-consumed v4 training boundary, and all features below are rank-local geometry/CPC data.

## Exact controls

Repairable controls include:

- candidate-6 response successors \`...14\`, \`...41\`, \`...56\`, \`...65\`;
- candidate-3 response successor \`...22\`.

Nonrepairable controls include the remaining H=3 successors from candidates 2 and 3 in the durable two-switch evidence.

## Static features that are insufficient

### Phase / derivative alone

Repairability is not a function of the support phase word or adjacent derivative alone.

The renewal controls occupy multiple phase classes, and nonrepairable states occur in phase classes that also support repairable behavior elsewhere in the control.

This is consistent with the exact post-response transport theorem: support/phase does not determine typed residual state.

### Raw minimal residual-size histogram

Repairable and nonrepairable states overlap heavily in counts of size-2, size-3 and size-4 minimal residuals.

Therefore residual cardinality summaries are not a renewal certificate.

### Minimum fixed-template horizon-5 defect count

The quantity

\[
\delta_5(P)
=
\min_\Pi
\#\{\text{deadline}\le5\text{ residuals uncovered by }\Pi\}
\]

does not classify renewal.

Examples from the control:

- repairable \`c6_65\`: \(\delta_5=4\);
- nonrepairable \`c2_12\`: \(\delta_5=4\);
- repairable \`c3_22\`: \(\delta_5=4\);
- nonrepairable \`c3_31\`: \(\delta_5=4\).

Thus defect magnitude is not enough; the transition semantics of the defect are load-bearing.

### Pair count alone

Repairable and nonrepairable states both occur with one or several minimal pair residuals.

A pair residual is not automatically a renewal resource or a progress defect.

### Earliest pair support distances alone

The strongest simple falsifier is:

- repairable \`c3_22\` has an earliest deadline-3 pair with support-depth pattern \([0,2]\);
- nonrepairable \`c3_31\` also has an earliest deadline-3 pair with support-depth pattern \([0,2]\).

Therefore even the pair's local support-depth profile is insufficient without typed ownership/residual context and response transport.

## Consequence

The missing renewal predicate is not a static coordinate of the form

\[
X(P)=f(\text{phase},\text{counts},\delta_D,\text{pair depths}).
\]

The exact distinction is temporal:

\[
\boxed{
\text{current complete response template}
+
\text{typed fragment transport}
\longrightarrow
\text{successor CPC survival class}.
}
\]

For candidate 6's two-switch witness, every first response fragment transports into the one-switch survival class \(S_5\).

For candidates 2 and 3, no complete initial template has that universal transport property.

## Preferred CPC representation

Define a horizon-indexed structural class

\[
S_D
=
\{P:\text{CPC has a constructive survival certificate through }D\}.
\]

A response template \(\Pi\) is **\(D\)-renewing** at \(P\) when every legal attacker trigger, followed by \(\Pi\)'s exact response and exact typed transport, reaches a state in \(S_D\) or a defender terminal.

Then:

\[
D\text{-renewing}(P,\Pi)
\Longrightarrow
P\in S_{D+2}.
\]

This is the local content behind the two-switch theorem.

The final implementation target should compute this consequence from the CPC residual/support state and exact transport, not by attaching heuristic scores to individual obligations.

## Compression boundary

The current bounded controls verified renewal by materializing exact successor states. That is acceptable as theorem qualification but is not the desired final runtime form.

The next research target is a compressed CPC **renewal automaton / proof quotient** whose state preserves exactly the observations required by:

- support legality;
- typed residual transport;
- first-win stopping;
- synchronized response resources;
- membership in \(S_D\).

The existing temporal-contract automaton and observation-sensitive projection-congruence work should be reused.

Stop if the descriptor degenerates into one state per physical continuation.

## Claim discipline

This note does not:

- prove indefinite renewal;
- give a finite forced-completion upper bound;
- claim candidate 6 is perfect from the consumed parent;
- license v5;
- use Pons as a proof premise.

It records that the next sound compression must be transition-aware.
