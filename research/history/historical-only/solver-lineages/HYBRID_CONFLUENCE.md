# Historical solver lineage — Hybrid Confluence

**Disposition:** historical-only solver lineage  
**Retired active branch:** `solver/hybrid-confluence`  
**Final observed branch head before retirement:** `3bab0d8989ce8649b13e21bc320ea254c4a0a802`  
**Retirement tombstone head:** `39e5df3aa3e1818acb1adcd1e6e2a69f02046c06`  
**Physical ref status:** retirement-ready; pending deletion of `solver/hybrid-confluence`  
**Successor composition lane:** `solver/sut`

## What this lineage was

Hybrid Confluence was created as a prospective exact-composition solver family.

Its intended concerns were:

- exact proof/result exchange between independently owned solvers;
- shared semantic identity at a solver boundary;
- monotone proof-strength ordering;
- sound handling of partial or stale exact information;
- cancellation/supersession rules;
- bounded controls proving that composition cannot manufacture a false exact result.

## What was actually implemented

No mature Hybrid Confluence kernel was established.

At its final branch-local status:

- there was no unique solver kernel beyond the shared foundation;
- no scheduler or proof-exchange implementation had been qualified;
- no performance claim existed;
- the branch's next step was still to define the exact composition contract.

Therefore retirement does not discard a working solver.

## Questions worth preserving

The branch identified useful questions that remain relevant when SUT eventually combines IsoMax and CUDA-BSFP:

~~~text
What exact semantic object is shared?

What result/proof-strength order is monotone?

When may one solver's exact result close or supersede another solver's work?

How can stale but once-exact information remain sound?

What cancellation is semantically safe?

What bounded controls falsify the composition contract?
~~~

These are now **SUT design inputs**, not reasons to retain a second composition solver family.

## Why it became historical

The owner-selected future composition lane is SUT.

Keeping both SUT and Hybrid Confluence as live composition families would duplicate ownership before either had a mature distinct implementation.

The useful Hybrid questions therefore survive as historical design constraints feeding SUT, while the separate solver identity is retired.

## Preservation rule

Do not recreate Hybrid Confluence as another durable branch merely because SUT needs exact result exchange or scheduling.

Those mechanisms should first be evaluated as part of SUT's explicit composition contract. A genuinely distinct future solver family would require a new owner/topology decision.
