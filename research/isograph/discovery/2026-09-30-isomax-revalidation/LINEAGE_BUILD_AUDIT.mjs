import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {transformBucketCount} from '../2026-09-29-isomax-late-xor-components/ooo-pair-delta-bucket-lib.mjs';
import {SIGN_CHANNEL_MODES,SIGN_CHANNEL_SOURCE_CODES,coupleFamilyPair,signChannelModeNoFiner} from '../2026-09-29-isomax-late-xor-components/ooo-sign-channel-coupling-lib.mjs';

const outDir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(outDir,'../../../..');
const base='research/isograph/discovery/2026-09-29-isomax-late-xor-components/';
const head='a0d439449e398c5ce5a70ccbc9b3a38f3df16928';
const observedWorkingHead=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
// The parent may advance this shared checkout. Read historical source blobs explicitly.
// Imported libraries must still match that pinned source before executing structural checks.
const changedLibraries=execFileSync('git',['diff',head,'--name-only','--',base+'*-lib.mjs'],{cwd:root,encoding:'utf8'}).trim();
assert.equal(changedLibraries,'','a structural library changed; audit must pin its runtime too');
const files=[
  ...Array.from({length:13},(_,i)=>`EXPERIMENTAL_WARRANT_RS_${String(65+i).padStart(3,'0')}.json`),
  'run-matched-degree2-dependency-quotient.mjs','run-role-cappar-depth-compression.mjs',
  'run-ooo-descriptor-motif-functional-ladder.mjs','run-ooo-motif-hypergraph-boundary.mjs',
  'ooo-exchange-circuit-lib.mjs','ooo-pair-delta-family-lib.mjs','ooo-pair-delta-index-lib.mjs',
  'ooo-pair-delta-owner-lib.mjs','ooo-pair-delta-bucket-lib.mjs','ooo-six-bucket-count-lib.mjs',
  'ooo-six-bucket-family-saturation-lib.mjs','ooo-sign-channel-coupling-lib.mjs',
  'ooo-grid-freeze-lib.mjs','run-ooo-sign-channel-coupling.mjs','RS077_FREEZE_SEQUENCE_AUDIT_0_1.json'
];
const anchors=['matchedDegree2','roleCapacityRelativeDescriptor','descriptorSummary','motifRow','oooMotifHypergraphBoundaryAudit','exactPairDelta','compressedPairDelta','familyTriangleKey','quotientPairDelta','ownerQuotientPairDelta','transformBucketCount','familySaturationPairDelta','sourceInterval','coupleFamilyPair','signChannelModeNoFiner','freezeGridThenReplay'];
const sources=files.map(file=>{
  const bytes=execFileSync('git',['show',head+':'+base+file],{cwd:root}),text=bytes.toString('utf8');
  return {path:base+file,sha256Bytes:createHash('sha256').update(bytes).digest('hex'),anchors:text.split(/\r?\n/).flatMap((line,i)=>anchors.filter(a=>line.includes(a)).map(symbol=>({symbol,line:i+1}))).filter((x,i,a)=>a.findIndex(y=>y.symbol===x.symbol)===i)};
});
const examples={
  clip3DoesNotDetermineZoe:[3,4].map(n=>({n,clip3:transformBucketCount(n,'BUCKET_CLIP3'),zoe:transformBucketCount(n,'BUCKET_ZOE')})),
  zoeDoesNotDetermineClip3:[1,3].map(n=>({n,clip3:transformBucketCount(n,'BUCKET_CLIP3'),zoe:transformBucketCount(n,'BUCKET_ZOE')}))
};
assert.equal(examples.clip3DoesNotDetermineZoe[0].clip3,examples.clip3DoesNotDetermineZoe[1].clip3);
assert.notEqual(examples.clip3DoesNotDetermineZoe[0].zoe,examples.clip3DoesNotDetermineZoe[1].zoe);
assert.equal(examples.zoeDoesNotDetermineClip3[0].zoe,examples.zoeDoesNotDetermineClip3[1].zoe);
assert.notEqual(examples.zoeDoesNotDetermineClip3[0].clip3,examples.zoeDoesNotDetermineClip3[1].clip3);
const selectedModes={C:'BUCKET_PRESENCE',D:'BUCKET_CLIP3',A:'BUCKET_CLIP2'};
for(const mode of Object.values(selectedModes)){
  const seen=new Map();
  for(let n=0;n<=64;n++){
    const a=transformBucketCount(n,'BUCKET_CLIP3'),b=transformBucketCount(n,mode);
    if(seen.has(a))assert.equal(b,seen.get(a));else seen.set(a,b);
  }
}
// Independently compute partition containment on the complete finite symbol domains.
const partitions={};
for(const family of ['C','D','A']){
  const pairs=SIGN_CHANNEL_SOURCE_CODES[family].flatMap(p=>SIGN_CHANNEL_SOURCE_CODES[family].map(m=>[p,m]));
  const columns=Object.fromEntries(SIGN_CHANNEL_MODES.map(mode=>[mode,pairs.map(([p,m])=>coupleFamilyPair(family,p,m,mode))]));
  const relation=[];
  for(const coarse of SIGN_CHANNEL_MODES)for(const fine of SIGN_CHANNEL_MODES){
    const seen=new Map();let valid=true;
    for(let i=0;i<pairs.length;i++){
      const f=columns[fine][i],c=columns[coarse][i];
      if(seen.has(f)&&seen.get(f)!==c)valid=false;
      seen.set(f,c);
    }
    assert.equal(valid,signChannelModeNoFiner(family,coarse,fine));
    if(valid)relation.push({coarse,fine});
  }
  partitions[family]={sourcePairs:pairs.length,noFinerThan:relation};
}
const report={schema:'connect4.isomax.revalidation.lineage_source_audit.v1',head,observedWorkingHead,canonicalOwner:'research/semantic-quotient',authorityEffect:'NONE',scope:'source lineage and synthetic structural checks only',sourceHashConvention:'exact Git blob bytes at pinned head; not working-tree CRLF bytes',newScalarReplay:false,sealedHoldoutsAccessed:false,sources,checks:{status:'PASS',examples,selectedRs076FactorsThroughClip3:{countGrid:[0,64],modes:selectedModes,scope:'finite sanity check plus direct transform definitions'},rs077FiniteSymbolPartitions:partitions},unverified:['state enumeration','historical scalar exactness and rank claims','all RS071 reflection/provenance claims','carrier-independent gauge invariance','fresh-carrier non-affinity','fresh scalar qualification']};
fs.writeFileSync(path.join(outDir,'LINEAGE_SOURCE_AUDIT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',sources:sources.length,newScalarReplay:false,output:'LINEAGE_SOURCE_AUDIT.json'}));
