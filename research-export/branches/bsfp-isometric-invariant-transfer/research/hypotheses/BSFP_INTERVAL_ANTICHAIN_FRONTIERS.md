# BSFP interval-antichain frontiers

**Status:** live solver/proof hypothesis. The interval algebra is exact; a production representation/performance benefit is not yet established.

**Research direction:** Josh Oshiro.

## Purpose

Isometric frequently proves a one-sided game consequence before it proves exact W/D/L:

```text
P0 cannot win
P1 cannot win.
```

The current ownership-antichain BSFP centers exact P0-Win and exact P0-Loss boundaries. This note derives the smallest direct extension that can consume one-sided Isometric certificates without pretending that a no-win proof is an opposite-player win.

The target is a common exact proof currency for:

```text
Isometric guarded closure
<-> BSFP backward predecessor propagation.
```

No solved database label or precomputed search result is a premise.

## 1. Four semantic regions

Use absolute P0-oriented values

```text
-1 = P1 win
 0 = draw
+1 = P0 win.
```

At fixed support/turn define:

```text
W      = { P | value(P) = +1 }
NW0    = { P | value(P) <= 0 }   // P0 cannot win
NW1    = { P | value(P) >= 0 }   // P1 cannot win
L      = { P | value(P) = -1 }.
```

Under the same P0-favourable ownership order already used by C1:

```text
W   upward closed
NW1 upward closed
NW0 downward closed
L   downward closed.
```

Hence all four regions fit the existing two antichain orientations:

```text
W, NW1   -> minimal generators
NW0, L   -> maximal caps.
```

At complete exact closure:

```text
NW0 = complement(W)
NW1 = complement(L)
W subseteq NW1
L subseteq NW0.
```

The reason to maintain `NW0/NW1` separately is not final-state compression. It is that guarded structural proof may establish a sound subset of a no-win region before exact W/L is known.

## 2. Six intervals emerge from membership

For one ownership assignment `P`, sound certified memberships map directly to the six-element interval lattice:

```text
no certificate             -> [-1,+1]
P in NW0 only              -> [-1, 0]
P in NW1 only              -> [ 0,+1]
P in NW0 and NW1           -> [ 0, 0]
P in L                     -> [-1,-1]
P in W                     -> [+1,+1].
```

Consistency requires:

```text
W intersection NW0 = empty
L intersection NW1 = empty
W intersection L   = empty.
```

`W` implies `NW1`; `L` implies `NW0` semantically even if an implementation does not redundantly store those implied memberships.

Unknown remains unknown. Failure to derive `NW0` is not evidence for `W`, and failure to derive `NW1` is not evidence for `L`.

## 3. Sound partial-proof interpretation

For integration with Isometric, do not require the four stored regions to be complete.

Use certified under-approximations:

```text
CW    subseteq W
CNW0  subseteq NW0
CNW1  subseteq NW1
CL    subseteq L.
```

Any exact terminal theorem, blocker/no-win theorem, resource cut, runtime-earned exact search certificate, or ordinary BSFP result may seed one of these regions when its guards match the current support/turn domain.

This makes the representation a proof system rather than a four-valued guess.

## 4. Exact alternating predecessor algebra

For each legal action `a`, pull the four child proof regions back through the exact move cofactor and then apply first-win terminal override. Call the move-specific regions:

```text
CW_a, CNW0_a, CNW1_a, CL_a.
```

### P0 to move

P0 chooses the action, so:

```text
CW_parent   = union_a        CW_a
CNW0_parent = intersection_a CNW0_a
CNW1_parent = union_a        CNW1_a
CL_parent   = intersection_a CL_a.
```

Interpretation:

- one certified winning action proves P0 win;
- every action must be certified no-P0-win to prove P0 cannot win;
- one action avoiding P1 loss proves P1 cannot force a win;
- every action must lose for P0 to certify exact P1 win.

### P1 to move

P1 chooses the action, so:

```text
CW_parent   = intersection_a CW_a
CNW0_parent = union_a        CNW0_a
CNW1_parent = intersection_a CNW1_a
CL_parent   = union_a        CL_a.
```

These are exactly the interval predecessor equations expressed as monotone set families.

The algebra uses only the union/intersection operations already native to antichain BSFP:

```text
upward union          -> concatenate + minimal normalize
upward intersection   -> OR product + minimal normalize

downward union        -> concatenate + maximal normalize
downward intersection -> AND product + maximal normalize.
```

No new set-family operator is required.

## 5. Terminal override for all four regions

A terminal action overrides the child value; therefore first-win subtraction must apply to the interval regions as well as exact W/L.

### P0 terminal requirement `T0`

Where the move is an immediate P0 win:

```text
CW_a   includes T0
CNW1_a includes T0
CNW0_a excludes T0
CL_a   excludes T0.
```

### P1 terminal requirement `T1`

Where the move is an immediate P1 win:

```text
CL_a   includes T1
CNW0_a includes T1
CW_a   excludes T1
CNW1_a excludes T1.
```

