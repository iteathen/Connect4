# Confidence and Bayesian evidence

Confidence attaches to **stable claims**, not documents, branches, or solver implementations.

The confidence system has two lanes.

## 1. Deductive lane

A deductive or guarded-exact claim is not assigned an arbitrary probability such as 0.99 merely to fit a Bayesian table. Its authority comes from a checked derivation/proof and explicit premises/guards.

Record:
- proof status;
- assumptions/guards;
- independent checks or formalization status;
- known counterexamples to stronger variants.

If a guard is uncertain in a particular implementation, that uncertainty belongs to the implementation mapping, not to the theorem itself.

## 2. Empirical/Bayesian lane

Hypotheses, empirical generalizations, performance claims, and candidate semantic rules may carry priors and update with evidence.

Recommended representation uses log-odds or Bayes factors so independent evidence can be composed without repeatedly rounding probabilities. A posterior must be reproducible from the prior plus recorded evidence events.

Do not treat correlated reruns as independent evidence. Record an `independence_group` for each evidence event.

## Separation of dimensions

Do not collapse these into one number:

- truth/confidence of the proposition;
- breadth of tested domain;
- reproducibility;
- implementation usefulness/performance;
- proof/formalization completeness.

For example, `C4-R0009` can be deductively exact while `C4-R0010` says a particular runtime maintenance mechanism is empirically unattractive.

`SCHEMA.json` defines the first machine-readable confidence record. Numeric priors/posteriors remain unset until the corresponding historical evidence has been normalized.
