# 4x5 Connect-4 phase cocycle experiment checkpoint

**Status:** pre-run checkpoint  
**Research direction:** Joshua Oshiro  
**Experimental branch:** `research/nim-control-parity-algebra-20260929`  
**Pre-run head:** `9ec1512f66a69b0ecb880031527bc4f0ffb6a063`  
**Canonical research head observed:** `9cf5f77cab88acecdb0c650ed624b1c57142fa72`  
**Solved/outcome labels used by producer:** no

## Question

The 4x4 Connect-4 deeper binary continuation carrier has one genuine independent cycle and zero GF(2) syndrome. Small k=3 controls have binary residue but no genuine cycles, so they cannot strongly falsify the phase-potential hypothesis.

The next discriminator is the already-feasible 4x5 Connect-4 structural carrier.

## Bound experiment

Use `analyzeDirectResidualOrbitGraph` with the same rule-only structural semantics and the already-established safe closures:

```text
width=4
height=5
k=4
nonterminalFrontierBlocker=true
moverFinalCapParity=true
measureLocalBranchClosure=false
```

Do not rerun the unrelated structural-growth campaign. The only required outputs are:

- residual-orbit state count;
- recursive action-unlabelled class count;
- action-labelled class count;
- deeper-group and binary-group counts;
- binary inheritance edge count;
- delta 0/1 histogram where available;
- distinct/parallel/conflicting edge counts;
- weak-component/branch/join counts;
- genuine reconvergences;
- path-independent versus contradictory reconvergences;
- cycle rank;
- zero/nonzero syndrome counts;
- exit census;
- shortest/longest inherited chains;
- peak memory and elapsed time.

## Falsifiers

The current scalar phase carrier is rejected or incomplete if any genuine cycle has nonzero syndrome.

If 4x5 has multiple independent cycles and all have zero syndrome, the bounded integrability hypothesis gains materially stronger support.

If 4x5 has no genuine cycles, the 4x4 result remains exact but thin and may be a small-control accident.

## Discipline

- no solved W/D/L labels as producer inputs;
- no opening books or solve tables;
- no production IsoMax or BSFP mutation;
- no authority-1.2 mutation;
- preserve a failed/timeout run as negative evidence rather than increasing the existing 10-minute workflow bound;
- commit the measured result immediately after the run.
