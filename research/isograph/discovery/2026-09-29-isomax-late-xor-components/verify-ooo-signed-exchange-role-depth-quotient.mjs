import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=new URL('.',import.meta.url);
const result=JSON.parse(fs.readFileSync(new URL('./OOO_SIGNED_EXCHANGE_ROLE_DEPTH_QUOTIENT_0_1.json',base),'utf8'));
assert.equal(result.schema,'connect4.isomax.signed_exchange_role_depth_index.v1');
assert.equal(result.warrant,'EW-RS-073');
assert.deepEqual(result.cases.map(x=>x.label),['6x3-k3','4x5-k4','6x3-k4']);
assert.ok(!result.cases.some(x=>x.label==='3x6-k4'||x.label==='5x3-k4'),'sealed holdout leaked into RS-073');

const encodings=['SIGN','SIGNED_PARITY'];
const grid=[
  ['C_ROLELESS','D_DEPTHLESS'],
  ['C_ROLELESS','D_DEPTH_PARITY'],
  ['C_ROLELESS','D_EXACT_DEPTH'],
  ['C_EXACT_ROLE','D_DEPTHLESS'],
  ['C_EXACT_ROLE','D_DEPTH_PARITY'],
  ['C_EXACT_ROLE','D_EXACT_DEPTH']
];
const expectedSignRank=new Map([['6x3-k3',70],['4x5-k4',283],['6x3-k4',16]]);
const expectedSpRank=new Map([['6x3-k3',73],['4x5-k4',282],['6x3-k4',14]]);
const cOrder={C_ROLELESS:0,C_EXACT_ROLE:1};
const dOrder={D_DEPTHLESS:0,D_DEPTH_PARITY:1,D_EXACT_DEPTH:2};
const coarser=(a,b)=>cOrder[a.cMode]<=cOrder[b.cMode]&&dOrder[a.dMode]<=dOrder[b.dMode]&&(cOrder[a.cMode]<cOrder[b.cMode]||dOrder[a.dMode]<dOrder[b.dMode]);

const summary={};
for(const c of result.cases){
  const q=c.decoder.oooSignedExchangeRoleDepthQuotient;
  assert.deepEqual(q.encodings,encodings,c.label+' encoding drift');
  assert.deepEqual(q.grid,grid,c.label+' grid drift');
  assert.equal(q.audits.length,12,c.label+' audit count drift');
  const sign=q.audits.find(x=>x.encoding==='SIGN'&&x.gridKey==='C_EXACT_ROLE+D_EXACT_DEPTH');
  const sp=q.audits.find(x=>x.encoding==='SIGNED_PARITY'&&x.gridKey==='C_EXACT_ROLE+D_EXACT_DEPTH');
  assert.ok(sign&&sign.exactScalarFactorization,c.label+' exact SIGN control failure');
  assert.ok(sp&&sp.exactScalarFactorization,c.label+' exact SP control failure');
  assert.equal(sign.imageRank,expectedSignRank.get(c.label),c.label+' SIGN rank drift');
  assert.equal(sp.imageRank,expectedSpRank.get(c.label),c.label+' SP rank drift');

  summary[c.label]={};
  for(const encoding of encodings){
    const audits=q.audits.filter(x=>x.encoding===encoding);
    const exact=audits.filter(x=>x.exactScalarFactorization);
    const minimal=exact.filter(x=>!exact.some(y=>coarser(y,x))).map(x=>x.gridKey).sort();
    assert.deepEqual([...q.inclusionMinimalExact[encoding]].sort(),minimal,c.label+' minimal summary drift '+encoding);
    summary[c.label][encoding]={
      exactGrid:exact.map(x=>x.gridKey),
      minimalExact:minimal,
      audits:audits.map(x=>({
        gridKey:x.gridKey,featureKeyCount:x.featureKeyCount,imageRank:x.imageRank,
        kernelDimensionRelativeToFull:x.kernelDimensionRelativeToFull,
        contradictions:x.contradictions,zeroStructuralNonzeroScalar:x.zeroStructuralNonzeroScalar,
        scalarImageDimensionOnBasis:x.scalarImageDimensionOnBasis,exactScalarFactorization:x.exactScalarFactorization
      }))
    };
  }
}

const common={};
for(const encoding of encodings){
  const points=grid.map(([cMode,dMode])=>({cMode,dMode,gridKey:cMode+'+'+dMode}));
  const exact=points.filter(p=>result.cases.every(c=>c.decoder.oooSignedExchangeRoleDepthQuotient.audits.find(x=>x.encoding===encoding&&x.gridKey===p.gridKey)?.exactScalarFactorization));
  const minimal=exact.filter(x=>!exact.some(y=>coarser(y,x))).map(x=>x.gridKey).sort();
  common[encoding]={exactGrid:exact.map(x=>x.gridKey),inclusionMinimalExact:minimal};
}

assert.equal(result.mechanicalChecks.roleDepthQuotientSemanticsFrozen,true);
assert.equal(result.mechanicalChecks.roleDepthGridFrozenBeforeScalarReplay,true);
assert.equal(result.mechanicalChecks.exactRoleDepthControlsReproduced,true);

const out={
  schema:'connect4.isomax.signed_exchange_role_depth_index_result_verify.v1',
  warrant:'EW-RS-073',status:'PASS',cases:summary,common,
  holdouts:{primary:'3x6-k4',backup:'5x3-k4',sealed:true}
};
fs.writeFileSync(new URL('./OOO_SIGNED_EXCHANGE_ROLE_DEPTH_QUOTIENT_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
