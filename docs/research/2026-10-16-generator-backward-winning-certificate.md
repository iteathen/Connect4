# Backward winning-region certificate by extremal residual generators

**Date:** 2026-10-16  
**Status:** deductive sufficient-condition proposal from existing qualified/candidate RBA ordering; no claimed standard-7x6 root certificate or logic-authority promotion  
**Durable owner:** `research/semantic-quotient`  
**Research direction:** Josh Oshiro

## Objective

Replace the expensive forward task "expand the game until every winning
continuation is classified" with a much narrower **candidate-first,
backward-checkable certificate**.

The already established G2 reverse certificate verifies equivalence between
support fibers without traversing a continuation graph. This note applies the
same asymmetry to the actual target: **prove the existence of a winner's
strategy**, not merely equivalence of structures.

This is a certification criterion, **not** an algorithm that has already found
the required certificate for the empty standard 7x6 board or for `44444`.

## Existing mathematical dependencies (do not rediscover)

- `SUPPORT_LOCAL_ACTION_VALUE_ISOTONY.md`: favorable residual order, exact
  cofactor isotony, and terminal-order guards.
- `RBA_ALGEBRA_CORE_CHECKPOINT_0_1.md`: antichain upset semiring, exact
  predecessor/adjoint mechanisms, and the identified cost of distributing
  alternate responses before normalization.
- `2026-09-13-alternating-fixed-point-calculus.md`: winner existential /
  opponent universal reachability semantics.
- `2026-10-16-oracle-relative-proof-algorithmic-core.md`: accepted oracle
  validates the core recurrence without requiring recursive formula descent.
- `2026-10-16-equivalence-first-wdl-quotient.md`: G2 exact reverse transport.

The proposed theorem below is a **sufficient-condition consumption form** of
those known structures, not a claim to have discovered a new Bellman operator.

## Domain and ordered candidate

Fix claimant `w` in `{0,1}`. For each legal nonterminal support `s`,
let `Q_s` be its abstract ordinary q domain with first-win semantics and
let `>=_w` mean the support-local favorable residual implication order **for
the fixed claimant**, independent of whose turn it is.

A candidate winning region is represented by a **minimal generator
antichain** `M_s`:

```text
R_s = upward_w(M_s) intersect nonterminal_Q_s
```

`M_s` may be empty. It need not describe every winning state; a sound
**subset** containing the target is enough.

For legal action `a`, let `E_a(q)` be the independently implemented exact
single-step cofactor plus first-win terminal test, returning either:

- terminal WIN for `w`;
- terminal LOSS/DRAW for `w`; or
- nonterminal `F_a(q)` at child support `s+a`.

Define the local acceptance test against *already supplied* child generators:

```text
accept_w(s, a, m):
    if E_a(m) == terminal WIN(w): true
    if E_a(m) == terminal LOSS/DRAW(w): false
    otherwise:
        exists n in M_(s+a) with F_a(m) >=_w n
```

The test uses one exact cofactor and antichain membership, not recursive game
solving. A witness can record `(s,m,a,n)`, plus the local cofactor evidence.

## The generator-only backward certificate

For every support included in the proposed certificate, and for **every
minimal generator** `m in M_s`:

```text
if claimant w is to move at s:
    some legal action a satisfies accept_w(s,a,m)

if opponent 1-w is to move at s:
    every legal action a satisfies accept_w(s,a,m)
```

All referenced child generators must belong to the **same finite
support-indexed candidate family**. Missing dependencies are errors, not
permission to recurse, fill gaps using the oracle, or assume a win.

Boundary: no generator may assert a losing or drawn terminal state for the
claimant; terminal wins are accepted directly. Every admitted nonterminal
transition decreases remaining-cell rank by one.

### Why one only checks the extremal generators

Fix `q in R_s`. By definition, `q >=_w m` for some `m in M_s`.

For each legal action, the exact residual cofactor is isotone for the fixed
beneficiary. The terminal rule is favorable-monotone under first-win stopping.
Thus if `accept_w(s,a,m)` holds, then `accept_w(s,a,q)` also holds:

- a direct terminal win cannot become a worse result for the claimant;
- or the child `F_a(q)` is at least as claimant-favorable as `F_a(m)`, so
  membership in `upward_w(M_(s+a))` is preserved;
- or `q` terminates earlier with a claimant win.

The existential case may choose a different action for each generator. The
universal case checks all legal opponent actions for each generator. Finite
induction on remaining cells then proves

```text
q in R_s  =>  claimant w has a forced win from q
```

for all admitted nonterminal q. There is **no need to enumerate the interior
of R_s**, solve q values, or unfold the continuation game tree.

