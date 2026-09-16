import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const base=resolve(here,'coarse_partition_locality_control_bench.mjs');
const generated=resolve(here,'coarse_profile_replay.generated.mjs');
let src=readFileSync(base,'utf8');
function once(from,to){
  const at=src.indexOf(from);
  if(at<0||src.indexOf(from,at+1)>=0)throw Error(`expected one patch target: ${from.slice(0,80)}`);
  src=src.slice(0,at)+to+src.slice(at+from.length);
}
once('    this.promoted=false;\n    this.resetRun();','    this.promoted=false;this.oracleProfile=null;\n    this.resetRun();');
once("    else if(this.mode==='weighted')this.installWeighted(profile);","    else if(this.mode==='weighted')this.installWeighted(profile);\n    else if(this.mode==='oracle3'&&this.oracleProfile)this.installEqual(3,this.oracleProfile);");
once('const root=parse(SEQ);\nfor(const mode of MODES){',`const root=parse(SEQ);\n// Upper-bound control: learn family work on a clean flat-quarter solve, then discard all TT bytes.\nconst profilePool=new Pool(WORKERS,'flatQuarter');\nawait profilePool.init(root);profilePool.clear();profilePool.resetRun();profilePool.descPow[0]=TOTAL_POW-2;shellNodes=0;\nconst profileScore=await solve(profilePool,root);await profilePool.drain();\nconst oracleFamilies=[...profilePool.family.entries()].map(([sig2,v])=>({sig2,...v})).sort((a,b)=>b.nodes-a.nodes);\nconst oracleTotalNodes=oracleFamilies.reduce((sum,x)=>sum+x.nodes,0);\nconst oracleProfile={families:oracleFamilies,totalNodes:oracleTotalNodes};\nconsole.log(JSON.stringify({mode:'profile',seq:SEQ,workers:WORKERS,totalPow:TOTAL_POW,score:profileScore,nodes:profilePool.nodes+shellNodes,topFamilies:oracleFamilies.slice(0,12)}));\nawait profilePool.close();\nfor(const mode of MODES){`);
once('  const pool=new Pool(WORKERS,mode);await pool.init(root);const runs=[];','  const pool=new Pool(WORKERS,mode);pool.oracleProfile=oracleProfile;await pool.init(root);const runs=[];\n  pool.oracleProfile=oracleProfile;');
writeFileSync(generated,src);
try{
  const args=process.argv.slice(2);
  const r=spawnSync(process.execPath,[generated,...args],{stdio:'inherit'});
  process.exitCode=r.status??1;
}finally{
  try{unlinkSync(generated);}catch{}
}
