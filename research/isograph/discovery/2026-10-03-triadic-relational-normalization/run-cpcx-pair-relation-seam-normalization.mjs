import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const endpointScript=new URL(
  '../2026-10-02-cpcx/run-cpcx-move6-opponent-descent-endpoint-descriptors.mjs',
  import.meta.url
);
const endpoint=JSON.parse(execFileSync(process.execPath,[endpointScript.pathname],{
  encoding:'utf8',maxBuffer:256*1024*1024,
}));
const bridgePilot=JSON.parse(fs.readFileSync(new URL(
  '../2026-09-30-universal-structural-policy/CPC_FORMULA_EXCHANGE_PHASE_BRIDGE_PILOT_0_1.json',
  import.meta.url
),'utf8'));
const bridgeGauge=JSON.parse(fs.readFileSync(new URL(
  '../2026-09-30-universal-structural-policy/CPC_FORMULA_COUPLED_GAUGE_EQUATION_BRIDGE_0_1.json',
  import.meta.url
),'utf8'));

const PAIRS=['KS','KR','SR'];

function collapse(xs){
  const out=[];
  for(const x of xs)if(x&&out[out.length-1]!==x)out.push(x);
  return out;
}
function visitsAllThree(word){
  const s=new Set(word.filter(x=>PAIRS.includes(x)));
  return s.size===3;
}
function returnsToPair(word){
  for(let i=0;i<word.length;i++)for(let j=i+2;j<word.length;j++)
    if(PAIRS.includes(word[i])&&word[i]===word[j])return true;
  return false;
}
function classifyKind(kind,obj={}){
  if([
    'PROTECTED_DIAGONAL_TARGET_INHERITANCE_HANDOFF',
    'PROTECTED_RESIDUAL_DIAGONAL_TRANSFER',
    'PROTECTED_DIAGONAL_ANCHOR_PIVOT_TRANSFER',
  ].includes(kind))return 'KR';

  if([
    'PROTECTED_RESIDUAL_SUPPORT_ADVANCE',
    'PROTECTED_RESIDUAL_TARGET_ACQUISITION',
    'SUPPORT_ADVANCE',
  ].includes(kind))return 'KS';

  if([
    'FORCED_RESPONSE',
    'PROTECTED_RESIDUAL_FORCED_NORMALIZATION',
    'FORCED_NORMALIZATION',
  ].includes(kind))return 'SR';

  if(kind==='CONTROLLER_DESCENT'){
    if(['SUPPORT_ADVANCE','TARGET_ACQUISITION'].includes(obj.selectedMode))
      return 'KS';
    return null;
  }

  if(kind==='CONTROLLER_PLAYABLE_TARGET_FALLBACK')return 'KSR';

  if(kind==='CERTIFIED_FORCING_MACRO'){
    if(['VERTICAL_THREE_STAGE','VERTICAL_TWO_STAGE','PLAYABLE_TWO_PIECE']
      .includes(obj.macroKind??obj.macro?.kind))return 'KSR';
  }

  if(kind==='CERTIFIED_FIRST_WIN'){
    if([
      'LATENT_SINGLETON_PAIR_HUB_OVERLOAD',
      'LATENT_SINGLETON_PAIR_HUB_FORCED_NORMALIZATION_HANDOFF',
    ].includes(obj.source))return 'KSR';
  }
  return null;
}
function classifySeam(seam){
  if(seam==='HIGHEST_TARGET_RELEASES_OPPONENT_SINGLETON')return 'SR';
  return null;
}
function classifyObject(x){
  if(!x||typeof x!=='object')return null;
  return classifyKind(x.kind,x)??classifySeam(x.seam);
}

const semanticInventory=[];
function walk(x,path='$'){
  if(!x||typeof x!=='object')return;
  const pair=classifyObject(x);
  if(pair)semanticInventory.push({
    path:path.replace(/\[\d+\]/g,'[]'),
    pair,
    kind:x.kind??null,
    seam:x.seam??null,
    exact:x.exact??null,
    source:x.source??null,
  });
  if(Array.isArray(x)){
    for(let i=0;i<x.length;i++)walk(x[i],`${path}[${i}]`);
  }else for(const [k,v] of Object.entries(x)){
    if(['position','finalPosition','child','sourcePosition'].includes(k))continue;
    walk(v,`${path}.${k}`);
  }
}
walk(endpoint);

