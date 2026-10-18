// Pure original physical-history -> q=(h,R0,R1) source gate audit.
// STATIC SOURCE mathematics only; no policy tree, minimax, next game-value evaluation.
// This is diagnostic classification, NOT a theorem of NO_FORCE_WIN or Level2 BEST.
// Run: node --input-type=module -e "import {sourceGateAudit} from './research/isograph/discovery/2026-10-18-first-touch-multiresource/standard7x6-first-touch-canonical-gate-audit.mjs'; console.log(JSON.stringify(sourceGateAudit(),null,2))"
export function sourceGateAudit({history="44444",W=7,H=6,K=4}={}){
  if(!Number.isInteger(W)||!Number.isInteger(H)||!Number.isInteger(K)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)throw Error("invalid geometry");
  const N=W*H;
  const bit=z=>1n<<BigInt(z), id=(c,r)=>r*W+c;
  const cell=z=>({id:z,columnOneBased:z%W+1,rowOneBased:Math.floor(z/W)+1});
  const popcnt=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
  const windows=[];
  for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
    const xs=Array.from({length:K},(_,i)=>[c+i*dc,r+i*dr]);
    if(xs.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H))windows.push(xs.map(([a,b])=>id(a,b)));
  }
  if(W===7&&H===6&&K===4&&windows.length!==69)throw Error("not 69 original winning windows");
  const h=Array(W).fill(0), owned=[0n,0n]; let terminal=null;
  for(let t=0;t<history.length;t++){
    if(terminal!==null)throw Error("history violates first-win stop");
    const c=Number(history[t])-1,p=t&1;
    if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)throw Error("illegal gravity history");
    const x=id(c,h[c]++);owned[p]|=bit(x);
    if(windows.some(w=>w.every(z=>(owned[p]&bit(z))!==0n)))terminal={ply:t+1,winner:p,x:cell(x)};
  }
  if(terminal!==null||history.length===N)throw Error("only nonterminal first-win-stopped histories supported");
  const future=h.reduce((m,z,c)=>{for(let r=z;r<H;r++)m|=bit(id(c,r));return m;},0n);
  function residual(p){
    const raw=[];
    for(const win of windows){
      const all=win.reduce((m,z)=>m|bit(z),0n);
      if((all&owned[1-p])!==0n)continue;
      const m=all&~owned[p];
      if(m===0n)throw Error("terminal original owner window");
      raw.push(m);
    }
    const unique=[...new Set(raw)].sort((a,b)=>popcnt(a)-popcnt(b)||(a<b?-1:a>b?1:0));
    const antichain=[];
    for(const m of unique)if(!antichain.some(k=>(m&k)===k))antichain.push(m);
    if(antichain.some(m=>(m&~future)!==0n))throw Error("nonfuture residual cell");
    return antichain;
  }
  const R=[residual(0),residual(1)],p=history.length&1;
  if(history==="44444"&&W===7&&H===6&&K===4&&(
       R[0].length!==48||R[1].length!==42||
       h.some((z,i)=>z!==(i===3?5:0))
  ))throw Error("canonical q sanity failed");
  const groups=new Map(), masks=R[p];
  for(let gi=0;gi<masks.length;gi++){
    for(let c=0;c<W;c++)for(let r=h[c];r<H;r++){
      const x=id(c,r);
      if((masks[gi]&bit(x))!==0n){
        if(!groups.has(x))groups.set(x,[]);
        groups.get(x).push(gi);break;
      }
    }
  }
  const frontier=h.map((r,c)=>r<H?id(c,r):null).filter(z=>z!==null);
  let staticIntersectionOps=0;
  function commonFor(indices,x){
    let m=future;
    for(const gi of indices){staticIntersectionOps++;m&=masks[gi];}
    return m&~bit(x);
  }
  function minConflictCore(indices,x){
    // Strictly static generator-intersection subset witness search.
    const choose=(prefix,start,k)=>{
      if(prefix.length===k){
        if(commonFor(prefix,x)===0n)return prefix.slice();
        return null;
      }
      for(let j=start;j<=indices.length-(k-prefix.length);j++){
        const hit=choose([...prefix,indices[j]],j+1,k);
        if(hit)return hit;
      }
      return null;
    };
    for(let k=1;k<=indices.length;k++){
      const ans=choose([],0,k);if(ans)return ans;
    }
    return null;
  }
  const gates=[];
  for(const [x,indices] of [...groups].sort((a,b)=>a[0]-b[0])){
    const common=commonFor(indices,x);
    const candidates=[];
    for(let z=0;z<N;z++)if((common&bit(z))!==0n){
      const a=z%W,b=Math.floor(z/W), xc=x%W,xr=Math.floor(x/W);
      const releaseDepth=b-h[a];
      const safe=frontier.includes(z)&&z!==x||a===xc&&b===xr+1;
      candidates.push({...cell(z),prerequisiteCountAtRoot:releaseDepth,gravitySafeByOriginalFirstTouchGuard:safe});
    }
    const safe=candidates.filter(z=>z.gravitySafeByOriginalFirstTouchGuard);
    const classification=safe.length?"ONE_SAFE_BLOCKER":candidates.length?"COMMON_LATE_ONLY":"EMPTY_COMMON_INTERSECTION";
    const core=classification==="EMPTY_COMMON_INTERSECTION"?minConflictCore(indices,x):null;
    gates.push({
      gate:cell(x),originalRootFrontier:h[x%W]===Math.floor(x/W),
      generatorsWithGate:indices,
      generatorMasksHex:indices.map(i=>"0x"+masks[i].toString(16)),
      commonMaskExcludingGateHex:"0x"+common.toString(16),
      commonCandidates:candidates,
      selectedCommonImmediateBlocker:safe.length?safe[0]:null,
      classification,
      staticMinimalZeroIntersectionGeneratorCore:core,
      sourceResidualGeneratorCount:indices.length
    });
  }
  const counts={};
  for(const g of gates)counts[g.classification]=(counts[g.classification]||0)+1;
  const coreSizes={};
  for(const g of gates)if(g.staticMinimalZeroIntersectionGeneratorCore){
    const size=g.staticMinimalZeroIntersectionGeneratorCore.length;
    coreSizes[size]=(coreSizes[size]||0)+1;
  }
  return {
    schema:"connect4.standard7x6_first_touch_static_gate_obstruction_v0_1",
    qualification:"SOURCE_STATIC_ONLY_NOT_A_WDL_OR_BEST_MOVE_PROOF",
    input:{W,H,K,history,firstWinStopped:true},
    observed:{originalGeometricWindows:windows.length,originalHeights:h,
      originalOwnerHistoricalStonesHex:owned.map(z=>"0x"+z.toString(16)),
      mover:p,originalAntichainCounts:R.map(xs=>xs.length),
      originalOwnerGeneratorsHex:masks.map(m=>"0x"+m.toString(16)),
      sourceGateCells:gates.length,sourceGateIncidences:gates.reduce((s,g)=>s+g.sourceResidualGeneratorCount,0),
      classifications:counts,minimalEmptyCoreSizes:coreSizes,
      staticGeneratorMaskIntersectionsIncludingCoreSearch:staticIntersectionOps,
      strategicallyInequivalentFutureGameValueQueries:0},
    gates
  };
}
