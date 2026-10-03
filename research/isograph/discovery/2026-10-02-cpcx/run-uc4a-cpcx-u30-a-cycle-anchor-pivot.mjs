import {createCpcxGeometry,cpcxCell,scanCpcxObligations} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {certifyCpcxProtectedResidualSupportAdvance} from './cpcx-support-advance.mjs';
import {certifyCpcxProtectedResidualSupportTransition} from './cpcx-support-transition.mjs';
import {certifyCpcxProtectedResidualForcedNormalization} from './cpcx-forced-normalization.mjs';
import {certifyCpcxProtectedResidualDiagonalTransfer} from './cpcx-diagonal-transfer.mjs';
import {buildCpcxMove6UnresolvedClassesArtifact} from './cpcx-move6-unresolved-classes.mjs';

const g=createCpcxGeometry(),artifact=buildCpcxMove6UnresolvedClassesArtifact(),
  cls=artifact.classes.find(x=>x.classId==='U30'),targetLine='A6-B5-C4-D3',
  A6=5*g.columns,B5=4*g.columns+1;
if(!cls)throw new Error('U30 missing');

function label(cell){const {column,row}=cpcxCell(g,cell);return `${String.fromCharCode(65+column)}${row+1}`;}
function positionFromClass(x){const [m,h,o]=x.key.split('|'),owner=new Int8Array(g.cellCount);for(let i=0;i<o.length;i++)owner[i]=Number(o[i])-1;return {geometry:g,moves:new Uint32Array(0),rank:x.rank,mover:Number(m),heights:new Uint32Array(h.split(',').map(Number)),owner,terminal:null};}
function frontier(p){const out=[];for(let c=0;c<g.columns;c++){const r=p.heights[c];if(r<g.rows)out.push(r*g.columns+c);}return out;}
function residual(p){return scanCpcxObligations(p).find(o=>o.player===0&&o.lineLabel===targetLine)??null;}
function debt(r){return r.events.reduce((n,e)=>n+e.supportDistance,0);}
function tuple(r){return [r.missingCount,debt(r)];}
function less(a,b){return a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);}

const source=positionFromClass(cls),R=residual(source),
  advance=certifyCpcxProtectedResidualSupportAdvance(source,{controllerResidual:R,targetCell:A6});
if(!advance.exact)throw new Error('A advance failed');

const rows=[];
for(const p1Cell of frontier(advance.child)){
  const r1=residual(advance.child),
    tr=certifyCpcxProtectedResidualSupportTransition(advance.child,{protectedResidual:r1,eventCell:p1Cell});
  if(!tr.exact||tr.kind!=='PROTECTED_RESIDUAL_SUPPORT_TRANSITION')continue;
  const q=applyCpcxForcedEvent(advance.child,p1Cell),qr=residual(q);
  if(!qr)continue;
  const next=certifyCpcxProtectedResidualSupportAdvance(q,{controllerResidual:qr,targetCell:A6});
  if(next.seam!=='SOURCE_IMMEDIATE_PRECEDENCE')continue;
  const norm=certifyCpcxProtectedResidualForcedNormalization(q,{protectedResidual:qr});
  if(!norm.exact||norm.kind!=='PROTECTED_RESIDUAL_FORCED_NORMALIZATION'||norm.finalPosition.mover!==1)continue;
  const p=norm.finalPosition,pr=residual(p);
  if(!pr||!frontier(p).includes(B5))continue;
  const same=certifyCpcxProtectedResidualDiagonalTransfer(p,{protectedResidual:pr,blockedCell:B5});
  if(same.exact)continue;
  const anchor=g.lines[pr.lineId].cells.find(cell=>!pr.missingCells.includes(cell)&&p.owner[cell]===0),
    child=applyCpcxForcedEvent(p,B5),src=tuple(pr),
    pivots=scanCpcxObligations(child).filter(o=>o.player===0&&(o.orientation==='D+'||o.orientation==='D-')&&g.lines[o.lineId].cells.includes(anchor)&&!g.lines[o.lineId].cells.includes(B5))
      .map(o=>({lineId:o.lineId,lineLabel:o.lineLabel,orientation:o.orientation,missing:o.missingCells.map(label),tuple:tuple(o),playable:o.currentlyPlayableCells.map(label)}))
      .filter(x=>less(x.tuple,src)).sort((a,b)=>a.tuple[0]-b.tuple[0]||a.tuple[1]-b.tuple[1]||a.lineId-b.lineId);
  rows.push({rootP1Event:label(p1Cell),rank:p.rank,sourceTuple:src,anchor:label(anchor),blockedCell:'B5',sameTrackSeam:same.seam,pivots});
}

console.log(JSON.stringify({schema:'connect4.uc4a.cpcx.u30-a-cycle-anchor-pivot.v0_1',rows,summary:{caseCount:rows.length,allHaveStrictPivot:rows.every(x=>x.pivots.length>0),pivotLines:[...new Set(rows.map(x=>x.pivots[0]?.lineLabel).filter(Boolean))],pivotTuples:[...new Map(rows.map(x=>x.pivots[0]?.tuple).filter(Array.isArray).map(x=>[x.join(','),x])).values()]},boundary:{diagnosticOnly:true,classIdLocatorOnly:true,anchorPivotNotPromoted:true,noValueConclusion:true,recursiveSearch:false,solvedData:false,oracle:false}},null,2));
