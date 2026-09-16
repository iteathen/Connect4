import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{performance}from'node:perf_hooks';
import{geometry,parse,stateArgs}from'./position.mjs';
import{WinspaceSolver}from'./solver.mjs';
import{Solver as Base}from'../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';
const argv=process.argv.slice(2),cohort=argv[0]??'development',bytes=Number(argv[1]??2097152),repeats=Number(argv[2]??3),names=(argv[3]??'base,history,lines,draw,sign,minimal').split(',');
const pow=17,limit=Number(process.env.NODE_LIMIT??20000000),g=geometry();
const data=JSON.parse(readFileSync(new URL(process.env.CORPUS??'./corpus.json',import.meta.url)));
const selections=data.filter(x=>x.cohort===cohort);if(!selections.length)throw Error('empty cohort');
const emit=x=>console.log(JSON.stringify(x));
const options={history:{history:true,draw:false,reduce:false},lines:{draw:false,reduce:false},draw:{draw:true,reduce:false},sign:{draw:true,sign:true,reduce:false},minimal:{draw:true,sign:true,reduce:true},historyProof:{history:true,draw:true,sign:true,reduce:false}};
function factory(name,arena=null){
 if(name==='adaptive'){
  const line=new WinspaceSolver({...options.minimal,pow,bytes,g}),base=factory('base',line.arena);let selected=base;
  const e={arenaBytes:line.arenaBytes,prepare(s){line.prepare(s);selected=line.G===1?line:base;if(selected===base)base.prepare(s);this.G=line.G;this.goalCount=line.goalCount;this.size=selected.size;this.entryBytes=selected.entryBytes;this.ttBytes=selected.ttBytes;this.selectedKind=selected===base?'bitboard':'one-word-lines';},solve(){return selected.solve();},get nodes(){return selected.nodes;},get hits(){return selected.hits??selected.ttHits;},get writes(){return selected.writes??selected.writeSuccess;},get draws(){return selected.draws??0;},get exclusions(){return selected.exclusions??0;},set limit(x){line.limit=x;base.limit=x;}};
  return e;
 }
 if(name!=='base')return new WinspaceSolver({...options[name],pow,bytes,g});
 const e=new Base(bytes?1:pow,true),size=bytes?Math.floor(bytes/14):2**pow;e.size=size;e.mask=size-1;
 if(bytes||arena){const backing=arena??new SharedArrayBuffer(size*14);e.keyLo=new Uint32Array(backing,0,size);e.keyHi=new Uint32Array(backing,size*4,size);e.ctrl=new Int32Array(backing,size*8,size);e.val=new Uint8Array(backing,size*12,size);e.owner=new Uint8Array(backing,size*13,size);e.arenaBytes=backing.byteLength;
 e.hash=function(lo,hi){let x=(lo^Math.imul(hi,0x9e3779b1))>>>0;x=Math.imul(x^(x>>>16),0x85ebca6b)>>>0;return (bytes?x%this.size:x&this.mask);};}
 e.clear=function(){for(const k of['keyLo','keyHi','val','ctrl','owner'])this[k].fill(0);this.resetMetrics();};
 e.prepare=function(s){this.state=stateArgs(s);this.clear();this.G=0;this.goalCount=0;this.ttBytes=size*14;this.entryBytes=14;};
 e.solve=function(){return this.solveBits(...this.state);};return e;
}
const es=new Map(names.map(n=>[n,factory(n)]));
emit({kind:'config',cohort,bytes,repeats,names,positions:selections.length,node:process.version,limit,corpusSHA256:createHash('sha256').update(readFileSync(new URL(process.env.CORPUS??'./corpus.json',import.meta.url))).digest('hex'),protocol:'rotating/reversing mode order; cold TT each trial; root compile+clear measured; equal bytes uses modulo in BOTH kernels; no worker scheduling; parse excluded equally'});
for(const name of names){const e=es.get(name);for(const seq of['','663152175','6457413463261657653652','6457413463261657653652','6457413463261657653652','277366234637226271']){
 let s;try{s=parse(seq,g);}catch{continue;}
 e.prepare(s);e.limit=30000;const t=performance.now();let status='complete';try{e.solve();}catch(err){if(err===911||err.message==='NODE_LIMIT')status='capped';else throw err;}
 emit({kind:'warmup',name,groups:e.G,seq,status,nodes:e.nodes,ms:performance.now()-t});e.limit=limit;
}}
const expected=new Map([['663152175',-4],['41267575',3],['4126757563',3],...selections.filter(x=>x.baselineScore!==undefined).map(x=>[x.seq,x.baselineScore])]);
for(let rep=0;rep<repeats;rep++){
 const roots=rep%2?[...selections].reverse():selections;
 for(let j=0;j<roots.length;j++){
  const item=roots[j],s=parse(item.seq,g),shift=(rep+j)%names.length;
  for(let k=0;k<names.length;k++){
   const index=(shift+(rep%2?names.length-k:k))%names.length,name=names[index],e=es.get(name);
   const start=performance.now();e.prepare(s);const prepared=performance.now();let score=null,status='complete',error;
   try{score=e.solve();}catch(err){if(err===911||err.message==='NODE_LIMIT'){status='capped';error='NODE_LIMIT';}else throw err;}
   const end=performance.now();
   if(status==='complete'){if(expected.has(item.seq))assert.equal(score,expected.get(item.seq),`${name} ${item.seq}`);else expected.set(item.seq,score);}
   emit({kind:'trial',cohort,id:item.id,seq:item.seq,ply:s.moves,rep,name,status,error,score,groups:e.G,goals:e.goalCount,backend:e.selectedKind??name,entries:e.size,entryBytes:e.entryBytes,ttBytes:e.ttBytes,arenaBytes:e.arenaBytes??e.ttBytes,prepareMs:prepared-start,searchMs:end-prepared,totalMs:end-start,nodes:e.nodes,hits:e.hits??e.ttHits,writes:e.writes??e.writeSuccess,draws:e.draws??0,exclusions:e.exclusions??0});
  }
 }
}
emit({kind:'end',cohort,repeats,positions:selections.length});
