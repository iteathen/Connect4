# Independent ESR Q6 verification — packet v2

**Admission assessment: PASS under the declared algorithm/control/data-effects scope and the complete stipulated, pinned ECMAScript/Node source model. Q0–Q6 are satisfied for this frozen packet.** I identify no unresolved source-semantic coverage gap requiring a rendering repair. Q7 remains the separate revision-bound promotion record; this verifier has not changed the frozen candidate, manifest, native-only reports or reconstruction files.

This is an exact-rendering judgment about the frozen implementation, not a theorem that its solver answers are correct, its shared-memory protocol is race-free, its optimization helps, or its observed timing is deterministic.

## Reviewer independence and sequence

I authored Decoder B and its audit tools, not the native rendering, semantic bridge, oracle, source implementation or original scorer. I completed and froze the native-only reconstruction before receiving scorer assertions. My native-only REPORT.md was then frozen before I inspected SOURCE_COMPARISON.json and scorer code. Only after those stages did the coordinator authorize this Q6 phase, including the original source objects, hidden oracle, encoder/bridge, control source and Decoder A evidence.

The frozen Decoder B report hash remains `7277dff0e645e2dd8fe6acecc46c8b94555345c4fc984c246a46e5811fdf1030`. The native-only report's pending-evidence disposition is historically correct; this later verifier report discharges those obligations rather than rewriting the cold report to claim advance knowledge.

ESR Q6 requires a verifier who did not author the native rendering and who receives scorer assertions only after decoder outputs are frozen. It does not require that the verifier be different from both decoders. This review meets that condition. It is independent internal verification, not external institutional validation or an access-enforced clean-room claim.

## Frozen identities

| Artifact | Immutable identity |
|---|---|
| Candidate campaign commit | `5b2f4eeddf3b687b660f31195b28626fba1efe7a` |
| Connect4 source revision | `2ed88683ba46fc4d99790414ad99a2e409acf400` |
| JSMinSys source revision | `04d37498607ace16dae33c79462ddfe1503c8a0d` |
| Native SHA-256 | `8d002aa2728ebabb9f1f7f7fc5a6c563f5514fab8a568fbec4954475ca867718` |
| Profile SHA-256 | `c3ed42347987e719e3bfd0e174f58342073eb122c6448db754c1c5e9258b20f9` |
| Manifest SHA-256 | `f629059d38d454615ac6fbffcc513bfed616b09fe283826a3650301beeab8d82` |
| Hidden source-oracle SHA-256 | `1245afd83a05761652893368c57c8f36a8369996c759ed05efb9c08a7037fd34` |
| Decoder A reconstruction SHA-256 | `909ee49cc80711f11595a01e9c9c4cb5e73ab513c4fc082b0b23fd5ea28a7b78` |
| Decoder B reconstruction SHA-256 | `c6c7e444e5f7aaeceeae648f63f04e9ffcd910bb3716c0b0dd806e93f3ab243f` |
| Decoder A report SHA-256 | `b0f718a6d51c02915c25b350ff32d1251d6eca436fd65e83fc64b564235986ff` |

I compared the current native, profile, manifest, render.mjs, semantic-bridge.mjs, controls.mjs and PLAN.md byte-for-byte against their pinned candidate-commit git objects. All matched. The oracle's actual bytes match its manifest hash. Thus the short candidate identifier supplied to the decoders identifies the research packet, not the solver source revision; the two source repositories have their own explicitly pinned revisions above.

## Gate findings

| Gate | Result | Verified basis |
|---|---|---|
| Q0 source freeze and interpretation | PASS | Exact git-object bytes for every source module; immutable candidate artifacts and source-oracle digest; explicit language/runtime, scope, normalization and unresolved environment family. |
| Q1 semantic coverage | PASS | All 26 source ASTs independently parsed from pinned git objects match each reconstructed module field for field; no omitted or added program node/field. Complete contextual language bridge and source-model authority were separately audited. |
| Q2 native integrity and closure | PASS | Independent constructor decoders and inverse transport witnesses; all present node types/flags mapped; scoped bindings, module closure, source-owned entry paths, runtime/global boundary, and syntax checks. |
| Q3 fresh cold reconstruction | PASS with disclosed procedural incident | Two independently authored, source-blind decoders froze complete reconstructions before source/scorer semantic disclosure. A's post-freeze filename/hash-only scorer-file exposure is assessed below. |
| Q4 canonical source sameness | PASS | Verifier independently deep-compared both full decoded objects to the hash-verified hidden oracle and independently rebuilt all 26 source ASTs from git objects. |
| Q5 distinction preservation | PASS for frozen six-family control suite | Verified source ASTs for all 12 controls; independently executed 144 source/reconstruction comparisons across two decoders; all six pairs observably distinct for each decoder. |
| Q6 scorer-blind independent verification | PASS | This review inspects freeze, coverage, native closure, both decoder records, source sameness and control implementation/results after cold-output freeze. |
| Q7 promotion | NOT PERFORMED HERE | Coordinator must issue a separate promotion record pinning this evidence and preserving the qualified scope. This is the remaining workflow action, not a missing semantic witness. |

