# Input-specialized backward winning-region certificate — first exact root control

**Date:** 2026-10-16
**Owner:** research/semantic-quotient
**Research direction:** Josh Oshiro
**Status:** Exact bounded, independently checked 4x3 Connect-3 P0-win certificate. Global elimination of strategic branching remains OPEN. No logic-authority promotion or solver merge.

## Objective

The exact Connect Four algorithmic core is already constructively complete and may recurse and branch. The preferred, optional improvement is to avoid independently solving every continuation. The earlier support-general symbolic compiler exhausted 60,000 allocated gates while compiling the empty 4x3 Connect-3 board. This experiment instead asks only for **one P0-winning opening and a compact backward-checkable winning-region certificate**, not a value formula for every abstract residual state and not the values of all opening moves.

Frozen plan: research/isograph/discovery/2026-10-16-algorithmic-core/INPUT_SPECIALIZED_WINNING_REGION_PLAN_0_1.md.

Limits: 60,000 producer obligation visits, 300,000 cofactor/ranking/dominance checks, 60,000 winning generators, 300,000 proof edges, 15 seconds. No limits were increased. No WDL oracle or compiled frontier entered candidate construction.

## Candidate construction

The producer is input-specialized-p0-certificate.mjs. It starts only with the actual empty-board support and exact minimal P0/P1 residual antichains. At a P0-to-move node it proposes actions using legal residual geometry and attempts to prove **one**. At a P1-to-move node it must establish P0's win under **every** legal response. It may recursively search candidate alternatives and memoize completed local proofs; these operations are measured honestly.

It also tries reusing already certified winner-region generators at the **same support**. Define P0-favorable qA >= qB when:

- for every P0 requirement rB in qB, some P0 requirement rA in qA is a subset of rB;
- for every P1 requirement tA in qA, some P1 requirement tB in qB is a subset of tA.

Under the exact cofactor and first-win rules, a state favorable to an already certified P0-win generator is also P0-winning. This is a value-monotonicity implication, *not* necessarily an isomorphism of the entire future game. Any reuse must carry the exact support and this guard.

## Independent backward checker and theorem

The separate checker is input-specialized-certificate-checker.mjs. It does **not** import the candidate producer, choose any action, ask solved WDL values, or recursively solve a strategic subtree. It checks each supplied generator:

1. Direct physical replay of its supplied source sequence from the empty board, including gravity, alternating player, absence of premature termination, and independent geometric residual-antichain reconstruction.
2. Exact canonical q, legal action and owner-true/owner-false cofactor, with terminal-first handling.
3. **One** supplied legal action at every P0 node and **all** legal actions at every P1 node.
4. For each nonterminal result, equality with or P0-favorable domination of a supplied **already certified** rank+1 generator.
5. Bottom-up descending occupied-rank checking, root equality, full proof-DAG dependency closure and absence of orphan nodes.

**Proof:** For a node with fewer remaining cells, assume all referenced higher-rank proof generators are P0-winning. Exact q cofactor and the P0-favorable order carry each certified child consequence to the actual child. At a P0 node, its single selected action therefore forces a P0 win; at a P1 node, all possible actions remain P0-winning. Immediate terminal edges must be P0 first wins; draws and P1 first wins are never admitted. Finite decreasing remaining rank closes the induction. The checked empty root is therefore an exact P0 win with a legal winning opening, relative to the qualified residual/order semantics—not a statistical extrapolation.

## Exact experimental result

The producer generated and the independent checker accepted an explicit P0 win at the **empty 4x3 Connect-3 board, opening column 2 (one-based)**.

| Measurement | Count |
|---|---:|
| Certified P0-win generators | 46 |
| Certified proof edges | 72 |
| P0 policy nodes, one chosen move each | 34 |
| P1 universal nodes | 12 |
| P1 legal response actions checked | 38 |
| Immediate terminal P0-win edges | 22 |
| Nonterminal child-reference edges | 50 |
| Exact q successor references | 49 |
| Nonidentical P0-favorable reuse | 1 |
| Legal physical replay events in verification | 230 |
| Distinct supports represented | 36 |
| Producer obligation visits | 51 |
| Producer distinct q explored | 46 |
| Producer candidate action attempts | 72 |
| Failed candidate-proof nodes | 0 |

The complete proof, including every generator, path, policy action, and dependency, is preserved in research/isograph/discovery/2026-10-16-algorithmic-core/INPUT_SPECIALIZED_ROOT_WIN_CERTIFICATE_0_1.json. The independent reverse checker accepted it with 72 direct cofactor tests and zero game-tree solver calls. The rule-guided candidate happened not to backtrack on any P0 choice on this board.

The original **full WDL plus all action-value** q solver, used **only after certificate verification**, agrees that P0 wins. It finds all four openings WDL-optimal using 3,734 unique q states, 7,837 recursive calls and 10,232 action evaluations. This is a *broader computation*: comparing 46 generators with 3,734 states is not a like-for-like runtime or branch-elimination speedup claim.

## Matched control: winner-only, no favorable reuse

Exact same input-specific candidate producer, action ordering and verification but with favorable-order reuse disabled:

