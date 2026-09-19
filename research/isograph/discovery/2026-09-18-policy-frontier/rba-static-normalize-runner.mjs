#!/usr/bin/env node
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';

function pc(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function subset(a,b){return (a&b)===a;}
function cmp(a,b){return a<b?-1:a>b?1:0;}

const args=process.argv.slice(2);
function arg(name,def=null){const i=args.indexOf(name);return i<0?def:args[i+1];}
const input=arg('--input');
const output=arg('--output');
const state=arg('--state',output+'.state.json');
const bitmap=arg('--bitmap',output+'.keep.bin');
const budgetMs=Number(arg('--budget-ms','25000'));
const leaf=Number(arg('--leaf','31'));
const checkpointEvery=Number(arg('--checkpoint-every','5000'));
if(!input||!output)throw new Error('--input and --output required');

const values=fs.readFileSync(input,'utf8').trim().split(/\n/).filter(Boolean).map(x=>BigInt('0x'+x));
const recs=[...new Set(values)].map(q=>({q,p:pc(q)}));
recs.sort((a,b)=>b.p-a.p||cmp(a.q,b.q));

const nodes=[];
function build(lo,hi){
  const id=nodes.length,n={lo,hi,u:0n,maxp:0,left:-1,right:-1};
  nodes.push(n);
  if(hi-lo<=leaf){
    for(let i=lo;i<hi;i++){n.u|=recs[i].q;n.maxp=Math.max(n.maxp,recs[i].p);}
    return id;
  }
  const mid=(lo+hi)>>1;
  n.left=build(lo,mid);n.right=build(mid,hi);
  n.u=nodes[n.left].u|nodes[n.right].u;
  n.maxp=Math.max(nodes[n.left].maxp,nodes[n.right].maxp);
  return id;
}
const buildStart=performance.now(),root=build(0,recs.length),buildMs=performance.now()-buildStart;

let next=0,keep=new Uint8Array(recs.length),nodesVisited=0,leafRecords=0;
if(fs.existsSync(state)&&fs.existsSync(bitmap)){
  const s=JSON.parse(fs.readFileSync(state,'utf8'));
  if(s.input_count!==recs.length)throw new Error('resume input count mismatch');
  next=s.next;
  const b=fs.readFileSync(bitmap);
  keep.set(b.subarray(0,Math.min(b.length,keep.length)));
  nodesVisited=s.nodes_visited??0;
  leafRecords=s.leaf_records??0;
}
function hasStrict(q,p,id,qi){
  const n=nodes[id];nodesVisited++;
  if(!subset(q,n.u)||n.maxp<=p)return false;
  if(n.left<0){
    for(let i=n.lo;i<n.hi;i++){
      if(i===qi)continue;
      const r=recs[i];leafRecords++;
      if(r.p>p&&subset(q,r.q))return true;
    }
    return false;
  }
  return hasStrict(q,p,n.left,qi)||hasStrict(q,p,n.right,qi);
}
function save(done=false){
  fs.writeFileSync(bitmap,Buffer.from(keep));
  fs.writeFileSync(state,JSON.stringify({
    input_count:recs.length,next,done,build_ms:buildMs,nodes: nodes.length,
    nodes_visited:nodesVisited,leaf_records:leafRecords
  },null,2)+'\n');
}
const t0=performance.now();
for(;next<recs.length;next++){
  if(!hasStrict(recs[next].q,recs[next].p,root,next))keep[next]=1;
  if((next+1)%checkpointEvery===0){next++;save(false);next--;console.error(JSON.stringify({next:next+1,total:recs.length,elapsed_ms:performance.now()-t0,nodesVisited,leafRecords}));}
  if(performance.now()-t0>=budgetMs){next++;save(false);console.log(JSON.stringify({status:'budget_yield',next,total:recs.length,build_ms:buildMs,run_ms:performance.now()-t0,nodesVisited,leafRecords},null,2));process.exit(0);}
}
const out=recs.filter((_,i)=>keep[i]).map(r=>r.q).sort(cmp);
const text=out.map(q=>q.toString(16)).join('\n')+'\n';
fs.writeFileSync(output,text);
save(true);
console.log(JSON.stringify({status:'complete',input:recs.length,output:out.length,build_ms:buildMs,run_ms:performance.now()-t0,nodesVisited,leafRecords,sha256:createHash('sha256').update(text).digest('hex')},null,2));
