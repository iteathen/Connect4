# Negamax / BSFP bidirectional proof intersection

**Date:** 2026-09-13  
**Status:** solver-independent research mapping / experimental program; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and synthesis:** OpenAI ChatGPT

## Purpose

Use the fact that Connect4 currently has two exact solver architectures working from opposite directions to expose the common strategic calculus.

The forward solver is quotient-native Negamax. It starts from a requested state and asks which exact successor/dependency is sufficient to discharge the current proof obligation.

BSFP starts from geometric terminal facts and other exact certificates and propagates their consequences backward until predecessor states become classified.

The two architectures must not be merged. Their opposite execution directions are useful precisely because anything that remains semantically necessary under both orientations is strong evidence of underlying Connect Four mathematics rather than solver policy.

The research objective is therefore:

```text
forward necessity
    INTERSECT
backward sufficiency
    -> candidate calculus
```

---

## 1. Same game equations, opposite evaluation direction

For an exact finite Connect Four state `s`, write:

```text
TWin(s)   := side to move has already reached an admitted terminal-win boundary
Child(s)  := legal nonterminal successors
```

At W/D/L level, the common signed predecessor equations are:

```text
Win(s)
  := TWin(s)
     OR exists c in Child(s): Loss(c)

Loss(s)
  := not TWin(s)
     AND Child(s) nonempty
     AND for all c in Child(s): Win(c)
```

Draw is the exact residue after complete W/L closure, subject to the terminal convention.

### Negamax orientation

Negamax evaluates these equations **on demand**:

```text
parent obligation
  -> choose/probe child obligations
  -> return child proofs upward
  -> discharge parent
```

Alpha/beta, move ordering, TT admission, Branch Manager, worker topology and scheduling affect how quickly the equations are discharged. They do not redefine the equations.

### BSFP orientation

BSFP evaluates the same semantics **from known facts backward**:

```text
terminal / proved child fact
  -> predecessor operator
  -> newly proved predecessor fact
  -> next backward wave
```

Wave order, GPU batching, worksets, symbolic representation and fixed-point scheduling affect execution. They do not redefine predecessor meaning.

Thus the first exact intersection is already known:

```text
terminal authority
+ legal transition/predecessor relation
+ existential/universal proof polarity
```

The missing calculus is the structural compression of that relation.

---

## 2. Common proof-hypergraph view

Both solvers can be normalized to the same solver-independent proof object.

Conceptually:

```text
ProofFact {
  predicate,
  arguments,
  rank_or_horizon,
  context_identity
}

ProofHyperedge {
  premises,
  polarity,        // EXISTS, FORALL, or direct implication
  guards,
  resource_contracts,
  consequence,
  rank_relation,
  provenance
}
```

Examples:

```text
terminal line -> Win
one losing child -> Win predecessor
all children Win -> Loss predecessor
CPC response facts -> blocker
blocker subset -> requirement eliminated
resource cut -> no compatible safety cover
progress certificate + no safety cover -> forced Win
```

Negamax traverses this hypergraph predominantly from consequences toward premises.

BSFP traverses it predominantly from premises toward consequences.

The hypergraph semantics are the intersection.

---

## 3. Current semantic intersections already exposed

Several objects have independently appeared as necessary on both sides.

### 3.1 Support / accessibility

Forward Negamax:

```text
supportIndex
```

is part of the qualified ordinary quotient because it determines legal landing events and exact residual transitions.

Earlier prefix controls also showed that residual-cardinality summaries without support/location merge positions with different W/D/L values.

BSFP:

```text
support skeleton h
```

is the outer backward lattice in the direct symbolic recurrence, and occupied count supplies its finite rank.

Therefore support/accessibility is not solver-specific metadata. It is core calculus state.

### 3.2 Residual WSL requirements

Forward Negamax carries normalized `R0/R1` antichains and updates them exactly on each landing event.

BSFP may use the same residual universe as symbolic obligations and inverse/predecessor relations.

Therefore the WSL residual hypergraph is core calculus state.

### 3.3 Geometric terminal lines

Forward:

```text
mover singleton / geometric completion
```

is an exact stopping predicate.

Backward:

```text
69 geometric win-line schemas
```

are terminal axioms from which proof waves originate.

Thus geometric winning lines are boundary axioms shared by both directions.

### 3.4 CPC / response / event-order facts

Forward search may consume them before branching to obtain exact closure, forced responses or bounds.

