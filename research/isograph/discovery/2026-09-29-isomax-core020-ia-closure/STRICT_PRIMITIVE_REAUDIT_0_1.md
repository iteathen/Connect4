# Strict Core-0.20 primitive re-audit checkpoint

**Date:** 2026-09-29  
**Research direction:** Joshua Oshiro  
**Branch:** `research/isomax-core020-ia-closure-20260929`  
**Status:** corrective audit active; prior fixed-point qualification narrowed pending repair

## Governing rule

Core 0.20:

```text
if a semantic object can be definitionally decomposed
into lower logical structure,
it is not an admissible authoritative leaf.
```

This audit rechecks the complete load-bearing support cone of the 2026-09-29
IsoMax structural-control IA packet.

## Findings

The first packet was **primitive-complete for the concrete Boolean
inconsistency/refinement equations**, but not fully primitive-closed for every
load-bearing support record used by the IA ledger.

### P20-A01 — Boolean carrier imported by bare IDs

The native packet used `7400/7401/7402` for the Boolean domain and values.
Those IDs were explained in the Markdown audit but their exact finite domain
was not embedded or natively pinned inside this successor.

Disposition: **REPAIR REQUIRED**.

Correction: introduce a packet-local two-value raw carrier and use it throughout
the strict successor.

### P20-A02 — route observation hid definable phase

`196106` stored the accumulated route phase as a raw observation even though
the same packet already defines route phase from edge deltas by the XOR truth
table.

Under Core 0.20, the accumulated phase is definitionally reducible and may not
remain a load-bearing raw leaf.

Disposition: **REPAIR REQUIRED**.

Correction: remove phase from the raw route observation. Reconstruct it only
through the represented edge/path/XOR definitions.

### P20-A03 — permutation sign hid reducible semantics

The raw route observation stored an accumulated permutation-sign bit. The two
full transporter identities were opaque raw values, so the packet did not
primitive-reconstruct why each transporter has that sign.

Disposition: **REPAIR REQUIRED** for any sign-based IA.

Correction:

- represent each total transporter by its complete five-slot mapping;
- represent the finite slot order;
- represent the ten ordered slot pairs;
- derive inversion bits by primitive logic;
- derive sign as the XOR of the ten inversion bits.

### P20-A04 — transporter/action-sequence difference relied on opaque identities

The packet used distinct raw IDs for the two accumulated transporters and
source-frame action sequences. Different SIs do not by themselves supply the
stronger content-difference claim used in the human assertion bodies.

Disposition: **REPAIR REQUIRED**.

Correction:

- represent complete transporter mappings;
- represent the two ordered action sequences extensionally;
- derive difference from unequal extensional content, not spelling/ID.

### P20-A05 — quantified raw carrier domains were not explicitly closed

Definitions quantified over node, edge, path, action, Boolean and transporter
carriers, but the native packet did not explicitly enumerate domain membership.

Core 0.20 requires the quantifier domain/carrier itself to be represented.

Disposition: **REPAIR REQUIRED**.

Correction: add an exact packet-local `DOMAIN_MEMBER(domain,value)` extension
for every quantified finite carrier.

### P20-A06 — two provenance/scope statements were IA-eligible sidecar leaves

`SC-E022` and `SC-E023` were marked IA-eligible while their support was
SOURCE_MANIFEST/QU metadata rather than primitive native semantics.

They were not actually consumed by any admitted IA.

Disposition: **RECLASSIFY**.

Correction: mark both non-IA-eligible provenance/scope observations. They remain
important campaign constraints but cannot be exact primitive IA premises.

### P20-A07 — source-global obstruction wording wider than primitive witness

`SC-E013` said the complete current 5x4 carrier has no global scalar node
potential, while its primitive support in this compact packet is the shortest
four-edge contradictory subsystem.

The subsystem is sufficient to refute a global potential, but the compact
native packet does not primitive-render the complete carrier.

Disposition: **NARROW BODY / PRESERVE SOURCE VIEW**.

Correction: make the IA-eligible assertion exactly the primitive-supported
statement:

```text
the shortest represented 5x4 four-edge scalar Boolean node-potential system
is unsatisfiable.
```

Keep the full 5x4 census/global conclusion as its existing non-load-bearing
derived source view.

### P20-A08 — QU labels were recorded as IA dependencies although not load-bearing

Many exact local IAs listed generalized research QUs in `qu_dependencies`.
Their truth does not vary across those open realizations; the QUs track
generalization questions rather than premises.

Disposition: **SUPPORT-LINEAGE REPAIR**.

Correction: move these references to non-support `related_qu` metadata and
leave exact IA dependency cones primitive and determinate.

## Derived-view status

The full carrier censuses, class counts, cycle ranks, response-matrix results,
and other large experimental summaries remain useful source observations.

They do **not** qualify as Core-0.20 primitive leaves in this compact packet.
They remain explicitly:

```text
DERIVED_VIEW / PROVENANCE ONLY
IA-eligible = false
```

unless/until their complete lower semantic definitions are included.

No exact IA in this campaign is permitted to depend on those views.

## Corrective plan

1. preserve the original candidate bytes/history;
2. create `ISOMAX_STRUCTURAL_CONTROL_CORE020_0_2.isg`;
3. close all finite binder domains;
4. replace external Boolean IDs with a local exact two-value carrier;
5. reduce route phase to edge-delta XOR;
6. expand the two full transporter maps and derive their signs from finite
   inversion parity;
7. expand action-sequence content;
8. revise A0 support metadata and narrow SC-E013;
9. remove non-load-bearing QU references from exact support lineage;
10. rerun every IA dependency/duplicate check and all finite Boolean controls;
11. run one complete IA family pass against the repaired support graph;
12. stop only if that pass adds zero new material IAs/support/QU refinements.

The earlier fixed-point result is treated as **provisional predecessor evidence**
until this strict re-audit closes.
