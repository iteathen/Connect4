export function standard7x6RootConfiguration(environment, cpuParallelism) {
  if (!environment || typeof environment !== 'object') throw new TypeError('root configuration requires an environment object');
  if (!Number.isSafeInteger(cpuParallelism) || cpuParallelism < 1) throw new RangeError('availableParallelism must be positive');
  function integer(name, fallback, minimum, maximum) {
    const raw = environment[name];
    if (raw !== undefined && (typeof raw !== 'string' || !/^\d+$/.test(raw))) throw new RangeError(`${name} must be a decimal integer`);
    const value = raw === undefined ? fallback : Number(raw);
    if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new RangeError(`${name} must be in ${minimum}..${maximum}`);
    return value;
  }
  const PREFIX_CLASSES = integer('PREFIX_CLASSES', 4096, 1, Math.floor(0x7fffffff / 42));
  const SPLIT_DEPTH = integer('SPLIT_DEPTH', 3, 1, 42);
  const PRIORITY_PROBE_DEPTH = integer('PRIORITY_PROBE_DEPTH', 0, 0, 42);
  const REQUESTED_WORKERS = integer('SEARCH_WORKERS', 3, 1, 256);
  const ENTRY_CAPACITY = integer('TT_ENTRY_CAPACITY', 8388608, 8, 2 ** 30);
  if (!Number.isInteger(Math.log2(ENTRY_CAPACITY))) throw new RangeError('TT_ENTRY_CAPACITY must be a power of two');
  const TERM_CAPACITY = integer('TT_TERM_CAPACITY', 460000000, 1, 0x7fffffff);
  const PROGRESS_MS = integer('PROGRESS_MS', 15000, 1000, 0x7fffffff);
  return Object.freeze({ PREFIX_CLASSES, SPLIT_DEPTH, PRIORITY_PROBE_DEPTH, REQUESTED_WORKERS,
    ENTRY_CAPACITY, TERM_CAPACITY, PROGRESS_MS, CPU_PARALLELISM: cpuParallelism,
    searchWorkers: Math.min(REQUESTED_WORKERS, cpuParallelism) });
}
