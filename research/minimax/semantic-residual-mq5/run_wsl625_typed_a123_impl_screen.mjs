import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { parse, geometry } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { TypedWsl625ResidualSolver } from './residual_solver_wsl625_typed.mjs';

const WIDTH=7,CELLS=42,BIT_SLOTS=49,TT_LOWER_OFFSET=56,TT_UPPER_OFFSET=19;
const G=geometry();
function popBig(v){let n=0;while(v){v&=v-1n;n++;}return n;}
function pairToBig(lo,hi){return BigInt(lo>>>0)|(BigInt(hi>>>0)<<32n);}
function heightAt(packed,column){return(packed>>>(3*column))&7;}
function lowBitIndex(z){const lo=Number(z&0xffffffffn);if(lo)return 31-Math.clz32(lo&-lo);let shift=32;z>>=32n;while(z){const w=Number(z&0xffffffffn);if(w)return shift+31-Math.clz32(w&-w);z>>=32n;shift+=32;}return-1;}
function mixBin(id,salt,bits){let x=(id+Math.imul(salt+1,0x9e3779b9))>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return x&((1<<bits)-1);}

// Shared exact WSL-625 relation substrate. Signatures are rejection-only; exact RID closure is authority.
const unique=new Set();
for(const[lo,hi]of G.lines){const line=pairToBig(lo,hi);for(let subset=line;subset!==0n;subset=(subset-1n)&line)unique.add(subset);}
const masks=[...unique].sort((a,b)=>popBig(a)-popBig(b)||(a<b?-1:a>b?1:0));
assert.equal(masks.length,625);
const idByMask=new Map(masks.map((m,i)=>[m,i]));
const card=Uint8Array.from(masks,popBig);
const upBits=new Array(625);
for(let b=0;b<625;b++){let z=0n;for(let r=0;r<625;r++)if((masks[b]&~masks[r])===0n)z|=1n<<BigInt(r);upBits[b]=z;}
const ridSig=Array.from({length:4},()=>new Uint32Array(625));
const upSig=Array.from({length:4},()=>new Uint32Array(625));
for(let s=0;s<4;s++)for(let rid=0;rid<625;rid++)ridSig[s][rid]=(1<<mixBin(rid,s,5))>>>0;
for(let b=0;b<625;b++)for(let s=0;s<4;s++){let z=0;const closure=upBits[b];for(let r=0;r<625;r++)if((closure>>BigInt(r))&1n)z=(z|ridSig[s][r])>>>0;upSig[s][b]=z;}

// Qualified geometry A123 substrate.
const cellBit=Array.from({length:BIT_SLOTS},(_,i)=>1n<<BigInt(i));
const singletonId=new Int16Array(BIT_SLOTS);singletonId.fill(-1);
const pairId=new Int16Array(BIT_SLOTS*BIT_SLOTS);pairId.fill(-1);
for(let a=0;a<BIT_SLOTS;a++){
  const s=idByMask.get(cellBit[a]);if(s!==undefined)singletonId[a]=s;
  for(let b=0;b<BIT_SLOTS;b++){const q=idByMask.get(cellBit[a]|cellBit[b]);if(q!==undefined)pairId[a*BIT_SLOTS+b]=q;}
}

