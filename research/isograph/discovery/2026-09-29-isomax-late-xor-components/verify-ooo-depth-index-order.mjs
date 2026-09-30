import fs from 'node:fs';import assert from 'node:assert/strict';import {DEPTH_INDEX_MODES,depthIndexLabel} from './ooo-pooled-depth-index-lib.mjs';
const base=new URL('.',import.meta.url),raw=JSON.parse(fs.readFileSync(new URL('OOO_POOLED_DEPTH_INDEX_0_1.json',base)));
const domain=Array.from({length:27},(_,i)=>i);
// Beyond depth 2 all non-EXACT modes are periodic with period dividing 12.
// Two full tail periods detect every collision and its shifted partner.
const noFiner=(a,b)=>b==='EXACT'?true:a==='EXACT'?false:domain.every(x=>domain.every(y=>depthIndexLabel(x,b)!==depthIndexLabel(y,b)||depthIndexLabel(x,a)===depthIndexLabel(y,a)));
assert.equal(noFiner('ZERO_VS_POSITIVE','ZERO_ODD_POSITIVE_EVEN'),true);assert.equal(noFiner('ZERO_ODD_POSITIVE_EVEN','MOD4'),false);
const order=DEPTH_INDEX_MODES.map(coarse=>({coarse,noFinerThan:DEPTH_INDEX_MODES.filter(fine=>noFiner(coarse,fine))}));
const minima=['SIGN','SIGNED_PARITY'].map(encoding=>{const passing=DEPTH_INDEX_MODES.filter(d=>raw.audits.find(a=>a.mode===encoding+'|'+d).pooled.exactScalarFactorization);return {encoding,passing,minimal:passing.filter(d=>!passing.some(e=>e!==d&&noFiner(e,d)&&!noFiner(d,e)))};});
const out={schema:'connect4.isomax.depth_index_order.v1',warrant:'EW-RS-085',status:'PASS',domain:'all nonnegative integer depth indices',proof:'Below 3 inspect exact indices. From 3 onward every non-EXACT map repeats with period dividing12; two tail periods plus the prefix exhaust all equality-pattern refinements. EXACT is handled analytically.',order,minima,guard:'Index-partition order only; no global minimality over arbitrary triangle or scalar carriers follows.'};fs.writeFileSync(new URL('OOO_POOLED_DEPTH_INDEX_ORDER_0_1.json',base),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(minima,null,2));
