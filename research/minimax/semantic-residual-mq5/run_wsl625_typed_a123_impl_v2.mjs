import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { parse } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { TypedA123Solver, A123_GEOMETRY, heightAt } from './residual_solver_wsl625_typed_a123.mjs';

const {WIDTH,CELLS,TT_LOWER_OFFSET,TT_UPPER_OFFSET,G,card,upBits}=A123_GEOMETRY;
function mixBin(id,salt,bits){let x=(id+Math.imul(salt+1,0x9e3779b9))>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return x&((1<<bits)-1);}
const ridSig=Array.from({length:4},()=>new Uint32Array(625));
const upSig=Array.from({length:4},()=>new Uint32Array(625));
for(let s=0;s<4;s++)for(let rid=0;rid<625;rid++)ridSig[s][rid]=(1<<mixBin(rid,s,5))>>>0;
for(let b=0;b<625;b++)for(let s=0;s<4;s++){let z=0;const closure=upBits[b];for(let r=0;r<625;r++)if((closure>>BigInt(r))&1n)z=(z|ridSig[s][r])>>>0;upSig[s][b]=z;}

function makeList(){return{head:null,tail:null,size:0};}
function append(list,e){e.prev=list.tail;e.next=null;if(list.tail)list.tail.next=e;else list.head=e;list.tail=e;}
function unlink(list,e){if(e.prev)e.prev.next=e.next;else list.head=e.next;if(e.next)e.next.prev=e.prev;else list.tail=e.prev;e.prev=null;e.next=null;}
function moveTail(list,e){if(list.tail===e)return;unlink(list,e);append(list,e);}

