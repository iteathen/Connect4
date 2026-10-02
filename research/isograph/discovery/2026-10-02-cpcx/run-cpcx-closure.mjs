import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
  summarizeCpcx,
} from './cpcx.mjs';
import {
  classifyCpcxImmediate,
  findCpcxSynchronizedProjectionLadders,
  findCpcxDisjointSynchronizedFamilies,
  buildCpcxBoundaryOperators,
  immediateCpcxCapacityCertificate,
} from './cpcx-closure.mjs';

const g=createCpcxGeometry();
const position=buildCpcxPosition(process.env.SEQUENCE??'44444',{geometry:g});
const obligations=scanCpcxObligations(position);
const synchronized=findCpcxSynchronizedProjectionLadders(obligations);
const disjoint=findCpcxDisjointSynchronizedFamilies(obligations,{minLevels:3});

const forcedFixture=buildCpcxPosition('111111223',{geometry:g});
const overloadFixture=buildCpcxPosition('111131415',{geometry:g});

console.log(JSON.stringify({
  schema:'connect4.cpcx.closure-report.v0_2',
  sequence:Array.from(position.moves,x=>x+1).join(''),
  summary:summarizeCpcx(position),
  immediate:classifyCpcxImmediate(position,obligations),
  boundaryOperators:buildCpcxBoundaryOperators(position),
  synchronizedProjectionLadders:synchronized.map(x=>({
    obligationId:x.obligationId,
    player:x.player,
    line:x.lineLabel,
    orientation:x.orientation,
    missingCount:x.missingCount,
    eventRank:x.eventRank,
    supportDistance:x.supportDistance,
    contractionLevels:x.contractionLevels,
    exact:x.exact,
  })),
  disjointFamilyCertificates:disjoint.map(x=>({
    player:x.player,
    orientation:x.orientation,
    missingCount:x.missingCount,
    familyA:{columns:x.familyA.columns,levels:x.familyA.levels},
    familyB:{columns:x.familyB.columns,levels:x.familyB.levels},
    exactSurvival:x.exactSurvival,
    exactForcing:x.exactForcing,
    boundary:x.boundary,
  })),
  exactControls:{
    forcedSingleton:classifyCpcxImmediate(forcedFixture),
    overload:immediateCpcxCapacityCertificate(overloadFixture),
  },
  proofBoundary:[
    'Exact current-ply singleton and response-capacity results are authoritative within their stated guards.',
    'Disjoint-family survival is exact set-theoretic structure.',
    'Synchronized projected ownership is advisory until CPCX certifies intervention, resource and deadline guards.',
    'No W/D/L claim is emitted by CPCX v0.2.',
    'No recursive legal-move tree is traversed.',
  ],
},null,2));
