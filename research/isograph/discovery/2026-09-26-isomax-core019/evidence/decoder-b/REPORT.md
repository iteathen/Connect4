# Decoder B — frozen independent native-only review

Disposition: **EXACT_RENDERING_NOT_QUALIFIED** for executable source semantics under Core 0.19 section 18. **PASS for complete reversible syntax-object transport under the supplied candidate profile.** These are different predicates, not contradictory observations (Core 0.18 sections 1–2).

Candidate identity supplied to this reviewer: `49d4e703`. Native identity was independently checked; the commit was not inspected. This report is frozen for that native payload. It does not score a later repair.

## Isolation and method

Inputs read: packet `PROFILE.md`, packet `NATIVE.isg`, the three expressly allowlisted Core 0.17/0.18/0.19 documents, and `qualification/EXACT_SOURCE_RENDERING_CONTRACT_0_1_CANDIDATE.md`. No original source, author oracle, manifest, existing encoder/decoder, other decoder output, previous research, or git history was read. No source or reconstructed program was executed. Node ran only this reviewer's independent decoder, structural inventories, and assertions. The profile's declared Core revision is `43490735f0073acccb4f900e247cd0db19681e1f`; no external authority content was silently fetched or imported.

`decoder.mjs` implements a cursor-based recursive parser directly from the six profile constructor definitions. It rejects unknown labels, duplicate or nonstring keys, malformed/incorrect-arity terms, out-of-range integers, and trailing terms. Record field order is separately retained; sequences retain order and multiplicity; UTF-16 code units are rebuilt without normalization; binary64 high/low words are decoded in big-endian order. An independently written inverse inside the same reviewer implementation exactly re-encodes the complete decoded object to the supplied native text after trimming surrounding whitespace. This is a useful transport witness, not a source-semantic equivalence witness or a second independent decoder.

The full reconstructed object is emitted as compact UTF-8 JSON plus one LF. A custom writer retains record field order and would emit negative zero as `-0`; this packet contains no negative-zero or nonfinite numbers. Nonfinite payloads would fail JSON emission rather than silently become null. Ten malformed-input rejection controls and direct UTF-16/signed-zero controls passed. These are decoder controls, not ESR source-mutation qualification.

## Frozen measurements

| Quantity | Result |
|---|---:|
| Native bytes | 8,362,179 |
| Reconstruction JSON bytes | 1,874,015 |
| Profile constructor occurrences | 230,032 |
| Records | 37,338 |
| Record field occurrences | 110,580 |
| Sequences | 3,542 |
| Sequence item occurrences | 8,871 |
| Strings, including field keys | 173,968 |
| UTF-16 code units | 1,192,582 |
| Binary64 number values | 2,853 |
| Booleans | 11,167 |
| Nulls | 1,164 |
| Negative-zero / nonfinite values | 0 / 0 |
| Maximum decoded value depth, root depth zero | 35 |
| Modules / entry paths | 26 / 2 |
| AST objects bearing a string `type` | 37,249 |
| Distinct AST `type` values | 51 |
| Declared import records | 58 |

Native SHA-256: `430b4d31343f0f3981d43e62f0a4a12304283147acf7fd98f1826f166ff37b3c`

Reconstruction SHA-256: `8e499a65bc76c1220de5b5311a7d51767b7fdf8b89b1395fa4f77a90be798609`

Both entries occur in the 26 unique module paths. All declared local import targets occur in that module set. The 58 declared edges comprise 39 local ImportDeclaration records, 15 ExportAllDeclaration records, one workerURL record, and three external import occurrences. External occurrences name `node:worker_threads` twice and `node:perf_hooks` once. These checks establish internal inventory closure only; they do not prove that the inventory covers unseen source or that runtime resolution/linking succeeds.

## What native structure actually supports

The native payload reconstructs six root fields: `format`, `core`, `interpretation`, `entries`, `imports`, and `modules`. It carries complete program-shaped syntax trees rather than only function names or a dependency skeleton. Types, declaration/use spellings, operators, operand fields, literal spelling/value, parameter lists, block nesting, statements, guards, import/export syntax, calls, computed/optional flags, and ordered collections survive transport. Examples include 16,295 Identifier nodes, 2,843 BinaryExpression nodes, 1,367 AssignmentExpression nodes, 723 CallExpression nodes, 175 NewExpression nodes, 745 IfStatement nodes, 202 ForStatement nodes, and five AwaitExpression nodes.

Core 0.17 permits these label-headed ordered incidences; this profile declares all six used labels within the packet namespace. No Core `?n` variables occur in this restricted serialization grammar. However, AST Identifier records are not automatically Core-owned semantic bindings. Neither the absence of native `?n` nor the presence of lexical nesting proves ECMAScript name resolution, capture avoidance, module linking, or evaluation semantics.

The native interpretation explicitly says `ECMAScript 2025 modules`, gives ECMA-262 revision `2e1eeda78a104b5e50eec93214fb800309ee379f`, names `Node.js 26.7.0` and `acorn 8.15.0 with preserveParens`, excludes source locations/comments and source-text reflection, and claims complete static module closure including inactive exports. I recover those statements as packet assertions; I do not independently certify them against inaccessible sources.

