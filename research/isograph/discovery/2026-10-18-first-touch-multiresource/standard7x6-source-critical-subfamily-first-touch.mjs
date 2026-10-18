// Pure original current q=(h,R0,R1) source-only sufficient NO_FORCED_WIN guard.
// Guarded proof frozen in docs/research/2026-10-18-selected-critical-subfamily-first-touch-certificate.md
// Initial deterministic selected critical subset: highest vertical consecutive pair,
// else first two original root frontiers, else original whole generator.
// No game WDL recursion, future alternative child q, policy search, or current child values.
export function createSourceCriticalSubfamilyFirstTouch({width:W,height:H,connect:K}){
  if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)
    throw Error("invalid gravity geometry");
  const N=W*H, bit=z=>1n<<BigInt(z), id=(c,r)=>r*W+c;
  function compute(q){
    const h=q?.h;
    if(!Array.isArray(h)||h.length!==W||h.some(z=>!Number.isInteger(z)||z<0||z>H)||
      !Array.isArray(q.R0)||!Array.isArray(q.R1)||
      [...q.R0,...q.R1].some(z=>typeof z!=="bigint"||z<=0n))
      throw Error("original nonterminal q=(h,R0,R1) required");
    const n=h.reduce((a,b)=>a+b,0),p=n&1;
    if(n>=N)throw Error("full board not a nonterminal source");
    const future=h.reduce((m,row,c)=>{for(let r=row;r<H;r++)m|=bit(id(c,r));return m;},0n);
    const orig=p===0?q.R0:q.R1;
    const front=h.map((r,c)=>r<H?id(c,r):null).filter(x=>x!==null);
    const sets=[], selection=[], gateGroups=new Map();
    const stat={
      sourceOriginalWinGenerators:orig.length,
      selectedCriticalVerticalPairs:0,selectedCriticalRootFrontierPairs:0,selectedCriticalFullRequirements:0,
      criticalGateCells:0,criticalGateIncidences:0,
      criticalGateCommonImmediateReply:0,criticalGateUnprotected:0,
      sourceOriginalGeneratorMembershipAndMaskChecks:0,
      sourceStrategicallyDistinctFutureGameValueQueries:0,
      sourceStrategicFutureQChildrenConstructed:0,
      sourceStaticSubsetCandidatesEnumerated:0
    };
    if(orig.length===0)return {status:"INCOMPLETE",reason:"EXTINCT_SOURCE_HANDLED_BY_PRIOR_CERTIFICATE",statistics:stat};
    for(let gi=0;gi<orig.length;gi++){
      const G=orig[gi];
      if((G&~future)!==0n)throw Error("nonfuture owner requirement");
      let pair=null,kind="FULL_REQUIREMENT";
      // Highest two consecutive original G cells in one column; tie by lower physical ID.
      for(let r=0;r+1<H;r++)for(let c=0;c<W;c++){
        const x=id(c,r),y=id(c,r+1);
        stat.sourceOriginalGeneratorMembershipAndMaskChecks+=2;
        if((G&bit(x))!==0n&&(G&bit(y))!==0n)
          if(pair===null||r>Math.floor(pair[0]/W)||
             r===Math.floor(pair[0]/W)&&x<pair[0]) pair=[x,y];
      }
      if(pair!==null){kind="VERTICAL_PAIR";stat.selectedCriticalVerticalPairs++;}
      else{
        const f=front.filter(x=>(G&bit(x))!==0n);
        stat.sourceOriginalGeneratorMembershipAndMaskChecks+=front.length;
        if(f.length>=2){pair=f.slice(0,2);kind="ROOT_FRONTIER_PAIR";stat.selectedCriticalRootFrontierPairs++;}
        else stat.selectedCriticalFullRequirements++;
      }
      const C=pair!==null?bit(pair[0])|bit(pair[1]):G;
      if((C&~G)!==0n)throw Error("critical set not a subset of owner generator");
      sets.push(C);
      selection.push({originalGeneratorIndex:gi,originalGHex:"0x"+G.toString(16),
        selectedCriticalSetHex:"0x"+C.toString(16),kind,
        selectedPairPhysicalCellIDs:pair});
      for(let c=0;c<W;c++){
        let x=null;
        for(let r=h[c];r<H;r++){
          const z=id(c,r);
          if((C&bit(z))!==0n){x=z;break;}
        }
        if(x!==null){
          const bucket=gateGroups.get(x)||[];
          bucket.push(gi);
          gateGroups.set(x,bucket);
          stat.criticalGateIncidences++;
        }
      }
    }
    const responses=[],failures=[];
    stat.criticalGateCells=gateGroups.size;
    for(const [x,indices] of [...gateGroups].sort((a,b)=>a[0]-b[0])){
      let common=future;
      for(const i of indices){
        common&=sets[i];
        stat.sourceOriginalGeneratorMembershipAndMaskChecks++;
      }
      common&=~bit(x);
      const c=x%W,r=Math.floor(x/W);
      const up=r+1<H?id(c,r+1):null;
      let y=null,kind=null;
      if(up!==null&&(common&bit(up))!==0n){
        y=up;kind="VERTICAL_SUCCESSOR";
      }else for(const z of front){
        if(z!==x&&(common&bit(z))!==0n){y=z;kind="INDEPENDENT_ROOT_FRONTIER";break;}
      }
      if(y===null){
        stat.criticalGateUnprotected++;
        failures.push({xOriginalID:x,originalColumn:c+1,originalRow:r+1,
          indices,commonHex:"0x"+common.toString(16)});
        continue;
      }
      if(indices.some(i=>(sets[i]&bit(y))===0n))
        throw Error("selected response not in all critical families");
      if(kind==="VERTICAL_SUCCESSOR"&&y!==x+W)
        throw Error("unsafe chosen successor");
      if(kind==="INDEPENDENT_ROOT_FRONTIER"&&h[y%W]!==Math.floor(y/W))
        throw Error("unsafe chosen originally playable frontier");
      stat.criticalGateCommonImmediateReply++;
      responses.push({pFirstCriticalTouchOriginalID:x,
        oOriginalResponseID:y,responseKind:kind,
        originalGeneratorIndices:indices});
    }
    if(failures.length)return {status:"INCOMPLETE",
      reason:"SOME_SELECTED_CRITICAL_SUBFAMILY_GATES_HAVE_NO_COMMON_SAFE_REPLY",
      originalCurrentMover:p,
      statistics:stat,
      firstUnprotectedCriticalGates:failures.slice(0,12),
      totalUnprotectedCriticalGates:failures.length};
    return {status:"CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN",
      kind:"ORIGINAL_SOURCE_SELECTED_CRITICAL_SUBFAMILY_FIRST_TOUCH",
      originalCurrentMover:p,originalDefender:1-p,
      rootOriginalHeights:h.slice(),originalOwnerResidualSourceRHex:orig.map(z=>"0x"+z.toString(16)),
      staticCriticalSubfamilySelection:selection,
      staticCriticalGateResponseMap:responses,
      scalarRootWDL:"UNKNOWN",
      level2BestOriginalColumn:"INCOMPLETE",
      statistics:stat};
  }
  return Object.freeze({width:W,height:H,connect:K,compute});
}
