#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';

function pc(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function subset(a,b){return (a&b)===a;}
function cmp(a,b){return a<b?-1:a>b?1:0;}
function loadHex(p){const s=fs.readFileSync(p,'utf8').trim();return s?s.split(/\n/).map(x=>BigInt('0x'+x)):[];}
function saveHex(p,a){fs.writeFileSync(p,a.map(x=>x.toString(16)).join('\n')+'\n');}
function shaFile(p){return createHash('sha256').update(fs.readFileSync(p)).digest('hex');}

const args=process.argv.slice(2);
function arg(n,d=null){const i=args.indexOf(n);return i<0?d:args[i+1];}
const inA=arg('--a'),inB=arg('--b'),prefix=arg('--prefix');
const chunkSize=Number(arg('--chunk-size','256'));
const traceMissing=Number(arg('--trace-missing','7'));
const skylineSwitch=Number(arg('--skyline-switch','2048'));
if(!inA||!inB||!prefix)throw new Error('--a --b --prefix required');
fs.mkdirSync(path.dirname(prefix),{recursive:true});

const A0=loadHex(inA),B0=loadHex(inB);
let envA=0n,envB=0n;for(const q of A0)envA|=q;for(const q of B0)envB|=q;
const bits=Math.max(envA.toString(2).length,envB.toString(2).length);

class VerticalIndex{
  constructor(rows){
    this.rows=rows;this.post=Array(bits).fill(0n);this.freq=new Uint32Array(bits);this.env=0n;
    for(let i=0;i<rows.length;i++){
      const rb=1n<<BigInt(i),q=rows[i];this.env|=q;
      for(let b=0;b<bits;b++)if(q&(1n<<BigInt(b))){this.post[b]|=rb;this.freq[b]++;}
    }
    this.all=rows.length?((1n<<BigInt(rows.length))-1n):0n;
    this.order=Array.from({length:bits},(_,i)=>i).sort((a,b)=>this.freq[a]-this.freq[b]);
  }
  supersetExists(q){
    if(q===0n)return this.rows.length>0;
    let r=this.all;
    for(const b of this.order)if(q&(1n<<BigInt(b))){r&=this.post[b];if(r===0n)return false;}
    return r!==0n;
  }
  traceMax(a){
    const seen=new Set(),out=[];
    for(const row of this.rows){
      const q=a&row,k=q.toString();if(seen.has(k))continue;seen.add(k);
      let rs=this.all;
      for(const b of this.order)if(q&(1n<<BigInt(b)))rs&=this.post[b];
      let dominated=false;
      for(const b of this.order){
        const bit=1n<<BigInt(b);
        if((a&bit)!==0n&&(q&bit)===0n&&(rs&this.post[b])!==0n){dominated=true;break;}
      }
      if(!dominated)out.push(q);
    }
    return out;
  }
}

class ProjectionTree{
  constructor(rows,leaf=31){
    this.rows=rows.slice().sort((a,b)=>pc(b)-pc(a)||cmp(a,b));this.nodes=[];this.env=0n;
    for(const q of rows)this.env|=q;this.root=this.build(0,this.rows.length,leaf);
  }
  build(lo,hi,leaf){
    const id=this.nodes.length,n={lo,hi,u:0n,left:-1,right:-1};this.nodes.push(n);
    if(hi-lo<=leaf){for(let i=lo;i<hi;i++)n.u|=this.rows[i];return id;}
    const mid=(lo+hi)>>1;n.left=this.build(lo,mid,leaf);n.right=this.build(mid,hi,leaf);
    n.u=this.nodes[n.left].u|this.nodes[n.right].u;return id;
  }
  query(a){
    const sky=[];let leafScans=0,nodeVisits=0,aborted=false;
    const insert=q=>{
      for(const g of sky)if(subset(q,g))return;
      for(let i=sky.length-1;i>=0;i--)if(subset(sky[i],q))sky.splice(i,1);
      sky.push(q);if(sky.length>skylineSwitch)aborted=true;
    };
    const dominated=q=>sky.some(g=>subset(q,g));
    const rec=id=>{
      if(aborted)return;const n=this.nodes[id];nodeVisits++;
      if(dominated(a&n.u))return;
      if(n.left<0){for(let i=n.lo;i<n.hi;i++){leafScans++;insert(a&this.rows[i]);if(aborted)return;}return;}
      rec(n.left);rec(n.right);
    };
    rec(this.root);return{out:sky,leafScans,nodeVisits,aborted};
  }
}

const AresPath=prefix+'.Ares.hex',BresPath=prefix+'.Bres.hex',absPath=prefix+'.absorbers.hex',corePath=prefix+'.core.json';
let A,B,absorbers;
if(fs.existsSync(AresPath)&&fs.existsSync(BresPath)&&fs.existsSync(absPath)){
  A=loadHex(AresPath);B=loadHex(BresPath);absorbers=loadHex(absPath);
}else{
  const t0=performance.now(),idxA=new VerticalIndex(A0),idxB=new VerticalIndex(B0);absorbers=[];
  A=A0.filter(a=>{const q=a&envB;if(idxB.supersetExists(q)){absorbers.push(q);return false;}return true;});
  B=B0.filter(b=>{const q=b&envA;if(idxA.supersetExists(q)){absorbers.push(q);return false;}return true;});
  saveHex(AresPath,A);saveHex(BresPath,B);saveHex(absPath,absorbers);
  fs.writeFileSync(corePath,JSON.stringify({
    a:A0.length,b:B0.length,raw:A0.length*B0.length,residual_a:A.length,residual_b:B.length,
    residual_pairs:A.length*B.length,absorbers:absorbers.length,elapsed_ms:performance.now()-t0
  },null,2)+'\n');
}

const tree=new ProjectionTree(B),vertical=new VerticalIndex(B);
const progressPath=prefix+'.progress.json';
let next=0,totals={occurrences:absorbers.length,tree_queries:0,trace_queries:0,switch_queries:0,leaf_scans:0,node_visits:0,elapsed_ms:0};
if(fs.existsSync(progressPath)){const p=JSON.parse(fs.readFileSync(progressPath,'utf8'));next=p.next;totals=p.totals;}

while(next<A.length){
  const end=Math.min(A.length,next+chunkSize),out=[];let tq=0,vq=0,sq=0,scans=0,nodes=0;
  const t0=performance.now();
  for(let i=next;i<end;i++){
    const a=A[i],missing=pc(tree.env&~a);let r;
    if(missing<=traceMissing){r={out:vertical.traceMax(a)};vq++;}
    else{
      const x=tree.query(a);scans+=x.leafScans;nodes+=x.nodeVisits;
      if(x.aborted){r={out:vertical.traceMax(a)};sq++;}else{r=x;tq++;}
    }
    out.push(...r.out);
  }
  const chunkPath=prefix+`.local.${next}-${end}.hex`;saveHex(chunkPath,out);
  const elapsed=performance.now()-t0;
  totals.occurrences+=out.length;totals.tree_queries+=tq;totals.trace_queries+=vq;totals.switch_queries+=sq;
  totals.leaf_scans+=scans;totals.node_visits+=nodes;totals.elapsed_ms+=elapsed;
  next=end;
  fs.writeFileSync(progressPath,JSON.stringify({next,total:A.length,totals},null,2)+'\n');
  fs.writeFileSync(prefix+`.local.${next}.json`,JSON.stringify({start:end-(end%chunkSize||chunkSize),end,occurrences:out.length,tree_queries:tq,trace_queries:vq,switch_queries:sq,leaf_scans:scans,node_visits:nodes,elapsed_ms:elapsed},null,2)+'\n');
  console.error(JSON.stringify({next,total:A.length,chunk_occurrences:out.length,elapsed_ms:elapsed,...totals}));
}

const uniq=new Set(absorbers.map(x=>x.toString()));
const chunkFiles=fs.readdirSync(path.dirname(prefix)).filter(n=>n.startsWith(path.basename(prefix)+'.local.')&&n.endsWith('.hex')).sort((x,y)=>Number(x.match(/\.local\.(\d+)-/)[1])-Number(y.match(/\.local\.(\d+)-/)[1]));
for(const n of chunkFiles)for(const q of loadHex(path.join(path.dirname(prefix),n)))uniq.add(q.toString());
const distinct=[...uniq].map(BigInt).sort(cmp),distinctPath=prefix+'.distinct.hex';saveHex(distinctPath,distinct);
const result={status:'complete',a:A0.length,b:B0.length,raw:A0.length*B0.length,residual_a:A.length,residual_b:B.length,residual_pairs:A.length*B.length,absorbers:absorbers.length,...totals,distinct:distinct.length,distinct_sha256:shaFile(distinctPath),chunks:chunkFiles.length};
fs.writeFileSync(prefix+'.result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
