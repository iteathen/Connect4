# RBA rank-28 exact strong-boundary closure checkpoint 0.2

**Date:** 2026-09-19  
**Canonical branch:** research/semantic-quotient  
**Status:** selected rank28 ordinary exact-value boundary CLOSED  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Target

~~~text
support            [3,5,2,0,6,6,6]
rank               28
remaining cells    14
residual shapes    35
transformed bits   70
~~~

## Complete exact boundary

| score | Upper | Lower |
|---|---:|---:|
| loss2 | 1 | 4 |
| loss4 | 6 | 13 |
| loss6 | 20 | 79 |
| loss8 | 140 | 770 |
| loss10 | 1,159 | 10,770 |
| loss12 | 13,428 | 45,034 |
| loss14 | 72,737 | 110,931 |
| draw14 | 144,462 | 78,546 |
| win13 | 51,645 | 29,554 |
| win11 | 17,346 | 4,708 |
| win9 | 2,233 | 534 |
| win7 | 203 | 54 |
| win5 | 27 | 9 |
| win3 | 7 | 1 |
| win1 | 3 | 1 |

The previously persisted draw14 result is part of this sequence. All other strong thresholds were propagated with the same exact shape-lattice/adjoint recurrence while preserving accumulated-boundary-as-outer semiring orientation.

## Pressure region

The large boundaries are localized around loss14 / draw14 / win13 rather than growing monotonically with rank or threshold.

loss14:
~~~text
Upper 72,737
Lower 110,931
largest universal step
    3,834,086,382 implicit
    -> 355,319 local candidates
    -> 110,931 exact generators
root-slice elapsed ~27.29 s
~~~

draw14:
~~~text
Upper 144,462
Lower 78,546
qualified targeted root closure
best exact final orientation
    57,909 outer x 32,869 inner
    1,903,410,921 implicit
    -> 253,413 local candidates
    -> 78,546 exact generators
    total final-product time ~2.53 s
~~~

win13:
~~~text
Upper 51,645
Lower 29,554
largest universal step
    466,887,168 implicit
    -> 176,060 local candidates
    -> 29,554 exact generators
root-slice elapsed ~9.25 s
~~~

Outside that neighborhood, boundary widths and costs fall quickly.

## Draw14 replay disposition

A redundant full-cone draw14 slice replay exceeded the bounded 240 s execution envelope before reaching the root. It had already reproduced the persisted rank30 and rank29 child draw controls on the way down. This is descendant-cone reconstruction cost, not a root mismatch.
The draw14 root itself remains independently qualified by:

- exact cached rank29 child boundaries;
- direct fixed-action predecessor reconstruction;
- exact three-step Lower multiplication;
- reversed-orientation exact replay with the same final SHA-256.

Therefore rank28 closure does not depend on the timed-out redundant cone rebuild.

## Stream identities

Canonical serialization is one lowercase hexadecimal transformed q-mask per line, newline terminated.

