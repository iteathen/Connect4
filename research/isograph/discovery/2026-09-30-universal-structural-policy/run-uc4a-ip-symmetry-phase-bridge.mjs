#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const dir=resolve(import.meta.dirname);
const STRUCTURAL_SHA='374d744378bf71b77db0711d1eb2ef4a21ec1cb4c80736aa206abd4520dd1aa9';
const structural=JSON.parse(readFileSync(resolve(dir,'UC4A_IP_SYMMETRY_PHASE_STRUCTURAL_0_1.json'),'utf8'));
const localization=JSON.parse(readFileSync(resolve(dir,'UC4A_CURVATURE_QUOTIENT_LOCALIZATION_0_1.json'),'utf8'));

if(structural.schema!=='connect4.uc4a_ip_symmetry_phase_structural.v1')throw new Error('unexpected structural bridge source schema');
if(structural.phase!=='LABEL_FREE_IP_STRUCTURAL_MODE_FREEZE')throw new Error('structural bridge source was not frozen label-free');
if(structural.structuralAtlasSha256!==STRUCTURAL_SHA)throw new Error('structural bridge atlas hash drift');
if(structural.boardCount!==169||structural.curvatureRowCount!==430)throw new Error('unexpected extended structural source size');
if(structural.outcomeLabelsAccessibleToProducer!==false||structural.localizationArtifactAccessibleToProducer!==false)throw new Error('Phase-A isolation boundary invalid');
if(localization.schema!=='connect4.uc4a_curvature_quotient_localization.v1')throw new Error('unexpected localization schema');
if(localization.curvatureAtlasSha256!=='58ac628a545a434f176e84c834b03f145a7efaf86f2389abb106465b13ea99b3')throw new Error('localization source drift');
if(structural.sealedHoldoutsAccessed!==false||localization.sealedHoldoutsAccessed!==false)throw new Error('sealed holdout boundary invalid');

function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function sha256(value){return createHash('sha256').update(typeof value==='string'?value:stable(value)).digest('hex');}
function absBig(x){return x<0n?-x:x;}
function gcdBig(a,b){a=absBig(a);b=absBig(b);while(b!==0n){const t=a%b;a=b;b=t;}return a;}
function lcmBig(a,b){if(a===0n||b===0n)return 0n;return absBig(a/gcdBig(a,b)*b);}

function frac(n,d=1n){
  if(d===0n)throw new Error('zero denominator');
  if(n===0n)return {n:0n,d:1n};
  if(d<0n){n=-n;d=-d;}
  const g=gcdBig(n,d);return {n:n/g,d:d/g};
}
function parseFrac(s){
  if(typeof s==='number')return frac(BigInt(s));
  const p=String(s).split('/');
  return p.length===1?frac(BigInt(p[0])):frac(BigInt(p[0]),BigInt(p[1]));
}
function fzero(x){return x.n===0n;}
function fstr(x){return x.d===1n?x.n.toString():x.n.toString()+'/'+x.d.toString();}

const bridgeFields=structural.fieldRegistry.bridgeIntegerFields;
if(!Array.isArray(bridgeFields)||bridgeFields.length===0)throw new Error('missing frozen bridge field registry');
const bridgeIndex=new Map(bridgeFields.map((f,i)=>[f,i]));

const ALIASES=new Map([
  ['G.leftRightReflection.fixedCells','G.leftRightFixedCells'],
  ['G.leftRightReflection.fixedLines','G.leftRightFixedLines']
]);
function mapField(field){
  if(bridgeIndex.has(field))return field;
  const alias=ALIASES.get(field);
  if(alias&&bridgeIndex.has(alias))return alias;
  return null;
}

function primitiveBig(values){
  let g=0n;
  for(const v of values)g=gcdBig(g,BigInt(v));
  if(g===0n)return null;
  let out=values.map(v=>BigInt(v)/g);
  const first=out.find(v=>v!==0n);
  if(first<0n)out=out.map(v=>-v);
  return out;
}
function primitiveFraction(values){
  let l=1n;
  for(const x of values)l=lcmBig(l,x.d);
  const ints=values.map(x=>x.n*(l/x.d));
  return primitiveBig(ints);
}
function serializeBig(v){return v.map(x=>x.toString()).join('|');}
function vectorModeId(prefix,v){return prefix+'-'+sha256(serializeBig(v)).slice(0,16);}
function nonzeroCoordinates(v){
  return v.map((x,i)=>x!==0n?{field:bridgeFields[i],value:x.toString()}:null).filter(Boolean);
}
function boardsOutsideFocus(row){
  return row.boards.every(board=>{
    const [w,h]=board.split('x').map(Number);
    return ![8,9,10].includes(w)&&h!==6;
  });
}