export function makeImplV2Solver(capacity,stageOrder){
  assert(Number.isInteger(capacity)&&capacity>0&&capacity<=64);
  assert(stageOrder==='impl-first'||stageOrder==='a123-first');
  return class TypedA123ImplV2Solver extends TypedA123Solver{
    constructor(pow=19){super(pow);this.implCapacity=capacity;this.implStageOrder=stageOrder;}
    resetMetrics(){
      super.resetMetrics();
      this.implBuckets=new Map();this.implSideMeta=[];this.implLowerExact=new Map();this.implUpperExact=new Map();
      this.implFrontierItems=0;this.implMaxBucketItems=0;this.implLookups=0;this.implSlotVisits=0;this.implPrefilterChecks=0;this.implPrefilterRejects=0;this.implCandidateVisits=0;
      this.implFavChecks=0;this.implFastChecks=0;this.implFastRejects=0;this.implClosureChecks=0;
      this.implLowerMatches=0;this.implUpperMatches=0;this.implLowerTightens=0;this.implUpperTightens=0;this.implLowerCuts=0;this.implUpperCuts=0;
      this.implStores=0;this.implUpdates=0;this.implRefreshes=0;this.implEvictions=0;this.implExactHits=0;
    }
    sideMeta(ref){
      let m=this.implSideMeta[ref];if(m!==undefined)return m;
      const n=this.side.length[ref],at=this.side.offset[ref];let bits=0n,upUnion=0n,minSize=255;const bitsSig=[0,0,0,0],unionSig=[0,0,0,0];
      for(let i=0;i<n;i++){
        const rid=this.side.flat[at+i];bits|=1n<<BigInt(rid);upUnion|=upBits[rid];if(card[rid]<minSize)minSize=card[rid];
        for(let s=0;s<4;s++){bitsSig[s]=(bitsSig[s]|ridSig[s][rid])>>>0;unionSig[s]=(unionSig[s]|upSig[s][rid])>>>0;}
      }
      m={length:n,bits,upUnion,minSize:n?minSize:0,bitsSig,unionSig,bits16:(bitsSig[0]&255)|((bitsSig[1]&255)<<8),up16:(unionSig[0]&255)|((unionSig[1]&255)<<8)};
      this.implSideMeta[ref]=m;return m;
    }
    impliesMeta(A,B){
      this.implFastChecks++;
      if(A.length===0)return true;if(B.length===0)return false;
      if(A.minSize<B.minSize){this.implFastRejects++;return false;}
      for(let s=0;s<4;s++)if((A.bitsSig[s]&~B.unionSig[s])!==0){this.implFastRejects++;return false;}
      this.implClosureChecks++;return(A.bits&~B.upUnion)===0n;
    }
    favMeta(ac,ao,bc,bo){this.implFavChecks++;return this.impliesMeta(bc,ac)&&this.impliesMeta(ao,bo);}
    bucket(height,create=false){
      const key=height>>>0;let b=this.implBuckets.get(key);if(b===undefined&&create){b={lower:makeList(),upper:makeList()};this.implBuckets.set(key,b);}return b;
    }
    storeBound(kind,id,height,currentRef,opponentRef,value){
      const b=this.bucket(height,true),list=b[kind],exact=kind==='lower'?this.implLowerExact:this.implUpperExact;this.implStores++;
      let e=exact.get(id);
      if(e!==undefined){
        this.implExactHits++;assert.equal(e.list,list,'exact-state bound mapped to wrong support list');assert.equal(e.currentRef,currentRef);assert.equal(e.opponentRef,opponentRef);
        const stronger=kind==='lower'?value>e.value:value<e.value;if(stronger){e.value=value;this.implUpdates++;}else this.implRefreshes++;
        moveTail(list,e);return;
      }
      e={id,currentRef,opponentRef,value,prev:null,next:null,list};append(list,e);list.size++;exact.set(id,e);this.implFrontierItems++;
      if(list.size>this.implCapacity){const old=list.head;unlink(list,old);list.size--;this.implFrontierItems--;this.implEvictions++;const oldMap=kind==='lower'?this.implLowerExact:this.implUpperExact;assert.equal(oldMap.get(old.id),old);oldMap.delete(old.id);}
      const total=b.lower.size+b.upper.size;if(total>this.implMaxBucketItems)this.implMaxBucketItems=total;
    }
    lookupImpl(height,currentRef,opponentRef,alpha,beta){
      const b=this.bucket(height,false);if(b===undefined)return{alpha,beta,cutoff:false};this.implLookups++;
      const tc=this.sideMeta(currentRef),to=this.sideMeta(opponentRef);
      for(let e=b.lower.tail;e;e=e.prev){
        this.implSlotVisits++;this.implPrefilterChecks++;const ec=this.sideMeta(e.currentRef),eo=this.sideMeta(e.opponentRef);
        if((ec.bits16&(~tc.up16&0xffff))!==0||(to.bits16&(~eo.up16&0xffff))!==0){this.implPrefilterRejects++;continue;}
        this.implCandidateVisits++;if(!this.favMeta(tc,to,ec,eo))continue;
        this.implLowerMatches++;if(alpha<e.value){alpha=e.value;this.implLowerTightens++;}
        if(alpha>=beta){this.implLowerCuts++;return{alpha,beta,cutoff:true};}
      }
      for(let e=b.upper.tail;e;e=e.prev){
        this.implSlotVisits++;this.implPrefilterChecks++;const ec=this.sideMeta(e.currentRef),eo=this.sideMeta(e.opponentRef);
        if((tc.bits16&(~ec.up16&0xffff))!==0||(eo.bits16&(~to.up16&0xffff))!==0){this.implPrefilterRejects++;continue;}
        this.implCandidateVisits++;if(!this.favMeta(ec,eo,tc,to))continue;
        this.implUpperMatches++;if(beta>e.value){beta=e.value;this.implUpperTightens++;}
        if(alpha>=beta){this.implUpperCuts++;return{alpha,beta,cutoff:true};}
      }
      return{alpha,beta,cutoff:false};
    }
    negamax(id,alpha,beta){
      this.nodes++;
      const moves=this.arena.moves[id],height=this.arena.height[id],currentRef=this.arena.currentRef[id],opponentRef=this.arena.opponentRef[id];
      if(this.side.length[currentRef]===0&&this.side.length[opponentRef]===0){this.drawStops++;return 0;}
      const opponentWins=this.side.immediateWinningColumns(opponentRef,height);if((opponentWins&(opponentWins-1))!==0)return-Math.trunc((CELLS-moves)/2);
      const candidateColumns=[];if(opponentWins!==0)candidateColumns.push(31-Math.clz32(opponentWins));else for(const column of G.order)if(heightAt(height,column)<6)candidateColumns.push(column);
      const survivors=[];
      for(const column of candidateColumns){const prepared=this.arena.prepare(id,column);if(prepared===null)continue;if(prepared.terminal)return Math.trunc((CELLS+1-moves)/2);if(this.side.immediateWinningColumns(prepared.currentRef,prepared.height)!==0)continue;survivors.push(prepared);}
      if(survivors.length===0)return-Math.trunc((CELLS-moves)/2);if(moves>=CELLS-2)return 0;
      let min=-Math.trunc((CELLS-2-moves)/2);if(alpha<min){alpha=min;if(alpha>=beta)return alpha;}
      let max=Math.trunc((CELLS-1-moves)/2);if(beta>max){beta=max;if(alpha>=beta)return beta;}
      if(survivors.length===1){this.forcedTransitions++;return-this.negamax(this.arena.internPrepared(survivors[0]),-beta,-alpha);}
      const probe=this.probe(id,moves,alpha,beta);alpha=probe.alpha;beta=probe.beta;if(probe.cutoff)return alpha;
      if(this.implStageOrder==='impl-first'){
        const q=this.lookupImpl(height,currentRef,opponentRef,alpha,beta);alpha=q.alpha;beta=q.beta;if(q.cutoff)return alpha;
      }
      if(this.side.length[currentRef]!==0&&this.noWinA123(currentRef,height,moves)&&beta>0){
        beta=0;if(alpha>=beta){this.a123Cuts++;this.publish(probe.slot,id,TT_UPPER_OFFSET);this.storeBound('upper',id,height,currentRef,opponentRef,0);return beta;}
      }
      if(this.implStageOrder==='a123-first'){
        const q=this.lookupImpl(height,currentRef,opponentRef,alpha,beta);alpha=q.alpha;beta=q.beta;if(q.cutoff)return alpha;
      }
      survivors.sort((a,b)=>b.orderScore-a.orderScore||G.order.indexOf(a.column)-G.order.indexOf(b.column));
      for(const p of survivors){
        const score=-this.negamax(this.arena.internPrepared(p),-beta,-alpha);
        if(score>=beta){this.publish(probe.slot,id,score+TT_LOWER_OFFSET);this.storeBound('lower',id,height,currentRef,opponentRef,score);return score;}
        if(score>alpha)alpha=score;
      }
      this.publish(probe.slot,id,alpha+TT_UPPER_OFFSET);this.storeBound('upper',id,height,currentRef,opponentRef,alpha);return alpha;
    }
    metrics(){return{...super.metrics(),impl:{form:'IMPL-RID-EXACTDIST-LINKED-SIG16-V2',capacity:this.implCapacity,stageOrder:this.implStageOrder,buckets:this.implBuckets.size,frontierItems:this.implFrontierItems,maxBucketItems:this.implMaxBucketItems,lowerExact:this.implLowerExact.size,upperExact:this.implUpperExact.size,lookups:this.implLookups,slotVisits:this.implSlotVisits,prefilterChecks:this.implPrefilterChecks,prefilterRejects:this.implPrefilterRejects,candidateVisits:this.implCandidateVisits,favChecks:this.implFavChecks,fastChecks:this.implFastChecks,fastRejects:this.implFastRejects,closureChecks:this.implClosureChecks,lowerMatches:this.implLowerMatches,upperMatches:this.implUpperMatches,lowerTightens:this.implLowerTightens,upperTightens:this.implUpperTightens,lowerCuts:this.implLowerCuts,upperCuts:this.implUpperCuts,boundCuts:this.implLowerCuts+this.implUpperCuts,stores:this.implStores,updates:this.implUpdates,refreshes:this.implRefreshes,exactHits:this.implExactHits,evictions:this.implEvictions}};}
  };
}

