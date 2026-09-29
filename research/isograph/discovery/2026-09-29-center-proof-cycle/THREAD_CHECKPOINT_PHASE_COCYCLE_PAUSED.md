# Structural-control / Nim-like algebra thread checkpoint — paused

**Date:** 2026-09-29  
**Research direction:** Joshua Oshiro  
**Status:** paused by owner request; resume only on a later explicit instruction  
**Experimental branch:** `research/nim-control-parity-algebra-20260929`  
**Live experimental head at checkpoint:** `81de7806e92dd3ed5fc415804fdda954e1122b9a`  
**Canonical research owner:** `research/semantic-quotient`  
**Live canonical head at checkpoint:** `77701467d269be45f480d4e9a8b390d644faf064`

## Current theorem state

The original scalar-GF(2) continuation-phase conjecture has split into two different statements.

### Width-4 positive result

Outcome-blind structural carriers:

```text
4x4 Connect-4:
  cycle rank               1
  zero syndromes           1
  nonzero syndromes        0

4x5 Connect-4:
  cycle rank              40
  zero syndromes          40
  nonzero syndromes        0
```

The 4x5 result is non-vacuous and substantially stronger than the original 4x4
diamond:

```text
binary groups             696
binary inheritance edges  469
sheet-flipping edges       95
reconvergent pairs         42
contradictory pairs         0
```

Thus an exact bounded theorem for the tested width-4 recursive binary
continuation carriers remains plausible.

### Width perturbation falsifier

5x4 Connect-4 decisively falsifies a generalized scalar phase potential on the
current carrier:

```text
binary groups                    4,464
binary continuation edges        4,221
reduced inheritance edges        4,026
cycle rank                         644

zero cycle syndromes               619
nonzero cycle syndromes             25

reconvergent pairs                  568
path-independent pairs              556
contradictory pairs                  12

global scalar phase potential     false
```

Therefore:

```text
finite width-4 scalar integrability
!=
general Connect-4 scalar GF(2) integrability
```

The scalar model is either width/geometry guarded, missing structural
coordinates on 5x4, too low-dimensional, or the late continuation algebra is
not purely binary/abelian.

## Explicit obstruction evidence

A minimal contradictory 5x4 reconvergence already integrated into canonical
research is:

```text
3260 -> 1857 -> 574    accumulated XOR 0
3260 -> 3255 -> 574    accumulated XOR 1
```

The successful witness-emitting workflow also records larger explicit
contradictory paths. One example:

```text
source 3227 -> target 168
path multiplicity 5
parity counts [4,1]
```

and the first emitted nonzero fundamental-cycle example is:

```text
closing edge 1463
2236 -> 1238
edge delta 0
cycle syndrome 1
```

These are gauge-invariant obstructions, not arbitrary local sheet naming.

## Latest experimental work

After the first 5x4 falsifier, the experimental branch added instrumentation to
expose the structural content of obstruction groups.

Latest commits after the initial witness run:

- `411af670c5aa746f36cfbb944e75e48cd03cb1c8`
  — expose 5x4 obstruction structure;
  collects every group participating in contradictory witness paths and emits
  representative support, P0/P1 residuals, labelled sheets, phase-free profiles,
  and recursive profiles.

- `81de7806e92dd3ed5fc415804fdda954e1122b9a`
  — emit those obstruction-group examples from the dedicated 5x4 runner.

At pause time, two workflows triggered by this newest instrumentation were still
running and MUST be re-fetched before any resumed work:

```text
36608451573  IsoMax 5x4 phase cocycle research
              head 81de7806...
              status at checkpoint: in_progress

36608434024  IsoMax control algebra research
              head 411af670...
              status at checkpoint: in_progress
```

Do not rerun them blindly. On resume, consume their terminal results first.

The last fully completed 5x4 witness workflow before those runs was:

```text
run 36607890232
job 109541498181
head 7457ad943bc632c1ea324cb86d2d4489e89e5714
status SUCCESS
```

## Canonical state

Canonical research has now selectively integrated the 5x4 falsifier.

Recent canonical commits after the previous checkpoint include:

- `94fb23f18456e7da2a9c31f7fe1ede507c16af71`
  — integrate 5x4 cocycle obstruction;
- `77701467d269be45f480d4e9a8b390d644faf064`
  — narrow scalar phase after the 5x4 falsifier.

The canonical hypothesis now explicitly states that the present scalar phase is
not a generalized Connect-Four GF(2) potential.

Authority 1.2 remains untouched and frozen.

## Exact next research question

Do **not** resume by adding another arbitrary phase bit.

The next task is to explain the 25 nonzero 5x4 cycle syndromes structurally.

Use the newly emitted obstruction-group representatives to ask whether all
obstructions share a rule-derived distinction absent from the current binary
carrier.

Primary candidate explanations:

```text
1. missing support / realizability coordinate
2. missing first-win / deadline coordinate
3. missing transporter / orientation coordinate
4. higher-dimensional GF(2)^n phase
5. genuinely non-abelian continuation phase
6. width-4-specific exact law with no generalized scalar lift
```

The decisive target is a variable or relation that predicts the obstruction
syndrome **without solved outcomes**.

A corrected carrier is useful only if it explains the existing 25 obstructions
rather than deleting or normalizing them away.

## Theorem distance at pause

Current assessment:

```text
bounded width-4 cocycle theorem:
  close; likely one conceptual derivation plus an extension/qualification step

general structural phase theorem:
  open but sharply localized around the 5x4 obstruction family

scalar GF(2) theorem for generalized Connect Four:
  falsified on the present carrier

bridge from structural phase to W/D/L:
  still unproved
```

## Resume protocol

Before doing anything when this thread resumes:

1. recover live experimental and canonical branch heads;
2. inspect commits after `81de7806...` and `77701467...`;
3. inspect terminal state/logs for runs `36608451573` and `36608434024`;
4. preserve any newer obstruction analysis;
5. do not rerun completed 5x4 carrier enumeration unnecessarily;
6. continue by classifying the obstruction groups and searching for the minimum
   missing structural coordinate;
7. preserve negative results immediately;
8. keep solved W/D/L labels outside the producer;
9. do not modify production IsoMax, BSFP, or frozen authority 1.2 from this
   research lane.

This checkpoint intentionally ends the thread in a paused state.
