# Clear-winner core: internal compatibility audit

**Date:** 2026-09-09  
**Status:** research classification; maintained source and `main` unchanged.  
**Research lineage:** continues `research/forced-macro-implication-2026-09-09`.

## Purpose

The earlier clear-winner classification identified mechanisms likely to survive into the final solver in some form. This audit applies the same compatibility discipline *inside that group*. A mechanism can be individually compelling and still conflict with another clear winner if both are implemented literally.

The result is therefore a refinement of the earlier classification, not a rejection of its underlying principles.

## Reclassified core

### Tier A — architectural invariants; design around these together

These are mutually reinforcing and should be treated as one nucleus rather than independent toggles:

1. **Residual win-space as semantic state.**
2. **A fixed residual-requirement universe (currently 625 IDs for 7x6) as the precomputation domain.**
3. **Minimal physical/support state sufficient for legal future placement and timing, not full historical colored-board state.**
4. **Fixed-width, allocation-free recursive execution.**
5. **Precomputed/incremental state transitions and metadata.**
6. **Exact proof/bound authority separated from ordering-only hints.**

These six define the language and execution discipline. No material incompatibility is currently known among them.

Important qualification: the 625-ID universe does **not** imply storing a dense 625-bit or 625-entry object per player per node. It is a static dictionary/precomputation domain; the hot state must still use a compact representation.

### Tier B — exact normalization/bounds; highly likely, but must be one pipeline

7. **Immediate-win tactical closure.**
8. **Double-immediate-threat forced-loss closure.**
9. **Forced single-response restriction.**
10. **Forced macro-edges / decision-state exposure.**
11. **Cardinality earliest-win bounds.**

These should not be five unrelated policy layers. The compatible shape is a single normalization/proof pipeline:

```text
state transition
  -> update residual/support state incrementally
  -> exact tactical closure
  -> follow forced replies without exposing transit states
  -> apply cheap exact semantic bounds
  -> expose a genuine decision state
  -> probe/search/cache according to decision-state policy
```

The order matters. If TT lookup/admission occurs before forced normalization, intermediate states reappear and macro-edge benefits are partly defeated. If cardinality metadata is recomputed by scanning rather than carried in the residual state, it damages the fixed-width envelope.

### Tier C — very likely mechanisms whose final realization depends on the normalized state

12. **Residual automorphism collapse.**
13. **Neutral/dead-choice compression.**
14. **Compact exact TT identity.**

These remain likely winners, but their current literal prototypes should **not** be frozen because they interact strongly with each other and with support representation.

## Pairwise / cluster compatibility

### Residual state × minimal support state — 5/5

These are complementary halves of the same exact state. Residual obligations describe what can still win; support state describes which future placements/events are physically realizable and when.

The main risk is under-specification: removing historical board information is safe only if support state preserves every future legal-placement distinction that can affect win timing.

### Residual state × fixed 625-ID universe — 5/5

The fixed universe is a compilation substrate for residual semantics. It enables constant transition tables, requirement size classes, symmetry maps, Allis coverage masks and implication metadata.

Do not confuse the universe with hot-state storage. Dense per-node 625-wide structures could violate the performance envelope.

### Residual state × fixed-width hot kernel — 5/5 conceptually, implementation gate required

This is the central engineering challenge: compile rich residual semantics into a small number of words/scalars. Any residual representation that needs JavaScript objects, dynamic arrays, Map/Set identity or repeated 625-element scans is not a compatible production realization.

### Tactical closure × forced response × macro-edges — 5/5 if unified

These are strongly compatible and experimentally amplify each other. They should become one deterministic closure operator.

Potential conflict: retaining TT entries for every intermediate forced state works against macro compression. The compatible policy is to normalize first and cache the resulting decision state, while preserving any independently valuable root/bound evidence at appropriate coarse seams.

### Cardinality bound × tactical/macro normalization — 5/5

Cardinality is cheap after residual updates and can tighten/terminate proofs at the normalized state. There is no known semantic conflict.

One implementation question remains: whether cardinality is evaluated before, during, or after a forced chain. Incremental maintenance allows checking it cheaply at whichever points evidence shows useful; do not force redundant checks on every transit step.

### Cardinality bound × richer support-aware bound — subsumption risk, not incompatibility

The cardinality bound is a safe cheap lower-information form. If event/support state makes a richer exact earliest-win bound essentially free, the richer bound may subsume cardinality rather than stack with it.

Therefore the clear winner is **cheap exact earliest-win bounding**; cardinality is the guaranteed fallback realization.

### Residual automorphisms × tactical/macro normalization — 4.5/5

Automorphism should generally operate on the **normalized decision state**, not on transient forced states. This both reduces symmetry-check frequency and ensures orbit identity reflects the graph actually searched.

