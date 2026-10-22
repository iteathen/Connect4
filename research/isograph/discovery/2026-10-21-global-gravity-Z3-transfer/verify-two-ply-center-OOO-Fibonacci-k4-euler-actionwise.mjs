// Exhaustive original 7x6 first-win-safe two-ply action-indexed K4/Euler closure and three-turn Fibonacci dual hazard. No solved oracle.
function verifyTwoPlyCenterAndFibonacci(){
 const W=7,H=6,D=[[1,0],[0,1],[1,1],[1,-1]],outs=[1,2,3,5,6,7],assert=(b,s)=>{if(!b)throw Error(s)};
 const lines=[],touch=Array.from({length:42},()=>[[],[],[],[]]);
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(let di=0;di<4;di++){
  const [dc,dr]=D[di],a=Array.from({length:4},(_,k)=>[c+k*dc,r+k*dr]);
  if(a.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H)){const z=a.map(([x,y])=>x+W*y);lines.push({di,z});for(const e of z)touch[e][di].push(z)}
 }
 assert(lines.length===69,"K4 windows");
 function ray(q,c,r,p){for(const [dx,dy] of D){let ct=1;for(const sgn of [-1,1])for(let k=1;k<4;k++){
  const x=c+sgn*k*dx,y=r+sgn*k*dy;if(x<0||x>=W||y<0||y>=H||q[x+W*y]!==p)break;ct++}
  if(ct>=4)return true}return false}
 function firstwin(s,c,p){assert(s&&s.h[c]<6,"valid legal action");const q=s.q.slice(),h=s.h.slice(),r=h[c]++,e=c+7*r;q[e]=p;
  const hit=lines.filter(L=>L.z.includes(e)&&L.z.every(x=>q[x]===p));assert(!!hit.length===ray(q,c,r,p),"K4 versus ray");return {state:hit.length?null:{q,h,par:s.par,y:s.y},hit:hit.length,row:r}}
 function build(anchor){const free=outs.filter(x=>x!==anchor),arr=[];
 for(let code=0;code<32;code++){
  const bits=free.map((_,i)=>(code>>i)&1),word=[anchor];
  for(let i=0;i<5;i++)if(!bits[i])word.push(free[i],free[i]);
  word.push(anchor);
  for(let i=0;i<5;i++)if(bits[i])word.push(free[i],free[i]);
  assert(word.length===12,"twelve moves");const q=Array(42).fill(0),h=Array(7).fill(0);
  for(let t=0;t<12;t++){const c=word[t]-1,r=h[c]++,p=1+t%2;q[c+7*r]=p;
   assert(!ray(q,c,r,p),"premature WIN");assert(!lines.some(L=>L.z.every(i=>q[i]===p)),"window first-win")}
  assert(h.join(",")==="2,2,2,0,2,2,2","correct heights");
  const y=outs.map(c=>+(q[c-1]===1));
  assert(y[outs.indexOf(anchor)]===1&&free.every((c,i)=>y[outs.indexOf(c)]===bits[i]),"anchor owner bits");
  arr.push({q,h,par:bits.reduce((a,b)=>a+b,0)%2,y,word:word.join("")});
 }
 return arr}
 function masks(arr){
  const k4=new Map(),dirs=[[],[],[],[]];let allEuler=0;const add=(m,label,d)=>{const k=m.toString();if(!k4.has(k))k4.set(k,{mask:m,label,d})};
  for(let li=0;li<lines.length;li++){
   const {di,z}=lines[li],dct=new Map();
   arr.forEach((s,i)=>{if(s){const key=z.map(e=>s.q[e]).join("");dct.set(key,(dct.get(key)??0n)|(1n<<BigInt(i)))}});
   for(const [pat,mask] of dct){add(mask,"L"+li+pat,di);dirs[di].push({mask,label:"L"+li+pat})}
  }
  const eul=new Map();
  for(let p=1;p<=2;p++)for(let e=0;e<42;e++){
   const avail=[0,1,2,3].filter(d=>touch[e][d].length);
   for(let mask=1;mask<(1<<avail.length);mask++){let v=0n;allEuler++;
    arr.forEach((s,i)=>{if(!s)return;let c=e%W;if(s.h[c]>=H||e!==c+W*s.h[c])return;
     for(let k=0;k<avail.length;k++)if((mask>>k)&1){
      if(!touch[e][avail[k]].some(z=>z.every(x=>x===e||s.q[x]===p)))return;
     }
     v|=1n<<BigInt(i);
    });
    if(!eul.has(v.toString()))eul.set(v.toString(),{mask:v,label:`E${p}_${e}_${mask}`});
   }
  }
  assert(allEuler===876,"438x2 Euler slots");
  return {k4:[...k4.values()],eul:[...eul.values()],dirs,all:[...k4.values(),...eul.values()]}
 }
 function abs(x){return x<0n?-x:x}
 function gcd(a,b){a=abs(a);b=abs(b);while(b){[a,b]=[b,a%b]}return a}
 function rankQ(features){const basis=new Map();
  for(const f of features){let v=Array.from({length:32},(_,i)=>(f.mask>>BigInt(i))&1n);
   for(let c=0;c<32;c++){if(v[c]===0n)continue;
    if(!basis.has(c)){basis.set(c,v);break}
    const b=basis.get(c),k=v[c],den=b[c];v=v.map((x,j)=>den*x-k*b[j]);let g=0n;
    for(const x of v)g=gcd(g,x);if(g>1n)v=v.map(x=>x/g);
   }
  }return basis.size}
 function rankMod(features,p){const basis=new Map();function inv(a){let r=1,b=a,n=p-2;for(;n;n>>=1,b=b*b%p)if(n&1)r=r*b%p;return r}
  for(const f of features){let v=Array.from({length:32},(_,i)=>Number((f.mask>>BigInt(i))&1n));
   for(let i=0;i<32;i++){if(!v[i])continue;
    if(!basis.has(i)){let invx=inv(v[i]);basis.set(i,v.map(x=>x*invx%p));break}
    const b=basis.get(i),a=v[i];v=v.map((x,j)=>(x-a*b[j]%p+p)%p);
   }
  }return basis.size}
 const totals=[],transition=[];
 function runCount(y,b){return y.some((_,i)=>i+2<6&&y[i]===b&&y[i+1]===b&&y[i+2]===b)}
 let allSafe=0;for(let m=0;m<64;m++){const y=Array.from({length:6},(_,i)=>(m>>i)&1);allSafe+=Number(!runCount(y,1)&&!runCount(y,0))}assert(allSafe===26,"Fibonacci safe words");
 for(const anchor of outs){
  const src=build(anchor),F0=masks(src),r0=rankQ(F0.all),post1=[],p0sink=[0,0],p0lineInc=[0,0];
  for(const s of src){const {state,hit}=firstwin(s,3,1);post1.push(state);if(hit){p0sink[s.par]++;p0lineInc[s.par]+=hit}}
  const F1=masks(post1),r01=rankQ([...F0.all,...F1.all]),row={anchor,rank0:r0,rank01:r01,firstwinP0Parity:p0sink,firstwinIncidence:p0lineInc,p1:[],thirdTurn:[]};
  assert(r01-r0===6,"previous result six");
  let allReply=[...F0.all,...F1.all];
  for(let d=0;d<7;d++){
   const states=[],p1sink=[0,0],otherInc=[0,0];
   for(let i=0;i<32;i++){
    if(!post1[i]){states.push(null);continue}
    const hit=firstwin(post1[i],d,2);
    if(hit.hit){p1sink[src[i].par]++;otherInc[src[i].par]+=hit.hit}
    states.push(hit.state)
   }
   const F2=masks(states),stack=[...F0.all,...F1.all,...F2.all],r2=rankQ(stack);
   let mod1=rankMod(stack,1009),mod2=rankMod(stack,10007);
   assert(r2===mod1&&r2===mod2,"Q/prime disagreement");
   let kOnly=rankQ([...F0.all,...F1.all,...F2.k4])-r01;
   let eOnly=rankQ([...F0.all,...F1.all,...F2.eul])-r01;
   assert(p1sink.every(x=>x===0),"P1 unexpected WIN");
   row.p1.push({column:d+1,rank02:r2,added:r2-r01,sourceK4added:kOnly,sourceEulerAdded:eOnly,firstwinP1:p1sink,live:states.filter(Boolean).length});
   allReply.push(...F2.all);
   if(d!==3){
    const thirdWin=[0,0],thirdInc=[0,0],safe=[0,0];
    for(let i=0;i<32;i++){
      if(!states[i])continue;
      const final=firstwin(states[i],3,1);
      const wantLower=runCount(src[i].y,1),wantUpper=runCount(src[i].y,0);
      assert(!wantLower,"prior lower center WIN leaked");
      assert(!!final.hit===wantUpper,"upper FIRSTWIN not 000");
      if(final.hit){thirdWin[src[i].par]++;thirdInc[src[i].par]+=final.hit}
      else safe[src[i].par]++;
    }
    assert(safe[0]+safe[1]===13,"13 Fibonacci dual safe");
    assert(thirdWin[0]+thirdWin[1]===19-(p0sink[0]+p0sink[1]),"19 wins two turns");
    row.thirdTurn.push({P1Column:d+1,rank15P0UpperWinParity:thirdWin,rank15P0UpperIncidencesParity:thirdInc,rank15LiveParity:safe});
   } else {
    const sink=[0,0],centerThreat=[];
    for(let i=0;i<32;i++){if(!states[i])continue;const next=firstwin(states[i],3,1);sink[src[i].par]+=Number(next.hit>0);
     if(next.state) {
      const q=next.state.q,win3=lines.filter(L=>L.di===0&&L.z.includes(3+7*2)&&L.z.filter(e=>q[e]===1).length===1&&L.z.filter(e=>q[e]===0).length===3);
      centerThreat.push(win3.length);
     }
    }
    assert(sink[0]===0&&sink[1]===0,"center-to-center-to-center threat");
    assert(centerThreat.every(n=>n===4),"center r3 grade3");
    row.P1CenterReplyAllowsP0CenterR3WithFourHGrade3={P0WinParity:sink,sourceRow3HGrade3CountEach:4,verifiedStates:centerThreat.length};
   }
  }
  row.rankJoinAllP1=rankQ(allReply);
  assert(row.firstwinP0Parity[0]===row.firstwinP0Parity[1],"parity event equal");
  for(const n of row.thirdTurn)assert(n.rank15LiveParity[0]+n.rank15LiveParity[1]===13,"dual safe 13");
  totals.push(row);
 }
 for(let i=0;i<3;i++){const a=totals[i],b=totals[5-i];assert(a.anchor+b.anchor===8,"reflection anchors");
  assert(a.rank0===b.rank0&&a.rank01===b.rank01&&a.rankJoinAllP1===b.rankJoinAllP1,"reflection ranks");
  for(let j=0;j<7;j++){const x=a.p1[j],y=b.p1[6-j];assert(x.rank02===y.rank02&&x.firstwinP1.join(",")===y.firstwinP1.join(","),"reflection replies")}}
 return {status:"EXACT_NATIVE_K4_EULER_TWO_PLY_AND_COMPLEMENTARY_CENTER_RUNS",physicallyLegalRank12Constructions:192,originalK4:lines.length,winRule:"P0 center row1 iff peripheral y contains 111; after offcenter P1, P0 center row2 iff peripheral y contains 000 on firstwinfree survivors",safeWordsTotal:allSafe,fixedAnchorDualSafe:13,anchors:totals,qualification:"isolated JS exact Q plus prime1009/10007 and independent physical ray"}
}
console.log(JSON.stringify(verifyTwoPlyCenterAndFibonacci(),null,2));
