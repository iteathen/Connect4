# Equivalence-first W/D/L frontier quotient

**Date:** 2026-10-16  
**Status:** exact research result + qualified controls; no IsoGraph authority promotion  
**Owner:** \`research/semantic-quotient\`

## Result

The standard-7x6 W/D/L frontier compiler should not operate on move histories
or concrete support embeddings as independent proof paths.

The exact useful reduction stack is

\[
\boxed{
\text{history}
\to
q
\to
\text{G2 support-fiber class}
\to
\text{minimal W/D/L antichain boundary}.
}
\]

The G2 quotient has now been reconstructed independently, integrated into the
actual W/D/L compiler, and checked by exact frontier transport.

The result confirms the equivalence-first direction while also locating its
limit: after quotienting exact structural fibers and applying antichain
dominance, generic additional symmetry/equivalence layers produce little
further reduction on the rank-33 boundary.

---

## 1. Exact fiber equivalence

For support \(s\), let \(F_s\) contain:

- the future cells;
- gravity-chain cover relations;
- frontier markers;
- nonempty residual winning-line hyperedges;
- residual-to-cell incidence.

Let

\[
F_s\cong F_t
\]

under a bijection preserving those relations.

This induces an exact order isomorphism

\[
\Phi_{s,t}:Q_s\to Q_t
\]

on the transformed residual state lattice.

Because legal action/frontier events, exact cofactors, terminal completion, and
child fibers are preserved under the isomorphism, the Bellman operator
commutes:

\[
\boxed{
\Phi_{s,t}(B_s(X))=B_t(\Phi_{s,t}(X)).
}
\]

Therefore exact W/D/L boundaries transport:

\[
\boxed{
U_t=\Phi_{s,t}(U_s),
\qquad
L_t=\Phi_{s,t}(L_s).
}
\]

This is stronger than horizontal reflection. Reflection is only one particular
fiber isomorphism.

---

## 2. Reconstructed G2 census

A new canonicalizer uses gravity to avoid general graph isomorphism.

Each future component is a directed chain. Therefore an isomorphism may only
permute future chains of equal length. The canonicalizer enumerates those
permutations, relabels future cells, canonicalizes the residual hyperedge
family, and selects the lexicographically minimal exact fiber image.

Run:

\[
\texttt{38939595902}
\]

reproduced the historical exhaustive G2 counts exactly for ranks 30–35 and
extended the census through rank 42.

Across ranks 30–42:

\[
44{,}844\text{ concrete supports}
\to
21{,}167\text{ exact G2 fibers}.
\]

Thus

\[
\boxed{
44{,}844/21{,}167\approx2.1186.
}
\]

Selected ranks:

| rank | supports | reflection classes | exact G2 fibers |
|---:|---:|---:|---:|
| 30 | 15,330 | 7,702 | 7,593 |
| 33 | 4,809 | 2,420 | 2,223 |
| 35 | 1,709 | 864 | 677 |
| 36 | 924 | 472 | 315 |
| 37 | 462 | 236 | 119 |
| 38 | 210 | 110 | 35 |
| 39 | 84 | 44 | 8 |
| 40 | 28 | 16 | 3 |
| 41 | 7 | 4 | 1 |
| 42 | 1 | 1 | 1 |

The largest observed class through rank 42 contains 26 concrete supports.

---

## 3. Compiler integration

The canonical W/D/L compiler now keeps one representative per exact G2 fiber.

For an equivalent support, it:

1. loads the representative \(U/L\) frontiers;
2. constructs the exact residual-shape bijection;
3. transports both packed frontier sets;
4. transports them back;
5. requires exact set equality before accepting reuse.

No oracle value is used by the transport.

Complete rank-33–42 run:

\[
\texttt{38939379587}.
\]

Observed:

\[
11{,}188\text{ concrete supports}
\]

reduced to

\[
4{,}676\text{ actually computed fiber representatives}
\]

with

\[
6{,}512\text{ exact transports}.
\]

No reflection fallback was needed:

\[
\boxed{\texttt{mirrorFallbackReused}=0}.
\]

Thus the full compiler is now fiber-native rather than reflection-native.

---

## 4. Rank-33 exact storage/proof reduction

The already-qualified complete rank-33 boundary was re-encoded using only one
representative per G2 class.

Run:

\[
\texttt{38939899999}.
\]

Concrete supports:

\[
4{,}809
\to
2{,}223\text{ representatives}.
\]

All

\[
2{,}586
\]

discarded support frontiers were reconstructed through G2 transport with

\[
\boxed{0\text{ mismatches}}.
\]

Generator occurrences:

\[
8{,}049{,}016
\to
3{,}981{,}652,
\]

or

\[
\boxed{2.021527\times}
\]

compression.

Raw boundary bytes:

\[
95{,}655{,}410
\to
47{,}453{,}067,
\]

or

\[
\boxed{2.01579\times}.
\]

Therefore one representative frontier per fiber is not merely a theoretical
quotient. It reconstructs the complete rank-33 result exactly.

---

## 5. Runtime effect

Prior complete rank-33–42 compiler:

\[
463{,}266.887038\text{ ms}
\]

in run

\[
\texttt{38937734403}.
\]

G2-quotiented compiler:

\[
400{,}263.951857\text{ ms}
\]

in run

\[
\texttt{38939379587}.
\]

So measured end-to-end compiler reduction is approximately

\[
\boxed{1.1574\times}.
\]

This is smaller than the support-count reduction because expensive fibers are
not uniformly distributed: eliminating many cheap embeddings does not remove
the hardest representative products.

---

## 6. Tested stronger equivalences

### 6.1 Claim-relative W/D/L boundary equivalence across distinct G2 fibers

At rank 33, G2 representatives were grouped by:

- exact residual-shape poset relation;
- exact \(U\) boundary;
- exact \(L\) boundary;

under an explicit tested canonical shape-index bijection.

Run:

\[
\texttt{38940088449}.
\]

Result:

\[
2{,}223\text{ G2 fibers}
\to
2{,}223\text{ tested W/D/L value classes}.
\]

No additional cross-G2 collapse appeared under this exact alignment.

This is a negative result, not a theorem that no coarser value isomorphism can
exist under any possible relabeling.

### 6.2 Automorphisms inside one G2 fiber

Run:

\[
\texttt{38940367841}.
\]

Only

\[
44/2{,}223
\]

rank-33 fibers have a nontrivial tested automorphism group, and every such group
has size 2.

Generator orbit quotient:

\[
3{,}981{,}652
\to
3{,}933{,}415,
\]

or only

\[
\boxed{1.012263\times}
\]

global compression.

Inside the 44 symmetric fibers themselves the compression is almost exactly
twofold:

\[
97{,}980
\to
49{,}743.
\]

So automorphism quotienting is exact but not globally load-bearing at rank 33.

---

## 7. Negative representation controls

### Generator-suffix DAG

A local exact-language replay used the qualified compact rank-33 artifact
(\`12062426941\`).

Raw prefix trie:

\[
27{,}496{,}374\text{ nodes}.
\]

Equivalent-suffix reduction:

\[
7{,}385{,}845\text{ DAG nodes}.
\]

This is a

\[
3.722847\times
\]

reduction relative to the trie, but the DAG is still larger than the flat
generator count:

\[
7{,}385{,}845
>
3{,}981{,}652.
\]

Therefore generic suffix equivalence is not a storage improvement over the
current antichain representation.

The corresponding Actions job encountered runner setup failure before checkout;
the number above is a local exact replay over the already-qualified artifact,
not independent CI qualification.

### Naive ROBDD Apply

A straightforward sequential term-BDD + OR/Apply prototype was bounded locally.

It did not complete within 120 seconds on either:

\[
33{,}278
\]

or

\[
3{,}235
\]

generator lower fronts.

This rejects only that naive construction strategy. It does not reject
optimized monotone BDDs, line-first incidence decision diagrams, or other
structured Boolean representations.

---

## 8. Consequence

The user's equivalence reduction is correct, but the useful equivalence has a
specific level.

Do **not** reason over:

\[
\text{individual histories}
\]

or

\[
\text{concrete support embeddings}.
\]

Reason over:

\[
\boxed{
\text{exact G2 fiber representative}
+
\text{extremal W/D/L boundary}.
}
\]

Within one fiber, the antichain already applies a stronger relation than
equivalence: one extremal generator proves every dominated interior state.

The rank-33 evidence says the easy additional quotients are now largely
exhausted:

- reflection: subsumed by G2;
- other G2 isomorphism: useful;
- cross-G2 identical W/D/L boundary under tested alignment: none;
- fiber automorphism: very small global gain;
- generic suffix DAG: negative storage result.

So the next large reduction should not come from searching for another generic
symmetry.

It must factor the **Bellman/antichain operation itself**, or exploit the
previously measured line-first incidence decomposition where the standard 7x6
geometry has a small crossing-cell frontier.

---

## Current exact proof unit

The working proof object is now:

\[
\boxed{
[F_s]\;,\;U_{[F_s]}\;,\;L_{[F_s]}
}
\]

rather than a move path or physical support.

A concrete support \(s\) is evaluated through its fiber canonicalization and
transport map.

This is the precise equivalence-first form of the W/D/L construction.

---

## Claim boundary

- G2 transport preserves ordinary W/D/L frontier semantics; it does not assert
  physical-board or history identity.
- Stronger path-dependent CPC/NDC certificate context is not automatically
  transportable unless its premises are included in the isomorphism profile.
- The rank-33 cross-G2 value-equivalence test is a scoped negative result, not a
  proof of global minimality of G2.
- The remaining rank-32-and-earlier scaling wall is an operation/factorization
  problem, not evidence that the W/D/L recurrence or G2 quotient is incorrect.

---

## 9. Local reverse-checkable G2 certificate (2026-10-16 follow-up)

A proposed G2 equivalence now has a compact **witness**, independent of
enumerating abstract q states: a partial permutation `f` of the seven active
gravity chains, with full columns denoted by `-1`.

The independent reverse verifier is:

- `research/isograph/discovery/2026-10-16-oracle-compiled-frontier/g2-reverse-certificate.mjs`
- reproducible budgeted control:
  `research/isograph/discovery/2026-10-16-oracle-compiled-frontier/g2-reverse-certificate-control.mjs`
- predeclared plan: `G2_REVERSE_CERTIFICATE_PLAN_0_1.md`
- executed evidence: `G2_REVERSE_CERTIFICATE_RESULTS_0_1.json`

The verifier **does not trust the canonical G2 key**, invoke the solved oracle,
construct W/D/L frontiers, or descend a continuation tree. It independently
reconstructs the 69 geometric winning lines and checks that the witness:

1. bijects all active future chains, preserving depth and playable frontiers;
2. bijects the nonempty support-relative residual hyperedge sets;
3. preserves each mapped legal successor fiber;
4. commutes with all atomic owner-true/owner-false residual cofactors, including
   the empty terminal requirement;
5. preserves basic zero-reservation CPC event parity along mapped row coordinates.

### Why this closes an entire abstract q fiber without enumeration

Write `f(R)={f(r): r in R}` for a family of residual requirements and `x`
for a playable event. Incidence preservation gives

```text
f(r \\ {x}) = f(r) \\ {f(x)}
x in r iff f(x) in f(r)
f(Min(R)) = Min(f(R))
```

so the owner-true and owner-false transitions commute with `f` for **every**
abstract residual family, not merely the tested witnesses. Mapped active chains
give a legal-action bijection, while child-fiber congruence inductively repeats
the property at the next smaller remaining-cell rank. By the exact ordinary
Bellman recurrence, abstract W/D/L, mapped action values, and the transported
optimal-action set agree. This is a mathematical implication conditioned on a
*valid certificate* and the ordinary first-win semantics, not a statistical
assertion based on a sample of continuations.

### New implementation evidence

The bounded seeded control executed in isolated JavaScript V8 against the
committed module source, with Node imports shimmed (not a maintained Node-26
test or external reproduction):

```text
ranks in sampling frame                 33, 34, 35, 36
support vectors in frame                 10,396
exact G2 fiber classes in frame           4,509
eligible non-mirror rep/member pairs      1,467
fixed-seed draws                           400
distinct sampled pairs                    354
known non-mirror boundary pairs             3
invalid witness cases rejected              3
accepted false mappings                     0
atomic cofactor checks                  38,246
child-residual-shape checks             15,952
basic CPC-control checks                 3,021
recursive game states                        0
oracle queries                               0

