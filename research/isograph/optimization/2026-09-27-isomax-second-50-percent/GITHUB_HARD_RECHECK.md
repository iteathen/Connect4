# Fresh GitHub-VM official-hard recheck

Date: 2026-09-27

Fixed selected-production sources:
- control `a3cf7f9ca5c90e5025542c3b27ab0b735a610e9a`;
- zero-bound candidate `00ecc7d20ed08ee9585c92aa8441a8ef3969b7ee`.

Fresh GitHub-hosted Windows run:
- workflow `36367503033`;
- artifact `10948376993`;
- digest `sha256:94da7756c7cf881adfeec19f9e97a1749de8da00b6833cb93006a1af32faf268`.

Fixture `35333571`, selected seven-worker profile, two ABBA blocks, fixed 120s
application ceiling.

Both arms timed out in all four samples.

Fixed-window means:
- control: 284.810M nodes, 1.18153T cycles;
- candidate: 256.910M nodes, 1.21176T cycles.

Candidate descriptive changes:
- nodes -9.80%;
- cycles +2.56%;
- shared hits -13.86%;
- shared stores +45.70%;
- cycles/node +13.70%.

No exact solve-speed ratio is admissible.

The fresh hosted VM processed substantially more nodes than the previous hosted
or recent local censored controls, confirming material execution-environment
variability. It still did not reproduce the historical ~83.13s exact completion.

PR #84 official-hard promotion gate remains unmet. Preserve the large exact
`353335714` improvement separately; investigate bound-store/shared-cache
economics on the harder workload before promotion.
