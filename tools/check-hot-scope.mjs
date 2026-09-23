import { parse } from 'acorn';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = ['shared-tt.mjs', 'worker.mjs', 'manager.mjs'].map(name =>
  resolve(root, 'components/isometric/execution', name));
files.push(resolve(root, 'components/isometric/rba/coordinate.mjs'));
files.push(resolve(root, 'components/isometric/rba/kernel.mjs'));
files.push(resolve(root, 'components/isometric/rba/front.mjs'));
const cold = new Set(['createTT7x6', 'prepareWorker7x6', 'prepare', 'prepareFrontArena7x6']);
const atomic = new Set(['load', 'store', 'compareExchange', 'exchange', 'add', 'sub', 'wait', 'notify']);
const math = new Set(['imul', 'clz32', 'floor', 'trunc', 'ceil', 'round', 'min', 'max']);
const forbidden = new Set(['NewExpression', 'ObjectExpression', 'ArrayExpression',
  'ArrowFunctionExpression', 'FunctionExpression', 'TemplateLiteral', 'AwaitExpression',
  'YieldExpression', 'SpreadElement', 'RestElement', 'ForOfStatement', 'ForInStatement', 'ThrowStatement']);

// COLD structural detector, not a JS semantics/aliasing proof or JMS seal.
// Resolve statically named transitive helpers, including pinned library calls.
export function auditHotScope(overrides = new Map(), nativeRba = false) {
  const modules = new Map(), checked = new Set(), violations = [], boundaries = new Set();
  function load(file) {
    if (modules.has(file)) return modules.get(file);
    const source = overrides.get(file) ?? readFileSync(file, 'utf8');
    const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
    const functions = new Map(), imports = new Map();
    for (const top of ast.body) {
      const node = top.type === 'ExportNamedDeclaration' ? top.declaration : top;
      if (node?.type === 'FunctionDeclaration') functions.set(node.id.name, node);
      if (top.type === 'ImportDeclaration') for (const item of top.specifiers) {
        imports.set(item.local.name, [resolve(dirname(file), top.source.value), item.imported?.name]);
      }
    }
    const module = { functions, imports }; modules.set(file, module); return module;
  }
  function visitFunction(file, name) {
    const identity = `${file}#${name}`;
    if (checked.has(identity)) return;
    checked.add(identity);
    const module = load(file), fn = module.functions.get(name);
    if (!fn) { violations.push(`${identity}: unresolved function`); return; }
    function bad(node, reason) { violations.push(`${identity}:${node.loc.start.line}: ${reason}`); }
    function visit(node) {
      if (!node || typeof node !== 'object') return;
      if (forbidden.has(node.type)) bad(node, node.type);
      if (node.type === 'Literal' && (typeof node.value === 'string' || typeof node.value === 'bigint')) bad(node, 'hot text/BigInt');
      if (node.type === 'CallExpression') {
        const call = node.callee;
        if (call.type === 'Identifier') {
          if (call.name === 'evaluate' && file === files[1] && name === 'workerStep7x6') {
            if (nativeRba) visitFunction(resolve(root,'components/isometric/rba/kernel.mjs'),'evaluate');
            else boundaries.add('prepared native kernel evaluate');
          }
          else if (module.functions.has(call.name)) visitFunction(file, call.name);
          else if (module.imports.has(call.name)) visitFunction(...module.imports.get(call.name));
          else bad(node, `unresolved call ${call.name}`);
        } else if (call.type === 'MemberExpression' && !call.computed &&
                   ((call.object.name === 'Atomics' && atomic.has(call.property.name)) ||
                    (call.object.name === 'Math' && math.has(call.property.name)))) {
          // Explicitly admitted operators; costs are not assumed free.
        } else bad(node, 'unadmitted/dynamic call');
      }
      for (const [key, value] of Object.entries(node)) {
        if (key === 'loc') continue;
        if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === 'object') visit(value);
      }
    }
    visit(fn.body);
  }
  for (const file of files) for (const name of load(file).functions.keys()) {
    if (!cold.has(name)) visitFunction(file, name);
  }
  return { checkedFunctions: checked.size, violations, openBoundaries: [...boundaries] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = auditHotScope(new Map(),process.argv.includes('--native-rba')); console.log(JSON.stringify(result, null, 2));
  if (result.violations.length) process.exitCode = 1;
}
