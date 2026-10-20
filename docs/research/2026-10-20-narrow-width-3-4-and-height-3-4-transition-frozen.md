# Frozen falsifier: K4 width-5 -> width-4 -> width-3 and corresponding height thresholds

Date: 2026-10-20. Research ownership: research/semantic-quotient. User hypothesis: below width5, defensive pairing/owner constraints change phase at W=4 and again at W=3; ask what analogous changes occur across H=4 and H=3, without assuming W and H are interchangeable under gravity. Standard original Connect-K K4, alternating P0/P1, first-win-stopped. This is original source geometry plus source-proved no-win policy analysis; external solved-board WDL used only AFTER freezing shape tests.

## Exact original K4 directional filtration

For arbitrary positive W,H define x=max(0,W-3), y=max(0,H-3). Original finite (nonwrapped) physical K4 windows split as
 HORIZONTAL=H*x; VERTICAL=W*y; ASCENDING=x*y; DESCENDING=x*y,
 total L(W,H,4)=H*x+W*y+2*x*y.
Expected explicit width breakpoints when H>=4:
- W<=3: x=0, only vertical K4 lines, W*y of them, no cross-column line
- W=4: x=1, exactly ONE 4-column K4 horizontal span and ONE diagonal strand interval per vertical starting level; local H/V/diagonal interaction switches on
- W=5: x=2, two overlapping K4-column windows, sharing 3 columns, and twice as many diagonal crossing windows per level.
Height thresholds:
- H<=3: y=0: only H*x HORIZONTAL lines, possibly present even at H=1; no vertical/diagonal lines
- H=4: y=1: first vertical/diagonal K4 windows become feasible, so mixed interaction switches on if W>=4
- H=3 is NOT by itself a disappearance of all possible K4 lines if W>=4; it removes vertical+diagonal, not horizontal. Because gravity is along HEIGHT, W and H symmetry of the LINE COUNTS does not imply equivalence of legal game/control timing.

## Source coupling graph with no solved labels

Compute original bipartite incidence graph whose vertices are only SOURCE original physical cells incident to genuine K4 lines and genuine K4 line-nodes; edges represent line membership. Ignore geometrically irrelevant original cells when counting nontrivial connected components and separately report isolated cells. Predict:
- for W<K, H>=K: exactly W vertically separated nontrivial line/cell components (each column one component), independent of H≥K; source game still has globally coupled alternating turns, so DO NOT infer product WDL from graph decomposition alone.
- for W>=K, H<K: exactly H horizontally separate line/cell components (each row one component), yet GRAVITY couples different row components via support dependencies, so NOT independent subgames.
- for W>=K, H>=K: incidence graph likely connected (test, do not assume), indicating four-direction cross-column and cross-row coupling. Test K4 W3..7,H1..8, compare W=3/4/5 at H6 and H=2/3/4/5 at W7.
- for W<K and H<K: no K4 lines; all physical sites isolated; every legal full history DRAW.

Build source response-policy facts independently:
- W<=3,K4: established both-player vertical adjacent-pair adaptive response => exact DRAW for ANY H (including H>=4). This is a TRUE strategy-sufficient result, not static geometry alone.
- W=4, H>=4: mixed H/V/diagonal terms make pure vertical pair non-guaranteeing; published W4,H4..13 DRAW is EXTERNAL WDL not supplied by current narrow-width SOURCE proof.
- H<=3, W>=4: horizontal-only; a historical unqualified two-sided horizontal pairing argument has an actual first-move/spare-column legality gap; do NOT claim universal source DRAW simply from H<K. Existing source-certified exact DRAW covers H=1 and certain even-area H<K, K<=W<=2K-1; other cases may be INCOMPLETE despite published labels.
- For W>=K=4 and H>=4, calculate original common-K-span intersection count C=max(0,8-W) until W>=8; values W4=4,W5=3,W6=2,W7=1,W8=0. No value law follows just from C.

## Freeze physical and algebra checks

1. Independently generate all true original horizontal/vertical/rising/falling 4-cell windows on W1..8,H1..8, and separately calculate exact formula counts. Preserve a proof via finite start-position enumeration that x,y factors are correct.
2. Independently build physical original-cell/genuine-line bipartite incidence graph for W1..8,H1..8, report nontrivial component counts and isolated physical cells. Also compute rank over GF2 and rationals of the true line-cell incidence where affordable; record actual origin guard.
3. For the critical W3/4/5 at H6 and H2/3/4/5 at W7, calculate response-pair vertical quotas J and unmatched U from h all zero and from P0 first center opening, and exactly when r+1 legal follower runs out. Contrast H parity effects; do not assert eventual WDL.
4. Only AFTER source output is frozen compare with published 52 known K4 empty-root solved labels (W4..12,H4..13) plus existing mathematically proved W3 (any H) DRAW. Keep genuinely unpublished cells null; NEVER infer total K4 dimension->WDL from descriptive graph.
5. Search for a verified new consequence: does graph disconnection match an exact rule-only both-player strategy? Verify explicit legal alternating gravity mirror/vertical pairing, and if attempting horizontal mirror acknowledge pre-move support and spare-column counterexamples.
6. Treat observed phase shift as a change in the interaction/response algebra, not a quantum literal or automatic sign change. A true game-WDL claim requires a fully legal, all-adaptive P0/P1 response/first-terminal theorem without strategic future-game valuing. No solver change, no authority1.2 change.

Prediction of graph connectivity is only a FROZEN hypothesis. Negative results and surprising isolated-cell behavior must be preserved.
