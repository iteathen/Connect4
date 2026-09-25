# Lazy SMP — NEI, QU, and Observation-First Analysis

## Observation-first starting point

The apparent discrepancy is:

```text
semantic view:
    one exact value dependency

runtime view:
    several workers can evaluate overlapping states
```

Do not classify this immediately as waste or duplication defect.

After quantity/scope alignment:

- semantic state identity;
- execution occurrence identity;
- cache occurrence identity;
- scalar value identity;
- move/proof witness identity;

are different questions.

## NEI query table

| Query | Carrier | Result |
|---|---|---|
| worker A vs worker B | execution occurrence | DISTINCT |
| same implementation key in two workers | key content | scoped SAME only under solver key contract |
| local entry vs shared entry | storage occurrence | DISTINCT |
| exact fact content in those entries | key/value fact | may be SAME |
| equal root W/D/L vs move witness | witness | identity-neutral; no collapse |
| equal orderOffset policy | policy | SAME policy can coexist with DISTINCT workers |
| same shared slot at different times | physical occurrence | raw slot id is not identity authority |

## QU topology

```text
exact value dependency
    |
    +-- traversal diversity -------- QU-LSMP-01
    +-- duplicate overlap ---------- QU-LSMP-03
    +-- shared materialization
    |      +-- density/capacity ---- QU-LSMP-02
    |      +-- replacement loss ---- QU-LSMP-06
    +-- worker multiplicity -------- QU-LSMP-05
    +-- first-finisher witness ----- QU-LSMP-04
    +-- key/q mapping -------------- QU-LSMP-07
```

## Important barriers

- duplicate node count != automatically wasted work;
- shared hit != proof all otherwise-overlapping work would finish redundantly;
- fewer shared accesses != automatically faster;
- cache miss != missing semantic knowledge;
- cache overwrite != logical fact retraction;
- equal W/D/L != state identity;
- equal policy != worker identity;
- implementation key equality != q_o/q_r without mapping proof.
