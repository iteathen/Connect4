# Decision-state TT, compact rank, dominance, and bitset win-space follow-up

**Date:** 2026-09-09  
**Status:** research evidence only; no maintained-source promotion

This follow-up continues from the preserved structural-candidate research. It records the stronger results that arrived after the earlier batch and separates concept results from implementation results.

## Decision states, not forced transit states

A recursion-only forced-chain loop was previously negative because it still performed ordinary TT lookup/publication at every forced single-choice state. A stronger variant changes the TT boundary itself:

- apply the same legal/tactical filtering as baseline;
- if exactly one surviving choice remains, advance it as a forced macro-edge;
- do not spend a general-purpose TT lookup/publication on that intermediate state;
- resume normal TT behavior when a genuine branch state is reached.

At 512K entries, single worker:

| Position | Baseline nodes | Decision-only nodes | Baseline writes | Decision-only writes |
| --- | ---: | ---: | ---: | ---: |
| `663152175` | 1,004,480 | 1,010,950 | 577,277 | 425,040 |
| `41267575` | 5,945,560 | 5,521,407 | 3,383,162 | 2,173,208 |

The larger solve therefore searched ~7.1% fewer nodes and published ~35.8% fewer TT entries. The smaller solve searched ~0.64% more nodes while avoiding ~26.4% of writes.

A separate cell-array oracle checked 100 legal late 7x6 roots with no immediate current-player win; baseline and decision-only exact distance-sensitive scores agreed with the oracle on all 100.

The structural interpretation is stronger than a stack optimization: deterministic transit states do not automatically deserve the same cache status as decision states.

## Interaction with intrinsic rank banking

At the same 512K total capacity on `41267575`:

| Variant | Nodes | Hits | Writes |
| --- | ---: | ---: | ---: |
| flat baseline | 5,945,560 | 1,119,606 | 3,383,162 |
| rank only | 5,282,073 | 935,240 | 3,014,569 |
| decision + rank | **5,261,422** | 888,871 | **2,081,030** |

The combination searched ~11.5% fewer nodes and published ~38.5% fewer entries than the original flat table.

At tighter memory the effect strengthened: with 256K total TT on `41267575`, decision-only storage plus intrinsic rank banks reduced nodes from about 7.57M to 5.75M (~24.1%) and writes from about 4.29M to 2.28M (~46.8%). At 1M the node advantage shrank to about 2.8%, consistent with the mechanism primarily reducing destructive cache pressure.

A branch-count admission threshold above the natural `>=2 choices` decision boundary did not generalize. In particular, rank banking made the previous flat-table `3+` preference disappear; excluding two-way decision states then destroyed useful reuse. Do not hard-code a global branch-count threshold.

## Rank-compatible 10-byte exact key

The earlier fixed exact residual key assumed at least 17 implicit local-index bits, conflicting with the profitable 32K (15-bit) rank banks. A revised exact format keeps the TT at 10 bytes/entry while supporting 15-bit local banks:

- 17 bits of `keyHi`;
- 17 mixed-key residual bits not supplied by the local slot;
- 32 residual bits in the existing key word;
- two remaining exact identity bits stored in the high two bits of the writer/diagnostic byte;
- lower six writer bits remain available for up to 63 nonzero writer IDs.

At 512K total entries the compact-rank variant reproduced exactly the full-key rank-banked nodes, hits, and writes on both established positions. This removes the earlier representation/layout conflict. Concurrent writer-ID and publication correctness remain separate research obligations.

With compact key + fine rank banks + decision-state admission at 512K:

- `41267575`: 5,261,422 nodes / 888,871 hits / 2,081,030 writes;
- `663152175`: 1,014,754 nodes / 167,269 hits / 427,015 writes.

The compact representation preserves the same decision+rank search graph while reducing entry storage from 14 to 10 bytes.

## Dominance / implication proof reuse

Proof reuse between non-identical minimal-requirement states remains positive. Live alpha-beta small-game tests reduced nodes by roughly 5.4%, 7.9%, and 13.0% on 4x3 connect-3, 4x4 connect-4, and 5x3 connect-4 respectively, with exact root values preserved.

A first explicit value-bucket/Pareto-frontier implementation was a mechanical failure: it duplicated certificates and increased comparison work. That is evidence against that index, not against dominance itself.

A more semantic WDL Pareto frontier retained the same implication mechanism and achieved larger expansion reductions on complete small games:

| Geometry | Baseline expanded | Frontier expanded | Reduction | Max certificates / skeleton |
| --- | ---: | ---: | ---: | ---: |
| 4x3 connect-3 | 234 | 215 | 8.1% | 7 |
| 4x4 connect-4 | 31,068 | 19,903 | 35.9% | 116 |
| 5x3 connect-4 | 10,688 | 8,702 | 18.6% | 19 |
| 4x5 connect-4 | 241,276 | 120,930 | **49.9%** | 388 |

The current frontier maintenance is still comparison-heavy and slower in larger complete games. The result is therefore a representation bound: implication knowledge can be retained as a finite antichain/Pareto object, but the index still needs a machine-native representation.

## Incremental bitset win-space antichain

The largest representation result in this follow-up is that the canonical minimal win-space need not be recomputed through sorting/deduplication/subsumption at every node.

For standard 7x6 connect-4, every residual winning requirement is a non-empty subset of one of the 69 geometric winning lines. The complete residual-requirement universe therefore contains only **625 unique requirements**:

- 42 singleton requirements;
- 282 size-2 requirements;
- 232 size-3 requirements;
- 69 size-4 requirements.

A requirement that becomes redundant because an active strict subset subsumes it can never become useful later: an opponent move killing the subset also kills every superset containing it, while our own move preserves the subset relation. Therefore minimality can be maintained monotonically.

A fixed-ID bitset transition was implemented and exhaustively compared with the expensive canonical antichain implementation. It reproduced exactly the same exact state counts:

| Geometry | Requirement universe | Canonical states |
| --- | ---: | ---: |
| 4x3 connect-3 | 65 | 3,735 |
| 4x4 connect-4 | 126 | 34,095 |
| 5x3 connect-4 | 69 | 11,317 |
| 4x5 connect-4 | 191 | 294,593 |

This is the key integration result: the semantic compression can be maintained **by construction**, using fixed requirement IDs and bitsets, rather than reconstructed from dynamic sets.

The same representation also makes formula implication much cheaper. Precomputing each requirement's downward/subsumption closure turns many dominance checks into fixed bitset containment operations rather than nested set comparisons. Initial bitset-dominance tests preserved the same node reductions as the earlier semantic implementation; remaining cost came primarily from scanning candidate solved states, not from the implication predicate itself.

## Residual symmetry distinction

Residual-game symmetry remains real and distinct from ordinary board reflection. Structural refinement reached the same exact canonical counts as full column-permutation search on complete small games while examining only about 1.6-3.7 candidate permutations per state instead of 24-120. On selected 7x6 late roots, residual equivalence reduced exact win-space state counts by up to ~38.3%.

Ordinary horizontal reflection in the physical direct-mapped TT remained negative/weak because changed collision patterns could outweigh mirror reuse. More equivalence is not automatically a cache win.

## Preserved local evidence identities

The corresponding local UTF-8 evidence/prototype identities include:

- follow-up report SHA-256 `c736f3e233ab11a2b0fc78d8dff3609b346863cb389f24b1995cebfe989a01c9`;
- decision solver SHA-256 `d8f5608d6a4d4682dd67aa2d1657e38da7f3967c62fdb3b8588af9b0eddf233c`;
- compact decision+rank solver SHA-256 `c3b95056269e29900fd4039e959a976a059e7d4b0e172e0295e7274dccb03d99`;
- decision qualification SHA-256 `cca933085cbbbdbfafb4ea227e9da3126d070882f68662d104087b09557c398b`;
- decision+rank large evidence SHA-256 `fd1ee71dafe4949e4353998e39c7c9ee673f656bfa3d00c9c78d54c529ac0248`;
- compact decision+rank evidence SHA-256 `f2f5583407ddea5d965076df8a9a42c7ea40282f8fe185f898d8e31e358f47a8`;
- dominance frontier evidence SHA-256 `f66585f55034fc77dd2bb2f0be55372aa6128df8e486684358f53cc24a415084`.

Large archive/base64 transport is intentionally avoided.

## Current disposition

Strong active candidates now include:

1. minimal remaining win requirements as exact search identity;
2. incremental fixed-ID bitset antichain maintenance;
3. residual-game symmetry through structural refinement;
4. dominance/implication proof reuse, pending a cheap candidate index;
5. decision-state TT admission / forced macro-edges;
6. intrinsic rank banking;
7. rank-compatible compact exact keys.

The strongest emerging shape is that the same fixed requirement universe may support identity, minimality, residual symmetry, and implication as different bitset views of one structure rather than separate policy systems.
