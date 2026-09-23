// TEST-ONLY ranked-DAG kernel. These are execution fixtures, not Connect Four
// residuals, proof certificates, a production fallback, or solve evidence.
export function prepare(w, data) {
  const graph = data.graph;
  w.graphCount = new Uint32Array(graph.length);
  w.graphValue = new Uint32Array(graph.length);
  w.graphRank = new Uint32Array(graph.length);
  w.graphChild = new Uint32Array(graph.length * 7);
  w.graphAction = new Uint32Array(graph.length * 7);
  w.die = data.die ? 1 : 0; w.hang = data.hang ? 1 : 0;
  w.dieInLock = data.dieInLock ? 1 : 0;
  for (let q = 1; q < graph.length; q++) {
    const node = graph[q];
    w.graphRank[q] = node.rank; w.graphValue[q] = node.value ?? 0;
    w.graphCount[q] = node.children?.length ?? 0;
    for (let i = 0; i < w.graphCount[q]; i++) {
      w.graphChild[q * 7 + i] = node.children[i][1];
      w.graphAction[q * 7 + i] = node.children[i][0];
    }
  }
}
function close(w, id) {
  if (w.graphValue[id]) return w.graphValue[id];
  const minimize = w.graphRank[id] & 1;
  let best = minimize ? 4 : 0;
  for (let i = 0; i < w.graphCount[id]; i++) {
    const value = close(w, w.graphChild[id * 7 + i]);
    if (minimize ? value < best : value > best) best = value;
  }
  return best;
}
function priority(action) { return action < 3 ? (3 - action) * 2 - 1 : (action - 3) * 2; }
export function evaluate(t, q, w, expose) {
  if (w.dieInLock) {
    while (Atomics.compareExchange(t.control, 0, 0, w.owner) !== 0) {}
    process.exit(23);
  }
  if (w.die) process.exit(19);
  if (w.hang) { for (;;) {} }
  const id = t.keys[q * 42 + 41];
  if (w.graphValue[id]) return w.graphValue[id];
  if (!expose) {
    const value = close(w, id);
    let first = 7;
    for (let i = 0; i < w.graphCount[id]; i++) {
      const action = w.graphAction[id * 7 + i];
      if (close(w, w.graphChild[id * 7 + i]) === value && priority(action) < first) {
        first = priority(action); w.witness = action;
      }
    }
    return value;
  }
  w.count = w.graphCount[id];
  for (let i = 0; i < w.count; i++) {
    const child = w.graphChild[id * 7 + i];
    w.keys[i * 42] = w.graphRank[child] << 21;
    w.keys[i * 42 + 41] = child;
    w.actions[i] = w.graphAction[id * 7 + i];
  }
  return 4;
}
