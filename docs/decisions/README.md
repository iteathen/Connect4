# Connect4 decision records

Use `docs/decisions/` when research or review results in an explicit architectural/ownership disposition that later work should not have to reconstruct from chronological reports.

A decision record should state:

- decision and scope;
- governing authority/specs;
- exact evidence/revisions considered;
- alternatives rejected or deferred;
- consequences for ownership, compatibility and qualification;
- what would invalidate/reopen the decision.

Research reports remain evidence. A decision record does not override an accepted specification outside its scope, and a recent research result does not silently become a decision.

Examples of decisions that belong here once explicitly accepted include:

- canonical solver branch ownership;
- promotion of a semantic state representation into one solver lane;
- rejection of a runtime BDD/ZDD form while retaining its oracle role;
- replacement/supersession of a concrete TT identity or support representation.

Do not use decision records as a diary or duplicate general engineering doctrine.
