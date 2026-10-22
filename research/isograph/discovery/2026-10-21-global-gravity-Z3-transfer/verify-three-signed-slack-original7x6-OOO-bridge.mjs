// Exact source-only three signed slack cross-era bridge, original 7x6. Node 22+ plain JavaScript.
function verifyThreeSignedSlacks() {
 const W=7,H=6,paths=[[1,0],[0,1],[1,1],[1,-1]],cols=[1,2,3,5,6];
 const check=(condition,msg)=>{if(!condition)throw Error(msg);};
 const lines=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of paths){
   let a=[];for(let t=0;t<4;t++){const c=x+t*dx,r=y+t*dy;if(c>=0&&c<W&&r>=0&&r<H)a.push(c+W*r);}
   if(a.length===4)lines.push(a);
 }
 check(lines.length===69,"original 69");
 function rayWin(q,x,y,p){
  for(const [dx,dy]of paths){let k=1;
    for(const sign of [-1,1])for(let t=1;t<4;t++){
     const xx=x+sign*dx*t,yy=y+sign*dy*t;
     if(xx<0||xx>=W||yy<0||yy>=H||q[xx+W*yy]!==p)break;
     k++;
    }
    if(k>=4)return true;
  }return false;
 }
 const hist=[new Map(),new Map()],flags=[new Map(),new Map()];
 const before=[0,0],after=[0,0],win=[0,0],live=[0,0],allRows=[];
 for(let mask=0;mask<32;mask++){
  const x=cols.map((_,i)=>(mask>>i)&1),word=[7];
  cols.forEach((c,i)=>{if(!x[i])word.push(c,c);});
  word.push(7);
  cols.forEach((c,i)=>{if(x[i])word.push(c,c);});
  check(word.length===12,"12move");
  const q=Array(42).fill(0),h=Array(7).fill(0);
  for(let t=0;t<word.length;t++){
   const c=word[t]-1,r=h[c]++,p=1+(t%2);
   q[c+W*r]=p;
   check(!rayWin(q,c,r,p),"illegal earlier firstwin");
   check(!lines.some(L=>L.every(i=>q[i]===p)),"line win before firstwin");
  }
  check(h.join(",")==="2,2,2,0,2,2,2","face heights");
  const par=x.reduce((a,b)=>a+b,0)%2;
  const du=x[1]-x[0],db=x[2]+x[3]-1,dd=x[3]+x[4]-1;
  check([du,db,dd].every(z=>[-1,0,1].includes(z)),"integer slack bound");
  const u=Number(q[0]===2 && q[8]===2 && q[16]===0 && q[24]===0);
  const b=Number(q[2]===1&&q[4]===1);
  const d=Number(q[4]===1&&q[5]===1);
  check(u===Number(du>0) && b===Number(db>0) && d===Number(dd>0),"source slack gate");
  const [sKey,fKey]=[[du,db,dd].join(","),`${u}${b}${d}`];
  hist[par].set(sKey,(hist[par].get(sKey)||0)+1);
  flags[par].set(fKey,(flags[par].get(fKey)||0)+1);
  const nq=q.slice();nq[3]=1;
  const physical=rayWin(nq,3,0,1);
  const source=lines.filter(L=>L.includes(3)&&L.every(i=>nq[i]===1));
  check(physical===Boolean(source.length),"true original firstwinner discrepancy");
  const f=u*(1-b)*(1-d);
  check(f===u*Number(!physical),"guarded triadic survivor");
  before[par]+=u;after[par]+=f;win[par]+=Number(physical);live[par]+=Number(!physical);
  allRows.push({x,slacks:[du,db,dd],flags:[u,b,d],history:word.join(""),f});
 }
 check(before.join(",")==="4,4"&&after.join(",")==="3,2"&&win.join(",")==="6,6"&&live.join(",")==="10,10","correct sink/residual history mass");
 function marginal(H,indices){
  const m=new Map();
  for(const [key,v] of H){
   const a=key.split(",").map(Number),b=indices.map(i=>a[i]).join(",");
   m.set(b,(m.get(b)||0)+v);
  }
  return [...m.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
 }
 const histogramChecks=[];
 for(const is of [[0],[1],[2],[0,1],[0,2],[1,2]]){
  const h0=marginal(hist[0],is),h1=marginal(hist[1],is);
  check(JSON.stringify(h0)===JSON.stringify(h1),"signed slack marginal mismatch "+is);
  histogramChecks.push({indices:is,uniqueValues:h0.length,exactlyMatched:true});
 }
 const union=[...new Set([...hist[0].keys(),...hist[1].keys()])].sort();
 check(union.length===21,"signed slack triple feasible support");
 const signedDelta=union.map(key=>({signedSlacks:key,even:hist[0].get(key)||0,odd:hist[1].get(key)||0,diff:(hist[0].get(key)||0)-(hist[1].get(key)||0)}));
 const nonzero=signedDelta.filter(a=>a.diff);
 check(nonzero.length===18,"different signed slack joint buckets");
 const signPatterns=[...new Set([...flags[0].keys(),...flags[1].keys()])].sort();
 check(signPatterns.length===8,"all thresholded 3cube corners realized");
 const threeCube=signPatterns.map(key=>{
  const b=[...key].map(Number),diff=(flags[0].get(key)||0)-(flags[1].get(key)||0);
  check(diff===((b[0]+b[1]+b[2])%2?1:-1),"pure 3rd Walsh parity");
  return {flags:key,even:flags[0].get(key)||0,odd:flags[1].get(key)||0,diff};
 });
 // Algebraic check that original pair-delta vectors are NOT three independent differences.
 const a=[1,3,4,2],b=[2,5,4,3],c=[6,3,7,1];
 const subtract=(x,y)=>x.map((u,i)=>u-y[i]);
 const ab=subtract(b,a),bc=subtract(c,b),ac=subtract(c,a);
 check(ab.every((v,i)=>v+bc[i]-ac[i]===0),"integer pair delta triangle not flat");
 const sign=v=>v>0?1:v<0?-1:0;
 const signDefect=ab.map((v,i)=>sign(v)+sign(bc[i])-sign(ac[i]));
 check(signDefect.some(v=>v!==0),"sign map accidentally linear in chosen control");
 return {
   status:"PASS_EXACT_GENUINE_7X6_THREE_SIGNED_SLACK_TRIADIC_SOURCE_CONDITION",
   allOriginalK4:lines.length,sourceLegalFirstwinFree:32,player:"P0",action:"column4 row1",
   sourceSignedSlackDefinitions:{du:"x2-x1",db:"x3+x5-1",dd:"x5+x6-1"},
   sourceGateFormula:"f = [du>0] * [db<=0] * [dd<=0]",
   marginalSignedSlackChecks:histogramChecks,
   feasibleThreeSignedSlackTriples:union.length,
   differentSignedSlackJointBuckets:nonzero.length,
   signedSlackJointDifference:nonzero,
   signedThresholdEightCornerProjection:threeCube,
   beforeRisingP1Grade2:before,afterLiveRisingP1Grade2:after,firstwinSinks:win,liveBoards:live,
   sourceOldThreePairDeltaClosure:"(v_b-v_a)+(v_c-v_b)-(v_c-v_a)=0",
   exemplarNonlinearSignDifference:signDefect,
   historicalOOOEquivalenceEstablished:false,
   globalRootProofEstablished:false
 };
}
console.log(JSON.stringify(verifyThreeSignedSlacks(),null,2));
