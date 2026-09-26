# Reuse CPC's no-immediate-win proof in recursive transitions

Owner clarification: leave CPC win detection intact; remove redundant immediate
win detection in the transition hot path. Earlier opposite interpretation was
stopped during tests, with no benchmark or product promotion. Its edits were
removed before this candidate. No performance claim comes from that attempt.

Control: JSMinSys no-draw candidate 14d6b8f32ebf7ec938a21940f1cebec63ca3f912.
Candidate: experiment/cpc-owned-win-20260926, exact committed SHA captured in
pre-launch manifest. Harness: Connect4 7a1a4166. JSMinSys main and the production
Connect4 dependency pin remain unchanged.

CPC_EXACT returns before searchCpcOnly expands children. The remaining path
therefore has no playable mover singleton. Its two cofactor calls (forced and
ordinary) use connect4RbaCofactorKnownNonwinningHeight, which omits binary-search
win detection but retains stone-count board exhaustion and the same native
residual update. The generic checked entry delegates to that shared body after
testing wins; no duplicated residual transition implementation. Root witness,
external ingress and optional Four-Front path retain checked transitions.

CPC unchanged, no new mode branch or allocation in recursive execution. The
catalog charges both checked wrapper and common implementation, with explicit
conservative source envelopes rather than fabricated Intel instruction costs.
Tests cover guarded checked-vs-nonwinning transition equality (>200 comparisons),
actual call-site routing, first-win priority, independent solver oracles,
Lazy SMP, cofactor absorption, and configured geometry. Catalog/geometry pass.

Four-worker ABBA, four blocks, input 45461667, mask 7, capacities 65,536,
30-second timeout. Complete process-cycle accounting and immutable raw capture.
Compare with the no-draw control in the same blocks. If promising, repeat the
screen and retain separate node diagnostics; no automatic production promotion.
