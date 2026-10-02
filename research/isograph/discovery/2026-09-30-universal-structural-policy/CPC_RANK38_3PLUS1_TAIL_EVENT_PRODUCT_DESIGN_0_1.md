# CPC rank-38 3+1 tail event-product closure design 0.1

**Date:** 2026-10-01  
**Branch:** `research/universal-structural-policy-20260930`  
**Recovered head before design:** `a50a9db31f5e3b2b66e1fd074066502caf77df55`  
**Pinned JSMinSys authority:** `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`

## Purpose

Continue RLC from the first genuine post-monotonicity obstruction.

The repaired proof library leaves five exact rank-38 q classes UNKNOWN. The
lexicographically first is:

- q `4f5444dc55bb5371`
- sequence `44444156666623222242551151531137777677`
- support `[6,6,3,6,5,6,6]`
- P0 to move
- no positive route in the repaired catalog
- no P0 singleton target, hence no applicable legacy target family
- forced-loss boundary `NO_ENABLED_P1_OBLIGATION`
- zero resource failures.

At this rank only four physical events remain. This makes an exact finite
event-product proof possible without importing any solved value.

## Structural family

The rank-38 composition contains three q classes with the same remaining-event
poset shape:

1. q `4f5444dc55bb5371`, support `[6,6,3,6,5,6,6]`;
2. q `60fba7c1d1c84a97`, support `[6,6,3,6,6,5,6]`;
3. q `e7eb0902f1f7984c`, support `[6,6,3,6,6,6,5]`.

Each has:

- one open column of height 3, hence a three-event vertical chain;
- one open column of height 5, hence one independent top event;
- all other columns full.

Call the chain events `A1 < A2 < A3` and the independent event `B`.
The label-free remaining-event poset is therefore:

```
A1 < A2 < A3
B incomparable with A1,A2,A3
```

There are exactly four linear extensions:

```
B,A1,A2,A3
A1,B,A2,A3
A1,A2,B,A3
A1,A2,A3,B
```

Since rank 38 has P0 to move, event positions 1 and 3 are P0 events and
positions 2 and 4 are P1 events.

## Frozen hypothesis

The current obstruction can be classified from the synchronous
`E/P/R/C/N` product restricted to these four remaining events.

For each exact q:

1. reconstruct exact semantic identity;
2. derive the remaining event poset from support only;
3. enumerate the four poset linear extensions;
4. replay each extension with exact first-win stopping;
5. record, at every prefix:
   - support/event accessibility `E`;
   - side/phase `P`;
   - normalized P0/P1 residual antichains `R`;
   - newly enabled singleton/fork/terminal obligations `C`;
   - exact terminal closure / surviving dependency status `N`;
6. partition the four extensions by the controller's first move;
7. determine whether a first move closes every legal continuation for P0,
   closes every continuation against P0, or remains mixed.

This is not an ordinary free-branch value search. The proof domain is the
complete finite set of linear extensions of the exact four-event partial
order already present in the current state.

## Soundness rule

A terminal is accepted only from exact cofactor first-win semantics.

A nonterminal full-board leaf is an exact draw.

For a root action:

- `P0_WIN_ALL_EXTENSIONS` iff every compatible linear extension reaches P0
  terminal before P1 terminal or board exhaustion;
- `P0_NONWIN_ALL_EXTENSIONS` iff no compatible extension reaches P0 terminal
  before a P1 terminal/draw;
- otherwise `MIXED_EXTENSION_OUTCOMES`.

This classification is a finite event-product certificate for this exact
remaining-event poset and exact residual state. It is not a solved-game input.

## Label-free theorem candidate extraction

After exact classification, compare the three 3+1-tail q classes using only
structural fields:

- which residuals contain `A1,A2,A3,B`;
- residual cardinality before each event;
- which event is a completion event for each player;
- whether a completion is preempted by an earlier event in every compatible
  extension;
- whether two physical columns with the same 3+1 event poset differ only
  because their residual-incidence signatures differ.

A reusable theorem candidate may be stated only if the same structural
predicate predicts all three exact q classes. Column labels and sequence
strings may be retained as provenance but not as theorem premises.

## Acceptance

The durable result must include:

- exact bridge for all three q classes;
- exact remaining cells and poset edges;
- all four linear extensions per q;
- exact prefix terminal status and q identity where nonterminal;
- first-move grouping;
- exact W/L/D result of every extension;
- root-action structural disposition;
- residual-incidence signature over `A1,A2,A3,B`;
- cross-state comparison;
- smallest falsifier if one structural predicate fails.

## Boundaries

- No oracle, solved W/D/L, minimax database, opening book, best-move table,
  unrestricted game-tree search, or BSFP solved frontier.
- No support-only exact-state merge.
- No production CPC or BSFP modification.
- The experiment may establish an exact rank-38 finite-tail certificate.
  Generalization beyond the 3+1 remaining-event poset requires a separate
  theorem qualification.
- Do not use UC4A tomography fields unless they reappear as a compact
  label-free relation in this exact event-product analysis.
