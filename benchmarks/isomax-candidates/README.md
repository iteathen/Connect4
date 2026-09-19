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

## First screening result

Run `20260919T162741571Z-isomax-candidates`, source `c5323a33`,
Node 26.7.0. Portable samples and chronological process order:
`benchmarks/results/2026-09-19-isomax-candidates.json`.
Raw per-root records and work metrics are retained under the run ID in
Git-private `solver-performance`. Published evidence omits the repetitive
per-root metric arrays; the harness checked their equality before publication.

| Isolated variant | Total median ms | Nodes | Screening disposition |
|---|---:|---:|---|
| Current production | 5792.74 | 4,904,792 | Control |
| I1 non-win only | 5676.97 | 4,821,231 | 2.00% lower median; provisional |
| I1 non-loss only | 5743.97 | 4,904,792 | No work reduction; inconclusive timing |
| I1 both | 5655.29 | 4,821,231 | 2.37% lower median; provisional |
| I6 empty facts | 5800.90 | 4,904,792 | No demonstrated benefit (+0.14%) |

All decisions matched and repeats had deterministic work. I6 matched every
baseline work counter. Baseline samples range 5564.14–5900.84 ms and overlap
the candidates: these medians do not establish a statistically reliable win.
I1 removes 83,561 calls (1.70%); adding non-loss to non-win removes no additional
calls on this corpus. Independent qualification passed 132 roots and 330
root actions, both turns/mirrors, exhaustion and terminal cases. The existing
47 domain/IsoMax/shared-RBA tests also passed. Production is unchanged.

Next: independent exhaustion-heavy roots, odd root plies and additional paired
repetitions for I1. I6 native outcome templates remain a separate untested
subcandidate; the empty-facts result cannot reject the whole I6 proposal.
I2 dense mover finalization, I3 insertion-only growth, I4 canonical-key reuse and
I5 shared completed-boundary economics are queued in issue #72 with their
individual correctness/measurement requirements. Do not label them tested.
