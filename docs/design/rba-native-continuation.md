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
