#!/usr/bin/env node
import {compileGuardedActionQBF} from './guarded-action-qbf.mjs';
const board={width:7,height:6,connect:4};
const [W,H,K]=[board.width,board.height,board.connect],
  dirs=[[1,0],[0,1],[1,1],[1,-1]], b=Array(W*H).fill(-1),h=Array(W).fill(0),prefix='44444';
for(let t=0;t<prefix.length;t++){
  const c=Number(prefix[t])-1;
  b[h[c]*W+c]=t&1;h[c]++;
}
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of dirs){
  if(c+(K-1)*dc<0||c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
  lines.push(Array.from({length:K},(_,j)=>(r+j*dr)*W+c+j*dc));
}
const R=[0,1].map(p=>{
  const raw=lines.filter(l=>!l.some(i=>b[i]===1-p)).map(l=>
    l.filter(i=>b[i]===-1).reduce((a,i)=>a|(1n<<BigInt(i)),0n));
  const unique=[...new Set(raw.map(String))].map(BigInt);
  return unique.filter(a=>!unique.some(v=>v!==a&&(a&v)===v));
});
const q={h,R0:R[0],R1:R[1]};
const result={schema:'guarded-action-qbf-width-probe.v0_1',source:'44444',
  geometry:board,sourceResidualSize:[R[0].length,R[1].length],
  limits:{nodes:60000,operations:300000,supportRepresentatives:10000,maxCompileMs:15000},
  noOraclePolicies:true, noGameContinuationsEnumerated:true,
  scope:'CNF representation and certified trunk-aligned upper bounds ONLY; no QBF decision or WDL certification',cases:[]};
for(const k of [4,5,6,8,10,11,12,14,16,20,24,30,37]){
  const t=Date.now();
  try{
    const gen=compileGuardedActionQBF(board,q,{horizon:k,maxMs:15000});
    const a=gen.makeCNF('Wlo',{auxMode:'staged'}),
      b=gen.makeCNF('Wlo',{auxMode:'postfix'});
    result.cases.push({k,status:'COMPILED_NOT_DECIDED',cnfVars:a.variables,
      clauses:a.clauses.length,primalEdges:a.primalEdges,
      staged:{forward:a.forwardTrunkAlignedP2.width,
        reverse:a.reverseTrunkAlignedP1.width,upper:a.verifiedBilateralWidthUpperBound},
      postfix:{forward:b.forwardTrunkAlignedP2.width,
        reverse:b.reverseTrunkAlignedP1.width,upper:b.verifiedBilateralWidthUpperBound},
      constructedGates:gen.records.gateVariables,
      countedBooleanWork:gen.records.stats.operations,
      supportRepresentatives:gen.records.stats.supportRepresentatives,
      elapsedMs:Date.now()-t});
  }catch(e){result.cases.push({k,status:'BUDGET_OR_ERROR',error:String(e),elapsedMs:Date.now()-t});break;}
}
console.log(JSON.stringify(result,null,2));
