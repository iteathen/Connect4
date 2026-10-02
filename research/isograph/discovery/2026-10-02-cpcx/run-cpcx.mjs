import {
  createCpcxGeometry,
  buildCpcxPosition,
  scanCpcxObligations,
  buildCpcxEventEffects,
  summarizeCpcx,
} from './cpcx.mjs';

const sequence=process.env.SEQUENCE??'44444';
const g=createCpcxGeometry();
const position=buildCpcxPosition(sequence,{geometry:g});
const obligations=scanCpcxObligations(position);
const effects=buildCpcxEventEffects(position,obligations);

const focus=[
  'D1-E1-F1-G1',
  'D3-E3-F3-G3',
  'D5-E4-F3-G2',
  'D6-E5-F4-G3',
];

const rows=obligations
  .filter(o=>o.player===0&&focus.includes(o.lineLabel))
  .map(o=>({
    id:o.id,
    line:o.lineLabel,
    orientation:o.orientation,
    missingCount:o.missingCount,
    missing:o.events.map(e=>({
      cell:e.cell,
      column:e.column+1,
      row:e.row+1,
      supportDistance:e.supportDistance,
      eventRank:e.eventRank,
      zeroReservationOwner:e.zeroReservationOwner,
      supportCells:e.supportCells,
    })),
    supportShape:o.supportShape,
    status:o.status,
  }));

console.log(JSON.stringify({
  schema:'connect4.cpcx.prototype-run.v0_1',
  sequence,
  summary:summarizeCpcx(position),
  focusRows:rows,
  eventEffects:{
    count:effects.length,
    sample:effects.filter(e=>['E1','F1','G1','E3','F3','G3'].includes(e.cellLabel)),
  },
  boundary:[
    'No recursive game traversal is performed.',
    'No W/D/L value is claimed by CPCX v0.1.',
    'Zero-reservation ownership is projection metadata until resource/deadline guards certify it.',
    'Owner-labelled event effects are exact positive residual cofactors, not proof that the event will occur.',
  ],
},null,2));