const ROOTS=[
  {seq:'663152175',expected:-4,label:'anchor-loss',controlNodes:557605,v1:{'c32-impl-first':364377,'c32-a123-first':364320,'c4-a123-first':419408}},
  {seq:'41267575',expected:3,label:'anchor-win',controlNodes:3161623,v1:{'c32-impl-first':1950573,'c32-a123-first':1950939,'c4-a123-first':2228281}},
];
const FORMS=[
  {name:'c32-impl-first',capacity:32,stageOrder:'impl-first'},
  {name:'c32-a123-first',capacity:32,stageOrder:'a123-first'},
  {name:'c4-a123-first',capacity:4,stageOrder:'a123-first'},
];
const REPS=6,WARM=2;
function run(Ctor,pos){const s=new Ctor(19),t=performance.now(),score=s.solve(pos),elapsedMs=performance.now()-t;return{score,elapsedMs,...s.metrics()};}
function median(v){const a=[...v].sort((x,y)=>x-y),n=a.length;return n&1?a[n>>1]:(a[n/2-1]+a[n/2])/2;}
function stable(a,b,label){for(const k of['score','nodes','ttHits','writeAttempts','writeSuccess','forcedTransitions','drawStops'])assert.equal(b[k],a[k],`${label} ${k}`);}