class TypedA123Solver extends TypedWsl625ResidualSolver{
  constructor(pow=19){super(pow);this.a123Resources=new Array(64);this.a123Blockers=new Int16Array(64);this.a123Playable=new Int16Array(WIDTH);this.a123Checks=0;this.a123Hits=0;this.a123Cuts=0;this.a123Candidates=0;this.a123DfsSteps=0;}
  resetMetrics(){super.resetMetrics();this.a123Checks=0;this.a123Hits=0;this.a123Cuts=0;this.a123Candidates=0;this.a123DfsSteps=0;}
  noWinA123(currentRef,height,moves){
    this.a123Checks++;
    const len=this.side.length[currentRef];if(len===0)return false;
    let active=0n;const at=this.side.offset[currentRef];for(let i=0;i<len;i++)active|=1n<<BigInt(this.side.flat[at+i]);
    const controller=1-(moves&1);let n=0;
    for(let c=0;c<WIDTH;c++)for(let lo=heightAt(height,c);lo<5;lo++){
      const up=lo+1,a=c*7+lo,b=c*7+up,pid=pairId[a*BIT_SLOTS+b];assert(pid>=0);
      this.a123Resources[n]=cellBit[a]|cellBit[b];const bid=(up&1)===controller?singletonId[b]:pid;assert(bid>=0);this.a123Blockers[n++]=bid;
    }
    let pn=0;for(let c=0;c<WIDTH;c++){const r=heightAt(height,c);if(r<6)this.a123Playable[pn++]=c*7+r;}
    for(let i=0;i<pn;i++)for(let j=i+1;j<pn;j++){
      const a=this.a123Playable[i],b=this.a123Playable[j],bid=pairId[a*BIT_SLOTS+b];if(bid<0)continue;
      this.a123Resources[n]=cellBit[a]|cellBit[b];this.a123Blockers[n++]=bid;
    }
    this.a123Candidates+=n;
    let union=0n;for(let i=0;i<n;i++)union|=upBits[this.a123Blockers[i]]&active;if(union!==active)return false;
    let steps=0;
    const dfs=(covered,used)=>{
      if(++steps>10000)return false;if(covered===active)return true;
      const rid=lowBitIndex(active&~covered),bit=1n<<BigInt(rid);
      for(let i=0;i<n;i++){
        const closure=upBits[this.a123Blockers[i]];if((closure&bit)===0n)continue;
        const resource=this.a123Resources[i];if(resource&used)continue;
        const solved=closure&active;if((solved&~covered)===0n)continue;
        if(dfs(covered|solved,used|resource))return true;
      }
      return false;
    };
    const hit=dfs(0n,0n);this.a123DfsSteps+=steps;if(hit)this.a123Hits++;return hit;
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
    if(this.side.length[currentRef]!==0&&this.noWinA123(currentRef,height,moves)&&beta>0){beta=0;if(alpha>=beta){this.a123Cuts++;this.publish(probe.slot,id,TT_UPPER_OFFSET);return beta;}}
    survivors.sort((a,b)=>b.orderScore-a.orderScore||G.order.indexOf(a.column)-G.order.indexOf(b.column));
    for(const p of survivors){const score=-this.negamax(this.arena.internPrepared(p),-beta,-alpha);if(score>=beta){this.publish(probe.slot,id,score+TT_LOWER_OFFSET);return score;}if(score>alpha)alpha=score;}
    this.publish(probe.slot,id,alpha+TT_UPPER_OFFSET);return alpha;
  }
  metrics(){return{...super.metrics(),a123Checks:this.a123Checks,a123Hits:this.a123Hits,a123Cuts:this.a123Cuts,a123Candidates:this.a123Candidates,a123DfsSteps:this.a123DfsSteps};}
}

