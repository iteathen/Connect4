# Decoder B: independent native reconstruction and admission audit

Disposition at native-only freeze: **transport reconstruction PASS; source-algorithm bridge audit SUPPORTS ADMISSION; EXACT_RENDERING_NOT_QUALIFIED from this evidence alone.** No concrete representation defect was identified. The final status is a missing-evidence boundary, not a finding that ECMAScript semantics cannot be represented or that this packet loses algorithm meaning.

## Isolation and identity

This decoder independently read NATIVE.isg, PROFILE.md, qualified Core 0.17 with 0.18/0.19 clarifications, ESR 0.1 candidate, the native-pinned ECMAScript authority, and seven Node documentation files fetched at the native-pinned immutable revision. No source implementation, author oracle, encoder, manifest, prior reviewer outputs, campaign artifacts, or git history were used in reconstruction. All newly written files are under evidence/v2-b. No reconstructed solver code was executed.

The reconstruction was written and hashed before the coordinator sent any source-comparison assertions. Such assertions were subsequently received, but have not been used as evidence in this native-only report; post-freeze verification, if performed, will be a separate addendum.

* Frozen task source identifier: 5b2f4eed (supplied identity, not independently read from source).
* Native SHA-256: `8d002aa2728ebabb9f1f7f7fc5a6c563f5514fab8a568fbec4954475ca867718`.
* reconstruction.json SHA-256: `c6c7e444e5f7aaeceeae648f63f04e9ffcd910bb3716c0b0dd806e93f3ab243f`.
* Reconstruction serialization: compact JSON preserving record insertion order, UTF-16 string values and numeric signed zero, followed by one LF.
* ECMAScript authority SHA-256: `525626fffc5737ad2eab8898f36e2a29189ada2d31316cc5beffeea1b4122321`, matching native modelAuthority.language.
* Node source-model revision: `b4f23d3619c98bed09af93a21192f6080197a8c6`; documentation URLs and acquired-content hashes are in host-audit.json.

## What was reconstructed and verified

decode.mjs implements a new recursive constructor parser. It checks constructor identity, key type and uniqueness, boolean domain, UTF-16 and uint32 ranges, fixed arities, complete consumption and trailing terms. It reconstructed all eight top-level fields, 26 module trees, 58 declared import edges, the entire semanticBridge, and 12 control programs. The packet has 37,599 records, 111,357 record fields, 3,626 sequences, 175,277 strings, 2,861 binary64 payloads, 11,213 booleans and 1,180 nulls. Numeric payloads in this packet are finite; the decoder fails closed for nonfinite JSON values instead of silently changing them.

An independently written inverse in the decoder re-encodes the saved JSON into native constructors. Its result equals the complete input after removing outer whitespace. Thus neither JSON number conversion nor property ordering silently lost a bit or occurrence in this input. This is an exact transport witness, not a source-oracle witness. The decoder is scoped to this profile and packet, not claimed as a generally qualified Core parser.

structural-audit.json inventories every encountered node field and every used operator/flag value across all module and control ASTs. All 51 encountered node kinds have exactly the expected nodeBindings coverage; no unused or missing node-kind entry was found. All cited ECMAScript section anchors exist in the hash-verified authority. FIELD_REVIEW.md records the entire node/field coverage inventory alongside the native mapping.

## Model-leaf authority and source semantics

Core 0.17 section 4.2 and Core 0.19 section 18.2 permit explicitly represented source-model or frozen-implementation leaves with pinned authority. The packet identifies this category explicitly. It does not falsely label JavaScript operators as irreducible Core primitives. Its full syntax trees and field roles provide the interface to ECMAScript; operator tokens select pinned productions, whose coercion, Reference, Completion and evaluation rules supply semantics. Native record/sequence labels are transport identities rather than program-variable identities.

The bridge is inside the native object. PROFILE supplies only the six transport constructors and claim boundaries; it does not complete absent solver formulas. The native object contains the same meaningful scope/normalization boundaries. Treating the decoded JSON file as evidence is legitimate here because it is mechanically recovered from native structure, not supplied as a semantic sidecar.

The ECMAScript and Node pins are legitimate stipulated source-model authorities for this bounded algorithm claim. A complete algorithm representation does not require expanding the full language implementation, JIT or hardware into Core primitives. Conversely, merely naming a runtime would not suffice: the represented call sites, argument order, shared view constructors, Worker options, event names, cleanup and data flow remain load-bearing and are retained here.

## Node fields, flags, and effect order

All used node fields were examined against the native role map and the pinned productions. The general operator sections are broad but determinate: exact operator tokens and operand positions select the applicable production. Binary operators include strict equality, relational, arithmetic, bitwise shifts/operations and instanceof. Logical &&, || and ?? remain distinct from eager bitwise operators. Assignment operators preserve the left reference and right expression; +=, -=, |=, ^= and &= are not collapsed to pure arithmetic.