const rawGroups=new Map();
for(const row of structural.curvatureRows){
  const vector=primitiveBig(bridgeFields.map(f=>row.integer[f]));
  if(!vector)continue;
  const key=serializeBig(vector);
  if(!rawGroups.has(key))rawGroups.set(key,{modeId:vectorModeId('U',vector),vector,rows:[]});
  rawGroups.get(key).rows.push(row);
}
const rawModes=[...rawGroups.values()].map(g=>{
  const outside=g.rows.filter(boardsOutsideFocus);
  return {
    modeId:g.modeId,
    vector:g.vector,
    rowCount:g.rows.length,
    rowIds:g.rows.map(x=>x.id).sort(),
    families:[...new Set(g.rows.map(x=>x.family))].sort(),
    regimes:[...new Map(g.rows.map(x=>[stable(x.tags),x.tags])).values()],
    nonzeroCoordinates:nonzeroCoordinates(g.vector),
    rowsOutsideFocusDimensions:outside.map(x=>x.id).sort(),
    recursOutsideFocusDimensions:outside.length>0
  };
}).sort((a,b)=>b.rowCount-a.rowCount||a.modeId.localeCompare(b.modeId));
const modeById=new Map(rawModes.map(x=>[x.modeId,x]));

function targetVector(direction){
  const values=Array.from({length:bridgeFields.length},()=>frac(0n));
  const outOfSpace=[];
  for(const coord of direction.normalizedNonzeroCoordinates){
    const mapped=mapField(coord.field);
    if(!mapped){outOfSpace.push(coord.field);continue;}
    const idx=bridgeIndex.get(mapped);
    values[idx]=parseFrac(coord.value);
  }
  return {values,outOfSpace,primitive:outOfSpace.length?null:primitiveFraction(values)};
}

