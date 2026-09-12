function normalizePath(path) {
  if (!Array.isArray(path)) throw new TypeError('explore hint path must be an array');
  const result = path.map((column) => {
    if (!Number.isInteger(column) || column < 0) throw new RangeError(`invalid explore path column ${column}`);
    return column;
  });
  return Object.freeze(result);
}

function normalizeDepth(depth) {
  if (!Number.isInteger(depth) || depth < 1) throw new RangeError('explore hint depth must be a positive integer');
  return depth;
}

function hintKey(path, depth) {
  return `${depth}:${path.join(',')}`;
}

export function createExploreHintService() {
  const queued = [];
  const queuedKeys = new Set();
  const leased = new Map();
  const completed = [];
  let nextHintId = 1;
  const metrics = {
    offered: 0,
    deduplicated: 0,
    leased: 0,
    completed: 0,
  };

  function offer(path, depth) {
    const normalizedPath = normalizePath(path);
    const normalizedDepth = normalizeDepth(depth);
    const key = hintKey(normalizedPath, normalizedDepth);
    if (queuedKeys.has(key)) {
      metrics.deduplicated += 1;
      return null;
    }
    for (const hint of leased.values()) {
      if (hint.key === key) {
        metrics.deduplicated += 1;
        return null;
      }
    }
    const hint = Object.freeze({
      hintId: nextHintId++,
      path: normalizedPath,
      depth: normalizedDepth,
      key,
    });
    queued.push(hint);
    queuedKeys.add(key);
    metrics.offered += 1;
    return hint;
  }

  function take() {
    const hint = queued.shift() ?? null;
    if (!hint) return null;
    queuedKeys.delete(hint.key);
    leased.set(hint.hintId, hint);
    metrics.leased += 1;
    return Object.freeze({ hintId: hint.hintId, path: hint.path, depth: hint.depth });
  }

  function complete(hintId, fragment) {
    const hint = leased.get(hintId);
    if (!hint) throw new Error(`unknown explore hint ${hintId}`);
    leased.delete(hintId);
    const result = Object.freeze({
      hintId,
      path: hint.path,
      depth: hint.depth,
      fragment,
    });
    completed.push(result);
    metrics.completed += 1;
    return result;
  }

  function takeCompleted() {
    return completed.shift() ?? null;
  }

  function clear() {
    queued.length = 0;
    queuedKeys.clear();
    leased.clear();
    completed.length = 0;
  }

  function stats() {
    return Object.freeze({
      ...metrics,
      queued: queued.length,
      leasedNow: leased.size,
      completedQueued: completed.length,
    });
  }

  return Object.freeze({ offer, take, complete, takeCompleted, clear, stats });
}
