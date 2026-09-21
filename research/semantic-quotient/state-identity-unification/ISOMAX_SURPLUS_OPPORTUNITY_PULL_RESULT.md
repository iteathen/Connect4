# IsoMax Corrected Surplus-Opportunity Pull — Qualified Result

Status: **qualified architecture/result baseline; tuning remains open**

Implementation source qualified:

`work/isomax-surplus-pull-102-corrected@ca02f8672a3f25b0293488fd5401a66797e6773c`

The hard-corpus economics tables below are the earlier qualified baseline measured at `7708f24e…`; later stress repairs preserve the corrected architecture and default policy while strengthening concurrency correctness.

Production comparison source remains `solver/isometric`.

Runtime: Node 26.7.0.

## Question

Can IsoMax distribute otherwise-idle CPU through worker-pulled surplus branch opportunities while preserving the current worker's native recursive continuation, canonical q_r reconciliation, exact W/D/L and action semantics, bounded resources, and useful work economics?

This result supersedes the earlier negative interpretation of the over-externalized frontier-per-work-item realization. It does not revive that rejected design.

## Qualified execution model

At an ordinary branch with ordered children A, B, C, D:

- the current worker continues A in its existing recursive stack;
- surplus work is published only when another worker has explicitly advertised idle demand;
- undispatched siblings remain native/local;
- workers claim globally visible surplus work themselves;
- canonical q_r is reconciliation identity, not a mandatory execution boundary;
- execution reservations are temporary and retireable;
- one-worker execution degenerates to ordinary recursive DFS.

The demand-gated visibility correction is load-bearing. Publishing every branch occurrence was measured and rejected as an economic realization of the intended architecture.

## Qualification history

The corrected campaign exposed and repaired several implementation/qualification defects before economics were accepted:

1. the original reflected-q fixture took a native forced shortcut and did not reach reconciliation;
2. worker failure publication could strand the host solve promise;
3. READY retirement could overwrite a concurrent READY->RUNNING claim;
4. exact work could detach from q before its delayed exact publication was consumed;
5. recycled helper carriers could remain as advisory occurrence references;
6. the reconciler replay residual dictionary required bounded compaction;
7. global publication of every branch occurrence produced millions of replay operations and dominated search cost;
8. demand-gated visibility reduced publication to actual idle-worker demand;
9. private worker class/entry reserves were incorrectly divided by worker count even though each worker can inherit one-worker-scale subtree diversity.

The final worker-local reserve contract is 524,288 residual classes and 1,048,576 transition entries per worker for the qualified 1/2/4 profile.

## Final qualification

At `7708f24e…`:

- Linux lifecycle/exactness: PASS;
- Windows lifecycle/exactness: PASS;
- deterministic q_r convergence: PASS;
- one-worker native-DFS degeneration: PASS;
- actual remote helper stealing: PASS;
- worker-death requeue/recovery: PASS;
- timeout/pre-abort fail-closed: PASS;
- bounded occurrence-capacity fail-closed: PASS;
- mirror action transport: PASS;
- late-root serial / production-central / corrected-surplus x 1/2/4: PASS on Linux and Windows;
- historical hard-root serial / production-central / corrected-surplus x 1/2/4: PASS on Linux and Windows;
- exact W/D/L and root action agree with serial for every qualified root;
- no failed or timed-out variant remains.

## Post-qualification stress correction

The first complete gate at `7708f24e…` was sufficient for the defined corpus/lifecycle qualification, but broader repeated tuning stress later exposed two additional execution-carrier races. These do not change the architecture result; they refine the implementation qualification.

### False queue-capacity classification

A four-worker diagnostic captured `ISOMAX_SURPLUS_QUEUE_CAPACITY` while every priority lane had `enqueue == dequeue` and zero outstanding records. The queue was empty.

The cause was a priority-update race: reconciliation observed a READY helper reservation, but a worker claimed READY->RUNNING before the requeue. The failed requeue was incorrectly interpreted as queue saturation, and pre-writing priority could invalidate the concurrent claim.

Repair `7c0aa1a4b2025353296d74b8b4610b9c0a50a907` makes enqueue own ticket/priority publication and treats a concurrent successful claim as scheduling success rather than capacity failure. Repeated four-worker stress then completed exact.

### Recycled WORK_EXACT carrier read

Quantum/grace stress also captured a remote exact contradiction. One concrete failure delivered remote value 0 for physical child:

`46653732765727722455536261413`

An independent serial IsoMax solve of that exact 29-ply state returned **+1**, matching the worker-local exact cache.

Failure instrumentation showed the WORK_EXACT carrier's replay path had already been cleared when the waiter consumed its result. Therefore reconciliation had recycled/reused the carrier between the waiter's terminal-state observation and result read.

