# Connect-4 predicate / axiom ledger

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Compact index of the current calculus. This is not a specification and does not change acceptance status.

Status terms:

- **PRIMITIVE** — supplied by domain semantics.
- **PROVED** — exact derived theorem/operator.
- **CERTIFICATE** — exact consequence once guards are certified.
- **CANDIDATE** — structurally motivated closure, completeness unproved.
- **VALIDATION** — oracle/falsifier only.
- **MISSING** — unresolved load-bearing law.

## Canonical layers

| Layer | Canonical object | Status | Key point |
|---|---|---|---|
| Domain | gravity chains, alternation, K=4, first-win | PRIMITIVE | C4-0001/C4-0006 |
| Difference 1 | `partial=1+T` | PROVED | adjacent disagreement / response edge |
| Difference 2 | `partial^2=1+T^2` | PROVED | distance-two parity; translated mod-2 path Laplacian |
| Difference 3 | `partial^3=1+T+T^2+T^3` | PROVED | Connect-4 window incidence |
| 2-D coupling | `X^3=Y^3=0`, derived diagonals | PROVED | diagonals are not independent axioms |
| Incidence | `B`, `ker B`, `im B` | PROVED | total-domain ranks known |
| Quotients | `Q_axis`, `Q_phase` | PROVED | total-domain ranks known |
| Static core | `Y_cell`, `Y_line` | PROVED | standard 7x6 gives 28/28 |
| Static classifier | `P_phase <- L -> C -> U_axis` | PROVED | type-A4 interval decomposition |
| Owner potential | binary `q`, correction `rho` | PROVED where premises certified | CPC/phase/seams are projections of one potential |
| Domain wall | neighbor XOR field | PROVED | any four-line win = three zero disagreement edges |
| Response transport | `n(F)`, parity, `tau(F)` | PROVED for certified response fragment | support/CPC/phase are projections of same consumption vector |
| Pure-followup | safe derivative word, no `000`/`111` | PROVED defensive substrate | not a winning selector |
| Top defect | `R_c=2k_c+u_c` | PROVED algebraic substrate | neutral pair depths commute; top defect is boundary event |
| Affine proof facts | `q(v)=p`, `q(u)+q(v)=b` | CERTIFICATE | only exact split facts are XOR |
| Blocker clauses | `OR_(v in B)(q(v)+p)=1` | CERTIFICATE | blocker kills requirement iff `B subseteq R` |
| Deadline | certification rank / completion-before-deadline | CERTIFICATE | timing is load-bearing |
| Min-max proof timing | `max` prerequisites, `min` proof alternatives | CANDIDATE | use only when quantifier semantics justify it |
| Response capacity | obligations vs response slots | CANDIDATE | double threat is smallest exact deficiency |
| Solved database | W/D/L, distance, witnesses | VALIDATION | discover/falsify only |

## Exact derivative hierarchy for K=4

The Connect-K classification proves that K=4 has no hidden one-dimensional linear factor beyond

```text
partial -> partial^2 -> partial^3.
```

Indeed, for general K with `K=2^s m`, `m` odd,

```text
1+T+...+T^(K-1)
 = (1+T)^(2^s-1) * S_m(T)^(2^s).
```

The window is a pure derivative iff K is a power of two. Connect-4 is the smallest nontrivial case with the complete cubic chain.

Primary note:
`docs/research/2026-09-14-connect-k-derivative-classification.md`

## Total-domain static formulas

Let

```text
a=(W-3)_+
b=(H-3)_+
p=min(W,3)
q=min(H,3)
d=min(2,ab).
```

Then

```text
L             = H*a + W*b + 2ab
rank(B)       = WH-pq+d
dim ker(B)    = 3ab-d
rank(Q_axis)  = a+b
rank(Q_phase) = min(a,ab)+min(2,ab,a+floor((b-1)_+/2))
Y_cell        = rank(B)-rank(Q_axis)
Y_line        = dim ker(B)-rank(Q_phase).
```

The old 4x4/4x5 anomalies are boundary degeneracies of these generated maps, not extra axioms.

## Ownership / terminal normal form

Use

```text
q=0 -> first player
q=1 -> second player.
```

For a line `(v0,v1,v2,v3)`:

```text
anchor=q(v0)
e0=q(v0)+q(v1)
e1=q(v1)+q(v2)
e2=q(v2)+q(v3).
```

A win by player `p` is exactly

```text
anchor=p
(e0,e1,e2)=000.
```

Thus both players use one geometric terminal predicate; player identity is one affine lift bit.

## Important non-equivalences

Do not reintroduce these mistakes:

```text
pair blocker != XOR in general
pure-followup safety != forced win
static 28 != game value merely by equality
top-defect charge != winner sign
finite solved agreement != all-board proof
diagonal direction != independent primitive algebra
```

## Current unresolved frontier

The linear/static geometry is no longer the main missing layer. Remaining work lives in:

```text
certificate generation
+ blocker-clause feedback
+ support/resource causality
+ deadline closure
+ response-capacity stopping
-> decisive win bit
-> player/sign lift
-> structural-magnitude bridge.
```

See `docs/research/2026-09-14-missing-axiom-register.md` for the unresolved items.
