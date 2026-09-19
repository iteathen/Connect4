# IsoMax hot-loop NEI application 0.2 — corrective identity layer

**Status:** corrective successor application for the issue-73 performance IsoGraph  
**Owner:** `research/semantic-quotient`  
**Supersedes:** the NEI interpretation in `ISOMAX_HOT_LOOP_OPTIMIZATION_GRAPH_0_1.*` and `ISOMAX_HOT_LOOP_QUALIFICATION_0_1.md`  
**Does not supersede:** the semantic/source/runtime/machine/cost observations in the 0.1 graph  
**NEI authority:** NEI 0.1 + NEI 0.2 at the qualified revisions used by Connect4  
**QU dependency:** only when unresolved identity-relevant structure can change an NEI classification  
**Authority effect:** none on Connect4 logic authority 1.1

## Why this correction exists

A direct audit against the actual NEI contract found three problems in the issue-73 0.1 optimization layer:

1. **representation equivalence was too quickly called NEI SAME**;
2. the native `.isg` encoded a profile attachment, not a complete NEI claim with two queried referents and pinned evidence;
3. contextual task-occurrence text implied standard-7x6 q NEI sameness even though the currently promoted Connect4 NEI application still classifies that global identity question as incomplete pending successor authority ingestion.

NEI 0.1/0.2 require positive identity authority. These are constitutional barriers:

```text
same structural behavior != automatic NEI SAME
same bit pattern          != automatic NEI SAME
different representation != automatic NEI DISTINCT
absence of distinction    != NEI SAME
```

A domain/application relation may become identity-preserving or identity-separating only when a pinned profile explicitly gives it that role and the required evidence discharges the claim.

---

# 1. Profile P-ISOMAX-OPERATION-WORD32-0.2

## Identity question

The carrier is **operation-observed 32-bit word referents**, not JavaScript Number objects and not Connect4 q states.

For one pinned operation role `O`, define the exact projection:

```text
pi32_O : representation occurrence -> 32-bit word observed by O
```

The profile asks:

> Do two representation occurrences denote the same operation-observed 32-bit word for O?

## Identity-preserving law

The application explicitly admits the following as identity-preserving under this profile:

```text
same operation role O
+ exact pi32_O(A) = pi32_O(B)
+ every identity-relevant observable admitted by P factors through pi32_O
+ no external magnitude/object/provenance property is included in the carrier
->
NEI_P(A,B) = SAME
```

This is an application-defined identity law over the projected operation-word carrier.

It is **not** a theorem that signed and unsigned JavaScript Numbers are naturally identical in general.

## Identity-separating law

If an admitted consumer observable depends on information not determined by `pi32_O`—for example unsigned numeric magnitude, general Number ordering, object identity, or a wider value domain—the profile does not license SAME.

Such a case requires a different profile or remains incomplete.

## Provenance law

Underlying source representation occurrences remain separately addressable and reconstructible even when their projected operation-word referents are NEI SAME.

NEI does not rewrite SI/source provenance.

---

# 2. Determinate claim NEI-HOT-001 — prepared q hash carriage

## Queried referents

A:
- baseline unsigned JavaScript Number representation of the prepared q locator hash.

B:
- selected signed-int32 representation carrying the same 32 hash bits across the recursive call/store path.

## Profile

`P-ISOMAX-OPERATION-WORD32-0.2`

Operation role:

```text
q hash locator -> masked table addressing
```

Exact q coordinates, not the hash, decide equality.

## Fixed evidence E

- baseline/final source revisions from the qualified issue campaign;
- exact negative-hash/high-bit/collision/resize/cross-API lookup controls;
- identical serial exact work and W/D/L/action results for the qualified change;
- cache addressing uses bitwise mask/probe operations while exact p0/p1/support coordinates decide hits.

## Result

```text
NEI-HOT-001 = SAME
```

under **only** `P-ISOMAX-OPERATION-WORD32-0.2`.

No QU is required: the identity question is settled by the fixed profile/evidence and does not depend on unresolved identity-relevant alternatives.

## Non-result

This does not establish:

- SAME JavaScript numeric representation;
- SAME numeric magnitude;
- SAME q;
- universal V8 equivalence.

---

# 3. Determinate claim NEI-HOT-002 — isolated-bit input to clz32

## Queried referents

A:
- baseline unsigned Number representation of one isolated 32-bit residual word bit.

B:
- selected signed-int32 representation of the same isolated 32-bit word.

## Profile

