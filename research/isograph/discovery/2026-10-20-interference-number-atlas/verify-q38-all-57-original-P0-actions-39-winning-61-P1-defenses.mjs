// Exact physical original 7x6 K4 rank38->39 perfect-winning-continuation
// ONE-ROUND source theorem on historically qualified root-strong q38 parents.
// No recursive successor WDL evaluation; all original 69 K4 true windows built.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const f=JSON.parse(readFileSync(new URL('../2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json',import.meta.url),'utf8'));
const at=(c,r)=>r*7+c,key=v=>v.slice().sort((a,b)=>a-b).join('.'),D=[[1,0],[0,1],[1,1],[1,-1]],L=[];
for(let c=0;c<7;c++)for(let r=0;r<6;r++)for(let [dx,dy] of D){
 const q=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
 if(q.every(([x,y])=>x>=0&&x<7&&y>=0&&y<6))L.push(q.map(([x,y])=>at(x,y)));
}
assert.equal(L.length,69);
const historicSet=new Set(f.witnesses.map(w=>key(w.cells.map(([c,r])=>at(c,r))));
const historicIds=new Map(f.witnesses.map(w=>[key(w.cells.map(([c,r])=>at(c,r))),w.lineId]));
const lineIdx=new Map([...historicIds].map(([key,id],i)=>[id,i]));
const archive=new Set(f.witnesses.map(w=>w.movesZeroBased));assert.equal(archive.size,27);
const F=h=>h.map((r,c)=>r<6?at(c,r):-1).filter(x=>x>=0);
const won=(b,p)=>L.some(q=>q.every(x=>b[x]===p));
function targets(b,p){
 const out=new Map;
 for(let lineId=0;lineId<L.length;lineId++){
  let empty=-1,count=0,bad=false;
  for(const e of L[lineId]){if(b[e]===1-p){bad=true;break}if(b[e]===-1){empty=e;count++}}
  if(!bad&&count===1){if(!out.has(empty))out.set(empty,[]);out.get(empty).push(lineId)}
 }
 return out;
}
function rank(A,p){
 let M=A.map(row=>row.map(x=>(x%p+p)%p)),n=M.length,m=M[0].length,rank=0;
 const pow=(a,n)=>{let v=1;while(n){if(n%2)v=v*a%p;a=a*a%p;n=Math.floor(n/2)}return v};
 for(let c=0;c<m&&rank<n;c++){
  let j=rank;while(j<n&&!M[j][c])j++;if(j===n)continue;
  [M[rank],M[j]]=[M[j],M[rank]];
  let u=pow(M[rank][c],p-2);for(let k=c;k<m;k++)M[rank][k]=M[rank][k]*u%p;
  for(let k=rank+1;k<n;k++){let v=M[k][c];if(v)for(let z=c;z<m;z++)M[k][z]=(M[k][z]-v*M[rank][z]%p+p)%p}rank++;
 }
 return rank;
}
const stats={q38HistoricUnique:archive.size,legalP0Actions:0,certifiedBy41:0,notCertified:0,
historicalChosenP0MoveIsCertified:0,P0ImmediateWin39:0,
P1ReplyImmediateWinInNonCertified:0,P1ReplyCanAvoidP0Win41InNonCertified:0,
additionalCertifiedP0Actions:0,remainingRank38Capacity:{},rank39FailureClass:{},rank39Capacity:{},
rank39PositionKeys:new Set,rank39WinningLineUnion:new Set,
rank39ResponseRows:[],rank39ParentRows:[],rank39TargetRows:[],defensiveGraphEdges:new Set,
P1DefenderResponseCount:0,P1ImmediateWinsWithinCertified:0,P1SafeMovesWithinCertified:0,
perQ38MoveSets:[]};
for(const word of archive){
 const board=Array(42).fill(-1),hh=Array(7).fill(0);
 for(let i=0;i<38;i++){
  const c=Number(word[i]),x=at(c,hh[c]++);
  assert(hh[c]<=6);board[x]=i%2;
  assert.equal(won(board,i%2),false);
 }
 const oldCap=hh.map(x=>6-x).filter(x=>x>0).sort((a,b)=>b-a).join('+');
 stats.remainingRank38Capacity[oldCap]=(stats.remainingRank38Capacity[oldCap]||0)+1;
 const legal=F(hh),accepted=[];
 for(const x of legal){
  stats.legalP0Actions++;
  const b=board.slice(),h=hh.slice();b[x]=0;h[x%7]++;
  const immediate=won(b,0);
  let defenderWins=false,defenderCanAvoid=false,reply=[];
  if(immediate)stats.P0ImmediateWin39++;
  else{
   const a0=targets(b,0),f=F(h),t0=f.filter(y=>a0.has(y));
   for(const y of f){
    const bb=b.slice(),h2=h.slice();bb[y]=1;h2[y%7]++;
    if(won(bb,1)){defenderWins=true;continue}
    const pp=targets(bb,0),g=F(h2),wins=g.filter(z=>pp.has(z));
    const predicted=new Set([...t0.filter(z=>z!==y),
      ...(y+7<42&&a0.has(y+7)?[y+7]:[])]);
    assert.equal(wins.length,predicted.size);
    assert(wins.every(z=>predicted.has(z)));
    if(!wins.length)defenderCanAvoid=true;
    reply.push({P1column:y%7+1,P0winningLandings:wins,
     P0winLineIDs:[...new Set(wins.flatMap(z=>pp.get(z)))].map(i=>key(L[i]))});
   }
  }
  const sourceCertified=immediate||(!defenderWins&&!defenderCanAvoid);
  if(!sourceCertified){
   stats.notCertified++;
   stats.P1ReplyImmediateWinInNonCertified+=+defenderWins;
   stats.P1ReplyCanAvoidP0Win41InNonCertified+=+defenderCanAvoid;
   continue;
  }
  accepted.push(x%7+1);stats.certifiedBy41++;
  if(x%7!==Number(word[38]))stats.additionalCertifiedP0Actions++;
  const keyb=b.join(',');
  assert(!stats.rank39PositionKeys.has(keyb));
  stats.rank39PositionKeys.add(keyb);
  const cap=h.map(z=>6-z).filter(z=>z>0).sort((a,b)=>b-a).join('+');
  stats.rank39Capacity[cap]=(stats.rank39Capacity[cap]||0)+1;
  const f=F(h),a0=targets(b,0),t0=f.filter(y=>a0.has(y));
  const kind=t0.length>=2?'fork':t0.length===1?'single-and-release':'forced-release';
  stats.rank39FailureClass[kind]=(stats.rank39FailureClass[kind]||0)+1;
  const all=new Set;
  for(const res of reply){
   stats.P1DefenderResponseCount++;
   const col=Array(28).fill(0);
   for(const lk of res.P0winLineIDs){
    assert(historicSet.has(lk));const id=historicIds.get(lk);
    stats.rank39WinningLineUnion.add(id);
    all.add(id);
    col[lineIdx.get(id)]=1;
   }
   stats.rank39ResponseRows.push(col);
   const sites=Array(42).fill(0);res.P0winningLandings.forEach(x=>sites[x]=1);
   stats.rank39TargetRows.push(sites);
  }
  const ids=[...all].sort((a,b)=>a-b),qRow=Array(28).fill(0);
  ids.forEach(id=>qRow[lineIdx.get(id)]=1);stats.rank39ParentRows.push(qRow);
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)stats.defensiveGraphEdges.add(ids[i]+'-'+ids[j]);
 }
 assert(accepted.includes(Number(word[38])+1));
 stats.historicalChosenP0MoveIsCertified++;
 stats.perQ38MoveSets.push({prefix38OneBased:word.slice(0,38).split('').map(c=>+c+1).join(''),
  remainingCapacity:oldCap,legalColumns:legal.map(e=>e%7+1),certifiedP0WinningColumnsBy41:accepted});
}
assert.equal(stats.legalP0Actions,57);
assert.equal(stats.certifiedBy41,39);
assert.equal(stats.notCertified,18);
assert.equal(stats.P0ImmediateWin39,0);
assert.equal(stats.additionalCertifiedP0Actions,12);
assert.equal(stats.rank39PositionKeys.size,39);
assert.equal(stats.P1DefenderResponseCount,61);
assert.equal(stats.rank39WinningLineUnion.size,28);
assert.equal(stats.defensiveGraphEdges.size,42);
const ranks=[2,1009,1013].map(p=>({
 field:p===2?'GF2':'GF'+p,
 rank39ParentByWinningLineRank:rank(stats.rank39ParentRows,p),
 rank61DefenderResponseByWinningLineRank:rank(stats.rank39ResponseRows,p),
 rank61DefenderResponseByPhysicalWinningLandingRank:rank(stats.rank39TargetRows,p)
}));
assert(ranks.every(r=>r.rank39ParentByWinningLineRank===28&&
 r.rank61DefenderResponseByWinningLineRank===28&&
 r.rank61DefenderResponseByPhysicalWinningLandingRank===13));
