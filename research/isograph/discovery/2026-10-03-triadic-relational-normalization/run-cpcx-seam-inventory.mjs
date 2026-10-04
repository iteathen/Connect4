import {execFileSync} from 'node:child_process';

const target=new URL(
  '../2026-10-02-cpcx/run-cpcx-move6-opponent-descent-endpoint-descriptors.mjs',
  import.meta.url
);
const raw=execFileSync(process.execPath,[target.pathname],{
  encoding:'utf8',
  maxBuffer:256*1024*1024,
});
const data=JSON.parse(raw);

const kindCounts=new Map(),pathKinds=new Map(),seamCounts=new Map();
function add(map,key,n=1){map.set(key,(map.get(key)??0)+n);}
function walk(x,path='$',depth=0){
  if(!x||typeof x!=='object')return;
  if(typeof x.kind==='string'){
    add(kindCounts,x.kind);
    const p=path.replace(/\[\d+\]/g,'[]');
    if(!pathKinds.has(p))pathKinds.set(p,new Map());
    add(pathKinds.get(p),x.kind);
  }
  if(typeof x.seam==='string')add(seamCounts,x.seam);
  if(Array.isArray(x)){
    for(let i=0;i<x.length;i++)walk(x[i],`${path}[${i}]`,depth+1);
  }else{
    for(const [k,v] of Object.entries(x)){
      if(k==='finalPosition'||k==='position'||k==='child'||k==='sourcePosition')continue;
      walk(v,`${path}.${k}`,depth+1);
    }
  }
}
walk(data);

const paths=[...pathKinds].map(([path,kinds])=>({
  path,
  count:[...kinds.values()].reduce((a,b)=>a+b,0),
  kinds:Object.fromEntries([...kinds].sort((a,b)=>b[1]-a[1])),
})).sort((a,b)=>b.count-a.count||a.path.localeCompare(b.path));

console.log(JSON.stringify({
  schema:'connect4.triadic.cpcx-seam-inventory.v0_1',
  sourceSchema:data.schema??null,
  topLevelKeys:Object.keys(data),
  summary:data.summary??null,
  kindCounts:Object.fromEntries([...kindCounts].sort((a,b)=>b[1]-a[1])),
  seamCounts:Object.fromEntries([...seamCounts].sort((a,b)=>b[1]-a[1])),
  paths:paths.slice(0,160),
},null,2));