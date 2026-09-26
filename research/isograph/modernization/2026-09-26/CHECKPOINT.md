# Connect4 IsoGraph Modernization — 2026-09-26

**Branch:** `research/isograph-dp08-modernization-20260926`  
**Durable owner:** `research/semantic-quotient`  
**Status:** successor research in progress

## Preserved current authorities

- game theory / logic: 1.2 — unchanged;
- hot-loop performance research: 0.3 — unchanged.

## Successor artifacts

- `CONNECT4_GAME_THEORY_CORE019_SUPPORT_0_1.*` — unqualified derived-support overlay;
- `optimization/ISOMAX_HOT_LOOP_GRAPH_0_4_CANDIDATE.*` — unqualified DP 0.8-era performance successor.

## Main modernization decisions

1. Do not create game-theory 1.3 merely to restate a relation already implicit in qualified 1.2.
2. Represent the W/D/L partition consequence as Core 0.19 derived support with recoverable scope.
3. Explicitly preserve the negative fact that partial CPC non-detection does not imply draw.
4. Keep terminal/full-board draw semantics separate from predictive no-win/bound machinery.
5. Treat no-draw as a sufficiency/valuation candidate, not as a universal theorem that every draw-related deduction is useless.
6. Preserve the rejected win-only ablation as negative evidence.
7. Preserve current hot-loop 0.3 until 0.4 is separately qualified.

## Evidence consumed

- `optimization/2026-09-26-total-cycle-campaign/NO_DRAW_RESULT.md`;
- `WIN_ONLY_RESULT.md`;
- `CPC_OWNED_WIN_RESULT.md`;
- Core 0.19 executable-source rendering qualification;
- game-theory authority 1.2.

No solver implementation was changed in this modernization checkpoint.
