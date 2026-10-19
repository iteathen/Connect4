// Source-only guard regression for parameter classifier and independent
// published 52-cell K4 table comparison (oracle labels validation ONLY).
// Never derives a source outcome using published values.
import {classifySourceEmptyDimension} from './source-partial-empty-dimension-WDL-classifier.mjs';
export function checkPartialEmptyDimensionClassifier({publishedK4Cells}){
 const issues=[],matrix={total:0,exact:0,bounds:0,incomplete:0};
 for(let K=1;K<=8;K++)for(let H=1;H<=12;H++)for(let W=1;W<=12;W++){
  let x=classifySourceEmptyDimension({width:W,height:H,connect:K});
  matrix.total++;
  if(x.P0relativeWDL!==null){
   matrix.exact++;
   if(x.P0relativeValueLowerBound!==x.P0relativeWDL ||
      x.P0relativeValueUpperBound!==x.P0relativeWDL)
    issues.push({W,H,K,issue:'exact bound mismatch',x});
  }else if(x.P0relativeValueLowerBound===-1&&x.P0relativeValueUpperBound===0){
   matrix.bounds++;
   if(!((K>=3&&H<K&&(W*H)%2===0)||(K>=4&&H%2===0&&W>=K&&W<=2*K-2)))
    issues.push({W,H,K,issue:'unproved P0 nonwin bound',x});
  }else if(x.P0relativeValueLowerBound===0&&x.P0relativeValueUpperBound===1){
   matrix.bounds++;
   if(!(K>=3&&H<K&&(W*H)%2===1))
    issues.push({W,H,K,issue:'unproved P1 nonwin odd-area bound',x});
  }else if(x.status==='INCOMPLETE_DIMENSION_WDL')matrix.incomplete++;
  else issues.push({W,H,K,issue:'bad classification status',x});
 }
 const oracle={published:0,unknownPublishedCells:0,
  sourceExactAgainstPublished:0,sourceBoundAgainstPublished:0,
  sourceIncompleteAgainstPublished:0,sourceVsOracleMismatches:0};
 for(const cell of publishedK4Cells){
  if(cell.K!==4)throw Error('K4 published oracle expected');
  if(cell.outcome===null){oracle.unknownPublishedCells++;continue}
  oracle.published++;
  const x=classifySourceEmptyDimension({width:cell.width,height:cell.height,connect:4});
  if(x.P0relativeWDL!==null)oracle.sourceExactAgainstPublished++;
  else if(x.P0relativeValueUpperBound<1)oracle.sourceBoundAgainstPublished++;
  else oracle.sourceIncompleteAgainstPublished++;
  if(cell.outcome<x.P0relativeValueLowerBound||cell.outcome>x.P0relativeValueUpperBound||
     x.P0relativeWDL!==null&&cell.outcome!==x.P0relativeWDL){
   oracle.sourceVsOracleMismatches++;
   issues.push({cell,x,issue:'source exact or bound disagrees with independent published known outcome'});
  }
 }
 const examples=[[1,1,1],[1,30,2],[2,1,2],[3,1,2],[2,2,2],
  [2,12,3],[9,1,5],[5,4,5],[5,3,5],
  [6,4,4],[7,6,4],[8,5,4],[4,12,4]];
 return {status:issues.length?'REGRESSION_DISCREPANCY':'SOURCE_DIMENSION_GUARDS_AND_52_TABLE_PASS',
  matrix,oracle,examples:examples.map(([W,H,K])=>classifySourceEmptyDimension({width:W,height:H,connect:K})),
  issues:issues.slice(0,30),sourceStrategicFutureGameValuesEvaluated:0};
}
