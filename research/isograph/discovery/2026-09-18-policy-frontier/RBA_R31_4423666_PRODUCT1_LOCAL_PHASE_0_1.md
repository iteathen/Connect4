# RBA rank31 fourth-support product1 local phase

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact local phase complete / global maximalization pending  
**Authority effect:** none

## Support / product

```text
support [4,4,2,3,6,6,6]
rank 31

A0 = 7,673
A1 = 5,546
raw pairs = 42,554,458
```

## Core-relative absorption

```text
absorber witnesses = 3,174

residual factors
5,843 x 4,202
= 24,552,286 residual pairs

raw pair work eliminated
~42.30%
```

## Exact local restricted-image phase

```text
outer queries             5,843
projection-tree queries   5,841
vertical trace queries        2
switch queries                0

leaf scans              21,494,012
tree nodes               2,871,165

local occurrences          457,256
distinct candidates         358,112

local wall                   ~1.89 s
complete local phase         ~2.09 s

distinct candidate SHA-256
7356e7336d53fdb6e34c108321af6cbe7c07af696c7f1ea195e56c5f05131ab4
```

## Disposition

Again, the opaque support-runner timeout is not caused by local projection on this product. The next exact phase is global maximalization of the 358,112 distinct candidate family.

Next: run the resumable exact static dominance-tree normalizer and persist P1 before resuming this support.
