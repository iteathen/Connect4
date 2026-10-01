# v4 first-nine Pons full-vector recheck

**Status:** validation/falsification only. No oracle value is a runtime premise of v4 or any theorem.

Pinned Pons revision: `d6ba50d8aaf2308c769d9bf2abd42d90f34baf41`

Opening book SHA-256: `f346cd449626fb81da93be0958e017ee854e5f74d85b6d38062357f5403aec53`

Separate oracle batch wall time: 13.217 ms (includes solver process startup and book load; excluded from structural benchmark).

| ply | prefix before move | seven-column scores | acceptable set | v4 selected set | representative | basis |
|---:|:---|:---|:---|:---|---:|:---|
| 1 | `∅` | [-2,-1,0,1,0,-1,-2] | {4} | {4} | 4 | ANY_WIN |
| 2 | `4` | [-4,-2,-2,-1,-2,-2,-4] | {4} | {4} | 4 | MAX_DELAY_LOSS |
| 3 | `44` | [-3,-3,-2,1,-2,-3,-3] | {4} | {4} | 4 | ANY_WIN |
| 4 | `444` | [-4,-4,-3,-1,-3,-4,-4] | {4} | {4} | 4 | MAX_DELAY_LOSS |
| 5 | `4444` | [-2,-2,-2,1,-2,-2,-2] | {4} | {4} | 4 | ANY_WIN |
| 6 | `44444` | [-1,-1,-1,-1,-1,-1,-1] | {1,2,3,4,5,6,7} | {1,7} | 1 | MAX_DELAY_LOSS |
| 7 | `444441` | [0,-3,1,-3,1,0,0] | {3,5} | {5} | 5 | ANY_WIN |
| 8 | `4444415` | [-16,-16,-3,-16,-16,-1,-16] | {6} | {6} | 6 | MAX_DELAY_LOSS |
| 9 | `44444156` | [-2,-2,0,-2,0,1,0] | {6} | {6} | 6 | ANY_WIN |

All nine v4 selected sets are subsets of the project-acceptable perfect-move sets, and all nine deterministic representatives are acceptable.

The JSON sibling preserves W/D/L-equivalent move sets and exact-strong score equivalence classes for every one of the nine positions, including the empty root.

