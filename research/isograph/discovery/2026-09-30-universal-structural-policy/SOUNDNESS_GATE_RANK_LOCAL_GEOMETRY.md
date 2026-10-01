# Soundness gate for universal move-finder research

Date: 2026-09-30

## Non-negotiable target

The move finder must be justified by a sound proof from:

- rank-local information available in the current position;
- fixed board geometry and Connect Four rules;
- gravity / legal frontier structure;
- mover-relative ownership;
- mechanically generated winning-line geometry;
- structural identities already proved independently of the target oracle outcome.

The oracle is validation/falsification only.

## Forbidden proof premises

A candidate may not be justified by:

- solved W/D/L labels;
- oracle action scores;
- best-move labels;
- terminal-distance tables;
- principal variations;
- recursive minimax/negamax/alpha-beta enumeration;
- constants, partitions, thresholds, or action orderings fitted to oracle outcomes;
- cross-position information that is not derivable from the current rank-local structural state.

If an oracle falsifier motivates a new coordinate or ordering, that idea is oracle-informed training evidence until independently derived from rank-local geometry and then tested on a fresh target.

## Required form of every v5+ discriminator

For every structural coordinate or ordering term X(P,a), the research artifact must provide:

1. **Definition from rank-local state and geometry.**
2. **Local derivation** showing why it is relevant to legal future realization or response capacity.
3. **Soundness claim** stated narrowly enough to prove.
4. **Proof or exact finite structural argument** that does not consume solved game values.
5. **Counterexample boundary** describing what the claim does not establish.
6. **Fresh oracle validation** only after the rule is frozen.

## Consequence for the v4 falsifier

The observed advantage of move 6 at prefix `444441566` cannot be repaired by directly ranking:
- fewer due opponent residuals;
- more minimum blocker sets;
- a preferred empirical combination of deadline statistics.

Those are only clues until a rank-local geometric theorem explains why the chosen response-profile order is sound.

The next task is therefore not to fit v5 to move 6. It is to derive the smallest rank-local geometric response-capacity theorem that distinguishes overloaded deadline families while preserving legal response schedulability.

## Research objective

The desired final operator has the form

[
F(P)=\operatorname{Select}(\mathcal{G}(P)),
]

where (mathcal{G}(P)) is computed entirely from the current rank-local geometric state.

The final proof obligation is:

[
F(P) \subseteq \mathcal{A}(P)
]

for every legal nonterminal position (P), where (mathcal{A}(P)) is the project-acceptable perfect-move set (any winning move; else any drawing move; else any maximal-loss-delay move).

The right side may be used to validate the theorem after the left side is independently derived, but not to define or repair the left side.
