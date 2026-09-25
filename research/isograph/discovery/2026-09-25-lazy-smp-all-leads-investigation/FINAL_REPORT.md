# Lazy SMP — All Leads Investigation Final Report

**Date:** 2026-09-25  
**Status:** COMPLETE  
**Authority effect:** none  
**Baseline:** JSMinSys `04d37498607ace16dae33c79462ddfe1503c8a0d`

## Executive result

The full lead investigation removes most of the attractive-looking Lazy-SMP mechanisms from the active optimization frontier.

The important surviving research direction is **not more sharing**. It is:

> identify exact states whose cross-worker publication has disproportionate critical-path leverage, then test whether that leverage can be recognized more cheaply than the extra coordination it saves.

Current mask-7 sharing is approximately rank-neutral. It succeeds because it greatly reduces shared-memory traffic, not because its hash-defined subset is semantically privileged.

## 1. Share-ineligible blind region

### Observation

With actual full sharing (`sharedSampleMask=0`) and a shadow mask-7 classifier, the solved control produced roughly:

```text
mask-7 eligible shared hits   11.55%
mask-7 excluded shared hits   88.45%
```

On 15-second full-sharing probes:

```text
13333111:
    eligible  ~12-13%
    excluded  ~87-88%

empty:
    eligible  ~9-11%
    excluded  ~89-91%
```

So mask 7 creates a very large deterministic blind region in raw reuse-event count.

### Rank-resolved result

On four solved-control samples:

```text
eligible hits          307,033
excluded hits        2,353,460

average eligible rank   32.36
average excluded rank   32.17
```

Major rank bands stayed near the expected hash-thinning fraction:

```text
ranks 21-27    11.01% eligible
ranks 28-32    11.80%
ranks 33-36    11.33%
ranks 37-42    11.67%
```

Hard probes showed the same result:

```text
13333111:
    eligible avg rank   ~37.68
    excluded avg rank   ~37.36

empty:
    eligible avg rank   ~37.40
    excluded avg rank   ~37.71
```

### Interpretation

The high-hash mask is not selecting shallow/root-near states by rank.

It is essentially thinning the reusable exact-state population without semantic priority.

Full sharing can recover ~8x more shared hits, yet prior mask-7 qualification lowers CPU/cycles. Therefore **shared-hit count is not a leverage metric**.

### Disposition

**ESTABLISHED STRUCTURE; LEVERAGE-AWARE SHARING REMAINS OPEN.**

Do not optimize by simply raising shared density.

The next valid experiment would require a cheap leverage signal—e.g. demonstrated fan-in/root-dependency relevance—not raw hit frequency or rank alone.

---

## 2. Shared hit -> local exact backfill

Candidate:

`a08f47601c467f82bd6663d5457eb4feea56e963`

PR #35.

The candidate retained a fully validated shared exact hit in the already addressed private direct-map slot.

### Effect

Shared probe traffic collapsed:

```text
baseline shared hits   ~102k
candidate shared hits   ~7.5k
```

This proves the retention gap was real.

Same-runner B/C/C/B:

```text
wall:
    baseline  2889.728 ms
    candidate 2916.282 ms
    delta     +0.92%

CPU:
    baseline  11078 ms
    candidate 11094 ms
    delta     +0.14%

cycles:
    baseline  26.9765 B
    candidate 27.1073 B
    delta     +0.48%
```

### Interpretation

The saved shared atomic probes do not repay the damage from inserting those facts into the small private direct-map replacement domain.

### Disposition

**REJECTED.**

Do not backfill shared hits into the current private direct-map cache.

---

## 3. Local/shared collision coupling

When local and shared capacities are equal, both direct maps address from the same low hash bits.

Therefore their collision partitions are coupled.

### Replacement census

Mask-7 solved control:

```text
shared 32K:
    different-key replacement / stores ~13.3%

shared 64K:
    ~7.7%

shared 128K:
    ~4.4%
```

Yet lower replacement rate did not monotonically improve runtime. In the diagnostic campaign, 32K could be faster despite substantially more collision replacement.

So collision churn exists, but is not the dominant cost by itself.

### Shifted-slot experiment

Candidate:

`cb93c196b458b1a249f8dc5dfda1b1bd26ef3bc9`

PR #40.

It kept the same hash and direct-map design but addressed shared slots from a shifted hash window:

```text
shared slot = (hash >>> 8) & mask
```

