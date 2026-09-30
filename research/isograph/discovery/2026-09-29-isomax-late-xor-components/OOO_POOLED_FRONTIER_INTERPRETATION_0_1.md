# EW-RS-086: frontier ownership, not just frontier presence, repairs selected carriers

The full35 base/tag grid and zero/bulk control were frozen at `386bf2f8`. All NONE baselines and the full native control reproduce; independent kernel, scalar and row verification passes.

Pooled exactness returns only for OWNER_SEPARATED frontier tags on PMEC-03(rank349), PMEC-04(rank349), and the separated saturated base(rank350). The native full zero/bulk control has rank353. PMEC-01 and PMEC-02 still fail even with the owner-separated tag. ANY, TOTAL, ABS_NET, UNORDERED and SIGNED_COUNTS do not repair any base. The exact nine-state frontier partition order is published; no anonymous tag is silently selected as equivalent to owner-separated information.

This identifies a relational issue: the old base has forgotten owner labels, while the successful augmentation restores owner identity at the frontier. It does not yet show that absolute owner identity is a native requirement. The more natural next question is whether owner-invariant correlation between frontier and bulk channels suffices.

EW-RS-087 freezes a complete grid of within-stratum, same-sign cross-stratum and opposite-sign cross-stratum correlation families over the zero/bulk source. Every correlation is invariant under one global owner swap. Full owner vectors and their unordered-pair quotient are controls. No correlation family is chosen from scalar failures.

Scope remains pooled bounded Q_V dependency reconstruction. No coefficient decoder or closed scalar law is selected; holdouts remain sealed.
