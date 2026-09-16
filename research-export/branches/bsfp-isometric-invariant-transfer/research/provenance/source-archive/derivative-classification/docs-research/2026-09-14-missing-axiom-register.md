# Connect-4 missing-axiom register

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Track only unresolved load-bearing laws. If an item becomes derivable from the existing calculus, remove it from this register and move it into the predicate/axiom ledger.

## Resolved during the current decomposition

### R1 — missing middle derivative

Previously implicit gap:

```text
partial  -> ? -> partial^3
```

Resolved as

```text
partial^2=1+T^2.
```

On the interior path this is the translated mod-2 Laplacian. It already appeared independently as defect/phase transport. It is therefore a derived operator, not a new primitive axiom.

### R2 — small-board exceptional laws

4x4 / 4x5 rank defects are boundary degeneracies of the total-domain generated maps. No special small-board axiom is needed.

### R3 — diagonal primitive

Diagonal four-window relations derive from axis derivatives. No independent diagonal algebra is needed.

### R4 — pair blocker means XOR

Rejected. A pair blocker is generally a monotone clause. It becomes affine XOR only when an exact split certificate proves opposite ownership.

## M1 — certificate-generation completeness

### Question

What finite/generated family is sufficient to produce every affine ownership fact and blocker clause needed by an empty-board proof?

### Existing pieces

- CPC/control potential;
- response pairs;
- Allis-style local certificates;
- threat combinations;
- pure-followup / seam response fragments;
- residual requirements and blocker upward closure.

### Missing theorem

Either prove a complete generator family or isolate a concrete semantic consequence required by the solved game that cannot be generated from the current families.

## M2 — guarded requirement-to-control feedback

### Shape

```text
certified blocker
-> requirement elimination
-> changed relevant event reservoir
-> stronger control/response fact
-> new blocker
```

### Missing theorem

Exact update rule for the relevant CPC/control potential after obligation removal, preserving:

- support order;
- reserved responses;
- resource conflicts;
- deadline meaning.

This is the core NDC feedback seam.

## M3 — temporal closure completeness

### Existing representation

Certification time/rank can use:

```text
all prerequisites -> max
alternative proofs -> min
opponent-universal variants -> worst-case max
```

when the corresponding logical quantifier is exact.

### Missing theorem

Show that the shared min-max certificate DAG is sufficient for every completion-before-deadline relation needed by the root proof, or identify the smallest missing temporal predicate.

## M4 — response-capacity stopping law

### Existing exact base case

Immediate double threat:

```text
2 distinct enabled defensive obligations
> 1 legal response slot.
```

### Candidate generalization

Construct a guarded obligation/response-slot graph up to a proof horizon. A Hall-deficient obligation subset is an exact forcing/loss certificate.

### Missing theorem

Prove that the required offensive forcing structure can be captured by this capacity calculus, or provide a counterexample requiring richer scheduling semantics.

This is currently the leading candidate for the law that forces departure from the commuting draw/no-loss substrate.

## M5 — decisive win-bit theorem

### Target

Derive the low result bit intrinsically:

```text
win=0 -> draw/nondecisive
win=1 -> decisive terminal proof.
```

### Constraint

No solved W/D/L premise and no recursive move-tree proof may be used in the final theorem.

### Likely dependency

M1-M4.

## M6 — winner/player lift theorem

Given `win=1`, derive the owner of the decisive zero-edge line from the same binary control potential.

This should produce the high result bit:

```text
[player/sign,win]
01 = first-player win
11 = second-player win.
```

This appears simpler than M5 because owner lift is already represented by the control potential; the difficult part is proving which terminal certificate becomes unavoidable first.

## M7 — structural-magnitude bridge

### Known static theorem

Standard 7x6:

```text
Y_cell=Y_line=28
```

with perfect standard beta/gamma coupling.

### Missing theorem

Explain why the decisive semantic proof selects the same intrinsic magnitude 28, rather than merely agreeing numerically with an external terminal/witness census.

The target is a structural map from the decisive certificate/closure into the middle-space invariant.

## Priority order

Current suggested order:

```text
M2 guarded feedback
  -> M3 temporal closure
  -> M4 response-capacity stopping
  -> M1 generator completeness reassessment
  -> M5 win bit
  -> M6 player lift
  -> M7 magnitude bridge.
```

This order is provisional. Solved-database collision discovery may reorder it by exposing a smaller missing distinction.

## Falsification discipline

A new proposed axiom should not enter this register merely because it predicts solved values.

Before adding one, ask:

1. Is it a renamed derivative/quotient coordinate?
2. Is it `partial^2` / Laplacian transport already present?
3. Is it affine, or only a blocker clause?
4. Is the missing fact actually a support/resource/deadline guard?
5. Can it be derived by NDC feedback from current facts?
6. Does a solved collision demonstrate necessity?

Only after these fail should a genuinely new primitive be proposed.
