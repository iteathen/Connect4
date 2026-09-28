# Diagnostic plan — repeated shared-exact miss stutter

**Status:** secondary DP/DTS diagnostic  
**Date:** 2026-09-27 author-local

## Observation

The all-noncutoff shared fallback gave no completed derived-long cycle win, but
on the harder fixed window it reduced:

- process cycles by about 14.8%;
- nodes by about 16.0%;
- shared stores by about 8.3%;
- shared contention by about 31.1%.

The next existing plan reuses the already-computed q hash for shared operations.

That removes duplicate locator hashing but not repeated full shared misses.

## DTS distinction

A shared fallback miss can be:

~~~text
first observation:
    local weak q -> shared miss

later observation:
    same resident q
    same local weak proof state
    no local strict refinement
    -> shared miss again
~~~

Under the q+proof semantic view the later miss is a stutter.

It may still be worthwhile because another worker could have published an exact
value since the first miss.

That later-arrival probability is currently QU and must be measured.

## Shadow diagnostic

Instrument the current all-noncutoff fallback without changing behavior.

For every local direct-map weak row, distinguish its current residency.

Counters:

~~~text
weakSharedProbe
weakSharedFirstMiss
weakSharedRepeatMiss
weakSharedLaterHitAfterMiss
weakSharedHitWithoutPriorMiss
weakLocalStrictRefineAfterMiss
weakSlotReplacementAfterMiss
weakRepeatProbeDistanceNodes
~~~

A diagnostic-only metadata bit/generation may be used if its timing is declared
invalid. Do not treat instrumented elapsed time as performance evidence.

## Decision

If:

~~~text
repeat misses are large
AND
later hits after prior miss are rare
~~~

then test one-bit optional observation memoization:

~~~text
sharedMissObservedForResidentWeakState
~~~

After the first validated miss, skip another optional shared fallback while the
same q and same weak proof state remain resident.

Clear on:

- direct-map slot replacement;
- strict local proof refinement;
- exact promotion.

A later shared exact publication may then be missed until one of those events.
That is a lost optimization opportunity, not a correctness error, because local
weak proof remains sound and shared fallback is not proof authority.

## Stronger exact alternative

If later-arriving exact hits are frequent, do **not** use a sticky miss bit.

A version-aware scheme using shared-slot sequence change may preserve more
opportunity, but it adds local metadata and atomic/version traffic and therefore
requires a separate cost case.

Prefer the one-bit candidate only if the shadow evidence supports it.

## Interaction with known-hash reuse

Run this diagnostic after, or alongside, the known-hash experiment so the two
mechanisms remain causally separable:

~~~text
known-hash reuse:
    removes duplicate locator computation

miss memoization:
    removes repeated full observation transitions
~~~

Do not attribute one mechanism's effect to the other.
