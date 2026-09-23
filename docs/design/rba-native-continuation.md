# RBA-native shared-q continuation

Owner review of `178e152d` corrects the no-fallback boundary: production must
not switch representation or solver. RBA-native dependency traversal is allowed
and required. This plan supersedes the one-shot-only interpretation in the
earlier removal checkpoint; the removed private search stack stays removed.

Implement in two qualified units:

1. Extend the existing shared TT with P0-oriented monotone q intervals and
   per-action intervals. All publication remains under the existing transaction.
   Exact or provably irrelevant actions retain scalar evidence without a child
   pin. Unresolved edges own the existing generation-checked child reference.
   Manager intersects child evidence, applies max/min Bellman bounds, propagates
   partial bounds through every incoming edge, and releases irrelevant edges.
   Root value closure and caller-frame deterministic witness remain distinct.
   Qualify conflicts, nonexact propagation, one-child branches, shared-child
   ownership, retirement, and reflected/tied root witnesses before integration.
2. Query four fronts at every claimed nonterminal RBA q. Preserve state/action
   intervals. Cofactor only relevant unresolved legal actions, canonicalize the
   native eight-word children, and publish them to the same TT. BRANCH is valid
   at one worker and at one child; reservoir advice cannot prohibit this primary
   continuation. Terminal results and exact action bounds need no child q.
   Qualify against independent physical oracles, reflection and first-win;
   measure whole-operation cycles and bounded official Fhourstones inputs.

No alternate game representation, second q authority, hidden capacity growth or
increased 120-second deadline. Failed/incomplete boundary construction remains
explicit because its partial arena is not a valid completed four-front artifact.
Completed but nonclosing queries continue via RBA dependencies. Depth zero is an
explicit interval baseline [LOSS,WIN], not an uninitialized action-front query.

Full child-front retention/recomposition is a separate unimplemented route.
This unit preserves scalar query consequences in shared q/action bounds; it
does not claim to retain or share full four-front arenas across workers.

## Closed RBA execution invariant

`solve7x6()` invokes external `fromMoves7x6()` once. After that boundary every q,
transition, task, publication, claim and resume uses native RBA. No execution
module may import ingress, replay/history reconstruction, a physical oracle,
or legacy state. Action labels 0..6 transport physical moves, not board state.
The transitive structural checker rejects these dependencies and hot calls to
the cold geometric basis builder; negative mutations protect those prohibitions.

The deterministic basis satisfies
`P(S + cell) = distinct nonempty { requirement - cell : requirement in P(S) }`.
The implementation restores global shape-ID order through a prepared bitset.
Reflection permutes those same IDs. Independent geometric derivation checks the
mapping over randomized supports and all legal actions. Geometric line readers
are poisoned in tests exercising cofactor, reflection and front construction.

A q row carries its immutable derived basis and size under the same generation,
reference and execution lifetime as its eight identity words. Basis content is
not additional q identity: equal canonical support determines the same basis.
New insertion writes that basis once; TT hits reuse it. These scalar publication
writes and the larger fixed table are measured costs, not claimed zero-copy.
No bulk copy API, board replay, or 69-line rescan occurs in native execution.
Workers query the carried TT basis directly; front construction derives child
bases from its parent basis in prepared per-depth arena regions.