const results=[];
for(const root of ROOTS){
  const pos=parse(root.seq),control=run(TypedA123Solver,pos);assert.equal(control.score,root.expected);assert.equal(control.nodes,root.controlNodes);
  const screen=[];
  for(const f of FORMS){const Ctor=makeImplV2Solver(f.capacity,f.stageOrder),r=run(Ctor,pos);assert.equal(r.score,root.expected,`${root.label} ${f.name}`);assert.equal(r.nodes,root.v1[f.name],`${root.label} ${f.name} V2 changed V1 proof tree`);screen.push({...f,nodeReductionVsControl:1-r.nodes/control.nodes,wallRatioVsControl:r.elapsedMs/control.elapsedMs,result:r});console.error(`[IMPL V2] ${root.label} ${f.name} nodes=${r.nodes} slots=${r.impl.slotVisits} preReject=${r.impl.prefilterRejects} candidates=${r.impl.candidateVisits} closure=${r.impl.closureChecks} ms=${r.elapsedMs.toFixed(1)}`);}
  const repeatForms=[{name:'control',Ctor:TypedA123Solver},...FORMS.filter(f=>f.capacity===32).map(f=>({name:f.name,Ctor:makeImplV2Solver(f.capacity,f.stageOrder)}))],rows=[];
  for(let rep=0;rep<REPS;rep++){
    const shift=rep%repeatForms.length,order=[...repeatForms.slice(shift),...repeatForms.slice(0,shift)],row={rep,order:order.map(x=>x.name)};
    for(const f of order){const r=run(f.Ctor,pos);assert.equal(r.score,root.expected);if(f.name==='control')assert.equal(r.nodes,root.controlNodes);else assert.equal(r.nodes,root.v1[f.name]);if(rows.length&&rows[0][f.name])stable(rows[0][f.name],r,`${root.label} ${f.name} rep=${rep}`);row[f.name]=r;}
    rows.push(row);
  }
  const timed=rows.filter(r=>r.rep>=WARM),repeated={};
  for(const f of repeatForms){const times=timed.map(r=>r[f.name].elapsedMs);repeated[f.name]={medianMs:median(times),nodes:timed[0][f.name].nodes,speedupVsControl:null};}
  for(const f of repeatForms)repeated[f.name].speedupVsControl=repeated.control.medianMs/repeated[f.name].medianMs;
  results.push({...root,control,screen,repeated:{reps:REPS,warm:WARM,timedOrders:timed.map(r=>r.order),forms:repeated}});
}
console.log(JSON.stringify({kind:'connect4-minimax-mq5-typed-a123-impl-v2',status:'pass',authority:'V2 changes representation/filtering only: O(1) exact-state linked recent frontier and dual 16-bit conservative prefilter. Exact RID closure remains authority after filtering; lower/upper bound transfer directions and null-window semantics are unchanged. V2 node counts are asserted equal to V1 for identical capacity/order.',results},null,2));