const exactSemantic=semanticInventory.filter(x=>x.exact!==false),
  inventoryCounts={};
for(const x of exactSemantic){
  inventoryCounts[x.pair]=(inventoryCounts[x.pair]??0)+1;
}

function progressPair(p){
  if(!p)return null;
  const k=p.progressKind??p.kind;
  if(k==='PROTECTED_RESIDUAL_SUPPORT_ADVANCE'||
     k==='PROTECTED_RESIDUAL_TARGET_ACQUISITION')return 'KS';
  if(k==='FORCED_NORMALIZATION')return 'SR';
  if(k==='CERTIFIED_FORCING_MACRO')return 'KSR';
  if(k==='CERTIFIED_FIRST_WIN'){
    if([
      'LATENT_SINGLETON_PAIR_HUB_OVERLOAD',
      'LATENT_SINGLETON_PAIR_HUB_FORCED_NORMALIZATION_HANDOFF',
    ].includes(p.source))return 'KSR';
  }
  return null;
}

const seamWords=[];
for(const probe of endpoint.novelMaskSecondLayerProbes??[]){
  for(const row of probe.secondLayerRows??[]){
    const nt=row.noTransferTargetBlockProbe;
    if(!nt)continue;
    const ti=nt.targetInheritance;
    if(!ti)continue;

    const handoff=ti.handoff;
    if(handoff?.exact&&
       handoff.kind==='PROTECTED_DIAGONAL_TARGET_INHERITANCE_HANDOFF'){
      for(const opt of handoff.progressOptions??[]){
        if(!opt.progressExact)continue;
        const word=['KR'];
        const pp=progressPair(opt);
        if(pp)word.push(pp);
        if(opt.childImmediate==='FORCED_RESPONSE')word.push('SR');
        if(opt.forcedNormalization?.exact)word.push('SR');
        for(const po of opt.postForcedProgressOptions??[]){
          if(!po.progressExact)continue;
          const q=progressPair(po);
          if(q)word.push(q);
          if(po.childImmediate==='FORCED_RESPONSE')word.push('SR');
        }
        const reduced=collapse(word);
        seamWords.push({
          source:'targetInheritance.progressOption',
          blockedCell:nt.blockedCell??null,
          target:opt.target??null,
          word:reduced,
          visitsAllThree:visitsAllThree(reduced),
          returnsToPair:returnsToPair(reduced),
        });
      }

      if(ti.saturationV2?.exact){
        const word=['KR'];
        for(const t of ti.saturationV2.trace??[]){
          const q=classifyObject(t);
          if(q)word.push(q);
        }
        const reduced=collapse(word);
        seamWords.push({
          source:'targetInheritance.saturationV2',
          blockedCell:nt.blockedCell??null,
          word:reduced,
          visitsAllThree:visitsAllThree(reduced),
          returnsToPair:returnsToPair(reduced),
        });
      }

      for(const v of nt.verticalThreeStage??[]){
        if(v.exact!==true)continue;
        const word=['KR','KSR'];
        for(const h of v.partition?.hazardClasses??[]){
          if(h.normalization?.kind==='OPEN'&&
             (h.normalization?.stepCount??0)>0)word.push('SR');
          const q=progressPair(h.progress);
          if(q)word.push(q);
        }
        const reduced=collapse(word);
        seamWords.push({
          source:'targetInheritance.verticalThreeStage',
          blockedCell:nt.blockedCell??null,
          word:reduced,
          visitsAllThree:visitsAllThree(reduced),
          returnsToPair:returnsToPair(reduced),
        });
      }
    }

    if(nt.exactProgressFirst?.exact){
      const word=[];
      const p=progressPair(nt.progress);
      if(p)word.push(p);
      if(nt.exactProgressFirst.saturationV2?.exact){
        for(const t of nt.exactProgressFirst.saturationV2.trace??[]){
          const q=classifyObject(t); if(q)word.push(q);
        }
      }
      const reduced=collapse(word);
      if(reduced.length)seamWords.push({
        source:'exactProgressFirst',
        blockedCell:nt.blockedCell??null,
        word:reduced,
        visitsAllThree:visitsAllThree(reduced),
        returnsToPair:returnsToPair(reduced),
      });
    }
  }
}

