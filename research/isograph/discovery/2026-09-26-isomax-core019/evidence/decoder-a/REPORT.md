# Decoder A — frozen native-only review

Disposition: **STRUCTURAL_RECONSTRUCTION_PASS** for the complete six-constructor native object; **EXACT_SOURCE_RENDERING_NOT_QUALIFIED** for operational ECMAScript source semantics under Core 0.19 section 18. This is a source-semantic dependency/qualification gap, not evidence of a Core representability defect or a demonstrated source mismatch.

## Isolation and identity

Reviewed candidate packet commit `49d4e703` as identified by the assignment. Git history was not inspected, so commit identity is assignment-provided; the native content hash was independently checked. Inputs read were only `packet/PROFILE.md`, `packet/NATIVE.isg`, the permitted Core 0.17 and Core 0.19 authority excerpts and permitted ESR 0.1 contract. Subsequent inspection reads only this decoder's independently produced reconstruction/evidence. No source, oracle, manifest, encoder, other decoder, previous findings, or solver files were read. No reconstructed program was executed. No solver files were modified and no commits were made. All writes are in `evidence/decoder-a`.

The independently written decoder uses only Node built-ins, at `C:/r/c4-compact-q1/node-v26.7.0-win-x64/node.exe`. Run `decode.mjs`, then `inspect.mjs`, then `closure.mjs` with that executable to reproduce the evidence. No external parser or source generator was used.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| Frozen NATIVE.isg, unchanged before/after decoding | 8,362,179 | `430b4d31343f0f3981d43e62f0a4a12304283147acf7fd98f1826f166ff37b3c` |
| reconstruction.json, compact JSON plus one LF | 1,874,015 | `8e499a65bc76c1220de5b5311a7d51767b7fdf8b89b1395fa4f77a90be798609` |

## Complete structural reconstruction

The decoder consumes exactly one full native value, validates constructor identities, arities, literal ranges and duplicate record keys, preserves record and sequence order, and rejects trailing input. Records use null-prototype objects and a separate ordered-key list, so prototype names and numeric-looking field names do not silently change decoding or field order. UTF-16 is decoded by code units without Unicode normalization. Binary64 is decoded from the two big-endian words, with negative-zero-aware JSON serialization. This actual packet contains no non-finite payloads or negative zero. Plain JSON cannot preserve a NaN payload, so the decoder would explicitly reject JSON emission for such an input rather than silently convert it to null; that limitation is not exercised here.

Independent re-encoding from the entire reconstructed object reproduces every native token after whitespace removal. This checks all records and leaves rather than a sample. It establishes native/profile structural fidelity only. A round trip cannot establish equality to the withheld source oracle.

| Item | Count |
| --- | ---: |
| Record values | 37,338 |
| Record fields | 110,580 |
| Sequences | 3,542 |
| Strings, including keys | 173,968 |
| UTF-16 code units | 1,192,582 |
| Binary64 values | 2,853 |
| Booleans | 11,167 |
| Nulls | 1,164 |
| Maximum constructor nesting | 36 |
| Modules / entry modules | 26 / 2 |
| AST node occurrences / node kinds | 37,249 / 51 |
| Declared dependency edges | 58 |

Eleven malformed-input rejection controls pass: unknown constructor, invalid Boolean, invalid code unit, missing number word, oversized number word, extra null argument, trailing term, duplicate key, non-string key, primitive sequence element, and negative code unit. Four positive checks cover UTF-16 surrogate/NUL preservation, negative zero, repeated sequence occurrences, and record field order for integer-looking keys. These are decoder controls, not the source-semantic adversarial mutation controls required by ESR Q5.

The complete object has `format`, `core`, `interpretation`, `entries`, `imports`, and `modules`. Each module contains a path and full program tree. No native field was discarded. Detailed inventories are in `counts.json`, `inspection.json`, and `closure.json`.

## Dependency and syntax closure

