#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);

const P1=0,P2=1,P1_WIN=3,P2_WIN=1;
const TARGET_COLUMN=2,TARGET_ROW=4,TARGET=TARGET_ROW*g.columns+TARGET_COLUMN; // c3r5
const C6=5;
const sequence='444441566666232222423317771';
const rank28Sequence='4444415666662322224233177716';

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
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,player){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);
  return out;
}
function shapeHasCell(id,cell){
  const n=g.shapeSize[id],base=id*4;
  for(let i=0;i<n;i++)if(g.shapeCells[base+i]===cell)return true;
  return false;
}
function hasActiveSingleton(q,player,cell){
  return activeIds(q,player).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);
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
function exactEqual(a,b){
  if(a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}

function coverageWitness(q,id,partner,length){
  const n=g.shapeSize[id],base=id*4;
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(c===TARGET_COLUMN&&r>TARGET_ROW)return {kind:'post-target-deferral',cell,column:c+1,row:r+1};
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
function findTargetTemplate(q){
  if(!hasActiveSingleton(q,P1,TARGET))return null;
  const targetDepth=TARGET_ROW-q.words[TARGET_COLUMN];
  if(targetDepth<=0)return null;
  if(playableSingletons(q,P2).length)return null;

  const capacity=new Uint32Array(7),odd=[];
  let total=0;
  for(let c=0;c<7;c++){
    const cap=c===TARGET_COLUMN?TARGET_ROW-q.words[c]+1:6-q.words[c];
    if(cap<0)return null;
    capacity[c]=cap;total+=cap;if(cap&1)odd.push(c);
  }
  if((total&1)||(odd.length&1))return null;

  const defenderIds=activeIds(q,P2);
  const partner=new Int32Array(7);partner.fill(-1);
  const length=new Uint32Array(7);
  let found=null;

  function evaluate(){
    const targetL=partner[TARGET_COLUMN]>=0?length[TARGET_COLUMN]:0;
    const targetIsResponse=targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
    if(!targetIsResponse)return null;
    const coverage=[];
    for(const id of defenderIds){
      const witness=coverageWitness(q,id,partner,length);
      if(!witness)return null;
      coverage.push({residualId:id,size:g.shapeSize[id],witness});
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
        if((a===TARGET_COLUMN||b===TARGET_COLUMN)&&L>=capacity[TARGET_COLUMN])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
    }
  }
  rec(odd);
  return found;
}
function validateTemplate(q,template){
  const mate=Int32Array.from(template.mate),role=Uint8Array.from(template.role);
  const failures=[];
  let defenderNodes=0,responsePairs=0,maxPairDepth=0,p1Terminals=0,targetTerminals=0;

  function walk(state,depth){
    defenderNodes++;maxPairDepth=Math.max(maxPairDepth,depth);
    if(((state.words[g.metaOffset]>>>2)&1)!==P2){
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
        if(m===TARGET)targetTerminals++;
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

const state=fromSequence(sequence);
const rank28Root=fromSequence(rank28Sequence);
assert.equal(state.terminal,0);
assert.equal(state.words[g.metaOffset]>>>2,27);
assert.equal((state.words[g.metaOffset]>>>2)&1,P2);
assert.deepEqual(support(state),[3,6,3,6,1,5,3]);
const c3r5Singleton=hasActiveSingleton(state,P1,TARGET);
assert(c3r5Singleton);

const rank28=JSON.parse(execFileSync(
  process.execPath,
  [resolve('research/isograph/discovery/2026-09-30-universal-structural-policy/run-cpc-rank28-dual-singleton-handoff-composition.mjs'),resolve(library)],
  {encoding:'utf8',maxBuffer:64*1024*1024}
));
assert.equal(rank28.jsMinSysSha,EXPECTED);
assert.equal(rank28.oracleUsed,false);
assert.equal(rank28.solvedInputsUsed,false);

const rows=[];
const legalDefenderReplies=[];
for(let d=0;d<7;d++){
  if(state.words[d]>=6)continue;
  legalDefenderReplies.push(d+1);
  const reply=step(state,d);

  if(d===TARGET_COLUMN){
    const target=reply.terminal?null:step(reply,TARGET_COLUMN);
    rows.push({
      defenderColumn:d+1,
      replyTerminal:reply.terminal,
      kind:'target-support-trigger',
      p1TargetTerminal:target?.terminal??null,
      accept:reply.terminal===0&&target?.terminal===P1_WIN,
    });
    continue;
  }

  if(d===C6){
    const exactChildMatchesQualifiedRank28Root=
      reply.terminal===0&&exactEqual(reply,rank28Root);
    rows.push({
      defenderColumn:d+1,
      replyTerminal:reply.terminal,
      kind:'qualified-rank28-handoff',
      childSupport:support(reply),
      exactChildMatchesQualifiedRank28Root,
      premise:{
        theorem:'CPC_RANK28_DUAL_SINGLETON_HANDOFF_COMPOSITION_THEOREM.md',
        accept:rank28.accept,
        parent:rank28.parent,
      },
      accept:reply.terminal===0&&exactChildMatchesQualifiedRank28Root&&rank28.accept===true,
    });
    continue;
  }

  if(reply.terminal){
    rows.push({
      defenderColumn:d+1,
      replyTerminal:reply.terminal,
      kind:'defender-terminal',
      accept:false,
    });
    continue;
  }

  if(reply.words[C6]>=6){
    rows.push({
      defenderColumn:d+1,
      replyTerminal:reply.terminal,
      kind:'c6-blocker-unavailable',
      accept:false,
    });
    continue;
  }

  const block=step(reply,C6);
  const targetActiveAfterBlock=block.terminal===0&&hasActiveSingleton(block,P1,TARGET);
  const defenderPlayableSingletons=block.terminal===0?playableSingletons(block,P2):[];
  const template=
    block.terminal===0&&targetActiveAfterBlock&&defenderPlayableSingletons.length===0
      ?findTargetTemplate(block)
      :null;
  const validation=template?validateTemplate(block,template):null;

  rows.push({
    defenderColumn:d+1,
    replyTerminal:reply.terminal,
    kind:'c6-blocker-reentry',
    blockColumn:6,
    blockTerminal:block.terminal,
    supportAfterBlock:support(block),
    targetActiveAfterBlock,
    defenderPlayableSingletons,
    targetTemplate:template?{
      capacity:template.capacity,
      oddColumns:template.oddColumns,
      synchronizedPairs:template.synchronizedPairs,
      targetIsResponse:template.targetIsResponse,
      defenderResidualCount:template.defenderResidualCount,
      coverage:template.coverage,
    }:null,
    validation,
    accept:
      reply.terminal===0&&
      block.terminal===0&&
      targetActiveAfterBlock&&
      defenderPlayableSingletons.length===0&&
      !!template&&
      !!validation?.pass,
  });
}

const accept=
  rank28.accept===true&&
  legalDefenderReplies.length===rows.length&&
  rows.every(x=>x.accept===true);

console.log(JSON.stringify({
  schema:'connect4.cpc_rank27_reply7_c7_taken_composition.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  theoremCandidate:'CPC_RANK27_REPLY7_C7_TAKEN_COMPOSITION_THEOREM.md',
  state:{
    sequence,
    rank:27,
    mover:2,
    support:support(state),
    c3r5Singleton,
  },
  legalDefenderReplies,
  rows,
  accept,
  conclusion:accept?[
    'The exact rank-27 c7-taken state is a Player-1 win.',
    'P2:c3 exposes an immediate c3 terminal; P2:c6 enters exactly the qualified rank-28 dual-singleton handoff class; every other legal defender move is repaired by P1:c6 and a freshly synthesized finite c3r5 target-reservoir certificate.',
    'Therefore the P2:c7 branch of the rank-24 reply-7 structural P1:c7 candidate is closed without solved-value premises.'
  ]:[
    'At least one legal defender reply from the frozen rank-27 c7-taken state remains unclosed; the composition theorem is rejected or requires narrowing.'
  ],
  boundary:[
    'Every branch begins with an exact RBA cofactor from the frozen rank-27 current state.',
    'The c6 handoff requires exact full RBA equality with the separately qualified rank-28 theorem root.',
    'Every blocker-reentry branch freshly synthesizes and exhaustively traverses its target-reservoir response template.',
    'No oracle, Pons, solved W/D/L input, local game-tree value, minimax, best-move table, physical-position identity, or sealed holdout is used.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
