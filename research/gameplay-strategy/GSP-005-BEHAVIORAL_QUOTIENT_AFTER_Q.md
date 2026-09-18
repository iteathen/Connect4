# GSP-005 — Second-stage behavioral quotient after q

**Status:** rough proposal  
**Purpose:** shrink exact gameplay state beyond the natural q coordinates where safe.

## Observation

On complete bounded controls, q is exact but not minimal.

For 4x5 c4:

~~~text
physical states          1,385,521
q states                   294,593
exact behavior classes     229,232
~~~

So q still carries distinctions that can become future-irrelevant.

## Proposal

Treat q as the constructive semantic state, then investigate a second exact quotient:

~~~text
q
-> behavior class b
~~~

where two q states are equivalent only when their complete labelled futures are identical.

## Implementation directions

1. use offline behavioral minimization as an oracle/reference;
2. classify which q distinctions are repeatedly erased;
3. search for a forward-updatable sufficient statistic predicting the behavioral class;
4. use NEI to separate q identity, behavior-class identity, and physical identity.

Potential removable q detail includes strategically dead residuals, support distinctions with identical future landing structure, forced-response equivalence, residual automorphisms, and late-rank terminal collapse.

## Guardrail

Do not replace q with an opaque offline behavior ID in production unless the new representation has exact reconstruction/transition semantics, a direct or efficiently maintainable update law, and independent qualification.

The objective is a smaller usable semantic state, not merely a smaller partition.
