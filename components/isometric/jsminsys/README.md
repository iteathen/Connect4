# IsoMax JSMinSys implementation

This directory is the current Connect4 application adapter for the merged
JSMinSys CPC-first IsoMax search.

Pinned library:

`vendor/jsminsys` -> `iteathen/JSMinSys@25aeb13744a2ed413e660b16b8f3ec2332ae58ec`

## Execution path

```text
solve7x6 legal replay
  -> JSMinSys managed file-worker lifecycle
  -> runtime-configured 7x6 RBA geometry
  -> replay -> canonical RBA q
  -> CPC/NDC exact/bound/restriction closure
  -> one-ply RBA cofactor
  -> exact negamax/alpha-beta
  -> exact direct-mapped cache
  -> caller-frame W/D/L + move
```

Production mode is `RBA_AB_CPC_ONLY`. Recursive Four-Front and the optional
pooled/synchronized frontier-response extension remain library qualification
paths and are not enabled by the default Connect4 solver.

Connect4 owns legal replay ingress semantics, public result orientation,
benchmark/oracle expectations and the 120-second host deadline. JSMinSys owns
the reusable geometry, q/cofactor/canonicalization, CPC closure, alpha-beta,
exact cache and managed thread lifecycle used here.

## Current execution profile

The implementation currently uses one exact search worker. `workers:1` is the
only admitted public profile. Requests for more workers fail explicitly rather
than silently duplicating search or pretending to provide shared parallel
execution.

Public W/D/L is P0-oriented:

```text
+1 = P0 win
 0 = draw
-1 = P1 win
```

Timeout, cancellation and worker failure return no W/D/L.

## Qualification

GitHub Actions run `35927386403`:

- Connect4: 57/57 tests passed.
- Pinned JSMinSys: 122/122 tests passed.
- Independent physical-oracle controls agree on late 7x6 positions and mirrored
  caller-frame witnesses.
- A genuinely CPC-unresolved rank-28 control traverses the exact alpha-beta path
  with Four-Front calls remaining zero.
- Cancellation/deadline cleanup is fail-closed and returns no value.

The standard Fhourstones harness is `tools/bench-fhourstones.mjs`. It now
targets this implementation and requires all four official positions to return
`EXACT` with the retained expected W/D/L values. A full Fhourstones result is
not claimed until that harness completes.
