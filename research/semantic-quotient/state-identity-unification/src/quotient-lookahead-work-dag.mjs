import {
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
  assertTacticalCode,
  assertWdlValue,
  tacticalExactValue,
  tacticalForcedColumn,
} from './quotient-negamax-domain-contract.mjs';

function assertGraph(graph) {
  if (!graph || typeof graph !== 'object' || !graph.spec) throw new TypeError('work DAG requires a quotient graph');
  const { columns, rows } = graph.spec;
  if (!Number.isInteger(columns) || columns < 1 || columns > 7) throw new RangeError('work DAG graph columns must be in 1..7');
  if (!Number.isInteger(rows) || rows < 1 || columns * rows > 64) throw new RangeError('work DAG graph rows/cell count are invalid');
  if (!Number.isInteger(graph.stateCount) || graph.stateCount < 1) throw new RangeError('work DAG graph stateCount must be positive');
  if (!Number.isInteger(graph.rootId) || graph.rootId < 0 || graph.rootId >= graph.stateCount) {
    throw new RangeError(`work DAG root ${graph.rootId} is outside graph state count ${graph.stateCount}`);
  }
  if (!(graph.edgeBuffer instanceof SharedArrayBuffer) && !(graph.edgeBuffer instanceof ArrayBuffer)) {
    throw new TypeError('work DAG graph edgeBuffer must be an ArrayBuffer');
  }
  if (!(graph.tacticalBuffer instanceof SharedArrayBuffer) && !(graph.tacticalBuffer instanceof ArrayBuffer)) {
    throw new TypeError('work DAG graph tacticalBuffer must be an ArrayBuffer');
  }
  if (!Array.isArray(graph.centerOrder) || graph.centerOrder.length !== columns) {
    throw new TypeError('work DAG graph centerOrder must enumerate columns');
  }
}

function graphViews(graph) {
  assertGraph(graph);
  const edges = new Int32Array(graph.edgeBuffer);
  const tactical = new Int16Array(graph.tacticalBuffer);
  if (edges.length !== graph.stateCount * graph.spec.columns) {
    throw new Error(`work DAG edge buffer length ${edges.length} does not match ${graph.stateCount * graph.spec.columns}`);
  }
  if (tactical.length !== graph.stateCount) {
    throw new Error(`work DAG tactical buffer length ${tactical.length} does not match ${graph.stateCount}`);
  }
  return Object.freeze({ edges, tactical });
}

function assertStateId(graph, stateId) {
  if (!Number.isInteger(stateId) || stateId < 0 || stateId >= graph.stateCount) {
    throw new RangeError(`work DAG state ${stateId} is outside 0..${graph.stateCount - 1}`);
  }
}

function edgeAt(graph, edges, stateId, column) {
  const child = edges[stateId * graph.spec.columns + column];
  if (!Number.isInteger(child) || child < QN_ILLEGAL || child >= graph.stateCount) {
    throw new Error(`work DAG edge ${stateId}/${column} has invalid target ${child}`);
  }
  return child;
}

function tacticalAt(graph, tactical, stateId) {
  const code = tactical[stateId];
  assertTacticalCode(code, graph.spec.columns);
  return code;
}

function legalColumns(graph, stateId, views) {
  assertStateId(graph, stateId);
  const code = tacticalAt(graph, views.tactical, stateId);
  const forcedColumn = tacticalForcedColumn(code, graph.spec.columns);
  if (forcedColumn >= 0) {
    if (edgeAt(graph, views.edges, stateId, forcedColumn) === QN_ILLEGAL) {
      throw new Error(`forced work-DAG column ${forcedColumn} is illegal at state ${stateId}`);
    }
    return [forcedColumn];
  }
  const result = [];
  for (const column of graph.centerOrder) {
    if (!Number.isInteger(column) || column < 0 || column >= graph.spec.columns) {
      throw new Error(`invalid work-DAG center-order column ${column}`);
    }
    if (edgeAt(graph, views.edges, stateId, column) !== QN_ILLEGAL) result.push(column);
  }
  return result;
}

function decisionNodeKey(stateId, decisionDepth) {
  return `${stateId}:${decisionDepth}`;
}

export function estimateQuotientWork(graph, stateId, probeDepth = 2, memo = new Map()) {
  const views = graphViews(graph);
  return estimateQuotientWorkWithViews(graph, views, stateId, probeDepth, memo);
}