## Admission failures and exact obligations

1. **Semantic bridge / leaf authority is not closed.** The six constructors explain records and primitive data, but do not explain how the 51 represented AST node types and their fields denote ECMAScript grammar and execution. A language revision citation and parser version are not a qualified exact bridge. For example, `operator: ">>>"`, `type: "LogicalExpression"`, and `type: "MemberExpression"` remain strings until a represented, pinned dependency supplies their exact interpretation and interface. Coercions, reference-versus-value behavior, short-circuiting, evaluation order, abrupt completion, callable/constructor behavior, mutable state and intrinsic operations cannot be supplied from reviewer familiarity. This is a semantic-dependency gap under Core 0.19 18.1–18.5, not evidence that Core lacks representational power.

2. **Binding and module semantics remain unproved.** Names and nesting preserve the data from which a qualified ECMAScript bridge could reconstruct declaration ownership, parameter/default/destructuring behavior, lexical versus function/module scope, capture, `this`/`super`, import/export resolution, and initialization. The packet does not supply such a qualified bridge or an exact binding/closure witness. An explicit binding map is one repair, but is not intrinsically required if a qualified dependency derives the same facts exactly from these trees. No actual illegal capture or missing source declaration is alleged from this review.

3. **Ordering is structurally preserved; operational ordering is unresolved.** Ordered incidence and sequence reconstruction establish statement/operand occurrence order. They do not themselves establish which operands are evaluated, which evaluation has effects, exceptions/finalizers, await continuation behavior, or the memory/event ordering constraints of concurrency. These must come from qualified semantic authority, not from sequence position alone.

4. **Host/runtime interfaces are only named, not admitted.** In addition to the two external module names, native syntax contains calls/new expressions naming Worker, SharedArrayBuffer, typed arrays, Atomics operations, Promise, timers, performance.now, URL/import.meta, and Math intrinsics. Observed counts include 11 SharedArrayBuffer constructions, 35 Atomics.load calls, 17 stores, six compareExchange calls, two waits, nine notifies, one Worker construction, two performance.now calls, and one setTimeout call. These observations demonstrate material interfaces to account for; they do not supply their semantics. Native strings explicitly list `runtime external API semantics admission` as unresolved. A runtime release name alone does not establish a content-pinned qualified interface contract, memory model, worker lifecycle/error behavior, timer/clock model, module URL resolution, host inputs, or allowed environment transitions.

5. **Unknown environment is not itself a requirement to choose a concrete schedule.** OS scheduling/event interleaving and JIT instruction cycles are also listed as unresolved. Exact source-semantic rendering can preserve a constrained family of allowed schedules/observations; it need not predict one schedule or every physical cycle count. Cost/JIT facts can remain outside an explicitly scoped claim, or be represented as unresolved parameters where material. The current blocker is absent admitted transition/observation constraints and semantic interfaces, not nondeterminism by itself. An unconstrained English list of unknowns does not discharge an exact operational claim. Core 0.19 18.7 and Core 0.18 section 6 prohibit guessing or silently discarding potentially load-bearing distinctions.

6. **Full ESR qualification evidence is unavailable to this isolated decoder.** Transport reconstruction contributes to Q2/Q3 at the syntax layer. I cannot certify the source freeze/coverage audit, source-to-reconstruction structural witness, normalization safety relative to frozen source meaning, targeted source distinction mutations, scorer-blind verification, or final promotion. No source agreement is claimed. No numerical hash agreement with another reconstruction is assumed. The preserved omission of comments/locations is a declared policy, not an independently qualified semantic normalization in this review.

## Minimal repair and downstream boundary

For the present payload, retain the useful reversible transport result and the exact-rendering rejection. Do not use it as operational equivalence, proof, isomorphism-discovery, or implicit-support evidence beyond the syntax content actually established.

The smallest defensible semantic repair is an immutable, explicitly native-linked Acorn/AST-to-ECMAScript interpretation contract covering each used node/field/flag and its grammar/semantic interface, with qualified treatment of the parser-specific parentheses surface and declared normalization. It must recover binding, module initialization and ordered/effectful evaluation without unstated premises. Supply pinned Core-compatible primitive/model-leaf interfaces for the used language intrinsics and host APIs; identify their authority categories and admissible input/state/event families. Represent scheduling uncertainty as constrained allowed behavior rather than choosing an outcome. Restrict cost claims explicitly or provide their separate model authority. Then rerun fresh cold reconstruction, source-semantic comparison, appropriate one-distinction controls, independent verification, and promotion against the new frozen revision. Parsing reconstructed code can support the grammar bridge, but cannot alone prove operational equivalence or external runtime closure.

Alternatively, freeze and qualify a narrower syntax-object claim. That would be a legitimate different target, not admission of this packet as a full executable-semantic rendering. No serializer corruption, source mismatch, or Core representability defect was demonstrated here.
