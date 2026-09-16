# BSFP horizontal-reflection orbit schedule

**Status:** exact symmetry-reduction candidate. No production solver change.

**Research direction:** Josh Oshiro.

## Exact automorphism

For any rectangular Connect-4 board, horizontal reflection

```text
R(c,r) = (W-1-c, r)
```

preserves:

- gravity/support legality;
- support rank and side-to-move;
- geometric winning-line incidence;
- terminal/first-win meaning;
- ownership subset inclusion;
- upward/downward antichain semantics;
- residual requirement/cofactor semantics;
- existential/universal move composition after reflecting the action column.

Therefore the empty-root BSFP problem is equivariant under `R`.

## Standard 7×6 support census

Support vectors are seven column heights in `0..6`:

```text
raw supports = 7^7 = 823,543.
```

A support is reflection-fixed iff

```text
h0=h6, h1=h5, h2=h4
```

with center `h3` free, giving

```text
fixed supports = 7^4 = 2,401.
```

Burnside for the two-element reflection group gives

```text
support orbits
= (823,543 + 2,401)/2
= 412,972.
```

At rank 21 specifically:

```text
raw supports:        60,691
reflection-fixed:       109
orbits:              30,400.
```

This is an exact schedule-size reduction, not a runtime forecast.

## Geometric/residual orbit facts

On standard 7×6:

```text
winning lines:               69
reflection-fixed lines:       3
line orbits:                 36

nonempty residual masks:    625
reflection-fixed residuals:  43
residual-mask orbits:       334.
```

These counts do not mean the semantic residual-class universe has 334 classes. They supply exact reflection maps for line IDs and residual terms.

## Candidate schedule

Define canonical support identity:

```text
canon(h) = min_lex(h, R(h))
orientation(h) = identity | reflected.
```

Store/solve only `canon(h)` once.

For each legal column `c` from representative support `h`:

```text
childRaw = h + e_c
childCanon, childOrientation = canonicalize(childRaw)
```

Read the child frontier under `childCanon`, transform it through `childOrientation`, then apply the ordinary exact cofactor/terminal operation for action `c` in the parent orientation.

An equivalent implementation may transform the parent/action into child-canonical coordinates before the cofactor, provided exact masks/line IDs are mapped consistently.

## Frontier reflection

For a P0 ownership mask `P` on support `h`:

```text
R(P)
```

is obtained by reflecting every occupied cell bit. Thus:

```text
WinFrontier(R(h)) = R(WinFrontier(h))
LossFrontier(R(h)) = R(LossFrontier(h)).
```

Normalization commutes with reflection because reflection preserves subset inclusion and cardinality.

For a reflection-fixed support, the complete frontier set is reflection-invariant. A second optional compression may store only record orbits inside that frontier, but this is a separate experiment; it is not required for the near-half support schedule.

## Interaction with rolling ranks

Reflection preserves rank, so rolling two-rank execution remains valid. Each rank stores only support-orbit representatives for that rank.

No older-rank retention is introduced.

## Interaction with CUDA/OQS

Canonicalize support occurrence identity before expensive semantic work. Child mapping needs only:

```text
canonical child support ID
reflection flag
reflected landing column/cell mapping.
```

Residual/line transformations may similarly use precomputed reflection maps over the fixed vocabularies.

This should compose with O3 residual-pair occurrence reuse: reflection-equivalent occurrences can potentially share the same exact transform after canonical input mapping.

## Provenance/output boundary

For root W/D/L, reflection provenance is irrelevant beyond action remapping.

If a later consumer requests exact terminal-line identity, witness/action provenance, or asymmetric root constraints, preserve the orientation map so canonical results can be lifted back to physical coordinates. Do not treat reflection-related line IDs as identical output labels unless the requested observation explicitly quotients them.

## Qualification sequence

1. Implement support canonicalization in a separate reference wrapper around complete small-game BSFP controls.
2. Require exact reflected frontier equality support-by-support against the unquotiented authority.
3. Require identical root W/D/L and every legal root-action W/D/L.
4. Measure support work, frontier records transformed, pair candidates and wall time independently.
5. Test reflection-fixed supports separately; require their frontier sets to be closed under reflection.
6. Only then integrate canonical support IDs into a CUDA schedule.

## Falsifiers

- a reflected support/action produces different exact W/D/L after lifting coordinates;
- a frontier record cannot be mapped bijectively under reflection;
- canonicalization loses terminal-line/action provenance needed by the selected output contract;
- orientation handling costs enough to erase the work reduction on target workloads (performance falsifier only, not semantic falsifier);
- symmetry is applied to a root/problem carrying asymmetric fixed facts without retaining those facts in the canonical identity.
