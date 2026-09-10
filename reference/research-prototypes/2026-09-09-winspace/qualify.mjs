import assert from 'node:assert/strict';
import{readFileSync,writeFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{cpus,availableParallelism}from'node:os';
import{geometry,parse,oracle,rng,rollout,won,fromBoard,stateArgs,compile}from'./position.mjs';
import{WinspaceSolver}from'./solver.mjs';
import{Solver as Baseline}from'../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';
const emit=x=>console.log(JSON.stringify(x));
const raw=readFileSync(new URL('../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs',import.meta.url));
assert.equal(createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex'),'965c3806c92a7add544dce4777d965b3e12376d6');
emit({kind:'environment',node:process.version,arch:process.arch,platform:process.platform,cpu:cpus()[0].model,parallelism:availableParallelism(),baselineBlob:'965c3806c92a7add544dce4777d965b3e12376d6',researchBase:'bdf16764e16325fceb36509b43809b326d17bfdd'});
const g=geometry(4,3,3),b=new Uint8Array(12),h=new Uint8Array(4),cache=new Map(),states=[];
function visit(n,seq){
 const key=b.join('');if(cache.has(key))return cache.get(key);
 if(n===12){cache.set(key,0);states.push({seq,want:0});return 0;}
 const p=(n&1)+1;let best=-99;
 for(let c=0;c<4;c++){const r=h[c];if(r===3)continue;b[r*4+c]=p;h[c]++;
  const v=won(b,4,3,3,c,r,p)?Math.trunc((13-n)/2):-visit(n+1,seq+(c+1));h[c]--;b[r*4+c]=0;if(v>best)best=v;
 }
 best=best===0?0:best;cache.set(key,best);states.push({seq,want:best});return best;
}
visit(0,'');const groups=new Map();let windows=0,values=0,transitions=0,classes=0,equivalent=0,example;
const modes=[{history:true,draw:false,reduce:false},{draw:false,reduce:false},{draw:true,reduce:false},{draw:true,sign:true,reduce:true}];
const engines=modes.map(m=>new WinspaceSolver({...m,g,pow:8}));
for(const {seq,want}of states){
 const s=parse(seq,g);const goals=compile(s,g,true,false).goals;
 const sig=[...s.heights,s.moves&1,goals.map(list=>list.map(x=>x.join(',')).sort().join(';')).join('/')].join('|');
 const children=[];
 for(let c=0;c<4;c++){const r=s.heights[c];if(r===3)continue;const p=(s.moves&1)+1;s.b[r*4+c]=p;s.heights[c]++;
  if(won(s.b,4,3,3,c,r,p)){children.push([c,'WIN']);}
  else{const child=fromBoard(s.b,s.heights,s.moves+1,g),q=compile(child,g,true,false).goals;
    children.push([c,[...child.heights,child.moves&1,q.map(list=>list.map(x=>x.join(',')).sort().join(';')).join('/')].join('|')]);}
  s.heights[c]--;s.b[r*4+c]=0;transitions++;
 }
 const prior=groups.get(sig);if(prior){assert.equal(prior.want,want);assert.deepEqual(prior.children,children);equivalent++;if(!example)example={a:prior.seq,b:seq,score:want};}
 else{groups.set(sig,{want,children,seq});classes++;}
 for(const e of engines){e.prepare(s);const before=e.xor.slice(),got=e.solve();assert.equal(got,want,JSON.stringify({seq,want,got,mode:e.history}));assert.deepEqual(e.xor,before);values++;}
 if(seq.length%3===0){const e=engines[3];for(let a=-6;a<6;a++){e.clear();const v=e.window(a,a+1);assert.equal(v<=a,want<=a);assert(v<=a?want<=v:want>=v);windows++;}}
}
emit({kind:'exhaustiveSmallGame',states:states.length,classes,equivalent,transitions,values,windows,example,status:'PASS'});
const largeG=geometry(),random=rng(0x184296ac),inputs=[];for(let i=0;i<96;i++){let s;do{s=rollout(33+i%5,random,largeG);}while(!s);inputs.push(s);}
inputs.push(parse('121212'));let cases=0,matches=0,wchecks=0,orNodes=0;
const largeModes=[{history:true,draw:false,reduce:false},{draw:false,reduce:false},{draw:true,reduce:false},{draw:true,sign:true,reduce:true},{draw:true,sign:true,reduce:true,bytes:32768}];
const ls=largeModes.map(m=>new WinspaceSolver({...m,pow:10}));
for(const s of inputs){
 const truth=s.seq==='121212'?{score:18,nodes:0}:oracle(s,largeG);orNodes+=truth.nodes;cases++;
 const base=new Baseline(12,false);assert.equal(base.solveBits(...stateArgs(s)),truth.score);
 for(const e of ls){e.prepare(s);const old=e.xor.slice();assert.equal(e.solve(),truth.score,s.seq);assert.deepEqual(e.xor,old);matches++;
  for(let a=-4;a<4;a++){e.clear();const v=e.window(a,a+1);assert.equal(v<=a,truth.score<=a);assert(v<=a?truth.score<=v:truth.score>=v);wchecks++;}}
}
emit({kind:'independent7x6',cases,matches,wchecks,oracleNodes:orNodes,status:'PASS'});
// Compare no-TT node counts/order on nontrivial survivor roots: exact duplicate threats must not be counted twice.
let parity=0;const r2=rng(0x34123049);
for(let i=0;i<32;i++){let s;do{s=rollout(28+i%4,r2,largeG);}while(!s);
 const baseline=new Baseline(1,false);baseline.publish=function(){};
 const e=new WinspaceSolver({tt:false,draw:false,reduce:false});e.prepare(s);
 const a=baseline.solveBits(...stateArgs(s)),v=e.solve();assert.equal(v,a);assert.equal(e.nodes,baseline.nodes,JSON.stringify({seq:s.seq,line:e.nodes,board:baseline.nodes}));parity++;
}
emit({kind:'noTTTacticalOrderParity',cases:parity,status:'PASS'});
// Explicit boundary: an exhausted goal system is not the same as one completed goal.
let draws=0;const r3=rng(0x741ab301);for(let i=0;i<5000&&draws<8;i++){const s=rollout(38,r3,largeG);if(!s)continue;
 const e=new WinspaceSolver({pow:8});e.prepare(s);if(e.goalCount)continue;assert.equal(e.solve(),0);assert(e.nodes<=1);draws++;
}
assert(draws>0);emit({kind:'noGoalsDrawCertificate',cases:draws,status:'PASS'});
// Hard abort must leave mutable XOR and history exactly restored.
const s=parse('277366234637226271');for(const history of[false,true]){const e=new WinspaceSolver({history,pow:10});e.prepare(s);const old=e.xor.slice(),a=e.histLo,b=e.histHi;e.limit=37;
 assert.throws(()=>e.solve(),/NODE_LIMIT/);assert.deepEqual(e.xor,old);assert.equal(e.histLo,a);assert.equal(e.histHi,b);e.limit=Infinity;e.clear();assert.equal(e.solve(),2);
}
emit({kind:'abortRestoration',cases:2,status:'PASS'});
emit({kind:'result',status:'PASS',performanceClaim:false,concurrencyClaim:false});