const uniqueWords=new Map();
for(const w of seamWords){
  const k=w.word.join('>');
  if(!uniqueWords.has(k))uniqueWords.set(k,{...w,count:0,examples:[]});
  const u=uniqueWords.get(k);u.count++;
  if(u.examples.length<6)u.examples.push({
    source:w.source,blockedCell:w.blockedCell??null,target:w.target??null,
  });
}
const words=[...uniqueWords.values()].sort((a,b)=>b.count-a.count||
  a.word.join('>').localeCompare(b.word.join('>')));

function relationVector(state){
  const order=['3,5','3,7','5,7'];
  const m=new Map((state?.edges??[]).map(e=>[
    [...e.columns].sort((a,b)=>a-b).join(','),e.relation
  ]));
  return order.map(k=>m.get(k)??'NA');
}
function pairChangeMask(row){
  const a=relationVector(row.pre),b=relationVector(row.post);
  let m=0;for(let i=0;i<3;i++)if(a[i]!==b[i])m|=1<<i;
  return m;
}
function maskText(m){return [0,1,2].map(i=>(m&(1<<i))?'1':'0').join('');}
const bridgeRows=(bridgePilot.rows??[]).map(r=>({
  state:r.state,label:r.label,next:r.next??null,
  pre:relationVector(r.pre),
  post:relationVector(r.post),
  changeMask:pairChangeMask(r),
  changeMaskText:maskText(pairChangeMask(r)),
  deltaF:r.deltaF??null,
}));
const bridgeMasks={};
for(const r of bridgeRows)
  bridgeMasks[r.changeMaskText]=(bridgeMasks[r.changeMaskText]??0)+1;

const adjacency={};
for(const w of seamWords){
  const simple=w.word.filter(x=>PAIRS.includes(x));
  for(let i=0;i+1<simple.length;i++){
    const k=`${simple[i]}->${simple[i+1]}`;
    adjacency[k]=(adjacency[k]??0)+1;
  }
}

console.log(JSON.stringify({
  schema:'connect4.triadic.cpcx-pair-relation-seam-normalization.v0_2',
  endpointSourceSchema:endpoint.schema??null,
  cpcx:{
    exactSemanticPairOccurrenceCounts:inventoryCounts,
    wordCount:seamWords.length,
    distinctWords:words,
    visitsAllThreeWordCount:seamWords.filter(x=>x.visitsAllThree).length,
    returnsToPriorPairWordCount:seamWords.filter(x=>x.returnsToPair).length,
    pairAdjacency:adjacency,
  },
  archivedPairExchangeBridge:{
    rowCount:bridgeRows.length,
    changeMaskHistogram:bridgeMasks,
    rows:bridgeRows,
    allPairDeltaCircuitsClose:
      bridgeGauge.structuralChecks?.allPairDeltaCircuitsClose??null,
    exactSinkEquality:
      bridgePilot.exactSinkEquality??null,
    degree1Contradictions:
      bridgeGauge.systems?.DELTA?.find(x=>x.degree===1)?.contradictions??null,
    degree2Contradictions:
      bridgeGauge.systems?.DELTA?.find(x=>x.degree===2)?.contradictions??null,
  },
  signal:{
    allThreeCpcxPairChannelsObserved:
      ['KS','KR','SR'].every(k=>(inventoryCounts[k]??0)>0),
    cpcxHasPairChannelTransitions:Object.keys(adjacency).length>0,
    cpcxHasAllThreeVisit:seamWords.some(x=>x.visitsAllThree),
    cpcxHasReturnToPriorPair:seamWords.some(x=>x.returnsToPair),
    archivedBridgeHasClosedPairDeltaCircuit:
      bridgeGauge.structuralChecks?.allPairDeltaCircuitsClose===true,
    archivedBridgeNeedsInteractionOrderAboveOne:
      (bridgeGauge.systems?.DELTA?.find(x=>x.degree===1)?.contradictions??0)>0&&
      (bridgeGauge.systems?.DELTA?.find(x=>x.degree===2)?.contradictions??1)===0,
  },
  boundary:{
    oracleUsed:false,
    solvedDataUsed:false,
    certificateNamesUsedOnlyForFrozenSemanticClassification:true,
    noThreeBodyClaim:true,
    noValueClaim:true,
  },
},null,2));