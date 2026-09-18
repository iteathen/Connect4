# Connect4 NEI application 0.1 — deterministic validation

**Result:** PASS  
**Date:** 2026-09-18  
**Application:** `connect4-nei-application-0.1`

Validated:

~~~text
profiles                         6
results                          7
SAME                             3
DISTINCT                         3
INCOMPLETE_UNQUALIFIED           1
semantic NEI UNKNOWN             0
~~~

Checks:

- profile IDs unique;
- profile native IDs unique;
- result IDs unique;
- result native IDs unique;
- every result references an existing profile;
- result-status summary matches the result records;
- standard-7x6 incomplete result explicitly rejects semantic NEI UNKNOWN;
- every native result record exists;
- every native result record is bound to its profile via the qualified NEI dependency role;
- every native result carries a fixed evidence-revision role;
- native SAME count matches JSON SAME count;
- native DISTINCT count matches JSON DISTINCT count;
- native semantic UNKNOWN count is zero;
- application-manifest blobs match the current profile/result/native artifacts;
- Connect4 authority-1.1 manifest remains blob `986f10a0011059e4d19598de6c836272c102415d`;
- frozen authority-1.1 candidate manifest remains blob `0b3c54f193b084e2e5dd2eb7f4fb641b1052491a`.

The validation confirms that the applied NEI overlay is internally consistent and does not mutate the frozen representation authority.

**CONNECT4_NEI_APPLICATION_0_1_VALIDATION = PASS**
