# Historical proof boundary: Allis rule evaluator does not supply a flat 7x6 center-win certificate

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Record a source-boundary result that matters for the current guarded affine-clause program.

Victor Allis's 1988 thesis is valuable authority for the nine strategic rules and for parametric no-loss constructions, but it does **not** contain a flat strategic-rule certificate proving the standard 7x6 center opening is a first-player win. The final standard-board result used automated search on top of the strategic evaluator.

Therefore the current searchless/NDC program cannot be completed merely by translating one omitted historical center-win rule set.

## Source result

In Chapter 10 Allis reports that:

- the strategic evaluator found general drawing strategies for boards of six columns or fewer with even height;
- on 7x6, every non-center first move admits a simple Black drawing strategy, extendable to `7 x (2n)`;
- after the center opening `1.d1`, the search tree became too large for the manual approach;
- automated search was introduced for that unresolved center position.

The thesis then develops conspiracy-number search / depth-first methods around the strategic evaluator.

Source: Victor Allis, *A Knowledge-based Approach of Connect-Four: The Game is Solved: White Wins* (1988), Chapter 10 §§10.1-10.3 and following automated-analysis chapters.

## Consequence for this research

The historical nine-rule taxonomy can serve as:

```text
proof lemmas;
regression witnesses;
parametric defensive certificates;
compatibility evidence.
```

It cannot be cited as an already-existing searchless proof of

```text
standard 7x6 center opening -> first-player forced win.
```

That bridge is genuinely new work here.

## What the new closure must add

The historical evaluator's limitation is consistent with the current hypothesis:

```text
flat local rules
-> strong late/midgame evaluation
but
empty/early center position
-> unresolved conditional dependencies.
```

The candidate missing capability is not necessarily a new local rule. It may be the ability to retain and propagate:

```text
guarded affine ownership facts;
monotone blocker clauses;
residual eliminations;
changed CPC/control reservoirs;
resource compatibility;
earliest certification ranks;
completion-before-deadline facts
```

through nested feedback until a terminal proposition appears.

This is exactly the guarded affine-clause NDC kernel now under investigation.

## Proof/evidence boundary

This note is historical/source evidence, not a new Connect-4 theorem. It prevents an incorrect provenance claim: a future searchless 7x6 center proof must be independently derived and qualified rather than attributed to an Allis flat certificate that the thesis did not provide.
