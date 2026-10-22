// Independent exact original7x6 source owner triple marginal/cube projection test.
// Execute: node verify-original7x6-parity-source-triple-projection.mjs
function verifyOriginalTripleProjection(){
 const W=7,H=6,cs=[1,2,3,5,6],dirs=[[1,0],[0,1],[1,1],[1,-1]];
 const check=(v,msg)=>{if(!v)throw Error(msg)};
 const winlines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of dirs){
  let cells=[];for(let j=0;j<4;j++){const x=c+dc*j,y=r+dr*j;if(x<0||x>=W||y<0||y>=H)break;cells.push(x+W*y)}
  if(cells.length===4)winlines.push(cells);
 }
 check(winlines.length===69,"69 windows");
 const hists=[{},{}], moment3=[0,0];let valid=0;
 for(let n=0;n<32;n++){
   const x=cs.map((_,i)=>(n>>i)&1),par=x.reduce((a,b)=>a+b,0)%2;
   const history=[7];
   cs.forEach((c,i)=>{if(!x[i])history.push(c,c)});
   history.push(7);
   cs.forEach((c,i)=>{if(x[i])history.push(c,c)});
   const board=new Array(42).fill(0),ht=new Array(7).fill(0);
   check(history.length===12,"word");
   history.forEach((col,i)=>{
     const c=col-1,r=ht[c]++,owner=i%2===0?1:2;
     board[c+W*r]=owner;
     check(!winlines.some(L=>L.every(e=>board[e]===owner)),"premature first win");
   });
   check(ht.join(",")==="2,2,2,0,2,2,2","heights");
   const u=Number(board[0]===2 && board[1+W]===2 && board[2+W*2]===0 && board[3+W*3]===0);
   const b=Number(board[2]===1 && board[4]===1);
   const d=Number(board[4]===1 && board[5]===1);
   const key=`${u}${b}${d}`;
   hists[par][key]=(hists[par][key]||0)+1;
   moment3[par]+=u*b*d;
   valid++;
 }
 check(valid===32,"32 legal states");
 const keys=["000","001","010","011","100","101","110","111"];
 for(const key of keys){
  const diff=(hists[0][key]||0)-(hists[1][key]||0);
  const [u,b,d]=[...key].map(Number);
  check(diff===(u+b+d)%2*2-1,"3-way parity-character cell mismatch "+key);
  check((hists[0][key]||0)+(hists[1][key]||0)>0,"missing physically legal cube corner "+key);
 }
 for(const subset of [[0],[1],[2],[0,1],[0,2],[1,2]]){
  const hist=(p)=>{
   const out={};
   for(const key of keys){const mk=[...key].filter((_,i)=>subset.includes(i)).join("");out[mk]=(out[mk]||0)+(hists[p][key]||0)}
   return out;
  };
  check(JSON.stringify(hist(0))===JSON.stringify(hist(1)),"pairwise mismatch "+subset);
 }
 check(moment3.join(",")==="1,0","three-body moment");
 const vals=keys.map(key=>({u:Number(key[0]),b:Number(key[1]),d:Number(key[2]),even:hists[0][key]||0,odd:hists[1][key]||0,difference:(hists[0][key]||0)-(hists[1][key]||0)}));
 return {status:"PASS_LEGAL_7X6_STRICT_OOO_THIRD_ORDER_PARITY_PROJECTION",boardSize:"7x6",actualK4:winlines.length,sourceStates:32,legalThreeCubeCorners:keys.length,allSingletonAndPairwiseMarginalsEqual:true,ubdMomentEvenOdd:moment3,parityProjection:vals,historicalSolverPremise:false,globalRootWinnerProven:false};
}
console.log(JSON.stringify(verifyOriginalTripleProjection(), null, 2));
