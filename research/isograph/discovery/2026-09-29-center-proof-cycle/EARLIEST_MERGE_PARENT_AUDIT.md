# Earliest dynamic-merge parent audit

**Status:** bounded exact negative structural evidence  
**Research direction:** Joshua Oshiro  
**Branch:** research/nim-control-parity-algebra-20260929  
**Workflow:** 36575489764 — success

## Question

The nine earliest unexplained 4x4 Connect-4 dynamic merge pairs occur at rank 8 after the current local realizability closures. Eight of the nine pairs have visibly related support profiles, suggesting a possible simple explanation: perhaps each pair consists of two different legal actions from one common rank-7 structural parent.

## Exact result

Scanning the complete direct residual/action-orbit graph gives:

~~~text
earliest merge groups          9
groups with exact common parent 0
groups without common parent    9
total exact common parents      0
~~~

So none of the nine rank-8 pairs are ordinary sibling actions from the same direct structural state.

## Interpretation

This falsifies the simplest branch-local action-duplication explanation. The support similarities are real, but they arise across different predecessor contexts.

The next exact question is whether those predecessor contexts belong to the same recursive parent class. If so, the rank-8 merges are part of a transported equivalence chain across already-equivalent parents rather than literal sibling duplication.

This audit uses only the structural recursive quotient and direct graph topology. It does not use W/D/L labels.