const report={
 schema:1,date:'2026-10-20',scope:'source-certified rank38 original true P0 WIN-by41 on 27 held-back historic root-strong sources, no arbitrary q or root WDL',
 actionStats:{originalQ38:stats.q38HistoricUnique,candidateP0Actions:stats.legalP0Actions,
 sourceCertifiedWinBy41:stats.certifiedBy41,notCertifiedWinBy41:stats.notCertified,
 immediateP0WinAt39:stats.P0ImmediateWin39,historicalChosenActionsRecovered:stats.historicalChosenP0MoveIsCertified,
 additionalCertifiedP0Actions:stats.additionalCertifiedP0Actions,
 nonCertifiedAllowP1ImmediateFirstwin:stats.P1ReplyImmediateWinInNonCertified,
 nonCertifiedAllowP1AvoidP0Firstwin41:stats.P1ReplyCanAvoidP0Win41InNonCertified},
 generatedFamily:{rank39DistinctWinningSources:stats.rank39PositionKeys.size,
 checkedP1DefenderMove40Alternatives:stats.P1DefenderResponseCount,
 distinctP0WinLineIDs:stats.rank39WinningLineUnion.size,
 q38Capacity:stats.remainingRank38Capacity,q39Capacity:stats.rank39Capacity,
 rank39P1DefensiveFailureTypes:stats.rank39FailureClass,
 sampledHistoricAlternateLineCoObligationEdges:stats.defensiveGraphEdges.size,
 independentRanks:ranks},
 q38SourceMoveSets:stats.perQ38MoveSets,
 epistemic:['The 27 historic q38 were already conditionally root-strong by external qualification; theorem does not prove they arise from EMPTY without solving.',
  'The 39 certified q39 are equally P0 WIN-by41 from those historic q38; P1 is proven unable to prevent the win by a local source formula.',
  'All 61 P1 replies counted on these 39 q39 leave P0 firstwinning landing move41; row line signal is UNION over alternative immediate P0 winning drops, not one simultaneous terminal event.',
  'Earlier archived27 q39 parent line-rank27 was sample-dependent; generated39 rank28. Defensive alternative 28-line graph remains connected rank27.',
  'Not a universal source-derived empty-root WDL selector, nor maintained Node26 CI.']
};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
