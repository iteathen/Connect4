import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=new URL('.',import.meta.url);
const result=JSON.parse(fs.readFileSync(new URL('./OOO_SIGNED_EXCHANGE_OWNER_QUOTIENT_0_1.json',base),'utf8'));

assert.equal(result.schema,'connect4.isomax.signed_exchange_owner_channel.v1');
assert.equal(result.warrant,'EW-RS-074');
assert.deepEqual(result.cases.map(x=>x.label),['6x3-k3','4x5-k4','6x3-k4']);
assert.ok(!result.cases.some(x=>x.label==='3x6-k4'||x.label==='5x3-k4'),'sealed EW-RS-059 holdout leaked into RS-074');

const modes=['D_MERGED','D_SYMMETRIC_MARGINALS','D_UNORDERED_CHANNELS','D_SEPARATED'];
const expectedControlRank=new Map([
  ['6x3-k3',73],
  ['4x5-k4',262],
  ['6x3-k4',14]
]);

const cases={};
for(const c of result.cases){
  const q=c.decoder.oooSignedExchangeOwnerQuotient;
  assert.deepEqual(q.modes,modes,c.label+' owner mode ladder drift');
  const sep=q.audits.find(x=>x.mode==='D_SEPARATED');
  assert.ok(sep,c.label+' missing separated control');
  assert.equal(sep.imageRank,expectedControlRank.get(c.label),c.label+' separated control rank drift');
  assert.equal(sep.contradictions,0,c.label+' separated control contradiction');
  assert.equal(sep.exactScalarFactorization,true,c.label+' separated control factorization failure');

  cases[c.label]=q.audits.map(x=>({
    mode:x.mode,
    featureKeyCount:x.featureKeyCount,
    imageRank:x.imageRank,
    kernelDimensionRelativeToSeparated:x.kernelDimensionRelativeToSeparated,
    zeroStructuralNonzeroScalar:x.zeroStructuralNonzeroScalar,
    contradictions:x.contradictions,
    scalarDependencyImageDimension:x.scalarDependencyImageDimension,
    scalarImageDimensionOnBasis:x.scalarImageDimensionOnBasis,
    exactScalarFactorization:x.exactScalarFactorization
  }));
}

const commonExact=modes.filter(mode=>result.cases.every(c=>
  c.decoder.oooSignedExchangeOwnerQuotient.audits.find(x=>x.mode===mode)?.exactScalarFactorization===true
));
const selected=commonExact[0]??null;

assert.equal(result.mechanicalChecks.ownerQuotientSemanticsFrozen,true);
assert.equal(result.mechanicalChecks.ownerQuotientModesFrozenBeforeScalarReplay,true);
assert.equal(result.mechanicalChecks.separatedOwnerControlsReproduced,true);

const out={
  schema:'connect4.isomax.signed_exchange_owner_channel_result_verify.v1',
  warrant:'EW-RS-074',
  status:'PASS',
  cases,
  common:{exactModes:commonExact,selectedByFrozenOrder:selected},
  holdouts:{primary:'3x6-k4',backup:'5x3-k4',sealed:true}
};

fs.writeFileSync(new URL('./OOO_SIGNED_EXCHANGE_OWNER_QUOTIENT_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
