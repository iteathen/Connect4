# Earliest rank-8 merge — forward structural witnesses

**Status:** bounded exact structural evidence  
**Research direction:** Joshua Oshiro  
**Branch:** research/nim-control-parity-algebra-20260929  
**Workflow:** 36576816013 — success  
**Solved W/D/L labels used:** no

## Method

For each of the nine earliest rank-8 pairs in one recursive action-unlabelled class, align legal continuations by child recursive class. When paired children are not literally the same structural state, recurse on a same-class child pair until the continuations become literally identical.

The witness depth is the minimum worst-case number of such forward class-aligned steps required to reach literal identity across every child class.

## Result

~~~text
merge pairs                                  9
minimum witness depth                        1
maximum witness depth                        7
all pairs have identical P0/mover residuals true
pairs with identical support                 1
pairs with any exact shared child class      8
pairs requiring transport in every class     1
~~~

Per pair:

~~~text
class 5108  depth 7  shared child classes 1/3
class 5276  depth 6  shared child classes 1/3
class 5788  depth 1  shared child classes 2/2
class 5824  depth 1  shared child classes 3/3
class 5826  depth 4  shared child classes 2/3
class 5950  depth 6  shared child classes 0/3
class 6039  depth 6  shared child classes 1/3
class 6129  depth 5  shared child classes 1/2
class 6190  depth 7  shared child classes 1/3
~~~

## Interpretation

The earliest quotient gap is not one uniform local rewrite.

Classes 5788 and 5824 are one-step branch collapses: every child class already contains a literally shared child state, so the only difference is redundant/equivalent branch presentation.

The other seven pairs require genuine recursive transport across different child representatives. Their equality cannot be explained by one static state predicate alone unless that predicate already encodes downstream equivalence.

Class 5950 is especially important:

~~~text
same support                    true
same P0/mover residuals         true
same P1/opponent residuals      false
shared literal child classes    0 / 3
witness depth                   6
~~~

The independent opponent-residual deletion audit identifies this exact class as the sole rank-8 class-preserving single-residual deletion. The source differs from the target only by P1 residual 28672, which is exactly the set of open top caps for support [0,2,2,4].

That residual is not eliminated by raw remaining-move capacity or by the relaxed support-release turn-slot test. Its redundancy therefore depends on richer first-win / support-resource interaction.

## Consequence

The next discovery target should be the class-5950 open-cap obligation itself. A useful rule must explain why completing that opponent cap residual cannot create a new first terminal outcome beyond the other residual obligations already present.

This is more specific than generic recursive bisimulation and more general than merely noting that two finite states landed in one class: it identifies an exact opponent obligation whose presence changes every literal child representative but changes no future structural control class.
