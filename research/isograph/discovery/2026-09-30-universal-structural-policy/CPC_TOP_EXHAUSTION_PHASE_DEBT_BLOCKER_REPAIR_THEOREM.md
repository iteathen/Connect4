# CPC top-exhaustion phase-debt blocker repair theorem

**Date:** 2026-09-30  
**Version:** 0.1  
**Status:** exact local transition theorem candidate / CPC temporal-contract repair edge  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Formalize the one-slot response-debt seam exposed after the consumed candidate-6 horizontal-ladder / odd-row-guard / support-lift composition.

The theorem applies only when an attacker move fills a column to the top, so the ordinary same-column response resource no longer exists.

It does not license arbitrary legal defender moves.

## 1. Setup

Let \(q\) be a legal nonterminal attacker-to-move CPC/RBA state with an already-established defender temporal contract \(G\) such as an odd-row guard.

Let column \(c\) have exactly one empty cell.

The attacker plays that top cell \(x\).

Apply exact first-win stopping.

Assume the attacker move is nonterminal.

Because the column is now full, there is no same-column response cell above \(x\).

Call this one missing response event a **top-exhaustion phase debt**.

## 2. Admissible repair resource

In the exact post-trigger state \(q_x\), a defender frontier cell \(r\) is an admissible repair resource only if:

1. \(r\) is currently playable;
2. \(r\) is in a column distinct from the exhausted trigger column;
3. playing \(r\) preserves the carried guard/resource contract \(G\);
4. \(r\) belongs to at least one live attacker residual winning requirement in \(q_x\);
5. exact first-win/terminal precedence is respected.

Condition 4 makes the repair simultaneously spend the otherwise-unmatched defender turn and permanently block at least one live attacker winning line.

The admissible resource family is therefore derived from current residual attachment, not from a free choice among all legal columns.

## 3. Local theorem

Let \(q_{xr}\) be the exact CPC/RBA child after attacker top trigger \(x\) and defender repair \(r\).

For any already-sound guard-carrying survival class \(S_D^G\),

\[
\begin{aligned}
&x\text{ is a legal nonterminal top-exhaustion trigger}\\
&r\text{ is an admissible attached repair resource}\\
&q_{xr}\in S_D^G
\end{aligned}
\]

implies that the realized branch survives through the trigger/repair pair plus the horizon certified by \(S_D^G\).

Thus the repair is a lawful temporal-contract transition:

\[
\boxed{
G+\operatorname{TopDebt}_1
\xrightarrow{A:x,\ D:r}
G
}
\]

only when the exact transported child re-enters the guard proof class.

## 4. Response-capacity interpretation

At one top-exhaustion event there is exactly one unmatched defender response obligation:

\[
O=\{\operatorname{TopDebt}_1\}.
\]

Let \(R_G(q_x)\) be the set of guard-preserving, residual-attached playable repair resources.

For this one-obligation snapshot, response capacity is nonzero iff

\[
R_G(q_x)\neq\varnothing.
\]

This snapshot feasibility does not prove indefinite survival.

The temporal contract owns the successor resource state, and the exact child must independently satisfy the downstream proof class.

## 5. Relationship to historical phase-debt transport

The historical temporal-stutter analysis established the architecture:

\[
\text{odd unmatched event}
\to
\text{one response debt}
\to
\text{external resource repair}
\]

with the repair interpreted as transporting a phase defect rather than deleting it.

The present theorem narrows the repair neighborhood further by requiring exact live-residual attachment and preservation of the current guard.

It does not import any solved value from the historical control.

## 6. Consumed-boundary witness

In the best guard-established c6 family after the exact support-lift macro:

- attacker \`A6\` fills column A;
- no A-column response remains;
- several current frontier cells outside A are exact live-residual blockers;
- several of those preserve the B or C odd-row guard;
- every profiled candidate is immediately nonterminal-safe.

Durable discovery evidence:

- \`CPC_POST_SUPPORT_LIFT_TOP_PROFILE_0_1.json\`;
- \`CPC_GUARD_TOP_DEFECT_PROFILE_0_1.json\`.

Immediate safety in those files is diagnostic only; this theorem additionally requires exact downstream guard-class closure.

## 7. Scope boundary

This theorem does **not** permit:

- arbitrary waiting moves;
- all legal defender moves;
- a response merely because it has favorable phase;
- a response merely because it blocks some residual;
- dropping the guard without a separate ordinary survival certificate.

The edge exists only at a top-exhaustion event and only for a current frontier blocker attached to a live residual and preserving the carried guard.

## 8. Qualification plan

1. freeze this theorem before composition;
2. compose it only into the already-frozen odd-row guard survival control;
3. record whether the best c6 guard horizon extends;
4. if positive, freeze implementation;
5. generate fresh mechanically detected top-exhaustion/guard cases;
6. qualify legality, attachment, guard preservation, and exact downstream closure;
7. only after structural qualification use Pons for independent falsification/validation.

## Claim discipline

This theorem candidate is:

- rank-local;
- geometry-derived;
- current-state reconstructible;
- exact for one top-exhaustion repair transition;
- response-resource and attachment preserving;
- internal to CPC temporal obligation accounting.

It does not by itself prove W/D/L, exact remoteness, candidate-6 superiority, or v5.
