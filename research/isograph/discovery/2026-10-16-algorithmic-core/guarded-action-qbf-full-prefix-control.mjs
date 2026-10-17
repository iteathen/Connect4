#!/usr/bin/env node
// Structural verification of staged auxiliary scope and full-depth sample paths.
import {compileGuardedActionQBF} from './guarded-action-qbf.mjs';
const W=7,H=6,K=4,history='44444',lines=[],dirs=[[1,0],[0,1],[1,1],[1,-1]];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of dirs){
  if(c+(K-1)*dc<0||c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
  lines.push(Array.from({length:K},(_,j)=>(r+j*dr)*W+c+j*dc));
}
const initial=Array(W*H).fill(-1),h=Array(W).fill(0);
for(let i=0;i<history.length;i++){
  const c=Number(history[i])-1;
  initial[h[c]*W+c]=i&1;h[c]++;
}
const res=[0,1].map(p=>{
  const raw=lines.filter(line=>!line.some(x=>initial[x]===1-p)).map(line=>
    line.filter(x=>initial[x]===-1).reduce((a,x)=>a|(1n<<BigInt(x)),0n));
  const unique=[...new Set(raw.map(String))].map(BigInt);
  return unique.filter(a=>!unique.some(b=>b!==a&&(b&a)===b));
});
const q={h,R0:res[0],R1:res[1]},k=37;
const f=compileGuardedActionQBF({width:W,height:H,connect:K},q,{horizon:k});
const reports=[];
for(const mode of ['staged','postfix']){
  const c=f.makeCNF('Wlo',{auxMode:mode}),order=c.prefix.flatMap(b=>b.vars),positions=Array(c.variables+1);
  order.forEach((v,i)=>positions[v]=i);
  let definingGateCheck=0;
  for(let j=0;j<3*(c.auxiliaryVariables);j+=3){
    const a=c.clauses[j],b=c.clauses[j+1],v=-a[0];
    if(v!==-b[0]||a.length!==2||b.length!==2)
      throw Error('Tseitin clause structure changed');
    if(!(positions[Math.abs(a[1])]<positions[v]&&positions[Math.abs(b[1])]<positions[v]))
      throw Error('invalid causal placement of deterministic auxiliary '+v);
    definingGateCheck++;
  }
  for(let t=0;t<k;t++){
    const act=c.prefix.find(b=>b.kind==='action'&&b.stage===t);
    if(!act||act.quantifier!==((history.length+t)%2?'a':'e'))throw Error('mover scope changed');
    if(mode==='staged'){
      const internal=c.prefix.filter(b=>b.kind==='derived'&&b.stage===t);
      for(const b of internal)for(const g of b.vars)if(!(positions[act.vars.at(-1)]<positions[g]))
        throw Error('derived gate pre-quantified before its action');
    }
  }
  reports.push({mode,variables:c.variables,derivedVariableChecks:definingGateCheck,
    widthUpper:c.verifiedBilateralWidthUpperBound,
    primalEdges:c.primalEdges,prefixBlocks:c.prefix.length});
}
let seed=0xa1b2c3d4,words=0,terminalP0=0,terminalP1=0,invalidP0=0,invalidP1=0;
const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed;};
for(let test=0;test<1024;test++){
  const word=Array.from({length:k},()=>(rand()>>>16)&7),computed=f.evaluateActionWord(word).thresholds;
  if(computed.Wlo!==computed.Whi||computed.Nlo!==computed.Nhi)
    throw Error('full-horizon cutoff bits disagree on legal-or-guarded word '+test);
  let board=initial.slice(),height=h.slice(),absP0=false,absP1=false,isDraw=false,invalid=null;
  for(let t=0;t<k;t++){
    const col=word[t],p=(history.length+t)&1;
    if(col>=W||height[col]>=H){invalid=p;break;}
    board[height[col]*W+col]=p;height[col]++;
    if(lines.some(line=>line.every(i=>board[i]===p))){if(p===0)absP0=true;else absP1=true;break;}
    if(history.length+t+1===W*H){isDraw=true;break;}
  }
  const w=invalid!==null?!!invalid:absP0,
    n=invalid!==null?!!invalid:absP0||isDraw;
  if(computed.Wlo!==w||computed.Nlo!==n)
    throw Error('full-horizon sampled physical mismatch '+test);
  terminalP0+=Number(absP0);terminalP1+=Number(absP1);
  invalidP0+=Number(invalid===0);invalidP1+=Number(invalid===1);
  words++;
}
console.log(JSON.stringify({schema:'source-q-full-horizon-prefix-control.v0_1',status:'PASS',
  source:history,physicalIndependentWordChecks:words,
  allFullHorizonLowerUpperPointwiseEqualInSamples:true,
  terminalP0,terminalP1,invalidP0,invalidP1,
  output:'full QBF truth not computed',reports},null,2));
