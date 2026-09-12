const TACTICAL_NONE = -100;
const TACTICAL_DRAW = -101;
const TACTICAL_LOSS = -102;
const TACTICAL_IMMEDIATE_BASE = 64;

function exactTacticalValue(code) {
  if (code >= TACTICAL_IMMEDIATE_BASE) return 1;
  if (code === TACTICAL_LOSS) return -1;
  if (code === TACTICAL_DRAW) return 0;
  return null;
}

function legalColumns(graph, stateId) {
  const { columns } = graph.spec;
  const edges = new Int32Array(graph.edgeBuffer);
  const tactical = new Int16Array(graph.tacticalBuffer);
  const code = tactical[stateId];
  if (code >= 0 && code < columns) return [code];
  const result = [];
  for (const column of graph.centerOrder) {
    if (edges[stateId * columns + column] !== -2) result.push(column);
  }
  return result;
}

export function estimateQuotientWork(graph, stateId, probeDepth = 2, memo = new Map()) {
  const key = `${stateId}:${probeDepth}`;
  const prior = memo.get(key);
  if (prior !== undefined) return prior;
  const tactical = new Int16Array(graph.tacticalBuffer);
  if (exactTacticalValue(tactical[stateId]) !== null || probeDepth <= 0) {
    memo.set(key, 1);
    return 1;
  }
  const edges = new Int32Array(graph.edgeBuffer);
  let cost = 1;
  for (const column of legalColumns(graph, stateId)) {
    const child = edges[stateId * graph.spec.columns + column];
    if (child >= 0) cost += estimateQuotientWork(graph, child, probeDepth - 1, memo);
    else if (child === -1) cost += 1;
  }
  memo.set(key, cost);
  return cost;
}

export function buildQuotientLookaheadWorkDag(graph, splitDepth, options = {}) {
  if (!Number.isInteger(splitDepth) || splitDepth < 1) throw new RangeError('splitDepth must be a positive integer');
  const probeDepth = options.probeDepth ?? 2;
  const edges = new Int32Array(graph.edgeBuffer);
  const tactical = new Int16Array(graph.tacticalBuffer);
  const nodesByDepth = Array.from({ length: splitDepth + 1 }, () => []);
  const nodeByState = new Map();
  const parentRefs = new Map();

  const root = { stateId: graph.rootId, depth: 0, path: [], exactValue: null, actions: [] };
  nodesByDepth[0].push(root);
  nodeByState.set(graph.rootId, root);

  for (let depth = 0; depth < splitDepth; depth += 1) {
    for (const node of nodesByDepth[depth]) {
      const exact = exactTacticalValue(tactical[node.stateId]);
      if (exact !== null) {
        node.exactValue = exact;
        continue;
      }
      for (const column of legalColumns(graph, node.stateId)) {
        const child = edges[node.stateId * graph.spec.columns + column];
        if (child === -1) {
          node.actions.push({ column, terminalValue: 1, childStateId: null });
          continue;
        }
        if (child < 0) continue;
        node.actions.push({ column, terminalValue: null, childStateId: child });
        parentRefs.set(child, (parentRefs.get(child) ?? 0) + 1);
        if (nodeByState.has(child)) continue;
        const childNode = {
          stateId: child,
          depth: depth + 1,
          path: [...node.path, column],
          exactValue: null,
          actions: [],
        };
        nodeByState.set(child, childNode);
        nodesByDepth[depth + 1].push(childNode);
      }
    }
  }

  const estimateMemo = new Map();
  const tasks = [];
  for (const node of nodesByDepth[splitDepth]) {
    const exact = exactTacticalValue(tactical[node.stateId]);
    if (exact !== null) {
      node.exactValue = exact;
      continue;
    }
    const estimate = estimateQuotientWork(graph, node.stateId, probeDepth, estimateMemo);
    const fanIn = parentRefs.get(node.stateId) ?? 1;
    tasks.push({
      stateId: node.stateId,
      path: Object.freeze([...node.path]),
      depth: splitDepth,
      estimate,
      fanIn,
      priority: estimate * (1 + Math.log2(fanIn + 1)),
    });
  }
  tasks.sort((a, b) => b.priority - a.priority || b.estimate - a.estimate || a.stateId - b.stateId);

  return Object.freeze({
    kind: 'connect4-quotient-lookahead-work-dag-v2',
    splitDepth,
    probeDepth,
    rootId: graph.rootId,
    nodesByDepth: nodesByDepth.map((layer) => layer.map((node) => Object.freeze({
      stateId: node.stateId,
      depth: node.depth,
      path: Object.freeze([...node.path]),
      exactValue: node.exactValue,
      actions: Object.freeze(node.actions.map((action) => Object.freeze({ ...action }))),
    }))),
    tasks: Object.freeze(tasks.map((task) => Object.freeze({ ...task }))),
    uniqueNodes: nodeByState.size,
    frontierTasks: tasks.length,
    transposedParentRefs: [...parentRefs.values()].filter((count) => count > 1).length,
  });
}

export function reduceQuotientLookaheadWorkDag(plan, frontierValues, columns) {
  const values = new Map(frontierValues);
  for (let depth = plan.splitDepth; depth >= 0; depth -= 1) {
    for (const node of plan.nodesByDepth[depth]) {
      if (values.has(node.stateId)) continue;
      if (node.exactValue !== null) {
        values.set(node.stateId, node.exactValue);
        continue;
      }
      if (node.actions.length === 0) throw new Error(`unresolved work DAG node ${node.stateId}`);
      let value = -2;
      for (const action of node.actions) {
        const score = action.terminalValue !== null
          ? action.terminalValue
          : -values.get(action.childStateId);
        if (!Number.isInteger(score)) throw new Error(`missing child value ${action.childStateId}`);
        if (score > value) value = score;
      }
      values.set(node.stateId, value);
    }
  }

  const root = plan.nodesByDepth[0][0];
  const rootActions = Array(columns).fill(null);
  for (const action of root.actions) {
    rootActions[action.column] = action.terminalValue !== null
      ? action.terminalValue
      : -values.get(action.childStateId);
  }
  return Object.freeze({ rootWdl: values.get(plan.rootId), rootActions, values });
}
