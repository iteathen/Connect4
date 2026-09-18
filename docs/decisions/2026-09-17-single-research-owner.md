# Decision: one canonical research owner

**Date:** 2026-09-17  
**Status:** owner-authorized repository organization decision  
**Supersedes:** any current routing language that permits solver-specific durable research ownership, multiple research authorities, or long-lived focused `research/*` branches.

## Decision

Connect4 has exactly one durable research owner:

- `research/semantic-quotient` — all Connect4 research.

This includes research regardless of which solver, representation, benchmark, or implementation exposed it:

- derivations and mathematical results;
- hypotheses and candidate rules;
- experiment design and results;
- falsifiers and negative results;
- open questions and missing laws;
- research evidence and confidence records;
- cross-solver synthesis and maps;
- historical research provenance and source normalization;
- solver-specific research observations that have continuing information value.

The branch name is historical. Its ownership scope is **all Connect4 research**, not only semantic-quotient research.

## Solver ownership boundary

Every `solver/*` branch owns implementation, not research.

Solver branches may own:

- maintained solver code;
- implementation contracts/specifications;
- implementation-local status and execution plans;
- qualification/reproduction machinery;
- implementation qualification evidence needed to establish that a particular build satisfies its contract;
- operational/performance records tied only to that implementation.

When a solver produces a result with research meaning, that research meaning and durable research artifact belongs on the canonical research branch.

A solver branch must not become the durable home of a research hypothesis, theorem, counterexample, research experiment result, research evidence corpus, or cross-solver conclusion.

## Temporary experiments

Research work may use a temporary `experiment/*` or `work/*` branch when isolation is useful.

Such a branch:

1. has `research/semantic-quotient` as the research owner;
2. may contain in-progress research files while the bounded experiment is active;
3. must integrate every durable research result, negative result, hypothesis, evidence packet, and unresolved question into canonical research before retirement;
4. must not become a second research authority or long-lived research lane.

Do not create new durable focused `research/*` branches.

## Existing documentation

Historical documents may state the branch topology that actually existed when they were written. Those statements are provenance, not current routing authority.

Any document that presents solver-specific research ownership, `research/unified-knowledge`, a focused research branch, or another `research/*` branch as **current** research authority is superseded by this decision and must be corrected when encountered.

## Branch topology

Current durable ownership is:

```text
main
├── research/semantic-quotient     # ALL research
├── solver/minimax-alpha-beta      # implementation
├── solver/cuda-bsfp               # implementation
├── solver/hybrid-confluence       # implementation
├── solver/isometric               # implementation
└── solver/sut                     # implementation
```

## Reopen condition

Only explicit owner instruction may change the one-research-owner model.
