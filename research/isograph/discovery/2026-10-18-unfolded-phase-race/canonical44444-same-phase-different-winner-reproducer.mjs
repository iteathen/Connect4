// Two fully gravity-legal hypothetical future words after ORIGINAL prefix 44444.
// Post-first-win events are counterfactual; do not interpret as perfect play.
// Uses independent original-grid physical first-win checker frozen separately.
import assert from 'node:assert/strict';
import {physicalPhaseRaceCheck} from './original7x6-physical-phase-race-falsifier.mjs';
const prefix='44444';
const a='2121525536737532617137561336654727261'.split('').map(Number);
const b='2121525536737532317167561336654727261'.split('').map(Number);
function phase(w) {
 const h=[0,0,0,5,0,0,0],owner=Array(42).fill(null);
 for(let k=0;k<w.length;k++){
  const c=w[k]-1,r=h[c]++;assert(r<6);
  owner[7*r+c]=(prefix.length+k)%2;
 }
 return owner;
}
assert.deepEqual(phase(a),phase(b),'ALL ORIGINAL FUTURE CELL OWNERS must be identical');
const x=physicalPhaseRaceCheck({prefix,suffix:a});
const y=physicalPhaseRaceCheck({prefix,suffix:b});
assert(x.success&&y.success);
assert.deepEqual(x.RCounts,[48,42]);assert.deepEqual(y.RCounts,[48,42]);
assert.equal(x.D,1450);assert.equal(y.D,1450);
assert.deepEqual(x.phaseFinalCompletions,[1,1]);
assert.deepEqual(y.phaseFinalCompletions,[1,1]);
assert.deepEqual(x.earliestRanks,[20,17]);
assert.deepEqual(y.earliestRanks,[20,21]);
assert.equal(x.physical,-1);assert.equal(y.physical,+1);
assert.equal(x.firstWinningAbsoluteTurn,22);
assert.equal(y.firstWinningAbsoluteTurn,25);
console.log(JSON.stringify({status:'PHYSICAL_WITNESS_PASS',prefix,
 completeHypotheticalA:a.join(''),completeHypotheticalB:b.join(''),
 originalFutureCellOwnershipSame:true,
 originalCrossPlayerDisjointRequirements:x.D,
 firstWinnerP0Relative:[x.physical,y.physical],
 firstAbsoluteWinTurns:[x.firstWinningAbsoluteTurn,y.firstWinningAbsoluteTurn],
 relativeEarliestWinRanks:[x.earliestRanks,y.earliestRanks],
 rootPerfectWDL:'UNKNOWN',rootBestLiteralColumn:'INCOMPLETE'}));
