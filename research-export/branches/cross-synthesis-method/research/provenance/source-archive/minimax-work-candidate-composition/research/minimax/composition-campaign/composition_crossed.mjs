import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const W=7,H=6,CELLS=42,ORDER=[3,4,2,5,1,6,0];
const lines=[];
for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const x=c+3*dx,y=r+3*dy;if(x<0||x>=W||y<0||y>=H)continue;
  let m=0n;for(let j=0;j<4;j++)m|=1n<<BigInt((r+j*dy)*W+c+j*dx);lines.push(m);
}
assert.equal(lines.length,69);
function pc(v){let n=0;while(v){v&=v-1n;n++;}return n;}
const us=new Set();
for(const line of lines){
  const cs=[];for(let i=0;i<CELLS;i++)if((line>>BigInt(i))&1n)cs.push(i);
  for(let s=1;s<16;s++){let m=0n;for(let j=0;j<4;j++)if((s>>j)&1)m|=1n<<BigInt(cs[j]);us.add(m.toString());}
}
const masks=[...us].map(BigInt).sort((a,b)=>pc(a)-pc(b)||(a<b?-1:a>b?1:0));
assert.equal(masks.length,625);
const id=new Map(masks.map((m,i)=>[m.toString(),i]));
const reqSize=Uint8Array.from(masks,pc),singletonCell=new Int16Array(625).fill(-1);
const target=Array.from({length:CELLS},()=>new Int16Array(625).fill(-1));
const contains=Array.from({length:CELLS},()=>new Uint8Array(625));
for(let rid=0;rid<625;rid++){
  if(reqSize[rid]===1){for(let i=0;i<CELLS;i++)if((masks[rid]>>BigInt(i))&1n){singletonCell[rid]=i;break;}}
  for(let cell=0;cell<CELLS;cell++)if((masks[rid]>>BigInt(cell))&1n){
    contains[cell][rid]=1;const n=masks[rid]&~(1n<<BigInt(cell));target[cell][rid]=n===0n?-2:id.get(n.toString());
  }
}
function canon(xs){xs.sort((a,b)=>a-b);const out=[];let prev=-1;outer:for(const rid of xs){if(rid===prev)continue;prev=rid;const m=masks[rid];for(const p of out)if((masks[p]&~m)===0n)continue outer;out.push(rid);}return out;}
function ownMove(rs,cell){const out=[];for(const rid of rs){const n=target[cell][rid];if(n===-2)return [null,true];out.push(n>=0?n:rid);}return [canon(out),false];}
function oppMove(rs,cell){const out=[];for(const rid of rs)if(!contains[cell][rid])out.push(rid);return out;}
function won(bits,bit){for(const l of lines)if((l&bit)!==0n&&(l&bits)===l)return true;return false;}
function parse(seq){let p0=0n,p1=0n;const heights=new Uint8Array(W);for(let mv=0;mv<seq.length;mv++){const c=seq.charCodeAt(mv)-49,r=heights[c],bit=1n<<BigInt(r*W+c);assert(c>=0&&c<W&&r<H,'illegal sequence');if(mv&1){p1|=bit;assert(!won(p1,bit),'terminal sequence');}else{p0|=bit;assert(!won(p0,bit),'terminal sequence');}heights[c]++;}return {p0,p1,heights,moves:seq.length,seq};}
function compile(root,pl){const occ=root.p0|root.p1,opp=pl?root.p0:root.p1,out=[];for(const l of lines){if(l&opp)continue;const rem=l&~occ;if(rem)out.push(id.get(rem.toString()));}return canon(out);}
function packH(h){let v=0;for(let c=0;c<W;c++)v|=h[c]<<(3*c);return v>>>0;}
function stateKey(h,a,b){return `${packH(h)}|${a.join('.')}/${b.join('.')}`;}
function densityExp(rs){let s=0;for(const rid of rs)s+=1<<(4-reqSize[rid]);return s;}
function parityFeature(rs,h,moves){let cls=0,future=0,nearest=99;for(const rid of rs){if(reqSize[rid]!==1)continue;const cell=singletonCell[rid],row=Math.trunc(cell/W),col=cell-row*W,d=row-h[col]+1;if(d<=1)continue;future++;if(d<nearest)nearest=d;const tp=(((W-1)*H)-moves+row+1)&1;if(tp===1)cls=1;}return {cls,future,nearest:nearest===99?0:nearest};}