function quotientProjection(v,t,pivot){
  const tp=t[pivot],vp=v[pivot];
  const out=[];
  for(let i=0;i<v.length;i++){
    if(i===pivot)continue;
    out.push(v[i]*tp-vp*t[i]);
  }
  return primitiveBig(out);
}
function rankRows(rows){
  if(!rows.length)return 0;
  const A=rows.map(row=>row.map(BigInt));
  let r=0;
  const n=A[0].length;
  for(let c=0;c<n&&r<A.length;c++){
    let p=r;while(p<A.length&&A[p][c]===0n)p++;
    if(p===A.length)continue;
    [A[r],A[p]]=[A[p],A[r]];
    for(let i=r+1;i<A.length;i++){
      if(A[i][c]===0n)continue;
      const a=A[r][c],b=A[i][c],g=gcdBig(a,b);
      const alpha=a/g,beta=b/g;
      for(let j=c;j<n;j++)A[i][j]=A[i][j]*alpha-A[r][j]*beta;
      let rg=0n;
      for(let j=c+1;j<n;j++)rg=gcdBig(rg,A[i][j]);
      if(rg>1n)for(let j=c+1;j<n;j++)A[i][j]/=rg;
    }
    r++;
  }
  return r;
}
function canonicalTwoSpace(a,b){
  const A=[a.map(x=>frac(x)),b.map(x=>frac(x))];
  let r=0;
  for(let c=0;c<a.length&&r<2;c++){
    let p=r;while(p<2&&fzero(A[p][c]))p++;
    if(p===2)continue;
    [A[r],A[p]]=[A[p],A[r]];
    const pv=A[r][c];
    for(let j=c;j<a.length;j++)A[r][j]=frac(A[r][j].n*pv.d,A[r][j].d*pv.n);
    for(let i=0;i<2;i++){
      if(i===r||fzero(A[i][c]))continue;
      const q=A[i][c];
      for(let j=c;j<a.length;j++){
        const product=frac(q.n*A[r][j].n,q.d*A[r][j].d);
        A[i][j]=frac(A[i][j].n*product.d-product.n*A[i][j].d,A[i][j].d*product.d);
      }
    }
    r++;
  }
  if(r!==2)throw new Error('canonicalTwoSpace received dependent pair');
  return A.map(row=>row.map(fstr).join(',')).join(';');
}
function choose3(list){
  const out=[];
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)for(let k=j+1;k<list.length;k++)out.push([list[i],list[j],list[k]]);
  return out;
}
function setSummary(ids){
  const modes=ids.map(id=>modeById.get(id));
  return {
    modeIds:ids,
    families:[...new Set(modes.flatMap(x=>x.families))].sort(),
    regimes:[...new Map(modes.flatMap(x=>x.regimes).map(t=>[stable(t),t])).values()],
    everyModeRecursOutsideFocusDimensions:modes.every(x=>x.recursOutsideFocusDimensions),
    modeRecurrence:modes.map(x=>({
      modeId:x.modeId,
      rowCount:x.rowCount,
      recursOutsideFocusDimensions:x.recursOutsideFocusDimensions,
      rowsOutsideFocusDimensions:x.rowsOutsideFocusDimensions
    }))
  };
}
function minimalSpans(target,candidateModes){
  if(!target)return {minimumSpanOrder:null,minimalSpanningModeSets:[],failureAtOrder3:true,candidateModeCount:candidateModes.length};
  const pivot=target.findIndex(x=>x!==0n);
  if(pivot<0)throw new Error('zero target direction');
  const projected=[];
  const singleton=[];
  for(let i=0;i<candidateModes.length;i++){
    const q=quotientProjection(candidateModes[i].vector,target,pivot);
    if(!q)singleton.push(i);
    else projected.push({i,q,key:serializeBig(q)});
  }
  if(singleton.length){
    return {
      minimumSpanOrder:1,
      minimalSpanningModeSets:singleton.map(i=>setSummary([candidateModes[i].modeId])),
      failureAtOrder3:false,
      candidateModeCount:candidateModes.length
    };
  }

  const qGroups=new Map();
  for(const p of projected){
    if(!qGroups.has(p.key))qGroups.set(p.key,[]);
    qGroups.get(p.key).push(p.i);
  }
  const pairSets=[];
  for(const indices of qGroups.values()){
    if(indices.length<2)continue;
    for(let a=0;a<indices.length;a++)for(let b=a+1;b<indices.length;b++)pairSets.push([indices[a],indices[b]]);
  }
  if(pairSets.length){
    return {
      minimumSpanOrder:2,
      minimalSpanningModeSets:pairSets.map(([a,b])=>setSummary([candidateModes[a].modeId,candidateModes[b].modeId])),
      failureAtOrder3:false,
      candidateModeCount:candidateModes.length
    };
  }

  const pairPlanes=new Map();
  for(let a=0;a<projected.length;a++)for(let b=a+1;b<projected.length;b++){
    const qa=projected[a],qb=projected[b];
    if(qa.key===qb.key)continue;
    const key=canonicalTwoSpace(qa.q,qb.q);
    if(!pairPlanes.has(key))pairPlanes.set(key,new Set());
    pairPlanes.get(key).add(qa.i);
    pairPlanes.get(key).add(qb.i);
  }
  const tripleKeySet=new Set();
  const triples=[];
  for(const indicesSet of pairPlanes.values()){
    if(indicesSet.size<3)continue;
    const indices=[...indicesSet].sort((a,b)=>a-b);
    for(const tri of choose3(indices)){
      const ids=tri.map(i=>candidateModes[i].modeId).sort();
      const key=ids.join('|');
      if(tripleKeySet.has(key))continue;
      tripleKeySet.add(key);
      if(rankRows(tri.map(i=>candidateModes[i].vector))!==3)continue;
      triples.push(ids);
    }
  }
  return {
    minimumSpanOrder:triples.length?3:null,
    minimalSpanningModeSets:triples.map(setSummary),
    failureAtOrder3:triples.length===0,
    candidateModeCount:candidateModes.length
  };
}

const targetRows=[];
for(const family of ['WIDTH2','HEIGHT2','MIXED','COMBINED']){
  const source=localization.part2.canonicalIntegerQuotients[family];
  for(const direction of source.directions){
    const t=targetVector(direction);
    if(t.outOfSpace.length){
      targetRows.push({
        family,directionId:direction.directionId,
        bridgeStatus:'OUT_OF_SPACE',
        outOfSpaceFields:t.outOfSpace,
        targetNonzeroCoordinates:direction.normalizedNonzeroCoordinates,
        global:null,sameFamily:null
      });
      continue;
    }
    const sameFamilyModes=family==='COMBINED'?rawModes:rawModes.filter(x=>x.families.includes(family));
    targetRows.push({
      family,directionId:direction.directionId,
      bridgeStatus:'IN_SPACE',
      outOfSpaceFields:[],
      targetNonzeroCoordinates:nonzeroCoordinates(t.primitive),
      sourceLocalizationNonzeroCoordinates:direction.normalizedNonzeroCoordinates,
      global:minimalSpans(t.primitive,rawModes),
      sameFamily:minimalSpans(t.primitive,sameFamilyModes)
    });
  }
}

