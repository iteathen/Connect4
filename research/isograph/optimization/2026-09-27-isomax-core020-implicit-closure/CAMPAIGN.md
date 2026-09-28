# IsoMax Core 0.20 implicit-assertion closure campaign

**Status:** active exact closure campaign  
**Owner:** `research/semantic-quotient`  
**Work branch:** `work/isomax-core020-primitive-semantics-20260927`  
**Author-local date:** 2026-09-27  
**Assertion authority:** qualified Core 0.19 implicit-assertion discipline  
**Primitive discipline:** qualified Core 0.20  
**QU:** qualified QU 0.1  
**NEI:** qualified NEI 0.4 where an identity query is actually made

## Goal

Recursively derive every **material exact implicit assertion found by the
selected closure procedure** from the current IsoMax Core-0.20 primitive
successor, feeding admitted results back as premises until one complete pass
adds no assertion and no material support refinement.

The stop state is an operational fixed point, not a claim of universal theorem
prover completeness.

## Frozen represented input

All rounds pin these branch blobs:

- primitive semantic contract:
  `ISOMAX_CORE020_PRIMITIVE_SEMANTICS_0_1.md`
  blob `61aad6a33833b0bbf7befa51078eeec6c8eff16c`;
- raw finite domain:
  `ISOMAX_CORE020_RAW_DOMAIN_0_1.isg`
  blob `e2a3da5e806ee2dbd5424a17ed0b305a166c41a6`;
- natural numerals:
  `ISOMAX_CORE020_NATURAL_NUMERALS_0_1.isg`
  blob `33478c141519c645aecee4df26586068e12d638c`;
- primitive game:
  `ISOMAX_CORE020_PRIMITIVE_GAME_0_1.isg`
  blob `7597f687f2df302acec35d950402d63b18646e38`;
- primitive ordering:
  `ISOMAX_CORE020_PRIMITIVE_ORDERING_0_1.isg`
  blob `fe9affc47400697bca81dfc13984395f9078b446`;
- primitive execution:
  `ISOMAX_CORE020_PRIMITIVE_EXECUTION_0_1.isg`
  blob `7d4bc3358fc42ae761d4c54f60beb7c8750fa82c`;
- pinned arithmetic support:
  blob `fde4915b3a056430e0cb7a3a327e26abc1c7b09b`;
- pinned finite-data support:
  blob `c0479ac1de1a1c8ff5737221133601618b1a56cf`.

The five newer owner-branch commits under
`2026-09-27-isomax-second-50-percent/` are concurrent optimization evidence,
not part of this frozen primitive assertion base.

## Assertion normalization

The campaign admits semantic assertion bodies, not unlimited syntactic variants.

The following normalize to one body:

- alpha-renaming of bound variables;
- reordered conjunction/disjunction where the represented operator is
  semantically commutative;
- duplicate premise insertion;
- repeated derivation of the same body through another support path;
- a biconditional direction already represented explicitly;
- trivial conjunction packaging/unpackaging that adds no semantic content;
- substitution of one already-proved exact synonym for another.

A new support path for an existing assertion is recorded as a **support
refinement**, not a new assertion.

This avoids an artificial infinite closure from tautological syntax while
preserving materially distinct semantic consequences.

## Admission record

Every admitted IA has:

```text
id
round
body
support_mode = EXACT
scope
premises
governing_authority
derivation_family
witness
QU_dependencies
NEI_scope if any
provenance
side_conditions
downstream_relevance
normalized_depth
```

## Repeated inference families

### L — primitive logical closure
Implication/biconditional application, contradiction, equality,
quantifier instantiation/generalization, substitution and extensionality.

### D — finite data/constructor closure
Finite-extension uniqueness, constructor/field functionality, extensional
object equality, involutions and exact finite enumeration.

### R — relation/function closure
Functionality/totality, composition, commutation where proved extensionally,
congruence and relation transport.

### A — arithmetic closure
Peano successor, finite order, exact rank, parity, boundedness and consequences
of represented addition/order relations.

### C — computation/transition closure
Deterministic successor, well-founded dependency, induction over rank, finite
recurrence, task-control transitions and separation of semantic versus
execution state.

### N — scoped identity closure
Only where current exact structure answers a declared identity question.
No high-level label supplies identity evidence.

### O — objective/value closure
Consequences whose scope is ordinary scalar W/D/L or advisory ordering,
kept separate from occurrence, proof and action-label identity.

## Iteration

```text
A0 = explicit represented assertion schemas
A1 = A0 + round-1 admitted IAs
A2 = A1 + round-2 admitted IAs
...

stop at Ak when a complete L/D/R/A/C/N/O pass over Ak:
  new assertion bodies = 0
  material support refinements = 0
```

Every round is committed before the next round starts.

## Rejection discipline

Do not admit a candidate with:

- a hidden reachability assumption;
- a missing primitive definition;
- unrepresented scheduling/fairness/timing;
- an unproved claim that two identity scopes coincide;
- an unguarded first-win/cofactor commutation;
- a performance conclusion from semantic equivalence;
- a value/action/proof identity strengthening not justified by the exact scope.

Such candidates remain residuals, not IAs.