const columnMasks=[];
for(let col=0;col<W;col++){let mask=0n;for(let row=0;row<H;row++)mask|=1n<<BigInt(row*W+col);columnMasks.push(mask);}
function swapMask(mask,a,b){if(a===b)return mask;const ma=columnMasks[a],mb=columnMasks[b],aa=mask&ma,bb=mask&mb,rest=mask&~(ma|mb),delta=b-a;return delta>0?rest|(aa<<BigInt(delta))|(bb>>BigInt(delta)):rest|(aa>>BigInt(-delta))|(bb<<BigInt(-delta));}
const swapMap=Array.from({length:W},()=>Array(W).fill(null));
for(let a=0;a<W;a++)for(let b=a+1;b<W;b++){const map=new Int16Array(625).fill(-1);for(let rid=0;rid<625;rid++){const mapped=id.get(swapMask(masks[rid],a,b).toString());if(mapped!==undefined)map[rid]=mapped;}swapMap[a][b]=map;swapMap[b][a]=map;}
function hasSorted(values,targetValue){let lo=0,hi=values.length-1;while(lo<=hi){const mid=(lo+hi)>>1,v=values[mid];if(v===targetValue)return true;if(v<targetValue)lo=mid+1;else hi=mid-1;}return false;}
function invariantUnder(rs,map){for(const rid of rs){const m=map[rid];if(m<0||!hasSorted(rs,m))return false;}return true;}
function isResidualTransposition(h,p0,p1,a,b,stats){stats.symmetryChecks++;if(h[a]!==h[b])return false;const map=swapMap[a][b];if(!invariantUnder(p0,map)||!invariantUnder(p1,map))return false;stats.symmetryHits++;return true;}
function playableSingletons(rs,h){const out=[];for(const rid of rs){if(reqSize[rid]!==1)continue;const cell=singletonCell[rid],row=Math.trunc(cell/W),col=cell-row*W;if(h[col]===row)out.push(cell);}return out;}
function optimistic(rs,player,moves,stats){if(rs.length===0)return 0;const next=(moves&1)===player;let min=9;for(const rid of rs){stats.boundScans++;if(reqSize[rid]<min)min=reqSize[rid];}const delta=next?2*min-1:2*min,before=moves+delta-1;if(before>=CELLS)return 0;return Math.trunc((CELLS+1-before)/2);}
function childDescriptor(p0,p1,h,moves,col,oi){const row=h[col],pl=moves&1,mine=pl?p1:p0,other=pl?p0:p1,cell=row*W+col;const [nm,win]=ownMove(mine,cell);const no=win?null:oppMove(other,cell);const maturity=win?1e9:densityExp(nm)-densityExp(no);const pf=win?{cls:1,future:99,nearest:0}:parityFeature(nm,h,moves+1);const proof=win?1e9:((other.length-no.length)*64+(densityExp(nm)-densityExp(no))-nm.length);return {col,oi,nm,no,win,maturity,parityClass:pf.cls,parityFuture:pf.future,proof};}
function orderedChildren(order,p0,p1,h,moves){const out=[];for(let oi=0;oi<ORDER.length;oi++){const col=ORDER[oi];if(h[col]===H)continue;out.push(childDescriptor(p0,p1,h,moves,col,oi));}if(order==='center')return out;if(order==='maturity')return out.sort((a,b)=>b.maturity-a.maturity||a.oi-b.oi);if(order==='maturityFirst'){let bi=0;for(let i=1;i<out.length;i++)if(out[i].maturity>out[bi].maturity)bi=i;if(bi>0){const [best]=out.splice(bi,1);out.unshift(best);}return out;}if(order==='parityPrimary')return out.sort((a,b)=>b.parityClass-a.parityClass||b.parityFuture-a.parityFuture||b.maturity-a.maturity||a.oi-b.oi);if(order==='maturityParity')return out.sort((a,b)=>b.maturity-a.maturity||b.parityClass-a.parityClass||b.parityFuture-a.parityFuture||a.oi-b.oi);if(order==='proofCost')return out.sort((a,b)=>b.proof-a.proof||b.maturity-a.maturity||a.oi-b.oi);throw new Error(`unknown order ${order}`);}

