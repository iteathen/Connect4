import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gzipSync,gunzipSync} from 'node:zlib';
import {assertCarrier,createOracle,dependencyImage} from './independent-oracle.mjs';
import {renameCheckpoint} from './independent-io.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const label=process.argv[2];
const match=/^(\d+)x(\d+)-k(\d+)$/.exec(label??'');
if(!match)throw new Error('Usage: node --max-old-space-size=6144 independent-runner.mjs TRAINED_LABEL [--skip-ooo]');
const [W,H,K]=match.slice(1).map(Number);assertCarrier(W,H,K);
const target=path.join(here,`independent-${label}`);fs.mkdirSync(target,{recursive:true});
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const atomic=(file,data)=>{fs.writeFileSync(file+'.partial',data);renameCheckpoint(file+'.partial',file);};
const json=(file,data)=>atomic(file,JSON.stringify(data,null,2)+'\n');
const sourceFiles=['independent-oracle.mjs','independent-runner.mjs','independent-io.mjs'];
const config={schema:1,label,W,H,K,shardSize:10000,node:process.version,sources:Object.fromEntries(sourceFiles.map(f=>[f,digest(fs.readFileSync(path.join(here,f)))]))};
const configHash=digest(JSON.stringify(config));
const configFile=path.join(target,'independent-config.json');
if(fs.existsSync(configFile)&&JSON.parse(fs.readFileSync(configFile)).configHash!==configHash)throw new Error('Checkpoint source/config mismatch: preserve old evidence; use a fresh evidence directory after review');
if(!fs.existsSync(configFile))json(configFile,{...config,configHash,head:execFileSync('git',['rev-parse','HEAD'],{cwd:here,encoding:'utf8'}).trim(),started:new Date().toISOString(),question:'Statewise independent trained-carrier revalidation; no new discovery or status promotion'});
const progress=data=>{const out={...data,time:new Date().toISOString(),configHash};json(path.join(target,'independent-progress.json'),out);process.stdout.write(JSON.stringify(out)+'\n');};
const checkpoint=(name,bytes)=>{const file=path.join(target,name);atomic(file,bytes);json(file+'.sha256.json',{sha256:digest(bytes),bytes:bytes.length});};
const readCheckpoint=name=>{const file=path.join(target,name);if(!fs.existsSync(file)||!fs.existsSync(file+'.sha256.json'))return null;const bytes=fs.readFileSync(file);if(digest(bytes)!==JSON.parse(fs.readFileSync(file+'.sha256.json')).sha256)throw new Error('Checkpoint corruption: '+name);return bytes;};
try{
  const summaryFile=path.join(target,'independent-summary.json');
  if(fs.existsSync(summaryFile)&&JSON.parse(fs.readFileSync(summaryFile)).complete){progress({phase:'already-complete',summary:summaryFile});process.exit(0);}
  const oracle=createOracle(W,H,K);
  oracle.enumerate({progress,loadRank:rank=>{const bytes=readCheckpoint(`independent-rank-${rank}.bin`);return bytes?Array.from(new Float64Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength))):null;},saveRank:(rank,codes)=>{if(!readCheckpoint(`independent-rank-${rank}.bin`))checkpoint(`independent-rank-${rank}.bin`,Buffer.from(Float64Array.from(codes).buffer));}});
  const oldValues=readCheckpoint('independent-wdl.bin');
  const values=oracle.solve({progress,restored:oldValues?new Int8Array(oldValues.buffer.slice(oldValues.byteOffset,oldValues.byteOffset+oldValues.byteLength)):null});
  if(!oldValues)checkpoint('independent-wdl.bin',Buffer.from(values.buffer));
  progress({phase:'wdl-complete',states:oracle.codes.length});
  const N=W*H,base=2**N,powers=Array.from({length:N},(_,i)=>3**i);
  const ordered=Float64Array.from(oracle.codes,code=>{const cells=oracle.decode(code);let a=0,b=0;cells.forEach((p,c)=>{if(p===1)a+=2**c;if(p===2)b+=2**c;});return a*base+b;});ordered.sort();
  const fromPair=pair=>{const a=Math.floor(pair/base),b=pair%base;let code=0;for(let c=0;c<N;c++)code+=((Math.floor(a/2**c)%2)+2*(Math.floor(b/2**c)%2))*powers[c];return code;};
  const classes=new Map(),counts={states:ordered.length,terminal:0,nonterminal:0,t2:{W:0,L2:0,O:0},wdl:{'-1':0,'0':0,'1':0}},shards=[];
  const ingest=rows=>{for(const row of rows){counts.wdl[row.wdlAbsolute]++;if(row.terminal)counts.terminal++;else{counts.nonterminal++;counts.t2[row.t2]++;if(row.t2==='O')classes.set(JSON.stringify(row.roleCapparZoe),row.roleCapparZoe);}}};
  for(let offset=0;offset<ordered.length;offset+=config.shardSize){
    const number=offset/config.shardSize,name=`independent-rows-${String(number).padStart(5,'0')}.ndjson.gz`,prior=readCheckpoint(name);
    let rows,bytes;
    if(prior){bytes=prior;rows=gunzipSync(prior).toString('utf8').trimEnd().split('\n').map(JSON.parse);}
    else{rows=Array.from(ordered.subarray(offset,offset+config.shardSize),pair=>oracle.row(fromPair(pair)));bytes=gzipSync(rows.map(row=>JSON.stringify(row)).join('\n')+'\n');checkpoint(name,bytes);}
    if(rows.length!==Math.min(config.shardSize,ordered.length-offset))throw new Error('Shard row count drift');
    ingest(rows);shards.push({file:name,sha256:digest(bytes),rows:rows.length,first:rows[0].key,last:rows.at(-1).key});
    progress({phase:'state-records',completed:Math.min(offset+config.shardSize,ordered.length),total:ordered.length,structuralClasses:classes.size});
  }
  const signatures=[...classes.values()].sort((a,b)=>JSON.stringify(a)<JSON.stringify(b)?-1:1);
  checkpoint('independent-signatures.json.gz',gzipSync(JSON.stringify(signatures)));
  json(path.join(target,'independent-state-manifest.json'),{configHash,label,counts,shards,structuralClasses:classes.size});
  progress({phase:'state-records-complete',counts,structuralClasses:classes.size});
  let ooo=null;
  if(!process.argv.includes('--skip-ooo')){ooo=dependencyImage(signatures);json(path.join(target,'independent-ooo-image.json'),ooo);progress({phase:'ooo-complete',lowerRank:ooo.lowerRank,leftNullity:ooo.leftNullity,oooRank:ooo.oooRank,canonicalImageSha256:ooo.canonicalImageSha256});}
  json(summaryFile,{configHash,label,counts,structuralClasses:classes.size,ooo:ooo?{lowerRank:ooo.lowerRank,leftNullity:ooo.leftNullity,oooRank:ooo.oooRank,canonicalImageSha256:ooo.canonicalImageSha256}:null,complete:ooo!==null,stateRecordsComplete:true,qualification:'PENDING_REFERENCE_COMPARISON',discovery:'NO_NEW_DISCOVERY_REQUESTED'});
}catch(error){progress({phase:'failed',message:error.message,stack:error.stack});throw error;}
