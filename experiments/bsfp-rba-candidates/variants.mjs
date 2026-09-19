import fs from 'node:fs';

export const VARIANTS = ['baseline', 'B3-stream'];
export function moduleUrl(variant) {
  if (!VARIANTS.includes(variant)) throw new Error('unknown candidate');
  const url = new URL('../../components/bsfp/rba-wdl-reference.mjs', import.meta.url);
  let source = fs.readFileSync(url,'utf8').replaceAll('\r\n','\n');
  if (variant === 'B3-stream') {
    const before = `    const projected = [];
    for (const b of right) {
      charge();
      projected.push(a & b);
      if (metrics) metrics.projectionQueries++;
    }
    const local = normalizeBoundary(projected, true, metrics);`;
    const after = `    const start = performance.now(), local = [];
    for (const b of right) {
      charge();
      const value = a & b;
      if (metrics) metrics.projectionQueries++;
      if (value < 0n) throw new RangeError('boundary mask must be nonnegative bigint');
      let dominated = false;
      for (const other of local) if (subset(value, other)) { dominated = true; break; }
      if (dominated) continue;
      for (let i = local.length - 1; i >= 0; i--) if (subset(local[i], value)) local.splice(i, 1);
      local.push(value);
    }
    local.sort(numericOrder);
    if (metrics) {
      metrics.normalizationCalls++;
      metrics.normalizationMs += performance.now() - start;
    }`;
    if (source.split(before).length !== 2) throw new Error('RBA candidate seam drift');
    source=source.replace(before,after);
  }
  source=source.replace(/from '(\.[^']+)'/g,(_,p)=>`from '${new URL(p,url).href}'`);
  return 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
}
export const loadVariant = variant => import(moduleUrl(variant));
