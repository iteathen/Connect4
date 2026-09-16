function positiveInteger(value, label) {
  if (!Number.isInteger(value) || value < 1) throw new RangeError(`${label} must be a positive integer`);
  return value;
}

function normalizePath(path, columns, maxPathLength) {
  if (!Array.isArray(path)) throw new TypeError('explore hint path must be an array');
  if (path.length > maxPathLength) {
    throw new RangeError(`explore hint path length ${path.length} exceeds ${maxPathLength}`);
  }
  const result = path.map((column) => {
    if (!Number.isInteger(column) || column < 0 || column >= columns) {
      throw new RangeError(`invalid explore path column ${column}; expected 0..${columns - 1}`);
    }
    return column;
  });
  return Object.freeze(result);
}

function normalizeDepth(depth, maxDepth) {
  if (!Number.isInteger(depth) || depth < 1 || depth > maxDepth) {
    throw new RangeError(`explore hint depth must be an integer in 1..${maxDepth}`);
  }
  return depth;
}

function normalizeContextKey(contextKey, maxContextKeyLength) {
  if (contextKey === null || contextKey === undefined) return null;
  if (typeof contextKey !== 'string' || contextKey.length === 0 || contextKey.length > maxContextKeyLength) {
    throw new TypeError(`explore context key must be a non-empty string of at most ${maxContextKeyLength} characters`);
  }
  return contextKey;
}

function hintKey(path, depth, contextKey) {
  return contextKey === null ? `path:${depth}:${path.join(',')}` : `context:${depth}:${contextKey}`;
}

export function createExploreHintService(options = {}) {
  const columns = positiveInteger(options.columns ?? 7, 'explore columns');
  const maxPathLength = positiveInteger(options.maxPathLength ?? 64, 'explore maxPathLength');
  const maxDepth = positiveInteger(options.maxDepth ?? maxPathLength, 'explore maxDepth');
  const historyCapacity = positiveInteger(options.historyCapacity ?? 4096, 'explore historyCapacity');
  const completedCapacity = positiveInteger(options.completedCapacity ?? 64, 'explore completedCapacity');
  const maxContextKeyLength = positiveInteger(options.maxContextKeyLength ?? 1024, 'explore maxContextKeyLength');

  const outstandingById = new Map();
  const activeKeys = new Set();
  const recentKeys = new Set();
  const recentOrder = [];
  const completed = [];
  let nextHintId = 1;
  const metrics = {
    offered: 0,
    deduplicated: 0,
    completed: 0,
    abandoned: 0,
    retiredHistoryEvictions: 0,
    completedResultEvictions: 0,
  };

  function rememberRetiredKey(key) {
    if (recentKeys.has(key)) return;
    if (recentOrder.length >= historyCapacity) {
      const retired = recentOrder.shift();
      recentKeys.delete(retired);
      metrics.retiredHistoryEvictions += 1;
    }
    recentOrder.push(key);
    recentKeys.add(key);
  }

  function retireHint(hint) {
    outstandingById.delete(hint.hintId);
    activeKeys.delete(hint.key);
    rememberRetiredKey(hint.key);
  }

  function offer(path, depth, contextKey = null) {
    const normalizedPath = normalizePath(path, columns, maxPathLength);
    const normalizedDepth = normalizeDepth(depth, maxDepth);
    const normalizedContextKey = normalizeContextKey(contextKey, maxContextKeyLength);
    const key = hintKey(normalizedPath, normalizedDepth, normalizedContextKey);
    if (activeKeys.has(key) || recentKeys.has(key)) {
      metrics.deduplicated += 1;
      return null;
    }
    if (!Number.isSafeInteger(nextHintId) || nextHintId < 1) {
      throw new Error('explore hint ID domain exhausted');
    }
    const hint = Object.freeze({
      hintId: nextHintId++,
      path: normalizedPath,
      depth: normalizedDepth,
      contextKey: normalizedContextKey,
      key,
    });
    outstandingById.set(hint.hintId, hint);
    activeKeys.add(key);
    metrics.offered += 1;
    return Object.freeze({
      hintId: hint.hintId,
      path: hint.path,
      depth: hint.depth,
      contextKey: hint.contextKey,
    });
  }

  function complete(hintId, fragment) {
    if (!Number.isInteger(hintId) || hintId < 1) throw new RangeError(`invalid explore hint ID ${hintId}`);
    const hint = outstandingById.get(hintId);
    if (!hint) throw new Error(`unknown explore hint ${hintId}`);
    retireHint(hint);
    const result = Object.freeze({
      hintId,
      path: hint.path,
      depth: hint.depth,
      contextKey: hint.contextKey,
      fragment,
    });
    if (completed.length >= completedCapacity) {
      completed.shift();
      metrics.completedResultEvictions += 1;
    }
    completed.push(result);
    metrics.completed += 1;
    return result;
  }

  function abandon(hintId) {
    if (!Number.isInteger(hintId) || hintId < 1) throw new RangeError(`invalid explore hint ID ${hintId}`);
    const hint = outstandingById.get(hintId);
    if (!hint) return false;
    retireHint(hint);
    metrics.abandoned += 1;
    return true;
  }

  function takeCompleted() {
    return completed.shift() ?? null;
  }

  function clear() {
    outstandingById.clear();
    activeKeys.clear();
    recentKeys.clear();
    recentOrder.length = 0;
    completed.length = 0;
  }

  function stats() {
    return Object.freeze({
      ...metrics,
      outstanding: outstandingById.size,
      activeKeys: activeKeys.size,
      recentKeys: recentKeys.size,
      seen: activeKeys.size + recentKeys.size,
      completedQueued: completed.length,
      historyCapacity,
      completedCapacity,
    });
  }

  return Object.freeze({ offer, complete, abandon, takeCompleted, clear, stats });
}
