// Cold evidence writer; intentionally no published-outcome input.
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {phaseFeatures,boundaryCensus,opportunisticFollowup,interruptedDrawSchedule} from './parity-geometry.mjs';
const policies=[1,3,5].map(opportunisticFollowup);
for(const p of policies)assert.deepEqual(p.unknownKeys,policies[0].unknownKeys);
const commonUnknownKeys=policies[0].unknownKeys;
const commonUnknownSha256=createHash('sha256').update(JSON.stringify(commonUnknownKeys)).digest('hex');
const result={inputs:'geometry/rules/prefix only',
  prefixes:[1,2,3,4,5].map(n=>phaseFeatures(7,6,Array(n).fill(3))),
  boundary:boundaryCensus(),opportunistic:policies.map(({unknownKeys,...p})=>({...p,commonUnknownSha256})),
  commonUnknownKeys,commonUnknownSha256,
  interruptedDrawSchedules:[1,3,5].map(stack=>({stack,...interruptedDrawSchedule(stack)}))};
writeFileSync(new URL('PARITY_BOUNDARY_RESULTS.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({boundary:result.boundary.counts,opportunistic:result.opportunistic}));
