import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
const base=new URL('./',import.meta.url),samples=readdirSync(base,{withFileTypes:true}).filter(d=>d.isDirectory()).flatMap(d=>{
 try{return [JSON.parse(readFileSync(new URL(d.name+'/summary.json',base),'utf8'))];}catch(e){if(e.code==='ENOENT')return [];throw e;}
});
if(samples.some(s=>!s.validated||s.status!=='EXACT'))throw Error('Invalid completed sample');
const groups=[['packaged4',s=>s.mode==='baseline'],['candidateUnbanked4',s=>s.mode==='candidate'&&s.bankGiB===0],
 ['banked4',s=>s.mode==='candidate'&&s.sharedGiB===4&&s.bankGiB!==0],['banked8',s=>s.sharedGiB===8]];
const aggregate=Object.fromEntries(groups.map(([name,select])=>{
 const rows=samples.filter(select),times=rows.map(s=>s.solveMs),mean=times.reduce((a,b)=>a+b,0)/rows.length;
 return [name,{trials:rows.length,ids:rows.map(s=>s.id),solveMs:times,meanMs:mean,minMs:Math.min(...times),maxMs:Math.max(...times),
  sampleSdMs:rows.length>1?Math.sqrt(times.reduce((sum,t)=>sum+(t-mean)**2,0)/(rows.length-1)):null,
  peakRssMaxBytes:Math.max(...rows.map(s=>s.peakRssBytes)),meanProcessCpuMs:rows.reduce((sum,s)=>sum+s.processCpuMs,0)/rows.length,
  meanInitializationMs:rows.reduce((sum,s)=>sum+s.initializationMs,0)/rows.length}];
}));
const result={workers:6,privateBytesPerWorker:268435456,allCompletedSamplesExactAndValidated:true,samples:samples.length,aggregate,
 banked8MeanReductionVsPackaged4Percent:100*(1-aggregate.banked8.meanMs/aggregate.packaged4.meanMs),
 banked8MeanReductionVsBanked4Percent:100*(1-aggregate.banked8.meanMs/aggregate.banked4.meanMs),
 additionalPeakRssBytes:aggregate.banked8.peakRssMaxBytes-aggregate.packaged4.peakRssMaxBytes,
 sixteenGiB:JSON.parse(readFileSync(new URL('banked-16-admission/resource-status.json',base),'utf8')),
 disposition:'Experimental, not promoted. Small 8GiB mean advantage overlaps observed variation.16GiB resource-censored; ROI unknown.Production package remains unchanged.'};
writeFileSync(new URL('analysis.json',base),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
