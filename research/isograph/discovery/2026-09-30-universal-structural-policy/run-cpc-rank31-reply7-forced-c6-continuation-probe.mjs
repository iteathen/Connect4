#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const here=resolve(fileURLToPath(new URL('.',import.meta.url)));
const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32,
  connect4CpcTargetOwner32,connect4CpcTargetSupportDistance32,
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;
const sequence='4444415666662322224233177555756';
const rank31RootSequence='4444415666662322224233177716111';

const rank31Evidence=JSON.parse(readFileSync(resolve(here,'CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json'),'utf8'));
assert.equal(rank31Evidence.jsMinSysSha,EXPECTED);
assert.equal(rank31Evidence.oracleUsed,false);
assert.equal(rank31Evidence.solvedInputsUsed,false);
assert.equal(rank31Evidence.accept,true);

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,7));}
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
function exactEqual(a,b){
  if(a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,player){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);
  return out;
}
function minimalIds(q,player){
  const active=activeIds(q,player);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function residual(q,id,player){
  const size=g.shapeSize[id],base=id*4,cells=[];
  let aligned=true;
  for(let i=0;i<size;i++){
    const cell=g.shapeCells[base+i],owner=connect4CpcTargetOwner32(g,q.words,0,cell);
    if(owner!==player)aligned=false;
    const c=g.cellColumn[cell],r=g.cellRow[cell];
    cells.push({
      cell,
      column:c+1,
      row:r+1,
      projectedOwner:owner+1,
      supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell),
      playable:q.words[c]===r,
    });
  }
  return {diagnosticId:id,size,cells,fullyAligned:aligned};
}
function singletonProfile(q,player){
  return activeIds(q,player)
    .filter(id=>g.shapeSize[id]===1)
    .map(id=>residual(q,id,player));
}
function kindName(k){
  if(k===CPC_NONE)return 'CPC_NONE';
  if(k===CPC_EXACT)return 'CPC_EXACT';
  if(k===CPC_BOUND)return 'CPC_BOUND';
  if(k===CPC_RESTRICT)return 'CPC_RESTRICT';
  return 'UNKNOWN';
}
function cpc(q,frontierResponse){
  const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
  const k=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
  return {
    kind:kindName(k),
    interval:[s.interval[0]-2,s.interval[1]-2],
    forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
    preemptionCount:s.preemptionCount[0],
    preemptionMask32:s.preemptionMask32[0]>>>0,
    precursorCount:s.precursorCount[0],
    projectedCount:Array.from(s.projectedCount),
    projectedForks:Array.from(s.projectedForks),
  };
}
function immediateWins(q,player){
  const target=player===P1?P1_WIN:P2_WIN;
  const out=[];
  for(let c=0;c<7;c++)if(q.words[c]<6&&step(q,c).terminal===target)out.push(c+1);
  return out;
}
function literalP1ResponseProfile(q){
  assert.equal(moverOf(q),P1);
  const rows=[];
  for(let c=0;c<7;c++){
    if(q.words[c]>=6)continue;
    const response=step(q,c);
    rows.push({
      p1Column:c+1,
      terminal:response.terminal,
      p1Wins:response.terminal===P1_WIN,
      p2ImmediateWinningColumns:response.terminal===0?immediateWins(response,P2):[],
      support:support(response),
    });
  }
  return {
    rows,
    immediateWinningColumns:rows.filter(x=>x.p1Wins).map(x=>x.p1Column),
    safeNonterminalColumns:rows.filter(x=>x.terminal===0&&x.p2ImmediateWinningColumns.length===0).map(x=>x.p1Column),
  };
}
function shapeHasCell(id,cell){
  const n=g.shapeSize[id],base=id*4;
  for(let i=0;i<n;i++)if(g.shapeCells[base+i]===cell)return true;
  return false;
}
function playableSingletons(q,player){
  const out=[];
  for(const id of activeIds(q,player)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push({id,cell,column:c+1,row:r+1});
  }
  return out;
}
function coverageWitness(q,id,targetColumn,targetRow,partner,length){
  const n=g.shapeSize[id],base=id*4;
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(c===targetColumn&&r>targetRow)
      return {kind:'post-target-deferral',cell,column:c+1,row:r+1};
  }
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell],
      depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;
    if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0)
      return {kind:'vertical-response',cell,column:c+1,row:r+1};
    if(p>=0&&depth<L){
      const mate=(q.words[p]+depth)*g.columns+p;
      if(shapeHasCell(id,mate))
        return {kind:'cross-pair',cells:[cell,mate],columns:[c+1,p+1],depth,L};
    }
  }
  return null;
}
function buildPairMap(q,capacity,partner,length){
  const mate=new Int32Array(g.cellCount);mate.fill(-1);
  const role=new Uint8Array(g.cellCount);
  for(let c=0;c<7;c++){
    const h=q.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
    if(p>=0&&c<p){
      const hp=q.words[p];
      for(let d=0;d<L;d++){
        const a=(h+d)*7+c,b=(hp+d)*7+p;
        mate[a]=b;mate[b]=a;role[a]=3;role[b]=3;
      }
    }
    for(let d=L;d<cap;d+=2){
      if(d+1>=cap)throw new Error('odd vertical tail');
      const lo=(h+d)*7+c,hi=(h+d+1)*7+c;
      mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;
    }
  }
  return {mate,role};
}
function findTargetTemplate(q,targetCell){
  if(moverOf(q)!==P2)return null;
  const targetColumn=g.cellColumn[targetCell],targetRow=g.cellRow[targetCell];
  const singleton=activeIds(q,P1).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===targetCell);
  if(!singleton)return null;
  if(q.words[targetColumn]===targetRow)return null;
  if(connect4CpcTargetOwner32(g,q.words,0,targetCell)!==P1)return null;
  const targetDepth=targetRow-q.words[targetColumn];
  if(targetDepth<=0)return null;
  if(playableSingletons(q,P2).length)return null;

  const capacity=new Uint32Array(7),odd=[];
  let total=0;
  for(let c=0;c<7;c++){
    const cap=c===targetColumn?targetRow-q.words[c]+1:6-q.words[c];
    if(cap<0)return null;
    capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);
  }
  if((total&1)||(odd.length&1))return null;

  const defenderIds=activeIds(q,P2);
  const partner=new Int32Array(7);partner.fill(-1);
  const length=new Uint32Array(7);
  let found=null;

  function evaluate(){
    const targetL=partner[targetColumn]>=0?length[targetColumn]:0;
    const targetIsResponse=targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
    if(!targetIsResponse)return null;
    const coverage=[];
    for(const id of defenderIds){
      const witness=coverageWitness(q,id,targetColumn,targetRow,partner,length);
      if(!witness)return null;
      coverage.push({residualId:id,size:g.shapeSize[id],containsTarget:shapeHasCell(id,targetCell),witness});
    }
    const pairs=[];
    for(let c=0;c<7;c++)if(partner[c]>=0&&c<partner[c])
      pairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
    const map=buildPairMap(q,capacity,partner,length);
    return {
      capacity:Array.from(capacity),
      oddColumns:odd.map(c=>c+1),
      synchronizedPairs:pairs,
      targetIsResponse,
      targetDepth,
      targetPrefixLength:targetL,
      defenderResidualCount:defenderIds.length,
      coverage,
      mate:Array.from(map.mate),
      role:Array.from(map.role),
    };
  }
  function rec(pending){
    if(found)return;
    if(!pending.length){found=evaluate();return;}
    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),
        max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){
        length[a]=L;length[b]=L;
        if((a===targetColumn||b===targetColumn)&&L>=capacity[targetColumn])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
    }
  }
  rec(odd);
  return found;
}
function validateTemplate(q,template,targetCell){
  const mate=Int32Array.from(template.mate),role=Uint8Array.from(template.role);
  const failures=[];
  let defenderNodes=0,responsePairs=0,maxPairDepth=0,p1Terminals=0,targetTerminals=0;

  function walk(state,depth){
    defenderNodes++;maxPairDepth=Math.max(maxPairDepth,depth);
    if(moverOf(state)!==P2){
      failures.push({kind:'wrong-mover',support:support(state)});return;
    }
    let legal=0;
    for(let c=0;c<7;c++){
      if(state.words[c]>=6)continue;
      legal++;
      const row=state.words[c],cell=row*7+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){
        failures.push({kind:'unmapped-defender-trigger',column:c+1,row:row+1,role:r});continue;
      }
      const d=step(state,c);
      if(d.terminal===P2_WIN){
        failures.push({kind:'defender-terminal',column:c+1,row:row+1});continue;
      }
      if(d.terminal){
        failures.push({kind:'other-defender-terminal',terminal:d.terminal});continue;
      }
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(d.words[rc]!==rr){
        failures.push({kind:'response-not-playable',trigger:[c+1,row+1],response:[rc+1,rr+1]});continue;
      }
      const a=step(d,rc);responsePairs++;
      if(a.terminal===P1_WIN){
        p1Terminals++;
        if(m===targetCell)targetTerminals++;
        continue;
      }
      if(a.terminal){
        failures.push({kind:'other-response-terminal',terminal:a.terminal});continue;
      }
      walk(a,depth+1);
    }
    if(!legal)failures.push({kind:'no-legal-before-win'});
  }
  walk(q,0);
  return {
    pass:failures.length===0,
    defenderNodes,responsePairs,maxPairDepth,p1Terminals,targetTerminals,
    failures:failures.slice(0,20),
  };
}
function compactTemplate(template){
  return {
    capacity:template.capacity,
    oddColumns:template.oddColumns,
    synchronizedPairs:template.synchronizedPairs,
    targetIsResponse:template.targetIsResponse,
    targetDepth:template.targetDepth,
    targetPrefixLength:template.targetPrefixLength,
    defenderResidualCount:template.defenderResidualCount,
    coverage:template.coverage,
  };
}
function synthesizeTargets(q){
  const certificates=[],failures=[],candidates=[];
  for(const s of singletonProfile(q,P1)){
    const cell=s.cells[0];
    if(cell.playable)continue;
    const target={cell:cell.cell,column:cell.column,row:cell.row};
    candidates.push({target,diagnosticId:s.diagnosticId,projectedOwner:cell.projectedOwner,supportDistance:cell.supportDistance,fullyAligned:s.fullyAligned});
    if(moverOf(q)!==P2){
      failures.push({target,reason:'wrong-mover-for-defender-response-template'});
      continue;
    }
    const template=findTargetTemplate(q,cell.cell);
    if(!template){
      failures.push({target,reason:'no-qualified-target-reservoir-template'});
      continue;
    }
    certificates.push({target,template:compactTemplate(template),validation:validateTemplate(q,template,cell.cell)});
  }
  return {certificates,failures,candidates};
}
function exactRootMatches(q){
  const out=[];
  if(rankOf(q)===31){
    const root=fromSequence(rank31RootSequence);
    if(exactEqual(q,root))out.push({
      theorem:'CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_THEOREM.md',
      evidence:'CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_0_1.json',
      accept:rank31Evidence.accept,
      oracleUsed:rank31Evidence.oracleUsed,
      solvedInputsUsed:rank31Evidence.solvedInputsUsed,
    });
  }
  return out;
}

