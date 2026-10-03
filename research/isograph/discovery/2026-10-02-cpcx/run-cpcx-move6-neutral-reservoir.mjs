import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  compileCpcxPostActionWingAttack,
} from './cpcx-wing.mjs';
import {
  buildCpcxQCarrier,
} from './cpcx-q-quotient.mjs';
import {
  canonicalizeCpcxExactReflection,
} from './cpcx-control-quotient.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

function play(position,cells){
  let p=position;
  for(const cell of cells){
    if(p.terminal)return null;
    const {column,row}=cpcxCell(g,cell);
    if(row!==p.heights[column]||p.owner[cell]!==-1)return null;
    p=applyCpcxForcedEvent(p,cell);
  }
  return p;
}

function compareArrays(a,b){
  const n=Math.min(a.length,b.length);
  for(let i=0;i<n;i++)if(a[i]!==b[i])return a[i]-b[i];
  return a.length-b.length;
}

function normalizeFamily(family){
  return family.map(cells=>[...cells].sort((a,b)=>a-b))
    .sort((a,b)=>a.length-b.length||compareArrays(a,b));
}

function* permutations(n){
  const a=Array.from({length:n},(_,i)=>i);
  function* rec(k){
    if(k===n){yield [...a];return;}
    for(let i=k;i<n;i++){
      [a[k],a[i]]=[a[i],a[k]];
      yield* rec(k+1);
      [a[k],a[i]]=[a[i],a[k]];
    }
  }
  yield* rec(0);
}

function mapCell(cell,p){
  const column=cell%g.columns,row=Math.floor(cell/g.columns);
  return row*g.columns+p[column];
}

function neutralDescriptor(position){
  const q=buildCpcxQCarrier(position),
    activeCells=new Set(q.residuals.flat(2)),
    columns=[];

  let neutralCapacity=0;
  for(let c=0;c<g.columns;c++){
    const remaining=[];
    for(let r=position.heights[c];r<g.rows;r++)
      remaining.push(r*g.columns+c);
    const activeRemaining=remaining.filter(cell=>activeCells.has(cell)),
      neutral=activeRemaining.length===0;
    if(neutral)neutralCapacity+=remaining.length;
    columns.push({
      column:c,
      height:position.heights[c],
      remaining:remaining.length,
      neutral,
      activeRemaining,
      activeLabels:activeRemaining.map(label),
      nextActiveDistance:activeRemaining.length
        ?Math.min(...activeRemaining.map(cell=>
          Math.floor(cell/g.columns)-position.heights[c]+1
        ))
        :null,
    });
  }

  let bestKey=null,bestPermutation=null,best=null;
  for(const p of permutations(g.columns)){
    const residuals=q.residuals.map(family=>normalizeFamily(
      family.map(cells=>cells.map(cell=>mapCell(cell,p)))
    ));
    const activeSupport=Array(g.columns).fill(null),
      activeFlags=Array(g.columns).fill(false);
    for(const col of columns){
      if(col.neutral)continue;
      activeSupport[p[col.column]]=col.height;
      activeFlags[p[col.column]]=true;
    }
    const candidate={
      mover:position.mover,
      rank:position.rank,
      residuals,
      activeSupport,
      activeFlags,
      neutralCapacity,
    };
    const key=JSON.stringify(candidate);
    if(bestKey===null||key<bestKey){
      bestKey=key;
      bestPermutation=[...p];
      best=candidate;
    }
  }

  return {
    key:bestKey,
    canonical:best,
    permutation:bestPermutation,
    neutralCapacity,
    columns,
    residualCounts:q.residuals.map(x=>x.length),
  };
}

const states=[];
for(let sixthColumn=0;sixthColumn<g.columns;sixthColumn++){
  const sixthCell=root.heights[sixthColumn]*g.columns+sixthColumn,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell:sixthCell,actionOwner:1,attacker:0,
    }),
    [t1,t2,t3]=wing.anchoredLine.triggerCells;

  for(const stolen of [t2,t3]){
    const position=play(root,[sixthCell,t1,stolen]);
    if(!position||position.terminal)throw new Error('invalid theft');
    const n=neutralDescriptor(position),
      reflection=canonicalizeCpcxExactReflection(position);
    states.push({
      sixthMove:sixthColumn+1,
      theftClass:stolen===t2?'STEAL_TRIGGER_2':'STEAL_TRIGGER_3',
      stolenCell:label(stolen),
      rank:position.rank,
      support:Array.from(position.heights),
      reflectionKey:reflection.key,
      neutralKey:n.key,
      neutralCapacity:n.neutralCapacity,
      residualCounts:n.residualCounts,
      canonicalPermutation:n.permutation.map(x=>x+1),
      columns:n.columns.map(x=>({
        column:x.column+1,
        height:x.height,
        remaining:x.remaining,
        neutral:x.neutral,
        activeRemaining:x.activeLabels,
        nextActiveDistance:x.nextActiveDistance,
      })),
    });
  }
}

function group(field){
  const m=new Map();
  for(const row of states){
    const key=row[field];
    if(!m.has(key))m.set(key,[]);
    m.get(key).push(row);
  }
  return [...m.values()]
    .map(members=>members.map(x=>({
      sixthMove:x.sixthMove,
      theftClass:x.theftClass,
      stolenCell:x.stolenCell,
    })))
    .sort((a,b)=>a[0].sixthMove-b[0].sixthMove||
      a[0].theftClass.localeCompare(b[0].theftClass));
}

const reflection=group('reflectionKey'),
  neutral=group('neutralKey');

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.neutral-reservoir-discovery.v0_1',
  root:'44444',
  stateCount:states.length,
  reflection:{
    classCount:reflection.length,
    classes:reflection,
  },
  neutralReservoirCandidate:{
    classCount:neutral.length,
    classes:neutral,
    reductionVsReflection:reflection.length-neutral.length,
    anyMergeBeyondReflection:neutral.length<reflection.length,
  },
  states,
  premises:{
    standardBoard:'7x6',
    targetSpecificDiagnostic:true,
    ruleOnly:true,
    neutralDefinition:'a column is permanently neutral only when every remaining cell in its suffix is absent from both normalized residual antichains',
    preserved:[
      'mover',
      'rank',
      'exact residual antichains under one column transporter',
      'exact support height for every residual-active column',
      'total remaining neutral-event capacity',
    ],
    erased:[
      'individual support distribution among permanently neutral columns',
      'physical identity of neutral actions',
    ],
    theoremProvenance:[
      'BSFP_SUPPORT_LOCAL_RESIDUAL_BASIS.md sections 8-10',
      'STANDARD_7X6_Q_CONGRUENCE.md',
      'IsoGraph DTS/DP objective-scoped projection discipline',
    ],
    solvedData:false,
    oracle:false,
    minimax:false,
    recursiveGameTreeSearch:false,
  },
  boundary:'discovery only: a merge here is a theorem candidate, not certificate transport, until neutral-reservoir transition congruence is proved generically; failure to merge is not a game-value distinction',
},null,2));
