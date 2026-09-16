# Disproven: tested legacy/even-ply A9 responder orientation

**Claim:** C4-R0037  
**Disposition:** scoped falsification of an implementation/formulation, not of the published A9 rule family.

The conservative A1-A9/A10 experiment generated A9 instances using the branch's documented legacy/even-ply responder orientation and combined them using the conservative Allis section 7.4 compatibility table.

On 1,201 sampled roots (182 eligible), the full A1-A9 composition made 95 no-win claims. Exact oracle checking found three false claims. Every false certificate selected A9:

- `7134251241772116567767256313` — exact score `+4`; selected `A4,A9,A8`.
- `2315247111213571574277746346` — exact score `+1`; selected `A9,A6,A1`.
- `4221254436322741452453116633753116` — exact score `+1`; selected `A9`.

The matched ablation with A9 disabled produced 84 claims, 35 beyond A123, and zero false claims on the same deterministic sampled corpus.

Therefore the **tested A9 responder generator/orientation is unsound**. This does not establish that Victor Allis's published A9 rule family is false, nor that every role-general A9 formulation is unsound. The correct follow-up is to identify the missing guard/orientation/temporal condition that excludes these counterexamples.

Evidence: `research/evidence/minimax/a1a9-a10-ablation.json`.
