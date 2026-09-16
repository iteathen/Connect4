# Structural selection map: from Connect-K geometry to the still-open strong-play bridge

**Research direction:** Josh Oshiro  
**Formalization:** OpenAI ChatGPT

```text
Connect-K window geometry
        |
        +-----------------------------+
        |                             |
        v                             v
interval hypergraph H_{W,K}       bottom-event line incidence
        |                             |
        v                             v
singleton transversal             impact profile d_{W,K}(c)
        |                             |
        +-----------+-----------------+
                    |
              W=2K-1 exactly
                    |
                    v
              unique center c=K-1
                    |
       +------------+-------------+
       |                          |
       v                          v
one-move purefollowup         unique maximum
safe-entry phase             initial requirement impact
       |                          |
       +------------+-------------+
                    |
                    v
             structural center
                    |
        K=4 + core balance
                    |
                    v
              W=7,H=6,Y=28
                    |
                    X  MISSING SEMANTIC EDGE
                    |
                    v
objective-relative uniform center strategy
+ controllable consequence predecessors
+ finite top/resource/deadline closure
+ optimal-delay preservation
                    |
                    v
rank-5 center-stack maximal-delay extremum
                    |
                    X  provenance coupling still required
                    |
                    v
strong-distance terminal-line support 28
```

## What is closed

- `C4-R0070`: safe one-hot pure-followup entry is exactly singleton transversality for `K>=4`.
- `C4-R0071`: unique initial-impact centrality occurs at exactly the same width `W=2K-1` and center.
- K=4 regular core balance then forces `7x6` and structural `28`.
- The existing rank-5 geometry proves the center stack is the unique maximal-delay support-envelope extremum once that support is under consideration.

## What is not closed

Neither centrality nor the number `28` is a game objective. The missing theorem has two parts:

1. **opening selection:** establish a value-/distance-correct strategy that factors through the center observation without importing solved root value or optimal move;
2. **delay preservation:** establish that every optimal delaying response remains inside a structural invariant carrying that phase center to the rank-5 center stack / terminal horizon.

Only after both can the static 28 be coupled honestly to the strong-play terminal-provenance 28.

## Nearby-board controls

The theorem itself explains nearby widths rather than fitting them:

```text
K=4,W=4: safe entries 4, impact maxima 2
K=4,W=5: safe entries 3, impact maxima 2
K=4,W=6: safe entries 2, impact maxima 2
K=4,W=7: safe entries 1, impact maxima 1
K=4,W>=8: safe entries 0, impact maximum is a plateau.
```

Thus W=7 is a genuine structural transition point. This does not imply that neighboring board game values or terminal counts follow the same scalar rule.
