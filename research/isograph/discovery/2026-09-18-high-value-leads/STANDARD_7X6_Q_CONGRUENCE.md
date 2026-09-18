# High-value lead investigation — exact future-behavior congruence of q

**Date:** 2026-09-18  
**Leads:** standard-7x6 same-q identity; concrete same-q breaker search  
**Status:** deductive research candidate; authority integration/independent qualification still required  
**Authority effect:** none

## Claim

Fix standard 7x6 Connect Four and consider legal **nonterminal** states.

Define:

~~~text
q(s) =
    support(s)
    + normalized P0 residual antichain(s)
    + normalized P1 residual antichain(s)
~~~

with side to move derived from support rank parity.

Candidate theorem:

> If `q(s)=q(t)`, then `s` and `t` have the same complete labeled future game under ordinary legal Connect Four semantics: the same legal columns, the same terminal token for every move, and the same successor `q` for every nonterminal move.

Therefore they have the same exact W/D/L and the same recursively defined distance-sensitive state/action values under any fixed tie convention that depends only on that labeled future game.

This is a **future-behavior identity** theorem.

It is not physical-state identity, move-history identity, terminal-line-provenance identity, or NDC/proof-certificate identity.

---

# Definitions

For player `p`, let `R_p(s)` be the normalized minimal antichain of nonempty residual winning requirements:

- geometric winning lines containing an opponent stone are absent;
- own occupied cells are removed from surviving lines;
- duplicate residuals are removed;
- strict supersets are removed.

A legal state is nonterminal, so no player already has an empty residual corresponding to a completed line.

The support vector determines the currently legal landing event in every non-full column.

---

# Lemma 1 — same support gives the same legal action frontier

If:

~~~text
support(s) = support(t)
~~~

then:

- the same columns are full/non-full;
- every legal column has the same landing cell in both states;
- the occupied-cell count is equal;
- therefore side to move is equal under standard alternating no-pass play.

So the legal action alphabet and mover are determined by q.

---

# Lemma 2 — terminal result of one move is determined by q

Let the mover be player `p` and the legal landing cell be `x`.

For every mover residual `R`:

~~~text
x notin R -> R
x in R    -> R - {x}
~~~

A move is an immediate win iff at least one mover residual becomes empty.

For the opponent, every residual containing `x` is permanently blocked and removed.

These operations depend only on:

~~~text
x
R_p
R_(1-p)
~~~

which are fixed by q and the action.

Therefore the same action from equal-q states either:

- terminates with the same winner; or
- remains nonterminal in both.

If no legal action remains after a non-winning move, the draw condition is also determined by support.

---

# Lemma 3 — minimal-antichain normalization is exact under legal cofactors

Suppose two same-player residual requirements satisfy:

~~~text
A proper_subset B
~~~

Then B is semantically dominated.

For mover events:

- taking a cell in A shrinks both; A remains no larger than B;
- taking a cell in B\A shrinks B while A remains unchanged and still dominates it;
- completing A terminates the game immediately, so any hypothetical post-terminal difference in B is unobservable.

For opponent events:

- taking a cell in A blocks both A and B;
- taking a cell in B\A blocks only B while A remains.

Thus a strict superset can never become the uniquely relevant future winning requirement after the smaller residual has been retained.

Equivalent Boolean view:

~~~text
F_p = OR_(R in R_p) AND_(v in R) [future_owner(v)=p]
~~~

A superset conjunction is absorbed by its subset conjunction.

Mover/opponent updates are Boolean cofactors, and canonical minimal-antichain normalization preserves the represented monotone function.

Therefore canonicalization does not lose future winning semantics.

---

# Adversarial finite control

A separate JavaScript control exhaustively enumerated every family of nonempty subsets for universes of size 1 through 4 and compared:

1. cofactor behavior of the raw family;
2. cofactor behavior after minimal-antichain canonicalization.

Results:

~~~text
universe 1:      2 families /       2 checks / PASS
universe 2:      8 families /      16 checks / PASS
universe 3:    128 families /     384 checks / PASS
universe 4: 32,768 families / 131,072 checks / PASS

total:       32,906 families / 131,474 checks / PASS
~~~

The first version of the checker appeared to find a failure.

The failure occurred only when the mover had already completed a winning singleton and the checker still compared the hypothetical post-terminal residual family.

That comparison is invalid under first-win stopping.

After changing the control to compare only the terminal token once a win occurs, every case passed.

This false start is retained because it demonstrates that first-win stopping is load-bearing in the theorem.

Files:

- `antichain-congruence-control.mjs`;
- `antichain-congruence-control-result.json`.

The finite control is not the proof; it is an adversarial check of Lemma 3.

---

# Lemma 4 — every nonterminal successor q is determined by q + action