function makeImplSolver(capacity,stageOrder){
  assert(Number.isInteger(capacity)&&capacity>0);
  assert(stageOrder==='impl-first'||stageOrder==='a123-first');
  return class TypedA123ImplSolver extends TypedA123Solver{
    constructor(pow=19){super(pow);this.implCapacity=capacity;this.implStageOrder=stageOrder;}
    resetMetrics(){
      super.resetMetrics();
      this.implBuckets=new Map();this.implSideMeta=[];this.implFrontierItems=0;this.implMaxBucketItems=0;
      this.implLookups=0;this.implCandidateVisits=0;this.implFavChecks=0;this.implFastChecks=0;this.implFastRejects=0;this.implClosureChecks=0;
      this.implLowerMatches=0;this.implUpperMatches=0;this.implLowerTightens=0;this.implUpperTightens=0;this.implLowerCuts=0;this.implUpperCuts=0;
      this.implStores=0;this.implUpdates=0;this.implRefreshes=0;this.implEvictions=0;this.implMaintenanceChecks=0;
    }
    sideMeta(ref){
      let m=this.implSideMeta[ref];if(m!==undefined)return m;
      const n=this.side.length[ref],at=this.side.offset[ref];let bits=0n,upUnion=0n,minSize=255;const bitsSig=[0,0,0,0],unionSig=[0,0,0,0];
      for(let i=0;i<n;i++){
        const rid=this.side.flat[at+i];bits|=1n<<BigInt(rid);upUnion|=upBits[rid];if(card[rid]<minSize)minSize=card[rid];
        for(let s=0;s<4;s++){bitsSig[s]=(bitsSig[s]|ridSig[s][rid])>>>0;unionSig[s]=(unionSig[s]|upSig[s][rid])>>>0;}
      }
      m={length:n,bits,upUnion,minSize:n?minSize:0,bitsSig,unionSig};this.implSideMeta[ref]=m;return m;
    }
    implies(A,B){
      this.implFastChecks++;
      if(A.length===0)return true;if(B.length===0)return false;
      if(A.minSize<B.minSize){this.implFastRejects++;return false;}
      for(let s=0;s<4;s++)if((A.bitsSig[s]&~B.unionSig[s])!==0){this.implFastRejects++;return false;}
      this.implClosureChecks++;return(A.bits&~B.upUnion)===0n;
    }
    fav(ac,ao,bc,bo){
      // A >= B for side-to-move: A's own requirements are no harder and A's opponent requirements are no easier.
      this.implFavChecks++;
      return this.implies(this.sideMeta(bc),this.sideMeta(ac))&&this.implies(this.sideMeta(ao),this.sideMeta(bo));
    }
    bucket(height,create=false){
      const key=height>>>0;let b=this.implBuckets.get(key);if(b===undefined&&create){b={lower:[],upper:[]};this.implBuckets.set(key,b);}return b;
    }
    storeBound(kind,height,currentRef,opponentRef,value){
      const b=this.bucket(height,true),list=b[kind];this.implStores++;
      for(let i=list.length-1;i>=0;i--){
        this.implMaintenanceChecks++;const e=list[i];if(e.currentRef!==currentRef||e.opponentRef!==opponentRef)continue;
        const stronger=kind==='lower'?value>e.value:value<e.value;if(stronger){e.value=value;this.implUpdates++;}else this.implRefreshes++;
        list.splice(i,1);list.push(e);return;
      }
      list.push({currentRef,opponentRef,value});this.implFrontierItems++;
      if(list.length>this.implCapacity){list.shift();this.implFrontierItems--;this.implEvictions++;}
      const total=b.lower.length+b.upper.length;if(total>this.implMaxBucketItems)this.implMaxBucketItems=total;
    }
    lookupImpl(height,currentRef,opponentRef,alpha,beta){
      const b=this.bucket(height,false);if(b===undefined)return{alpha,beta,cutoff:false};this.implLookups++;
      for(let i=b.lower.length-1;i>=0;i--){
        const e=b.lower[i];this.implCandidateVisits++;
        if(!this.fav(currentRef,opponentRef,e.currentRef,e.opponentRef))continue;
        this.implLowerMatches++;if(alpha<e.value){alpha=e.value;this.implLowerTightens++;}
        if(alpha>=beta){this.implLowerCuts++;return{alpha,beta,cutoff:true};}
      }
      for(let i=b.upper.length-1;i>=0;i--){
        const e=b.upper[i];this.implCandidateVisits++;
        if(!this.fav(e.currentRef,e.opponentRef,currentRef,opponentRef))continue;
        this.implUpperMatches++;if(beta>e.value){beta=e.value;this.implUpperTightens++;}
        if(alpha>=beta){this.implUpperCuts++;return{alpha,beta,cutoff:true};}
      }
      return{alpha,beta,cutoff:false};
    }
    applyA123(currentRef,height,moves,probe,alpha,beta){
      if(this.side.length[currentRef]!==0&&this.noWinA123(currentRef,height,moves)&&beta>0){
        beta=0;if(alpha>=beta){this.a123Cuts++;this.publish(probe.slot,this._implCurrentId,TT_UPPER_OFFSET);this.storeBound('upper',height,currentRef,this._implOpponentRef,0);return{alpha,beta,cutoff:true,value:beta};}
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
        beta=0;if(alpha>=beta){this.a123Cuts++;this.publish(probe.slot,id,TT_UPPER_OFFSET);this.storeBound('upper',height,currentRef,opponentRef,0);return beta;}
      }
      if(this.implStageOrder==='a123-first'){
        const q=this.lookupImpl(height,currentRef,opponentRef,alpha,beta);alpha=q.alpha;beta=q.beta;if(q.cutoff)return alpha;
      }

      survivors.sort((a,b)=>b.orderScore-a.orderScore||G.order.indexOf(a.column)-G.order.indexOf(b.column));
      for(const p of survivors){
        const score=-this.negamax(this.arena.internPrepared(p),-beta,-alpha);
        if(score>=beta){this.publish(probe.slot,id,score+TT_LOWER_OFFSET);this.storeBound('lower',height,currentRef,opponentRef,score);return score;}
        if(score>alpha)alpha=score;
      }
      this.publish(probe.slot,id,alpha+TT_UPPER_OFFSET);this.storeBound('upper',height,currentRef,opponentRef,alpha);return alpha;
    }
    metrics(){
      return{...super.metrics(),impl:{capacity:this.implCapacity,stageOrder:this.implStageOrder,buckets:this.implBuckets.size,frontierItems:this.implFrontierItems,maxBucketItems:this.implMaxBucketItems,lookups:this.implLookups,candidateVisits:this.implCandidateVisits,favChecks:this.implFavChecks,fastChecks:this.implFastChecks,fastRejects:this.implFastRejects,closureChecks:this.implClosureChecks,lowerMatches:this.implLowerMatches,upperMatches:this.implUpperMatches,lowerTightens:this.implLowerTightens,upperTightens:this.implUpperTightens,lowerCuts:this.implLowerCuts,upperCuts:this.implUpperCuts,boundCuts:this.implLowerCuts+this.implUpperCuts,stores:this.implStores,updates:this.implUpdates,refreshes:this.implRefreshes,evictions:this.implEvictions,maintenanceChecks:this.implMaintenanceChecks}};
    }
  };
}

