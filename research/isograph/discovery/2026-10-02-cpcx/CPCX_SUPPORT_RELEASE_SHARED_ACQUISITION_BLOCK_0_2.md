# CPCX Support-Release Shared Acquisition/Block Edge 0.2

**Date:** 2026-10-03  
**Status:** frozen qualification correction before re-execution  
**Scope:** experimental CPCX only  
**Supersedes qualification controls in:** `CPCX_SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_0_1.md`

## Theorem semantics

The theorem contract and all structural guards from 0.1 are unchanged.

Only the second fresh positive qualification fixture is corrected.

## Preserved falsifier from 0.1

The proposed `5x4, connect-3` fixture:

```
sequence: 215112
protected line: B1-C2-D3
target: C2
pinned action: E2
```

is **not** a positive control.

After:

```
P0:E2
P1:C1
P0:C2
```

the exact resulting state has a new playable P1 singleton at `C3`.

Therefore the theorem correctly rejects it as:

```
POST_SHARED_DISCHARGE_P1_SINGLETON
```

This negative result is preserved and the fixture is retained as a required
transport falsifier.

## Corrected fresh nonterminal positive

Use `7x4, connect-3`:

```
sequence: 244223533567
controller: P0
protected line: A2-B3-C4
target: A2
pinned controller action: G2
```

At the source:

- P1 has the latent singleton `A2-B2-C2`;
- target `A2` has support distance one;
- P0's protected residual `A2-B3-C4` has two missing cells.

The named supply is:

```
P1:A1
```

After supply:

- the unique urgent P1 singleton cell must be `A2`;
- P0 `A2` must kill that P1 singleton;
- P0 `A2` must contract, not complete, the protected residual;
- the result must be nonterminal;
- no P1 playable singleton may remain.

## Other controls

Retain unchanged:

1. the fresh `4x4, connect-3` terminal positive from 0.1;
2. the distinct-urgent-cell negative `322531`;
3. pinned-action-supplies-target negative;
4. solver/oracle/production isolation.

The rejected `215112` fixture is now also a mandatory negative control.

## Claim boundary

No Class-C application is admitted until this corrected qualification passes.
