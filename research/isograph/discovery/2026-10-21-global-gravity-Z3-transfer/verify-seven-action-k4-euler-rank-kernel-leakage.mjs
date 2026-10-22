// Original 7x6 exact arithmetic cross-era action-indexed native K4/Euler kernel audit.
// No solved game labels, no recursive minimax. Node 22+: node verify-seven-action-k4-euler-rank-kernel-leakage.mjs
function verifySevenActionKernelLeakage() {
  const W=7,H=6,PHASE_COLUMNS=[1,2,3,5,6], D=[[1,0],[0,1],[1,1],[1,-1]];
  const assert=(q,s)=>{if(!q)throw new Error(s);};
  const wins=[], incident=Array.from({length:42},()=>[[],[],[],[]]);
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(let d=0;d<4;d++){
    const [dc,dr]=D[d], seq=[];
    for(let j=0;j<4;j++){const x=c+j*dc,y=r+j*dr;if(x>=0&&x<W&&y>=0&&y<H)seq.push(x+W*y);}
    if(seq.length===4) {
      wins.push({cells:seq,dir:d});
      for(const e of seq)incident[e][d].push(seq);
    }
  }
  assert(wins.length===69,"Original window count");
  function physicalRay(q,c,r,owner){
    for(const [dx,dy] of D) {
      let n=1;
      for(const sign of [-1,1])for(let j=1;j<=3;j++){
        const x=c+sign*j*dx,y=r+sign*j*dy;
        if(x<0||x>=W||y<0||y>=H||q[x+W*y]!==owner)break;
        n++;
      }
      if(n>=4)return true;
    }
    return false;
  }
  const source=[];
  for(let k=0;k<32;k++){
    const bit=PHASE_COLUMNS.map((_,i)=>(k>>i)&1),word=[7],q=Array(42).fill(0),h=Array(W).fill(0);
    for(let j=0;j<5;j++)if(!bit[j])word.push(PHASE_COLUMNS[j],PHASE_COLUMNS[j]);
    word.push(7);
    for(let j=0;j<5;j++)if(bit[j])word.push(PHASE_COLUMNS[j],PHASE_COLUMNS[j]);
    assert(word.length===12,"bad alternating word");
    for(let t=0;t<word.length;t++){
      const col=word[t]-1,row=h[col]++,owner=t%2+1;
      q[col+W*row]=owner;
      assert(!physicalRay(q,col,row,owner),"premature firstwin ray");
      assert(!wins.some(L=>L.cells.every(i=>q[i]===owner)),"premature firstwin K4");
    }
    assert(h.join(",")==="2,2,2,0,2,2,2","height face");
    assert(PHASE_COLUMNS.every((c,i)=>q[c-1]===(bit[i]?1:2)),"bit ownership convention");
    source.push({bit,q,h});
  }
  function toKey(mask){return mask.toString();}
  function extractPatterns(states){
    const all=new Map(),byDir=[[],[],[],[]];
    for(let li=0;li<wins.length;li++){
      const L=wins[li],patMasks=new Map();
      states.forEach((s,i)=>{
        if(!s) return;
        const key=L.cells.map(e=>s.q[e]).join("");
        patMasks.set(key,(patMasks.get(key)??0n)|(1n<<BigInt(i)));
      });
      for(const [pattern,mask]of patMasks) {
        const feat={mask,origin:"K4",label:`L${li}-${"HVRF"[L.dir]}-${pattern}`,direction:L.dir};
        byDir[L.dir].push(feat);
        if(!all.has(toKey(mask)))all.set(toKey(mask),feat);
      }
    }
    return {unique:[...all.values()],byDir};
  }
  function extractEuler(states){
    const all=new Map();let slots=0;
    for(const owner of [1,2])for(let e=0;e<42;e++){
      const dirs=incident[e].map((ls,d)=>({ls,d})).filter(x=>x.ls.length);
      for(let m=1;m<(1<<dirs.length);m++){
        let mask=0n;slots++;
        states.forEach((s,i)=>{
          if(!s)return;
          const c=e%W,actual=c+W*s.h[c];
          if(s.h[c]>=H||actual!==e)return;
          for(let j=0;j<dirs.length;j++)if((m>>j)&1) {
            if(!dirs[j].ls.some(L=>L.every(v=>v===e||s.q[v]===owner)))return;
          }
          mask|=1n<<BigInt(i);
        });
        if(!all.has(toKey(mask)))all.set(toKey(mask),{mask,origin:"Euler",label:`owner${owner}-cell${e}-mask${m}`});
      }
    }
    assert(slots===876,"Expected 438x2 Euler hazards");
    return {unique:[...all.values()],slots};
  }
  function abs(a){return a<0n?-a:a;}
  function gcd(a,b){a=abs(a);b=abs(b);while(b!==0n){const t=a%b;a=b;b=t;}return a;}
  function normalize(a){
    let g=0n;
    for(const x of a)if(x!==0n){g=gcd(g,x);if(g===1n)break;}
    if(g>1n)a=a.map(x=>x/g);
    const p=a.findIndex(x=>x!==0n);
    if(p>=0&&a[p]<0n)a=a.map(x=>-x);
    return {a,p};
  }
  function rankQ(features){
    const bas=new Map(),witnesses=[];
    for(const f of features){
      let v=Array.from({length:32},(_,i)=>(f.mask>>BigInt(i))&1n);
      for(let i=0;i<32;i++)if(bas.has(i)&&v[i]!==0n){
        const b=bas.get(i),den=b[i],num=v[i];
        v=normalize(v.map((x,j)=>den*x-num*b[j])).a;
      }
      const norm=normalize(v);
      if(norm.p>=0) {
        bas.set(norm.p,norm.a);
        witnesses.push(f.label);
      }
    }
    return {rank:bas.size,witnesses,pivots:[...bas.keys()].sort((a,b)=>a-b)};
  }
  function rankPrime(features,p){
    const bas=new Map();
    for(const f of features){
      let v=Array.from({length:32},(_,i)=>Number((f.mask>>BigInt(i))&1n));
      for(let i=0;i<32;i++)if(bas.has(i)&&v[i]!==0){
        const b=bas.get(i),k=v[i];
        v=v.map((x,j)=>((x-k*b[j])%p+p)%p);
      }
      const idx=v.findIndex(x=>x!==0);
      if(idx>=0){
        let a=v[idx],b=p,u=1,v2=0;
        while(b){const q=Math.floor(a/b);[a,b]=[b,a-q*b];[u,v2]=[v2,u-q*v2];}
        const inv=(u%p+p)%p;
        assert((inv*v[idx])%p===1,"mod inverse");
        bas.set(idx,v.map(x=>x*inv%p));
      }
    }
    return bas.size;
  }
  function makeMono(degMax){
    const o=[];
    for(let subset=0;subset<32;subset++){
      let weight=0;
      for(let j=0;j<5;j++)weight+=(subset>>j)&1;
      if(weight>degMax)continue;
      let mask=0n;
      source.forEach((s,i)=>{
        if(s.bit.every((b,j)=>!((subset>>j)&1)||b))mask|=1n<<BigInt(i);
      });
      o.push({mask,label:`monomial-${subset.toString(2)}`});
    }
    return o;
  }
  function MobiusFive(mask){
    let sum=0;
    source.forEach((s,i)=>{
      const pop=s.bit.reduce((a,b)=>a+b,0),v=Number((mask>>BigInt(i))&1n);
      sum+=(pop%2===0?-1:1)*v;
    });
    return sum;
  }
  const pat=extractPatterns(source),eul=extractEuler(source);
  const nat=[...pat.unique,...eul.unique],M4=makeMono(4),M5=makeMono(5);
  const baseRank=rankQ(nat);
  assert(baseRank.rank===18,"native rank differs from frozen probe");
  assert(rankQ(M4).rank===31&&rankQ(M5).rank===32,"full 5bit monomial basis");
  assert(rankQ([...nat,...M4]).rank===31,"native field unexpectedly fifth order");
  assert(pat.unique.length===47&&rankQ(pat.unique).rank===16,"source K4 pattern rank");
  assert(eul.unique.length===3&&rankQ(eul.unique).rank===2,"source Euler rank");
  const actionRows=[];
  let action4=null;
  for(let c=0;c<7;c++){
    const next=[],sink=[0,0],incidences=[0,0];
    for(const s of source){
      const h=s.h.slice(),q=s.q.slice(),row=h[c],e=c+W*row,par=s.bit.reduce((a,b)=>a+b,0)%2;
      assert(row<H,"nonplayable c");
      q[e]=1;h[c]++;
      const L=wins.filter(z=>z.cells.includes(e)&&z.cells.every(v=>q[v]===1));
      assert(Boolean(L.length)===physicalRay(q,c,row,1),"physical ray original K4 inconsistency");
      if(L.length){sink[par]++;incidences[par]+=L.length;next.push(null);}
      else next.push({q,h,bit:s.bit});
    }
    const p=extractPatterns(next),z=extractEuler(next),post=[...p.unique,...z.unique];
    const joined=rankQ([...nat,...post]),added=joined.rank-baseRank.rank;
    const prime1=rankPrime([...nat,...post],1009),prime2=rankPrime([...nat,...post],10007);
    assert(joined.rank===prime1&&joined.rank===prime2,"rational prime disagreement");
    const byDirection=p.byDir.map(d=>rankQ([...nat,...d]).rank-baseRank.rank);
    const result={column:c+1,sinkEvenOdd:sink,completedK4IncidencesEvenOdd:incidences,distinctPostK4PatternRows:p.unique.length,distinctPostEulerRows:z.unique.length,postNativeStandaloneRank:rankQ(post).rank,nativePlusPostRank:joined.rank,addedDirections:added,byOrientationAddedRank:byDirection,primeRanks:[prime1,prime2]};
    actionRows.push(result);
    if(c===3){action4={next,p,z,post,joined};}
    else assert(added===0&&sink[0]===0&&sink[1]===0,"unexpected other-column leakage/terminal");
  }
  assert(action4!==null,"missing c4");
  assert(actionRows[3].nativePlusPostRank===24&&actionRows[3].addedDirections===6,"c4 rank not 24");
  assert(JSON.stringify(actionRows[3].sinkEvenOdd)==="[6,6]","c4 sink non-match");
  const gBefore=source.map(s=>s.q[0]===2&&s.q[8]===2&&s.q[16]===0&&s.q[24]===0);
  const gAfter=action4.next.map(s=>!!s && s.q[0]===2&&s.q[8]===2&&s.q[16]===0&&s.q[24]===0);
  function maskFromBits(vals){
    return vals.reduce((m,v,i)=>v?m|(1n<<BigInt(i)):m,0n);
  }
  const gb=maskFromBits(gBefore),ga=maskFromBits(gAfter),f={mask:ga,label:"P1 rising grade2 survivor"};
  const gBeforeMom=[0,0],gAfterMom=[0,0];
  source.forEach((s,i)=>{const p=s.bit.reduce((a,b)=>a+b,0)%2;gBeforeMom[p]+=Number(gBefore[i]);gAfterMom[p]+=Number(gAfter[i]);});
  assert(JSON.stringify(gBeforeMom)==="[4,4]"&&JSON.stringify(gAfterMom)==="[3,2]","grade2 survivor witness");
  assert(MobiusFive(gb)===0&&MobiusFive(ga)===-1,"fifth order coefficient wrong");
  assert(rankQ([...M4,f]).rank===32,"degree4+f not full");
  const postFeatureIsF=action4.p.unique.some(x=>x.mask===ga);
  assert(postFeatureIsF,"true original rising grade2 missing from native output pattern features");
  assert(rankQ([...nat,...action4.post,...M4]).rank===32,"nat closure plus monomials not full");
  const deltaEvenOdd=gAfterMom[0]-gAfterMom[1];
  const rootLabels=action4.joined.witnesses.slice(baseRank.rank);
  return {
    status:"PASS_EXACT_RATIONAL_7X6_NATIVE_K4_EULER_ACTION_KERNEL_NONCLOSURE",
    rootOrOptimalSolveData:false,
    originalWins:wins.length,liveSourceFaceStates:source.length,
    nativeSource:{uniqueK4PatternObservables:pat.unique.length,K4Rank:rankQ(pat.unique).rank,uniqueEulerObservables:eul.unique.length,rawEulerSlots:eul.slots,EulerRank:rankQ(eul.unique).rank,nativeRank:baseRank.rank},
    actionIndexed:actionRows,
    nativeNewDirectionsAfterC4:rootLabels,
    risingP1Grade2:{beforeEvenOdd:gBeforeMom,afterEvenOdd:gAfterMom,postOutputOriginalK4Feature:postFeatureIsF,fifthPhysicalMobiusCoeff:MobiusFive(ga),evenMinusOdd:deltaEvenOdd},
    completeOwnerFourierDegree4Rank:rankQ(M4).rank,
    completeOwnerFourierPlusC4PullbackRank:rankQ([...M4,f]).rank,
    fullOwnerFaceRank:rankQ(M5).rank,
    globalRootWinningInvariantProved:false
  };
}
console.log(JSON.stringify(verifySevenActionKernelLeakage(), null, 2));
