import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=new URL('.',import.meta.url);
const result=JSON.parse(fs.readFileSync(new URL('./OOO_SIGN_CHANNEL_COUPLING_0_1.json',base),'utf8'));

assert.equal(result.schema,'connect4.isomax.sign_channel_coupling.v1');
assert.equal(result.warrant,'EW-RS-077');
assert.deepEqual(result.cases.map(x=>x.label),['6x3-k3','4x5-k4','6x3-k4']);
assert.ok(!result.cases.some(x=>x.label==='3x6-k4'||x.label==='5x3-k4'),'sealed EW-RS-059 holdout leaked into RS-077');

const modes=['TOTAL','SIGNED_NET','ABS_NET','UNORDERED_PAIR','SEPARATED'];
const expectedControlRank=new Map([
  ['6x3-k3',72],['4x5-k4',252],['6x3-k4',14]
]);

function key(c){return 'C='+c.C+'|D='+c.D+'|A='+c.A;}
const grid=[];
for(const C of modes)for(const D of modes)for(const A of modes)grid.push({C,D,A,key:key({C,D,A})});

function noFiner(a,b){
  if(a===b)return true;
  if((a==='TOTAL'||a==='ABS_NET')&&(b==='UNORDERED_PAIR'||b==='SEPARATED'))return true;
  if(a==='UNORDERED_PAIR'&&b==='SEPARATED')return true;
  if(a==='SIGNED_NET'&&b==='SEPARATED')return true;
  return false;
}
function strictlyCoarser(a,b){
  return ['C','D','A'].every(k=>noFiner(a[k],b[k])) &&
    ['C','D','A'].some(k=>a[k]!==b[k]);
}

const caseSummary={};
for(const c of result.cases){
  const q=c.decoder.oooSignChannelCoupling;
  assert.deepEqual(q.modes,modes,c.label+' sign-channel mode catalog drift');
  assert.equal(q.grid.length,125,c.label+' sign-channel grid size drift');
  assert.deepEqual(q.grid,grid,c.label+' sign-channel grid ordering drift');
  assert.equal(q.audits.length,125,c.label+' sign-channel audit count drift');

  const control=q.audits.find(x=>x.key==='C=SEPARATED|D=SEPARATED|A=SEPARATED');
  assert.ok(control&&control.exactScalarFactorization,c.label+' separated sign-channel control failure');
  assert.equal(control.imageRank,expectedControlRank.get(c.label),c.label+' separated sign-channel rank drift');

  caseSummary[c.label]=q.audits.map(x=>({
    key:x.key,C:x.C,D:x.D,A:x.A,
    featureKeyCount:x.featureKeyCount,
    imageRank:x.imageRank,
    kernelDimensionRelativeToSeparated:x.kernelDimensionRelativeToSeparated,
    contradictions:x.contradictions,
    zeroStructuralNonzeroScalar:x.zeroStructuralNonzeroScalar,
    scalarImageDimensionOnBasis:x.scalarImageDimensionOnBasis,
    exactScalarFactorization:x.exactScalarFactorization
  }));
}

const commonExact=grid.filter(g=>result.cases.every(c=>
  c.decoder.oooSignChannelCoupling.audits.find(x=>x.key===g.key)?.exactScalarFactorization===true
));
const pareto=commonExact.filter(x=>!commonExact.some(y=>strictlyCoarser(y,x)));

const familyWithoutSeparated={};
for(const fam of ['C','D','A'])
  familyWithoutSeparated[fam]=commonExact.filter(x=>x[fam]!=='SEPARATED').map(key);

assert.equal(result.mechanicalChecks.signChannelCouplingSemanticsFrozen,true);
assert.equal(result.mechanicalChecks.signChannelGridFrozenBeforeScalarReplay,true);
assert.equal(result.mechanicalChecks.separatedSignChannelControlsReproduced,true);

const out={
  schema:'connect4.isomax.sign_channel_coupling_result_verify.v1',
  warrant:'EW-RS-077',
  status:'PASS',
  cases:caseSummary,
  common:{
    exactGrid:commonExact.map(key),
    paretoMinimalExact:pareto.map(key),
    familyWithoutSeparated
  },
  holdouts:{primary:'3x6-k4',backup:'5x3-k4',sealed:true}
};

fs.writeFileSync(new URL('./OOO_SIGN_CHANNEL_COUPLING_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
