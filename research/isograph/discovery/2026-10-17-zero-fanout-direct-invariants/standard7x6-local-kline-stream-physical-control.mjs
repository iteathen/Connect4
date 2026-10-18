// FROZEN INDEPENDENT true7x6 first-win physical/q control of unnormalized
// source K-line stream. No strategic future-game values computed here, only
// single-source legal actions and independently chosen validator continuations.
// The committed source theorem/producer precedes this physical experiment.
import {createLocalKlineStream} from './standard7x6-unnormalized-local-kline-stream.mjs';
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
const W=7,H=6,K=4,N=W*H,dirs=[[1,0],[0,1],[1,1],[1,-1]],
 geometry={width:W,height:H,connect:K},local=createLocalKlineStream(geometry),
 core=createExactQCore(geometry),bit=(c,r)=>1n<<BigInt(r*W+c);
if(core.lineCount!==69||local.originalLines.length!==69)
 throw Error('original 69-line W/H/K geometry mismatch');
const incidence=local.sourceWindowsByCell.map(x=>x.length);
if(incidence.some(x=>x>4*K))throw Error('source original cell incidence exceeded 4K');
let seed=0x71942026>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const stats={
 schema:'connect4.7x6.local_unnormalized_kline_source_stream_v0_1',
 date:'2026-10-17',board:{W,H,K,originalKWindows:69},
 originalCellIncidenceCounts:incidence,
 originalCellIncidenceMax:local.maxOriginalIncidence,
 seedStart:seed,sampledTrajectories:0,
 actualNonterminalPhysicalSourceStates:0,uniqueExactQ:0,
 sourceInitializationsFromQualifiedQ:0,
 singleLiteralActionCofactorAndPhysicalChecks:0,
 nonterminalExactQDecodesCompared:0,firstWinTerminalTokens:0,
 fullBoardNonwinningDrawTokens:0,sourcePhysicalWinDisagreements:0,
 sourceQDecodeDisagreements:0,
 rawSourceGeneratorEditsP0:0,rawSourceGeneratorEditsP1:0,
 rawSourceGeneratorBlocksP0:0,rawSourceGeneratorBlocksP1:0,
 maximumOwnerGeneratorEditsOneAction:0,
 maximumOpponentGeneratorBlocksOneAction:0,
 maximumOriginalWindowsThroughCell:0,
 sourceStatesWithSuppressedRawRedundantGenerators:0,
 totalSuppressedRawGeneratorCounts:0,
 maximumRawSurplusVsMinimal:0,
 maximumRawGeneratorCounts:[0,0],
 ownerLocalIncidenceViolation:0,strategicFutureValueQueries:0,
 canonical:[],byPly:{},retainedSupersetWitness:null,seedFinal:null};
