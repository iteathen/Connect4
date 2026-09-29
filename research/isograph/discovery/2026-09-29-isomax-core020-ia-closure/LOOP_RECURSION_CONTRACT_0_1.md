# Loop / recursion primitive-control contract 0.1

**Status:** candidate supporting structure for the complete IsoMax Core-0.20 reduction  
**Research direction:** Joshua Oshiro  
**Core rule:** reducible control structure is not an admissible leaf.

This contract implements the owner's clarification:

- a loop is not expanded by copying every iteration;
- its authoritative semantics are its primitive initial state, finite index/bound,
  guard, step, indexed-state, and exit relations;
- recursion is not expanded by copying every recursive call;
- its authoritative semantics are its domain, base cases, dependency relation,
  and a measure that strictly decreases on every recursive dependency;
- if definitive termination cannot be established, termination remains QU.

## Pinned primitive dependencies

- primitive logic kernel blob `2630336da5c4117a15a43c1dc0847536b33ed083`;
- primitive natural arithmetic blob `fde4915b3a056430e0cb7a3a327e26abc1c7b09b`.

Natural arithmetic is used only through its primitive-rendered carrier,
successor incidence and order relation; arithmetic names are not leaves.

## Loop schema

The native file defines:

```text
220000 loop-object carrier
220001 generic control-state carrier

220002 INIT(loop,state)
220003 BOUND(loop,n)
220004 AT(loop,index,state)
220005 GUARD(loop,state)
220006 STEP(loop,state,next)
220007 EXIT(loop,state)
220008 VALID_BOUNDED_LOOP(loop)
220009 LOOP_TAG(loop)
```

`VALID_BOUNDED_LOOP` expands to:

1. one represented natural bound `N`;
2. an initial state at natural zero;
3. exactly one represented state at every index `i <= N`;
4. every non-final indexed state satisfies the guard and has a one-step
   successor at `succ(i)`;
5. the state at `N` satisfies the exit predicate.

Thus `LOOP_TAG` is a view over primitive trace semantics. It contributes no
hidden execution behavior.

The schema permits a loop producer to describe a million iterations using one
primitive step rule plus its bound/guard, rather than textual unrolling.

## Recursion schema

The native file defines:

```text
220020 recursion-object carrier
220021 DOMAIN(recursion,x)
220022 BASE(recursion,x)
220023 DEPENDS(recursion,x,y)
220024 MEASURE(recursion,x,n)
220026 TERMINATION_QU(recursion,q)
220027 WELL_FOUNDED(recursion)
220028 RECURSION_TAG(recursion)
```

For a well-founded recursion, every dependency has a strictly smaller natural
measure and base nodes have no recursive dependencies.

A recursion may be tagged when either:

- `WELL_FOUNDED` is represented exactly; or
- termination is explicitly represented by a QU object.

A QU-tagged recursion does not license an exact completed-output assertion
unless the relevant termination/completeness obligation is independently
discharged.

## Application rule

Every loop/recursion used to support an IsoMax assertion must separately define
its domain-specific state fields, guard/base condition, and step/dependency
relation in primitive logic.

The generic tags are never sufficient support by themselves.
