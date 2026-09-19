# IsoMax hot-loop optimization IsoGraph — qualification 0.2

**Issue:** #73  
**Disposition:** QUALIFIED FOR PERFORMANCE-RESEARCH USE AFTER NEI CORRECTION  
**Authority effect:** none on Connect4 logic authority 1.1  
**Supersedes:** the NEI qualification/disposition portions of `ISOMAX_HOT_LOOP_QUALIFICATION_0_1.md`  
**Retains:** the semantic/source/runtime/machine/cost observations and measured implementation evidence from optimization graph 0.1  
**Current identity layer:** `ISOMAX_HOT_LOOP_NEI_APPLICATION_0_2.*`  
**Current discovery layer:** `ISOMAX_HOT_LOOP_FULL_DISCOVERY_0_2.*`

## Qualification question

After auditing against the actual qualified NEI implementation and executing DP-01 through DP-45, is the issue-73 optimization graph safe and useful as a performance-research instrument without strengthening representation equivalence into unsupported identity or mutating Connect4 gameplay authority?

## Inputs

### Connect4

- solver: `solver/isometric@69a1ae0929b934682d475b31cdd4a38fac77fc12`;
- frozen logic authority: Connect4 IsoGraph authority 1.1;
- base performance graph: `ISOMAX_HOT_LOOP_OPTIMIZATION_GRAPH_0_1.*`;
- retained issue-campaign performance evidence through `a34743cd7ccd91185afd84c518e9eb610d03ab01`.

### IsoGraph / NEI / DP

- IsoGraph source inspected: `iteathen/isograph@8208cf659e65f162649a14cea1d7d80511bf4200`;
- NEI 0.1 + NEI 0.2 qualified semantics used by Connect4;
- NEI native vocabulary roles `^94000..^94033`;
- Discovery Protocols 0.1-0.4 qualified cumulative module;
- DP 0.5 used only as observation-first discrepancy guidance;
- QU 0.1 semantics already manifest-pinned by Connect4 authority 1.1.

---

# 1. NEI audit disposition

## 1.1 Defect found in issue-73 0.1 layer

The original optimization graph overreached in three ways:

1. it treated same operation-observed bit patterns as NEI `SAME` without a fully explicit application identity law and fixed evidence;
2. its native `.isg` profile/SAME edges were not complete NEI claims with queried A/B referents and pinned P/E topology;
3. it implied standard-7x6 task/q NEI sameness even though the currently promoted Connect4 NEI application still leaves the standard-7x6 future-behavior identity profile incomplete.

This is a qualification defect in the performance-IsoGraph identity layer. It does not invalidate the solver optimizations, exact differentials, V8 observations or timing evidence that independently established behavioral equivalence.

## 1.2 Corrective NEI application 0.2

The corrected application defines one narrow identity question:

```text
P-ISOMAX-OPERATION-WORD32-0.2

carrier:
    operation-observed 32-bit word referents

identity-preserving law:
    same pinned operation role
    + exact pi32(A) = pi32(B)
    + every identity-relevant observable factors through pi32
    + magnitude/object/provenance excluded from the carrier
    -> SAME under this profile only
```

Underlying representation occurrences remain separately reconstructible.

Two determinate claims are qualified:

- `NEI-HOT-001` — unsigned versus signed prepared q-hash carriage under masked locator consumption;
- `NEI-HOT-002` — unsigned versus signed isolated-bit carriage under `Math.clz32`/bit-index consumption.

Neither uses QU because fixed P/E settles the declared operation-word identity question.

## 1.3 Correct fail-closed boundaries

The corrected application explicitly records:

```text
hash versus q:
    no NEI claim needed
    full q content remains equality authority

task occurrence versus q:
    contextual correspondence only

standard-7x6 q NEI:
    INCOMPLETE_UNQUALIFIED
    not SAME
    not DISTINCT
    not semantic UNKNOWN

#96 full hash-mix chain:
    NEI not yet qualified
    DP candidate + QU-HOT-01 performance question only
```

This matches NEI's positive-evidence and incomplete-versus-UNKNOWN rules.

---

# 2. Native NEI topology qualification

Mechanical audit of `ISOMAX_HOT_LOOP_NEI_APPLICATION_0_2.isg`:

```text
JSON parse                                           PASS
native [] balance                                    PASS
native () balance                                    PASS
application-local 9956xx SIs declared               PASS
undeclared local SIs                                    0

required NEI roles present:
    ^94000 profile authority                         PASS
    ^94001 claim/result                              PASS
    ^94002 carrier                                   PASS
    ^94003 fixed evidence E                          PASS
    ^94007 subject A                                 PASS
    ^94008 subject B                                 PASS
    ^94010 identity-preserving law                   PASS
    ^94011 identity-separating law                   PASS
    ^94017 SAME                                      PASS
    ^94024 provenance/evidence                       PASS
    ^94025 verification                              PASS
    ^94026 completeness                              PASS
    ^94032 pinned profile/dependency                 PASS
```

Both determinate claims contain A, B, fixed evidence and explicit profile dependency.

No QU roles are serialized for them because no unresolved identity-relevant model family is needed.

---

# 3. Full Discovery Protocol qualification

The machine-readable ledger contains:

```text
protocol records        45
unique protocol IDs     45
first                   DP-01
last                    DP-45
missing protocols        0
```

Every protocol has:
- a discovery disposition;
- a scoped finding or explicit no-lead/negative result;
- linked candidate issues where applicable.

Low-value DP-41..DP-45 routes were executed as bounded retrieval/control checks and did not override stronger structural evidence.

## New candidate outputs

The full pass produced five new implementation candidates:

- **#97** — support-first reflection canonicalization;
- **#98** — terminal-before-q / staged first-win transition collapse;
- **#99** — reuse one residual word across consecutive pair-incidence tests;
- **#100** — fuse dense class loading with residual cofactor traversal, with blocker-slot experiment separate;
- **#101** — ordinary-WDL exact-cache specialization without narrowing generic q-cache ownership.

It also corrected, rather than promoted, **#96**.

## Existing candidate family reinforced

The workload-distribution QU remains populated by:
- #78;
- #89-#95.

The full DP pass did not select one as authority.

---

# 4. Strong discovery results

## 4.1 Symmetry factorization

Horizontal reflection is an exact automorphism, but the current residual-first canonical representative is implementation policy.

Support-first orbit selection is a lawful candidate because:
- q equality requires mirror orbit collapse, not one historical lexical order;
- proof/certificate transport has separate orientation authority;
- support asymmetry can select orientation before residual reflection;
- symmetric support remains the exact residual tie-break case.

Qualification remains with #97.

## 4.2 First-win as an information boundary

First-win stopping means a terminal transition emits a value token rather than another nonterminal q.

Current q-before-terminal execution is therefore not semantically necessary by contract.

Stage A of #98 is a direct boundary-placement experiment.

Stage B remains guarded because changing terminal residual representation can affect diagnostics/public state even if future-game semantics are already closed.

## 4.3 Ownership blocks an invalid compression

WDL cardinality is only three, but the generic q cache also owns arbitrary payloads and Branch Manager q-node objects.

Therefore:

```text
generic q cache -> Int8 values
```

is rejected.

Only consumer-owned ordinary-WDL specialization is admissible for #101.

This is a successful DP-17 falsifier of a superficially attractive DP-18/36 optimization.

## 4.4 Dense residual algorithm can still admit representation/dataflow optimization

The rejected lazy mover does not block all own-transition work.

#100 preserves the dense transform and only tests whether the intermediate 20-word class copy is an accidental factorization.

This is a representation/dataflow question, not an algorithm substitution.

---

# 5. Negative and open dispositions

## Explicit negative results

No promotion for:

- global generic q-cache packing;
- global semantic/source/machine isomorphism;
- QUI among current performance QU regions;
- raw pool-local class IDs as portable worker identity;
- representation sameness/difference as automatic NEI evidence;
- standard-7x6 q NEI SAME under current promoted identity authority;
- source-operation reduction as performance proof.

## Open but intentionally unissued

- ordinary-worker maintenance of support occupancy masks;
- retention-threshold economics beyond prior #84 evidence;
- support reflection lookup/table after #97, if #97 first proves the new cost placement;
- per-class reflection-order memo only as support-symmetric fallback.

These remain research residuals, not accepted work.

---

# 6. Authority and concurrency audit

The research branch advanced concurrently during this task.

Comparison from the task's pre-correction live checkpoint `6f0735c62766234a63eecb72b891f75cf1d0aef7` through the full-discovery publication showed:

```text
total commits in interval     16
concurrent RBA files          10
issue-73 correction/DP files   6
frozen authority-1.1 files changed
                               0
```

Concurrent RBA progress was preserved.

No solver implementation source was changed by this NEI/DP task.

---

# 7. Relationship to qualification 0.1

Retain from 0.1:

- semantic/source/runtime/machine/cost graph structure;
- pinned Node/V8/CPU observations;
- exact implementation differentials;
- retained integrated performance evidence;
- QU-HOT-01/02/03 causal unknown regions, subject to this qualification's identity corrections.

Supersede from 0.1:

- the bit-pattern NEI justification;
- native SAME/profile edges;
- any statement implying current promoted standard-7x6 q NEI SAME;
- #96 wording that implied the full mix chain already inherited a qualified NEI sameness result.

---

# 8. Final disposition

```text
NEI implementation audited against source authority     YES
material NEI defect found                              YES
defect corrected in successor application 0.2          YES
native NEI claim topology complete                     YES
DP-01 through DP-45 executed                           YES
full DP ledger complete                                YES
new bounded optimization candidates                    #97-#101
#96 corrected                                           YES
QU uncertainty preserved                               YES
QUI invented                                            NO
standard-7x6 q NEI overclaimed                          NO
solver source mutated                                   NO
Connect4 authority 1.1 mutated                          NO
concurrent RBA work preserved                          YES
```

The issue-73 optimization artifact is now **QUALIFIED FOR PERFORMANCE-RESEARCH USE WITH NEI APPLICATION 0.2**.

The 0.1 files remain immutable historical evidence of the first pass and the qualification defect it exposed. Current consumers must read the 0.2 NEI application and full-discovery ledger alongside the 0.1 semantic/runtime graph.

#73 may be re-closed as completed after its issue record is updated with this corrective disposition.
