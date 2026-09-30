import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=new URL('.',import.meta.url);
const result=JSON.parse(fs.readFileSync(new URL('./OOO_SIX_BUCKET_FAMILY_SATURATION_0_1.json',base),'utf8'));

assert.equal(result.schema,'connect4.isomax.six_bucket_family_saturation.v1');
assert.equal(result.warrant,'EW-RS-076');
assert.deepEqual(result.cases.map(x=>x.label),['6x3-k3','4x5-k4','6x3-k4']);
assert.ok(!result.cases.some(x=>x.label==='3x6-k4'||x.label==='5x3-k4'),'sealed EW-RS-059 holdout leaked into RS-076');

const modes=['PRESENCE','ZOE','CLIP2','CLIP3'];
const expectedControlRank=new Map([
  ['6x3-k3',72],['4x5-k4',253],['6x3-k4',14]
]);

function key(c){return 'C='+c.C+'|D='+c.D+'|A='+c.A;}

const expectedGrid=[];
for(const C of modes)for(const D of modes)for(const A of modes)expectedGrid.push({C,D,A,key:'C='+C+'|D='+D+'|A='+A});

function noFiner(a,b){
  if(a===b)return true;
  if(a==='PRESENCE'&&(b==='ZOE'||b==='CLIP2'||b==='CLIP3'))return true;
  if(a==='CLIP2'&&b==='CLIP3')return true;
  return false;
}
function strictlyCoarser(a,b){
  return ['C','D','A'].every(k=>noFiner(a[k],b[k])) &&
    ['C','D','A'].some(k=>a[k]!==b[k]);
}

const caseSummary={};
for(const c of result.cases){
  const q=c.decoder.oooSixBucketFamilySaturation;
  assert.deepEqual(q.familyModes,modes,c.label+' family mode catalog drift');
  assert.equal(q.grid.length,64,c.label+' grid size drift');
  assert.deepEqual(q.grid,expectedGrid,c.label+' grid ordering drift');
  assert.equal(q.audits.length,64,c.label+' audit count drift');

  const control=q.audits.find(x=>x.key==='C=CLIP3|D=CLIP3|A=CLIP3');
  assert.ok(control&&control.exactScalarFactorization,c.label+' uniform CLIP3 control failure');
  assert.equal(control.imageRank,expectedControlRank.get(c.label),c.label+' uniform CLIP3 rank drift');

  caseSummary[c.label]=q.audits.map(x=>({
    key:x.key,C:x.C,D:x.D,A:x.A,
    featureKeyCount:x.featureKeyCount,
    imageRank:x.imageRank,
    kernelDimensionRelativeToClip3:x.kernelDimensionRelativeToClip3,
    contradictions:x.contradictions,
    zeroStructuralNonzeroScalar:x.zeroStructuralNonzeroScalar,
    scalarImageDimensionOnBasis:x.scalarImageDimensionOnBasis,
    exactScalarFactorization:x.exactScalarFactorization
  }));
}

const commonExact=expectedGrid.filter(candidate=>result.cases.every(c=>{
  const a=c.decoder.oooSixBucketFamilySaturation.audits.find(x=>x.key===candidate.key);
  return a?.exactScalarFactorization===true;
}));

const paretoMinimal=commonExact.filter(x=>!commonExact.some(y=>strictlyCoarser(y,x)));

const familyBelowClip3={};
for(const fam of ['C','D','A']){
  familyBelowClip3[fam]=commonExact
    .filter(x=>x[fam]!=='CLIP3')
    .map(key);
}

assert.equal(result.mechanicalChecks.familySaturationSemanticsFrozen,true);
assert.equal(result.mechanicalChecks.familySaturationGridFrozenBeforeScalarReplay,true);
assert.equal(result.mechanicalChecks.uniformClip3FamilyControlsReproduced,true);

const out={
  schema:'connect4.isomax.six_bucket_family_saturation_result_verify.v1',
  warrant:'EW-RS-076',
  status:'PASS',
  cases:caseSummary,
  common:{
    exactGrid:commonExact.map(key),
    paretoMinimalExact:paretoMinimal.map(key),
    familyBelowClip3
  },
  holdouts:{primary:'3x6-k4',backup:'5x3-k4',sealed:true}
};

fs.writeFileSync(new URL('./OOO_SIX_BUCKET_FAMILY_SATURATION_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