function estimateQuotientWorkWithViews(graph, views, stateId, probeDepth, memo) {
  assertStateId(graph, stateId);
  const maxDepth = graph.spec.columns * graph.spec.rows;
  if (!Number.isInteger(probeDepth) || probeDepth < 0 || probeDepth > maxDepth) {
    throw new RangeError(`probeDepth must be an integer in 0..${maxDepth}`);
  }
  const key = `${stateId}:${probeDepth}`;
  const prior = memo.get(key);
  if (prior !== undefined) return prior;
  const code = tacticalAt(graph, views.tactical, stateId);
  if (tacticalExactValue(code) !== null) {
    memo.set(key, 1);
    return 1;
  }

  const forcedColumn = tacticalForcedColumn(code, graph.spec.columns);
  if (forcedColumn >= 0) {
    const child = edgeAt(graph, views.edges, stateId, forcedColumn);
    const cost = child === QN_TERMINAL_WIN
      ? 2
      : 1 + estimateQuotientWorkWithViews(graph, views, child, probeDepth, memo);
    memo.set(key, cost);
    return cost;
  }

  if (probeDepth === 0) {
    memo.set(key, 1);
    return 1;
  }

  let cost = 1;
  for (const column of legalColumns(graph, stateId, views)) {
    const child = edgeAt(graph, views.edges, stateId, column);
    if (child >= 0) cost += estimateQuotientWorkWithViews(graph, views, child, probeDepth - 1, memo);
    else if (child === QN_TERMINAL_WIN) cost += 1;
  }
  if (!Number.isSafeInteger(cost) || cost < 1) throw new RangeError(`work estimate overflow at state ${stateId}`);
  memo.set(key, cost);
  return cost;
}

export function buildQuotientLookaheadWorkDag(graph, splitDepth, options = {}) {
  const views = graphViews(graph);
  if (!Number.isInteger(splitDepth) || splitDepth < 1) throw new RangeError('splitDepth must be a positive integer');
  const maxDepth = graph.spec.columns * graph.spec.rows;
  if (splitDepth > maxDepth) throw new RangeError(`splitDepth ${splitDepth} exceeds ${maxDepth} cells`);
  const probeDepth = options.probeDepth ?? 2;
  if (!Number.isInteger(probeDepth) || probeDepth < 0 || probeDepth > maxDepth) {
    throw new RangeError(`probeDepth must be an integer in 0..${maxDepth}`);
  }

  const nodesByDepth = Array.from({ length: splitDepth + 1 }, () => []);
  const nodeByKey = new Map();
  const parentRefs = new Map();

  function makeNode(stateId, decisionDepth, path) {
    const key = decisionNodeKey(stateId, decisionDepth);
    const node = { key, stateId, decisionDepth, path, exactValue: null, actions: [] };
    nodeByKey.set(key, node);
    nodesByDepth[decisionDepth].push(node);
    return node;
  }

  makeNode(graph.rootId, 0, []);

  for (let decisionDepth = 0; decisionDepth <= splitDepth; decisionDepth += 1) {
    const layer = nodesByDepth[decisionDepth];
    for (let index = 0; index < layer.length; index += 1) {
      const node = layer[index];
      const code = tacticalAt(graph, views.tactical, node.stateId);
      const exact = tacticalExactValue(code);
      if (exact !== null) {
        node.exactValue = assertWdlValue(exact, `work-DAG tactical value for state ${node.stateId}`);
        continue;
      }

      const forcedColumn = tacticalForcedColumn(code, graph.spec.columns);
      if (decisionDepth === splitDepth && forcedColumn < 0) continue;
      const childDecisionDepth = forcedColumn >= 0 ? decisionDepth : decisionDepth + 1;
      if (childDecisionDepth > splitDepth) continue;

      for (const column of legalColumns(graph, node.stateId, views)) {
        const child = edgeAt(graph, views.edges, node.stateId, column);
        if (child === QN_TERMINAL_WIN) {
          node.actions.push({ column, terminalValue: 1, childStateId: null, childKey: null });
          continue;
        }
        if (child === QN_ILLEGAL) throw new Error(`legal work-DAG move ${node.stateId}/${column} resolved illegal`);
        const childKey = decisionNodeKey(child, childDecisionDepth);
        node.actions.push({ column, terminalValue: null, childStateId: child, childKey });
        parentRefs.set(childKey, (parentRefs.get(childKey) ?? 0) + 1);
        if (!nodeByKey.has(childKey)) {
          makeNode(child, childDecisionDepth, [...node.path, column]);
        }
      }
    }
  }

  const estimateMemo = new Map();
  const tasks = [];
  const taskStateIds = new Set();
  for (const node of nodesByDepth[splitDepth]) {
    const code = tacticalAt(graph, views.tactical, node.stateId);
    const exact = tacticalExactValue(code);
    if (exact !== null) {
      node.exactValue = assertWdlValue(exact, `work-DAG frontier tactical value for state ${node.stateId}`);
      continue;
    }
    if (tacticalForcedColumn(code, graph.spec.columns) >= 0) continue;
    if (taskStateIds.has(node.stateId)) throw new Error(`duplicate frontier task state ${node.stateId}`);
    taskStateIds.add(node.stateId);
    const estimate = estimateQuotientWorkWithViews(graph, views, node.stateId, probeDepth, estimateMemo);
    const fanIn = parentRefs.get(node.key) ?? 1;
    const priority = estimate * (1 + Math.log2(fanIn + 1));
    if (!Number.isFinite(priority) || priority < 0) throw new RangeError(`invalid work priority ${priority}`);
    tasks.push({
      stateId: node.stateId,
      nodeKey: node.key,
      path: Object.freeze([...node.path]),
      depth: splitDepth,
      estimate,
      fanIn,
      priority,
    });
  }
  tasks.sort((a, b) => b.priority - a.priority || b.estimate - a.estimate || a.stateId - b.stateId);

  return Object.freeze({
    kind: 'connect4-quotient-lookahead-work-dag-v4',
    splitDepth,
    probeDepth,
    columns: graph.spec.columns,
    rootId: graph.rootId,
    rootKey: decisionNodeKey(graph.rootId, 0),
    nodesByDepth: nodesByDepth.map((layer) => Object.freeze(layer.map((node) => Object.freeze({
      key: node.key,
      stateId: node.stateId,
      depth: node.decisionDepth,
      path: Object.freeze([...node.path]),
      exactValue: node.exactValue,
      actions: Object.freeze(node.actions.map((action) => Object.freeze({ ...action }))),
    })))),
    tasks: Object.freeze(tasks.map((task) => Object.freeze({ ...task }))),
    uniqueNodes: nodeByKey.size,
    frontierTasks: tasks.length,
    transposedParentRefs: [...parentRefs.values()].filter((count) => count > 1).length,
  });
}

