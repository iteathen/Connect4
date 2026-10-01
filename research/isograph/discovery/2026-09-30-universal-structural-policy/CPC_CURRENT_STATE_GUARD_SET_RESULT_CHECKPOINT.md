# CPC current-state guard-set result checkpoint

**Date:** 2026-09-30  
**Status:** positive structural result / survival lower-bound extension; no v5 authority  
**Branch:** \`research/universal-structural-policy-20260930\`

## Result

Replacing one selected odd-row guard with the complete current-state guard set materially extends the consumed v4 candidate-6 proof.

At root:

\`4444415666\`

the exact current guard set is:

\[
\Gamma=\{A@1,F@3\}.
\]

The guard-set proof automaton certifies:

\[
\boxed{S_{15}^{\Gamma}(4444415666)}
\]

so candidate 6 constructively survives through relative horizon 15, i.e. through absolute ply 25 from the rank-10 child.

The D15 witness uses no new legal response rule. It composes only previously frozen CPC response edges, odd-row guard renewal, support-lift blocker response, and top-exhaustion phase-debt repair.

## Decisive representation correction

The prior single-guard D15 grammar failed on attacker trigger column 2.

Its useful child:

\`444441566623\`

has simultaneous current guards:

\[
\Gamma=\{A@1,C@1,F@3\}.
\]

Testing A, C, or F individually fails D13.

Retaining the complete set succeeds.

Therefore the prior D15 obstruction was not evidence that another tactical response was missing. It was evidence that one-provenance guard selection discarded load-bearing current-state resources.

## Root D15 guard evolution

Representative exact root transitions include:

- attacker 1 / defender 4:
  \(\{A,F\}\to\{F\}\);
- attacker 2 / defender 3:
  \(\{A,F\}\to\{A,C,F\}\);
- attacker 3 / defender 2:
  \(\{A,F\}\to\{A,B,F\}\);
- attacker 4 / defender 1:
  \(\{A,F\}\to\{F\}\), with the same physical response also satisfying the frozen top-debt repair guard via preserved F;
- attacker 5 / defender 6:
  \(\{A,F\}\to\{A\}\);
- attacker 6 / defender 5:
  \(\{A,F\}\to\{A\}\);
- attacker 7 / defender 7:
  \(\{A,F\}\to\{A,F\}\).

Every child re-enters the D13 guard-set proof class.

## Fresh structural qualification

The guard-set representation/update law was tested independently of the consumed boundary.

Evidence:

\`CPC_GUARD_SET_FRESH_STRUCTURAL_0_1.json\`

Results:

- 21 fresh roots;
- ranks 2, 4, and 8;
- all seven guard columns represented;
- 966 nonterminal exact two-ply transitions checked;
- exact RBA cofactor/replay agreement;
- compact odd-row defender mask update matched direct colored-occupancy reconstruction;
- derived active guard set matched direct reconstruction after every checked transition;
- no oracle, solved value, strong score, consumed prefix, or best-move label used.

Thus simultaneous guard acquisition, preservation, loss, and re-establishment are current-state reconstructible rather than history premises.

## Current reach

Under the current frozen grammar:

- candidate 2: sound lower bound at least 7;
- candidate 3: sound lower bound at least 7;
- candidate 6: sound lower bound at least 17 is separately established by the fresh-process guard-set ladder;
- D19 is currently a computation/resource target, not a logical rejection.

The gap remains lower-bound evidence only. It does not yet establish exact loss remoteness or eliminate candidates 2/3.

## Parity-debt interpretation

This result strengthens the typed parity-control interpretation.

A single scalar/controller tag is too lossy. The current proof resource is a **set of physical guard carriers**, each with:

- column identity;
- current support stage;
- defender ownership on odd rows;
- exact acquisition/retirement under cofactors.

Forced off-pair responses can change which carriers remain available while preserving another carrier that transports the outstanding phase debt.

A literal Nim-sum remains unproved.

## Next target

1. continue the exact guard-set horizon ladder from D17 toward D31 using memory-lean retention;
2. if a logical failure appears, localize that single trigger/resource transition;
3. if only resource exhaustion appears, compress proof machinery without changing theorem semantics;
4. pursue a relative-remoteness theorem and attacker upper/progress closure in parallel;
5. do not license v5 from lower bounds alone.

## Claim discipline

This checkpoint does not claim:

- a complete standard 7x6 solve;
- candidate 6 is yet formally selected by a closed strong-distance theorem;
- a literal Nim-sum;
- exact remoteness;
- v5 authority.
