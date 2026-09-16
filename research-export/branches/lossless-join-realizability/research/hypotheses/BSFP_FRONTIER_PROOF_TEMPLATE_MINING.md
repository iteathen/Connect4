# BSFP frontier proof-template mining

**Status:** live research hypothesis / instrumentation design. No production solver change.

**Research direction:** Josh Oshiro.

## Purpose

BSFP does more than classify ownership regions. Every retained frontier record is produced by a finite exact derivation from terminal axioms, cofactors, alternating existential/universal predecessor composition and first-win subtraction.

That means the backward solver is already generating concrete proofs. The missing opportunity is to preserve enough derivation structure to discover recurring theorem shapes, canonicalize them with Isometric claim-relative signatures, and then attempt to prove those shapes independently as reusable static calculus rules.

The intended loop is:

```text
exact BSFP instance proof
-> canonical proof template
-> repeated cross-support/cross-geometry pattern
-> Isometric structural theorem attempt
-> independent proof/falsification
-> accepted theorem feeds BSFP as seed/absorber/macro
```

This attacks the calculus gap from the BSFP end without turning solved outputs into built-in premises.

## 1. Frontier records are minimal semantic certificates

Fix support `U` and side to move.

### P0 Win frontier

A minimal Win generator `g` denotes

```text
all P0 ownership assignments P with g subseteq P are exact P0 wins.
```

Because the Win boundary is normalized minimally, no retained strict subset of `g` already generates the same upward winning region.

Thus `g` is a minimal P0-ownership sufficient condition for exact P0 win in the represented symbolic domain.

### P0 Loss frontier

A maximal P0-Loss cap `c` denotes

```text
all P0 ownership assignments P with P subseteq c are exact P1 wins.
```

Let

```text
b = U \ c.
```

Then every represented assignment in the cap has

```text
b subseteq P1Ownership.
```

By maximality of `c`, `b` is the dual minimal P1-owned sufficient condition for the represented P1-win family.

Therefore the existing two-frontier BSFP already computes minimal winner certificates for both players, merely in two coordinate orientations.

`BSFP_DUAL_POSITIVE_CERTIFICATE_FRONTIERS.md` records the direct positive representation of this duality.

## 2. Exact proof operators already present in the recurrence

A research-only provenance layer can attach a derivation node to every candidate/retained certificate.

The semantic operators are small.

### Terminal axiom

```text
TerminalWin(player, landing, line, requiredOwnership)
```

asserts the exact first-win terminal condition represented by the terminal frontier generator.

### Exact cofactor / predecessor transport

```text
Cofactor(playerClaim, mover, landing, childProof)
```

records owner-labelled Boolean substitution through one legal support event.

### Existential action choice

When the beneficiary is the mover, upward-family union means one action proof is sufficient:

```text
ExistsAction(action, proof)
```

The retained generator is inherited from one exact action branch, modulo normalization.

### Universal action conjunction

When the beneficiary is the opponent, upward-family intersection combines one proof from every mover action:

```text
ForAllActions([
  ActionProof(a0),
  ActionProof(a1),
  ...
])
```

The ownership prerequisite is the union/OR of the component positive generators.

In the current P0-oriented Loss-cap implementation the same logic appears as downward-cap AND products. Under support complement it is exactly the same positive universal conjunction.

### First-win exclusion

Terminal subtraction contributes an explicit guard:

```text
ExcludeEarlierTerminal(terminalRequirement, survivingProof)
```

or, in the dual-positive form, the ownership fact that blocks the mover's terminal requirement.

This guard must remain visible. A proof obtained only after deleting an earlier terminal alternative is not equivalent to an unguarded child proof.

### Normalization/subsumption

Antichain normalization is not a new game theorem.

If certificate `a` semantically subsumes certificate `b` for the same claim, retaining `a` and discarding `b` is proof compression:

```text
SubsumedBy(a,b).
```

Equal generators may have several alternative derivations. Research mode may retain a bounded alternative list or canonical cheapest proof; production need not.

