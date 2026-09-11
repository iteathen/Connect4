import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = path.resolve('research/minimax/composition-campaign/a123_compiled_strong_stack.mjs');
let source = fs.readFileSync(sourcePath, 'utf8');
const start = source.indexOf('function compileA123Program');
const end = source.indexOf('function applyAllis', start);
assert(start >= 0 && end > start, 'unable to locate compiled A123 implementation span');

const geometryImpl = String.raw`
const geoSingletonId=new Int16Array(CELLS),geoPairId=new Int16Array(CELLS*CELLS);geoPairId.fill(-1);const geoPairMask=new Array(CELLS*CELLS);for(let a=0;a<CELLS;a++){geoSingletonId[a]=id.get((1n<<BigInt(a)).toString());for(let b=0;b<CELLS;b++){const m=(1n<<BigInt(a))|(1n<<BigInt(b));geoPairMask[a*CELLS+b]=m;const q=id.get(m.toString());if(q!==undefined)geoPairId[a*CELLS+b]=q;}}
const geoAdjResource=Array.from({length:W},()=>new Array(H-1)),geoAdjPairId=Array.from({length:W},()=>new Int16Array(H-1)),geoAdjSingletonId=Array.from({length:W},()=>new Int16Array(H-1));for(let c=0;c<W;c++)for(let lo=0;lo<H-1;lo++){const up=lo+1,a=lo*W+c,b=up*W+c;geoAdjResource[c][lo]=geoPairMask[a*CELLS+b];geoAdjPairId[c][lo]=geoPairId[a*CELLS+b];geoAdjSingletonId[c][lo]=geoSingletonId[b];assert(geoAdjPairId[c][lo]>=0);assert(geoAdjSingletonId[c][lo]>=0);}
function a123Compiled(reqs,h,moves,s,limit=10000){s.allisChecks++;if(!reqs.length){s.allisHits++;return true;}const active=reqBits(reqs),controller=1-(moves&1);if(!s.geoResources){s.geoResources=new Array(64);s.geoBlockers=new Int16Array(64);s.geoPlayable=new Int16Array(W);}let n=0;for(let c=0;c<W;c++)for(let lo=h[c];lo<H-1;lo++){const up=lo+1;s.geoResources[n]=geoAdjResource[c][lo];s.geoBlockers[n]=(up&1)===controller?geoAdjSingletonId[c][lo]:geoAdjPairId[c][lo];n++;}let pn=0;for(let c=0;c<W;c++)if(h[c]<H)s.geoPlayable[pn++]=h[c]*W+c;for(let i=0;i<pn;i++)for(let j=i+1;j<pn;j++){const a=s.geoPlayable[i],b=s.geoPlayable[j],bid=geoPairId[a*CELLS+b];if(bid<0){s.zeroAuthorityPairs++;continue;}s.geoResources[n]=geoPairMask[a*CELLS+b];s.geoBlockers[n]=bid;n++;}s.programBuilds++;s.programCandidates+=n;let union=0n;for(let i=0;i<n;i++)union|=upBits[s.geoBlockers[i]]&active;if(union!==active)return false;s.allisRawFull++;let steps=0;function dfs(cov,used){if(++steps>limit)return false;if(cov===active)return true;const rid=lowBitIndex(active&~cov),bit=1n<<BigInt(rid);for(let i=0;i<n;i++){const closure=upBits[s.geoBlockers[i]];if((closure&bit)===0n)continue;const res=s.geoResources[i];if(res&used)continue;const solved=closure&active;if((solved&~cov)===0n)continue;if(dfs(cov|solved,used|res))return true;}return false;}const found=dfs(0n,0n);s.allisDfsSteps+=steps;if(found)s.allisHits++;return found;}
`;

source = source.slice(0, start) + geometryImpl + source.slice(end);
source = source.replace("kind:'connect4-a123-compiled-strong-stack'", "kind:'connect4-a123-geometry-strong-stack'");
const out = path.join(os.tmpdir(), `a123-geometry-strong-${process.pid}.mjs`);
fs.writeFileSync(out, source);
try {
  await import(pathToFileURL(out).href + `?v=${Date.now()}`);
} finally {
  fs.rmSync(out, { force: true });
}