This is sound only with the exact residual order, first-win terminal guards,
and a complete dependency-closed certificate family. An arbitrarily guessed
finite `M_s` does not become correct because it passes random tests.

## Algebraic containment form

Let `Pre_(s,a)(R_(s+a))` be the exact one-action preimage, treating direct
claimant terminal wins as accepted.

The check for an asserted winning-region family is:

```text
upward(M_s) subset union_a Pre_(s,a)(R_(s+a))
    when p(s) = w

upward(M_s) subset intersection_a Pre_(s,a)(R_(s+a))
    when p(s) != w
```

Because all one-action claimant-winning preimages are upward-closed, these
full-domain inclusions reduce to the generator membership tests above.
This uses the already-known antichain semiring and right-adjoint algebra;
one should **not** expand its union/intersection into a Cartesian product of
reply paths before applying the generator check.

### Cost target (not yet a measured 7x6 bound)

Given explicit generators and support dependencies, the verifier's direct
work scales with roughly:

```text
sum_over_certificate_supports(
    number_of_generators
    * number_of_legal_actions
    * cost_of_one_exact_cofactor_and_child_antichain_membership
)
```

plus candidate-certificate decoding and G2 transport. It does **not** scale
with the number of interior q states or continuation paths unless the
candidate family itself has already expanded into such a representation.

A compact polynomially sized certificate is **not guaranteed to exist**.
The remaining discovery problem is to guess/derive a sufficiently small,
dependency-closed `M_s` family and test its universal generator obligations.

## Apply to the original turn-6 objective

At position `44444`, P1 moves on turn 6 and P0 is the proposed winner.

The minimal target is a structural P0-winning family containing the exact
current q and satisfying, for the relevant root generator(s):

```text
for every P1 legal action c:
    E_c(q) is a P0 win
    or E_c(q) belongs to the supplied P0-winning region at s+e_c
```

The descendant obligations must be closed by the **same generator
certificate**, not by recursively solving each of P1's seven responses.
G2 transport may discharge structurally equivalent child/support obligations
once each, with exact action mapping.

This does **not** require which losing P1 move lasts longest, and it does not
require a globally complete W/D/L frontier if a small P0-winning subset
already contains `q(44444)`.

## How to use bounded confidence without confusing it with proof

1. **Discover:** derive/guess a small generator family using CPC parity,
   response/deadline algebra, known q order and G2 isomorphism. The oracle may
   independently screen proposed outcomes but must not be a hidden input to
   certificate semantics.
2. **Bounded empirical falsification:** choose fixed stratified samples,
   deterministic terminals, adversarial guards and a resource budget.
   Negative findings are checkpoints.
3. **Reverse verification:** discharge *all* generator-level obligations by
   direct exact cofactor and antichain membership, including universal
   opponent responses. If this succeeds, the result is a genuine theorem
   relative to the verifier's stated semantics.
4. **If reverse verification is expensive:** stop at the declared budget,
   record the candidate as empirically supported / unresolved, and refine
   its algebraic representation. Never call partial certificate coverage a
   universal proof.

## Epistemic state

- **Proven as a mathematical sufficient-condition criterion:** provided exact
  favorable cofactor isotony, terminal handling, complete generator/child
  inclusion and well-founded rank. This follows from the pre-existing
  monotone predecessor and antichain calculus; no new canonical claim ID is
  allocated.
- **Implementation-tested:** G2 reverse isomorphism witness only, in the
  separate 400-case bounded campaign. The winning-region generator checker
  has **not** yet been implemented or independently qualified.
- **Unresolved:** compact `M_s` generation; automated universally sound
  generator verifier; preclusion of certificate growth; and actual
  `44444`/root winning certificates.
- **Not claimed:** physical/history equivalence from G2, preservation of
  non-q CPC/NDC reservations, generalized polynomial-time solution,
  or promotion into qualified game-theory authority 1.2.

## Immediate next experiment (vertical only)

Attempt one **small concrete, oracle-blind P0 region certificate around
`44444`**, not another complete rank shell or broad symmetry census:

1. obtain its exact q and seven one-action abstract successors;
2. propose the smallest candidate `M_s` derived from CPC/WSL/NDC structure;
3. implement only the local `accept_w` membership checker;
4. run a bounded generator-level falsifier; record the first failing
   `(support, generator, opponent action)`;
5. if the family closes under all claimed generator obligations, independently
   validate root/action outcomes against the oracle. If it does not, retain
   the exact missing obligation and refine the candidate instead of expanding
   the continuation graph.

No new full-shell compilation, exhaustive physical move tree, or solver
hot-loop redesign is authorized by this research note.