const ROOTS=[
  {seq:'663152175',expected:-4,label:'anchor-loss',controlNodes:557605},
  {seq:'41267575',expected:3,label:'anchor-win',controlNodes:3161623},
];
const CAPACITIES=[4,8,16,32],ORDERS=['impl-first','a123-first'];
function run(Ctor,pos){const s=new Ctor(19),t=performance.now(),score=s.solve(pos),elapsedMs=performance.now()-t;return{score,elapsedMs,...s.metrics()};}
function median(v){const a=[...v].sort((x,y)=>x-y),n=a.length;return n&1?a[n>>1]:(a[n/2-1]+a[n/2])/2;}
function stableControl(a,b,label){for(const k of['score','nodes','ttHits','writeAttempts','writeSuccess','forcedTransitions','drawStops','a123Checks','a123Hits','a123Cuts','a123Candidates','a123DfsSteps'])assert.equal(b[k],a[k],`${label} ${k}`);}

const results=[];
for(const root of ROOTS){
  const pos=parse(root.seq),control=run(TypedA123Solver,pos);assert.equal(control.score,root.expected);assert.equal(control.nodes,root.controlNodes,`${root.label} control node drift`);
  const screen=[];
  for(const capacity of CAPACITIES)for(const stageOrder of ORDERS){
    const Ctor=makeImplSolver(capacity,stageOrder),r=run(Ctor,pos);assert.equal(r.score,root.expected,`${root.label} C${capacity} ${stageOrder}`);
    screen.push({capacity,stageOrder,nodeReductionVsControl:1-r.nodes/control.nodes,wallRatioVsControl:r.elapsedMs/control.elapsedMs,result:r});
    console.error(`[IMPL screen] ${root.label} C${capacity} ${stageOrder} nodes=${r.nodes} cuts=${r.impl.boundCuts} visits=${r.impl.candidateVisits} closure=${r.impl.closureChecks} ms=${r.elapsedMs.toFixed(1)}`);
  }
  const rankedProof=[...screen].sort((a,b)=>a.result.nodes-b.result.nodes||a.capacity-b.capacity||a.result.elapsedMs-b.result.elapsedMs);
  const rankedWall=[...screen].sort((a,b)=>a.result.elapsedMs-b.result.elapsedMs||a.result.nodes-b.result.nodes||a.capacity-b.capacity);
  const chosen=[];for(const x of[rankedProof[0],rankedWall[0]])if(!chosen.some(y=>y.capacity===x.capacity&&y.stageOrder===x.stageOrder))chosen.push(x);
  while(chosen.length<2){const x=rankedProof[chosen.length];if(!chosen.some(y=>y.capacity===x.capacity&&y.stageOrder===x.stageOrder))chosen.push(x);else break;}
  const forms=[{name:'control',Ctor:TypedA123Solver},...chosen.map(x=>({name:`c${x.capacity}-${x.stageOrder}`,Ctor:makeImplSolver(x.capacity,x.stageOrder),capacity:x.capacity,stageOrder:x.stageOrder}))];
  const reps=6,warm=2,rows=[];
  for(let rep=0;rep<reps;rep++){
    const shift=rep%forms.length,order=[...forms.slice(shift),...forms.slice(0,shift)],row={rep,order:order.map(x=>x.name)};
    for(const f of order){const r=run(f.Ctor,pos);assert.equal(r.score,root.expected,`${root.label} repeated ${f.name}`);if(f.name==='control'){assert.equal(r.nodes,root.controlNodes);if(rows.length&&rows[0].control)stableControl(rows[0].control,r,`${root.label} control rep=${rep}`);}row[f.name]=r;}
    rows.push(row);
  }
  const timed=rows.filter(r=>r.rep>=warm),repeated={};
  for(const f of forms){const times=timed.map(r=>r[f.name].elapsedMs),nodes=timed.map(r=>r[f.name].nodes);assert(nodes.every(n=>n===nodes[0]),`${root.label} ${f.name} node instability`);repeated[f.name]={medianMs:median(times),nodes:nodes[0],speedupVsControl:null};}
  for(const f of forms)repeated[f.name].speedupVsControl=repeated.control.medianMs/repeated[f.name].medianMs;
  results.push({...root,control,screen,selected:chosen.map(x=>({capacity:x.capacity,stageOrder:x.stageOrder,screenNodes:x.result.nodes,screenMs:x.result.elapsedMs})),repeated:{reps,warm,timedOrders:timed.map(r=>r.order),forms:repeated}});
}

console.log(JSON.stringify({
  kind:'connect4-minimax-mq5-typed-a123-impl-marginal-screen',status:'pass',
  authority:'Same-support exact RID dominance only. Four 32-bit signatures reject impossible comparisons but never authorize transfer; every surviving comparison uses exact 625-bit upward-closure containment. Lower bounds transfer only from dominated source to more favorable target; upper bounds transfer only from dominating source to less favorable target. Null-window bounds are never reinterpreted as exact.',
  frontier:'Per-support, per-bound-type bounded recent frontier with exact-state strengthening/refresh and FIFO eviction. Capacities are per lower/upper list. Eviction can only lose reuse opportunities, never change proof authority.',
  stageOrders:ORDERS,capacities:CAPACITIES,results,
},null,2));