loss2: Upper 1 sha256 9a271f2a916b0b6ee6cecb2426f0b3206ef074578be55d9bc94f6f3fe3ab86aa
loss2: Lower 4 sha256 7222211ef416d3b1cc9ced37c67641ca95bfdebf0070d3b622fcafaed25664cb
loss4: Upper 6 sha256 e72a6fbd7fecf142b449aecd4009234ea9d51134266fc2f4192d30ad695675d9
loss4: Lower 13 sha256 4eac8fccac1a0741c1884e8a51581f61d6c1b9a9cdeb4538042f60ad505a75be
loss6: Upper 20 sha256 c15f376b6c9722802fa5dd78d40cdffd0778b17378837c1fb3938ad61a8cd1c8
loss6: Lower 79 sha256 98517115e2ad005070ff86c66354a0718154e63d597930015814738a075eddf3
loss8: Upper 140 sha256 1dccd3ef6b514b62d3fd116d033a3fcc6da5722e82b704867e1b608918d3094c
loss8: Lower 770 sha256 e4e36bbb8b1c251480d7feb28dc0038ecc6641c58abbbd7d60aa0395abc1ce22
loss10: Upper 1,159 sha256 e715b2f23fa008261aeabf76bb80a1cf4143369b7bcfdbf53347c817f9bc2bdb
loss10: Lower 10,770 sha256 f17841d54cc90fb0aa71a1bb12bcba3cc58f79fbad7a09423c98cdb48c569fcc
loss12: Upper 13,428 sha256 e73493914c69c407845f996be97af6ba45630b1016627a11a5e1ab98d41b431e
loss12: Lower 45,034 sha256 9d5591f93667090f6ac68b1f75749bad93566ee43bdb8d9cfd078a4eec599a89
loss14: Upper 72,737 sha256 3140e8c29c13c83d66627f292517972263ae18286fbe0e378a5446246fa24624
loss14: Lower 110,931 sha256 54767ebc4817e467f035e8744507268a50ea65f0a865f4f9a6081e091a42f9d8
draw14: Upper 144,462 sha256 c1c31c66d34e407bbcce869782a728a9b7de77fa66b7296a94023ea67658e067
draw14: Lower 78,546 sha256 1aa22092bea4ff337f5fb114675da76c3ad7de969a877efd269cb02e34ae453e
win13: Upper 51,645 sha256 0b5a58aaa305eea2ced0f95d4f6778cd21ce0aaad60ce85a5e97a1cb03a23d46
win13: Lower 29,554 sha256 f64d1fad2ec4c26ab7519839153a246ac7963e2beeeaa5a9ceab5c15a44e6ca1
win11: Upper 17,346 sha256 1a1b6d9ad818392abeeb493d98b6b4548ddc02a49be85617eb8e728e09115214
win11: Lower 4,708 sha256 079e208189a2f41fb2d03edff27fa52135c9f4016b69c153b821e809331c0ceb
win9: Upper 2,233 sha256 b893b5c05733776ab88270d871c239f8181a662090b69cfd013bb61ef1484d1f
win9: Lower 534 sha256 da720e4a418714086e29168b49ee9baef3d961c28ef6df4fa780791deaa7bde3
win7: Upper 203 sha256 d3ac8e1f822569c2fb542fcab39013a3ac25fc1aa257578133714f5fc100799a
win7: Lower 54 sha256 b93db60909f90de5cc1e59ec8dd4593c3e02e9fb7835ee64a4d985574b625766
win5: Upper 27 sha256 5ab64d76236a6463a3690ec6e90d11361c092bb132609d0f85c5a85a416a249b
win5: Lower 9 sha256 977ddcb6184aa2dae68c2af273853f1f76a5d155a385c4a54eec125478406aa0
win3: Upper 7 sha256 5d0c9ba745d2fbf07a88f88ad40a1fb13cca860869c1e54533ad5e27b676db04
win3: Lower 1 sha256 06dba04b17d32db3277bc38da18d1d86b7ce4bc873ac906d75b79f73f90e2f06
win1: Upper 3 sha256 110a4aff19172e89adf6ae4fb5dead558aafc3ec03e803ccfb328283e6b9acc5
win1: Lower 1 sha256 730823b9339ba280a1e7b4fe48b2e9045d75359c58a01b5fdac8933acff9edb1

## Scaling consequence

The selected rank28 support is fully closed while widening from 66 to 70 transformed bits. Its largest stored boundary is Upper(draw14)=144,462, while its exact products remain sparse under the corrected orientation.
This strengthens the conclusion that transformed width and raw Cartesian size are not monotone cost laws. The structural pressure is threshold- and fiber-specific.

## Current frontier

~~~text
selected rank29  CLOSED
selected rank28  CLOSED
rank27           NOT STARTED
~~~

Do not descend automatically. Reassess the immediate rank27 predecessor fibers and carry the orientation policy forward.

The C4-R0043 / C4-R0069 / C4-R0076 proof-value bridge remains an open side seam. Authority 1.1 is unchanged.