## Q0/Q1: source coverage rather than trust in the author oracle

verify-source.mjs is newly written verifier code. For each manifest entry it uses git show at the specified source revision, verifies the source-byte SHA-256, parses ECMAScript 2025 modules with Acorn 8.15.0 and preserveParens, removes only source offsets, and compares the full resulting tree with Decoder B's module. Decoder A, Decoder B and the hidden oracle are also deep-equal as complete objects. No expected source tree from the renderer is used in the independent source parse.

The independent source audit finds 37,249 source syntax nodes of 51 kinds in 26 modules. It reproduces all 58 source-derived edges: 57 static import/reexport edges plus the worker URL edge. Every internal edge has a represented target, and closure from the two declared entries reaches all 26 modules, including imported inactive exports. No dynamic import, direct eval/Function construction, regex literal or bigint literal occurs in the audited source tree. Thus the renderer's unused special normalization paths for regex/bigint do not acquire qualification from this run.

The full algorithm includes ingress validation, geometry, worker setup and cancellation/cleanup, search and caches, numerical helpers and all imported branches. The renderer does not delete a branch because it appears inactive. Comments and source positions are the only removed source information; these are outside the explicit introspection/stack-formatting boundary. Raw literal spellings, identifiers, parentheses, declaration structure and all other AST fields survive.

Exact source AST equality is necessary but not sufficient by itself. The native-only semantic review supplies the additional bridge obligation: modelAuthority identifies the category and immutable authority, nodeBindings maps every present kind to contextual language productions, exact operators/flags select alternatives, and full operand/statement structure preserves bindings and effects. The source inspection found no new syntax outside that reviewed domain. Scope is fixed by the implementation entry boundary, not by a later desired isomorph or discovery target; no target-conditioned source reinterpretation appears in the renderer.

## Q2: closure and effect semantics

The independent native decoder and reverse encoder retain record keys, ordered incidence, sequence multiplicity, UTF-16 code units, binary64 values and every syntax field. The two serializations have different byte hashes because A pretty-prints and B emits compact JSON; their decoded objects are exactly equal. The source node count excludes controls, while the native-only combined count includes 190 control nodes. Scope helper counts also depend on whether controls and auxiliary scope categories are counted; these are different audit quantities rather than evidence of a binding discrepancy.

The independent scope audit resolves represented lexical uses through their owning module/function/block/loop structure. Remaining free spellings are standard ECMAScript or explicit Node globals. All 101 internal named imports have represented exports. The official model governs declaration instantiation, temporal dead zones, captures, per-iteration environments and completion propagation; the auxiliary scope index is not substituted for those semantics.

All actual fields and flag values were reviewed, including short-circuit boundaries, property-vs-binding contexts, method receivers, async functions, optional members, prefix/postfix update and try/finally. Empty import attributes and false unused function flags have uniquely determined meaning in the actual tree; the terse bridge prose does not justify admitting future nonempty attributes or generators without review.

The declared authority is the entire immutable ECMAScript/Node source model. The seven Node documentation files are interface navigation, not an exclusive replacement for the Node host model. This interpretation is explicit in the native language/runtime/category/repository/revision fields, and is retained by this admission. It includes Node's host hooks for module resolution, import.meta.url and structured cloning. No live MDN/WHATWG page was silently used as an independent authority. Core permits a frozen implementation/model leaf; it does not require recursively expanding all of Node, V8 and the operating system before the source algorithm can be represented.

Node APIs, SharedArrayBuffer storage relationships and Atomics semantics are preserved by actual call/constructor arguments and access trees, not solely by English descriptions. Admissible external schedules, clocks, failures and hardware/JIT costs remain unknown under the source model. The admission does not quotient away an unknown schedule or infer a stronger memory guarantee.

I independently invoked reconstruct-program.mjs on the frozen Decoder B object into a new q6-syntax directory. All 26 modules generated, reparsed equivalently and passed Node --check. This adds syntax/interface evidence without executing the solver. Grouping-wrapper removal occurs only in that auxiliary reparse comparison; native reconstruction and the source-AST witness retain the original grouping nodes. The generator preserves expression incidence and parentheses, so this auxiliary normalization is not authority to reassociate operators or flatten optional chains.

