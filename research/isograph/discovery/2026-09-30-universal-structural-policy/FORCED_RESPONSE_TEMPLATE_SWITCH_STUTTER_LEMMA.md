# Forced response-template switch / survival-stutter lemma

**Date:** 2026-09-30  
**Status:** exact structural composition lemma + candidate-6 control  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Explain why the only forced-singleton edges present at the consumed v4 candidate-6 child do not constitute proven attacker progress.

The complete forced-singleton grammar closure found exactly two attacker-forced response fragments from candidate 6:

\[
A:2\Rightarrow D:3,
\qquad
A:3\Rightarrow D:2.
\]

Both consume the bottom synchronized pair \(\{B1,C1\}\).

The bounded synchronized-response theorem already proves a constructive survival lower bound \(H=5\) before either exchange.

This note checks whether the forced response fragment destroys that lower-bound certificate or whether the defender can switch to a new complete response template afterward.

No oracle value is used.

## 1. Generic certificate-switch lemma

Let \(P\) be a rank-local state with attacker \(A\) to move.

Suppose:

1. a constructive response template \(\Pi\) certifies survival through attacker-relative horizon \(D\) at \(P\);
2. attacker move \(a\) is nonterminal;
3. after \(a\), the defender has no immediate counter-win but is structurally forced to play response \(r\) in order to avoid an already-playable attacker terminal target;
4. the forced response \(r\) is nonterminal;
5. the exact successor \(Q=P+a+r\), with \(A\) to move again, admits another complete synchronized-response template \(\Pi'\) certifying survival through the same horizon \(D\).

Then the two-ply forced fragment

\[
P\xrightarrow{a}P+a\xrightarrow{r}Q
\]

is a **\(D\)-survival stutter**:

\[
H(P)\ge D
\quad\text{and}\quad
H(Q)\ge D.
\]

The defender is not required to preserve the same template identity. It may consume one response fragment and switch to \(\Pi'\).

This does **not** prove exact remoteness equality \(T(P)=T(Q)+2\), nor does it prove that the attacker move is bad. It proves only that the forced exchange has not reduced the currently certified survival lower bound.

## 2. Candidate-6 state

Start from the consumed prefix

\`444441566\`

and apply candidate 6.

The resulting child has support heights

\[
[1,0,0,5,1,3,0].
\]

The previously qualified bounded-response control gives

\[
H=5.
\]

One maximizing complete template uses:

- columns 1 and 4, channel length 1;
- columns 5 and 6, channel length 1;
- columns 2 and 3, channel length 2;
- remaining tails vertically paired.

## 3. Forced orientation 2 -> 3

If the attacker plays column 2:

- the move is nonterminal;
- column 3 becomes the unique currently playable attacker terminal target;
- the defender has no immediate terminal counter-win;
- therefore column 3 is forced.

After the two-ply fragment the support heights are

\[
[1,1,1,5,1,3,0].
\]

The exact bounded-response computation again yields

\[
\boxed{H=5}.
\]

A maximizing successor template switches to:

- columns 1 and 2, channel length 1;
- columns 3 and 4, channel length 1;
- columns 5 and 6, channel length 1;
- remaining tails vertically paired.

## 4. Forced orientation 3 -> 2

The symmetric causal orientation is also exact:

- attacker plays column 3;
- column 2 is the unique currently playable attacker terminal target;
- defender has no immediate terminal counter-win;
- column 2 is forced.

The same support vector results:

\[
[1,1,1,5,1,3,0],
\]

with opposite ownership orientation on the bottom pair.

Again:

\[
\boxed{H=5}
\]

and the same successor pairing pattern

\[
(1,2),(3,4),(5,6)
\]

with channel length 1 for each pair is a maximizing complete response template.

## 5. Residual-boundary stability

For both forced orientations, the first uncovered normalized attacker residuals occur only at deadline 7, exactly as before the exchange.

The executable control verifies that the leading uncovered residual signatures are unchanged.

Thus the forced split consumes a response layer and changes the response-template matching, but it does not move the first uncovered residual boundary earlier.

This is a concrete instance of the older certificate-switch / defect-transfer seam:

\[
\text{response fragment}
\to
\text{support transport}
\to
\text{template switch}
\to
\text{same certified horizon}.
\]

## 6. Consequence for upper-bound discovery

The candidate-6 forced-singleton edges are not merely terminally unproductive under the current upper-bound grammar. They are also **lower-bound stutters** under a constructive defender certificate.

Therefore an upper-bound proof must not assign progress merely because:

- the attacker created a forced reply;
- two moves were consumed;
- a synchronized pair was exchanged.

A sound progress theorem must show that the forced response fragment destroys, strictly weakens, or outruns every relevant successor safety certificate.

At candidate 6 that is false for the current \(D=5\) certificate.

## 7. Narrowed next target

For candidates 2 and 3, no forced-singleton edge exists at the root of the current upper-bound grammar.

For candidate 6, the only such edges stutter under certificate switching.

The next positive upper-bound theorem therefore needs a **strict defect-progress predicate**:

\[
\text{forced/selected response fragment}
\Rightarrow
\text{successor safety defect strictly worsens}
\]

under a well-founded rank that is invariant to template rematching.

Candidate rank components must be structural, for example:

- earliest uncovered residual deadline;
- response-matroid deficiency;
- number/identity of unavoidable defect classes;
- support distance of the earliest unavoidable terminal obligation.

Raw move count or template identity is not a valid progress rank.

## Claim discipline

This result:

- is oracle-free;
- proves only preservation of the certified lower-bound horizon across the stated forced fragments;
- does not prove exact strong distance;
- does not prove candidate 6 is optimal;
- does not create v5;
- does not claim every forced response fragment is a stutter.