| Measurement | With reuse | Without reuse |
|---|---:|---:|
| Certified generator nodes | 46 | 47 |
| Certificate edges | 72 | 73 |
| P0 one-action policy nodes | 34 | 35 |
| Universal P1 actions | 38 | 38 |
| Nonidentical favorable-order hits | 1 | 0 |
| Independently checked outcome | P0 WIN | P0 WIN |

**Only one node and one proof edge** were saved by favorable-order compression in this test. Nearly all savings relative to the full reference come from specializing the exact *claim to prove* and retaining only one selected P0 action, not from a discovered universal nonbranching operator.

### Independent direct-only winning proof saved

The no-dominance candidate was subsequently preserved as a **second
complete exact certificate**, not only a numerical benchmark:

- `INPUT_SPECIALIZED_DIRECT_ONLY_ROOT_CERTIFICATE_0_1.json` contains
  **47 generator nodes and 73 proof edges**.
- All **50 nonterminal references use exact q equality**; zero rely on
  the favorable residual order, while all **38 opponent replies** are
  explicitly covered.
- The independent checker verifies the whole direct-only proof from
  physical source paths, cofactor/terminal guards and descending-rank
  dependencies, so the claim **does not depend on the stronger
  P0-favorable value-isotony lemma**.
- `INPUT_SPECIALIZED_PROOF_CONTROL_RESULTS_0_2.json` is the current
  reproducible PASS record checking **both** the original compressed
  46-node witness and this direct-only 47-node witness, as well as the
  original five adversarial mutations. The original v0_1 record remains
  historical evidence.

This independent direct witness strengthens the first-win conclusion,
while confirming that the single order-quotient compression in the
46-node witness is an optional improvement rather than a proof
prerequisite.

## Five negative controls

The reproducible input-specialized-proof-control.mjs accepted the frozen original certificate and **rejected all five deliberate mutations**:

1. Omitting a P1 reply at an AND node.
2. Replacing one P0 selection by an illegal action.
3. Falsely changing an immediate P0 win to a draw.
4. Forging a proof generator's physical source path.
5. Substituting another **genuinely P0-winning same-support generator** that was *not* dominated by the actual child.

The fifth control is especially important: winning-value agreement at one support does not authorize transfer to incomparable states. Errors and the explicit same-support false-reference counterexample are preserved in INPUT_SPECIALIZED_PROOF_CONTROL_RESULTS_0_1.json. No mutant code was committed.

## Interpretation and next target

**Positive result:** An exact game-outcome claim for a single real input can have a compact candidate-first, backward-verifiable proof, without compiling the universal residual value function and without consulting an exact solved oracle.

**Not proved:** Global elimination of strategic branching. The producer still recursively searched candidate obligations, and the proof has 12 explicit P1 AND nodes with 38 opponent responses. P0 alternatives happened to collapse to one proposed action at each P0 node; the existing q identity and P0 favorable order reused one more node. A single returned certificate does not make that underlying opponent branching disappear.

No generalized Connect-K polynomial-size guarantee, draw certificate, standard 7x6 root solve, independent Node26 benchmark, representation minimality or authority promotion is claimed.

The next *vertical* test is whether the opponent-universal obligations at the 12 P1 nodes can be discharged by a **single guarded, output-sensitive backward inclusion operator** over the generator antichain, rather than materializing all 38 separate continuations. Track genuine quantified checking work and preserve exact first-win/resource/deadline guards. Do not merely wrap the 38 explicit cases in one AND call.

All specialized execution to date is isolated JavaScript V8 on exact committed module source with minimal Node/filesystem/assert shims. The repository research-integrity workflow is separate, and no specialized maintained Node26 or external reproduction is claimed.

## Research-direction correction — search is validation, not the proposed solving method

**Owner clarification, 2026-10-16:** The candidate-first producer in this
experiment **does forward game-continuation search**, albeit limited and
goal-directed. Backward verification substantially reduces the cost of
*confirming* one proposed answer. This is useful qualification evidence and
a counterexample/falsifier generator, **not a candidate implementation of
the preferred nonbranching algorithmic core**. Do not rename search as
"forward discovery" in a proposed solver or count small witness size as
eliminated solving branches.

Retain both 46- and 47-generator certificates and their five negative controls
as **validation fixtures**. They answer whether a later algebraically
*derived* result is correct; they must not supply winning policy choices,
solved labels, or a hidden precomputed decision map to that later method.

The actual optional branch-elimination research target is an exact
rule-derived cofactor/alternating-value **composition law** operating on the
current structural descriptor. A candidate may recursively transform one
descriptor, and may output a set of outcome-equivalent optimal actions.
It may not obtain its move/result by enumerating continuations, guessing a
winning policy through recursive trial-and-error, replaying a stored proof as
a lookup table, or hiding those activities inside a named symbolic operator.
An AND/OR DAG alone does not establish avoided branching; distinguish
its construction work, child support expansion, fan-in and verification work.

**Falsification protocol:** derive an algebraic operator *without* examining
search-generated policy choices or oracle outcomes; afterward compare the
operator's predictions with independent exact q evaluation and the frozen
winning certificates. If it does not close, record the missing algebraic
composition or guard, not a deeper search. Preserve the original complete
recursive/branching q core as an accepted outcome even if this preferred
branch-elimination objective proves unattainable.

This correction supersedes any interpretation of the input-specialized
proof producer as the future solving algorithm. Historical experiment
measurements remain valid for their stated limited scope.
