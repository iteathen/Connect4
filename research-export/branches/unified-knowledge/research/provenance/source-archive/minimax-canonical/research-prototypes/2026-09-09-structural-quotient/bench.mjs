// Paired cold-TT exact solves; compiler and admission charged, no per-node policy.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import os from 'node:os';
import {parse} from './domain.mjs';
import {compile,makeGeometry} from './requirements.mjs';
import {Solver as Base} from '../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';
import {Solver as Key,rootImmediate} from './kernel-key.mjs';
import {Solver as Neutral} from './kernel-neutral.mjs';
import {Solver as Both} from './kernel-both.mjs';
const pow=Number(process.argv[2]??19),repeats=Number(process.argv[3]??5);
assert(Number.isInteger(pow)&&pow>=15&&pow<=22);assert(Number.isInteger(repeats)&&repeats>=1);
const modes=['base','compileTax','key','neutral','full','rawFull'],g=makeGeometry(),text=readFileSync(new URL(process.env.C4_CORPUS??'./corpus.json',import.meta.url),'utf8'),corpus=JSON.parse(text);
const cases=corpus.cases.filter(c=>!process.argv[4]||c.cohort===process.argv[4]);assert(cases.length);
const prepared=new Map(cases.map(c=>[c.id,parse(c.seq)]));
const n=2**pow,arena={keyLo:new Uint32Array(new SharedArrayBuffer(n*4)),keyHi:new Uint32Array(new SharedArrayBuffer(n*4)),val:new Uint8Array(new SharedArrayBuffer(n)),ctrl:new Int32Array(new SharedArrayBuffer(n*4)),owner:new Uint8Array(new SharedArrayBuffer(n))};
const solvers={base:new Base(15,false),key:new Key(15,false),neutral:new Neutral(15,false),both:new Both(15,false)};
for(const s of Object.values(solvers)){Object.assign(s,arena);s.size=n;s.mask=n-1;}
const emit=x=>console.log(JSON.stringify(x));
emit({kind:'environment',node:process.version,v8:process.versions.v8,cpu:os.cpus()[0]?.model,arch:process.arch,os:os.platform(),reportedParallelism:os.availableParallelism(),workers:1,pow,repeats,modes,ttBytes:n*14,oneArena:true,corpusSha256:createHash('sha256').update(text).digest('hex'),kernelManifest:JSON.parse(readFileSync(new URL('./kernel-manifest.json',import.meta.url),'utf8')),limit:20000000,rootAdmission:'common numeric immediate-win guard before compiler; original solveBits guard retained below',time:'totalMs=admission+compile+search; clearMs recorded separately; geometry/arena/parser initialized outside'});
function clear(){const t=performance.now();for(const v of Object.values(arena))v.fill(0);for(const q of Object.values(solvers)){q.resetMetrics();q.limit=20000000;}return performance.now()-t;}
function trial(c,mode) {
  const clearMs=clear(),start=performance.now(),win=rootImmediate(c.cLo,c.cHi,c.mLo,c.mHi,c.moves);
  if(win!==null)return {score:win,nodes:0,hits:0,writes:0,totalMs:performance.now()-start,compileMs:0,searchMs:0,clearMs,route:'immediate',limited:false};
  let cp=null,compileMs=0,q=solvers.base;
  if(mode!=='base'){const t=performance.now();cp=compile(prepared.get(c.id),g,mode!=='rawFull');compileMs=performance.now()-t;}
  const key=cp?.erasedCells>0,neutral=cp?.neutralColumns>=2;
  if((mode==='full'||mode==='rawFull')&&cp.draw)return {score:0,nodes:0,hits:0,writes:0,totalMs:performance.now()-start,compileMs,searchMs:0,clearMs,route:'drawCertificate',limited:false};
  if(mode==='key'&&key)q=solvers.key;
  if(mode==='neutral'&&neutral)q=solvers.neutral;
  if(mode==='full'||mode==='rawFull')q=key?(neutral?solvers.both:solvers.key):(neutral?solvers.neutral:solvers.base);
  if(cp){q.relevantLo=cp.relevantLo;q.relevantHi=cp.relevantHi;q.neutralCols=cp.neutralCols;}
  const t=performance.now();let score=null,limited=false;
  try{score=q.solveBits(c.cLo,c.cHi,c.mLo,c.mHi,c.moves)||0;}catch(e){if(e!==911)throw e;limited=true;}
  const end=performance.now();return {score,nodes:q.nodes,hits:q.ttHits,writes:q.writeSuccess,totalMs:end-start,compileMs,searchMs:end-t,clearMs,route:Object.keys(solvers).find(k=>solvers[k]===q),limited};
}
// Fair warm-up: exercise ALL physical bodies, even when the no-op fast path
// would have routed a development root into only the baseline body.
const development=corpus.cases.find(c=>c.seq==='663152175');
for(let round=0;round<2;round++)for(const [name,q] of Object.entries(solvers)){
  clear();q.relevantLo=0xffffffff;q.relevantHi=0xffffffff;q.neutralCols=0;
  assert.equal(q.solveBits(development.cLo,development.cHi,development.mLo,development.mHi,development.moves),-4);
  emit({kind:'warmKernel',round,name,nodes:q.nodes});
}
const branchWarm=corpus.cases.filter(c=>c.cohort==='opportunity').slice(0,8);
for(let round=0;round<48;round++)for(const c of branchWarm){
  const cp=compile(parse(c.seq),g);
  for(const q of Object.values(solvers)){clear();q.relevantLo=cp.relevantLo;q.relevantHi=cp.relevantHi;q.neutralCols=cp.neutralCols;q.solveBits(c.cLo,c.cHi,c.mLo,c.mHi,c.moves);}
}
const warm=cases.filter(c=>['legacy','opportunity','dense','openWing'].includes(c.cohort)).filter((c,i,a)=>a.findIndex(d=>d.cohort===c.cohort)===i);
for(let i=0;i<2;i++)for(const c of warm)for(const m of modes)trial(c,m);
const stable=new Map();let limited=0;
for(let rep=0;rep<repeats;rep++) {
  const order=rep%2?[...cases].reverse():cases;
  for(const c of order)for(let j=0;j<modes.length;j++) {
    const ix=rep%2?(rep+c.id+modes.length-1-j)%modes.length:(rep+c.id+j)%modes.length,mode=modes[ix],r=trial(c,mode),identity=`${c.id}/${mode}`;
    if(r.limited)limited++;else {
      const x=[r.score,r.nodes,r.hits,r.writes];if(stable.has(identity))assert.deepEqual(x,stable.get(identity),`determinism ${identity}`);else stable.set(identity,x);
      for(const m of modes){const o=stable.get(`${c.id}/${m}`);if(o)assert.equal(r.score,o[0],`value ${identity}`);}
      if(c.cohort==='legacy')assert.equal(r.score,c.seq==='41267575'?3:-4);
      if(mode==='compileTax'&&stable.has(`${c.id}/base`))assert.deepEqual(x,stable.get(`${c.id}/base`),'placebo tree');
    }
    emit({kind:'trial',rep,order:j,id:c.id,cohort:c.cohort,mode,...r});
  }
}
emit({kind:'complete',trials:repeats*cases.length*modes.length,cases:cases.length,limited,scoreAgreement:true,deterministicMetrics:true});
