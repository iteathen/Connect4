# Independent cold reconstruction A — packet v2

## Disposition

**COLD_RECONSTRUCTION_COMPLETE.** The full native object, including all modules, the semantic bridge, and all twelve controls, is reconstructed in `reconstruction.json`.

**Source-semantic reconstructability: sufficient for this candidate's declared algorithm/control/data-effects scope under the stipulated, frozen ECMAScript/Node source model.** I found no demonstrated missing node kind, ambiguous present operator, lost lexical boundary, or missing static import target that prevents interpretation of the represented algorithm. This judgment uses the native semantic bridge plus the pinned model authorities; a transport round trip alone would not justify it.

**EXACT_RENDERING_NOT_QUALIFIED by this review alone.** This is one isolated decoder/reviewer contribution, not the ESR Q0–Q7 promotion. I did not receive the source oracle, so I do not assert that this complete reconstruction equals the frozen source, that every source item is covered, or that the complete qualification passed. Subsequent source comparison, control scoring, the other independent reconstruction, and scorer-blind verification remain required.

No source repair is established by this review. The remaining admission obligations are listed below. The model boundary must remain the entire stipulated frozen ECMAScript/Node model; weakening it to just the prose summaries or treating every cited section as an independently qualified IsoGraph library would exceed this finding.

## Isolation and provenance

The task supplied candidate commit identifier `5b2f4eed` and native SHA-256 `8d002aa2728ebabb9f1f7f7fc5a6c563f5514fab8a568fbec4954475ca867718`. I verified the native hash; I did not inspect git/history to independently bind the commit.

Campaign input was restricted to `packet-v2/NATIVE.isg` and `packet-v2/PROFILE.md`. Authority input was the supplied Core 0.17 consolidated qualified text, Core 0.18 and 0.19 clarification texts, ESR 0.1, and the pinned ECMA source. I searched authority filenames to locate the allowed Core texts, but did not read other campaign, experiment, source, encoder, expected-result, prior-decoder, scorer, or discovery-lead contents. The initial skill read expressly exempts a dispatched subagent. No other campaign evidence was used.

The seven public Node API documents were fetched from `https://raw.githubusercontent.com/nodejs/node/b4f23d3619c98bed09af93a21192f6080197a8c6/doc/api/`, exactly the runtime revision and interfaces declared in native. Their copies and hashes are in this evidence directory. I did not follow their external live-reference links or substitute current documentation for the pin.

Only the assigned `evidence/v2-a` folder was written. The decoder, auditing code and data were independently authored here. Node executed only these reconstruction/audit tools. No reconstructed module, solver, control program, generated program, or imported application code was executed. No commits or source edits were made.

Isolation incident disclosure: after the reconstruction and substantive report were written, the final directory-wide hash inventory revealed an externally created `SOURCE_COMPARISON.json` in this evidence folder. The hash tool read its bytes solely to emit a filename/digest; neither its contents nor comparison outcome were displayed to this reviewer or used in the conclusions. I immediately notified the parent. The inventory below is restricted to this reviewer's own files. This disclosure does not claim an access-enforced filesystem boundary; isolation was instruction-enforced.

## Frozen reconstruction

| Item | Result |
|---|---|
| Native bytes | 8,457,802 |
| Native SHA-256 | `8d002aa2728ebabb9f1f7f7fc5a6c563f5514fab8a568fbec4954475ca867718` |
| Reconstruction bytes | 6,745,508 |
| Reconstruction SHA-256 | `909ee49cc80711f11595a01e9c9c4cb5e73ab513c4fc082b0b23fd5ea28a7b78` |
| Serialization | UTF-8, `JSON.stringify(object, null, 2)` followed by LF |
| ECMA source SHA-256 | `525626fffc5737ad2eab8898f36e2a29189ada2d31316cc5beffeea1b4122321` — matches native |
| Modules / controls | 26 / 12 |
| AST nodes / node kinds | 37,439 / 51, including controls |
| Manifest edges | 58: 57 static import/re-export edges and one worker URL edge |
| Numeric payloads | 2,861; each survives JSON reconstruction bit-for-bit |