const state=fromSequence(sequence);
assert.equal(state.terminal,0);
assert.equal(rankOf(state),31);
assert.equal(moverOf(state),P2);
assert.deepEqual(support(state),[2,6,3,6,5,6,3]);

const parentTargets=synthesizeTargets(state);
const exactQualifiedRootMatches=exactRootMatches(state);
const legalDefenderMoves=[];
const rows=[];

for(let d=0;d<7;d++){
  if(state.words[d]>=6)continue;
  legalDefenderMoves.push(d+1);
  const q=step(state,d);
  const row={
    defenderColumn:d+1,
    terminal:q.terminal,
    support:support(q),
    p1ImmediateWinningColumns:[],
    p1Minimal:[],
    p2Minimal:[],
    p1Singletons:[],
    p2Singletons:[],
    cpcForP1:null,
    literalP1ImmediateResponse:null,
    exactQualifiedRootMatches:[],
    targetCertificates:[],
    targetCertificateFailures:[],
    targetCandidates:[],
    forcedChild:null,
  };

  if(q.terminal===0){
    row.p1ImmediateWinningColumns=immediateWins(q,P1);
    row.p1Minimal=minimalIds(q,P1).map(id=>residual(q,id,P1));
    row.p2Minimal=minimalIds(q,P2).map(id=>residual(q,id,P2));
    row.p1Singletons=singletonProfile(q,P1);
    row.p2Singletons=singletonProfile(q,P2);
    row.cpcForP1={baseline:cpc(q,false),frontier:cpc(q,true)};
    row.literalP1ImmediateResponse=literalP1ResponseProfile(q);

    const childTargets=synthesizeTargets(q);
    row.targetCandidates=childTargets.candidates;
    row.targetCertificates=childTargets.certificates;
    row.targetCertificateFailures=childTargets.failures;

    const baseline=row.cpcForP1.baseline,frontier=row.cpcForP1.frontier;
    const sameForced=
      baseline.forcedColumn!==null&&
      baseline.forcedColumn===frontier.forcedColumn&&
      baseline.preemptionCount>0&&frontier.preemptionCount>0;
    if(sameForced){
      const c=baseline.forcedColumn-1;
      if(q.words[c]<6){
        const child=step(q,c);
        const matches=exactRootMatches(child);
        const forcedTargets=child.terminal===0?synthesizeTargets(child):{certificates:[],failures:[],candidates:[]};
        row.exactQualifiedRootMatches.push(...matches.map(x=>({...x,viaForcedP1Column:c+1})));
        row.targetCertificates.push(...forcedTargets.certificates.map(x=>({...x,at:'forced-child'})));
        row.targetCertificateFailures.push(...forcedTargets.failures.map(x=>({...x,at:'forced-child'})));
        row.forcedChild={
          p1Column:c+1,
          terminal:child.terminal,
          support:support(child),
          rank:rankOf(child),
          exactQualifiedRootMatches:matches,
          p1Minimal:child.terminal===0?minimalIds(child,P1).map(id=>residual(child,id,P1)):[],
          p2Minimal:child.terminal===0?minimalIds(child,P2).map(id=>residual(child,id,P2)):[],
          p1Singletons:child.terminal===0?singletonProfile(child,P1):[],
          p2Singletons:child.terminal===0?singletonProfile(child,P2):[],
          targetCandidates:forcedTargets.candidates,
          targetCertificates:forcedTargets.certificates,
          targetCertificateFailures:forcedTargets.failures,
        };
      }
    }
  }
  rows.push(row);
}

