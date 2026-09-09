import{readFileSync,readdirSync,writeFileSync}from'node:fs';
import{createHash}from'node:crypto';
const dir=new URL('../../../docs/research/evidence/winspace/',import.meta.url),med=a=>{a=[...a].sort((x,y)=>x-y);const i=a.length>>1;return a.length%2?a[i]:(a[i-1]+a[i])/2;};
const summary={schema:1,method:'median of complete-cohort repetition sums; all repetitions retained; preparation includes root compilation, cache invalidation and any view setup; no new scores beyond baseline verification are assumed',runs:{},totalMeasured:0,totalWarmups:0};
let table='run\tmode\trepeat\tpositions\tnodes\tprepareMs\tsearchMs\ttotalMs\tdrawCertificates\toneSidedExclusions\tlineBackendRoots\n';
for(const f of readdirSync(dir).filter(x=>x.endsWith('.jsonl')).sort()){
 const raw=readFileSync(new URL(f,dir),'utf8');const xs=raw.trim().split('\n').filter(Boolean).map(JSON.parse),rows=xs.filter(x=>x.kind==='trial');if(!rows.length)continue;
 const config=xs.find(x=>x.kind==='config'),ended=xs.some(x=>x.kind==='end');if(!ended)throw Error('incomplete benchmark '+f);
 const groups=new Map();for(const r of rows){if(r.status!=='complete')throw Error('capped trial '+f);
  const key=r.name+':'+r.rep;let a=groups.get(key);if(!a){a={name:r.name,rep:r.rep,positions:0,nodes:0,prepareMs:0,searchMs:0,totalMs:0,draws:0,exclusions:0,lineRoots:0};groups.set(key,a);}
  a.positions++;for(const k of['nodes','prepareMs','searchMs','totalMs','draws','exclusions'])a[k]+=r[k]??0;a.lineRoots+=r.backend==='one-word-lines';
 }
 const modes={};for(const name of config.names){const a=[...groups.values()].filter(x=>x.name===name);const v={repetitions:a.length,positions:a[0].positions,nodes:[...new Set(a.map(x=>x.nodes))],medianTotalMs:med(a.map(x=>x.totalMs)),medianSearchMs:med(a.map(x=>x.searchMs)),medianPrepareMs:med(a.map(x=>x.prepareMs)),totalRange:[Math.min(...a.map(x=>x.totalMs)),Math.max(...a.map(x=>x.totalMs))],pairedCohortWins:name==='base'?null:a.filter(x=>x.totalMs<groups.get('base:'+x.rep).totalMs).length,records:a};modes[name]=v;}
 for(const a of groups.values())table+=[f,a.name,a.rep,a.positions,a.nodes,a.prepareMs,a.searchMs,a.totalMs,a.draws,a.exclusions,a.lineRoots].join('\t')+'\n';
 const byPosition={};for(const name of config.names){byPosition[name]={};for(const seq of [...new Set(rows.map(r=>r.seq))]){const a=rows.filter(r=>r.name===name&&r.seq===seq);byPosition[name][seq]={score:a[0].score,nodes:a[0].nodes,groups:a[0].groups,ttBytes:a[0].ttBytes,medianTotalMs:med(a.map(r=>r.totalMs)),medianSearchMs:med(a.map(r=>r.searchMs))};}}
 summary.runs[f]={config,measured:rows.length,warmups:xs.filter(x=>x.kind==='warmup').length,rawBytes:Buffer.byteLength(raw),rawSHA256:createHash('sha256').update(raw).digest('hex'),modes,byPosition};summary.totalMeasured+=rows.length;summary.totalWarmups+=xs.filter(x=>x.kind==='warmup').length;
}
writeFileSync(new URL('summary.json',dir),JSON.stringify(summary,null,2)+'\n');writeFileSync(new URL('repetition-ledger.tsv',dir),table);
console.log(JSON.stringify({trials:summary.totalMeasured,warmups:summary.totalWarmups}));
for(const [f,r]of Object.entries(summary.runs))if(!f.includes('screen')&&!f.includes('development'))console.log(f,Object.fromEntries(Object.entries(r.modes).map(([k,v])=>[k,{nodes:v.nodes[0],total:v.medianTotalMs,search:v.medianSearchMs,wins:v.pairedCohortWins}])));
