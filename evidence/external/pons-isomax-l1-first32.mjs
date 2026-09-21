import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root=fileURLToPath(new URL('../../',import.meta.url));
const revision='cf2d4546e5824c155e9dd7e888a572bff3128498';
const sets=[
  {id:'Test_L1_R1',url:`https://raw.githubusercontent.com/megakilo/alphafour/${revision}/testdata/Test_L1_R1`,limit:32},
  {id:'Test_L1_R2',url:`https://raw.githubusercontent.com/megakilo/alphafour/${revision}/testdata/Test_L1_R2`,limit:32},
];
const timeoutMs=Number.parseInt(process.env.C4_EXTERNAL_CASE_TIMEOUT_MS??'15000',10);
if(!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>60000) throw new RangeError('case timeout must be in [1000,60000]');

const externalSets={};
const vectors=[];
for(const set of sets){
  const response=await fetch(set.url,{redirect:'error'});
  if(!response.ok) throw new Error(`${set.id} fetch failed: ${response.status}`);
  const body=await response.text();
  const rows=body.trim().split(/\r?\n/).map((line,index)=>{
    const [sequence,scoreText,...extra]=line.trim().split(/\s+/);
    if(!sequence||scoreText===undefined||extra.length) throw new Error(`${set.id} row ${index+1} malformed`);
    const score=Number.parseInt(scoreText,10);
    if(!Number.isInteger(score)) throw new Error(`${set.id} row ${index+1} score malformed`);
    return {sourceSet:set.id,sourceLine:index+1,sequence,oracleScore:score};
  });
  if(rows.length<set.limit) throw new Error(`${set.id} has only ${rows.length} rows`);
  externalSets[set.id]={url:set.url,sha256:crypto.createHash('sha256').update(body).digest('hex'),rowCount:rows.length};
  vectors.push(...rows.slice(0,set.limit));
}

const childPath=path.join(root,'evidence/external/pons-isomax-first32-child.mjs');
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
  } else if(run.status!==0){
    runtimeFailureCount++;
  } else {
    try{solved=JSON.parse(run.stdout.trim());}catch{}
    if(solved&&[-1,0,1].includes(solved.value)){
      if(solved.value===expectedP0Wdl){status='matched';matchedCount++;}
      else{status='mismatch';mismatchCount++;}
      totalNodes+=solved.nodes??0;
      totalSolverMs+=solved.elapsedMs??0;
    } else runtimeFailureCount++;
  }
  cases.push({
    sourceSet:vector.sourceSet,sourceLine:vector.sourceLine,sequence:vector.sequence,plies:vector.sequence.length,
    externalPonsScore:vector.oracleScore,expectedP0Wdl,status,isoMaxP0Wdl:solved?.value??null,
    nodes:solved?.nodes??null,solverElapsedMs:solved?.elapsedMs??null,
    stderr:status==='runtime-failure'?run.stderr.slice(-2000):undefined
  });
}

const completed=matchedCount+mismatchCount;
const report={
  schema:'connect4-external-pons-l1-first32-v1',
  evidenceClass:'REFERENCE-GROUNDED',
  disposition:mismatchCount||runtimeFailureCount?'FAIL':timeoutCount?'PARTIAL':'PASS',
  representativeWithinDeclaredSlice:true,
  selection:'first 32 rows of Test_L1_R1 and first 32 rows of Test_L1_R2; no solver-difficulty prefilter',
  solver:'IsoMax',
  sourceRevision:process.env.C4_SOURCE_REVISION??process.env.GITHUB_SHA??null,
  externalReference:{repository:'megakilo/alphafour',revision,sets:externalSets},
  comparison:{
    requestedPositionCount:vectors.length,completedCount:completed,matchedCount,mismatchCount,timeoutCount,runtimeFailureCount,
    totalNodes,totalSolverMs,caseTimeoutMs:timeoutMs,
    interpretation:'Pons score is side-to-move relative; compared to IsoMax P0-relative W/D/L after parity/sign conversion'
  },
  runtime:{node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch},
  cases
};
const output=process.argv[2]??'pons-isomax-l1-first32-result.json';
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({schema:report.schema,evidenceClass:report.evidenceClass,disposition:report.disposition,sourceRevision:report.sourceRevision,...report.comparison,output}));
if(mismatchCount||runtimeFailureCount) process.exitCode=1;
