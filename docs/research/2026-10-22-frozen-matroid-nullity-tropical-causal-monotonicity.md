# Frozen additional derived hypothesis: tropical matroid nullity cannot decline under prescribed legal response pairs

**Date:** 2026-10-22 Pacific. **Pretest HEAD:** be7ff78b4c17f82b756853cf370c291cf60818a4. **Owner research direction:** Josh Oshiro. **Status:** symbolic deduction completed before independent checker run; separate from already frozen core H1–H5. This is NOT an empty-board WDL theorem, nor a claim that a source certificate exists in all positions.

With the original October20 physically realizable odd-base Q/vertical-upper mate/trap response policy, fixed source partition matroid M_Q and the historical minimal D residual antichain A_D, set

\[
\Gamma_M(A)=\min_{G\in A} (|G|-r_M(G)), \qquad \Gamma_M(\varnothing)=+\infty.
\]

On an actual D legal **nontrap** move e followed by the physically legal A mate f, if no player has firstwon, the field's Shannon normal form is
\(A'=\min_\subseteq\{G\setminus\{e\}:G\in A,\ f\notin G\}\).
Let \(M'=M/e\setminus f\) be the source matroid minor and assume e was nonloop/independent. The candidate exact no-future-evaluation inequality is

\[
\boxed{\Gamma_{M'}(A')\ \ge\ \Gamma_M(A).}
\]

For every original candidate G with f∉G, its transformed nullity satisfies

\[
|G\setminus\{e\}|-r_{M/e}(G\setminus\{e\})
=
\begin{cases}
|G|-r_M(G) & e\in G,\\
|G|-r_M(G)+1-(r_M(G\cup\{e\})-r_M(G)) & e\notin G,
\end{cases}
\]
so nullity stays the same or grows by one; any blocking deletion discards candidate requirements, and antichain minimization only selects a subset of the transformed family. Thus Γ cannot shrink.

**Semantic caveat:** this is monotonic only under the physically proved response policy and the corresponding matroid minor. It is NOT monotonic under arbitrary moves, alternative player assignment, or an unqualified static hitting-set. Γ can be zero at a state even if the respondent has a win by some other strategy; positive Γ with no source trap does not guarantee a response-player terminal win because progress/finality is not proved.

Independent controls: all finite abstract rank1-partition/loop/free four-site matroids and their antichains, under all e nonloop and f≠e source conditionings; the **one actual genuine original7x6 rank22 witness** from the October20 theorem, original69 legal histories and all nontrap first D/A response pairs. No recursive successor WDL, game-tree enumeration, solved values, dimensions below five used as GAME controls. Count actual source Γ and resulting Γ' and compare against expected source histogram; if it decreases, preserve full counterexample and revoke this candidate.
