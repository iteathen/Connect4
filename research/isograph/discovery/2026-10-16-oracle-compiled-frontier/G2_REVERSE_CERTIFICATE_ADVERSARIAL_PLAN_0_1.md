# G2 reverse-certificate adversarial control 0.1

**Checkpoint before execution — 2026-10-16.** Owner: `research/semantic-quotient`.

Target: distinguish gravity/frontier-only relabelings from genuine residual-incidence G2 isomorphisms. This is a **negative control** for the independent local reverse verifier already qualified on 400 sampled true-class representatives.

Produce target supports by seeded permutations of concrete source-column heights; submit the induced column map directly to the local checker. Every candidate necessarily preserves rank, future-chain lengths, and legal action bijection. Exclude identical supports and candidates already certified by the existing exact G2 canonicalizer. The remaining candidates must be rejected for **residual hyperedge incidence**, not an early malformed-witness guard.

Sources: known non-mirror test supports at ranks 30/34/35. Seed `0x4c2a2027`. Target 160 **distinct** false-equivalence candidates; budget 10,000 shuffles or 10 seconds, whichever comes first. No branching game graph or oracle use. Record accepted false positives as immediate counterexamples; stop on first. Failed test or exhausted budget is not a pass.

This campaign tests implementation discrimination, not G2 semantic theorem or universal false-acceptance probability.
