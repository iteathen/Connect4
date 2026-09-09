// Guarded derivation from the unchanged owner-pinned baseline. No maintained code changes.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs',import.meta.url),'utf8');
const blob=createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex');
assert.equal(blob,'965c3806c92a7add544dce4777d965b3e12376d6');
function replaceOnce(s,a,b){assert.equal(s.split(a).length,2,`seam mismatch: ${a}`);return s.replace(a,b);}
const manifest={baselineBlob:blob,variants:{}};
for(const mode of ['key','neutral','both']) {
  let s=source;
  s=replaceOnce(s,'this.nodes=0; this.limit=Infinity; this.resetMetrics();','this.relevantLo=BOARD_LO; this.relevantHi=BOARD_HI; this.neutralCols=0;\n    this.nodes=0; this.limit=Infinity; this.resetMetrics();');
  if(mode!=='neutral')s=replaceOnce(s,'addPair(cLo,cHi,mLo,mHi); const kLo=WLO,kHi=WHI;',
    'addPair((cLo & this.relevantLo)>>>0,(cHi & this.relevantHi)>>>0,mLo,mHi); const kLo=WLO,kHi=WHI;');
  if(mode!=='key') {
    s=replaceOnce(s,'const base=moves*WIDTH; let count=0;','const base=moves*WIDTH; let count=0, neutralSeen=0;');
    s=replaceOnce(s,'if((mvLo|mvHi)===0) continue;',
      'if((mvLo|mvHi)===0) continue;\n      if((this.neutralCols & (1<<col))!==0){if(neutralSeen)continue;neutralSeen=1;}');
  }
  s=replaceOnce(s,'export {Solver,winning};','function rootImmediate(cLo,cHi,mLo,mHi,moves){winning(cLo,cHi,mLo,mHi);const lo=WLO,hi=WHI;possible(mLo,mHi);return ((lo&WLO)|(hi&WHI))!==0?Math.trunc((CELLS+1-moves)/2):null;}\nexport {Solver,winning,rootImmediate};');
  writeFileSync(new URL(`./kernel-${mode}.mjs`,import.meta.url),s);
  manifest.variants[mode]=createHash('sha256').update(s).digest('hex');
}
writeFileSync(new URL('./kernel-manifest.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({kind:'build',...manifest}));
