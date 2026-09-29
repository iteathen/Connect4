# 5x4 Connect-4 phase cocycle experiment checkpoint

**Status:** pre-run checkpoint  
**Research direction:** Joshua Oshiro  
**Experimental predecessor:** 4x5 cocycle result at `e3f824b4d0aef3e5f09ccb73f933b035149be229`  
**Canonical synthesis:** `b529559214148478f93bfe84162a56d6ce9c154d`  
**Solved/outcome labels used by producer:** no

## Question

The 4x5 same-rule carrier produced 40 independent zero-syndrome GF(2) cycle
constraints. Does that integrability survive a width/height perturbation with
the same 20 cells and Connect-4 rule?

Test:

```text
width=5
height=4
k=4
nonterminalFrontierBlocker=true
moverFinalCapParity=true
measureLocalBranchClosure=false
```

Prior structural-growth work already established this carrier as feasible
(~289,852 residual-orbit states / 251,222 recursive classes in the corresponding
compact growth representation).

## Decisive outcomes

- any nonzero syndrome directly falsifies the present scalar phase carrier or
  exposes a missing structural variable;
- multiple zero-syndrome independent cycles across 5x4 would show that the
  4x4/4x5 result is not tied to four-column geometry;
- a cycle-free result would preserve earlier bounded theorems but provide no
  new phase corroboration.

No timeout increase, solved-value input, production solver change, BSFP
mutation, or authority-1.2 mutation is authorized by this experiment.
