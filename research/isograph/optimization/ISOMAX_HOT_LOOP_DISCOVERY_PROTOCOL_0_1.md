# IsoMax hot-loop integrated IsoGraph — Discovery Protocol pass 0.1

**Issue:** #73  
**Status:** completed bounded discovery pass over the integrated optimization graph  
**Authority effect:** none  
**Graph:** `ISOMAX_HOT_LOOP_OPTIMIZATION_GRAPH_0_1.*`  
**Method:** cumulative Connect4 Discovery Protocol guidance; NEI used as identity guard/collapse tool; QU used for unresolved relations.

## Objective

Test whether the integrated semantic -> source -> runtime -> machine -> cost graph is useful for optimization rather than merely descriptive.

The pass deliberately asks:

1. which distinctions are representation-only under the exact consumer profile?
2. which semantic invariants fail to survive into implementation?
3. which cold/source structures create machine work outside their apparent source reach?
4. which execution work units fail to match the semantic dependency object?
5. can the graph produce a new bounded optimization candidate after the prior campaign?

## Protocol routing

Primary families:

- **DP-10 role match under different labels** — identify source/runtime forms realizing one semantic role;
- **DP-11 invariant across variants** — use exact equal-work/equal-result variants to locate representation-only differences;
- **DP-23 explicit versus derived structure** — distinguish semantic requirement from implementation artifact;
- **DP-36 representation redundancy / layer substitution** — find unnecessary stronger representations;
- **DP-37 equivalent closure structure** — compare task/subtree closure with canonical q dependency closure.

Identity routing:

- NEI bit-pattern profile for signed/unsigned representation alternatives;
- NEI q identity profile to prevent locator/hash collapse;
- NEI contextual-occurrence profile for multiple task/parent occurrences of one q.

Unknown routing:

- QU-HOT-01 V8 lowering;
- QU-HOT-02 dynamic machine cost;
- QU-HOT-03 parallel-distribution economics.

---

# Finding 1 — one representation-generalization defect family spans multiple hot-loop operations

## Observation

Independent qualified changes had already improved:

- q hash carriage;
- isolated-bit carriage;
- fixed cell masks;
- move-order incidence;
- singleton metadata.

The source-level changes look unrelated.

## Alignment

After aligning semantic quantity and consumer profile, they share:

```text
semantic object
    = fixed-width bit pattern
      or profile-static finite relation

implementation
    = general JS Number/object/runtime recomputation

machine consequence
    = boxing/conversion/property/load/loop structure that semantics did not require
```

## NEI result

Under a pinned consumer that observes only the same 32 bits:

```text
signed-int32 carrier
SAME
unsigned Number carrier
```

with respect to the bit-pattern operation.

Under general JavaScript numeric representation/value identity they remain DISTINCT.

The q hash remains DISTINCT from q itself under the q-identity profile.

## Disposition

**STRUCTURE_ESTABLISHED.**

This is stronger than saying several micro-optimizations happened to work. It gives a common optimization search law:

> represent no more generality than the semantic consumer observes.

## Boundary/falsifier

Do not apply when:

- unsigned numeric magnitude/order is observable;
- external API range semantics require unsigned Number;
- object identity/lifecycle is semantic;
- domain size is not static;
- exact equality authority would be weakened.

---

# Finding 2 — source branch reachability is not machine allocation reachability

## Observation

`ensureClassCapacity` had an early no-growth return before a nested `growU32` helper declaration, yet captured optimized code/sample evidence showed FUNCTION_CONTEXT_TYPE/helper-related allocation on the hot invocation.

Moving the helper to module scope removed the captured-local structure while leaving cold growth semantics behind the existing guard.

## Candidate explanations

### H1 — profiler noise only

Falsified as the complete explanation by the generated-code site change plus repeated equal-work timing evidence.

### H2 — source early return guarantees no lower-level helper cost

Falsified for the captured Node/V8 environment.

### H3 — lexical/runtime topology can survive outside apparent source execution reach

Supported.

## Disposition

**RUNTIME-SCOPED STRUCTURE ESTABLISHED.**

Do not generalize into a claim that every closure allocates. The graph must request generated-code/allocation evidence for each material case.

---

# Finding 3 — semantic q dependency and execution task occurrence are different layers

## Observation

Connect4 ordinary value is a ranked q dependency DAG. Branch Manager canonicalizes manager-visible q, but workers recurse through private task subtrees/TTs.

Final integrated evidence:

```text
serial              2,643,905 calls
four workers         ~7.09-7.17M calls
```

with exact decisions preserved.

The 512-node necessity poll reduces abandoned work but cannot expose all q convergence hidden inside simultaneous private recursion.

## NEI contextual identity

```text
task occurrence A DISTINCT task occurrence B
parent occurrence A DISTINCT parent occurrence B

projection under ordinary q identity:
    q(A) SAME q(B)
```

Fine execution provenance is retained.

## QU result

The existence of avoidable distribution pressure is supported; the exact best remedy remains QU-HOT-03.

Current lawful candidates are tracked in #89-#95.

## Disposition

**SUPPORTED ARCHITECTURAL OPTIMIZATION REGION; ECONOMICS OPEN.**

This is intentionally not promoted into one scheduler design.

---

# Finding 4 — removing a source operation is not sufficient evidence of a better realization

Negative controls from the completed issue campaign:

- hit-first interning;
- blocker chunk memoization despite very high repeated triples;
- checked/unchecked trusted primitive split;
- manager epoch visitation.

All had plausible source-level simplifications or reuse arguments and failed end-to-end promotion evidence.

## Disposition

**STRUCTURE ESTABLISHED: performance comparison is a typed cross-layer quantity.**

Required comparison coordinate:

```text
same semantic result
+ same relevant work identity
+ actual runtime/machine realization
+ end-to-end resource/time consequence
```

This mirrors the broader Discovery Protocol rule that adjacent semantic layers must not be substituted without an explicit transformation.

---

# Finding 5 — fresh candidate generated from the integrated graph

## Trigger

After Finding 1 was established, the current optimized source was scanned specifically for remaining instances of the same semantic/representation mismatch.

Both current `mix32` families still contain:

```js
x = Math.imul(x, constant) >>> 0
...
return x >>> 0
```

and callers retain unsigned intermediate hashes with `>>> 0`.

Affected current paths:

- `components/isometric/residual-pool.mjs`
  - `mix32`
  - `hashWords2`
  - `hashChunkTuple`
- `components/isometric/isomax-index.mjs`
  - `mix32`
  - `hashSignature`

Their hot downstream address operations are bitwise/masked, and full q/residual equality remains separate authority.

The post-signed-hash allocation sample still attributes bytes to nearby `hashWords2` and `hashSignature`. That attribution does **not** prove unsigned conversion is the cause.

## NEI assessment

The same bit-pattern profile that authorized the already-qualified signed hash/isolated-bit changes appears applicable to the mixing intermediates **provided every affected consumer observes only the same 32 bits**.

## QU assessment

Whether V8 actually removes allocation/code structure and whether the end-to-end economics improve remains unresolved.

Therefore the result is not a code change. It is a high-information candidate.

## Output

GitHub issue:

**#96 — Candidate: IsoMax hot loop: keep bit-pattern-only hash mixing signed through the full mix chain**

Qualification requires exact 32-bit differential, collision/probe tests, generated-code/allocation comparison and fresh-process equal-work timings.

## Disposition

**NEW BOUNDED OPTIMIZATION CANDIDATE DERIVED FROM THE GRAPH.**

This satisfies #73's central utility test: the integrated representation generated a concrete new optimization hypothesis from a cross-operation invariant rather than merely documenting existing profiling.

---

# Discovery summary

```text
DP-HOT-01  general representation > observed semantic need
            STRUCTURE_ESTABLISHED

DP-HOT-02  cold lexical structure -> hot runtime allocation
            STRUCTURE_ESTABLISHED / RUNTIME-SCOPED

DP-HOT-03  ranked q DAG != private task subtree occurrence
            SUPPORTED OPTIMIZATION REGION / QU OPEN

DP-HOT-04  source operation count != performance result
            STRUCTURE_ESTABLISHED

DP-HOT-05  signed full hash-mix chain
            NEW CANDIDATE -> issue #96
```

## What was not promoted

- no new Connect4 gameplay law;
- no universal V8 law;
- no claim that all unsigned conversions allocate;
- no claim that #96 improves performance;
- no scheduler winner among #89-#95;
- no proof/certificate identity collapse into q.

## Next-use rule

Future IsoMax optimization passes should begin with the integrated graph and ask which semantic invariants are being represented more generally than required. Expand QU regions only where resolving them discriminates concrete exact alternatives. Run DP again after material source/runtime changes; do not freeze machine observations into semantic authority.