## 3. Canonical proof DAG

Research mode should hash-cons proof nodes by exact typed content rather than store recursive object trees.

Conceptual node schema:

```text
ProofNode {
  claimKind,          // Win, Safe/no-win, terminal, etc.
  beneficiary,
  operator,
  supportContext,
  ownershipCondition,
  children[],
  action/event data,
  terminal alternatives,
  resource/deadline guards,
  provenance scope
}
```

The raw physical proof DAG is still too specific for theorem discovery. Canonicalization happens in stages.

## 4. Canonicalization hierarchy

### Stage A — exact symmetry

Canonicalize under exact board automorphisms first:

```text
horizontal reflection
player complement where claim semantics are relabeled accordingly.
```

Preserve the inverse action/provenance map.

### Stage B — support-local residual IDs

Replace raw cell masks where possible by the exact support-local residual/incidence classes from `BSFP_SUPPORT_LOCAL_RESIDUAL_BASIS.md`.

This removes global WSL naming noise while keeping exact local relations.

### Stage C — claim-relative Isometric signature

For the conclusion actually proved by the node, compute the load-bearing dependency cone in the Isometric sense:

```text
support/accessibility
CPC/phase/ownership relations
residual/cofactor incidence
resource/deadline state
terminal alternatives
required provenance only if observed.
```

Canonicalize only this cone.

Two proof nodes may then share a theorem-template ID even when their full BSFP states are not equal.

This is theorem reuse, not q-state merging.

## 5. Why this is different from ordinary memoization

O3 already performs one exact operation-level reuse:

```text
same residual pair + same input
-> compute cofactor once across many occurrences.
```

Proof-template mining asks a broader question:

```text
do physically different BSFP derivations instantiate the same structural theorem?
```

Examples of possible repeated classes include:

```text
immediate singleton terminal
distinct double-completion overload
forced single response
same-column stutter preservation
response-capacity circuit
blocker/no-win cover
mixed-cofactor obligation birth
terminal-subtraction pattern
neutral-reservoir transport.
```

The list is discovery guidance only. A repeated shape does not become a theorem until Isometric proves its guards.

## 6. BSFP-to-Isometric theorem discovery loop

### Step 1 — collect exact instance proofs

Run exact BSFP on complete small controls and bounded larger supports with proof instrumentation enabled.

Do not use external solved labels to construct templates.

### Step 2 — retain only load-bearing frontier proofs

Prioritize proofs attached to:

```text
retained minimal winner generators
retained one-sided Safe/no-win generators when interval BSFP is enabled
records responsible for large candidate absorptions
root/subroot classifications.
```

Dominated/transient candidates may be sampled separately for performance analysis.

### Step 3 — canonicalize

Apply:

```text
reflection/player relabel
support-local IDs
claim-relative dependency-cone canonicalization.
```

### Step 4 — census recurring templates

For each canonical template record:

```text
instance count
supports/ranks/geometries
certificate size
operator depth
terminal/resource/deadline guard profile
candidate/proof work attributable to the instances.
```

### Step 5 — structural theorem attempt

Feed a frequent/high-value template to Isometric and attempt to derive it from the accepted structural vocabulary without BSFP enumeration.

The BSFP instances are examples/falsification controls, not universal proof authority.

### Step 6 — feed accepted theorem back

Once independently proved, compile the theorem into one or more BSFP uses:

```text
frontier seed
one-sided interval certificate
candidate absorber
forced macro transition
operation-specific reuse key
constraint-sidecar fact.
```

Then measure whether the theorem removes more runtime work than its certification cost.

## 7. Minimal proof-term semantics for the positive dual frontier

Under `BSFP_DUAL_POSITIVE_CERTIFICATE_FRONTIERS.md`, all winner/safety frontiers are minimal positive certificate antichains for beneficiary player `p`.

That gives one uniform proof grammar:

```text
Proof_p ::= Terminal_p(q)
          | Cofactor(event, Proof_p)
          | Exists(action, Proof_p)
          | ForAll({action_i : Proof_p_i})
          | FirstWinGuard(g, Proof_p)
          | StructuralCertificate(type, guards, payload)
```