Member computed and optional flags preserve property-key evaluation and optional-chain behavior. ChainExpression supplies the short-circuit extent, while ParenthesizedExpression preserves grouping. Calls preserve receivers and ordered arguments. Property key/value/shorthand/computed/method/kind and MethodDefinition key/value/kind/static/computed are present. ObjectPattern is interpreted through its parent binding context rather than as object construction. The only SpreadElement is object spread; the map and parent resolve its semantics without importing array-iterator behavior.

Function id, params, body, async and generator flags and lexical nesting remain explicit. All generator flags are false; FunctionDeclaration/FunctionExpression expression=false and ArrowFunctionExpression id=null/generator=false are grammar-constrained in this observed packet. Arrow expression=true/false selects expression/block body. These otherwise terse bridge details do not leave two admissible meanings for the represented nodes. All import/export attributes arrays are empty; the descriptions do not mention that field explicitly, but there is no attribute payload whose semantics could be lost. Nonempty attributes, generators, regex literals, and other unused forms are not admitted by extrapolation from this audit.

Loops retain init/test/update/body, for-in versus for-of, await=false, and lexical declarations. Null loop components are explicit, not inferred. Return, throw, break, continue and try/finally remain distinct completion paths; all represented handlers are null. Finally can replace a pending return or throw under the pinned completion rules. Statement lists, properties, arguments, parameters and array occurrences are ordered. No tree node is discarded as unreachable. Intra-agent execution order follows the language; the packet does not impose a fabricated total order across workers.

## Scope, module and host closure

scope-audit.mjs independently walks represented syntax ownership. It finds 1,344 scopes, 2,905 declaration occurrences and 10,561 lexical-use occurrences in the module trees. 10,186 uses resolve through represented owning scopes. The remaining 375 uses are 23 standard ECMAScript/Node global names, recorded in scope-audit.json. Property keys, import names and import.meta names are not misclassified as lexical references. No unowned program-variable spelling was found. This ownership check is not an execution or complete early-error checker; TDZ, parameter initialization ordering, closures and module instantiation remain governed by the explicit tree plus pinned authority.

Both entry paths are represented. All internal static module specifiers resolve to represented module paths. The independent export-name closure check finds all 101 internal named imports supplied by the represented declarations/reexports. External imports are Worker and workerData from node:worker_threads and performance from node:perf_hooks. Declaration/use spelling remains scoped; no alpha-renaming or cross-module name merging was performed.

Runtime interfaces are pinned to Node 26.7.0, including Worker construction, workerData copying/shared-buffer treatment, Worker error/exit events and termination Promise; timers and cancellation; performance.now; URL construction; process.execArgv; and EventTarget/EventEmitter behavior. The actual import.meta.url-based worker URL construction is present. Node's immutable repository pin supplies the host model, while the listed documentation provides navigation and runtime-boundary explanation; these do not need to be interpreted as an exclusive whitelist that erases Node module-host semantics. Native import/export paths and the worker filename remain explicit.

ECMAScript provides Number/coercion/Math.imul, typed arrays, shared memory and Atomics semantics. Node docs explicitly retain SharedArrayBuffer accessibility across workers. No atomicity or race-freedom theorem is inferred from representing a typed-array access. Timers supply thresholds rather than exact execution time; performance.now supplies an observation rather than an instruction-cost constant. Scheduling, failure occurrence, diagnostics, timing, JIT and hardware costs remain constrained unknown environment traces, with no invented measure or deterministic choice.

## Exact missing obligations at this freeze

1. Q0/Q1: independently inspect the frozen-source packet and author coverage record after reconstruction isolation ends; source freeze and zero source-item omissions/additions cannot be certified from native alone.
2. Q3: acquire the other required independent fresh decoder result and its isolation evidence. This report establishes only Decoder B's reconstruction.
3. Q4: compare the frozen reconstruction with the hidden frozen source-semantic oracle under an explicit canonical comparison policy, with a verified exact witness for every load-bearing field. This report deliberately makes no hidden-source agreement assertion.
4. Q5: score targeted source distinction controls through native rendering/reconstruction and verify their changed meaning is preserved. Twelve native control programs exist and were preserved, but their mere presence and distinct serialization do not prove source mutation coverage or outcome distinction.
5. Q6/Q7: an independent verifier must assess freeze identity, source coverage, closure, both decoder isolations, exactness witnesses and mutation results, then pin a promotion record for the actual dependency/evidence revision.

These are unperformed subsequent qualification checks, not established NATIVE_COVERAGE_GAP, SEMANTIC_DEPENDENCY_GAP, or CORE_REPRESENTABILITY_CANDIDATE_DEFECT findings. No concrete missing node, operand, field, flag, guard, scope or runtime-interface defect was demonstrated in this audit. The existing candidate can therefore proceed to post-freeze scoring without a representation repair demanded by Decoder B. The audit does not prove solver correctness, runtime performance, optimization benefit, universal environment behavior, or byte-identical source reconstruction.
