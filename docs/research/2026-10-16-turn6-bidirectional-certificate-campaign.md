# Turn-6 bidirectional certificate research — 2026-10-16

**Owner:** `research/semantic-quotient`  
**Research direction:** Josh Oshiro  
**Status:** exact rank-local/bounded short-horizon certificates, one positive P0-winning generator family, **turn-6 eventual P0 win still OPEN**. No IsoGraph logic-authority revision. No oracle-derived candidate input.

## Objective and method

The objective remains **prove P0 first-win existence against all seven P1 moves after `44444`**, not produce all W/D/L values, all optimal P1 loss distances, or a complete early-rank state table.

Use the owner's **two-direction method**:

1. construct compact candidates from residual, control parity, response/deadline geometry and G2 equivalence, subject to fixed budgets;
2. check proposed certificates backward by exact local legality/cofactor/first-win relations and explicit existential/universal action coverage;
3. keep candidate generation, independent reverse verification, oracle validation and full mathematical claim status separate;
4. if a candidate does not close, isolate the missing local guard instead of increasing graph depth.

This campaign does not import solved values into the producer. The 316/1,586 oracle-relative core remains separate previous evidence.

## 1. Exact starting carrier and reply quotient

The independent rule-only `turn6-structural-control.mjs` reconstructs rank-5 `44444`:

```text
support = [0,0,0,5,0,0,0]
side to move = P1
P0 minimal residuals: 24 of length 3; 24 of length 4
P1 minimal residuals: 18 of length 3; 24 of length 4
```

All seven P1 legal action cofactors agree exactly with physical reconstruction and first-win terminal handling. The resulting rank-6 actions fall into four exact structural/mirror classes:

```text
{1,7}, {2,6}, {3,5}, {4}
```

Every rank-6 child has P0 minimum residual size **three**. Therefore a P0 terminal within its next one or two own moves is mathematically impossible regardless of response: at most two P0 ownership events have occurred. The dedicated rank-local control found no contrary action. This is a lower bound on any P0 win, **not** a W/D/L evaluation.

Source and complete action record:

- `research/isograph/discovery/2026-10-16-oracle-compiled-frontier/turn6-structural-control.mjs`
- `TURN6_STRUCTURAL_SNAPSHOT_0_1.json`

## 2. Backward verified finite P1 delay certificate

Instead of expanding a three-move game tree, propose a small *dual defense witness*. Its quantifiers for one fixed rank-6 P1 response state are:

```text
for every P0 first action a:
  provide P1 reply b(a);
  for every P0 second action c:
    provide P1 reply d(a,c);
    check that P0 has no legal immediate terminal action after d
    (or that P1 already terminalized).
```

The independent checker does not choose `b` or `d`, obtain W/D/L labels, or recursively call a solver. It verifies the entire supplied table by physical first-win legality and direct geometric four-in-a-row scans.

The first full four-class **greedy discovery** hit its 400-state budget and was truthfully preserved as `TURN6_THIRD_MOVE_BUDGET_0_1.json`. Isolating center P1 reply 4 yielded a complete exact center-specific witness, then a **direct residual-incidence-ranked candidate** (not an oracle or correctness premise) generated witnesses for replies 1,2,3 without exhaustive defensive selection.

Combined whole-certificate result, checked again from supplied witnesses:

```text
P1 turn-6 classes represented                        4
literal P1 turn-6 actions by reflection              7
P0 first actions exhaustively covered               27
P0 second actions exhaustively covered             180
supplied P1 response witnesses checked             207
direct immediate-P0-win checks                      180
local verifier successor constructions             418
candidate discovery successor constructions        542
combined direct verification in isolated V8        ~11 ms
recursive full-game solver calls                      0
oracle queries                                        0
```

The 542 candidate constructions are the **sum of four bounded independent campaigns** (center 209; each lateral class 111). Each obeyed its own predeclared 400-state cap. Their verified witness tables total four representatives, not a resumption of an unbounded graph.

Three independent negative controls reject missing first actions, illegal defensive actions, and **a legal but losing defense**. The latter is explicit:

```text
P1 turn-6: 1
P0 first:  5
P1 first:  6
P0 second: 2
P1 wrong second: 1 -> P0 can win immediately at 3
P1 certified second: 3
```

Result: for **each** of the seven possible turn-6 P1 responses, P1 possesses a verified short policy that prevents P0 from forcing a terminal on P0's first, second or third subsequent turn.

The implication is exact **within that fixed short horizon**. It does **not** say P1 can draw or win, and does not refute the conjectured eventual P0 forced win.

Reproducer and machine evidence:

- `turn6-third-move-dual.mjs` and `turn6-third-move-guess.mjs`;
- `turn6-third-move-combined-check.mjs`;
- `TURN6_REPLY1_DELAY_CERTIFICATE_0_1.json`, likewise `REPLY2` and `REPLY3`;
- `TURN6_CENTER_ONLY_DELAY_CERTIFICATE_0_1.json`;
- `TURN6_COMPLETE_THIRD_MOVE_DELAY_CERTIFICATE_0_1.json`.

## 3. A positive local P0-winning-region seed

Do not confuse the delay certificate with failure of the underlying P0-winning hypothesis. A **positive** generator exists directly from winning-line geometry.

Consider the legal sequence

