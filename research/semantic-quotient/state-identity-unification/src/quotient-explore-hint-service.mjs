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
  const outstandingById = new Map();
  const outstandingByKey = new Map();
  const completed = [];
  let nextHintId = 1;
  const metrics = {
    offered: 0,
    deduplicated: 0,
    completed: 0,
    abandoned: 0,
  };

  function offer(path, depth) {
    const normalizedPath = normalizePath(path);
    const normalizedDepth = normalizeDepth(depth);
    const key = hintKey(normalizedPath, normalizedDepth);
    if (outstandingByKey.has(key)) {
      metrics.deduplicated += 1;
      return null;
    }
    const hint = Object.freeze({
      hintId: nextHintId++,
      path: normalizedPath,
      depth: normalizedDepth,
      key,
    });
    outstandingById.set(hint.hintId, hint);
    outstandingByKey.set(key, hint.hintId);
    metrics.offered += 1;
    return Object.freeze({ hintId: hint.hintId, path: hint.path, depth: hint.depth });
  }

  function complete(hintId, fragment) {
    const hint = outstandingById.get(hintId);
    if (!hint) throw new Error(`unknown explore hint ${hintId}`);
    outstandingById.delete(hintId);
    outstandingByKey.delete(hint.key);
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

  function abandon(hintId) {
    const hint = outstandingById.get(hintId);
    if (!hint) return false;
    outstandingById.delete(hintId);
    outstandingByKey.delete(hint.key);
    metrics.abandoned += 1;
    return true;
  }

  function takeCompleted() {
    return completed.shift() ?? null;
  }

  function clear() {
    outstandingById.clear();
    outstandingByKey.clear();
    completed.length = 0;
  }

  function stats() {
    return Object.freeze({
      ...metrics,
      outstanding: outstandingById.size,
      completedQueued: completed.length,
    });
  }

  return Object.freeze({ offer, complete, abandon, takeCompleted, clear, stats });
}