Repair `ca02f8672a3f25b0293488fd5401a66797e6773c` snapshots the scalar work result and then revalidates both carrier generation and WORK_EXACT state before accepting it. If recycle/reuse won the race, the waiter retries from occurrence/q authority instead of consuming the stale carrier.

After this repair:

- full default Surplus qualification passes on Linux and Windows;
- repository verify passes;
- native WSL and benchmark-evidence pass;
- fixed control-quantum sweep 64/128/256/512/1024 at 2 and 4 workers completes exact on both Linux and Windows.

The production-candidate defaults remain `helperGraceMs=1` and `controlQuantum=512` while tuning remains open.

### Fixed-quantum evidence

Post-repair four-worker result-ready totals on one hard-corpus sweep:

| quantum | Linux ms | Windows ms |
| ---: | ---: | ---: |
| 64 | 2581.8 | 4134.4 |
| 128 | **2070.5** | 4541.8 |
| 256 | 2195.9 | 4868.1 |
| 512 | 2735.6 | 4400.2 |
| 1024 | 2271.3 | 4852.7 |

No single fixed quantum wins cross-platform. The result supports continued investigation of adaptive quantum rather than an unconditional fixed-constant replacement.

## Hard-corpus economics

Three historical hard roots:

- `717657616532237625`
- `466537327657277224`
- `616767454664457417`

### Linux

| variant | result-ready ms | recursive calls |
| --- | ---: | ---: |
| serial | 2289.61 | 2,643,905 |
| production-central-1 | 2678.28 | 2,644,187 |
| corrected-surplus-1 | 2434.03 | 2,643,905 |
| production-central-2 | 2613.70 | 4,358,383 |
| corrected-surplus-2 | 2646.70 | 2,948,953 |
| production-central-4 | 3970.06 | 7,199,750 |
| corrected-surplus-4 | 5100.14 | 5,064,798 |

Relative to production central:

- surplus-2 performs **32.3% fewer recursive calls** with **+1.3% result-ready time**;
- surplus-4 performs **29.7% fewer recursive calls** with **+28.5% result-ready time**.

### Windows

| variant | result-ready ms | recursive calls |
| --- | ---: | ---: |
| serial | 2350.47 | 2,643,905 |
| production-central-1 | 2823.18 | 2,644,187 |
| corrected-surplus-1 | 2681.63 | 2,643,905 |
| production-central-2 | 2837.54 | 4,274,113 |
| corrected-surplus-2 | 2921.97 | 2,922,227 |
| production-central-4 | 4212.73 | 7,309,915 |
| corrected-surplus-4 | 3834.67 | 4,796,632 |

Relative to production central:

- surplus-2 performs **31.6% fewer recursive calls** with **+3.0% result-ready time**;
- surplus-4 performs **34.4% fewer recursive calls** and is **9.0% faster result-ready**.

## Structural economics

One worker now performs exactly the serial recursive calls and publishes no branch occurrences without external demand. This confirms that the distributed profile no longer imposes branch-globalization semantics when no helper can consume them.

Two workers substantially reduce the duplicate recursive work of the production central manager while remaining approximately wall-time neutral on this corpus.

Four workers also reduce recursive work materially, but wall-time conversion is platform-sensitive. The main remaining measured cost is speculative retirement waste:

- Linux surplus-4 retirement waste: ~1.073M recursive nodes;
- Windows surplus-4 retirement waste: ~1.064M recursive nodes.

Demand-gated visibility has already reduced reconciler traffic by orders of magnitude relative to the first corrected baseline. The remaining four-worker seam is therefore helper execution/retirement economics, not a reason to return to central assignment or frontier-per-work-item execution.

## Interpretation

Confirmed:

- current-continuation + worker-pulled surplus is implementable with exact semantics;
- global execution can remain bounded by worker capacity;
- global visibility need not equal execution and should be demand-gated;
- one-worker degeneration can remain close to native DFS;
- the architecture reduces multicore duplicate recursive work materially versus the production central manager;
- worker-local resource capacity must be sized as worker-local, not divided as though private dictionaries were one global arena.

Not yet established:

- a universal wall-time speedup;
- the optimal helper grace period;
- the optimal retirement/control quantum;
- the optimal priority or affinity policy;
- the value of portable exact-state exchange beyond current q reconciliation.

## Next experiments

Architecture changes are no longer the first response.

The next isolated candidates are:

1. helper grace versus duplicate local/helper execution;
2. retirement/control quantum (#94) against measured retirement waste;
3. structural affinity (#91) if warm-private-cache loss remains material;
4. dependency-leverage priority (#90) only where q fan-in/closure evidence supports it;
5. portable exact-state reuse (#78) only after overlap economics justify its coordination cost.

Promotion should be based on the complete qualified evidence and the repository's NEES acceptance rule, not utilization alone.