```text
444444273
```

at rank 9, **P1 to move**. P0 owns bottom-row columns 2,3,4 and has two different immediately legal winning actions: **column 1** and **column 5**. P1 has no legal immediate terminal. Since P1 can occupy at most one of these distinct legal landing cells on its current turn, at least one remains available, and P0 wins immediately on its next turn.

The independent fork verifier directly checked every one of P1's **six** legal replies, including the first-win condition. This is an exact P0-winning **certificate at that state**, with no perfect-play oracle and no long continuation traversal.

Under the previously established fixed-support P0-favorable residual-order isotony, that q may also seed the claimant-favorable upward cone at the same support (subject to first-win/nonterminal guards). This is a legitimate *sufficient winning-region generator*, not proof of global minimality of the P0 winning frontier.

### One exact backward step

Starting at center-full `444444`, nominate P0 action 2. If P1 next plays:

```text
2, 6, or 7
```

then P0 action 3 produces the exact two-threat fork, and all six subsequent P1 replies are certified. Hence the three rank-8 states

```text
44444422
44444426
44444427
```

are each **P0-winning** by a compact exact one-action-to-fork proof.

The actual candidate family was checked with:

```text
local probed successor constructions 49
local landing/action threat queries 216
exact fork certificate P1 replies      18 (6 for each)
oracle queries                           0
```

Implementation/evidence:

- `turn6-positive-fork-control.mjs`;
- `TURN6_POSITIVE_FORK_GENERATOR_RESULTS_0_1.json` (first single generator);
- `TURN6_POSITIVE_FORK_BACKWARD_RESULTS_0_2.json` (three certified backward parents).

### Why the rank-7 P0 winning proof remains open

After `4444442` (P1 to move), P1 also has legal replies **1,3,5**. The nominated P0 response 3 no longer produces two immediate P0 winning actions in those cases. The universal P1 successor obligation is thus not closed by the *supplied fork family*.

This does not mean any of those three positions are P0 losses. It means the local positive certificate stops there.

## 4. Exact CPC/control interpretation of the three preemptions

The rule-only `turn6-preemption-guards.mjs` independently reconstructs the three actual rank-9 positions after P0 first 2, P1 preemption, P0 next 3.

| P1 preemption | Legal sequence | Remaining P0 singleton target | Gravity predecessors | Current interpretation |
|---|---|---|---:|---|
| 1 | `444444213` | col 5, row 1 | 0 | legal P0 threat; P1 can block col 5 |
| 3 | `444444233` | col 5, row 4 | 3 | latent diagonal threat, currently not legal |
| 5 | `444444253` | col 1, row 1 | 0 | legal P0 threat; P1 can block col 1 |

Rows and columns in the table are **one-based**. For preemptions 1 and 5, P1's named blocker is legal and leaves P0 with **no immediately winning action** on the following turn (checked physically).

For the central preemption 3, the target is `(c=4,r=3)` **zero-based**. At rank `ply=9`, the CPC zero-reservation event count is

```text
N = (7-1)*6 - 9 + 3 + 1 = 31
q0 = ((7-1)*6 + 3) mod 2 = 1  (P1 baseline)
```

Thus this latent completion would need a **guarded odd parity correction** to become P0-owned under that CPC control convention:

```text
rho(c=4,r=3) mod 2 = 1.
```

The equation is only a **necessary baseline-control adjustment for this proposed target**, not proof that the adjustment can be realized. The three lower gravity predecessors, P1's intervention freedom, shared response capacity, first-win deadline and existing reserved events must all remain explicit. An alternative P0 threat or different winning continuation may avoid this target.

Machine record: `TURN6_CPC_PREEMPTION_GUARDS_0_1.json`.

## 5. New precise positive-proof target

The current bottleneck is neither non-mirror G2 equivalence nor verifying a local certificate. It is a **guarded P0-winning predecessor** that closes the three rank-7 P1 alternatives:

```text
P1 b=1: P1 blocks sole immediate right endpoint
P1 b=5: P1 blocks sole immediate left endpoint
P1 b=3: direct fork disabled; latent diagonal target 3 gravity cells above,
         with unfavorable basic CPC phase unless corrected
```

The next certificate candidate should seek a rule-derived P0 response that either:

1. creates another simultaneous independent winning obligation P1 cannot cover;
2. proves a response/deadline/control transformation that **validly** changes the latent diagonal ownership before P1's defense; or
3. transfers into an already certified P0-winning generator at another support.

Do this at the three named obligations **only**. If a proposed generator set does not cover one of them, return the exact missing `(support, generator, P1 action, guard)`, not an exponentially expanding continuation graph.

## Epistemic and qualification boundary

- Exact bounded checks here are reproducible **internal qualification**, not external reproduction or a mechanized formal proof.
- Source was executed in an isolated JavaScript V8 with exact committed module bodies and minimal Node imports shimmed. Full maintained Node 26/Actions testing was **not** executed.
- No oracle labels were used in construction; previous accepted oracle results remain available for later independent *validation* of a complete P0 winning certificate, not as leaves.
- No full 7x6 search, rank-complete frontier expansion, statistical extrapolation, game-theory authority 1.2 modification, solver change or merge occurred.
- The target **P0 win against every P1 turn-6 reply remains unproved**. Preserve this OPEN status.