where:

```text
Exists
```

is used when `p` controls the current move and

```text
ForAll
```

when the opponent controls it.

This grammar is very close to Isometric's guarded theorem-composition contracts. The main difference is that BSFP obtains the proof bottom-up from exact fixed-point computation while Isometric attempts to prove reusable classes directly.

## 8. Proof minimization versus ownership minimization

A minimal ownership generator is not necessarily a minimal proof DAG.

Two derivations can yield the same ownership generator with very different structural explanations.

Therefore keep the distinctions:

```text
semantic certificate minimality
proof-node count/cost
claim-relative theorem identity.
```

For discovery, useful policies include:

```text
retain one canonical shortest proof;
retain all distinct top-level operator classes up to a bound;
retain proofs with the strongest reusable structural signature;
```

No production policy is implied.

## 9. Rejection certificates are valuable too

Isometric guarded composition is fail-closed and records the first missing premise.

The same should be done when a BSFP proof template fails to generalize.

For each attempted theorem class record the smallest separating fact:

```text
support/accessibility mismatch
terminal alternative
resource collision
deadline order
residual correlation
player/turn mismatch
provenance dependence.
```

Those separators are direct evidence about the calculus gap.

A failed template is therefore useful if it identifies which relation BSFP needed that Isometric's current vocabulary omitted.

## 10. Runtime use of learned templates

During a later combined Isometric+BSFP application, a template learned and independently proved offline can be recognized at runtime from exact structural guards.

A template discovered during the current runtime solve may also be reused later in that solve **only after** its reuse relation is itself certified for the new occurrence. One exact instance does not authorize universal extrapolation.

External solved databases remain qualification/falsification only.

## 11. Instrumentation cost boundary

Full proof DAG construction must not contaminate production benchmarks.

Use two modes:

```text
research proof mode:
  bounded hash-consed proof DAG + counters + signatures

production mode:
  no proof DAG, or only accepted compact theorem/certificate IDs needed by the algorithm.
```

Proof instrumentation should be run on complete small games and selected high-value supports before any large 7x6 attempt.

## 12. First experiment

On 4x3 c3, 4x4 c4, 5x3 c4 and 4x5 c4:

1. decorate exact frontier generation with proof nodes;
2. round-trip every retained proof against its frontier ownership condition;
3. require every proof conclusion to match the existing exact classifier;
4. canonicalize reflection/player complements;
5. count duplicate exact proof DAGs;
6. apply claim-relative canonicalization for the already-qualified theorem corpus;
7. measure how many physical frontier proofs collapse to each theorem class;
8. compare those classes to known Isometric singleton, forced-response and response-capacity structures.

Then run the same instrumentation on selected 6x5 high-rank supports where candidate work is large.

Primary metric:

```text
exact BSFP candidate/proof work represented by a recurring theorem class
-----------------------------------------------------------------------
cost of recognizing/certifying that class directly.
```

## 13. Falsifiers

- a proof DAG conclusion fails to imply its retained frontier record;
- terminal subtraction/first-win dependence disappears from canonicalization;
- proof instances with different required resource/deadline guards receive one theorem ID;
- claim-relative equality is used to merge full BSFP states;
- a repeated empirical proof pattern is promoted without an independent theorem;
- proof instrumentation changes the exact frontier or production timing evidence;
- the canonicalization cost exceeds any plausible runtime reuse and yields no calculus insight.

## Disposition

Promote **frontier proof-template mining** as the main BSFP-to-Isometric discovery mechanism after the first cheap representation experiments.

It directly implements the program's two-ended calculus strategy:

```text
Isometric:
  derive general guarded laws top-down.

BSFP:
  generate exact minimal instance proofs bottom-up.

matching layer:
  identify recurring claim-relative proof structure.
```

The desired end state is that high-value recurring BSFP proof templates disappear from brute symbolic construction because Isometric has promoted them into directly certified laws.
