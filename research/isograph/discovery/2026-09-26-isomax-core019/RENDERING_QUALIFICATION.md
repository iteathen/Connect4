# IsoMax executable-source rendering under Core 0.19

Disposition: **EXACT_SOURCE_RENDERING_QUALIFIED**, revision-scoped, 2026-09-26.
This is Q7 promotion of packet-v2 after independent Q0-Q6 verification. The
candidate manifest/profile retain their original pre-qualification status;
this separate record supplies the later disposition without rewriting history.

## Exact scope

The complete static source-module closure of the public `solve7x6` and Lazy SMP
worker entry, under the explicitly stipulated full ECMAScript/Node source model.
All 26 modules, 37,249 source syntax nodes and 58 dependency edges are retained,
including imported inactive exports. This is not a claim that all exports run.
It extends the existing Lazy SMP 0.2 orchestration rendering down through the
actual CPC/RBA/Negamax, coordinate, cache and numerical implementation.

No solver-correctness, race-freedom, instruction-count, performance, natural
identity, or complete Core-0.19 integrated-stack qualification follows from this
source-rendering result. Comments, source offsets, source-text introspection
and stack-trace formatting are outside the declared interpretation. Errors,
cleanup, effects and constrained unknown environment traces remain represented.

## Frozen identities

| Object | Identity |
|---|---|
| Candidate commit | `5b2f4eeddf3b687b660f31195b28626fba1efe7a` |
| Connect4 | `2ed88683ba46fc4d99790414ad99a2e409acf400` |
| JSMinSys | `04d37498607ace16dae33c79462ddfe1503c8a0d` |
| IsoGraph authority | `43490735f0073acccb4f900e247cd0db19681e1f` |
| Effective Core | qualified 0.17 + 0.18 + 0.19 |
| Core 0.19 document SHA-256 | `8db3f6554afb12d3f6de78789f771bb09484d27babd7fd98782cb92d704402c2` |
| Native SHA-256 | `8d002aa2728ebabb9f1f7f7fc5a6c563f5514fab8a568fbec4954475ca867718` |
| Profile SHA-256 | `c3ed42347987e719e3bfd0e174f58342073eb122c6448db754c1c5e9258b20f9` |
| Manifest SHA-256 | `f629059d38d454615ac6fbffcc513bfed616b09fe283826a3650301beeab8d82` |
| Source oracle SHA-256 | `1245afd83a05761652893368c57c8f36a8369996c759ed05efb9c08a7037fd34` |
| ECMAScript 2025 commit | `84b38ad852ff426795fa29cebc06949027336c64` |
| Node 26.7.0 commit | `b4f23d3619c98bed09af93a21192f6080197a8c6` |
| Independent Q6 report SHA-256 | `860ee80d4836176a292e12dee5a5c5165f14440a5c7348f34bf701d8e2777113` |

Source-file hashes, both reconstruction hashes, authority interfaces, and
additional evidence identities are recorded in the manifest and
[independent verification](evidence/v2-b/VERIFICATION.md).

## Qualification evidence

- Q0/Q1: verifier independently parsed pinned source git objects and matched
  every represented module field, with no omitted or added source node/field.
- Q2: two independent parsers, reversible transport, 51 mapped node kinds,
  scoped bindings and complete module/host closure; 26 generated modules pass
  reparse and Node syntax checks.
- Q3: two fresh native-only reconstructions, frozen before semantic scorer
  disclosure. Decoder A's later filename/hash-only exposure is disclosed in
  its report and independently assessed as noninvalidating. Future cold
  review directories should exclude scorer output until freeze.
- Q4: both complete reconstructed objects exactly match the source oracle;
  independent verifier also checked original git-object source rather than
  trusting the author oracle alone.
- Q5: 12 programs in six distinction pairs; verifier reran 144 source versus
  reconstructed observations across both decoders. All pass and pairs remain
  distinct. This is a bounded control suite, not exhaustive language testing.
- Q6: [independent reviewer PASS](evidence/v2-b/VERIFICATION.md), with no
  concrete semantic gap for the frozen scope.
- Q7: this promotion admits packet-v2 as source-faithful input to the scoped
  DP campaign. It neither promotes Core nor updates an integrated-stack claim.

The initial packet remains **NOT QUALIFIED**: its missing language/runtime
bridge was a real admission failure. Original decoder reports are preserved.

## Reproduction and retained evidence

From this campaign directory, install pinned dependencies with
`npm ci --ignore-scripts --no-audit --no-fund`, using Node 26.7.0. The source
checkout must contain the pinned Connect4 and JSMinSys git objects.

`node render.mjs <source-checkout> packet-v2` regenerates the exact native and
private source oracle. Compare hashes before using any regenerated output.
Both independent `evidence/v2-*/decode.mjs` programs reconstruct the native;
their historical absolute workspace constants document the execution location
and need path-only relocation for another host. Such relocation is not a new
cold-decoder qualification.

Run `node score-reconstruction.mjs evidence/v2-a` and the corresponding v2-b
command. `node reconstruct-program.mjs <reconstruction.json> <output>` checks
all module syntax. Independent `verify-source.mjs` and `verify-controls.mjs`
retain verifier-side reproduction logic. No reconstructed solver is executed.

Generated reconstructed sources/oracles and duplicate downloaded Node docs
remain local ignored artifacts. Pinned URLs and content hashes are retained
in host-audit.json and artifact-hashes.json; these caches can be reacquired.
Small source/control/syntax verification reports and decoder/reviewer programs
are committed. The original source remains in its owning repositories.