instead of the local cache's low-bit window.

Across two B/C/C/B attempts on the solved control, four samples/side:

```text
wall:
    baseline  3029.040 ms
    candidate 2947.467 ms
    delta     -2.69%

CPU:
    baseline  11085.5 ms
    candidate 11055.0 ms
    delta     -0.28%

cycles:
    baseline  26.9910 B
    candidate 26.9755 B
    delta     -0.06%
```

This was a repeatable solved-control latency signal with neutral process efficiency.

### Hard/empty falsification

15-second unresolved probe `13333111`:

```text
CPU:
    baseline   52,578 ms
    candidate  58,157 ms
    delta      +10.61%

cycles:
    baseline  129.046 B
    candidate 141.787 B
    delta      +9.87%
```

Empty board:

```text
CPU    +0.71%
cycles +0.71%
```

### Disposition

**STRUCTURE ESTABLISHED; SHIFTED-SLOT CANDIDATE REJECTED GLOBALLY.**

Collision-domain decorrelation can change latency, but the simple shift is workload-sensitive and materially regresses a hard workload.

---

## 4. Winner publication / host observation / cleanup

Measurement-only timing showed the winning worker's post-solve publication is tiny:

typical solved-control scale:

```text
solver return -> result publication    ~0.014 ms
publication -> winner CAS              ~0.001-0.002 ms
winner CAS -> DONE/WAKE signal         ~0.03 ms
signal -> host observes DONE           usually a few ms
host observation -> complete cleanup   ~4-6 ms
```

The signal-to-host interval occasionally exceeded the nominal 2 ms poll cadence due event-loop scheduling.

### WAKE-driven candidate

Candidate:

`adcc8a0d5eb565218bc69e1089bf3620e1a81d0a`

PR #37.

It replaced the polling wait with `Atomics.waitAsync` on the existing WAKE word.

A/B:

```text
wall:
    baseline  1647.553 ms
    candidate 1757.344 ms
    delta     +6.66%

CPU:
    +0.78%

cycles:
    +0.14%
```

### Disposition

**MEASURED; WAKE-DRIVEN WAIT REJECTED.**

The polling/cleanup tail is real but too small to justify this replacement.

The current WAKE notification remains unconsumed in this composition, but removing it is a generic ManagedThreadSession ownership question rather than an IsoMax hot-loop opportunity.

---

## 5. Worker-order diversity

### Current structure

Worker recursive policy is a cyclic orbit:

```text
orderOffset = workerIndex mod columns
```

For 7x6, at most seven configured offsets exist.

### Root-diversity candidate

Candidate:

`edacf7d8f188e4961893489d3fd33cd19d645c92`

PR #36.

It let root action ordering consume each worker's rotated private order.

JSMinSys Verify failed the required Lazy-SMP serial-witness equivalence test:

```text
lazy.move != serial.move
```

while W/D/L remained exact.

The witness contract is authoritative for this execution surface; it was not weakened.

**Disposition: INADMISSIBLE / REJECTED.**

### Spread recursive offsets

Candidate:

`2dcd6ab2a4b4c456cdd0985bf039713c4b1c905f`

PR #39.

It kept root witness ordering unchanged but used:

```text
orderOffset = (workerIndex * 2) mod columns
```

so four 7x6 workers use 0,2,4,6.

A/B:

```text
wall:
    -1.98%

CPU:
    +2.65%

cycles:
    +3.02%
```

More diversity changed winner/work distribution and increased shared stores, but cost more total machine work.

**Disposition: REJECTED.**

### Overall diversity disposition

Current cyclic rotation is not proven optimal, but neither tested expansion survived.

Any future diversity experiment must preserve the root witness contract and demonstrate lower total CPU/cycles, not wall time alone.

---

## 6. Cross-invocation shared-cache persistence

Candidate:

`2a63ee02026d1f3394e00d5f6f4dd1412ca35594`

PR #38.

The same caller-owned shared exact cache was reused for a second identical solve under the same prepared geometry.

### Observation

Cumulative shared hits rose from roughly 101k after the first solve to 243-247k after the second.

The exact cache therefore contained reusable cross-invocation facts.

But second-solve performance versus fresh-cache baselines was worse:

```text
wall:
    baseline  2892.977 ms
    candidate 3076.315 ms
    delta     +6.34%

CPU:
    +2.28%

cycles:
    +2.62%
```

The winning worker's dominant search tree did not collapse.

