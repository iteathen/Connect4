# IsoMax Core 0.19 rendering and discovery campaign

Status: COMPLETE for the declared rendering and scoped discovery campaign.
Durable owner: research/semantic-quotient. See RENDERING_QUALIFICATION.md and
DP_REPORT.md. Optimization candidates are not implemented or benchmark-qualified.

The owner requested the current IsoMax rendered under the newest qualified
IsoGraph Core, followed by a DP campaign. Locating the previous representation
was a prerequisite, not completion of that request.

## Frozen starting points

- Connect4 implementation: 2ed88683ba46fc4d99790414ad99a2e409acf400.
- JSMinSys implementation: 04d37498607ace16dae33c79462ddfe1503c8a0d.
- Connect4 research predecessor: 71e09504b706d6b7aea6e2c926345526825ef8f5.
- IsoGraph authority: 43490735f0073acccb4f900e247cd0db19681e1f.
- Effective Core: qualified 0.17 + 0.18 + 0.19; DP: cumulative 0.1-0.7.
- Core 0.19 SHA-256: 8db3f6554afb12d3f6de78789f771bb09484d27babd7fd98782cb92d704402c2.
- Existing graph: successor/CONNECT4_LAZY_SMP_SEARCH_METHOD_0_2.*.
- Previous DP: 2026-09-25-lazy-smp-full-decode-nei-qu-dp, followed by
  all-leads-investigation and lazy-smp-dts-0.1. Preserve rejected experiments.
- Performance observations: Connect4 b3d487f89737aaf50f85cc3b280827e5cf5e9464,
  docs/qualification/20260926-four-worker-controlled and 20260926-worker-scaling.

The prior graph is an unqualified orchestration/cache rendering; its detailed
scope excludes inner CPC/RBA/Negamax. The older qualified hot-loop graph 0.3 is
anchored to an older solver. Neither automatically qualifies today's complete
implementation under Core 0.19. The historical integrated Core-0.18 stack is
not silently promoted to a Core-0.19 full-stack qualification.

## Execution plan and admission gates

1. Freeze complete source/dependency closure for active Lazy SMP, including
   ingress, worker, recursive solver, CPC, cofactor, canonicalization, ordering,
   exact caches, lifecycle, and numerical helpers. Distinguish active from
   imported-but-inactive four-front machinery.
2. Extend existing representation downward to ordered operands, literals,
   binding/scope, guards, loops, calls, and effects. Encode all load-bearing
   information natively; English and JSON must not complete missing semantics.
   Explicitly pin primitive/model leaf authority and external runtime boundary.
3. Freeze interpretation, native bundle, reconstruction profile, controls, and
   hidden source oracle. Check syntax, closure, coverage, and deterministic
   reconstruction. No source line-count or syntax-only check proves semantics.
4. Obtain fresh native-only reconstruction and adversarial checks under Core
   0.19 section 18 / ESR. Independent executions are internal evidence, not
   external validation. Preserve any failed rendering; repair and re-freeze
   rather than scoring a failure away. Do not start downstream DP before the
   rendering's semantic admission gate passes.
5. Run cumulative DP with scoped primitive support, support lineage, QU and
   DTS-sensitive distinctions. Record attempted routes, falsifiers, residuals,
   candidate disposition and why each direction stops. Reconcile previous
   negative results. Do not call an optimization effective without measurement.
6. Publish exact artifacts, checks, reconstruction evidence and candidate
   report on the canonical research branch. Solver and BSFP code unchanged.

No performance rerun, optimization implementation, semantic authority promotion,
or timeout change is part of this campaign. A rendering prerequisite failure
must be reported as such, not disguised as a completed DP campaign.
