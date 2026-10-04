# CPCX Support-Release Shared Acquisition/Block Edge 0.3

**Date:** 2026-10-03  
**Status:** frozen qualification correction before execution  
**Scope:** experimental CPCX only  
**Supersedes only the nonterminal positive fixture in 0.2**

## Theorem semantics

No theorem premise or conclusion changes.

The 0.2 proposed nonterminal fixture is invalid as a qualification source
because its sequence reaches a terminal before the stated source position.
That fixture is discarded as malformed, not counted as evidence for or against
the theorem.

## Corrected fresh nonterminal positive

Use `4x4, connect-3`:

```
source sequence: 1122
controller: P0
protected line: B1-C2-D3
target: C2
pinned controller action: A3
```

At the source:

- P1 owns `A2,B2`, so `A2-B2-C2` is a latent P1 singleton with target
  `C2` at support distance one;
- P0 owns `B1`, so `B1-C2-D3` is a live P0 two-cell residual containing
  the same target `C2`;
- `A3` is current legal frontier for P0 and is outside the protected
  residual.

Execute the theorem script:

```
P0:A3
P1:C1   // named support supply
P0:C2   // shared acquisition/block
```

Required observations:

1. `P0:A3` is nonterminal and preserves `B1-C2-D3`;
2. after `P0:A3`, P1 has no currently playable singleton;
3. `P1:C1` is nonterminal;
4. after `P1:C1`, the unique urgent P1 singleton cell is `C2`;
5. `P0:C2` kills the P1 `A2-B2-C2` singleton;
6. `P0:C2` contracts P0 `B1-C2-D3` to missing `D3`;
7. `P0:C2` is nonterminal;
8. no playable P1 singleton remains afterward.

The pinned `A3` event is load-bearing: it blocks the otherwise possible
post-response diagonal `A3-B2-C1`.

## Retained controls

Retain:

- terminal positive from 0.1;
- transported-singleton negative `215112`;
- distinct-urgent-cell negative `322531`;
- pinned-action-supplies-target negative;
- production/solver/oracle isolation.

## Claim boundary

No Class-C application is admitted until this corrected qualification passes.
