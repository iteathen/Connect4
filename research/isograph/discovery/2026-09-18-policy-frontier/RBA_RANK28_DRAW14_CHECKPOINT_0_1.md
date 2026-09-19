# RBA rank-28 draw14 predecessor checkpoint 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** one structurally selected rank-28 predecessor closed at the exact draw threshold  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Selection

Seven immediate predecessors of the closed rank-29 support were assessed before execution. The selected support was:

```text
[3,5,2,0,6,6,6]
rank              28
remaining cells   14
residual shapes   35
transformed bits  70
```

Reason: all four of its rank-29 children have at most 33 residual shapes. This isolates rank-28 root economics without deliberately importing a harder 34/35-shape child cone.

The four exact rank-29 child draw boundaries are:

```text
[4,5,2,0,6,6,6]   Upper 10,278   Lower 31,729
[3,6,2,0,6,6,6]   Upper 20,292   Lower 58,035
[3,5,3,0,6,6,6]   Upper 13,152   Lower 40,834
[3,5,2,1,6,6,6]   Upper 47,472   Lower 140,454
```

The last child is the already-qualified rank-29 closure and was reused rather than rebuilt in the root probe.

## Fixed-action draw14 fronts

```text
column  child                    action Upper   action Lower
0       [4,5,2,0,6,6,6]             26,562          6,474
1       [3,6,2,0,6,6,6]             49,595         20,292
2       [3,5,3,0,6,6,6]             18,686          6,423
3       [3,5,2,1,6,6,6]             95,647         32,869
```

Exact state Upper:

```text
Upper(draw14) = 144,462
```

## Exact Lower composition

Action-Lower sizes:

```text
6,474
20,292
6,423
32,869
```

Sequential exact semiring products:

```text
6,474 x 20,292
= 131,370,408 implicit
-> 182,036 local skyline candidates
-> 167,449 distinct
-> 121,546 same-mover
-> 85,308 same-opponent
-> 51,208 exact generators

51,208 x 6,423
= 328,908,984 implicit
-> 275,039 local
-> 246,290 distinct
-> 167,198 same-mover
-> 115,283 same-opponent
-> 57,909 exact generators

57,909 x 32,869
= 1,903,410,921 implicit
-> 2,641,949 local
-> 1,945,794 distinct
-> 850,016 same-mover
-> 508,764 same-opponent
-> 78,546 exact generators
```

Therefore:

```text
Lower(draw14) = 78,546
```

Largest final-step skyline distribution:

```text
median 38
p90    194
p99    661
max  7,397
```

Final-step timing:

```text
local generation      4,328.78 ms
global normalization  2,433.30 ms
peak RSS                 73,368 KiB
```

All three Lower products together consumed about 8.594 s of measured local-generation plus normalization time.

## Exact stream identities

Canonical serialization remains one lowercase hexadecimal transformed q-mask per line, newline terminated.

```text
Upper(draw14) 144,462
sha256 c1c31c66d34e407bbcce869782a728a9b7de77fa66b7296a94023ea67658e067

action Lower c0 6,474
sha256 2903297bf9e058da9d4ecc3079f557cc7c76403309170ae96260dd329b3b0ad6

action Lower c1 20,292
sha256 774c7b203eea3c84f577058dd404a6ec45503b7df4b639cf37224d951da25de7

action Lower c2 6,423
sha256 f80d8bd030f2a3ca8caf36ff6323b8bf326a963924301932036d09a349fa5222

action Lower c3 32,869
sha256 b4c167ede2dcb9ba8ee356bf46554127d76b0becd587dd20a366d2a16fa7844f

Lower(draw14) 78,546
sha256 1aa22092bea4ff337f5fb114675da76c3ad7de969a877efd269cb02e34ae453e
```

## Structural result

This one-step predecessor falsifies a simple monotone-growth reading of rank or transformed-state width:

```text
rank29 selected draw Lower   140,454
rank28 selected draw Lower    78,546

rank29 transformed bits       66
rank28 transformed bits       70
```

The result does **not** prove that earlier ranks become cheaper. It shows that rank, residual-shape count, transformed bit width, and raw pair count are insufficient individually to predict exact frontier cost. Support-fiber geometry and the resulting local skyline/final antichain structure remain load-bearing.

Do not descend to rank 27 from this single data point. Complete or sample the rank-28 strong-value boundary first, then reassess the frontier-width law.

The proof/value bridge remains a separate open side seam.
