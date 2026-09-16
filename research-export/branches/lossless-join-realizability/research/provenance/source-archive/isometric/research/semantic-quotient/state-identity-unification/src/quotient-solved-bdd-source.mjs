import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

// External-source adapter only. BDD labels never enter a structural signature.
// This adapter supports the published standard-board .10 contract, not arbitrary
// BDD layouts. The structural consumer owns variable geometry independently.
export function evaluateBDD(bytes, assignment, variables = 50) {
  if (!Buffer.isBuffer(bytes) || bytes.length === 0 || bytes.length % 9) throw Error('invalid BDD bytes');
  if(typeof assignment!=='bigint'||assignment<0n||!Number.isInteger(variables)||variables<1||variables>255||assignment>=(1n<<BigInt(variables+1)))throw Error('invalid BDD assignment');
  let index = bytes.length / 9 - 1;
  let previous = 0;
  for (let steps = 0; steps <= variables; steps++) {
    if (!Number.isSafeInteger(index) || index < 0 || index >= bytes.length / 9) throw Error('invalid BDD index');
    const offset = index * 9, variable = bytes[offset];
    const low = bytes.readUInt32LE(offset + 1), high = bytes.readUInt32LE(offset + 5);
    if (variable === 0) {
      if (low !== 0 && low !== 1) throw Error('invalid BDD terminal');
      return low;
    }
    // A finite hop bound guards traversal; no variable-order direction is assumed.
    if (variable > variables || variable === previous) throw Error('invalid BDD variable');
    previous = variable;
    index = ((assignment >> BigInt(variable)) & 1n) ? high : low;
  }
  throw Error('BDD traversal did not terminate');
}

export async function openSolvedBDD(directory, maxPly) {
  if (!Number.isInteger(maxPly) || maxPly < 0 || maxPly > 10) throw Error('bounded reader supports ranks 0..10');
  const layers = [], provenance = [];
  for (let ply = 0; ply <= maxPly; ply++) {
    const layer = {};
    for (const kind of ['loss', 'win']) {
      const name = `bdd_w7_h6_${ply}_${kind}.10.bin`;
      const bytes = await readFile(join(directory, name));
      if (!bytes.length || bytes.length % 9) throw Error(`invalid BDD file ${name}`);
      layer[kind] = bytes;
      provenance.push({ name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
    layers.push(layer);
  }
  function query(g, state) {
    if (g.width !== 7 || g.height !== 6 || g.connect !== 4) throw Error('source geometry mismatch');
    if (state.terminal !== null) throw Error('query requires a reachable nonterminal state');
    const layer = layers[state.ply];
    if (!layer) throw Error('unavailable solved rank');
    if(!Number.isInteger(state.ply)||!Array.isArray(state.heights)||state.heights.length!==7||!Array.isArray(state.owners)||state.owners.length!==42)throw Error('invalid source position shape');
    const counts=[0,0];let occupied=0;
    for(let c=0;c<7;c++){
      const h=state.heights[c];if(!Number.isInteger(h)||h<0||h>6)throw Error('invalid source support');
      occupied+=h;
      for(let r=0;r<6;r++){
        const q=state.owners[c*6+r];
        if(r<h){if(q!==0&&q!==1)throw Error('invalid source ownership');counts[q]++;}
        else if(q!==-1)throw Error('source ownership outside support');
      }
    }
    if(occupied!==state.ply||counts[0]!==Math.ceil(state.ply/2)||counts[1]!==Math.floor(state.ply/2))throw Error('source rank/player mismatch');
    let key = 0n;
    for (let c = 0; c < g.width; c++) {
      key |= 1n << BigInt(c * 7 + state.heights[c]);
      for (let r = 0; r < state.heights[c]; r++) {
        if (state.owners[c * g.height + r] === 0) key |= 1n << BigInt(c * 7 + r);
      }
    }
    const assignment = (key << 2n) | BigInt(state.ply % 2 === 0 ? 2 : 0);
    const win = evaluateBDD(layer.win, assignment), loss = evaluateBDD(layer.loss, assignment);
    if (win && loss) throw Error('contradictory solved source');
    const relative = win - loss;
    const winner = relative === 0 ? null : (relative === 1 ? state.ply % 2 : 1 - state.ply % 2);
    return { key: key.toString(), relative, winner, code: winner === null ? '00' : winner === 0 ? '01' : '11' };
  }
  return { query, provenance };
}
