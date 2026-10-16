# G2 reverse-certificate bounded verification plan 0.1

**2026-10-16 — research checkpoint, prior to execution.**

## Authority / target

- Durable owner: `research/semantic-quotient`; starting head `ca21bef49d0bdf885bf99358b6ab007353217a18`.
- Existing exact G2 canonicalizer and packed-q transport: `research/isograph/discovery/2026-09-18-policy-frontier/rba-g2-fiber-equivalence.mjs`.
- Preserve 316-position / 1,586-transition oracle-relative core and all existing G2/G3 evidence.
- No change to qualified IsoGraph 1.2 authority, operational solver, rank-33 frontier compiler, or CPC/NDC proof semantics.
- Objective: a **small reverse-checkable exact witness for proposed G2 equivalence**, not global q-state enumeration or continuation-tree proof.

## Candidate and reverse-check obligations

A candidate is a 7-column partial mapping of active future gravity chains, with -1 for full columns. A verifier **independent of the G2 canonical key** reconstructs all geometric winning lines and checks:

1. valid supports, equal rank, bijection of active columns, and equal future chain lengths;
2. preservation of gravity depth, frontier/legal-action mapping, and basic zero-reservation CPC row control;
3. exact equality of nonempty support-conditioned residual hyperedge sets under the induced cell map;
4. for each mapped action, equality of child residual hyperedge sets and every atomic owner-true/owner-false principal cofactor; terminal empty residual is preserved.

These are finite local exact checks, not oracle calls or game-tree descent. Set-theoretic distributivity plus preservation of inclusion/minimalization then establishes cofactor commutation for *every abstract residual antichain*, and decreasing remaining rank establishes abstract ordinary W/D/L and per-action-value transport. The theorem must be stated with its abstract-game and first-win guards; historical legal realizability and non-q CPC/NDC certificate premises are not transported by G2 alone.

## Bounded implementation qualification

- Record committed verifier/harness before testing.
- Run three known non-mirror boundary examples (ranks 30, 34, 35); reject deliberately corrupted witnesses.
- Build only the finite support-pair sampling frame at ranks 33, 34, 35, 36 (not a future-position graph). No rank-descending W/D/L compilation.
- Sample **400** non-mirror representative-to-member pairs, with replacement: choose rank uniformly among those four ranks, then pair uniformly from that rank's eligible pairs. Fixed xorshift32 seed `0x4c2a2026`; `n=400` predeclared; timeout `60 s`. No adaptive enlargement.
- Report by-rank frame size, counts, distinct sampled pairs, mapping rejects, local obligations checked, verification milliseconds and total setup milliseconds.
- One-sided nominal exact binomial zero-failure bound is `1 - 0.05^(1/n)` for an IID rank-mixture draw **only** if the random-draw/sampling-frame assumptions hold. Deterministic boundary tests are outside that probability calculation. Otherwise confidence objective is unmet and the interval is not reported as valid.
- Any counterexample: preserve the witness, source/target supports, seed, failing obligation; do not bury it in an aggregate count. Stop at the first falsifier.
- Stop after target sample count or 60-second budget, whichever occurs first. Budget exhaustion is PARTIAL, not PASS.

## Expected value

Checking an explicit map costs operations over 42 cells, at most 69 geometrical winning lines, and 7 local action cofactors. It does not scale with the number of abstract q states or graph continuations. Candidate *discovery* via G2 canonicalization is a separate cost and is measured separately.

## Claim boundaries

- Existing G3 tests already report 1,592,642 exact abstract q-pair transports and 3,929,368 mapped action-value cases, zero mismatches; no need to rerun them.
- Exact certificate check does **not** prove that every arbitrary guessed map is an isomorphism: it rejects failures.
- A tested sample does **not** prove that the certificate implementation never has a bug, nor that every legal historical state maps to a legal historical state.
- No assertion that the root's winning action is now directly certified. A future structural winning-region invariant must separately cover universal opponent responses.
