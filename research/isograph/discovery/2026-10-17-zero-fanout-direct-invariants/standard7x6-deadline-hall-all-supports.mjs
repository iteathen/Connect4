// Static geometry-only falsification of deadline-prefix Hall vs last-event capacity.
// This is NOT a WDL game search: no colored boards, legal moves, policies,
// opponent responses, strategic descendants, or solved values are generated.
// Owner: research/semantic-quotient; frozen source before run, 2026-10-17.
// Mathematical formula remains W,H,K-parameterized; test geometry 7x6 Connect4.
const W=7,H=6,K=4;
const dirs=[[1,0,'horizontal'],[0,1,'vertical'],[1,1,'rising'],[1,-1,'falling']];
const lines=[],counts={horizontal:0,vertical:0,rising:0,falling:0};
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr,name] of dirs){
   const ec=c+(K-1)*dc,er=r+(K-1)*dr;
   if(ec<0||ec>=W||er<0||er>=H)continue;
   const cells=Array.from({length:K},(_,i)=>[c+i*dc,r+i*dr]);
   lines.push({name,cells});counts[name]++;
 }
if(lines.length!==69)throw Error('7x6 line count');
const records={schema:'connect4.7x6.deadline_hall_all_gravity_supports_v0_1',
 date:'2026-10-17',board:{W,H,K,lines:counts},
 experiment:'All (H+1)^W current gravity-height vectors, including physically unrealizable color families as a safe overapprox; each original geometric line as a possibly live residual requirement; both potential owners. No future histories or value queries.',
 sourceStatesHeightVectors:0,lineSupportPairs:0,nonemptyLineResiduals:0,
 playerResidualTests:0,oldImpossible:0,edfImpossible:0,edfIncrementBeyondOld:0,
 byRemainingCount:{},incrementExamples:[],invalidParityGeometryCases:0};
const h=Array(W).fill(0);
function evaluate(){
 let n=0;for(let c=0;c<W;c++)n+=h[c];
 if(n===W*H)return;
 records.sourceStatesHeightVectors++;
 for(const {cells,name} of lines){
  records.lineSupportPairs++;
  const rows=[];
  for(const [c,r] of cells)if(r>=h[c])rows.push(r);
  if(!rows.length)continue;
  records.nonemptyLineResiduals++;
  rows.sort((a,b)=>a-b);
  const m=rows.length,remaining=W*H-n;
  const U=rows.map(r=>(W-1)*H-n+r+1);
  const slot=(k,p)=>Math.floor(k/2)+(k%2&&p===n%2?1:0);
  for(let p=0;p<2;p++){
   records.playerResidualTests++;
   const oldBad=m>slot(U[m-1],p);
   let newBad=false,failAt=0;
   for(let j=1;j<=m;j++)if(j>slot(U[j-1],p)){newBad=true;failAt=j;break;}
   if(oldBad)records.oldImpossible++;
   if(newBad)records.edfImpossible++;
   if(oldBad&&!newBad)throw Error('EDF lost previous last-cell theorem');
   const k=String(m),buck=records.byRemainingCount[k]??(records.byRemainingCount[k]={tested:0,oldBad:0,edfBad:0,increment:0});
   buck.tested++;
   if(oldBad)buck.oldBad++;
   if(newBad)buck.edfBad++;
   if(newBad&&!oldBad){
    buck.increment++;records.edfIncrementBeyondOld++;
    if(records.incrementExamples.length<20)records.incrementExamples.push({h:h.slice(),line:{name,cells},p,rows,U,failAt,oldLast:slot(U[m-1],p)});
   }
   if(rows.some((r,i)=>U[i]<=0||U[i]>remaining))records.invalidParityGeometryCases++;
  }
 }
}
function visit(col){
 if(col===W){evaluate();return;}
 for(let k=0;k<=H;k++){h[col]=k;visit(col+1);}
}
visit(0);
if(records.sourceStatesHeightVectors!==Math.pow(H+1,W)-1)throw Error('missing support');
if(records.invalidParityGeometryCases!==0)throw Error('bad deadline algebra');
console.log(JSON.stringify(records,null,2));
