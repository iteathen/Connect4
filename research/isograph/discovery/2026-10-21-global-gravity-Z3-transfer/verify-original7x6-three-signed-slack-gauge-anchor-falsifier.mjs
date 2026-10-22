// Canonical c7-anchored 32-source real7x6 five-switch proof of three signed slacks: insufficient for even one-step WIN; exact two-anchor repair. No solved game data.
function verifyAnchorsForThreeSlacks(){
 const W=7,H=6,DD=[[1,0],[0,1],[1,1],[1,-1]],cols=[1,2,3,5,6],all=[];
 const assert=(x,s)=>{if(!x)throw Error(s)};
 const lines=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DD){
  const z=Array.from({length:4},(_,t)=>[x+t*dx,y+t*dy]);
  if(z.every(([c,r])=>c>=0&&c<W&&r>=0&&r<H))lines.push(z.map(([c,r])=>c+7*r));
 }
 assert(lines.length===69,"original69");
 function ray(q,x,y,p){for(const [dx,dy] of DD){let k=1;
  for(const sg of [-1,1])for(let n=1;n<4;n++){const c=x+sg*n*dx,r=y+sg*n*dy;if(c<0||c>=W||r<0||r>=H||q[c+W*r]!==p)break;k++}
  if(k>=4)return true}return false}
 const run=(z,v)=>z.some((_,i)=>i+2<z.length&&z[i]===v&&z[i+1]===v&&z[i+2]===v);
 for(let b=0;b<32;b++){
  const x=cols.map((_,i)=>(b>>i)&1),word=[7];cols.forEach((c,i)=>{if(!x[i])word.push(c,c)});word.push(7);
  cols.forEach((c,i)=>{if(x[i])word.push(c,c)});assert(word.length===12,"rank12");
  const q=Array(42).fill(0),h=Array(7).fill(0);
  for(let t=0;t<12;t++){let c=word[t]-1,r=h[c]++,p=t%2+1;q[c+W*r]=p;assert(!ray(q,c,r,p),"earlier ray firstwin");
   assert(!lines.some(L=>L.every(i=>q[i]===p)),"earlier original WIN")}
  assert(h.join(",")==="2,2,2,0,2,2,2","height guard");
  const y=[...x.slice(0,3),x[3],x[4],1]; // actual physical c1 c2 c3 c5 c6 c7
  const delta=[x[1]-x[0],x[2]+x[3]-1,x[3]+x[4]-1],Wlower=+run(y,1),Uupper=+run(y,0);
  const f=+(delta[0]>0 && delta[1]<=0 && delta[2]<=0);
  const qq=q.slice();qq[3]=1;assert(ray(qq,3,0,1)===!!Wlower,"true K4 lower P0 c4");
  assert(lines.some(L=>L.includes(3)&&L.every(i=>qq[i]===1))===!!Wlower,"physical K4 lower");
  const g=+(q[0]===2&&q[8]===2&&q[16]===0&&q[24]===0);
  assert(f===g*(1-Wlower),"narrow original rising survivor");
  all.push({x,delta,key:delta.join(","),Wlower,Uupper,f,history:word.join("")});
 }
 const groups=new Map();
 for(const row of all){let v=groups.get(row.key)??[];v.push(row);groups.set(row.key,v)}
 assert(groups.size===21,"21 three-signed-slack states");
 const ambiguousW=[...groups].filter(([k,a])=>new Set(a.map(v=>v.Wlower)).size>1).map(x=>x[0]);
 const ambiguousU=[...groups].filter(([k,a])=>new Set(a.map(v=>v.Uupper)).size>1).map(x=>x[0]);
 const narrowAmb=[...groups].filter(([k,a])=>new Set(a.map(v=>v.f)).size>1);
 assert(ambiguousW.length===3&&ambiguousU.length===3&&narrowAmb.length===0,"slack grouped discrepancies");
 const zero=groups.get("0,0,0");
 assert(zero.length===4,"origin fiber has 4 states");
 const counter=zero.filter(r=>r.x.join(",")==="1,1,1,0,1"||r.x.join(",")==="0,0,0,1,0");
 assert(counter.length===2&&new Set(counter.map(z=>z.Wlower)).size===2&&new Set(counter.map(z=>z.Uupper)).size===2,"frozen witness");
 const sufficient={};for(const obs of ["Wlower","Uupper","joint"]){sufficient[obs]={};
  for(let k=0;k<=2;k++){let good=[];
   function walk(start,inds){if(inds.length===k){
    const part=new Map();
    for(const z of all){const key=z.key+"|"+inds.map(i=>z.x[i]).join("");
     const v=obs==="joint"?`${z.Wlower}${z.Uupper}`:String(z[obs]);
     if(part.has(key)&&part.get(key)!==v)return;
     part.set(key,v)}
    good.push(inds.map(i=>cols[i]));return}
    for(let i=start;i<=5-(k-inds.length);i++)walk(i+1,[...inds,i]);
   }
   walk(0,[]);sufficient[obs]["size"+k]=good;
  }
 }
 assert(sufficient.joint.size0.length===0&&sufficient.joint.size1.length===0&&sufficient.joint.size2.length===6,"minimal raw owner anchors");
 function reconstruct(x1,x5,delta){return [x1,x1+delta[0],1+delta[1]-x5,x5,1+delta[2]-x5]}
 for(const {x,delta}of all)assert(JSON.stringify(reconstruct(x[0],x[3],delta))===JSON.stringify(x),"exact two-anchor reconstruction");
 return {
  status:"EXACT_ORIGINAL_7X6_SIGNED_SLACK_ANCHOR_INSUFFICIENCY",
  originalK4:69,strictLegalAlternatingFirstwinFreeRank12Boards:32,
  slacks:["x2-x1","x3+x5-1","x5+x6-1"],
  exactLinearRankOfThreeSlackConstraints:3,integerKernelDimension:2,
  exactReconstruction:"x2=x1+du, x3=1+db-x5, x6=1+dd-x5; free anchors x1,x5",
  completeSlackTripleKeyCount:groups.size,
  ambiguousSourceEmissionKeys:{P0LowerWin:ambiguousW, P0UpperWin:ambiguousU},
  originalRisingP1Grade2SurvivorWellDefined:true,
  frozenZeroSlackFourBoards:zero.map(z=>({x:z.x,Wlower:z.Wlower,Uupper:z.Uupper,selectedRisingSurvivor:z.f,history:z.history})),
  frozenExactCounterexample:counter.map(z=>({x:z.x,Wlower:z.Wlower,Uupper:z.Uupper,history:z.history})),
  rawOwnerAnchorSufficiency:sufficient,
  historicalSeptemberSignedDescriptorTriangleIdentified:false, full7x6PerfectPlayProved:false
 };
}
console.log(JSON.stringify(verifyAnchorsForThreeSlacks(),null,2));