export function reduceQuotientLookaheadWorkDag(plan, frontierValues, columns) {
  if (!plan || plan.kind !== 'connect4-quotient-lookahead-work-dag-v4') {
    throw new TypeError('reducer requires a v4 quotient work DAG');
  }
  if (!Number.isInteger(columns) || columns !== plan.columns) {
    throw new RangeError(`reducer columns ${columns} do not match plan columns ${plan.columns}`);
  }
  if (!Array.isArray(frontierValues)) throw new TypeError('frontierValues must be an array');

  const taskByState = new Map(plan.tasks.map((task) => [task.stateId, task]));
  if (taskByState.size !== plan.tasks.length) throw new Error('work DAG contains duplicate task state IDs');
  if (frontierValues.length !== plan.tasks.length) {
    throw new Error(`frontier value count ${frontierValues.length} does not match task count ${plan.tasks.length}`);
  }

  const values = new Map();
  const seenFrontier = new Set();
  for (const entry of frontierValues) {
    if (!Array.isArray(entry) || entry.length !== 2) throw new TypeError('frontier value must be [stateId, wdl]');
    const [stateId, value] = entry;
    if (!Number.isInteger(stateId) || !taskByState.has(stateId)) throw new Error(`unexpected frontier state ${stateId}`);
    if (seenFrontier.has(stateId)) throw new Error(`duplicate frontier state ${stateId}`);
    seenFrontier.add(stateId);
    assertWdlValue(value, `frontier value for state ${stateId}`);
    values.set(taskByState.get(stateId).nodeKey, value);
  }

  for (let depth = plan.splitDepth; depth >= 0; depth -= 1) {
    const layer = [...plan.nodesByDepth[depth]].sort((a, b) => b.path.length - a.path.length || b.stateId - a.stateId);
    for (const node of layer) {
      if (values.has(node.key)) continue;
      if (node.exactValue !== null) {
        values.set(node.key, assertWdlValue(node.exactValue, `exact work-DAG value for state ${node.stateId}`));
        continue;
      }
      if (node.actions.length === 0) throw new Error(`unresolved work DAG node ${node.stateId} at decision depth ${depth}`);
      let value = -2;
      for (const action of node.actions) {
        let score;
        if (action.terminalValue !== null) {
          score = assertWdlValue(action.terminalValue, `terminal work-DAG action ${node.stateId}/${action.column}`);
        } else {
          if (!values.has(action.childKey)) throw new Error(`missing child value ${action.childStateId}/${action.childKey}`);
          score = -values.get(action.childKey);
          assertWdlValue(score, `work-DAG child score ${node.stateId}/${action.column}`);
        }
        if (score > value) value = score;
      }
      values.set(node.key, assertWdlValue(value, `reduced work-DAG value for state ${node.stateId}`));
    }
  }

  if (!values.has(plan.rootKey)) throw new Error('work DAG reduction did not resolve root');
  const root = plan.nodesByDepth[0].find((node) => node.key === plan.rootKey);
  if (!root) throw new Error('work DAG root node missing from layer zero');
  const rootActions = Array(columns).fill(null);
  for (const action of root.actions) {
    let score;
    if (action.terminalValue !== null) score = action.terminalValue;
    else {
      if (!values.has(action.childKey)) throw new Error(`missing root child value ${action.childStateId}`);
      score = -values.get(action.childKey);
    }
    rootActions[action.column] = assertWdlValue(score, `root action ${action.column}`);
  }
  return Object.freeze({
    rootWdl: assertWdlValue(values.get(plan.rootKey), 'reduced root WDL'),
    rootActions: Object.freeze(rootActions),
    values,
  });
}
