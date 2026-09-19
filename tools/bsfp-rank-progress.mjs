// Presentation only. Rank is occupied-cell count; P2 evaluates maxRank down to 0.
// Snapshot times are observations, not exact rank start/completion timestamps.
export function summarizeBsfpRanks(log, { cells = 42, completed = false } = {}) {
  const observations = [];
  let last = null;
  for (const line of log.split(/\r?\n/)) {
    let value;
    try { value = JSON.parse(line); } catch { continue; }
    if (value.kind !== 'compact-hybrid-progress' || !Number.isInteger(value.activeRank)
      || value.activeRank < 0 || value.activeRank > cells || !Number.isInteger(value.completedRanks)
      || value.completedRanks < 0 || value.completedRanks > cells + 1) continue;
    last = value;
    const previous = observations.at(-1);
    if (previous?.rank === value.activeRank) previous.lastObservedMs = value.elapsedMs;
    else observations.push({ rank: value.activeRank, piecesPlayed: value.activeRank,
      emptyCells: cells - value.activeRank, firstObservedMs: value.elapsedMs, lastObservedMs: value.elapsedMs });
  }
  if (!last && !completed) return null;
  const count = completed ? cells + 1 : last.completedRanks;
  const activeRank = completed ? null : last.activeRank;
  return { direction: `${cells} -> 0`, targetRank: 0, totalRanks: cells + 1,
    completedRanks: Array.from({ length: count }, (_, i) => cells - i),
    activeRank, piecesPlayed: activeRank, emptyCells: activeRank === null ? null : cells - activeRank,
    observations, lastSnapshotMs: last?.elapsedMs ?? null, rootCompleted: completed,
    note: 'Ranks have unequal cost; completed-rank fraction is not solve-progress percentage.' };
}
