# IsoMax post-IA DTS 0.1 pass 0.1

**Frozen base:** `4cecb8f4f626bd701548c0951f36cec12d5c4ab5`  
**Model:** `DTS_MODEL_0_1.json`  
**Authority effect:** none; discovery only

## Transition decomposition

The current IsoMax search contains at least four semantically distinct transition families.

### G — game transition

~~~text
q(rank n)
  -- legal action -->
q'(rank n+1)
~~~

Properties:

- changes ordinary q content;
- strictly raises rank;
- first-win may terminate instead of producing q';
- action label is literal at q_o scope and transported at q_r scope.

### P — proof-information refinement

~~~text
(q, proof interval)
  -- new exact/bound evidence -->
(q, refined proof interval)
~~~

Properties:

- q does not change;
- rank does not change;
- task occurrence does not have to change;
- admissible WDL possibilities only shrink.

Current evidence sources include:

- search-derived LOWER0/UPPER0;
- CPC exact/bound interval;
- exact local result;
- exact shared result.

### T — task/control transition

~~~text
task occurrence
  -> ABORTED / RETIRED / SPLIT / CONTINUE
~~~

Properties:

- changes execution occurrence/control state;
- does not create a WDL fact;
- does not create a game edge.

### O — advisory ordering transition

~~~text
q + legal actions
  -> ordered legal-action sequence
~~~

Properties:

- changes evaluation schedule only;
- VALUE is invariant to permutation when all represented legal outcomes are preserved.

These transition families are not one global Transition Isomorph.

## Exact WDL proof-transition carrier

The P-family closes exactly over six nonempty intervals:

~~~text
UNKNOWN       [-1,+1]
UPPER0        [-1, 0]
LOWER0        [ 0,+1]
EXACT_LOSS    [-1,-1]
EXACT_DRAW    [ 0, 0]
EXACT_WIN     [+1,+1]
~~~

A seventh state, empty interval, is contradiction and must fail closed.

The historical packed proof store already represented lower/upper refinement as:

~~~text
lower' = max(lower, evidence_lower)
upper' = min(upper, evidence_upper)
~~~

The new DTS/DP correspondence is an exact six-state possibility-mask encoding:

~~~text
LOSS=100 DRAW=010 WIN=001

UNKNOWN      111
LOWER0       011
UPPER0       110
EXACT_LOSS   100
EXACT_DRAW   010
EXACT_WIN    001
~~~

therefore:

~~~text
refine(current,evidence)
    = current & evidence
~~~

This is representation equivalence, not a claim that the mask implementation
is faster.

The companion mechanical control exhausts all ordered state pairs, plus
associativity/commutativity/idempotence.

## DTS finding A — proof refinement height is two

From UNKNOWN, any strict proof-refinement chain reaches an exact singleton after
at most two strict transitions.

Examples:

~~~text
UNKNOWN -> LOWER0 -> EXACT_DRAW
UNKNOWN -> LOWER0 -> EXACT_WIN
UNKNOWN -> UPPER0 -> EXACT_DRAW
UNKNOWN -> UPPER0 -> EXACT_LOSS
UNKNOWN -> EXACT_*
~~~

Therefore, while a verified q remains resident, a third or later attempted
proof publication that does not follow slot replacement cannot be a new strict
semantic refinement.

It is either:

- semantic stutter;
- contradiction;
- redundant representation work.

Direct-map replacement can physically forget a prior refinement; this is an
execution/cache-residency exception, not semantic proof weakening.

## DTS finding B — CPC close-only fusion

Current realized winner deliberately rejected general CPC-derived weak stores.

That rejection remains valid.

However current source order is:

~~~text
local proof probe
-> non-cutoff weak tightening
-> CPC evaluation
-> CPC interval cutoff/tightening
~~~

So CPC is already paid for on this path.

Suppose the local row is full-q verified:

~~~text
local LOWER0
~~~

and CPC returns:

~~~text
semantic interval [-1,0] = UPPER0.
~~~

The current search may return a zero cutoff after alpha was raised to 0.

DTS says the stronger fact already exists:

~~~text
LOWER0 & UPPER0
    = EXACT_DRAW.
~~~

Dual case is identical.

### Candidate

Use CPC only as a **close-only evidence source**:

~~~text
no local weak row:
    do not publish CPC weak bound

same-direction local weak + CPC weak:
    stutter; do nothing

opposite-direction local weak + CPC weak:
    promote same verified q to exact draw
    publish exact draw through existing shared-exact path

CPC exact:
    preserve existing exact path
~~~

This is new relative to the prior CPC-bound experiment:

- it does not restore broad CPC weak stores;
- it does not add a CPC call;
- it does not add a table;
- it publishes only a strict transition to exact information.

### Falsifier

Reject if opposite-bound CPC closures are too rare to repay the extra checks,
or if JIT/code-size effects raise whole-solve cycles despite useful promotions.

## DTS finding C — repeated shared miss is observation stutter

The all-noncutoff shared fallback can execute:

~~~text
same resident q
same local weak proof
shared exact miss
...
same resident q
same local weak proof
shared exact miss
~~~

No q state changes.
No proof state changes.
No task identity need change.

Under the q+proof view this is a stutter transition.

It is not cost-free:

- shared eligibility;
- slot addressing;
- sequence loads;
- full-key atomic loads;
- value/sequence validation.

Known-hash reuse removes only the duplicate hash.

### Diagnostic before implementation

Count:

~~~text
firstWeakSharedMiss
repeatWeakSharedMiss
laterHitAfterWeakMiss
localProofRefinementAfterMiss
slotReplacementAfterMiss
~~~

If repeated misses are common and later hits after a miss are rare, test a
one-bit resident-weak-state memo:

~~~text
sharedMissObserved = 1
~~~

and skip another optional fallback probe until:

- the local proof state strictly refines; or
- the local direct-map slot is replaced.

This is semantically safe because the fallback probe is optional reuse.
A skipped later exact hit can cost performance, not correctness.

Do not implement before measuring the later-hit rate.

## Transition Isomorph results

### TI-PROOF-SOURCE — supported under semantic-effect view

Search-derived, CPC-derived and shared-exact evidence transitions all implement:

~~~text
same q
+ current possibility set
+ evidence possibility set
-> intersection.
~~~

They are **not** process/cost identical.
Provenance and economics remain residual.

### TI-STUTTER — supported under q+proof view

Repeated same-bound publication and repeated shared miss both preserve q and
proof state.

They are not machine-transition identical; the useful correspondence is:

> machine work with no semantic/proof transition is a candidate waste class.

### TI-GAME-VS-PROOF — rejected

A q move raises rank.
Proof refinement keeps the same q and rank.

### TI-TASK-VS-PROOF — rejected

Task control modifies execution occurrence state and supplies no proof theorem.

## Next execution order

1. instrument proof-transition classes by source;
2. measure CPC opposite-bound exact-draw closures;
3. if material, run CPC close-only A/B;
4. measure repeated shared misses and later-hit-after-miss rate;
5. only then test shared-miss memoization;
6. consider 3-bit mask realization only after profiling says current merge
   branches/stores remain a dominant hot cost.

This ordering follows the owner optimization doctrine: exploit already-computed
structure before adding machinery.
