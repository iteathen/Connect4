import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root=fileURLToPath(new URL('../../',import.meta.url));
const meta=JSON.parse(fs.readFileSync(path.join(root,'reference/oracles/beginning-spotchecks-v1.meta.json'),'utf8'));
const text=fs.readFileSync(path.join(root,'reference/oracles/beginning-spotchecks-v1.tsv'),'utf8').trim();
const vectors=text.split(/\r?\n/).map(line=>{
  const [group,sourceSet,sourceLine,sequence,scoreText]=line.split('\t');
  return {group,sourceSet,sourceLine:Number(sourceLine),sequence,oracleScore:Number(scoreText)};
});
if(vectors.length!==meta.vectorCount) throw new Error(`expected ${meta.vectorCount} vectors, found ${vectors.length}`);

const revision='cf2d4546e5824c155e9dd7e888a572bff3128498';
const sources={
  Test_L1_R1:`https://raw.githubusercontent.com/megakilo/alphafour/${revision}/testdata/Test_L1_R1`,
  Test_L1_R2:`https://raw.githubusercontent.com/megakilo/alphafour/${revision}/testdata/Test_L1_R2`,
};
const external={};
for(const [set,url] of Object.entries(sources)){
  const response=await fetch(url,{redirect:'error'});
  if(!response.ok) throw new Error(`${set} external fetch failed: ${response.status}`);
  const body=await response.text();
  external[set]={
    url,
    sha256:crypto.createHash('sha256').update(body).digest('hex'),
    rows:body.trim().split(/\r?\n/).map((line,index)=>{
      const [sequence,scoreText,...extra]=line.trim().split(/\s+/);
      if(extra.length) throw new Error(`${set} row ${index+1} malformed`);
      return {sequence,score:Number(scoreText)};
    })
  };
}

for(const vector of vectors){
  const row=external[vector.sourceSet]?.rows[vector.sourceLine-1];
  if(!row) throw new Error(`missing external ${vector.sourceSet} line ${vector.sourceLine}`);
  if(row.sequence!==vector.sequence||row.score!==vector.oracleScore){
    throw new Error(`external/local mismatch ${vector.sourceSet} line ${vector.sourceLine}`);
  }
}

const timeoutMs=Number.parseInt(process.env.C4_EXTERNAL_CASE_TIMEOUT_MS??'30000',10);
if(!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>120000) throw new RangeError('case timeout must be in [1000,120000]');

const childPath=path.join(root,'evidence/external/pons-isomax-position-child.mjs');
const cases=[];
let matchedCount=0,mismatchCount=0,timeoutCount=0,runtimeFailureCount=0,totalNodes=0,totalSolverMs=0;
for(const vector of vectors){
  const run=spawnSync(process.execPath,[childPath,vector.sequence],{
    cwd:root,encoding:'utf8',timeout:timeoutMs,maxBuffer:1024*1024,
    env:{...process.env,GH_TOKEN:'',GITHUB_TOKEN:'',CUDA_BSFP_GITHUB_TOKEN:''}
  });
  const expectedP0Wdl=Math.sign(vector.oracleScore)*(vector.sequence.length%2===0?1:-1);
  let status='runtime-failure',solved=null;
  if(run.error?.code==='ETIMEDOUT'||run.signal==='SIGTERM'){
    status='timeout'; timeoutCount++;
  }else if(run.status!==0){
    runtimeFailureCount++;
  }else{
    try{solved=JSON.parse(run.stdout.trim());}catch{}
    if(solved&&[-1,0,1].includes(solved.value)){
      if(solved.value===expectedP0Wdl){status='matched';matchedCount++;}
      else{status='mismatch';mismatchCount++;}
      totalNodes+=solved.nodes??0;
      totalSolverMs+=solved.elapsedMs??0;
    }else runtimeFailureCount++;
  }
  cases.push({
    group:vector.group,sourceSet:vector.sourceSet,sourceLine:vector.sourceLine,
    sequence:vector.sequence,plies:vector.sequence.length,externalPonsScore:vector.oracleScore,
    expectedP0Wdl,status,isoMaxP0Wdl:solved?.value??null,nodes:solved?.nodes??null,
    solverElapsedMs:solved?.elapsedMs??null,stderr:status==='runtime-failure'?run.stderr.slice(-2000):undefined
  });
}

const report={
  schema:'connect4-external-pons-beginning-spotchecks-v1',
  evidenceClass:matchedCount===vectors.length?'REFERENCE-GROUNDED':'INCOMPLETE',
  representative:false,
  selection:meta.provenance.selection,
  solver:'IsoMax',
  sourceRevision:process.env.C4_SOURCE_REVISION??process.env.GITHUB_SHA??null,
  externalReference:{
    repository:'megakilo/alphafour',revision,
    sets:Object.fromEntries(Object.entries(external).map(([set,v])=>[set,{url:v.url,sha256:v.sha256,gitBlobShaFromFrozenMetadata:meta.provenance.gitBlobShaBySet[set]}]))
  },
  comparison:{
    positionCount:vectors.length,matchedCount,mismatchCount,timeoutCount,runtimeFailureCount,
    totalNodes,totalSolverMs,caseTimeoutMs:timeoutMs,
    interpretation:'Pons score is side-to-move relative; compared to IsoMax P0-relative W/D/L after parity/sign conversion'
  },
  runtime:{node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch},
  cases
};
const output=process.argv[2]??'pons-isomax-l1-spotchecks-result.json';
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({schema:report.schema,evidenceClass:report.evidenceClass,sourceRevision:report.sourceRevision,...report.comparison,output}));
if(mismatchCount||runtimeFailureCount||timeoutCount) process.exitCode=1;
