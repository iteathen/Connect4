# Certified BSFP macro transitions

**Status:** live cross-lineage hypothesis. No production solver change.

**Research direction:** Josh Oshiro.

## Observation

The Isometric response/control decomposition represents a qualified response fragment `F` by an exact support-consumption vector

```text
n(F) = (n_0,...,n_(W-1))
```

with derived projections such as total rank consumption and phase transport. Separately, the BSFP/OQS work has already qualified direct multi-cell positive cofactors against sequential exact cofactors on bounded controls.

Therefore, once a response fragment is independently certified as forced/guard-safe, the individual plies need not necessarily remain separate BSFP transition steps.

## Candidate macro law

Suppose a certificate establishes for a symbolic region that fragment `F` is the only admissible value-preserving/required response sequence and that every intermediate terminal alternative has been handled explicitly.

Then the BSFP predecessor may consume the fragment as one macro transition:

```text
support h
  -> h + n(F)

P0/P1 residual state
  -> exact composed owner-labelled cofactors for the events of F

proof/certificate state
  -> explicitly composed guard/resource/deadline state.
```

The macro is semantically equivalent to the sequential events only under the certificate's exact guard.

## Searchless base case: neutral same-column pair

In a qualified pure-followup region, opponent move plus controller same-column response consumes two cells in one column and leaves all currently identified mod-2 bulk coordinates unchanged; only the integer pair-depth counter decreases.

This gives a particularly cheap macro form:

```text
k_c -> k_c - 1
support rank -> rank + 2
bulk phase/seam coordinates unchanged
```

while exact residual cofactors and terminal alternatives are still applied/composed.

This is not a global two-ply shortcut. The same-column response relation must be certified for the active region.

## General fragment form

The same principle applies beyond same-column pairs. A typed Isometric response fragment may carry:

```text
support consumption n(F)
response relation
sharing/exclusivity policy
resource reservations
CPC/parity commitment
deadline/horizon
terminal alternatives
```

Once all of those are proved, BSFP can use the fragment as a macro predecessor instead of replaying each rank separately.

## Why this may matter for CUDA-BSFP

Current rolling-rank BSFP advances one occupied cell at a time and materializes every intermediate rank. A certified macro can:

- skip one or more intermediate support ranks for the covered symbolic region;
- avoid repeated normalization between events whose composition is already exact;
- reduce repeated terminal/subtraction work when terminal alternatives can be composed symbolically;
- expose larger independent item batches for device execution;
- reuse the same macro transform across claim-relative isomorphic contexts.

The benefit is proportional to the symbolic region covered by the certificate; a rare macro is not automatically worthwhile.

## Claim-relative macro reuse

The macro identity should be observation-specific, not full-state identity. Candidate key:

```text
MacroSignature = canonical dependency cone of
  support effect
  owner-labelled cofactor effect
  resource/deadline guards
  handled terminal alternatives
  requested proof consequence.
```

Two physically different contexts with the same exact macro signature may share one compiled transform and then map the result back to their untouched context.

This is the multi-event analogue of O3 residual-pair reuse.

## Execution forms

Compare three forms:

1. sequential one-ply BSFP authority;
2. certified macro applied on CPU/reference semantics;
3. compiled device macro using direct multi-cell cofactor + support jump.

The generic CUDA layer should see only bounded item transforms/grouping; Connect4 retains certificate and game semantics.

## First experiments

1. Complete small-game controls: find regions with existing exact forced-block / singleton response chains and compare macro vs sequential recurrence.
2. Pure-followup controls: qualify same-column neutral-pair macros under explicit support and nonterminal guards.
3. Measure frontier widths and candidate products removed by skipping the intermediate rank.
4. Canonicalize macro signatures and measure reuse frequency across supports/contexts.
5. Only then consider standard 7x6 bounded regions.

## Falsifiers

- any macro changes exact W/D/L versus sequential recurrence;
- an intermediate first-win terminal alternative is hidden by composition;
- resource/deadline state differs after macro and sequential execution;
- an ordinary parity-neutral pair is accepted without a certified response relation;
- claim-relative macro equality is promoted to full q-state equality;
- macro compilation costs more than the repeated work it removes on the target regime.