`decode.mjs` uses a cursor parser, not the campaign encoder or a general expression evaluator. It rejects duplicate keys, malformed arity, out-of-range code units/words/booleans, undeclared labels, and trailing terms. Its independent malformed-input controls pass. The supplied packet contains no nonfinite or negative-zero binary64 payload requiring a special JSON value schema; the decoder deliberately fails closed for those rather than silently losing bits. UTF-16 code units, including surrogate code units, are decoded without Unicode normalization. `numeric-bits.json` records each numeric path and exact original bits.

Independent re-encoding of the decoded object reproduces native exactly after removing terminal whitespace. Record order, sequence multiplicity, and all fields survive. This establishes reversible transport for this frozen input, not source-semantic sameness. The six constructor labels are packet-owned derived transport constructors over ordered incidence/exact integer leaves, not six newly admitted Core primitives. No program binding derives from equality of their numeric labels.

## Semantic bridge review

All 51 occurring kinds have exactly a corresponding `nodeBindings` entry; there are no unused entries. All 51 distinct cited ECMA anchor identifiers exist in the exact content-pinned specification. The binding text explicitly makes the enclosing production determine identifier/property/binder roles, so semantic identity does not collapse equal spellings across scopes.

The complete operand and statement trees, ordered lists, flags, literal values and raw forms, module boundaries and source specifiers remain present. The bridge makes operator strings select language productions under authority; I did not treat `+`, `>>`, or another glyph as an unqualified conventional operation. `BinaryExpression` uses a broad expression-section anchor, but its operator and ordered children select a definite present production under the full pinned grammar. This is not an operator-semantics gap for the observed set.

The field descriptions are contextual interfaces rather than exhaustive standalone JSON schemas. Important cases are correctly recoverable:

- `Property` under `ObjectPattern` is a binding property; under `ObjectExpression` it creates a property. Noncomputed property names do not become lexical uses.
- Function declaration/expression and arrow forms retain their distinctions. Async flags select async productions; methods retain their enclosing class/method context, so their function-valued payload is not interpreted as an unrelated ordinary function expression. All represented generator flags are false.
- `VariableDeclaration.kind` is only `let` or `const` in this packet. The generic description mentions `var`, although its section anchor alone is not the `var` section; that unexercised generalization is not needed here.
- `ImportDeclaration`, exports, and export-all retain `attributes`, though the prose field summary does not name that field. All observed attribute arrays are empty. Nonempty attributes would need explicit scrutiny in a future revision.
- Calls preserve receiver references and argument order; optional-chain boundaries and optional member flags survive. Parentheses are explicit, so chain/grouping distinctions are not flattened.
- Return/throw/break/continue, try/finally and await retain completion and suspension structure. They are not represented as an unordered dependency graph.

The static module graph was independently derived from represented import/export syntax. All 57 static edges match the manifest, and every internal target exists. The remaining manifest edge is explicitly typed `workerURL`, not falsely counted as a static import. The 26 modules include inactive exports; no branch or export was discarded based on an assumed entry execution.

A scope-navigation audit recovered 10,220 nearest lexical reference-to-binding links across 1,388 represented scopes. Remaining lexical names are standard ECMAScript globals or declared Node host names (`process`, timers, `URL`); there is no observed application-specific unowned global. `binding-navigation.json` preserves the links. This audit is deliberately not claimed as a complete early-error checker or linker: default-parameter environments, TDZ, per-iteration environments and declaration instantiation derive from the pinned language semantics, not from that navigation helper.

## Effects and control semantics

The controls were reconstructed without execution or oracle access. Their source-semantic distinctions are recoverable as follows:

| Controls | Recovered distinction under pinned authority |
|---|---|
| c01 / c02 | `a - b` versus `b - a`: both ordered operand incidence and evaluation/coercion order differ. |
| c03 / c04 | `a >>> b` versus `a >> b`: unsigned versus signed right shift. For Number operands, the former starts with ToUint32 and zero-fill; the latter with ToInt32 and sign extension. No assumption is made that arbitrary caller inputs are Numbers. |
| c05 / c06 | `a >= b ? 1 : 0` versus `a > b ? 1 : 0`: the relational production differs; no equality-boundary collapse. |
| c07 / c08 | Inner parameter `x` shadows outer `x` in c07. In c08 the inner parameter is `y`, while the body use of `x` captures the outer binding. The outer `x` in the final expression remains outer in both. This is a binding change, not alpha-renaming. |
| c09 / c10 | `a && ++x` conditionally evaluates the increment; `a & ++x` evaluates it eagerly and applies bitwise numeric coercion. |
| c11 / c12 | The finalizer returns `b` versus `a`; its abrupt return replaces the try-block return under the pinned try/finally completion rule. |

These interpretations were checked against the pinned signed/unsigned shift, logical operator, environment/function and try-statement authority, including `sec-try-statement-runtime-semantics-evaluation`. They demonstrate more than different JSON bytes. They are not a claim that the undisclosed mutation generator changed exactly one feature or that the control suite covers every material source category.

Memory effects retain typed-array views, SharedArrayBuffer relationships, Atomics operations, accesses, guards and calls. Their semantics route through the explicit ECMA typed-array/Atomics/memory-model dependencies. Presence of an atomic access does not establish a larger compound algorithm is atomic, race-free, work-unique or correct. None of those stronger claims was inferred.

## Runtime and scope

The authority category is a stipulated source language and frozen implementation environment, not an irreducible Core primitive, a theorem of correctness, or an observational timing model. The pinned Node documents support the stated distinctions: SharedArrayBuffer storage remains shared; ordinary untransferred ArrayBuffer storage is copied; workerData cloning can throw; termination is asynchronous and returns a Promise completed with the exit event; timer delays are not exact timing/order guarantees; `performance.now()` has a process-relative millisecond clock and a required receiver.

The represented calls preserve their own arguments and receiver, so the model's full contracts govern rather than replacing them with the prose summary. Mutable external inputs and worker/clock/failure traces remain open. Their unresolved carrier is constrained by the pinned ECMAScript agents/shared-memory and Node host contracts, with no invented schedule, fairness guarantee, probability measure or timing bound. Hardware/JIT costs need not be determined to reconstruct an algorithm under this scope.

The whole pinned Node host model matters at host-defined hooks such as module resolution, `import.meta.url`, and structured cloning. The seven interface documents are navigation into that declared model, not a proof that their brief text closes every transitive host hook. An admission verifier should expressly retain that interpretation. If the intended authority were instead limited to those prose documents alone, the packet would need a pinned complete host-hook interface, including module/import-meta and cloning behavior; the ECMA source alone delegates those semantics to the host. This is an authority-scope condition, not evidence that a different runtime realization should be guessed.

Omitting comments/source offsets is consistent with the expressly excluded byte-identical source introspection and stack-trace formatting. Errors, error-handling control and cleanup remain in scope. A later claim that observes omitted source text, file-location formatting, a unique schedule, or deterministic machine cost needs a new qualified bridge/scope; it cannot inherit this reconstruction judgment.

## Obligations before admission

1. Bind the candidate/native/profile/source-oracle revisions and the represented source-model dependencies in the promotion record; verify the source freeze and author coverage without exposing the oracle to cold decoders before freeze.
2. Freeze the second independent reconstruction and compare both complete reconstructions with the withheld source-semantic oracle under the declared normalization. Exact native round trip and matching decoder hashes cannot replace that comparison.
3. Score the controls against their separately frozen source variants. Preserve the semantic distinctions above and audit coverage of all source-material distinctions, including literals, branch/order, identity-sharing, boundary/unknown and memory/effect categories where applicable. No control-coverage completeness is asserted here.
4. Verify the explicit bridge's exact contextual use and full model authority category, including host-defined hooks. If only a narrower documentation subset is intended as authority, repair its missing host-interface closure before admission.
5. Perform the ESR scorer-blind independent verification after decoder outputs are frozen. Promote only after all required gates pass, and restrict downstream use to the qualified scope.

This is an evidence/admission boundary, not a demonstrated Core representability defect. Source-oracle sameness remains unobserved by this reviewer.
