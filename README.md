# Connect4

Independent Connect Four exact-solver laboratory and benchmark/validation product.

The repository deliberately keeps solver lanes separate while sharing Connect4-owned structural mathematics:

- `components/incumbent/` — incumbent Node minimax/alpha-beta baseline;
- `components/bsfp/` — backward symbolic fixed-point solver and CUDA-BSFP composition;
- `research/semantic-quotient/` — all durable Connect4 research and research evidence across every solver family and representation.

Connect Four rules, evaluator meaning, solved-game oracle evidence, benchmark fairness, CPC/WSL/NDC structural semantics, solver-specific proof meaning, and qualification evidence belong here. Reusable CUDA algorithms/runtime/search mechanisms remain owned by their respective CUDA repositories.

## Start here

- `AGENT_LOCAL.md` — repository ownership, authority, lane boundaries, and local constraints.
- `STATUS.md` — current research state and proof boundary.
- `next_step.yaml` — current executable research seam.
- `research/GAMEPLAY_DESCRIPTION_FOR_HUMANS.md` — novice gameplay explanation of q, with a classical logic proof and IsoGraph/NEI mapping.
- `research/GAMEPLAY_STRATEGY_INDEX.md` — living index of gameplay-facing strategies and implementation proposals derived from IsoGraph research.
- `docs/research/RESEARCH_INDEX.md` — compact map of durable research notes, controls, negative results, and historical evidence.
- `docs/specs/C4-0011-solved-knowledge-independent-benchmark-v1.md` — accepted clean exact-solver benchmark contract: no solved/self-game input, cold-start attestation, theorem provenance, RLC non-pruning boundary, exact-target declaration, and reproducibility rules.

Dated research notes are evidence, not current-state authority. Solved databases and finite oracle/census results may validate or falsify structural candidates but do not prove unbounded theorems.

## Why center is the rank-local best move for plies 1–5

The first-five RLC result is a decision proof under a restricted information set. It does not assume the solved W/D/L value of the game.

Assume only that:

1. the player to move is trying to win;
2. the global outcome is unknown;
3. only the current legal position, gravity/support, ownership, and winning-line geometry may be used;
4. no opening book, solved value, prior best-move label, descendant search, or projected future line is available.

For each legal landing column `c`, let:

- `A(P,c)` be the number of mover-live winning lines through the landing;
- `B(P,c)` be the number of opponent-live winning lines denied by occupying the landing;
- `H(P,c)` be the number of empty cells remaining above the landing after the move.

A move `x` rank-locally dominates `y` when:

```text
A(P,x) >= A(P,y)
B(P,x) >= B(P,y)
```

with at least one inequality strict.

The decision principle is Pareto dominance: if one legal move is no worse in every admitted winning objective and strictly better in at least one, then the dominated move has no rank-local reason to be preferred by a player trying to win. If one legal move dominates every alternative and has `H>0`, it is the unique structurally best move under the admitted information.

This is the intended meaning of **best** here. It does not mean that RLC has already proved the global minimax winner. It means that, without knowing whether the game is globally a win, draw, or loss, every alternative is structurally inferior under the information the decision procedure is allowed to use.

The complete first-five calculations are:

| current prefix | columns 1–7 as `(A,B)` | center `H` | result |
|---|---|---:|---|
| empty | `(3,3),(4,4),(5,5),` **`(7,7)`** `,(5,5),(4,4),(3,3)` | 5 | center dominates every alternative |
| `4` | `(2,3),(2,4),(2,5),` **`(9,10)`** `,(2,5),(2,4),(2,3)` | 4 | center dominates every alternative |
| `44` | `(3,2),(4,2),(4,2),` **`(11,12)`** `,(4,2),(4,2),(3,2)` | 3 | center dominates every alternative |
| `444` | `(2,3),(1,4),(2,4),` **`(10,11)`** `,(2,4),(1,4),(2,3)` | 2 | center dominates every alternative |
| `4444` | `(2,2),(4,1),(4,2),` **`(8,8)`** `,(4,2),(4,1),(2,2)` | 1 | center dominates every alternative |

Thus, at each of those five actual positions, column 4 strictly Pareto-dominates every non-center legal move in `(A,B)` and retains positive headroom. A player trying to win, with no solved-game knowledge and only the admitted rank-local information, therefore has one clear choice:

```text
empty -> 4 -> 44 -> 444 -> 4444 -> 44444
```

At `44444`, center still dominates all alternatives in `(A,B)`:

```text
(2,2),(1,4),(2,4),(6,6),(2,4),(1,4),(2,2)
```

but its headroom is now `H=0`. The same certificate therefore refuses to extend the conclusion:

```text
UNRESOLVED / UNIQUE_MAX_EXHAUSTS_COLUMN
```

This refusal is important. The rule is not "always play center"; it recomputes the live structural comparison and stops when its own continuation condition ceases to hold.

**Formal claim:** For the first five positions generated from the empty board, center is the unique structurally best legal move under the declared rank-local winning objectives because it strictly Pareto-dominates every alternative while retaining positive headroom. This requires no prior knowledge of whether the position's game-theoretic outcome is win, draw, or loss.

This is not the stronger and unnecessary claim that rank-local dominance must equal global minimax ordering at every legal Connect Four position.

Full theorem, provenance, executable identity, and independent-reproduction details:

`research/publications/2026-10-03/RANK_LOCAL_FIVE_PLY_CENTER_CERTIFICATE_0_3.md`

## CUDA-BSFP qualification

The maintained benchmark qualifier is governed by `docs/specs/profiles/C4-0009-Q1-benchmark-qualification-v1.md`.

Official native qualification is explicitly armed and publishes immutable evidence back to this repository:

```text
npm run bench:bsfp:qualify
```

For a non-publishing plan check:

```text
node tools/cuda-bsfp-qualifier.mjs --qualify-benchmark --dry-run
```

GPU cases are admitted only after the profile-owned memory bound is checked against current free VRAM under the configured safety policy. Cases use bounded timeouts, and interrupted qualification is recoverable on the next invocation.

Publication requires `CUDA_BSFP_GITHUB_TOKEN`, `GITHUB_TOKEN`, or `GH_TOKEN` with suitable repository permissions. Tokens are not forwarded to solver children or evidence.

Current C4-0009-P1 native execution is intentionally frozen to 4x3 connect-3; larger default-ladder cases remain visibly unsupported until a later compact CUDA-BSFP profile supplies executable semantics and a safe memory bound.
