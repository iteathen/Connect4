# Revalidation semantic clarifications

This record corrects interpretation of staging research; it does not amend qualified authority 1.2. Canonical research owner: `research/semantic-quotient`. Historical evidence and source hashes remain intact.

The late decomposition report `ISOGRAPH_FULL_DECOMPOSITION_0_1.md`, section 2.3, says that F applies frontier absorption to the mover's residual family. The actual frozen runner applies the test to the **opponent's** family. This is a prose/implementation mismatch. The independent oracle explicitly implemented the latter predicate; agreement therefore validates that declared predicate, not the erroneous prose phrase.

The predicate has a direct interpretation. Let B be the set of legal frontier cells excluding moves that immediately win for the mover. If an opponent residual contains every cell of B, then any nonwinning legal move occupies one of its required cells with the mover's token, blocking that opponent residual. A winning move terminates the game. Thus that particular opponent residual cannot produce a future win along any continuation. When B is empty all legal moves are immediate mover wins; the predicate's empty-set behavior is consistent with that terminal tactical case. No corresponding argument removes the mover's own residual family.

Qualification disposition: the wording is corrected here to “F removes opponent residuals containing all nonwinning legal frontier cells, using the post-R families.” Discovery disposition: this correction does not establish every other RFG or component claim, physical meaning of canonical slots, a universal cubic law, or the scalar formula. Statewise independent comparison separately records its actual bounded coverage.

The RS065–077 history is a typed DAG. RS066 changes a whole-state coordinate, RS071 adds occurrence provenance, and the RS076 grid is regenerated from exact RS074 counts. The whole grid is not a quotient of uniform clip3; its selected presence/clip3/clip2 result is. These distinctions are detailed in `LINEAGE_RS065_RS077.md`.

For owner gauges, swapping depth-histogram labels after compression and swapping complete owner residual descriptors followed by canonicalization are different operations. The first has already reproduced the capacity-P1 to capacity-P0 transport. The second and mover-relative transformation are separately warranted in `MOVER_GAUGE_WARRANT_0_1.json`. Neither gives arbitrary canonical column permutations physical status.