A possible exception is an ultra-cheap symmetry that can shorten forced closure itself; that needs evidence rather than being assumed.

### Residual automorphisms × neutral compression — 4.5/5, likely amplifier

Removing dead distinctions can expose larger symmetry classes; symmetry collapse can in turn make neutral alternatives cheaper to represent. These are likely positive partners.

But both must share one authoritative normalized support state. Independently canonicalizing two different abstractions risks inconsistent state identity.

### Neutral/dead-choice compression × minimal support state — 3.5/5 in current form; 5/5 in corrected form

This is the largest correction to the earlier clear-winner list.

The **principle** is clear: physical distinctions that cannot affect any future winning proof should disappear.

The current/global neutral-pool idea is not universally compatible with support semantics. A neutral cell below a future live event changes when that event becomes accessible. Such support tempo cannot be pooled globally without losing ordering/reachability information.

Compatible final form:

- globally collapse genuinely dead tails / interchangeable dead actions;
- preserve neutral gaps that gate future live events as part of the event/support frontier;
- merge those gaps only when the future event chains are themselves equivalent.

Disposition: keep the principle in the core, demote the *global neutral pool implementation* from clear-winner status.

### Residual automorphisms × compact exact TT identity — 3.5/5 until canonicalization is settled

Sibling move-orbit pruning is compatible with the existing TT because it does not change stored state identity.

Full residual-state canonicalization is different: it changes the key before table placement. Any compact identity scheme that reconstructs omitted key bits from slot/bank placement must be designed *after* canonicalization and relocation rules are fixed.

Disposition: retain **exact compact TT identity** as a clear winner, but do not freeze the current residual-key encoding or physical bank mapping yet.

### Compact exact TT identity × active capacity / relocation — internal dependency

Even within the clear-winner principle, exact key compression may rely on physical index bits. Shrinking, growing, moving, banking or canonicalizing entries can therefore alter reconstructed identity.

The final encoding must make lifecycle/relocation semantics explicit. A compact key that saves bytes but constrains profitable cache movement may lose overall.

### Proof/bound authority × ordering hints — 5/5

This distinction resolves rather than creates conflicts. Exact/bound facts must carry full validity conditions; weaker or cross-perspective/cross-depth knowledge may still guide ordering without being promoted into proof authority.

This separation should be used to integrate evaluator, previous-pass and Allis-derived signals safely later.

## Revised clear-winner classification

### Unconditional architectural core

Very unlikely to disappear:

- residual win-space semantics;
- fixed residual-requirement precomputation universe;
- minimal exact support/accessibility state;
- fixed-width allocation-free execution;
- precomputed/incremental transitions;
- proof authority separated from hints;
- exact tactical immediate/double-threat closure;
- forced single-response restriction;
- deterministic forced normalization / decision-state exposure;
- cheap exact earliest-win bounds (cardinality guaranteed fallback).

### Near-certain but implementation-dependent

Likely to survive, but must be synthesized after the normalized state is fixed:

- residual automorphism/equivalence collapse;
- exact compact TT identity;
- elimination/compression of genuinely dead physical distinctions.

### Demoted from literal clear-winner form

- **Global neutral-tempo pool:** retain dead-choice compression principle, but the global pooling implementation is conditional on support/event equivalence.
- **Current compact residual-key encoding:** retain compact exact identity principle, but current slot-dependent encoding is provisional until canonicalization, banking and relocation are settled.
- **Current transposition-only automorphism detector:** retain residual equivalence principle, but detector/canonicalization strategy remains open.

## Composition order suggested by this audit

The likely coherent architecture is now:

```text
board/history at API/root boundary
  -> compile to compact residual obligations + exact support frontier
  -> incremental move transition
  -> deterministic tactical/forced normalization
  -> cheap exact bounds
  -> normalize dead distinctions / semantic equivalences
  -> expose canonical decision state
  -> compact exact TT probe + ordering hints
  -> alpha-beta/null-window proof search
```

Some ordering between bounds, dead-choice normalization and automorphism normalization remains empirical. The important constraint is that there should be **one canonical normalized decision state** seen by the TT, rather than several independent abstractions each defining its own identity.

## Main conclusion

The clear-winner group remains strong, but it is not a bag of independent optimizations. It is converging into a layered architecture with three roles:

1. **state language** — residual obligations + support frontier + fixed-width transitions;
2. **normalization** — tactical closure, forced chains, cheap exact bounds, dead/equivalent-choice collapse;
3. **proof memory/search** — canonical decision-state identity, exact compact cache, hints, alpha-beta/null-window proof.

The strongest compatibility rule is therefore:

> Every clear winner must either contribute to the single normalized state or consume it. No winner gets to create a competing state ontology, support model, or proof-cache identity.
