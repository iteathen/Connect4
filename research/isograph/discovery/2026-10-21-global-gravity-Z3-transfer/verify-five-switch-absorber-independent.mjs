// Pure JavaScript independent Connect4 7x6 exact action-indexed absorption test.
// No library imports; run Node 22+ via: node verify-five-switch-absorber-independent.mjs
// Original 69 K4 window generator, independent ray checker, all physical marginal histograms.
function verify(){
 const W=7,H=6, D=[[1,0],[0,1],[1,1],[1,-1]], switches=[1,2,3,5,6];
 const check=(b,msg)=>{if(!b)throw Error(msg)};
 const K=[], through=Array.from({length:42},()=>[[],[],[],[]]);
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(let d=0;d<4;d++){
   const [dx,dy]=D[d], cells=[];
   for(let i=0;i<4;i++){const x=c+i*dx,y=r+i*dy;if(x>=0&&x<W&&y>=0&&y<H)cells.push(x+W*y)}
   if(cells.length===4){K.push(cells);for(const s of cells)through[s][d].push(cells)}
 }
 check(K.length===69,"69 windows");
 function rayWin(q,c,r,p){
   for(const [dx,dy] of D){let count=1;
     for(const sgn of [1,-1])for(let t=1;t<4;t++){const x=c+sgn*dx*t,y=r+sgn*dy*t;if(x<0||x>=W||y<0||y>=H||q[x+W*y]!==p)break;count++}
     if(count>=4)return true;
   }return false;
 }
 const fields=[[],[]];
 for(let m=0;m<32;m++){
   const bits=switches.map((_,i)=>(m>>i)&1);
   const word=[7];
   for(let i=0;i<5;i++)if(!bits[i])word.push(switches[i],switches[i]);
   word.push(7);
   for(let i=0;i<5;i++)if(bits[i])word.push(switches[i],switches[i]);
   check(word.length===12,"12ply word");
   const q=new Array(42).fill(0),h=new Array(7).fill(0);
   for(let t=0;t<12;t++){const col=word[t]-1,r=h[col]++,p=t%2+1;q[col+7*r]=p;check(!rayWin(q,col,r,p),"firstwinfree history")}
   check(h.join(",")==="2,2,2,0,2,2,2","heights");
   for(let i=0;i<5;i++)check(q[switches[i]-1]===(bits[i]?1:2),"bit owner convention");
   const parity=bits.reduce((a,b)=>a+b,0)%2;
   fields[parity].push({q,h,bits,word});
 }
 check(fields[0].length===16&&fields[1].length===16,"16/16 fields");
 const marginalCounts={};
 for(let k=0;k<=4;k++){
   let compared=0;
   function checkSubset(ss){
     const hist=[new Array(3**k).fill(0),new Array(3**k).fill(0)];
     for(let par=0;par<2;par++)for(const {q} of fields[par]){
       let code=0;for(const site of ss)code=code*3+q[site];hist[par][code]++;
     }
     check(hist[0].every((v,i)=>v===hist[1][i]),"different owner site marginals");
     compared++;
   }
   function combinations(start,ss){
     if(ss.length===k){checkSubset(ss);return}
     for(let j=start;j<=42-(k-ss.length);j++)combinations(j+1,[...ss,j]);
   }
   combinations(0,[]);marginalCounts[k]=compared;
 }
 check(Object.values(marginalCounts).reduce((a,b)=>a+b,0)===124314,"124314 marginals");
 for(const line of K){
   const hist=[new Array(81).fill(0),new Array(81).fill(0)];
   for(let parity=0;parity<2;parity++)for(const {q} of fields[parity]){
      const code=line.reduce((v,i)=>v*3+q[i],0);hist[parity][code]++;
   }
   check(hist[0].every((v,i)=>v===hist[1][i]),"69 source line patterns");
 }
 let moments=0;
 for(let e=0;e<42;e++){
   const dirs=[0,1,2,3].filter(d=>through[e][d].length>0);
   for(let mask=1;mask<(1<<dirs.length);mask++)for(const p of [1,2]){
     function hazard({q,h}){
       if(e!==e%7+7*h[e%7])return 0;
       for(let j=0;j<dirs.length;j++)if((mask>>j)&1){
         if(!through[e][dirs[j]].some(line=>line.every(i=>i===e||q[i]===p)))return 0;
       }return 1;
     }
     const v0=fields[0].reduce((z,q)=>z+hazard(q),0);
     const v1=fields[1].reduce((z,q)=>z+hazard(q),0);
     check(v0===v1,"Euler emitter inequality");
     moments++;
   }
 }
 check(moments===876,"876 owner-indexed Euler moments");
 const data=[];
 for(let parity=0;parity<2;parity++){
   let win=0,incidences=0,grade2before=0,grade2after=0,survivorsX1=0;const live=[];
   const g=q=>Number(q[0]===2&&q[8]===2&&q[16]===0&&q[24]===0);
   for(const {q} of fields[parity]){
      grade2before+=g(q);
      const next=q.slice();next[3]=1;
      const hits=K.filter(line=>line.includes(3)&&line.every(i=>next[i]===1)).length;
      check(Boolean(hits)===rayWin(next,3,0,1),"independent true firstwin scan");
      if(hits){win++;incidences+=hits}
      else{live.push(next);grade2after+=g(next);survivorsX1+=Number(next[0]===1)}
   }
   data.push({win,incidences,live:live.length,grade2before,grade2after,survivorsX1});
 }
 check(JSON.stringify(data)===JSON.stringify([
   {win:6,incidences:10,live:10,grade2before:4,grade2after:3,survivorsX1:4},
   {win:6,incidences:10,live:10,grade2before:4,grade2after:2,survivorsX1:5}
 ]),"new exact absorbing field discrepancy");
 return {status:"INDEPENDENT_JAVASCRIPT_SOURCE_EXACT_CONTROL_PASS",windowCount:K.length,originalSiteMarginalEquality:marginalCounts,initialPerLinePatternsMatch:69,ownerEulerMomentEqualityCount:moments,afterSameP0Column4:data,solvedGameInformationUsed:false,emptyRootWinProved:false};
}
console.log(JSON.stringify(verify(),null,2));