Backward closure may consume the same facts as certificate premises for blockers, deadlines and predecessor facts.

CPC is therefore common mathematics whenever a proof depends on it, not a heuristic attached to one solver.

### 3.5 Typed resource contracts

C4-0010 already requires strategic proof facts depending on blockers, response resources, event order, parity reservoirs, deadlines or horizons to retain that context rather than being cached under the smaller ordinary quotient by assumption.

C4-0007/0008 require the same information for exact certificate identity and backward composition.

The center response-capacity falsifier independently reached the same conclusion: raw cell identity is insufficient; a proof resource needs response, sharing, guard, deadline and possibly parity semantics.

Typed `ResourceContract` is therefore a particularly strong intersection candidate.

---

## 4. What does not belong in the intersection

The bidirectional comparison also gives a clean exclusion test.

### Forward-only execution policy

Examples:

```text
alpha/beta windows
move ordering
TT replacement
history/killer policy
Branch Manager ready queues
worker split policy
```

These may be excellent Negamax implementation choices but have no BSFP proof meaning.

They are not calculus.

### Backward-only execution policy

Examples:

```text
wave scheduling
GPU workset compaction
symbolic node layout
fixed-point batch order
```

These may be excellent BSFP implementation choices but have no forward proof meaning.

They are not calculus.

### Representation IDs

Examples:

```text
qID
RID numeric assignment
classID
hash
BDD node address
workset index
```

Both architectures may use them, but only as representations. They are not semantic intersection merely because both happen to allocate IDs.

---

## 5. Forward necessity test

A candidate predicate belongs in the semantic state only if deleting it can change an exact future distinction or proof meaning.

For candidate predicate family `P`:

1. project forward states while forgetting `P`;
2. merge records that become equal;
3. compare exact legal transitions, terminal propositions and W/D/L values;
4. if merged records diverge later, `P` or some anti-unified refinement of it is forward-necessary.

This is the method that already falsified residual-size histograms as a complete abstraction.

The strongest forward witness is:

```text
same proposed projection
but different exact W/D/L or different legal structural continuation.
```

---

## 6. Backward sufficiency test

The reverse test asks whether the retained predicates are enough to reconstruct exact predecessor facts without importing missing history.

For candidate predicate family `P`:

1. seed geometric terminal axioms;
2. propagate exact dependencies backward using only `P` plus accepted lower facts;
3. compare against an independently solved control;
4. if propagation stalls or merges predecessors that require different conclusions, the abstraction is missing a backward distinction.

A particularly strong witness is:

```text
two predecessor contexts look identical under P
but one accepts a certificate/predecessor implication that the other does not.
```

Typed resource contracts are exactly such a distinction.

---

## 7. Bidirectional acceptance criterion

For a candidate semantic predicate `p`, define informally:

```text
ForwardNecessary(p)
BackwardNecessary(p)
```

where `BackwardNecessary` means necessary for exact backward reconstruction/closure, not merely present in one implementation.

A strong candidate for the shared calculus satisfies:

```text
Core(p)
  := ForwardNecessary(p)
     AND BackwardNecessary(p).
```

A predicate that is sufficient in one orientation but removable in the other should be challenged or anti-unified with a more fundamental relation.

The goal is not to maximize intersection size. It is to find the **smallest semantic basis** that survives both falsification directions.

---

## 8. Proof-DAG intersection experiment

The most direct experiment is to solve the **same state** independently with both architectures and normalize both proof outputs into the common hypergraph vocabulary.

### Inputs

Choose states for which both architectures can already produce exact results without importing one solver's proof into the other.

Use a progression:

```text
complete small games
-> already-qualified frozen 7x6 roots
-> early center-opening prefixes as capabilities improve
-> empty standard root
```

### Normalize both proofs

Replace solver-specific records with:

```text
terminal-line axiom
support/event fact
residual requirement fact
CPC/parity fact
response relation
resource contract
blocker certificate
requirement elimination
race/deadline fact
EXISTS dependency
FORALL dependency
W/D/L consequence
```

Canonicalize symmetry/renaming where appropriate and retain horizons/guards.

### Compare

Partition normalized facts/relations into:

```text
common
Negamax-only
BSFP-only
semantically equivalent but differently factored
```

The last category is particularly important. Anti-unification of differently factored proofs may reveal the missing general theorem.

---

## 9. The expected clean intersection

The current evidence suggests a kernel close to:

