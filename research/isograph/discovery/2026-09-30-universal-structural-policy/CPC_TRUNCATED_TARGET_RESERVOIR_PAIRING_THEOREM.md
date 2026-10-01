# CPC truncated target-reservoir pairing theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** structural theorem candidate; qualification pending  
**Branch:** research/universal-structural-policy-20260930

## Purpose

Close the exact escape/preemption premise that remains after the qualified trigger-5 forced-compression theorem.

The theorem is not specific to a move history. It is a current-state CPC/RBA certificate schema for a player \(A\) that already owns an active singleton winning residual at a nonplayable target \(t\), while opponent \(D\) is to move.

The central construction is to truncate the target column at \(t\). Cells above \(t\) cannot be reached before \(t\) because of gravity, and play stops when \(A\) occupies \(t\). The relevant event reservoir therefore consists of:

- every remaining cell in non-target columns;
- only the support cells through \(t\) in the target column.

A finite synchronized pairing of this truncated reservoir can certify both target ownership and opponent non-preemption without enumerating response histories.

## 1. Setup

Let \(q\) be a legal nonterminal Connect Four RBA state.

Let:

- \(A\) be the player that owns an active singleton residual \(\{t\}\);
- \(D\) be the side to move;
- \(t=(c_t,r_t)\) be nonplayable in the current state;
- \(h_c\) be the current support height of column \(c\).

Define the **truncated relevant capacity**

\[
R_c =
\begin{cases}
r_t-h_{c_t}+1,& c=c_t,\\
H-h_c,& c\neq c_t.
\end{cases}
\]

The target column therefore ends at \(t\); cells strictly above \(t\) are excluded from the certificate state.

Require \(R_{c_t}>0\).

## 2. Synchronized pairing template

A template consists of disjoint pairings of the odd-capacity columns.

For each paired odd-column pair \((a,b)\), choose an odd synchronized prefix length

\[
L_{ab}\le \min(R_a,R_b).
\]

The first \(L_{ab}\) events of those columns are paired cross-column at equal support depth.

Because \(R_a,R_b,L_{ab}\) are odd, each post-prefix tail has even length.

Every remaining tail, and every unpaired even-capacity column, is paired vertically:

\[
(h+L,\ h+L+1),\quad
(h+L+2,\ h+L+3),\ldots
\]

with the lower cell the \(D\)-trigger and the immediately upper cell the \(A\)-response.

If the target column participates in a synchronized odd prefix, require that \(t\) lie strictly above that prefix and be an \(A\)-response cell in the even vertical tail.

If the target column is even and unpaired, require that \(t\) itself be an \(A\)-response cell of its vertical pairing.

Thus \(t\) is never a \(D\)-owned member of a cross pair.

## 3. Pairing legality invariant

The template defines a current-state response law:

1. if \(D\) plays the lower member of a vertical pair, \(A\) plays its upper mate;
2. if \(D\) plays one endpoint of the next synchronized cross pair, \(A\) plays the equal-depth endpoint in its partner column.

After every nonterminal trigger/response pair:

- a vertical column advances by two cells and remains aligned to its next pair;
- a synchronized cross pair advances both participating columns by one cell and restores equal prefix depth;
- untouched columns retain their current pairing state.

Therefore every prescribed response is playable when required. No move history beyond the current support vector and the finite template is part of the proof state.

## 4. Opponent residual coverage

For every active \(D\) residual \(S\) in the current exact RBA coordinate, require at least one of:

### Vertical blocker

\(S\) contains an \(A\)-response cell from a vertical pair.

Then \(D\) cannot own that cell: gravity forces the lower trigger first, and the response law assigns the upper cell to \(A\).

### Synchronized cross blocker

\(S\) contains both endpoints of at least one synchronized cross pair.

Whichever endpoint \(D\) takes first, \(A\) immediately takes the mate, so \(D\) cannot own both.

### Post-target deferral

\(S\) contains a target-column cell strictly above \(t\).

Gravity makes that cell unreachable until after \(t\). Since \(A\)'s occupation of \(t\) is terminal, such a residual cannot preempt the target win.

No scalar residual count or residual ID is sufficient; coverage is checked against exact residual cell attachment.

## 5. First-win precedence

A template is invalid if \(D\) already has a playable singleton terminal at \(q\).

Under a valid template, the residual-coverage condition prevents every other active \(D\) winning requirement from becoming complete before its blocker is assigned to \(A\).

If an \(A\) response creates an earlier \(A\) terminal, that is an acceptable earlier completion and the certificate stops there.

## 6. Target inevitability

The truncated relevant reservoir is finite.

The response law consumes it in \(D/A\) pairs.

Because \(t\) is explicitly an \(A\)-response cell and cannot be crossed by gravity:

- \(D\) cannot occupy \(t\) under the template;
- \(D\) cannot escape indefinitely into cells above \(t\);
- if \(A\) has not already won earlier, finite exhaustion eventually presents the lower mate of \(t\) as a \(D\)-trigger;
- \(A\) then occupies \(t\).

Since \(\{t\}\) is an active \(A\) singleton residual, that response is an exact first win for \(A\).

Therefore:

\[
\boxed{
\text{active }A\text{ singleton }t
+\text{valid truncated synchronized pairing}
+\text{complete }D\text{-residual coverage}
\Longrightarrow
A\text{ wins}
}
\]

This is a CPC zugzwang certificate: it proves the current state from finite event-reservoir parity and live residual attachment, not by enumerating future histories.

## 7. Immediate qualification target

The first qualification target is the family of rank-29 states produced by the qualified trigger-5 forced-compression theorem from the rank-24 state located by:

444441566666232222423311

The locator is consumed evidence only. Qualification must reconstruct the rank-24 RBA state once and reach each target state through exact cofactors.

For the four off-column first replies \(\{1,3,6,7\}\), the already-qualified macro produces a Player-1 active singleton at:

\[
t=(7,3)
\]

with Player 2 to move.

The qualification question is whether each exact post-compression state admits at least one truncated synchronized pairing template satisfying every condition above.

## 8. Required evidence

For each qualified state record:

- exact support and mover;
- target geometry and active-singleton attachment;
- truncated capacities;
- odd-capacity columns;
- selected synchronized column pairs and prefix lengths;
- explicit proof that \(t\) is an \(A\)-response cell;
- count of active \(D\) residuals;
- per-residual coverage class and attachment witness;
- explicit absence of a currently playable \(D\) singleton terminal;
- oracleUsed: false;
- solvedInputsUsed: false.

The search for a finite template is proof synthesis over current structural data. No W/D/L oracle value may participate in template selection.

## 9. Falsifiers

Reject or narrow this theorem if any of the following occurs:

- a prescribed cross or vertical response can be illegal despite the stated support invariant;
- the target can be assigned to \(D\) under an accepted template;
- an active \(D\) residual is accepted without a vertical blocker, complete cross pair, or post-target deferral;
- a \(D\) terminal can occur before the blocking response;
- cells above \(t\) can become playable without first consuming \(t\);
- exact RBA attachment disagrees with the template coverage calculation;
- a qualification state has no valid template but is nevertheless reported accepted.

## 10. Scope boundary

This theorem does not modify production CPC.

It does not add work to addons/cpc-connect4.mjs, change CPC return meanings, or alter its cycle profile.

Initial qualification belongs entirely to separate Connect4 research machinery consuming pinned JSMinSys RBA/CPC authority.

Even if the immediate rank-29 family qualifies, that establishes exact W/L only for those states and for any earlier state connected by independently qualified forcing composition. It does not by itself establish candidate-6 optimality, exact remoteness, a universal move finder, or v5.
