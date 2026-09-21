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

## Registered external result: IsoMax / Pascal Pons

The authoritative solver evidence is preserved on `solver/isometric`.

- `Test_L3_R1`, first 64 frozen positions: **64/64 W/D/L matches, 0 mismatches**.
- `Test_L2_R1`, first 64 frozen positions: **64/64 W/D/L matches, 0 mismatches**.
- Combined: **128/128, 0 mismatches**.
- External source: Pascal Pons benchmark parent scores via pinned public mirror `megakilo/alphafour@cf2d4546e5824c155e9dd7e888a572bff3128498`.
- The harness re-fetches and verifies the external sequence/parent-score rows before solving.

Authoritative details:

- [solver/isometric external evidence index](https://github.com/iteathen/Connect4/blob/solver/isometric/evidence/external/README.md)
- [L3 frozen aggregate](https://github.com/iteathen/Connect4/blob/solver/isometric/evidence/external/results/2026-09-20-isomax-Test_L3_R1.summary.json)
- [L2 frozen aggregate](https://github.com/iteathen/Connect4/blob/solver/isometric/evidence/external/results/2026-09-20-isomax-Test_L2_R1.summary.json)

This registration is **REFERENCE-GROUNDED parent-position W/D/L correctness only**. It is not a performance ranking and does not promote internal per-move score vectors to external evidence.
