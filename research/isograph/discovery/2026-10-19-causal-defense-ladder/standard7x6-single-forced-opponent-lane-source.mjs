// ORIGINAL 7x6 K4: proof-carrying forced-singleton P1 reply lane.
// Source-only: no oracle, no solved move labels, no optimal-line target set,
// no game WDL search and no strategically inequivalent future-game valuation.
export const W=7,H=6,K=4;
export const LINE_WINDOWS=(()=>{
  const out=[];
  for(let c=0;c<W;c++)for(let r=0;r<H;r++)
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
    const cells=Array.from({length:K},(_,i)=>[c+dx*i,r+dy*i]);
    if(cells.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))out.push(cells);
  }
  if(out.length!==69)throw Error("original K4 open-boundary line count");
  return out;
})();
const site=(c,r)=>c*H+r;
export function emptyBoard(){return {h:Array(W).fill(0),b:Array.from({length:W},()=>Array(H).fill(-1)),n:0};}
export function duplicate(q){return {h:q.h.slice(),b:q.b.map(x=>x.slice()),n:q.n};}
export function legal(q){return q.h.map((v,c)=>v<H?c:-1).filter(v=>v>=0);}
export function allOriginalWinningLines(q,p){
  return LINE_WINDOWS.filter(L=>L.every(([c,r])=>q.b[c][r]===p));
}
export function sourceSingletonSites(q,p){
  const s=new Set();
  for(const L of LINE_WINDOWS){
    let mine=0,other=0,vacant=0,only=-1;
    for(const [c,r] of L){
      const owner=q.b[c][r];
      if(owner===p)mine++;
      else if(owner===1-p)other++;
      else {vacant++;only=site(c,r);}
    }
    if(!other&&mine===K-1&&vacant===1)s.add(only);
  }
  return s;
}
export function originalPlace(q,c,p){
  if(q.n%2!==p)throw Error("alternation");
  if(c<0||c>=W||q.h[c]===H)throw Error("illegal column");
  if(allOriginalWinningLines(q,0).length||allOriginalWinningLines(q,1).length)
    throw Error("past first-winning terminal");
  const r=q.h[c]++;q.b[c][r]=p;q.n++;
  return allOriginalWinningLines(q,p).length>0;
}
export function sourceImmediateWinColumns(q,p){
  if(q.n%2!==p)throw Error("mover mismatch");
  const s=sourceSingletonSites(q,p);
  return legal(q).filter(c=>s.has(site(c,q.h[c])));
}
export function oneStepExposure(q){
  if(q.n%2!==1||q.n>39)throw Error("original P1-to-move nonterminal rank<=39 required");
  if(allOriginalWinningLines(q,0).length||allOriginalWinningLines(q,1).length)
    throw Error("terminal source");
  const acts=legal(q),p0=sourceSingletonSites(q,0),p1=sourceSingletonSites(q,1);
  const sigma=acts.map(c=>Number(p0.has(site(c,q.h[c]))));
  const lambda=acts.map(c=>Number(q.h[c]+1<H&&p0.has(site(c,q.h[c]+1))));
  const omega=acts.map(c=>Number(p1.has(site(c,q.h[c]))));
  const entries=acts.map((c,i)=>{
    const otherSurvival=sigma.reduce((v,s,j)=>v*(i===j?1:(1-s)),1);
    const exposed=(1-omega[i])*(1-(1-lambda[i])*otherSurvival);
    return {column:c,sigma:sigma[i],lambda:lambda[i],omega:omega[i],exposed};
  });
  return {rank:q.n,
    legal:entries,unsafe:entries.filter(v=>v.exposed).map(v=>v.column),
    safe:entries.filter(v=>!v.exposed).map(v=>v.column),
    remainingPairs:q.h.reduce((a,v)=>a+Math.floor((H-v)/2),0),
    unpairedTops:q.h.reduce((a,v)=>a+((H-v)%2),0)};
}

// Certified P0 WIN if every current P1 alternative except at most ONE loses
// immediately, while a predetermined SAME-COLUMN P0 upper-mate response to the
// only safe P1 action inductively returns to the same proof family.
// Stopping at multiple safe P1 actions is INCOMPLETE, not a game-value claim.
export function proveOneLane(sourceRoot){
  const q=duplicate(sourceRoot),certificate=[];
  for(let t=0;t<=21;t++){
    if(q.n>39||q.n%2!==1)
      return {status:"INCOMPLETE",reason:"out_of_guard",certificate};
    const info=oneStepExposure(q);
    const row={rank:info.rank,legal:info.legal.map(a=>({
      columnOneBased:a.column+1,sigma:a.sigma,lambda:a.lambda,
      omega:a.omega,immediateP0WinExposure:a.exposed
    })),safeOneBased:info.safe.map(c=>c+1),
      unpairedTops:info.unpairedTops,remainingPairs:info.remainingPairs};
    certificate.push(row);
    if(info.safe.length===0)
      return {status:"SOURCE_PROVED_P0_WIN",baseRank:q.n,
        method:"universal_immediate_P1_exposure",certificate,forcedLaneLength:certificate.length-1};
    if(info.safe.length>1)
      return {status:"INCOMPLETE",reason:"multiple_P1_safe_labels",certificate};
    const a=info.safe[0];
    if(info.legal.find(v=>v.column===a)?.omega)
      return {status:"INCOMPLETE",reason:"P1_terminal_safe_label",certificate};
    const p1Win=originalPlace(q,a,1);
    if(p1Win)return {status:"INCOMPLETE",reason:"P1_wins_first",certificate};
    const p0Immediate=sourceImmediateWinColumns(q,0);
    if(p0Immediate.length){
      const b=p0Immediate[0];row.P1forcedColumnOneBased=a+1;
      row.P0policyColumnOneBased=b+1;row.P0policyKind="immediate_win";
      if(!originalPlace(q,b,0))throw Error("source immediate-win proof falsified");
      return {status:"SOURCE_PROVED_P0_WIN",method:"P0_immediate_after_forced_P1",
        baseRank:q.n,certificate,forcedLaneLength:certificate.length};
    }
    if(q.h[a]>=H)
      return {status:"INCOMPLETE",reason:"fixed_same_column_P0_mate_illegal",
        certificate};
    row.P1forcedColumnOneBased=a+1;row.P0policyColumnOneBased=a+1;
    row.P0policyKind="physical_upper_mate";
    if(originalPlace(q,a,0))
      return {status:"SOURCE_PROVED_P0_WIN",method:"physical_mate_firstwins",
        baseRank:q.n,certificate,forcedLaneLength:certificate.length};
  }
  return {status:"INCOMPLETE",reason:"rank_budget_guard",certificate};
}