Core/profile dependencies are explicitly named: IsoGraph revision `43490735f0073acccb4f900e247cd0db19681e1f`, ECMAScript source anchor `2e1eeda78a104b5e50eec93214fb800309ee379f`, Node 26.7.0 and Acorn 8.15.0 with `preserveParens`. A revision citation is useful provenance but does not by itself qualify the semantic interface connecting these systems.

The six local constructor labels are declared by PROFILE as packet-owned serialization constructors. They fit Core ordered incidence and exact-integer literal syntax; they are not new Core primitives. There are no Core binder variables or native references in this restricted tree format. AST identifiers are represented strings, so absence of native free variables does not prove ECMAScript binding correctness.

I derived 57 syntactic module import/re-export edges and one literal worker URL edge directly from the reconstructed AST. Their normalized endpoints and kinds match all 58 declared edges. Every internal endpoint and both entries exist among the 26 modules. All included modules are statically reached from the union of the declared entries under this graph. This is an internal consistency check of the supplied closure, not proof that the hidden source's closure is complete or that Node's module resolution and linking behavior are fully modeled. The worker URL is represented as a `new URL` passed to `session.spawn` with `import.meta.url`; its interpretation still requires the host/module bridge.

External module edges are three occurrences to two names: `node:worker_threads` from branch-manager-host and lazy-smp-worker, and `node:perf_hooks` from lazy-smp-host. The packet correctly marks these names external. The operational boundary also includes host globals and callback interfaces, which cannot be reduced to this import-name list.

## Separate operational-semantic admission review

**1. Model-leaf/operator authority remains unqualified.** `BinaryExpression`, `LogicalExpression`, `CallExpression`, operator spellings and AST field names are completely recoverable data, but the packet does not provide a qualified AST-node/field-to-ECMA grammar/evaluation bridge. Fifty-one node kinds, including Acorn's `ParenthesizedExpression`, need exact interpretation. The pinned ECMA source anchor does not state which production and static/runtime semantics each AST shape denotes. Familiar knowledge of `>>>`, `+`, `||`, property access or a function call would be silently completing semantics. This is a Core 18.1–18.2/18.5 and ESR semantic-dependency gap. It is not enough to declare arbitrary AST node labels primitive leaves merely to halt decomposition.

Minimal repair: supply a content-pinned, qualified bridge covering every present node type and load-bearing field, its exact grammar/semantic production, validity conditions, literals and raw fields, exceptional behavior, and the parser extensions/normalization involved. Its interface and application to these module trees must be explicit native dependencies. A qualified ECMA model leaf can lawfully terminate decomposition if its exact interface and authority are established; further decomposition into hardware is not inherently required.

**2. Binding information is present syntactically but binding semantics and verification remain open.** There are 16,295 Identifier occurrences, 277 FunctionDeclaration nodes, 126 AssignmentPattern nodes, 20 ObjectPattern nodes, class/method structure, declarations, import specifiers, ordered parameter arrays, and nested blocks. These retain the information a qualified language bridge could use to recover ownership. They are not an independent proof of ownership, capture freedom, `var`/lexical binding rules, temporal dead zones, destructuring/default-initializer environments, closure capture, module live bindings/re-export resolution, or `this`/`super` behavior. Native key strings are not themselves a qualified binding map.

Minimal repair: derive and verify these bindings under the qualified language bridge, including module resolution/instantiation. Preserve original names and nesting or provide an exact witnessed binding map. This does not demand redundant explicit binder IDs if a qualified deterministic derivation from the AST suffices. I found no demonstrated rebinding defect in the tree; the finding is an undischarged admission obligation.

**3. Ordered syntax is preserved, while evaluation order and effects need the bridge.** The reconstruction retains binary left/right operands, argument arrays, statement arrays, guards, defaults, optional/computed flags, and branches. Examples include 403 LogicalExpression, 177 ConditionalExpression, 745 IfStatement, 1,367 AssignmentExpression, 723 CallExpression, 175 NewExpression, 51 ThrowStatement, 5 TryStatement and 5 AwaitExpression nodes. Program text order alone is not all ECMAScript execution order: short-circuit evaluation, call-reference/receiver semantics, coercion, exceptions, default evaluation, loop control, async suspension/resumption and `finally` must have declared semantics. Mutable array/typed-array access and shared-buffer identity are also load-bearing. None is licensed by ordered incidence alone.