function solve(root,{cardinality=true,macro=true,orbits=false,order='center'}={}){
  const h=root.heights.slice(),p0r=compile(root,0),p1r=compile(root,1),tt=new Map();let nodes=0,ttCuts=0,boundCuts=0,forcedTransitions=0,tacticalWins=0,doubleLosses=0,orderBuilds=0;const stats={boundScans:0,symmetryChecks:0,symmetryHits:0,movesSkipped:0,orbitNodes:0};
  function rec(p0in,p1in,movesIn,alpha,beta){
    let p0=p0in,p1=p1in,moves=movesIn;const forcedCols=[];const undo=()=>{for(let i=forcedCols.length-1;i>=0;i--)h[forcedCols[i]]--;};
    if(macro){while(true){const pl=moves&1,mine=pl?p1:p0,other=pl?p0:p1;const own=playableSingletons(mine,h);if(own.length){tacticalWins++;const v=pl?-Math.trunc((CELLS+1-moves)/2):Math.trunc((CELLS+1-moves)/2);undo();return v;}const opp=[...new Set(playableSingletons(other,h))];if(opp.length>=2){doubleLosses++;const op=1-pl,v=op?-Math.trunc((CELLS-moves)/2):Math.trunc((CELLS-moves)/2);undo();return v;}if(opp.length!==1)break;const cell=opp[0],row=Math.trunc(cell/W),col=cell-row*W,[nm,win]=ownMove(mine,cell);assert(!win);const no=oppMove(other,cell);h[col]++;forcedCols.push(col);forcedTransitions++;moves++;if(pl){p1=nm;p0=no;}else{p0=nm;p1=no;}}}
    nodes++;const a0=alpha,b0=beta,k=stateKey(h,p0,p1);let e=tt.get(k);if(e){if(e.lo===e.up){ttCuts++;undo();return e.lo;}if(e.lo>=beta){ttCuts++;undo();return e.lo;}if(e.up<=alpha){ttCuts++;undo();return e.up;}if(alpha<e.lo)alpha=e.lo;if(beta>e.up)beta=e.up;}
    if((p0.length===0&&p1.length===0)||moves===CELLS){tt.set(k,{lo:0,up:0});undo();return 0;}
    if(cardinality){const lo=-optimistic(p1,1,moves,stats),hi=optimistic(p0,0,moves,stats);if(alpha<lo)alpha=lo;if(beta>hi)beta=hi;if(lo>=b0){boundCuts++;e=e??{lo:-99,up:99};e.lo=Math.max(e.lo,lo);tt.set(k,e);undo();return lo;}if(hi<=a0){boundCuts++;e=e??{lo:-99,up:99};e.up=Math.min(e.up,hi);tt.set(k,e);undo();return hi;}if(alpha>=beta){boundCuts++;undo();return alpha;}}
    const pl=moves&1;let best=pl?99:-99;const children=orderedChildren(order,p0,p1,h,moves);if(order!=='center')orderBuilds++;const reps=[];let saved=0;
    for(const ch of children){if(orbits){let equivalent=false;for(const representative of reps){if(isResidualTransposition(h,p0,p1,ch.col,representative,stats)){equivalent=true;break;}}if(equivalent){stats.movesSkipped++;saved++;continue;}reps.push(ch.col);}h[ch.col]++;let v;if(ch.win)v=pl?-Math.trunc((CELLS+1-moves)/2):Math.trunc((CELLS+1-moves)/2);else v=pl?rec(ch.no,ch.nm,moves+1,alpha,beta):rec(ch.nm,ch.no,moves+1,alpha,beta);h[ch.col]--;if(!pl){if(v>best)best=v;if(best>alpha)alpha=best;}else{if(v<best)best=v;if(best<beta)beta=best;}if(alpha>=beta)break;}
    if(saved)stats.orbitNodes++;e=tt.get(k)??{lo:-99,up:99};if(best<=a0)e.up=Math.min(e.up,best);else if(best>=b0)e.lo=Math.max(e.lo,best);else e={lo:best,up:best};assert(e.lo<=e.up);tt.set(k,e);undo();return best;
  }
  const t=performance.now(),score=rec(p0r,p1r,root.moves,-99,99);return {score:Object.is(score,-0)?0:score,nodes,ms:performance.now()-t,ttSize:tt.size,ttCuts,boundCuts,forcedTransitions,tacticalWins,doubleLosses,orderBuilds,...stats};
}