const qSeen=new Set();
function assert(v,msg){if(!v)throw Error(msg);}
function blank(){return {h:Array(W).fill(0),p:[0n,0n],n:0,history:''};}
function firstWin(grid,c,r,who){
 for(const [dx,dy] of dirs){
  let count=1;
  for(const sign of [-1,1]){
   let cc=c+sign*dx,rr=r+sign*dy;
   while(cc>=0&&cc<W&&rr>=0&&rr<H&&grid[cc][rr]===who){
    count++;cc+=sign*dx;rr+=sign*dy;
   }
  }
  if(count>=K)return true;
 }
 return false;
}
function physicalMove(st,c){
 const r=st.h[c],n=st.n,who=n&1;
 if(!Number.isInteger(c)||c<0||c>=W||r>=H)throw Error('physical illegal');
 const p=st.p.slice();p[who]|=bit(c,r);
 const h=st.h.slice();h[c]++;
 const grid=Array.from({length:W},()=>Array(H).fill(-1));
 for(let x=0;x<W;x++)for(let y=0;y<H;y++){
  const b=bit(x,y);
  if((p[0]&b)!==0n)grid[x][y]=0;
  if((p[1]&b)!==0n)grid[x][y]=1;
 }
 const won=firstWin(grid,c,r,who);
 return {h,p,n:n+1,history:st.history+String(c+1),won,who,
  value:won?(who===0?1:-1):n+1===N?0:null};
}
function validPrefix(hist){
 let st=blank();
 for(const ch of hist){
  st=physicalMove(st,Number(ch)-1);
  if(st.won)throw Error('fixed canonical source already first-win terminal');
 }
 return st;
}
function independentQ(st){
 return core.fromPhysical({h:st.h,p0:st.p[0],p1:st.p[1]});
}
function sampleOriginalQ(st){
 if(st.n===N||st.won)throw Error('nonterminal sample required');
 stats.actualNonterminalPhysicalSourceStates++;
 const q=independentQ(st);qSeen.add(core.key(q));
 const live=local.initialize(q);stats.sourceInitializationsFromQualifiedQ++;
 assert(core.key(local.decode(live))===core.key(q),'initial source stream disagreed');
 const options=core.legal(q),tested=[];
 for(const a of options){
  const ref=core.next(q,a),prod=local.next(live,a),physical=physicalMove(st,a);
  stats.singleLiteralActionCofactorAndPhysicalChecks++;
  const cellId=st.h[a]*W+a;
  stats.maximumOriginalWindowsThroughCell=Math.max(stats.maximumOriginalWindowsThroughCell,incidence[cellId]);
  stats.maximumOwnerGeneratorEditsOneAction=Math.max(stats.maximumOwnerGeneratorEditsOneAction,prod.trace.ownerGeneratorEdits);
  stats.maximumOpponentGeneratorBlocksOneAction=Math.max(stats.maximumOpponentGeneratorBlocksOneAction,prod.trace.opponentGeneratorDeletions);
  if(prod.trace.ownerGeneratorEdits>incidence[cellId]||prod.trace.opponentGeneratorDeletions>incidence[cellId]){
   stats.ownerLocalIncidenceViolation++;throw Error('source-local generator bound violated');
  }
  if(st.n%2===0){
   stats.rawSourceGeneratorEditsP0+=prod.trace.ownerGeneratorEdits;
   stats.rawSourceGeneratorBlocksP1+=prod.trace.opponentGeneratorDeletions;
  }else{
   stats.rawSourceGeneratorEditsP1+=prod.trace.ownerGeneratorEdits;
   stats.rawSourceGeneratorBlocksP0+=prod.trace.opponentGeneratorDeletions;
  }
  if('terminal' in ref){
   if(prod.terminal!==ref.terminal||prod.kind!==ref.kind||
     physical.value!==ref.terminal){
    stats.sourcePhysicalWinDisagreements++;
    throw Error('stream terminal first-win / last draw disagreed with both references');
   }
   if(prod.kind==='win')stats.firstWinTerminalTokens++;
   else stats.fullBoardNonwinningDrawTokens++;
  }else{
   if('terminal' in prod||physical.won||physical.value!==null||
     core.key(local.decode(prod.state))!==core.key(ref.q)){
    stats.sourceQDecodeDisagreements++;
    throw Error('stream no-Min q decode does not commute with ordinary q cofactor');
   }
   stats.nonterminalExactQDecodesCompared++;
   const d=local.detail(prod.state);
   const surplus=d.suppressedRawGenerators.reduce((s,x)=>s+x,0);
   if(surplus){
    stats.sourceStatesWithSuppressedRawRedundantGenerators++;
    stats.totalSuppressedRawGeneratorCounts+=surplus;
    stats.maximumRawSurplusVsMinimal=Math.max(stats.maximumRawSurplusVsMinimal,surplus);
    if(!stats.retainedSupersetWitness)
     stats.retainedSupersetWitness={
      history:physical.history,startingHistory:st.history,firstAction:a+1,
      rawCounts:d.counts.map(x=>x.activeRaw),
      normalizedCounts:d.counts.map(x=>x.minimal),
      surplus
     };
   }
   for(let p=0;p<2;p++)
    stats.maximumRawGeneratorCounts[p]=Math.max(stats.maximumRawGeneratorCounts[p],d.counts[p].activeRaw);
  }
  tested.push({a,ref,prod,physical});
 }
 const b=stats.byPly[st.n]??(stats.byPly[st.n]={sources:0,actions:0});
 b.sources++;b.actions+=options.length;
 return tested;
}
// For a given source q, stream itself then follows ONE freely chosen
// legal physical word. Other source q continuations are not evaluated.
function trajectory(initial,maxAdditional=42){
 let st=initial,q=independentQ(st),stream=local.initialize(q);
 stats.sampledTrajectories++;
 for(let i=0;i<maxAdditional;i++){
  if(st.won||st.n===N)break;
  const tested=sampleOriginalQ(st);
  // The independent sampler deliberately delays termination, seeking
  // many true first-win-stopped legal source positions across ranks.
  const nonWins=tested.filter(t=>!t.physical.won&&t.physical.value===null);
  if(!nonWins.length)break;
  const chosen=nonWins[rand()%nonWins.length];
  const nextStream=local.next(stream,chosen.a);
  if(!nextStream.state||core.key(local.decode(nextStream.state))!==core.key(chosen.ref.q))
   throw Error('accumulated raw no-Min stream failed after multiple selected placements');
  stream=nextStream.state;st=chosen.physical;q=chosen.ref.q;
 }
}
for(const history of ['','4','44444','444444','444441','4444442']){
 const st=validPrefix(history),q=independentQ(st),live=local.initialize(q);
 stats.canonical.push({history,ply:st.n,sourceCounts:[q.R0.length,q.R1.length],
  legalColumns:core.legal(q).map(c=>c+1),
  sourceRawBefore:local.detail(live).counts.map(x=>x.activeRaw)});
 trajectory(st,12);
}
for(let game=0;game<460;game++){
 let st=blank();
 // Each random prefix remains first-win stopped, so source q is real.
 // No independent game value or strategic solution guides sampling.
 const target=game%3===0?0:game%3===1?15:29;
 while(st.n<target){
  const options=[];
  for(const c of st.h.flatMap((v,c)=>v<H?[c]:[])){
   const next=physicalMove(st,c);
   if(!next.won)options.push(next);
  }
  if(!options.length)break;
  st=options[rand()%options.length];
 }
 trajectory(st,game%3===0?30:13);
}
stats.uniqueExactQ=qSeen.size;stats.seedFinal=seed;
console.log(JSON.stringify(stats,null,2));