For a nonterminal legal move:

~~~text
support'
    = deterministic support advance

R_mover'
    = canonical mover cofactor

R_opponent'
    = canonical opponent cofactor
~~~

By Lemmas 1-3, each component is a function only of the old q and the chosen column.

Therefore:

~~~text
T_q(q, column)
    -> terminal token
       or unique q'
~~~

is well-defined independently of the discarded physical ownership/history distinctions.

This is exactly the structural transition shape already used by C4-0010 and the MQ3/MQ4/SIU work.

---

# Theorem — q is an exact future-behavior congruence

Connect Four is finite and every nonterminal legal move increases the occupied-cell count by one.

Induct on the number of remaining cells.

## Base

At zero remaining cells, equal support implies both states are full.

Since the starting states are nonterminal, both are draws.

## Step

Assume the theorem for all states with fewer remaining cells.

For equal-q states `s,t`:

1. Lemma 1 gives identical legal actions.
2. Lemma 2 gives identical terminal outcomes for each action.
3. Every nonterminal action produces the same successor q by Lemma 4.
4. Apply the induction hypothesis to the successor pair.

Thus the complete action-labelled future trees are identical up to the q representation.

Consequently any exact recursively defined game value depending only on that future tree is identical, including:

- W/D/L;
- fastest-win / longest-loss distance;
- per-column exact action values.

---

# Standard 7x6 consequence

The proof does not require exhaustive enumeration of all standard-7x6 q classes.

Therefore the earlier research gap:

~~~text
standard 7x6 q sufficiency has not been exhaustively tested
~~~

is not the mathematical burden for ordinary future-behavior identity.

The relevant burden is whether the definitions/transition laws used in the theorem are the intended standard-7x6 q semantics.

C4-0010 already states the ordinary forward quotient as:

~~~text
supportIndex
+ normalized P0 residual antichain
+ normalized P1 residual antichain
~~~

and specifies the same legal cofactor transitions.

The existing solved-database sample does not supply positive quotient-collapse evidence because its exact-q signature was injective on all 30,254 sampled states:

~~~text
30,254 sampled physical states
30,254 exact q classes
0 mixed values
~~~

So that sample neither proves nor meaningfully tests same-q merging.

The theorem supplies the missing reason.

---

# Scope boundaries

The theorem applies to **ordinary legal future game behavior** from legal nonterminal states.

It does not imply that q preserves:

- physical colored-board identity;
- ordered move history;
- artifact/provenance identity;
- which geometric winning-line label eventually wins;
- path-dependent proof/certificate state;
- CPC/NDC facts whose premises are not derivable from q;
- arbitrary advisory evaluator state.

C4-0010 already requires those stronger facts to remain separately/contextually owned when not derivable from q.

---

# Reinterpretation of NEI result NEI-C4-0007

The applied NEI overlay currently records standard-7x6 same-q future-behavior identity as:

~~~text
INCOMPLETE_UNQUALIFIED
~~~

relative to the frozen authority/evidence available when the overlay was produced.

This investigation supplies a **new deductive research candidate** after authority 1.1.

Therefore:

~~~text
mathematical closure gap:
    appears resolved by the congruence proof

current authority/qualification gap:
    remains until this proof is independently reviewed
    and incorporated into a successor IsoGraph authority/NEI evidence revision
~~~

Do not silently rewrite the historical NEI result.

---

# Lead 43 — breaker search after the proof

The original breaker family was:

find equal-q states differing in:

- legal action set;
- terminal behavior;
- same-action successor q;
- strong score;
- action score;
- W/D/L.

Under the theorem, such a pair would no longer be an ordinary discovery of missing semantic state.

It would falsify at least one theorem premise or expose an implementation defect in:

- q construction;
- residual normalization;
- legal support;
- first-win handling;
- transition implementation.

So the breaker search remains useful as a **theorem/implementation adversary**, but it is no longer the primary path to establish identity.

More informative future controls should target:

1. independent reimplementation of q from physical state;
2. random/adversarial 7x6 legal states checking q-local transitions against physical replay;
3. deliberately generated same-q physical collisions if available;
4. terminal/provenance queries that should **not** be preserved by q, as negative scope controls.

---

# Disposition

~~~text
LEAD_40_STANDARD_7X6_SAME_Q_IDENTITY
    = DEDUCTIVE CANDIDATE RESOLVED MATHEMATICALLY

LEAD_43_SAME_Q_BREAKER_SEARCH
    = RECLASSIFIED AS ADVERSARIAL QUALIFICATION

remaining burden
    = independent review + successor authority/NEI ingestion

current frozen NEI-C4-0007
    = remains historical INCOMPLETE_UNQUALIFIED
~~~
