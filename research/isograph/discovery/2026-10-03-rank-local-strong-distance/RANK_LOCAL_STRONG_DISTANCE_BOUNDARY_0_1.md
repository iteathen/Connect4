# Rank-Local Strong-Distance Boundary 0.1

**Date:** 2026-10-03  
**Branch:** `research/rank-local-strong-distance-boundary-20261003`  
**Status:** early anti-proof campaign / information-boundary result

## Question

Can strong-perfect move selection -- W/D/L first, then shortest win / longest
loss -- be determined by a rule-derived rank-local, non-search method?

The campaign deliberately permits solved-game data and exhaustive computation as
**offline falsifiers**.  The runtime anti-cheating restriction does not constrain
the mathematician attempting to prove impossibility.

The desired end state remains one of:

1. a constructive rank-local strong-perfect theorem; or
2. a theorem that the declared runtime class cannot compute strong remoteness.

This checkpoint records the first three attacks.

## Result A -- W/D/L equivalence usually does not imply strong equivalence

The frozen solved-action corpus
`reference/oracles/solved-actions-v1.tsv` contains exact Pons-style per-action
scores.

Among its 128 positions:

- 46 parents are exact losses;
- for a losing parent every legal action is W/D/L-equivalent as a loss;
- 44 of those 46 losing parents (95.65%) have at least two distinct exact loss
  scores among legal actions;
- the largest observed score spread is 6.

Thus the distinction under study is not exceptional:

[
\operatorname{Opt}_V(P)=\operatorname{Legal}(P)
]

can coexist with

[
\operatorname{Opt}_{V,R}(P)
\subsetneq
\operatorname{Legal}(P).
]

This is solved-data evidence only.  It establishes the prevalence of the
strong-distance refinement, not an impossibility theorem.

## Result B -- coarse current-state invariants lose remoteness

An exhaustive Node probe strongly solved three small gravity games:

- 4x3 connect-3: 4,659 reachable nonterminal states;
- 4x4 connect-4: 139,625 reachable nonterminal states;
- 5x3 connect-4: 152,003 reachable nonterminal states.

Two coarse rank-local descriptor tiers were tested.

### COARSE_MULTISET

Contains mover, rank, sorted support heights, and counts of live residuals by:

- orientation;
- missing cardinality;
- support-distance multiset;
- event-parity multiset.

It mixes exact remoteness within one W/D/L class on 4x3 connect-3 and 4x4
connect-4.

### HEIGHTED_COARSE

Retains the physical support-height vector but still discards physical target
identity inside the residual multiset.

It also mixes exact remoteness within one W/D/L class on 4x3 connect-3 and 4x4
connect-4.

Therefore these natural aggregate/CPC-style summaries are insufficient for
strong remoteness.

This does **not** establish that all rank-local information is insufficient.

## Result C -- exact live-residual/support state did not lose remoteness

The third descriptor tier is:

[
Q(S)=
(
\text{mover},
\text{rank},
H(S),
\mathcal R_0(S),
\mathcal R_1(S)
),
]

where:

- (H(S)) is the exact column-height vector;
- (mathcal R_i(S)) is player (i)'s complete physical live winning-line
  residual basis;
- each residual retains physical line orientation and exact missing cells with
  support distance and event parity;
- ownership of cells that belong to no live line for either player is omitted;
- horizontal reflection is canonicalized.

Despite large quotient collisions, exhaustive strong solving found:

| profile | physical states | quotient classes | largest quotient class | mixed W/D/L | mixed remoteness within W/D/L |
|---|---:|---:|---:|---:|---:|
| 4x3 c3 | 4,659 | 2,202 | 28 | 0 | 0 |
| 4x4 c4 | 139,625 | 18,727 | 5,336 | 0 | 0 |
| 5x3 c4 | 152,003 | 6,438 | 4,536 | 0 | 0 |

This is consistent with the following structural theorem.

# Exact Live-Residual Support Strong-Distance Sufficiency Theorem

Let (S) and (T) be exact nonterminal finite-gravity Connect-(K) states on
the same geometry.

Suppose

[
Q(S)=Q(T)
]

with (Q) defined above.

Then (S) and (T) have isomorphic future legal transition systems under
first-win stopping. Consequently they have identical:

- W/D/L value;
- exact shortest-win remoteness;
- exact longest-loss remoteness;
- strong-optimal action sets, modulo the quotient's geometric symmetry.

## Proof

Fix one quotient state (Q).

### 1. Legal frontier is known

The exact height vector determines the unique current playable cell in every
non-full column. Therefore it determines the complete legal action set.

### 2. Current terminal completion is known

For mover (A), playing frontier cell (x) wins immediately iff one current
live residual in (mathcal R_A) has missing set exactly ({x}).

Thus first-terminal stopping for every current action is determined by (Q).