Minimal repair: qualify the applicable evaluation, state/heap, coercion, completion and async semantics and then verify source-to-AST representation preserves them. Targeted controls should distinguish operand and argument swaps, short-circuit from eager evaluation, changed guards, binding ownership/default scopes, mutation order, throw/finally behavior and shared versus copied storage. This review's decoder controls do not discharge those obligations.

**4. The external boundary is candidly unresolved but not operationally closed.** AST inspection exposes `Atomics.load/store/compareExchange/add/notify/wait/exchange/sub`, `SharedArrayBuffer`, typed arrays, `new Worker`, worker data, event handlers, termination, `performance.now`, `process.execArgv`, timers, promises, signal event listeners, URL and `import.meta.url`. For example branch-manager-host `program.body.7.declaration.body.body.6.block.body.0.expression` contains an awaited Promise whose callbacks install a timeout and polling interval; these callbacks affect control state. Lazy-smp-host `program.body.6.declaration.body.body.9.finalizer.body.0.expression` awaits session closure. They cannot be treated as decorative calls.

Minimal repair: represent qualified runtime model leaves with exact input/output/state/effect interfaces for the used API surface; pin runtime/module-loading, worker transfer/shared-memory, event, timer/clock and abort contracts and their provenance. Provide the environment and input boundaries or preserve them as explicit parameters/possibility structure. A runtime version string alone is not a qualified immutable semantic implementation dependency.

Environmental nondeterminism is a different issue from missing operator meaning. The packet explicitly lists OS scheduling/event interleaving, JIT lowering/instruction cycles, and runtime API admission as unresolved. Nondeterministic scheduling need not be resolved to one schedule: it can lawfully remain QU or another qualified possibility model whose admissible behaviors, correlations, memory ordering and observable effects are represented. Ordinary operator semantics cannot be supplied by that scheduling QU. JIT instruction cycles need not be modeled at all for a claim limited to abstract ECMAScript behavior; if timing/cycle claims are included, they create additional obligations. A list of unresolved strings is disclosure, not yet a recoverable qualified possibility model. These limitations block unconditional operational equivalence but should not be misreported as evidence that the program's behavior is inherently unreconstructable.

**5. Normalization requires claim-bounded evidence.** Source locations/comments are omitted, with an explicit exclusion of source text reflection. This is appropriate scope disclosure, but exact operational promotion still needs a witness that the permitted normalization does not remove load-bearing behavior within the frozen interpretation, including any host-observable source metadata in scope. No byte-for-byte source recovery claim is supported or needed. PROFILE is permissible serialization metadata for this structural decoding; it must not become an unpinned sidecar that supplies the missing operational bridge.

## Qualification boundary and next action

Core 18.9–18.12 and ESR Q0–Q7 prevent promoting a structural round trip into source-semantic qualification. This isolated execution supplies one complete cold structural reconstruction. It does not establish Q0 source freeze, Q1 hidden-source coverage, the semantic part of Q2, source-semantic Q3, Q4 canonical oracle sameness, Q5 source-level distinction controls, independent Q6 verification, or Q7 promotion. A second independent execution and exact oracle comparison belong to the scorer after outputs are frozen. I make no source-sameness claim without that withheld oracle, and no canonical-sameness failure is asserted merely because I cannot inspect it.

Current lawful use: a complete reversible native serialization of the supplied syntax-tree object, with useful exposed syntax and internal dependency evidence; operationally **PARTIAL_EXPLORATORY_REPRESENTATION** pending the listed semantic dependencies and gate evidence. Do not use this packet as admitted operational source-faithful proof, isomorphism, discovery or implicit-assertion support. Preserve this report for candidate `49d4e703`; any repaired bridge/runtime revision must receive its own freeze and qualification evidence.
