# Lazy SMP 0.1 Decode Correction

The 0.1 overlay captured the correct high-level architecture but was **not a full native decode**.

Missing from 0.1:

1. declared local operational vocabulary;
2. local-first cache integration;
3. deterministic hash-key share gate;
4. shared-slot empty/writing/committed state machine;
5. before/key/value/after probe validation;
6. one-shot writer CAS and contention drop;
7. result publication ordering before winner CAS;
8. completion-versus-winner distinction;
9. unified ERROR/STOP/WAKE failure path;
10. external loser termination versus cooperative STOP;
11. invocation-local cache lifetime;
12. shared-slot generation identity;
13. source-unit decode coverage.

0.2 corrects these omissions and supersedes 0.1 for active Lazy-SMP search-method interpretation. 0.1 remains provenance.
