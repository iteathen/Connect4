# Forced-singleton upper-bound grammar closure boundary

**Date:** 2026-09-30  
**Status:** exact structural closure result / upper-bound grammar boundary  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Close the currently qualified rank-local forced-completion grammar before adding any new move-selection machinery.

The qualified upper-bound rules are:

1. immediate terminal frontier gives \(\overline T(P)\le 1\);
2. one-setup Hall fork gives \(\overline T(P)\le 3\);
3. forced-singleton lift: if one legal attacker setup creates exactly one already-playable terminal target, the defender has no immediate counter-win, the forced block is nonterminal, and the forced successor has certificate \(\overline T\le U\), then \(\overline T(P)\le U+2\).

This note proves a finite closure procedure for **all finite compositions of those rules** and applies it to the consumed v4 falsifier.

No oracle value, solved W/D/L label, search score, terminal distance, minimax, negamax, or alpha-beta recursion is used.

## 1. Certificate grammar

For a rank-local position \(P\) with attacker to move, define the current grammar \(\mathcal G\) inductively.

### Base certificates

\(I(P)\) holds when the attacker has an immediate legal winning frontier cell. It yields upper bound 1.

\(H(P)\) holds when some legal nonterminal attacker setup creates at least two distinct already-playable attacker winning frontier cells, while the defender has no immediate terminal reply. It yields upper bound 3.

### Lift edge

Write \(P \xrightarrow{a,t} R\) when:

- \(a\) is a legal nonterminal attacker setup;
- in \(Q=P+a\), the defender has no immediate terminal move;
- in \(Q\), the attacker has exactly one already-playable winning frontier target \(t\);
- therefore every nonterminal defender reply is forced to occupy \(t\);
- the forced block at \(t\) is itself nonterminal;
- \(R=Q+t\), with the original attacker to move again.

If \(R\) has an upper certificate \(U\), then the lift gives \(P\) the upper certificate \(U+2\).

## 2. Finite acyclic closure theorem

Every lift edge adds exactly two stones, so

\[
rank(R)=rank(P)+2.
\]

On a finite \(W\times H\) board, the lift graph is acyclic under occupied-cell rank.

Hence all certificates expressible by \(\mathcal G\) can be computed exactly by descending rank:

1. mark every base-certificate state;
2. process lower-rank states only after all higher-rank lift successors have been resolved;
3. assign the minimum finite bound available from a base certificate or any qualified lift successor;
4. leave the state unproved when neither a base certificate nor a finite certified successor exists.

Because rank strictly increases on every grammar edge, this process terminates and is complete **for this grammar**.

Failure of this closure does not prove that the attacker cannot force completion. It proves only that the current immediate/Hall-fork/forced-singleton grammar has no finite certificate.

## 3. v4 consumed falsifier closure

Use the consumed training prefix \`444441566\` and the three relevant children after candidate moves 2, 3, and 6.

The already-qualified survival lower bounds are:

\[
\underline T(P_2)=3,\qquad
\underline T(P_3)=3,\qquad
\underline T(P_6)=5.
\]

### Candidate 2

The child has:

- no immediate terminal base certificate;
- no one-setup Hall-fork base certificate;
- **zero** admissible forced-singleton lift edges.

So the complete current grammar closes immediately with no finite upper certificate.

### Candidate 3

Likewise:

- no immediate terminal base certificate;
- no one-setup Hall-fork base certificate;
- **zero** admissible forced-singleton lift edges.

Again the current grammar has no finite upper certificate.

### Candidate 6

The child has no base upper certificate but has exactly two admissible forced-singleton lift edges:

- attacker setup column 2, forced defender block column 3;
- attacker setup column 3, forced defender block column 2.

These are the two orders of consuming the synchronized bottom pair \(\{B1,C1\}\).

Both successors:

- are nonterminal;
- have no immediate upper certificate;
- have no one-setup Hall-fork certificate;
- have no further admissible forced-singleton lift edge.

Therefore both branches are terminal leaves of the current certificate grammar and neither produces a finite upper bound.

## 4. Exact closure consequence

The entire current grammar therefore leaves the three strong-distance intervals at:

\[
\boxed{
P_2:[3,+\infty],\qquad
P_3:[3,+\infty],\qquad
P_6:[5,+\infty].
}
\]

This is stronger than checking only one forced-singleton lift: **arbitrary finite repetition of the currently qualified lift cannot close any of the three upper bounds.**

There is still no strict interval separation, so there is still no sound v5 elimination rule.

## 5. Structural clue from candidate 6

Candidate 6 is the only one of the three children that even enters the forced-singleton lift grammar.

Its two lift edges are the two orientations of the same bottom synchronized pair:

\[
B1 \leftrightarrow C1.
\]

If the attacker takes either endpoint, the defender is forced to take the other. After that exchange, the current grammar has no further forced terminal chain.

This independently agrees with the bounded synchronized-response diagnosis: the apparent early bottom residual is a response channel, not a forced attacker reservation.

The next upper-bound theorem therefore must add genuinely new information rather than merely recurse the singleton lift more deeply.

## 6. Next admissible theorem target

The next target is a guarded support-release / multi-slot response certificate.

For every proposed terminal obligation, retain explicitly:

- physical target identity;
- release event or release condition;
- latest defender response slot;
- legal response actions;
- shared-discharge identity;
- support/order dependencies;
- first-win precedence;
- any response action that changes later release structure.

Only after these guards reduce a family to true unit-capacity response obligations may Hall deficiency be used as a forced-completion upper certificate.

In particular, do not revive raw residual-transversal counts or earliest-unopposed completion as if they were forcing schedules.

## Claim discipline

This closure result is:

- rank-local and geometry-derived;
- complete only for the stated upper-bound grammar;
- oracle-free;
- not a game-value theorem;
- not a proof of exact remoteness;
- not a v5 selector;
- not evidence that a missing finite upper bound is infinite in the real game.
