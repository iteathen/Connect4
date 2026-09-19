import fs from 'node:fs';

export const VARIANTS = ['baseline', 'I1-nonwin', 'I1-nonloss', 'I1-both'];

// Qualification-only transformations. Each candidate starts from production;
// no candidate is stacked on another or installed in the production route.
export async function loadSolver(variant) {
  if (!VARIANTS.includes(variant)) throw new Error('unknown candidate');
  const url = new URL('../../components/isometric/solver.mjs', import.meta.url);
  let source = fs.readFileSync(url, 'utf8').replaceAll('\r\n', '\n');
  const replace = (before, after) => {
    if (source.split(before).length !== 2) throw new Error('candidate seam drift: ' + variant);
    source = source.replace(before, after);
  };
  if (variant.startsWith('I1-')) {
    // Fixed-P0 value coordinates. Only ongoing nodes use these ordinary-value
    // bounds; terminal class -1 must never be confused with exhausted class 0.
    const own = '(state.sideToMove === 0 ? state.p0Class : state.p1Class) === 0';
    const opp = '(state.sideToMove === 0 ? state.p1Class : state.p0Class) === 0';
    const active = variant === 'I1-both' ? 'true' : variant === 'I1-nonwin' ? own : opp;
    const seam = '    if (exact !== null) {\n      if ((exact === 1 && p0NoWin)';
    replace(seam, '    if (this.certificates.size === 0 && !state.isTerminal() && (' + active + ')) {\n' +
      '      p0NoWin ||= state.p0Class === 0;\n' +
      '      p1NoWin ||= state.p1Class === 0;\n    }\n' + seam);
  }
  source = source.replace(/from '(\.[^']+)'/g, (_, relative) => `from '${new URL(relative, url).href}'`);
  return (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).IsoMaxSolver;
}