## Q3: isolation assessment

Both reviewers were assigned the native/profile and immutable semantic authorities, not the source/encoder/oracle. Their separately authored cursor decoders and audits reconstruct the full object and were frozen before the coordinator disclosed comparison results. Neither cold phase executed reconstructed program code. I inspected both independent decoder implementations and frozen reports during this post-freeze phase.

Decoder A disclosed that a final directory-wide hash inventory read an externally created SOURCE_COMPARISON.json solely to output its filename and digest after reconstruction and the substantive report were already written. The report says no file content or outcome was displayed or used; the incident was promptly disclosed. That was avoidable evidence-directory co-location and means isolation was procedural rather than filesystem-enforced. It did not deliver source structure, expected values, scorer assertions or an outcome to the decoder, and happened after the reconstruction was frozen. It therefore does not invalidate Q3's semantic independence for this run. Concealing the incident or discovering that source/scorer contents were read before freeze would require a different verdict. Future runs should put scorer results outside cold-decoder write directories until freeze.

Decoder B received the coordinator's scorer assertions only after its reconstruction hash was fixed; its complete native-only report was subsequently frozen before scorer-file inspection and remains unchanged. The assertion message was not treated as a source comparison witness in that report. Q3 concerns reconstruction independence; Q6 permits post-freeze scorer disclosure for verification. This timing satisfies those distinct requirements.

## Q4/Q5: independently rerun witnesses and limits

Both complete JSON reconstructions are exactly equal to the manifest-pinned source oracle, not merely equal on sampled fields. Independently parsing each pinned source module discharges the possibility that the encoder and its own oracle jointly omitted some source syntax. All literal values, operators, flags, bindings and nested orders participate in that witness. The source model and exclusions give the semantic interpretation of that exact tree; no fuzzy or approximate source equivalence is used.

verify-controls.mjs compares each source control's parsed AST with both decoder control trees and then runs only those bounded controls. It compares generated functions to source functions with Object.is on six inputs for each of 12 controls and two decoders: 144 comparisons. All pass, and all six neighboring control pairs differ on at least one input for each decoder. The controls exercise ordered operands, unsigned/signed numeric interpretation, guard boundaries, binder shadowing/capture, conditional/eager effects and finally completion replacement.

The binding pair changes the inner parameter spelling while leaving the body use of x fixed; its semantic difference is ownership/capture, not a valid alpha-renaming. The finally pair swaps the return operands as one controlled order/selection distinction; two leaf positions change, so it should not be advertised as a one-AST-field mutation. Neither point weakens the preservation test, but those are the precise quantities being tested.

This six-family suite is bounded and not exhaustive over all JavaScript behavior. There is no independent behavioral mutation for every literal, typed-array alias, memory operation, optional-chain boundary, external failure or schedule. ESR recommends broad material coverage; this run combines representative semantic distinction controls with exhaustive field/occurrence comparison of the actual frozen source trees and inverse native transport witnesses. I judge that sufficient for exact rendering of this fixed object under its stipulated model. I do not claim exhaustive language-runtime validation, universal dynamic equivalence established by the 144 examples, or a mutation-completeness theorem. Those stronger claims are outside this admission; absence of those stronger proofs is not an identified omission in this packet.

## Evidence and remaining action

New verifier evidence is confined to evidence/v2-b:

* verify-source.mjs and independent-source-verification.json: source-object hashes, exact AST coverage, dependency closure and both oracle comparisons.
* verify-controls.mjs and independent-control-verification.json: candidate-commit byte identity and 144 control comparisons with six distinctions per decoder.
* q6-syntax/reconstruction-check.json and generated module files: 26 syntax/reparse checks; generated code was not executed.
* Existing REPORT.md, FIELD_REVIEW.md, scope/module/host audits and POST_FREEZE_REVIEW.md: preserved earlier layers and timing.

Tools used were the supplied Node 26.7.0 binary, Acorn 8.15.0 and astring 1.9.0; the project lockfile pins package versions and integrity values. The native ECMAScript authority content hash was independently checked in the cold phase, and both reviewers fetched the same seven immutable Node documents with matching hashes.

**Concrete remaining semantic gaps: none identified for this frozen scope.** Remaining action: issue Q7 promotion with the candidate, source, authority, decoder and verifier identities pinned. Preserve the original candidate status as historical data and put promotion in its own record. Admission must not be broadened to byte-identical source/stack introspection, a narrower documentation-only host model, arbitrary future syntax, solver correctness, races, performance, deterministic scheduling or probabilistic claims without additional qualified evidence.
