# SUT

**SUT** is the retained future exact-composition solver lineage for IsoMax/Isometric + CUDA-BSFP.

The name is written conceptually as:

```text
S ∪ T
```

and pronounced **SUT**. `SUT`, `SUT Search`, and `SUT Solve` may be used interchangeably where the context is clear.

`S ∪ T` represents the union of two complementary solving directions:

- **S — structural:** forward structural / relational consequence reasoning from the Isometric (IsoMax) line;
- **T — terminal:** backward terminal / fixed-point consequence reasoning from BSFP.

The intended direction is a solver in which structural and terminal knowledge can inform one another rather than operating as independent engines.

## Status

This branch is intentionally at its starting point.

It was created from the shared `main` substrate so neither Isometric nor BSFP is treated as the historical owner of SUT. No SUT architecture, contracts, implementation, or performance claims are established yet.

Research truth remains owned by the shared Connect4 research knowledge space and must be imported deliberately as SUT begins to define its own solver contracts.

SUT does not replace the private internals of Isometric or BSFP. Hybrid Confluence is now a historical lineage; its useful exact-composition questions are inputs to SUT rather than a separate live solver.
