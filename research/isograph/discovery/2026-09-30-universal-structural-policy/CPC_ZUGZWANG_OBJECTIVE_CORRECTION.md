# CPC objective correction: parity-forced zugzwang, not move survival

**Date:** 2026-10-01  
**Status:** research correction / architectural constraint  
**Branch:** `research/universal-structural-policy-20260930`  
**Project-owner clarification:** Joshua Oshiro

## Correction

CPC is not fundamentally a move-by-move survival search and does not care which
particular later move loses.

Its target is the value of the **current position/candidate move** from structural
information.

The core CPC question is:

[
	ext{live winning obligations}
+	ext{current column remainders}
+	ext{turn parity}
+	ext{gravity}
Longrightarrow
	ext{which player is eventually forced to occupy the decisive event?}
]

That forced event is Connect-Four zugzwang-shaped: after all parity-neutral
responses/reservoir events are consumed, one player is left with the unmatched
move that resolves a live winning obligation.

## Existing authority already supporting this interpretation

Pinned JSMinSys CPC already contains and tests the exact future-event parity
projection:

For target cell (t=(c,r)), count:

- in target column (c): only the remaining support events through (r);
- in every other column: all currently remaining legal slots.

Let (E_t(q)) be that number of future events from current state (q).
If current rank parity is (m), then the owner forced onto the target after those
events are exhausted is

[
operatorname{Owner}_q(t)=moplus(E_t(q)-1mod 2).
]

The JSMinSys test suite independently verifies that
`connect4CpcTargetOwner32` equals literal future-event counting on configured
4x4 and 10x10 geometries.

For standard 7x6 this simplifies geometrically because the six non-target columns
contribute an even total capacity, but the general CPC meaning remains the
per-column event-reservoir parity calculation.

## Role of winning lines

CPC begins from still-live winning requirements, not from arbitrary cells.

A parity owner attached to a cell matters only through a live residual/winning
line whose completion or denial is decisive.

Therefore the relevant structural object is not merely:

[
operatorname{Owner}(t)
]

but:

[
(	ext{live residual attachment},t,operatorname{Owner}(t),	ext{support order}).
]

## Role of response/guard machinery

Paired-response, synchronized-channel, odd-row guard, support-lift and related
theorems are **supporting certificates**.

Their job is to prove that alternative play cannot evade the parity conclusion
before the decisive event is reached.

They are not the definition of CPC and should not turn CPC into a search for one
specific defender response sequence.

The recent D15/D19/D25 guard-survival machinery is therefore best understood as
evidence about **escape closure** for a parity certificate, not as CPC's ultimate
value function.

## Zugzwang theorem target

A CPC zugzwang certificate should establish, directly from current RBA state:

1. a live decisive residual/winning-line obligation exists;
2. its decisive target/event has a parity-determined owner;
3. all nondecisive event reservoirs are pairable, neutral, blocked, or otherwise
   unable to change that owner relation;
4. no earlier first-win/preemption escapes the certificate;
5. therefore one side is inevitably forced to consume the decisive event.

The certificate may conclude W/L without naming the exact historical sequence
that reaches the forced event.

## Architectural consequence

Do not keep extending a move-by-move survival grammar merely because a deeper
horizon fails.

When the obstruction is parity-shaped, first ask whether the position already
admits a current-state zugzwang certificate over:

- active live residuals;
- target-owner parity;
- remaining column event counts;
- paired/neutral reservoirs;
- first-win escape conditions.

Only use local response transitions to discharge a missing certificate premise.

## Claim discipline

This correction does not claim that every CPC projected target owner is already
an exact W/D/L result.

The target-owner parity is exact. Turning it into W/D/L still requires a sound
proof that the decisive obligation cannot be avoided or preempted.
