#!/usr/bin/env node
// Rule-only source producer + *independent* physical finite-horizon validator.
import {compileGuardedActionQBF} from './guarded-action-qbf.mjs';
import {projectActionQBF} from './guarded-action-qbf-project.mjs';
const cases=[
 [{width:4,height:3,connect:3},'', [1,2,3,4,5,6]],
 [{width:4,height:3,connect:3},'223', [1,2,3,4,5,6]],
 [{width:4,height:3,connect:3},'1212',[1,2,3,4]],
 [{width:4,height:4,connect:4},'', [1,2,3,4]],
 [{width:4,height:4,connect:4},'223',[1,2,3,4]],
 [{width:7,height:6,connect:4},'44444',[1,2,3,4,5,6,8,10,11,12]]
];
function geometry({width:W,height:H,connect:K},prefix){
  const dirs=[[1,0],[0,1],[1,1],[1,-1]],lines=[];
  for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of dirs){
    if(c+(K-1)*dc<0||c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
    lines.push(Array.from({length:K},(_,j)=>(r+j*dr)*W+c+j*dc));
  }
  const board=Array(W*H).fill(-1),h=Array(W).fill(0);
  for(let t=0;t<prefix.length;t++){
    const c=Number(prefix[t])-1;
    if(c<0||c>=W||h[c]===H)throw Error('invalid fixture');
    board[h[c]*W+c]=t&1;h[c]++;
    if(lines.some(l=>l.every(i=>board[i]===(t&1))))throw Error('terminal fixture');
  }
  const R=[0,1].map(p=>{
    const a=lines.filter(l=>!l.some(i=>board[i]===1-p)).map(l=>
      l.filter(i=>board[i]===-1).reduce((m,i)=>m|1n<<BigInt(i),0n));
    const unique=[...new Set(a.map(String))].map(BigInt);
    return unique.filter(m=>!unique.some(n=>m!==n&&(n&m)===n));
  });
  function truth(k,threshold,first=null){
    const z=['Wlo','Nlo','Whi','Nhi'].indexOf(threshold),cutoff=[false,false,true,true][z];
    function recur(B,heights,rank,d){
      if(d===k)return cutoff;
      const p=rank&1;let result=p===0?false:true;
      for(let c=0;c<W;c++){
        if(heights[c]===H||first!==null&&d===0&&c!==first)continue;
        const next=B.slice(),nh=heights.slice();next[nh[c]*W+c]=p;nh[c]++;
        const won=lines.some(l=>l.every(i=>next[i]===p));
        const value=won?p===0:(rank+1===W*H?(z===1||z===3):recur(next,nh,rank+1,d+1));
        result=p===0?result||value:result&&value;
      }
      return result;
    }
    return recur(board,h,prefix.length,0);
  }
  return {q:{h,R0:R[0],R1:R[1]},truth};
}
const report={schema:'connect4.guarded-action-qbf-projection-control.v0_1',
  status:'PASS',nodeRuntime:process.version,cases:[],
  producerGameStateSearch:0,sourceUsedOracle:0,
  full44444UnrestrictedWDL:'UNKNOWN',
  requiredBudgets:{nodes:60000,nontrivialOperations:300000,maxMs:15000}};
for(const [profile,prefix,depths] of cases){
  const g=geometry(profile,prefix);
  for(const k of depths){
    const row={profile,prefix,k,thresholds:[]};
    for(const name of ['Wlo','Nlo','Whi','Nhi']){
      const f=compileGuardedActionQBF(profile,g.q,{horizon:k});
      const cnf=f.makeCNF(name,{auxMode:'staged'});
      const projected=projectActionQBF(cnf,{maxMs:15000});
      const expected=k<=6?g.truth(k,name):null;
      if(projected.status==='EXACT'&&expected!==null&&projected.value!==expected)
        throw Error('independent physical projection mismatch '+JSON.stringify({profile,prefix,k,name,got:projected.value,expected}));
      row.thresholds.push({name,status:projected.status,
        value:projected.value,reference:k<=6?expected:'not evaluated',
        nontrivialOperations:projected.stats.nontrivialOperations,
        inputBitsProcessed:projected.stats.quantifiedActionBits,
        intermediateNodes:projected.stats.peakRetainedNodes,
        totalANDCalls:projected.stats.andCalls,
        cofactorMisses:projected.stats.cofactorMisses,
        elapsedMs:projected.elapsedMs});
      if(projected.status!=='EXACT'){
        row.thresholds.at(-1).incompleteStage=projected.incompleteAtActionBit;
        row.thresholds.at(-1).error=projected.error;
      }
    }
    report.cases.push(row);
    console.error(prefix||'EMPTY',profile.width+'x'+profile.height,k,row.thresholds.map(x=>x.name+':'+x.status+'/'+x.inputBitsProcessed+'/'+x.nontrivialOperations).join(' '));
    if(row.thresholds.some(x=>x.status!=='EXACT')&&k>4)break;
  }
}
console.log(JSON.stringify(report,null,2));
