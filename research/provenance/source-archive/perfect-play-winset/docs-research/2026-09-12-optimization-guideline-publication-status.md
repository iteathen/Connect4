# Optimization guideline publication status

The universal compute-synergy doctrine is intended for the account-global `iteathen/.github/AGENTS.md` rather than duplication in repository-local guidance.

The global repository protects `main`: direct update was rejected because changes must go through a pull request and the `Community quality` status check is required. Publication therefore proceeds on an owner-controlled branch/PR.

Connect4 should only carry its local specialization:

- the frontier solver hot path treats ~0.5% total CPU as material when paired evidence supports it;
- preallocated/sealed memory is intentionally spendable to reduce recursive compute/probes/dependent loads;
- Node/V8 remains the product implementation default;
- genuinely consumer-neutral native/GPU/SIMD/runtime primitives belong in the appropriate reusable CUDA-* library and are consumed through public Node-facing contracts;
- exact semantic identity remains authoritative over hashes/fingerprints.

This file is a temporary publication checkpoint and may be folded into current-state docs after the global PR is integrated.
