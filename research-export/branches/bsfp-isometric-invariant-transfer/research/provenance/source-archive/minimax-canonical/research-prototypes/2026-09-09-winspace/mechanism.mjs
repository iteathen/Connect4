// Qualification-only shadows. NEVER used for reported wall-time comparisons.
import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import{geometry,parse}from'./position.mjs';
import{WinspaceSolver}from'./solver.mjs';
import{kernelSource}from'./kernel.mjs';
const emit=x=>console.log(JSON.stringify(x));
function shadow(e,reject){
 e.reject=reject;e.aliasHits=0;e.shadowLo=new Uint32Array(e.size);e.shadowHi=new Uint32Array(e.size);
 let src=kernelSource(e.G,false,e.draw,e.sign,true);
 src=src.replace('if(v1===v2&&cached!==0){this.hits++;',`if(v1===v2&&cached!==0&&(!this.reject||(this.shadowLo[slot]===this.histLo&&this.shadowHi[slot]===this.histHi))){
 this.hits++;if(this.shadowLo[slot]!==this.histLo||this.shadowHi[slot]!==this.histHi)this.aliasHits++;`);
 src=src.replace('let v;','const oldLo=this.histLo,oldHi=this.histHi;if((n&1)===0){this.histLo=(oldLo|this.cellLo[x])>>>0;this.histHi=(oldHi|this.cellHi[x])>>>0;}\nlet v;');
 src=src.replace('finally{','finally{this.histLo=oldLo;this.histHi=oldHi;');
 src=src.replaceAll('this.packed[slot]=(h|','this.shadowLo[slot]=this.histLo;this.shadowHi[slot]=this.histHi;this.packed[slot]=(h|');
 e.neg=Function('return '+src)();
}
const corpus=JSON.parse(readFileSync(new URL('./corpus.json',import.meta.url)));
let acceptedNodes=0,rejectedNodes=0,aliasHits=0,cases=0;
for(const item of corpus.filter(x=>x.cohort==='stress')){
 const s=parse(item.seq);const row={kind:'aliasAblation',seq:item.seq};
 for(const reject of[true,false]){const e=new WinspaceSolver({bytes:2097152,draw:true,sign:true,reduce:true});e.prepare(s);shadow(e,reject);const score=e.solve();
  row[reject?'boardOnly':'semantic']={score,nodes:e.nodes,hits:e.hits,aliasHits:e.aliasHits};
  if(reject)rejectedNodes+=e.nodes;else{acceptedNodes+=e.nodes;aliasHits+=e.aliasHits;}
 }
 assert.equal(row.boardOnly.score,row.semantic.score);cases++;emit(row);
}
emit({kind:'aliasSummary',cases,acceptedNodes,rejectedNodes,aliasHits,meaning:'Same slots, capacity, tactical ordering, pruning and stored semantic identity; only nonidentical-color hits are rejected in the control. Instrumented, not a timing measurement.'});
// Independently recompute each live line, empty count and residual XOR at search entries.
let audited=0;
for(const seq of['','277366234637226271','6457413463261657653652']){
 const e=new WinspaceSolver({history:true,reduce:false,draw:false,pow:10});e.prepare(parse(seq));e.limit=10001;
 e.audit=function(h,n,...a){audited++;
  for(let i=0;i<this.goals.length;i++){
   const [lo,hi]=this.goals[i];let count=0,xor=0,blocked=[false,false];
   for(let c=0;c<7;c++)for(let r=0;r<6;r++){
    const x=c*7+r;if(((lo&this.cellLo[x])|(hi&this.cellHi[x]))===0)continue;
    if(r>=((h>>>(c*3))&7)){count++;xor^=x;}else{
      const p0=((this.histLo&this.cellLo[x])|(this.histHi&this.cellHi[x]))!==0;
      const moverIs0=(n&1)===0;blocked[0] ||= p0!==moverIs0;blocked[1] ||= p0===moverIs0;
    }
   }
   const j=i>>>5,bit=(1<<(i&31))>>>0,base=j*5,owner=(n-this.rootMoves)&1;
   const actual=((a[base+2]&bit)?1:0)+((a[base+3]&bit)?2:0)+((a[base+4]&bit)?4:0);
   assert.equal(actual,count);assert.equal(this.xor[i],xor);
   for(let p=0;p<2;p++)assert.equal((a[base+p]&bit)!==0,((this.rootLive[owner^p][j]&bit)!==0)&&!blocked[p]);
  }
 };
 const G=e.G,args=Array.from({length:G},(_,j)=>`A${j},B${j},E${j}a,E${j}b,E${j}c`).join(',');
 let src=kernelSource(G,true,false,false,true).replace("if(++this.nodes>=this.limit)",`this.audit(h,n,${args});if(++this.nodes>=this.limit)`);e.neg=Function('return '+src)();
 try{e.solve();}catch(err){if(err.message!=='NODE_LIMIT')throw err;}
 emit({kind:'transitionAudit',seq,groups:G,entries:e.nodes});
}
emit({kind:'transitionSummary',audited,status:'PASS'});
