# IsoMax candidate campaign

Implementation qualification for issue #72. Production code is unchanged.
Every variant is generated independently from the current solver through a
single checked source seam. A changed seam fails instead of silently measuring
the wrong implementation. Baseline uses the identical module-loading route.

First batch: I1 non-win, non-loss and combined exhaustion bounds; I6 shared
immutable empty certificate facts. I6 native conclusion objects are a separate,
unmeasured subcandidate. I2–I5 remain unmeasured.

Run:

```sh
node --test benchmarks/isomax-candidates/qualification.test.mjs
node benchmarks/isomax-candidates/run.mjs
```

The benchmark requires a committed clean checkout. It runs 15 sequential fresh
processes, three samples per variant in forward/reverse/rotated order, with
eight identical untimed warmup roots. The 96 fixed synthetic roots come from
the ordering campaign (not Begin-Hard). Each root gets a fresh pool/cache.
The measured operation includes exact WDL and value-preserving root action;
setup and forced GC are excluded. Each process retains the 120-second limit.
Root records are flushed as produced and captured by the existing process
harness, including on failure. Results live in Git-private solver-performance.

Correctness is separate from speed: independent physical-board exact evaluation
on late roots, both turns and mirrors, all legal root actions, exhaustion,
terminal stopping, complete active-state restoration and contradictory
certificates. Benchmark results must preserve all 96 WDL/root-move decisions;
repeated work must be deterministic; I6 must preserve all baseline work metrics.
I1 temporarily uses the existing no-win counter for its combined bound facts:
that counter does not establish that a native bound is a proof certificate.

Three samples screen candidates; they do not establish universal improvement.
Do not promote a candidate on node count alone or collapse a per-workload
regression into an aggregate claim. Independently repeat promising changes and
test broader root regimes before production promotion.
