const TERMINAL_VALUES = Object.freeze([-1, 0, 1]);

function bit(value, label) {
  if (value !== 0 && value !== 1) throw new RangeError(`${label} must be 0 or 1`);
  return value;
}

export class ExactMtbdd {
  constructor() {
    this.variables = [-1, -1, -1];
    this.low = [-1, -1, -1];
    this.high = [-1, -1, -1];
    this.unique = new Map();
    this.applyCaches = new Map();
    this.restrictCache = new Map();
    this.iteCache = new Map();
  }

  terminal(value) {
    const index = TERMINAL_VALUES.indexOf(value);
    if (index < 0) throw new RangeError('MTBDD terminal must be -1, 0, or 1');
    return index;
  }

  isTerminal(id) {
    return Number.isInteger(id) && id >= 0 && id < TERMINAL_VALUES.length;
  }

  terminalValue(id) {
    if (!this.isTerminal(id)) throw new TypeError('MTBDD node is not terminal');
    return TERMINAL_VALUES[id];
  }

  variableOf(id) {
    return this.isTerminal(id) ? Number.POSITIVE_INFINITY : this.variables[id];
  }

  mk(variable, low, high) {
    if (!Number.isInteger(variable) || variable < 0) throw new RangeError('MTBDD variable must be a nonnegative integer');
    if (!Number.isInteger(low) || low < 0 || low >= this.variables.length) throw new RangeError('invalid MTBDD low child');
    if (!Number.isInteger(high) || high < 0 || high >= this.variables.length) throw new RangeError('invalid MTBDD high child');
    if (low === high) return low;
    if (this.variableOf(low) <= variable || this.variableOf(high) <= variable) {
      throw new RangeError('MTBDD child variable order must strictly increase');
    }
    const key = `${variable}:${low}:${high}`;
    const existing = this.unique.get(key);
    if (existing !== undefined) return existing;
    const id = this.variables.length;
    this.variables.push(variable);
    this.low.push(low);
    this.high.push(high);
    this.unique.set(key, id);
    return id;
  }

  literal(variable, expectedBit) {
    const expected = bit(expectedBit, 'expectedBit');
    const falseTerminal = this.terminal(0);
    const trueTerminal = this.terminal(1);
    return expected === 0
      ? this.mk(variable, trueTerminal, falseTerminal)
      : this.mk(variable, falseTerminal, trueTerminal);
  }

  and(left, right) {
    return this.#applyBinary('and', left, right, (a, b) => (a !== 0 && b !== 0 ? 1 : 0));
  }

  or(left, right) {
    return this.#applyBinary('or', left, right, (a, b) => (a !== 0 || b !== 0 ? 1 : 0));
  }

  max(left, right) {
    return this.#applyBinary('max', left, right, (a, b) => Math.max(a, b));
  }

  min(left, right) {
    return this.#applyBinary('min', left, right, (a, b) => Math.min(a, b));
  }

  restrict(root, variable, assignedBit) {
    if (!Number.isInteger(variable) || variable < 0) throw new RangeError('restrict variable must be a nonnegative integer');
    const assigned = bit(assignedBit, 'assignedBit');
    const cacheKey = `${root}:${variable}:${assigned}`;
    const cached = this.restrictCache.get(cacheKey);
    if (cached !== undefined) return cached;

    let result;
    if (this.isTerminal(root)) {
      result = root;
    } else {
      const current = this.variables[root];
      if (current > variable) {
        result = root;
      } else if (current === variable) {
        result = assigned === 0 ? this.low[root] : this.high[root];
      } else {
        result = this.mk(
          current,
          this.restrict(this.low[root], variable, assigned),
          this.restrict(this.high[root], variable, assigned),
        );
      }
    }
    this.restrictCache.set(cacheKey, result);
    return result;
  }

  ite(predicate, whenTrue, whenFalse) {
    const key = `${predicate}:${whenTrue}:${whenFalse}`;
    const cached = this.iteCache.get(key);
    if (cached !== undefined) return cached;

    let result;
    if (this.isTerminal(predicate)) {
      result = this.terminalValue(predicate) === 0 ? whenFalse : whenTrue;
    } else if (whenTrue === whenFalse) {
      result = whenTrue;
    } else {
      const variable = Math.min(
        this.variableOf(predicate),
        this.variableOf(whenTrue),
        this.variableOf(whenFalse),
      );
      const split = (node, branch) => {
        if (this.variableOf(node) !== variable) return node;
        return branch === 0 ? this.low[node] : this.high[node];
      };
      result = this.mk(
        variable,
        this.ite(split(predicate, 0), split(whenTrue, 0), split(whenFalse, 0)),
        this.ite(split(predicate, 1), split(whenTrue, 1), split(whenFalse, 1)),
      );
    }

    this.iteCache.set(key, result);
    return result;
  }

  evaluate(root, ownershipBits) {
    let node = root;
    while (!this.isTerminal(node)) {
      const variable = this.variables[node];
      const assigned = bit(ownershipBits[variable], `ownershipBits[${variable}]`);
      node = assigned === 0 ? this.low[node] : this.high[node];
    }
    return this.terminalValue(node);
  }

  stats() {
    return Object.freeze({
      terminalCount: TERMINAL_VALUES.length,
      decisionNodeCount: this.variables.length - TERMINAL_VALUES.length,
      totalNodeCount: this.variables.length,
      uniqueDecisionNodeCount: this.unique.size,
    });
  }

  #applyBinary(name, left, right, terminalOperation) {
    let cache = this.applyCaches.get(name);
    if (!cache) {
      cache = new Map();
      this.applyCaches.set(name, cache);
    }
    const key = `${left}:${right}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    let result;
    if (this.isTerminal(left) && this.isTerminal(right)) {
      result = this.terminal(terminalOperation(this.terminalValue(left), this.terminalValue(right)));
    } else {
      const variable = Math.min(this.variableOf(left), this.variableOf(right));
      const split = (node, branch) => {
        if (this.variableOf(node) !== variable) return node;
        return branch === 0 ? this.low[node] : this.high[node];
      };
      result = this.mk(
        variable,
        this.#applyBinary(name, split(left, 0), split(right, 0), terminalOperation),
        this.#applyBinary(name, split(left, 1), split(right, 1), terminalOperation),
      );
    }

    cache.set(key, result);
    return result;
  }
}