```text
Geometry:
  cells, support chains, winning hyperedges

State:
  support/accessibility
  side/rank parity
  normalized R0/R1 residual requirements

Constraint algebra:
  event precedence
  owner / XOR / CPC relations
  response obligations
  typed resource contracts
  blocker subset/upward closure
  deadlines / races

Proof algebra:
  implication
  EXISTS composition
  FORALL composition
  resource-compatible conjunction
  antichain/dominance normalization
  least/greatest fixed-point closure
```

Everything else should be treated as suspect until it survives the bidirectional test.

---

## 10. Mapping the new resource-cut theorem

The typed per-pivot resource-cut certificate is an ideal intersection test.

### Forward Negamax consumption

At a forward state, NDC may derive:

```text
NoCompatibleCover(U)
```

without enumerating every legal continuation that would instantiate the conflicting response policies.

Negamax can consume this as an exact strategic bound or closure fact **only at the strength actually proved**.

`NoCompatibleCover` by itself is not automatically a win. A complete win still needs the corresponding progress/liveness or predecessor theorem.

### Backward BSFP consumption

The same resource-cut certificate is a backward hyperedge:

```text
requirement/resource premises
  -> NoCompatibleCover(U).
```

If a separately established progress certificate says that the attacker must eventually complete when the defender has no compatible safety cover, BSFP can propagate the resulting W/L consequence to predecessors.

The cut certificate itself is identical in both orientations.

This is exactly the kind of object the bidirectional method is intended to discover.

---

## 11. Safety / progress becomes a bidirectional test

The earlier decomposition:

```text
Win = Safety + Progress
```

can now be tested from both ends.

Forward Negamax naturally exposes **progress witnesses** because a winning proof contains at least one exact value-preserving action at the winning side's decision nodes.

Backward BSFP naturally exposes **sufficient progress generators** because a predecessor joins the winning attractor only when terminal/proved facts propagate to it under the exact predecessor operator.

The intersection between:

```text
forward winning witness structure
and
backward winning-attractor dependency structure
```

is a promising way to derive the missing progress calculus.

This is likely more informative than attempting to invent progress rules in isolation.

---

## 12. Concrete research program

### Phase A — small complete games

For 4x3 connect-3, 4x4 connect-4, 5x3 connect-4 and 4x5 connect-4:

1. produce exact Negamax proof DAGs;
2. produce exact BSFP proof DAGs;
3. normalize both to the common IR;
4. compute semantic intersections and anti-unifications;
5. remove candidate predicates one at a time and rerun both directions;
6. record the minimal bidirectionally sufficient basis.

These games are important because completeness can be checked exhaustively.

### Phase B — frozen 7x6 roots

Repeat on roots already within both solver capabilities.

Look specifically for structural proof shapes that survived the small-game basis unchanged.

### Phase C — center resource-capacity branches

Use:

```text
451123
451132
```

as targeted stress cases for typed resource contracts and response-capacity cuts.

The aim is not to import their exact W/D/L into the structural proof. It is to ask whether both solver directions independently rediscover the same resource interfaces.

### Phase D — empty root

Only after the proof vocabulary stabilizes bidirectionally should the empty-root proof be treated as a completeness test of the calculus.

---

## 13. Strong falsifiers

The intersection hypothesis is weakened if:

1. Negamax requires a semantic distinction that BSFP cannot express without concrete move history;
2. BSFP requires a predecessor distinction that the exact forward quotient can safely erase;
3. normalized proofs share almost nothing except ordinary game-tree edges;
4. typed resource cuts only work after importing historical named-rule compatibility rather than deriving contracts from generic event semantics;
5. the common IR grows until it is effectively a materialized game tree;
6. progress remains expressible only as recursively selected move sequences and has no compact backward equivalent.

Any of these would identify the actual boundary of the searchless program.

---

## 14. Current conclusion

Negamax and BSFP should remain separate solvers.

But their opposite directions give a new method for discovering the theory:

```text
Negamax asks what must be distinguished to prove this state.
BSFP asks what is sufficient to regenerate this state from exact consequences.
```

The shared calculus is the set of relations that survive both questions.

The leading intersection candidates are now:

```text
support/event accessibility
WSL residual requirements
geometric terminal lines
CPC ownership/parity relations
response obligations
typed resource contracts
blocker/upward closure
deadline/race relations
EXISTS/FORALL predecessor composition
antichain/fixed-point closure
```

The next decisive artifact should be a **common proof IR and bidirectional proof-DAG differential harness**, not another standalone named strategic rule.
