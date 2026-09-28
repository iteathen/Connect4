# IsoMax Hot-Loop Integrated IsoGraph — 0.4 Core-0.20 strict successor candidate

**Status:** Core-0.20 strict successor candidate; semantic primitive closure **INCOMPLETE**  
**Owner:** `research/semantic-quotient`  
**Current qualified predecessor:** `ISOMAX_HOT_LOOP_GRAPH_AUTHORITY_0_3.md`  
**Gameplay-authority effect:** none  
**Author-local date:** 2026-09-27

## 1. Authority pins

This successor is evaluated against:

- `iteathen/IsoGraph@84e2f4d2386f9cd1a7b2c533752600eee82e44bf`;
- qualified Core 0.20 SHA-256
  `9a619b552a6ef7719e5b4b5f3a9df4a732ff4377b9bc7b86c385ed5c992b88e7`;
- current integrated stack:
  Core 0.17 + 0.18 + 0.19 + 0.20 + QU 0.1 + NEI 0.4 +
  DP 0.1–0.8 + DTS 0.1.

The historical 0.3 native artifact remains unchanged at blob
`4875d4407030ed804870ac061b5f47d90deb3524`.
Its JSON remains unchanged at
`8df8c19f13892adcb8476e638c4b2e900bf7ec08`.

Core 0.20 does not retroactively invalidate that predecessor. It does prohibit
treating its reducible `996xxx` semantic operators as primitive leaves in a
new primitive-completeness claim.

## 2. What 0.4 changes

The 0.3 native graph used `996xxx` names both as graph identities and as
semantic operators. Core 0.20 requires those roles to be separated.

0.4 therefore uses three layers:

```text
996xxx
    raw predecessor token / topology identity only

994xxx
    derived semantic view corresponding to that predecessor token

995xxx
    lower semantic closure root
```

Every current `994xxx` semantic view is linked to its source token with
`SOURCE_PROVENANCE` and to a `995xxx` closure root with
`DERIVED_VIEW_OF`.

Every current `995xxx` root is explicitly:

```text
QU_UNEXPANDED
```

until lower primitive semantics are represented.

No `996xxx` identifier is used as an operator in the 0.4 native successor.

## 3. Exact primitive claim admitted now

The predecessor contains 39 native relation tuples.

0.4 represents those 39 tuples as Core-0.20
`RAW_EXTENSION_TUPLE` observations.

This gives a narrow but exact primitive claim:

> the structural tuple topology of the frozen 0.3 native graph is preserved
> exactly, without importing the domain meaning of its relation names.

The domain interpretations remain derived/unexpanded.

This distinction is deliberate. A raw tuple saying that tokens A, B and C were
related in the predecessor does not by itself assert that the old relation name
`realizes`, `exact_scoped_equivalence`, or `q_r_value_dependency` has
already been primitive-expanded.

## 4. Core-0.20 firewall

The exact structural claim must survive deletion of the semantic layer.

The verifier removes:

- `DERIVED_VIEW_OF`;
- `QU_UNEXPANDED`;
- `SOURCE_PROVENANCE`

from the semantic layer and recomputes the raw predecessor topology.

Pass condition:

```text
raw topology before deletion
=
raw topology after deletion
```

The verifier also adversarially relabels every `994xxx` and `995xxx`
identity. The raw predecessor topology must remain unchanged.

These controls directly implement the Core-0.20 derived-view deletion and
relabeling requirements for the exact claim currently made by this successor.

## 5. Closure result

The current ledger contains 24 semantic surfaces.

The qualified 0.3 JSON surface is also exhaustively frozen and classified:

```text
JSON leaf assertions:       195
load-bearing assertions:    156
provenance/navigation:       39
```

All 156 load-bearing JSON assertions remain `QU_UNEXPANDED` until their
meaning is supplied by native primitive support. This prevents the JSON/Markdown
sidecars from silently restoring semantics removed from the native graph and
closes the implicit-assertion escape path under Core 0.20.

All 24 native semantic surfaces are presently:

```text
source token: RAW_DATA_ATOM
semantic view: DERIVED_VIEW
closure root: QU_UNEXPANDED
```

The load-bearing families are:

1. ordinary W/D/L value dependency;
2. exact `q_r` cache/future-game equivalence;
3. own residual cofactor;
4. block residual cofactor;
5. support/playability transition;
6. advisory move ordering;
7. task necessity;
8. ranked q dependency DAG;
9. seven retained representation-equivalence claims;
10. three existing runtime/machine/distribution QU regions;
11. six predecessor relation meanings.

Therefore:

```text
primitive structural topology closure: PASS
primitive semantic closure:            INCOMPLETE
Core-0.20 qualification:                NOT CLAIMED
```

## 6. Why current game-theory authority cannot be used as an escape hatch

The current game-theory authority 1.2 remains qualified in its own historical
scope. Its native candidate blob is:

`dba9fccee417dc6c593011d85330d42f5b71b079`.

Its present native vocabulary is a `997xxx` semantic construction. Core 0.20
explicitly forbids using a qualified higher construction as the sole
load-bearing support when that construction is definitionally reducible.

Accordingly, 0.4 does not simply point `q_r`, residual cofactor, support, or
value recurrence at authority 1.2 and declare primitive closure complete.

The load-bearing q/value/cofactor/support slice must itself acquire primitive
support before those 0.4 roots can be closed.

This is a standards consequence, not a withdrawal of authority 1.2.

## 7. Runtime and representation-equivalence boundary

The retained 0.3 equivalences remain valid predecessor research evidence, but
their old native labels are not primitive proof objects under Core 0.20.

In particular, the following require lower native definitions before they can
support a Core-0.20 exact claim:

- prepared signed/unsigned 32-bit hash carriage;
- isolated-bit carriage into `Math.clz32`;
- 42-cell mask precomputation;
- flat degree-two pair incidence;
- singleton projection;
- helper relocation;
- preparation-order equivalence.

The lower expansion must represent the actual bit/data/transition relation used
by the claim. A label such as `pi32`, `Math.clz32`, `same final storage`,
or `same helper behavior` is not itself a primitive leaf.

V8 lowering, dynamic machine cost, and workload distribution remain QU; no
missing counter or runtime detail is converted to zero or assumed behavior.

## 8. DTS boundary

Task necessity and ranked manager dependency behavior are execution relations.

Core 0.20 plus DTS requires their load-bearing meaning to expose, as applicable:

- state/configuration carrier;
- initialization;
- one-step transition incidence;
- occurrence/trace adjacency;
- guards;
- termination/final predicate;
- output/value relation.

Node/worker scheduling, event timing, JIT realization and hardware cost remain
QU where the source/runtime does not determine them.

The successor does not invent deterministic scheduling or probability.

## 9. NEI boundary

No current hot-loop optimization requires an NEI SAME/DISTINCT conclusion.

Core-0.20 modernization does not change that.

If identity becomes material later, NEI operates on the expanded support graph,
not on shared `996xxx`, `994xxx`, implementation, cache, worker or hash
names.

## 10. Files and mechanical gate

Native successor:

- `ISOMAX_HOT_LOOP_GRAPH_0_4_CANDIDATE.isg`

Machine-readable closure ledger:

- `ISOMAX_HOT_LOOP_CORE020_CLOSURE_0_1.json`

JSON navigation/index view:

- `ISOMAX_HOT_LOOP_GRAPH_0_4_CANDIDATE.json`

Verifier:

- `verify-isomax-core020.mjs`

The research-integrity workflow runs that verifier.

The verifier checks:

- predecessor blob preservation;
- upstream game-theory blob preservation;
- native delimiter integrity;
- all 39 predecessor tuples preserved exactly as raw extension tuples;
- zero `996xxx` semantic operators in the successor;
- only permitted Core primitive-role operators in the successor;
- one raw token, derived view and closure root per ledger entry;
- all 24 lower semantic roots explicitly QU;
- derived-view deletion firewall;
- adversarial derived-view/root relabeling invariance.

## 11. Promotion rule

0.4 MUST NOT replace authority 0.3 merely because the strict audit is cleaner.

Promotion requires closing every load-bearing semantic root needed by the
declared exact scope, followed by fresh Core-0.20 qualification evidence.

Until then:

```text
0.3
    current historically qualified hot-loop performance-research authority

0.4
    current Core-0.20 strict modernization successor candidate
    exact for predecessor native topology
    semantic primitive closure incomplete
```

No prior evidence is deleted, rescored, or silently broadened.