The existing exact antichain terminal-subtraction algebra therefore generalizes directly: terminal cones are unioned into the two semantically compatible regions and subtracted from the two incompatible regions.

### Full-board non-winning terminal

A certified terminal draw belongs to both no-win regions:

```text
CNW0
CNW1
```

and therefore collapses to `[0,0]` without entering `CW` or `CL`.

## 6. What Isometric can inject immediately

Examples of proof-side consequences that naturally seed interval frontiers:

```text
one-sided residual exhaustion
complete compatible blocker cover
qualified paired-response safety policy
guarded response-resource cut
completion-before-deadline preemption
bilateral exhaustion
runtime-earned exact bound/search certificate.
```

They map as:

```text
P0 no-win theorem -> CNW0
a P1 no-win theorem -> CNW1
bilateral no-win  -> both -> exact draw
exact P0 win      -> CW
exact P1 win      -> CL.
```

This is strictly safer than forcing a one-sided certificate into the opposite exact attractor.

## 7. Why this may reduce BSFP work

If the solver always computes complete `W` and `L` frontiers at every support, the final exact `NW0/NW1` contain no new information; they are complements.

The candidate benefit comes only from **partial proof closure**:

```text
cheap structural certificate
-> one-sided interval region
-> predecessor interval propagation
-> root or large subregion collapses
-> exact W/L boundary need not be completed there.
```

Therefore the relevant experiment is not "maintain four complete frontiers instead of two." That would likely duplicate work.

The relevant experiment is:

```text
ordinary exact W/L path
+
lazy sparse CNW0/CNW1 proof frontiers
+
short-circuit exact frontier construction only where interval closure is already sufficient.
```

A proof frontier remains empty when no accepted certificate supports it.

## 8. Interaction with support-local residual bases

`BSFP_SUPPORT_LOCAL_RESIDUAL_BASIS.md` makes this more practical.

At fixed support, Isometric can evaluate residual exhaustion, blocker coverage, degree/singleton facts and local cofactors over at most 69 support-local residual terms, and at most 64 terms on every standard-7x6 support from rank 17 onward.

Thus the proposed late-rank loop becomes:

```text
local residual basis
-> cheap guarded Isometric closure
-> emit CNW0/CNW1/W/L certificates
-> interval predecessor antichains
-> invoke full ownership-antichain products only on unresolved residue.
```

This attacks the same high-rank region where current CUDA-BSFP first hits its compute wall.

## 9. Interaction with feasible-slice reduction

A certificate may be valid on:

```text
full symbolic ownership domain
```

or only on a guarded feasible family such as:

```text
legal stone-count slice
+ fixed ownership facts
+ affine/clause conditions.
```

These scopes must not be mixed silently.

For the first qualification, use full-domain certificates on complete small controls. Add slice-guarded frontiers only after the feasible-slice representation has an explicit guard-carrying contract.

## 10. Root stopping conditions

For the empty-root assignment, the solve may stop as soon as one of these exact proof states is established:

```text
root in CW                 -> P0 win
root in CL                 -> P1 win
root in CNW0 and CNW1      -> draw.
```

A one-sided no-win interval alone is not a final result.

## 11. First qualification experiment

Build a CPU reference `interval-antichain BSFP` on the complete small-game controls.

Required modes:

1. **derivation-only control:** derive `NW0/NW1` from complete exact W/L and verify all four region orientations/classifications;
2. **predecessor reconstruction:** independently propagate all four exact regions with the equations above and require equality with the derived complements;
3. **sparse-seed mode:** seed only accepted local no-win certificates and propagate sound under-approximations; compare every claimed membership with exhaustive exact value;
4. **lazy-work mode:** skip exact W/L construction only where interval proof already fixes the requested result and measure candidate products avoided.

Required metrics:

```text
CW/CL/CNW0/CNW1 frontier widths by rank
certificate seed counts
interval-only resolved assignments/supports
exact pair products avoided
extra no-win pair products generated
root result
wall time
peak records
first contradiction/mismatch if any.
```

## 12. Falsifiers

Reject or narrow the candidate if:

- any `CNW0` member has exact value `+1`;
- any `CNW1` member has exact value `-1`;
- any `CW` member is not `+1` or any `CL` member is not `-1`;
- the four-region predecessor equations disagree with complete exact W/D/L;
- terminal override lets a live terminal alternative disappear;
- a slice-guarded certificate leaks into the unguarded symbolic domain;
- maintaining no-win frontiers costs more than the exact work they eliminate on the target workload;
- the implementation computes complete complements merely to claim interval progress.

## Disposition

Promote the **four-region interval-antichain algebra** as a high-priority integration experiment because it is the minimal exact semantic interface between Isometric one-sided proofs and BSFP predecessor closure.

Do not replace the current two-frontier production solver yet. The performance hypothesis is specifically that **sparse proof frontiers plus lazy exact closure** can eliminate expensive symbolic products; four fully materialized exact frontiers are only a correctness control.