### Interpretation

Persistent rows mostly replace work that was already cheaper to recompute/localize than to consume from the retained shared table.

A production persistent cache would also require stronger geometry/revision identity binding and aging ownership than the experimental API.

### Disposition

**REJECTED.**

Do not add cross-invocation shared exact-cache persistence to current Lazy SMP.

---

## 7. Post-DONE loser-fault policy

Injected lifecycle test established:

### Loser error after DONE

```text
winner = 0
DONE   = 1
ERROR  = 101
STOP   = 1
```

### Clean loser exit after DONE

```text
winner = 0
DONE   = 1
ERROR  = 0
```

Thus the asymmetry is real.

The generic error handler always fails the session; clean exit is conditionally tolerated after DONE/STOP/finished.

Because final exactness requires:

```text
ERROR == 0
AND DONE == 1
AND WINNER >= 0
```

a post-DONE loser error can conservatively invalidate an already published winner.

### Disposition

**CONFIRMED FAIL-CLOSED POLICY; DO NOT CHANGE AS PERFORMANCE WORK.**

Changing this is a correctness-contract decision requiring explicit authority about whether a loser fault after winner exactness can be ignored.

---

## 8. Shared contention and replacement

### Contention

At mask 7, observed shared-store contention was usually zero or one event.

It is not a meaningful bottleneck.

Full sharing can raise contention, but it remained tiny relative to shared stores.

### Replacement

Different-key replacement is real and can be large under full sharing.

However:

- larger capacity greatly lowers replacement;
- lower replacement does not reliably improve runtime;
- shifted collision decorrelation improved one control but regressed a hard workload.

### Disposition

**CONTENTION CLOSED AS LOW VALUE. REPLACEMENT RETAINED AS SECONDARY/WORKLOAD-DEPENDENT, NOT A PRIMARY OPTIMIZATION FRONT.**

---

## 9. Scalar-only shared evidence

The shared cache transports exact scalar W/D/L, not:

- best move;
- move witness;
- proof/certificate;
- alpha/beta bound.

On a shared exact hit the worker immediately returns the exact value.

Therefore adding a best move would not reduce descendant work at that hit.

Adding witness/proof payload would:

- widen shared rows;
- increase atomic publication/read traffic;
- add stronger identity/provenance obligations.

No measured current need justifies that burden.

### Disposition

**RETAIN SCALAR-ONLY SHARED EVIDENCE.**

---

## 10. JSMinSys key -> q_o/q_r placement

Authority 1.2 establishes:

```text
q_o:
    orientation-sensitive ordinary future behavior

q_r:
    horizontal-reflection orbit / exact scalar-value cache quotient
    with action transporter c -> 6-c
```

The previously qualified IsoMax hot-loop q_r cache realization used reflection-canonical residual coordinates plus support.

Current JSMinSys exact key contains:

- support/heights;
- rank/status metadata;
- both RBA coordinate bitsets;

and `connect4RbaCanonicalize` transports support/basis/coordinates into a horizontal-reflection representative before exact-cache use.

Full key equality—not hash equality—authorizes a cache hit.

### Result

The current JSMinSys key structurally occupies the same **q_r scalar-value cache role**.

The remaining uncertainty is no longer conceptual. It is a **revision-specific qualification gap**:

> mechanically prove that the current JSMinSys RBA key representation realizes the promoted q_r equivalence/transporter relation exactly for the declared solver domain.

Do not call it q_o; literal action identity requires orientation/transporter context.

### Disposition

**QU-LSMP-07 NARROWED TO QUALIFICATION WORK.**

---

# Combined conclusion

The investigation strongly favors keeping Lazy SMP mechanically simple.

Rejected:

- broader shared-hit local retention;
- wake-driven waiting;
- root witness-diversity;
- spread recursive offsets;
- persistent shared cache;
- simple shifted shared-slot decorrelation.

Low-value/closed:

- writer contention;
- scalar witness expansion;
- polling micro-optimization.

Remaining high-information research direction:

```text
not "share more"

but:

identify a very cheap proxy for
cross-worker critical-path leverage

and publish only facts whose expected saved private work
exceeds shared-memory coordination cost
```

Rank is not that proxy, and the current high-hash mask is effectively rank-neutral.

This leaves the major observed CPU opportunity where profiling already placed it: the solver kernel itself remains much more expensive than Lazy-SMP orchestration.