assert.deepEqual(legalDefenderMoves,[1,3,5,7]);

console.log(JSON.stringify({
  schema:'connect4.cpc_rank31_reply7_forced_c6_continuation_probe.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  design:'CPC_RANK31_REPLY7_FORCED_C6_CONTINUATION_PROBE_DESIGN_0_1.md',
  state:{
    sequence,
    rank:31,
    mover:2,
    support:support(state),
    immediateP1WinningColumns:immediateWins(state,P1),
    immediateP2WinningColumns:immediateWins(state,P2),
    cpcForP2:{baseline:cpc(state,false),frontier:cpc(state,true)},
    p1Minimal:minimalIds(state,P1).map(id=>residual(state,id,P1)),
    p2Minimal:minimalIds(state,P2).map(id=>residual(state,id,P2)),
    p1Singletons:singletonProfile(state,P1),
    p2Singletons:singletonProfile(state,P2),
  },
  exactQualifiedRootMatches,
  parentTargetCandidates:parentTargets.candidates,
  parentTargetCertificates:parentTargets.certificates,
  parentTargetCertificateFailures:parentTargets.failures,
  legalDefenderMoves,
  rows,
  conclusion:[
    'Outcome-free structural continuation probe at the exact rank-31 state reached through the rank26 c5 forced-response chain.',
    'The probe tests parent-state target certificates first, then every legal Player-2 move, immediate Player-1 responses, production CPC restrictions, forced one-response children, and fresh target-reservoir certificates only when their mover/ownership guards hold.',
    'No move value, local recursive game-tree result, solved input, or external oracle is consumed.'
  ],
  boundary:[
    'No oracle, Pons, solved W/D/L, best-move table, opening book, or ordinary game-tree search is used.',
    'The qualified rank-31 theorem is used only for exact full-RBA equality comparison.',
    'Production CPC and JSMinSys are read-only and unchanged; BSFP is unchanged.',
    'This probe is discovery evidence only and assigns game value only if an independently sound structural certificate actually closes every required branch.'
  ]
},null,2));
