import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=new URL('.',import.meta.url);
const result=JSON.parse(fs.readFileSync(new URL('./OOO_SIGNED_EXCHANGE_TOKEN_FAMILY_MSS_0_1.json',base),'utf8'));

assert.equal(result.schema,'connect4.isomax.signed_exchange_token_family_mss.v1');
assert.equal(result.warrant,'EW-RS-072');
assert.deepEqual(result.cases.map(x=>x.label),['6x3-k3','4x5-k4','6x3-k4']);
assert.ok(!result.cases.some(x=>x.label==='3x6-k4'||x.label==='5x3-k4'),'sealed EW-RS-059 holdout leaked into RS-072');

const subsets=[
  ['W'],['C'],['D0'],['D1'],
  ['W','C'],['W','D0'],['W','D1'],['C','D0'],['C','D1'],['D0','D1'],
  ['W','C','D0'],['W','C','D1'],['W','D0','D1'],['C','D0','D1'],
  ['W','C','D0','D1']
];
const encodings=['SIGN','SIGNED_PARITY'];
const expectedSignRank=new Map([['6x3-k3',70],['4x5-k4',283],['6x3-k4',16]]);
const expectedSpRank=new Map([['6x3-k3',73],['4x5-k4',282],['6x3-k4',14]]);

function key(xs){return xs.join('+');}
function strictSubset(a,b){return a.length<b.length&&a.every(x=>b.includes(x));}

const summary={};
for(const c of result.cases){
  const q=c.decoder.oooSignedExchangeTokenFamilyMss;
  assert.deepEqual(q.tokenFamilies,['W','C','D0','D1'],c.label+' token-family catalog drift');
  assert.deepEqual(q.familySubsets,subsets,c.label+' family-subset catalog drift');
  assert.deepEqual(q.encodings,encodings,c.label+' encoding catalog drift');
  assert.equal(q.audits.length,30,c.label+' audit count drift');

  const fullSign=q.audits.find(x=>x.encoding==='SIGN'&&x.familyKey==='W+C+D0+D1');
  const fullSp=q.audits.find(x=>x.encoding==='SIGNED_PARITY'&&x.familyKey==='W+C+D0+D1');
  assert.ok(fullSign&&fullSign.exactScalarFactorization,c.label+' full SIGN control failure');
  assert.ok(fullSp&&fullSp.exactScalarFactorization,c.label+' full SIGNED_PARITY control failure');
  assert.equal(fullSign.imageRank,expectedSignRank.get(c.label),c.label+' full SIGN rank drift');
  assert.equal(fullSp.imageRank,expectedSpRank.get(c.label),c.label+' full SIGNED_PARITY rank drift');

  summary[c.label]={};
  for(const encoding of encodings){
    const audits=q.audits.filter(x=>x.encoding===encoding);
    const exact=audits.filter(x=>x.exactScalarFactorization);
    const minimal=exact.filter(x=>!exact.some(y=>strictSubset(y.families,x.families))).map(x=>x.familyKey).sort();
    assert.deepEqual([...q.inclusionMinimalExact[encoding]].sort(),minimal,c.label+' minimal exact summary drift '+encoding);
    summary[c.label][encoding]={
      exactSubsets:exact.map(x=>x.familyKey),
      minimalExact:minimal,
      audits:audits.map(x=>({
        familyKey:x.familyKey,
        familyCount:x.familyCount,
        featureKeyCount:x.featureKeyCount,
        imageRank:x.imageRank,
        kernelDimensionRelativeToFull:x.kernelDimensionRelativeToFull,
        contradictions:x.contradictions,
        zeroStructuralNonzeroScalar:x.zeroStructuralNonzeroScalar,
        scalarImageDimensionOnBasis:x.scalarImageDimensionOnBasis,
        exactScalarFactorization:x.exactScalarFactorization
      }))
    };
  }
}

const common={};
for(const encoding of encodings){
  const commonExact=subsets.filter(subset=>result.cases.every(c=>{
    const a=c.decoder.oooSignedExchangeTokenFamilyMss.audits.find(x=>x.encoding===encoding&&x.familyKey===key(subset));
    return a?.exactScalarFactorization===true;
  }));
  const minimal=commonExact.filter(x=>!commonExact.some(y=>strictSubset(y,x))).map(key).sort();
  common[encoding]={
    exactSubsets:commonExact.map(key),
    inclusionMinimalExact:minimal
  };
}

assert.equal(result.mechanicalChecks.pairDeltaFamilySemanticsFrozen,true);
assert.equal(result.mechanicalChecks.tokenFamilySubsetsFrozenBeforeScalarReplay,true);
assert.equal(result.mechanicalChecks.fullSignedFamilyControlsReproduced,true);

const out={
  schema:'connect4.isomax.signed_exchange_token_family_mss_result_verify.v1',
  warrant:'EW-RS-072',
  status:'PASS',
  cases:summary,
  common,
  holdouts:{primary:'3x6-k4',backup:'5x3-k4',sealed:true}
};
fs.writeFileSync(new URL('./OOO_SIGNED_EXCHANGE_TOKEN_FAMILY_MSS_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
