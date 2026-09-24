# JSMinSys CPC-first IsoMax rebuild qualification

Date: 2026-09-23

Branch: `work/isomax-jsminsys-rebuild`

Connect4 head at qualification control:
`00ce517b2eb2b69c39dde16bfaa8296751ebd0a8`

Pinned JSMinSys:
`25aeb13744a2ed413e660b16b8f3ec2332ae58ec`

GitHub Actions run:
`35927386403`

## Implementation under test

```text
solve7x6
  -> managed JSMinSys file worker
  -> prepareConnect4RbaGeometry(7,6)
  -> connect4RbaFromMoves
  -> prepareConnect4RbaAlphaBeta(RBA_AB_CPC_ONLY)
  -> solveConnect4RbaAlphaBeta
```

The Connect4 layer does not reimplement q, cofactor, canonicalization, CPC,
alpha-beta or exact-cache logic.

The production path does not invoke recursive Four-Front.

## Results

```text
Connect4 tests   57 / 57 pass
JSMinSys tests  122 / 122 pass
```

Maintained controls include:

- independent physical-oracle value and deterministic move agreement on late
  standard 7x6 positions;
- horizontal-reflection caller-frame witness agreement;
- terminal-root first-win handling;
- a genuinely CPC-unresolved rank-28 position that requires alpha-beta traversal;
- zero production Four-Front calls/steps on that traversal;
- pre-aborted managed execution and short deadline cleanup with no invented W/D/L;
- explicit rejection of unsupported multiworker execution.

The first CI attempt failed before checkout because repository policy requires
third-party Actions to be pinned by full commit SHA. The workflow was corrected.

The second implementation test exposed two obsolete tests from the superseded
shared-q/Four-Front execution design. They were replaced with controls for the
new no-fallback contract.

A subsequent control initially used a position that CPC now closes at the root;
that test was corrected to the maintained genuinely CPC-unresolved rank-28
position instead of weakening CPC to satisfy an obsolete node-count assumption.

## Claim boundary

This establishes that the new public IsoMax path is integrated, exact on the
maintained independent-oracle controls, and fail-closed under host interruption.

It does not establish:

- exhaustive correctness over every reachable standard position;
- completion of the empty board;
- a completed standard Fhourstones score;
- multiworker CPC-first execution;
- universal performance superiority;
- NEES-EXTREME or JMS-SEALED conformance.

The standard qualification harness is `tools/bench-fhourstones.mjs`; it now
targets this implementation and requires all four official inputs to return
`EXACT` with expected P0-oriented W/D/L `[1,-1,0,1]`.
