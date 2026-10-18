# Selected critical-subfamily first-touch defender — guarded source theorem and frozen falsifier plan

**2026-10-18, research-only.** Owner `research/semantic-quotient`. Qualified game semantics remain IsoGraph 1.2. This is a candidate **exact sufficient** source defender theorem to be falsified independently on genuine first-win-stopped original W=7,H=6,K=4 physical games; it is **not** a total Level 2 solver, a claim about `44444` perfect WDL, or a qualified authority revision.

## Original source and canonical motivation

From current orientation-sensitive `q=(h,R0,R1)`, mover `p=sum(h) mod 2` and viable p winning original residual antichain `R_p`, each nonempty G contains original still-vacant physical cells that p must eventually claim to complete its winline. The earlier directed first-touch theorem uses **every** remaining G cell as an urgent obligation. At canonical genuine prefix `44444`, this yields 35 gate cells, 8 immediately legal common blockers, 4 intersections with only presently unreleased cells, and **23 empty intersections**. All 23 have a minimal two-generator intersection obstruction (observation to reproduce from the frozen source-only audit, not an inferred outcome).

The immediate common-blocker rule is needlessly strong: a defender does not have to block G on p's first claim of *any* G cell if it can guarantee blocking G when p first claims one cell from a smaller, preselected mandatory critical subset.

## Candidate guarded theorem

For each original live G∈R_p fix, **from the original source q only**, a nonempty `C(G) ⊆ G` with at least two physical cells; different G may select overlapping but unequal critical sets. G cannot first win unless p eventually claims **all of C(G)**. For each original physical cell x, collect

    T(x) = { G ∈ R_p : x is the lowest remaining C(G) cell in its column }.

For every x with T(x) nonempty require a predetermined single response

    y(x) ∈ (intersection_{G∈T(x)} C(G)) \ {x}

that is unconditionally gravity-safe after p claims x:

(A) y is a root-original gravity frontier cell of a different column, OR

(B) y is precisely the vertical immediate successor of x in its column.

If the guard succeeds for all selected critical-family gates, define a fixed defender policy: after p claims x, if x is the first attacker touch of C(G) for some still-live G, claim y(x); otherwise choose any gravity-legal move. Previously claimed defender cells already kill their G.

**Proof:** Before p moves, for every original G either o already occupies some G cell or p has occupied none of the cells of C(G). This holds initially because all C(G) are original future cells. A newly claimed p cell x in a surviving G's critical C(G) cannot be higher than a previously played critical predecessor in that column: earlier o possession would kill G, and earlier p possession contradicts the invariant after a completed pair. Hence x belongs to T(x). The fixed y(x) is a distinct member of EVERY relevant C(G), not yet p-owned, and not previously o-owned if that G remains viable. Under (A) it is still at its original column frontier while a relevant G is live; under (B) gravity releases it exactly upon p taking x. The single o move at y kills all currently touched critical families. All remaining live G have no p-owned C(G) cells. Induction preserves this invariant for all completed p/o pairs, and p cannot finish any G on its immediate move because at least one distinct unclaimed y∈C(G) remains. If the game ends in a defender win or full-board draw, the p-no-win claim still holds. Thus the guard certifies `NO_FORCED_WIN_p(q)` with no alternative future-game valuation.

Setting C(G)=G recovers the earlier full first-touch theorem. This extension permits **deferred obligations**: p may claim G\C(G) long before the defender must act, without risking a first win. This does **not** authorize arbitrary C(G) choices without the full common-response guard, nor support a winner, DRAW or LOSS claim without the separate source outcome-tier certificates.

## Frozen initial deterministic source subset choices

For each G, in deterministic source order:

1. If G contains at least one two-cell **vertical consecutive pair** `(x,x+W)`, choose the pair having the **highest lower row**, tie by lowest physical id. Both cells belong to original G, and the lower one necessarily releases the upper one. These choices reduce source gate conflicts caused by unneeded earlier G cells.
2. Otherwise, if G contains two **distinct original root frontier** cells in separate columns, choose the lexicographically first such pair. Whichever critical cell p claims first, the other stays gravity-legal until claimed, unless G has already been blocked.
3. Otherwise choose C(G)=G, retaining the original full first-touch guard.

Compute and verify all T(x) intersections and gravity guards from original q only. If any gate has no legal common response, return `INCOMPLETE`; do NOT assert any WDL outcome. Retain full C(G)=G as a **separate** optional comparison/fallback, not an illicit claim from failure of one selected subset.

This deterministic selector is merely one static witness construction, not a completeness argument for possible critical subsets. No static alternative-subset search is performed in this first prototype. Counting source subsets, gate-mask intersections and response candidates is required.

## Independent falsifier, frozen before testing

1. Verify original current q construction for input history: 69 original geometric winlines, gravity, two alternating players, exact first win stopping and original antichain normalization. Compare source guard with unchanged earlier full first-touch guard on *identical q*; `44444` remains `INCOMPLETE` unless new guards all pass.
2. **Only after source theorem + producer are frozen**, implement a separately written physical board replay/terminal checker and a late-horizon adversarial attacker branching validator (the branching is validator-only). For each positive source root, validate the deterministic response is physically legal and p never wins for every physically legal p move where finite exhaustive checking is feasible.
3. Root `NO_FORCED_WIN` alone is not a Level 2 move; for any new root that also passes existing **independent source** opponent dual-overload or one original-action nonloss theorem, compare exact certified best original move to immutable V4 AND earlier first-touch on the SAME q. Freeze source selection before independent recursive physical root/action WDL. No numerical oracle labels in source.
4. Keep counterexamples and failures; return `INCOMPLETE` on missing guards, insufficient physical verification budgets, source contradiction or unresolved implications. Preserve qualified IsoGraph 1.2 and solver branches unchanged.

## Scope of the initial claim

A mathematically **guarded no-forced-win implication** is proposed above. Until separate code and genuine first-win physical falsifier pass, the empirical status and incremental source-position coverage of the proposed selector are **UNTESTED**. It is not yet a source-certified best original move. The canonical 23 two-generator empty intersections specifically motivate leaving some whole-G first-touch obligations safely deferred; they do not prove the canonical root itself meets the new guard.
