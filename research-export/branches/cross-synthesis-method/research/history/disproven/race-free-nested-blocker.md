# Race-free nested blocker inference

**Canonical claim:** C4-R0017

A naive nested rule treated eventual ownership/blocker satisfaction as sufficient without proving that the required events occur before an opponent terminal win. A counterexample falsified that stronger rule.

The surviving lesson is not that nested dependency reasoning fails. It is that **temporal/event precedence is a first-class premise**. Any NDC/Isometric rule that reasons across future ownership must model or prove the relevant race ordering.

Primary provenance: `research/provenance/source-archive/bsfp/docs-research/2026-09-09-owner-searchless-connect4-findings.md`.
