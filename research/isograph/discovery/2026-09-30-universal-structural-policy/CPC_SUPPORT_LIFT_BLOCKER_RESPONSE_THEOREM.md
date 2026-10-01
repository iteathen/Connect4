# CPC support-lift blocker response theorem

**Date:** 2026-09-30  
**Version:** 0.1 frozen before execution  
**Status:** exact local transition theorem candidate / CPC internal response edge  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Close the precise local seam exposed by the odd-row guard control.

After guard establishment at the consumed c6 boundary, the first unresolved attacker trigger is in column A. The trigger advances support from A3 to A4. The next cell A5 becomes immediately playable for the defender and is a live blocker cell in the still-active row-5 attacker line.

The current response grammar does not admit that move because A4 and A5 are not members of the same residual requirement.

This theorem licenses only that support-linked blocker transition.

## 1. Setup

Let \(q\) be a legal nonterminal attacker-to-move CPC/RBA state.

Let the attacker legally play the current frontier cell \(x\) in column \(c\). Apply exact first-win stopping.

Assume play remains nonterminal.

Let \(y\) be the cell immediately above \(x\) in the same column.

Because \(x\) was just occupied, if \(y\) lies on the board then \(y\) is now immediately playable.

Require additionally that, in the exact post-trigger CPC/RBA state, \(y\) belongs to at least one live attacker residual winning requirement \(R\).

## 2. Local response

The defender may play \(y\).

This is legal by gravity.

Because defender ownership of any required cell permanently destroys the corresponding attacker winning line,

\[
y\in R
\Longrightarrow
D:y\text{ discharges }R.
\]

The exact cofactor child determines every other consequence.

## 3. Theorem

For any already-sound downstream proof class \(S_D\),

\[
\begin{aligned}
&A:x\text{ nonterminal}\\
&y=\operatorname{above}(x)\text{ immediately playable}\\
&y\in R\text{ for some live attacker residual }R\\
&q_{xy}\in S_D
\end{aligned}
\]

implies that the realized branch survives through the trigger/response pair plus the horizon certified by \(S_D\).

The rule does **not** claim that blocking \(R\) alone is sufficient.

## 4. Why the trigger need not belong to \(R\)

The semantic relation is support causality:

\[
x\text{ releases }y
\]

followed by blocker attachment:

\[
y\in R.
\]

Requiring \(x\in R\) would erase the load-bearing support relation and miss valid blocker responses such as:

\[
A4\to D:A5
\]

when A5 belongs to the live row-5 residual.

This is exactly the sort of attachment that Core 0.21 and the recent formula revalidation require us to preserve rather than reduce to marginal presence counts.

## 5. Scope guard

This theorem is deliberately narrower than:

> after every attacker move, try every legal defender blocker.

Only the uniquely support-released same-column cell immediately above the trigger is admitted.

Therefore the local branching factor is at most one new response per attacker trigger.

## 6. Consumed-boundary witness

In the guard-established c6 descendants:

- attacker trigger A4 is legal and nonterminal;
- A5 becomes immediately playable;
- A5 belongs to the live ancestry-preserved row-5 line \`A5-B5-C5-D5\`;
- defender A5 permanently blocks that line;
- the B or C odd-row guard remains untouched.

Whether the exact child preserves the full survival proof is left to the downstream proof class.

## 7. Qualification plan

1. compose the edge only into the already-frozen odd-row guard survival control;
2. record whether it extends the structural horizon;
3. if positive, freeze implementation;
4. generate fresh legal positions with mechanically detected support-lift blocker edges;
5. verify legality, live-residual attachment, and exact downstream proof closure;
6. only afterward use Pons for independent falsification/validation.

## Claim discipline

This theorem candidate is:

- rank-local;
- geometry-derived;
- exact for its local response claim;
- first-win guarded;
- ancestry/attachment preserving;
- restricted to one same-column support release.

It does not by itself prove W/D/L, exact remoteness, candidate-6 superiority, or v5.