frame construction                     3,671 ms
local reverse verification               211 ms
total                                   3,883 ms
```

The one-sided **nominal** 95% zero-failure upper bound for the defined IID
rank-mixture sampling population would be `0.7461%`. The run used a fixed
pseudorandom seed, so this is conditional on the ideal-draw model, not an
unqualified frequentist coverage guarantee. It does not cover all support
ranks or all q states.

The earlier independently maintained 316-position/1,586-transition
oracle-relative check and G3 1,592,642 abstract q-pair/3,929,368 action-value
checks remain **separate existing evidence**; they were not rerun here.

### Forward objective — not another equivalence census

The G2 *equivalence* certificate is now cheap. That does not yet give a
winning-move certificate for a specific early position. The next vertical
research target is a compact proposed winning region/policy that can be
verified **backward**, using quantified local cofactor containment:

```text
q in R and claimant to move  -> exists a certified action into R
q in R and opponent to move  -> every legal action stays in R
R excludes losing/draw terminals for the claimant
each transition strictly decreases remaining-cell rank
```

If these universally quantified containment obligations are discharged by
finite algebraic antichain/constraint certificates rather than enumerating
their state instances, membership in `R` becomes an exact winning certificate.
Until that universal verification exists, samples can guide candidate
discovery but cannot promote it to a proof.

**Hard boundary:** G2 does *not* transport physical/history realizability,
reserved event resources, deadlines, response constraints, or non-q CPC/NDC
proof context. Those need explicit separate guard-preserving maps.