`P-ISOMAX-OPERATION-WORD32-0.2`

Operation role:

```text
isolated bit -> Math.clz32 / bit-index derivation
```

## Fixed evidence E

- exact BigInt/reference differential across all 625 isolated residual terms x 42 cells;
- reflection coverage;
- sign-bit cases explicitly included;
- exact solver decisions/work preserved in qualification.

## Result

```text
NEI-HOT-002 = SAME
```

under the pinned operation-word profile.

Again, source representations remain distinct representation occurrences.

---

# 4. Hash locator versus canonical q

The 0.1 graph used a NEI-shaped negative guard here. That is unnecessary and potentially misleading.

These are different semantic roles:

```text
32-bit hash locator
canonical q exact identity
```

The exact cache contract already states:

```text
hash -> locate candidate slot
full q coordinates -> authorize equality/hit
```

Therefore:

- hash equality supplies **no evidence** for q NEI SAME;
- hash inequality is not itself a natural q distinction theorem;
- no NEI claim is needed to preserve this safety boundary.

The graph records a typed semantic-role distinction and exact equality authority instead.

---

# 5. Task occurrences and ordinary q

The correct structure is a contextual correspondence span:

```text
task/parent occurrence
    -> physical/legal replay occurrence
    -> canonical ordinary-q projection candidate
```

A task occurrence is not the q referent itself.

## Occurrence identity

Under task-occurrence identity:

```text
occurrence A != occurrence B
```

when they are separately represented task/parent occurrences.

This is ordinary application occurrence identity; no q merge erases it.

## Standard-7x6 future-behavior identity

The later post-authority q-congruence research supplies a strong deductive candidate that equal support + equal normalized residual antichains determine ordinary future behavior.

However, the currently promoted Connect4 NEI application was frozen before that successor ingestion and records:

```text
P-C4-FUTURE-BEHAVIOR-STATE-7X6-0.1
    = INCOMPLETE_UNQUALIFIED
```

Therefore this optimization application MUST NOT assert:

```text
task A and task B -> NEI SAME ordinary q
```

as current qualified NEI authority.

Correct treatment:

```text
manager/solver contract:
    exact q equality is an implementation gameplay-cache identity

NEI status under current promoted 7x6 profile:
    INCOMPLETE_UNQUALIFIED pending successor authority/profile ingestion
```

This is not semantic NEI UNKNOWN. The missing item is authority/qualification, not a qualified model family containing both SAME and DISTINCT resolutions.

---

# 6. #96 full hash-mix-chain candidate

Issue #96 was generated by applying the same bit-pattern pattern to the remaining `mix32` chains.

The identity status is intentionally weaker than NEI-HOT-001/002.

Before a determinate SAME claim can be made for each proposed rewritten intermediate, qualification must prove:

1. the exact operation role;
2. the two queried representation occurrences;
3. exact equality of the operation-word projection;
4. that every identity-relevant consumer in the affected chain factors through that projection;
5. no unsigned magnitude/general Number property is observed before the next canonicalization boundary.

Until those obligations are closed:

```text
DP distinction audit:
    representation difference has no established natural significance

NEI claim:
    not yet qualified

performance claim:
    QU-HOT-01 OPEN
```

The candidate remains valid as a test target without assuming its NEI result.

---

# 7. Native-claim requirements

Every determinate NEI claim in this application records:

- NEI profile revision;
- carrier;
- queried referent A;
- queried referent B;
- fixed evidence revision E;
- identity-preserving law;
- result;
- provenance;
- verification/qualification status;
- completeness/resource status.

No QU fields are serialized for NEI-HOT-001/002 because unresolved identity-relevant alternatives are not part of those claims.

The standard-7x6 q query is not serialized as NEI UNKNOWN; it is recorded as incomplete/unqualified relative to the current promoted identity authority.

---

# 8. Disposition

```text
0.1 bit-pattern intuition                    retained
0.1 NEI SAME justification                  superseded
0.1 native SAME edges                       superseded
operation-word identity profile              explicitly defined
NEI-HOT-001 prepared hash                    SAME / determinate
NEI-HOT-002 isolated bit                     SAME / determinate
hash == q identity                           NOT CLAIMED
task-occurrence == q identity                NOT CLAIMED
standard-7x6 q NEI status                    INCOMPLETE_UNQUALIFIED
#96 full-mix-chain NEI status                UNQUALIFIED CANDIDATE
semantic/runtime performance observations    retained
Connect4 authority 1.1                       unchanged
```