### 3. Nonterminal residual transition is deterministic

Suppose (A) plays nonterminal frontier cell (x).

For every (A)-residual:

- if (x) is absent from its missing set, it is unchanged;
- if (x) is present, remove (x) from that missing set.

For every opponent residual:

- if (x) is absent from its missing set, it is unchanged;
- if (x) is present, the line is killed because it now contains an opponent
  token.

The played column height increases by one and the mover flips.

No previously dead line can become live again because Connect Four only adds
tokens.  Therefore ownership omitted from cells outside every live line can
never affect a future live residual or terminal event.

Hence the exact child quotient

[
Q(S+x)
]

is a deterministic function of (Q(S)) and (x).

### 4. Induction over remaining capacity

Steps 1--3 give identical legal actions, identical terminal labels, and
identical quotient children from equal quotient states.

Induction on remaining board capacity therefore gives isomorphic complete
future game trees under first-win stopping.

Strong remoteness is defined entirely from that tree by the usual recursion:

- shortest terminal among value-preserving winning actions;
- longest terminal among value-preserving losing actions.

Therefore equal (Q) implies equal exact strong remoteness.

QED.

## Consequence for the proposed anti-proof

If this exact residual/support state is admitted as "rank-local information,"
then the simple information-theoretic claim

> remoteness is not determined by rank-local information

is false.

The unresolved question is computational:

> can remoteness be extracted from (Q(S)) by the permitted uniform
> polynomial, non-search calculus?

The theorem above does not provide such an extractor.  Ordinary backward
induction/search over the quotient remains disallowed at runtime.

## Result D -- no easy complexity lower bound is currently available

A second attack looked for a standard generalized-game hardness theorem that
would make a polynomial strong-distance algorithm implausible or conditionally
impossible.

The currently located literature instead states that ordinary generalized
gravity Connect Four is in PSPACE because play is bounded, but its general
complexity remains open.  Cutsinger and Wylie, *Row Shifting as a Puzzle
Mechanic in Generalized Connect Four*, IEEE CoG 2024,
DOI 10.1109/CoG60054.2024.10645604, explicitly describe the generalized
ordinary game complexity as still open.

Therefore there is no presently justified shortcut of the form:

[
\text{rank-local polynomial strong solver}
\Rightarrow P=PSPACE
]

for ordinary generalized gravity Connect Four.

For the fixed standard 7x6 game an asymptotic lower bound is even less
meaningful: any finite solved function can in principle be compiled into a
finite table/circuit.  Project rules forbid that runtime construction, but
mathematical impossibility must therefore constrain a **uniform computational
class**, not just the information contained in the current board.

## External strong-solve consistency

Markus Bock's 2025 strong-solve work separates these same layers operationally:
the published artifact stores a W/D/L strong solution and uses alpha-beta search
to recover the fastest win / slowest loss action.

This is consistent with, but does not prove, the hypothesis that strong distance
is computationally harder than W/D/L structural classification.

## Present conclusion

The first anti-proof campaign gives an asymmetric result.

### Supported

1. W/D/L equivalence is far too weak for strong-perfect loss-delay selection.
2. Several natural aggregate rank-local summaries provably merge states with
   different remoteness.
3. The exact live-residual/support quotient appears to preserve exact
   remoteness, and the transition argument above explains why.

### Rejected / not supported

The broad information claim

> no rank-local information can determine remoteness

should not be pursued if the exact residual/support quotient is admitted.

### Still open

The real target becomes:

> no **permitted non-search polynomial calculus** can compute the strong
> remoteness function of the exact rank-local quotient.

That is a computational non-definability/lower-bound question.

## Next attacks if this line continues

1. **Formalize the runtime calculus.**  
   Specify allowed primitive operations, iteration/recursion, uniformity across
   board sizes, and what exactly counts as disguised successor search.

2. **Bounded-logic separation.**  
   If the runtime calculus has a bounded logical/derivation rank, search for
   families indistinguishable to that calculus with different strong decisions.

3. **Delay-family construction.**  
   Search solved generalized carriers for a repeatable neutral-delay gadget
   whose insertion preserves the admitted local proof type while changing exact
   remoteness.  This can refute a fixed calculus even though it cannot refute
   the exact quotient state itself.

4. **Constructive fallback.**  
   If the permitted calculus is too broad for a credible lower bound, return to
   the constructive problem: derive strong distance directly from the exact
   quotient without recursive future-state enumeration.

## Claim discipline

This checkpoint does not claim:

- that strong remoteness is polynomial-time computable;
- that strong remoteness is impossible to compute rank-locally;
- that the three small carriers prove the quotient theorem by enumeration;
- that the turn-6 strong-perfect move has been proved.

It does establish that any successful anti-proof must be **computational**, not
merely information-theoretic, once the exact live-residual/support quotient is
allowed.
