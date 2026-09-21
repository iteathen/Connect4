# External Connect4 qualification

This directory is reserved for evidence whose oracle or comparison basis is external to the repository-controlled qualification campaign.

A result is not `REFERENCE-GROUNDED` merely because it was run by another agent or on another branch.

## Minimum record

For each external correctness or benchmark packet preserve:

- external corpus/reference name, source, version/hash, and license/provenance;
- exact Connect4 revision and solver-family revision;
- exact test positions and expected solved results;
- solver configuration and stopping conditions;
- Node/V8, OS, CPU/GPU, memory, and relevant runtime settings;
- correctness result;
- nodes/search work or equivalent algorithmic-work measure;
- wall-clock methodology and raw samples;
- peak/relevant memory measure where claimed;
- raw stdout/stderr/result artifacts;
- explanation of workload equivalence for comparative performance claims.

Correctness, search efficiency, and hardware performance are separate claims.

## Status

No external packet is promoted by this scaffold itself. Add evidence only after an actual independent reference/corpus comparison has been executed and frozen.
