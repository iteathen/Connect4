# Missing law: perfect-play structural selection

**Claim:** C4-R0052

We can now derive the relevant standard structural objects from the initial signature without importing solved play, and we independently know the distance-sensitive optimal terminal output. The missing theorem is the arrow between them.

## Known structural inputs

- complete geometric line universe and total-domain incidence/derivative structure;
- `Y_cell=Y_line=28` on 7x6;
- canonical width-7 phase path with a unique center;
- unique maximum-impact initially legal event at the same center;
- CPC event-rank/control parity;
- residual WSL requirements and blocker semantics;
- exact maximal-delay support envelope `E_max=38`;
- exact rank-5 exclusion theorem with unique center-stack extremum `38-10=28`;
- exact terminal-subtraction antichain algebra;
- line-hit/product compression evidence, with realizability closure separately identified as missing.

## Desired conclusion

Derive, without solved move-tree recursion or inserting the known strong opening as a premise, that distance-sensitive optimal play:

1. selects the unique center event at the root;
2. preserves the relevant phase/control center through the canonical five-event prefix;
3. certifies the opponent's longest-resistance response as attaining the maximal-delay horizon;
4. leaves exactly the structurally derived 28 terminal-line candidates and proves them all attainable under the same selected semantics.

## Candidate mechanism

Extend NDC certificates with exact time/deadline information:

```text
(prerequisites, guards/resources, consequence, earliest/latest certified rank)
```

AND-composition takes the necessary maximum prerequisite horizon; alternative exact witnesses take the minimum available certified horizon; blocker/response certificates are valid only when their horizons precede the opponent completion deadline. CPC phase displacement is transported over the canonical width path rather than treated only as anonymous parity.

Opponent universality must remain explicit in the certificate/resource system. A hidden minimax recurrence is not an acceptable proof of closure.

## Falsifiers / controls

- 6x7 separates the terminal-support upper `30` from `Y_cell=28`, `Y_line=29`.
- 8x7 satisfies a static scalar equality `minimum survivors = Y_cell = 40`, proving that scalar equality is not the semantic selector.
- the oracle 28-line set intersects `Y_line` in only dimension 2, so the selected set is not simply a basis of the common core.

A successful law must naturally handle these controls without a standard-board special case.
