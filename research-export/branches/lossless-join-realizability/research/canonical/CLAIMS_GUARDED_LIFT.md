# Guarded cofactor / controllable-predecessor claims

**Research direction:** Josh Oshiro  
**Formalization / qualification:** OpenAI ChatGPT

This ledger narrows the post-realizability seam. The six-ply A/B control does not expose another missing static board-state field. It exposes a missing **certificate transformer** over structural information already present in the exact residual state.

## C4-R0068 — A/B is not a full-residual collision

**Status:** deductive exact structural classification.

The two six-ply states

```text
A = [6,6,6,6,2,2]
B = [2,6,6,2,6,6]
```

share support, side to move and the retained low-order observations that motivated the collision audit, but their complete positive residual antichains differ. Mixed owner-labelled cofactors merely expose part of that already-present distinction at lower degree. The common d-column continuation does not erase all higher-order residual differences.

Therefore the witness does not justify another exact board-state coordinate. It instead falsifies the completeness of the low-order **certificate observation/generator** used in that experiment.

Solved labels remain controls only.

## C4-R0069 — guarded obligation birth is a controllable predecessor

**Status:** missing law / open composition theorem.

The current target can be written as one quantified transformer:

```text
exists controller certificate/response policy f
  depending only on retained observation alpha
for every admissible opponent intervention y before deadline D:
  exactTransition/cofactor(alpha,y,f(alpha,y))
    entails the same certified obligation/consequence
    OR reaches an independently certified favorable terminal result
while support, resource, precedence and first-win guards remain valid
---------------------------------------------------------------------
CertifiedObligation before D.
```

This is the strategy-level bridge between exact residual algebra and NDC consequence closure. `C4-R0064` supplies the uniform-strategy criterion; `C4-R0065` supplies explicit bounded dependency semantics. The remaining Connect-4 work is to derive the response/certificate family and guards from residual incidence, CPC/support order, typed resources and deadlines without enumerating the physical move tree.

## Current falsification order

For each unresolved instance, stop at the first missing item:

```text
1. retained observation / dependency edge;
2. support or precedence fact;
3. shared resource contract;
4. deadline / first-win fact;
5. existing consequence shape (affine, blocker clause, terminal);
6. only then: genuinely new logical consequence type.
```

This prevents degree drop, residual cardinality, or an attractive new predicate from being promoted simply because the current certificate generator is incomplete.
