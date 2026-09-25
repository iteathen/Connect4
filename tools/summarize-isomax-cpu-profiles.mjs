import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';

const dir=process.argv[2]??'cpu-profiles';
const files=readdirSync(dir);
const profileFiles=files.filter(name=>name.endsWith('.cpuprofile')).sort();
const logFiles=files.filter(name=>/^run-\d+\.log$/.test(name)).sort();
if(!profileFiles.length)throw new Error('no CPU profiles found');

let totalCycles=0,totalCpuMs=0,benchRuns=0;
const metrics={nodes:0,cofactors:0,cacheHits:0,cutoffs:0,cpcExact:0,cpcBounds:0,cpcRestrictions:0};
for(const name of logFiles){
  for(const line of readFileSync(join(dir,name),'utf8').split(/\r?\n/)){
    const at=line.indexOf('{');
    if(at<0)continue;
    try{
      const row=JSON.parse(line.slice(at));
      if(row.event!=='sample')continue;
      benchRuns+=1;
      totalCycles+=Number(row.cpuCycles);
      totalCpuMs+=Number(row.cpuMs);
      const m=row.winnerMetrics;
      if(m)for(const key of Object.keys(metrics))metrics[key]+=Number(m[key]??0);
    }catch{}
  }
}

const self=new Map(),inclusive=new Map(),category=new Map(),profileSummaries=[];
let activeMicros=0,idleMicros=0;
function add(map,key,value){map.set(key,(map.get(key)??0)+value);}
function frameKey(node){
  const f=node.callFrame??{},fn=f.functionName||'(anonymous)',url=(f.url||'').replaceAll('\\','/');
  let source=url;
  const marker='/vendor/jsminsys/';
  const i=url.indexOf(marker);
  if(i>=0)source='JSMinSys/'+url.slice(i+marker.length);
  else{
    const c=url.indexOf('/Connect4/');
    if(c>=0)source='Connect4/'+url.slice(c+'/Connect4/'.length);
  }
  return {key:`${fn} @ ${source||'(native)'}:${(f.lineNumber??-1)+1}`,fn,source};
}
function categoryOf(source,fn){
  if(source.startsWith('JSMinSys/'))return 'JSMinSys';
  if(source.startsWith('Connect4/components/isometric/'))return 'IsoMax shell';
  if(source.startsWith('Connect4/tools/'))return 'benchmark';
  if(source.startsWith('node:'))return 'Node runtime';
  if(!source||source==='(native)')return fn==='(idle)'?'idle':'V8/native';
  return 'other';
}

for(const name of profileFiles){
  const p=JSON.parse(readFileSync(join(dir,name),'utf8')),
    nodes=new Map(p.nodes.map(n=>[n.id,n])),parent=new Map();
  for(const n of p.nodes)for(const child of n.children??[])parent.set(child,n.id);
  let fileActive=0,fileIdle=0;
  for(let i=0;i<(p.samples?.length??0);i+=1){
    const node=nodes.get(p.samples[i]);
    if(!node)continue;
    const micros=Number(p.timeDeltas?.[i]??0),info=frameKey(node);
    if(info.fn==='(idle)'){idleMicros+=micros;fileIdle+=micros;continue;}
    activeMicros+=micros;fileActive+=micros;
    add(self,info.key,micros);
    add(category,categoryOf(info.source,info.fn),micros);
    let id=node.id,guard=0;
    while(id!==undefined&&guard++<512){
      const ancestor=nodes.get(id);
      if(!ancestor)break;
      add(inclusive,frameKey(ancestor).key,micros);
      id=parent.get(id);
    }
  }
  profileSummaries.push({file:name,activeMicros:fileActive,idleMicros:fileIdle});
}

function top(map,filter=()=>true,limit=30){
  return [...map.entries()]
    .filter(([key])=>filter(key))
    .sort((a,b)=>b[1]-a[1])
    .slice(0,limit)
    .map(([frame,micros])=>({
      frame,
      micros,
      pctActive:activeMicros?100*micros/activeMicros:0,
      estimatedCycles:totalCycles&&activeMicros?Math.round(totalCycles*micros/activeMicros):null,
    }));
}
const isJsms=key=>key.includes(' @ JSMinSys/');
const jsmsSelf=top(self,isJsms,40),allSelf=top(self,()=>true,25),jsmsInclusive=top(inclusive,isJsms,25);
const categories=[...category.entries()].sort((a,b)=>b[1]-a[1]).map(([name,micros])=>({
  name,micros,pctActive:activeMicros?100*micros/activeMicros:0,
  estimatedCycles:totalCycles&&activeMicros?Math.round(totalCycles*micros/activeMicros):null,
}));
const result={
  event:'isomax-cpu-census',
  profileFiles:profileFiles.length,
  benchmarkRuns:benchRuns,
  activeMicros,idleMicros,totalCpuMs,totalCycles,
  winnerMetricTotals:metrics,
  winnerMetricAverages:Object.fromEntries(Object.entries(metrics).map(([k,v])=>[k,benchRuns?v/benchRuns:null])),
  categories,
  topJsMinSysSelf:jsmsSelf,
  topJsMinSysInclusive:jsmsInclusive,
  topAllSelf:allSelf,
  profileSummaries,
  attributionNote:'Estimated cycles multiply measured process cycles by non-idle V8 self-sample share. They are directional attribution, not per-function hardware counter measurements.',
};
console.log(JSON.stringify(result));

console.log('\nTop JSMinSys self-time hotspots');
console.log('pct\test.cycles\tself.ms\tframe');
for(const row of jsmsSelf.slice(0,25))
  console.log(`${row.pctActive.toFixed(2)}\t${row.estimatedCycles??''}\t${(row.micros/1000).toFixed(1)}\t${row.frame}`);