const focusDirectionId=localization.focus.directionId;
const focusTarget=targetRows.find(x=>x.family==='WIDTH2'&&x.directionId===focusDirectionId);
if(!focusTarget)throw new Error('held-back focus localization direction missing');
const focus={
  localizationRowId:localization.focus.rowId,
  directionId:focusDirectionId,
  bridgeStatus:focusTarget.bridgeStatus,
  targetNonzeroCoordinates:focusTarget.targetNonzeroCoordinates,
  minimumSpanOrder:focusTarget.bridgeStatus==='IN_SPACE'?focusTarget.sameFamily.minimumSpanOrder:null,
  minimalSpanningModeSets:focusTarget.bridgeStatus==='IN_SPACE'?focusTarget.sameFamily.minimalSpanningModeSets:[],
  failureAtOrder3:focusTarget.bridgeStatus==='IN_SPACE'?focusTarget.sameFamily.failureAtOrder3:null,
  globalMinimumSpanOrder:focusTarget.bridgeStatus==='IN_SPACE'?focusTarget.global.minimumSpanOrder:null,
  globalMinimalSpanningModeSets:focusTarget.bridgeStatus==='IN_SPACE'?focusTarget.global.minimalSpanningModeSets:[],
  outOfSpaceFields:focusTarget.outOfSpaceFields
};

const rawModeSummary=rawModes.map(x=>({
  modeId:x.modeId,rowCount:x.rowCount,rowIds:x.rowIds,families:x.families,regimes:x.regimes,
  nonzeroCoordinates:x.nonzeroCoordinates,
  recursOutsideFocusDimensions:x.recursOutsideFocusDimensions,
  rowsOutsideFocusDimensions:x.rowsOutsideFocusDimensions
}));

const bridgeable=targetRows.filter(x=>x.bridgeStatus==='IN_SPACE');
const globallyDerived=bridgeable.filter(x=>x.global.minimumSpanOrder!==null);
const familyDerived=bridgeable.filter(x=>x.sameFamily.minimumSpanOrder!==null);

console.log(JSON.stringify({
  schema:'connect4.uc4a_ip_symmetry_phase_bridge.v1',
  date:'2026-10-01',
  experimentDesign:'UC4A_IP_SYMMETRY_PHASE_MECHANISM_REDERIVATION_EXPERIMENT_DESIGN_0_1.md',
  structuralSource:'UC4A_IP_SYMMETRY_PHASE_STRUCTURAL_0_1.json',
  structuralAtlasSha256:STRUCTURAL_SHA,
  curvatureLocalizationSource:'UC4A_CURVATURE_QUOTIENT_LOCALIZATION_0_1.json',
  curvatureLocalizationSchema:localization.schema,
  rawOutcomeSourcesAccessed:false,
  wdlLabelsAccessed:false,
  sealedHoldoutsAccessed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  bridgeFieldRegistry:{
    fields:bridgeFields,
    semanticAliases:Object.fromEntries(ALIASES),
    note:'Aliases are frozen semantic naming translations between two independently frozen structural producers; no outcome coordinate is added.'
  },
  unlabeledModes:{
    sourceCurvatureRows:structural.curvatureRowCount,
    uniqueProjectiveModes:rawModes.length,
    modes:rawModeSummary
  },
  targets:targetRows,
  focus,
  conclusion:[
    'Phase B opens only the already-frozen unlabeled I/P mode atlas and the already-frozen localization result; it does not open raw W/D/L sources.',
    'The extended unlabeled grid supplies '+rawModes.length+' nonzero projective G/I/P curvature modes from 430 frozen geometry-only neighborhoods.',
    bridgeable.length+' localization direction records lie inside the frozen bridge coordinate space; '+(targetRows.length-bridgeable.length)+' are reported out-of-space without projection.',
    globallyDerived.length+' bridgeable direction records are generated by unlabeled modes at order <=3 globally; '+familyDerived.length+' are generated at order <=3 using modes from the same curvature family.',
    'A successful span is a structural rederivation of the direction as a combination of independently generated geometry modes, not a W/D/L theorem.',
    'A failure at order three is preserved without adding or fitting another coordinate.'
  ],
  boundary:[
    'This bridge comparison is structural mechanism evidence and not a theorem of Connect Four value.',
    'No raw W/D/L table, solver, oracle, best-move table, or BSFP solved frontier is opened.',
    'No sealed formula holdout is inspected, reconstructed, solved, inferred, or indirectly recovered.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.',
    'An unlabeled mode span does not authorize a runtime move-finder premise without a current-state UC4A/RLC proof.'
  ]
},null,2));