const frozen=[['764353221241721325116531',-2],['5563576621726752473477144213',7],['3253472274311154254412135',-9],['24763565123272565531172315',2],['544111352647536626717444135',-8],['3412761563244125763551573',-9],['1174534625627233274533652316',-6],['463141571213634656162165252',7]];
const orders=['center','maturity','maturityFirst','parityPrimary','maturityParity','proofCost'];
const configs=[];for(const cardinality of [false,true])for(const macro of [false,true])for(const orbits of [false,true])for(const order of orders)configs.push({cardinality,macro,orbits,order,id:`C${+cardinality}M${+macro}A${+orbits}-${order}`});
const REPS=4,WARM=1,records=[],nodeLedger=new Map();
for(let rep=0;rep<REPS;rep++){const rotated=configs.slice(rep%configs.length).concat(configs.slice(0,rep%configs.length));for(const cfg of rotated){let nodes=0,ms=0,forcedTransitions=0,movesSkipped=0,boundCuts=0;for(const [seq,oracle] of frozen){const r=solve(parse(seq),cfg);assert.equal(r.score,oracle,`${cfg.id} ${seq}`);nodes+=r.nodes;ms+=r.ms;forcedTransitions+=r.forcedTransitions;movesSkipped+=r.movesSkipped;boundCuts+=r.boundCuts;}const prior=nodeLedger.get(cfg.id);if(prior===undefined)nodeLedger.set(cfg.id,nodes);else assert.equal(nodes,prior,`nondeterministic nodes ${cfg.id}`);records.push({rep,id:cfg.id,nodes,ms,forcedTransitions,movesSkipped,boundCuts});}}
function median(values){const a=[...values].sort((x,y)=>x-y),n=a.length;return n&1?a[n>>1]:(a[(n>>1)-1]+a[n>>1])/2;}
const summary={};for(const cfg of configs){const rows=records.filter(r=>r.id===cfg.id),timed=rows.filter(r=>r.rep>=WARM);summary[cfg.id]={...cfg,nodes:nodeLedger.get(cfg.id),medianMs:median(timed.map(r=>r.ms)),forcedTransitions:rows[0].forcedTransitions,movesSkipped:rows[0].movesSkipped,boundCuts:rows[0].boundCuts};}
function pct(after,before){return 100*(1-after/before);}const comparisons=[];
function addToggle(candidate,onPred,offPred){for(const on of configs.filter(onPred)){const off=configs.find(c=>offPred(c,on));if(!off)continue;const a=summary[on.id],b=summary[off.id];comparisons.push({candidate,context:{on:on.id,off:off.id},nodePct:pct(a.nodes,b.nodes),timePct:pct(a.medianMs,b.medianMs)});}}
addToggle('CARD',c=>c.cardinality,(c,on)=>!c.cardinality&&c.macro===on.macro&&c.orbits===on.orbits&&c.order===on.order);
addToggle('FMAC',c=>c.macro,(c,on)=>!c.macro&&c.cardinality===on.cardinality&&c.orbits===on.orbits&&c.order===on.order);
addToggle('AUTO',c=>c.orbits,(c,on)=>!c.orbits&&c.cardinality===on.cardinality&&c.macro===on.macro&&c.order===on.order);
for(const order of ['maturity','maturityFirst','parityPrimary','proofCost'])addToggle(`ORDER:${order}`,c=>c.order===order,(c,on)=>c.order==='center'&&c.cardinality===on.cardinality&&c.macro===on.macro&&c.orbits===on.orbits);
addToggle('ORDER:paritySecondary',c=>c.order==='maturityParity',(c,on)=>c.order==='maturity'&&c.cardinality===on.cardinality&&c.macro===on.macro&&c.orbits===on.orbits);
const candidateSummary={};for(const candidate of [...new Set(comparisons.map(x=>x.candidate))]){const xs=comparisons.filter(x=>x.candidate===candidate);candidateSummary[candidate]={contexts:xs.length,nodePct:{min:Math.min(...xs.map(x=>x.nodePct)),median:median(xs.map(x=>x.nodePct)),max:Math.max(...xs.map(x=>x.nodePct))},timePct:{min:Math.min(...xs.map(x=>x.timePct)),median:median(xs.map(x=>x.timePct)),max:Math.max(...xs.map(x=>x.timePct))},bestNodeContext:xs.reduce((a,b)=>a.nodePct>b.nodePct?a:b),worstNodeContext:xs.reduce((a,b)=>a.nodePct<b.nodePct?a:b)};}
const rankedByNodes=Object.values(summary).sort((a,b)=>a.nodes-b.nodes).slice(0,12).map(x=>({id:x.id,nodes:x.nodes,medianMs:x.medianMs}));
const rankedByTime=Object.values(summary).sort((a,b)=>a.medianMs-b.medianMs).slice(0,12).map(x=>({id:x.id,nodes:x.nodes,medianMs:x.medianMs}));
console.log(JSON.stringify({kind:'connect4-minimax-composition-campaign-wave1',status:'pass',policy:'No candidate is rejected from one context. Candidate effects are distributions across crossed contexts; later waves retest survivors and adverse forms on representation-native MQ5.',cohort:frozen.map(([seq,score])=>({seq,score})),reps:REPS,warmReps:WARM,configCount:configs.length,summary,candidateSummary,rankedByNodes,rankedByTime},null,2));
